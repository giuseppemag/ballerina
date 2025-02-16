namespace Ballerina.Core
module String =

  open System 
  open System.Text.RegularExpressions

  type String with
    member self.ReasonablyClamped = Regex.Replace(self.Substring(0, min self.Length 50).ReplaceLineEndings(" "), " +", " ") + "..."
    static member append (s2:string) s1 = s1 + s2
    static member appendNewline s2 s1 = s1 + "\n" + s2
    static member ToPascalCase (separators:char array) (self:String) =
      let elements = self.Split separators
      let elements = elements |> Seq.map String.ToFirstUpper
      elements |> Seq.fold (+) String.Empty
    member self.ToFirstUpper =  
      if self |> String.IsNullOrEmpty then self
      else String.Concat(self[0].ToString().ToUpper(), self.AsSpan(1))
    static member ToFirstUpper (self:String) = self.ToFirstUpper

