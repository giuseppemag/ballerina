import { BasicFun, Fun } from "./domains/core/fun/state";

// child1 coroutine
// child2 coroutine
// parent coroutine
// embed both child1 and child2 in parallel with a regular Parent coroutine

export const Array = {
	Operations: {
		map: <a, b>(f: BasicFun<a, b>): Fun<Array<a>, Array<b>> => Fun(_ => _.map(f))
	}
};
