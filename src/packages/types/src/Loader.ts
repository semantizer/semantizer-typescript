import { DatasetCore, NamedNode, Quad, Stream } from "@rdfjs/types";

export type Fetch = typeof fetch;

export interface Loader {
    load(uri: string | NamedNode, fetch?: Fetch): Promise<DatasetCore<Quad, Quad>>;
}

export interface LoaderQuadStream {
    load(uri: string | NamedNode, fetch?: Fetch): Promise<Stream<Quad>>;
}