import { Dataset as DatasetRdfjs, NamedNode } from "@rdfjs/types";
import { QuadIterableSemantizer, WithBaseUri, WithMixins, WithSemantizer } from './Common';
import { Fetch, Loader, LoaderQuadStream } from "./Loader";
import { Semantizer } from "./Semantizer";

export type DatasetSemantizer<T extends object = {}> = DatasetRdfjs & WithSemantizer & WithBaseUri & WithMixins<T>;
export type DatasetSemantizerConstructor<T extends object = {}> = new (...args: any[]) => DatasetSemantizer<T>;
// export type DatasetSemantizer<MixinNamespace extends {} = {}> = DatasetRdfjs & WithSemantizer & WithBaseUri & WithMixins<MixinNamespace>;
// export type DatasetSemantizerConstructor<MixinNamespace extends {} = {}> = new (...args: any[]) => DatasetSemantizer<MixinNamespace>;
// export type DatasetSemantizerRdfjsMixinConstructor = new (...args: any[]) => DatasetRdfjs & WithMixins & WithSemantizer & WithBaseUri;

export interface DatasetLoadOptions {
    loader?: Loader
}

export interface DatasetQuadStreamOptions {
    quadStreamLoader?: LoaderQuadStream;
}

export interface DatasetBaseFactory {
    load<T extends object = {}>(semantizer: Semantizer, resource: string | NamedNode, fetch?: Fetch): Promise<DatasetSemantizer<T>>;
    build<T extends object = {}>(semantizer: Semantizer, sourceDataset?: QuadIterableSemantizer): DatasetSemantizer<T>;
}