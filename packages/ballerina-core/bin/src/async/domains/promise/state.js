export const PromiseRepo = {
    Default: {
        mock: (value, error = () => "error", probabilityOfSuccess = 0.9, averageDelay = 0.2) => {
            const λ = 1 / averageDelay;
            const delay = Math.log(1 - Math.random()) / (-λ); // sample the exponential distribution
            return new Promise((resolve, reject) => setTimeout(() => Math.random() <= probabilityOfSuccess ?
                resolve(value())
                : reject(error()), delay * 1000));
        }
    }
};
//# sourceMappingURL=state.js.map