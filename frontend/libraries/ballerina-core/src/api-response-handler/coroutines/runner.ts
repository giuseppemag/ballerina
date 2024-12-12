import { ApiResponseChecker, ApiResponseHandler } from "../state";
import { CoTypedFactory } from "../../coroutines/builder";
import { AsyncState } from "../../../main";

export const HandleApiResponse = <
  State extends ApiResponseChecker,
  Context,
  ApiErrors
>(
  asyncAccessor: (_: State & Context) => AsyncState<ApiErrors>,
  handlers: ApiResponseHandler<State & Context, ApiErrors>
) => {
  const CheckerCo = CoTypedFactory<Context, State>();

  return CheckerCo.GetState().then((_) => {
    const asyncState = asyncAccessor(_);

    return AsyncState.Operations.isLoading(asyncState)
      ? CheckerCo.Do(() => {})
      : CheckerCo.Seq([
        CheckerCo.Do(() => {
          return AsyncState.Operations.status(asyncState) === 'error'
            ? handlers.handleError?.(
              asyncState.kind === 'error' ? asyncState.error : undefined
            )
            : handlers.handleSuccess?.(_)
          }),
          CheckerCo.SetState((_) => ({
            ..._,
            ...ApiResponseChecker.Updaters.toChecked()(_),
          })),
        ]);
  });
};
