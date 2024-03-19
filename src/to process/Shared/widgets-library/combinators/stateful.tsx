import { useEffect, useState } from "react";
import React from "react";

import {
  BasicFun as BasicFun,
  BasicUpdater as BasicUpdater,
} from "../basics/fun";
import { Options } from "../basics/options";
import { fromJSX, IOWidget, Widget } from "../basics/widget";

export const stateful =
  <s,>(initialState: s, options?: Options) =>
  (iow: IOWidget<s, BasicUpdater<s>>): Widget<s> =>
    fromJSX((setState) => (
      <Stateful
        initialState={initialState}
        onStateChange={setState}
        iow={iow}
        key={options?.key}
      />
    ));

export const Stateful = <s,>(props: {
  initialState: s;
  onStateChange: BasicFun<s, void>;
  iow: IOWidget<s, BasicUpdater<s>>;
}) => {
  const [state, setState] = useState(props.initialState);
  useEffect(() => {
    props.onStateChange(state);
  }, [state, props]);
  return props.iow(state).run(setState);
};
