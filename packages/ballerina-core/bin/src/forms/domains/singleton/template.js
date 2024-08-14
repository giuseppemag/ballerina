import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Template } from "../../../template/state";
export const SingletonFormTemplate = () => Template.Default(props => _jsx(_Fragment, { children: props.context.fieldOrder.map(field => props.context.entityDescriptor[field].kind == "string" ?
        _jsx(props.view.string, { onChange: e => props.foreignMutations.updateEntity(field, e), value: props.context.entity[field] })
        : props.context.entityDescriptor[field].kind == "number" ?
            _jsx(props.view.number, { onChange: e => props.foreignMutations.updateEntity(field, e), value: props.context.entity[field] })
            : props.context.entityDescriptor[field].kind == "boolean" ?
                _jsx(props.view.boolean, { onChange: e => props.foreignMutations.updateEntity(field, e), value: props.context.entity[field] })
                : props.context.entityDescriptor[field].kind == "date" ?
                    _jsx(props.view.date, { onChange: e => props.foreignMutations.updateEntity(field, e), value: props.context.entity[field] })
                    : props.context.entityDescriptor[field].kind == "custom" ?
                        props.context.entityDescriptor[field].render({
                            context: props.context,
                            state: props.context[field],
                            entityValue: props.context.entity,
                            fieldValue: props.context.entity[field],
                            onChange: newValue => {
                                props.foreignMutations.updateEntity(field, newValue);
                            },
                            setState: props.setState,
                        })
                        :
                            _jsxs(_Fragment, { children: [JSON.stringify(props.context.entity[field]), _jsx("button", { children: "Remounting or not?" })] })) }));
//# sourceMappingURL=template.js.map