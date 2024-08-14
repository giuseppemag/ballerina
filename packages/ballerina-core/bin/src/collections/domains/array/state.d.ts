import { BasicFun, Fun } from "../../../fun/state";
export declare const ArrayRepo: {
    Operations: {
        map: <a, b>(f: BasicFun<a, b>) => Fun<Array<a>, Array<b>>;
    };
};
declare global {
    interface Array<T> {
        random(): T;
    }
}
//# sourceMappingURL=state.d.ts.map