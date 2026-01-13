import { DatasetMixinNamespace } from "@semantizer/mixin-dataset";
import { DatasetSemantizer, NamedNode } from "@semantizer/types";

export type SolidContainer = DatasetSemantizer<SolidContainerMixinNamespace>;
export type SolidContainerMixinNamespace = DatasetMixinNamespace & { solid: SolidContainerMixinOperations };

export interface SolidContainerMixinOperations {
    getContainedResources(): NamedNode[] | undefined;
}