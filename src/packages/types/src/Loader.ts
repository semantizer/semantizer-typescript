import { DatasetCore, NamedNode, Quad, Stream } from "@rdfjs/types";

export type Fetch = typeof fetch;

export interface Loader {
    /**
     * 
     * @param uri 
     * @param fetch
     * @throws HttpError 
     */
    load(uri: string | NamedNode, fetch?: Fetch): Promise<DatasetCore<Quad, Quad>>;
}

export interface LoaderQuadStream {
    /**
     * 
     * @param uri 
     * @param fetch 
     * @throws HttpError
     */
    load(uri: string | NamedNode, fetch?: Fetch): Promise<Stream<Quad>>;
}