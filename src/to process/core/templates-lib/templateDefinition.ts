import {
  BasicFun as BasicFun,
  BasicUpdater as BasicUpdater,
} from "../../../../Shared/widgets-library/widgets-main";

export type Identifiable = { id: number };

export type GuidIdentifiable = { id: string };

export type Widening<Entity, Field extends keyof Entity> = BasicFun<
  BasicUpdater<Entity[Field]>,
  BasicUpdater<Entity>
>;

export type Template<ReadOnlyState, WritableState, ForeignMutations> = (props: {
  readonlyState: ReadOnlyState;
  writableState: WritableState;
  setState: BasicFun<BasicUpdater<WritableState>, void>;
  signalEvent: ForeignMutations;
  children?: JSX.Element;
}) => JSX.Element;

export type ILayout = (props: {
  children: JSX.Element | undefined;
}) => JSX.Element;
