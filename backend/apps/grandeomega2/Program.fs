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

  let context = new BloggingContext();
  if context.Blogs.Count() = 0 then
    do context.Blogs.Add({ BlogId=Guid.NewGuid(); Url = "www.myblog.com"; Posts = []; Tags = [] })
    do context.SaveChanges()
  if context.Tags.Count() = 0 then
    do context.Tags.Add(new Interview("Albert", "Sanders"))
    do context.Tags.Add(new Lifestyle())
    do context.SaveChanges()
  printfn "%A" (context.Blogs.Where(fun b -> b.Url.Contains("goo")).ToArray())
  printfn "%A" (context.Tags |> Seq.map Tag.ToUnion |> Seq.toArray)

  let exitCode = 0

  [<EntryPoint>]
  let main args =
    let builder = WebApplication.CreateBuilder(args)
    builder.Services.Configure<PositionOptions>(builder.Configuration.GetSection(PositionOptions.Position))

    // let position =
    //     builder.Configuration.GetSection(PositionOptions.Position)
    //         .Get<PositionOptions>();
    // Console.WriteLine(position)

    let app = builder.Build()
    // let position = app.Services.GetService<IOptions<PositionOptions>>()    
    // Console.WriteLine(position.Value)

    // app.UseHttpsRedirection()

    // app.UseAuthorization()    
    app.MapGet("/", new Func<_>(fun () -> app.Configuration.Get<PositionOptions>()))

    app.Run("http://localhost:5000")

    exitCode
