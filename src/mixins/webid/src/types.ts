import { DatasetMixinNamespace } from "@semantizer/mixin-dataset";
import { DatasetSemantizer, NamedNode, Term } from "@semantizer/types";

export type WebIdProfile = DatasetSemantizer<WebIdProfileMixinNamespace>;
export type WebIdProfileMixinNamespace = DatasetMixinNamespace & { webid: WebIdProfileMixinOperations };

export interface WebIdProfileMixinOperations {
    getMaker(subject?: Term | string, graph?: Term | string): NamedNode | undefined;
    getPrimaryTopic(subject?: Term | string, graph?: Term | string): NamedNode | undefined;
}