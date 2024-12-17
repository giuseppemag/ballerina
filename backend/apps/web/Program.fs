
namespace grandeomega2

#nowarn "20"

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
open positions.model

module Program =
  open Program
  type PositionOptions() = 
    member val Title:string = "" with get, set
    member val Name:string = "" with get, set
    static member Position = "Position"
    override p.ToString() = $"title={p.Title} name={p.Name}"

  // let jsonSerializer = FsPickler.CreateJsonSerializer(indent = false)
  // let text = jsonSerializer.PickleToString initialEvals
  // File.WriteAllText("evals.json", text)
  //   let evals = jsonSerializer.UnPickleOfString<EvaluatedCoroutines<{| counter:int |},Unit>>(File.ReadAllText("evals.json"))
  //   ...
  //   let text = jsonSerializer.PickleToString evals'
  //   File.WriteAllText("evals.json", text)

  let exitCode = 0

  type LaunchMode = 
  | none = 0
  | web = 1
  | jobs = 2
  | abcdjobs = 3

  [<EntryPoint>]
  let main args =
    let builder = WebApplication.CreateBuilder(args)
    builder.Services.Configure<PositionOptions>(builder.Configuration.GetSection(PositionOptions.Position))
    builder.Services.Configure<JsonOptions>(fun (options:JsonOptions) -> 
      options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
    )

    builder.Services.AddDbContext<BallerinaContext>(fun opt -> 
      opt.UseNpgsql(
        builder.Configuration.GetConnectionString("DbConnection")
        ) |> ignore)
    builder.Services
        .AddEndpointsApiExplorer()
        .AddSwaggerGen(fun options ->
            options.UseOneOfForPolymorphism()
            options.SelectDiscriminatorNameUsing(fun _ -> "$type")
          )

    // app.UseHttpsRedirection()
    let app = builder.Build()

    let web() = 
      app.UseABSample<BallerinaContext>(
        (fun db -> AB db db.ABs),
        (fun db -> ABEvent db db.ABEvents), 
        (fun db -> AEvent db db.AEvents), 
        (fun db -> BEvent db db.BEvents))
        .UseSwagger()
        .UseSwaggerUI()
      app.Run("http://localhost:5000")

    let mode = new Option<LaunchMode>(
            name= "mode",
            description= "Start the application in web or jobs mode.");

    let rootCommand = new RootCommand("Sample app for System.CommandLine");
    rootCommand.AddOption(mode)

    let abcdEventLoop() = 
      let mutable ABs:Map<Guid,AB> = Map.empty
      let mutable CDs:Map<Guid,CD> = Map.empty
      let schema:Schema = {
        AB = {| 
          Entity = { EntityDescriptorId = Guid.NewGuid() }
          ACount = { Self = { FieldDescriptorId=Guid.NewGuid() }; Update = fun (One entityId) updater -> ABs <- ABs |> Map.change entityId (Option.map (fun e -> { e with ACount = updater(e.ACount)} ))}; 
          BCount = { Self = { FieldDescriptorId=Guid.NewGuid() }; Update = fun (One entityId) updater -> ABs <- ABs |> Map.change entityId (Option.map (fun e -> { e with BCount = updater(e.BCount)} )) }; 
          TotalABC = { Self = { FieldDescriptorId=Guid.NewGuid() }; Update = fun (One entityId) updater -> ABs <- ABs |> Map.change entityId (Option.map (fun e -> { e with TotalABC = updater(e.TotalABC)} )) }; 
          CD = { 
            Self = { FieldDescriptorId=Guid.NewGuid() }; 
            Update = fun entitiesIdentifier updater -> 
              match entitiesIdentifier with 
              | All -> 
                ABs <- ABs |> Map.map (fun key -> (fun e -> { e with CD = CDs.[updater(e.CD.CDId)]} )) 
              | Multiple abIds ->  
                ABs <- ABs |> Map.map (fun key -> if abIds |> Set.contains key then (fun e -> { e with CD = CDs.[updater(e.CD.CDId)]}) else id)
            };  
          |}
        CD = {| 
          Entity = { EntityDescriptorId = Guid.NewGuid() }
          CCount = { Self = { FieldDescriptorId=Guid.NewGuid() }; 
          Update = fun (One entityId) updater -> CDs <- CDs |> Map.change entityId (Option.map (fun e -> { e with CCount = updater(e.CCount)} ))};
        |}
      }
      let createCD id = 
        {
          CDId = id; Metadata = { EntityMetadataId = Guid.NewGuid(); Approval = false; Entity = schema.CD.Entity }
          CCount = 3; CCountMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = schema.CD.CCount }
        }
      CDs <- 
        [
          createCD (Guid("d8ff0920-2b47-499f-9f7b-cb07a1f8f3a4"))
          createCD (Guid("69f182db-84ba-4e81-91c5-d3becd029a6b"))
        ] |> Seq.map (fun e -> (e.CDId, e)) |> Map.ofSeq
      let createAB id = 
          {
            ABId = id; Metadata = { EntityMetadataId = Guid.NewGuid(); Approval = false; Entity = schema.CD.Entity }
            ACount = 1 ; ACountMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = schema.AB.ACount }
            BCount = 2 ; BCountMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = schema.AB.BCount }
            TotalABC = 0 ; TotalABCMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = schema.AB.TotalABC }
            CD = CDs |> Map.values |> Seq.randomChoice; CDMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = schema.AB.CD }
          }
      ABs <- 
        [
          createAB (Guid("8fba2a7c-e2da-43bd-b8ee-ddaa774d081d"))
          createAB (Guid("91620c12-cd9e-4e66-9df3-58f4b1a50b1f"))
        ] |> Seq.map (fun e -> (e.ABId, e)) |> Map.ofSeq

      let totalABC:BusinessRule = 
        { 
          BusinessRuleId = Guid.NewGuid(); 
          Name = "Total = A+B+C"; Priority = BusinessRulePriority.System; 
          Entity = schema.AB.Entity
          Condition = Expr.Value (Value.ConstBool true); 
          Actions=[
            { 
              Variable = (Expr.VarLookup "this") => (Expr.Value(Value.Field schema.AB.TotalABC.Self))
              Value=((Expr.VarLookup "this") => Expr.Value(Value.Field schema.AB.ACount.Self))
                + ((Expr.VarLookup "this") => Expr.Value(Value.Field schema.AB.BCount.Self))
                + (((Expr.VarLookup "this") => Expr.Value(Value.Field schema.AB.CD.Self)) => Expr.Value(Value.Field schema.CD.CCount.Self))
            }
          ]
        }
      let businessRules = 
        [
          totalABC
        ] |> Seq.map (fun br -> br.BusinessRuleId, br) |> Map.ofSeq

      let mutable context:Context = {
        ABs = (fun () -> ABs)
        CDs = (fun () -> CDs)
        ActiveEvents = [] // :List<FieldEvent>; 
        PastEvents = [] // :List<FieldEvent>;
        BusinessRules = businessRules
        Schema = schema
      }

      let eval (context:Context) (vars:Vars) =
        let rec eval (e:positions.model.Expr) : positions.model.Value option =
          match e with
          | positions.model.Expr.VarLookup v when vars |> Map.containsKey v -> 
            Option.Some(Value.Var (vars.[v]))
          | positions.model.Expr.Binary(Dot, e1, e2) -> 
            match eval e1, eval e2 with
            | Option.Some(Value.Var (entityDescriptor, One entityId)), Option.Some(Value.Field field) ->
              let ABs = context.ABs()
              let CDs = context.CDs()
              if entityDescriptor.EntityDescriptorId = context.Schema.AB.Entity.EntityDescriptorId &&
                ABs |> Map.containsKey entityId then
                if field.FieldDescriptorId = context.Schema.AB.ACount.Self.FieldDescriptorId then
                  Option.Some(Value.ConstInt(ABs.[entityId].ACount))
                else if field.FieldDescriptorId = context.Schema.AB.BCount.Self.FieldDescriptorId then
                  Option.Some(Value.ConstInt(ABs.[entityId].BCount))
                else if field.FieldDescriptorId = context.Schema.AB.CD.Self.FieldDescriptorId then
                  let ab = ABs.[entityId]
                  Option.Some(Value.Var(context.Schema.CD.Entity, One ab.CD.CDId))
                else
                  None
              else if entityDescriptor.EntityDescriptorId = context.Schema.CD.Entity.EntityDescriptorId &&
                CDs |> Map.containsKey entityId then
                if field.FieldDescriptorId = context.Schema.CD.CCount.Self.FieldDescriptorId then
                  Option.Some(Value.ConstInt(CDs.[entityId].CCount))
                else
                  None
              else 
                None
            | _ -> None              
          | positions.model.Expr.Value v -> Option.Some v
          | positions.model.Expr.Binary(Plus, e1, e2) -> 
            match eval2AsInt e1 e2 with
            | Option.Some(i1,i2) -> Option.Some(Value.ConstInt(i1+i2))
            | _ -> None
          | e -> 
            printfn "not implemented Expr evaluator for %A" e
            None
        and eval2AsInt e1 e2 = 
          let v1 = eval e1
          let v2 = eval e2
          match v1,v2 with
          | Option.Some(Value.ConstInt i1), Option.Some(Value.ConstInt i2) -> Option.Some(i1,i2)
          | _ -> Option.None
        eval
      let execute (context:Context) (vars:Vars) (assignment:Assignment) =
        match assignment.Variable, eval context vars assignment.Value with
        | Expr.Binary(Dot, e, Expr.Value(Value.Field fieldDescriptor)), Option.Some(v) ->
          match eval context vars e with
          | Option.Some(Value.Var(entityDescriptor, One entityId)) ->
            let ABs = context.ABs()
            let CDs = context.CDs()
            if entityDescriptor.EntityDescriptorId = context.Schema.AB.Entity.EntityDescriptorId then
              if fieldDescriptor.FieldDescriptorId = context.Schema.AB.TotalABC.Self.FieldDescriptorId then
                match v with
                | Value.ConstInt i ->
                  context.Schema.AB.TotalABC.Update (One entityId) (replaceWith i)
                  Option.Some()
                | _ -> None
              else 
                None
            else
              None
          | _ ->
            None
        | _ -> None

      let vars:Vars = 
        [
          "this", (context.Schema.AB.Entity, (context.ABs() |> Map.values |> Seq.head).ABId |> One)
        ] |> Map.ofList

      printfn "%A" (eval context vars totalABC.Actions.Head.Value)
      printfn "%A" (execute context vars totalABC.Actions.Head)
      printfn "%A" (context.ABs() |> Map.values |> Seq.map (fun ab -> {| A = ab.ACount; B = ab.BCount; CD = {| C = ab.CD.CCount |}; Total = ab.TotalABC |}) |> Seq.toArray)
      ()

    rootCommand.SetHandler(Action<_>(fun (mode:LaunchMode) ->
      match mode with
      | LaunchMode.web -> web()
      | LaunchMode.jobs -> abEventLoop (app.Services.CreateScope)
      | LaunchMode.abcdjobs -> abcdEventLoop ()
      | _ -> printfn "no mode selected, exiting"
      ), mode)
    do rootCommand.Invoke(args) |> ignore

    exitCode
