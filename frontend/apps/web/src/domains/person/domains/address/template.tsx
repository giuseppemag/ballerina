import { PromiseRepo, Unit, Form, StringForm, FormLabel, NumberForm, SearchableInfiniteStreamForm } from "ballerina-core";
import { Address, AddressFormState, City, PersonFormPredicateContext as PersonFormPredicatesContext } from "playground-core";
import { PersonFieldViews } from "../../views/field-views";


export const AddressFormBuilder = Form<Address, AddressFormState, PersonFormPredicatesContext, Unit>().Default<keyof Address>();
export const AddressFormConfig = AddressFormBuilder.config(
  {
    street: StringForm<PersonFormPredicatesContext & FormLabel, Unit>(
      _ => PromiseRepo.Default.mock(() => [...(_.length < 3 ? ["street should be at least 3 characters long"] : [])]))
      .withView(PersonFieldViews.StringView())
      .mapContext(_ => ({ ..._, label: "street" })),
    number: NumberForm<PersonFormPredicatesContext & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
      .withView(PersonFieldViews.NumberView())
      .mapContext(_ => ({ ..._, label: "number" })),
    city: SearchableInfiniteStreamForm<City, PersonFormPredicatesContext & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => [...(_.kind == "r" ? ["a city must be selected"] : [])]))
      .withView(PersonFieldViews.InfiniteStreamView())
      .mapContext(_ => ({ ..._, label: "city" })),
  }
);
export const AddressForm = AddressFormBuilder.template(AddressFormConfig, _ => PromiseRepo.Default.mock(() => []));
