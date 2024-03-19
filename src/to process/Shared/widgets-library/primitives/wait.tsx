import React, { useEffect, useState } from "react";

import { option, Options } from "../basics/options";
import { fromJSX, Widget } from "../basics/widget";

const Wait = <i,>(props: {
  options?: Options;
  /** A lazy closure */
  input: () => i;
  /** The closure that represents the continuation (after wait executes, resume) in the chain of widgets */
  onDone: (_: i) => void;
  /** Time to wait */
  milliseconds: number;
}) => {
  const [timer, setTimer] = useState<number | undefined>(undefined);

  useEffect(() => {
    /** Note: new_props will keep getting ignored if there is a timer already running */
    if (timer === undefined) {
      setTimer(
        window.setTimeout(() => {
          setTimer(undefined);
          props.onDone(props.input());
        }, props.milliseconds)
      );
    }
  }, [timer, props]);

  useEffect(() => {
    return () => window.clearTimeout(timer);
  }, [timer]);

  return timer === undefined ? (
    <></>
  ) : (
    <React.Fragment key={option("key", props.options)} />
  );
};

/**
 * `wait` builds a widget that waits a given number of `milliseconds` and then yields the lazy inputted value of type `io`.
 *
 *  Only after the given time passes, the lazy input is **computed** and passed to the output.
 *
 *
 * @typeparam io Both the input type and the output type of this IOwidget.
 * @param milliseconds The time to wait until yielding the output
 * @param options general widget options
 */
export const wait =
  (milliseconds: number, options?: Options) =>
  <i,>(input: () => i): Widget<i> =>
    fromJSX((onDone) => (
      <Wait
        onDone={onDone}
        input={input}
        milliseconds={milliseconds}
        options={options}
      />
    ));
