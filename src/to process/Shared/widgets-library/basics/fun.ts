export type BasicFun<a, b> = (_: a) => b;

export type Fun<a, b> = {
  (_: a): b;
  then: <c>(next: Fun<b, c>) => Fun<a, c>;
};

export const Fun = <a, b>(_: BasicFun<a, b>): Fun<a, b> => {
  const f = _ as Fun<a, b>;
  f.then = function <c>(this: Fun<a, b>, next: Fun<b, c>) {
    return Fun(then(this, next));
  };
  return f;
};

export type BasicUpdater<t> = BasicFun<t, t>;

export type Updater<t> = {
  (_: t): t;
  then: (next: Updater<t>) => Updater<t>;
};

export const Updater = <t>(_: BasicFun<t, t>): Updater<t> => {
  const f = _ as Updater<t>;
  f.then = function (this: Updater<t>, next: Updater<t>) {
    return Updater(then(this, next));
  };
  return f;
};

export type Unit = {};
export const unit: Unit = {};

export const id = <a>(_: a) => _;

export const then =
  <a, b, c>(f: BasicFun<a, b>, g: BasicFun<b, c>): BasicFun<a, c> =>
  (x: a) =>
    g(f(x));

export const thenMany = <s>(updaters: Array<Updater<s>>): Updater<s> =>
  Updater(updaters.reduce((f, g) => f.then(g), Updater(id)));

export type Widening<Entity, Field extends keyof Entity> = BasicFun<
  BasicUpdater<Entity[Field]>,
  Updater<Entity>
>;
export type SimpleUpdater<Entity, Field extends keyof Entity> = {
  [f in Field]: Widening<Entity, Field>;
};
export const simpleUpdater =
  <Entity>(
    postProcess?: Updater<Entity>,
    debug?: "entity" | "field" | "both",
    updaterName?: string
  ) =>
  <Field extends keyof Entity>(field: Field): SimpleUpdater<Entity, Field> =>
    ({
      [field]: (fieldUpdater: BasicUpdater<Entity[Field]>): Updater<Entity> => {
        const result = Updater<Entity>((currentEntity) => {
          const newFieldValue = fieldUpdater(currentEntity[field]);
          if (debug == "field" || debug == "both") {
            console.log(
              `${updaterName}: ${JSON.stringify(
                currentEntity[field]
              )} -> ${JSON.stringify(newFieldValue)}`
            );
          }
          const newEntity = { ...currentEntity, [field]: newFieldValue };
          if (debug == "entity" || debug == "both") {
            console.log(
              `${updaterName}: ${JSON.stringify(
                currentEntity
              )} -> ${JSON.stringify(newEntity)}`
            );
          }
          return newEntity;
        });
        return postProcess != undefined ? result.then(postProcess) : result;
      },
    }) as SimpleUpdater<Entity, Field>;

export const replaceWith = <V>(v: V) => Updater((_: V) => v);
