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

let abEventLoop (createScope:Unit -> IServiceScope) =
  let processAEvents (abId:Guid) : Coroutine<Unit, Unit, ABContext, absample.models.ABEvent> =
    co.Repeat(
      co.Any([
        co{
          let! a_e = co.On(function absample.models.ABEvent.AEvent e when e.event.ABId = abId -> Some e | _ -> None)
          do! co.Wait(TimeSpan.FromSeconds 0.0)
          do! co.Do(fun ctx -> ctx.ABs.update abId (fun ab -> ({ ab with ACount = ab.ACount+a_e.AStep })))
          do! co.Wait(TimeSpan.FromSeconds 0.0)
        }
        co{
          do! co.Wait (TimeSpan.FromSeconds 3.0)
          do! co.Do(fun ctx -> ctx.ABs.update abId (fun ab -> ({ ab with AFailCount = ab.AFailCount+1 })))
          do! co.Wait(TimeSpan.FromSeconds 0.0)
        }
      ])
    )
  let processBEvents (abId:Guid) : Coroutine<Unit, Unit, ABContext, absample.models.ABEvent> =
    co.Repeat(
      co.Any([
        co{
          let! b_e = co.On(function absample.models.ABEvent.BEvent e when e.event.ABId = abId -> Some e | _ -> None)
          do! co.Wait(TimeSpan.FromSeconds 0.0)
          do! co.Do(fun ctx -> ctx.ABs.update abId (fun ab -> ({ ab with BCount = ab.BCount+b_e.BStep })))
          do! co.Wait(TimeSpan.FromSeconds 0.0)
        }
        co{
          do! co.Wait (TimeSpan.FromSeconds 5.0)
          do! co.Produce (Guid.NewGuid(), absample.models.ABEvent.AEvent { event={ ABEventId=Guid.Empty; ABId=abId; AB=Unchecked.defaultof<AB>; CreatedAt=DateTime.UtcNow; ProcessingStatus=ABEventStatus.Enqueued }; AStep=1 })
          do! co.Wait(TimeSpan.FromSeconds 0.0)
          do! co.Do(fun ctx -> ctx.ABs.update abId (fun ab -> ({ ab with BFailCount = ab.BFailCount+1 })))
          do! co.Wait(TimeSpan.FromSeconds 0.0)
        }
      ])
    )
  let processAB abId = 
    co.Any([
      processAEvents abId
      processBEvents abId
    ])

  let init(): EvaluatedCoroutines<_,_,_> = 
    use scope = createScope()
    use db = scope.ServiceProvider.GetService<BallerinaContext>()
    db.ABEvents.RemoveRange(db.ABEvents)
    // db.ABs.RemoveRange(db.ABs)
    // db.ABs.Add({ ABId=Guid.NewGuid(); ACount=0; BCount=0; AFailCount=0; BFailCount=0 }) |> ignore
    // db.ABs.Add({ ABId=Guid.NewGuid(); ACount=0; BCount=0; AFailCount=0; BFailCount=0 }) |> ignore
    db.SaveChanges() |> ignore
    db.ChangeTracker.Clear()
    { 
      active = db.ABs.AsNoTracking() |> Seq.toArray |> Seq.map (fun e -> e.ABId) |> Seq.map (fun abId -> (abId, processAB abId)) |> Map.ofSeq;
      waiting = Map.empty;
      waitingOrListening = Map.empty;
      listening = Map.empty;
      stopped = Set.empty;
    }      
  let getSnapshot() =
    let scope = createScope()
    let db = scope.ServiceProvider.GetService<BallerinaContext>()
    (), { ABs = AB db (db.ABs); ABEvents = ABEvent db (db.ABEvents) }, db.ABEvents.AsNoTracking().Where(fun e -> e.ProcessingStatus = ABEventStatus.Enqueued).OrderBy(fun e -> (e.CreatedAt, e.ABEventId)).ToArray() |> Seq.map (fun e -> e.ABEventId, e |> absample.efmodels.ABEvent.ToUnion) |> Map.ofSeq, (db, scope)
  let updateEvents (dataSource:BallerinaContext * IServiceScope) events u_e =
    let db = dataSource |> fst
    let events' = u_e events
    let added = events' |> Map.filter (fun e'_id e' -> events |> Map.containsKey e'_id |> not)
                          |> Map.toSeq
                          |> Seq.map snd
                          |> Seq.map (absample.efmodels.ABEvent.FromUnion)
    let removed = events |> Map.filter (fun e_id e -> events' |> Map.containsKey e_id |> not)
                          |> Map.toSeq
                          |> Seq.map snd
                          |> Seq.map (absample.efmodels.ABEvent.FromUnion)
                          |> Seq.map (absample.efmodels.ABEvent.WithRecord (fun e -> { e with ProcessingStatus=ABEventStatus.Processed }))
    // if removed |> Seq.isEmpty |> not then
    //   printfn "events = %A, events' = %A, removed = %A" (events |> Map.values |> Seq.toArray) (events' |> Map.values |> Seq.toArray) (removed |> Seq.toArray)
    db.ABEvents.UpdateRange(removed) |> ignore
    db.ABEvents.AddRange(added) |> ignore
    db.SaveChanges() |> ignore
  let log (dataSource:BallerinaContext * IServiceScope) =
    Console.Clear()
    let db = dataSource |> fst
    printfn "ABs=%A ABEvents=%A" (db.ABs.OrderBy(fun e -> e.ABId).ToArray()) (db.ABEvents.Where(fun e -> e.ProcessingStatus = ABEventStatus.Enqueued).OrderBy(fun e -> e.ABEventId).ToArray())
    ()
  let releaseSnapshot ((db,scope):BallerinaContext * IServiceScope) =
    db.Dispose()
    scope.Dispose()
  Ballerina.CoroutinesRunner.runLoop init getSnapshot updateEvents log releaseSnapshot
