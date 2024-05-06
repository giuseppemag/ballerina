#! /usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runnerDefault = exports.builderDefault = exports.templateDefault = void 0;
const command_line_args_1 = __importDefault(require("command-line-args"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const capitalize_1 = __importDefault(require("capitalize"));
const pathDepth = require('path-depth');
const optionDefinitions = [
    { name: 'name', alias: 'n', type: String },
    { name: 'path', type: String },
    { name: 'frameworkPath', type: String },
    { name: 'override', type: Boolean, },
];
const options = (0, command_line_args_1.default)(optionDefinitions);
const domainName = options.name;
const domainPath = options.path;
const frameworkPath = (options.frameworkPath || "src/domains/core");
const override = !!options.override;
const createDir = (d) => {
    const p = path.join(process.cwd(), domainPath, domainName, d);
    console.log(`Creating dir ${p}`);
    if (!fs.existsSync(p))
        fs.mkdirSync(p);
};
const createFile = (f, defaultText) => {
    const p = path.join(process.cwd(), domainPath, domainName, f);
    console.log(`Creating file ${p}`);
    if (override && fs.existsSync(p))
        fs.rmSync(p);
    fs.appendFileSync(p, defaultText);
};
const stateDefault = () => `import { ForeignMutationsInput } from "${"../".repeat(pathDepth(domainPath) - pathDepth(frameworkPath) + 2)}core/foreignMutations/state"
import { Unit } from "${"../".repeat(pathDepth(domainPath) - pathDepth(frameworkPath) + 2)}core/fun/domains/unit/state"

export type ${(0, capitalize_1.default)(domainName)}State = {}
export const ${(0, capitalize_1.default)(domainName)}State = {
  Default:() : ${(0, capitalize_1.default)(domainName)}State => ({}),
  Updaters:{
    Core:{
      
    },
    Template:{
      
    },
    Coroutine:{
      
    },
  },
  ForeignMutations:(_:ForeignMutationsInput<${(0, capitalize_1.default)(domainName)}ReadonlyContext, ${(0, capitalize_1.default)(domainName)}WritableState>) => ({})
}

export type ${(0, capitalize_1.default)(domainName)}ReadonlyContext = Unit
export type ${(0, capitalize_1.default)(domainName)}WritableState = ${(0, capitalize_1.default)(domainName)}State
export type ${(0, capitalize_1.default)(domainName)}ForeignMutationsExposed = ReturnType<typeof ${(0, capitalize_1.default)(domainName)}State["ForeignMutations"]>
export type ${(0, capitalize_1.default)(domainName)}ForeignMutationsExpected = Unit
`;
const templateDefault = () => `import { Template } from "${"../".repeat(pathDepth(domainPath) - pathDepth(frameworkPath) + 2)}core/template/state";
import { ${(0, capitalize_1.default)(domainName)}CoroutinesRunner } from "./coroutines/runner";
import { ${(0, capitalize_1.default)(domainName)}ReadonlyContext, ${(0, capitalize_1.default)(domainName)}WritableState, ${(0, capitalize_1.default)(domainName)}ForeignMutationsExpected } from "./state";

export const ${(0, capitalize_1.default)(domainName)}Template = Template.Default<${(0, capitalize_1.default)(domainName)}ReadonlyContext, ${(0, capitalize_1.default)(domainName)}WritableState, ${(0, capitalize_1.default)(domainName)}ForeignMutationsExpected>(props =>
  <>
    <h1>${(0, capitalize_1.default)(domainName)} template</h1>
    <h2>props.context</h2>
    <p>{JSON.stringify(props.context)}</p>
  </>
).any([
  ${(0, capitalize_1.default)(domainName)}CoroutinesRunner.mapContext(_ => ({..._, events:[]}))
])`;
exports.templateDefault = templateDefault;
const builderDefault = () => `import { CoTypedFactory } from "../../../../../../../core/coroutines/builder";
import { ${(0, capitalize_1.default)(domainName)}ReadonlyContext, ${(0, capitalize_1.default)(domainName)}WritableState } from "../state";

export const Co = CoTypedFactory<${(0, capitalize_1.default)(domainName)}ReadonlyContext, ${(0, capitalize_1.default)(domainName)}WritableState, never>()`;
exports.builderDefault = builderDefault;
const runnerDefault = () => `import { ${(0, capitalize_1.default)(domainName)}ForeignMutationsExpected } from "../state";
import { Co } from "./builder";

export const ${(0, capitalize_1.default)(domainName)}CoroutinesRunner = 
  Co.Template<${(0, capitalize_1.default)(domainName)}ForeignMutationsExpected>(
    Co.Repeat(
      Co.Seq([
        Co.Wait(2500)
      ])
    ),
    { runFilter:_ => true }
  )`;
exports.runnerDefault = runnerDefault;
createDir("");
createDir("coroutines");
createDir("views");
createDir("domains");
createFile("template.tsx", (0, exports.templateDefault)());
createFile("state.ts", stateDefault());
createFile("coroutines/builder.ts", (0, exports.builderDefault)());
createFile("coroutines/runner.ts", (0, exports.runnerDefault)());
// console.log(options)
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsMEVBQStDO0FBQy9DLHVDQUF3QjtBQUN4QiwyQ0FBNEI7QUFDNUIsNERBQW1DO0FBQ25DLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUV2QyxNQUFNLGlCQUFpQixHQUFHO0lBQ3hCLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7SUFDMUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7SUFDOUIsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7SUFDdkMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxPQUFPLEdBQUk7Q0FDdEMsQ0FBQTtBQUVELE1BQU0sT0FBTyxHQUFHLElBQUEsMkJBQWUsRUFBQyxpQkFBaUIsQ0FBQyxDQUFBO0FBQ2xELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxJQUFjLENBQUE7QUFDekMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLElBQWMsQ0FBQTtBQUN6QyxNQUFNLGFBQWEsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLElBQUksa0JBQWtCLENBQVcsQ0FBQTtBQUM3RSxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQTtBQUVuQyxNQUFNLFNBQVMsR0FBRyxDQUFDLENBQVEsRUFBRSxFQUFFO0lBQzdCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDN0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFB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