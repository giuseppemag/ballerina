import { TemplateProps, AsyncState, id, Guid, messageBox, unit } from "ballerina-core";
import { DataSyncReadonlyContext, DataSyncWritableState, DataSyncForeignMutationsExpected, DataSync } from "../state";
import { User } from "../domains/entities/domains/singletons/domains/user/state";

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
                <></>
              // <UserEmbeddedTemplate
              //   {...props}
              //   view={FieldViews.Default.simple()}
              // />
              : <>No user available</>}
            <button onClick={() =>
              DataSync().ForeignMutations({ context: props.context, setState: props.setState }).updateSingleton("user",
                AsyncState.Operations.hasValue(props.context.entities.singletons.user.entity.value.value.sync) &&
                  props.context.entities.singletons.user.entity.value.value.sync.value.kind == "l" ?
                  props.context.entities.singletons.user.entity.value.value.sync.value.value.id : "")
                ("reload", unit, id)
            }>Reload</button>
            <>
              {
                JSON.stringify((props.context.entities.singletons.user.entity.value as any).__debugLastSynchronizedValue)
              }
            </>
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
                        <></>
                        // <AddressEmbeddedTemplate
                        //     {...{ ...props, context: { ...props.context, entityId: address.value.value.sync.value.id } }}
                        //     view={FieldViews.Default.simple()}
                        //   />
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
                        <></>
                        // <InvoiceEmbeddedTemplate
                        //     {...{ ...props, context: { ...props.context, entityId: invoice.value.value.sync.value.id } }}
                        //     view={FieldViews.Default.simple()}
                        //   />
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
              {/* <tr>
                <td>
                  {JSON.stringify(props.context.forms)}
                </td>
              </tr> */}
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

