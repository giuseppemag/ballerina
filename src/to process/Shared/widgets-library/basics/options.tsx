export type Options = Partial<{
  /** Must be unique across the React application. React requires it. */
  key: string;
}>;
export const option = <t extends Options, k extends keyof t>(
  k: k,
  o?: t
): t[k] | undefined => (o ? o[k] : undefined);
