import {
  CollectionReference,
  BoolExpr,
  Unit,
  InfiniteStreamSources,
  PromiseRepo,
  EnumOptionsSources,
  EntityApis,
  unit,
  Guid,
  StreamPosition,
  OrderedMapRepo,
  CollectionSelection,
  EnumValue,
} from "ballerina-core";
import { Range, List, OrderedMap } from "immutable";
import { v4 } from "uuid";
import { faker } from "@faker-js/faker";

import debitNoteResultFields from "./enums/config/DebitNoteResultFields";

import accountingPositionFields from "./enums/config/AccountingPositionFields";

import informationCardField from "./enums/config/InformationCardField";

import keyValueFields from "./enums/config/KeyValueFields";

const filterGroupOpEnum: Array<EnumValue> = [
  CollectionReference.Default.enum("and"),
  CollectionReference.Default.enum("or"),
];

const contextEnum: Array<EnumValue> = [
  CollectionReference.Default.enum("invoice"),
  CollectionReference.Default.enum("invoicePosition"),
  CollectionReference.Default.enum("accountingPosition"),
  CollectionReference.Default.enum("additionalCostPosition"),
  CollectionReference.Default.enum("purchaseOrder"),
  CollectionReference.Default.enum("purchaseOrderPosition"),
  CollectionReference.Default.enum("deliveryNote"),
  CollectionReference.Default.enum("deliveryNotePosition"),
  CollectionReference.Default.enum("orderConfirmation"),
  CollectionReference.Default.enum("orderConfirmationPosition"),
  CollectionReference.Default.enum("surcharge"),
  CollectionReference.Default.enum("header"),
  CollectionReference.Default.enum("position"),
  CollectionReference.Default.enum("purchaseRequisition"),
  CollectionReference.Default.enum("anyPosition"),
  CollectionReference.Default.enum("paymentAdvice"),
  CollectionReference.Default.enum("paymentAdvicePosition"),
  CollectionReference.Default.enum("supplierPurchaseOrder"),
  CollectionReference.Default.enum("supplierPurchaseOrderPosition"),
  CollectionReference.Default.enum("allPositions"),
  CollectionReference.Default.enum("debitNote"),
  CollectionReference.Default.enum("debitNotePosition"),
];

const filtersOpEnum: Array<EnumValue> = [
  CollectionReference.Default.enum("eq"),
  CollectionReference.Default.enum("neq"),
  CollectionReference.Default.enum("gt"),
  CollectionReference.Default.enum("gte"),
  CollectionReference.Default.enum("lt"),
  CollectionReference.Default.enum("lte"),
  CollectionReference.Default.enum("contains"),
  CollectionReference.Default.enum("notContains"),
  CollectionReference.Default.enum("match"),
  CollectionReference.Default.enum("notMatch"),
  CollectionReference.Default.enum("isNull"),
  CollectionReference.Default.enum("isNotNull"),
  CollectionReference.Default.enum("groupedDataContai"),
  CollectionReference.Default.enum("groupedDataNotContai"),
  CollectionReference.Default.enum("groupedDataContainsPref"),
  CollectionReference.Default.enum("groupedDataNotContainsPref"),
];

const filtersValueAnyOfEnum: Array<EnumValue> = [
  CollectionReference.Default.enum("string"),
  CollectionReference.Default.enum("number"),
  CollectionReference.Default.enum("date-time"),
  CollectionReference.Default.enum("boolean"),
];

const streamApis: InfiniteStreamSources = (streamName: string) => {
  switch (streamName) {
    case "requiredKeyValueField":
      return (_searchText: string) => (_streamPosition: [StreamPosition]) => {
        const mapped = OrderedMapRepo.Default.fromIdentifiables(
          Range(0, 20)
            .map(() =>
              CollectionReference.Default.stream(
                v4(),
                _searchText + faker.company.buzzNoun() + " required key-value fields"
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
      return () => PromiseRepo.Default.mock(() => keyValueFields);
    }
    case "highConfidenceKeyValueFieldsEnum": {
      return () => PromiseRepo.Default.mock(() => keyValueFields);
    }
    case "documentNumberDefaultingsFromKeyValueEnum": {
      return () => PromiseRepo.Default.mock(() => keyValueFields);
    }
    case "documentDateDefaultingsFromKeyValueEnum": {
      return () => PromiseRepo.Default.mock(() => keyValueFields);
    }
    case "configurableNumberDefaultingsFromKeyValueEnum": {
      return () => PromiseRepo.Default.mock(() => keyValueFields);
    }
    case "configurableNumber2DefaultingsFromKeyValueEnum": {
      return () => PromiseRepo.Default.mock(() => keyValueFields);
    }
    case "informationKeysEnum": {
      return () => PromiseRepo.Default.mock(() => keyValueFields);
    }
    case "informationKeysDisabledEnum": {
      return () => PromiseRepo.Default.mock(() => keyValueFields);
    }
    case "contextEnum": {
      return () => PromiseRepo.Default.mock(() => contextEnum);
    }
    case "filterGroupOpEnum": {
      return () => PromiseRepo.Default.mock(() => filterGroupOpEnum);
    }
    case "accountingPositionFieldsEnum": {
      return () => PromiseRepo.Default.mock(() => accountingPositionFields);
    }
    case "filtersOpEnum": {
      return () => PromiseRepo.Default.mock(() => filtersOpEnum);
    }
    case "informationCardFieldsEnum": {
      return () => PromiseRepo.Default.mock(() => informationCardField);
    }
    case "informationCardFieldsDisabledEnum": {
      return () => PromiseRepo.Default.mock(() => informationCardField);
    }
    case "debitNoteResultFieldsEnum": {
      return () => PromiseRepo.Default.mock(() => debitNoteResultFields);
    }
    case "filtersValueAnyOfEnum": {
      return () => PromiseRepo.Default.mock(() => filtersValueAnyOfEnum);
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
