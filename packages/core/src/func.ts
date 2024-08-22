export type BasicFunc<A, B> = (_: A) => B

export type Func<A, B> = BasicFunc<A, B> & FuncExtensions<A, B>

export type FuncExtensions<A, B> = { then: <C>(other: BasicFunc<B, C>) => Func<A, C> }

export const Func = <A, B>(f: BasicFunc<A, B>): Func<A, B> =>
  Object.assign(f, {
    then: function <C>(this: Func<A, B>, other: BasicFunc<B, C>): Func<A, C> {
      return Func((a) => other(this(a)))
    },
  } satisfies FuncExtensions<A, B>)
