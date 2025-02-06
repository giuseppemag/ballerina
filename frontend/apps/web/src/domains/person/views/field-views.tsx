import { FormLabel, DateView, EnumView, EnumMultiselectView, StringView, NumberView, BooleanView, SearchableInfiniteStreamView, InfiniteStreamMultiselectView, CommonFormState, AsyncState, BaseEnumContext, ListFieldView, unit, Value, StreamValue, EnumValue } from "ballerina-core";
import { PersonFormPredicateContext } from "playground-core";

export const MostUglyValidationDebugView = (props: { context: { showAllErrors: boolean } & {commonFormState: CommonFormState} }) =>
  props.context.commonFormState.modifiedByUser && props.context.commonFormState.validation.sync && AsyncState.Operations.isLoading(props.context.commonFormState.validation.sync) ?
    <>🔄</>
    :
    (props.context.showAllErrors || props.context.commonFormState.modifiedByUser) && props.context.commonFormState.validation.sync && AsyncState.Operations.hasValue(props.context.commonFormState.validation.sync) &&
      props.context.commonFormState.validation.sync.value.length > 0 ?
      <table>
        <tr>
          <td>
            validation errors
          </td>
          <td>
            {JSON.stringify(props.context.commonFormState.validation.sync.value)}
          </td>
        </tr>
      </table>
      :
      <></>


export const PersonFieldViews = {
  BooleanView: <Context extends FormLabel & { showAllErrors: boolean }, ForeignMutationsExpected>(): BooleanView<Context, ForeignMutationsExpected> =>
    props =>
      <>
        {props.context.label && <h3>{props.context.label}</h3>}
        <input type="checkbox" checked={props.context.value}
          onChange={e => props.foreignMutations.setNewValue(e.currentTarget.checked)} />
        <MostUglyValidationDebugView {...props} />
      </>,
  NumberView: <Context extends FormLabel & { showAllErrors: boolean }, ForeignMutationsExpected>(): NumberView<Context, ForeignMutationsExpected> =>
    props =>
      <>
        {props.context.label && <h3>{props.context.label}</h3>}
        <input type="number" value={props.context.value}
          onChange={e => props.foreignMutations.setNewValue(~~parseInt(e.currentTarget.value))} />
        <MostUglyValidationDebugView {...props} />
      </>,
  StringView: <Context extends FormLabel & { showAllErrors: boolean }, ForeignMutationsExpected>(): StringView<Context, ForeignMutationsExpected> =>
    props =>
      <>
        {props.context.label && <h3>{props.context.label}</h3>}
        <input value={props.context.value}
          onChange={e => props.foreignMutations.setNewValue(e.currentTarget.value)} />
        <MostUglyValidationDebugView {...props} />
      </>,
  DateView: <Context extends FormLabel & { showAllErrors: boolean }, ForeignMutationsExpected>(): DateView<Context, ForeignMutationsExpected> =>
    props =>
      <>
        {props.context.label && <h3>{props.context.label}</h3>}
        <input value={props.context.customFormState.possiblyInvalidInput}
          onChange={e => props.foreignMutations.setNewValue(e.currentTarget.value)
          } />
        <MostUglyValidationDebugView {...props} />
      </>,
  EnumView: <Context extends FormLabel & BaseEnumContext<Element> & { showAllErrors: boolean }, Element extends EnumValue, ForeignMutationsExpected>(): EnumView<Context, Element, ForeignMutationsExpected> =>
    props => {
    const selectionValue = props.context.value;
    const selectedId =  selectionValue.kind == "l" ? selectionValue.value.Value : undefined;
    const displayValue = selectionValue.kind == "l" ? selectionValue.value.Value : undefined
    return <>
      {props.context.label && <h3>{props.context.label}</h3>}
      {props.context.activeOptions == "loading" ?
        "loading options" :
        <select value={selectedId}
          onChange={e => props.foreignMutations.setNewValue(e.currentTarget.value)}>
          <>
            <option></option>
            {props.context.activeOptions.map(o =>
              <option value={selectedId}>
                {displayValue}
              </option>
            )}
          </>
        </select>}
      <MostUglyValidationDebugView {...props} />
    </>},
  EnumMultiselectView: <Context extends FormLabel & BaseEnumContext<Element> & { showAllErrors: boolean }, Element extends EnumValue, ForeignMutationsExpected>(): EnumMultiselectView<Context, Element, ForeignMutationsExpected> =>
    props => <>
      {props.context.label && <h3>{props.context.label}</h3>}
      {props.context.activeOptions == "loading" ?
        "loading options" :
        <select multiple value={props.context.selectedIds}
          onChange={e => props.foreignMutations.setNewValue(Array.from(e.currentTarget.options).filter(_ => _.selected).map(_ => _.value))}>
          <>
            {props.context.activeOptions.map(o =>
            <option value={o.Value}>
                {o.Value}
              </option>
            )}
          </>
        </select>}
      <MostUglyValidationDebugView {...props} />
    </>,
  InfiniteStreamView: <Element extends StreamValue, Context extends FormLabel & { showAllErrors: boolean }, ForeignMutationsExpected>():
    SearchableInfiniteStreamView<Element, Context, ForeignMutationsExpected> =>
    props =>
      <>
        {props.context.label && <h3>{props.context.label}</h3>}
        <button onClick={() => props.foreignMutations.toggleOpen()}>
          {props.context.value.kind == "l" && props.context.value.value.DisplayValue} {props.context.customFormState.status == "open" ? "➖" : "➕"}
        </button>
        <button onClick={() => props.foreignMutations.clearSelection()
        }>❌</button>
        {
          props.context.customFormState.status == "closed" ? <></> :
            <>
              <input value={props.context.customFormState.searchText.value}
                onChange={e => props.foreignMutations.setSearchText(e.currentTarget.value)}
              />
              <ul>
                {
                  props.context.customFormState.stream.loadedElements.valueSeq().map(chunk =>
                    chunk.data.valueSeq().map(element =>
                      <li>
                        <button onClick={() => props.foreignMutations.select(element)}>
                          {element.DisplayValue} {props.context.value.kind == "l" && props.context.value.value.Id == element.Id ? "✅" : ""}
                        </button>
                      </li>
                    )
                  )
                }
              </ul>
            </>
        }
        <MostUglyValidationDebugView {...props} />
        <button disabled={props.context.hasMoreValues == false}
          onClick={() => props.foreignMutations.loadMore()}>⋯</button>
        <button onClick={() => props.foreignMutations.reload()}>🔄</button>
      </>,
  InfiniteStreamMultiselectView: <Element extends StreamValue, Context extends FormLabel & { showAllErrors: boolean }, ForeignMutationsExpected>():
    InfiniteStreamMultiselectView<Element, Context, ForeignMutationsExpected> =>
    props =>
      <>
        {props.context.label && <h3>{props.context.label}</h3>}
        <button onClick={() => props.foreignMutations.toggleOpen()}>
          {props.context.value.map(_ => _.DisplayValue).join(", ")} {props.context.customFormState.status == "open" ? "➖" : "➕"}
        </button>
        <button onClick={() => props.foreignMutations.clearSelection()}>
          ❌
        </button>
        {
          props.context.customFormState.status == "closed" ? <></> :
            <>
              <input value={props.context.customFormState.searchText.value}
                onChange={e => props.foreignMutations.setSearchText(e.currentTarget.value)}
              />
              <ul>
                {
                  props.context.availableOptions.map(element =>
                    <li>
                      <button onClick={() => props.foreignMutations.toggleSelection(element)
                      }>
                        {element.DisplayValue} {props.context.value.has(element.Id) ? "✅" : ""}
                      </button>
                    </li>
                  )
                }
              </ul>
            </>
        }
        <MostUglyValidationDebugView {...props} />
        <button disabled={props.context.hasMoreValues == false}
          onClick={() => props.foreignMutations.loadMore()}>
          ⋯
        </button>
        <button onClick={() => props.foreignMutations.reload()
        }>🔄</button>
      </>,
  ListViews: {
    defaultList: <Element, ElementFormState, Context extends FormLabel, ForeignMutationsExpected>():
      ListFieldView<Element, ElementFormState, Context, ForeignMutationsExpected> =>
      props =>
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          <ul>
            {
              props.context.value.map((element, elementIndex) =>
                <li>
                  <button onClick={() => props.foreignMutations.remove(elementIndex)}>❌</button>
                  {
                    props.embeddedElementTemplate(elementIndex)({ ...props, view: unit })
                  }
                </li>
              )
            }
          </ul>
          <button onClick={() => props.foreignMutations.add(unit)}>➕</button>
        </>
    }
  };
