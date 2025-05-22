import { DatasetSemantizer, NamedNode } from "@semantizer/types";


declare module "@semantizer/types" {
    interface MixinNamespace {
        solid: SolidContainerOperations;
    }
}

export interface SolidContainerOperations {
    getContainedResources(): NamedNode[] | undefined;
}

export type SolidContainer = DatasetSemantizer & SolidContainerOperations;