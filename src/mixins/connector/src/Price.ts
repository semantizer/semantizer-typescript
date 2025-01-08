import { DatasetSemantizer, DatasetSemantizerMixinConstructor, Semantizer } from "@semantizer/types";

export type Price = DatasetSemantizer & PriceOperations;

const DFC = 'https://github.com/datafoodconsortium/ontology/releases/latest/download/DFC_BusinessOntology.owl#';

export interface PriceCreateParams {
    value: number;
}

export interface PriceOperations {
    getValue(): number | undefined;
    getVatRate(): number | undefined;
    // getCurrency(): SkosConcept | undefined;
}

export function PriceMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class PriceMixinImpl extends Base implements PriceOperations {

        public getValue(): number | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'hasValue');
            const value = this.getLiteral(this.getOrigin()!, predicate)?.value;
            return value ? Number.parseFloat(value) : undefined;
        }

        public getVatRate(): number | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'vatRate');
            const value = this.getLiteral(this.getOrigin()!, predicate)?.value;
            return value ? Number.parseFloat(value) : undefined;
        }

    }

}

export function priceFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(PriceMixin);
}

export function createPrice(semantizer: Semantizer, params?: PriceCreateParams): Price {
    const price = semantizer.build(priceFactory);
    const { namedNode } = semantizer.getConfiguration().getRdfDataModelFactory();

    const subject = namedNode('');
    const rdfType = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    const namePredicate = namedNode(DFC + 'hasValue');

    price.addLinkedObject(subject, rdfType, namedNode(DFC + 'Price'));

    if (params) {
        params.value && price.addObjectDecimal(subject, namePredicate, params.value);
    }

    return price;
}