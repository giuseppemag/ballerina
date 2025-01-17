module OAuth.Models
open System
open System.Threading.Tasks

type OAuthError = unit

type OAuthContext<'accessToken, 'refreshToken> =
  {
    GetToken: unit -> Task<Choice<OAuthError, 'accessToken * 'refreshToken>>
    SaveAccessToken: 'accessToken -> Task<unit>
    RefreshToken: 'refreshToken -> Task<Choice<OAuthError, 'accessToken * 'refreshToken>>
    GetExpiration: 'accessToken -> TimeSpan
  }