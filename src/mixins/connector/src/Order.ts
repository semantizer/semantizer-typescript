import { DatasetSemantizer, DatasetSemantizerMixinConstructor, Semantizer } from "@semantizer/types";
import { createOrderLine, OrderLineCreateParams } from "./OrderLine";

export type Order = DatasetSemantizer & OrderOperations;

const DFC = 'https://github.com/datafoodconsortium/ontology/releases/latest/download/DFC_BusinessOntology.owl#';

export interface OrderCreateParams {
    number?: string;
    date?: string;
    state?: string; // SKOS Concept
    customer?: string;
    parts?: OrderLineCreateParams[];
}

export interface OrderOperations {
    getNumber(): string | undefined;
    getDate(): string | undefined;
    getState(): string | undefined;
    getCustomer(): string | undefined;
}

export function OrderMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class OrderMixinImpl extends Base implements OrderOperations {

        public getNumber(): string | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'hasNumber');
            return this.getLiteral(this.getOrigin()!, predicate)?.value;
        }

        public getDate(): string | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'hasDate');
            return this.getLiteral(this.getOrigin()!, predicate)?.value;
        }

        public getState(): string | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'hasOrderState');
            return this.getLinkedObject(predicate, this)?.getOrigin()?.value;
        }

        public getCustomer(): string | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = namedNode(DFC + 'orderedBy');
            return this.getLinkedObject(predicate, this)?.getOrigin()?.value;
        }
    }

}

export function orderFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(OrderMixin);
}

export function createOrder(semantizer: Semantizer, params?: OrderCreateParams): Order {
    const order = semantizer.build(orderFactory);
    const { namedNode } = semantizer.getConfiguration().getRdfDataModelFactory();

    const subject = namedNode('');
    const rdfType = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    const numberPredicate = namedNode(DFC + 'hasNumber');
    const datePredicate = namedNode(DFC + 'hasDate');
    const orderStatePredicate = namedNode(DFC + 'hasOrderState');
    const orderedByPredicate = namedNode(DFC + 'orderedBy');

    order.addLinkedObject(subject, rdfType, namedNode(DFC + 'Order'));

    if (params) {
        params.number && order.addObjectStringNoLocale(subject, numberPredicate, params.number);
        params.date && order.addObjectDate(subject, datePredicate, new Date(params.date));
        params.customer && order.addLinkedObject(subject, orderedByPredicate, namedNode(params.customer));
        params.state && order.addLinkedObject(subject, orderStatePredicate, namedNode(params.state));

        params.parts?.forEach(part => {
            const orderLineSubject = '#' + self.crypto.randomUUID();
            const orderLine = createOrderLine(semantizer, {subject: orderLineSubject, ...part});
            order.addLinkedObject(subject, namedNode(DFC + 'hasPart'), namedNode(orderLineSubject));
            order.addAll(orderLine);
        });
    }

    return order;
}