namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs
open Ballerina.DSL.FormEngine.Model
open Ballerina.Core
open Enum

  type GolangEntityGETters = { FunctionName:string; EntityNotFoundErrorConstructor:string; Entities:List<EntityApi> } with
    static member ToGolang (_:GolangContext) (getters:GolangEntityGETters) = 
        let entityAPIsWithGET = getters.Entities
        StringBuilder.Many(
            seq {
              yield StringBuilder.One $"func {getters.FunctionName}[id any, result any]("

              yield StringBuilder.Many(
                entityAPIsWithGET
                |> Seq.map (fun e ->
                  StringBuilder.Many(
                    seq {
                      yield StringBuilder.One($$"""get{{e.EntityName}} func (id) ({{e.TypeId.TypeName}},error), """)

                      yield
                        StringBuilder.One(
                          $$"""serialize{{e.EntityName}} func ({{e.TypeId.TypeName}}) (result,error), """
                        )
                    }
                  )))

              yield
                StringBuilder.One
                  ") func (string, id) (result,error) { return func (entityName string, entityId id) (result,error) {\n"

              yield StringBuilder.One "    var resultNil result;\n"
              yield StringBuilder.One "    switch entityName {\n"

              for entityApi in entityAPIsWithGET do
                yield StringBuilder.One $$"""      case "{{entityApi.TypeId.TypeName}}Entity":  """
                yield StringBuilder.One "\n"
                yield StringBuilder.One $$"""        var res, err = get{{entityApi.EntityName}}(entityId);  """
                yield StringBuilder.One "\n"

                yield StringBuilder.One $$"""        if err != nil { return resultNil, err }  """
                yield StringBuilder.One "\n"
                yield StringBuilder.One $$"""        return serialize{{entityApi.EntityName}}(res); """

                yield StringBuilder.One "\n"

              yield StringBuilder.One "    }\n"

              yield
                StringBuilder.One
                  $"    return resultNil, {getters.EntityNotFoundErrorConstructor}(entityName);\n"

              yield StringBuilder.One "  }\n"
              yield StringBuilder.One "}\n\n"
            })        
