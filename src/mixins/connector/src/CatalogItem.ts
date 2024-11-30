import { DatasetSemantizer, DatasetSemantizerMixinConstructor, NamedNode, Semantizer } from "@semantizer/types";
import { OfferCreateParams, createOffer } from "./Offer";

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
}

export function CatalogItemMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class CatalogItemMixinImpl extends Base implements CatalogItemOperations {

        public getName(): string | undefined {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = dataFactory.namedNode(DFC + 'name');
            return this.getLiteral(this.getOrigin()!, predicate)?.value;
        }

    }

}

export function catalogItemFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(CatalogItemMixin);
}

export function createCatalogItem(semantizer: Semantizer, params?: CatalogItemCreateParams): CatalogItem {
    const catalogItem = semantizer.build(catalogItemFactory);
    const dataFactory = semantizer.getConfiguration().getRdfDataModelFactory();

    const subject = params?.subject ? dataFactory.namedNode(params.subject) : dataFactory.namedNode('');
    const rdfType = dataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    const referencesPredicate = dataFactory.namedNode(DFC + 'references');
    const offeredThroughPredicate = dataFactory.namedNode(DFC + 'offeredThrough');

    catalogItem.addLinkedObject(subject, rdfType, dataFactory.namedNode(DFC + 'CatalogItem'));

    params && params.references && catalogItem.addLinkedObject(subject, referencesPredicate, dataFactory.namedNode(params.references));

    if (params && params.offers) {
        params.offers.forEach(offerCreateParams => {
            const offer = createOffer(semantizer, {...offerCreateParams, catalogItem: params.subject});
            catalogItem.addLinkedObject(subject, offeredThroughPredicate, dataFactory.namedNode(offerCreateParams.subject ?? ''));
            catalogItem.addAll(offer);
        });
    }

    return catalogItem;
}