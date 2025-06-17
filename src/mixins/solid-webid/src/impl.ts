import { WebIdProfileMixin, WebIdProfileMixinNamespace } from "@semantizer/mixin-webid";
import { DatasetSemantizerConstructor, Loader, NamedNode, Semantizer, WithMixins } from "@semantizer/types";
import { SolidPreferences, SolidPreferencesCreateParams, SolidPreferencesMixinNamespace, SolidPreferencesMixinOperations, SolidWebIdMixinNamespace, SolidWebIdProfileMixinNamespace, SolidWebIdProfileMixinOperations } from "./types";
import { DatasetMixin, DatasetMixinNamespace } from "@semantizer/mixin-dataset";

const ns = {
    solid: 'http://www.w3.org/ns/solid/terms#',
    ldp: 'http://www.w3.org/ns/ldp#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    pim: 'http://www.w3.org/ns/pim/space#',
    foaf: 'http://xmlns.com/foaf/0.1/',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
}

export function SolidWebIdProfileMixin<
    TMixins extends WebIdProfileMixinNamespace,
    TBase extends DatasetSemantizerConstructor<TMixins>
>(Base: TBase) {
    return class SolidWebIdProfileMixinImpl extends Base implements WithMixins<TMixins & SolidWebIdProfileMixinNamespace> {

        public get mixins(): TMixins & SolidWebIdProfileMixinNamespace {
            const parentMixins = super.mixins as TMixins & Partial<{ webid: Partial<SolidWebIdProfileMixinOperations> }>;

            return {
                ...parentMixins,
                webid: {
                    ...(parentMixins.webid ?? {}),
                    loadExtendedProfile: async (loader?: Loader): Promise<void> => {
                        const primaryTopicUri = this.mixins.webid.getPrimaryTopic();
                        if (primaryTopicUri) {
                            const primaryTopic = await this.getSemantizer().load(primaryTopicUri.value, solidWebIdFactory);
                            const otherProfiles = primaryTopic.mixins.webid.getSeeAlsoAll();
                            if (otherProfiles) {
                                for (const profile of otherProfiles) {
                                    await this.mixins.dataset.load(profile, { loader });
                                }
                            }
                        }
                    }
                }
            }
        }

    }
}

export function SolidWebIdMixin<
    TMixins extends SolidWebIdProfileMixinNamespace,
    TBase extends DatasetSemantizerConstructor<TMixins>
>(Base: TBase) {
    return class SolidWebIdMixinImpl extends Base implements WithMixins<TMixins & SolidWebIdMixinNamespace> {

        public get mixins(): TMixins & SolidWebIdMixinNamespace {
            const parentMixins = super.mixins as TMixins & Partial<{ webid: Partial<SolidWebIdProfileMixinOperations> }>;

            return {
                ...parentMixins,
                webid: {
                    ...(parentMixins.webid ?? {}),

                    addPreferencesDocument: (preferencesDocumentUri: string | NamedNode): void => {
                        const webId = this.mixins.webid.getPrimaryTopic();
                        if (webId) {
                            this.mixins.dataset.addObjectUri(webId, ns.pim + 'preferencesFile', preferencesDocumentUri, this.mixins.dataset.getDefaultGraphTerm());
                        }
                    },

                    getPreferencesDocument: (): NamedNode | undefined => {
                        const webId = this.mixins.webid.getPrimaryTopic();
                        if (webId) {
                            return this.mixins.dataset.getObjectUri(webId, ns.pim + 'preferencesFile', this.mixins.dataset.getDefaultGraphTerm());
                        }
                    },

                    getLdpInbox: (): NamedNode | undefined => {
                        const webId = this.mixins.webid.getPrimaryTopic();
                        if (webId) {
                            return this.mixins.dataset.getObjectUri(webId, ns.ldp + 'inbox', this.mixins.dataset.getDefaultGraphTerm());
                        }
                    },

                    getStorageAll: (): NamedNode[] | undefined => {
                        const webId = this.mixins.webid.getPrimaryTopic();
                        if (webId) {
                            return this.mixins.dataset.getObjectUriAll(webId, ns.pim + 'storage', this.mixins.dataset.getDefaultGraphTerm());
                        }
                    },

                    getPublicTypeIndex: (): NamedNode | undefined => {
                        const webId = this.mixins.webid.getPrimaryTopic();
                        if (webId) {
                            return this.mixins.dataset.getObjectUri(webId, ns.solid + 'publicTypeIndex', this.mixins.dataset.getDefaultGraphTerm());
                        }
                    },

                    getPrivateTypeIndex: async (): Promise<NamedNode | undefined> => {
                        let privateTypeIndexUri: NamedNode | undefined = undefined;
                        const preferencesFileUri = this.mixins.webid.getPreferencesDocument();
                        if (preferencesFileUri) {
                            const preferencesFile = await this.getSemantizer().load(preferencesFileUri.value, solidPreferencesFactory);
                            const webId = this.mixins.webid.getPrimaryTopic();
                            if (webId) {
                                privateTypeIndexUri = preferencesFile.mixins.webid.getPrivateTypeIndex(webId);
                            }
                        }
                        return privateTypeIndexUri;
                    },

                    getSeeAlsoAll: (): NamedNode[] | undefined => {
                        const webId = this.mixins.webid.getPrimaryTopic();
                        if (webId) {
                            return this.mixins.dataset.getObjectUriAll(webId, ns.rdfs + 'seeAlso', this.mixins.dataset.getDefaultGraphTerm());
                        }
                    }

                }

            }

        }

    }

}

export function SolidPreferencesMixin<
    TMixins extends DatasetMixinNamespace,
    TBase extends DatasetSemantizerConstructor<TMixins>
>(Base: TBase) {
    return class SolidPreferencesMixinImpl extends Base implements WithMixins<TMixins & SolidPreferencesMixinNamespace> {

        public get mixins(): TMixins & SolidPreferencesMixinNamespace {
            const parentMixins = super.mixins as TMixins & Partial<{ webid: Partial<SolidPreferencesMixinOperations> }>;

            return {
                ...parentMixins,
                webid: {
                    ...(parentMixins.webid ?? {}),

                    getPrivateTypeIndex: (webId: string | NamedNode): NamedNode | undefined => {
                        return this.mixins.dataset.getObjectUri(webId, ns.solid + 'privateTypeIndex', this.mixins.dataset.getDefaultGraphTerm());
                    },

                    getSeeAlsoAll: (): NamedNode[] | undefined => {
                        return this.mixins.dataset.getObjectUriAll(this.getBaseUri(), ns.rdfs + 'seeAlso', this.mixins.dataset.getDefaultGraphTerm());
                    }

                }

            }

        }

    }

}

export function solidWebIdProfileFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(SolidWebIdProfileMixin, WebIdProfileMixin(DatasetMixin(_DatasetImpl)));
}

export function solidWebIdFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(SolidWebIdMixin, SolidWebIdProfileMixin(WebIdProfileMixin(DatasetMixin(_DatasetImpl))));
}

export function solidPreferencesFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(SolidPreferencesMixin, DatasetMixin(_DatasetImpl));
}

export function createSolidPreferencesDocument(semantizer: Semantizer, params?: SolidPreferencesCreateParams) {
    const solidPreferencesDocument = semantizer.build(solidPreferencesFactory);
    solidPreferencesDocument.mixins.dataset.addObjectUri(solidPreferencesDocument.getBaseUri(), ns.rdf + 'type', ns.pim + 'ConfigurationFile', solidPreferencesDocument.mixins.dataset.getDefaultGraphTerm());
    params?.seeAlso?.forEach(seeAlso => solidPreferencesDocument.mixins.dataset.addObjectUri(solidPreferencesDocument.getBaseUri(), ns.rdfs + 'seeAlso', seeAlso, solidPreferencesDocument.mixins.dataset.getDefaultGraphTerm()));
    return solidPreferencesDocument;
}