import { DatasetSemantizer, BlankNode, NamedNode, Literal, Quad, Term, WithSemantizer, Dataset } from "@semantizer/types";
import { Readable } from "stream";

export interface IndexQueryingOptions {
    limit?: number;
}

export interface IndexOperations {
    loadEntryStream(strategy: EntryStreamTransformerStrategy<any>): Promise<Readable>;
    doesEntryMatchShape(entry: NamedNode | string, shapeToMatch: IndexShape, strategy: IndexShapeComparisonStrategy): boolean;
    countEntryShapeProperties(entry: NamedNode | string): number;
    getEntryShapePropertiesAll(entry: NamedNode | string): Term[] | undefined;
    hasEntrySubIndex(entry: NamedNode | string): boolean;
    getEntryTarget(entry: NamedNode | string): NamedNode | undefined;
    getEntrySubIndex(entry: NamedNode | string): NamedNode | undefined;
    getEntryShape(entry: NamedNode | string): NamedNode | BlankNode | undefined;

    query(strategy: IndexQueryingStrategy, options?: IndexQueryingOptions): Promise<Readable>;
    // onResult: (result: NamedNode) => void
    // findTargetsRecursively(strategy: IndexStrategy, callbackfn: (target: NamedNode) => void, options?: IndexQueryingOptions): Promise<void>;
}

export interface IndexEntryOperations {
    doesMatchShape(shapeToMatch: IndexShape, strategy: IndexShapeComparisonStrategy): boolean;
    hasSubIndex(): boolean;
    getShape(): NamedNode | BlankNode | undefined;
    getShapeDataset(): IndexShape;
    // getShapeDataset(): IndexShape;
    getTarget(): NamedNode | BlankNode | undefined;
    getSubIndex(): NamedNode | undefined;
}

export interface IndexShapeOperations {
    // isClosed(): boolean;
    // hasMultiCriteria(): boolean;
    doesMatch(other: IndexShape, strategy: IndexShapeComparisonStrategy): boolean;
    countProperties(): number;
    forEachProperty(callbackfn: (value: IndexShapeProperty, index?: number, array?: IndexShapeProperty[]) => void): void;
    getPropertiesAll(): IndexShapeProperty[]; // IndexShapeProperty[];
    addTargetRdfType(rdfType: NamedNode): void;
    addValueProperty(path: NamedNode, value: NamedNode | Literal | BlankNode): void;
    addPatternProperty(path: NamedNode, value: NamedNode | Literal | BlankNode): void;
}

// export interface IndexShapePropertyBaseOperations {
//     getPredicate(): NamedNode;
//     isPatternProperty(): boolean;
//     isValueProperty(): boolean;
// }

export interface IndexShapePropertyOperations {
    getValue(): Literal | NamedNode | undefined;
    getPath(): NamedNode;
    hasSamePath(other: IndexShapeProperty): boolean;
    hasSameValue(other: IndexShapeProperty): boolean;
    equals(other: IndexShapeProperty): boolean;
    // compares(other: IndexShapeProperty): number
}

// export interface IndexShapeComparisonStrategy {
//     doesMatch(referenceShape: IndexShape, shapeToMatchWith: IndexShape): boolean;
// }

export interface IndexQueryingStrategy extends WithSemantizer {
    query(index: Index, options?: IndexQueryingOptions): Promise<Readable>;
    // query(index: NamedNode | string, callbackfn: (target: NamedNode) => void, limit?: number): Promise<void>;
}

// export interface IndexStrategyFinalIndexes extends WithSemantizer {
//     execute(rootIndex: NamedNode | string, shape: IndexShape, maxFind?: number): Readable;
// }

// export interface EntryStreamTransformerStrategy<Entry> {
//     transform(quad: Quad): Entry | undefined;
// }

export interface EntryStreamTransformer<Entry> {
    transform(quad: Quad): Entry | undefined;
}

// export interface FinalIndexResult {
//     getIndex(): NamedNode;
//     getPath(): NamedNode;
// }

// export type IndexShapePropertyBase = DatasetSemantizer & IndexShapePropertyBaseOperations;
export type IndexShapeProperty = /*IndexShapePropertyBase*/ IndexShapePropertyOperations;
export type IndexShape = DatasetSemantizer & IndexShapeOperations;
export type IndexEntry = DatasetSemantizer & IndexEntryOperations;
export type Index = DatasetSemantizer & IndexOperations;