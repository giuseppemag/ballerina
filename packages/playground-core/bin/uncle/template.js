import { jsx as _jsx } from "react/jsx-runtime";
import { Template } from "@ballerina/core";
import { UncleCoroutinesRunner } from "./coroutines/runner";
export const UncleTemplate = Template.Default(props => _jsx(props.view, Object.assign({}, props))).any([
    UncleCoroutinesRunner.mapContext(_ => (Object.assign(Object.assign({}, _), { events: [] })))
]);
//# sourceMappingURL=template.js.map