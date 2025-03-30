import { ValueOrErrors } from "../../../../collections/domains/valueOrErrors/state";

import { DispatcherContext, RecordFieldRenderer, RecordFormRenderer, UnionFormRenderer } from "../../../../../main";
import { ParsedType } from "../../parser/domains/specification/domains/types/state";

export const FormDispatcher = {
  Operations: {
    Dispatch: <T extends { [key in keyof T]: { type: any; state: any } },>(
      formName: string,
      type: ParsedType<T>,
      renderer: RecordFormRenderer<T> | UnionFormRenderer<T>,
      dispatcherContext: DispatcherContext<T>,
      entity: any,
      state: any,
    ): ValueOrErrors<React.JSX.Element, string> => {
      if (renderer.kind == "recordForm"){
        if (type.kind != "record"){
          return ValueOrErrors.Default.throwOne(
            `When parsing ${formName} expected a record type, but got a ${type.kind} type`,
          );
        }
        return RecordFormRenderer.Operations.Deserialize(
          type,
          fieldPath,
          serialized,
        );
      }
      if (renderer.kind == "unionForm"){
        if (type.kind != "union"){
          return ValueOrErrors.Default.throwOne(
            `When parsing ${formName} expected a union type, but got a ${type.kind} type`,
          );
        }
      }
      return RecordFieldRenderer.Operations.Deserialize(
        type,
        fieldPath,
        serialized,
      );
    },
  },
};
