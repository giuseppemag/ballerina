import {
  FormLabel,
  View,
  Value,
  CommonFormState,
  OnChange,
  SimpleCallback,
  BasicFun,
  FieldValidation,
  Template,
  replaceWith,
  ValidateRunner,
  FieldValidationWithPath,
  Unit,
  simpleUpdater,
  simpleUpdaterWithChildren,
  DeltaCustom,
  ParsedType,
} from "ballerina-core";

export type Category = {
  kind: "custom";
  value: {
    kind: "child" | "adult" | "senior";
    extraSpecial: boolean;
  };
};

export type CategoryState = {
  customFormState: {
    likelyOutdated: boolean;
  };
};

export const CategoryState = {
  Default: (): CategoryState => ({
    customFormState: {
      likelyOutdated: false,
    },
  }),
  Updaters: {
    Core: {
      ...simpleUpdaterWithChildren<CategoryState>()({
        ...simpleUpdater<CategoryState["customFormState"]>()("likelyOutdated"),
      })("customFormState"),
    },
  },
};

export type CategoryView<
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context &
    Value<Category> & {
      commonFormState: CommonFormState;
      customFormState: CategoryState["customFormState"];
    } & { disabled: boolean; type: ParsedType<any> },
  {
    commonFormState: CommonFormState;
    customFormState: CategoryState["customFormState"];
  },
  ForeignMutationsExpected & {
    onChange: OnChange<Category>;
    setNewValue: SimpleCallback<Category>;
  }
>;

export const CategoryForm = <
  Context extends FormLabel,
  ForeignMutationsExpected,
>(
  validation?: BasicFun<Category, Promise<FieldValidation>>,
) => {
  return Template.Default<
    Context & Value<Category> & { disabled: boolean; type: ParsedType<any> },
    {
      commonFormState: CommonFormState;
      customFormState: CategoryState["customFormState"];
    },
    ForeignMutationsExpected & { onChange: OnChange<Category> },
    CategoryView<Context, ForeignMutationsExpected>
  >((props) => (
    <>
      <props.view
        {...props}
        foreignMutations={{
          ...props.foreignMutations,
          setNewValue: (_) => {
            const delta: DeltaCustom = {
              kind: "CustomDelta",
              value: {
                kind: "CategoryReplace",
                replace: _,
                state: {
                  commonFormState: props.context.commonFormState,
                  customFormState: props.context.customFormState,
                },
                type: props.context.type,
              },
            };
            props.foreignMutations.onChange(replaceWith(_), delta);
          },
        }}
      />
    </>
  )).any([
    ValidateRunner<
      Context & { disabled: boolean; type: ParsedType<any> },
      {
        commonFormState: CommonFormState;
        customFormState: CategoryState["customFormState"];
      },
      ForeignMutationsExpected,
      Category
    >(
      validation
        ? (_) =>
            validation(_).then(
              FieldValidationWithPath.Default.fromFieldValidation,
            )
        : undefined,
    ),
  ]);
};

export const categoryForm = (
  fieldViews: any,
  viewType: any,
  viewName: any,
  label: string,
  tooltip?: string,
  details?: string,
) =>
  CategoryForm<any & FormLabel, Unit>()
    .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
    .mapContext<any & CommonFormState & Value<Category>>((_) => ({
      ..._,
      type: {
        kind: "primitive",
        value: "injectedCategory",
      },
      label,
      tooltip,
      details,
    })) as any;

export type PersonFormInjectedTypes = {
  injectedCategory: { type: Category; state: CategoryState };
};
