import {
  CommonFormState,
  AsyncState,
  FormLabel,
  BooleanView,
  NumberView,
  StringFormView,
  DateView,
  EnumView,
  EnumMultiselectView,
  SearchableInfiniteStreamView,
  InfiniteStreamMultiselectView,
  BaseEnumContext,
  ListFieldView,
  unit,
  MapFieldView,
  Base64FileFormView,
  SecretFormView,
  PredicateValue,
  ValueRecord,
  TupleFormView,
  SumFormView,
  UnitFormView,
  DateFormState,
  UnitFormState,
  replaceWith,
  Maybe,
  SumFormState,
  id,
  Sum,
  DateForm,
} from "ballerina-core";
import { CategoryView } from "../injected-forms/category";
import { List } from "immutable";

export const MostUglyValidationDebugView = (props: {
  context: { commonFormState: CommonFormState };
}) =>
  props.context.commonFormState.modifiedByUser &&
  props.context.commonFormState.validation.sync &&
  AsyncState.Operations.isLoading(
    props.context.commonFormState.validation.sync,
  ) ? (
    <>🔄</>
  ) : props.context.commonFormState.modifiedByUser &&
    props.context.commonFormState.validation.sync &&
    AsyncState.Operations.hasValue(
      props.context.commonFormState.validation.sync,
    ) &&
    props.context.commonFormState.validation.sync.value.length > 0 ? (
    <table>
      <tr>
        <td>validation errors</td>
        <td>
          {JSON.stringify(props.context.commonFormState.validation.sync.value)}
        </td>
      </tr>
    </table>
  ) : (
    <></>
  );

export const PersonFieldViews = {
  injectedCategory: {
    defaultCategory:
      <Context extends FormLabel, ForeignMutationsExpected>(): CategoryView<
        Context,
        ForeignMutationsExpected
      > =>
      (props) => (
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          {props.context.tooltip && <p>{props.context.tooltip}</p>}
          {props.context.details && (
            <p>
              <em>{props.context.details}</em>
            </p>
          )}
          <button
            style={props.context.value.value.kind == "child" ? { borderColor: "red" } : {}}
            onClick={(_) => props.foreignMutations.setNewValue({
              kind: "custom",
              value: {
                kind: "child",
                extraSpecial: false,
              },
            })}
          >
            child
          </button>
          <button
            style={props.context.value.value.kind == "adult" ? { borderColor: "red" } : {}}
            onClick={(_) => props.foreignMutations.setNewValue({
              kind: "custom",
              value: {
                kind: "adult",
                extraSpecial: false,
              },
            })}
          >
            adult
          </button>
          <button
            style={
              props.context.value.value.kind == "senior" ? { borderColor: "red" } : {}
            }
            onClick={(_) => props.foreignMutations.setNewValue({
              kind: "custom",
              value: {
                kind: "senior",
                extraSpecial: false,
              },
            })}
          >
            senior
          </button>
          <MostUglyValidationDebugView {...props} />
        </>
      ),
  },
  boolean: {
    defaultBoolean:
      <Context extends FormLabel, ForeignMutationsExpected>(): BooleanView<
        Context,
        ForeignMutationsExpected
      > =>
      (props) => (
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          {props.context.details && (
            <p>
              <em>{props.context.details}</em>
            </p>
          )}
          <input
            disabled={props.context.disabled}
            type="checkbox"
            checked={props.context.value}
            onChange={(e) =>
              props.foreignMutations.setNewValue(e.currentTarget.checked)
            }
          />
          <MostUglyValidationDebugView {...props} />
        </>
      ),
    secondBoolean:
      <Context extends FormLabel, ForeignMutationsExpected>(): BooleanView<
        Context,
        ForeignMutationsExpected
      > =>
      (props) => (
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          {props.context.details && (
            <p>
              <em>{props.context.details}</em>
            </p>
          )}
          <input
            disabled={props.context.disabled}
            type="checkbox"
            checked={props.context.value}
            onChange={(e) =>
              props.foreignMutations.setNewValue(e.currentTarget.checked)
            }
          />
          <MostUglyValidationDebugView {...props} />
        </>
      ),
  },
  number: {
    defaultNumber:
      <Context extends FormLabel, ForeignMutationsExpected>(): NumberView<
        Context,
        ForeignMutationsExpected
      > =>
      (props) => (
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          {props.context.details && (
            <p>
              <em>{props.context.details}</em>
            </p>
          )}
          <input
            disabled={props.context.disabled}
            type="number"
            value={props.context.value}
            onChange={(e) =>
              props.foreignMutations.setNewValue(
                ~~parseInt(e.currentTarget.value),
              )
            }
          />
          <MostUglyValidationDebugView {...props} />
        </>
      ),
  },
  string: {
    defaultString:
      <Context extends FormLabel, ForeignMutationsExpected>(): StringFormView<
        Context,
        ForeignMutationsExpected
      > =>
      (props) => {
        return (
          <>
            {props.context.label && <h3>{props.context.label}</h3>}
            {props.context.tooltip && <p>{props.context.tooltip}</p>}
            {props.context.details && (
              <p>
                <em>{props.context.details}</em>
              </p>
            )}
            <input
              disabled={props.context.disabled}
              value={props.context.value}
              onChange={(e) =>
                props.foreignMutations.setNewValue(e.currentTarget.value)
              }
            />
            <MostUglyValidationDebugView {...props} />
          </>
        );
      },
  },
  date: {
    defaultDate:
      <Context extends FormLabel, ForeignMutationsExpected>(): DateView<
        Context,
        ForeignMutationsExpected
      > =>
      (props) => {
        const displayValue = props.context.commonFormState.modifiedByUser
          ? props.context.customFormState.possiblyInvalidInput
          : props.context.value?.toISOString();

        return (
          <>
            {props.context.label && <h3>{props.context.label}</h3>}
            {props.context.tooltip && <p>{props.context.tooltip}</p>}
            {props.context.details && (
              <p>
                <em>{props.context.details}</em>
              </p>
            )}
            <input
              disabled={props.context.disabled}
              type="date"
              value={displayValue}
              onChange={(e) =>
                props.foreignMutations.setNewValue(e.currentTarget.value)
              }
            />
            <MostUglyValidationDebugView {...props} />
          </>
        );
      },
  },
  enumSingleSelection: {
    defaultEnum:
      <
        Context extends FormLabel & BaseEnumContext,
        ForeignMutationsExpected,
      >(): EnumView<Context, ForeignMutationsExpected> =>
      (props) => {
        const isSome = props.context.value.isSome;
        const value =
          isSome &&
          PredicateValue.Operations.IsRecord(props.context.value.value)
            ? props.context.value.value.fields.get("Value")!
            : undefined;

        return (
          <>
            {props.context.label && <h3>{props.context.label}</h3>}
            {props.context.details && (
              <p>
                <em>{props.context.details}</em>
              </p>
            )}
            {props.context.activeOptions == "loading" ? (
              "loading options"
            ) : (
              <select
                value={value as string | undefined}
                onChange={(e) =>
                  props.foreignMutations.setNewValue(e.currentTarget.value)
                }
              >
                <>
                  <option></option>
                  {props.context.activeOptions.map((o) => (
                    <option value={o.fields.get("Value")! as string}>
                      {o.fields.get("Value") as string}
                    </option>
                  ))}
                </>
              </select>
            )}
            <MostUglyValidationDebugView {...props} />
          </>
        );
      },
  },
  enumMultiSelection: {
    defaultEnumMultiselect:
      <
        Context extends FormLabel & BaseEnumContext,
        ForeignMutationsExpected,
      >(): EnumMultiselectView<Context, ForeignMutationsExpected> =>
      (props) => (
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          {props.context.details && (
            <p>
              <em>{props.context.details}</em>
            </p>
          )}
          {props.context.activeOptions == "loading" ? (
            "loading options"
          ) : (
            <select
              multiple
              value={props.context.selectedIds}
              disabled={props.context.disabled}
              onChange={(e) =>
                props.foreignMutations.setNewValue(
                  Array.from(e.currentTarget.options)
                    .filter((_) => _.selected)
                    .map((_) => _.value),
                )
              }
            >
              <>
                {props.context.activeOptions.map((o) => (
                  <option value={o.fields.get("Value")! as string}>
                    {o.fields.get("Value") as string}
                  </option>
                ))}
              </>
            </select>
          )}
          <MostUglyValidationDebugView {...props} />
        </>
      ),
  },
  streamSingleSelection: {
    defaultInfiniteStream:
      <
        Context extends FormLabel,
        ForeignMutationsExpected,
      >(): SearchableInfiniteStreamView<Context, ForeignMutationsExpected> =>
      (props) => (
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          {props.context.tooltip && <p>{props.context.tooltip}</p>}
          {props.context.details && (
            <p>
              <em>{props.context.details}</em>
            </p>
          )}
          <button
            disabled={props.context.disabled}
            onClick={() => props.foreignMutations.toggleOpen()}
          >
            {props.context.value.isSome &&
              ((props.context.value.value as ValueRecord).fields.get(
                "DisplayValue",
              ) as string)}{" "}
            {props.context.customFormState.status == "open" ? "➖" : "➕"}
          </button>
          <button
            disabled={props.context.disabled}
            onClick={() => props.foreignMutations.clearSelection()}
          >
            ❌
          </button>
          {props.context.customFormState.status == "closed" ? (
            <></>
          ) : (
            <>
              <input
                disabled={props.context.disabled}
                value={props.context.customFormState.searchText.value}
                onChange={(e) =>
                  props.foreignMutations.setSearchText(e.currentTarget.value)
                }
              />
              <ul>
                {props.context.customFormState.stream.loadedElements
                  .valueSeq()
                  .map((chunk) =>
                    chunk.data.valueSeq().map((element) => (
                      <li>
                        <button
                          disabled={props.context.disabled}
                          onClick={() =>
                            props.foreignMutations.select(
                              PredicateValue.Default.option(
                                true,
                                ValueRecord.Default.fromJSON(element),
                              ),
                            )
                          }
                        >
                          {element.DisplayValue}{" "}
                          {props.context.value.isSome &&
                          (props.context.value.value as ValueRecord).fields.get(
                            "Id",
                          ) == element.Id
                            ? "✅"
                            : ""}
                        </button>
                      </li>
                    )),
                  )}
              </ul>
            </>
          )}
          <MostUglyValidationDebugView {...props} />
          <button
            disabled={props.context.hasMoreValues == false}
            onClick={() => props.foreignMutations.loadMore()}
          >
            ⋯
          </button>
          <button onClick={() => props.foreignMutations.reload()}>🔄</button>
        </>
      ),
  },
  streamMultiSelection: {
    defaultInfiniteStreamMultiselect:
      <
        Context extends FormLabel,
        ForeignMutationsExpected,
      >(): InfiniteStreamMultiselectView<Context, ForeignMutationsExpected> =>
      (props) => {
        return (
          <>
            {props.context.label && <h3>{props.context.label}</h3>}
            {props.context.details && (
              <p>
                <em>{props.context.details}</em>
              </p>
            )}
            <button
              disabled={props.context.disabled}
              onClick={() => props.foreignMutations.toggleOpen()}
            >
              {props.context.value.fields
                .map(
                  (_) =>
                    (_ as ValueRecord).fields.get("DisplayValue") as string,
                )
                .join(", ")}{" "}
              {props.context.customFormState.status == "open" ? "➖" : "➕"}
            </button>
            <button
              disabled={props.context.disabled}
              onClick={() => props.foreignMutations.clearSelection()}
            >
              ❌
            </button>
            {props.context.customFormState.status == "closed" ? (
              <></>
            ) : (
              <>
                <input
                  disabled={props.context.disabled}
                  value={props.context.customFormState.searchText.value}
                  onChange={(e) =>
                    props.foreignMutations.setSearchText(e.currentTarget.value)
                  }
                />
                <ul>
                  {props.context.availableOptions.map((element) => {
                    return (
                      <li>
                        <button
                          disabled={props.context.disabled}
                          onClick={() =>
                            props.foreignMutations.toggleSelection(
                              ValueRecord.Default.fromJSON(element),
                            )
                          }
                        >
                          {element.DisplayValue}{" "}
                          {props.context.value.fields.has(element.Id)
                            ? "✅"
                            : ""}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            <MostUglyValidationDebugView {...props} />
            <button
              disabled={
                props.context.disabled || props.context.hasMoreValues == false
              }
              onClick={() => props.foreignMutations.loadMore()}
            >
              ⋯
            </button>
            <button
              disabled={props.context.disabled}
              onClick={() => props.foreignMutations.reload()}
            >
              🔄
            </button>
          </>
        );
      },
  },
  list: {
    defaultList:
      <
        ElementFormState,
        Context extends FormLabel & { disabled: boolean },
        ForeignMutationsExpected,
      >(): ListFieldView<ElementFormState, Context, ForeignMutationsExpected> =>
      (props) => {
        return (
          <>
            {props.context.label && <h3>{props.context.label}</h3>}
            {props.context.tooltip && <p>{props.context.tooltip}</p>}
            {props.context.details && (
              <p>
                <em>{props.context.details}</em>
              </p>
            )}
            <ul>
              {props.context.value.values.map((_, elementIndex) => {
                return (
                  <li
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {props.embeddedElementTemplate(elementIndex)({
                      ...props,
                      view: unit,
                    })}
                    <div style={{ display: "flex" }}>
                      <button
                        onClick={() =>
                          props.foreignMutations.remove(elementIndex)
                        }
                        disabled={props.context.disabled}
                      >
                        ❌
                      </button>
                      <button
                        onClick={() =>
                          props.foreignMutations.move(
                            elementIndex,
                            elementIndex - 1,
                          )
                        }
                        disabled={props.context.disabled}
                      >
                        ⬆️
                      </button>
                      <button
                        onClick={() =>
                          props.foreignMutations.move(
                            elementIndex,
                            elementIndex + 1,
                          )
                        }
                        disabled={props.context.disabled}
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={() =>
                          props.foreignMutations.duplicate(elementIndex)
                        }
                        disabled={props.context.disabled}
                      >
                        📑
                      </button>
                      <button
                        onClick={() =>
                          props.foreignMutations.insert(elementIndex + 1)
                        }
                        disabled={props.context.disabled}
                      >
                        ➕
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <button
              onClick={() => {
                props.foreignMutations.add(unit);
              }}
              disabled={props.context.disabled}
            >
              ➕
            </button>
          </>
        );
      },
  },
  base64File: {
    defaultBase64File:
      <
        Context extends FormLabel,
        ForeignMutationsExpected,
      >(): Base64FileFormView<Context, ForeignMutationsExpected> =>
      (props) => (
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          {props.context.details && (
            <p>
              <em>{props.context.details}</em>
            </p>
          )}
          <input
            type="text"
            value={props.context.value}
            onChange={(e) =>
              props.foreignMutations.setNewValue(e.currentTarget.value)
            }
          />
        </>
      ),
  },
  secret: {
    defaultSecret:
      <Context extends FormLabel, ForeignMutationsExpected>(): SecretFormView<
        Context,
        ForeignMutationsExpected
      > =>
      (props) => (
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          {props.context.details && (
            <p>
              <em>{props.context.details}</em>
            </p>
          )}
          <input
            type="password"
            value={props.context.value}
            onChange={(e) =>
              props.foreignMutations.setNewValue(e.currentTarget.value)
            }
          />
        </>
      ),
  },
  map: {
    defaultMap:
      <
        KeyFormState,
        ValueFormState,
        Context extends FormLabel,
        ForeignMutationsExpected,
      >(): MapFieldView<
        KeyFormState,
        ValueFormState,
        Context,
        ForeignMutationsExpected
      > =>
      (props) => (
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          {props.context.tooltip && <p>{props.context.tooltip}</p>}
          {props.context.details && (
            <p>
              <em>{props.context.details}</em>
            </p>
          )}
          <ul>
            {props.context.value.values.map((_, elementIndex) => {
              return (
                <li>
                  <button
                    onClick={() => props.foreignMutations.remove(elementIndex)}
                  >
                    ❌
                  </button>
                  {props.embeddedKeyTemplate(elementIndex)({
                    ...props,
                    view: unit,
                  })}
                  {props.embeddedValueTemplate(elementIndex)({
                    ...props,
                    view: unit,
                  })}
                </li>
              );
            })}
          </ul>
          <button
            onClick={() => {
              props.foreignMutations.add(unit);
            }}
          >
            ➕
          </button>
        </>
      ),
  },
  tuple: {
    defaultTuple2:
      <
        FormState extends List<{
          commonFormState: { modifiedByUser: boolean };
        }>,
        Context extends FormLabel,
        ForeignMutationsExpected,
      >(): TupleFormView<FormState, Context, ForeignMutationsExpected> =>
      (props) => (
        <>
          {props.context.label && <h3>{props.context.label}</h3>}
          <div>
            {props.context.value.values.map((_, elementIndex) => {
              return (
                <>
                  {props.embeddedElementTemplates(elementIndex)({
                    ...props,
                    view: unit,
                  })}
                </>
              );
            })}
          </div>
        </>
      ),
    defaultTuple3:
      <
        FormState extends List<{
          commonFormState: { modifiedByUser: boolean };
        }>,
        Context extends FormLabel,
        ForeignMutationsExpected,
      >(): TupleFormView<FormState, Context, ForeignMutationsExpected> =>
      (props) => {
        return (
          <>
            {props.context.label && <h3>{props.context.label}</h3>}
            <div>
              {props.embeddedElementTemplates(0)({
                ...props,
                view: unit,
              })}
              {props.embeddedElementTemplates(1)({
                ...props,
                view: unit,
              })}
            </div>
            <div>
              {props.embeddedElementTemplates(2)({
                ...props,
                view: unit,
              })}
            </div>
          </>
        );
      },
  },
  sum: {
    defaultSum: <
      LeftFormState,
      RightFormState,
      Context extends FormLabel,
      ForeignMutationsExpected,
    >(): SumFormView<
      LeftFormState,
      RightFormState,
      Context,
      ForeignMutationsExpected
    > => {
      return (props) => {
        if (
          props.embeddedLeftTemplate == undefined ||
          props.embeddedRightTemplate == undefined
        ) {
          console.error(
            "embeddedLeftTemplate or embeddedRightTemplate is undefined, but both are expected in defaultSum",
          );
          return <></>;
        }
        return (
          <>
            {props.embeddedLeftTemplate()({
              ...props,
              view: unit,
            })}
            {props.embeddedRightTemplate()({
              ...props,
              view: unit,
            })}
            <MostUglyValidationDebugView {...props} />
          </>
        );
      };
    },
    maybeDate: <
      Context extends FormLabel & { disabled: boolean },
      ForeignMutationsExpected,
    >(): SumFormView<
      UnitFormState,
      DateFormState,
      Context,
      ForeignMutationsExpected
    > => {
      return (props) => {
        const displayValue =
          props.context.value.value.kind == "l"
            ? ""
            : props.context.customFormState.right.commonFormState.modifiedByUser
              ? props.context.customFormState.right.customFormState
                  .possiblyInvalidInput
              : (props.context.value.value.value as Date)
                  .toISOString()
                  .slice(0, 10);

        const setNewValue = (_: Maybe<string>) => {
          props.setState(
            SumFormState<
              UnitFormState,
              DateFormState
            >().Updaters.Core.customFormState((__) => ({
              ...__,
              right: DateFormState.Updaters.Core.customFormState.children
                .possiblyInvalidInput(replaceWith(_))
                .then(
                  DateFormState.Updaters.Core.commonFormState((___) => ({
                    ...___,
                    modifiedByUser: true,
                  })),
                )(__.right),
            })),
          );
          const newValue = _ == undefined ? _ : new Date(_);
          setTimeout(() => {
            props.foreignMutations.onChange(
              newValue == undefined || isNaN(newValue.getTime())
                ? id
                : replaceWith(
                    PredicateValue.Default.sum(Sum.Default.right(newValue)),
                  ),
              List(),
            );
          }, 0);
        };

        const clearValue = () => {
          props.setState(
            SumFormState<
              UnitFormState,
              DateFormState
            >().Updaters.Core.customFormState((__) => ({
              ...__,
              left: UnitFormState.Updaters.Core.commonFormState((___) => ({
                ...___,
                modifiedByUser: true,
              }))(__.left),
            })),
          );
          setTimeout(() => {
            props.foreignMutations.onChange(
              replaceWith(
                PredicateValue.Default.sum(
                  Sum.Default.left(PredicateValue.Default.unit()),
                ),
              ),
              List(),
            );
          }, 0);
        };

        return (
          <>
            {props.context.label && <h3>{props.context.label}</h3>}
            <input
              disabled={props.context.disabled}
              value={displayValue}
              type="date"
              onChange={(e) => {
                if (e.currentTarget.value == "") {
                  clearValue();
                } else {
                  setNewValue(e.currentTarget.value);
                }
              }}
            />
            <MostUglyValidationDebugView {...props} />
          </>
        );
      };
    },
  },
  unit: {
    defaultUnit: <Context extends FormLabel>(): UnitFormView<Context> => {
      return (props) => {
        return (
          <>
            {props.context.label && <h3>{props.context.label}</h3>}
            Unit field
            <MostUglyValidationDebugView {...props} />
          </>
        );
      };
    },
  },
};
