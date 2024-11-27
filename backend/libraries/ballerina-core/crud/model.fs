module Ballerina.CRUD
open Ballerina.Fun

open System

type Crud<'a> = 
  abstract member create:'a -> Async<Guid>
  abstract member delete:Guid -> Async<Unit>
  abstract member get:Guid -> Async<Option<'a>>
  abstract member getN:Guid -> Quotations.Expr<'a -> bool> -> Async<Linq.IQueryable<'a>>
  abstract member update:Guid -> Updater<'a> -> Async<Unit>
