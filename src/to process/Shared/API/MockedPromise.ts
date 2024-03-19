// import { HttpResult } from "../widgets-library/widgets-main";

// export const MockedPromise = <Result>(
//   probabilityOfSuccess: number,
//   waitInterval: [number, number],
//   successfulResult: () => Result,
//   error: () => string
// ): Promise<HttpResult<Result>> =>
//   new Promise((resolve, reject) =>
//     setTimeout(
//       () => {
//         if (Math.random() <= probabilityOfSuccess) {
//           resolve(HttpResult.success(successfulResult()));
//         } else {
//           reject(error());
//         }
//       },
//       1000 * Math.sqrt(Math.random()) * (waitInterval[1] - waitInterval[0]) +
//         waitInterval[0]
//     )
//   );

export {};
