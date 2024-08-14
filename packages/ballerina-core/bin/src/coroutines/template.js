import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { unit } from "../fun/domains/unit/state";
import { Updater } from "../fun/domains/updater/state";
import { Coroutine } from "./state";
import { Template } from "../template/state";
const Co = Coroutine;
class CoroutineComponent extends React.Component {
    constructor(props) {
        super(props);
        this.running = false;
        this.animationFrameId = undefined;
        this.state = { currentCoroutine: props.initialCoroutine };
    }
    componentDidMount() {
        var _a;
        let lastTimestamp = Date.now();
        this.running = true;
        const tick = () => {
            if (!this.running) {
                clearInterval(this.animationFrameId);
                return;
            }
            const currTimestamp = Date.now();
            const step = Co.Tick(this.props.context, this.state.currentCoroutine, currTimestamp - lastTimestamp);
            lastTimestamp = currTimestamp;
            if (!this.running)
                return;
            if (step.kind == "done") {
                this.setState((s) => {
                    var _a;
                    return (Object.assign(Object.assign({}, s), { currentCoroutine: !!((_a = this.props.options) === null || _a === void 0 ? void 0 : _a.restartWhenFinished)
                            ? this.props.initialCoroutine
                            : Co.Nothing() }));
                }, () => step.state && this.running
                    ? this.props.setState(step.state)
                    : undefined);
            }
            else {
                this.setState((s) => (Object.assign(Object.assign({}, s), { currentCoroutine: step.next })), () => step.state && this.running
                    ? this.props.setState(Updater(step.state))
                    : undefined);
            }
            // if (this.running)
            //   this.animationFrameId = setTimeout(
            //     tick,
            //     this.props.options?.interval || 250
            //   );
        };
        this.animationFrameId = setInterval(tick, ((_a = this.props.options) === null || _a === void 0 ? void 0 : _a.interval) || 250);
    }
    componentWillUnmount() {
        this.running = false;
        clearInterval(this.animationFrameId);
    }
    shouldComponentUpdate() {
        return false;
    }
    render() {
        return _jsx(_Fragment, {});
    }
}
export const CoroutineTemplate = () => Template.Default(props => {
    var _a, _b;
    return _jsx(CoroutineComponent, { context: props.context, initialCoroutine: props.context.initialCoroutine, setState: props.setState, options: props.context.options }, (_b = (_a = props.context.options) === null || _a === void 0 ? void 0 : _a.key) === null || _b === void 0 ? void 0 : _b.call(_a, {
        context: props.context,
        setState: props.setState,
        foreignMutations: unit,
        view: unit
    }));
});
//# sourceMappingURL=template.js.map