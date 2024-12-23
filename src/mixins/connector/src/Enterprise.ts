import { SolidWebIdProfile, SolidWebIdProfileConstructor, SolidWebIdProfileMixin } from "@semantizer/mixin-solid-webid";
import { Semantizer } from "@semantizer/types";
import { Catalog, catalogFactory } from "./Catalog.js";
import { WebIdProfileMixin } from "@semantizer/mixin-webid";
import { LiteralHelperAddMixin } from "@semantizer/mixin-literal-helper-add";

export type Enterprise = SolidWebIdProfile & EnterpriseOperations;

const DFC = 'https://github.com/datafoodconsortium/ontology/releases/latest/download/DFC_BusinessOntology.owl#';

export interface EnterpriseOperations {
    getName(): string | undefined;
    getMaintainedCatalogs(): Catalog[];
    getSiretNumber(): string | undefined;
}

export interface EnterpriseCreateParams {
    name?: string;
    description?: string;
    image?: string;
    street?: string;
    postalCode?: string;
    city?: string;
    country?: string;
    vatNumber?: string;
    siretNumber?: string;
    phoneNumber?: string;
    email?: string;
    website?: string;
}

export function EnterpriseMixin<
    TBase extends SolidWebIdProfileConstructor
>(Base: TBase) {

    return class EnterpriseMixinImpl extends Base implements EnterpriseOperations {

        public getName(): string | undefined {
            // const webId = this.getPrimaryTopic();
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'name');
            return this.getLiteral(this.getOrigin()!, predicate)?.value;
        }

        public getMaintainedCatalogs(): Catalog[] {
            // const webId = this.getPrimaryTopic();
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'maintains');
            return this.getLinkedObjectAll(predicate).map(d => this.getSemantizer().build(catalogFactory, d));
        }

        public getSiretNumber(): string | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'siretNumber');
            return this.getLiteral(this.getOrigin()!, predicate)?.value;
        }

        public setSiretNumber(siretNumber: string): void {
            
        }

    }

}

export function enterpriseFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(EnterpriseMixin, SolidWebIdProfileMixin(WebIdProfileMixin(_DatasetImpl)));
}

export function enterpriseWithHelperLiteralAddFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(EnterpriseMixin, LiteralHelperAddMixin(SolidWebIdProfileMixin(WebIdProfileMixin(_DatasetImpl))));
}

export function createEnterprise(semantizer: Semantizer, params?: EnterpriseCreateParams): Enterprise {
    const enterprise = semantizer.build(enterpriseWithHelperLiteralAddFactory);
    const { namedNode } = semantizer.getConfiguration().getRdfDataModelFactory();

    const subject = namedNode('');
    const rdfType = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

    enterprise.addLinkedObject(subject, rdfType, namedNode(DFC + 'Enterprise'));

    if (params) {
        params.name && enterprise.addStringNoLocale(subject, namedNode(DFC + 'name'), params.name);
        params.description && enterprise.addStringNoLocale(subject, namedNode(DFC + 'description'), params.description);
        params.image && enterprise.addStringNoLocale(subject, namedNode(DFC + 'image'), params.image);
        params.street && enterprise.addStringNoLocale(subject, namedNode(DFC + 'street'), params.street);
        params.postalCode && enterprise.addStringNoLocale(subject, namedNode(DFC + 'postalCode'), params.postalCode);
        params.city && enterprise.addStringNoLocale(subject, namedNode(DFC + 'city'), params.city);
        params.country && enterprise.addStringNoLocale(subject, namedNode(DFC + 'country'), params.country);
        params.vatNumber && enterprise.addStringNoLocale(subject, namedNode(DFC + 'vatNumber'), params.vatNumber);
        params.siretNumber && enterprise.addStringNoLocale(subject, namedNode(DFC + 'siretNumber'), params.siretNumber);
        params.phoneNumber && enterprise.addStringNoLocale(subject, namedNode(DFC + 'phoneNumber'), params.phoneNumber);
        params.email && enterprise.addStringNoLocale(subject, namedNode(DFC + 'email'), params.email);
        params.website && enterprise.addStringNoLocale(subject, namedNode(DFC + 'website'), params.website);
    }
    
    return enterprise;
}