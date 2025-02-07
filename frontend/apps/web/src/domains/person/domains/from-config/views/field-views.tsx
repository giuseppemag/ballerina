import { CommonFormState, AsyncState, FormLabel, BooleanView, NumberView, StringView, DateView, CollectionReference, EnumView, EnumMultiselectView, SearchableInfiniteStreamView, InfiniteStreamMultiselectView, BaseEnumContext, MaybeBooleanView, ListFieldView, unit, Value } from "ballerina-core";

export const MostUglyValidationDebugView = (props: { context: {commonFormState: CommonFormState} }) =>
  props.context.commonFormState.modifiedByUser && props.context.commonFormState.validation.sync && AsyncState.Operations.isLoading(props.context.commonFormState.validation.sync) ?
    <>🔄</>
    :
    (props.context.commonFormState.modifiedByUser) && props.context.commonFormState.validation.sync && AsyncState.Operations.hasValue(props.context.commonFormState.validation.sync) &&
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
  maybeBoolean: {
    defaultMaybeBoolean: <Context extends FormLabel, ForeignMutationsExpected>(): MaybeBooleanView<Context, ForeignMutationsExpected> =>
      props =>
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
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
          <input disabled={props.context.disabled} type="checkbox" checked={props.context.value}
            onChange={e => props.foreignMutations.setNewValue(e.currentTarget.checked)} />
          <MostUglyValidationDebugView {...props} />
        </>,
    secondBoolean: <Context extends FormLabel, ForeignMutationsExpected>(): BooleanView<Context, ForeignMutationsExpected> =>
      props =>
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
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
          <input disabled={props.context.disabled} value={props.context.value}
            onChange={e => props.foreignMutations.setNewValue(e.currentTarget.value)} />
          <MostUglyValidationDebugView {...props} />
        </>,
  },
  Date: {
    defaultDate: <Context extends FormLabel, ForeignMutationsExpected>(): DateView<Context, ForeignMutationsExpected> =>
      props =>
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          <input disabled={props.context.disabled} value={props.context.customFormState.possiblyInvalidInput}
            onChange={e => props.foreignMutations.setNewValue(e.currentTarget.value)
            } />
          <MostUglyValidationDebugView {...props} />
        </>,
  },
  enumSingleSelection: {
    defaultEnum: <Context extends FormLabel & BaseEnumContext<Value<Element>>, Element extends CollectionReference, ForeignMutationsExpected>(): 
    EnumView<Context, Value<Element>, ForeignMutationsExpected> =>
      props => <>
        {props.context.label && <h3>{props.context.label}</h3>}
        {props.context.activeOptions == "loading" ?
          "loading options" :
          <select value={props.context.value.kind == "l" ? props.context.value.value.value.id : undefined}
            onChange={e => props.foreignMutations.setNewValue(e.currentTarget.value)}>
            <>
              <option></option>
              {props.context.activeOptions.map(o =>
                <option value={o.value.id}>
                  {o.value.displayName}
                </option>
              )}
            </>
          </select>
        }
        <MostUglyValidationDebugView {...props} />
      </>,
  },
  enumMultiSelection: {
    defaultEnumMultiselect: <Context extends FormLabel & BaseEnumContext<Value<Element>>, Element extends CollectionReference, ForeignMutationsExpected>(): 
      EnumMultiselectView<Context, Value<Element>, ForeignMutationsExpected> =>
      props => <>
        {props.context.label && <h3>{props.context.label}</h3>}
        {props.context.activeOptions == "loading" ?
          "loading options" :
        <select multiple value={props.context.selectedIds}
          disabled={props.context.disabled}
          onChange={e => props.foreignMutations.setNewValue(Array.from(e.currentTarget.options).filter(_ => _.selected).map(_ => _.value))}>
          <>
            {props.context.activeOptions.map(o =>
              <option value={o.value.id}>
                {o.value.displayName}
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
          <button disabled={props.context.disabled} onClick={() => props.foreignMutations.toggleOpen()}>
            {props.context.value.kind == "l" && props.context.value.value.displayName} {props.context.customFormState.status == "open" ? "➖" : "➕"}
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
                            {element.displayName} {props.context.value.kind == "l" && props.context.value.value.id == element.id ? "✅" : ""}
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
          <button disabled={props.context.disabled} onClick={() => props.foreignMutations.toggleOpen()}>
            {props.context.value.map(_ => _.displayName).join(", ")} {props.context.customFormState.status == "open" ? "➖" : "➕"}
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
                          {element.displayName} {props.context.value.has(element.id) ? "✅" : ""}
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
          <ul>
            {
              props.context.value.map((element, elementIndex) =>
                <li>
                  {
                    props.embeddedElementTemplate(elementIndex)({...props, view:unit })
                  }
                </li>
              )
            }
          </ul>
        </>
  }
};
