import { List, OrderedMap } from "immutable";
import { Guid, SimpleCallback, Debounce, InfiniteStreamLoader, CollectionSelection, id, replaceWith, OrderedMapRepo, AsyncState, BasicFun, Synchronize, Unit, ValidateRunner } from "../../../../../../main";
import { CoTypedFactory } from "../../../../../coroutines/builder";
import { Debounced } from "../../../../../debounced/state";
import { InfiniteStreamState } from "../../../../../infinite-data-stream/state";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { CollectionReference } from "../../../collection/domains/reference/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { FieldValidation, FieldValidationWithPath, FormValidatorSynchronized, OnChange, ValidationError } from "../../../singleton/state";
import { SearchableInfiniteStreamState } from "../searchable-infinite-stream/state";
import { InfiniteStreamMultiselectView } from "./state";


export const InfiniteMultiselectDropdownForm = <Element extends CollectionReference, Context extends FormLabel, ForeignMutationsExpected>(
  validation? :BasicFun<OrderedMap<Guid, Element>, Promise<FieldValidation>>
) => {
  const Co = CoTypedFactory<Context & Value<OrderedMap<Guid, Element>> & { disabled:boolean }, SearchableInfiniteStreamState<Element>>();
  const DebouncerCo = CoTypedFactory<Context & { onDebounce: SimpleCallback<void>; } & Value<OrderedMap<Guid, Element>>, SearchableInfiniteStreamState<Element>>();
  const DebouncedCo = CoTypedFactory<{ onDebounce: SimpleCallback<void>; }, Value<string>>();
  const debouncer = DebouncerCo.Repeat(
    DebouncerCo.Seq([
      Debounce<Value<string>, { onDebounce: SimpleCallback<void>; }>(
        DebouncedCo.GetState().then(current => DebouncedCo.Do(() => current.onDebounce()))
          //.SetState(SearchNow.Updaters.reloadsRequested(_ => _ + 1))
          .then(_ => DebouncedCo.Return("success")),
        250
      ).embed(_ => ({ ..._, ..._.searchText }), SearchableInfiniteStreamState<Element>().Updaters.Core.searchText),
      DebouncerCo.Wait(0)
    ])
  );
  const debouncerRunner = DebouncerCo.Template<ForeignMutationsExpected & { onChange: OnChange<OrderedMap<Guid, Element>>; }>(
    debouncer,
    {
      interval: 15,
      runFilter: props => Debounced.Operations.shouldCoroutineRun(props.context.searchText)
    }
  );
  const loaderRunner = Co.Template<ForeignMutationsExpected & { onChange: OnChange<OrderedMap<Guid, Element>>; }>(
    InfiniteStreamLoader<Element>().embed(_ => _.stream, SearchableInfiniteStreamState<Element>().Updaters.Core.stream),
    {
      interval: 15,
      runFilter: props => InfiniteStreamState().Operations.shouldCoroutineRun(props.context.stream)
    }
  );

  return Template.Default<Context & Value<OrderedMap<Guid, Element>> & { disabled:boolean }, SearchableInfiniteStreamState<Element>, ForeignMutationsExpected & { onChange: OnChange<OrderedMap<Guid, Element>>; }, InfiniteStreamMultiselectView<Element, Context, ForeignMutationsExpected>>(props => <>
    <props.view {...props}
      context={{
        ...props.context,
        hasMoreValues: !(props.context.stream.loadedElements.last()?.hasMoreValues == false),
        isLoading: AsyncState.Operations.isLoading(props.context.stream.loadingMore),
        availableOptions: props.context.stream.loadedElements.valueSeq().flatMap(chunk =>
          chunk.data.valueSeq()
        ).toArray()
      }}
      foreignMutations={{
        ...props.foreignMutations,
        toggleOpen: () => props.setState(
            SearchableInfiniteStreamState<Element>().Updaters.Core.status(
              replaceWith(
                props.context.status == "closed" ? "open" : "closed")
            ).then(
              props.context.stream.loadedElements.count() == 0 ?
                SearchableInfiniteStreamState<Element>().Updaters.Core.stream(
                  InfiniteStreamState<Element>().Updaters.Template.loadMore()
                )
                : id
            )
          ),
        clearSelection: () => {
          props.foreignMutations.onChange(
            OrderedMapRepo.Updaters.clear(), List()
          )
        },
        setSearchText: _ =>
          props.setState(
            SearchableInfiniteStreamState<Element>().Updaters.Template.searchText(
              replaceWith(_)
            )
          ),
        loadMore: () =>
          props.setState(
            SearchableInfiniteStreamState<Element>().Updaters.Core.stream(
              InfiniteStreamState<Element>().Updaters.Template.loadMore()
            )
          ),
        reload: () =>
          props.setState(
            SearchableInfiniteStreamState<Element>().Updaters.Template.searchText(
              replaceWith("")
            )
          ),
        toggleSelection: element =>
          props.foreignMutations.onChange(
            props.context.value.has(element.id) ?
              OrderedMapRepo.Updaters.remove(element.id) :
              OrderedMapRepo.Updaters.set(element.id, element),
            List()),
      }}
    />
  </>
  ).any([
    loaderRunner,
    debouncerRunner.mapContextFromProps(props => ({
      ...props.context,
      onDebounce: () => props.setState(
        SearchableInfiniteStreamState<Element>().Updaters.Core.stream(
          InfiniteStreamState<Element>().Updaters.Template.reload(
            props.context.getChunk(props.context.searchText.value)
          )
        )
      )
    })),
    ValidateRunner<Context & { disabled:boolean }, SearchableInfiniteStreamState<Element>, ForeignMutationsExpected, OrderedMap<Guid, Element>>(
      validation ? _ => validation(_).then(FieldValidationWithPath.Default.fromFieldValidation) : undefined
    ),
  ]);
};
