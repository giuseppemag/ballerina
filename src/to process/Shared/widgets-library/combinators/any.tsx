import * as React from "react";

import { Options } from "../basics/options";
import { fromJSX, Widget } from "../basics/widget";

export const any = <o,>(widgets: Widget<o>[], options?: Options): Widget<o> =>
  fromJSX((setState) => (
    <Any key={options?.key} widgets={widgets} setState={setState} />
  ));

export const Any = <o,>(props: {
  widgets: Widget<o>[];
  setState: (_: o) => void;
}) => <>{props.widgets.map((w) => w.run(props.setState))}</>;
