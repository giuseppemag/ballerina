import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { Template } from "../template/state";
import { StreamDataLoader } from "./coroutines/runner";
export const InfiniteStreamTemplate = () => Template.Default((_props) => _jsx(_Fragment, {})).any([
    StreamDataLoader()
]);
//# sourceMappingURL=template.js.map