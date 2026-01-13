import { DatasetMixinNamespace } from "@semantizer/mixin-dataset";
import { DatasetSemantizer, NamedNode, QuadGraph, QuadSubject } from "@semantizer/types";

export type WebIdProfile = DatasetSemantizer<WebIdProfileMixinNamespace>;
export type WebIdProfileMixinNamespace = DatasetMixinNamespace & { webid: WebIdProfileMixinOperations };

export interface WebIdProfileMixinOperations {
    getMaker(subject?: QuadSubject, graph?: QuadGraph): NamedNode | undefined;
    getPrimaryTopic(subject?: QuadSubject, graph?: QuadGraph): NamedNode | undefined;
}