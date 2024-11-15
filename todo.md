Todo (✅/❌)
  ❌ add label override in field renderer
  ❌ make validator partial
  ✅ list fields in config
    ✅ write config: addresses, emails
    ✅ invoke forms config parser
    ✅ only show validation and parsing results
    ✅ validate configuration with lists
    ✅ initial value of Address/string should be provided as well in the config or at least the parser
    ✅ parse and run configuration with lists
  ❌ map fields
    ❌ design
    ❌ implement
  ❌ restore mapping builder for both list and map 
  ❌ add to FormsApp.tsx examples of statically typed mapping, as well as config'ed mapping

  GrandeOmega2
  ✅ docker
    ✅ PG
    ✅ PG-admin
  ❌ port forward pgadmin or use DBeaver
  ❌ auth.fsproj
    ❌ models
      ✅ users
      ✅ registration-tokens
      ✅ user events
      ❌ sessions
      ❌ active coroutines
      ❌ suspended coroutines (wait vs on vs both)
    ❌ registration, etc. coroutines
      ❌ coroutine runtime engine
        ❌ how to spawn? Spawn is a different exit point because it is an alternative way of being Done, without a result
          ❌ spawn does not kill the rest of the computation inside the Then
        ❌ how to await? Awaiters need to be saved to the active list and polled actively
        ❌ Any is not correct wrt Spawn
        ❌ Then is also a beast
        ❌ move runner to separate file
        ❌ move updater U<'s> to separate file
      ❌ run in memory
      ❌ test serializers on startup/simple endpoint
      ❌ serialize to disk with binary serializer
      ❌ serialize to DB with JSON serializer
      ❌ update state (serialized together with coroutine in DB)
      ❌ update events
      ❌ serialize to DB with quotations serializer (how does the state work)
      ❌ run with intelligent suspensions
        ❌ accumulate ps' in Any with the co-results, and then pattern match on 1 or 2 and only waiting or listening
  ✅ blog.fsproj
  ❌ postgres.csproj (this is the migrations project)
    ✅ dbContext (in C#)
    ✅ migrate one discriminated union
    ❌ connection string from appsettings!!!
      ❌ ensure we are reading the dev appsettings
    ❌ separate schema for user stuff
  ❌ web app
    ❌ from Docker
    ❌ use appsettings.Development
    ❌ remove unnecessary references to EF Core stuff, only LINQ queries should still work
    ❌ import PositionOptions
      ❌ delete the PositionOptions and move to something more useful eventually
    ❌ import DbContext options
    ❌ migrations, db-update, db-drop, seed-db
    ❌ make sure pg-admin works
    ❌ post user-event endpoint
    ❌ login, logout, reset-password, edit-user, change-password, delete-user
      ❌ invoke methods from auth domain
      ❌ think about security
  ❌ move from PG to MySQL
  ❌ business rule staged partial evaluator
  ❌ data-dependencies as business rules or as coroutine-events
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
  ❌ bool predicate evaluator
```
let resetPassword = 
  co{
    let! email = co.on (function ResetPassword email -> Some email | _ -> None)
    do! co.spawn
      co.any [
        co{
          let! maybeUserId = User.findByEmail
          match maybeUserId with
          | Some userId ->
            let resetToken = randomToken()
            do! co.do(User.update userId User.resetToken(replaceWith resetToken))
            do! co.do(User.sendResetPasswordEmail email resetToken)
            do! co.on (function | NewPassword (token, newPassword) when token = resetToken -> Some() | _ -> None)
            do! co.do(User.update userId User.password(newPassword))
          | _ -> 
            return ()
        }  
        co.wait User.resetPasswordExpiration
      ]
  }

let subscription = 
  co{
    let! newSubscription = co.on (function NewSubscription _ -> Some _ | _ -> None)
    let rec repeatedPayments autoRenew numPayments noticePeriodNumPayments interval = 
      if numPayments <= 0 then 
        if autoRenew = false then co.Return()
        else repeatedPayments newSubscription.AutoRenew newSubscription.NumPayments newSusbscription.NoticePeriodNumPayments newSubscription.Interval
      else 
        co.any [
          if numPayments <= noticePeriodNumPayments then
            co{
              do! co.on (function SubscriptionCancellation subscriptionId when subscriptionId = newSubscription.Id -> Some() | _ -> None)
              do! co.do(Subscription.delete newSubscription.Id)
            }
          else co.never
          co{
            co.any[
              co{
                do! co.do(Subscription.sendAutomatedPayment newSubscription.Id)
                do! co.on (function AutomatedPayment subscriptionId when subscriptionId = newSubscription.Id -> Some() | _ -> None)
              }
              co{
                let paymentPeriodStarted = DateTime.Now
                let! token = co.do Subscription.createPaymentToken
                do! co.do(Subscription.sendPaymentLink token)
                co.all [
                  co.any[
                    co.on payment confirmed with token
                    co{
                      do! co.wait Subscription.paymentReminder
                      do! co.do(Subscription.sendPaymentReminderLink token)
                    }
                  ]
                  co{
                    do! co.wait Subscription.accessLockedDelay
                    do! co.do(Subscription.update newSubscription.Id Subscription.active(replaceWith false))
                  }
                ]
                do! co.do(Subscription.update subscriptionId Subscription.active(replaceWith false))
                do! co.wait (interval - (DateTime.now - paymentPeriodStarted))
              }
            ]
            do! repeatedPayments autoRenew (numPayments-1) noticePeriodNumPayments interval
          }
        ]
      do! repeatedPayments newSubscription.AutoRenew newSubscription.NumPayments newSusbscription.NoticePeriodNumPayments newSubscription.Interval
    }
```
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
