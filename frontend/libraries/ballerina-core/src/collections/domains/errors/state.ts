import { List } from "immutable";

export type TestTestTest<e> = { errors: List<e> }
export type Errors<e> = { errors: List<e> }

export const Errors = {
  Default: {
    zero: <e>() : Errors<e> => ({ errors:List() }),
    singleton: <e>(e:e) : Errors<e> => ({ errors:List([e]) }),
  },
  Operations: {
    concat:<e>(e1:Errors<e>, e2:Errors<e>) : Errors<e> =>
    ({ errors:e1.errors.concat(...e2.errors).toList() })
  },
};
