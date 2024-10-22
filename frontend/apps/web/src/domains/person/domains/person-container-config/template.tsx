import { MappedEntityFormTemplate, Unit } from "ballerina-core";
import { Person, PersonFormState } from "playground-core";
import { PersonFormPredicateContext } from "playground-core";
import { PersonConfig, personConfigToPersonMapping } from "playground-core";
import { PersonForm } from "../../template";


export const MappedPersonForm: MappedEntityFormTemplate<
  PersonConfig, Person, PersonFormState, PersonFormPredicateContext & { columns: [Array<keyof Person>, Array<keyof Person>, Array<keyof Person>]; }, Unit> = 
  MappedEntityFormTemplate(personConfigToPersonMapping, PersonForm);
