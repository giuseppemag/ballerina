import { SingletonFormWritableState, simpleUpdater, FormTemplateAndDefinition, SingletonFormTemplate, StringConfig, CustomTypeConfig, OrderedMapRepo, Guid, FieldViews } from "ballerina-core";
import { Invoice } from "../state";
import { InvoiceLine } from "../domains/invoice-line/state";
import { InvoiceLineForm, InvoiceLineFormConfig } from "../domains/invoice-line/views/form";

type CustomFields = { lines: InvoiceLineForm; };
export type InvoiceForm = SingletonFormWritableState<Invoice, never, never, CustomFields>;
export const InvoiceForm = {
  Default: (): InvoiceForm => ({
    lines: InvoiceLineForm.Default()
  }),
  Updaters: {
    ...simpleUpdater<InvoiceForm>()("lines"),
  }
};

export type InvoiceFormConfig = FormTemplateAndDefinition<Invoice, never, never, CustomFields>;
export const InvoiceFormConfig: FormTemplateAndDefinition<Invoice, never, never, CustomFields> = {
  template: SingletonFormTemplate<Invoice, never, never, CustomFields>(),
  entityDescriptor: {
    id: StringConfig.Default(),
    description: StringConfig.Default(),
    lines: CustomTypeConfig.Default<Invoice, never, never, CustomFields, "lines">("lines",
      props => <ul>
        {props.value.valueSeq().map(_ => <li>
          <InvoiceLineFormConfig.template
            context={{
              entity: _,
              ...InvoiceLineFormConfig
            }}
            setState={InvoiceForm.Updaters.lines.then(props.setState)}
            foreignMutations={{
              updateEntity(k, newFieldValue) {
                const next = OrderedMapRepo.Updaters.update<Guid, InvoiceLine>(_.id, _ => ({ ..._, [k]: newFieldValue }))(
                  props.value);
                props.onChange(next);
              },
            }}
            view={FieldViews.Default.simple()} />
        </li>
        ).valueSeq().toArray()}
      </ul>),
  },
  fieldOrder: ["description", "lines"],
};
