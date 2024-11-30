import { DatasetSemantizer, DatasetSemantizerMixinConstructor, Semantizer } from "@semantizer/types";
import { CatalogItem, CatalogItemCreateParams, catalogItemFactory, createCatalogItem } from "./CatalogItem.js";
import { LiteralHelperAddMixin } from "@semantizer/mixin-literal-helper-add";
import { OfferCreateParams, createOffer } from "./Offer.js";

export type Catalog = DatasetSemantizer & CatalogOperations;

const DFC = 'https://github.com/datafoodconsortium/ontology/releases/latest/download/DFC_BusinessOntology.owl#';

export interface CatalogCreateParams {
    name?: string;
    // offers?: OfferCreateParams[];
    catalogItems?: CatalogItemCreateParams[];
    // enterprise (maintainedBy)
}

export interface CatalogOperations {
    getName(): string | undefined;
    getDescription(): string | undefined;
    getCatalogItems(): CatalogItem[];
}

export function CatalogMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class CatalogMixinImpl extends Base implements CatalogOperations {

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

export function catalogFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(CatalogMixin);
}

export function catalogWithHelperLiteralAddFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(CatalogMixin, LiteralHelperAddMixin(_DatasetImpl));
}

export function createCatalog(semantizer: Semantizer, params?: CatalogCreateParams): Catalog {
    const catalog = semantizer.build(catalogWithHelperLiteralAddFactory);
    const dataFactory = semantizer.getConfiguration().getRdfDataModelFactory();

    const subject = dataFactory.namedNode('');
    const rdfType = dataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    const namePredicate = dataFactory.namedNode(DFC + 'name');
    const listsPredicate = dataFactory.namedNode(DFC + 'lists');

    catalog.addLinkedObject(subject, rdfType, dataFactory.namedNode(DFC + 'Catalog'));

    if (params) {
        if (params.name) {
            catalog.addStringNoLocale(subject, namePredicate, params.name);
        }

        if (params.catalogItems) {
            params.catalogItems.forEach(catalogItemCreateParams => {
                const catalogItem = createCatalogItem(semantizer, catalogItemCreateParams);
                catalog.addLinkedObject(subject, listsPredicate, dataFactory.namedNode(catalogItemCreateParams.subject ?? ''));
                catalog.addAll(catalogItem);
            });
        }

        
    }

    return catalog;
}