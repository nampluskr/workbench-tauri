// Context predicates for key bindings (02-INTERACTION I-002, I-702).
// Grammar: expr := or ; or := and ("||" and)* ; and := unary ("&&" unary)* ;
// unary := "!" unary | primary ; primary := "(" expr ")" | IDENT (">" IDENT)*
// `A > B` matches when the context at the evaluated depth is B and some
// context above it is A.

export type Predicate =
  | { kind: "ident"; name: string }
  | { kind: "not"; inner: Predicate }
  | { kind: "and"; left: Predicate; right: Predicate }
  | { kind: "or"; left: Predicate; right: Predicate }
  | { kind: "child"; parent: Predicate; child: Predicate };

export function parsePredicate(src: string): Predicate {
  const tokens = src.match(/\(|\)|&&|\|\||!|>|[A-Za-z_][A-Za-z0-9_]*/g) ?? [];
  let i = 0;
  const peek = () => tokens[i];
  const take = (t?: string) => {
    const v = tokens[i++];
    if (t !== undefined && v !== t) throw new Error(`expected ${t} in "${src}"`);
    return v;
  };
  function or(): Predicate {
    let left = and();
    while (peek() === "||") {
      take();
      left = { kind: "or", left, right: and() };
    }
    return left;
  }
  function and(): Predicate {
    let left = child();
    while (peek() === "&&") {
      take();
      left = { kind: "and", left, right: child() };
    }
    return left;
  }
  function child(): Predicate {
    let left = unary();
    while (peek() === ">") {
      take();
      left = { kind: "child", parent: left, child: unary() };
    }
    return left;
  }
  function unary(): Predicate {
    if (peek() === "!") {
      take();
      return { kind: "not", inner: unary() };
    }
    if (peek() === "(") {
      take("(");
      const e = or();
      take(")");
      return e;
    }
    const name = take();
    if (!name || !/^[A-Za-z_]/.test(name)) throw new Error(`bad predicate "${src}"`);
    return { kind: "ident", name };
  }
  const p = or();
  if (i !== tokens.length) throw new Error(`trailing tokens in "${src}"`);
  return p;
}

/** One entry of the focus context path: a name plus extra flags (e.g. "not_editing"). */
export interface ContextEntry {
  name: string;
  flags?: string[];
}

function has(entry: ContextEntry, name: string): boolean {
  return entry.name === name || (entry.flags ?? []).includes(name);
}

/** Evaluate `p` against the context path ending at index `at` (0 = outermost). */
export function matchesAt(p: Predicate, path: ContextEntry[], at: number): boolean {
  switch (p.kind) {
    case "ident":
      return has(path[at], p.name);
    case "not":
      return !matchesAt(p.inner, path, at);
    case "and":
      return matchesAt(p.left, path, at) && matchesAt(p.right, path, at);
    case "or":
      return matchesAt(p.left, path, at) || matchesAt(p.right, path, at);
    case "child":
      if (!matchesAt(p.child, path, at)) return false;
      for (let j = at - 1; j >= 0; j--) if (matchesAt(p.parent, path, j)) return true;
      return false;
  }
}
