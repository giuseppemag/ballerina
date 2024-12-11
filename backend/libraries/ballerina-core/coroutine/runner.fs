module Ballerina.CoroutinesRunner
open Ballerina.Coroutines
open System
open System.Threading

let runLoop init getSnapshot updateEvents log releaseSnapshot = 
  let mutable initialEvals = init()
  let mutable lastT = DateTime.Now
  while true do
    Thread.Sleep(500)

    let now = DateTime.Now
    let dT = now - lastT
    lastT <- now
    // TODO: restore
    let evals = initialEvals //jsonSerializer.UnPickleOfString<EvaluatedCoroutines<{| counter:int |},Unit>>(File.ReadAllText("evals.json"))
    let resumedWaiting, stillWaiting = evals.waiting |> Map.partition (fun _ v -> v.Until <= now) 
    let active = (evals.active |> Seq.map (fun a -> a.Key, a.Value) |> Seq.toList) @ (resumedWaiting |> Seq.map (fun w -> (w.Key, w.Value.P)) |> Seq.toList) |> Map.ofSeq
    let state,context,events,dataSource = getSnapshot()
    let (evals', u_s, u_e) = evalMany (active) (state, context, events, dT)
    match u_e with
    | Some u_e ->
      do updateEvents dataSource events u_e
      ()
    | _ -> ()
    match u_s with
    | Some u_s -> () // the state here is not really a state, no update to perform          
    | None -> ()
    let newWaiting = evals'.waiting |> Seq.map (fun w -> w.Key,w.Value) |> Seq.toList
    let newWaiting = newWaiting @ (stillWaiting |> Seq.map (fun w -> w.Key,w.Value) |> Seq.toList)
    let evals' = { evals' with waiting = newWaiting |> Map.ofSeq }
    initialEvals <- evals' // TODO: remove
    // TODO: restore
    // let text = jsonSerializer.PickleToString evals'
    // File.WriteAllText("evals.json", text)
    do log dataSource
    // do printfn "%d coroutines = %A" (System.Random().Next() % 10) (initialEvals.active |> Seq.sortBy (fun c -> c.Key) |> Seq.toArray)
    releaseSnapshot dataSource