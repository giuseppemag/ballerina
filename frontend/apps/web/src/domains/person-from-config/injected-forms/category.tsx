import { FormLabel, View, Value, SharedFormState, OnChange, SimpleCallback, BasicFun, FieldValidation, Template, replaceWith, ValidateRunner, FieldValidationWithPath, Unit, simpleUpdater } from "ballerina-core";
import { List } from "immutable";

export type Category = { category: "child" | "adult" | "senior", kind: "category"}

// export const Category = {
//   Default: (_: Category["category"] | undefined) => ({ category: _ ?? "adult", kind: "category" as const })
// }

export type CategoryState = {
  likelyOutdated: boolean;
}

export const CategoryState = ({
  Default: (): CategoryState => ({
    likelyOutdated: false
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<CategoryState>()("likelyOutdated")
    }
  }
})

export type CategoryView<Context extends FormLabel, ForeignMutationsExpected> = 
  View<
    Context & Value<Category> & SharedFormState & { disabled:boolean }, 
    SharedFormState & CategoryState, 
    ForeignMutationsExpected & { onChange: OnChange<Category>; setNewValue: SimpleCallback<Category> }
  >;


export const CategoryForm = <Context extends FormLabel, ForeignMutationsExpected>(
  validation?:BasicFun<Category, Promise<FieldValidation>>) => {
  return Template.Default<Context & Value<Category> & { disabled:boolean }, SharedFormState & CategoryState, ForeignMutationsExpected & { onChange: OnChange<Category>; }, CategoryView<Context, ForeignMutationsExpected>>(props => <>
    <props.view {...props}
      foreignMutations={{
        ...props.foreignMutations,
        setNewValue: (_) => props.foreignMutations.onChange(replaceWith(_), List())
      }} />
  </>
  ).any([
    ValidateRunner<Context & { disabled:boolean }, SharedFormState & CategoryState, ForeignMutationsExpected, Category>(
      validation ? _ => validation(_).then(FieldValidationWithPath.Default.fromFieldValidation) : undefined
    ),
  ])
}

export const categoryForm = (fieldViews: any, viewType: any, viewName: any, label: string, tooltip?: string) => CategoryForm<any & FormLabel, Unit>()
  .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
  .mapContext<any & SharedFormState & Value<Category>>(_ => ({ ..._, label, tooltip })) as any

export type PersonFormInjectedTypes = {
  injectedCategory: { type: Category, state: CategoryState }
}