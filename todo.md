Todo (✅/❌)
  ✅ sample application
    ✅ parent 
      ✅ child1
      ✅ child2
    ✅ uncle domain
    ✅ foreign mutations from child2 to uncle
  ❌ write guidelines

  ❌ should "state.ts" just be "type", "model", or "structure"
  ❌ templates
      ❌ rename subdomains folder from "domains" to "children"
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
  ❌ templates for unions, lists, trees, products, and sums

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
