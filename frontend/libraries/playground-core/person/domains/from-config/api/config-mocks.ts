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
    "Person": {
      fields: {
        "name": "string",
        "surname": "string",
        "birthday": "Date",
        "subscribeToNewsletter": "boolean",
        "favoriteColor": { fun: "SingleSelection", args: ["ColorRef"] },
        "gender": { fun: "SingleSelection", args: ["GenderRef"] },
        "interests": { fun: "Multiselection", args: ["InterestRef"] },
        "departments": { fun: "Multiselection", args: ["DepartmentRef"] },
        "mainAddress": "Address",
        "addresses": { fun: "List", args: ["Address"] },
        "emails": { fun: "List", args: ["string"] },
      }
    },
    "PersonFromAPI": {
      fields: {
        "name": "string",
        "surname": "string",
        "birthday": "Date",
        "favoriteColor": { fun: "SingleSelection", args: ["ColorRef"] },
        "gender": { fun: "SingleSelection", args: ["GenderRef"] },
        "departments": { fun: "Multiselection", args: ["DepartmentRef"] },
      }
    },
    "MailingFromAPI": {
      fields: {
        "subscribeToNewsletter": "boolean",
        "interests": { fun: "Multiselection", args: ["InterestRef"] },
      }
    },
    "PersonConfigFromAPI": {
      fields: {
        "person":"PersonFromAPI",
        "mailing":"MailingFromAPI",
        "address":"Address",
      }
    }
  },
  "apis": {
    "enumOptions": {
      "genders": "GenderRef",
      "colors": "ColorRef",
      "interests": "InterestRef",
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
    // "personFromConfig": {
    //   "source":"PersonConfigFromAPI",
    //   "target":"Person",
    //   "paths":{
    //     "name": ["person", "name"],
    //     "surname": ["person", "surname"],
    //     "birthday": ["person", "birthday"],
    //     "favoriteColor": ["person", "favoriteColor"],
    //     "departments": ["person", "departments"],
    //     "gender": ["person", "gender"],
    //     "subscribeToNewsletter": ["mailing", "subscribeToNewsletter"],
    //     "interests": ["mailing", "interests"],
    //     "address":{
    //         "street": ["address", "street"],
    //         "number": ["address", "number"],
    //         "city": ["address", "city"],
    //     }
    //   }
    // }
  },
  "forms": {
    "address": {
      "type": "Address",
      "fields": {
        "street": {
          renderer: "defaultString", visible:
          // { "kind": "true" }
          {
            "kind": "or",
            operands: [
              { "kind": "leaf", "operation": "field", "arguments": { "location": "root", "field": "subscribeToNewsletter", "value": true } },
              { "kind": "leaf", "operation": "field", "arguments": { "location": "local", "field": "number", "value": 10 } },
            ]
          }
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
        "name": { label:"first name", renderer: "defaultString", visible: { "kind": "true" } },
        "surname": { label:"last name", renderer: "defaultString", visible: { "kind": "true" } },
        "birthday": { renderer: "defaultDate", visible: { "kind": "true" } },
        "favoriteColor": {
          renderer: "defaultEnum", options: "colors", visible: { "kind": "true" }
        },
        "gender": {
          renderer: "defaultEnum", options: "genders", visible: {
            "kind": "or",
            operands: [
              { "kind": "leaf", "operation": "flag", "arguments": "X" },
              { "kind": "leaf", "operation": "flag", "arguments": "Y" },
            ]
          }
        },
        "subscribeToNewsletter": { renderer: "defaultBoolean", visible: { "kind": "true" } },
        "interests": {
          renderer: "defaultEnumMultiselect", options: "interests",
          visible: 
          { "kind": "leaf", "operation": "field", "arguments": { "location": "local", "field": "subscribeToNewsletter", "value": true } },
        },
        "departments": { renderer: "defaultInfiniteStreamMultiselect", stream: "departments", 
          visible: { "kind": "true" }, 
          disabled: //{ "kind": "true" }
            { "kind": "leaf", "operation": "field", "arguments": { "location": "local", "field": "subscribeToNewsletter", "value": false } }
        },
        "mainAddress": { renderer: "address", visible: { "kind": "true" } },
        "addresses": { renderer: "defaultList", elementRenderer:"address", visible: { "kind": "true" } },
        "emails": { renderer: "defaultList", elementRenderer:"defaultString", visible: { "kind": "true" } },
      },
      "tabs": {
        "main": {
          "columns": {
            "demographics": {
              "groups": {
                "main": ["name", "surname", "birthday", "gender", "emails"

                ],
              },
            },
            "mailing": {
              "groups": {
                "main": ["subscribeToNewsletter", "interests", "favoriteColor"],
              }
            },
            "addresses": {
              "groups": {
                "main": ["departments", "mainAddress", "addresses"],
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
