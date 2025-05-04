import { BlankNode, DatasetSemantizer, Literal, NamedNode, Quad, ShaclValidator, Term, WithSemantizer } from "@semantizer/types";
import { Readable } from "stream";

export interface IndexQueryingOptions {
    limit?: number;
}

export interface IndexOperations {
    loadEntryStream(strategy: EntryStreamTransformer<any>): Promise<Readable>;
    doesEntryMatchShape(entry: NamedNode | string, shapeToMatch: IndexShape, shaclValidator: ShaclValidator): boolean;
    countEntryShapeProperties(entry: NamedNode | string): number;
    getEntryShapePropertiesAll(entry: NamedNode | string): Term[] | undefined;
    hasEntrySubIndex(entry: NamedNode | string): boolean;
    getEntryTarget(entry: NamedNode | string): NamedNode | undefined;
    getEntrySubIndex(entry: NamedNode | string): NamedNode | undefined;
    getEntryShape(entry: NamedNode | string): NamedNode | BlankNode | undefined;

    query(strategy: IndexQueryingStrategy, options?: IndexQueryingOptions): Readable;
}

export interface IndexEntryOperations {
    doesMatchShape(shapeToMatch: IndexShape, shaclValidator: ShaclValidator): boolean;
    hasSubIndex(): boolean;
    getShape(): NamedNode | BlankNode | undefined;
    getShapeDataset(): IndexShape;
    getTarget(): NamedNode | BlankNode | undefined;
    getSubIndex(): NamedNode | undefined;
}

export interface IndexShapeOperations {
    // isClosed(): boolean;
    // hasMultiCriteria(): boolean;
    doesMatch(other: IndexShape, shaclValidator: ShaclValidator): boolean;
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

export interface IndexQueryingStrategy extends WithSemantizer {
    query(index: Index, options?: IndexQueryingOptions): Readable;
}

export interface EntryStreamTransformer<Entry> {
    transform(quad: Quad): Entry | undefined;
}

export type IndexShapeProperty = /*IndexShapePropertyBase*/ IndexShapePropertyOperations;
export type IndexShape = DatasetSemantizer & IndexShapeOperations;
export type IndexEntry = DatasetSemantizer & IndexEntryOperations;
export type Index = DatasetSemantizer & IndexOperations;