import { Updater } from "./domains/updater/state";


export const replaceWith = <V>(v: V) => Updater((_: V) => v);
