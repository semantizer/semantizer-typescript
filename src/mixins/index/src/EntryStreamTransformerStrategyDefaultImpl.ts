import { DatasetSemantizer, NamedNode, Quad, Semantizer } from "@semantizer/types";
import { EntryStreamTransformerStrategy, IndexEntry } from "./types";
import { IDX, RDF } from "./namespaces";
import { indexEntryFactory } from "./IndexEntryMixin";

export class EntryStreamTransformerStrategyDefaultImpl implements EntryStreamTransformerStrategy<IndexEntry> {

    private _semantizer: Semantizer;
    private _datasets: Map<string, DatasetSemantizer>;

    public constructor(semantizer: Semantizer) {
        this._semantizer = semantizer;
        this._datasets = new Map<string, DatasetSemantizer>();
    }

    public transform(quad: Quad): IndexEntry | undefined {
        let entry: IndexEntry | undefined = undefined;
        if (quad.subject.termType === 'NamedNode' || quad.subject.termType === 'BlankNode') {
            // We have to test the value as a string in order to test blank nodes.
            // let dataset = datasets.find(d => d.getBaseUri().value === quad.subject.value);
            let dataset = this._datasets.get(quad.subject.value);

            if (!dataset) {
                dataset = this._semantizer.build();

                if (quad.subject.termType === 'NamedNode') {
                    dataset.setBaseUri(quad.subject);
                }

                else if (quad.subject.termType === 'BlankNode') {
                    dataset.setBaseUri('');
                }

                this._datasets.set(quad.subject.value, dataset);
            }

            dataset.add(quad);

            const { namedNode } = this._semantizer.getConfiguration().getRdfDataModelFactory();
            const isEntry = dataset.isDefaultGraphRdfTypeOf(namedNode(IDX.INDEX_ENTRY));
            const hasShape = isEntry && dataset.some(q => q.predicate.equals(namedNode(IDX.HAS_SHAPE)));
            const hasSubIndex = hasShape && dataset.some(q => q.predicate.equals(namedNode(IDX.HAS_SUB_INDEX)));
            const hasTarget = hasShape && !hasSubIndex && dataset.some(q => q.predicate.equals(namedNode(IDX.HAS_TARGET)));

            // This loads the linked objects of the entry. This allows to include the shape and properties 
            // into the streamed entry dataset (we need it to compare).
            const addLinkedObjects = (datasetToProcess: DatasetSemantizer) => {
                for (const quadFromDatasetToProcess of datasetToProcess) {
                    const object = quadFromDatasetToProcess.object;
                    if (object.termType === 'NamedNode' || object.termType === "BlankNode") {
                        // const objectDataset = datasets.find(d => d.getBaseUri()?.equals(object));
                        // const objectDataset = datasets.find(d => d.getBaseUri().value === object.value);
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

/*
const semantizer = this.getSemantizer();
const datasets = new Map<string, DatasetSemantizer>(); //: DatasetSemantizer[] = []; // stores the datasets of the parsed entry, shape or property

const indexEntryType = semantizer.getConfiguration().getRdfDataModelFactory().namedNode('https://ns.inria.fr/idx/terms#IndexEntry');
const hasShapePredicate = semantizer.getConfiguration().getRdfDataModelFactory().namedNode('https://ns.inria.fr/idx/terms#hasShape');
const hasTargetPredicate = semantizer.getConfiguration().getRdfDataModelFactory().namedNode('https://ns.inria.fr/idx/terms#hasTarget');
const hasSubIndexPredicate = semantizer.getConfiguration().getRdfDataModelFactory().namedNode('https://ns.inria.fr/idx/terms#hasSubIndex');

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
*/