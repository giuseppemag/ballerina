
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

module Program =
  open Program
  open positions.model
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

    rootCommand.SetHandler(Action<_>(fun (mode:LaunchMode) ->
      match mode with
      | LaunchMode.web -> web()
      | LaunchMode.jobs -> abEventLoop (app.Services.CreateScope)
      | _ -> printfn "no mode selected, exiting"
      ), mode)
    do rootCommand.Invoke(args) |> ignore

    let abcdEventLoop() = 
      let mutable AB1 = Guid("8fba2a7c-e2da-43bd-b8ee-ddaa774d081d")
      let mutable AB2 = Guid("91620c12-cd9e-4e66-9df3-58f4b1a50b1f")
      let mutable ABs:Map<Guid,AB> = Map.empty
      let mutable CDs:Map<Guid,CD> = Map.empty
      let schema:Schema = {
        AB = {| 
            ACount = { Self = { FieldDescriptorId=Guid.NewGuid() }; Update = fun (One entityId) updater -> ABs <- ABs |> Map.change entityId (Option.map (fun e -> { e with ACount = updater(e.ACount)} ))}; 
            BCount = { Self = { FieldDescriptorId=Guid.NewGuid() }; Update = fun (One entityId) updater -> ABs <- ABs |> Map.change entityId (Option.map (fun e -> { e with BCount = updater(e.BCount)} ))}; 
            CD = { 
              Self = { FieldDescriptorId=Guid.NewGuid() }; 
              Update = fun entitiesIdentifier updater -> 
                match entitiesIdentifier with 
                | All -> 
                  ABs <- ABs |> Map.map (fun key -> (fun e -> { e with CD = CDs.[updater(e.CD.CDId)]} )) 
                | Some abIds ->  
                  ABs <- ABs |> Map.map (fun key -> if abIds |> Set.contains key then (fun e -> { e with CD = CDs.[updater(e.CD.CDId)]}) else id)
              };  
            |}
        CD = {| 
          CCount = { Self = { FieldDescriptorId=Guid.NewGuid() }; 
          Update = fun (One entityId) updater -> CDs <- CDs |> Map.change entityId (Option.map (fun e -> { e with CCount = updater(e.CCount)} ))};
        |}
      }
      CDs <- 
        [
          {
            CDId = Guid("d8ff0920-2b47-499f-9f7b-cb07a1f8f3a4"); 
            CCount = 0 ; CCountMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = schema.CD.CCount }
          }
          {
            CDId = Guid("69f182db-84ba-4e81-91c5-d3becd029a6b"); 
            CCount = 0 ; CCountMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = schema.CD.CCount }
          }
        ] |> Seq.map (fun e -> (e.CDId, e)) |> Map.ofSeq
      ABs <- 
        [
          {
            ABId = AB1; 
            ACount = 0 ; ACountMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = schema.AB.ACount }
            BCount = 0 ; BCountMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = schema.AB.BCount }
            CD = CDs |> Map.values |> Seq.randomChoice; CDMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = schema.AB.CD }
          }
        ] |> Seq.map (fun e -> (e.ABId, e)) |> Map.ofSeq

      let mutable context:Context = {
        AB1 = (fun () -> ABs.[AB1])
        AB2 = (fun () -> ABs.[AB2])
        CDs = (fun () -> CDs)
        ActiveEvents = [] // :List<FieldEvent>; 
        PastEvents = [] // :List<FieldEvent>;
        BusinessRules = Map.empty;
        Schema = schema
      }
      ()

    exitCode
