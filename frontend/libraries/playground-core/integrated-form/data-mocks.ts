import { faker } from "@faker-js/faker"
import { v4 } from "uuid"
import { City } from "../person/domains/address/state"

const permissions = ["Create", "Read", "Update", "Delete"]

export type IntegratedPersonConfig = {
    ERP: string,
    IsAdmin: boolean
}

export const integratedPersonConfig: IntegratedPersonConfig = {
    ERP: "ERP:SAP",
    IsAdmin: false
}

export const initialIntegratedFormData: IntegratedPerson = {
    plotInfo: {
      landArea: {
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100)
      }
    },
    subscribeToNewsletter: Math.random() > 0.5,
    dependants: [{key: "Steve", value: "adult"}, {key: "Alice", value: "senior"}],
    relatives: [["child", "adult", "senior"][Math.round(Math.random() * 10) % 3], ["child", "adult", "senior"][Math.round(Math.random() * 10) % 3], ["child", "adult", "senior"][Math.round(Math.random() * 10) % 3]],
    departments: [],
    addresses: [],
    mainAddress: {
      street: faker.location.street(),
      number: Math.floor(Math.random() * 500),
      city: Math.random() > 0.5 ?
        {IsSome: false, Value: {Value: ""}}
        :
        {Value: {...City.Default(v4(), faker.location.city())}, IsSome: true}
    },
    emails: ["john@doe.it", "johnthedon@doe.com"],
    permissions: [],
    cityByDepartment: [],
  }

  export type IntegratedPerson = {
    plotInfo: {
      landArea: {
        x: number,
        y: number
      }
    },
    subscribeToNewsletter: boolean,
    dependants: {key: string, value: string}[],
    relatives: string[],
    departments: string[],
    addresses: {
      street: string,
      number: number,
      city: {
        IsSome: boolean,
        Value: 
          City | {Value: ""},
        
      }
    }[],
    mainAddress: {
      street: string,
      number: number,
      city: {
        IsSome: boolean,
        Value: City | {Value: ""},
      }
    },
    emails: string[],
    permissions: string[],
    cityByDepartment: {
      department: string,
      city: string
    }[]
  }