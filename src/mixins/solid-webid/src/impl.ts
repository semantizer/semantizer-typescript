import { DatasetSemantizer, DatasetSemantizerMixinConstructor, Loader, NamedNode, Semantizer } from "@semantizer/types";
import { SolidPreferencesCreateParams, SolidPreferencesDocument, SolidWebId, SolidWebIdProfile } from "./types";
import { WebIdProfileConstructor, WebIdProfileMixin } from "@semantizer/mixin-webid";

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
            const primaryTopicUri = this.getPrimaryTopic();
            if (primaryTopicUri) {
                const primaryTopic: SolidWebId = await this.getSemantizer().load(primaryTopicUri.value, solidWebIdFactory);
                const otherProfiles = primaryTopic.getSeeAlsoAll();
                if (otherProfiles) {
                    for (const profile of otherProfiles) {
                        await this.load(profile, { loader });
                    }
                }
            }
        }

        public async check(webId: string | NamedNode): Promise<void> {
            const solidWebIdUri = this.getPrimaryTopic();

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
    return class SolidWebIdImpl extends Base implements SolidWebId {

        public check(): void {

        }

        public addPreferencesDocument(preferencesDocumentUri: string | NamedNode): void {
            const webId = this.getPrimaryTopic();
            if (webId) {
                this.addObjectUri(webId, ns.pim + 'preferencesFile', preferencesDocumentUri, this.getDefaultGraphTerm());
            }
        }

        public getPreferencesDocument(): NamedNode | undefined {
            const webId = this.getPrimaryTopic();
            if (webId) {
                return this.getObjectUri(webId, ns.pim + 'preferencesFile', this.getDefaultGraphTerm());
            }
        }

        public getLdpInbox(): NamedNode | undefined {
            const webId = this.getPrimaryTopic();
            if (webId) {
                return this.getObjectUri(webId, ns.ldp + 'inbox', this.getDefaultGraphTerm());
            }
        }

        public getStorageAll(): NamedNode[] | undefined {
            const webId = this.getPrimaryTopic();
            if (webId) {
                return this.getObjectUriAll(webId, ns.pim + 'storage', this.getDefaultGraphTerm());
            }
        }

        public getPublicTypeIndex(): NamedNode | undefined {
            const webId = this.getPrimaryTopic();
            if (webId) {
                return this.getObjectUri(webId, ns.solid + 'publicTypeIndex', this.getDefaultGraphTerm());
            }
        }

        public async getPrivateTypeIndex(): Promise<NamedNode | undefined> {
            let privateTypeIndexUri: NamedNode | undefined = undefined;
            const preferencesFileUri = this.getPreferencesDocument();
            if (preferencesFileUri) {
                const preferencesFile: SolidPreferencesDocument = await this.getSemantizer().load(preferencesFileUri.value, solidPreferencesFactory);
                const webId = this.getPrimaryTopic();
                if (webId) {
                    privateTypeIndexUri = preferencesFile.getPrivateTypeIndex(webId);
                }
            }
            return privateTypeIndexUri;
        }

        public getSeeAlsoAll(): NamedNode[] | undefined {
            const webId = this.getPrimaryTopic();
            if (webId) {
                return this.getObjectUriAll(webId, ns.rdfs + 'seeAlso', this.getDefaultGraphTerm());
            }
        }

    }

}

export function SolidPreferencesMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {
    return class SolidPreferencesImpl extends Base implements SolidPreferencesDocument {

        public getPrivateTypeIndex(webId: string | NamedNode): NamedNode | undefined {
            return this.getObjectUri(webId, ns.solid + 'privateTypeIndex', this.getDefaultGraphTerm());
        }

        public getSeeAlsoAll(): NamedNode[] | undefined {
            return this.getObjectUriAll(this.getBaseUri(), ns.rdfs + 'seeAlso', this.getDefaultGraphTerm());
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
    solidPreferencesDocument.addObjectUri(solidPreferencesDocument.getBaseUri(), ns.rdf + 'type', ns.pim + 'ConfigurationFile', solidPreferencesDocument.getDefaultGraphTerm());
    params?.seeAlso?.forEach(seeAlso => solidPreferencesDocument.addObjectUri(solidPreferencesDocument.getBaseUri(), ns.rdfs + 'seeAlso', seeAlso, solidPreferencesDocument.getDefaultGraphTerm()));
    return solidPreferencesDocument;
}