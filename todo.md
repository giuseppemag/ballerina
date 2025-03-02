Todo (✅/❌)
  ❌ make validator partial
  ❌ show both data-sync and type-safe forms in FormsApp

  ❌ check that we can inspect a local DB (MySQL, Redis, ES, Postgres)
  ❌ form validator and code generator
    ✅ `ExprType.Unify` does not belong in _the other_ mega-file: split Expr, ExprType, eval, typeCheck
    ✅ deploy published release on GitHub with a bash script
    ✅ move to ballerina-core
      ✅ extract `Unify` and `UnificationConstraints` form typeCheck
      ✅ move `JsonValue` extension to core
      ✅ make `tryFindFieldsN` prettier (as in: take as input a normal tuple, give back a normal tuple)
        ✅ define a `tuples` conversion library 
        ✅ base it off of state
          ✅ define state.All3, state.All4, state.All5
        ✅ Utils.tryFindField -> sum.TryFindField
        ✅ with `Pair` for the `<*>` operator?
      ✅ all utility methods should be capitalized in Program.fs
      ✅ don't mix `printfn` and `Console.WriteLine`: only the latter, with string interpolation
      ✅ remove the visibility predicates from odd renderers like ElementRenderer, KeyRenderer, and so on
      ✅ models
      ✅ parsing
      ✅ validation
      ✅ codegen
      ✅ "runner"/entrypoint
    ✅ split the mega-file for the business rules (business rule engine/model)
      ✅ X.[Model|Feature1|Feature2|...FeatureN]
        ✅ `Expr`, `ExprType` go under `Model`
      ✅ rename `BusinessRule` -> `BusinessRules`
      ✅ `Expr`should be in `BusinessRules`
      ✅ rename `BusinessRules`-> `DSL`
      ✅ the `Sum` module belongs under the `Collections` namespace
    ✅ the code is acceptable now
    ❌ break the form engine in all possible ways and ensure good errors arise
      ❌ define tests, one minimal spec for anything that can go wrong
        ✅ create a test project
        ✅ make every field optional - visibility, apis, forms, launchers, but not types
        ✅ put error files inside test project, do not fish from ballerina-runtime
        ✅ invalid types
          ✅ invalid fields
            ✅ bad structure (array, number, etc. instead of record)
            ✅ non-existing types
            ✅ generics without (the right) arguments
              ✅ mark path as _high prio_ earlier
        ✅ invalid enums
          ✅ bad structure (array, number, etc. instead of record)
          ✅ non-existing types in API
          ✅ types with the wrong structure
        ✅ invalid streams
          ✅ non-existing types
          ✅ types with the wrong structure
        ✅ invalid entities
          ✅ bad structure (array, number, etc. instead of record)
          ✅ non-existing types
        ✅ invalid forms
          ✅ bad structure (array, number, etc. instead of record)
          ✅ non-existing backing `type`
          ✅ invalid fields
            ✅ non-existing fields
            ✅ invalid properties - label/description/details as numbers or objects
          ✅ invalid renderers
            ✅ non-existing renderers
            ✅ mismatch with types
          ✅ invalid tabs
            ✅ non-existing fields
        ✅ invalid predicates
          ✅ requires global config, APIs, and launcher 
          ✅ non-existing variables
          ✅ non-existing fields
          ✅ mismatched types (`10 == true`)
          ✅ wrong pattern matching
            ✅ missing case handler
            ✅ non existing case name
            ✅ different types of the handlers
            ✅ same handler types but unexpected type of the whole match
        ❌ invalid launchers
          ❌ non-existing form
          ❌ missing entity API
          ❌ missing config API
          ❌ mismatch form.type vs api.type
          ❌ mismatch configApi.type vs predicate api implicit type
          ❌ missing config type
        ❌ invalid nested renderers
          ❌ non-existing field
          ❌ wrong predicate `root` type inside the nested renderer
        ❌ invalid discriminated union renderers
          ❌ missing cases
          ❌ non-existent case
          ❌ case arg and chosen renderer type mismatch
        ✅ actual person-config as a reference of something that should work
          ❌ add a few correct instances of visiblity predicates using `match-case`
          ❌ add one that matches `Some`, `None` over a `SingleSelection`
        ❌ improve the code of the generated tests by removing repetition
      ✅ run tests before releasing
    ✅ specialize the errors (stream not found, enum not found, etc.)
    ✅ improve the generated whitespace
    ✅ the Go type generator is now reasonably mature
    ❌ add full support for unions, including generation
      ✅ parser
      ✅ validator
      ✅ match-case 
        ✅ expr
        ✅ parser
        ✅ type checker
        ✅ FE prototype of evaluator
      ✅ generated type structure
      ✅ generated constructors
        ✅ constructors for the case values
        ✅ constructors for the whole thing - assume discriminator, accept specific value
      ❌ add renderer syntax for the selector of a different form depending on the case
        ❌ new codegen config entry for unions
          ❌ new type of renderer
            ❌ when a renderer for unions is found, the `cases` property is parsed into this new type
          ❌ validator checks that the cases are covered
            ❌ validate that forms for each case have the right type (`fields` of the corresponding case)
            ❌ validate predicates with the right `local` type
              ❌ add predicates to the `Name` in both job forms
        ❌ add `extends` sytnax to forms, refactor jobs forms to extend jobBase
    ❌ make sure we parse the `children` of each renderer type that supports them
      ❌ reduce repetition around the processing of `Children` in `validate` and `get...free...vars`
    ❌ create gui editor as an instance of a form itself
      ❌ form specification
      ❌ generated F# files with type definitions
        ❌ because there will be an entity API with the database schema interpretation later
      ❌ package in a separate (private) repo 
        ❌ served by an F# backend
        ❌ with access to folder IDE-style
        ❌ with enums and streams (defined in F#) based on the available types ATM
    ❌ extensions
      ❌ distinguish Option (with renderer like List) from SingleSelection (only renderer for streams)
        ❌ allow Some and None matching on Option
        ❌ distinguish outer from inner renderers
      ✅ support `children` property on any renderer
        ✅ a record of fields parsed and validated exacted like fields
      ✅ parse and validate new type of launchers
      ❌ preprocessor plugins
        ❌ injected at specific times
        ❌ language generation as parameters
      ❌ define `include` command
      ❌ add homomorphic forms
      ❌ add multi-field renderers
        ❌ use tuples, meaning it's still just one single field
      ❌ add paginated lists
        ❌ requires changes to the frontend
      ❌ add lazy fields
        ❌ requires changes to the frontend
    ❌ paths inside `Any` have a priority after a partial match is found - `Any` filters errors lower than the highest priority
      ❌ add to each `Any`, streamline operators
        ❌ parser
        ❌ validator
    ❌ disallow unsupported keywords (`visibIle` wasted me a good chunk of time)
    ❌ the validator is now mature
    ❌ move extensions to separate (private) repo
    ❌ improve the syntax of types and expressions with fslex and fsyacc
    ✅ fix Ballerina as a namespace for proper nesting
    ✅ convert all instances of Map.tryFind ... withError ... to `Map.tryFindWithError`
    ✅ `Map.tryFindWithError streamName "streams" streamName |> state.OfSum` should just be `findStream`
    ✅ adjust all patterns like `|> Seq.tryFind (fst >> (=) "stream") |> Option.map snd` to `JsonValue.tryFindField`
    ❌ refactor `sprintf` instances in `typeCheck.fs`
    ❌ add `sum.Map`, remove `Sum.Map` references (ugly and inconsistent wrt `state.Map`)
    ❌ add state.TryFindX for enum, form, stream, and so on like for `state.TryFindType`
      ❌ why can't we use state.TryFindType in the validators?
      ❌ Validate passes the context as a parameter instead of using GetContext - ugly
    ❌ release ballerina to nuget
    ❌ check the consistency of the used data structures: `Type` vs `TypeId`
    ✅ accept empty `apis` blocks
    ❌ discard unsupported field names
    ❌ add `extends` keyword for forms
    ❌ add lots of operators to lists, sets, maps, etc.
    ❌ allow mutually recursive types and forms
      ❌ be careful with out-of-order extensions
      ❌ make ExprType.resolveLookup recursive - this might be at odds with the parent task because it might cause infinite loops
    ❌ the tool is now complete
    ❌ the codegen to Golang needs to be improved
      ❌ split up in files
      ❌ as well as the `SeqState` monad
    ❌ the core library needs more structural cleanup: Queries, Range, etc. should go into `webapi` or a similar domain
    ❌ help command
    ❌ expr and expr type parsing and validation must go to their respective meta-modules
    ❌ generate Typescript and C# code from forms-config
    ❌ extensibility of primitives as existentially-typed algebras
    ❌ entites visitors
      ❌ entites GET - identical to stream GETter: pairs of get + serialize
      ❌ entities GETDefault - identical to stream GETter: pairs of get + serialize
      ❌ entities POST - how do we represent changes?
      ❌ entities PATCH - how do we represent changes?
      ❌ make all these functions partially applied in the actual parameters vs the visitor parameters
    ❌ codegen the `import` command with some sort of linking strategy for shared files
    ❌ define webservice variant
    ✅ allow union types (needs adjustment in frontend too)
  ✅ models
    ✅ users
    ✅ registration-tokens
    ✅ user events
  ❌ expose ballerina-core as a nuget package
  ❌ expose ballerina-runtime as a nuget package
  ❌ registration, etc. coroutines
    ✅ serialize/deserialize F# unions and records with endpoints
    ✅ define CRUD 'a
    ✅ define AB, ABEvent, ABEvent_CLI
    ✅ define DBSets in DBContext
    ✅ run migrations
    ✅ move CRUD 'a to separate project
    ✅ move updater U<'s> to separate file
    ❌ cleanup
      ❌ create builder and app only after parsing the command line parameters
      ✅ move sample coroutines
      ✅ move sample dbcontext stuff
        ✅ resolve dbcontext with DI
        ✅ pass config from appsettings.development (based on env variable)
      ✅ move AB sample
      ❌ add PositionOptions config with extension method on builder
      ❌ adding and configuring the dbcontext should also be done from another file
    ✅ AB events sample domain
      ✅ reorganize the main project decently, moving all the AB-related logic to a separate folder
        ✅ repositories
        ✅ endpoints
      ✅ define ABRepo, ABEventRepo
        ✅ generalize from a single DbSet
        ✅ add ordering - requires making CRUD an interface
        ✅ add skip/take
          ✅ add url parameters to endpoint, check that they work also in OpenAPI
          ✅ add "safety clamp" to avoid DDoS
      ✅ post ABEvent, AB via repos
        ✅ expose OpenAPI spec
          ✅ type discriminator in swagger
          ✅ type discriminator when serializing
          ✅ type discriminator when deserializing
      ❌ define and run ABCoroutine
        ✅ separate entry point with own executable based on cmd-line arguments
          ✅ check the cmd line parameters with System.CommandLine
            ✅ shell script for `dotnet run -- mode web & dotnet run -- mode jobs`
            ✅ isolate thread evaluator, move to separate file in main project
            ✅ fix the ugly dancing ids of the active coroutines, they should remain the same
        ✅ do not delete events, mark them as done, with an index on the status
          ✅ add timestamp to events, process in creation order
          ✅ allow adding new events from coroutines
          ✅ POST should overwrite CreatedAt and ProcessingStatus
            ✅ even better, POST should not expect CreatedAt and ProcessingStatus (deserializer)
        ✅ add environment to the ./startup-be.sh launcher, otherwise we are using the wrong appsettings!!!
        ✅ processBs
        ✅ separate state = Unit from context = ABContext
        ✅ extract the general purpose evaluator from jobs.fs
          ✅ parameterize the event queries with a CRUD repo
        ✅ endpoint to push AB events
          ✅ expose OpenAPI spec
        ✅ "blogging" context -> BallerinaContext
        ✅ implement Repeat as a reified construct
        ✅ AB jobs can be separated fully to the AB module with minimal dependencies
        ❌ refactor `async` to `task`
        ❌ BUG ALERT if translating to production! The Map of events will likely cause events not to be processed in create-order
        ❌ test Spawn
          ❌ remove ugly starting logic, everything is bootstrapped by the endpoint that pushes the CreateABEvent
          ❌ create ABs from event
          ❌ when the AB coroutine ends, it is respawned (migration-friendly strategy)
        ✅ restore Async in Crud, run with Await
        ✅ dependent on repo's for AB and ABEvent
        ✅ co.On for ABEvent should check that the ABId matches or every ABEvent will match every co.On
        ✅ test Any
      ✅ project refactoring
        ✅ move all the AB-related logic to the right project
        ✅ rename grandeomega to web
    ❌ define sample Positions API and types
      ❌ define expr evaluator
        ✅ basic eval expr
        ✅ basic eval assignment
        ❌ cleanup
          ✅ the schema definition should be in a separate file than the context
          ✅ allFields should be the flattening of allFields of each entity
          ✅ move the various merge* utilities to extension methods
          ✅ rename `XCount`, etc. to just `X`
          ❌ the field descriptor definitions should use the operations from other field descriptors, and not perform any comparisons to entity descriptors Ids
            ✅ Get should be based on Lookup
            ❌ AB and CD should be based on generic containers of fields and nested entities, not real types
              ✅ the lookup of fields from ABs and CDs in the definition of the AB/CD entity schema should use the field definition lookup recursively
              ❌ the assignment (`Update`) of fields to ABs and CDs in the definition of the AB/CD entity schema should use the field definition assignment recursively
          ❌ there are various places where we assume `One entityId`, is this always reasonable?
            ❌ in particular, `Expr::execute` does not take into account more than one field lookup on the assigned variable, extend
      ❌ testing scenario
        ❌ define an algebra of business rules to support cascades like for the GLAccount defaulting
        ❌ add `CDs` to `AB`, so not just one
          ✅ use business rules for field setting
          ✅ test the conditions, not always `Exists ... true`
          ✅ introduce .System -> .User as prio, apply it to the set field events
          ✅ modify all field events to the new structure based on business rule payloads
          ❌ complete the scenario of multiple CDs
            ❌ fix the wrong order of processing of events
            ❌ add `AB_CD` relation entity, remove direct `AB-CD` references
              ❌ `AB_CD = { AB_CDId; ABId; CDId; IndexOfCDInAB }`
            ❌ `Exists ab_cd in AB_CD | ab_cd.ABId = <ab1.ABId> && Exists cd in CD | cd.CDId = ab_cd.CDId |= [cd.EF := <ef1.EFId>]`
            ❌ the `&&` operator propagates variables from both operands
            ❌ the `||` operator propagates the intersection of variables with the same type from both operands
            ❌ `Exists ab in AB | true |= [ab.Total1 := sumBy(Exists ab_cd in AB_CD | ab_cd.ABId = <ab1.ABId> && Exists cd in CD | cd.C + cd.D)]`
            ❌ `Exists cd = new CD(...) | Exists ab_cd = new AB_CD(<ab1.ABId>, cd.CDId) | true |= []`
              ❌ all fields of new entities are marked as modified
            ❌ `Exists ab_cd1 | ab_cd1.ABId = <ab1.ABId> && ab_cd1.CDId = <cd1.CDId> && Exists ab_cd2 | ab_cd2.ABId = <ab1.ABId> && ab_cd1.CDId = <cd2.CDId> | true |= [ab_cd1.IndexOfCDInAB = 2; ab_cd2.IndexOfCDInAB = 1]`
        ❌ we don't need `One` anymore, do we? Let's move all to `Multiple`
        ❌ rename `positions` to `abcd`
        ❌ add an enum parameter to pick the edit to test
      ❌ make it production-ready
        ❌ define the values of AB, CD, etc. as instances of `Value`
          ❌ to base everything on Value, Fields and lookup types need an ID, not just the name 
            ❌ then we can deprecate FieldId, EntityId, etc.
        ❌ do not commit the updates to the context immediately, output a set of field value changes
          ❌ the context becomes a cache of operations
          ❌ output the applied rules for the visibility/explainability/logging
          ❌ monadically
        ❌ expose OpenAPI
            ❌ https://www.nuget.org/packages/FSharp.SystemTextJson.Swagger
            ❌ use the dynamic schema internally, but a statically typed `Expr` schema externally
        ❌ test with 
          ❌ a few thousands ABs, CDs, EFs
          ❌ a dozen rules on many field "clusters"
        ❌ the construction of field descriptors in the schema could be streamlined
        ❌ the metadata entities belong to the model, not to Ballerina
        ❌ all rules should be applied on all entities after creation of a new entity
        ❌ BUG ALERT if translating to production! The Map of events will likely cause events not to be processed in create-order
        ❌ allow approval, with associated business rules
        ❌ deal with missing references (GUIDs that do not match an existing entity)
        ❌ introduce list monad with errors for eval/execute
          ❌ return useful error messages
        ❌ the resolution of top-level existentials like `exists ab in AB | ab.ABId = CONSTGUID` should be resolved much faster
        ❌ implement lazy fields in the schema
          ❌ this requires a coroutine-mediated protocol
          ❌ openSession(schema) -> operations | closeSession()
          ❌ when the schema is fully dynamic, get/update operations work with reflection/`Dynamic` CLR type
        ❌ consider flipping the relations around, using arrays/maps instead of relations
        ❌ -----at this point, the prototype can be considered reasonably done and could go live as a microservice-----
        ❌ the evaluation of existentials with conditions over foreign keys can be ran very quickly with lookup tables
        ❌ efficiently: with pre-caching of the FREE-VARS of both condition and expression value
        ❌ enums to strings
      ❌ PROTOTYPE 2 - DB in PG with CRUD OpenAPI
        ❌ performance test
        ❌ add memcache after write operations
      ❌ -----at this point, the second prototype can be considered reasonably done and could go live as a microservice-----
      ❌ improve DSL for type-safe business rule and expression definition in F#
        ❌ group field definitions and entity definitions under anonymous records for aesthetics and scoping in case of multiple fields with the same name in a different entity          
      ❌ ideally with F#-style domain objects, not C#-style serializable objects
      ❌ remove every single instance of mutation
      ❌ separate DB serialization as a different EF package
        ❌ represent Expr as JSON
        ❌ represent Expr as a recursive structure looked up with a recursive query
      ❌ extend the `ABCDEvent` definition to include a processed state and a created time
      ❌ add an `EventDesc` to `FieldEvent`
        ❌ useful for pre/post event actions and conditions, it defines that which is passed to co.On plus a pre- and post-condition coroutine
        ❌ it is polymorphic and distributed over the concrete instances (ie `SetIntField of IntEventDesc`, ...)
      ❌ define custom rules and make the priority of assignments actually count
      ❌ persist the entities to Elasticsearch
      ❌ persist the entities to Postgres
        ❌ enums to strings
        ❌ json fields, in particular metadata, expr, assignment
      ✅ add OpenAPI support, see if we get luckier with C# unions and inheritance
    ❌ _generate_ translation of models into ef and OpenAPI
      ❌ records
      ❌ unions
      ❌ with recursion
      ❌ with serialization attributes
    ❌ endpoint generation
      ❌ extend chains
      ❌ filter parameter (over extended entity)
      ❌ sorting parameter (over extended entity)
      ❌ security model of generated APIs from queries: allow, restrict
      ❌ security model of extension
        ❌ define User' vault data and prevent anyone from extending along User -> Vault unless they are the user themselves
      ❌ control creation of extended entities (AB inside ABEvent for example)
    ❌ low-code platform
      ❌ business rules (of which defaultings are a data-driven instance) should be just data 
      ❌ workflow manager should be just data-driven coroutines
      ❌ statements and expressions evaluator
      ❌ data sync'er and mapper
    ✅ remove all the unused extra dependencies
    ✅ coroutine runtime engine
    ✅ fix stack overflow (flatten .Then)
    ✅ run in memory
    ✅ serialize to disk with JSON serializer
    ❌ dbContext factory might fix the ugly `wait 0`
    ❌ update state (serialized together with coroutine in DB)
    ❌ update events
    ❌ test user registration coroutine, create events with testing endpoint
    ❌ run with intelligent suspensions
  ✅ blog.fsproj
  ✅ postgres.csproj (this is the migrations project)
    ✅ dbContext (in C#)
    ✅ migrate one discriminated union
    ✅ separate schema for user stuff
  ❌ web app
    ✅ from Docker
    ✅ use appsettings.Development
    ✅ remove unnecessary references to EF Core stuff, only LINQ queries should still work
    ✅ migrations, db-update, db-drop, seed-db
    ❌ make sure pg-admin or DBeaver works
    ❌ post user-event endpoint
    ❌ login, logout, reset-password, edit-user, change-password, delete-user
      ❌ invoke methods from auth domain
      ❌ think about security
    ❌ users - organizations
    ❌ orders
    ❌ order confirmations
    ❌ invoices
    ❌ payments
      ❌ partial payments
      ❌ subscriptions
    ❌ delivery notes
    ❌ refunds
    ❌ payment conditions
    ❌ discounts per client
  ❌ improvements
    ❌ fix the tracking issue
        remove the ugly `wait 0`
    ❌ fix keywords properly: `wait`, `any`, `spawn`, `repeat`, `on`, `produce`
    ❌ separate Crud from AsyncCrud
    ❌ parameterize the coroutine queries serialization/deserialization
    ❌ add history/enqueued events endpoints for AB sample
      ❌ this should be done with only the predicate + sorting parameters of the ABEvents endpoint
  ❌ support both PG and MySQL
  ❌ SPA
    ❌ from docker container
    ❌ serve from backend
    ❌ import material UI
    ❌ signup form
    ❌ login form
    ❌ logout form
    ❌ edit user form
      ❌ delete user
    ❌ change password form
  ❌ coroutines
    ❌ move updaters to the core library
    ❌ set state, get state, update state
    ❌ actual operators
      ❌ on
      ❌ do/await
    ❌ actual runner
    ❌ model-first
      ❌ user, user events
      ❌ add postgres
      ❌ make DbContext implement the db contexts of the imported projects

    ❌ serialize to file
    ❌ serialize to (async) interface
    ✅ return any, all, etc. for the interpreter to process instead of evaluating directly
    ❌ await will be started in the background: make resilient wrt restarts and migrations
      ❌ how to re-enqueue after completion? Just a local mutable list to pump into the deserialized state?
    ❌ fast suspension and timer - see register as a case study
  ❌ .rest file
    ❌ register
      ❌ encrypt password with bcrypt
      ❌ save variable in .rest script
    ❌ login
      ❌ reuse variable in .rest script
    ❌ reset password
    ❌ logout
    ❌ login with changed password
    ❌ delete user
    ❌ run with docker-compose: coroutines container vs webapi container
    ❌ accept events from a single POST endpoint
  ✅ setup pg docker container
  ❌ define model-first database
    ❌ coroutines
    ❌ events
    ❌ subscriptions
      ❌ payment status (for info only)
    ❌ users
  ❌ serialize running coroutines in pg through serialization interface
  ❌ new scaffolder: type-provider for PG and ES
  ❌ add appsettings
  ❌ subscription
  ❌ payment with UBS
  ❌ payment with Adyen
  ❌ building blocks
  ❌ videos through kinoscope
  ❌ styling and frontend implementation

  ❌ auth
    ❌ registration 
    ❌ login 
    ❌ logout 
    ❌ reset password 
    ❌ magic link
  ❌ personal area
    ❌ avatar
    ❌ subscriptions
    ❌ invoices
    ❌ payments
      ❌ products (bundles)
      ❌ subscriptions
  ❌ highlight
  ❌ picked for you
  ❌ library
  ❌ filtering
  ❌ collection
    ❌ class
      ❌ building blocks
      ❌ video block/video player
  ❌ deployment to web
  ❌ deployment to native
    ❌ registration via Apple and Google
    ❌ payments via Apple and Google

  Backend
  ❌ coroutines
    ✅ main definition
    ✅ test program in apps
    ❌ generic events and their kind
    ❌ serialized suspension
    ❌ serialization interface to Postgres and volume
      ❌ volume via parameters
      ❌ postgres in a container (in test program in apps)
  ❌ predicates
    ❌ boolean expression
    ❌ rule evaluator
    ❌ session id, saved via i/o interface to eitehr postgres or volume
  ❌ synchronizer
    ❌ i/o interfaces
    ❌ fsparsec-style interface
    ❌ serialization of intermediate results to c
    ❌ testing app connects to an OData service
      ❌ read from appsettings or env variable

  ✅ give back/forward
  ❌ write guidelines
    ✅ adjust to new way of filtering the running of coroutines 
    ✅ write a quick-start
    ❌ adjust naming of foreign mutations (expected/exposed), update guidelines
    ❌ carefully review guidelines
    ❌ split into smaller files
    ❌ reference pages in a man/docs style or JSDoc
    ✅ explain monorepo
  ❌ add deep dive presentations
    ✅ forms
    ❌ data-driven forms
    ❌ views
    ❌ native vs web
  ✅ add help to create-domain command line tool (https://github.com/75lb/command-line-usage)
  ❌ create-domain
    ❌ broken in new setup - fix it
    ❌ add to guidelines
    ✅ add to readme
    ✅ convert dash to camelCase to create-domain
  ❌ CI
    ✅ automate tests on push
    ✅ tag-based release
    ✅ formatting
    ✅ commit VSCode settings
    ❌ test docker image build (potentially as part of integration tests)
    ❌ CI in sync with pre-commit hooks
  ❌ publish
    ✅ split core and playground
    ✅ write readme
      ✅ credits to BLP and Hoppinger
    ✅ publish repo
    ✅ publish on LinkedIn
    ✅ publish core to npm
      ✅ add to readme
      ❌ publish create-domain within core
        ❌ add to readme
    ✅ Co.embed should accept undefined as a result of narrowing, in that case suspending the coroutine implicitly
    ❌ test core and create-domain from the npm package
    ❌ add a sponsor button and create a Patreon account
  ❌ coroutine wrapper name is currently anonymous (in React Developer Tools). can that be updated?
  ✅ coroutine runner extension. we currently have both *.ts and *.tsx you've mentioned that we will only have *.ts
  ❌ remove JS warnings (component children missing keys)
  ✅ table->tbody
  ✅ rename single-lettered type variables to decent names
  ✅ use pretty printer for AsyncState in all debug views instead of JSON.stringify
  ❌ card1...card3 use an extensibility pattern that could be embedded in the simpleUpdater<CardState, Extra = Unit> for easier reuse  
    ❌ the extensibility pattern of Cards in the dashboad deserves a global sample and a spot in the coroutines
  ✅ simpleUpdater should return a Fun 
    ✅ so that we can write ((cardsRepository.Updaters.Core.card3.then(dashboardRepository.Updaters.Core.cards))) instead of the ugly eta-expansion

  ✅ every domain should have both FM types
  ✅ the child2 foreign mutations expected should not reference Uncle
  ✅ mapView should accept a component with the `Children` prop
  ✅ embed should & the context and state in the first argument
  ✅ coroutine event handling
    ✅ remove the ugly event type parameter
    ✅ adjust the guidelines
    ✅ define `On` and `Cast` as methods invokable only when certain constraints (inbound/outbound `OrderedMap<Id, event>` fields) are present on the state, including `Id`s on the events
  ❌ sumUpdater
    ❌ left, right, both
  ✅ maybeUpdater
    ✅ left, both
  ❌ Map/OrderedMap of children
    ✅ automate Map/OrderedMap updaters
    ❌ add ChildN to Parent domain
  ✅ write readme
  ❌ form validations via responses of the datasync
  ❌ Unit should be different from {}
  ❌ rewrite InfiniteStreamState with Debounced/Synchronized
  ❌ tables with sorting and filtering
    ❌ define in combination with FormCollection
      ❌ add/remove
      ❌ reorder
  ❌ improvements that just help
    ✅ Updater constructors
      ✅ Updater.Default.fromState : S => Updater<S> => Updater<S>
    ✅ parent.child.x Updaters auto-chaining can actually be achieved
      ❌ simpleUpdaterWithChildren in another domain
        ❌ simpleUpdater.WithChildren in another domain
      ✅ the children passed must be mapped and the parent updater applied in order to auto-widen
    ❌ auto-chaining should support Sum, Map, and OrderedMap updaters out of the box
      ❌ this might be achieved by marking the simpleUpdater with a kind == "simpleUpdater", and the other 
        supported updaters (for example, simpleSetter = [x,y,z,...] => Updater(e => e+x,y,z,etc.))
        (for example, curriedSetter = [x,y,z,...] => [a,b,c,...] => Updater(e => e+x,y,z,a,b,c,etc.))
        then the widenChildren operator checks the kind and decides how to perform the mapping
  ❌ pair
  ❌ standard templates for unions, lists, trees, products, and sums

❌ Backend
  ❌ Coroutines
    ❌ Streams
  ❌ OData-style queries
  ❌ Some sort of scaffolder and query-generator connected to endpoints and based on coroutines
  ❌ Entities, relations, and permissions scaffolder
  ❌ Endpoints scaffolder
  ❌ Language-independent backend framework
