
export type BasicFun<a,b> = (_:a) => b

export type Fun<a,b> = BasicFun<a,b> & { then<c>(other:BasicFun<b,c>) : Fun<a,c> }
export const Fun = <a,b>(_:BasicFun<a,b>) : Fun<a,b> => {
  const f = _ as Fun<a,b>
  f.then = function <c>(this:Fun<a,b>, other:BasicFun<b,c>) : Fun<a,c> {
    return Fun(_ => other(this(_)))
  }
  return f
}


