import { InfiniteStreamState } from "../state";
import { StreamCo } from "./builder";
import { Loader } from "./infiniteLoader";
export const StreamDataLoader = () => {
    const operations = InfiniteStreamState().Operations;
    const LoaderTemplate = StreamCo().Template(Loader(), {
        runFilter: props => operations.shouldCoroutineRun(props.context)
    });
    return LoaderTemplate.mapContext(_ => _);
};
//# sourceMappingURL=runner.js.map