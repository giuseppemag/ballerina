import { BasicFun } from "../../../../state";
import { BasicUpdater, Updater } from "../../state";

export type CaseUpdater<CaseName extends string, Entity> = {
  [f in CaseName]: BasicFun<BasicUpdater<Entity & { kind: CaseName; }>, Updater<Entity>>;
};

export const caseUpdater = <Entity extends { kind: string; }>() => <CaseName extends Entity["kind"]>(caseName: CaseName): CaseUpdater<CaseName, Entity> => ({
  [caseName]: (caseUpdater: BasicUpdater<Entity & { kind: CaseName; }>): Updater<Entity> => {
    return Updater(currentEntity => (currentEntity.kind == caseName) ? caseUpdater(currentEntity as Entity & { kind: CaseName; }) as Entity
      : currentEntity
    );
  },
}) as CaseUpdater<CaseName, Entity>;
