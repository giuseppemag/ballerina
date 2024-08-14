export const Fun = (_) => Object.assign(_, {
    then: function (other) {
        return Fun(_ => other(this(_)));
    }
});
export const Fun2 = (_) => Object.assign(_, {
    then: function (other) {
        return Fun2((a, b) => other(this(a, b)));
    }
});
/*
// samples
const incr: Fun<number,number> = Fun(_ => _ + 1)
const decr: Fun<number,number> = Fun(_ => _ - 1)
const doub: Fun<number,number> = Fun(_ => _ * 2)
const halv: Fun<number,number> = Fun(_ => _ / 2)

const f = incr.then(doub).then(decr)
console.log(f(5)) // prints 11
*/ 
//# sourceMappingURL=state.js.map