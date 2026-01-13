import { BlankNode, NamedNode, Quad, Quad_Graph, Quad_Predicate, Quad_Subject, Term } from "@rdfjs/types";
import { Semantizer } from "./Semantizer";

export type Resource = NamedNode | BlankNode;

export type QuadSubject = Quad_Subject | string;
export type QuadPredicate = Quad_Predicate | string;
export type QuadGraph = Quad_Graph | string;

export interface WithMixins<T extends object = {}> {
    mixins: T;
}

export interface WithSemantizer extends WithLogging {
    getSemantizer(): Semantizer;
    setSemantizer(semantizer: Semantizer): void;
}

export interface WithBaseUri {
    getBaseUri(): Quad_Subject;
    setBaseUri(baseUri: QuadSubject): void;
}

export type LoggingLevel = 'INFO' | 'WARN' | 'ERROR';
export type LoggingEntryCallback = (logEntry: LoggingEntry) => void;
export type LoggingComponentType = 'PACKAGE' | 'MIXIN' | 'UTIL';

export interface LoggingComponent {
    type: LoggingComponentType;
    name: string;
}

export interface WithLoggingOptions {
    source?: string;
    instance?: string;
    code?: number;
    subject?: Term;
}

export interface WithLogging {
    getLoggingComponent(): LoggingComponent;
    log(level: LoggingLevel, message: string, options?: WithLoggingOptions): void;
    logInfo(message: string, options?: WithLoggingOptions): void;
    logWarning(message: string, options?: WithLoggingOptions): void;
    logError(message: string, options?: WithLoggingOptions): void;
}

export interface LoggingEntry {
    component: LoggingComponent;
    source?: string;
    instance?: string;
    date: Date;
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