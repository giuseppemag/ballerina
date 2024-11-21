#! /usr/bin/env node

import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import * as fs from "fs"
import * as path from 'path'
import capitalize from 'capitalize'
const pathDepth = require('path-depth')


const optionDefinitions = [
  { name: 'name', alias: 'n', type: String, helpText: `The name of the domain folder, also used for type definitions/repository/etc.`, required: true },
  { name: 'path', type: String, helpText: `The path of the domain, relative to the location from which the tool is executed`, required: true },
  // { name: 'frameworkPath', type: String, helpText: `The path of the "core" folder, relative to the location from which the tool is executed`, required: false },
  { name: 'override', type: Boolean, helpText: `[DANGEROUS] Overwrite existing files`, required: false },
  { name: 'help', type: Boolean, helpText: `Print this guide`, required: false },
]

const showHelp = () => {

  const sections = [
    {
      header: 'Create domain',
      content: 'Generates a domain placeholder.'
    },
    {
      header: 'Options',
      optionList:
        optionDefinitions.map(_ =>
        ({
          name: _.name,
          typeLabel: _.type == String ? "string" : _.type == Boolean ? "boolean" : "",
          description: `${_.helpText} ${(_.required ? "(required)" : "(optional)")}`,
        })
        )
    }
  ]
  const usage = commandLineUsage(sections)
  // console.log(usage)
}

try {
  const options = commandLineArgs(optionDefinitions)
  if (!!options.help) {
    showHelp()
  } else {
    const domainNameHyphenated = options.name as string
    const domainNameCamelCased = domainNameHyphenated.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
    // console.log(domainNameCamelCased)
    const domainPath = options.path as string
    // const frameworkPath = (options.frameworkPath || "src/domains/core") as string
    const override = !!options.override

    const createDir = (d: string) => {
      const p = path.join(process.cwd(), domainPath, domainNameHyphenated, d)
      // console.log(`Creating dir ${p}`)
      if (!fs.existsSync(p))
        fs.mkdirSync(p)
    }
    const createFile = (f: string, defaultText: string) => {
      const p = path.join(process.cwd(), domainPath, domainNameHyphenated, f)
      // console.log(`Creating file ${p}`)
      if (override && fs.existsSync(p))
        fs.rmSync(p)
      fs.appendFileSync(p, defaultText)
    }



    const stateDefault = () => `import { ForeignMutationsInput, simpleUpdater, Unit } from "ballerina-core"

export type ${capitalize(domainNameCamelCased, true)} = {}
export const ${capitalize(domainNameCamelCased, true)} = {
  Default:() : ${capitalize(domainNameCamelCased, true)} => ({}),
  Updaters:{
    Core:{

    },
    Template:{

    },
    Coroutine:{

    },
  },
  ForeignMutations:(_:ForeignMutationsInput<${capitalize(domainNameCamelCased, true)}ReadonlyContext, ${capitalize(domainNameCamelCased, true)}WritableState>) => ({})
}

export type ${capitalize(domainNameCamelCased, true)}ReadonlyContext = Unit
export type ${capitalize(domainNameCamelCased, true)}WritableState = ${capitalize(domainNameCamelCased, true)}
export type ${capitalize(domainNameCamelCased, true)}ForeignMutationsExposed = ReturnType<typeof ${capitalize(domainNameCamelCased, true)}["ForeignMutations"]>
export type ${capitalize(domainNameCamelCased, true)}ForeignMutationsExpected = Unit
`

    const templateDefault = () => `import { Template } from "ballerina-core";
import { ${capitalize(domainNameCamelCased, true)}CoroutinesRunner } from "./coroutines/runner";
import { ${capitalize(domainNameCamelCased, true)}ReadonlyContext, ${capitalize(domainNameCamelCased, true)}WritableState, ${capitalize(domainNameCamelCased, true)}ForeignMutationsExpected } from "./state";

export const ${capitalize(domainNameCamelCased, true)}Template = Template.Default<${capitalize(domainNameCamelCased, true)}ReadonlyContext, ${capitalize(domainNameCamelCased, true)}WritableState, ${capitalize(domainNameCamelCased, true)}ForeignMutationsExpected>(props =>
  <>
    <h1>${capitalize(domainNameCamelCased, true)} template</h1>
    <h2>props.context</h2>
    <p>{JSON.stringify(props.context)}</p>
  </>
).any([
  ${capitalize(domainNameCamelCased, true)}CoroutinesRunner
])`

    const builderDefault = () => `import { CoTypedFactory } from "ballerina-core";
import { ${capitalize(domainNameCamelCased, true)}ReadonlyContext, ${capitalize(domainNameCamelCased, true)}WritableState } from "../state";

export const Co = CoTypedFactory<${capitalize(domainNameCamelCased, true)}ReadonlyContext, ${capitalize(domainNameCamelCased, true)}WritableState>()`

    const runnerDefault = () => `import { ${capitalize(domainNameCamelCased, true)}ForeignMutationsExpected } from "../state";
import { Co } from "./builder";

export const ${capitalize(domainNameCamelCased, true)}CoroutinesRunner = 
  Co.Template<${capitalize(domainNameCamelCased, true)}ForeignMutationsExpected>(
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
  }
} catch (error) {
  console.error(`There was an error: ${error}.`)
  showHelp()
}
