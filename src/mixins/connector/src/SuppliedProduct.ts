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
    getQuantityUnit(): string | undefined;
    getQuantityValue(): number | undefined;
    getCatalogItems(): CatalogItem[];
}

export function SuppliedProductMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class CatalogMixinImpl extends Base implements SuppliedProductOperations {

        public getName(): string | undefined {
            const { namedNode} = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'name');
            return this.getLiteral(this.getOrigin()!, predicate)?.value;
        }

        public getDescription(): string | undefined {
            const { namedNode} = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'description');
            return this.getLiteral(this.getOrigin()!, predicate)?.value;
        }

        public getQuantityUnit(): string | undefined {
            const { namedNode} = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'hasQuantity');
            const quantitativeValue = this.getLinkedObject(predicate);
            return this.getLiteral(this.getOrigin()!, predicate)?.value;
        }

        public getQuantityValue(): number | undefined {
            const { namedNode} = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'description');
            return undefined;
        }

        public getCatalogItems(): CatalogItem[] {
            const { namedNode} = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'lists');
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
    const { namedNode } = semantizer.getConfiguration().getRdfDataModelFactory();

    const subject = namedNode('');
    const rdfType = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    const namePredicate = namedNode(DFC + 'name');
    const hasTypePredicate = namedNode(DFC + 'hasType');
    const descriptionPredicate = namedNode(DFC + 'description');
    const suppliedByPredicate = namedNode(DFC + 'suppliedBy');
    const hasQuantityPredicate = namedNode(DFC + 'hasQuantity');
    const hasUnitPredicate = namedNode(DFC + 'hasUnit');
    const valuePredicate = namedNode(DFC + 'value');

    suppliedProduct.addLinkedObject(subject, rdfType, namedNode(DFC + 'SuppliedProduct'));

    if (params) {
        params.name && suppliedProduct.addStringNoLocale(subject, namePredicate, params.name);
        params.types && params.types.forEach(type => suppliedProduct.addLinkedObject(subject, hasTypePredicate, namedNode(type)));
        params.description && suppliedProduct.addStringNoLocale(subject, descriptionPredicate, params.description);
        params.enterprise && suppliedProduct.addLinkedObject(subject, suppliedByPredicate, namedNode(params.enterprise));

        if (params.quantityValue && params.quantityUnit) {
            const quantitativeValue = semantizer.getConfiguration().getRdfDataModelFactory().blankNode();
            suppliedProduct.addLinkedObject(subject, hasQuantityPredicate, quantitativeValue);
            suppliedProduct.addLinkedObject(quantitativeValue, rdfType, namedNode(DFC + 'QuantitativeValue'));
            suppliedProduct.addLinkedObject(quantitativeValue, hasUnitPredicate, namedNode(params.quantityUnit));
            suppliedProduct.addDecimal(quantitativeValue, valuePredicate, params.quantityValue);
        } 
    }
    
    return suppliedProduct;
}