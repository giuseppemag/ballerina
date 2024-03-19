import * as React from "react";

import { BasicFun as BasicFun, BasicUpdater as BasicUpdater } from "./fun";

export interface Widget<o> {
  run: (on_done: (output: o) => void) => JSX.Element;
  /** Wraps the `JSX.Element` of the internal widget in some extra markup.
   * This is a visual decorator only.
   * This has no impact on the data flow.
   *
   * e.g.
   * ```javascript
   * w.wrapHTML(w => <div>{w}</div>)
   * ```
   * *
   * The given `JSX.Element` *must* appear in the returned value, otherwise
   * the widget will, effectively, stop working and producing data.
   *
   * e.g. that will cause a lot of issues and damage because we have killed the
   * widget in a misguided attempt to make it pretty
   * ```javascript
   * w.wrapHTML(w => <div></div>)
   * ```
   */
  wrapHTML: (f: BasicUpdater<JSX.Element>) => Widget<o>;

  /** Maps the data output value of the Widget,
   * @param f The function has only access to the output result `o2` and based on its value can replace with a new result `o2`.
   * The function `f` however cannot alter the Widget/control/visual flow and replace it with a new widget or nothing inside there.
   */
  map: <o2>(f: BasicFun<o, o2>) => Widget<o2>;

  /** Forces a widget to fake any arbitrary output, by **never** returning it. */
  never: <o2>() => Widget<o2>;
}
/** Creates a widget from a cont -> JSX.Element */

export const fromJSX = <o,>(
  w: (cont: (_: o) => void) => JSX.Element
): Widget<o> => ({
  run: w,
  wrapHTML: function (f: BasicUpdater<JSX.Element>) {
    return wrapHTML<o>(f)(this);
  },
  map: function <o2>(f: BasicFun<o, o2>) {
    return map(f)(this);
  },
  never: function <_>(): Widget<_> {
    return never(this);
  },
});
/** A widget that depends on some input. */

export type IOWidget<i, o> = BasicFun<i, Widget<o>>;

export const nothing = <o,>(): Widget<o> => fromJSX((_) => <></>);
const never = <o, _>(inner_widget: Widget<_>): Widget<o> =>
  fromJSX((_: (output: o) => void) => inner_widget.run((_) => {}));

export const wrapHTML =
  <a,>(wrap: BasicUpdater<JSX.Element>): BasicUpdater<Widget<a>> =>
  (widget_a) =>
    fromJSX((on_done: (output: a) => void) =>
      wrap(widget_a.run((res_a) => on_done(res_a)))
    );

export const map =
  <a, b>(f: BasicFun<a, b>): BasicFun<Widget<a>, Widget<b>> =>
  (widget_a) =>
    fromJSX((on_done_b: (output_b: b) => void) =>
      widget_a.run((res_a) => on_done_b(f(res_a)))
    );
