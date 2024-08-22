import { Func } from '../func'

export type BasicUpdater<A> = (_: A) => A

export type Updater<A> = BasicUpdater<A> & UpdaterExtensions<A>

export type UpdaterExtensions<A> = {
  func: Func<A, A>
  then: (other: BasicUpdater<A>) => Updater<A>
  thenMany: (others: BasicUpdater<A>[]) => Updater<A>
}

export const Updater = <A>(updater: BasicUpdater<A>): Updater<A> =>
  Object.assign(updater, {
    func: Func(updater),
    then: function (this: Updater<A>, other) {
      return Updater<A>((a) => other(this(a)))
    },
    thenMany: function (this: Updater<A>, others) {
      return Updater<A>(others.map((updater) => Updater(updater)).reduce((f, g) => f.then(g), this))
    },
  } satisfies UpdaterExtensions<A>)

export const replaceWith = <A>(a: A) => Updater<A>((_) => a)
