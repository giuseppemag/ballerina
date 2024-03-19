import * as React from "react";

export class ComponentDidMount extends React.Component<{
  onMount: () => void;
  children?: React.ReactNode;
}> {
  componentDidMount() {
    this.props.onMount();
  }

  render() {
    return this.props.children || <> </>;
  }
}
