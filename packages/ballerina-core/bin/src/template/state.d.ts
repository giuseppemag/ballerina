import { BasicFun } from '../fun/state';
import { BasicUpdater } from '../fun/domains/updater/state';
import { Unit } from '@core';
export type View<context, state, foreignMutations, embeddedChildren = Unit> = (props: HeadlessTemplateProps<context, state, foreignMutations> & embeddedChildren) => JSX.Element;
export type HeadlessTemplateProps<context, state, foreignMutations> = {
    context: context;
    setState: BasicFun<BasicUpdater<state>, void>;
    foreignMutations: foreignMutations;
};
export type TemplateChildren = JSX.Element | JSX.Element[];
export type Wrapper = BasicFun<{
    children?: TemplateChildren;
}, JSX.Element>;
export type TemplateProps<context, state, foreignMutations, view = Unit> = {
    context: context;
    setState: BasicFun<BasicUpdater<state>, void>;
    foreignMutations: foreignMutations;
    view: view;
    children?: TemplateChildren;
};
type TemplateRunner<context, state, foreignMutations, view = Unit> = (props: TemplateProps<context, state, foreignMutations, view>) => JSX.Element;
export type Template<context, state, foreignMutations, view = Unit> = {
    any: BasicFun<Array<Template<context, state, foreignMutations>>, Template<context, state, foreignMutations, view>>;
    wrap: (Wrapper: Wrapper) => Template<context, state, foreignMutations, view>;
    withView: (view: view) => Template<context, state, foreignMutations, Unit>;
    mapState: <newState>(f: BasicFun<BasicUpdater<state>, BasicUpdater<newState>>) => Template<context, newState, foreignMutations, view>;
    mapStateFromProps: <newState>(f: BasicFun<[TemplateProps<context, newState, foreignMutations, view>, BasicUpdater<state>], BasicUpdater<newState>>) => Template<context, newState, foreignMutations, view>;
    mapContext: <newContext>(f: BasicFun<newContext, context | undefined>) => Template<newContext, state, foreignMutations, view>;
    mapForeignMutations: <newForeignMutations>(f: BasicFun<newForeignMutations, foreignMutations>) => Template<context, state, newForeignMutations, view>;
    mapContextFromProps: <newContext>(f: BasicFun<TemplateProps<newContext, state, foreignMutations, view>, context | undefined>) => Template<newContext, state, foreignMutations, view>;
    mapForeignMutationsFromProps: <newForeignMutations>(f: BasicFun<TemplateProps<context, state, newForeignMutations, view>, foreignMutations>) => Template<context, state, newForeignMutations, view>;
} & TemplateRunner<context, state, foreignMutations, view>;
export declare const createTemplate: <context, state, foreignMutations, view>(actual: TemplateRunner<context, state, foreignMutations, view>) => Template<context, state, foreignMutations, view>;
export declare const Template: {
    Default: <context, state, foreignMutations, view = Unit>(actual: TemplateRunner<context & state, state, foreignMutations, view>) => Template<context & state, state, foreignMutations, view>;
    Operations: {
        Wrap: <context, state, foreignMutations, view>(p: Template<context, state, foreignMutations, view>, Wrapper: BasicFun<{
            children?: TemplateChildren;
        }, JSX.Element>) => Template<context, state, foreignMutations, view>;
        WithView: <context, state, foreignMutations, view>(p: Template<context, state, foreignMutations, view>, view: view) => Template<context, state, foreignMutations, Unit>;
        MapState: <context, state, newState, foreignMutations, view>(p: Template<context, state, foreignMutations, view>, f: BasicFun<BasicUpdater<state>, BasicUpdater<newState>>) => Template<context, newState, foreignMutations, view>;
        MapStateFromProps: <context, state, newState, foreignMutations, view>(p: Template<context, state, foreignMutations, view>, f: BasicFun<[TemplateProps<context, newState, foreignMutations, view>, BasicUpdater<state>], BasicUpdater<newState>>) => Template<context, newState, foreignMutations, view>;
        MapContext: <context, newContext, state, foreignMutations, view>(p: Template<context, state, foreignMutations, view>, f: BasicFun<newContext, context | undefined>) => Template<newContext, state, foreignMutations, view>;
        MapForeignMutations: <context, state, foreignMutations, newForeignMutations, view>(p: Template<context, state, foreignMutations, view>, f: BasicFun<newForeignMutations, foreignMutations>) => Template<context, state, newForeignMutations, view>;
        MapContextFromProps: <context, newContext, state, foreignMutations, view>(p: Template<context, state, foreignMutations, view>, f: BasicFun<TemplateProps<newContext, state, foreignMutations, view>, context | undefined>) => Template<newContext, state, foreignMutations, view>;
        MapForeignMutationsFromProps: <context, state, foreignMutations, newForeignMutations, view>(p: Template<context, state, foreignMutations, view>, f: BasicFun<TemplateProps<context, state, newForeignMutations, view>, foreignMutations>) => Template<context, state, newForeignMutations, view>;
        Any: <context, state, foreignMutations, view>(p: Template<context, state, foreignMutations, view>, others: Array<Template<context, state, foreignMutations>>) => Template<context, state, foreignMutations, view>;
    };
};
export {};
//# sourceMappingURL=state.d.ts.map