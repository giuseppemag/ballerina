Todo (✅/❌)
  ❌ make validator partial
  ❌ key-values: uniqueness constraint enforcement
  ❌ show both data-sync and type-safe forms in FormsApp
  ❌ deprecate mapping in both config and code forms, they are not a good idea

  ✅ docker
    ✅ PG
    ✅ PG-admin
  ❌ port forward pgadmin or use DBeaver
  ❌ auth.fsproj
    ✅ models
      ✅ users
      ✅ registration-tokens
      ✅ user events
    ❌ registration, etc. coroutines
      ✅ serialize/deserialize F# unions and records with endpoints
      ✅ define CRUD 'a
      ✅ define AB, ABEvent, ABEvent_CLI
      ✅ define DBSets in DBContext
      ✅ run migrations
      ✅ move CRUD 'a to separate project
      ✅ move updater U<'s> to separate file
      ❌ cleanup
        ✅ move sample coroutines
        ✅ move sample dbcontext stuff
          ✅ resolve dbcontext with DI
          ✅ pass config from appsettings.development (based on env variable)
        ✅ move AB sample
        ❌ add PositionOptions config with extension method on builder
        ❌ adding and configuring the dbcontext should also be done from another file, from ballerina-core perhaps
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
        ❌ pre-prototype
          ✅ fill schema with constant seeds, including GUIDs
            ✅ the schema `updater` implementations are empty, they should actually save the data
            ✅ fill schema with business rules
              ✅ define business rule for subtotals of AB.TotalABC = ACount+BCount+CCount
                ✅ actions are wrong, redesign 
                  ✅ rules need a starting scope entity (`AB`/`CD`)
                  ✅ an entity descriptor is needed
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
              ❌ distribute the various field updaters along the typed `XFieldDescriptor`, every entity should have the map of fields by type
              ❌ rename `positions` to `abcd`
          ❌ testing scenario
            ✅ add a setA event, see that the Total changes
            ✅ add a setB event, see that the Total changes
            ✅ add a setC event, see that the Total changes (nasty because of the AB-CD relation)
              ✅ the CD values are cached inside the entity, they should be lazy
              ✅ the propagation to TotalABC does not work
              ✅ the predicate is not restricting
            ✅ add a setCDRef event, see that the Total changes
            ✅ add a setD event, for symmetry
            ❌ extend the schema: CD - EF
              ❌ add setE, setF events, see that the Total changes
            ❌ verify that there actually is no loop
              ❌ loops involve same rule, same entity, same field
              ❌ test with an actual loop
              ✅ add orthogonal rules on the same entity-set
                ✅ A, B, ..., Total
                ✅ alpha, beta, ..., Sigma
                ✅ cyrillic variants, ..., (BEC')
            ❌ add `CDs` to `AB`, so not just one
              ❌ change all `CD` refs inside a given `AB`
                ❌ the schema for `CD` then needs a `RefsField`
                ❌ complete the scenario of multiple CDs, so that the events can also be EntityEvents such as `Add`, `Delete`, `Move`, etc.
          ❌ make it production-ready
            ❌ test with 
              ❌ a few thousands ABs, CDs, EFs
              ❌ a dozen rules on many field "clusters"
            ❌ do not commit the updates to the context immediately, output a set of field value changes
              ❌ the context becomes a cache of operations
              ❌ output the applied rules for the visibility/explainability/logging
              ❌ monadically
            ❌ expose OpenAPI
              ❌ add API to set the schema, and cache it in a JSON file
                ❌ wait for the SetSchema event, or the schema to be available in the context
            ❌ the construction of field descriptors in the schema could be streamlined
            ❌ the metadata entities belong to the model, not to Ballerina
            ❌ all rules should be applied on all entities after creation of a new entity
            ❌ prepare a `co.Any` where each coroutine returns a different `fieldDescriptor x (Target = One | Multiple | All)`
            ❌ BUG ALERT if translating to production! The Map of events will likely cause events not to be processed in create-order
            ❌ allow approval, with associated business rules
            ❌ deal with missing references
            ❌ introduce list monad with errors for eval/execute
              ❌ return useful error messages
            ❌ implement lazy fields in the schema
              ❌ this requires a coroutine-mediated protocol
              ❌ openSession(schema) -> operations | closeSession()
              ❌ when the schema is fully dynamic, get/update operations work with reflection/`Dynamic` CLR type
            ❌ efficiently: with pre-caching of the FREE-VARS of both condition and expression value
            ❌ enums to strings
          ❌ PROTOTYPE 2 - DB in PG with CRUD OpenAPI
            ❌ performance test
            ❌ add memcache after write operations
          ❌ -----at this point, the prototype can be considered reasonably done and could go live as a microservice-----
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
        ❌ DocEvents = SenderEvents | ReceiverEvents | BankDetailEvents
          ❌ further split by field types
        ❌ InvoiceEvents = DocEvents | InvoiceEvents
          ❌ InvoiceEvents = PositionEvents | PositionsEvents
            ❌ SetPositionsVatIds
            ❌ further split by field types
        ❌ OrderEvents = DocEvents (| OrderEvents == ())
        ❌ Document = Invoice | Order
          ❌ Post Invoice with InvoiceEvent
          ❌ Post Order with OrderEvent
          ❌ GET Invoice (pretend it's only one)
          ❌ GET Order (pretend it's only one)
        ❌ _generate_ events from (annotated) static methods or annotations on attributes with dependency on CRUD repository
        ❌ link event handlers to business rules and value defaults
        ❌ After N edits, push to the frontend a request in the form of an event for the creation of a custom model or similar
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
