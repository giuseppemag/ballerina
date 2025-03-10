import { List } from "immutable";
import {
  SimpleCallback,
  Debounce,
  InfiniteStreamLoader,
  id,
  replaceWith,
  BasicFun,
  ValidateRunner,
  ValueOption,
  PredicateValue,
} from "../../../../../../main";
import { CoTypedFactory } from "../../../../../coroutines/builder";
import { Debounced } from "../../../../../debounced/state";
import { InfiniteStreamState } from "../../../../../infinite-data-stream/state";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { CollectionReference } from "../../../collection/domains/reference/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
} from "../../../singleton/state";
import {
  SearchableInfiniteStreamState,
  SearchableInfiniteStreamView,
} from "./state";

export const SearchableInfiniteStreamForm = <
  Context extends FormLabel,
  ForeignMutationsExpected,
>(
  validation?: BasicFun<ValueOption, Promise<FieldValidation>>,
) => {
  const Co = CoTypedFactory<
    Context & Value<ValueOption> & { disabled: boolean },
    SearchableInfiniteStreamState
  >();
  const DebouncerCo = CoTypedFactory<
    Context & { onDebounce: SimpleCallback<void> } & Value<ValueOption>,
    SearchableInfiniteStreamState
  >();
  const DebouncedCo = CoTypedFactory<
    { onDebounce: SimpleCallback<void> },
    Value<string>
  >();
  const debouncer = DebouncerCo.Repeat(
    DebouncerCo.Seq([
      Debounce<Value<string>, { onDebounce: SimpleCallback<void> }>(
        DebouncedCo.GetState()
          .then((current) => DebouncedCo.Do(() => current.onDebounce()))
          //.SetState(SearchNow.Updaters.reloadsRequested(_ => _ + 1))
          .then((_) => DebouncedCo.Return("success")),
        250,
      ).embed(
        (_) => ({ ..._, ..._.customFormState.searchText }),
        SearchableInfiniteStreamState().Updaters.Core.customFormState.children
          .searchText,
      ),
      DebouncerCo.Wait(0),
    ]),
  );
  const debouncerRunner = DebouncerCo.Template<
    ForeignMutationsExpected & {
      onChange: OnChange<ValueOption>;
    }
  >(debouncer, {
    interval: 15,
    runFilter: (props) =>
      Debounced.Operations.shouldCoroutineRun(
        props.context.customFormState.searchText,
      ),
  });
  const loaderRunner = Co.Template<
    ForeignMutationsExpected & {
      onChange: OnChange<ValueOption>;
    }
  >(
    InfiniteStreamLoader<CollectionReference>().embed(
      (_) => _.customFormState.stream,
      SearchableInfiniteStreamState().Updaters.Core.customFormState.children
        .stream,
    ),
    {
      interval: 15,
      runFilter: (props) =>
        InfiniteStreamState().Operations.shouldCoroutineRun(
          props.context.customFormState.stream,
        ),
    },
  );

  return Template.Default<
    Context & Value<ValueOption> & { disabled: boolean },
    SearchableInfiniteStreamState,
    ForeignMutationsExpected & {
      onChange: OnChange<ValueOption>;
    },
    SearchableInfiniteStreamView<Context, ForeignMutationsExpected>
  >((props) => (
    <>
      <props.view
        {...props}
        context={{
          ...props.context,
          hasMoreValues: !(
            props.context.customFormState.stream.loadedElements.last()
              ?.hasMoreValues == false
          ),
        }}
        foreignMutations={{
          ...props.foreignMutations,
          toggleOpen: () =>
            props.setState(
              SearchableInfiniteStreamState()
                .Updaters.Core.customFormState.children.status(
                  replaceWith(
                    props.context.customFormState.status == "closed"
                      ? "open"
                      : "closed",
                  ),
                )
                .then(
                  props.context.customFormState.stream.loadedElements.count() ==
                    0
                    ? SearchableInfiniteStreamState().Updaters.Core.customFormState.children.stream(
                        InfiniteStreamState<CollectionReference>().Updaters.Template.loadMore(),
                      )
                    : id,
                ),
            ),
          clearSelection: () => {
            props.foreignMutations.onChange(
              replaceWith(
                PredicateValue.Default.option(
                  false,
                  PredicateValue.Default.unit(),
                ),
              ),
              List(),
            );
          },
          setSearchText: (_) =>
            props.setState(
              SearchableInfiniteStreamState().Updaters.Template.searchText(
                replaceWith(_),
              ),
            ),
          loadMore: () =>
            props.setState(
              SearchableInfiniteStreamState().Updaters.Core.customFormState.children.stream(
                InfiniteStreamState<CollectionReference>().Updaters.Template.loadMore(),
              ),
            ),
          reload: () =>
            props.setState(
              SearchableInfiniteStreamState().Updaters.Template.searchText(
                replaceWith(""),
              ),
            ),
          select: (_) =>
            props.foreignMutations.onChange(replaceWith(_), List()),
        }}
      />
    </>
  )).any([
    loaderRunner,
    debouncerRunner.mapContextFromProps((props) => ({
      ...props.context,
      onDebounce: () =>
        props.setState(
          SearchableInfiniteStreamState().Updaters.Core.customFormState.children.stream(
            InfiniteStreamState<CollectionReference>().Updaters.Template.reload(
              props.context.customFormState.getChunk(
                props.context.customFormState.searchText.value,
              ),
            ),
          ),
        ),
    })),
    ValidateRunner<
      Context & { disabled: boolean },
      SearchableInfiniteStreamState,
      ForeignMutationsExpected,
      ValueOption
    >(
      validation
        ? (_) =>
            validation(_).then(
              FieldValidationWithPath.Default.fromFieldValidation,
            )
        : undefined,
    ),
  ]);
};
