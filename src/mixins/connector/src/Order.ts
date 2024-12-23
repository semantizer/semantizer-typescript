import { LiteralHelperAddMixin } from "@semantizer/mixin-literal-helper-add";
import { DatasetSemantizer, DatasetSemantizerMixinConstructor, Semantizer } from "@semantizer/types";

export type Order = DatasetSemantizer & OrderOperations;

const DFC = 'https://github.com/datafoodconsortium/ontology/releases/latest/download/DFC_BusinessOntology.owl#';

export interface OrderCreateParams {
    number?: string;
    date?: string;
    customer?: string;
}

export interface OrderOperations {
    getNumber(): string | undefined;
    getDate(): string | undefined;
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

export function orderWithHelperLiteralAddFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(OrderMixin, LiteralHelperAddMixin(_DatasetImpl));
}

export function createOrder(semantizer: Semantizer, params?: OrderCreateParams): Order {
    const order = semantizer.build(orderWithHelperLiteralAddFactory);
    const { namedNode } = semantizer.getConfiguration().getRdfDataModelFactory();

    const subject = namedNode('');
    const rdfType = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    const numberPredicate = namedNode(DFC + 'hasNumber');
    const datePredicate = namedNode(DFC + 'hasDate');

    order.addLinkedObject(subject, rdfType, namedNode(DFC + 'Order'));

    if (params) {
        params.number && order.addStringNoLocale(subject, numberPredicate, params.number);
        params.date && order.addLinkedObject(subject, datePredicate, namedNode(params.date));
    }

    return order;
}