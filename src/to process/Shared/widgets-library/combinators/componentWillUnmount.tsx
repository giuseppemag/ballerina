import * as React from "react";

export class ComponentWillUnmount extends React.Component<{
  onUnmount: () => void;
  children?: React.ReactNode;
}> {
  componentWillUnmount() {
    this.props.onUnmount();
  }

  render() {
    return this.props.children || <> </>;
  }
}
