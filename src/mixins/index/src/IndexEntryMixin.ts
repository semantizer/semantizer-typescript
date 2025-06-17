import { DatasetMixin, DatasetMixinNamespace } from "@semantizer/mixin-dataset";
import { BlankNode, DatasetRdfjs, DatasetSemantizer, DatasetSemantizerConstructor, NamedNode, Semantizer, ShaclValidator } from "@semantizer/types";
import { IDX } from "./namespaces.js";

/**
 * This mixin is used internally by the `IndexMixin:loadEntryStream()` method
 * @param Base 
 * @returns 
 */
export function IndexEntryMixin<
    TMixins extends DatasetMixinNamespace,
    TBase extends DatasetSemantizerConstructor<TMixins>
>(Base: TBase) {

    return class IndexEntryMixinImpl extends Base { //implements IndexEntry {

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

            const addLinkedObjects = (datasetToProcess: DatasetSemantizer) => {
                for (const quadFromDatasetToProcess of datasetToProcess) {
                    const object = quadFromDatasetToProcess.object;
                    if (object.termType === 'NamedNode' || object.termType === 'BlankNode') {
                        const objectDataset = this.mixins.dataset.getSubGraph(object, this.mixins.dataset.getDefaultGraphTerm());
                        if (objectDataset && entryShapeDataset) {
                            entryShapeDataset.addAll(objectDataset);
                            addLinkedObjects(objectDataset);
                        }
                    }
                }
            }

            addLinkedObjects(entryShapeDataset);

            if (entryShapeTerm.termType === 'BlankNode') {
                const rebasedDataset = this.getSemantizer().build();
                const rdf = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                for (const quadToRebase of entryShapeDataset) {
                    if (quadToRebase.subject.equals(entryShapeTerm)) {
                        rebasedDataset.add(
                            rdf.quad(
                                rdf.namedNode(''),
                                quadToRebase.predicate,
                                quadToRebase.object,
                                quadToRebase.graph
                            )
                        );
                    }
                    else if (quadToRebase.object.equals(entryShapeTerm)) {
                        rebasedDataset.add(
                            rdf.quad(
                                quadToRebase.subject,
                                quadToRebase.predicate,
                                rdf.namedNode(''),
                                quadToRebase.graph
                            )
                        );
                    }
                    else rebasedDataset.add(quadToRebase);
                }

                entryShapeDataset = rebasedDataset;
            }

            return this.getSemantizer().build(entryShapeDataset);
        }

    }
}

export function indexEntryFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(IndexEntryMixin, DatasetMixin(_DatasetImpl));
}