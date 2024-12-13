import { Map, Set } from 'immutable';

export type InjectablePrimitive<T> = {
    defaultValue: T[keyof T];
    fieldView: any;
}
  
export type InjectedPrimitive<T> = {
    renderers: Set<keyof T>;
    defaultValue: any;
    fieldView: any;
}

export type Injectables<T> = Map<keyof T, InjectablePrimitive<T>>;

export type InjectedPrimitives<T> =
{
  injectedPrimitives: Map<keyof T, InjectedPrimitive<T>>;
  renderers: {
    [key in keyof T]: Set<string>;
  }
}
  
export const injectablesFromFieldViews = <T>(fieldViews: any, injectables: Injectables<T>): InjectedPrimitives<T> => {
  let result = {injectedPrimitives: Map<string, InjectedPrimitive<T>>(), renderers: {}} as InjectedPrimitives<T>;
  result.injectedPrimitives = injectables.map(((injectable, key) =>
    ({ renderers: Set([key]), defaultValue: injectable.defaultValue, fieldView: injectable.fieldView })
  ))
  result.renderers = { ...injectables.map((_, key) => ({[key]: Set<string>()})).valueSeq().toArray().reduce((acc, x) => ({...acc, ...x}), {}) } as InjectedPrimitives<T>['renderers'] 
  Object.keys(result.renderers).forEach((_categoryName) => {
    const categoryName = _categoryName
    if (categoryName in fieldViews) {
      Object.keys(fieldViews[categoryName]).forEach(viewName => {
        result.renderers[categoryName as keyof T] = result.renderers[categoryName as keyof T].add(viewName)
      })
    }
  })
  return result
}