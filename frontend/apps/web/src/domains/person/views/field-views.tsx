import { FormLabel, CollectionReference, DateView, EnumView, EnumMultiselectView, StringView, NumberView, BooleanView, SearchableInfiniteStreamView, InfiniteStreamMultiselectView, SharedFormState, AsyncState, BaseEnumContext } from "ballerina-core";
import { PersonFormPredicateContext } from "../domains/predicates";

export const MostUglyValidationDebugView = (props: { context: { showAllErrors: boolean } & SharedFormState }) =>
  props.context.modifiedByUser && AsyncState.Operations.isLoading(props.context.validation.sync) ?
    <>🔄</>
    :
    (props.context.showAllErrors || props.context.modifiedByUser) && AsyncState.Operations.hasValue(props.context.validation.sync) &&
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
        <input value={props.context.possiblyInvalidInput}
          onChange={e => props.foreignMutations.setNewValue(e.currentTarget.value)
          } />
        <MostUglyValidationDebugView {...props} />
      </>,
  EnumView: <Context extends FormLabel & BaseEnumContext<Context, Element> & { showAllErrors: boolean }, Element extends CollectionReference, ForeignMutationsExpected>(): EnumView<Context, Element, ForeignMutationsExpected> =>
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
        </select>}
      <MostUglyValidationDebugView {...props} />
    </>,
  EnumMultiselectView: <Context extends FormLabel & BaseEnumContext<Context, Element> & { showAllErrors: boolean }, Element extends CollectionReference, ForeignMutationsExpected>(): EnumMultiselectView<Context, Element, ForeignMutationsExpected> =>
    props => <>
      {props.context.label && <h3>{props.context.label}</h3>}
      {props.context.activeOptions == "loading" ?
        "loading options" :
        <select multiple value={props.context.selectedIds}
          onChange={e => props.foreignMutations.setNewValue(Array.from(e.currentTarget.options).filter(_ => _.selected).map(_ => _.value))}>
          <>
            {props.context.activeOptions.map(o =>
              <option value={o.id}>
                {o.displayName}
              </option>
            )}
          </>
        </select>}
      <MostUglyValidationDebugView {...props} />
    </>,
  Interests: <Context extends PersonFormPredicateContext & FormLabel & BaseEnumContext<Context, Element> & { showAllErrors: boolean }, Element extends CollectionReference, ForeignMutationsExpected>(): EnumMultiselectView<Context, Element, ForeignMutationsExpected> =>
    props => <>
      {props.context.label && <h3>{props.context.label}</h3>}
      {props.context.activeOptions == "loading" ?
        "loading options" :
        <select multiple value={props.context.selectedIds}
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
      {(props.context.showAllErrors || props.context.formState.modifiedByUser) && AsyncState.Operations.hasValue(props.context.formState.validation.sync) &&
        props.context.formState.validation.sync.value.length > 0 &&
        props.context.formState.validation.sync.value.some(([path, _error]) => path.length == 1 && path[0] == "interests") ?
        <table>
          <tr>
            <td>
              validation errors
            </td>
            <td>
              {JSON.stringify(props.context.formState.validation.sync.value.filter(([path, _error]) => path.length == 1 && path[0] == "interests"))}
            </td>
          </tr>
        </table>
        :
        <></>
      }
    </>,
  InfiniteStreamView: <Element extends CollectionReference, Context extends FormLabel & { showAllErrors: boolean }, ForeignMutationsExpected>():
    SearchableInfiniteStreamView<Element, Context, ForeignMutationsExpected> =>
    props =>
      <>
        {props.context.label && <h3>{props.context.label}</h3>}
        <button onClick={() => props.foreignMutations.toggleOpen()}>
          {props.context.value.kind == "l" && props.context.value.value.displayName} {props.context.status == "open" ? "➖" : "➕"}
        </button>
        <button onClick={() => props.foreignMutations.clearSelection()
        }>❌</button>
        {
          props.context.status == "closed" ? <></> :
            <>
              <input value={props.context.searchText.value}
                onChange={e => props.foreignMutations.setSearchText(e.currentTarget.value)}
              />
              <ul>
                {
                  props.context.stream.loadedElements.valueSeq().map(chunk =>
                    chunk.data.valueSeq().map(element =>
                      <li>
                        <button onClick={() => props.foreignMutations.select(element)}>
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
  InfiniteStreamMultiselectView: <Element extends CollectionReference, Context extends FormLabel & { showAllErrors: boolean }, ForeignMutationsExpected>():
    InfiniteStreamMultiselectView<Element, Context, ForeignMutationsExpected> =>
    props =>
      <>
        {props.context.label && <h3>{props.context.label}</h3>}
        <button onClick={() => props.foreignMutations.toggleOpen()}>
          {props.context.value.map(_ => _.displayName).join(", ")} {props.context.status == "open" ? "➖" : "➕"}
        </button>
        <button onClick={() => props.foreignMutations.clearSelection()}>
          ❌
        </button>
        {
          props.context.status == "closed" ? <></> :
            <>
              <input value={props.context.searchText.value}
                onChange={e => props.foreignMutations.setSearchText(e.currentTarget.value)}
              />
              <ul>
                {
                  props.context.availableOptions.map(element =>
                    <li>
                      <button onClick={() => props.foreignMutations.toggleSelection(element)
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
        <button disabled={props.context.hasMoreValues == false}
          onClick={() => props.foreignMutations.loadMore()}>
          ⋯
        </button>
        <button onClick={() => props.foreignMutations.reload()
        }>🔄</button>
      </>,
};
