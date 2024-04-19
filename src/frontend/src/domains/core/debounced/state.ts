import { BasicUpdater, Updater } from "../fun/domains/updater/state";

export type DirtyStatus = "dirty" | "not dirty" | "dirty but being processed"
export type DebouncedStatus = "waiting for dirty" | "just detected dirty, starting processing" 
	| "processing finished" | "state was still dirty but being processed, resetting to not dirty"
	| "state was changed underwater back to dirty, leaving the dirty flag alone"
	| "inner call failed with transient failure"
export type Debounced<Value> = Value & { lastUpdated: number; dirty: DirtyStatus; status:DebouncedStatus };
export const Debounced = {
	Default: <v>(initialValue: v): Debounced<v> => ({
		...initialValue,
		lastUpdated: 0,
		dirty: "not dirty",
		status: "waiting for dirty"
	}),
	Updaters: {
		Core:{
			status: <v>(_: BasicUpdater<DebouncedStatus>): Updater<Debounced<v>> => Updater<Debounced<v>>(current => ({
				...current,
				status: _(current.status),
			})),
			dirty: <v>(_: BasicUpdater<DirtyStatus>): Updater<Debounced<v>> => Updater<Debounced<v>>(current => ({
				...current,
				dirty: _(current.dirty),
			})),
			lastUpdated: <v>(_: BasicUpdater<number>): Updater<Debounced<v>> => Updater<Debounced<v>>(current => ({
				...current,
				lastUpdated: _(current.lastUpdated),
			})),
			value: <v>(_: BasicUpdater<v>): Updater<Debounced<v>> => Updater<Debounced<v>>(current => ({
				...(_(current)),
				dirty: current.dirty,
				lastUpdated: current.lastUpdated,
				status: current.status
			})),
		},
		Template:{
			value: <v>(_: BasicUpdater<v>): Updater<Debounced<v>> => Updater<Debounced<v>>(current => ({
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
