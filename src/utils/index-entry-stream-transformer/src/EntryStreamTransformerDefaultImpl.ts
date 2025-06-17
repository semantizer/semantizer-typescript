import { IDX, IndexEntry, indexEntryFactory } from "@semantizer/mixin-index";
import { DatasetSemantizer, Quad, Semantizer } from "@semantizer/types";
import { datasetFactory, Dataset } from "@semantizer/mixin-dataset";
import { EntryStreamTransformer } from "./types.js";

/**
 * This transformer transforms streamed quads into an IndexEntry object once it has a shape and a sub index or target.
 */
export class EntryStreamTransformerStrategyDefaultImpl implements EntryStreamTransformer<IndexEntry> {

    private _semantizer: Semantizer;
    private _datasets: Map<string, Dataset>;

    public constructor(semantizer: Semantizer) {
        this._semantizer = semantizer;
        this._datasets = new Map<string, Dataset>();
    }

    public transform(quad: Quad): IndexEntry | undefined {
        let entry: IndexEntry | undefined = undefined;
        if (quad.subject.termType === 'NamedNode' || quad.subject.termType === 'BlankNode') {
            // We have to test the value as a string in order to test blank nodes.
            // let dataset = datasets.find(d => d.getBaseUri().value === quad.subject.value);
            let dataset = this._datasets.get(quad.subject.value);

            if (!dataset) {
                dataset = this._semantizer.build(datasetFactory);

                if (quad.subject.termType === 'NamedNode') {
                    dataset.setBaseUri(quad.subject);
                }

                else if (quad.subject.termType === 'BlankNode') {
                    dataset.setBaseUri('');
                }

                this._datasets.set(quad.subject.value, dataset);
            }

            dataset.add(quad);

            const rdf = this._semantizer.getConfiguration().getRdfDataModelFactory();
            const isEntry = dataset.mixins.dataset.isDefaultGraphRdfTypeOf(rdf.namedNode(IDX.INDEX_ENTRY));
            const hasShape = isEntry && dataset.some(q => q.predicate.equals(rdf.namedNode(IDX.HAS_SHAPE)));
            const hasSubIndex = hasShape && dataset.some(q => q.predicate.equals(rdf.namedNode(IDX.HAS_SUB_INDEX)));
            const hasTarget = hasShape && !hasSubIndex && dataset.some(q => q.predicate.equals(rdf.namedNode(IDX.HAS_TARGET)));

            // This loads the linked objects of the entry. This allows to include the shape and properties 
            // into the streamed entry dataset (we need it to compare).
            const addLinkedObjects = (datasetToProcess: DatasetSemantizer) => {
                for (const quadFromDatasetToProcess of datasetToProcess) {
                    const object = quadFromDatasetToProcess.object;
                    if (object.termType === 'NamedNode' || object.termType === "BlankNode") {
                        const objectDataset = this._datasets.get(object.value);
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

                entry = this._semantizer.build(indexEntryFactory, dataset);

                // Here we remove the already streamed dataset from the datasets Map so we can:
                // - speed up the next calls to the get() method of the Map;
                // - reduce memory usage.
                this._datasets.delete(quad.subject.value);
            }
        }

        return entry;
    }

}