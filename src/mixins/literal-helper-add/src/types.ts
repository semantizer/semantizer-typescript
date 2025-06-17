import { BlankNode, DatasetSemantizer, NamedNode } from "@semantizer/types";

export type LiteralHelperAdd = DatasetSemantizer<LiteralHelperAddMixinNamespace>;
export type LiteralHelperAddMixinNamespace = { dataset: LiteralHelperAddMixinOperations };

export interface LiteralHelperAddMixinOperations {
    addBoolean(subject: NamedNode, predicate: NamedNode, value: string, graph?: NamedNode): void;
    addDate(subject: NamedNode | BlankNode, predicate: NamedNode, value: Date, graph?: NamedNode): void;
    addDatetime(subject: NamedNode | BlankNode, predicate: NamedNode, value: Date, graph?: NamedNode): void;
    addDecimal(subject: NamedNode | BlankNode, predicate: NamedNode, value: number, graph?: NamedNode): void;
    addInteger(subject: NamedNode, predicate: NamedNode, value: number, graph?: NamedNode): void;
    addStringEnglish(subject: NamedNode | BlankNode,predicate: NamedNode, value: string, graph?: NamedNode): void;
    addStringNoLocale(subject: NamedNode, predicate: NamedNode, value: string, graph?: NamedNode): void;
    addStringWithLocale(subject: NamedNode | BlankNode,predicate: NamedNode, value: string, locale: string, graph?: NamedNode): void;
    addTime(subject: NamedNode | BlankNode,predicate: NamedNode, value: Date, graph?: NamedNode): void;
}