import { jsx as _jsx } from "react/jsx-runtime";
export const SimpleNumberInput = props => _jsx("input", { type: "number", value: props.value, onChange: e => props.onChange(parseInt(e.currentTarget.value)) });
//# sourceMappingURL=number.js.map