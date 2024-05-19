import React from "react";
import { Unit } from "../fun/domains/unit/state";
import { BasicUpdater, Updater } from "../fun/domains/updater/state";
import { BasicFun } from "../fun/state";
import { Coroutine } from "./state";
import { Template, TemplateProps } from "../template/state";

export type CoroutineComponentOptions<context, state, event> = {
  interval?: number;
  key?: string;
  restartWhenFinished?: boolean;
  runFilter?: BasicFun<TemplateProps<context & state & { events:event[] }, state, Unit>, boolean>
};

const Co = Coroutine;

type CoroutineReadonlyContext<context, state, events> = {
  initialCoroutine: Coroutine<context, state, events, Unit>;
  events: events[];
  options?: CoroutineComponentOptions<context, state, events>;
}

type CoroutineComponentProps<context, state, events> = {
  context: context;
  setState: BasicFun<BasicUpdater<state>, void>;
} & CoroutineReadonlyContext<context, state, events>;

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
  animationFrameId?: NodeJS.Timeout = undefined;
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
        this.props.context,
        this.props.events,
        this.state.currentCoroutine,
        currTimestamp - lastTimestamp
      );
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
    )
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

export const CoroutineTemplate = <context, state, events, foreignMutations>() => 
  Template.Default<context & CoroutineReadonlyContext<context, state, events>, state, foreignMutations>(props => 
    <CoroutineComponent
      context={props.context}
      events={props.context.events}
      initialCoroutine={props.context.initialCoroutine}
      setState={props.setState}
      options={props.context.options}    
    />
  )