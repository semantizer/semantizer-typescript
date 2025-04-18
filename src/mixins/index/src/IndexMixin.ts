import { DatasetSemantizer, DatasetSemantizerMixinConstructor, NamedNode, Quad, Semantizer } from "@semantizer/types";
import { Readable, Transform } from "stream";
import { indexEntryFactory } from "./IndexEntryMixin.js";
import { Index, IndexEntry, IndexShape, IndexStrategy } from "./types";

export function IndexMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class IndexMixinImpl extends Base implements Index {

        /**
         * Transforms the quad stream of this dataset into an IndexEntry stream.
         * @returns A Readable stream of IndexEntry with their linked objects (shape and properties).
         */
        public async loadEntryStream(): Promise<Readable> {
            const quadStream = await this.loadQuadStream();

            const semantizer = this.getSemantizer();
            const datasets = new Map<string, DatasetSemantizer>(); //: DatasetSemantizer[] = []; // stores the datasets of the parsed entry, shape or property

            const indexEntryType = semantizer.getConfiguration().getRdfDataModelFactory().namedNode('https://ns.inria.fr/idx/terms#IndexEntry');
            const hasShapePredicate = semantizer.getConfiguration().getRdfDataModelFactory().namedNode('https://ns.inria.fr/idx/terms#hasShape');
            const hasTargetPredicate = semantizer.getConfiguration().getRdfDataModelFactory().namedNode('https://ns.inria.fr/idx/terms#hasTarget');
            const hasSubIndexPredicate = semantizer.getConfiguration().getRdfDataModelFactory().namedNode('https://ns.inria.fr/idx/terms#hasSubIndex');

            const entryStream = new Transform({
                objectMode: true,

                transform(quad: Quad, encoding, callback) {
                    // TODO: move this into a Strategy?
                    if (quad.subject.termType === 'NamedNode' || quad.subject.termType === 'BlankNode') {
                        // We have to test the value as a string in order to test blank nodes.
                        // let dataset = datasets.find(d => d.getBaseUri().value === quad.subject.value);
                        let dataset = datasets.get(quad.subject.value);

                        if (!dataset) {
                            dataset = semantizer.build();

                            // if (quad.subject.termType === 'NamedNode' || quad.subject.termType === 'BlankNode') {
                            //     // Here 
                            //     dataset.setBaseUri(quad.subject.value);
                            // }

                            if (quad.subject.termType === 'NamedNode') {
                                dataset.setBaseUri(quad.subject);
                            }

                            else if (quad.subject.termType === 'BlankNode') {
                                dataset.setBaseUri('');
                            }

                            // datasets.push(dataset);
                            datasets.set(quad.subject.value, dataset);
                        }

                        dataset.add(quad);

                        const isEntry = dataset.isDefaultGraphRdfTypeOf(indexEntryType);
                        const hasShape = isEntry && dataset.some(q => q.predicate.equals(hasShapePredicate));
                        const hasSubIndex = hasShape && dataset.some(q => q.predicate.equals(hasSubIndexPredicate));
                        const hasTarget = hasShape && !hasSubIndex && dataset.some(q => q.predicate.equals(hasTargetPredicate));

                        // This loads the linked objects of the entry. This allows to include the shape and properties 
                        // into the streamed entry dataset (we need it to compare).
                        const addLinkedObjects = (datasetToProcess: DatasetSemantizer) => {
                            for (const quadFromDatasetToProcess of datasetToProcess) {
                                const object = quadFromDatasetToProcess.object;
                                if (object.termType === 'NamedNode' || object.termType === "BlankNode") {
                                    // const objectDataset = datasets.find(d => d.getBaseUri()?.equals(object));
                                    // const objectDataset = datasets.find(d => d.getBaseUri().value === object.value);
                                    const objectDataset = datasets.get(object.value);
                                    if (objectDataset) {
                                        dataset.addAll(objectDataset);
                                        addLinkedObjects(objectDataset);
                                    }
                                }
                            }
                        }

                        // Here, if we think the entry is complete, we can stream it.
                        // TODO: maybe we can also check the conformance to the targeted shape here?
                        if (isEntry && hasShape && (hasSubIndex || hasTarget)) {
                            // WARNING: in the next line we suppose (no check) we already have parsed the linked objects
                            // (shape and properties)! Maybe we need to enforce the check expecially on the shape properties 
                            // (because these quads could be parsed later - but they should not). 
                            // If so, we need to check that we have a sh:hasValue for a shape of an entry having an hasTarget. 
                            // For an entry with a hasSubIndex, we don't need to check we have something for sh:hasValue.
                            addLinkedObjects(dataset);

                            const entry = semantizer.build(indexEntryFactory, dataset);
                            this.push(entry);

                            // TODO: here we might remove the already streamed dataset from the datasets array so we can 
                            // enhance the next calls to the find() method on this array.
                        }
                    }
                    callback(); // not sure if this is necessary?
                }
            });

            // @ts-ignore
            return quadStream.pipe(entryStream); // WARNING: the pipe method comes from the implementation of the underlying used parser (it can comes from @rdfjs/common-formats if the package loader-rdfjs is used (which uses @rdfjs/fetch)).
            // TODO: ask @rdfjs/types why the Stream interface does not export a pipe method (and also other methods of streams like pause, resume and destroy).
        }

        public async forEachEntry(callbackfn: (value: IndexEntry, index?: number, array?: IndexEntry[]) => Promise<void>): Promise<void> {
            const indexEntryType = this.getSemantizer().getConfiguration().getRdfDataModelFactory().namedNode('https://ns.inria.fr/idx/terms#IndexEntry');
            this.forEachSubGraph(async (subGraph) => {
                if (subGraph.isDefaultGraphRdfTypeOf(indexEntryType)) {
                    await callbackfn(this.getSemantizer().build(indexEntryFactory, subGraph));
                }
            });
        }

        public async findTargetsRecursively(strategy: IndexStrategy, callbackfn: (target: NamedNode) => void, limit?: number): Promise<void> {
            strategy.setSemantizer(this.getSemantizer());
            await strategy.execute(this.getBaseUri(), callbackfn, limit);
        }

    }

}

export function indexFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(IndexMixin);
}