import { Expr } from "../../../../../../../../../../../../../../../../main";
import {
  ParsedApplicationType,
  ValueOrErrors,
} from "../../../../../../../../../../../../../../../../main";
import {
  BaseRecordFieldRenderer,
  BaseSerializedRecordFieldRenderer,
  RecordFieldRenderer,
  SerializedRecordFieldRenderer,
} from "../../state";
import { List } from "immutable";

export type SerializedMapRecordFieldRenderer = {
  keyRenderer?: unknown;
  valueRenderer?: unknown;
} & BaseSerializedRecordFieldRenderer;

export type MapRecordFieldRenderer<T> = BaseRecordFieldRenderer<T> & {
  kind: "mapRecordField";
  keyRenderer: RecordFieldRenderer<T>;
  valueRenderer: RecordFieldRenderer<T>;
  type: ParsedApplicationType<T>;
};

export const MapRecordFieldRenderer = {
  Default: <T>(
    type: ParsedApplicationType<T>,
    fieldPath: List<string>,
    renderer: string,
    keyRenderer: RecordFieldRenderer<T>,
    valueRenderer: RecordFieldRenderer<T>,
    visible: Expr,
    disabled: Expr,
    label?: string,
    tooltip?: string,
    details?: string,
  ): MapRecordFieldRenderer<T> => ({
    kind: "mapRecordField",
    fieldPath,
    type,
    renderer,
    keyRenderer,
    valueRenderer,
    visible,
    disabled,
    label,
    tooltip,
    details,
  }),
  Operations: {
    hasRenderers: (
      serialized: SerializedMapRecordFieldRenderer,
    ): serialized is SerializedMapRecordFieldRenderer & {
      renderer: string;
      keyRenderer: SerializedRecordFieldRenderer;
      valueRenderer: SerializedRecordFieldRenderer;
    } =>
      serialized.renderer != undefined &&
      typeof serialized.renderer == "string" &&
      serialized.keyRenderer != undefined &&
      serialized.valueRenderer != undefined,
    tryAsValidMapRecordFieldRenderer: (
      fieldPath: List<string>,
      serialized: SerializedMapRecordFieldRenderer,
    ): ValueOrErrors<
      Omit<
        SerializedMapRecordFieldRenderer,
        "renderer" | "keyRenderer" | "valueRenderer"
      > & {
        renderer: string;
        keyRenderer: SerializedRecordFieldRenderer;
        valueRenderer: SerializedRecordFieldRenderer;
      },
      string
    > => {
      if (!MapRecordFieldRenderer.Operations.hasRenderers(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer, keyRenderer and valueRenderer are required for renderer ${fieldPath.join(
            ".",
          )}`,
        );

      return ValueOrErrors.Default.return(serialized);
    },
    Deserialize: <T>(
      type: ParsedApplicationType<T>,
      fieldPath: List<string>,
      serialized: SerializedMapRecordFieldRenderer,
    ): ValueOrErrors<MapRecordFieldRenderer<T>, string> => {
      return MapRecordFieldRenderer.Operations.tryAsValidMapRecordFieldRenderer(
        fieldPath,
        serialized,
      ).Then((serializedMapRecordFieldRenderer) =>
        Expr.Operations.parse(
          serializedMapRecordFieldRenderer.visible ?? true,
          fieldPath.push("visibilityPredicate"),
        ).Then((visibilityExpr) =>
          Expr.Operations.parse(
            serializedMapRecordFieldRenderer.disabled ?? false,
            fieldPath.push("disabledPredicate"),
          ).Then((disabledExpr) =>
            RecordFieldRenderer.Operations.Deserialize(
              type.args[0],
              fieldPath.push("keyRenderer"),
              serializedMapRecordFieldRenderer.keyRenderer,
            ).Then((deserializedKeyRenderer) =>
              RecordFieldRenderer.Operations.Deserialize(
                type.args[1],
                fieldPath.push("valueRenderer"),
                serializedMapRecordFieldRenderer.valueRenderer,
              ).Then((deserializedValueRenderer) => {
                return ValueOrErrors.Default.return(
                  MapRecordFieldRenderer.Default(
                    type,
                    fieldPath,
                    serializedMapRecordFieldRenderer.renderer,
                    deserializedKeyRenderer,
                    deserializedValueRenderer,
                    visibilityExpr,
                    disabledExpr,
                    serializedMapRecordFieldRenderer.label,
                    serializedMapRecordFieldRenderer.tooltip,
                    serializedMapRecordFieldRenderer.details,
                  ),
                );
              }),
            ),
          ),
        ),
      );
    },
  },
};
