import { DatasetSemantizer, BlankNode, NamedNode, Literal, Semantizer, Quad, Term } from "@semantizer/types";
import { Readable } from "stream";

export interface IndexOperations {
    loadEntryStream(strategy: EntryStreamTransformerStrategy<any>): Promise<Readable>;
    // forEachEntry(callbackfn: (value: NamedNode, index?: number, array?: NamedNode[]) => Promise<void>): Promise<void>;
    compareEntryWithShape<ComparisonResult>(entry: NamedNode | string, shape: IndexShape, strategy: IndexShapeComparisonStrategy<ComparisonResult>): IndexShapeComparisonResult<ComparisonResult>;
    countEntryShapeProperties(entry: NamedNode | string): number;
    getEntryShapePropertiesAll(entry: NamedNode | string): Term[] | undefined;
    hasEntrySubIndex(entry: NamedNode | string): boolean;
    getEntryTarget(entry: NamedNode | string): NamedNode | undefined;
    getEntrySubIndex(entry: NamedNode | string): NamedNode | undefined;
    getEntryShape(entry: NamedNode | string): NamedNode | BlankNode | undefined;
    findTargetsRecursively(strategy: IndexStrategy, callbackfn: (target: NamedNode) => void, limit?: number): Promise<void>;
}

export interface IndexEntryOperations {
    // compareShape(shape: IndexShape): IndexShapeComparisonResult;
    hasSubIndex(): boolean;
    getShape(): BlankNode | undefined;
    getTarget(): NamedNode | undefined;
    getSubIndex(): NamedNode | undefined;
}

export interface IndexShapeOperations {
    // isClosed(): boolean;
    // hasMultiCriteria(): boolean;
    // compares(other: IndexShape): IndexShapeComparisonResult;
    // getRdfTypeProperty(): IndexShapeProperty;
    // getFilterProperties(): IndexShapeProperty[];
    countProperties(): number;
    forEachProperty(callbackfn: (value: IndexShapeProperty, index?: number, array?: IndexShapeProperty[]) => void): void;
    getPropertiesAll(): IndexShapeProperty[];
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
    getValue(): NamedNode | Literal | BlankNode | undefined;
}

export interface IndexShapeComparisonStrategy<ComparisonResult> {
    execute(index: Index, entry: NamedNode | string, shape: IndexShape): IndexShapeComparisonResult<ComparisonResult>;
}

export interface IndexShapeComparisonResult<Result> {
    getResult(): Result;
    getComparedPath(): NamedNode;
}

export interface IndexStrategy {
    getSemantizer(): Semantizer;
    setSemantizer(semantizer: Semantizer): void;
    execute(index: NamedNode | string, callbackfn: (target: NamedNode) => void, limit?: number): Promise<void>;
}

export interface IndexStrategyFinalIndexes {
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