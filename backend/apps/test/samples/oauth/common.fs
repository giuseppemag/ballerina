module OAuth.Common

open System.Text.Json.Serialization
open System.Net.Http

type OAuthResponse =
  {
    [<JsonPropertyName("access_token")>]
    AccessToken : string
    [<JsonPropertyName("expires_in")>]
    Duration : int64
    [<JsonPropertyName("refresh_token")>]
    RefreshToken : string
  }

let httpClient = new HttpClient()