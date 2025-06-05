import { DatasetMixinConstructor } from "@semantizer/mixin-dataset";
import { WebIdProfileConstructor, WebIdProfileMixin } from "@semantizer/mixin-webid";
import { Loader, NamedNode, Semantizer } from "@semantizer/types";
import { SolidPreferencesCreateParams, SolidPreferencesDocument, SolidWebIdProfile } from "./types";

const ns = {
    solid: 'http://www.w3.org/ns/solid/terms#',
    ldp: 'http://www.w3.org/ns/ldp#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    pim: 'http://www.w3.org/ns/pim/space#',
    foaf: 'http://xmlns.com/foaf/0.1/',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
}

export function SolidWebIdProfileMixin<
    TBase extends WebIdProfileConstructor
>(Base: TBase) {
    return class SolidWebIdProfileImpl extends Base implements SolidWebIdProfile {

        public async loadExtendedProfile(loader?: Loader): Promise<void> {
            const primaryTopicUri = this.webid.getPrimaryTopic();
            if (primaryTopicUri) {
                const primaryTopic = await this.getSemantizer().load(primaryTopicUri.value, solidWebIdFactory);
                const otherProfiles = primaryTopic.mixins.solid?.getSeeAlsoAll();
                if (otherProfiles) {
                    for (const profile of otherProfiles) {
                        await this.mixins.dataset.load(profile, { loader });
                    }
                }
            }
        }

        public async check(webId: string | NamedNode): Promise<void> {
            const solidWebIdUri = this.webid.getPrimaryTopic();

            if (solidWebIdUri) {
                if ((typeof webId === 'string' && webId !== solidWebIdUri.value) || (typeof webId !== 'string' && solidWebIdUri.equals(webId))) {
                    throw new Error("The session WebId differs from the profile one.");
                }
            } else throw new Error("Invalid WebId profile: foaf:primaryTopic is missing.");
        }

    }
}

export function SolidWebIdMixin<
    TBase extends WebIdProfileConstructor
>(Base: TBase) {
    return class SolidWebIdImpl extends Base { //implements SolidWebId {

        public constructor(...args: any[]) {
            super(...args);
            this.mixins.solid = {
                ...(this.mixins.solid ?? {}),

                // check: (): void => {

                // },

                addPreferencesDocument: (preferencesDocumentUri: string | NamedNode): void => {
                    const webId = this.webid.getPrimaryTopic();
                    if (webId) {
                        this.mixins.dataset.addObjectUri(webId, ns.pim + 'preferencesFile', preferencesDocumentUri, this.mixins.dataset.getDefaultGraphTerm());
                    }
                },

                getPreferencesDocument: (): NamedNode | undefined => {
                    const webId = this.webid.getPrimaryTopic();
                    if (webId) {
                        return this.mixins.dataset.getObjectUri(webId, ns.pim + 'preferencesFile', this.mixins.dataset.getDefaultGraphTerm());
                    }
                },

                getLdpInbox: (): NamedNode | undefined => {
                    const webId = this.webid.getPrimaryTopic();
                    if (webId) {
                        return this.mixins.dataset.getObjectUri(webId, ns.ldp + 'inbox', this.mixins.dataset.getDefaultGraphTerm());
                    }
                },

                getStorageAll: (): NamedNode[] | undefined => {
                    const webId = this.webid.getPrimaryTopic();
                    if (webId) {
                        return this.mixins.dataset.getObjectUriAll(webId, ns.pim + 'storage', this.mixins.dataset.getDefaultGraphTerm());
                    }
                },

                getPublicTypeIndex: (): NamedNode | undefined => {
                    const webId = this.webid.getPrimaryTopic();
                    if (webId) {
                        return this.mixins.dataset.getObjectUri(webId, ns.solid + 'publicTypeIndex', this.mixins.dataset.getDefaultGraphTerm());
                    }
                },

                getPrivateTypeIndex: async (): Promise<NamedNode | undefined> => {
                    let privateTypeIndexUri: NamedNode | undefined = undefined;
                    const preferencesFileUri = this.mixins.solid?.getPreferencesDocument();
                    if (preferencesFileUri) {
                        const preferencesFile: SolidPreferencesDocument = await this.getSemantizer().load(preferencesFileUri.value, solidPreferencesFactory);
                        const webId = this.webid.getPrimaryTopic();
                        if (webId) {
                            privateTypeIndexUri = preferencesFile.solid.getPrivateTypeIndex(webId);
                        }
                    }
                    return privateTypeIndexUri;
                },

                getSeeAlsoAll: (): NamedNode[] | undefined => {
                    const webId = this.webid.getPrimaryTopic();
                    if (webId) {
                        return this.mixins.dataset.getObjectUriAll(webId, ns.rdfs + 'seeAlso', this.mixins.dataset.getDefaultGraphTerm());
                    }
                }

            }

        }

    }

}

export function SolidPreferencesMixin<
    TBase extends DatasetMixinConstructor
>(Base: TBase) {
    return class SolidPreferencesImpl extends Base implements SolidPreferencesDocument {

        public get solid() {
            
            return { 
                
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

export function solidWebIdProfileFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(SolidWebIdProfileMixin, WebIdProfileMixin(_DatasetImpl));
}

export function solidWebIdFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(SolidWebIdMixin, WebIdProfileMixin(_DatasetImpl));
}

export function solidPreferencesFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(SolidPreferencesMixin);
}

export function createSolidPreferencesDocument(semantizer: Semantizer, params?: SolidPreferencesCreateParams): SolidPreferencesDocument {
    const solidPreferencesDocument = semantizer.build(solidPreferencesFactory);
    solidPreferencesDocument.mixins.dataset.addObjectUri(solidPreferencesDocument.getBaseUri(), ns.rdf + 'type', ns.pim + 'ConfigurationFile', solidPreferencesDocument.mixins.dataset.getDefaultGraphTerm());
    params?.seeAlso?.forEach(seeAlso => solidPreferencesDocument.mixins.dataset.addObjectUri(solidPreferencesDocument.getBaseUri(), ns.rdfs + 'seeAlso', seeAlso, solidPreferencesDocument.mixins.dataset.getDefaultGraphTerm()));
    return solidPreferencesDocument;
}