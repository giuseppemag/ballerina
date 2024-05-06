#! /usr/bin/env node

import commandLineArgs from 'command-line-args'
import * as fs from "fs"
import * as path from 'path'
import capitalize from 'capitalize'
const pathDepth = require('path-depth')

const optionDefinitions = [
  { name: 'name', alias: 'n', type: String },
  { name: 'path', type: String },
  { name: 'frameworkPath', type: String },
  { name: 'override', type: Boolean,  },
]

const options = commandLineArgs(optionDefinitions)
const domainName = options.name as string
const domainPath = options.path as string
const frameworkPath = (options.frameworkPath || "src/domains/core") as string
const override = !!options.override 

const createDir = (d:string) => {
  const p = path.join(process.cwd(), domainPath, domainName, d)
  console.log(`Creating dir ${p}`)
  if (!fs.existsSync(p))
    fs.mkdirSync(p)
}
const createFile = (f:string, defaultText:string) => {
  const p = path.join(process.cwd(), domainPath, domainName, f)
  console.log(`Creating file ${p}`)
  if (override && fs.existsSync(p))
    fs.rmSync(p)
  fs.appendFileSync(p, defaultText)
}



const stateDefault = () => `import { ForeignMutationsInput } from "${"../".repeat(pathDepth(domainPath) - pathDepth(frameworkPath) + 2)}core/foreignMutations/state"
import { Unit } from "${"../".repeat(pathDepth(domainPath) - pathDepth(frameworkPath) + 2)}core/fun/domains/unit/state"

export type ${capitalize(domainName)}State = {}
export const ${capitalize(domainName)}State = {
  Default:() : ${capitalize(domainName)}State => ({}),
  Updaters:{
    Core:{
      
    },
    Template:{
      
    },
    Coroutine:{
      
    },
  },
  ForeignMutations:(_:ForeignMutationsInput<${capitalize(domainName)}ReadonlyContext, ${capitalize(domainName)}WritableState>) => ({})
}

export type ${capitalize(domainName)}ReadonlyContext = Unit
export type ${capitalize(domainName)}WritableState = ${capitalize(domainName)}State
export type ${capitalize(domainName)}ForeignMutationsExposed = ReturnType<typeof ${capitalize(domainName)}State["ForeignMutations"]>
export type ${capitalize(domainName)}ForeignMutationsExpected = Unit
`

export const templateDefault = () => `import { Template } from "${"../".repeat(pathDepth(domainPath) - pathDepth(frameworkPath) + 2)}core/template/state";
import { simpleUpdater } from "${"../".repeat(pathDepth(domainPath) - pathDepth(frameworkPath) + 2)}core/fun/domains/updater/domains/simpleUpdater/state"
import { ${capitalize(domainName)}CoroutinesRunner } from "./coroutines/runner";
import { ${capitalize(domainName)}ReadonlyContext, ${capitalize(domainName)}WritableState, ${capitalize(domainName)}ForeignMutationsExpected } from "./state";

export const ${capitalize(domainName)}Template = Template.Default<${capitalize(domainName)}ReadonlyContext, ${capitalize(domainName)}WritableState, ${capitalize(domainName)}ForeignMutationsExpected>(props =>
  <>
    <h1>${capitalize(domainName)} template</h1>
    <h2>props.context</h2>
    <p>{JSON.stringify(props.context)}</p>
  </>
).any([
  ${capitalize(domainName)}CoroutinesRunner.mapContext(_ => ({..._, events:[]}))
])`

export const builderDefault = () => `import { CoTypedFactory } from "../../../../../../../core/coroutines/builder";
import { ${capitalize(domainName)}ReadonlyContext, ${capitalize(domainName)}WritableState } from "../state";

export const Co = CoTypedFactory<${capitalize(domainName)}ReadonlyContext, ${capitalize(domainName)}WritableState, never>()`

export const runnerDefault = () => `import { ${capitalize(domainName)}ForeignMutationsExpected } from "../state";
import { Co } from "./builder";

export const ${capitalize(domainName)}CoroutinesRunner = 
  Co.Template<${capitalize(domainName)}ForeignMutationsExpected>(
    Co.Repeat(
      Co.Seq([
        Co.Wait(2500)
      ])
    ),
    { runFilter:_ => true }
  )`

createDir("")
createDir("coroutines")
createDir("views")
createDir("domains")
createFile("template.tsx", templateDefault())
createFile("state.ts", stateDefault())
createFile("coroutines/builder.ts", builderDefault())
createFile("coroutines/runner.ts", runnerDefault())

// console.log(options)
