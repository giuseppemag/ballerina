module Ballerina.Sum
open Ballerina.Fun
open System
open System.Threading.Tasks

type Sum<'a,'b> = Left of 'a | Right of 'b with 
  static member map<'a,'b,'c> (f:'a->'c) : Sum<'a,'b> -> Sum<'c,'b> = 
    function | Left a -> a |> f |> Left | Right b -> Right b
  static member swap<'a,'b> (p : Sum<'a,'b>) : Sum<'b,'a> = 
    match p with | Left a -> Right a | Right b -> Left b
  static member mapRight<'a,'b,'c> (f:'b->'c) : Sum<'a,'b> -> Sum<'a,'c> = 
    Sum.swap >> Sum.map f >> Sum.swap
  static member map2<'a,'b,'a1,'b1> (f:'a->'a1) (g:'b->'b1) = 
    Sum.map f >> Sum.mapRight g
  static member toOption : Sum<'a,'b> -> _ =
    function | Left a -> Some a | _ -> None
  static member fromOption<'a,'b> (rightPlaceholder:Unit -> 'b) : Option<'a> -> Sum<'a,'b> =
    function | Some a -> Left a | _ -> Right(rightPlaceholder())
  static member flatten<'a,'b> (p : Sum<Sum<'a,'b>,'b>) : Sum<'a,'b> =
    match p with
    | Left(Left a) -> Left a
    | Right b | Left(Right b) -> Right b
  static member bind<'a,'b,'c> (k:'a -> Sum<'c,'b>) : Sum<'a,'b> -> Sum<'c,'b> =
    Sum.map<'a,'b,Sum<'c,'b>> k >> Sum.flatten

let inline (<+>) (f:'a -> 'a1) (g:'b -> 'b1) = Sum.map2<'a,'b,'a1,'b1> f g

type SumBuilder() = 
  member _.Throw(e) = 
    Sum.Right e
  member _.Return(result:'a) = 
    Sum.Left result
  member opt.ReturnFrom(result:Option<_>) = 
    result
  member _.Yield(result:'a) = 
    Sum.Left result
  member _.Bind(p, k) = 
    Sum.bind k p
  member _.Combine(p, k) = 
    Sum.bind (fun _ -> k) p
  member inline _.Any<'a,'b when 'b : (static member Concat:'b * 'b -> 'b) and 'b:(static member Zero:Unit -> 'b)>(ps:List<Sum<'a,'b>>) =
    let merge:Sum<'a,'b> -> Sum<'a,'b> -> Sum<'a,'b> = 
      function
      | Left a -> fun _ -> Left a
      | Right b1 ->
        function 
        | Left a -> Left a 
        | Right b2 -> Right ('b.Concat(b1,b2))
    ps |> Seq.fold merge (Right ('b.Zero()))
  // member _.All(ps:List<Coroutine<'a, 's, 'c, 'e>>) =
  //   Co(fun _ -> CoroutineResult.Any(ps), None, None)
  // member co.For(seq, body) =
  //   let seq:seq<Option<_>> = seq |> Seq.map body
  //   seq |> Seq.fold (fun acc p -> co.Combine(acc, p)) (co.Return())
  member sum.Delay p = 
    sum.Bind ((sum.Return ()), p)

let sum = SumBuilder()

