Todo (✅/❌)
  ❌ coroutines
    ✅ without widgets
  ❌ template
    ❌ rename subdomains folder from "domains" to "children"
    ❌ the Template coroutine constructor should enforce the context to be an intersection with the state
  ❌ sample application
    ❌ parent 
      ❌ coroutine
        ❌ Embed must allow mapping, or outright ignoring of events
        ✅ simple "animation"
        ❌ apply async validation with debounce
          ✅ debounced
            ✅ generic methods, not repository
          ✅ synchronized
            ✅ synchronization coroutine
              ✅ asyncRetry coroutine
                ✅ asyncState
                ✅ Synchronized inside Debounced
                ✅ Validated is just part of synchronized/AsyncState
                ✅ Debounce coroutine with embedded k
                  ✅ How to prevent the guard on dirty to stop the coroutine from doing its job?
                ✅ Synchronize coroutine with p:Promise, max attempts, error handler
          ✅ debounced and synchronized should just extend V, or at least Synchronized
          ✅ move extra subdomains from Parent to Core
          ✅ embed the coroutine from the core domain debounce
          ✅ debounce(sync'ed) does not work under all edge cases, debug it extensively
            ✅ print better stats on screen
          ❌ the sample of debounce(sync'ed) is semantically totally screwed up, it needs a more reasonable implementation
            ❌ split Api and keep mocks separate
          ✅ embed should be a method of the coroutine, not only of the CoTypedFactory
            ✅ rewrite the instances of Co.Embed so they look more decent
            ❌ make sure the `events` are parameterized in the core domains Debounced and Synchronized to avoid imposing `never` on the caller `events`
          ❌ prevent the debounce coroutine from running when dirty is not set with a separate runner for performance
      ❌ template
        ❌ instantiate children templates
          ❌ child1
            ❌ template
              ❌ instantiate coroutine runner
              ❌ reset values
            ❌ view
              ❌ show values
            ❌ coroutine
              ❌ animate values
          ❌ child2
            ❌ template
              ❌ instantiate coroutine runner
              ❌ reset values
            ❌ view
              ❌ show values
            ❌ coroutine
              ❌ animate values
        ✅ instantiate coroutine runner
          ✅ coroutine runner as a template, not a widget
      ✅ view
        ✅ wrapper for template
          ✅ add wrapView to Template
        ✅ simple debug renderer
        ✅ tiny form for writing a string "a^Nb^M"
        ✅ tiny form for incrementing the counters
          ✅ updating one counter updates the other as well
    ❌ uncle domain
      ❌ lonely boolean in the state
      ❌ empty template
      ❌ empty coroutine
      ❌ placeholder (debug) view
      ❌ foreign mutations from child2 to uncle

  ❌ should "state.ts" just be "type", "model", or "structure"
  ❌ templates
    ❌ split updaters across core, template, and coroutine
      ❌ not in state.ts file
      ❌ possibly in three separate files
  ❌ pair
  ❌ immutable and array
  ❌ operation extractor (template + core, coroutine + core)
  ❌ insideOf needs some further thinking
  ❌ think of a decent example application with
  ❌ auth
  ❌   with org selection
  ❌ navigation (with foreign mutations)
  ❌ website with building blocks
  ❌ e-commerce
  ❌ private area
  ❌ workflow editor
  ❌   actions
  ❌   advanced filtering
  ❌ tasks
  ❌   actions
  ❌   advanced filtering
  ❌ typesafe subscription forms with validation
  ❌ typesafe parsing and validation

❌ Hangfire-style coroutines
  ❌ define coroutine in F#
  ❌ define computation expression
    ❌ define Tick
    ❌ define Any
    ❌ define Repeat
    ❌ define Wait
  ❌ define computation expression based on System.Expression or F# Quotation
  ❌ runner uses serialization interface
    ❌ first implementation to file
  ❌ implement SelectMany and Return (?) as well
  ❌ serialize to database (Docker)
  ❌ implement lock and separate runner threads for higher performance

❌ Frontend
  ❌ Domains scaffolder from spec
  ❌ Frontend domain extensibility

❌ Backend
  ❌ Coroutines
    ❌ Streams
  ❌ OData-style queries
  ❌ Some sort of scaffolder and query-generator connected to endpoints and based on coroutines
  ❌ Entities, relations, and permissions scaffolder
  ❌ Expressjs and some ORM
  ❌ Endpoints scaffolder
  ❌ Language-independent backend framework
