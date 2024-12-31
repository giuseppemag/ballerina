module Ballerina.Collections.Map

type Map<'k,'v when 'k : comparison> with 
  static member merge
    (m2:Map<'k,'v>) (deduplicate:'v -> 'v -> 'v) (m1:Map<'k,'v>) : Map<'k,'v> =
      match m2 |> Seq.tryHead with
      | None -> m1
      | Some(first') -> 
        match m1 |> Map.tryFind first'.Key with
        | None -> m1 |> Map.add first'.Key first'.Value
        | Some(firstValue) -> 
          let m1 = m1 |> Map.add first'.Key (deduplicate firstValue first'.Value)
          m1 |>  Map.merge m2 deduplicate

  static member mergeMany
    ((+):'v -> 'v -> 'v) (maps:seq<Map<'k,'v>>) : Map<'k,'v> =
      maps |> Seq.fold (fun m1 m2 -> m1 |> Map.merge m2 (+)) Map.empty
