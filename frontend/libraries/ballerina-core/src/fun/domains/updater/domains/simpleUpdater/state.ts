import { Fun } from "../../../../state";
import { Unit } from "../../../unit/state";
import { BasicUpdater, Updater } from "../../state";

export type Widening<p, c extends keyof p> = Fun<BasicUpdater<p[c]>, Updater<p>>;

export type SimpleUpdater<Entity, Field extends keyof Entity> = Required<{
  [f in Field]: Widening<Entity, Field>;
}>;
export const simpleUpdater = <Entity>() => <Field extends keyof Entity>(field: Field): SimpleUpdater<Entity, Field> => ({
  [field]: Fun((fieldUpdater: BasicUpdater<Entity[Field]>): Updater<Entity> => {
    return Updater<Entity>(currentEntity => ({ ...currentEntity, [field]: fieldUpdater(currentEntity[field]) }) as Entity
    );
  }),
}) as SimpleUpdater<Entity, Field>;


export type WidenedChildren<p, children> =
  { [k in Exclude<keyof children, "Core" | "Template" | "Coroutine">]:
    children[k] extends WideningWithChildren<infer child, infer nephew, infer nephews> ?
      Fun<BasicUpdater<child[nephew]>, Updater<p>> & { children:WidenedChildren<p, nephews> }
    : children[k] extends Widening<infer child, infer nephew> ? Fun<BasicUpdater<child[nephew]>, Updater<p>>
    : "cannot invoke custom updaters through automated nesting"
  } & (children extends { Core:Unit } ? {
    Core:WidenedChildren<p, children["Core"]>
   } : Unit) & (children extends { Template:Unit } ? {
    Template:WidenedChildren<p, children["Template"]>
   } : Unit) & (children extends { Coroutine:Unit } ? {
    Coroutine:WidenedChildren<p, children["Coroutine"]>
   } : Unit);

export type WideningWithChildren<p, c extends keyof p, children> =
  Fun<BasicUpdater<p[c]>, Updater<p>> & { children:WidenedChildren<p, children> }

export type SimpleUpdaterWithChildren<Entity, Field extends keyof Entity, children> = {
  [f in Field]: WideningWithChildren<Entity, Field, children>;
};
export const simpleUpdaterWithChildren = <Entity>() => <children>(children:children) => <Field extends keyof Entity>(field: Field): SimpleUpdaterWithChildren<Entity, Field, children> => ({
  [field]: Object.assign(Fun((fieldUpdater: BasicUpdater<Entity[Field]>): Updater<Entity> => {
    const basicUpdater:BasicUpdater<Entity> = currentEntity => ({ ...currentEntity, [field]: fieldUpdater(currentEntity[field]) })
    return Updater<Entity>(basicUpdater);
  }),
    { children:widenChildren<Entity, Entity[Field], children>(simpleUpdater<Entity>()(field)[field], children, ) }
  ),
}) as SimpleUpdaterWithChildren<Entity, Field, children>;


export const widenChildren = <p, child, children>(childToParent:Fun<BasicUpdater<child>, Updater<p>>, children:children) : WidenedChildren<p, children> => {
  if (children == undefined) return {} as any
  const result = {} as WidenedChildren<p, children>
  Object.keys(children as any).forEach(key => {
    if (key == "Core" || key == "Template" || key == "Coroutine") return
    // Fun<BasicUpdater<child[key]>, Updater<child>>
    const fieldOfChildUpdater = (children as any)[key] as any;
    (result as any)[key] = Fun(_ => childToParent(fieldOfChildUpdater(_)))

    if (Object.keys(fieldOfChildUpdater).includes("children")) {
      (result as any)[key]["children"] = widenChildren<p, any, any>(childToParent, fieldOfChildUpdater["children"])
    }
  })

  const updateBlock = (block:string) => {
    if ((children as any)[block] != undefined) {
      (result as any)[block] = widenChildren<p, any, any>(childToParent, (children as any)[block])    
    }
  }
  updateBlock("Core")
  updateBlock("Template")
  updateBlock("Coroutines")

  return result
}
