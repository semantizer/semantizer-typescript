import { WebIdProfile } from "@semantizer/mixin-webid";
import { DatasetSemantizer, Loader, NamedNode } from "@semantizer/types";

declare module "@semantizer/types" {
    interface MixinNamespace {
        solid: SolidWebIdOperations;
    }
}

export interface SolidWebIdProfileOperations {
    loadExtendedProfile(loader?: Loader): Promise<void>;
}

export interface SolidWebIdOperations {
    addPreferencesDocument(preferencesDocumentUri: string | NamedNode): void
    getPublicTypeIndex(): NamedNode | undefined;
    getPrivateTypeIndex(): Promise<NamedNode | undefined>;
    getSeeAlsoAll(): NamedNode[] | undefined;
    getPreferencesDocument(): NamedNode | undefined;
    getLdpInbox(): NamedNode | undefined;
    getStorageAll(): NamedNode[] | undefined;
}

export interface SolidPreferencesOperations {
    solid: {
        getSeeAlsoAll(): NamedNode[] | undefined;
        getPrivateTypeIndex(webId: string | NamedNode): NamedNode | undefined;
    }
}

export interface SolidPreferencesCreateParams {
    seeAlso?: string[];
}

export type SolidWebIdProfile = WebIdProfile & SolidWebIdProfileOperations;
export type SolidWebId = DatasetSemantizer & SolidWebIdOperations;
export type SolidPreferencesDocument = DatasetSemantizer & SolidPreferencesOperations;
export type SolidWebIdProfileConstructor = new (...args: any[]) => SolidWebIdProfile;
export type SolidWebIdConstructor = new (...args: any[]) => SolidWebId;
export type SolidPreferencesConstructor = new (...args: any[]) => SolidPreferencesDocument;