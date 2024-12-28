import { LiteralHelperAddMixin } from "@semantizer/mixin-literal-helper-add";
import { DatasetSemantizer, DatasetSemantizerMixinConstructor, Semantizer } from "@semantizer/types";

export type OrderLine = DatasetSemantizer & OrderLineOperations;

const DFC = 'https://github.com/datafoodconsortium/ontology/releases/latest/download/DFC_BusinessOntology.owl#';

export interface OrderLineCreateParams {
    quantity?: number;
    price?: number;
    offer?: string;
}

export interface OrderLineOperations {
    getQuantity(): number | undefined;
    getPrice(): number | undefined;
    getOffer(): string | undefined;
}

export function OrderLineMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class OrderLineMixinImpl extends Base implements OrderLineOperations {

        public getQuantity(): number | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'hasNumber');
            const value = this.getLiteral(this.getOrigin()!, predicate)?.value;
            return value ? Number.parseFloat(value): undefined;
        }

        public getPrice(): number | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'hasDate');
            const value = this.getLiteral(this.getOrigin()!, predicate)?.value;
            return value ? Number.parseFloat(value): undefined;
        }

        public getOffer(): string | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'concerns');
            return this.getLinkedObject(predicate, this)?.getOrigin()?.value;
        }
    }

}

export function orderLineFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(OrderLineMixin);
}

export function orderLineWithHelperLiteralAddFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(OrderLineMixin, LiteralHelperAddMixin(_DatasetImpl));
}

export function createOrderLine(semantizer: Semantizer, params?: OrderLineCreateParams): OrderLine {
    const order = semantizer.build(orderLineWithHelperLiteralAddFactory);
    const { namedNode } = semantizer.getConfiguration().getRdfDataModelFactory();

    const subject = namedNode('');
    const rdfType = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    const quantityPredicate = namedNode(DFC + 'quantity');
    const pricePredicate = namedNode(DFC + 'hasPrice');
    const concernsPredicate = namedNode(DFC + 'concerns');

    order.addLinkedObject(subject, rdfType, namedNode(DFC + 'OrderLine'));

    if (params) {
        params.quantity && order.addDecimal(subject, quantityPredicate, params.quantity);
        params.price && order.addDecimal(subject, pricePredicate, params.price);
        params.offer && order.addLinkedObject(subject, concernsPredicate, namedNode(params.offer));
    }

    return order;
}