import { DatasetSemantizer, DatasetSemantizerMixinConstructor, NamedNode, Semantizer } from "@semantizer/types";
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
    getOrderLine(orderLineUri: NamedNode): OrderLineCreateParams | undefined;
    getOrderLines(): OrderLineCreateParams[];
    getOrderLineUriAll(): NamedNode[];
}

export function OrderMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class OrderMixinImpl extends Base implements OrderOperations {

        public getNumber(): string | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.getLiteral(this.getOrigin()!, namedNode(DFC + 'hasNumber'))?.value;
        }

        public getDate(): string | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.getLiteral(this.getOrigin()!, namedNode(DFC + 'hasDate'))?.value;
        }

        public getState(): string | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.getLinkedObject(namedNode(DFC + 'hasOrderState'), this)?.getOrigin()?.value;
        }

        public getCustomer(): string | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.getLinkedObject(namedNode(DFC + 'orderedBy'), this)?.getOrigin()?.value;
        }

        public getOrderLine(orderLineUri: NamedNode): OrderLineCreateParams | undefined {
            const part = this.getSubGraph(orderLineUri);
            if (part) {
                const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                return {
                    subject: orderLineUri.value,
                    quantity: part.getObjectDecimal(orderLineUri, namedNode(DFC + 'quantity')),
                    price: part.getObjectDecimal(orderLineUri, namedNode(DFC + 'hasPrice')),
                    offer: part.getObjectUri(orderLineUri, namedNode(DFC + 'concerns'))?.value
                }
            }
            return undefined;
        }

        public getOrderLines(): OrderLineCreateParams[]{
            return this.getOrderLineUriAll().reduce<OrderLineCreateParams[]>((parts, currentPartUri) => {
                    const orderLine = this.getOrderLine(currentPartUri);
                    if (orderLine) {
                        parts.push(orderLine);
                    }
                    return parts;
                }, []);
        }

        public getOrderLineUriAll(): NamedNode[] {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.getObjectUriAll(this.getOrigin() ?? namedNode(''), namedNode(DFC + 'hasPart')) ?? [];
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
            const orderLine = createOrderLine(semantizer, { subject: orderLineSubject, ...part });
            order.addLinkedObject(subject, namedNode(DFC + 'hasPart'), namedNode(orderLineSubject));
            order.addAll(orderLine);
        });
    }

    return order;
}