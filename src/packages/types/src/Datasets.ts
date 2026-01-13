import { Dataset as DatasetRdfjs, NamedNode } from "@rdfjs/types";
import { QuadIterableSemantizer, WithBaseUri, WithMixins, WithSemantizer } from './Common';
import { Fetch, Loader, LoaderQuadStream } from "./Loader";
import { Semantizer } from "./Semantizer";

export type DatasetSemantizer<T extends object = {}> = DatasetRdfjs & WithSemantizer & WithBaseUri & WithMixins<T>;
export type DatasetSemantizerConstructor<T extends object = {}> = new (...args: any[]) => DatasetSemantizer<T>;

export interface DatasetLoadOptions {
    loader?: Loader
}

export interface DatasetQuadStreamOptions {
    quadStreamLoader?: LoaderQuadStream;
}

export interface DatasetBaseFactory {
    load(semantizer: Semantizer, resource: string | NamedNode, fetch?: Fetch): Promise<DatasetSemantizer>;
    build(semantizer: Semantizer, sourceDataset?: QuadIterableSemantizer): DatasetSemantizer;
}