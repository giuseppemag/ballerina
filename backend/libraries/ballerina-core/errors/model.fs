namespace Ballerina
module Errors =

  open Ballerina.Collections.Sum
  open Ballerina.State.WithError
  open Ballerina.Core.String
  open System
  open Ballerina.Collections.NonEmptyList

  type Errors = { Errors:NonEmptyList<string> } with
    static member Singleton e  = { Errors=NonEmptyList.One e }
    static member Concat(e1,e2)  = { Errors=NonEmptyList.OfList(e1.Errors.Head, e1.Errors.Tail @ (e2.Errors |> NonEmptyList.ToList)) }
    static member Map f e = { e with Errors=e.Errors |> NonEmptyList.map f  }
    static member Print (inputFile:string) (e:Errors) =
      do Console.WriteLine $"Errors when processing {inputFile}"
      do Console.ForegroundColor <- ConsoleColor.Red
      for error in e.Errors do
        do Console.WriteLine error
      do Console.ResetColor()

  type Map<'k,'v when 'k : comparison> with
    static member tryFindWithError k k_category k_error m = 
      let withError (e:string) (o:Option<'res>) : Sum<'res,Errors> = o |> Sum.fromOption<'res,Errors> (fun () -> Errors.Singleton e)
      m |> Map.tryFind k |> withError (sprintf "Cannot find %s '%s'" k_category k_error)


  type SumBuilder with
    member sum.WithErrorContext err =
      sum.MapError(Errors.Map(String.appendNewline err))

  type StateBuilder with
    member state.WithErrorContext err =
      state.MapError(Errors.Map(String.appendNewline err))
