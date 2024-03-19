import * as React from "react";

export class ComponentMountCycle extends React.Component<{
  onMount: () => void;
  onUnmount: () => void;
  children?: React.ReactNode;
}> {
  componentDidMount() {
    this.props.onMount();
  }

  componentWillUnmount() {
    this.props.onUnmount();
  }

  render() {
    return this.props.children || <> </>;
  }
}
