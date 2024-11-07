// export const PersonFormsConfig = {
//   "types": {
//     "CityRef": {
//       "extends": ["CollectionReference"],
//       fields: {}
//     },
//     "Address": {
//       fields: {
//         "street": "string",
//         "number": "number",
//         "city": { fun: "SingleSelection", args: ["CityRef"] }
//       }
//     },
//     "GenderRef": {
//       "extends": ["CollectionReference"],
//       fields: {}
//     },
//     "ColorRef": {
//       "extends": ["CollectionReference"],
//       fields: {}
//     },
//     "InterestRef": {
//       "extends": ["CollectionReference"],
//       fields: {}
//     },
//     "DepartmentRef": {
//       "extends": ["CollectionReference"],
//       fields: {}
//     },
//     "Person": {
//       fields: {
//         "name": "string",
//         "surname": "string",
//         "birthday": "Date",
//         "subscribeToNewsletter": "boolean",
//         "favoriteColor": { fun: "SingleSelection", args: ["ColorRef"] },
//         "gender": { fun: "SingleSelection", args: ["GenderRef"] },
//         "interests": { fun: "Multiselection", args: ["InterestRef"] },
//         "departments": { fun: "Multiselection", args: ["DepartmentRef"] },
//         "address": "Address",
//       }
//     },
//   },
//   "apis": {
//     "enumOptions": {
//       "genders": "GenderRef",
//       "colors": "ColorRef",
//       "interests": "InterestRef",
//     },
//     "searchableStreams": {
//       "cities": "CityRef",
//       "departments": "DepartmentRef",
//     },
//     "entities": {
//       "person": {
//         "type": "Person",
//         "methods": ["create", "get", "update", "default"]
//       },
//     }
//   },
//   "forms": {
//     "address": {
//       "type": "Address",
//       "fields": {
//         "street": {
//           renderer: "defaultString", visible:
//           {
//             "kind": "or",
//             operands: [
//               { "kind": "leaf", "operation": "field", "arguments": { "location": "root", "field": "subscribeToNewsletter", "value": true } },
//               { "kind": "leaf", "operation": "field", "arguments": { "location": "local", "field": "number", "value": 10 } },
//             ]
//           }
//         },
//         "number": { renderer: "defaultNumber", visible: { "kind": "true" } },
//         "city": { renderer: "defaultInfiniteStream", stream: "cities", visible: { "kind": "true" } },
//       },
//       "tabs": {
//         "main": {
//           "columns": {
//             "main": {
//               "groups": {
//                 "main": ["street", "number", "city"]
//               }
//             }
//           }
//         }
//       }
//     },
//     "person": {
//       "type": "Person",
//       "fields": {
//         "name": { renderer: "defaultString", visible: { "kind": "true" } },
//         "surname": { renderer: "defaultString", visible: { "kind": "true" } },
//         "birthday": { renderer: "defaultDate", visible: { "kind": "true" } },
//         "favoriteColor": {
//           renderer: "defaultEnum", options: "colors", visible: { "kind": "true" }
//         },
//         "gender": {
//           renderer: "defaultEnum", options: "genders", visible: {
//             "kind": "or",
//             operands: [
//               { "kind": "leaf", "operation": "flag", "arguments": "X" },
//               { "kind": "leaf", "operation": "flag", "arguments": "Y" },
//             ]
//           }
//         },
//         "subscribeToNewsletter": { renderer: "defaultBoolean", visible: { "kind": "true" } },
//         "interests": {
//           renderer: "defaultEnumMultiselect", options: "interests",
//           visible: { "kind": "leaf", "operation": "field", "arguments": { "location": "local", "field": "subscribeToNewsletter", "value": true } },
//         },
//         "departments": { renderer: "defaultInfiniteStreamMultiselect", stream: "departments", visible: { "kind": "true" } },
//         "address": { renderer: "address", visible: { "kind": "true" } },
//       },
//       "tabs": {
//         "main": {
//           "columns": {
//             "demographics": {
//               "groups": {
//                 "main": ["name", "surname", "birthday", "gender"],
//               },
//             },
//             "mailing": {
//               "groups": {
//                 "main": ["subscribeToNewsletter", "interests", "favoriteColor"],
//               }
//             },
//             "address": {
//               "groups": {
//                 "main": ["departments", "address"],
//               }
//             }
//           }
//         }
//       }
//     }
//   },
//   "launchers": {
//     "create-person": {
//       "kind": "create",
//       "form": "person",
//       "api": "person"
//     },
//     "edit-person": {
//       "kind": "edit",
//       "form": "person",
//       "api": "person"
//     }
//   }
// }
