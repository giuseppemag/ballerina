import { TemplateProps, AsyncState, id, Guid, messageBox, unit } from "@ballerina/core";
import { DataSyncReadonlyContext, DataSyncWritableState, DataSyncForeignMutationsExpected, DataSync } from "../state";
import { User } from "../domains/entities/domains/singletons/domains/user/state";
import { Forms } from "../domains/forms/state";
import { FieldViews } from "@ballerina/core";
import { UserFormConfig } from "../domains/entities/domains/singletons/domains/user/views/form";
import { AddressFormConfig, AddressForm } from "../domains/entities/domains/collections/domains/address/views/form";
import { InvoiceFormConfig, InvoiceForm } from "../domains/entities/domains/collections/domains/invoice/views/form";

export const UserEmbeddedTemplate =
  UserFormConfig.template
    .mapContext<DataSyncReadonlyContext & DataSyncWritableState>(_ =>
      AsyncState.Operations.hasValue(_.entities.singletons.user.entity.value.value.sync) &&
        _.entities.singletons.user.entity.value.value.sync.value.kind == "l" ?
        {
          ..._.forms.user,
          entity: _.entities.singletons.user.entity.value.value.sync.value.value,
          ...UserFormConfig
        }
        : undefined
    ).mapState<DataSyncWritableState>(_ => DataSync().Updaters.Core.forms.children.Core.user(_))
    .mapForeignMutationsFromProps<DataSyncForeignMutationsExpected>(props => ({
      updateEntity(k, newFieldValue) {
        if (AsyncState.Operations.hasValue(props.context.entities.singletons.user.entity.value.value.sync) &&
          props.context.entities.singletons.user.entity.value.value.sync.value.kind == "l")
          DataSync().ForeignMutations({ context: props.context, setState: props.setState })
            .updateSingleton("user", props.context.entities.singletons.user.entity.value.value.sync.value.value.id)
            ("edit", unit, User.Updaters.left(_ => ({ ..._, [k]: newFieldValue })))
      },
    }))


export const AddressEmbeddedTemplate =
  AddressFormConfig.template
    .mapContext<{ entityId: Guid } & DataSyncReadonlyContext & DataSyncWritableState>(_ => {
      if (!AsyncState.Operations.hasValue(_.entities.collections.addresses.entities.sync)) return undefined
      const collectionEntity = _.entities.collections.addresses.entities.sync.value.get(_.entityId)
      if (!collectionEntity || !AsyncState.Operations.hasValue(collectionEntity.value.value.sync)) return undefined
      return {
        entity: collectionEntity.value.value.sync.value,
        ...AddressFormConfig
      }
    }).mapStateFromProps<DataSyncWritableState>(([props, _]) =>
      DataSync().Updaters.Core.forms(Forms.Updaters.Core.address.upsert([props.context.entityId, () => _(AddressForm.Default()), _])))
    .mapForeignMutationsFromProps<DataSyncForeignMutationsExpected>(props => ({
      updateEntity(k, newFieldValue) {
        if (!AsyncState.Operations.hasValue(props.context.entities.collections.addresses.entities.sync)) return
        const collectionEntity = props.context.entities.collections.addresses.entities.sync.value.get(props.context.entityId)
        if (!collectionEntity || !AsyncState.Operations.hasValue(collectionEntity.value.value.sync)) return
        const entity = collectionEntity.value.value.sync.value
        DataSync().ForeignMutations({ context: props.context, setState: props.setState })
          .updateCollectionElement("addresses", entity.id)
          ("edit", unit, _ => ({ ..._, [k]: newFieldValue }))
      },
    }))

export const InvoiceEmbeddedTemplate =
  InvoiceFormConfig.template
    .mapContextFromProps<{ entityId: Guid } & DataSyncReadonlyContext & DataSyncWritableState>(props => {
      const _ = props.context
      if (!AsyncState.Operations.hasValue(_.entities.collections.invoices.entities.sync)) return undefined
      const collectionEntity = _.entities.collections.invoices.entities.sync.value.get(_.entityId)
      if (!collectionEntity || !AsyncState.Operations.hasValue(collectionEntity.value.value.sync)) return undefined
      const formState = _.forms.invoices.get(_.entityId) ?? InvoiceForm.Default()
      return {
        ...formState,
        entity: collectionEntity.value.value.sync.value,
        ...InvoiceFormConfig
      }
    }).mapStateFromProps<DataSyncWritableState>(([props, _]) =>
      DataSync().Updaters.Core.forms(Forms.Updaters.Core.invoice.upsert([props.context.entityId, () => _(InvoiceForm.Default()), _])))
    .mapForeignMutationsFromProps<DataSyncForeignMutationsExpected>(props => ({
      updateEntity(k, newFieldValue) {
        if (!AsyncState.Operations.hasValue(props.context.entities.collections.invoices.entities.sync)) return
        const collectionEntity = props.context.entities.collections.invoices.entities.sync.value.get(props.context.entityId)
        if (!collectionEntity || !AsyncState.Operations.hasValue(collectionEntity.value.value.sync)) return
        const entity = collectionEntity.value.value.sync.value
        DataSync().ForeignMutations({ context: props.context, setState: props.setState })
          .updateCollectionElement("invoices", entity.id)
          ("edit", unit, _ => ({ ..._, [k]: newFieldValue }))
      },
    }))

export const DataSyncView = (props: TemplateProps<DataSyncReadonlyContext & DataSyncWritableState, DataSyncWritableState, DataSyncForeignMutationsExpected>) => <>
  <table>
    <tbody>
      <tr>
        <th>User</th>
        <th>Addresses</th>
        <th>Invoices</th>
        <th>Queue</th>
      </tr>
      <tr>
        <td>
          <>
            {AsyncState.Operations.hasValue(props.context.entities.singletons.user.entity.value.value.sync) &&
              props.context.entities.singletons.user.entity.value.value.sync.value.kind == "l" ?
              <UserEmbeddedTemplate
                {...props}
                view={FieldViews.Default.simple()}
              />
              : <>No user available</>}
              <button onClick={() => 
                DataSync().ForeignMutations({ context: props.context, setState: props.setState }).reloadSingleton("user", 
                  AsyncState.Operations.hasValue(props.context.entities.singletons.user.entity.value.value.sync) && 
                  props.context.entities.singletons.user.entity.value.value.sync.value.kind == "l" ?
                    props.context.entities.singletons.user.entity.value.value.sync.value.value.id : "")
            }>Reload</button>
          </>
        </td>
        <td>
          <table>
            <tbody>
              {AsyncState.Operations.hasValue(props.context.entities.collections.addresses.entities.sync) ?
                props.context.entities.collections.addresses.entities.sync.value.valueSeq().map(address =>
                  <tr>
                    <td>
                      {
                        AsyncState.Operations.hasValue(address.value.value.sync) ?
                          <AddressEmbeddedTemplate
                            {...{ ...props, context: { ...props.context, entityId: address.value.value.sync.value.id } }}
                            view={FieldViews.Default.simple()}
                          />
                          :
                          <>Loading...</>
                      }
                    </td>
                  </tr>
                )
                :
                <tr>
                  <td>
                    Loading...
                  </td>
                </tr>}
            </tbody>
          </table>
        </td>
        <td>
          <table>
            <tbody>
              {AsyncState.Operations.hasValue(props.context.entities.collections.invoices.entities.sync) ?
                props.context.entities.collections.invoices.entities.sync.value.valueSeq().map(invoice =>
                  <tr>
                    <td>
                      {
                        AsyncState.Operations.hasValue(invoice.value.value.sync) ?
                          <InvoiceEmbeddedTemplate
                            {...{ ...props, context: { ...props.context, entityId: invoice.value.value.sync.value.id } }}
                            view={FieldViews.Default.simple()}
                          />
                          :
                          <>Loading...</>
                      }
                    </td>
                  </tr>
                )
                :
                <tr>
                  <td>
                    Loading...
                  </td>
                </tr>}
            </tbody>
          </table>
        </td>
        <td>
          <table>
            <tbody>
              <tr>
                <td>
                  {JSON.stringify(props.context.forms)}
                </td>
              </tr>
              {
                props.context.queue.map(_ =>
                  <tr>
                    <td>{_.entity}[{_.entityId}].{_.mutation}</td>
                  </tr>
                ).valueSeq()
              }
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</>;

