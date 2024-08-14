import { CoTypedFactory } from "../coroutines/builder";
export const QueueCoroutine = (removeItem, getItemsToProcess) => {
    const Co = CoTypedFactory();
    return Co.Repeat(Co.GetState().then(current => {
        let operations = getItemsToProcess(current);
        return Co.Seq([
            Co.All(operations.toArray()
                .map(([id, k]) => k.preprocess.then(() => k.operation)
                .then(_ => 
            // alert(`${JSON.stringify(k)} => ${_}\n`)
            k.postprocess(_).then(() => {
                if (_ == "completed") {
                    return Co.Return({});
                }
                else {
                    return k.reenqueue;
                }
            })).then(() => removeItem(id)))),
        ]);
    }));
};
//# sourceMappingURL=state.js.map