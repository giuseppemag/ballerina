import { DispatcherContext, RecordFieldRenderer, Template } from "../../../../../../../main";
import { RecordFormRenderer } from "../../../../../../../main";

import { ValueOrErrors } from "../../../../../../collections/domains/valueOrErrors/state";

import { ParsedType } from "../../../../parser/domains/specification/domains/types/state";

import { List } from "immutable";

export const RecordFormDispatcher = {
  Operations: {
    Dispatch: <T extends { [key in keyof T]: { type: any; state: any } },>(
        fieldPath: List<string>,
        type: ParsedType<T>,
        renderer: RecordFormRenderer<T>,
        dispatcherContext: DispatcherContext<T>,
        entity: any,
        state: any,
    ): ValueOrErrors<Template<any, any, any, any>, string> => {
      const x = Template.Default<any, any, any, any>((props) => {
        return <div>Hello</div>;
      });
      return ValueOrErrors.Default.return(x);
    },
  },
};
