export type BasicFun<a, b> = (_: a) => b;
export type Fun<a, b> = BasicFun<a, b> & {
    then<c>(other: BasicFun<b, c>): Fun<a, c>;
};
export declare const Fun: <a, b>(_: BasicFun<a, b>) => Fun<a, b>;
export type BasicFun2<a, b, c> = (_: a, __: b) => c;
export type Fun2<a, b, c> = BasicFun2<a, b, c> & {
    then<d>(other: BasicFun<c, d>): Fun2<a, b, d>;
};
export declare const Fun2: <a, b, c>(_: BasicFun2<a, b, c>) => Fun2<a, b, c>;
//# sourceMappingURL=state.d.ts.map