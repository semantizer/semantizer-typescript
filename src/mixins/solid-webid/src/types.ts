import { DatasetMixinNamespace } from "@semantizer/mixin-dataset";
import { WebIdProfileMixinNamespace } from "@semantizer/mixin-webid";
import { DatasetSemantizer, Loader, NamedNode } from "@semantizer/types";

export type SolidWebIdProfile = DatasetSemantizer<SolidWebIdProfileMixinNamespace>;
export type SolidWebIdProfileMixinNamespace = WebIdProfileMixinNamespace & { webid: SolidWebIdProfileMixinOperations };

export type SolidWebId = DatasetSemantizer<SolidWebIdMixinNamespace>;
export type SolidWebIdMixinNamespace = SolidWebIdProfileMixinNamespace & { webid: SolidWebIdMixinOperations };

export type SolidPreferences = DatasetSemantizer<SolidWebIdMixinNamespace>;
export type SolidPreferencesMixinNamespace = DatasetMixinNamespace & { webid: SolidPreferencesMixinOperations };

export interface SolidWebIdProfileMixinOperations {
    loadExtendedProfile(loader?: Loader): Promise<void>;
}

export interface SolidWebIdMixinOperations {
    addPreferencesDocument(preferencesDocumentUri: string | NamedNode): void
    getPublicTypeIndex(): NamedNode | undefined;
    getPrivateTypeIndex(): Promise<NamedNode | undefined>;
    getSeeAlsoAll(): NamedNode[] | undefined;
    getPreferencesDocument(): NamedNode | undefined;
    getLdpInbox(): NamedNode | undefined;
    getStorageAll(): NamedNode[] | undefined;
}

export interface SolidPreferencesMixinOperations {
    getSeeAlsoAll(): NamedNode[] | undefined;
    getPrivateTypeIndex(webId: string | NamedNode): NamedNode | undefined;
}

export interface SolidPreferencesCreateParams {
    seeAlso?: string[];
}