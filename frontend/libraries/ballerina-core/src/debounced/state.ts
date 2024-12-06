import { Sum } from "../../main";
import { replaceWith } from "../fun/domains/updater/domains/replaceWith/state";
import { BasicUpdater, Updater } from "../fun/domains/updater/state";

export type DirtyStatus = "dirty" | "not dirty" | "dirty but being processed"
export type DebouncedStatus = "waiting for dirty" | "just detected dirty, starting processing" 
	| "processing finished" | "state was still dirty but being processed, resetting to not dirty"
	| "processing shortcircuited"
	| "state was changed underwater back to dirty, leaving the dirty flag alone"
	| "inner call failed with transient failure"
export type Debounced<Value> = Value & { lastUpdated: number; dirty: DirtyStatus; status: Sum<DebouncedStatus, "debug off"> };
export const Debounced = {
	Default: <v>(initialValue: v, debug?: boolean): Debounced<v> => ({
		...initialValue,
		lastUpdated: 0,
		dirty: "not dirty",
		status: debug ? Sum.Default.left("waiting for dirty") : Sum.Default.right("debug off")
	}),
	Updaters: {
		Core:{
			status: <v>(_: BasicUpdater<DebouncedStatus>): Updater<Debounced<v>> => Updater<Debounced<v>>(current => ({
				...current,
				status: current.status.kind == "l" ? Sum.Default.left(_(current.status.value)) : Sum.Default.right("debug off"),
			})),
			dirty: <v>(_: BasicUpdater<DirtyStatus>): Updater<Debounced<v>> => Updater<Debounced<v>>(current => ({
				...current,
				dirty: _(current.dirty),
			})),
			lastUpdated: <v>(_: BasicUpdater<number>): Updater<Debounced<v>> => Updater<Debounced<v>>(current => ({
				...current,
				lastUpdated: _(current.lastUpdated),
			})),
			valueWithoutDebouncing: <v>(_: BasicUpdater<v>): Updater<Debounced<v>> => Updater<Debounced<v>>(current => ({
				...current,
				...(_(current)),
			})),
			value: <v>(_: BasicUpdater<v>): Updater<Debounced<v>> => Updater<Debounced<v>>(current => ({
				...(_(current)),
				dirty: current.dirty,
				lastUpdated: current.lastUpdated,
				status: current.status
			})),
		},
		Template:{
			value: <v>(_: BasicUpdater<v>): Updater<Debounced<v>> => 
				// Debounced.Updaters.Core.value(_).then(
				// 	Debounced.Updaters.Core.dirty(replaceWith<DirtyStatus>("dirty"))
				// ).then(
				// 	Debounced.Updaters.Core.lastUpdated(replaceWith(Date.now()))
				// )
				Updater<Debounced<v>>(current => ({
					...(_(current)),
					dirty: "dirty",
					lastUpdated: Date.now(),
					status: current.status
				}))
		}
	},
	Operations:{
		shouldCoroutineRun:<v>(_:Debounced<v>) => _.dirty != "not dirty"
	}
};
