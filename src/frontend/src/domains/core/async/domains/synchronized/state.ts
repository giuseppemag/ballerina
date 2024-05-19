import { BasicUpdater, Updater } from "../../../fun/domains/updater/state";
import { AsyncState } from "../../state";

export type Synchronized<value, syncResult> = value & { sync: AsyncState<syncResult>; };
export const Synchronized = {
	Default: <value, syncResult>(initialValue: value): Synchronized<value, syncResult> => ({
		...initialValue,
		sync: AsyncState.Default.unloaded()
	}),
	Updaters: {
		sync: <value, syncResult>(_: BasicUpdater<AsyncState<syncResult>>): Updater<Synchronized<value, syncResult>> => Updater<Synchronized<value, syncResult>>(current => ({
			...current,
			sync:_(current.sync),
		})),
		value: <value, syncResult>(_: BasicUpdater<value>): Updater<Synchronized<value, syncResult>> => Updater<Synchronized<value, syncResult>>(current => ({
			...current,
			...(_(current))
		})),
	}
};
