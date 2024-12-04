module Program
open System
open System.CommandLine
open System.Collections.Generic
open System.IO
open System.Linq
open System.Threading.Tasks
open Microsoft.AspNetCore
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting
open Microsoft.AspNetCore.HttpsPolicy
open Microsoft.Extensions.Configuration
open Microsoft.Extensions.DependencyInjection
open Microsoft.Extensions.Hosting
open Microsoft.Extensions.Logging
open Microsoft.Extensions.Options
open Ballerina.Coroutines
open Ballerina.CRUD
open Migrations
open Microsoft.EntityFrameworkCore
open MBrace.FsPickler
open MBrace.FsPickler.Json
open Microsoft.AspNetCore.Mvc
open Microsoft.AspNetCore.Http.Json
open System.Text.Json
open System.Text.Json.Serialization
open Ballerina.Fun
open Ballerina.Queries
open absample.efmodels
open absample.repositories
open absample.endpoints
open Microsoft.OpenApi.Models
open System.Threading

type ABContext = { ABs:Crud<absample.efmodels.AB>; ABEvents:Crud<absample.efmodels.ABEvent> }

let jobs (createScope:Unit -> IServiceScope) =
  let processAEvents (abId:Guid) : Coroutine<Unit, ABContext, absample.models.ABEvent> =
    co.Repeat(
      co.Any([
        co{
          do! co.On(function absample.models.AEvent e when e.ABId = abId -> Some() | _ -> None)
          wait (TimeSpan.FromSeconds 0.0)
          do! co.Do(fun ctx -> ctx.ABs.update abId (fun ab -> ({ ab with ACount = ab.ACount+1 })))
        }
        co{
          wait (TimeSpan.FromSeconds 3.0)
          do! co.Do(fun ctx -> ctx.ABs.update abId (fun ab -> ({ ab with AFailCount = ab.AFailCount+1 })))
        }
      ])
    )

  let init(): EvaluatedCoroutines<_,_> = 
    use scope = createScope()
    use db = scope.ServiceProvider.GetService<BloggingContext>()
    db.ABs.RemoveRange(db.ABs)
    db.ABEvents.RemoveRange(db.ABEvents)
    db.ABs.Add({ ABId=Guid.NewGuid(); ACount=0; BCount=0; AFailCount=0; BFailCount=0 }) |> ignore
    db.ABs.Add({ ABId=Guid.NewGuid(); ACount=0; BCount=0; AFailCount=0; BFailCount=0 }) |> ignore
    db.SaveChanges() |> ignore
    db.ChangeTracker.Clear()
    { 
      active = db.ABs.AsNoTracking() |> Seq.toArray |> Seq.map (fun e -> e.ABId) |> Seq.map (fun abId -> (abId, processAEvents abId)) |> Map.ofSeq;
      waiting = Map.empty;
      waitingOrListening = Map.empty;
      listening = Map.empty;
      stopped = Set.empty;
    }      

  let mutable initialEvals = init()
  let mutable lastT = DateTime.Now
  while true do
    use scope = createScope()
    use db = scope.ServiceProvider.GetService<BloggingContext>()
    Thread.Sleep(500)

    let now = DateTime.Now
    let dT = now - lastT
    lastT <- now
    // TODO: restore
    let evals = initialEvals //jsonSerializer.UnPickleOfString<EvaluatedCoroutines<{| counter:int |},Unit>>(File.ReadAllText("evals.json"))
    let resumedWaiting, stillWaiting = evals.waiting |> Map.partition (fun _ v -> v.Until <= now) 
    let active = (evals.active |> Map.values |> Seq.toList) @ (resumedWaiting |> Seq.map (fun w -> w.Value.P) |> Seq.toList) |> Seq.map (fun p -> Guid.NewGuid(), p) |> Map.ofSeq
    let events = db.ABEvents.AsNoTracking().ToArray() |> Seq.map (fun e -> e.ABEventId, e |> absample.efmodels.ABEvent.ToUnion) |> Map.ofSeq
    let (evals', u_s, u_e) = evalMany (active) ({ ABs = AB db (db.ABs); ABEvents = ABEvent db (db.ABEvents) }, events, dT)
    match u_e with
    | Some u_e ->
      let events' = u_e events
      let removed = events |> Map.filter (fun e'_id e' -> events' |> Map.containsKey e'_id |> not)
                            |> Map.toSeq
                            |> Seq.map snd
                            |> Seq.map (absample.efmodels.ABEvent.FromUnion)
                            |> Seq.map (fun e -> e.ABEventId) |> Seq.toArray
      db.ABEvents.RemoveRange(db.ABEvents.Where(fun e -> removed.Contains e.ABEventId))
      db.SaveChanges() |> ignore
      ()
    | _ -> ()
    match u_s with
    | Some u_s -> () // the state here is not really a state, no update to perform          
    | None -> ()
    let newWaiting = evals'.waiting |> Seq.map (fun w -> w.Value) |> Seq.map (fun v -> Guid.NewGuid(), v) |> Seq.toList
    let newWaiting = newWaiting @ (stillWaiting |> Seq.map (fun w -> w.Value) |> Seq.map (fun v -> Guid.NewGuid(), v) |> Seq.toList)
    let evals' = { evals' with waiting = newWaiting |> Map.ofSeq }
    initialEvals <- evals' // TODO: remove
    // TODO: restore
    // let text = jsonSerializer.PickleToString evals'
    // File.WriteAllText("evals.json", text)
    Console.Clear()
    printfn "ABs=%A ABEvents=%A coroutines=%A" (db.ABs.AsNoTracking().OrderBy(fun e -> e.ABId).ToArray()) (db.ABEvents.AsNoTracking().OrderBy(fun e -> e.ABEventId).ToArray()) (initialEvals.active)