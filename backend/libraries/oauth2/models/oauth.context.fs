module OAuth.Models
open System

type OAuthError = unit

type OAuthContext<'accessToken, 'refreshToken> =
  {
    GetToken: unit -> Choice<OAuthError, 'accessToken * 'refreshToken>
    SaveAccessToken: 'accessToken -> unit
    RefreshToken: 'refreshToken -> Choice<OAuthError, 'accessToken * 'refreshToken>
    GetExpiration: 'accessToken -> TimeSpan
  }