import { Term, BlankNode, Quad, Stream, DefaultGraph, DatasetRdfjs, Literal, NamedNode, DatasetLoadOptions, DatasetSemantizer, Resource, DatasetSemantizerRdfjsMixinConstructor, DatasetQuadStreamOptions, Quad_Subject, Quad_Predicate, Quad_Graph } from '@semantizer/types';
import { getRelativeUrl, getTermsFromQuadSubjectPredicateAndGraph, getTermsFromTermOrStringOrNull, isUrlAbsolute } from './utils';

export function DatasetMixin<
    TBase extends DatasetSemantizerRdfjsMixinConstructor // PB: can be impl other than rdfjs
>(Base: TBase) {

    return class DatasetMixinImpl extends Base implements DatasetSemantizer {

        public transformAllSubjectAndObjectAbsoluteUrisToRelativeUris(baseUri?: string): void {
            if (baseUri || (this.getOrigin() && this.getOrigin()!.value !== '')) {
                const quadsToDelete: Quad[] = [];
                const base = baseUri ?? this.getOrigin()!.value;
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
        }

        // TODO: check matchedQuad type (BlankNode type?)?
        public getRdfTypeAll(namedGraph?: NamedNode): NamedNode[] {
            const results: NamedNode[] = [];

            const subject = namedGraph ? namedGraph : this.getOrigin();
            const predicate = this.getSemantizer().getConfiguration().getRdfDataModelFactory().namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
            const graph = namedGraph ? namedGraph : this.getSemantizer().getConfiguration().getRdfDataModelFactory().defaultGraph();

            if (subject) {
                for (const matchedQuad of this.match(subject, predicate, undefined, graph)) {
                    results.push(matchedQuad.object as NamedNode);
                }
            }

            return results;
        }

        public isDefaultGraphRdfTypeOf(rdfType: NamedNode, ...otherTypes: NamedNode[]): boolean {
            const thisTypes = this.getRdfTypeAll().map(t => t.value);
            for (const type of [rdfType, ...otherTypes]) {
                if (!thisTypes.includes(type.value)) {
                    return false;
                }
            }
            return true;
        }

        public getNamedGraphAll(namedGraph: NamedNode): DatasetSemantizer[] {
            throw new Error('Method not implemented.');
        }

        public count(): number {
            return this.size;
        }

        public isEmpty(): boolean {
            return this.size === 0;
        }

        public hasNamedGraph(): boolean {
            for (const quad of this) {
                if (quad.graph) {
                    return true;
                }
            }
            return false;
        }

        countNamedGraph(): number {
            throw new Error('Method not implemented.');
        }

        public getNamedGraph(namedGraph: NamedNode): DatasetSemantizer | undefined {
            const matchedDataset = this.matchDatasetSemantizerWithLinkedObjects(namedGraph);
            if (matchedDataset.isEmpty()) {
                return undefined
            } else {
                matchedDataset.setOrigin(namedGraph);
                return matchedDataset;
            }
        }

        public getDefaultGraph(): DatasetSemantizer {
            const defaultGraph = this.getSemantizer().getConfiguration().getRdfDataModelFactory().defaultGraph();
            const dataset = this.matchDatasetSemantizerWithLinkedObjects(undefined, undefined, undefined, defaultGraph);
            if (!this.getOriginDocument()) {
                console.warn("Can't set the document origin of the default graph.");
            }
            dataset.setOrigin(this.getOriginDocument()!);
            return dataset;
        }

        public getDefaultGraphTerm(): DefaultGraph {
            const rdfFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return rdfFactory.defaultGraph();
        }

        isDefaultGraphEmpty(): boolean {
            throw new Error('Method not implemented.');
        }
        isNamedGraphEmpty(namedGraph: NamedNode): boolean {
            throw new Error('Method not implemented.');
        }

        public getSubGraph(subject: BlankNode | NamedNode | string, parentGraph: NamedNode | DefaultGraph): DatasetSemantizer | undefined {
            const termSubject = typeof subject === 'string' ? this.getSemantizer().getConfiguration().getRdfDataModelFactory().namedNode(subject) : subject;
            const datasetRdfjs = this.match(termSubject, undefined, undefined, parentGraph);
            const dataset = this.getSemantizer().build();
            return dataset.addAll(datasetRdfjs);
        }

        public getSubGraphAll(parentGraph: NamedNode | DefaultGraph | string): DatasetSemantizer[] {
            throw new Error('Method not implemented.');
        }

        public getLiteral(thing: Resource | DefaultGraph | undefined, predicate: Resource, graph?: NamedNode | DefaultGraph, language?: string): Literal | undefined {
            const literal = this.match(thing, predicate, graph);
            for (const q of literal) {
                if (q.object.termType === "Literal")
                    return q.object;
            }
            return undefined;
        }

        getLiteralAll(thing: Resource | DefaultGraph | undefined, predicate: Resource, graph?: NamedNode | DefaultGraph, language?: string): Literal[] {
            throw new Error('Method not implemented.');
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

        public addLinkedObject(thing: Resource, predicate: NamedNode, object: Resource): void {
            this.add(this.getSemantizer().getConfiguration().getRdfDataModelFactory().quad(
                thing,
                predicate,
                object
            ));
        }

        // TODO: handle this != document, get the document first?
        public getLinkedObject(predicate: Resource, thingOrDataset?: Resource | DatasetSemantizer, graph?: NamedNode | DefaultGraph): DatasetSemantizer | undefined {
            const thing = thingOrDataset ? 'getOrigin' in thingOrDataset ? thingOrDataset.getOrigin() : thingOrDataset : undefined;
            for (const quad of this.match(thing, predicate, undefined, graph)) {
                const dataset = this.matchDatasetSemantizerWithLinkedObjects(quad.object);
                dataset.setOrigin(quad.object as NamedNode | BlankNode);
                if (thing) {
                    dataset.setOriginThing(thing);
                }
                return dataset;
            }
            return undefined;
        }

        public getLinkedObjectAll(predicate: Resource, thingOrDataset?: Resource | DatasetSemantizer, graph?: NamedNode | DefaultGraph): DatasetSemantizer[] {
            const things: DatasetSemantizer[] = [];
            const thing = thingOrDataset ? 'getOrigin' in thingOrDataset ? thingOrDataset.getOrigin() : thingOrDataset : undefined;
            for (const quad of this.match(thing, predicate, undefined, graph)) {
                const dataset = this.matchDatasetSemantizerWithLinkedObjects(quad.object);
                dataset.setOrigin(quad.object as NamedNode | BlankNode);
                if (thing) {
                    dataset.setOriginThing(thing);
                }
                things.push(dataset);
            }
            return things;
        }

        public async loadQuadStream(resource?: string | DatasetSemantizer | NamedNode, options?: DatasetQuadStreamOptions): Promise<Stream<Quad>> {
            resource = resource ? resource : this;
            const resourceUri = this.getUriOfResource(resource);
            const loader = options?.quadStreamLoader ? options.quadStreamLoader : this.getSemantizer().getConfiguration().getLoaderQuadStream();
            return loader.load(resourceUri);
        }

        // TODO: include related blank node into returned dataset
        public async forEachSubGraph(callbackfn: (value: DatasetSemantizer, index?: number, array?: DatasetSemantizer[]) => Promise<void>, graph?: NamedNode | DefaultGraph): Promise<void> {
            let index = 0;
            const subjects: string[] = [];

            const processGraph = async (graphDataset: DatasetSemantizer) => {
                for (const quad of graphDataset) {
                    if (quad.subject.termType === 'NamedNode') {
                        if (!subjects.includes(quad.subject.value)) {
                            subjects.push(quad.subject.value); // mark quad as "already treated"
                            const thing = this.getNamedGraph(quad.subject);
                            if (thing) {
                                await callbackfn(thing, index);
                            }
                        }
                        index++;
                    }
                }
            }

            if (graph) {
                const graphDataset = graph.termType === 'DefaultGraph' ? this.getDefaultGraph() : this.getNamedGraph(graph);
                if (graphDataset) {
                    await processGraph(graphDataset);
                }
            }

            else {
                for (const quad of this) {
                    if (quad.subject.termType === 'NamedNode') {
                        const graphDataset = this.getNamedGraph(quad.subject);
                        if (graphDataset) {
                            await processGraph(graphDataset);
                        }
                    }
                }
            }
        }

        // TODO: move to a Utility class
        public getUriOfResource(resource: string | DatasetSemantizer | NamedNode): string {
            if (typeof resource === 'string') {
                return resource;
            }
            if ('termType' in resource && resource.termType === 'NamedNode') {
                return resource.value;
            }
            if ('getOrigin' in resource) {
                if (resource.getOrigin()) {
                    return resource.getOrigin()!.value;
                }
                else throw new Error("Resource origin is undefined.");
            }
            throw new Error("Can't find the uri of the resource.");
        }

        /**
         * 
         * @param resource 
         * @param options 
         */
        public async load(resource?: string | DatasetSemantizer | NamedNode, options?: DatasetLoadOptions): Promise<void> {
            resource = resource ? resource : this;
            if (typeof resource !== 'string' && 'getOrigin' in resource && resource.getOrigin()?.termType === 'NamedNode') { // if the resource to load is a NamedNode (and not a BlankNode which are already loaded)
                const loader = options && options.loader ? options.loader : this.getSemantizer().getConfiguration().getLoader();
                const resourceUri = this.getUriOfResource(resource);
                const resourceNamedNode = this.getSemantizer().getConfiguration().getRdfDataModelFactory().namedNode(resourceUri);
                const startTime = new Date();
                const loaded = await loader.load(resourceUri);
                const loadingTime = (new Date().getTime() - startTime.getTime()) / 1000;
                console.log("HTTP loading done in ", loadingTime.toString(), "sec.");
                console.log("Start loading in memory of " + resourceUri + "...");
                for (const quad of loaded) {
                    if (this.getOrigin() && this.getOrigin()?.value !== resourceUri) { // load in default graph
                        quad.graph = resourceNamedNode;
                    }
                    this.add(quad);
                }
                const elapsedTime = (new Date().getTime() - startTime.getTime()) / 1000;
                console.log("Finished loading in memory in " + elapsedTime.toString() + "sec of " + resourceUri);
            }
        }

        public addObjectUri(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: NamedNode | string, graph?: Quad_Graph | string): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
            const valueNamedNode = typeof value === 'string' ? dataFactory.namedNode(value) : value;
            this.add(dataFactory.quad(subjectTerm, predicateTerm, valueNamedNode, graphTerm));
        }

        public addObjectBlankNode(subject: Quad_Subject | string, predicate: Quad_Predicate | string, blankNode: BlankNode, graph?: Quad_Graph | string): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
            this.add(dataFactory.quad(subjectTerm, predicateTerm, blankNode, graphTerm));
        }

        public addObjectBlankNodeEmpty(subject: Quad_Subject | string, predicate: Quad_Predicate | string, blankNodeName: string, graph?: Quad_Graph | string): BlankNode {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const blankNode = dataFactory.blankNode(blankNodeName);
            const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
            this.add(dataFactory.quad(subjectTerm, predicateTerm, blankNode, graphTerm));
            return blankNode;
        }

        public addObjectBoolean(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: string, graph?: Quad_Graph | string): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#boolean'));
            const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
            this.add(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
        }

        public addObjectDate(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: Date, graph?: Quad_Graph | string): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#date'));
            const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
            this.add(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
        }

        public addObjectDatetime(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: Date, graph?: Quad_Graph | string): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#datetime'));
            const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
            this.add(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
        }

        public addObjectDecimal(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: number, graph?: Quad_Graph | string): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#decimal'));
            const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
            this.add(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
        }

        public addObjectInteger(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: number, graph?: Quad_Graph | string): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#integer'));
            const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
            this.add(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
        }

        public addObjectStringEnglish(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: string, graph?: Quad_Graph | string): void {
            throw new Error("Method not implemented.");
        }

        public addObjectStringNoLocale(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: string, graph?: Quad_Graph | string): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const literal = dataFactory.literal(value);
            const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
            this.add(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
        }

        public addObjectStringWithLocale(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: string, locale: string, graph?: Quad_Graph | string): void {
            throw new Error("Method not implemented.");
        }

        public addObjectTime(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: Date, graph?: Quad_Graph | string): void {
            throw new Error("Method not implemented.");
        }

        public getObjectUri(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): NamedNode | undefined {
            const results = this.getObjectUriAll(subject, predicate, graph);
            return results && results[0] ? results[0] : undefined;
        }

        public getObjectBoolean(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): boolean | undefined {
            const results = this.getObjectBooleanAll(subject, predicate, graph);
            return results && results[0] ? results[0] : undefined;
        }

        public getObjectDate(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Date | undefined {
            const results = this.getObjectDateAll(subject, predicate, graph);
            return results && results[0] ? results[0] : undefined;
        }

        public getObjectDatetime(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Date | undefined {
            const results = this.getObjectDatetimeAll(subject, predicate, graph);
            return results && results[0] ? results[0] : undefined;
        }

        public getObjectDecimal(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): number | undefined {
            const results = this.getObjectDecimalAll(subject, predicate, graph);
            return results && results[0] ? results[0] : undefined;
        }

        public getObjectInteger(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): number | undefined {
            const results = this.getObjectIntegerAll(subject, predicate, graph);
            return results && results[0] ? results[0] : undefined;
        }

        public getObjectStringEnglish(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): string | undefined {
            const results = this.getObjectStringEnglishAll(subject, predicate, graph);
            return results && results[0] ? results[0] : undefined;
        }

        public getObjectStringNoLocale(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): string | undefined {
            const results = this.getObjectStringNoLocaleAll(subject, predicate, graph);
            return results && results[0] ? results[0] : undefined;
        }

        public getObjectStringWithLocale(subject: NamedNode | BlankNode, predicate: NamedNode, locale: string, graph?: NamedNode): string | undefined {
            const results = this.getObjectStringWithLocaleAll(subject, predicate, locale, graph);
            return results && results[0] ? results[0] : undefined;
        }

        public getObjectTime(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Date | undefined {
            const results = this.getObjectTimeAll(subject, predicate, graph);
            return results && results[0] ? results[0] : undefined;
        }

        public getObjectLinked(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): NamedNode | BlankNode | undefined {
            let result: NamedNode | BlankNode | undefined = undefined;
            const results = this.getObjectLinkedAll(subject, predicate, graph);

            if (results && results[0]) {
                if (results[0].termType === 'NamedNode') {
                    result = (results[0] as NamedNode);
                } else if (results[0].termType === 'BlankNode') {
                    result = (results[0] as BlankNode);
                } else throw new Error();
            }

            return result;
        }

        public getObjectLinkedAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Term[] | undefined {
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
        }

        getObjectAll<ObjectType, Datatype extends NamedNode, Constructor extends (value: string) => ObjectType>(datatype: Datatype, constructor: Constructor, subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): ObjectType[] | undefined {
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

        public getObjectUriAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): NamedNode[] | undefined {
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
        }

        public getObjectBooleanAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): boolean[] | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#boolean'), (value: string) => Boolean(value), subject, predicate, graph);
        }

        public getObjectDateAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Date[] | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#date'), (value: string) => new Date(value), subject, predicate, graph);
        }

        public getObjectDatetimeAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Date[] | undefined {
            throw new Error('Method not implemented.');
        }

        public getObjectDecimalAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): number[] | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#decimal'), (value: string) => Number.parseFloat(value), subject, predicate, graph);
        }

        public getObjectIntegerAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): number[] | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#integer'), (value: string) => Number.parseInt(value), subject, predicate, graph);
        }

        public getObjectStringEnglishAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): string[] | undefined {
            throw new Error('Method not implemented.');
        }

        public getObjectStringNoLocaleAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): string[] | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#string'), (value: string) => value, subject, predicate, graph);
        }

        public getObjectStringWithLocaleAll(subject: NamedNode | BlankNode, predicate: NamedNode, locale: string, graph?: NamedNode): string[] | undefined {
            throw new Error('Method not implemented.');
        }

        public getObjectTimeAll(subject: Term | string | null, predicate: Term | string | null, graph?: Term | string | null): Date[] | undefined {
            throw new Error('Method not implemented.');
        }

        public deleteObjectStringNoLocale(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: string, graph?: Quad_Graph | string): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const literal = dataFactory.literal(value);
            const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
            this.delete(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
        }

        public deleteObjectUri(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: string | NamedNode, graph?: Quad_Graph | string): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const namedNode = typeof value === 'string' ? dataFactory.namedNode(value) : value;
            const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
            this.delete(dataFactory.quad(subjectTerm, predicateTerm, namedNode, graphTerm));
        }

        public deleteObjectDecimal(subject: Quad_Subject | string, predicate: Quad_Predicate | string, value: number, graph?: Quad_Graph | string): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const literal = dataFactory.literal(value.toString());
            const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
            this.delete(dataFactory.quad(subjectTerm, predicateTerm, literal, graphTerm));
        }

        public setObjectDecimal(subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValue: number | undefined, oldValue?: number, graph?: Quad_Graph | string): void {
            if (oldValue !== newValue) {
                if (oldValue) {
                    this.deleteObjectDecimal(subject, predicate, oldValue, graph);
                }
                if (newValue) {
                    this.addObjectDecimal(subject, predicate, newValue, graph);
                }
            }
        }

        public setObjectStringNoLocale(subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValue: string | undefined, oldValue?: string, graph?: Quad_Graph | string): void {
            if (oldValue !== newValue) {
                if (oldValue) {
                    this.deleteObjectStringNoLocale(subject, predicate, oldValue, graph);
                }
                if (newValue) {
                    this.addObjectStringNoLocale(subject, predicate, newValue, graph);
                }
            }
        }

        public setObjectUri(subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValue: string | NamedNode | undefined, oldValue?: string | NamedNode, graph?: Quad_Graph | string): void {
            if (oldValue !== newValue) {
                if (oldValue) {
                    this.deleteObjectUri(subject, predicate, oldValue, graph);
                }
                if (newValue) {
                    this.addObjectUri(subject, predicate, newValue, graph);
                }
            }
        }

        public setObjectStringNoLocaleAll(subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValues: string[] | undefined, graph?: Quad_Graph | string): void {
            const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
            this.deleteMatches(subjectTerm, predicateTerm, undefined, graphTerm);
            if (newValues) {
                for (const newValue of newValues) {
                    this.addObjectStringNoLocale(subject, predicate, newValue, graph);
                }
            }
        }

        public setObjectUriAll(subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValues: string[] | NamedNode[] | undefined, graph?: Quad_Graph | string): void {
            const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
            this.deleteMatches(subjectTerm, predicateTerm, undefined, graphTerm);
            if (newValues) {
                for (const newValue of newValues) {
                    this.addObjectUri(subject, predicate, newValue, graph);
                }
            }
        }

        public setObjectDecimalAll(subject: Quad_Subject | string, predicate: Quad_Predicate | string, newValues: number[] | undefined, graph?: Quad_Graph | string): void {
            const { subjectTerm, predicateTerm, graphTerm } = getTermsFromQuadSubjectPredicateAndGraph(this.getSemantizer(), subject, predicate, graph);
            this.deleteMatches(subjectTerm, predicateTerm, undefined, graphTerm);
            if (newValues) {
                for (const newValue of newValues) {
                    this.addObjectDecimal(subject, predicate, newValue, graph);
                }
            }
        }

    }

}