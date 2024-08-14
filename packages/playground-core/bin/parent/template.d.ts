import { Template } from "@ballerina/core";
import { Parent, ParentView1, ParentView2 } from "./state";
export declare const Child1TemplateEmbedded: Template<Parent, Parent, import("@ballerina/core").Unit, import("../main").Child1View>;
export declare const Child2TemplateEmbedded: Template<Parent, Parent, import("../main").Child2ForeignMutationsExpected, import("../main").Child2View>;
export declare const ParentTemplate1: Template<Parent, Parent, import("../main").Child2ForeignMutationsExpected, ParentView1>;
export declare const ParentTemplate2: Template<Parent, Parent, import("../main").Child2ForeignMutationsExpected, ParentView2>;
//# sourceMappingURL=template.d.ts.map