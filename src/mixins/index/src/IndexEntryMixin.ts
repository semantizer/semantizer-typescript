import { BlankNode, DatasetSemantizer, DatasetSemantizerMixinConstructor, NamedNode, Semantizer } from "@semantizer/types";
import { IDX } from "./namespaces.js";
import { IndexEntry, IndexShape, IndexShapeComparisonStrategy } from "./types";
import { indexShapeFactory } from "./IndexShapeMixin.js";

/**
 * This mixin is used internally by the `IndexMixin:loadEntryStream()` method
 * @param Base 
 * @returns 
 */
export function IndexEntryMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class IndexEntryMixinImpl extends Base implements IndexEntry {

        public doesMatchShape(shape: IndexShape, strategy: IndexShapeComparisonStrategy): boolean {
            const thisShape = this.getShapeDataset();
            return thisShape.doesMatch(shape, strategy);
        }

        public hasSubIndex(): boolean {
            return this.getObjectUri(this.getBaseUri(), IDX.HAS_SUB_INDEX) !== undefined;
        }

        public getTarget(): NamedNode | BlankNode | undefined {
            return this.getObjectLinked(this.getBaseUri(), IDX.HAS_TARGET);
        }

        public getSubIndex(): NamedNode | undefined {
            return this.getObjectUri(this.getBaseUri(), IDX.HAS_SUB_INDEX);
        }

        public getShape(): NamedNode | BlankNode | undefined {
            return this.getObjectLinked(this.getBaseUri(), IDX.HAS_SHAPE);
        }

        // TODO: replace subject _:b2 by namedNode('') === baseUri
        // this way we can use getBaseUri in requests.
        public getShapeDataset(): IndexShape {
            const entryShapeTerm = this.getShape();

            if (!entryShapeTerm) {
                this.log('ERROR', "No triple having the entry as subject and the idx:hasShape as predicate was found.", 0, this.getBaseUri());
                throw new Error("Entry has no shape");
            }
            
            let entryShapeDataset = this.getSubGraph(entryShapeTerm, this.getDefaultGraphTerm());

            if (!entryShapeDataset) {
                this.log('ERROR', `The entry shape ${entryShapeTerm} was not found.`, 0, this.getBaseUri());
                throw new Error("Entry has no shape");
            }

            const addLinkedObjects = (datasetToProcess: DatasetSemantizer) => {
                for (const quadFromDatasetToProcess of datasetToProcess) {
                    const object = quadFromDatasetToProcess.object;
                    if (object.termType === 'NamedNode' || object.termType === 'BlankNode') {
                        const objectDataset = this.getSubGraph(object, this.getDefaultGraphTerm());
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

            return this.getSemantizer().build(indexShapeFactory, entryShapeDataset);
        }

    }
}

export function indexEntryFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(IndexEntryMixin);
}