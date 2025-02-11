export const PersonFormsConfig = {
  types: {
    CollectionReference: {
      fields: {
        DisplayValue: "string",
        Id: "guid",
      },
    },
    CityRef: {
      extends: ["CollectionReference"],
      fields: {},
    },
    Address: {
      fields: {
        street: "string",
        number: "number",
        city: { fun: "SingleSelection", args: ["CityRef"] },
      },
    },
    GendersEnum: {
      fun: "Union",
      args: [
        { case: "M", fields: {} },
        { case: "F", fields: {} },
        { case: "X", fields: {} },
      ],
    },
    GenderRef: {
      fields: {
        Value: "GendersEnum",
      },
    },
    ColorsEnum: {
      fun: "Union",
      args: [
        { case: "Red", fields: {} },
        { case: "Green", fields: {} },
        { case: "Blue", fields: {} },
      ],
    },
    ColorRef: {
      extends: [],
      fields: {
        Value: "ColorsEnum",
      },
    },
    InterestsEnum: {
      fun: "Union",
      args: [
        { case: "Soccer", fields: {} },
        { case: "Hockey", fields: {} },
        { case: "BoardGames", fields: {} },
        { case: "HegelianPhilosophy", fields: {} },
      ],
    },
    InterestRef: {
      fields: {
        Value: "InterestsEnum",
      },
    },
    PermissionsEnum: {
      fun: "Union",
      args: [
        { case: "Create", fields: {} },
        { case: "Read", fields: {} },
        { case: "Update", fields: {} },
        { case: "Delete", fields: {} },
      ],
    },
    PermissionRef: {
      fields: {
        Value: "PermissionsEnum",
      },
    },
    DepartmentRef: {
      extends: ["CollectionReference"],
      fields: {},
    },
    Person: {
      fields: {
        category: "injectedCategory",
        name: "string",
        surname: "string",
        birthday: "Date",
        subscribeToNewsletter: "boolean",
        favoriteColor: { fun: "SingleSelection", args: ["ColorRef"] },
        gender: { fun: "SingleSelection", args: ["GenderRef"] },
        dependants: { fun: "Map", args: ["string", "injectedCategory"] },
        friendsByCategory: { fun: "Map", args: ["injectedCategory", "string"] },
        relatives: { fun: "List", args: ["injectedCategory"] },
        interests: { fun: "MultiSelection", args: ["InterestRef"] },
        departments: { fun: "MultiSelection", args: ["DepartmentRef"] },
        mainAddress: "Address",
        addresses: { fun: "List", args: ["Address"] },
        emails: { fun: "List", args: ["string"] },
        addressesWithLabel: { fun: "Map", args: ["string", "Address"] },
        addressesByCity: {
          fun: "Map",
          args: [{ fun: "SingleSelection", args: ["CityRef"] }, "Address"],
        },
        addressesWithColorLabel: {
          fun: "Map",
          args: [{ fun: "SingleSelection", args: ["ColorRef"] }, "Address"],
        },
        permissions: {
          fun: "Map",
          args: [
            { fun: "SingleSelection", args: ["PermissionRef"] },
            "boolean",
          ],
        },
        cityByDepartment: {
          fun: "Map",
          args: [
            { fun: "SingleSelection", args: ["DepartmentRef"] },
            { fun: "SingleSelection", args: ["CityRef"] },
          ],
        },
        shoeColours: { fun: "MultiSelection", args: ["ColorRef"] },
        friendsBirthdays: { fun: "Map", args: ["string", "Date"] },
        holidays: { fun: "List", args: ["Date"] },
      },
    },
  },
  apis: {
    enumOptions: {
      departments: "DepartmentRef",
      genders: "GenderRef",
      colors: "ColorRef",
      interests: "InterestRef",
      permissions: "PermissionRef",
    },
    searchableStreams: {
      cities: "CityRef",
      departments: "DepartmentRef",
    },
    entities: {
      person: {
        type: "Person",
        methods: ["create", "get", "update", "default"],
      },
    },
  },
  mappings: {},
  forms: {
    address: {
      type: "Address",
      fields: {
        street: {
          renderer: "defaultString",
          visible: true,
          // {
          //   kind: "or",
          //   operands: [
          //     {
          //       kind: "leaf",
          //       operation: "field",
          //       arguments: {
          //         location: "root",
          //         field: "subscribeToNewsletter",
          //         value: true,
          //       },
          //     },
          //     {
          //       kind: "leaf",
          //       operation: "field",
          //       arguments: { location: "local", field: "number", value: 10 },
          //     },
          //   ],
          // },
        },
        number: { renderer: "defaultNumber", visible: { kind: "true" } },
        city: {
          renderer: "defaultInfiniteStream",
          stream: "cities",
          visible: true
        },
      },
      tabs: {
        main: {
          columns: {
            main: {
              groups: {
                main: ["street", "number", "city"],
              },
            },
          },
        },
      },
    },
    person: {
      type: "Person",
      fields: {
        category: {
          label: "category",
          details: "categories, surely they have no practical uses?",
          renderer: "defaultCategory",
          visible: false
        },
        name: {
          label: "first name",
          tooltip: "Any name will do",
          renderer: "defaultString",
          visible: true
        },
        surname: {
          label: "last name",
          renderer: "defaultString",
          visible: true
        },
        birthday: {
          renderer: "defaultDate",
          tooltip: "happy birthday!",
          visible: true
        },
        favoriteColor: {
          renderer: "defaultEnum",
          options: "colors",
          visible: true
        },
        gender: {
          label: "gender",
          renderer: "defaultEnum",
          options: "genders",
          visible: {
            kind: "or",
            operands: [
              { kind: "leaf", operation: "flag", arguments: "X" },
              { kind: "leaf", operation: "flag", arguments: "Y" },
            ],
          },
        },
        dependants: {
          label: "dependants",
          renderer: "defaultMap",
          tooltip: "someone who depends on you",
          keyRenderer: {
            label: "name",
            tooltip: "their name",
            details: "a name helps you to identify a person, animal or thing",
            renderer: "defaultString",
            visible: true
          },
          valueRenderer: {
            label: "category",
            tooltip: "their category",
            renderer: "defaultCategory",
            visible: true
          },
          visible: true
        },
        friendsByCategory: {
          label: "friends by category",
          renderer: "defaultMap",
          keyRenderer: {
            label: "category",
            renderer: "defaultCategory",
            visible: true
          },
          valueRenderer: {
            label: "name",
            renderer: "defaultString",
            visible: true
          },
          visible: true
        },
        relatives: {
          label: "relatives",
          renderer: "defaultList",
          elementRenderer: {
            renderer: "defaultCategory",
            label: "relative",
            toolttip: "a relative",
            visible: true

          },
          visible: true
        },
        subscribeToNewsletter: {
          label: "subscribe to newsletter",
          renderer: "defaultBoolean",
          visible: true
        },
        interests: {
          label: "interests",
          renderer: "defaultEnumMultiselect",
          options: "interests",
          visible: {
            kind: "leaf",
            operation: "field",
            arguments: {
              location: "local",
              field: "subscribeToNewsletter",
              value: true,
            },
          },
        },
        departments: {
          label: "departments",
          renderer: "defaultInfiniteStreamMultiselect",
          stream: "departments",
          visible: true,
          disabled: {
            kind: "leaf",
            operation: "field",
            arguments: {
              location: "local",
              field: "subscribeToNewsletter",
              value: false,
            },
          },
        },
        mainAddress: {
          label: "main address",
          renderer: "address",
          visible: true
        },
        addresses: {
          label: "other addresses",
          renderer: "defaultList",
          //bw compatability case
          elementRenderer: "address",
          elementLabel: "address",
          elementTooltip: "address tooltip",
          // elementRenderer: {
          //   renderer: "address",
          //   label: "address",
          //   visible: true
          // },
          visible: true
        },
        emails: {
          label: "emails",
          renderer: "defaultList",
          elementRenderer: {
            renderer: "defaultString",
            label: "email",
            visible: true
          },
          visible: true
        },
        addressesWithLabel: {
          label: "addresses with label",
          renderer: "defaultMap",
          keyRenderer: {
            label: "address label",
            renderer: "defaultString",
            visible: true
          },
          valueRenderer: {
            label: "address",
            renderer: "address",
            visible: true
          },
          visible: true
        },
        addressesByCity: {
          label: "addresses by city",
          renderer: "defaultMap",
          keyRenderer: {
            label: "city",
            tooltip: "a nice place to live",
            renderer: "defaultInfiniteStream",
            stream: "cities",
            visible: true
          },
          valueRenderer: {
            label: "address",
            renderer: "address",
            visible: true
          },
          visible: true
        },
        addressesWithColorLabel: {
          renderer: "defaultMap",
          label: "addresses with color label",
          keyRenderer: {
            label: "color",
            renderer: "defaultEnum",
            options: "colors",
            visible: true
          },
          valueRenderer: {
            label: "address",
            renderer: "address",
            visible: true
          },
          visible: true
        },
        permissions: {
          label: "permissions",
          renderer: "defaultMap",
          keyRenderer: {
            label: "permission",
            renderer: "defaultEnum",
            options: "permissions",
            visible: true
          },
          valueRenderer: {
            label: "granted",
            renderer: "defaultBoolean",
            visible: true
          },
          visible: true
        },
        cityByDepartment: {
          label: "city by department",
          renderer: "defaultMap",
          keyRenderer: {
            label: "department",
            renderer: "defaultInfiniteStream",
            stream: "departments",
            visible: true
          },
          valueRenderer: {
            label: "city",
            renderer: "defaultInfiniteStream",
            stream: "cities",
            visible: true
          },
          visible: true
        },
        shoeColours: {
          label: "shoe colours",
          renderer: "defaultEnumMultiselect",
          options: "colors",
          visible: true
        },
        friendsBirthdays: {
          renderer: "defaultMap",
          label: "friends birthdays",
          keyRenderer: {
            label: "name",
            renderer: "defaultString",
            visible: true
          },
          valueRenderer: {
            label: "birthday",
            renderer: "defaultDate",
            visible: true
          },
          visible: true
        },
        holidays: {
          label: "holidays",
          renderer: "defaultList",
          elementRenderer: {
            label: "date",
            details: "a day off, time to relax, unwind and enjoy the frivolities of life",
            renderer: "defaultDate",
            visible: true
          },
          visible: true
        },
      },
      tabs: {
        main: {
          columns: {
            demographics: {
              groups: {
                main: [
                  "category",
                  "name",
                  "surname",
                  "birthday",
                  "gender",
                  "emails",
                  "dependants",
                  "friendsByCategory",
                  "relatives",
                  "friendsBirthdays",
                  "shoeColours",
                ],
              },
            },
            mailing: {
              groups: {
                main: ["subscribeToNewsletter", "interests", "favoriteColor"],
              },
            },
            addresses: {
              groups: {
                main: [
                  "departments",
                  "mainAddress",
                  "addresses",
                  "addressesWithLabel",
                  "addressesByCity",
                  "addressesWithColorLabel",
                  "permissions",
                  "cityByDepartment",
                  "holidays",
                ],
              },
            },
          },
        },
      },
    },
  },
  launchers: {
    "create-person": {
      kind: "create",
      form: "person",
      api: "person",
    },
    "edit-person": {
      kind: "edit",
      form: "person",
      api: "person",
    },
  },
};
