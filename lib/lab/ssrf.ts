import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * Guards for fetching a URL a visitor typed in (the headers exhibit).
 * Only public http(s) hosts on the default ports are allowed, and every address the
 * name resolves to must be public, so the server can't be pointed at itself, the
 * cloud metadata service or anything on a private network.
 */

const v4ToInt = (ip: string) => ip.split(".").reduce((n, o) => (n << 8) + Number(o), 0) >>> 0;
const inV4 = (ip: string, cidr: string) => {
  const [base, bits] = cidr.split("/");
  const mask = Number(bits) === 0 ? 0 : (~0 << (32 - Number(bits))) >>> 0;
  return (v4ToInt(ip) & mask) === (v4ToInt(base) & mask);
};

const BLOCKED_V4 = [
  "0.0.0.0/8", "10.0.0.0/8", "100.64.0.0/10", "127.0.0.0/8", "169.254.0.0/16", "172.16.0.0/12",
  "192.0.0.0/24", "192.0.2.0/24", "192.88.99.0/24", "192.168.0.0/16", "198.18.0.0/15",
  "198.51.100.0/24", "203.0.113.0/24", "224.0.0.0/4", "240.0.0.0/4",
];

function expandV6(ip: string): number[] | null {
  let s = ip.toLowerCase().split("%")[0];
  // Embedded IPv4 tail (::ffff:1.2.3.4).
  const v4 = /(\d+\.\d+\.\d+\.\d+)$/.exec(s);
  if (v4) {
    const n = v4ToInt(v4[1]);
    s = s.slice(0, -v4[1].length) + ((n >>> 16) & 0xffff).toString(16) + ":" + (n & 0xffff).toString(16);
  }
  const [head, tail] = s.split("::");
  const h = head ? head.split(":") : [];
  const t = tail !== undefined ? (tail ? tail.split(":") : []) : [];
  const fill = tail !== undefined ? 8 - h.length - t.length : 0;
  const parts = [...h, ...Array(fill).fill("0"), ...t].map((x) => parseInt(x || "0", 16));
  return parts.length === 8 && parts.every((n) => n >= 0 && n <= 0xffff) ? parts : null;
}

export function isPublicIp(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) return !BLOCKED_V4.some((c) => inV4(ip, c));
  if (kind !== 6) return false;
  const p = expandV6(ip);
  if (!p) return false;
  if (p.every((x) => x === 0)) return false; // ::
  if (p.slice(0, 7).every((x) => x === 0) && p[7] === 1) return false; // ::1
  // IPv4-mapped / NAT64: judge the embedded IPv4 address.
  if ((p.slice(0, 5).every((x) => x === 0) && p[5] === 0xffff) || (p[0] === 0x64 && p[1] === 0xff9b)) {
    return isPublicIp(`${p[6] >> 8}.${p[6] & 255}.${p[7] >> 8}.${p[7] & 255}`);
  }
  if ((p[0] & 0xfe00) === 0xfc00) return false; // fc00::/7 unique local
  if ((p[0] & 0xffc0) === 0xfe80) return false; // fe80::/10 link local
  if ((p[0] & 0xff00) === 0xff00) return false; // ff00::/8 multicast
  if (p[0] === 0x2001 && p[1] === 0x0db8) return false; // documentation
  return true;
}

/** Throws a user-facing message if the URL isn't safe to fetch. */
export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("That doesn't look like a valid URL.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Only http and https URLs can be checked.");
  if (url.username || url.password) throw new Error("URLs with a username or password aren't allowed.");
  if (url.port && url.port !== "80" && url.port !== "443") throw new Error("Only the standard ports (80 and 443) can be checked.");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (!host.includes(".") && !isIP(host)) throw new Error("Enter a public domain name, like example.com.");
  if (/(^|\.)(localhost|local|internal|intranet|lan|home|corp)$/i.test(host)) throw new Error("Private and local addresses can't be checked.");

  const addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true, verbatim: true }).catch(() => []);
  if (!addrs.length) throw new Error("That domain doesn't resolve to an address.");
  if (!addrs.every((a) => isPublicIp(a.address))) throw new Error("Private and local addresses can't be checked.");
  return url;
}
