import { DatasetSemantizer, DatasetSemantizerMixinConstructor, Loader, NamedNode, Semantizer } from "@semantizer/types";
import { SolidPreferences, SolidWebId, SolidWebIdProfile } from "./types";
import { WebIdProfileConstructor, WebIdProfileMixin } from "@semantizer/mixin-webid";

const ns = {
    solid: 'http://www.w3.org/ns/solid/terms#',
    ldp: 'http://www.w3.org/ns/ldp#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    pim: 'http://www.w3.org/ns/pim/space#',
    foaf: 'http://xmlns.com/foaf/0.1/'
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

    }
}

export function SolidWebIdMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {
    return class SolidWebIdImpl extends Base implements SolidWebId {
        
        public getPreferencesFile(): NamedNode | undefined {
            return this.getObjectUri(this.getBaseUri(), ns.pim + 'preferencesFile', this.getDefaultGraphTerm());
        }
        
        public getLdpInbox(): NamedNode | undefined {
            return this.getObjectUri(this.getBaseUri(), ns.ldp + 'inbox', this.getDefaultGraphTerm());
        }
        
        public getStorageAll(): NamedNode[] | undefined {
            return this.getObjectUriAll(this.getBaseUri(), ns.pim + 'storage', this.getDefaultGraphTerm());
        }

        public getPublicTypeIndex(): NamedNode | undefined {
            return this.getObjectUri(this.getBaseUri(), ns.solid + 'publicTypeIndex', this.getDefaultGraphTerm());
        }

        public async getPrivateTypeIndex(): Promise<NamedNode | undefined> {
            let privateTypeIndexUri: NamedNode | undefined = undefined;
            const preferencesFileUri = this.getPreferencesFile();
            if (preferencesFileUri) {
                const preferencesFile: SolidPreferences = await this.getSemantizer().load(preferencesFileUri.value, solidPreferencesFactory);
                privateTypeIndexUri = preferencesFile.getPrivateTypeIndex();
            }
            return privateTypeIndexUri;
        }

        public getSeeAlsoAll(): NamedNode[] | undefined {
            return this.getObjectUriAll(this.getBaseUri(), ns.rdfs + 'seeAlso', this.getDefaultGraphTerm());
        }

    }

}

export function SolidPreferencesMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {
    return class SolidPreferencesImpl extends Base implements SolidPreferences {

        public getPrivateTypeIndex(): NamedNode | undefined {
            return this.getObjectUri(this.getBaseUri(), ns.solid + 'privateTypeIndex', this.getDefaultGraphTerm());
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
    return semantizer.getMixinFactory(SolidWebIdMixin);
}

export function solidPreferencesFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(SolidPreferencesMixin);
}