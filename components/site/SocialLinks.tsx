import { Github, Instagram, Linkedin, Code2, Twitter } from "lucide-react";
import type { SocialLinks as Socials } from "@/lib/types";

const ITEMS: { key: keyof Socials; label: string; Icon: typeof Github }[] = [
  { key: "github", label: "GitHub", Icon: Github },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "x", label: "X (Twitter)", Icon: Twitter },
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "leetcode", label: "LeetCode", Icon: Code2 },
];

/** Renders only the social links that have a URL set in admin settings. */
export default function SocialLinks({ socials, size = 20 }: { socials: Socials; size?: number }) {
  return (
    <ul className="flex flex-wrap items-center gap-2">
      {ITEMS.filter((i) => socials[i.key]).map(({ key, label, Icon }) => (
        <li key={key}>
          <a
            href={socials[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className="grid size-11 place-items-center rounded-lg border border-line bg-surface text-text transition hover:border-accent hover:text-accent"
          >
            <Icon size={size} aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}
