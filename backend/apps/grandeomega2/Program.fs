namespace grandeomega2

#nowarn "20"

open Blogs
open System
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
open Migrations

module Program =
  type PositionOptions() = 
    member val Title:string = "" with get, set
    member val Name:string = "" with get, set
    static member Position = "Position"
    override p.ToString() = $"title={p.Title} name={p.Name}"

  let Counter = {| 
    updaters={| 
      counter=fun u (s:{| counter:int |}) -> 
        {| s with counter = u(s.counter) |} 
      |} 
    |}
  let mutable state = {| counter=0 |}
  let p:Coroutine<Unit, {| counter:int |}, Unit> = 
    co{
      wait (TimeSpan.FromSeconds 1.0)
      do! co.SetState (Counter.updaters.counter(fun x -> x + 1))
      wait (TimeSpan.FromSeconds 2.0)
      do! co.SetState (Counter.updaters.counter(fun x -> x + 2))
    } |> co.Repeat
  let initialEvals : EvaluatedCoroutines<_,_> = { 
    active = Map.empty |> Map.add (Guid.NewGuid()) p;
    waiting = Map.empty;
    waitingOrListening = Map.empty;
    listening = Map.empty;
    stopped = Set.empty;
  }

  open Newtonsoft.Json
  open MBrace.FsPickler
  open MBrace.FsPickler.Json
  open Microsoft.AspNetCore.Mvc
  open Microsoft.AspNetCore.Http.Json
  open System.Text.Json
  open System.Text.Json.Serialization

  let jsonSerializer = FsPickler.CreateJsonSerializer(indent = false)
  let text = jsonSerializer.PickleToString initialEvals
  File.WriteAllText("evals.json", text)

  Console.Clear()
  let mutable lastT = DateTime.Now
  let start = DateTime.Now
  while false do
    let now = DateTime.Now
    let dT = now - lastT
    lastT <- now
    let evals = jsonSerializer.UnPickleOfString<EvaluatedCoroutines<{| counter:int |},Unit>>(File.ReadAllText("evals.json"))
    let resumedWaiting, stillWaiting = evals.waiting |> Map.partition (fun _ v -> v.Until <= now) 
    let active = (evals.active |> Map.values |> Seq.toList) @ (resumedWaiting |> Seq.map (fun w -> w.Value.P) |> Seq.toList) |> Seq.map (fun p -> Guid.NewGuid(), p) |> Map.ofSeq
    let (evals', u_s, u_e) = evalMany (active) (state, Set.empty, dT)
    match u_s with
    | Some u_s -> 
      state <- u_s state
    | None -> ()
    let newWaiting = evals'.waiting |> Seq.map (fun w -> w.Value) |> Seq.map (fun v -> Guid.NewGuid(), v) |> Seq.toList
    let newWaiting = newWaiting @ (stillWaiting |> Seq.map (fun w -> w.Value) |> Seq.map (fun v -> Guid.NewGuid(), v) |> Seq.toList)
    let evals' = { evals' with waiting = newWaiting |> Map.ofSeq }
    let text = jsonSerializer.PickleToString evals'
    File.WriteAllText("evals.json", text)
    printf "\r%A(%.1f)                                               " state ((now - start)).TotalSeconds

  let context = new BloggingContext();
  if context.Blogs.Count() = 0 then
    do context.Blogs.Add({ BlogId=Guid.NewGuid(); Url = "www.myblog.com"; Posts = []; Tags = [] })
    do context.SaveChanges()
  if context.Tags.Count() = 0 then
    do context.Tags.Add(new Interview("Albert", "Sanders"))
    do context.Tags.Add(new Lifestyle())
    do context.SaveChanges()

  // let tmp = context.Users.Where(<@ fun (u:Users.User) -> u.Active @>)

  open System.Linq.Expressions
  /// Converts a F# Expression to a LINQ Lambda
  let toLambda (exp:Quotations.Expr) =
      let linq = exp |> Microsoft.FSharp.Linq.RuntimeHelpers.LeafExpressionConverter.QuotationToExpression :?> MethodCallExpression
      linq.Arguments.[0] :?> LambdaExpression

  /// Converts a Lambda quotation into a Linq Lamba Expression with 1 parameter
  let ToLinq (exp : Quotations.Expr<'a -> 'b>) =
      let lambda = toLambda exp
      Expression.Lambda<Func<'a, 'b>>(lambda.Body, lambda.Parameters)
  let tmp:Quotations.Expr<Users.User -> bool> = <@ fun (u:Users.User) -> u.Active @>
  let activeUsers = context.Users.Where(tmp |> ToLinq)
  
  printfn "%A" (context.Blogs.Where(fun b -> b.Url.Contains("goo")).ToArray())
  printfn "%A" (context.Tags |> Seq.map Tag.ToUnion |> Seq.toArray)

  let exitCode = 0

  type ABEvent = A of {| ABEventId:Guid; AValue:int |} | B of {| ABEventId:Guid; BValue:int |}

  [<EntryPoint>]
  let main args =
    let builder = WebApplication.CreateBuilder(args)
    builder.Services.Configure<PositionOptions>(builder.Configuration.GetSection(PositionOptions.Position))
    builder.Services.Configure<JsonOptions>(fun (options:JsonOptions) -> 
      JsonFSharpOptions.Default().AddToJsonSerializerOptions(options.SerializerOptions) |> ignore
    )

    // let position =
    //     builder.Configuration.GetSection(PositionOptions.Position)
    //         .Get<PositionOptions>();
    // Console.WriteLine(position)

    let app = builder.Build()
    // let position = app.Services.GetService<IOptions<PositionOptions>>()    
    // Console.WriteLine(position.Value)

    // app.UseHttpsRedirection()

    // app.UseAuthorization()    
    app.MapGet("/positionOptions", new Func<_>(fun () -> app.Configuration.Get<PositionOptions>()))
    app.MapGet("/AEvent", new Func<_>(fun () -> ABEvent.A({| ABEventId=Guid.NewGuid(); AValue=111 |})))
    app.MapGet("/BEvent", new Func<_>(fun () -> ABEvent.B({| ABEventId=Guid.NewGuid(); BValue=222 |})))
    app.MapPost("/ABEvent", new Func<_,_>(fun ([<FromBody>] msg: ABEvent) -> msg))
    app.MapPost("/add", new Func<_,_>(fun ([<FromBody>] msg: {| value: int |}) -> {| value = msg.value + 1 |}))

    app.Run("http://localhost:5000")

    exitCode
