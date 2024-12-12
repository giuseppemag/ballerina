import { Map, Set } from 'immutable';

export type InjectablePrimitive = {
    defaultValue: any;
}
  
export type InjectedPrimitive = {
    renderers: Set<string>; /// can be more precise?
    defaultValue: any;
}
  // export type Injectables<K> = {
  //   injectedPrimitives: Map<keyof K, InjectablePrimitive>;
  // }
  
  // export type InjectedPrimitives<K> =
  // {
  //   injectedPrimitives: Map<keyof K, InjectablePrimitive>;
  //   renderers: {
  //     [Injectable in keyof K]: Set<string>;
  //   }
  // }
  
  export type Injectables = Map<string, InjectablePrimitive>;
  
  export type InjectedPrimitives =
  {
    injectedPrimitives: Map<string, InjectedPrimitive>;
    renderers: {
      [key: string]: Set<string>;
    }
  }
  
  
  export const injectablesFromFieldViews = (fieldViews: any, injectables: Injectables): InjectedPrimitives => {
    let result: InjectedPrimitives = {injectedPrimitives: Map<string, InjectablePrimitive>(), renderers: {}} as InjectedPrimitives;
    result.injectedPrimitives = injectables.map(((injectable, key) => 
      ({ renderers: Set(key), defaultValue: injectable.defaultValue })
    ))
    // Object.keys(injectables).forEach((key) => {
    //   result.injectedPrimitives.set(key, { defaultValue: injectables.get(key)!.defaultValue, renderers: Set([key]) })
  
    // })
    result.renderers = { ...injectables.map((_, key) => ({[key]: Set<string>()})).valueSeq().toArray().reduce((acc, x) => ({...acc, ...x}), {}) }
    Object.keys(result.renderers).forEach((_categoryName) => {
      const categoryName = _categoryName
      if (categoryName in fieldViews) {
        Object.keys(fieldViews[categoryName]).forEach(viewName => {
          result.renderers[categoryName] = result.renderers[categoryName].add(viewName)
        })
      }
    })
  
    return result
  }