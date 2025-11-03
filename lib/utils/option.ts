export type None = null | undefined;
export type Option<A> = A | None;

export function isSome<A>(thing: Option<A>): thing is A {
  return thing !== null && thing !== undefined;
}

export function isNone<A>(thing: Option<A>): thing is None {
  return !isSome(thing);
}
