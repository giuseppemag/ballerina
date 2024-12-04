import { BasicUpdater, Updater } from "../../main";

export type ApiResponseHandler<response, errors> = {
  handleSuccess?: (_?: response) => void;
  handleError?: (_?: errors) => void;
};

export type ApiResponseChecker = { apiResponseChecked: boolean };

export const ApiResponseChecker = {
  Default: (_?: boolean): ApiResponseChecker => ({
    apiResponseChecked: _ ?? false,
  }),
  Updaters: {
    toChecked: (): BasicUpdater<ApiResponseChecker> => (_) => ({
      ..._,
      apiResponseChecked: true,
    }),
    toUnchecked: (): BasicUpdater<ApiResponseChecker> => (_) => ({
      ..._,
      apiResponseChecked: false,
    }),
  },
  Operations: {
    checked: (_: ApiResponseChecker) => _.apiResponseChecked,
  },
};
