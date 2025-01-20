
namespace grandeomega2

#nowarn "20"

open System
open System.CommandLine
open Microsoft.AspNetCore.Builder
open Microsoft.Extensions.Configuration
open Microsoft.Extensions.DependencyInjection
open Migrations
open Microsoft.EntityFrameworkCore
open Microsoft.AspNetCore.Http.Json
open System.Text.Json.Serialization
open absample.repositories
open absample.endpoints
open positions.model
open FSharp.SystemTextJson.Swagger

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
  | testunions = 4

  type MyBool = True | False
  type EFOrError = Inl of EF | Inr of string

  [<EntryPoint>]
  let main args =
    let builder = WebApplication.CreateBuilder(args)
    builder.Services.Configure<PositionOptions>(builder.Configuration.GetSection(PositionOptions.Position))
    let fsOptions = JsonFSharpOptions() // setup options here 
    builder.Services.Configure<JsonOptions>(fun (options:JsonOptions) -> 
      options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
      options.SerializerOptions.Converters.Add(JsonFSharpConverter(fsOptions))
    )

    builder.Services.AddSwaggerForSystemTextJson(fsOptions)

    builder.Services.AddDbContext<BallerinaContext>(fun opt -> 
      opt.UseNpgsql(
        builder.Configuration.GetConnectionString("DbConnection")
        ) |> ignore)
    builder.Services
        .AddEndpointsApiExplorer()
        // .AddSwaggerGen(fun options ->
        //     options.UseOneOfForPolymorphism()
        //     options.SelectDiscriminatorNameUsing(fun _ -> "$type")
        //   )

    // app.UseHttpsRedirection()
    let app = builder.Build()
    app .UseSwagger()
        .UseSwaggerUI()
    
    let testunions() = 
      app.MapPost("/TestUnions", new Func<MyBool, EFOrError>(fun input -> 
        let r = System.Random()
        if input.IsTrue then
            Inl {
              EFId = Guid.CreateVersion7();
              E = r.Next() % 10;
              F = r.Next() % 10
            }
        else
            Inr "Greetings!"
      )).WithOpenApi() |> ignore
      app.Run("http://localhost:5000")

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
      | LaunchMode.testunions -> testunions()
      | LaunchMode.web -> web()
      | LaunchMode.jobs -> abEventLoop (app.Services.CreateScope)
      | LaunchMode.abcdjobs -> abcdEventLoop ()
      | _ -> printfn "no mode selected, exiting"
      ), mode)
    do rootCommand.Invoke(args) |> ignore

    exitCode
