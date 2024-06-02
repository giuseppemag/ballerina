import { id } from "../../../fun/domains/id/state"
import { Unit, unit } from "../../../fun/domains/unit/state";
import { BasicUpdater, Updater } from "../../../fun/domains/updater/state"
import { Fun, BasicFun } from "../../../fun/state"

export type Sum<a, b> = { value: a; kind: "l"; } | { value: b; kind: "r"; };
export type Either<a,b> = Sum<a,b>

export const Sum = <a,b>() => ({
	Default:{
		left:Fun((_:a) : Sum<a,b> => ({ value:_, kind:"l"})),
		right:Fun((_:b) : Sum<a,b> => ({ value:_, kind:"r"})),
	},
	Updaters:{
		left:Fun((_:BasicUpdater<a>) : Updater<Sum<a,b>> => Updater(Sum<a,b>().Updaters.map2(_, id))),
		right:Fun((_:BasicUpdater<b>) : Updater<Sum<a,b>> => Updater(Sum<a,b>().Updaters.map2(id, _))),
		map2:<a,b,a1,b1,>(l:BasicFun<a,a1>, r:BasicFun<b,b1>) : Fun<Sum<a,b>,Sum<a1,b1>> => 
			Sum<a,b>().Operations.fold<a,b,Sum<a1,b1>>(Fun(l).then(Sum<a1,b1>().Default.left), Fun(r).then(Sum<a1,b1>().Default.right))
	},
	Operations:{
		fold:<a,b,c,>(l:BasicFun<a,c>, r:BasicFun<b,c>) : Fun<Sum<a,b>,c> => Fun(_ => _.kind == "l" ? l(_.value) : r(_.value)),
	}
})

export const Either = Sum
export type Option<a> = Sum<Unit,a>
