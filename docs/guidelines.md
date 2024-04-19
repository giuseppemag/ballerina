# Guidelines for writing frontend code
_by Giuseppe Maggiore_

_Introduction_


## The main driving philosophy

_Separation of concerns: rendering, logic, api, etc._
_Separation of domains: nesting and verticals_

### Organizing code
Trivial sample: Parent, Child1, Child2, Uncle.

_State_
  _Introducing the Train, with wagons and engine_
_Constructors_
_Updaters_
  _Horizontal and vertical composition_
  _Inside of_
  _The builder pattern for updaters_
_Operations_
_Templates_
  _Readonly context_
  _Writable state_
  _Layouts_
    _Dumb components_
    _Wrappers_
  _Template embedding, business logic vs visuals, dispatching subdomains_
_State management across domains_
  _useState_
  _Foreign mutations_
    _Warp gates across domains_
    _Rerendering vs dependency management of foreign mutations vs state_
_Coroutines_
  _Seq_
  _Await_
  _Any_
  _On_ vs manual implementation of events
_Api's_
  _Mocks vs regular promises_
  _Parsers_
_Core vs feature domains_
_Advanced patterns_
  _Debouncers_
  _Asynchronous validation_
  _Await with retry_
  _Infinite lists_
  _Filters_
