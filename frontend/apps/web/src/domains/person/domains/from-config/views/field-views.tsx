import { SharedFormState, AsyncState, FormLabel, BooleanView, NumberView, StringView, DateView, CollectionReference, EnumView, EnumMultiselectView, SearchableInfiniteStreamView, InfiniteStreamMultiselectView, BaseEnumContext, MaybeBooleanView } from "ballerina-core";

export const MostUglyValidationDebugView = (props: { context: SharedFormState }) =>
  props.context.modifiedByUser && AsyncState.Operations.isLoading(props.context.validation.sync) ?
    <>🔄</>
    :
    (props.context.modifiedByUser) && AsyncState.Operations.hasValue(props.context.validation.sync) &&
      props.context.validation.sync.value.length > 0 ?
      <table>
        <tr>
          <td>
            validation errors
          </td>
          <td>
            {JSON.stringify(props.context.validation.sync.value)}
          </td>
        </tr>
      </table>
      :
      <></>


export const PersonFieldViews = {
  MaybeBooleanViews: {
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
  BooleanViews: {
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
  NumberViews: {
    defaultNumber: <Context extends FormLabel, ForeignMutationsExpected>(): NumberView<Context, ForeignMutationsExpected> =>
      props =>
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          <input disabled={props.context.disabled} type="number" value={props.context.value}
            onChange={e => props.foreignMutations.setNewValue(~~parseInt(e.currentTarget.value))} />
          <MostUglyValidationDebugView {...props} />
        </>,
  },
  StringViews: {
    defaultString: <Context extends FormLabel, ForeignMutationsExpected>(): StringView<Context, ForeignMutationsExpected> =>
      props =>
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          <input disabled={props.context.disabled} value={props.context.value}
            onChange={e => props.foreignMutations.setNewValue(e.currentTarget.value)} />
          <MostUglyValidationDebugView {...props} />
        </>,
  },
  DateViews: {
    defaultDate: <Context extends FormLabel, ForeignMutationsExpected>(): DateView<Context, ForeignMutationsExpected> =>
      props =>
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          <input disabled={props.context.disabled} value={props.context.possiblyInvalidInput}
            onChange={e => props.foreignMutations.setNewValue(e.currentTarget.value)
            } />
          <MostUglyValidationDebugView {...props} />
        </>,
  },
  EnumViews: {
    defaultEnum: <Context extends FormLabel & BaseEnumContext<Context, Element>, Element extends CollectionReference, ForeignMutationsExpected>(): 
    EnumView<Context, Element, ForeignMutationsExpected> =>
      props => <>
        {props.context.label && <h3>{props.context.label}</h3>}
        {props.context.activeOptions == "loading" ?
          "loading options" :
          <select value={props.context.value.kind == "l" ? props.context.value.value.id : undefined}
            onChange={e => props.foreignMutations.setNewValue(e.currentTarget.value)}>
            <>
              <option></option>
              {props.context.activeOptions.map(o =>
                <option value={o.id}>
                  {o.displayName}
                </option>
              )}
            </>
          </select>
        }
        <MostUglyValidationDebugView {...props} />
      </>,
  },
  EnumMultiselectViews: {
    defaultEnumMultiselect: <Context extends FormLabel & BaseEnumContext<Context, Element>, Element extends CollectionReference, ForeignMutationsExpected>(): 
      EnumMultiselectView<Context, Element, ForeignMutationsExpected> =>
      props => <>
        {props.context.label && <h3>{props.context.label}</h3>}
        {props.context.activeOptions == "loading" ?
          "loading options" :
        <select multiple value={props.context.selectedIds}
          disabled={props.context.disabled}
          onChange={e => props.foreignMutations.setNewValue(Array.from(e.currentTarget.options).filter(_ => _.selected).map(_ => _.value))}>
          <>
            {props.context.activeOptions.map(o =>
              <option value={o.id}>
                {o.displayName}
              </option>
            )}
          </>
        </select>
  }
        <MostUglyValidationDebugView {...props} />
      </>,
  },
  InfiniteStreamViews: {
    defaultInfiniteStream: <Element extends CollectionReference, Context extends FormLabel, ForeignMutationsExpected>():
      SearchableInfiniteStreamView<Element, Context, ForeignMutationsExpected> =>
      props =>
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          <button disabled={props.context.disabled} onClick={() => props.foreignMutations.toggleOpen()}>
            {props.context.value.kind == "l" && props.context.value.value.displayName} {props.context.status == "open" ? "➖" : "➕"}
          </button>
          <button disabled={props.context.disabled} onClick={() => props.foreignMutations.clearSelection()
          }>❌</button>
          {
            props.context.status == "closed" ? <></> :
              <>
                <input disabled={props.context.disabled} value={props.context.searchText.value}
                  onChange={e => props.foreignMutations.setSearchText(e.currentTarget.value)}
                />
                <ul>
                  {
                    props.context.stream.loadedElements.valueSeq().map(chunk =>
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
  InfiniteStreamMultiselectViews: {
    defaultInfiniteStreamMultiselect: <Element extends CollectionReference, Context extends FormLabel, ForeignMutationsExpected>():
      InfiniteStreamMultiselectView<Element, Context, ForeignMutationsExpected> =>
      props =>
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          <button disabled={props.context.disabled} onClick={() => props.foreignMutations.toggleOpen()}>
            {props.context.value.map(_ => _.displayName).join(", ")} {props.context.status == "open" ? "➖" : "➕"}
          </button>
          <button disabled={props.context.disabled} onClick={() => props.foreignMutations.clearSelection()}>
            ❌
          </button>
          {
            props.context.status == "closed" ? <></> :
              <>
                <input disabled={props.context.disabled} value={props.context.searchText.value}
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
};
