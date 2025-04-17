import { BlankNode, DatasetCore, NamedNode, Quad } from "@rdfjs/types";
import { Semantizer } from "./Semantizer";

export type Resource = NamedNode | BlankNode;

export interface WithSemantizer {
    getSemantizer(): Semantizer;
    // toRdfjsDataset(): DatasetRdfjs;
}

export interface WithBaseUri {
    getBaseUri(): NamedNode;
    setBaseUri(baseUri: NamedNode | string): void;
}

/**
 * @deprecated Please use the `WithBaseUri` interface instead. This will be removed.
*/
export interface WithOrigin {
    /**
     * @deprecated Please use the `getBaseUri()` method instead.
     */
    getOrigin(): NamedNode | BlankNode | undefined;

    /**
     * @deprecated Please use the `setBaseUri()` method instead.
     */
    setOrigin(uri: NamedNode | BlankNode): void;

    /**
     * @deprecated This will be removed.
     */
    getOriginDocument(): NamedNode | undefined;

    /**
     * @deprecated This will be removed.
     */
    getOriginThing(): NamedNode | BlankNode | undefined;

    /**
     * @deprecated This will be removed.
     */
    setOriginThing(term: NamedNode | BlankNode): void;
}

export type QuadIterableSemantizer = Iterable<Quad> & WithSemantizer & WithOrigin & WithBaseUri;

export interface Countable {
    count(): number;
    isEmpty(): boolean;
}

export interface Copyable {
    toCopy(): ThisType<this>;
}

export interface Comparable {
    equals(other: ThisType<this>): boolean;
    difference(other: ThisType<this>): ThisType<this>;
}


export interface DocumentLoadOptions {
    loadSeeAlso?: boolean;
    seeAlsoMaxDepth?: number;
}

export type AnyFunction<A = any> = (...input: any[]) => A;
export type AnyConstructor<A = object> = new (...input: any[]) => A;
export type Mixin<T extends AnyFunction> = InstanceType<ReturnType<T>>;