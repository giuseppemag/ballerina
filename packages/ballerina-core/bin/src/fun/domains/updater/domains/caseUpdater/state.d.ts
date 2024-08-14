import { BasicFun } from "../../../../state";
import { BasicUpdater, Updater } from "../../state";
export type Kind<T> = T extends {
    kind: infer k;
} ? k : never;
export type CaseUpdater<Entity, Field extends keyof Entity, CaseName extends Kind<Entity[Field]> & string> = {
    [f in CaseName]: BasicFun<BasicUpdater<Entity[Field] & {
        kind: CaseName;
    }>, Updater<Entity>>;
};
export declare const caseUpdater: <Entity>() => <Field extends keyof Entity>(field: Field) => <CaseName extends Kind<Entity[Field]> & string>(caseName: CaseName) => CaseUpdater<Entity, Field, CaseName>;
//# sourceMappingURL=state.d.ts.map