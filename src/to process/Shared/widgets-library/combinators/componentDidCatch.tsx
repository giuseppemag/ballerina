import React from "react";

import { fromJSX, IOWidget, Widget } from "../basics/widget";

export const componentDidCatch = <o,>(
  key: string,
  widget: Widget<o>,
  fallbackWidget: IOWidget<[Error, React.ErrorInfo], o>
): Widget<o> =>
  fromJSX((setState) => (
    <ComponentDidCatch
      setState={setState}
      fallbackWidget={fallbackWidget}
      child={widget.run(setState)}
      key={key}
    />
  ));

type ComponentDidCatchProps<a> = {
  setState: (_: a) => void;
  fallbackWidget: IOWidget<[Error, React.ErrorInfo], a>;
  child: JSX.Element;
};
type ComponentDidCatchState = {
  error?: [Error, React.ErrorInfo];
};
export class ComponentDidCatch<a> extends React.Component<
  ComponentDidCatchProps<a>,
  ComponentDidCatchState
> {
  constructor(props: ComponentDidCatchProps<a>) {
    super(props);
    this.state = {};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error: [error, errorInfo] });
  }

  render() {
    return this.state.error === undefined
      ? this.props.child
      : this.props.fallbackWidget(this.state.error).run(this.props.setState);
  }
}
