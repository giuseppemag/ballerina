import { MapRepo } from "../../../../collections/domains/immutable/domains/map/state";
import {
  ValueChunk,
  ValueInfiniteStreamState,
  ValueStreamPosition,
} from "../../../../value-infinite-data-stream/state";
import { StateChunk } from "../../../../value-infinite-data-stream/state";
import { CoTypedFactory } from "../../../../coroutines/builder";
import { TableReadonlyContext, TableState } from "../state";
import {
  PredicateValue,
  replaceWith,
  Sum,
  Unit,
  Value,
  ValueRecord,
} from "../../../../../main";
import { Map } from "immutable";

const Co = CoTypedFactory<
  TableReadonlyContext & Value<ValueRecord>,
  TableState
>();

const DEFAULT_CHUNK_SIZE = 20;
// if value exists in entity, use that, otherwise load first chunk from infinite stream
const intialiseTable = Co.GetState().then((current) => {
  const initialData = current.value.fields.get("data");
  const hasMoreValues = current.value.fields.get("hasMoreValues");
  const from = current.value.fields.get("from")! as number;
  const to = current.value.fields.get("to")! as number;
  const getChunkWithParams = current.tableApiSource(
    current.fromApiParserByType(current.type),
  );

  return Co.SetState(
    TableState()
      .Updaters.Core.customFormState.children.stream(
        replaceWith(
          ValueInfiniteStreamState().Default(
            DEFAULT_CHUNK_SIZE,
            getChunkWithParams(Map<string, string>()),
            (initialData as ValueRecord).fields.size == 0 && hasMoreValues
              ? "loadMore"
              : false,
          ),
        )
          .then(
            ValueInfiniteStreamState().Updaters.Coroutine.addLoadedChunk(0, {
              data: initialData as ValueRecord,
              hasMoreValues: hasMoreValues as boolean,
              from,
              to,
            }),
          )
          .then(
            ValueInfiniteStreamState().Updaters.Core.position(
              ValueStreamPosition.Updaters.Core.nextStart(replaceWith(to + 1)),
            ),
          ),
      )
      .then(
        TableState().Updaters.Core.customFormState.children.getChunkWithParams(
          replaceWith(getChunkWithParams),
        ),
      )
      .then(
        TableState().Updaters.Core.customFormState.children.isInitialized(
          replaceWith(true),
        ),
      ),
  );
});

export const TableRunner = Co.Template<Unit>(intialiseTable, {
  interval: 15,
  runFilter: (props) => {
    return !props.context.customFormState.isInitialized;
  },
});
