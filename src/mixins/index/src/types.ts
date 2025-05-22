import { BlankNode, Dataset, DatasetSemantizer, NamedNode, Quad, ShaclValidator, Term, WithSemantizer } from "@semantizer/types";
import { Readable } from "stream";

declare module "@semantizer/types" {
    interface MixinNamespace {
        index: IndexOperations;
    }
}

export interface IndexQueryingOptions {
    limit?: number;
}

export interface IndexOperations {
    loadEntryStream(strategy: EntryStreamTransformer<any>): Promise<Readable>;
    doesEntryMatchShape(entry: NamedNode | string, shapeToMatch: Dataset, shaclValidator: ShaclValidator): boolean;
    countEntryShapeProperties(entry: NamedNode | string): number;
    getEntryShapePropertiesAll(entry: NamedNode | string): Term[] | undefined;
    hasEntrySubIndex(entry: NamedNode | string): boolean;
    getEntryTarget(entry: NamedNode | string): NamedNode | undefined;
    getEntrySubIndex(entry: NamedNode | string): NamedNode | undefined;
    getEntryShape(entry: NamedNode | string): NamedNode | BlankNode | undefined;

    query(strategy: IndexQueryingStrategy, options?: IndexQueryingOptions): Readable;
}

export interface IndexEntryOperations {
    doesMatchShape(shapeToMatch: Dataset, shaclValidator: ShaclValidator): boolean;
    hasSubIndex(): boolean;
    getShape(): NamedNode | BlankNode | undefined;
    getShapeDataset(): Dataset;
    getTarget(): NamedNode | BlankNode | undefined;
    getSubIndex(): NamedNode | undefined;
}

export interface IndexQueryingStrategy extends WithSemantizer {
    query(index: Index, options?: IndexQueryingOptions): Readable;
    getName(): string;
}

export interface EntryStreamTransformer<Entry> {
    transform(quad: Quad): Entry | undefined;
}

export type IndexEntry = DatasetSemantizer & IndexEntryOperations;

export type Index = DatasetSemantizer & {
    mixins: {
        index: IndexOperations;
    }
}