module Ballerina.Collections.Map

type Map<'k,'v when 'k : comparison> with 
  static member merge<'v2>
    (m2:Map<'k,'v2>) (deduplicate:'v -> 'v2 -> 'v) (m1:Map<'k,'v>) : Map<'k,'v> =
      match m2 |> Seq.tryHead with
      | None -> m1
      | Some(first') -> 
        match m1 |> Map.tryFind first'.Key with
        | None -> m1
        | Some(firstValue) -> 
          let m1 = m1 |> Map.add first'.Key (deduplicate firstValue first'.Value)
          m1 |>  Map.merge m2 deduplicate

