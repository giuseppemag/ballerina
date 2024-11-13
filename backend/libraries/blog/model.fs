namespace Blogs
open System

[<CLIMutable>]
type Blog = { BlogId:Guid; Url:string; Posts:List<Post>; Tags:List<Tag> }
and [<CLIMutable>] Post = { PostId:Guid; Title:string; Content:string; BlogId:Guid; Blog:Blog }
and TagUnion = Lifestyle of {| TagId:Guid |} | Interview of {| TagId:Guid; Name:string; Surname:string |}



and [<AbstractClass>] Tag() = 
  member val TagId = Guid.Empty with get, set
  static member ToUnion (tag:Tag) = 
    match tag with
    | :? Lifestyle as l -> l |> Lifestyle.ToRecord |> TagUnion.Lifestyle 
    | :? Interview as i -> i |> Interview.ToRecord |> TagUnion.Interview
    | _ -> failwith "cannot convert Tag to union, a case is missing"
and Lifestyle() =
  inherit Tag()
  static member ToRecord (i:Lifestyle) = {| TagId=i.TagId |}
and Interview(Name:string, Surname:string) =
  inherit Tag()
  member val Name = Name with get, set
  member val Surname = Surname with get, set
  static member ToRecord (i:Interview) = {| TagId=i.TagId; Name=i.Name; Surname=i.Surname |}

