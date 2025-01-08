module abcdsample.eventLoop
open System
open System.Linq
open positions.model
open Ballerina.Fun
open Ballerina.Coroutines
open Ballerina.BusinessRules
open Ballerina.BusinessRuleExecution
open context
open Ballerina.BusinessRuleTransitiveExecution

let abcdEventLoop() = 
  let mutable context:Context = init_abcdContext()

  let processABCD : Coroutine<Unit, JobsState, Context, ABCDEvent> = 
    co.Repeat(
      co{
        let! e = co.On(
          function 
          | ABCDEvent.SetField(SetFieldEvent.SingletonIntFieldEvent { Target = target; Self = self })
          | ABCDEvent.SetField(SetFieldEvent.SingletonRefFieldEvent { Target = target; Self = self }) -> 
            Option.Some ({| Self=self; Target=target |})
          | discarded -> 
            Option.None)
        do! co.Wait(TimeSpan.FromSeconds 0.0)
        let! context = co.GetContext()
        let vars:Vars = 
          [
            { VarName = "this" }, (e.Self.EntityDescriptorId, e.Target)
          ] |> Map.ofList
        let! modifiedFields = co.Do(fun ctx -> execute ctx.Schema vars e.Self.Assignment)
        do printfn "modifiedFields %A" modifiedFields
        do Console.ReadLine() |> ignore
        do! co.Do(fun ctx -> 
          for vars in modifiedFields do
            match executeRulesTransitively ctx.BusinessRules ctx.Schema Map.empty vars with
            | Some() -> ()
            | None -> printfn "Error, rule execution resulted in a possible loop that was interrupted")
      }
    )

  let init(): EvaluatedCoroutines<_,_,_> =         
    { 
      active = [Guid.NewGuid(), processABCD] |> Map.ofSeq;
      waiting = Map.empty;
      waitingOrListening = Map.empty;
      listening = Map.empty;
      stopped = Set.empty;
    }      
  let getSnapshot() =
    // state, context, active events, () [= Db x Scope]
    { edits = Set.empty }, 
    context, 
    context.ActiveEvents |> Seq.map (
      function 
      | (ABCDEvent.SetField(SetFieldEvent.SingletonIntFieldEvent inner)) as e -> inner.Self.FieldEventId, e
      | (ABCDEvent.SetField(SetFieldEvent.SingletonRefFieldEvent inner)) as e -> inner.Self.FieldEventId, e
      | (ABCDEvent.SetField(SetFieldEvent.IntFieldEvent inner)) as e -> inner.Self.FieldEventId, e)
      |> Map.ofSeq, 
    ()
  let updateEvents (dataSource:Unit) events u_e =
    let events' = u_e events
    let added =   events' |> Map.filter (fun e'_id e' -> events |> Map.containsKey e'_id |> not)
                          |> Map.values
                          |> List.ofSeq
    let removed = events |> Map.filter (fun e_id e -> events' |> Map.containsKey e_id |> not)
                          |> Map.toSeq
                          |> Seq.map snd
                          |> Set.ofSeq
    context <- {
      context with
        ActiveEvents = (context.ActiveEvents |> List.filter (fun e -> removed |> Set.contains e |> not)) @ added 
      }
    ()
  let updateState u_s = 
    let newState = u_s { edits = Set.empty }
    // run the whole process of business rules based on the edits, with loop avoidance
    ()
  let log (dataSource:Unit) =
    Console.Clear() |> ignore
    for ab in context.ABs() |> Map.values do
      printf """{|
  Id = %s
  A1 = %d; B1 = %d; Total1 = %d;
    CD = {| Id = %s; C = %d; D = %d |}; 
  А2 = %d; Б2 = %d; Total2 = %d;
  Α3 = %d; Β3 = %d; Σ3 = %d;
|}
"""
        (ab.ABId.ToString().Substring(0, 4))
        ab.A1 ab.B1 ab.Total1 ((context.CDs()).[ab.CDId].CDId.ToString().Substring(0,4)) (context.CDs()).[ab.CDId].C (context.CDs()).[ab.CDId].D 
        ab.А2 ab.Б2 ab.Весь2
        ab.Α3 ab.Β3 ab.Σ3
      
  let releaseSnapshot (_:Unit) =
    ()
  Ballerina.CoroutinesRunner.runLoop init getSnapshot updateState updateEvents log releaseSnapshot
    
  ()