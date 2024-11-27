module Ballerina.CRUD
open Ballerina.Fun

open System

type Crud<'a> = 
  abstract member create:'a -> Async<Guid>
  abstract member delete:Guid -> Async<Unit>
  abstract member get:Guid -> Async<Option<'a>>
  abstract member getN:Guid -> Quotations.Expr<'a -> bool> -> Async<Linq.IQueryable<'a>>
  abstract member update:Guid -> Updater<'a> -> Async<Unit>


// let makePrintable<'a> (x: int, y: float) =
//     { new Crud<'a> with
//         member this.create _ = failwith ""
//         member this.delete _ = failwith ""
//         member this.get _ = failwith ""
//         member this.getN _ _ = failwith ""
//         member this.update _ _ = failwith "" }


// let x3 = makePrintable<int> (1, 2.0)
// let res = x3.create (failwith "")
