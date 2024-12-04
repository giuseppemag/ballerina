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
          CheckerCo.Do(() =>
            AsyncState.Operations.errors(asyncState).length > 0
              ? handlers.handleError?.(
                  AsyncState.Operations.hasValue(asyncState)
                    ? asyncState.value
                    : undefined
                )
              : handlers.handleSuccess?.(_)
          ),
          CheckerCo.SetState((_) => ({
            ..._,
            ...ApiResponseChecker.Updaters().toChecked()(_),
          })),
        ]);
  });
};
