import { BlankNode, Dataset as DatasetRdfjs, DefaultGraph, Term, Literal, NamedNode, Quad, Stream } from "@rdfjs/types";
import { Countable, QuadIterableSemantizer, Resource, WithOrigin, WithSemantizer } from './Common';
import { Semantizer } from "./Semantizer";
import { Loader, LoaderQuadStream } from "./Loader";

// = RDFJS dataset
export interface Dataset extends DatasetRdfjs, Countable {
    // addQuad(subject, predicate, object, graph?): void; // graph default is set to DefaultGraph
    hasNamedGraph(): boolean;
    countNamedGraph(): number;

    getDefaultGraph(): DatasetSemantizer;
    getNamedGraph(namedGraph: NamedNode): DatasetSemantizer | undefined;
    getNamedGraphAll(namedGraph: NamedNode): DatasetSemantizer[];

    /**
     * 
     * @param namedGraph Default is DefaultGraph
     */
    getRdfTypeAll(namedGraph?: NamedNode): NamedNode[];
    isDefaultGraphRdfTypeOf(rdfType: NamedNode, ...otherTypes: NamedNode[]): boolean;

    isDefaultGraphEmpty(): boolean;
    isNamedGraphEmpty(namedGraph: NamedNode): boolean;

    getSubGraph(subject: NamedNode | BlankNode, namedGraph?: NamedNode): DatasetSemantizer | undefined;
    getSubGraphAll(namedGraph?: NamedNode): DatasetSemantizer[];

    // getBlankNode(name: string): BlankNode | undefined;

    /**
     * Returns the literal matching the given thing, predicate, language and graph or undefined if nothing is found.
     * By default search into all the graphs of the dataset. Pass a DefaultGraph to search only into the default graph.
     * @param thing 
     * @param predicate 
     * @param language 
     * @param graph The search to search for literal into. Default is all graphs of the dataset.
     */
    getLiteral(thing: Resource | DefaultGraph | undefined, predicate: Resource, graph?: NamedNode | DefaultGraph, language?: string): Literal | undefined;
    getLiteralAll(thing: Resource | DefaultGraph | undefined, predicate: Resource, graph?: NamedNode | DefaultGraph, language?: string): Literal[];

    addLinkedObject(thing: Resource, predicate: NamedNode, object: Resource): void;
    getLinkedObject(predicate: Resource, thingOrDataset?: Resource | DatasetSemantizer, graph?: NamedNode | DefaultGraph): DatasetSemantizer | undefined;
    // getObject(predicate: Resource, thing?: Resource, graph?: NamedNode): DatasetWithOrigin | undefined;
    getLinkedObjectAll(predicate: Resource, thingOrDataset?: Resource | DatasetSemantizer, graph?: NamedNode | DefaultGraph): DatasetSemantizer[];

    /**
     * 
     * @param callbackfn 
     * @param namedGraph Default is DefaultGraph
     */
    forEachSubGraph(callbackfn: (value: DatasetSemantizer, index?: number, array?: DatasetSemantizer[]) => Promise<void>, graph?: NamedNode | DefaultGraph): Promise<void>;

    load(resource?: string | DatasetSemantizer | NamedNode, options?: DatasetLoadOptions): Promise<void>;
    loadQuadStream(resource?: string | DatasetSemantizer | NamedNode, options?: DatasetQuadStreamOptions): Promise<Stream<Quad>>;

    addObjectUri(subject: NamedNode | BlankNode, predicate: NamedNode, value: NamedNode, graph?: NamedNode): void;
    addObjectBoolean(subject: NamedNode | BlankNode, predicate: NamedNode, value: string, graph?: NamedNode): void;
    addObjectDate(subject: NamedNode | BlankNode, predicate: NamedNode, value: Date, graph?: NamedNode): void;
    addObjectDatetime(subject: NamedNode | BlankNode, predicate: NamedNode, value: Date, graph?: NamedNode): void;
    addObjectDecimal(subject: NamedNode | BlankNode, predicate: NamedNode, value: number, graph?: NamedNode): void;
    addObjectInteger(subject: NamedNode, predicate: NamedNode, value: number, graph?: NamedNode): void;
    addObjectStringEnglish(subject: NamedNode | BlankNode, predicate: NamedNode, value: string, graph?: NamedNode): void;
    addObjectStringNoLocale(subject: NamedNode, predicate: NamedNode, value: string, graph?: NamedNode): void;
    addObjectStringWithLocale(subject: NamedNode | BlankNode, predicate: NamedNode, value: string, locale: string, graph?: NamedNode): void;
    addObjectTime(subject: NamedNode | BlankNode, predicate: NamedNode, value: Date, graph?: NamedNode): void;

    getObjectLinked(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): NamedNode | BlankNode | undefined;
    getObjectUri(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): NamedNode | undefined;
    getObjectBoolean(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): boolean | undefined;
    getObjectDate(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): Date | undefined;
    getObjectDatetime(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): Date | undefined;
    getObjectDecimal(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): number | undefined;
    getObjectInteger(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): number | undefined;
    getObjectStringEnglish(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): string | undefined;
    getObjectStringNoLocale(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): string | undefined;
    getObjectStringWithLocale(subject: NamedNode | BlankNode, predicate: NamedNode, locale: string, graph?: NamedNode): string | undefined;
    getObjectTime(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): Date | undefined;

    getObjectLinkedAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): Term[] | undefined
    getObjectUriAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): NamedNode[] | undefined;
    getObjectBooleanAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): boolean[] | undefined;
    getObjectDateAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): Date[] | undefined;
    getObjectDatetimeAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): Date[] | undefined;
    getObjectDecimalAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): number[] | undefined;
    getObjectIntegerAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): number[] | undefined;
    getObjectStringEnglishAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): string[] | undefined;
    getObjectStringNoLocaleAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): string[] | undefined;
    getObjectStringWithLocaleAll(subject: NamedNode | BlankNode, predicate: NamedNode, locale: string, graph?: NamedNode): string[] | undefined;
    getObjectTimeAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): Date[] | undefined;
}

// export interface Graph extends DatasetRdfjs {
//     count(): number;
//     isEmpty(): boolean;

//     getSubGraph(subject: NamedNode | BlankNode): GraphSemantizer | undefined;
//     getSubGraphAll(): GraphSemantizer[];

//     getLiteral(thing: Resource, predicate: Resource, language?: string): Literal | undefined;
//     getLiteralAll(thing: Resource, predicate: Resource, language?: string): Literal[];

//     getLinkedObject(predicate: Resource, thing?: Resource): DatasetSemantizer | undefined;
//     getLinkedObjectAll(predicate: Resource, thing?: Resource): DatasetSemantizer[];

//     forEachThing(callbackfn: (value: GraphSemantizer, index?: number, array?: GraphSemantizer[]) => void): void;

//     load(resource?: string | DatasetSemantizer | NamedNode, options?: DatasetLoadOptions): Promise<void>;
// }

// export interface NamedGraph extends Graph {
//     getGraphName(): NamedNode | BlankNode;
//     getGraph(): GraphSemantizer;
// }


export type DatasetSemantizer = Dataset & WithSemantizer & WithOrigin;

// export type GraphSemantizer = Graph & WithSemantizer & WithOrigin;
// export type NamedGraphSemantizer = NamedGraph & WithSemantizer & WithOrigin;

export type DatasetSemantizerMixinConstructor = new (...args: any[]) => DatasetSemantizer;
export type DatasetSemantizerRdfjsMixinConstructor = new(...args: any[]) => DatasetRdfjs & WithSemantizer & WithOrigin;

export interface DatasetLoadOptions {
    loader?: Loader
}

export interface DatasetQuadStreamOptions {
    quadStreamLoader?: LoaderQuadStream;
}

export interface DatasetBaseFactory {
    load(semantizer: Semantizer, resource: string): Promise<DatasetSemantizer>;
    build(semantizer: Semantizer, sourceDataset?: QuadIterableSemantizer): DatasetSemantizer;
}