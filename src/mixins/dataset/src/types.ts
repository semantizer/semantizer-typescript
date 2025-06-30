import { BlankNode, Countable, DatasetLoadOptions, DatasetQuadStreamOptions, DatasetSemantizer, DefaultGraph, Literal, MixinConstructor, MixinFactoryFunction, NamedNode, Quad, Quad_Graph, Quad_Object, Quad_Predicate, Quad_Subject, QuadGraph, QuadPredicate, QuadSubject, Resource, Stream, Term } from "@semantizer/types";

export type Dataset = DatasetSemantizer<DatasetMixinNamespace>;
export type DatasetMixinNamespace = { dataset: DatasetMixinOperations };

export interface DatasetMixinOperations extends Countable {
    hasNamedGraph(): boolean;
    countNamedGraph(): number;

    getDefaultGraph(): DatasetSemantizer;
    getDefaultGraphTerm(): DefaultGraph;
    getNamedGraph(namedGraph: QuadSubject): DatasetSemantizer | undefined;
    getNamedGraphAll(namedGraph: QuadSubject): DatasetSemantizer[];

    /**
     * 
     * @param namedGraph Default is DefaultGraph
     */
    getRdfTypeAll(namedGraph?: NamedNode): NamedNode[];
    isDefaultGraphRdfTypeOf(rdfType: NamedNode, ...otherTypes: NamedNode[]): boolean;

    isDefaultGraphEmpty(): boolean;
    isNamedGraphEmpty(namedGraph: NamedNode): boolean;

    getSubGraph(subject: QuadSubject, parentGraph: QuadGraph): DatasetSemantizer | undefined;
    getSubGraphAll(parentGraph: QuadGraph): DatasetSemantizer[];

    /**
     * Returns the literal matching the given thing, predicate, language and graph or undefined if nothing is found.
     * By default search into all the graphs of the dataset. Pass a DefaultGraph to search only into the default graph.
     * @param thing 
     * @param predicate 
     * @param language 
     * @param graph The search to search for literal into. Default is all graphs of the dataset.
     */
    // getLiteral(thing: Resource | DefaultGraph | undefined, predicate: Resource, graph?: NamedNode | DefaultGraph, language?: string): Literal | undefined;
    // getLiteralAll(thing: Resource | DefaultGraph | undefined, predicate: Resource, graph?: NamedNode | DefaultGraph, language?: string): Literal[];

    /**
     * This method will try to transform any subject or object URI of this dataset that is absolute into a relative one using 
     * the `baseUrl` base URI or the dataset origin URI (default). The modification affects the current dataset.
     * 
     * This is especially useful if you have a document that use relative paths. Calling this method before to make a PUT request will avoid to 
     * erase the relative URIs of the origin document. Some RDF serialisations like Turtle implies that all the parsed URIs from a document will 
     * resolve to absolute URIs.
     * 
     * @param baseUri The base URI to compute the relative URIs from. If not present, the dataset will try to use its origin.
     * @throws {Error} If the `baseUri` and the document origin are not defined.
     */
    transformAllSubjectAndObjectAbsoluteUrisToRelativeUris(baseUri?: string): void;

    /**
     * 
     * @param callbackfn 
     * @param namedGraph Default is DefaultGraph
     */
    forEachSubGraph(callbackfn: (value: DatasetSemantizer, index?: number, array?: DatasetSemantizer[]) => Promise<void>, graph?: QuadGraph | null): Promise<void>;

    load(resource?: string | DatasetSemantizer | NamedNode, options?: DatasetLoadOptions): Promise<void>;
    loadQuadStream(resource?: string | DatasetSemantizer | NamedNode, options?: DatasetQuadStreamOptions): Promise<Stream<Quad>>;

    loadObjectLinked<TBase extends MixinConstructor, TMixin extends DatasetSemantizer>(subject: Quad_Subject | undefined, mixinFactoryFunction: MixinFactoryFunction<TBase, TMixin>): Promise<TMixin | undefined>;

    getObject(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): Quad_Object | undefined;
    getObjectLiteral(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): Literal | undefined;
    getObjectLinked(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): Quad_Subject | undefined;
    getObjectUri(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): NamedNode | undefined;
    getObjectBoolean(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): boolean | undefined;
    getObjectDate(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): Date | undefined;
    getObjectDatetime(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): Date | undefined;
    getObjectDecimal(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): number | undefined;
    getObjectInteger(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): number | undefined;
    getObjectStringEnglish(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): string | undefined;
    getObjectStringNoLocale(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): string | undefined;
    getObjectStringWithLocale(subject: QuadSubject | null, predicate: QuadPredicate | null, locale: string, graph?: QuadGraph | null): string | undefined;
    getObjectTime(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): Date | undefined;

    getObjectAll(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): Quad_Object[] | undefined;
    getObjectLiteralAll(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): Literal[] | undefined;
    getObjectLinkedAll(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): Quad_Subject[] | undefined
    getObjectUriAll(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): NamedNode[] | undefined;
    getObjectBooleanAll(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): boolean[] | undefined;
    getObjectDateAll(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): Date[] | undefined;
    getObjectDatetimeAll(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): Date[] | undefined;
    getObjectDecimalAll(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): number[] | undefined;
    getObjectIntegerAll(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): number[] | undefined;
    getObjectStringEnglishAll(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): string[] | undefined;
    getObjectStringNoLocaleAll(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): string[] | undefined;
    getObjectStringWithLocaleAll(subject: QuadSubject | null, predicate: QuadPredicate | null, locale: string, graph?: QuadGraph | null): string[] | undefined;
    getObjectTimeAll(subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): Date[] | undefined;

    addObjectUri(subject: QuadSubject, predicate: QuadPredicate, value: NamedNode | string, graph?: QuadGraph | null): void;
    addObjectLinked(subject: QuadSubject, predicate: QuadPredicate, value: Quad_Subject | string, graph?: QuadGraph | null): void;
    addObjectUriOrBlankNode(subject: QuadSubject, predicate: QuadPredicate, value: NamedNode | string | BlankNode, graph?: QuadGraph | null): void;
    addObjectBlankNode(subject: QuadSubject, predicate: QuadPredicate, blankNode: BlankNode, graph?: QuadGraph | null): void;
    addObjectBlankNodeEmpty(subject: QuadSubject, predicate: QuadPredicate, blankNodeName: string, graph?: QuadGraph | null): BlankNode;
    addObjectBoolean(subject: QuadSubject, predicate: QuadPredicate, value: boolean, graph?: QuadGraph | null): void;
    addObjectDate(subject: QuadSubject, predicate: QuadPredicate, value: Date, graph?: QuadGraph | null): void;
    addObjectDatetime(subject: QuadSubject, predicate: QuadPredicate, value: Date, graph?: QuadGraph | null): void;
    addObjectDecimal(subject: QuadSubject, predicate: QuadPredicate, value: number, graph?: QuadGraph | null): void;
    addObjectInteger(subject: QuadSubject, predicate: QuadPredicate, value: number, graph?: QuadGraph | null): void;
    addObjectStringEnglish(subject: QuadSubject, predicate: QuadPredicate, value: string, graph?: QuadGraph | null): void;
    addObjectStringNoLocale(subject: QuadSubject, predicate: QuadPredicate, value: string, graph?: QuadGraph | null): void;
    addObjectStringWithLocale(subject: QuadSubject, predicate: QuadPredicate, value: string, locale: string, graph?: QuadGraph | null): void;
    addObjectTime(subject: QuadSubject, predicate: QuadPredicate, value: Date, graph?: QuadGraph | null): void;

    deleteObjectStringNoLocale(subject: QuadSubject, predicate: QuadPredicate, value: string, graph?: QuadGraph | null): void;
    deleteObjectUri(subject: QuadSubject, predicate: QuadPredicate, value: string | NamedNode, graph?: QuadGraph | null): void;
    deleteObjectDatetime(subject: QuadSubject, predicate: QuadPredicate, value: Date, graph?: QuadGraph | null): void;
    deleteObjectDecimal(subject: QuadSubject, predicate: QuadPredicate, value: number, graph?: QuadGraph | null): void;
    deleteObjectInteger(subject: QuadSubject, predicate: QuadPredicate, value: number, graph?: QuadGraph | null): void;
    deleteObjectBoolean(subject: QuadSubject, predicate: QuadPredicate, value: boolean, graph?: QuadGraph | null): void;
    deleteObjectLinked(subject: QuadSubject, predicate: QuadPredicate, value: Quad_Subject | string, graph?: QuadGraph | null): void;

    setObjectStringNoLocale(subject: QuadSubject, predicate: QuadPredicate, newValue: string | undefined, oldValue?: string, graph?: QuadGraph | null): void;
    setObjectUri(subject: QuadSubject, predicate: QuadPredicate, newValue: string | NamedNode | undefined, oldValue?: string | NamedNode, graph?: QuadGraph | null): void;
    setObjectLinked(subject: QuadSubject, predicate: QuadPredicate, newValue: Quad_Subject | string | undefined, oldValue?: Quad_Subject | string, graph?: QuadGraph | null): void;
    setObjectDatetime(subject: QuadSubject, predicate: QuadPredicate, newValue: Date | undefined, oldValue?: Date, graph?: QuadGraph | null): void;
    setObjectDecimal(subject: QuadSubject, predicate: QuadPredicate, newValue: number | undefined, oldValue?: number, graph?: QuadGraph | null): void;
    setObjectInteger(subject: QuadSubject, predicate: QuadPredicate, newValue: number | undefined, oldValue?: number, graph?: QuadGraph | null): void;
    setObjectBoolean(subject: QuadSubject, predicate: QuadPredicate, newValue: boolean | undefined, oldValue?: boolean, graph?: QuadGraph | null): void;

    setObjectStringNoLocaleAll(subject: QuadSubject, predicate: QuadPredicate, newValues: string[] | undefined, graph?: QuadGraph | null): void;
    setObjectUriAll(subject: QuadSubject, predicate: QuadPredicate, newValues: string[] | NamedNode[] | undefined, graph?: QuadGraph | null): void;
    setObjectDecimalAll(subject: QuadSubject, predicate: QuadPredicate, newValues: number[] | undefined, graph?: QuadGraph | null): void;
}