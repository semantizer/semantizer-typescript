import { BlankNode, DatasetSemantizerConstructor, NamedNode, Semantizer, WithMixins } from "@semantizer/types";
import { LiteralHelperAddMixinNamespace, LiteralHelperAddMixinOperations } from "./types";

export function LiteralHelperAddMixin<
    TMixins extends object,
    TBase extends DatasetSemantizerConstructor<TMixins>
>(Base: TBase) {

    return class LiteralHelperAddMixinImpl extends Base implements WithMixins<TMixins & LiteralHelperAddMixinNamespace> {

        public get mixins(): TMixins & LiteralHelperAddMixinNamespace {
            const parentMixins = super.mixins as TMixins & Partial<{ dataset: Partial<LiteralHelperAddMixinOperations> }>;

            return {
                ...parentMixins,
                dataset: {
                    ...(parentMixins.dataset ?? {}),

                    addBoolean: (subject: NamedNode, predicate: NamedNode, value: string, graph?: NamedNode): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#boolean'));
                        this.add(dataFactory.quad(subject, predicate, literal, graph));
                    },

                    addDate: (subject: NamedNode | BlankNode, predicate: NamedNode, value: Date, graph?: NamedNode): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#date'));
                        this.add(dataFactory.quad(subject, predicate, literal, graph));
                    },

                    addDatetime: (subject: NamedNode | BlankNode, predicate: NamedNode, value: Date, graph?: NamedNode): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#datetime'));
                        this.add(dataFactory.quad(subject, predicate, literal, graph));
                    },

                    addDecimal: (subject: NamedNode | BlankNode, predicate: NamedNode, value: number, graph?: NamedNode): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#decimal'));
                        this.add(dataFactory.quad(subject, predicate, literal, graph));
                    },

                    addInteger: (subject: NamedNode, predicate: NamedNode, value: number, graph?: NamedNode): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#integer'));
                        this.add(dataFactory.quad(subject, predicate, literal, graph));
                    },

                    addStringEnglish: (subject: NamedNode | BlankNode, predicate: NamedNode, value: string, graph?: NamedNode): void => {
                        throw new Error("Method not implemented.");
                    },

                    addStringNoLocale: (subject: NamedNode, predicate: NamedNode, value: string, graph?: NamedNode): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value);
                        this.add(dataFactory.quad(subject, predicate, literal, graph));
                    },

                    addStringWithLocale: (subject: NamedNode | BlankNode, predicate: NamedNode, value: string, locale: string, graph?: NamedNode): void => {
                        throw new Error("Method not implemented.");
                    },

                    addTime: (subject: NamedNode | BlankNode, predicate: NamedNode, value: Date, graph?: NamedNode): void => {
                        throw new Error("Method not implemented.");
                    }

                }

            }

        }

    }

}

export function datasetWithLiteralHelperAddFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(LiteralHelperAddMixin);
}