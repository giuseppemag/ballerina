module Ballerina.Option
open Ballerina.Fun
open System
open System.Threading.Tasks

type OptionBuilder() = 
  member _.Zero() = 
    Option.None
  member _.Return(result:'a) = 
    Option.Some result
  member opt.ReturnFrom(result:Option<_>) = 
    result
  member _.Yield(result:'a) = 
    Option.Some result
  member _.Bind(p, k) = 
    Option.bind k p
  member _.Combine(p, k) = 
    Option.bind (fun _ -> k) p
  member _.Any(ps:List<Option<'a>>) =
    ps |> Seq.filter(function | Some _ -> true | _ -> false) |> Seq.tryHead
  // member _.All(ps:List<Coroutine<'a, 's, 'c, 'e>>) =
  //   Co(fun _ -> CoroutineResult.Any(ps), None, None)
  // member co.For(seq, body) =
  //   let seq:seq<Option<_>> = seq |> Seq.map body
  //   seq |> Seq.fold (fun acc p -> co.Combine(acc, p)) (co.Return())
    
let option = OptionBuilder()