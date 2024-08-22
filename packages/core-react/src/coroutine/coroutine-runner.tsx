import { BasicFunc, BasicUpdater, Unit, unit, Updater } from '@tenet/core'
import React from 'react'

import { Template, TemplateWithViewProps } from '../domain/template'
import { Coroutine } from './coroutine'

export type CoroutineComponentOptions<context, state> = {
  interval?: number
  key?: BasicFunc<TemplateWithViewProps<context & state, state, Unit>, string>
  restartWhenFinished?: boolean
  runFilter?: BasicFunc<TemplateWithViewProps<context & state, state, Unit>, boolean>
}

const Co = Coroutine

type CoroutineReadonlyContext<context, state> = {
  initialCoroutine: Coroutine<context, state, Unit>
  options?: CoroutineComponentOptions<context, state>
}

type CoroutineComponentProps<context, state> = {
  context: context
  setState: BasicFunc<BasicUpdater<state>, void>
} & CoroutineReadonlyContext<context, state>

type CoroutineComponentState<context, state> = {
  currentCoroutine: Coroutine<context, state, Unit>
}
class CoroutineComponent<context, state> extends React.Component<
  CoroutineComponentProps<context, state>,
  CoroutineComponentState<context, state>
> {
  constructor(props: CoroutineComponentProps<context, state>) {
    super(props)
    this.state = { currentCoroutine: props.initialCoroutine }
  }

  running = false
  animationFrameId?: NodeJS.Timeout = undefined
  componentDidMount(): void {
    let lastTimestamp = Date.now()
    this.running = true
    const tick = () => {
      if (!this.running) {
        clearInterval(this.animationFrameId)
        return
      }
      const currTimestamp = Date.now()
      const step = Co.Tick(this.props.context, this.state.currentCoroutine, currTimestamp - lastTimestamp)
      lastTimestamp = currTimestamp
      if (!this.running) return
      if (step.kind == 'done') {
        this.setState(
          (s) => ({
            ...s,
            currentCoroutine: !!this.props.options?.restartWhenFinished ? this.props.initialCoroutine : Co.Nothing(),
          }),
          () => (step.state && this.running ? this.props.setState(step.state) : undefined)
        )
      } else {
        this.setState(
          (s) => ({ ...s, currentCoroutine: step.next }),
          () => (step.state && this.running ? this.props.setState(Updater(step.state)) : undefined)
        )
      }
    }
    this.animationFrameId = setInterval(tick, this.props.options?.interval || 250)
  }

  componentWillUnmount(): void {
    this.running = false
    clearInterval(this.animationFrameId)
  }

  shouldComponentUpdate(): boolean {
    return false
  }

  render() {
    return <></>
  }
}

export const CoroutineTemplate = <context, state, foreignMutations>() =>
  Template.Default<context & CoroutineReadonlyContext<context, state>, state, foreignMutations>((props) => (
    <CoroutineComponent
      key={props.context.options?.key?.({
        context: props.context,
        setState: props.setState,
        foreignMutations: unit,
        view: unit,
      })}
      context={props.context}
      initialCoroutine={props.context.initialCoroutine}
      setState={props.setState}
      options={props.context.options}
    />
  ))
