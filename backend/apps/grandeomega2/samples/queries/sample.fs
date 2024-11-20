module grandeomega2.samples.queries

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
  open System.Linq.Expressions
  open Newtonsoft.Json
  open MBrace.FsPickler
  open MBrace.FsPickler.Json
  open Microsoft.AspNetCore.Mvc
  open Microsoft.AspNetCore.Http.Json
  open System.Text.Json
  open System.Text.Json.Serialization

  // let sample() = 
  //   let context = new BloggingContext();
  //   if context.Blogs.Count() = 0 then
  //     do context.Blogs.Add({ BlogId=Guid.NewGuid(); Url = "www.myblog.com"; Posts = []; Tags = [] }) |> ignore
  //     do context.SaveChanges() |> ignore
  //   if context.Tags.Count() = 0 then
  //     do context.Tags.Add(new Interview("Albert", "Sanders")) |> ignore
  //     do context.Tags.Add(new Lifestyle()) |> ignore
  //     do context.SaveChanges() |> ignore

  //   /// Converts a F# Expression to a LINQ Lambda
  //   let toLambda (exp:Quotations.Expr) =
  //       let linq = exp |> Microsoft.FSharp.Linq.RuntimeHelpers.LeafExpressionConverter.QuotationToExpression :?> MethodCallExpression
  //       linq.Arguments.[0] :?> LambdaExpression

  //   /// Converts a Lambda quotation into a Linq Lamba Expression with 1 parameter
  //   let ToLinq (exp : Quotations.Expr<'a -> 'b>) =
  //       let lambda = toLambda exp
  //       Expression.Lambda<Func<'a, 'b>>(lambda.Body, lambda.Parameters)
  //   let tmp:Quotations.Expr<Users.User -> bool> = <@ fun (u:Users.User) -> u.Active @>
  //   let activeUsers = context.Users.Where(tmp |> ToLinq)
    
  //   printfn "%A" (context.Blogs.Where(fun b -> b.Url.Contains("goo")).ToArray())
  //   printfn "%A" (context.Tags |> Seq.map Tag.ToUnion |> Seq.toArray)
