import { Sum } from "../../../collections/domains/sum/state";
import { BasicUpdater, Updater } from "../../../fun/domains/updater/state";
import { AsyncState } from "../../state";

export type Synchronized<v, s> = v & { sync: AsyncState<s>; };
export const Synchronized = {
	Default: <v, s>(initialValue: v): Synchronized<v, s> => ({
		...initialValue,
		sync: AsyncState.Default.unloaded()
	}),
	Updaters: {
		sync: <v, s>(_: BasicUpdater<AsyncState<s>>): Updater<Synchronized<v, s>> => Updater<Synchronized<v, s>>(current => ({
			...current,
			sync:_(current.sync),
		})),
		value: <v, s>(_: BasicUpdater<v>): Updater<Synchronized<v, s>> => Updater<Synchronized<v, s>>(current => ({
			...current,
			...(_(current))
		})),
	}
};
