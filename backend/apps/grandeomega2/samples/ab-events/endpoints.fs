module absample.endpoints
open Ballerina
open System
open Microsoft.AspNetCore.Builder
open Migrations
open Microsoft.EntityFrameworkCore
open absample.efmodels
open absample.repositories

type WebApplication with 
  member app.UseABSample() = 
    app.MapGet("/ABEvents", new Func<_, _, _, _>(fun (db:BloggingContext) (skip:int) (take:int) -> 
      async{
        let! values = (ABEvent db db.ABEvents).getN <@ fun _ -> true @> <@ fun e -> e.ABEventId @> (Ballerina.Range.Default(skip, take))
        return values.Include(fun x -> x.AB)
      })).WithOpenApi() |> ignore
    app.MapGet("/AEvents", new Func<_, _, _, _>(fun (db:BloggingContext) (skip:int) (take:int) -> 
      (AEvent db db.AEvents).getN <@ fun _ -> true @> <@ fun e -> e.ABEventId @> (Ballerina.Range.Default(skip, take))))
      .WithOpenApi() |> ignore
    app.MapGet("/BEvents", new Func<_, _, _, _>(fun (db:BloggingContext) (skip:int) (take:int) -> 
      (BEvent db db.BEvents).getN <@ fun _ -> true @> <@ fun e -> e.ABEventId @> (Ballerina.Range.Default(skip, take))))
      .WithOpenApi()  |> ignore
    app.MapPost("/ABEvent", new Func<_,_,_>(fun (db:BloggingContext) ([<FromBody>] msg: ABEvent) -> 
      let msg = (ABEvent db db.ABEvents).setId (Guid.NewGuid()) msg
      db.ABEvents.Add(msg)  |> ignore
      db.SaveChanges()  |> ignore
      msg.ABEventId))
      .WithOpenApi() |> ignore
    app
