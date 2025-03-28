import { TypeName } from "../types/state";

export type SerializedEntityApi = {
  type?: any;
  methods?: any;
};

export type EntityApi = {
  type: TypeName;
  methods: { create: boolean; get: boolean; update: boolean; default: boolean };
};
export type GlobalConfigurationApi = {
  type: TypeName;
  methods: { get: boolean };
};
