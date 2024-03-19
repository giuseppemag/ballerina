import React from "react";

import { Coroutine } from "../../Coroutines/Coroutine";
import { SharedLayoutConstants } from "../../Layout/SharedLayoutConstants";
import {
  BasicFun as BasicFun,
  BasicUpdater as BasicUpdater,
  Unit,
  Updater,
} from "../basics/fun";
import { fromJSX, IOWidget } from "../basics/widget";

type CoroutineComponentOptions = {
  interval?: number;
  key?: string;
  restartWhenFinished?: boolean;
};
const Co = Coroutine;
export const coroutine =
  <context, state, events>(
    initialCoroutine: Coroutine<context, state, events, Unit>,
    events: events[],
    options?: CoroutineComponentOptions
  ): IOWidget<context, Updater<state>> =>
  (currentContext) =>
    fromJSX((setState) => {
      return (
        <CoroutineComponent
          key={options?.key}
          options={options}
          currentContext={currentContext}
          setState={(_) => setState(Updater(_))}
          initialCoroutine={initialCoroutine}
          events={events}
        />
      );
    });

type CoroutineComponentProps<context, state, events> = {
  initialCoroutine: Coroutine<context, state, events, Unit>;
  currentContext: context;
  events: events[];
  setState: BasicFun<BasicUpdater<state>, void>;
  options?: CoroutineComponentOptions;
};
type CoroutineComponentState<context, state, events> = {
  currentCoroutine: Coroutine<context, state, events, Unit>;
};
class CoroutineComponent<context, state, events> extends React.Component<
  CoroutineComponentProps<context, state, events>,
  CoroutineComponentState<context, state, events>
> {
  constructor(props: CoroutineComponentProps<context, state, events>) {
    super(props);
    this.state = { currentCoroutine: props.initialCoroutine };
  }

  running = false;
  animationFrameId?: NodeJS.Timer = undefined;
  componentDidMount(): void {
    let lastTimestamp = Date.now();
    this.running = true;
    const tick = () => {
      if (!this.running) {
        clearInterval(this.animationFrameId);
        return;
      }
      const currTimestamp = Date.now();
      const step = Co.Tick(
        this.props.currentContext,
        this.props.events,
        this.state.currentCoroutine,
        currTimestamp - lastTimestamp
      );
      if (SharedLayoutConstants.LogCoroutineTicks)
        console.log("co::ticking, deltaT = ", currTimestamp - lastTimestamp);
      lastTimestamp = currTimestamp;
      if (!this.running) return;
      if (step.kind == "done") {
        this.setState(
          (s) => ({
            ...s,
            currentCoroutine: !!this.props.options?.restartWhenFinished
              ? this.props.initialCoroutine
              : Co.Nothing(),
          }),
          () =>
            step.state && this.running
              ? this.props.setState(step.state)
              : undefined
        );
      } else {
        this.setState(
          (s) => ({ ...s, currentCoroutine: step.next }),
          () =>
            step.state && this.running
              ? this.props.setState(Updater(step.state))
              : undefined
        );
      }
      // if (this.running)
      //   this.animationFrameId = setTimeout(
      //     tick,
      //     this.props.options?.interval || 250
      //   );
    };
    this.animationFrameId = setInterval(
      tick,
      this.props.options?.interval || 250
    );
  }

  componentWillUnmount(): void {
    this.running = false;
    clearInterval(this.animationFrameId);
  }

  shouldComponentUpdate(): boolean {
    return false;
  }

  render() {
    return <></>;
  }
}
