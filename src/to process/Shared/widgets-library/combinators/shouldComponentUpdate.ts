import * as React from "react";

import { fromJSX, Widget } from "../basics/widget";

type ShouldComponentUpdateProps<o> = {
  shouldUpdate: boolean;
  inner: Widget<o>;
  onDone: (output: o) => void;
};
class ShouldComponentUpdate<o> extends React.Component<
  ShouldComponentUpdateProps<o>,
  {}
> {
  shouldComponentUpdate() {
    return this.props.shouldUpdate;
  }

  render() {
    return this.props.inner.run(this.props.onDone);
  }
}

export function shouldComponentUpdate<o>(
  shouldUpdate: boolean,
  inner: Widget<o>
): Widget<o> {
  return fromJSX((setState) =>
    React.createElement<ShouldComponentUpdateProps<o>>(ShouldComponentUpdate, {
      shouldUpdate,
      inner,
      onDone: setState,
    })
  );
}
