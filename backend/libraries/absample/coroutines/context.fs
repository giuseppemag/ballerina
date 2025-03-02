module absample.coroutines.context

open Ballerina.CRUD
open absample.models

type ABContext =
  { ABs: Crud<AB>
    ABEvents: Crud<ABEvent> }
