import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Template } from "@ballerina/core";
import { ParentCoroutinesRunner, ParentDebouncerRunner, } from "./coroutines/runner";
import { Child1Template } from "./domains/child1/template";
import { Child2Template } from "./domains/child2/template";
import { Parent, } from "./state";
export const Child1TemplateEmbedded = Child1Template
    .mapContext((p) => p.child1)
    .mapState(Parent.Updaters.Core.child1);
export const Child2TemplateEmbedded = Child2Template.mapContext((p) => p.child2)
    .mapState(Parent.Updaters.Core.child2);
export const ParentTemplate1 = Template.Default((props) => (_jsx(_Fragment, { children: _jsx(props.view, Object.assign({}, props, { Child2: Child2TemplateEmbedded })) })));
export const ParentTemplate2 = Template.Default((props) => (_jsx(_Fragment, { children: _jsx(props.view, Object.assign({}, props, { Child1: Child1TemplateEmbedded, Child2: Child2TemplateEmbedded })) }))).any([ParentCoroutinesRunner, ParentDebouncerRunner]);
//# sourceMappingURL=template.js.map