import { BlankNode, Countable, DatasetLoadOptions, DatasetQuadStreamOptions, DatasetSemantizer, DefaultGraph, Literal, NamedNode, Quad, Quad_Graph, Quad_Predicate, Quad_Subject, Resource, Stream, Term } from "@semantizer/types";

export type Dataset = DatasetSemantizer<DatasetMixinNamespace>;
export type DatasetMixinNamespace = { dataset: DatasetMixinOperations };

export interface DatasetMixinOperations extends Countable {
    hasNamedGraph(): boolean;
    countNamedGraph(): number;

    getDefaultGraph(): DatasetSemantizer;
    getDefaultGraphTerm(): DefaultGraph;
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

    getSubGraph(subject: NamedNode | BlankNode | string, parentGraph: NamedNode | DefaultGraph): DatasetSemantizer | undefined;
    getSubGraphAll(parentGraph: NamedNode | DefaultGraph | string): DatasetSemantizer[];

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
    forEachSubGraph(callbackfn: (value: DatasetSemantizer, index?: number, array?: DatasetSemantizer[]) => Promise<void>, graph?: NamedNode | DefaultGraph): Promise<void>;

    load(resource?: string | DatasetSemantizer | NamedNode, options?: DatasetLoadOptions): Promise<void>;
    loadQuadStream(resource?: string | DatasetSemantizer | NamedNode, options?: DatasetQuadStreamOptions): Promise<Stream<Quad>>;

    getObjectLinked(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): NamedNode | BlankNode | undefined;
    getObjectUri(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): NamedNode | undefined;
    getObjectBoolean(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): boolean | undefined;
    getObjectDate(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Date | undefined;
    getObjectDatetime(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Date | undefined;
    getObjectDecimal(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): number | undefined;
    getObjectInteger(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): number | undefined;
    getObjectStringEnglish(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): string | undefined;
    getObjectStringNoLocale(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): string | undefined;
    getObjectStringWithLocale(subject: Term | string | null, predicate: Term | string | null, locale: string, graph?: Term | string | null): string | undefined;
    getObjectTime(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Date | undefined;

    getObjectLinkedAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Term[] | undefined
    getObjectUriAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): NamedNode[] | undefined;
    getObjectBooleanAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): boolean[] | undefined;
    getObjectDateAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Date[] | undefined;
    getObjectDatetimeAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Date[] | undefined;
    getObjectDecimalAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): number[] | undefined;
    getObjectIntegerAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): number[] | undefined;
    getObjectStringEnglishAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): string[] | undefined;
    getObjectStringNoLocaleAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): string[] | undefined;
    getObjectStringWithLocaleAll(subject: Term | string | null, predicate: Term | string | null, locale: string, graph?: Term | string | null): string[] | undefined;
    getObjectTimeAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Date[] | undefined;

    addObjectUri(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: NamedNode | string, graph?: Quad_Graph | string): void;
    addObjectBlankNode(subject: Quad_Subject | string, predicate: Quad_Predicate | string, blankNode: BlankNode, graph?: Quad_Graph | string): void;
    addObjectBlankNodeEmpty(subject: Quad_Subject | string, predicate: Quad_Predicate | string, blankNodeName: string, graph?: Quad_Graph | string): BlankNode;
    addObjectBoolean(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: string, graph?: Quad_Graph | string): void;
    addObjectDate(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: Date, graph?: Quad_Graph | string): void;
    addObjectDatetime(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: Date, graph?: Quad_Graph | string): void;
    addObjectDecimal(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: number, graph?: Quad_Graph | string): void;
    addObjectInteger(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: number, graph?: Quad_Graph | string): void;
    addObjectStringEnglish(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: string, graph?: Quad_Graph | string): void;
    addObjectStringNoLocale(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: string, graph?: Quad_Graph | string): void;
    addObjectStringWithLocale(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: string, locale: string, graph?: Quad_Graph | string): void;
    addObjectTime(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: Date, graph?: Quad_Graph | string): void;

    deleteObjectStringNoLocale(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: string, graph?: Quad_Graph | string): void;
    deleteObjectUri(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: string | NamedNode, graph?: Quad_Graph | string): void;
    deleteObjectDecimal(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: number, graph?: Quad_Graph | string): void;

    setObjectStringNoLocale(subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValue: string | undefined, oldValue?: string, graph?: Quad_Graph | string): void;
    setObjectUri(subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValue: string | NamedNode | undefined, oldValue?: string | NamedNode, graph?: Quad_Graph | string): void;
    setObjectDecimal(subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValue: number | undefined, oldValue?: number, graph?: Quad_Graph | string): void;

    setObjectStringNoLocaleAll(subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValues: string[] | undefined, graph?: Quad_Graph | string): void;
    setObjectUriAll(subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValues: string[] | NamedNode[] | undefined, graph?: Quad_Graph | string): void;
    setObjectDecimalAll(subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValues: number[] | undefined, graph?: Quad_Graph | string): void;
}