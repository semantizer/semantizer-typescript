import { Dataset as DatasetRdfjs, NamedNode } from "@rdfjs/types";
import { QuadIterableSemantizer, WithBaseUri, WithMixins, WithSemantizer } from './Common';
import { Fetch, Loader, LoaderQuadStream } from "./Loader";
import { Semantizer } from "./Semantizer";

export type DatasetSemantizer<Namespace extends any> = DatasetRdfjs & WithMixins<Namespace> & WithSemantizer & WithBaseUri;
export type DatasetSemantizerConstructor<Namespace extends any> = new (...args: any[]) => DatasetSemantizer<Namespace>;
// export type DatasetSemantizerRdfjsMixinConstructor = new (...args: any[]) => DatasetRdfjs & WithMixins & WithSemantizer & WithBaseUri;

export interface DatasetLoadOptions {
    loader?: Loader
}

export interface DatasetQuadStreamOptions {
    quadStreamLoader?: LoaderQuadStream;
}

export interface DatasetBaseFactory<Namespace extends any> {
    load(semantizer: Semantizer, resource: string | NamedNode, fetch?: Fetch): Promise<DatasetSemantizer<Namespace>>;
    build(semantizer: Semantizer, sourceDataset?: QuadIterableSemantizer): DatasetSemantizer<Namespace>;
}