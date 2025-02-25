module automatic_tests

open NUnit.Framework
open Ballerina.DSL.FormEngine.Runner
open Ballerina.Collections.Sum
open Ballerina.Errors

[<SetUp>]
let Setup () =
  ()

let rec iterateTestsOverFiles baseName start count = 
  if count <= 0 then ()
  else
    let fileName = $"{baseName}{start}.json"
    do System.Console.WriteLine $"Filename = {fileName}"
    let actual = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang fileName "./generated-output/models" null null "./input-forms/go-config.json"
    match actual, count with
    | Right err,1 -> Errors.Print "wrong predicate structure" err
    | _ -> ()  
    Assert.That(actual.IsRight, Is.EqualTo(true))
    iterateTestsOverFiles baseName (start+1) (count-1)

// [<Test>]
// let CorrectSpec() =
//   let actual = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/person-config.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   match actual with
//   | Right err -> Errors.Print "person-config" err
//   | _ -> ()
//   Assert.That(actual.IsLeft, Is.EqualTo(true))

// [<Test>]
// let MissingReference() =
//   let actual = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/missing reference.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   Assert.That(actual.IsRight, Is.EqualTo(true))

// [<Test>]
// let WrongEnumStructure() =
//   let actual1 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong enum structure 1.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   let actual2 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong enum structure 2.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   let actual3 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong enum structure 3.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   Assert.That(actual1.IsRight && actual2.IsRight && actual3.IsRight, Is.EqualTo(true))

// [<Test>]
// let WrongTypeStructure() =
//   let actual1 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong type structure 1.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   let actual2 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong type structure 2.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   let actual3 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong type structure 3.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   let actual4 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong type structure 4.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   let actual5 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong type structure 5.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   let actual6 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong type structure 6.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   let actual7 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong type structure 7.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   let actual8 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong type structure 8.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   Assert.That(actual1.IsRight && actual2.IsRight && actual3.IsRight && actual4.IsRight && actual5.IsRight && actual6.IsRight && actual7.IsRight && actual8.IsRight, Is.EqualTo(true))

// [<Test>]
// let WrongAPIStructure() =
//   let actual1 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong api structure 1.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   let actual2 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong api structure 2.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   let actual3 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong api structure 3.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   let actual4 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong api structure 4.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   Assert.That(actual1.IsRight && actual2.IsRight, Is.EqualTo(true))

// [<Test>]
// let WrongFormStructure() =
//   let actual1 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong form structure 1.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   let actual2 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong form structure 2.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   let actual3 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong form structure 3.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   let actual4 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong form structure 4.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   let actual5 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong form structure 5.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   let actual6 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong form structure 6.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   let actual7 = Ballerina.DSL.FormEngine.Runner.runSingle true FormsGenTarget.golang "./input-forms/with errors/wrong form structure 7.json" "./generated-output/models" null null "./input-forms/go-config.json"
//   Assert.That(actual1.IsRight && actual2.IsRight && actual3.IsRight && actual4.IsRight && actual5.IsRight && actual6.IsRight && actual7.IsRight, Is.EqualTo(true))

[<Test>]
let WrongPredicateStructure() =
  iterateTestsOverFiles "./input-forms/with errors/wrong predicate structure " 1 9
