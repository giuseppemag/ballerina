import { AuthHeaders } from "../../../../../orval/useAuthHeaders";
import { InfiniteStreamState } from "./state";

export type InfiniteStreamReadonlyState = { headers: AuthHeaders };

export type InfiniteStreamWritableState<Element extends { id: string }> =
  InfiniteStreamState<Element>;
