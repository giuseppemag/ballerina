Todo (✅/❌)
  ✅ add label override in field renderer
  ❌ make validator partial
  ❌ add optional "info" field to form fields
  ❌ support files
  ❌ support secrets (not re-sent, use `modified`)
  ❌ map fields
    ❌ implement
  ❌ delete mappers, they are not a good idea
  ❌ combine data-sync and type-safe forms

  GrandeOmega2
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
        ❌ move sample coroutines
        ❌ move sample dbcontext stuff
          ✅ resolve dbcontext with DI
          ❌ pass config from appsettings.development (based on env variable)
        ✅ move AB sample
        ❌ move sample endpoints
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
          ❌ _generate_ translation of models into ef and OpenAPI
            ❌ records
            ❌ unions
            ❌ recursion
            ❌ serialization attributes
            ❌ events from (annotated) static methods or annotations on attributes with dependency on CRUD repository
          ❌ test Spawn
            ❌ remove ugly starting logic, everything is bootstrapped by the endpoint that pushes the CreateABEvent
            ❌ create ABs from event
            ❌ when the AB coroutine ends, it is respawned (migration-friendly strategy)
          ❌ add history/enqueued event endpoints
            ❌ this should be done with only the predicate + sorting parameters of the ABEvents endpoint
          ❌ fix the tracking issue
             remove the ugly `wait 0`
          ❌ fix keywords properly: `wait`, `any`, `spawn`, `repeat`, `on`, `produce`
          ❌ separate Crud from AsyncCrud
          ❌ parameterize the coroutine queries serialization/deserialization
          ✅ restore Async in Crud, run with Await
          ✅ dependent on repo's for AB and ABEvent
          ✅ co.On for ABEvent should check that the ABId matches or every ABEvent will match every co.On
          ✅ test Any
        ✅ project refactoring
          ✅ move all the AB-related logic to the right project
          ✅ rename grandeomega to web
      ❌ define sample Positions API and types
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
        ❌ link event handlers to business rules and value defaults
        ✅ add OpenAPI support, see if we get luckier with C# unions and inheritance
      ❌ endpoint generation
        ❌ extend chains
        ❌ filter parameter (over extended entity)
        ❌ sorting parameter (over extended entity)
        ❌ security model of generated APIs from queries: allow, restrict
        ❌ security model of extension
          ❌ define User' vault data and prevent anyone from extending along User -> Vault unless they are the user themselves
        ❌ control creation of extended entities (AB inside ABEvent for example)
      ✅ remove all the unused extra dependencies
      ✅ coroutine runtime engine
      ✅ fix stack overflow (flatten .Then)
      ✅ run in memory
      ✅ serialize to disk with JSON serializer
      ❌ update state (serialized together with coroutine in DB)
      ❌ update events
      ❌ test user registration coroutine, create events with testing endpoint
      ❌ run with intelligent suspensions
  ❌ low-code platform
    ❌ business rules (of which defaultings are a data-driven instance) should be just data 
    ❌ workflow manager should be just data-driven coroutines
    ❌ statements and expressions evaluator
    ❌ data sync'er and mapper
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
  ❌ setup pg docker container
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
    ❌ main definition
    ❌ test program in apps
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
  ❌ Expressjs and some ORM
  ❌ Endpoints scaffolder
  ❌ Language-independent backend framework
