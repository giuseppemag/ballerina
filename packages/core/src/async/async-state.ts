import { Func } from '../func'

export type AsyncState<A> = UnloadedAsyncState<A> | LoadingAsyncState<A> | LoadedAsyncState<A> | FailedAsyncState<A>

export type UnloadedAsyncState<A> = { kind: 'unloaded' }
export type LoadingAsyncState<A> = { kind: 'loading'; failedLoadingAttempts: number }
export type LoadedAsyncState<A> = { kind: 'loaded'; value: A }
export type FailedAsyncState<A> = { kind: 'failed'; error?: unknown }

// data constructors
export const unloaded = <A>(): UnloadedAsyncState<A> => ({ kind: 'unloaded' })
export const loading = <A>(): LoadingAsyncState<A> => ({ kind: 'loading', failedLoadingAttempts: 0 })
export const loaded = <A>(value: A): LoadedAsyncState<A> => ({ kind: 'loaded', value })
export const failed = <A, E>(error?: E): FailedAsyncState<A> => ({ kind: 'failed', error })

// updaters
export const toUnloaded = <A>(): Func<AsyncState<A>, UnloadedAsyncState<A>> => Func(() => AsyncState.unloaded())
export const toLoading = <A>(): Func<AsyncState<A>, LoadingAsyncState<A>> => Func(() => AsyncState.loading())
export const toLoaded = <A>(value: A): Func<AsyncState<A>, LoadedAsyncState<A>> => Func(() => AsyncState.loaded(value))
export const toFailed = <A, E>(error: E): Func<AsyncState<A>, FailedAsyncState<A>> =>
  Func(() => AsyncState.failed(error))

// assertions
export const isUnloaded = <A>(a: AsyncState<A>): a is UnloadedAsyncState<A> => a.kind === 'unloaded'
export const isLoading = <A>(a: AsyncState<A>): a is LoadingAsyncState<A> => a.kind === 'loading'
export const isLoaded = <A>(a: AsyncState<A>): a is LoadedAsyncState<A> => a.kind === 'loaded'
export const isFailed = <A>(a: AsyncState<A>): a is FailedAsyncState<A> => a.kind === 'failed'

// operations
export const mapAsyncState = <A, B>(a: AsyncState<A>, f: (_: A) => B) => (isLoaded(a) ? loaded(f(a.value)) : a)

export const mapAsyncStateCurried =
  <A, B>(f: (_: A) => B) =>
  (a: AsyncState<A>) =>
    isLoaded(a) ? loaded(f(a.value)) : a

export const AsyncState = {
  unloaded,
  loading,
  loaded,
  failed,
  toUnloaded,
  toLoading,
  toLoaded,
  toFailed,
  isUnloaded,
  isLoading,
  isLoaded,
  isFailed,
  map: mapAsyncState,
  mapCurried: mapAsyncStateCurried,
}

// utility
export type InferAsyncStateValue<T> = T extends AsyncState<infer Value> ? Value : never
