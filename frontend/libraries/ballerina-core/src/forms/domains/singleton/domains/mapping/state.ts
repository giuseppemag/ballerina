import { OrderedMap } from "immutable";
import { Guid, Unit } from "../../../../../../main";
import { BasicFun } from "../../../../../fun/state";
import { CollectionSelection } from "../../../collection/domains/selection/state";


export type UntypedPath = Array<string | number | symbol>;
export type MappingPaths<Entity> = {
  [field in keyof Entity]: Entity[field] extends (string | boolean | number | undefined | Date | CollectionSelection<infer _> | OrderedMap<Guid, infer _>) ? UntypedPath : MappingPaths<Entity[field]>;
};

export type MappingBuilder<Source, Target, mappedTargetFields extends keyof Target> =
  (<field extends Exclude<keyof Target, mappedTargetFields>>(field: field) => Target[field] extends (string | boolean | number | undefined | Date | CollectionSelection<infer _> | OrderedMap<Guid, infer _>) ? BasicFun<
    BasicFun<
      PathBuilder<Source>, PathBuilder<Target[field]>
    >, MappingBuilder<Source, Target, mappedTargetFields | field>> : BasicFun<
      MappingBuilder<Source, Target[field], keyof Target[field]>, MappingBuilder<Source, Target, mappedTargetFields | field>>) & { kind: "mappingBuilder"; paths: MappingPaths<Pick<Target, mappedTargetFields>>; };

export type PathBuilder<Entity> =
  (<field extends keyof Entity>(field: field) => PathBuilder<Entity[field]>) & {
    path: UntypedPath;
  };

export const PathBuilder = {
  Default: <Entity,>(path: UntypedPath): PathBuilder<Entity> => Object.assign(
    <field extends keyof Entity>(field: field): PathBuilder<Entity[field]> => PathBuilder.Default<Entity[field]>([...path, field]),
    {
      path: path,
      kind: "pathBuilder"
    }
  )
};

export const MappingBuilder = {
  Default: <Source, Target, mappedTargetFields extends keyof Target = never>(paths: MappingPaths<Pick<Target, mappedTargetFields>>): MappingBuilder<Source, Target, mappedTargetFields> => Object.assign(
    <field extends keyof Target>(field: field): any => ((_: MappingBuilder<Source, Unit, never> | BasicFun<
      PathBuilder<Source>, PathBuilder<Target[field]>>
    ): MappingBuilder<Source, Target, mappedTargetFields | field> => {
      if ("kind" in _ == false || _.kind != "mappingBuilder") {
        const fieldPathBuilder = _ as BasicFun<PathBuilder<Source>, PathBuilder<Target[field]>>;
        const pathToField = fieldPathBuilder(PathBuilder.Default<Source>([])).path;
        const extendedPaths: MappingPaths<Pick<Target, mappedTargetFields | field>> = {
          ...paths,
          [field]: pathToField
        } as any;
        const remainingMappingBuilder = MappingBuilder.Default<Source, Target, mappedTargetFields | field>(extendedPaths);
        return remainingMappingBuilder;
      }
      const fieldEntityMappingBuilder = _ as MappingBuilder<Source, Unit, never>;
      const extendedPaths: MappingPaths<Pick<Target, mappedTargetFields | field>> = {
        ...paths,
        [field]: fieldEntityMappingBuilder.paths
      } as any;
      const remainingMappingBuilder = MappingBuilder.Default<Source, Target, mappedTargetFields | field>(extendedPaths);
      return remainingMappingBuilder;
    }),
    {
      paths: paths,
      kind: "mappingBuilder" as const
    }
  )
};

export type Mapping<Source, Target> = {
  from: BasicFun<Source, Target>;
  to: BasicFun<[Source, Target], Source>;
  pathFrom: BasicFun<Array<string>, Array<string>>;
};
const dynamicLookup = (e: any, path: UntypedPath): any => path.length <= 0 ? e : dynamicLookup(e[path[0]], path.slice(1));
const dynamicAssignment = (e: any, v: any, path: UntypedPath): any => {
  if (path.length <= 0) return v;
  if (path.length <= 1) {
    return { ...e, [path[0]]: v };
  }
  return { ...e, [path[0]]: dynamicAssignment(e[path[0]], v, path.slice(1)) };
};
export const Mapping = {
  Default: {
    fromMapping: <Source, Target>(completedBuilder: MappingBuilder<Source, Target, keyof Target>): Mapping<Source, Target> =>
      Mapping.Default.fromPaths<Source, Target>(completedBuilder.paths),
    fromPaths: <Source, Target>(paths: MappingPaths<Target>): Mapping<Source, Target> => {
      return ({
        from: s => {
          const traversePaths = (paths: MappingPaths<any>) => {
            const result_t = {} as any;
            Object.keys(paths).forEach(_ => {
              const field_t = _ as keyof Target;
              if (Array.isArray(paths[field_t])) {
                const pathToFieldT = paths[field_t] as UntypedPath;
                result_t[field_t] = dynamicLookup(s, pathToFieldT);
              } else {
                result_t[field_t] = traversePaths(paths[field_t]);
              }
            });
            return result_t;
          };
          return traversePaths(paths);
        },
        to: ([s, t]) => {
          let result_s = s;
          const traversePaths = (t: any, paths: MappingPaths<any>) => {
            Object.keys(paths).forEach(_ => {
              const field_t = _ as keyof Target;
              if (Array.isArray(paths[field_t])) {
                result_s = dynamicAssignment(result_s, t[field_t], paths[field_t]);
              } else {
                traversePaths(t[field_t], paths[field_t]);
              }
            });
          };
          traversePaths(t, paths);
          return result_s;
        },
        pathFrom: (pathInTarget: Array<string>): Array<string> => dynamicLookup(paths, pathInTarget),
      })
    }
  }
};

