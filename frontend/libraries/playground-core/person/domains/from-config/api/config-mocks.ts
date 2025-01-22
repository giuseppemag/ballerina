export const PersonFormsConfig = {
  "types": {
    "CityRef": {
      "extends": ["CollectionReference"],
      fields: {}
    },
    "Address": {
      fields: {
        "street": "string",
        "number": "number",
        "city": { fun: "SingleSelection", args: ["CityRef"] }
      }
    },
    "GenderRef": {
      "extends": ["CollectionReference"],
      fields: {}
    },
    "ColorRef": {
      "extends": ["CollectionReference"],
      fields: {}
    },
    "InterestRef": {
      "extends": ["CollectionReference"],
      fields: {}
    },
    "DepartmentRef": {
      "extends": ["CollectionReference"],
      fields: {}
    },
    "PermissionRef": {
      "extends": ["CollectionReference"],
      fields: {}
    },
    "Person": {
      fields: {
        "category": "injectedCategory",
        "name": "string",
        "surname": "string",
        "birthday": "Date",
        "subscribeToNewsletter": "boolean",
        "favoriteColor": { fun: "SingleSelection", args: ["ColorRef"] },
        "gender": { fun: "SingleSelection", args: ["GenderRef"] },
        "dependants": { fun: "Map", args: ["string", "injectedCategory"] },
        "friendsByCategory": { fun: "Map", args: ["injectedCategory", "string"] },
        "relatives": { fun: "List", args: ["injectedCategory"] },
        "interests": { fun: "Multiselection", args: ["InterestRef"] },
        "departments": { fun: "Multiselection", args: ["DepartmentRef"] },
        "mainAddress": "Address",
        "addresses": { fun: "List", args: ["Address"] },
        "emails": { fun: "List", args: ["string"] },
        "addressesWithLabel": { fun: "Map", args: ["string", "Address"] },
        "addressesByCity": { fun: "Map", args: [{ fun: "SingleSelection", args: ["CityRef"]}, "Address"] },
        "addressesWithColorLabel": { fun: "Map", args: [{ fun: "SingleSelection", args: ["ColorRef"]}, "Address"] },
        "permissions": { fun: "Map", args: [{ fun: "SingleSelection", args: ["PermissionRef"]}, "boolean"] },
        "cityByDepartment": { fun: "Map", args: [{fun: "SingleSelection", args: ["DepartmentRef"]}, {fun: "SingleSelection", args: ["CityRef"]}] },
        "shoeColours": {fun: "Multiselection", args: ["ColorRef"]},
        "friendsBirthdays": { fun: "Map", args: ["string", "Date"] },
        "holidays": {fun: "List", args: ["Date"]},
        "interestsToString": { fun: "Map", args: [{fun: "SingleSelection", args: ["InterestRef"]}, "string"] },
      }
    }
  },
  "apis": {
    "enumOptions": {
      "genders": "GenderRef",
      "colors": "ColorRef",
      "interests": "InterestRef",
      "permissions": "PermissionRef",
    },
    "searchableStreams": {
      "cities": "CityRef",
      "departments": "DepartmentRef",
    },
    "entities": {
      "person": {
        "type": "Person",
        "methods": ["create", "get", "update", "default"]
      },
    }
  },
  "mappings": {
  },
  "forms": {
    "address": {
      "type": "Address",
      "fields": {
        "street": {
          renderer: "defaultString", visible:
          { "kind": "true" }
          // {
          //   "kind": "or",
          //   operands: [
          //     { "kind": "leaf", "operation": "field", "arguments": { "location": "root", "field": "subscribeToNewsletter", "value": true } },
          //     { "kind": "leaf", "operation": "field", "arguments": { "location": "local", "field": "number", "value": 10 } },
          //   ]
          // }
        },
        "number": { renderer: "defaultNumber", visible: { "kind": "true" } },
        "city": { renderer: "defaultInfiniteStream", stream: "cities", visible: { "kind": "true" } },
      },
      "tabs": {
        "main": {
          "columns": {
            "main": {
              "groups": {
                "main": ["street", "number", "city"]
              }
            }
          }
        }
      }
    },
    "person": {
      "type": "Person",
      "fields": {
        "category": { label: "category", renderer: "defaultCategory", visible: { "kind": "true" } },
        "name": { label: "first name", tooltip: "Any name will do", renderer: "defaultString", visible: { "kind": "true" } },
        "surname": { label: "last name", renderer: "defaultString", visible: { "kind": "true" } },
        "birthday": { renderer: "defaultDate", tooltip: "happy birthday!", visible: { "kind": "true" } },
        "favoriteColor": {
          renderer: "defaultEnum", options: "colors", visible: { "kind": "true" }
        },
        "gender": {
          label: "gender",
          renderer: "defaultEnum", options: "genders", visible: {
            "kind": "or",
            operands: [
              { "kind": "leaf", "operation": "flag", "arguments": "X" },
              { "kind": "leaf", "operation": "flag", "arguments": "Y" },
            ]
          }
        },
        "dependants": {
          label: "dependants",
          renderer: "defaultMap",
          tooltip: "someone who depends on you",
          keyRenderer: { label: "name", tooltip: "their name", renderer: "defaultString", visible: { "kind": "true" } },
          valueRenderer: { label: "category", tooltip: "their category", renderer: "defaultCategory", visible: { "kind": "true" } },
          visible: { "kind": "true" },
        },
        "friendsByCategory": {
          "label": "friends by category",
          renderer: "defaultMap",
          keyRenderer: { label: "category", renderer: "defaultCategory", visible: { "kind": "true" } },
          valueRenderer: { label: "name", renderer: "defaultString", visible: { "kind": "true" } },
          visible: { "kind": "true" },
        },
        "relatives": { label: "relatives", tooltip: "someone who you are related to", elementTooltip: "one relative", elementLabel: "relative", renderer: "defaultList", elementRenderer:"defaultCategory", visible: { "kind": "true" } },
        "subscribeToNewsletter": { label: "subscribe to newsletter", renderer: "defaultBoolean", visible: { "kind": "true" } },
        "interests": {
          label: "interests",
          renderer: "defaultEnumMultiselect", options: "interests",
          visible: { "kind": "true" },
          // visible: { "kind": "leaf", "operation": "field", "arguments": { "location": "local", "field": "subscribeToNewsletter", "value": true } },
        },
        "departments": { 
          label: "departments",
          renderer: "defaultInfiniteStreamMultiselect", stream: "departments", 
          visible: { "kind": "true" }, 
          disabled: //{ "kind": "true" }
            { "kind": "leaf", "operation": "field", "arguments": { "location": "local", "field": "subscribeToNewsletter", "value": false } }
        },
        "mainAddress": { label: "main address", renderer: "address", visible: { "kind": "true" }},
        "addresses": { label: "other addresses", renderer: "defaultList", elementLabel: "address", elementRenderer:"address", visible: { "kind": "true" } },
        "emails": { label: "emails", renderer: "defaultList", elementLabel: "email", elementRenderer:"defaultString", visible: { "kind": "true" } },
        "addressesWithLabel": {
          label: "addresses with label",
          renderer: "defaultMap",
          keyRenderer:{ label: "address label", renderer: "defaultString", visible: { "kind": "true" } },
          valueRenderer:{ label: "address", renderer: "address", visible: { "kind": "true" } },
          visible: { "kind": "true" } },
        "addressesByCity": {
            label: "addresses by city",
            renderer: "defaultMap",
            keyRenderer:{ label: "city", tooltip: "a nice place to live", renderer: "defaultInfiniteStream", stream: "cities", visible: { "kind": "true" } }, 
            valueRenderer:{label: "address", renderer: "address", visible: { "kind": "true" } }, 
            visible: { "kind": "true" } },
        "addressesWithColorLabel": {
            renderer: "defaultMap",
            label: "addresses with color label",
            keyRenderer:{ label:"color", renderer: "defaultEnum", options: "colors", visible: { "kind": "true" } }, 
            valueRenderer:{ label: "address", renderer: "address", visible: { "kind": "true" } }, 
            visible: { "kind": "true" } },
        "permissions": {
            label: "permissions",
            renderer: "defaultMap",
            keyRenderer:{ label: "permission", renderer: "defaultEnum", options: "permissions", visible: { "kind": "true" } },
            valueRenderer:{ label: "granted", renderer: "defaultBoolean", visible: { "kind": "true" } },
            visible: { "kind": "true" } },
        "cityByDepartment": {
            label: "city by department",
            renderer: "defaultMap",
            keyRenderer:{ label: "department", renderer: "defaultInfiniteStream", stream: "departments", visible: { "kind": "true" } },
            valueRenderer:{ label: "city", renderer: "defaultInfiniteStream", stream: "cities", visible: { "kind": "true" } },
            visible: { "kind": "true" } },
        "shoeColours": {
            label: "shoe colours",
            renderer: "defaultEnumMultiselect", options: "colors", visible: { "kind": "true" }
          },
        "friendsBirthdays": {
            renderer: "defaultMap",
            label: "friends birthdays",
            keyRenderer:{ label: "name", renderer: "defaultString", visible: { "kind": "true" } },
            valueRenderer:{ label: "birthday", renderer: "defaultDate", visible: { "kind": "true" } },
            visible: { "kind": "true" }
          },
        "holidays": {
            label: "holidays",
            renderer: "defaultList",
            visible: { "kind": "true" },
            // backwards compatibility
            // elementLabel: "holiday",
            // elementRenderer: "defaultDate",
            // elementTooltip: "a holiday",
            elementRenderer: { renderer: "defaultDate", label: "holiday", tooltip: "a holiday"},
        },
        "interestsToString": {
            label: "interests to string",
            renderer: "defaultMap",
            keyRenderer:{ label: "interest", renderer: "defaultEnum", options: "interests", visible: { "kind": "true" } },
            valueRenderer:{ label: "string", renderer: "defaultString", visible: { "kind": "true" } },
            visible: { "kind": "true" }
        }, 
      },
      "tabs": {
        "main": {
          "columns": {
            "demographics": {
              "groups": {
                "main": ["category", "name", "surname", "birthday", "gender", "emails", "dependants", "friendsByCategory", "relatives", "friendsBirthdays", "shoeColours"],
              },
            },
            "mailing": {
              "groups": {
                "main": ["subscribeToNewsletter", "interests", "favoriteColor", "interestsToString"],
              }
            },
            "addresses": {
              "groups": {
                "main": ["departments", "mainAddress", "addresses", "addressesWithLabel", "addressesByCity", "addressesWithColorLabel", "permissions", "cityByDepartment", "holidays"],
              }
            }
          }
        }
      }
    }
  },
  "launchers": {
    "create-person": {
      "kind": "create",
      "form": "person",
      "api": "person"
    },
    "edit-person": {
      "kind": "edit",
      "form": "person",
      "api": "person"
    },
    // "person-from-config": {
    //   "kind": "mapping",
    //   "form": "person",
    //   "mapping": "personFromConfig"
    // }
  }
}
