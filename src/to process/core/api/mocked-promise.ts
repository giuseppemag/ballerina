import { BasicFun as BasicFun } from "../../../../Shared/widgets-library/widgets-main";

export const mockedPromise = <Result>(
  minDelay: number,
  maxDelay: number,
  probabilityOfFailure: number,
  result: BasicFun<void, Result>
): Promise<Result> =>
  new Promise((resolve, reject) =>
    setTimeout(
      () => {
        if (Math.random() <= probabilityOfFailure) reject("error");
        else resolve(result());
      },
      minDelay + Math.random() * (maxDelay - minDelay)
    )
  );
