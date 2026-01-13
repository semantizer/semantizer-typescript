import { DatasetCore, NamedNode, Quad, Stream } from "@rdfjs/types";
import { WithSemantizer } from "./Common";

export type Fetch = typeof fetch;

export interface Loader extends WithSemantizer {
    /**
     * 
     * @param uri 
     * @param fetch
     * @throws HttpError 
     */
    load(uri: string | NamedNode, fetch?: Fetch): Promise<DatasetCore<Quad, Quad>>;
}

export interface LoaderQuadStream extends WithSemantizer {
    /**
     * 
     * @param uri 
     * @param fetch 
     * @throws HttpError
     */
    load(uri: string | NamedNode, fetch?: Fetch): Promise<Stream<Quad>>;
}