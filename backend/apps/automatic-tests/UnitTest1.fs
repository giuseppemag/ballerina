module automatic_tests

open NUnit.Framework
open Ballerina.DSL.FormEngine.Runner
open Ballerina.Collections.Sum
open Ballerina.Errors

[<SetUp>]
let Setup () =
  ()

[<Test>]
let Test1 () =
  do System.IO.Directory.GetCurrentDirectory() |> System.Console.WriteLine
  do System.IO.Directory.SetCurrentDirectory("../../../../ballerina-runtime")
  let actual = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/person/with errors/missing reference.json" "./generated-output/models" null null "./input-forms/go-config.json"
  Assert.That(actual.IsRight, Is.EqualTo(true))
