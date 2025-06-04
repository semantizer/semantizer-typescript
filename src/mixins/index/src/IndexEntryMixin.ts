import { BlankNode, DatasetSemantizer, DatasetRdfjs, DatasetSemantizerMixinConstructor, NamedNode, Semantizer, ShaclValidator } from "@semantizer/types";
import { IDX } from "./namespaces.js";
import { IndexEntry } from "./types";
import { DatasetMixinConstructor, Dataset } from "@semantizer/mixin-dataset";

/**
 * This mixin is used internally by the `IndexMixin:loadEntryStream()` method
 * @param Base 
 * @returns 
 */
export function IndexEntryMixin<
    TBase extends DatasetMixinConstructor
>(Base: TBase) {

    return class IndexEntryMixinImpl extends Base implements IndexEntry {

        public doesMatchShape(shape: DatasetRdfjs, shaclValidator: ShaclValidator): boolean {
            throw new Error("Not implemented.");
        }

        public hasSubIndex(): boolean {
            return this.mixins.dataset.getObjectUri(this.getBaseUri(), IDX.HAS_SUB_INDEX) !== undefined;
        }

        public getTarget(): NamedNode | BlankNode | undefined {
            return this.mixins.dataset.getObjectLinked(this.getBaseUri(), IDX.HAS_TARGET);
        }

        public getSubIndex(): NamedNode | undefined {
            return this.mixins.dataset.getObjectUri(this.getBaseUri(), IDX.HAS_SUB_INDEX);
        }

        public getShape(): NamedNode | BlankNode | undefined {
            return this.mixins.dataset.getObjectLinked(this.getBaseUri(), IDX.HAS_SHAPE);
        }

        // TODO: replace subject _:b2 by namedNode('') === baseUri
        // this way we can use getBaseUri in requests.
        public getShapeDataset(): DatasetRdfjs {
            const entryShapeTerm = this.getShape();

            if (!entryShapeTerm) {
                this.logError("No triple having the entry as subject and the idx:hasShape as predicate was found.", { subject: this.getBaseUri() });
                throw new Error("Entry has no shape");
            }
            
            let entryShapeDataset = this.mixins.dataset.getSubGraph(entryShapeTerm, this.mixins.dataset.getDefaultGraphTerm());

            if (!entryShapeDataset) {
                this.logError(`The entry shape ${entryShapeTerm} was not found.`, { subject: this.getBaseUri() });
                throw new Error("Entry has no shape");
            }

            const addLinkedObjects = (datasetToProcess: Dataset) => {
                for (const quadFromDatasetToProcess of datasetToProcess.mixins.dataset) {
                    const object = quadFromDatasetToProcess.object;
                    if (object.termType === 'NamedNode' || object.termType === 'BlankNode') {
                        const objectDataset = this.mixins.dataset.getSubGraph(object, this.mixins.dataset.getDefaultGraphTerm());
                        if (objectDataset && entryShapeDataset) {
                            entryShapeDataset.mixins.dataset.addAll(objectDataset.mixins.dataset);
                            addLinkedObjects(objectDataset);
                        }
                    }
                }
            }

            addLinkedObjects(entryShapeDataset);

            if (entryShapeTerm.termType === 'BlankNode') {
                const rebasedDataset = this.getSemantizer().build();
                const rdf = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                for (const quadToRebase of entryShapeDataset.mixins.dataset) {
                    if (quadToRebase.subject.equals(entryShapeTerm)) {
                        rebasedDataset.mixins.dataset.add(
                            rdf.quad(
                                rdf.namedNode(''),
                                quadToRebase.predicate,
                                quadToRebase.object,
                                quadToRebase.graph
                            )
                        );
                    }
                    else if (quadToRebase.object.equals(entryShapeTerm)) {
                        rebasedDataset.mixins.dataset.add(
                            rdf.quad(
                                quadToRebase.subject,
                                quadToRebase.predicate,
                                rdf.namedNode(''),
                                quadToRebase.graph
                            )
                        );
                    }
                    else rebasedDataset.mixins.dataset.add(quadToRebase);
                }

                entryShapeDataset = rebasedDataset;
            }

            return this.getSemantizer().build(entryShapeDataset);
        }

    }
}

export function indexEntryFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(IndexEntryMixin);
}