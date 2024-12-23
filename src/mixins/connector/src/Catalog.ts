import { DatasetSemantizer, DatasetSemantizerMixinConstructor, Semantizer } from "@semantizer/types";
import { CatalogItem, CatalogItemCreateParams, catalogItemFactory, createCatalogItem } from "./CatalogItem.js";
import { LiteralHelperAddMixin } from "@semantizer/mixin-literal-helper-add";
import { OfferCreateParams, createOffer } from "./Offer.js";

export type Catalog = DatasetSemantizer & CatalogOperations;

const DFC = 'https://github.com/datafoodconsortium/ontology/releases/latest/download/DFC_BusinessOntology.owl#';

export interface CatalogCreateParams {
    name?: string;
    enterprise?: string;
    // offers?: OfferCreateParams[];
    catalogItems?: CatalogItemCreateParams[];
    // enterprise (maintainedBy)
}

export interface CatalogOperations {
    getName(): string | undefined;
    getDescription(): string | undefined;
    getCatalogItems(): CatalogItem[];
    addCatalogItem(reference: string, offers: OfferCreateParams[]): void;
}

export function CatalogMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class CatalogMixinImpl extends Base implements CatalogOperations {

        public getName(): string | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'name');
            return this.getLiteral(this.getOrigin()!, predicate)?.value;
        }

        public getDescription(): string | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'description');
            return this.getLiteral(this.getOrigin()!, predicate)?.value;
        }

        public getCatalogItems(): CatalogItem[] {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'lists');
            return this.getLinkedObjectAll(predicate).map(d => this.getSemantizer().build(catalogItemFactory, d));
        }

        public addCatalogItem(reference: string, offers: OfferCreateParams[]): void {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const subject = namedNode('');
            const catalogItemUuid = `#${self.crypto.randomUUID()}`;
            const catalogItem = createCatalogItem(this.getSemantizer(), { subject: catalogItemUuid, references: reference, offers: offers });
            this.addAll(catalogItem);
            this.addLinkedObject(subject, namedNode(DFC + 'lists'), namedNode(catalogItemUuid));
            // offers.forEach(offerParams => {
            //     const offer = createOffer(this.getSemantizer(), { subject: offerParams.subject, price: offerParams.price });
            //     this.addAll(offer);
            // });
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
    const { namedNode } = semantizer.getConfiguration().getRdfDataModelFactory();

    const subject = namedNode('');
    const rdfType = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    const namePredicate = namedNode(DFC + 'name');
    const listsPredicate = namedNode(DFC + 'lists');
    const maintainedByPredicate = namedNode(DFC + 'maintainedBy');

    catalog.addLinkedObject(subject, rdfType, namedNode(DFC + 'Catalog'));

    if (params) {
        params.name && catalog.addStringNoLocale(subject, namePredicate, params.name);

        params.enterprise && catalog.addLinkedObject(subject, maintainedByPredicate, namedNode(params.enterprise));

        if (params.catalogItems) {
            params.catalogItems.forEach(catalogItemCreateParams => {
                const catalogItem = createCatalogItem(semantizer, catalogItemCreateParams);
                catalog.addLinkedObject(subject, listsPredicate, namedNode(catalogItemCreateParams.subject ?? ''));
                catalog.addAll(catalogItem);
            });
        }

        
    }

    return catalog;
}