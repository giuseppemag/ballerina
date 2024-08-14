export type BasicFun<a,b> = (_:a) => b

export type Fun<a,b> = BasicFun<a,b> & { then<c>(other:BasicFun<b,c>) : Fun<a,c> }

export const Fun = <a,b>(_:BasicFun<a,b>) : Fun<a,b> =>
  Object.assign(_, {
    then: function <c>(this:Fun<a,b>, other:BasicFun<b,c>) : Fun<a,c> {
      return Fun(_ => other(this(_)))
    }
  })


export type BasicFun2<a,b,c> = (_:a, __:b) => c

export type Fun2<a,b,c> = BasicFun2<a,b,c> & { then<d>(other:BasicFun<c,d>) : Fun2<a,b,d> }
export const Fun2 = <a,b,c>(_:BasicFun2<a,b,c>) : Fun2<a,b,c> =>
  Object.assign(_, {
    then: function <d>(this:Fun2<a,b,c>, other:BasicFun<c,d>) : Fun2<a,b,d> {
      return Fun2((a,b) => other(this(a,b)))
    }
  })


/*
// samples
const incr: Fun<number,number> = Fun(_ => _ + 1)
const decr: Fun<number,number> = Fun(_ => _ - 1)
const doub: Fun<number,number> = Fun(_ => _ * 2)
const halv: Fun<number,number> = Fun(_ => _ / 2)

const f = incr.then(doub).then(decr)
console.log(f(5)) // prints 11
*/