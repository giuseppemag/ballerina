import {
  CollectionReference,
  InfiniteStreamSources,
  PromiseRepo,
  EnumOptionsSources,
  EntityApis,
  Guid,
  StreamPosition,
  OrderedMapRepo,
} from "ballerina-core";
import { Range, List, OrderedMap } from "immutable";
import { v4 } from "uuid";
import { faker } from "@faker-js/faker";

import debitNoteResultFields from "./enums/config/DebitNoteResultFields";

import accountingPositionFields from "./enums/config/AccountingPositionFields";

import informationCardField from "./enums/config/InformationCardField";

import keyValueFields from "./enums/config/KeyValueFields";

const filterGroupOpEnum: Array<{Value: string}> = [
  { Value: "and"},
  { Value: "or" }
];

const contextEnum: Array<{Value: string}> = [
  {Value: "invoice"},
  {Value: "invoicePosition"},
  {Value: "accountingPosition"},
  {Value: "additionalCostPosition"},
  {Value: "purchaseOrder"},
  {Value: "purchaseOrderPosition"},
  {Value: "deliveryNote"},
  {Value: "deliveryNotePosition"},
  {Value: "orderConfirmation"},
  {Value: "orderConfirmationPosition"},
  {Value: "surcharge"},
  {Value: "header"},
  {Value: "position"},
  {Value: "purchaseRequisition"},
  {Value: "anyPosition"},
  {Value: "paymentAdvice"},
  {Value: "paymentAdvicePosition"},
  {Value: "supplierPurchaseOrder"},
  {Value: "supplierPurchaseOrderPosition"},
  {Value: "allPositions"},
  {Value: "debitNote"},
  {Value: "debitNotePosition"},
];

const filtersOpEnum: Array<{Value: string}> = [
  {Value: "eq"},
  {Value: "neq"},
  {Value: "gt"},
  {Value: "gte"},
  {Value: "lt"},
  {Value: "lte"},
  {Value: "contains"},
  {Value: "notContains"},
  {Value: "match"},
  {Value: "notMatch"},
  {Value: "isNull"},
  {Value: "isNotNull"},
  {Value: "groupedDataContai"},
  {Value: "groupedDataNotContai"},
  {Value: "groupedDataContainsPref"},
  {Value: "groupedDataNotContainsPref"},
];

const filtersValueAnyOfEnum: Array<{Value: string}> = [
  {Value: "string"},
  {Value: "number"},
  {Value: "date-time"},
  {Value: "boolean"},
];

const streamApis: InfiniteStreamSources = (streamName: string) => {
  switch (streamName) {
    case "requiredKeyValueField":
      return (_searchText: string) => (_streamPosition: [StreamPosition]) => {
        const mapped = OrderedMapRepo.Default.fromIdentifiables(
          Range(0, 20)
            .map(() =>
              CollectionReference.Default(
                v4(),
                _searchText + faker.company.buzzNoun() + " required key-value fields",
                "stream"
              )
            )
            .toArray()
        );
        return PromiseRepo.Default.mock(() => ({
          data: mapped,
          hasMoreValues: Math.random() > 0.5,
        }));
      };

    default:
      return (_: string) => (_: [StreamPosition]) => {
        alert(`Cannot find stream API ${streamName}`);
        return Promise.resolve({
          hasMoreValues: false,
          data: OrderedMap(),
        });
      };
  }
};

const enumApis: EnumOptionsSources = (enumName: string) => {
  switch (enumName) {
    case "requiredKeyValueFieldsEnum": {
      return () => PromiseRepo.Default.mock(() => keyValueFields)
    }
    case "highConfidenceKeyValueFieldsEnum": {
      return () => PromiseRepo.Default.mock(() => keyValueFields)
    }
    case "documentNumberDefaultingsFromKeyValueEnum": {
      return () => PromiseRepo.Default.mock(() => keyValueFields)
    }
    case "documentDateDefaultingsFromKeyValueEnum": {
      return () => PromiseRepo.Default.mock(() => keyValueFields)
    }
    case "configurableNumberDefaultingsFromKeyValueEnum": {
      return () => PromiseRepo.Default.mock(() => keyValueFields)
    }
    case "configurableNumber2DefaultingsFromKeyValueEnum": {
      return () => PromiseRepo.Default.mock(() => keyValueFields)
    }
    case "informationKeysEnum": {
      return () => PromiseRepo.Default.mock(() => keyValueFields)
    }
    case "informationKeysDisabledEnum": {
      return () => PromiseRepo.Default.mock(() => keyValueFields)
    }
    case "contextEnum": {
      return () => PromiseRepo.Default.mock(() => contextEnum)
    }
    case "filterGroupOpEnum": {
      return () => PromiseRepo.Default.mock(() => filterGroupOpEnum)
    }
    case "accountingPositionFieldsEnum": {
      return () => PromiseRepo.Default.mock(() => accountingPositionFields)
    }
    case "filtersOpEnum": {
      return () => PromiseRepo.Default.mock(() => filtersOpEnum)
    }
    case "informationCardFieldsEnum": {
      return () => PromiseRepo.Default.mock(() => informationCardField)
    }
    case "informationCardFieldsDisabledEnum": {
      return () => PromiseRepo.Default.mock(() => informationCardField)
    }
    case "debitNoteResultFieldsEnum": {
      return () => PromiseRepo.Default.mock(() => debitNoteResultFields)
    }
    case "filtersValueAnyOfEnum": {
      return () => PromiseRepo.Default.mock(() => filtersValueAnyOfEnum)
    }
    default: {
      alert(`Cannot find enum API ${enumName}`);
      return () => Promise.reject();
    }
  }
};

const entityApis: EntityApis = {
  create: (apiName: string) => (e: any) => {
    alert(`Cannot find entity API ${apiName} for 'create'`);
    return Promise.reject();
  },

  get: (apiName: string) => {
    switch (apiName) {
      case "debitNoteHeaderConfigApi": {
        return (id: Guid) =>
          Promise.resolve({
            commitChecks: {
              keyValueCommitChecks: {
                requiredKeyValueFields: undefined,
                highConfidenceKeyValueFields: undefined,
              },
              dataFilterGroupCommitChecks: {
                name: "",
                nameTranslations: "",
                description: "",
                descriptionTranslations: "",
                context: undefined,
                filterGroup: {
                  filterGroupOp: undefined,
                  filters: [{ name: "hello", value: { anyOfEnum: {id: 'string', displayName: 'string'} }, filterOp: undefined }],
                },
                fieldContext: {
                  accountingPositionFields: undefined,
                },
              },
              synchronizedDataFilterGroupCommitChecks: {
                synchronizedDataFilterGroupCommitChecks: List(),
              },
              documentNumberCommitChecks: {
                documentNumberIsSet: false,
                documentNumberIsHighConfidence: false,
                maxDocumentNumberLength: 0,
                configurableNumberIsSet: false,
                configurableNumberIsHighConfidence: false,
                configurableNumber2IsSet: false,
                configurableNumber2IsHighConfidence: false,
              },
              unequalTableToDocumentRowsCheck: {
                unequalTableToDocumentRowsCheck: false,
              },
            },
            dashboard: {
              keyValueFields: {
                informationKeys: undefined,
                informationKeysDisabled: undefined,
                informationFreeKeys: List(),
              },
              informationCardFields: {
                informationCardFields: undefined,
              },
              informationCardFieldsDisabled: {
                informationCardFieldsDisabled: undefined,
              },
            },
            systemConfig: {
              debitNoteResultFields: undefined,
              automation: {
                headerFieldsDefaults: {
                  documentNumberDefaultingsFromKeyValue: undefined,
                  documentDateDefaultingsFromKeyValue: undefined,
                  configurableNumberDefaultingsFromKeyValue: undefined,
                  configurableNumber2DefaultingsFromKeyValue: undefined,
                },
              },
            },
            base64File: "",
            secret: "",
          });
      }
      default: {
        return (id: Guid) => {
          alert(`Cannot find entity API ${apiName} for 'get'`);
          return Promise.resolve([]);
        };
      }
    }
  },

  update: (apiName: string) => {
    switch (apiName) {
      case "debitNoteHeaderConfigApi": {
        return (_id: Guid, _e: any) => PromiseRepo.Default.mock(() => []);
      }
      default: {
        return (_id: Guid, _e: any) => {
          alert(`Cannot find entity API ${apiName} for 'update'`);
          return Promise.resolve([]);
        };
      }
    }
  },

  default: (apiName: string) => {
    switch (apiName) {
      case "filtersForm": {
        return (_) =>
          Promise.resolve({
            name: "",
            filterValue: {
              anyOfEnum: undefined,
              anyOfTypes: {
                anyOfString: "",
                anyOfNumber: 0,
                anyOfDateTime: "",
                anyOfBoolean: false,
              },
            },
            filterOp: undefined,
          });
      }
      default: {
        alert(`Cannot find entity API ${apiName} for 'default'`);
        return (_) => Promise.reject();
      }
    }
  },
};

export const DebitNoteHeaderConfigApi = {
  streamApis,
  enumApis,
  entityApis,
};
