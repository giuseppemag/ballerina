module absample.coroutines.context
open Ballerina.CRUD

type ABContext = { ABs:Crud<absample.efmodels.AB>; ABEvents:Crud<absample.efmodels.ABEvent> }
