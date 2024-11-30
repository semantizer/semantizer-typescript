import { DatasetSemantizer, DatasetSemantizerMixinConstructor, Semantizer } from "@semantizer/types";
import { CatalogItem, catalogItemFactory } from "./CatalogItem.js";
import { LiteralHelperAddMixin } from "@semantizer/mixin-literal-helper-add";

export type SuppliedProduct = DatasetSemantizer & SuppliedProductOperations;

const DFC = 'https://github.com/datafoodconsortium/ontology/releases/latest/download/DFC_BusinessOntology.owl#';

export interface SuppliedProductCreateParams {
    name?: string;
    description?: string;
    quantityValue?: number;
    quantityUnit?: string;
    types?: string[];
    enterprise?: string;
    catalogItems?: string[]; // Catalog[] -> URI reference
    categories?: string[]; // SKOS concepts
}

export interface SuppliedProductOperations {
    getName(): string | undefined;
    getDescription(): string | undefined;
    getCatalogItems(): CatalogItem[];
}

export function SuppliedProductMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class CatalogMixinImpl extends Base implements SuppliedProductOperations {

        public getName(): string | undefined {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = dataFactory.namedNode(DFC + 'name');
            return this.getLiteral(this.getOrigin()!, predicate)?.value;
        }

        public getDescription(): string | undefined {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = dataFactory.namedNode(DFC + 'description');
            return this.getLiteral(this.getOrigin()!, predicate)?.value;
        }

        public getCatalogItems(): CatalogItem[] {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = dataFactory.namedNode(DFC + 'lists');
            return this.getLinkedObjectAll(predicate).map(d => this.getSemantizer().build(catalogItemFactory, d));
        }

    }

}

export function suppliedProductFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(SuppliedProductMixin);
}

export function suppliedProductWithHelperLiteralAddFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(SuppliedProductMixin, LiteralHelperAddMixin(_DatasetImpl));
}

export function createSuppliedProduct(semantizer: Semantizer, params?: SuppliedProductCreateParams): SuppliedProduct {
    const suppliedProduct = semantizer.build(suppliedProductWithHelperLiteralAddFactory);
    const dataFactory = semantizer.getConfiguration().getRdfDataModelFactory();

    const subject = dataFactory.namedNode('');
    const rdfType = dataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    const namePredicate = dataFactory.namedNode(DFC + 'name');
    const descriptionPredicate = dataFactory.namedNode(DFC + 'description');
    const suppliedByPredicate = dataFactory.namedNode(DFC + 'suppliedBy');
    const hasQuantityPredicate = dataFactory.namedNode(DFC + 'hasQuantity');
    const valuePredicate = dataFactory.namedNode(DFC + 'value');

    suppliedProduct.addLinkedObject(subject, rdfType, dataFactory.namedNode(DFC + 'SuppliedProduct'));

    if (params) {
        params.name && suppliedProduct.addStringNoLocale(subject, namePredicate, params.name);
        params.description && suppliedProduct.addStringNoLocale(subject, descriptionPredicate, params.description);
        params.enterprise && suppliedProduct.addLinkedObject(subject, suppliedByPredicate, dataFactory.namedNode(params.enterprise));

        if (params.quantityValue && params.quantityUnit) {
            const quantitativeValue = dataFactory.blankNode();
            suppliedProduct.addLinkedObject(subject, hasQuantityPredicate, quantitativeValue);
            suppliedProduct.addLinkedObject(quantitativeValue, rdfType, dataFactory.namedNode(DFC + 'QuantitativeValue'));
            suppliedProduct.addDecimal(quantitativeValue, valuePredicate, params.quantityValue);
        } 
    }
    
    return suppliedProduct;
}