import { BlankNode, DatasetLoadOptions, DatasetQuadStreamOptions, DatasetRdfjs, DatasetSemantizer, DatasetSemantizerConstructor, DefaultGraph, Literal, NamedNode, Quad, Quad_Graph, Quad_Predicate, Quad_Subject, Resource, Semantizer, Stream, Term, WithMixins } from '@semantizer/types';
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

                    getNamedGraphAll: (namedGraph: NamedNode): DatasetSemantizer[] => {
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

                    getNamedGraph: (namedGraph: NamedNode): DatasetSemantizer | undefined => {
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

                    getSubGraph: (subject: BlankNode | NamedNode | string, parentGraph: NamedNode | DefaultGraph): DatasetSemantizer | undefined => {
                        const termSubject = typeof subject === 'string' ? this.getSemantizer().getConfiguration().getRdfDataModelFactory().namedNode(subject) : subject;
                        const datasetRdfjs = this.matchDatasetSemantizerWithLinkedObjects(termSubject, undefined, undefined, parentGraph);
                        const dataset = this.getSemantizer().build();
                        return dataset.addAll(datasetRdfjs);
                    },

                    getSubGraphAll: (parentGraph: NamedNode | DefaultGraph | string): DatasetSemantizer[] => {
                        throw new Error('Method not implemented.');
                    },

                    getLiteral: (thing: Resource | DefaultGraph | undefined, predicate: Resource, graph?: NamedNode | DefaultGraph, language?: string): Literal | undefined => {
                        const literal = this.match(thing, predicate, graph);
                        for (const q of literal) {
                            if (q.object.termType === "Literal")
                                return q.object;
                        }
                        return undefined;
                    },

                    getLiteralAll: (thing: Resource | DefaultGraph | undefined, predicate: Resource, graph?: NamedNode | DefaultGraph, language?: string): Literal[] => {
                        throw new Error('Method not implemented.');
                    },

                    loadQuadStream: async (resource?: string | DatasetSemantizer | NamedNode, options?: DatasetQuadStreamOptions): Promise<Stream<Quad>> => {
                        resource = resource ? resource : this;
                        const resourceUri = this.getUriOfResource(resource);
                        const loader = options?.quadStreamLoader ? options.quadStreamLoader : this.getSemantizer().getConfiguration().getLoaderQuadStream();
                        return loader.load(resourceUri);
                    },

                    // TODO: include related blank node into returned dataset
                    forEachSubGraph: async (callbackfn: (value: DatasetSemantizer, index?: number, array?: DatasetSemantizer[]) => Promise<void>, graph?: NamedNode | DefaultGraph): Promise<void> => {
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
                            const graphDataset = graph.termType === 'DefaultGraph' ? this.mixins.dataset.getDefaultGraph() : this.mixins.dataset.getNamedGraph(graph);
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

                    addObjectUri: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: NamedNode | string, graph?: Quad_Graph | string): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        const valueNamedNode = typeof value === 'string' ? dataFactory.namedNode(value) : value;
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, valueNamedNode, graphTerm));
                    },

                    addObjectUriOrBlankNode: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: NamedNode | string | BlankNode, graph?: Quad_Graph | string): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        const valueNamedNode = typeof value === 'string' ? dataFactory.namedNode(value) : value;
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, valueNamedNode, graphTerm));
                    },

                    addObjectBlankNode: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, blankNode: BlankNode, graph?: Quad_Graph | string): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, blankNode, graphTerm));
                    },

                    addObjectBlankNodeEmpty: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, blankNodeName: string, graph?: Quad_Graph | string): BlankNode => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const blankNode = dataFactory.blankNode(blankNodeName);
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, blankNode, graphTerm));
                        return blankNode;
                    },

                    addObjectBoolean: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: boolean, graph?: Quad_Graph | string): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#boolean'));
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    addObjectDate: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: Date, graph?: Quad_Graph | string): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#date'));
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    addObjectDatetime: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: Date, graph?: Quad_Graph | string): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#datetime'));
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    addObjectDecimal: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: number, graph?: Quad_Graph | string): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#decimal'));
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    addObjectInteger: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: number, graph?: Quad_Graph | string): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#integer'));
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    addObjectStringEnglish: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: string, graph?: Quad_Graph | string): void => {
                        throw new Error("Method not implemented.");
                    },

                    addObjectStringNoLocale: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: string, graph?: Quad_Graph | string): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value);
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.add(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    addObjectStringWithLocale: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: string, locale: string, graph?: Quad_Graph | string): void => {
                        throw new Error("Method not implemented.");
                    },

                    addObjectTime: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: Date, graph?: Quad_Graph | string): void => {
                        throw new Error("Method not implemented.");
                    },

                    // TODO: don't call getObjectUriAll but call match directly or even better use the datasetCore internal attributes 
                    // to be faster.
                    getObjectUri: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): NamedNode | undefined => {
                        const results = this.mixins.dataset.getObjectUriAll(subject, predicate, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObjectBoolean: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): boolean | undefined => {
                        const results = this.mixins.dataset.getObjectBooleanAll(subject, predicate, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObjectDate: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Date | undefined => {
                        const results = this.mixins.dataset.getObjectDateAll(subject, predicate, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObjectDatetime: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Date | undefined => {
                        const results = this.mixins.dataset.getObjectDatetimeAll(subject, predicate, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObjectDecimal: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): number | undefined => {
                        const results = this.mixins.dataset.getObjectDecimalAll(subject, predicate, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObjectInteger: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): number | undefined => {
                        const results = this.mixins.dataset.getObjectIntegerAll(subject, predicate, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObjectStringEnglish: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): string | undefined => {
                        const results = this.mixins.dataset.getObjectStringEnglishAll(subject, predicate, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObjectStringNoLocale: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): string | undefined => {
                        const results = this.mixins.dataset.getObjectStringNoLocaleAll(subject, predicate, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObjectStringWithLocale: (subject: NamedNode | BlankNode, predicate: NamedNode, locale: string, graph?: NamedNode): string | undefined => {
                        const results = this.mixins.dataset.getObjectStringWithLocaleAll(subject, predicate, locale, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObjectTime: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Date | undefined => {
                        const results = this.mixins.dataset.getObjectTimeAll(subject, predicate, graph);
                        return results && results[0] ? results[0] : undefined;
                    },

                    getObjectLinked: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): NamedNode | BlankNode | undefined => {
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

                    getObjectLinkedAll: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Term[] | undefined => {
                        let results: Term[] | undefined = undefined;
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

                    getObjectUriAll: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): NamedNode[] | undefined => {
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

                    getObjectBooleanAll: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): boolean[] | undefined => {
                        const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#boolean'), (value: string) => Boolean(value), subject, predicate, graph);
                    },

                    getObjectDateAll: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Date[] | undefined => {
                        const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#date'), (value: string) => new Date(value), subject, predicate, graph);
                    },

                    getObjectDatetimeAll: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Date[] | undefined => {
                        throw new Error('Method not implemented.');
                    },

                    getObjectDecimalAll: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): number[] | undefined => {
                        const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#decimal'), (value: string) => Number.parseFloat(value), subject, predicate, graph);
                    },

                    getObjectIntegerAll: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): number[] | undefined => {
                        const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#integer'), (value: string) => Number.parseInt(value), subject, predicate, graph);
                    },

                    getObjectStringEnglishAll: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): string[] | undefined => {
                        throw new Error('Method not implemented.');
                    },

                    getObjectStringNoLocaleAll: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): string[] | undefined => {
                        const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#string'), (value: string) => value, subject, predicate, graph);
                    },

                    getObjectStringWithLocaleAll: (subject: NamedNode | BlankNode, predicate: NamedNode, locale: string, graph?: NamedNode): string[] | undefined => {
                        throw new Error('Method not implemented.');
                    },

                    getObjectTimeAll: (subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Date[] | undefined => {
                        throw new Error('Method not implemented.');
                    },

                    deleteObjectStringNoLocale: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: string, graph?: Quad_Graph | string): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value);
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.delete(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    deleteObjectUri: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: string | NamedNode, graph?: Quad_Graph | string): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const namedNode = typeof value === 'string' ? dataFactory.namedNode(value) : value;
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.delete(dataFactory.quad(subjectTerm, predicateTerm, namedNode, graphTerm));
                    },

                    deleteObjectDecimal: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: number, graph?: Quad_Graph | string): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString());
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.delete(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    deleteObjectInteger: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: number, graph?: Quad_Graph | string): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString());
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.delete(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    deleteObjectBoolean: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: boolean, graph?: Quad_Graph | string): void => {
                        const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                        const literal = dataFactory.literal(value.toString());
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.delete(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
                    },

                    setObjectDecimal: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValue: number | undefined, oldValue?: number, graph?: Quad_Graph | string): void => {
                        if (oldValue !== newValue) {
                            if (oldValue) {
                                this.mixins.dataset.deleteObjectDecimal(subject, predicate, oldValue, graph);
                            }
                            if (newValue) {
                                this.mixins.dataset.addObjectDecimal(subject, predicate, newValue, graph);
                            }
                        }
                    },

                    setObjectInteger: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValue: number | undefined, oldValue?: number, graph?: Quad_Graph | string): void => {
                        if (oldValue !== newValue) {
                            if (oldValue) {
                                this.mixins.dataset.deleteObjectInteger(subject, predicate, oldValue, graph);
                            }
                            if (newValue) {
                                this.mixins.dataset.addObjectInteger(subject, predicate, newValue, graph);
                            }
                        }
                    },

                    setObjectBoolean: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValue: boolean | undefined, oldValue?: boolean, graph?: Quad_Graph | string): void => {
                        if (oldValue !== newValue) {
                            if (oldValue) {
                                this.mixins.dataset.deleteObjectBoolean(subject, predicate, oldValue, graph);
                            }
                            if (newValue) {
                                this.mixins.dataset.addObjectBoolean(subject, predicate, newValue, graph);
                            }
                        }
                    },

                    setObjectStringNoLocale: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValue: string | undefined, oldValue?: string, graph?: Quad_Graph | string): void => {
                        if (oldValue !== newValue) {
                            if (oldValue) {
                                this.mixins.dataset.deleteObjectStringNoLocale(subject, predicate, oldValue, graph);
                            }
                            if (newValue) {
                                this.mixins.dataset.addObjectStringNoLocale(subject, predicate, newValue, graph);
                            }
                        }
                    },

                    setObjectUri: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValue: string | NamedNode | undefined, oldValue?: string | NamedNode, graph?: Quad_Graph | string): void => {
                        if (oldValue !== newValue) {
                            if (oldValue) {
                                this.mixins.dataset.deleteObjectUri(subject, predicate, oldValue, graph);
                            }
                            if (newValue) {
                                this.mixins.dataset.addObjectUri(subject, predicate, newValue, graph);
                            }
                        }
                    },

                    setObjectStringNoLocaleAll: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValues: string[] | undefined, graph?: Quad_Graph | string): void => {
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.deleteMatches(subjectTerm, predicateTerm, undefined, graphTerm);
                        if (newValues) {
                            for (const newValue of newValues) {
                                this.mixins.dataset.addObjectStringNoLocale(subject, predicate, newValue, graph);
                            }
                        }
                    },

                    setObjectUriAll: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValues: string[] | NamedNode[] | undefined, graph?: Quad_Graph | string): void => {
                        const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
                        this.deleteMatches(subjectTerm, predicateTerm, undefined, graphTerm);
                        if (newValues) {
                            for (const newValue of newValues) {
                                this.mixins.dataset.addObjectUri(subject, predicate, newValue, graph);
                            }
                        }
                    },

                    setObjectDecimalAll: (subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValues: number[] | undefined, graph?: Quad_Graph | string): void => {
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
        public matchDatasetSemantizerWithLinkedObjects(subject?: Term, predicate?: Term, object?: Term, graph?: Term): DatasetSemantizer {
            const dataset = this.getSemantizer().getConfiguration().getDatasetBaseFactory().build(this.getSemantizer());
            const matchedDataset = this.match(subject, predicate, object, graph);
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

        public getObjectAll<ObjectType, Datatype extends NamedNode, Constructor extends (value: string) => ObjectType>(datatype: Datatype, constructor: Constructor, subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): ObjectType[] | undefined {
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