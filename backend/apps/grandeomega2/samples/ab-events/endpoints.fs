module absample.endpoints
open System
open Microsoft.AspNetCore.Builder
open Migrations
open Microsoft.EntityFrameworkCore
open absample.efmodels
open absample.repositories

type WebApplication with 
  member app.UseABSample() = 
    app.MapGet("/ABEvents", new Func<_, _>(fun (db:BloggingContext) -> 
      async{
        let! values = (ABEvent db db.ABEvents).getN <@ fun _ -> true @>
        return values.Include(fun x -> x.AB)
      })).WithOpenApi() |> ignore
    app.MapGet("/AEvents", new Func<_, _>(fun (db:BloggingContext) -> (AEvent db db.AEvents).getN <@ fun _ -> true @>))
      .WithOpenApi() |> ignore
    app.MapGet("/BEvents", new Func<_, _>(fun (db:BloggingContext) -> (BEvent db db.BEvents).getN <@ fun _ -> true @>))
      .WithOpenApi()  |> ignore
    app.MapPost("/ABEvent", new Func<_,_,_>(fun (db:BloggingContext) ([<FromBody>] msg: ABEvent) -> 
      let msg = (ABEvent db db.ABEvents).setId (Guid.NewGuid()) msg
      db.ABEvents.Add(msg)  |> ignore
      db.SaveChanges()  |> ignore
      msg.ABEventId))
      .WithOpenApi() |> ignore
    app
