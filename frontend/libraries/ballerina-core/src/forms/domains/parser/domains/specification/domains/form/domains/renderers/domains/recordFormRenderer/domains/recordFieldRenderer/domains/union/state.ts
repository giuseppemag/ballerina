import {
  Expr,
  ParsedType,
  ValueOrErrors,
} from "../../../../../../../../../../../../../../../../main";

import {
  BaseRecordFieldRenderer,
  BaseSerializedRecordFieldRenderer,
  SerializedRecordFieldRenderer,
  RecordFieldRenderer,
} from "../../state";
import { List, Map } from "immutable";

export type SerializedUnionRecordFieldRenderer = {
  cases?: unknown;
} & BaseSerializedRecordFieldRenderer;

export type UnionRecordFieldRenderer<T> = BaseRecordFieldRenderer<T> & {
  kind: "unionRecordField";
  cases: Map<string, RecordFieldRenderer<T>>;
};

export const UnionRecordFieldRenderer = {
  Default: <T>(
    type: ParsedType<T>,
    fieldPath: List<string>,
    renderer: string,
    cases: Map<string, RecordFieldRenderer<T>>,
    visible: Expr,
    disabled: Expr,
    label?: string,
    tooltip?: string,
    details?: string,
  ): UnionRecordFieldRenderer<T> => ({
    kind: "unionRecordField",
    type,
    fieldPath,
    renderer,
    cases,
    visible,
    disabled,
    label,
    tooltip,
    details,
  }),
  Operations: {
    hasRenderers: (
      serialized: SerializedUnionRecordFieldRenderer,
    ): serialized is SerializedUnionRecordFieldRenderer & {
      renderer: string;
      cases: Record<string, SerializedRecordFieldRenderer>;
    } =>
      serialized.renderer != undefined &&
      typeof serialized.renderer == "string" &&
      serialized.cases != undefined,
    tryAsValidUnionRecordFieldRenderer: (
      fieldPath: List<string>,
      serialized: SerializedUnionRecordFieldRenderer,
    ): ValueOrErrors<
      Omit<SerializedUnionRecordFieldRenderer, "renderer" | "cases"> & {
        renderer: string;
        cases: Record<string, SerializedRecordFieldRenderer>;
      },
      string
    > => {
      if (!UnionRecordFieldRenderer.Operations.hasRenderers(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer and cases are required for renderer ${fieldPath.join(".")}`,
        );
      if (typeof serialized.cases != "object") {
        return ValueOrErrors.Default.throwOne(
          `cases must be an object for renderer ${fieldPath.join(".")}`,
        );
      }
      if (Object.keys(serialized.cases).length == 0) {
        return ValueOrErrors.Default.throwOne(
          `cases must have at least one case for renderer ${fieldPath.join(
            ".",
          )}`,
        );
      }
      if (
        Object.values(serialized.cases).some(
          (caseProp) => typeof caseProp != "object",
        )
      ) {
        return ValueOrErrors.Default.throwOne(
          `cases must be objects for renderer ${fieldPath.join(".")}`,
        );
      }
      const cases = serialized.cases as Record<
        string,
        SerializedRecordFieldRenderer
      >;

      return ValueOrErrors.Default.return({
        ...serialized,
        cases: cases,
      });
    },
    Deserialize: <T>(
      type: ParsedType<T>,
      fieldPath: List<string>,
      serialized: SerializedUnionRecordFieldRenderer,
    ): ValueOrErrors<UnionRecordFieldRenderer<T>, string> => {
      return UnionRecordFieldRenderer.Operations.tryAsValidUnionRecordFieldRenderer(
        fieldPath,
        serialized,
      ).Then((serializedUnionRecordFieldRenderer) =>
        Expr.Operations.parse(
          serializedUnionRecordFieldRenderer.visible,
          fieldPath.push("visible"),
        ).Then((visibleExpr) =>
          Expr.Operations.parse(
            serializedUnionRecordFieldRenderer.disabled,
            fieldPath.push("disabled"),
          ).Then((disabledExpr) =>
            ValueOrErrors.Operations.All(
              List<ValueOrErrors<[string, RecordFieldRenderer<T>], string>>(
                Object.entries(serializedUnionRecordFieldRenderer.cases).map(
                  ([caseName, caseProp]) =>
                    RecordFieldRenderer.Operations.Deserialize(
                      type,
                      fieldPath.push(caseName),
                      caseProp,
                    ).Then((deserializedCase) => {
                      return ValueOrErrors.Default.return([
                        caseName,
                        deserializedCase,
                      ]);
                    }),
                ),
              ),
            ).Then((deserializedCases) => {
              return ValueOrErrors.Default.return(
                UnionRecordFieldRenderer.Default(
                  type,
                  fieldPath,
                  serializedUnionRecordFieldRenderer.renderer,
                  Map<string, RecordFieldRenderer<T>>(deserializedCases),
                  visibleExpr,
                  disabledExpr,
                  serializedUnionRecordFieldRenderer.label,
                  serializedUnionRecordFieldRenderer.tooltip,
                  serializedUnionRecordFieldRenderer.details,
                ),
              );
            }),
          ),
        ),
      );
    },
  },
};
