module absample.repositories
open Microsoft.EntityFrameworkCore
open Ballerina.CRUD
open absample.efmodels

let AB (db:DbContext) (table:DbSet<absample.efmodels.AB>) = 
  Crud.FromDbSet table
    ({| getId = (fun id -> <@ fun e -> e.ABId = id @>); 
        setId = fun id -> fun e -> { e with ABId = id } |}) db

let ABEvent (db:DbContext) (table:DbSet<absample.efmodels.ABEvent>) = 
  Crud.FromDbSet table 
    ({| getId = (fun id -> <@ fun e -> e.ABEventId = id @>); 
        setId = fun id -> 
          fun e -> 
            (match e |> ABEvent.ToUnion with
              | absample.models.AEvent a -> absample.models.AEvent { a with event.ABEventId = id }
              | absample.models.BEvent b -> absample.models.BEvent { b with event.ABEventId = id })
            |> ABEvent.FromUnion |}) db

let AEvent (db:DbContext) (table:DbSet<absample.efmodels.AEvent>) = 
  Crud.FromDbSet table 
    ({| getId = (fun id -> <@ fun e -> e.ABEventId = id @>); 
        setId = fun id -> 
          fun e -> 
            { (e |> AEvent.ToRecord) with event.ABEventId = id } |> AEvent.FromRecord |}) db

let BEvent (db:DbContext) (table:DbSet<absample.efmodels.BEvent>) = 
  Crud.FromDbSet table 
    ({| getId = (fun id -> <@ fun e -> e.ABEventId = id @>); 
        setId = fun id -> 
          fun e -> 
            { (e |> BEvent.ToRecord) with event.ABEventId = id } |> BEvent.FromRecord |}) db
