import { BasicUpdater as BasicUpdater } from "../widgets-library/widgets-main";

export type PossiblyRemoteState<FullState, SynchronizedRemoteState> =
  | { Kind: "Local"; State: FullState }
  | { Kind: "Remote"; State: SynchronizedRemoteState };

export const PossiblyRemoteState = {
  Updaters: {
    FullState:
      <FullState, SynchronizedRemoteState>(
        stateUpdater: BasicUpdater<FullState>
      ): BasicUpdater<
        PossiblyRemoteState<FullState, SynchronizedRemoteState>
      > =>
      (currentPossiblyRemoteState) =>
        currentPossiblyRemoteState.Kind == "Remote"
          ? currentPossiblyRemoteState
          : {
              ...currentPossiblyRemoteState,
              State: stateUpdater(currentPossiblyRemoteState.State),
            },
    RemoteState:
      <FullState, SynchronizedRemoteState>(
        stateUpdater: BasicUpdater<SynchronizedRemoteState>
      ): BasicUpdater<
        PossiblyRemoteState<FullState, SynchronizedRemoteState>
      > =>
      (currentPossiblyRemoteState) =>
        currentPossiblyRemoteState.Kind == "Local"
          ? currentPossiblyRemoteState
          : {
              ...currentPossiblyRemoteState,
              State: stateUpdater(currentPossiblyRemoteState.State),
            },
  },
};
