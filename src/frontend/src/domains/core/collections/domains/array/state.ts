import { BasicFun, Fun } from "../../../fun/state";

export const Array = {
	Operations: {
		map: <a, b>(f: BasicFun<a, b>): Fun<Array<a>, Array<b>> => Fun(_ => _.map(f))
	}
};
