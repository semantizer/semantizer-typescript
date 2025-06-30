import { BlankNode, DatasetLoadOptions, DatasetQuadStreamOptions, DatasetRdfjs, DatasetSemantizer, DatasetSemantizerConstructor, DefaultGraph, Literal, NamedNode, Quad, Quad_Graph, Quad_Object, Quad_Predicate, Quad_Subject, Resource, Semantizer, Stream, Term, WithMixins, MixinConstructor, MixinFactoryFunction, QuadSubject, QuadPredicate, QuadGraph } from '@semantizer/types';
import { Dataset, DatasetMixinNamespace, DatasetMixinOperations } from './types.js';
import { getRelativeUrl, getTermsFromQuadSubjectPredicateAndGraph, getTermsFromTermOrStringOrNull, isUrlAbsolute } from './utils.js';

export function DatasetMixin<
    TMixins extends object,
    TBase extends DatasetSemantizerConstructor<TMixins>
>(Base: TBase) {

    return class DatasetMixinImpl extends Base implements WithMixins<TMixins & DatasetMixinNamespace> {

        public get mixins(): TMixins & DatasetMixinNamespace {
            const parentMixins = super.mixins as TMixins & Partial<{ dataset: Partial<DatasetMixinOperations> }>;

            return {
                ...parentMixins,
                dataset: {
                    ...(parentMixins.dataset ?? {}),

                    loadObjectLinked: async <TBase extends MixinConstructor, TMixin extends DatasetSemantizer>(subject: Quad_Subject | undefined, mixinFactoryFunction: MixinFactoryFunction<TBase, TMixin>): Promise<TMixin | undefined> => {
                        if (subject) {
                            if (subject.termType === 'BlankNode') {
                                throw new Error("Not implemented");
                            }
                            if (subject.termType === 'NamedNode') {
                                return this.getSemantizer().load(subject, mixinFactoryFunction);
                            }
                            throw new Error();
                        } else return undefined;
                    },

                    transformAllSubjectAndObjectAbsoluteUrisToRelativeUris: (baseUri?: string): void => {
                        if (baseUri || (this.getBaseUri() && this.getBaseUri()!.value !== '')) {
                            const quadsToDelete: Quad[] = [];
                            const base = baseUri ?? this.getBaseUri()!.value;
                            const rdfFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();

                            const transformUrl = (url: NamedNode): NamedNode => rdfFactory.namedNode(getRelativeUrl(url.value, base));

                            for (const quad of this) {
                                const isQuadSubjectAnAbsoluteUrl = quad.subject.termType === 'NamedNode' && isUrlAbsolute(quad.subject.value);
                                const isQuadObjectAnAbsoluteUrl = quad.object.termType === 'NamedNode' && isUrlAbsolute(quad.object.value);
                                const isQuadPredicateRdfType = quad.predicate.termType === 'NamedNode' && quad.predicate.equals(rdfFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'));

                                if (isQuadSubjectAnAbsoluteUrl || isQuadObjectAnAbsoluteUrl) {
                                    quadsToDelete.push(quad);
                                    const newSubject = isQuadSubjectAnAbsoluteUrl ? transformUrl(quad.subject as NamedNode) : quad.subject;
                                    const newObject = !isQuadPredicateRdfType && isQuadObjectAnAbsoluteUrl ? transformUrl(quad.object as NamedNode) : quad.object;
                                    this.add(rdfFactory.quad(newSubject, quad.predicate, newObject));
                                }
                            }

                            quadsToDelete.forEach(quadsToDelete => this.delete(quadsToDelete));
                        } else throw new Error("The dataset has no origin.");
                    },

                    // TODO: check matchedQuad type (BlankNode type?)?
                    getRdfTypeAll: (namedGraph?: NamedNode): NamedNode[] => {
                        const results: NamedNode[] = [];

                        const subject = namedGraph ? namedGraph : this.getBaseUri();
                        const predicate = this.getSemantizer().getConfiguration().getRdfDataModelFactory().namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
                        const graph = namedGraph ? namedGraph : this.getSemantizer().getConfiguration().getRdfDataModelFactory().defaultGraph();

                        if (subject) {
                            for (const matchedQuad of this.match(subject, predicate, undefined, graph)) {
                                results.push(matchedQuad.object as NamedNode);
                            }
                        }

                        return results;
                    },

                    isDefaultGraphRdfTypeOf: (rdfType: NamedNode, ...otherTypes: NamedNode[]): boolean => {
                        const thisTypes = this.mixins.dataset.getRdfTypeAll().map(t => t.value);
                        for (const type of [rdfType, ...otherTypes]) {
                            if (!thisTypes.includes(type.value)) {
                                return false;
                            }
                        }
                        return true;
                    },

                    getNamedGraphAll: (namedGraph: QuadSubject): DatasetSemantizer[] => {
                        throw new Error('Method not implemented.');
                    },

                    count: (): number => {
                        return this.size;
                    },

                    isEmpty: (): boolean => {
                        return this.size === 0;
                    },

                    hasNamedGraph: (): boolean => {
                        for (const quad of this) {
                            if (quad.graph) {
                                return true;
                            }
                        }
                        return false;
                    },

                    countNamedGraph: (): number => {
                        throw new Error('Method not implemented.');
                    },

                    getNamedGraph: (namedGraph: QuadSubject): DatasetSemantizer | undefined => {
                        const matchedDataset = this.matchDatasetSemantizerWithLinkedObjects(namedGraph);
                        if (matchedDataset.size <= 0) {
                            return undefined
                        } else {
                            matchedDataset.setBaseUri(namedGraph);
                            return matchedDataset;
                        }
                    },

                    getDefaultGraph: (): DatasetSemantizer => {
                        const defaultGraph = this.getSemantizer().getConfiguration().getRdfDataModelFactory().defaultGraph();
                        const dataset = this.matchDatasetSemantizerWithLinkedObjects(undefined, undefined, undefined, defaultGraph);
                        if (!this.getBaseUri()) {
                            console.warn("Can't set the document origin of the default graph.");
                        }
                        dataset.setBaseUri(this.getBaseUri()!);
                        return dataset;
                    },

                    getDefaultGraphTerm: (): DefaultGraph => {
                        const rdfFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        return rdfFactory.defaultGraph();
                    },

                    isDefaultGraphEmpty: (): boolean => {
                        throw new Error('Method not implemented.');
                    },

                    isNamedGraphEmpty: (namedGraph: NamedNode): boolean => {
                        throw new Error('Method not implemented.');
                    },

                    getSubGraph: (subject: QuadSubject, parentGraph: QuadGraph): DatasetSemantizer | undefined => {
                        const targetParentGraph = typeof parentGraph === 'string' ? this.getSemantizer().createNamedNode(parentGraph) : parentGraph;
                        const termSubject = typeof subject === 'string' ? this.getSemantizer().getConfiguration().getRdfDataModelFactory().namedNode(subject) : subject;
                        const datasetRdfjs = this.matchDatasetSemantizerWithLinkedObjects(termSubject, undefined, undefined, targetParentGraph);
                        const dataset = this.getSemantizer().build();
                        return dataset.addAll(datasetRdfjs);
                    },

                    getSubGraphAll: (parentGraph: QuadGraph): DatasetSemantizer[] => {
                        throw new Error('Method not implemented.');
                    },

                    // getLiteral: (thing: Resource | DefaultGraph | undefined, predicate: Resource, graph: QuadGraph | null, language?: string): Literal | undefined => {
                    //     const targetGraph = typeof graph === 'string' ? this.getSemantizer().createNamedNode(graph) : graph;
                    //     const literal = this.match(thing, predicate, targetGraph);
                    //     for (const q of literal) {
                    //         if (q.object.termType === "Literal")
                    //             return q.object;
                    //     }
                    //     return undefined;
                    // },

                    getObjectLiteral: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): Literal | undefined => {
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromTermOrStringOrNull(this.getSemantizer(), subject, predicate, graph);
                        const literal = this.match(subjectTerm, predicateTerm, graphTerm);
                        for (const q of literal) {
                            if (q.object.termType === "Literal")
                                return q.object;
                        }
                        return undefined;
                    },

                    // getLiteralAll: (thing: Resource | DefaultGraph | undefined, predicate: Resource, graph: QuadGraph | null, language?: string): Literal[] => {
                    //     throw new Error('Method not implemented.');
                    // },

                    getObjectLiteralAll: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): Literal[] | undefined => {
                        throw new Error('Method not implemented.');
                    },

                    loadQuadStream: async (resource?: string | DatasetSemantizer | NamedNode, options?: DatasetQuadStreamOptions): Promise<Stream<Quad>> => {
                        resource = resource ? resource : this;
                        const resourceUri = this.getUriOfResource(resource);
                        const loader = options?.quadStreamLoader ? options.quadStreamLoader : this.getSemantizer().getConfiguration().getLoaderQuadStream();
                        return loader.load(resourceUri);
                    },

                    // TODO: include related blank node into returned dataset
                    forEachSubGraph: async (callbackfn: (value: DatasetSemantizer, index?: number, array?: DatasetSemantizer[]) => Promise<void>, graph: QuadGraph | null): Promise<void> => {
                        let index = 0;
                        const subjects: string[] = [];

                        const processGraph = async (graphDataset: DatasetSemantizer) => {
                            for (const quad of graphDataset) {
                                if (quad.subject.termType === 'NamedNode') {
                                    if (!subjects.includes(quad.subject.value)) {
                                        subjects.push(quad.subject.value); // mark quad as "already treated"
                                        const thing = this.mixins.dataset.getNamedGraph(quad.subject);
                                        if (thing) {
                                            await callbackfn(thing, index);
                                        }
                                    }
                                    index++;
                                }
                            }
                        }

                        if (graph) {
                            const targetGraph = typeof graph === 'string' ? this.getSemantizer().createNamedNode(graph) : graph;
                            const graphDataset = targetGraph.termType === 'DefaultGraph' ? this.mixins.dataset.getDefaultGraph() : this.mixins.dataset.getNamedGraph(targetGraph);
                            if (graphDataset) {
                                await processGraph(graphDataset);
                            }
                        }

                        else {
                            for (const quad of this) {
                                if (quad.subject.termType === 'NamedNode') {
                                    const graphDataset = this.mixins.dataset.getNamedGraph(quad.subject);
                                    if (graphDataset) {
                                        await processGraph(graphDataset);
                                    }
                                }
                            }
                        }
                    },

                    /**
                     * 
                     * @param resource 
                     * @param options 
                     */
                    load: async (resource?: string | DatasetSemantizer | NamedNode, options?: DatasetLoadOptions): Promise<void> => {
                        resource = resource ? resource : this;
                        if (typeof resource !== 'string' && 'getBaseUri' in resource && resource.getBaseUri()?.termType === 'NamedNode') { // if the resource to load is a NamedNode (and not a BlankNode which are already loaded)
                            const loader = options && options.loader ? options.loader : this.getSemantizer().getConfiguration().getLoader();
                            const resourceUri = this.getUriOfResource(resource);
                            const resourceNamedNode = this.getSemantizer().getConfiguration().getRdfDataModelFactory().namedNode(resourceUri);
                            const startTime = new Date();
                            const loaded = await loader.load(resourceUri);
                            const loadingTime = (new Date().getTime() - startTime.getTime()) / 1000;
                            console.log("HTTP loading done in ", loadingTime.toString(), "sec.");
                            console.log("Start loading in memory of " + resourceUri + "...");
                            for (const quad of loaded) {
                                if (this.getBaseUri() && this.getBaseUri()?.value !== resourceUri) { // load in default graph
                                    quad.graph = resourceNamedNode;
                                }
                                this.add(quad);
                            }
                            const elapsedTime = (new Date().getTime() - startTime.getTime()) / 1000;
                            console.log("Finished loading in memory in " + elapsedTime.toString() + "sec of " + resourceUri);
                        }
                    },

                    addObjectUri: (subject: QuadSubject, predicate: QuadPredicate , value: NamedNode | string, graph?: QuadGraph): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        const valueNamedNode = typeof value === 'string' ? dataFactory.namedNode(value) : value;
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, valueNamedNode, graphTerm));
                    },

                    addObjectLinked: (subject: QuadSubject, predicate: QuadPredicate , value: Term | string, graph?: QuadGraph): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        const quadObject: Quad_Object = typeof value === 'string' ? dataFactory.namedNode(value) : value as Quad_Object;
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, quadObject, graphTerm));
                    },

                    addObjectUriOrBlankNode: (subject: QuadSubject, predicate: QuadPredicate , value: NamedNode | string | BlankNode, graph?: QuadGraph): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        const valueNamedNode = typeof value === 'string' ? dataFactory.namedNode(value) : value;
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, valueNamedNode, graphTerm));
                    },

                    addObjectBlankNode: (subject: QuadSubject, predicate: QuadPredicate , blankNode: BlankNode, graph?: QuadGraph): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, blankNode, graphTerm));
                    },

                    addObjectBlankNodeEmpty: (subject: QuadSubject, predicate: QuadPredicate , blankNodeName: string, graph?: QuadGraph): BlankNode => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const blankNode = dataFactory.blankNode(blankNodeName);
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, blankNode, graphTerm));
                        return blankNode;
                    },

                    addObjectBoolean: (subject: QuadSubject, predicate: QuadPredicate , value: boolean, graph?: QuadGraph): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#boolean'));
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    addObjectDate: (subject: QuadSubject, predicate: QuadPredicate , value: Date, graph?: QuadGraph): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#date'));
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    addObjectDatetime: (subject: QuadSubject, predicate: QuadPredicate , value: Date, graph?: QuadGraph): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#datetime'));
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    addObjectDecimal: (subject: QuadSubject, predicate: QuadPredicate , value: number, graph?: QuadGraph): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#decimal'));
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    addObjectInteger: (subject: QuadSubject, predicate: QuadPredicate , value: number, graph?: QuadGraph): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#integer'));
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    addObjectStringEnglish: (subject: QuadSubject, predicate: QuadPredicate , value: string, graph?: QuadGraph): void => {
                        throw new Error("Method not implemented.");
                    },

                    addObjectStringNoLocale: (subject: QuadSubject, predicate: QuadPredicate , value: string, graph?: QuadGraph): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value);
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    addObjectStringWithLocale: (subject: QuadSubject, predicate: QuadPredicate , value: string, locale: string, graph?: QuadGraph): void => {
                        throw new Error("Method not implemented.");
                    },

                    addObjectTime: (subject: QuadSubject, predicate: QuadPredicate , value: Date, graph?: QuadGraph): void => {
                        throw new Error("Method not implemented.");
                    },

                    // TODO: don't call getObjectUriAll but call match directly or even better use the datasetCore internal attributes 
                    // to be faster.
                    getObjectUri: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): NamedNode | undefined => {
                        const results = this.mixins.dataset.getObjectUriAll(subject, predicate, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObjectBoolean: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): boolean | undefined => {
                        const results = this.mixins.dataset.getObjectBooleanAll(subject, predicate, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObjectDate: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): Date | undefined => {
                        const results = this.mixins.dataset.getObjectDateAll(subject, predicate, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObjectDatetime: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): Date | undefined => {
                        const results = this.mixins.dataset.getObjectDatetimeAll(subject, predicate, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObjectDecimal: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): number | undefined => {
                        const results = this.mixins.dataset.getObjectDecimalAll(subject, predicate, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObjectInteger: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): number | undefined => {
                        const results = this.mixins.dataset.getObjectIntegerAll(subject, predicate, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObjectStringEnglish: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): string | undefined => {
                        const results = this.mixins.dataset.getObjectStringEnglishAll(subject, predicate, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObjectStringNoLocale: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): string | undefined => {
                        const results = this.mixins.dataset.getObjectStringNoLocaleAll(subject, predicate, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObjectStringWithLocale: (subject: QuadSubject, predicate: QuadPredicate, locale: string, graph: QuadGraph | null | null): string | undefined => {
                        const results = this.mixins.dataset.getObjectStringWithLocaleAll(subject, predicate, locale, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObjectTime: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): Date | undefined => {
                        const results = this.mixins.dataset.getObjectTimeAll(subject, predicate, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObject: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): Quad_Object | undefined => {
                        const results = this.mixins.dataset.getObjectAll(subject, predicate, graph);
                        return (results && results.length > 0) ? results[0] : undefined;
                    },

                    getObjectAll: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph?: QuadGraph | null): Quad_Object[] | undefined => {
                        let results: Quad_Object[] | undefined = undefined;
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromTermOrStringOrNull(this.getSemantizer(), subject, predicate, graph);
                        const matched = this.match(subjectTerm, predicateTerm, null, graphTerm);
                        if (matched.size > 0) {
                            results = [];
                            for (const q of matched) {
                                results.push(q.object);
                            }
                        }
                        return results;
                    },

                    getObjectLinked: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): Quad_Subject | undefined => {
                        let result: NamedNode | BlankNode | undefined = undefined;
                        const results = this.mixins.dataset.getObjectLinkedAll(subject, predicate, graph);

                        if (results && results[0]) {
                            if (results[0].termType === 'NamedNode') {
                                result = (results[0] as NamedNode);
                            } else if (results[0].termType === 'BlankNode') {
                                result = (results[0] as BlankNode);
                            } else throw new Error();
                        }

                        return result;
                    },

                    getObjectLinkedAll: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): Quad_Subject[] | undefined => {
                        let results: Quad_Subject[] | undefined = undefined;
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromTermOrStringOrNull(this.getSemantizer(), subject, predicate, graph);
                        const matched = this.match(subjectTerm, predicateTerm, null, graphTerm);
                        if (matched.size > 0) {
                            results = [];
                            for (const q of matched) {
                                if (q.object.termType === "NamedNode" || q.object.termType === "BlankNode") {
                                    results.push(q.object);
                                } else {
                                    throw new Error("Invalid term type when getting object value.");
                                }
                            }
                        }
                        return results;
                    },

                    getObjectUriAll: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): NamedNode[] | undefined => {
                        let results: NamedNode[] | undefined = undefined;
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromTermOrStringOrNull(this.getSemantizer(), subject, predicate, graph);
                        const matched = this.match(subjectTerm, predicateTerm, null, graphTerm);
                        if (matched.size > 0) {
                            results = [];
                            for (const q of matched) {
                                if (q.object.termType === "NamedNode") {
                                    results.push(q.object);
                                } else {
                                    throw new Error("Invalid term type when getting object value.");
                                }
                            }
                        }
                        return results;
                    },

                    getObjectBooleanAll: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): boolean[] | undefined => {
                        const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#boolean'), (value: string) => Boolean(value), subject, predicate, graph);
                    },

                    getObjectDateAll: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): Date[] | undefined => {
                        const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#date'), (value: string) => new Date(value), subject, predicate, graph);
                    },

                    getObjectDatetimeAll: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): Date[] | undefined => {
                        throw new Error('Method not implemented.');
                    },

                    getObjectDecimalAll: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): number[] | undefined => {
                        const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#decimal'), (value: string) => Number.parseFloat(value), subject, predicate, graph);
                    },

                    getObjectIntegerAll: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): number[] | undefined => {
                        const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#integer'), (value: string) => Number.parseInt(value), subject, predicate, graph);
                    },

                    getObjectStringEnglishAll: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): string[] | undefined => {
                        throw new Error('Method not implemented.');
                    },

                    getObjectStringNoLocaleAll: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): string[] | undefined => {
                        const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#string'), (value: string) => value, subject, predicate, graph);
                    },

                    getObjectStringWithLocaleAll: (subject: QuadSubject, predicate: QuadPredicate, locale: string, graph: QuadGraph | null | null): string[] | undefined => {
                        throw new Error('Method not implemented.');
                    },

                    getObjectTimeAll: (subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): Date[] | undefined => {
                        throw new Error('Method not implemented.');
                    },

                    deleteObjectStringNoLocale: (subject: QuadSubject, predicate: QuadPredicate , value: string, graph?: QuadGraph): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value);
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.delete(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    deleteObjectUri: (subject: QuadSubject, predicate: QuadPredicate , value: string | NamedNode, graph?: QuadGraph): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const namedNode = typeof value === 'string' ? dataFactory.namedNode(value) : value;
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.delete(dataFactory.quad(subjectTerm, predicateTerm, namedNode, graphTerm));
                    },

                    deleteObjectDecimal: (subject: QuadSubject, predicate: QuadPredicate , value: number, graph?: QuadGraph): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString());
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.delete(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    deleteObjectInteger: (subject: QuadSubject, predicate: QuadPredicate , value: number, graph?: QuadGraph): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString());
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.delete(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    deleteObjectBoolean: (subject: QuadSubject, predicate: QuadPredicate , value: boolean, graph?: QuadGraph): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString());
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.delete(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    deleteObjectLinked: (subject: QuadSubject, predicate: QuadPredicate , value: Quad_Subject | string, graph?: QuadGraph): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const quadObject = typeof value === 'string' ? dataFactory.namedNode(value) : value as Quad_Object;
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.delete(dataFactory.quad(subjectTerm, predicateTerm, quadObject, graphTerm));
                    },

                    deleteObjectDatetime: (subject: QuadSubject, predicate: QuadPredicate , value: Date, graph?: QuadGraph): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString(), namedNode('http://www.w3.org/2001/XMLSchema#date'));
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.delete(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    setObjectDecimal: (subject: QuadSubject, predicate: QuadPredicate , newValue: number | undefined, oldValue?: number, graph?: QuadGraph): void => {
                        if (oldValue !== newValue) {
                            if (oldValue) {
                                this.mixins.dataset.deleteObjectDecimal(subject, predicate, oldValue, graph);
                            }
                            if (newValue) {
                                this.mixins.dataset.addObjectDecimal(subject, predicate, newValue, graph);
                            }
                        }
                    },

                    setObjectInteger: (subject: QuadSubject, predicate: QuadPredicate , newValue: number | undefined, oldValue?: number, graph?: QuadGraph): void => {
                        if (oldValue !== newValue) {
                            if (oldValue) {
                                this.mixins.dataset.deleteObjectInteger(subject, predicate, oldValue, graph);
                            }
                            if (newValue) {
                                this.mixins.dataset.addObjectInteger(subject, predicate, newValue, graph);
                            }
                        }
                    },

                    setObjectBoolean: (subject: QuadSubject, predicate: QuadPredicate , newValue: boolean | undefined, oldValue?: boolean, graph?: QuadGraph): void => {
                        if (oldValue !== newValue) {
                            if (oldValue) {
                                this.mixins.dataset.deleteObjectBoolean(subject, predicate, oldValue, graph);
                            }
                            if (newValue) {
                                this.mixins.dataset.addObjectBoolean(subject, predicate, newValue, graph);
                            }
                        }
                    },

                    setObjectStringNoLocale: (subject: QuadSubject, predicate: QuadPredicate , newValue: string | undefined, oldValue?: string, graph?: QuadGraph): void => {
                        if (oldValue !== newValue) {
                            if (oldValue) {
                                this.mixins.dataset.deleteObjectStringNoLocale(subject, predicate, oldValue, graph);
                            }
                            if (newValue) {
                                this.mixins.dataset.addObjectStringNoLocale(subject, predicate, newValue, graph);
                            }
                        }
                    },

                    setObjectUri: (subject: QuadSubject, predicate: QuadPredicate , newValue: string | NamedNode | undefined, oldValue?: string | NamedNode, graph?: QuadGraph): void => {
                        if (oldValue !== newValue) {
                            if (oldValue) {
                                this.mixins.dataset.deleteObjectUri(subject, predicate, oldValue, graph);
                            }
                            if (newValue) {
                                this.mixins.dataset.addObjectUri(subject, predicate, newValue, graph);
                            }
                        }
                    },

                    setObjectLinked: (subject: QuadSubject, predicate: QuadPredicate , newValue: Quad_Subject | string | undefined, oldValue?: Quad_Subject | string, graph?: QuadGraph): void => {
                        if (oldValue !== newValue) {
                            if (oldValue) {
                                this.mixins.dataset.deleteObjectLinked(subject, predicate, oldValue, graph);
                            }
                            if (newValue) {
                                this.mixins.dataset.addObjectLinked(subject, predicate, newValue, graph);
                            }
                        }
                    },

                    setObjectDatetime: (subject: QuadSubject, predicate: QuadPredicate , newValue: Date | undefined, oldValue?: Date, graph?: QuadGraph): void => {
                        if (oldValue !== newValue) {
                            if (oldValue) {
                                this.mixins.dataset.deleteObjectDatetime(subject, predicate, oldValue, graph);
                            }
                            if (newValue) {
                                this.mixins.dataset.addObjectDatetime(subject, predicate, newValue, graph);
                            }
                        }
                    },

                    setObjectStringNoLocaleAll: (subject: QuadSubject, predicate: QuadPredicate , newValues: string[] | undefined, graph?: QuadGraph): void => {
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.deleteMatches(subjectTerm, predicateTerm, undefined, graphTerm);
                        if (newValues) {
                            for (const newValue of newValues) {
                                this.mixins.dataset.addObjectStringNoLocale(subject, predicate, newValue, graph);
                            }
                        }
                    },

                    setObjectUriAll: (subject: QuadSubject, predicate: QuadPredicate , newValues: string[] | NamedNode[] | undefined, graph?: QuadGraph): void => {
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.deleteMatches(subjectTerm, predicateTerm, undefined, graphTerm);
                        if (newValues) {
                            for (const newValue of newValues) {
                                this.mixins.dataset.addObjectUri(subject, predicate, newValue, graph);
                            }
                        }
                    },

                    setObjectDecimalAll: (subject: QuadSubject, predicate: QuadPredicate , newValues: number[] | undefined, graph?: QuadGraph): void => {
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.deleteMatches(subjectTerm, predicateTerm, undefined, graphTerm);
                        if (newValues) {
                            for (const newValue of newValues) {
                                this.mixins.dataset.addObjectDecimal(subject, predicate, newValue, graph);
                            }
                        }
                    }

                }

            }

        }

        /**
        * Warning: build without origin. Import also the related blank node.
        * Includes the linked blank nodes and named nodes.
        * @param subject 
        * @param predicate 
        * @param object 
        * @param graph 
        * @returns 
        */
        public matchDatasetSemantizerWithLinkedObjects(subject?: QuadSubject, predicate?: Term, object?: Term, graph?: Term): DatasetSemantizer {
            const targetSubject = typeof subject === 'string' ? this.getSemantizer().createNamedNode(subject) : subject;
            const dataset = this.getSemantizer().getConfiguration().getDatasetBaseFactory().build(this.getSemantizer());
            const matchedDataset = this.match(targetSubject, predicate, object, graph);
            const addQuadWithLinkedObjectsRecursively = (matchedDataset: DatasetRdfjs) => {
                for (const quad of matchedDataset) {
                    dataset.add(quad);
                    if (quad.object.termType === 'BlankNode' || quad.object.termType === 'NamedNode') {
                        const relatedBlankNode = this.match(quad.object);
                        addQuadWithLinkedObjectsRecursively(relatedBlankNode);
                    }
                }
                return dataset;
            }
            return addQuadWithLinkedObjectsRecursively(matchedDataset);
        }

        // TODO: move to a Utility class
        public getUriOfResource(resource: string | DatasetSemantizer | NamedNode): string {
            if (typeof resource === 'string') {
                return resource;
            }
            if ('termType' in resource && resource.termType === 'NamedNode') {
                return resource.value;
            }
            if ('getBaseUri' in resource) {
                if (resource.getBaseUri()) {
                    return resource.getBaseUri()!.value;
                }
                else throw new Error("Resource origin is undefined.");
            }
            throw new Error("Can't find the uri of the resource.");
        }

        public getObjectAll<ObjectType, Datatype extends NamedNode, Constructor extends (value: string) => ObjectType>(datatype: Datatype, constructor: Constructor, subject: QuadSubject | null, predicate: QuadPredicate | null, graph: QuadGraph | null): ObjectType[] | undefined {
            let results: ObjectType[] | undefined = undefined;
            const { subjectTerm, predicateTerm, graphTerm } = getTermsFromTermOrStringOrNull(this.getSemantizer(), subject, predicate, graph);
            const matched = this.match(subjectTerm, predicateTerm, null, graphTerm);
            if (matched.size > 0) {
                results = [];
                for (const q of matched) {
                    if (q.object.termType === "Literal" && q.object.datatype.equals(datatype)) {
                        results.push(constructor(q.object.value));
                    } else {
                        throw new Error("Invalid term type when getting object value.");
                    }
                }
            }
            return results;
        }

    }

}

export function datasetFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(DatasetMixin);
}