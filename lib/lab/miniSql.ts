// A tiny SQL WHERE-clause engine for the injection exhibit. It understands just enough
// (strings, numbers, columns, = != <>, AND/OR/NOT, parentheses, -- and # comments) for
// classic injection payloads to behave the way they do against a real database.

export type Row = Record<string, string | number>;

type Tok =
  | { t: "str"; v: string }
  | { t: "num"; v: number }
  | { t: "id"; v: string }
  | { t: "op"; v: string }
  | { t: "kw"; v: "AND" | "OR" | "NOT" }
  | { t: "(" }
  | { t: ")" };

export class SqlError extends Error {}

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === "-" && src[i + 1] === "-") break; // comment: ignore the rest
    if (c === "#") break;
    if (c === ";") break; // statement ends; anything after is a second statement we don't run
    if (c === "'") {
      let v = "";
      i++;
      for (;;) {
        if (i >= src.length) throw new SqlError("unterminated quoted string");
        if (src[i] === "'" && src[i + 1] === "'") { v += "'"; i += 2; continue; }
        if (src[i] === "'") { i++; break; }
        v += src[i++];
      }
      out.push({ t: "str", v });
      continue;
    }
    if (/\d/.test(c)) {
      let v = "";
      while (i < src.length && /\d/.test(src[i])) v += src[i++];
      out.push({ t: "num", v: Number(v) });
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let v = "";
      while (i < src.length && /\w/.test(src[i])) v += src[i++];
      const up = v.toUpperCase();
      if (up === "AND" || up === "OR" || up === "NOT") out.push({ t: "kw", v: up });
      else out.push({ t: "id", v: v.toLowerCase() });
      continue;
    }
    if (c === "(" || c === ")") { out.push({ t: c }); i++; continue; }
    const two = src.slice(i, i + 2);
    if (two === "!=" || two === "<>") { out.push({ t: "op", v: "!=" }); i += 2; continue; }
    if (c === "=") { out.push({ t: "op", v: "=" }); i++; continue; }
    throw new SqlError(`syntax error near "${src.slice(i, i + 12)}"`);
  }
  return out;
}

type Node =
  | { k: "lit"; v: string | number }
  | { k: "col"; v: string }
  | { k: "cmp"; op: string; a: Node; b: Node }
  | { k: "and" | "or"; a: Node; b: Node }
  | { k: "not"; a: Node };

function parse(toks: Tok[]): Node | null {
  let p = 0;
  const peek = () => toks[p];
  const operand = (): Node => {
    const t = toks[p++];
    if (!t) throw new SqlError("unexpected end of input");
    if (t.t === "str" || t.t === "num") return { k: "lit", v: t.v };
    if (t.t === "id") return { k: "col", v: t.v };
    if (t.t === "(") {
      const e = orExpr();
      if (toks[p++]?.t !== ")") throw new SqlError("missing )");
      return e;
    }
    throw new SqlError("syntax error");
  };
  const primary = (): Node => {
    const a = operand();
    const t = peek();
    if (t?.t === "op") {
      p++;
      return { k: "cmp", op: t.v, a, b: operand() };
    }
    return a;
  };
  const notExpr = (): Node => {
    const t = peek();
    if (t?.t === "kw" && t.v === "NOT") { p++; return { k: "not", a: notExpr() }; }
    return primary();
  };
  const andExpr = (): Node => {
    let a = notExpr();
    while (peek()?.t === "kw" && (peek() as { v: string }).v === "AND") { p++; a = { k: "and", a, b: notExpr() }; }
    return a;
  };
  const orExpr = (): Node => {
    let a = andExpr();
    while (peek()?.t === "kw" && (peek() as { v: string }).v === "OR") { p++; a = { k: "or", a, b: andExpr() }; }
    return a;
  };
  if (!toks.length) return null;
  const e = orExpr();
  if (p < toks.length) throw new SqlError("syntax error near the end of the query");
  return e;
}

function evalNode(n: Node, row: Row): string | number | boolean {
  switch (n.k) {
    case "lit": return n.v;
    case "col":
      if (!(n.v in row)) throw new SqlError(`no such column: ${n.v}`);
      return row[n.v];
    case "cmp": {
      const a = evalNode(n.a, row), b = evalNode(n.b, row);
      const eq = String(a) === String(b);
      return n.op === "=" ? eq : !eq;
    }
    case "and": return truthy(evalNode(n.a, row)) && truthy(evalNode(n.b, row));
    case "or": return truthy(evalNode(n.a, row)) || truthy(evalNode(n.b, row));
    case "not": return !truthy(evalNode(n.a, row));
  }
}
const truthy = (v: string | number | boolean) => (typeof v === "string" ? v !== "" && v !== "0" : Boolean(v));

/** Runs "SELECT * FROM table WHERE <where>" against `rows`. Throws SqlError like a real DB would. */
export function selectWhere(rows: Row[], where: string): Row[] {
  const ast = parse(tokenize(where));
  return ast ? rows.filter((r) => truthy(evalNode(ast, r))) : rows;
}
