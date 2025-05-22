import { BlankNode, NamedNode, Quad, Term } from "@rdfjs/types";
import { Semantizer } from "./Semantizer";

export type Resource = NamedNode | BlankNode;

export interface MixinNamespace {}

export interface WithMixins {
    mixins: MixinNamespace;
}

export interface WithSemantizer {
    getSemantizer(): Semantizer;
    setSemantizer(semantizer: Semantizer): void;
    log(level: LoggingLevel, message: string, code?: number, subject?: Term): void;
    // toRdfjsDataset(): DatasetRdfjs;
}

export interface WithBaseUri {
    getBaseUri(): NamedNode;
    setBaseUri(baseUri: NamedNode | string): void;
}

export type LoggingLevel = 'INFO' | 'WARN' | 'ERROR';
export type LoggingEntryCallback = (logEntry: LoggingEntry) => void;

export interface WithLogging {
    log(level: LoggingLevel, message: string, code?: number, subject?: Term): void;
    enableLogging(level?: LoggingLevel): void;
    disableLogging(): void;
    setLoggingLevel(level: LoggingLevel): void;
    isLoggingEnabled(): boolean;
    getLoggingLevel(): LoggingLevel;
    registerEntryCallback(callback: LoggingEntryCallback): void;
    unregisterEntryCallback(callback: LoggingEntryCallback): void;
}

export interface LoggingEntry {
    level: LoggingLevel;
    subject?: Term;
    code?: number;
    message: string;
}

export type QuadIterableSemantizer = Iterable<Quad> & WithSemantizer & WithBaseUri;

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