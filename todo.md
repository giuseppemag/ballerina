Todo (✅/❌)
  ✅ sample application
    ✅ parent 
      ✅ child1
      ✅ child2
    ✅ uncle domain
    ✅ foreign mutations from child2 to uncle
  ✅ Parent/state.ts contains an extra type
  ✅ Debounced and Synchronized status types should move to core
  ✅ Debouncer coroutine should stop the async iterations with `Any` when `Dirty` is reset
  ✅ create domain tool
    ✅ add readonly state, writable state, and most basic starter stuff to created files
    ✅ make it an npm package
    ✅ link from the main repo
    ✅ test on another domain
  ❌ give back/forward
    ❌ ballerina -> blp script
      ❌ everything
      ❌ delete blp folder
      ❌ add script to .gitignore
      ❌ run once
      ❌ ensure blp repo works fully
      ❌ commit and push
    ❌ blp script -> ballerina
      ❌ everything minus blp folder and App.tsx
      ❌ add script to .gitignore
  ❌ write guidelines
    ✅ adjust to new way of filtering the running of coroutines 
  ❌ add create-domain command line tool to readme
  ❌ coroutine wrapper name is currently anonymous (in React Developer Tools). can that be updated?
  ❌ coroutine runner extension. we currently have both *.ts and *.tsx you've mentioned that we will only have *.ts
  ❌ we've discussed JS warnings (component children missing keys)
  ❌ table->tbody
  ❌ rename single-lettered type variables to decent names
  ❌ use pretty printer for AsyncState in all debug views instead of JSON.stringify
  ❌ rewrite InfiniteStreamState with Debounced/Synchronized

  ❌ every domain should have both FM types
  ✅ the child2 foreign mutations expected should not reference Uncle
  ❌ mapView should accept a component with the `Children` prop
  ❌ embed should & the context and state in the first argument
  ❌ remove event handling from coroutines core and define `On` and `Cast` as methods invokable only when certain constraints (inbound/outbound `OrderedMap<Id, event>` fields) are present on the state, including `Id`s on the events
  ❌ Map/OrderedMap of children
    ❌ automate Map/OrderedMap updaters
    ❌ add ChildN to Parent domain
  ❌ write readme

  ❌ should "state.ts" just be "type", "model", or "structure"
  ❌ pair
  ❌ builder pattern for updaters to not have to specify Core, Template, Coroutines
  ❌ templates
      ❌ rename subdomains folder from "domains" to "children"
      ❌ split updaters across core, template, and coroutine
      ❌ not in state.ts file
      ❌ possibly in three separate files
  ❌ scoped updater forwarder extractor (template + core, coroutine + core)
  ❌ insideOf needs some further thinking
  ❌ standard templates for unions, lists, trees, products, and sums
    ❌ tree zipping?
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
