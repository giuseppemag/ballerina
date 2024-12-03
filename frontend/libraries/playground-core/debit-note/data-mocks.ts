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
} from "ballerina-core";
import { Range, List, OrderedMap } from "immutable";
import { v4 } from "uuid";
import { faker } from "@faker-js/faker";

import debitNoteResultFields from "./enums/config/DebitNoteResultFields";

import accountingPositionFields from "./enums/config/AccountingPositionFields";

import informationCardField from "./enums/config/InformationCardField";

import keyValueFields from "./enums/config/KeyValueFields";

const filterGroupOpEnum: Array<[CollectionReference, BoolExpr<Unit>]> = [
  [CollectionReference.Default("and", "and"), BoolExpr.Default.true()],
  [CollectionReference.Default("or", "or"), BoolExpr.Default.true()],
];

const contextEnum: Array<[CollectionReference, BoolExpr<Unit>]> = [
  [CollectionReference.Default("invoice", "invoice"), BoolExpr.Default.true()],
  [CollectionReference.Default("invoicePosition", "invoicePosition"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("accountingPosition", "accountingPosition"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("additionalCostPosition", "additionalCostPosition"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("purchaseOrder", "purchaseOrder"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("purchaseOrderPosition", "purchaseOrderPosition"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("deliveryNote", "deliveryNote"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("deliveryNotePosition", "deliveryNotePosition"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("orderConfirmation", "orderConfirmation"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("orderConfirmationPosition", "orderConfirmationPosition"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("surcharge", "surcharge"), BoolExpr.Default.true()],
  [CollectionReference.Default("header", "header"), BoolExpr.Default.true()],
  [CollectionReference.Default("position", "position"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("purchaseRequisition", "purchaseRequisition"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("anyPosition", "anyPosition"), BoolExpr.Default.true()],
  [CollectionReference.Default("paymentAdvice", "paymentAdvice"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("paymentAdvicePosition", "paymentAdvicePosition"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("supplierPurchaseOrder", "supplierPurchaseOrder"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("supplierPurchaseOrderPosition", "supplierPurchaseOrderPosition"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("allPositions", "allPositions"), BoolExpr.Default.true()],
  [CollectionReference.Default("debitNote", "debitNote"), BoolExpr.Default.true()],
  [CollectionReference.Default("debitNotePosition", "debitNotePosition"), BoolExpr.Default.true()],
];

const filtersOpEnum: Array<[CollectionReference, BoolExpr<Unit>]> = [
  [CollectionReference.Default("eq", "eq"), BoolExpr.Default.true()],
  [CollectionReference.Default("neq", "neq"), BoolExpr.Default.true()],
  [CollectionReference.Default("gt", "gt"), BoolExpr.Default.true()],
  [CollectionReference.Default("gte", "gte"), BoolExpr.Default.true()],
  [CollectionReference.Default("lt", "lt"), BoolExpr.Default.true()],
  [CollectionReference.Default("lte", "lte"), BoolExpr.Default.true()],
  [CollectionReference.Default("contains", "contains"), BoolExpr.Default.true()],
  [CollectionReference.Default("notContains", "notContains"), BoolExpr.Default.true()],
  [CollectionReference.Default("match", "match"), BoolExpr.Default.true()],
  [CollectionReference.Default("notMatch", "notMatch"), BoolExpr.Default.true()],
  [CollectionReference.Default("isNull", "isNull"), BoolExpr.Default.true()],
  [CollectionReference.Default("isNotNull", "isNotNull"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("groupedDataContains", "groupedDataContains"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("groupedDataNotContains", "groupedDataNotContains"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("groupedDataContainsPrefix", "groupedDataContainsPrefix"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("groupedDataNotContainsPrefix", "groupedDataNotContainsPrefix"),
    BoolExpr.Default.true(),
  ],
];

const filtersValueAnyOfEnum: Array<[CollectionReference, BoolExpr<Unit>]> = [
  [CollectionReference.Default("string", "string"), BoolExpr.Default.true()],
  [CollectionReference.Default("number", "number"), BoolExpr.Default.true()],
  [CollectionReference.Default("date-time", "date-time"), BoolExpr.Default.true()],
  [CollectionReference.Default("boolean", "boolean"), BoolExpr.Default.true()],
];

const streamApis: InfiniteStreamSources = (streamName: string) => {
  switch (streamName) {
    case "requiredKeyValueField":
      return (_searchText: string) => (_streamPosition: [StreamPosition]) => {
        const mapped = OrderedMapRepo.Default.fromSmallIdentifiables(
          Range(0, 20)
            .map(() =>
              CollectionReference.Default(
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
                  filters: [],
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
        return (_) => PromiseRepo.Default.mock(() => []);
      }
      default: {
        return (_) => {
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
            value: {
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
