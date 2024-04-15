import { Updater } from "../../state";

export const replaceWith = <V>(v: V) => Updater((_: V) => v);
