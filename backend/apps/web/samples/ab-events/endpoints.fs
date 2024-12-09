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
    app.MapGet("/ABs", new Func<_, _, _, _>(fun (db:BallerinaContext) (skip:int) (take:int) -> 
      (AB db db.ABs).getN <@ fun _ -> true @> <@ fun e -> e.ABId @> (Ballerina.Range.WithinReason(skip, take))
      )).WithOpenApi() |> ignore
    app.MapPost("/ABs", new Func<_,_,_>(fun (db:BallerinaContext) ([<FromBody>] msg: AB) -> 
      let msg = (AB db db.ABs).setId (Guid.NewGuid()) msg
      db.ABs.Add(msg)  |> ignore
      db.SaveChanges()  |> ignore
      msg.ABId))
      .WithOpenApi() |> ignore
    app.MapGet("/ABEvents", new Func<_, _, _, _>(fun (db:BallerinaContext) (skip:int) (take:int) -> 
        let values = (ABEvent db db.ABEvents).getN <@ fun _ -> true @> <@ fun e -> e.ABEventId @> (Ballerina.Range.WithinReason(skip, take))
        values.Include(fun x -> x.AB)
      )).WithOpenApi() |> ignore
    app.MapGet("/AEvents", new Func<_, _, _, _>(fun (db:BallerinaContext) (skip:int) (take:int) -> 
      (AEvent db db.AEvents).getN <@ fun _ -> true @> <@ fun e -> e.ABEventId @> (Ballerina.Range.WithinReason(skip, take))))
      .WithOpenApi() |> ignore
    app.MapGet("/BEvents", new Func<_, _, _, _>(fun (db:BallerinaContext) (skip:int) (take:int) -> 
      (BEvent db db.BEvents).getN <@ fun _ -> true @> <@ fun e -> e.ABEventId @> (Ballerina.Range.WithinReason(skip, take))))
      .WithOpenApi()  |> ignore
    app.MapPost("/ABEvents", new Func<_,_,_>(fun (db:BallerinaContext) ([<FromBody>] msg: ABEvent) -> 
      let msg = (ABEvent db db.ABEvents).setId (Guid.NewGuid()) msg
      msg.CreatedAt <- DateTime.UtcNow
      msg.ProcessingStatus <- ABEventStatus.Enqueued
      db.ABEvents.Add(msg)  |> ignore
      db.SaveChanges()  |> ignore
      msg.ABEventId))
      .WithOpenApi() |> ignore
    app
