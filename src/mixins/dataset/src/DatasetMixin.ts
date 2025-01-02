import { Term, BlankNode, Quad, Stream, DefaultGraph, DatasetRdfjs, Literal, NamedNode, DatasetLoadOptions, DatasetSemantizer, Resource, DatasetSemantizerRdfjsMixinConstructor, DatasetQuadStreamOptions } from '@semantizer/types';
// import { DatasetCore } from "@rdfjs/types"; // PB if deleted

export function DatasetMixin<
    TBase extends DatasetSemantizerRdfjsMixinConstructor // PB: can be impl other than rdfjs
>(Base: TBase) {

    return class DatasetMixinImpl extends Base implements DatasetSemantizer {
        
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

        isDefaultGraphEmpty(): boolean {
            throw new Error('Method not implemented.');
        }
        isNamedGraphEmpty(namedGraph: NamedNode): boolean {
            throw new Error('Method not implemented.');
        }

        public getSubGraph(subject: BlankNode | NamedNode, namedGraph?: NamedNode): DatasetSemantizer | undefined {
            const defaultGraph = this.getSemantizer().getConfiguration().getRdfDataModelFactory().defaultGraph();
            const datasetRdfjs = this.match(subject, undefined, undefined, namedGraph ?? defaultGraph);
            const dataset = this.getSemantizer().build();
            return dataset.addAll(datasetRdfjs);
        }

        public getSubGraphAll(namedGraph?: NamedNode): DatasetSemantizer[] {
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
            resource = resource? resource: this;
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
            resource = resource? resource: this;
            if (typeof resource !== 'string' && 'getOrigin' in resource && resource.getOrigin()?.termType === 'NamedNode') { // if the resource to load is a NamedNode (and not a BlankNode which are already loaded)
                const loader = options && options.loader? options.loader: this.getSemantizer().getConfiguration().getLoader();
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

        public addObjectUri(subject: NamedNode, predicate: NamedNode, value: NamedNode, graph?: NamedNode): void {
            throw new Error('Method not implemented.');
        }

        public addObjectBoolean(subject: NamedNode | BlankNode, predicate: NamedNode, value: string, graph?: NamedNode): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#boolean'));
            this.add(dataFactory.quad(subject, predicate, literal, graph));
        }
        
        public addObjectDate(subject: NamedNode | BlankNode, predicate: NamedNode, value: Date, graph?: NamedNode): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#date'));
            this.add(dataFactory.quad(subject, predicate, literal, graph));
        }
        
        public addObjectDatetime(subject: NamedNode | BlankNode, predicate: NamedNode, value: Date, graph?: NamedNode): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#datetime'));
            this.add(dataFactory.quad(subject, predicate, literal, graph));
        }
        
        public addObjectDecimal(subject: NamedNode | BlankNode, predicate: NamedNode, value: number, graph?: NamedNode): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#decimal'));
            this.add(dataFactory.quad(subject, predicate, literal, graph));
        }
        
        public addObjectInteger(subject: NamedNode | BlankNode, predicate: NamedNode, value: number, graph?: NamedNode): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const literal = dataFactory.literal(value.toString(), dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#integer'));
            this.add(dataFactory.quad(subject, predicate, literal, graph));
        }
        
        public addObjectStringEnglish(subject: NamedNode | BlankNode, predicate: NamedNode, value: string, graph?: NamedNode): void {
            throw new Error("Method not implemented.");
        }
        
        public addObjectStringNoLocale(subject: NamedNode | BlankNode, predicate: NamedNode, value: string, graph?: NamedNode): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const literal = dataFactory.literal(value);
            this.add(dataFactory.quad(subject, predicate, literal, graph));
        }

        public addObjectStringWithLocale(subject: NamedNode | BlankNode, predicate: NamedNode, value: string, locale: string, graph?: NamedNode): void {
            throw new Error("Method not implemented.");
        }
        
        public addObjectTime(subject: NamedNode | BlankNode, predicate: NamedNode, value: Date, graph?: NamedNode): void {
            throw new Error("Method not implemented.");
        }

        public getObjectUri(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): NamedNode | undefined {
            const results = this.getObjectUriAll(subject, predicate, graph);
            return results && results[0] ? results[0] : undefined;
        }
        
        public getObjectBoolean(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): boolean | undefined {
            const results = this.getObjectBooleanAll(subject, predicate, graph);
            return results && results[0] ? results[0] : undefined;
        }
        
        public getObjectDate(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): Date | undefined {
            const results = this.getObjectDateAll(subject, predicate, graph);
            return results && results[0] ? results[0] : undefined;
        }
        
        public getObjectDatetime(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): Date | undefined {
            const results = this.getObjectDatetimeAll(subject, predicate, graph);
            return results && results[0] ? results[0] : undefined;
        }
        
        public getObjectDecimal(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): number | undefined {
            const results = this.getObjectDecimalAll(subject, predicate, graph);
            return results && results[0] ? results[0] : undefined;
        }
        
        public getObjectInteger(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): number | undefined {
            const results = this.getObjectIntegerAll(subject, predicate, graph);
            return results && results[0] ? results[0] : undefined;
        }
        
        public getObjectStringEnglish(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): string | undefined {
            const results = this.getObjectStringEnglishAll(subject, predicate, graph);
            return results && results[0] ? results[0] : undefined;
        }
        
        public getObjectStringNoLocale(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): string | undefined {
            const results = this.getObjectStringNoLocaleAll(subject, predicate, graph);
            return results && results[0] ? results[0] : undefined;
        }
        
        public getObjectStringWithLocale(subject: NamedNode | BlankNode, predicate: NamedNode, locale: string, graph?: NamedNode): string | undefined {
            const results = this.getObjectStringWithLocaleAll(subject, predicate, locale, graph);
            return results && results[0] ? results[0] : undefined;
        }
        
        public getObjectTime(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): Date | undefined {
            const results = this.getObjectTimeAll(subject, predicate, graph);
            return results && results[0] ? results[0] : undefined;
        }

        public getObjectLinked(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): Term | undefined {
            const results = this.getObjectLinkedAll(subject, predicate, graph);
            return results && results[0] ? results[0] : undefined;
        }

        public getObjectLinkedAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): Term[] | undefined {
            let results: Term[] | undefined = undefined;
            const matched = this.match(subject, predicate, null, graph);
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

        getObjectAll<ObjectType, Datatype extends NamedNode, Constructor extends (value: string) => ObjectType>(datatype: Datatype, constructor: Constructor, subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): ObjectType[] | undefined {
            let results: ObjectType[] | undefined = undefined;
            const matched = this.match(subject, predicate, null, graph);
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

        public getObjectUriAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): NamedNode[] | undefined {
            let results: NamedNode[] | undefined = undefined;
            const matched = this.match(subject, predicate, null, graph);
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
        
        public getObjectBooleanAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): boolean[] | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#boolean'), (value: string) => Boolean(value), subject, predicate, graph);
        }
        
        public getObjectDateAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): Date[] | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#date'), (value: string) => new Date(value), subject, predicate, graph);
        }
        
        public getObjectDatetimeAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): Date[] | undefined {
            throw new Error('Method not implemented.');
        }
        
        public getObjectDecimalAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): number[] | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#decimal'), (value: string) => Number.parseFloat(value), subject, predicate, graph);
        }
        
        public getObjectIntegerAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): number[] | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#integer'), (value: string) => Number.parseInt(value), subject, predicate, graph);
        }
        
        public getObjectStringEnglishAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): string[] | undefined {
            throw new Error('Method not implemented.');
        }
        
        public getObjectStringNoLocaleAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): string[] | undefined {
            const { namedNode } = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.getObjectAll(namedNode('http://www.w3.org/2001/XMLSchema#string'), (value: string) => value, subject, predicate, graph);
        }
        
        public getObjectStringWithLocaleAll(subject: NamedNode | BlankNode, predicate: NamedNode, locale: string, graph?: NamedNode): string[] | undefined {
            throw new Error('Method not implemented.');
        }
        
        public getObjectTimeAll(subject: NamedNode | BlankNode, predicate: NamedNode, graph?: NamedNode): Date[] | undefined {
            throw new Error('Method not implemented.');
        }

    }

}