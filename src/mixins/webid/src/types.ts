import { DatasetSemantizer, NamedNode, Term } from "@semantizer/types";

export interface WebIdProfileOperations {
    webid: {
        getMaker(subject?: Term | string, graph?: Term | string): NamedNode | undefined;
        getPrimaryTopic(subject?: Term | string, graph?: Term | string): NamedNode | undefined;
    }
}

export type WebIdProfile = DatasetSemantizer & WebIdProfileOperations;
export type WebIdProfileConstructor = new (...args: any[]) => WebIdProfile;