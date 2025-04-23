import { DatasetSemantizer, BlankNode, NamedNode, Literal, Quad, Term, WithSemantizer } from "@semantizer/types";
import { Readable } from "stream";

export interface IndexQueryingOptions {
    limit?: number;
}

export interface IndexOperations {
    loadEntryStream(strategy: EntryStreamTransformerStrategy<any>): Promise<Readable>;
    compareEntryWithShape<ComparisonResult>(entry: NamedNode | string, shape: IndexShape, strategy: IndexShapeComparisonStrategy<ComparisonResult>): ComparisonResult;
    countEntryShapeProperties(entry: NamedNode | string): number;
    getEntryShapePropertiesAll(entry: NamedNode | string): Term[] | undefined;
    hasEntrySubIndex(entry: NamedNode | string): boolean;
    getEntryTarget(entry: NamedNode | string): NamedNode | undefined;
    getEntrySubIndex(entry: NamedNode | string): NamedNode | undefined;
    getEntryShape(entry: NamedNode | string): NamedNode | BlankNode | undefined;

    findTargetsRecursively(strategy: IndexStrategy, callbackfn: (target: NamedNode) => void, options?: IndexQueryingOptions): Promise<void>;
}

export interface IndexEntryOperations {
    // compareShape(shape: IndexShape): IndexShapeComparisonResult;
    // compareShape<ComparisonResult>(shape: IndexShape, strategy: IndexShapeComparisonStrategy<ComparisonResult>): IndexShapeComparisonResult<ComparisonResult>;
    compareShape<ComparisonResult>(shape: IndexShape, strategy: IndexShapeComparisonStrategy<ComparisonResult>): ComparisonResult;
    hasSubIndex(): boolean;
    getShape(): NamedNode | BlankNode | undefined;
    getTarget(): NamedNode | BlankNode | undefined;
    getSubIndex(): NamedNode | undefined;
}

export interface IndexShapeOperations {
    // isClosed(): boolean;
    // hasMultiCriteria(): boolean;
    // compares(other: IndexShape): IndexShapeComparisonResult;
    // getRdfTypeProperty(): IndexShapeProperty;
    // getFilterProperties(): IndexShapeProperty[];
    compareTo<ComparisonResult>(other: IndexShape, strategy: IndexShapeComparisonStrategy<ComparisonResult>): ComparisonResult;
    countProperties(): number;
    forEachProperty(callbackfn: (value: IndexShapeProperty, index?: number, array?: IndexShapeProperty[]) => void): void;
    getPropertiesAll(): ShapeProperty[]; // IndexShapeProperty[];
    addTargetRdfType(rdfType: NamedNode): void;
    addValueProperty(path: NamedNode, value: NamedNode | Literal | BlankNode): void;
    addPatternProperty(path: NamedNode, value: NamedNode | Literal | BlankNode): void;
}

export interface IndexShapePropertyBaseOperations {
    getPredicate(): NamedNode;
    isPatternProperty(): boolean;
    isValueProperty(): boolean;
}

export interface IndexShapePropertyOperations {
    hasSamePath(other: IndexShapeProperty): boolean;
    hasSameValue(other: IndexShapeProperty): boolean;
    equals(other: IndexShapeProperty): boolean;
    compares(other: IndexShapeProperty): number;
    getPath(): NamedNode | undefined;
    getValue(): NamedNode | Literal | undefined;
}

export interface IndexShapeComparisonStrategy<ComparisonResult> {
    // execute(entry: IndexEntry, shape: IndexShape): IndexShapeComparisonResult<ComparisonResult>;
    execute(shapeA: IndexShape, shapeB: IndexShape): ComparisonResult;
}

// export interface IndexShapeComparisonResult<Result> {
//     getResult(): Result;
//     getComparedPath(): NamedNode;
// }

export interface IndexStrategy extends WithSemantizer {
    execute(index: NamedNode | string, callbackfn: (target: NamedNode) => void, limit?: number): Promise<void>;
}

export interface IndexStrategyFinalIndexes extends WithSemantizer {
    execute(rootIndex: NamedNode | string, shape: IndexShape, maxFind?: number): Readable;
}

export interface EntryStreamTransformerStrategy<Entry> {
    transform(quad: Quad): Entry | undefined;
}

export interface FinalIndexResult {
    getIndex(): NamedNode;
    getPath(): NamedNode;
}

export type IndexShapePropertyBase = DatasetSemantizer & IndexShapePropertyBaseOperations;
export type IndexShapeProperty = IndexShapePropertyBase & IndexShapePropertyOperations;
export type IndexShape = DatasetSemantizer & IndexShapeOperations;
export type IndexEntry = DatasetSemantizer & IndexEntryOperations;
export type Index = DatasetSemantizer & IndexOperations;