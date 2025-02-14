namespace Ballerina
module Errors =

  open Ballerina.Sum

  type Errors = { Errors:List<string> } with
    static member Singleton e  = { Errors=[e] }
    static member Zero()  = { Errors=[] }
    static member Concat(e1,e2)  = { Errors=e1.Errors @ e2.Errors }
    static member Map f e = { e with Errors=e.Errors |> List.map f  }

  type Map<'k,'v when 'k : comparison> with
    static member tryFindWithError k k_category k_error m = 
      let withError (e:string) (o:Option<'res>) : Sum<'res,Errors> = o |> Sum.fromOption<'res,Errors> (fun () -> Errors.Singleton e)
      m |> Map.tryFind k |> withError (sprintf "Cannot find %s '%s'" k_category k_error)
