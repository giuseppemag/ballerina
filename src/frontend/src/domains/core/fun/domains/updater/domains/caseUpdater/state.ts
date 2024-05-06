import { BasicFun } from "../../../../state";
import { BasicUpdater, Updater } from "../../state";

export type CaseUpdater<CaseName extends string, Entity> = {
  [f in CaseName]: BasicFun<BasicUpdater<Entity & { Kind: CaseName; }>, Updater<Entity>>;
};

export const caseUpdater = <Entity extends { Kind: string; }>() => <CaseName extends Entity["Kind"]>(caseName: CaseName): CaseUpdater<CaseName, Entity> => ({
  [caseName]: (caseUpdater: BasicUpdater<Entity & { Kind: CaseName; }>): Updater<Entity> => {
    return Updater(currentEntity => (currentEntity.Kind == caseName) ? caseUpdater(currentEntity as Entity & { Kind: CaseName; }) as Entity
      : currentEntity
    );
  },
}) as CaseUpdater<CaseName, Entity>;
