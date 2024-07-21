import { SingletonFormWritableState, Unit, FormTemplateAndDefinition, SingletonFormTemplate, StringConfig } from "ballerina-core";
import { UserData } from "../state";


export type UserForm = SingletonFormWritableState<UserData, never, never, Unit>;
export const UserForm = {
  Default: (): UserForm => ({})
};
export const UserFormConfig: FormTemplateAndDefinition<UserData, never, never, Unit> = {
  template: SingletonFormTemplate<UserData, never, never, Unit>(),
  entityDescriptor: {
    id: StringConfig.Default(),
    name: StringConfig.Default(),
    surname: StringConfig.Default(),
  },
  fieldOrder: ["name", "surname"],
};
