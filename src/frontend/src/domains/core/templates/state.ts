import React from 'react'

type TemplateRunner<context, state, foreignMutations> =
  (props:{ context:context, state:state, setState:BasicFun<BasicUpdater<state>, void> foreignMutations:foreignMutations }) => JSX.Element

export type Template<context, state, foreignMutations> = 
  {
    run:TemplateRunner<context, state, foreignMutations>
  }