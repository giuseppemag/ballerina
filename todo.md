Todo
  fun
  updater
    (insideOf)
    simpleUpdater
    to another file
  either and option (nullable)
  templates
  asyncState
    asyncOperation
  coroutines
  immutable
  operation extractor (template + core, coroutine + core)
  authentication
  table
  gallery
  filter


Frontend
  Domains scaffolder from spec
  Coroutines
  Updaters
    Updater::inside
  Templates
    Compositions
  Library of utilities
    Forms
    Tables
    AsyncOperation
  Frontend framework customization

Backend
  OData-style queries
  Entities and relations scaffolder
  Expressjs and some ORM
  Endpoints scaffolder
  Backend framework and language customization



```
domains
  auth
    state: username, organization
    coroutines: load username, load organization
    api: login
  main
    when: auth.state is loaded
    reads: auth.state
    tasks
      actions
        simple-action
          a
          b
          c
        simple-modal
          x
          y
          z
        simple-modal-with-extra-data
          p
          q
          r
      table
        columns
          api: load-columns
        rows
          api: load-rows-chunk
        filter
          reads: tasks.state
    document-viewer
      writes-to: dashboard.select-cells
      actions: set-selected-cells, show, hide, show-highlighted, hide-highlighted
      thumbnails
      pages
    dashboard
      writes-to: document-viewer.set-selected-cells, show, hide, show-highlighted, hide-highlighted
      actions: select-cells
```
