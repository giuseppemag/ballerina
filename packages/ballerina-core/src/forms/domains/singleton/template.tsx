import { Template } from "../../../template/state";
import { SingletonFormReadonlyContext, SingletonFormWritableState, SingletonFormForeignMutationsExpected } from "./state";
import { FieldViews } from "./views/field-views";

export const SingletonFormTemplate = <Entity, EnumKeys extends keyof Entity, InfiniteEnumKeys extends keyof Entity, CustomTypeFields, Context>() => Template.Default<
  SingletonFormReadonlyContext<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields, Context> & SingletonFormWritableState<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields>,
  SingletonFormWritableState<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields>,
  SingletonFormForeignMutationsExpected<Entity, EnumKeys, InfiniteEnumKeys>,
  FieldViews
>(props => <>
  {
    props.context.fieldOrder.map(field => props.context.entityDescriptor[field].kind == "string" ?
      <props.view.string
        onChange={e => props.foreignMutations.updateEntity(field, (e as Entity[typeof field]))}
        value={props.context.entity[field] as string} />
      : props.context.entityDescriptor[field].kind == "number" ?
        <props.view.number
          onChange={e => props.foreignMutations.updateEntity(field, (e as Entity[typeof field]))}
          value={props.context.entity[field] as number} />
        : props.context.entityDescriptor[field].kind == "boolean" ?
          <props.view.boolean
            onChange={e => props.foreignMutations.updateEntity(field, (e as Entity[typeof field]))}
            value={props.context.entity[field] as boolean} />
          : props.context.entityDescriptor[field].kind == "date" ?
            <props.view.date
              onChange={e => props.foreignMutations.updateEntity(field, (e as Entity[typeof field]))}
              value={props.context.entity[field] as Date} />
            : props.context.entityDescriptor[field].kind == "custom" ?
              props.context.entityDescriptor[field].render({
                context:props.context,
                state: props.context[field] as any,
                entityValue: props.context.entity,
                fieldValue: props.context.entity[field] as any,
                onChange: newValue => {
                  props.foreignMutations.updateEntity(field, (newValue as Entity[typeof field]));
                },
                setState: props.setState,
              })
              :
              <>
                {JSON.stringify(props.context.entity[field])}
                <button>Remounting or not?</button>
              </>

    )}
</>);
