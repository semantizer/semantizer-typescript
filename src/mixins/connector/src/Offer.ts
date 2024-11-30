import { LiteralHelperAddMixin } from "@semantizer/mixin-literal-helper-add";
import { DatasetSemantizer, DatasetSemantizerMixinConstructor, NamedNode, Semantizer } from "@semantizer/types";

export type Offer = DatasetSemantizer & OfferOperations;

const DFC = 'https://github.com/datafoodconsortium/ontology/releases/latest/download/DFC_BusinessOntology.owl#';

export interface OfferCreateParams {
    subject?: string;
    price?: {
        value: number,
        currency: string,
        vatRate: number
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
    const catalogItem = semantizer.build(offerWithHelperLiteralAddFactory);
    const dataFactory = semantizer.getConfiguration().getRdfDataModelFactory();

    const subject = params?.subject ? dataFactory.namedNode(params.subject) : dataFactory.namedNode('');
    const rdfType = dataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    const offersPredicate = dataFactory.namedNode(DFC + 'offers');
    const hasPricePredicate = dataFactory.namedNode(DFC + 'hasPrice');
    const valuePredicate = dataFactory.namedNode(DFC + 'value');

    catalogItem.addLinkedObject(subject, rdfType, dataFactory.namedNode(DFC + 'Offer'));

    params && params.catalogItem && catalogItem.addLinkedObject(subject, offersPredicate, dataFactory.namedNode(params.catalogItem));

    if (params && params.price) {
        const price = dataFactory.blankNode();
        catalogItem.addLinkedObject(subject, hasPricePredicate, price);
        catalogItem.addLinkedObject(price, rdfType, dataFactory.namedNode(DFC + 'Price'));
        catalogItem.addDecimal(price, valuePredicate, params.price.value);
    }

    return catalogItem;
}