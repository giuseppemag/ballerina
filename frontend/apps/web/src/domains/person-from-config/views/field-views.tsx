import { CommonFormState, AsyncState, FormLabel, BooleanView, NumberView, StringView, DateView, CollectionReference, EnumView, EnumMultiselectView, SearchableInfiniteStreamView, InfiniteStreamMultiselectView, BaseEnumContext, MaybeBooleanView, ListFieldView, unit, MapFieldView, Base64FileView, SecretView, Value, EnumReference } from "ballerina-core";
import { Category, CategoryView } from "../injected-forms/category";

export const MostUglyValidationDebugView = (props: { context: {commonFormState: CommonFormState} }) =>
  props.context.commonFormState.modifiedByUser && props.context.commonFormState.validation.sync && AsyncState.Operations.isLoading(props.context.commonFormState.validation.sync) ?
    <>🔄</>
    :
    (props.context.commonFormState.modifiedByUser) &&  props.context.commonFormState.validation.sync && AsyncState.Operations.hasValue(props.context.commonFormState.validation.sync) &&
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
  injectedCategory: {
    defaultCategory: <Context extends FormLabel, ForeignMutationsExpected>(): CategoryView<Context, ForeignMutationsExpected> =>
      props =>
        <>
            {props.context.label && <h3>{props.context.label}</h3>}
            {props.context.tooltip && <p>{props.context.tooltip}</p>}
            {props.context.details && <p><em>{props.context.details}</em></p>}
            <button style={props.context.value.category == "child" ? {borderColor: "red"} : {}} onClick={_ => props.foreignMutations.setNewValue({kind: "category", category: "child"})}>child</button>
            <button style={props.context.value.category == "adult" ? {borderColor: "red"} : {}} onClick={_ => props.foreignMutations.setNewValue({kind: "category", category: "adult"})}>adult</button>
            <button style={props.context.value.category == "senior" ? {borderColor: "red"} : {}} onClick={_ => props.foreignMutations.setNewValue({kind: "category", category: "senior"})}>senior</button>
          <MostUglyValidationDebugView {...props} />
        </>,
  },
  maybeBoolean: {
    defaultMaybeBoolean: <Context extends FormLabel, ForeignMutationsExpected>(): MaybeBooleanView<Context, ForeignMutationsExpected> =>
      props =>
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          {props.context.details && <p><em>{props.context.details}</em></p>}
          <input disabled={props.context.disabled} type="checkbox" checked={props.context.value}
            onChange={e => props.foreignMutations.setNewValue(e.currentTarget.checked)} />
          { props.context.value == undefined ? "*" : undefined }
          <MostUglyValidationDebugView {...props} />
        </>,
  },
  boolean: {
    defaultBoolean: <Context extends FormLabel, ForeignMutationsExpected>(): BooleanView<Context, ForeignMutationsExpected> =>
      props =>
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          {props.context.details && <p><em>{props.context.details}</em></p>}
          <input disabled={props.context.disabled} type="checkbox" checked={props.context.value}
            onChange={e => props.foreignMutations.setNewValue(e.currentTarget.checked)} />
          <MostUglyValidationDebugView {...props} />
        </>,
    secondBoolean: <Context extends FormLabel, ForeignMutationsExpected>(): BooleanView<Context, ForeignMutationsExpected> =>
      props =>
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          {props.context.details && <p><em>{props.context.details}</em></p>}
          <input disabled={props.context.disabled} type="checkbox" checked={props.context.value}
            onChange={e => props.foreignMutations.setNewValue(e.currentTarget.checked)} />
          <MostUglyValidationDebugView {...props} />
        </>,
  },
  number: {
    defaultNumber: <Context extends FormLabel, ForeignMutationsExpected>(): NumberView<Context, ForeignMutationsExpected> =>
      props =>
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          {props.context.details && <p><em>{props.context.details}</em></p>}
          <input disabled={props.context.disabled} type="number" value={props.context.value}
            onChange={e => props.foreignMutations.setNewValue(~~parseInt(e.currentTarget.value))} />
          <MostUglyValidationDebugView {...props} />
        </>,
  },
  string: {
    defaultString: <Context extends FormLabel, ForeignMutationsExpected>(): StringView<Context, ForeignMutationsExpected> =>
      props =>
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          {props.context.tooltip && <p>{props.context.tooltip}</p>}
          {props.context.details && <p><em>{props.context.details}</em></p>}
          <input disabled={props.context.disabled} value={props.context.value}
            onChange={e => props.foreignMutations.setNewValue(e.currentTarget.value)} />
          <MostUglyValidationDebugView {...props} />
        </>,
  },
  date: {
    defaultDate: <Context extends FormLabel, ForeignMutationsExpected>(): DateView<Context, ForeignMutationsExpected> =>
      props =>
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          {props.context.tooltip && <p>{props.context.tooltip}</p>}
          {props.context.details && <p><em>{props.context.details}</em></p>}
          <input disabled={props.context.disabled} value={props.context.customFormState.possiblyInvalidInput}
            onChange={e => props.foreignMutations.setNewValue(e.currentTarget.value)
            } />
          <MostUglyValidationDebugView {...props} />
        </>,
  },
  enumSingleSelection: {
    defaultEnum: <Context extends FormLabel & BaseEnumContext<Element>, Element extends EnumReference, ForeignMutationsExpected>():
    EnumView<Context, Element, ForeignMutationsExpected> =>
      props => {
        return <>
          {props.context.label && <h3>{props.context.label}</h3>}
          {props.context.details && <p><em>{props.context.details}</em></p>}
          {props.context.activeOptions == "loading" ?
            "loading options" :
          <select value={props.context.value.kind == "l" ? props.context.value.value.Value : undefined}
            onChange={e => props.foreignMutations.setNewValue(e.currentTarget.value)}>
            <>
              <option></option>
              {props.context.activeOptions.map(o =>
                <option value={o.Value}>
                  {o.Value}
                </option>
              )}
            </>
          </select>
        }
        <MostUglyValidationDebugView {...props} />
      </>},
  },
  enumMultiSelection: {
    defaultEnumMultiselect: <Context extends FormLabel & BaseEnumContext<Element>, Element extends EnumReference, ForeignMutationsExpected>():
      EnumMultiselectView<Context, Element, ForeignMutationsExpected> =>
      props => <>
        {props.context.label && <h3>{props.context.label}</h3>}
        {props.context.details && <p><em>{props.context.details}</em></p>}
        {props.context.activeOptions == "loading" ?
          "loading options" :
        <select multiple value={props.context.selectedIds}
          disabled={props.context.disabled}
          onChange={e => props.foreignMutations.setNewValue(Array.from(e.currentTarget.options).filter(_ => _.selected).map(_ => _.value))}>
          <>
            {props.context.activeOptions.map(o =>
              <option value={o.Value}>
                {o.Value}
              </option>
            )}
          </>
        </select>
  }
        <MostUglyValidationDebugView {...props} />
      </>,
  },
  streamSingleSelection: {
    defaultInfiniteStream: <Element extends CollectionReference, Context extends FormLabel, ForeignMutationsExpected>():
      SearchableInfiniteStreamView<Element, Context, ForeignMutationsExpected> =>
      props =>
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          {props.context.tooltip && <p>{props.context.tooltip}</p>}
          {props.context.details && <p><em>{props.context.details}</em></p>}
          <button disabled={props.context.disabled} onClick={() => props.foreignMutations.toggleOpen()}>
            {props.context.value.kind == "l" && props.context.value.value.DisplayValue} {props.context.customFormState.status == "open" ? "➖" : "➕"}
          </button>
          <button disabled={props.context.disabled} onClick={() => props.foreignMutations.clearSelection()
          }>❌</button>
          {
            props.context.customFormState.status == "closed" ? <></> :
              <>
                <input disabled={props.context.disabled} value={props.context.customFormState.searchText.value}
                  onChange={e => props.foreignMutations.setSearchText(e.currentTarget.value)}
                />
                <ul>
                  {
                    props.context.customFormState.stream.loadedElements.valueSeq().map(chunk =>
                      chunk.data.valueSeq().map(element =>
                        <li>
                          <button disabled={props.context.disabled} onClick={() => props.foreignMutations.select(element)}>
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
  },
  streamMultiSelection: {
    defaultInfiniteStreamMultiselect: <Element extends CollectionReference, Context extends FormLabel, ForeignMutationsExpected>():
      InfiniteStreamMultiselectView<Element, Context, ForeignMutationsExpected> =>
      props =>
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          {props.context.details && <p><em>{props.context.details}</em></p>}
          <button disabled={props.context.disabled} onClick={() => props.foreignMutations.toggleOpen()}>
            {props.context.value.map(_ => _.DisplayValue).join(", ")} {props.context.customFormState.status == "open" ? "➖" : "➕"}
          </button>
          <button disabled={props.context.disabled} onClick={() => props.foreignMutations.clearSelection()}>
            ❌
          </button>
          {
            props.context.customFormState.status == "closed" ? <></> :
              <>
                <input disabled={props.context.disabled} value={props.context.customFormState.searchText.value}
                  onChange={e => props.foreignMutations.setSearchText(e.currentTarget.value)}
                />
                <ul>
                  {
                    props.context.availableOptions.map(element =>
                      <li>
                        <button disabled={props.context.disabled} onClick={() => props.foreignMutations.toggleSelection(element)
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
          <button disabled={props.context.disabled || props.context.hasMoreValues == false}
            onClick={() => props.foreignMutations.loadMore()}>
            ⋯
          </button>
          <button disabled={props.context.disabled} onClick={() => props.foreignMutations.reload()
          }>🔄</button>
        </>,
  },
  list: {
    defaultList: <Element, ElementFormState, Context extends FormLabel, ForeignMutationsExpected>():
      ListFieldView<Element, ElementFormState, Context, ForeignMutationsExpected> =>
      props =>
          <>
            {props.context.label && <h3>{props.context.label}</h3>}
            {props.context.tooltip && <p>{props.context.tooltip}</p>}
            {props.context.details && <p><em>{props.context.details}</em></p>}
            <ul>
              {props.context.value.map((element, elementIndex) => {
                return (
                <li>
                  <button onClick={() => props.foreignMutations.remove(elementIndex)}>❌</button>
                  {props.embeddedElementTemplate(elementIndex)({
                    ...props,
                    view: unit,
                  })}
                </li>
              )})}
            </ul>
            <button onClick={() => {
              props.foreignMutations.add(unit)
            }}>➕</button>
          </>
  },
  base64File: {
    defaultBase64File: <Context extends FormLabel, ForeignMutationsExpected>(): Base64FileView<Context, ForeignMutationsExpected> =>
      props => <>
        {props.context.label && <h3>{props.context.label}</h3>}
        {props.context.details && <p><em>{props.context.details}</em></p>}
        <input type='text' value={props.context.value} onChange={e => props.foreignMutations.setNewValue(e.currentTarget.value)} />
      </>
  },
  secret: {
    defaultSecret: <Context extends FormLabel, ForeignMutationsExpected>(): SecretView<Context, ForeignMutationsExpected> =>
      props => <>
        {props.context.label && <h3>{props.context.label}</h3>}
        {props.context.details && <p><em>{props.context.details}</em></p>}
        <input type="password" value={props.context.value} onChange={e => props.foreignMutations.setNewValue(e.currentTarget.value)} />
      </>
  },
  map: {
    defaultMap: <K, V, KeyFormState, ValueFormState, Context extends FormLabel, ForeignMutationsExpected>():
      MapFieldView<K, V, KeyFormState, ValueFormState, Context, ForeignMutationsExpected> =>
      props =>
          <>
            {props.context.label && <h3>{props.context.label}</h3>}
            {props.context.tooltip && <p>{props.context.tooltip}</p>}
            {props.context.details && <p><em>{props.context.details}</em></p>}
            <ul>
              {props.context.value.map((element, elementIndex) => {
                return (
                <li>
                  <button onClick={() => props.foreignMutations.remove(elementIndex)}>❌</button>
                  {props.embeddedKeyTemplate(elementIndex)({
                    ...props,
                    view: unit,
                  })}
                  {props.embeddedValueTemplate(elementIndex)({
                    ...props,
                    view: unit,
                  })}                  
                </li>
              )})}
            </ul>
            <button onClick={() => {
              props.foreignMutations.add(unit)
            }}>➕</button>
          </>
  }  
};
