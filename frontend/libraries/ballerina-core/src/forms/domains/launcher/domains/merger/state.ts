import { merge } from 'immutable'

const INITIAL_CONFIG = {
  types: {},
  forms: {},
  apis: {
    enumOptions: {},
    searchableStreams: {},
    entities: {},
  },
  mappings: {},
  launchers: {}
}

export const FormsConfigMerger = {
  Default:{
    merge: (formsConfigs: any): any => {
      if (!formsConfigs || formsConfigs.length === 0) {
        return {...INITIAL_CONFIG};
      }

      return formsConfigs.reduce((acc: any, current: any) => {
        return {
          types: merge(acc.types, current.types),
          forms: merge(acc.forms, current.forms),
          apis: {
            enumOptions: merge(acc.apis.enumOptions, current.apis.enumOptions),
            searchableStreams: merge(acc.apis.searchableStreams, current.apis.searchableStreams),
            entities: merge(acc.apis.entities, current.apis.entities),
          },
          mappings: merge(acc.mappings, current.mappings),
          launchers: merge(acc.launchers, current.launchers),
        }
      }, {...INITIAL_CONFIG})
    }
  }
}