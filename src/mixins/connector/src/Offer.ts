import { LiteralHelperAddMixin } from "@semantizer/mixin-literal-helper-add";
import { DatasetSemantizer, DatasetSemantizerMixinConstructor, NamedNode, Semantizer } from "@semantizer/types";
import { Price, priceFactory } from "./Price";

export type Offer = DatasetSemantizer & OfferOperations;

const DFC = 'https://github.com/datafoodconsortium/ontology/releases/latest/download/DFC_BusinessOntology.owl#';

export interface OfferCreateParams {
    uri?: string;
    price?: {
        value: number,
        currency: string,
        vatRate?: number
    },
    catalogItem?: string;
    customerCategory?: string;
    // orderLines (concernedBy)
    // discount
    // saleSessions (listedIn)
    // stockLimitation
}

export interface OfferOperations {
    getName(): string | undefined;
    getPrice(): Price | undefined;
}

export function OfferMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class OfferMixinImpl extends Base implements OfferOperations {

        public getName(): string | undefined {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = dataFactory.namedNode(DFC + 'name');
            return this.getLiteral(this.getOrigin()!, predicate)?.value;
        }

        public getPrice(): Price | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'name');
            return this.getSemantizer().build(priceFactory, this.getLinkedObject(predicate));
        }

    }

}

export function offerFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(OfferMixin);
}

export function offerWithHelperLiteralAddFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(OfferMixin, LiteralHelperAddMixin(_DatasetImpl));
}

export function createOffer(semantizer: Semantizer, params?: OfferCreateParams): Offer {
    const offer = semantizer.build(offerWithHelperLiteralAddFactory);
    const dataFactory = semantizer.getConfiguration().getRdfDataModelFactory();

    const subject = params?.uri ? dataFactory.namedNode(params.uri) : dataFactory.namedNode('');
    const rdfType = dataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    const offersPredicate = dataFactory.namedNode(DFC + 'offers');
    const hasPricePredicate = dataFactory.namedNode(DFC + 'hasPrice');
    const valuePredicate = dataFactory.namedNode(DFC + 'value');
    const vatRatePredicate = dataFactory.namedNode(DFC + 'vatRate');

    offer.addLinkedObject(subject, rdfType, dataFactory.namedNode(DFC + 'Offer'));

    // params && params.catalogItem && offer.addLinkedObject(subject, offersPredicate, dataFactory.namedNode(params.catalogItem));

    if (params) {
        if (params.price) {
            const price = dataFactory.blankNode();
            offer.addLinkedObject(subject, hasPricePredicate, price);
            offer.addLinkedObject(price, rdfType, dataFactory.namedNode(DFC + 'Price'));
            offer.addDecimal(price, valuePredicate, params.price.value);
            params.price.vatRate && offer.addDecimal(price, vatRatePredicate, params.price.vatRate);
        }
    }

    return offer;
}