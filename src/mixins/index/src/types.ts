import { DatasetMixinNamespace } from "@semantizer/mixin-dataset";
import { BlankNode, DatasetRdfjs, DatasetSemantizer, NamedNode, Quad, ShaclValidator, Term, WithSemantizer } from "@semantizer/types";
import { Readable } from "stream";

export type Index = DatasetSemantizer<IndexMixinNamespace>;
export type IndexMixinNamespace = DatasetMixinNamespace & { index: IndexMixinOperations };

export interface IndexQueryingOptions {
    limit?: number;
}

export interface IndexMixinOperations {
    loadEntryStream(strategy: EntryStreamTransformer<any>): Promise<Readable>;
    doesEntryMatchShape(entry: NamedNode | string, shapeToMatch: DatasetRdfjs, shaclValidator: ShaclValidator): boolean;
    countEntryShapeProperties(entry: NamedNode | string): number;
    getEntryShapePropertiesAll(entry: NamedNode | string): Term[] | undefined;
    hasEntrySubIndex(entry: NamedNode | string): boolean;
    getEntryTarget(entry: NamedNode | string): NamedNode | undefined;
    getEntrySubIndex(entry: NamedNode | string): NamedNode | undefined;
    getEntryShape(entry: NamedNode | string): NamedNode | BlankNode | undefined;

    query(strategy: IndexQueryingStrategy, options?: IndexQueryingOptions): Readable;
}

export interface IndexEntryOperations {
    doesMatchShape(shapeToMatch: DatasetRdfjs, shaclValidator: ShaclValidator): boolean;
    hasSubIndex(): boolean;
    getShape(): NamedNode | BlankNode | undefined;
    getShapeDataset(): DatasetRdfjs;
    getTarget(): NamedNode | BlankNode | undefined;
    getSubIndex(): NamedNode | undefined;
}

export interface IndexQueryingStrategy extends WithSemantizer {
    query(index: Index, options?: IndexQueryingOptions): Readable;
}

export interface EntryStreamTransformer<Entry> {
    transform(quad: Quad): Entry | undefined;
}

export type IndexEntry = DatasetSemantizer & IndexEntryOperations;