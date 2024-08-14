import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { unit } from '@core';
export const createTemplate = (actual) => {
    const result = actual;
    result.wrap = function (Wrapper) {
        return Template.Operations.Wrap(this, Wrapper);
    };
    result.withView = function (view) {
        return Template.Operations.WithView(this, view);
    };
    result.mapState = function (f) {
        return Template.Operations.MapState(this, f);
    };
    result.mapStateFromProps = function (f) {
        return Template.Operations.MapStateFromProps(this, f);
    };
    result.mapContext = function (f) {
        return Template.Operations.MapContext(this, f);
    };
    result.mapForeignMutations = function (f) {
        return Template.Operations.MapForeignMutations(this, f);
    };
    result.mapContextFromProps = function (f) {
        return Template.Operations.MapContextFromProps(this, f);
    };
    result.mapForeignMutationsFromProps = function (f) {
        return Template.Operations.MapForeignMutationsFromProps(this, f);
    };
    result.any = function (others) {
        return Template.Operations.Any(this, others);
    };
    return result;
};
export const Template = {
    Default: (actual) => createTemplate(actual),
    Operations: {
        Wrap: (p, Wrapper) => createTemplate(props => _jsx(Wrapper, { children: p(props) })),
        WithView: (p, view) => createTemplate(props => _jsx(_Fragment, { children: p(Object.assign(Object.assign({}, props), { view: view })) })),
        MapState: (p, f) => createTemplate(props => _jsx(_Fragment, { children: p({
                context: props.context,
                setState: (_ => props.setState(f(_))),
                foreignMutations: props.foreignMutations,
                view: props.view,
            }) })),
        MapStateFromProps: (p, f) => createTemplate(props => _jsx(_Fragment, { children: p({
                context: props.context,
                setState: (_ => props.setState(f([props, _]))),
                foreignMutations: props.foreignMutations,
                view: props.view,
            }) })),
        MapContext: (p, f) => createTemplate(props => {
            const context = f(props.context);
            if (!context)
                return _jsx(_Fragment, {});
            return _jsx(_Fragment, { children: p({
                    context: context,
                    setState: props.setState,
                    foreignMutations: props.foreignMutations,
                    view: props.view,
                }) });
        }),
        MapForeignMutations: (p, f) => createTemplate(props => _jsx(_Fragment, { children: p({
                context: props.context,
                setState: props.setState,
                foreignMutations: f(props.foreignMutations),
                view: props.view,
            }) })),
        MapContextFromProps: (p, f) => createTemplate(props => {
            const context = f(props);
            if (!context)
                return _jsx(_Fragment, {});
            return _jsx(_Fragment, { children: p({
                    context: context,
                    setState: props.setState,
                    foreignMutations: props.foreignMutations,
                    view: props.view,
                }) });
        }),
        MapForeignMutationsFromProps: (p, f) => createTemplate(props => _jsx(_Fragment, { children: p({
                context: props.context,
                setState: props.setState,
                foreignMutations: f(props),
                view: props.view,
            }) })),
        Any: (p, others) => createTemplate(props => {
            return _jsx(_Fragment, { children: [
                    p(props),
                    ...others.map(_ => _({ context: props.context, setState: props.setState, foreignMutations: props.foreignMutations, view: unit }))
                ] });
        })
    }
};
//# sourceMappingURL=state.js.map