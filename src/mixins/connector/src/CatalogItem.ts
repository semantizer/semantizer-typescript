import { DatasetSemantizer, DatasetSemantizerMixinConstructor, NamedNode, Semantizer } from "@semantizer/types";
import { Offer, OfferCreateParams, createOffer, offerFactory } from "./Offer";
import { SuppliedProduct, suppliedProductFactory } from "./SuppliedProduct";

export type CatalogItem = DatasetSemantizer & CatalogItemOperations;

const DFC = 'https://github.com/datafoodconsortium/ontology/releases/latest/download/DFC_BusinessOntology.owl#';

export interface CatalogItemCreateParams {
    subject?: string;
    references?: string;
    offers?: OfferCreateParams[];
    // extraAvailabilityTime
    // extraDeliveryConditions
    // catalog (listedIn)
    // enterprise (managedBy)
    // offers (offeredThrough)
    // sku
    // stockLimitation
}

export interface CatalogItemOperations {
    getName(): string | undefined;
    getReferencedProduct(): SuppliedProduct | undefined;
    getOffers(): Offer[];
}

export function CatalogItemMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class CatalogItemMixinImpl extends Base implements CatalogItemOperations {

        public getName(): string | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'name');
            return this.getLiteral(this.getOrigin()!, predicate)?.value;
        }

        public getReferencedProduct(): SuppliedProduct | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'references');
            return this.getSemantizer().build(suppliedProductFactory, this.getLinkedObject(predicate));
        }

        public getOffers(): Offer[] {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'offeredThrough');
            // NOT "THIS" below
            return this.getLinkedObjectAll(predicate).map(d => this.getSemantizer().build(offerFactory, d));
        }

    }

}

export function catalogItemFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(CatalogItemMixin);
}

export function createCatalogItem(semantizer: Semantizer, params?: CatalogItemCreateParams): CatalogItem {
    const catalogItem = semantizer.build(catalogItemFactory);
    const { namedNode } = semantizer.getConfiguration().getRdfDataModelFactory();

    const subject = params?.subject ? namedNode(params.subject) : namedNode('');
    const rdfType = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    const referencesPredicate = namedNode(DFC + 'references');
    const offeredThroughPredicate = namedNode(DFC + 'offeredThrough');

    catalogItem.addLinkedObject(subject, rdfType, namedNode(DFC + 'CatalogItem'));

    params && params.references && catalogItem.addLinkedObject(subject, referencesPredicate, namedNode(params.references));

    if (params && params.offers) {
        params.offers.forEach(offerCreateParams => {
            if (!offerCreateParams.uri || offerCreateParams.uri === '') {
                offerCreateParams.uri = `#${self.crypto.randomUUID()}`;
            }
            const offer = createOffer(semantizer, {...offerCreateParams, catalogItem: params.subject});
            catalogItem.addLinkedObject(subject, offeredThroughPredicate, namedNode(offerCreateParams.uri ?? ''));
            catalogItem.addAll(offer);
        });
    }

    return catalogItem;
}