module Ballerina.Errors

open Ballerina.Sum

type Errors = { Errors:List<string> } with
  static member Singleton e  = { Errors=[e] }
  static member Zero()  = { Errors=[] }
  static member Concat(e1,e2)  = { Errors=e1.Errors @ e2.Errors }
let inline withError (e:string) (o:Option<'res>) : Sum<'res,Errors> = o |> Sum.fromOption<'res,Errors> (fun () -> Errors.Singleton e)


type Map<'k,'v when 'k : comparison> with
  static member tryFindWithError k k_category k_error m = m |> Map.tryFind k |> withError (sprintf "Cannot find %s '%s'" k_category k_error)
