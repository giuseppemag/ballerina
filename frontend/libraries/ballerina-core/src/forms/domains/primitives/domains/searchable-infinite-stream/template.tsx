import { List } from "immutable";
import { SimpleCallback, Debounce, InfiniteStreamLoader, id, replaceWith, BasicFun, ValidateRunner } from "../../../../../../main";
import { CoTypedFactory } from "../../../../../coroutines/builder";
import { Debounced } from "../../../../../debounced/state";
import { InfiniteStreamState } from "../../../../../infinite-data-stream/state";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { CollectionReference } from "../../../collection/domains/reference/state";
import { CollectionSelection } from "../../../collection/domains/selection/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { FieldValidation, FieldValidationWithPath, OnChange } from "../../../singleton/state";
import { SearchableInfiniteStreamState, SearchableInfiniteStreamView } from "./state";


export const SearchableInfiniteStreamForm = <Element extends CollectionReference, Context extends FormLabel, ForeignMutationsExpected>(
  validation?: BasicFun<CollectionSelection<Element>, Promise<FieldValidation>>
) => {
  const Co = CoTypedFactory<Context & Value<CollectionSelection<Element>> & { disabled:boolean }, SearchableInfiniteStreamState<Element>>();
  const DebouncerCo = CoTypedFactory<Context & { onDebounce: SimpleCallback<void>; } & Value<CollectionSelection<Element>>, SearchableInfiniteStreamState<Element>>();
  const DebouncedCo = CoTypedFactory<{ onDebounce: SimpleCallback<void>; }, Value<string>>();
  const debouncer = DebouncerCo.Repeat(
    DebouncerCo.Seq([
      Debounce<Value<string>, { onDebounce: SimpleCallback<void>; }>(
        DebouncedCo.GetState().then(current => DebouncedCo.Do(() => current.onDebounce()))
          //.SetState(SearchNow.Updaters.reloadsRequested(_ => _ + 1))
          .then(_ => DebouncedCo.Return("success")),
        250
      ).embed(_ => ({ ..._, ..._.customFormState.searchText }), SearchableInfiniteStreamState<Element>().Updaters.Core.customFormState.children.searchText),
      DebouncerCo.Wait(0)
    ])
  );
  const debouncerRunner = DebouncerCo.Template<ForeignMutationsExpected & { onChange: OnChange<CollectionSelection<Element>>; }>(
    debouncer,
    {
      interval: 15,
      runFilter: props => Debounced.Operations.shouldCoroutineRun(props.context.customFormState.searchText)
    }
  );
  const loaderRunner = Co.Template<ForeignMutationsExpected & { onChange: OnChange<CollectionSelection<Element>>; }>(
    InfiniteStreamLoader<Element>().embed(_ => _.customFormState.stream, SearchableInfiniteStreamState<Element>().Updaters.Core.customFormState.children.stream),
    {
      interval: 15,
      runFilter: props => InfiniteStreamState().Operations.shouldCoroutineRun(props.context.customFormState.stream)
    }
  );

  return Template.Default<Context & Value<CollectionSelection<Element>> & { disabled:boolean }, SearchableInfiniteStreamState<Element>, ForeignMutationsExpected & { onChange: OnChange<CollectionSelection<Element>>; },
    SearchableInfiniteStreamView<Element, Context, ForeignMutationsExpected>>(props => <>
      <props.view {...props}
        context={{
          ...props.context,
          hasMoreValues: !(props.context.customFormState.stream.loadedElements.last()?.hasMoreValues == false),
        }}
        foreignMutations={{
          ...props.foreignMutations,
          toggleOpen: () => props.setState(
              SearchableInfiniteStreamState<Element>().Updaters.Core.customFormState.children.status(
                replaceWith(
                  props.context.customFormState.status == "closed" ? "open" : "closed")
              ).then(
                props.context.customFormState.stream.loadedElements.count() == 0 ?
                  SearchableInfiniteStreamState<Element>().Updaters.Core.customFormState.children.stream(
                    InfiniteStreamState<Element>().Updaters.Template.loadMore()
                  )
                  : id
              )
            ),
          clearSelection: () => {
            props.foreignMutations.onChange(
              replaceWith(
                CollectionSelection<Element>().Default.right("no selection")
              ), List()
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
              SearchableInfiniteStreamState<Element>().Updaters.Core.customFormState.children.stream(
                InfiniteStreamState<Element>().Updaters.Template.loadMore()
              )
            ),
          reload: () =>
            props.setState(
              SearchableInfiniteStreamState<Element>().Updaters.Template.searchText(
                replaceWith("")
              )
            ),
          select: _ =>
            props.foreignMutations.onChange(replaceWith<CollectionSelection<Element>>(CollectionSelection<Element>().Default.left(_)), List()),
        }}
      />
    </>
    ).any([
      loaderRunner,
      debouncerRunner.mapContextFromProps(props => ({
        ...props.context,
        onDebounce: () => props.setState(
          SearchableInfiniteStreamState<Element>().Updaters.Core.customFormState.children.stream(
            InfiniteStreamState<Element>().Updaters.Template.reload(
              props.context.customFormState.getChunk(props.context.customFormState.searchText.value)
            )
          )
        )
      })),
      ValidateRunner<Context & { disabled:boolean }, SearchableInfiniteStreamState<Element>, ForeignMutationsExpected, CollectionSelection<Element>>(
        validation ? _ => validation(_).then(FieldValidationWithPath.Default.fromFieldValidation) : undefined
      ),
    ]);
};
