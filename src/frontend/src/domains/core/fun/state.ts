export type BasicFun<a,b> = (_:a) => b
export type BasicUpdater<e> = BasicFun<e,e>

export type Fun<a,b> = BasicFun<a,b> & { then<c>(other:BasicFun<b,c>) : Fun<a,c> }
export const Fun = <a,b>(_:BasicFun<a,b>) : Fun<a,b> => {
  const f = _ as Fun<a,b>
  f.then = function <c>(this:Fun<a,b>, other:BasicFun<b,c>) : Fun<a,c> {
    return Fun(_ => other(this(_)))
  }
  return f
}

export type Updater<e> = BasicUpdater<e> & { 
  then(other:BasicUpdater<e>) : Updater<e>, 
  insideOf:<p>() => <k extends keyof p>(k:k) => <up extends { [_ in k]:Widening<e,p> }>(up:up) => Updater<p>
}
export type Widening<c,p> = BasicFun<BasicUpdater<c>, Updater<p>>

export const Updater = <e>(_:BasicUpdater<e>) : Updater<e> => {
  const u = _ as Updater<e>
  u.then = function (this:Updater<e>, other:BasicUpdater<e>) : Updater<e> {
    return Updater(_ => other(this(_)))
  }
  u.insideOf = function <p>(this:Updater<e>) : <k extends keyof p>(k:k) => <up extends { [_ in k]:Widening<e,p> }>(up:up) => Updater<p> {
    return k => up => up[k](this)
  }
  return u
}


export const id = <a>() : Fun<a,a> => Fun(_ => _)
