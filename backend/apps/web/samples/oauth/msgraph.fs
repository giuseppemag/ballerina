module Oauth.MSGraph

open System
open OAuth.Coroutine
open OAuth.Models
open Ballerina.Coroutines
open System.Net.Http
open System.Net
open System.Text.Json
open System.Text.Json.Serialization

let random = new Random()
let httpClient = new HttpClient()

let init(): EvaluatedCoroutines<_,_,_> =
  {
    active = Map.empty.Add(Guid.NewGuid(), processToken (TimeSpan.FromMinutes(1.)))
    waiting = Map.empty
    waitingOrListening = Map.empty
    listening = Map.empty
    stopped = Set.empty
  }

type MSOauthResponse =
  {
    [<JsonPropertyName("access_token")>]
    AccessToken : string
    [<JsonPropertyName("expires_in")>]
    Duration : int64
  }

type EntraUser = 
  {
    [<JsonPropertyName("id")>]
    Id : Guid
    [<JsonPropertyName("mail")>]
    Mail : string
    [<JsonPropertyName("displayName")>]
    Name : string
  }

type OdataUserResult =
  {
    [<JsonPropertyName("value")>]
    Value : EntraUser[]
  }

let requestToken tenant clientId secret =
  let url = $"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
  let content = new FormUrlEncodedContent(
    Map.empty.Add("client_id", clientId.ToString()).Add("client_secret", secret).Add("scope", "https://graph.microsoft.com/.default").Add("grant_type", "client_credentials").Add("response_type", "code")
  )
  let request = new HttpRequestMessage(HttpMethod.Post, url)
  request.Content <- content
  let response = httpClient.SendAsync(request).Result
  match response.StatusCode with
  | HttpStatusCode.OK ->
      let resultContent = response.Content.ReadAsStringAsync().Result
      let deserializedContent = JsonSerializer.Deserialize<MSOauthResponse>(resultContent)
      Choice2Of2({| AccessToken = deserializedContent.AccessToken; Duration = deserializedContent.Duration |}, ())        
  | _ -> Choice1Of2()

let getUsers (limit : int) (accessToken : string) =
  let url = $"https://graph.microsoft.com/v1.0/users?$select=id, mail, displayName&$top={limit}"
  let request = new HttpRequestMessage(HttpMethod.Get, url)
  request.Headers.Add("Authorization", $"Bearer {accessToken}")
  let response = httpClient.SendAsync(request).Result
  match response.StatusCode with
  | HttpStatusCode.OK ->
      let resultContent = response.Content.ReadAsStringAsync().Result
      let deserializedContent = JsonSerializer.Deserialize<OdataUserResult>(resultContent)
      Choice2Of2 (deserializedContent.Value)
  | _ -> Choice1Of2 response.StatusCode


let getSnapshot (tenant : Guid) (clientId : Guid) secret =
  fun () ->
    (),
    {
      GetToken = 
        fun () ->
          do printfn "Getting Access Token..." 
          do Console.ReadLine() |> ignore
          requestToken tenant clientId secret  
      SaveAccessToken = 
        fun accessToken ->
          do printfn "Getting Entra users: %A" accessToken 
          let getResult = getUsers 50 accessToken.AccessToken
          match getResult with
          | Choice1Of2 statusCode -> 
              do printfn "API error: %A" statusCode
          | Choice2Of2 users ->
              do printfn "%A" (users |> Array.toList)
          do Console.ReadLine() |> ignore
      RefreshToken =
        fun _ ->
          do printfn "Refreshings with Refresh Token: %A" ()
          do Console.ReadLine() |> ignore
          requestToken tenant clientId secret
      GetExpiration =
        fun accessToken -> TimeSpan.FromSeconds(30.)
    },
    Map.empty,
    ()

let msGraphEventLoop (tenant : Guid) (clientId : Guid) (secret : string) =
  Ballerina.CoroutinesRunner.runLoop init (getSnapshot tenant clientId secret) ((fun _ -> ())) (fun _ _ _ -> ()) (fun () -> Console.Clear(); printfn "Tick: %A" (DateTime.UtcNow)) (fun _ -> ())
