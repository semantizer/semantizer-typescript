import { BlankNode, DatasetSemantizer, DatasetSemantizerMixinConstructor, NamedNode, Semantizer, Term } from "@semantizer/types";
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
}

export interface OfferParams {
    price?: NamedNode | BlankNode;
    customerCategory?: NamedNode;
    stockLimitation?: number;
    discount?: number;
    manager?: NamedNode;
    saleSessions?: NamedNode[];
    orderLines?: NamedNode[];
}

export interface OfferGetParams extends OfferParams {
    uri: NamedNode;
}

export interface CatalogItemParams {
    product?: NamedNode;
    extraAvailabilityTime?: string;
    extraDeliveryConditions?: string;
    sku?: string;
    stockLimitation?: number;
    manager?: NamedNode;
    offers?: NamedNode[];
}

export interface CatalogItemGetParams extends CatalogItemParams {
    uri: NamedNode;
}

export interface PriceParams {
    value?: number;
    currency?: NamedNode | BlankNode;
    vatRate?: number;
}

export interface PriceGetParams extends PriceParams {
    uri: NamedNode | BlankNode;
}

export interface CatalogOperations {
    getName(): string | undefined;
    getDescription(): string | undefined;
    getMaintainer(): NamedNode | undefined;

    createCatalogItem(reference: string, offers: OfferCreateParams[]): CatalogItem;
    // createOffer(...): string; // return uri

    getCatalogItem(catalogItem: NamedNode): CatalogItemGetParams;
    getCatalogItems(catalogItems: NamedNode[]): CatalogItemGetParams[];
    getCatalogItemsAll(): CatalogItemGetParams[];
    getCatalogItemsOfProduct(product: NamedNode): NamedNode[];
    setCatalogItem(catalogItem: NamedNode, newValue: CatalogItemParams): void;

    getOffer(offer: NamedNode): OfferGetParams;
    getOffers(offers: NamedNode[]): OfferGetParams[];
    setOffer(offer: NamedNode, newValue: OfferParams): void;

    getPrice(offer: NamedNode): PriceGetParams | undefined; // TODO: harmonize return type
}

export function CatalogMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class CatalogMixinImpl extends Base implements CatalogOperations {

        public getCatalogItemsAll(): CatalogItemGetParams[] {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const catalogItems = this.getObjectUriAll(this.getOrigin()!, namedNode(DFC + 'lists'));
            return this.getCatalogItems(catalogItems ?? []);
        }

        public getCatalogItem(catalogItem: NamedNode): CatalogItemGetParams {
            const catalogItemDataset = this.getSubGraph(catalogItem);

            if (!catalogItemDataset) {
                throw new Error("Unable to find the catalogItem " + catalogItem.value);
            }

            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();

            return {
                uri: catalogItem,
                product: catalogItemDataset.getObjectUri(catalogItem, namedNode(DFC + 'references')),
                extraAvailabilityTime: catalogItemDataset.getObjectStringNoLocale(catalogItem, namedNode(DFC + 'extraAvailabilityTime')),
                extraDeliveryConditions: catalogItemDataset.getObjectStringNoLocale(catalogItem, namedNode(DFC + 'extraDeliveryConditions')),
                sku: catalogItemDataset.getObjectStringNoLocale(catalogItem, namedNode(DFC + 'sku')),
                stockLimitation: catalogItemDataset.getObjectInteger(catalogItem, namedNode(DFC + 'stockLimitation')),
                manager: catalogItemDataset.getObjectUri(catalogItem, namedNode(DFC + 'managedBy')),
                offers: catalogItemDataset.getObjectUriAll(catalogItem, namedNode(DFC + 'offeredThrough')),
            }
        }

        public getCatalogItems(catalogItems: NamedNode[]): CatalogItemGetParams[] {
            return catalogItems.map(catalogItem => this.getCatalogItem(catalogItem));
        }

        public getCatalogItemsOfProduct(product: NamedNode): NamedNode[] {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.match(null, namedNode(DFC + 'references'), product)
                .reduce<NamedNode[]>((acc, quad) => {
                    if (quad.subject.termType === 'NamedNode') {
                        acc.push(quad.subject);
                    }
                    return acc;
                }, []);
        }

        public setCatalogItem(catalogItem: NamedNode, newValue: CatalogItemParams): void {
            throw new Error("Method not implemented.");
        }

        public getOffer(offer: NamedNode): OfferGetParams {
            const offerDataset = this.getSubGraph(offer);

            if (!offerDataset) {
                throw new Error("Unable to find the catalogItem " + offer.value);
            }

            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();

            return {
                uri: offer,
                price: offerDataset.getObjectLinked(offer, namedNode(DFC + 'hasPrice')),
                customerCategory: offerDataset.getObjectUri(offer, namedNode(DFC + 'customerCategory')),
                stockLimitation: offerDataset.getObjectInteger(offer, namedNode(DFC + 'stockLimitation')),
                discount: offerDataset.getObjectDecimal(offer, namedNode(DFC + 'discount')),
                manager: offerDataset.getObjectUri(offer, namedNode(DFC + 'managedBy')),
                saleSessions: offerDataset.getObjectUriAll(offer, namedNode(DFC + 'listedIn')),
                orderLines: offerDataset.getObjectUriAll(offer, namedNode(DFC + 'concernedBy')),
            }
        }

        public getPrice(offer: NamedNode): PriceGetParams | undefined {
            let result: PriceGetParams | undefined = undefined;
            const offerResult = this.getOffer(offer);

            if (offerResult.price) {
                const priceDataset = this.getSubGraph(offerResult.price);

                if (!priceDataset) {
                    throw new Error("Unable to find the catalogItem " + offer.value);
                }

                const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();

                result = {
                    uri: offerResult.price,
                    value: priceDataset.getObjectDecimal(offerResult.price, namedNode(DFC + 'value')),
                    vatRate: priceDataset.getObjectDecimal(offerResult.price, namedNode(DFC + 'vatRate')),
                    currency: priceDataset.getObjectLinked(offerResult.price, namedNode(DFC + 'currency')),
                }
            }

            return result;
        }

            public getOffers(offers: NamedNode[]): OfferGetParams[] {
                return offers.map(offer => this.getOffer(offer));
            }

        public setOffer(offer: NamedNode, newValue: OfferParams): void {
            throw new Error("Method not implemented.");
        }

        public getName(): string | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.getObjectStringNoLocale(this.getOrigin()!, namedNode(DFC + 'name'));
        }

        public getDescription(): string | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.getObjectStringNoLocale(this.getOrigin()!, namedNode(DFC + 'description'));
        }

        public getMaintainer(): NamedNode | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.getObjectUri(this.getOrigin()!, namedNode(DFC + 'maintainedBy'));
        }

        public createCatalogItem(reference: string, offers: OfferCreateParams[]): CatalogItem {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const subject = namedNode('');
            const catalogItemUuid = `#${self.crypto.randomUUID()}`;
            const catalogItem = createCatalogItem(
                this.getSemantizer(),
                {
                    subject: catalogItemUuid,
                    references: reference,
                    offers: offers
                }
            );
            this.addAll(catalogItem);
            this.addLinkedObject(subject, namedNode(DFC + 'lists'), namedNode(catalogItemUuid));
            // offers.forEach(offerParams => {
            //     const offer = createOffer(this.getSemantizer(), { subject: offerParams.subject, price: offerParams.price });
            //     this.addAll(offer);
            // });

            return catalogItem;
        }

    }

}

export function catalogFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(CatalogMixin);
}

// export function catalogWithHelperLiteralAddFactory(semantizer: Semantizer) {
//     const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
//     return semantizer.getMixinFactory(CatalogMixin, LiteralHelperAddMixin(_DatasetImpl));
// }

export function createCatalog(semantizer: Semantizer, params?: CatalogCreateParams): Catalog {
    const catalog = semantizer.build(catalogFactory);
    const { namedNode } = semantizer.getConfiguration().getRdfDataModelFactory();

    const subject = namedNode('');
    const rdfType = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    const namePredicate = namedNode(DFC + 'name');
    const listsPredicate = namedNode(DFC + 'lists');
    const maintainedByPredicate = namedNode(DFC + 'maintainedBy');

    catalog.addLinkedObject(subject, rdfType, namedNode(DFC + 'Catalog'));

    if (params) {
        params.name && catalog.addObjectStringNoLocale(subject, namePredicate, params.name);

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

// export type CatalogItemField = 'extraAvailabilityTime' | 'extraDeliveryConditions';

// const catalogItem = catalog.getCatalogItem('uri');
// if (catalogItem && catalogItem.product) {
//   const product = await semantizer.load(catalogItem.product, suppliedProductFactory);
//   console.log(product.getName());
// }
// catalog.getCatalogItem('uri')?.productUri

// getCatalogItemExtraAvailabilityTime(catalogItemUri: string): string | undefined;
// getCatalogItemExtraDeliveryConditions(catalogItemUri: string): string | undefined;
// getCatalogItemSku(catalogItemUri: string): string | undefined;
// getCatalogItemStockLimitation(catalogItemUri: string): number | undefined;
// getCatalogItemManagerUri(catalogItemUri: string): string | undefined;

// setCatalogItemExtraAvailabilityTime(catalogItemUri: string, extraAvailabilityTime: string | undefined): void;
// setCatalogItemExtraDeliveryConditions(catalogItemUri: string, extraDeliveryConditions: string | undefined): void;
// setCatalogItemSku(catalogItemUri: string, sku: string | undefined): void;
// setCatalogItemStockLimitation(catalogItemUri: string, stockLimitation: number | undefined): void;
// setCatalogItemManagerUri(catalogItemUri: string, managerUri: string | undefined): void;

// getOfferPrice(offerUri: string): number | undefined;
// getOfferVatRate(offerUri: string): number | undefined;
// getOfferCurrencyUri(offerUri: string): string | undefined;
// getOfferCustomerCategoryUri(offerUri: string): string | undefined;
// getOfferStockLimitation(offerUri: string): number | undefined;
// getOfferOrderLinesUriAll(offerUri: string): string | undefined;
// getOfferDiscount(offerUri: string): number | undefined;
// getOfferSaleSessionsUriAll(offerUri: string): string | undefined;

// setOfferPrice(offerUri: string, price: number | undefined): void;
// setOfferVatRate(offerUri: string, vatRate: number | undefined): void;
// setOfferCurrencyUri(offerUri: string, currencyUri: string | undefined): void;
// setOfferCustomerCategoryUri(offerUri: string, customerCategoryUri: string | undefined): void;
// setOfferStockLimitation(offerUri: string, stockLimitation: number | undefined): void;
// setOfferOrderLinesUriAll(offerUri: string): string | undefined;
// setOfferDiscount(offerUri: string, discount: number | undefined): void;
// setOfferSaleSessionsUriAll(offerUri: string): string | undefined;

// public getCatalogItemExtraAvailabilityTime(catalogItemUri: string): string | undefined {
//     throw new Error("Method not implemented.");
// }

// public getCatalogItemExtraDeliveryConditions(catalogItemUri: string): string | undefined {
//     throw new Error("Method not implemented.");
// }

// public getCatalogItemSku(catalogItemUri: string): string | undefined {
//     throw new Error("Method not implemented.");
// }

// public getCatalogItemStockLimitation(catalogItemUri: string): number | undefined {
//     throw new Error("Method not implemented.");
// }

// public getCatalogItemManagerUri(catalogItemUri: string): string | undefined {
//     throw new Error("Method not implemented.");
// }

// public setCatalogItemExtraAvailabilityTime(catalogItemUri: string, extraAvailabilityTime: string | undefined): void {
//     throw new Error("Method not implemented.");
// }

// public setCatalogItemExtraDeliveryConditions(catalogItemUri: string, extraDeliveryConditions: string | undefined): void {
//     throw new Error("Method not implemented.");
// }

// public setCatalogItemSku(catalogItemUri: string, sku: string | undefined): void {
//     throw new Error("Method not implemented.");
// }

// public setCatalogItemStockLimitation(catalogItemUri: string, stockLimitation: number | undefined): void {
//     throw new Error("Method not implemented.");
// }

// public setCatalogItemManagerUri(catalogItemUri: string, managerUri: string | undefined): void {
//     throw new Error("Method not implemented.");
// }

// public getOfferPrice(offerUri: string): number | undefined {
//     throw new Error("Method not implemented.");
// }

// public getOfferVatRate(offerUri: string): number | undefined {
//     throw new Error("Method not implemented.");
// }

// public getOfferCurrencyUri(offerUri: string): string | undefined {
//     throw new Error("Method not implemented.");
// }

// public getOfferCustomerCategoryUri(offerUri: string): string | undefined {
//     throw new Error("Method not implemented.");
// }

// public getOfferStockLimitation(offerUri: string): number | undefined {
//     throw new Error("Method not implemented.");
// }

// public getOfferOrderLinesUriAll(offerUri: string): string | undefined {
//     throw new Error("Method not implemented.");
// }

// public getOfferDiscount(offerUri: string): number | undefined {
//     throw new Error("Method not implemented.");
// }

// public getOfferSaleSessionsUriAll(offerUri: string): string | undefined {
//     throw new Error("Method not implemented.");
// }

// public setOfferPrice(offerUri: string, price: number | undefined): void {
//     throw new Error("Method not implemented.");
// }

// public setOfferVatRate(offerUri: string, vatRate: number | undefined): void {
//     throw new Error("Method not implemented.");
// }

// public setOfferCurrencyUri(offerUri: string, currencyUri: string | undefined): void {
//     throw new Error("Method not implemented.");
// }

// public setOfferCustomerCategoryUri(offerUri: string, customerCategoryUri: string | undefined): void {
//     throw new Error("Method not implemented.");
// }

// public setOfferStockLimitation(offerUri: string, stockLimitation: number | undefined): void {
//     throw new Error("Method not implemented.");
// }

// public setOfferDiscount(offerUri: string, discount: number | undefined): void {
//     throw new Error("Method not implemented.");
// }