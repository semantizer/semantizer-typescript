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
    types?: string[]; // SKOS concepts
    enterprise?: string;
    catalogItems?: string[]; // Catalog[] -> URI reference
    subProducts?: {
        product: string;
        quantity: number;
    }[];
}

export interface SuppliedProductOperations {
    getName(): string | undefined;
    getDescription(): string | undefined;
    getQuantityUnit(): string | undefined;
    getQuantityValue(): number | undefined;
    getProductTypes(): string[]; // SKOS concepts
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

        public getProductTypes(): string[] {
            const { namedNode} = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'hasType');
            return this.getLinkedObjectAll(predicate).map(t => t.getOrigin()?.value ?? 'unknown');
        }

        public getDescription(): string | undefined {
            const { namedNode} = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'description');
            return this.getLiteral(this.getOrigin()!, predicate)?.value;
        }

        public getQuantityUnit(): string | undefined {
            const { namedNode} = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const quantityPredicate = namedNode(DFC + 'hasQuantity');
            const hasUnitPredicate = namedNode(DFC + 'hasUnit');
            const quantitativeValue = this.getLinkedObject(quantityPredicate);
            return quantitativeValue?.getLinkedObject(hasUnitPredicate)?.getOrigin()?.value;
        }

        public getQuantityValue(): number | undefined {
            const { namedNode} = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const quantityPredicate = namedNode(DFC + 'hasQuantity');
            const valuePredicate = namedNode(DFC + 'value');
            const quantitativeValue = this.getLinkedObject(quantityPredicate);
            return Number.parseFloat(quantitativeValue?.getLiteral(namedNode(''), valuePredicate)?.value ?? '');
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

function createDatasetWithHelperAddFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(LiteralHelperAddMixin);
}

export function createSuppliedProduct(semantizer: Semantizer, params?: SuppliedProductCreateParams): SuppliedProduct {
    const suppliedProduct = semantizer.build(suppliedProductWithHelperLiteralAddFactory);
    const { namedNode, quad, literal } = semantizer.getConfiguration().getRdfDataModelFactory();

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

        if (params.subProducts && params.subProducts.length > 0) {
            const transformation = semantizer.build();
            const transformationUuid = self.crypto.randomUUID();
            const transformationSubject = namedNode('#' + transformationUuid);
            transformation.addLinkedObject(transformationSubject, rdfType, namedNode(DFC + 'AsPlannedTransformation'));

            params.subProducts?.forEach(subProduct => {
                const consumptionFlow = semantizer.build(createDatasetWithHelperAddFactory);
                const consumptionFlowUuid = self.crypto.randomUUID();
                const consumptionFlowSubject = namedNode('#' + consumptionFlowUuid);
                consumptionFlow.addLinkedObject(consumptionFlowSubject, rdfType, namedNode(DFC + 'AsPlannedConsumptionFlow'));
                consumptionFlow.addDecimal(consumptionFlowSubject, namedNode(DFC + 'quantity'), subProduct.quantity);
                const subProductUri = namedNode(`../../supplied-products/${subProduct.product}/index`);
                consumptionFlow.addLinkedObject(consumptionFlowSubject, namedNode(DFC + 'consumes'), subProductUri);
                transformation.addLinkedObject(transformationSubject, namedNode(DFC + 'hasIncome'), consumptionFlowSubject);
                suppliedProduct.addAll(consumptionFlow);
            });

            const productionFlow = semantizer.build(createDatasetWithHelperAddFactory);
            const productionFlowUuid = self.crypto.randomUUID();
            const productionFlowSubject = namedNode('#' + productionFlowUuid);
            productionFlow.addLinkedObject(productionFlowSubject, rdfType, namedNode(DFC + 'AsPlannedProductionFlow'));
            productionFlow.addDecimal(productionFlowSubject, namedNode(DFC + 'quantity'), 1);
            productionFlow.addLinkedObject(productionFlowSubject, namedNode(DFC + 'outcomeOf'), transformationSubject);
            transformation.addLinkedObject(transformationSubject, namedNode(DFC + 'hasOutcome'), productionFlowSubject);
            suppliedProduct.addAll(productionFlow);

            suppliedProduct.addLinkedObject(subject, namedNode(DFC + 'producedBy'), productionFlowSubject);
            suppliedProduct.addAll(transformation);
        }
    }
    
    return suppliedProduct;
}