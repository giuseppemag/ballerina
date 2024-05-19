export const uncurry =
  <A, B, C>(f: (a: A) => (b: B) => C) =>
  (a: A, b: B): C =>
    f(a)(b);
  