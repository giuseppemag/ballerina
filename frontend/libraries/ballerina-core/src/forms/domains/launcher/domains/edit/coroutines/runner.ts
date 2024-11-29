import {
  ApiErrors,
  AsyncState,
  Debounce,
  Debounced,
  EditFormForeignMutationsExpected,
  EditFormState,
  id,
  Synchronize,
  Synchronized,
  unit,
  Unit,
  Value,
} from "../../../../../../../main";
import { CoTypedFactory } from "../../../../../../coroutines/builder";
import { EditFormContext, EditFormWritableState } from "../state";

export const editFormRunner = <E, FS>() => {
  const Co = CoTypedFactory<
    EditFormContext<E, FS>,
    EditFormWritableState<E, FS>
  >();

  const init = Co.GetState().then((current) =>
    Synchronize<Unit, E>(
      () => current.api.get(),
      (_) => "transient failure",
      5,
      50
    ).embed(
      (_) => _.entity,
      (_) => EditFormState<E, FS>().Updaters.Core.entity(_)
    )
  );

  const synchronize = Co.Repeat(
    Co.GetState().then((current) =>
      Debounce<
        Synchronized<Unit, ApiErrors>,
        EditFormWritableState<E, FS>
      >(
        Synchronize<Unit, ApiErrors, EditFormWritableState<E, FS>
        >(
          (_) =>
            current.entity.sync.kind == "loaded"
              ? current.api.update(current.entity.sync.value)
              : Promise.resolve([]),
          (_) => "transient failure",
          5,
          50
        ),
        15
      ).embed(
        (_) => ({..._, ..._.apiRunner}),
        (_) => EditFormState<E, FS>().Updaters.Core.apiRunner(_)
      )
    )
  );

  return Co.Template<EditFormForeignMutationsExpected<E, FS>>(init, {
    interval: 15,
    runFilter: (props) =>
      !AsyncState.Operations.hasValue(props.context.entity.sync),
  }).any([
    Co.Template<EditFormForeignMutationsExpected<E, FS>>(synchronize, {
      interval: 100,
      runFilter: (props) =>
        Debounced.Operations.shouldCoroutineRun(props.context.apiRunner),
    }),
  ]);
};

