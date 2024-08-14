import { Fun } from "../../../../state";
import { Updater } from "../../state";
export const maybeUpdater = () => (field) => ({
    [field]: Object.assign(Fun((fieldUpdater) => {
        return Updater(currentEntity => currentEntity[field] == undefined ? currentEntity :
            (Object.assign(Object.assign({}, currentEntity), { [field]: fieldUpdater(currentEntity[field]) })));
    }), {
        both: Fun((fieldUpdater) => {
            return Updater(currentEntity => (Object.assign(Object.assign({}, currentEntity), { [field]: fieldUpdater(currentEntity[field]) })));
        })
    }),
});
// // reference examples:
// type T = {
//   x:number,
//   y:string | undefined,
//   z?:boolean
// }
// const T = {
//   Updaters:{
//     ...maybeUpdater<T>()("x"),
//     ...maybeUpdater<T>()("y").y(...),
//     ...maybeUpdater<T>()("z").z.both(...),
//   }
// }
//# sourceMappingURL=state.js.map