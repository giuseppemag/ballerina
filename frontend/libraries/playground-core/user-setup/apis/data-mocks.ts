import { faker } from "@faker-js/faker";
import {
  PromiseRepo,
  EnumOptionsSources,
  EntityApis,
  Guid,
  TableApiSources,
  PredicateValue,
  ValueOrErrors,
  BasicFun,
  TableState,
} from "ballerina-core";
import { Map, Range } from "immutable";
import { ValueInfiniteStreamState, ValueStreamPosition } from "ballerina-core";
import { v4 } from "uuid";

const userFieldsEnum = [
  "Name",
  "Surname",
  "Birthday",
  "Email",
  "SubscribeToNewsletter",
];
const userGroupFieldsEnum = ["Name", "Description"];
const activityFieldsEnum = ["Description", "Timestamp"];
const usersSetupTabsEnum = [
  "ActiveFields",
  "InactiveFields",
  "UserGroupsFields",
  "ActivityFields",
];

const getActiveUsers: BasicFun<
  BasicFun<any, ValueOrErrors<PredicateValue, string>>,
  BasicFun<Map<string, string>, ValueInfiniteStreamState["getChunk"]>
> =
  (fromApiRaw: BasicFun<any, ValueOrErrors<PredicateValue, string>>) =>
  (streamParams: Map<string, string>) =>
  ([streamPosition]: [ValueStreamPosition]) => {
    return PromiseRepo.Default.mock(() => ({
      Values: {
        2: {
          Id: 2,
          Name: "Jane",
          Surname: "Doe",
          Birthday: "1990-01-01",
          Email: "jane.doe@example.com",
          SubscribeToNewsletter: true,
        },
      },
      HasMore: false,
      From: 1,
      To: 2,
    })).then((res) => ({
      from: res.From,
      to: res.To,
      hasMoreValues: res.HasMore,
      data: TableState().Operations.tableValuesToValueRecord(
        res.Values,
        fromApiRaw,
      ),
    }));
  };

const getInactiveUsers: BasicFun<
  BasicFun<any, ValueOrErrors<PredicateValue, string>>,
  BasicFun<Map<string, string>, ValueInfiniteStreamState["getChunk"]>
> =
  (fromApiRaw: BasicFun<any, ValueOrErrors<PredicateValue, string>>) =>
  (streamParams: Map<string, string>) =>
  ([streamPosition]: [ValueStreamPosition]) => {
    return PromiseRepo.Default.mock(() => ({
      Values: Range(1, 5)
        .map((_) => ({
          Id: v4(),
          Name: faker.person.firstName(),
          Surname: faker.person.lastName(),
          Birthday: faker.date.birthdate().toISOString(),
          Email: faker.internet.email(),
          SubscribeToNewsletter: faker.datatype.boolean(),
        }))
        .reduce((acc, curr) => {
          acc[curr.Id] = curr;
          return acc;
        }, {} as any),
      HasMore: false,
      From: 1,
      To: 5,
    })).then((res) => ({
      hasMoreValues: res.HasMore,
      to: res.To,
      from: res.From,
      data: TableState().Operations.tableValuesToValueRecord(
        res.Values,
        fromApiRaw,
      ),
    }));
  };

const getUserGroups: BasicFun<
  BasicFun<any, ValueOrErrors<PredicateValue, string>>,
  BasicFun<Map<string, string>, ValueInfiniteStreamState["getChunk"]>
> =
  (fromApiRaw: BasicFun<any, ValueOrErrors<PredicateValue, string>>) =>
  (streamParams: Map<string, string>) =>
  ([streamPosition]: [ValueStreamPosition]) =>
    PromiseRepo.Default.mock(() => ({
      Values: {
        1: {
          Id: 1,
          Name: "Group 1",
          Description: "Group 1 Description",
        },
      },
      HasMore: false,
      From: 1,
      To: 1,
    })).then((res) => ({
      from: res.From,
      to: res.To,
      hasMoreValues: res.HasMore,
      data: TableState().Operations.tableValuesToValueRecord(
        res.Values,
        fromApiRaw,
      ),
    }));

const getActivities: BasicFun<
  BasicFun<any, ValueOrErrors<PredicateValue, string>>,
  BasicFun<Map<string, string>, ValueInfiniteStreamState["getChunk"]>
> =
  (fromApiRaw: BasicFun<any, ValueOrErrors<PredicateValue, string>>) =>
  (streamParams: Map<string, string>) =>
  ([streamPosition]: [ValueStreamPosition]) =>
    PromiseRepo.Default.mock(() => ({
      Values: {
        1: {
          Id: 1,
          Description: "Activity 1",
          Timestamp: "2021-01-01",
        },
      },
      HasMore: false,
      From: 1,
      To: 1,
    })).then((res) => ({
      from: res.From,
      to: res.To,
      hasMoreValues: res.HasMore,
      data: TableState().Operations.tableValuesToValueRecord(
        res.Values,
        fromApiRaw,
      ),
    }));

const tableApiSources: TableApiSources = (streamName: string) =>
  streamName == "ActiveUsersApi"
    ? getActiveUsers
    : streamName == "InactiveUsersApi"
      ? getInactiveUsers
      : streamName == "UserGroupsApi"
        ? getUserGroups
        : streamName == "ActivitiesApi"
          ? getActivities
          : () => {
              console.error(`Cannot find stream API ${streamName}`);
              throw new Error(`Cannot find stream API ${streamName}`);
            };

const enumApis: EnumOptionsSources = (enumName: string) =>
  enumName == "UserFieldsApi"
    ? () =>
        PromiseRepo.Default.mock(
          () => userFieldsEnum.map((_) => ({ Value: _ })),
          undefined,
          1,
          0,
        )
    : enumName == "UserGroupFieldsApi"
      ? () =>
          PromiseRepo.Default.mock(
            () => userGroupFieldsEnum.map((_) => ({ Value: _ })),
            undefined,
            1,
            0,
          )
      : enumName == "ActivityFieldsApi"
        ? () =>
            PromiseRepo.Default.mock(
              () => activityFieldsEnum.map((_) => ({ Value: _ })),
              undefined,
              1,
              0,
            )
        : enumName == "UsersSetupTabsApi"
          ? () =>
              PromiseRepo.Default.mock(
                () => usersSetupTabsEnum.map((_) => ({ Value: _ })),
                undefined,
                1,
                0,
              )
          : () =>
              PromiseRepo.Default.mock(() => {
                alert(`Cannot find enum API ${enumName}`);
                return [];
              });
const entityApis: EntityApis = {
  create: (apiName: string) => (e: any) => {
    alert(`Cannot find entity API ${apiName} for 'create'`);
    return Promise.reject();
  },
  get: (apiName: string) => {
    switch (apiName) {
      case "UsersSetupConfigApi":
        return (id: Guid) => {
          console.log(`get user setup config api`);
          return Promise.resolve({
            ActiveTabs: [
              { Value: "ActiveFields" },
              { Value: "InactiveFields" },
              { Value: "UserGroupsFields" },
              { Value: "ActivityFields" },
            ],
            ActiveFields: [
              { Value: "Name" },
              { Value: "Surname" },
              { Value: "Birthday" },
              // { Value: "Email" },
              { Value: "SubscribeToNewsletter" },
            ],
            InactiveFields: [
              { Value: "Name" },
              { Value: "Surname" },
              { Value: "Birthday" },
              { Value: "Email" },
              { Value: "SubscribeToNewsletter" },
            ],
            UserGroupsFields: [{ Value: "Name" }, { Value: "Description" }],
            ActivityFields: [{ Value: "Description" }, { Value: "Timestamp" }],
          });
        };
      case "UsersSetupApi":
        return (id: Guid) => {
          console.log(`get user setup api`);
          return Promise.resolve({
            Active: {
              Values: Range(1, 11)
                .map((_) => ({
                  Id: v4(),
                  Name: faker.person.firstName(),
                  Surname: faker.person.lastName(),
                  Birthday: faker.date.birthdate().toISOString(),
                  Email: faker.internet.email(),
                  SubscribeToNewsletter: faker.datatype.boolean(),
                }))
                .reduce((acc, curr) => {
                  acc[curr.Id] = curr;
                  return acc;
                }, {} as any),
              HasMore: true,
              From: 0,
              To: 10,
            },
            Inactive: {
              Values: {},
              HasMore: true,
              From: 0,
              To: 1,
            },
            Groups: {
              Values: {},
              HasMore: false,
              From: 0,
              To: 0,
            },
            Activities: {
              Values: {},
              HasMore: false,
              From: 0,
              To: 0,
            },
          });
        };
      case "globalConfiguration":
        return (_: Guid) => {
          return Promise.resolve({});
        };
      default:
        return (id: Guid) => {
          alert(`Cannot find entity API ${apiName} for 'get' ${id}`);
          return Promise.reject();
        };
    }
  },
  update: (apiName: string) => (_id: Guid, _e: any) => {
    console.log(`update ${apiName} ${_id}`, JSON.stringify(_e, undefined, 2));
    switch (apiName) {
      case "person":
        return PromiseRepo.Default.mock(() => []);
      case "errorPerson":
        return Promise.reject({
          status: 400,
          message: "Bad Request: Invalid person data provided",
        });
      default:
        alert(`Cannot find entity API ${apiName} for 'update'`);
        return Promise.resolve([]);
    }
  },
  default: (apiName: string) => (_) => {
    alert(`Cannot find entity API ${apiName} for 'default'`);
    return Promise.reject();
  },
};

export const UsersSetupFromConfigApis = {
  enumApis,
  entityApis,
  tableApiSources,
};
