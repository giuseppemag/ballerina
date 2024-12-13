import { FormLabel, View, Value, SharedFormState, OnChange, SimpleCallback, BasicFun, FieldValidation, Template, replaceWith, ValidateRunner, FieldValidationWithPath, Unit } from "ballerina-core";
import { List } from "immutable";

export type Category = "child" | "adult" | "senior"

export type CategoryView<Context extends FormLabel, ForeignMutationsExpected> = 
  View<
    Context & Value<Category> & SharedFormState & { disabled:boolean }, 
    SharedFormState, 
    ForeignMutationsExpected & { onChange: OnChange<Category>; setNewValue: SimpleCallback<Category> }
  >;


export const CategoryForm = <Context extends FormLabel, ForeignMutationsExpected>(
  validation?:BasicFun<Category, Promise<FieldValidation>>) => {
  return Template.Default<Context & Value<Category> & { disabled:boolean }, SharedFormState, ForeignMutationsExpected & { onChange: OnChange<Category>; }, CategoryView<Context, ForeignMutationsExpected>>(props => <>
    <props.view {...props}
      foreignMutations={{
        ...props.foreignMutations,
        setNewValue: (_) => props.foreignMutations.onChange(replaceWith(_), List())
      }} />
  </>
  ).any([
    ValidateRunner<Context & { disabled:boolean }, SharedFormState, ForeignMutationsExpected, Category>(
      validation ? _ => validation(_).then(FieldValidationWithPath.Default.fromFieldValidation) : undefined
    ),
  ])
}

export const categoryForm = (fieldViews: any, viewType: any, viewName: any, label: string) => CategoryForm<any & FormLabel, Unit>()
  .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
  .mapContext<any & SharedFormState & Value<Category>>(_ => ({ ..._, label: label })) as any

export type PersonFormInjectedTypes = {
  injectedCategory: Category
}