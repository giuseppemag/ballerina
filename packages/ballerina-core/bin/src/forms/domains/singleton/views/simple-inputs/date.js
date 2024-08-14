import { jsx as _jsx } from "react/jsx-runtime";
export const SimpleDateInput = props => _jsx("input", { type: "date", value: props.value.toDateString(), onChange: e => props.onChange(new Date(Date.parse(e.currentTarget.value))) });
//# sourceMappingURL=date.js.map