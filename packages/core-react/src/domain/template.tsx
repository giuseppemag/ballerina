import { BasicUpdater, unit, Unit } from '@tenet/core'

export type View<Context, State, ForeignMutations, EmbeddedChildren = Unit> = (
  props: TemplateProps<Context, State, ForeignMutations> & EmbeddedChildren
) => React.ReactNode

export type TemplateProps<Context, State, ForeignMutations> = {
  context: Context
  setState: (updater: BasicUpdater<State>) => void
  foreignMutations: ForeignMutations
}

export type Wrapper = (props: { children: React.ReactNode }) => React.ReactNode

export type TemplateWithViewProps<Context, State, ForeignMutations, View = Unit> = TemplateProps<
  Context,
  State,
  ForeignMutations
> & {
  view: View
  children?: React.ReactNode
}

export type TemplateRunner<Context, State, ForeignMutations, View = Unit> = (
  props: TemplateWithViewProps<Context, State, ForeignMutations, View>
) => React.ReactNode

export type TemplateExtensions<Context, State, ForeignMutations, View = Unit> = {
  any: (_: Template<Context, State, ForeignMutations>[]) => Template<Context, State, ForeignMutations, View>
}

export type Template<Context, State, ForeignMutations, View = Unit> = TemplateRunner<
  Context,
  State,
  ForeignMutations,
  View
> &
  TemplateExtensions<Context, State, ForeignMutations, View>

export const createTemplate = <Context, State, ForeignMutations, View>(
  templateRunner: TemplateRunner<Context, State, ForeignMutations, View>
): Template<Context, State, ForeignMutations, View> => {
  return Object.assign(templateRunner, {
    any: (otherTemplates) => {
      return createTemplate<Context, State, ForeignMutations, View>((props) => (
        <>{[templateRunner(props), ...otherTemplates.map((x) => x({ ...props, view: unit }))]}</>
      ))
    },
  } satisfies TemplateExtensions<Context, State, ForeignMutations, View>)
}

export const Template = {
  Default: <Context, State, ForeignMutations, View = Unit>(
    runner: TemplateRunner<Context & State, State, ForeignMutations, View>
  ): Template<Context & State, State, ForeignMutations, View> => createTemplate(runner),
}
