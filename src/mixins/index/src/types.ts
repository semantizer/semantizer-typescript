import { BlankNode, DatasetRdfjs, NamedNode, Quad, ShaclValidator, Term, WithBaseUri, WithSemantizer } from "@semantizer/types";
import { Readable } from "stream";
import { Dataset, DatasetOperations } from "@semantizer/mixin-dataset";

declare module "@semantizer/types" {
    interface MixinNamespace {
        dataset: DatasetOperations,
        index: IndexOperations;
    }
}

export interface IndexQueryingOptions {
    limit?: number;
}

export interface IndexOperations {
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

export type IndexEntry = Dataset & IndexEntryOperations;

export type Index = DatasetRdfjs & WithSemantizer & WithBaseUri & {
    mixins: {
        dataset: DatasetOperations;
        index: IndexOperations;
    }
}

export type IndexTest = {
    mixins: {
        // dataset: DatasetOperations;
        index: IndexOperations;
    }
}