import React from 'react'
import { BasicFun } from '../fun/state'
import { BasicUpdater, Updater } from '../fun/domains/updater/state'

export type TemplateProps<context, state, foreignMutations> =
  { context:context, setState:BasicFun<BasicUpdater<state>, void>, foreignMutations:foreignMutations }

type TemplateRunner<context, state, foreignMutations> =
  (props:TemplateProps<context, state, foreignMutations>) => JSX.Element

export type Template<context, state, foreignMutations> = 
  {
    any:BasicFun<Array<Template<context, state, foreignMutations>>, Template<context, state, foreignMutations>>,
    mapView:(f:BasicUpdater<JSX.Element>) => Template<context, state, foreignMutations>,
    mapState:<newState>(f:BasicFun<BasicUpdater<state>,BasicUpdater<newState>>) => Template<context, newState, foreignMutations>,
    mapContext:<newContext>(f:BasicFun<newContext, context>) => Template<newContext, state, foreignMutations>,
    mapForeignMutations:<newForeignMutations>(f:BasicFun<newForeignMutations, foreignMutations>) => Template<context, state, newForeignMutations>,
  } & TemplateRunner<context, state, foreignMutations>

export const Template = {
  Default:<context, state, foreignMutations>(actual:TemplateRunner<context, state, foreignMutations>) : 
    Template<context, state, foreignMutations> => {
    const result = actual as Template<context, state, foreignMutations>
    result.mapView = function(this:Template<context, state, foreignMutations>, f:BasicUpdater<JSX.Element>) {
      return Template.Operations.MapView(this, f)
    }
    result.mapContext = function<newContext>(this:Template<context, state, foreignMutations>, f:BasicFun<newContext, context>) {
      return Template.Operations.MapContext(this, f)
    }
    result.mapState = function<newState>(this:Template<context, state, foreignMutations>, f:BasicFun<BasicUpdater<state>,BasicUpdater<newState>>) : Template<context, newState, foreignMutations> {
      return Template.Operations.MapState(this, f)
    },
    result.mapForeignMutations = function<newForeignMutations>(this:Template<context, state, foreignMutations>, f:BasicFun<newForeignMutations, foreignMutations>) : Template<context, state, newForeignMutations> {
      return Template.Operations.MapForeignMutations(this, f)
    }
    result.any = function(this:Template<context, state, foreignMutations>, others:Array<Template<context, state, foreignMutations>>) : Template<context, state, foreignMutations> {
      return Template.Operations.Any(this, others)
    }
    return result
  },
  Operations:{
    MapView:<context, state, foreignMutations>(p:Template<context, state, foreignMutations>, f:BasicUpdater<JSX.Element>) : Template<context, state, foreignMutations> =>
      Template.Default(props => f(<>
          {
            p(props)
          }
        </>)
      ),
    MapState:<context, state, newState, foreignMutations>(p:Template<context, state, foreignMutations>, f:BasicFun<BasicUpdater<state>,BasicUpdater<newState>>) : Template<context, newState, foreignMutations> =>
      Template.Default(props => <>
          {
            p({
              context:props.context,
              setState:(_ => props.setState(f(_))),
              foreignMutations:props.foreignMutations
            })
          }
        </>
      ),
    MapContext:<context, newContext, state, foreignMutations>(p:Template<context, state, foreignMutations>, f:BasicFun<newContext, context>) : Template<newContext, state, foreignMutations> =>
      Template.Default(props => <>
          {
            p({
              context:f(props.context),
              setState:props.setState,
              foreignMutations:props.foreignMutations
            })
          }
        </>
      ),
    MapForeignMutations:<context, state, foreignMutations, newForeignMutations>(p:Template<context, state, foreignMutations>, f:BasicFun<newForeignMutations, foreignMutations>) : Template<context, state, newForeignMutations> =>
      Template.Default(props => <>
          {
            p({
              context:props.context,
              setState:props.setState,
              foreignMutations:f(props.foreignMutations)
            })
          }
        </>
      ),
    Any:<context, state, foreignMutations>(p:Template<context, state, foreignMutations>, others:Array<Template<context, state, foreignMutations>>) : Template<context, state, foreignMutations> =>
      Template.Default(props => {
        return <>
          {
            [
              p(props),
              ...others.map(_ => _(props))
            ]
          }
        </>
      })    
  }
}
