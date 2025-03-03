import { ApiResponseChecker, ApiResponseHandler } from "../state";
import { CoTypedFactory } from "../../coroutines/builder";
import { AsyncState } from "../../../main";

export const HandleApiResponse = <State, Context, ApiErrors>(
  asyncAccessor: (_: State & Context) => AsyncState<ApiErrors>,
  handlers: ApiResponseHandler<State & Context, ApiErrors>,
) => {
  const CheckerCo = CoTypedFactory<Context, State>();

  return CheckerCo.GetState().then((_) => {
    const asyncState = asyncAccessor(_);

    return AsyncState.Operations.isLoading(asyncState)
      ? CheckerCo.Do(() => {})
      : CheckerCo.Do(() => {
          return AsyncState.Operations.status(asyncState) === "error"
            ? handlers.handleError?.(
                asyncState.kind === "error" ? asyncState.error : undefined,
              )
            : handlers.handleSuccess?.(_);
        });
  });
};
