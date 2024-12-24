
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
  open abcdsample.eventLoop
  open absample.eventLoop
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
        (fun db -> abrepos.ef.AB db db.ABs),
        (fun db -> abrepos.ef.ABEvent db db.ABEvents), 
        (fun db -> abrepos.ef.AEvent db db.AEvents), 
        (fun db -> abrepos.ef.BEvent db db.BEvents))
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
      | LaunchMode.abcdjobs -> abcdEventLoop ()
      | _ -> printfn "no mode selected, exiting"
      ), mode)
    do rootCommand.Invoke(args) |> ignore

    exitCode
