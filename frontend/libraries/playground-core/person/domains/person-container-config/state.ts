import { faker } from "@faker-js/faker";
import { Guid, CollectionSelection, CollectionReference, Mapping, MappingBuilder, unit } from "ballerina-core";
import { OrderedMap } from "immutable";
import { v4 } from "uuid";
import { Interest } from "../../apis/mocks";
import { Department, Gender, Person } from "../../state";
import { Address, City } from "../address/state";

export type FavoriteColor = CollectionReference;
export type PersonConfig = {
  person: {
    name: string;
    surname: string;
    birthday: Date;
    departments: OrderedMap<Guid, Department>;
    gender: CollectionSelection<Gender>;
    favoriteColor: CollectionSelection<FavoriteColor>;
  };
  mailing: {
    subscribeToNewsletter: boolean;
    interests: OrderedMap<Guid, Interest>;
  };
  address: Address;
};
export const PersonConfig = {
  Default: (): PersonConfig => ({
    person: {
      name: faker.person.firstName(),
      surname: faker.person.lastName(),
      birthday: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365 * 45),
      gender: CollectionSelection<CollectionReference>().Default.right("no selection"),
      favoriteColor: CollectionSelection<CollectionReference>().Default.right("no selection"),
      departments: OrderedMap(),
    },
    mailing: {
      subscribeToNewsletter: Math.random() > 0.5,
      interests: OrderedMap(),
    },
    address: {
      street: faker.location.street(),
      number: Math.floor(Math.random() * 500),
      city: Math.random() > 0.5 ?
        CollectionSelection<CollectionReference>().Default.right("no selection")
        :
        CollectionSelection<CollectionReference>().Default.left(City.Default(v4(), faker.location.city()))
    }
  }
  )
};

export const personConfigToPersonMapping = Mapping.Default.fromMapping<PersonConfig, Person>(
  MappingBuilder.Default<PersonConfig, Person>(unit)
    ("name")(_ => _("person")("name"))
    ("surname")(_ => _("person")("surname"))
    ("birthday")(_ => _("person")("birthday"))
    ("departments")(_ => _("person")("departments"))
    ("gender")(_ => _("person")("gender"))
    ("subscribeToNewsletter")(_ => _("mailing")("subscribeToNewsletter"))
    ("interests")(_ => _("mailing")("interests"))
    ("address")(
      MappingBuilder.Default<PersonConfig, Address>(unit)
        ("street")(_ => _("address")("street"))
        ("number")(_ => _("address")("number"))
        ("city")(_ => _("address")("city"))
  )
);


