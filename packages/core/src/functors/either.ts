import { List } from 'immutable'

type Left<L> = { tag: 'left'; value: L }
type Right<R> = { tag: 'right'; value: R }
type Either<L, R> = Left<L> | Right<R>

const left = <L>(value: L): Left<L> => ({ tag: 'left', value })
const right = <R>(value: R): Right<R> => ({ tag: 'right', value })

const isLeft = <L, R>(e: Either<L, R>): e is Left<L> => e.tag === 'left'
const isRight = <L, R>(e: Either<L, R>): e is Right<R> => e.tag === 'right'

const fold = <L, R, T>(either: Either<L, R>, onLeft: (left: L) => T, onRight: (right: R) => T): T => {
  return isLeft(either) ? onLeft(either.value) : onRight(either.value)
}

const fmapEither =
  <L, A, B>(f: (a: A) => B) =>
  (e: Either<L, A>): Either<L, B> => {
    return isRight(e) ? right(f(e.value)) : e
  }

const bimapEither = <L, R, M, N>(e: Either<L, R>, f: (l: L) => M, g: (r: R) => N): Either<M, N> => {
  return isLeft(e) ? left(f(e.value)) : right(g(e.value))
}

const extract = <L, R>(e: Either<L, R>): L | R => e.value
const lefts = <A, B>(es: List<Either<A, B>>): List<A> => es.filter(isLeft).map(extract)
const rights = <A, B>(es: List<Either<A, B>>): List<B> => es.filter(isRight).map(extract)

const Either = { left, right, fold, fmap: fmapEither, bimap: bimapEither, isLeft, isRight, extract, lefts, rights }

export { Either }
export type { Left, Right }
