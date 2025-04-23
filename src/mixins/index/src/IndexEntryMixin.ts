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

        public compareShape<ComparisonResult>(shape: IndexShape, strategy: IndexShapeComparisonStrategy<ComparisonResult>): ComparisonResult {
            const thisShape = this.getShapeDataset();
            return thisShape.compareTo(shape, strategy);
            // return strategy.execute(this, shape);
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

        public getShapeDataset(): IndexShape {
            const entryShapeTerm = this.getShape();
            if (!entryShapeTerm) {
                this.log('ERROR', "No triple having the entry as subject and the idx:hasShape as predicate was found.", 0, this.getBaseUri());
                throw new Error("Entry has no shape");
            }
            
            const entryShapeDataset = this.getSubGraph(entryShapeTerm, this.getDefaultGraphTerm());
            if (!entryShapeDataset) {
                this.log('ERROR', `The entry shape ${entryShapeTerm} was not found.`, 0, this.getBaseUri());
                throw new Error("Entry has no shape");
            }

            return this.getSemantizer().build(indexShapeFactory, entryShapeDataset);
        }

    }
}

export function indexEntryFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(IndexEntryMixin);
}