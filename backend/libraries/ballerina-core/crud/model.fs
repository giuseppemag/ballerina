module Ballerina.CRUD
open Ballerina.Fun

open System

type Crud<'a> = {
  create:'a -> Async<Guid>
  delete:Guid -> Async<Unit>
  get:Guid -> Async<Option<'a>>
  getN:Guid -> Quotations.Expr<'a -> bool> -> Async<Linq.IQueryable<'a>>
  update:Guid -> Updater<'a> -> Async<Unit>
}
