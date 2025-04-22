import { BlankNode, DatasetSemantizerMixinConstructor, NamedNode, Semantizer } from "@semantizer/types";
import { IDX } from "./namespaces.js";
import { IndexEntry, IndexShape, IndexShapeComparisonResult, IndexShapeComparisonStrategy } from "./types";

/**
 * This mixin is used internally by the `IndexMixin:loadEntryStream()` method
 * @param Base 
 * @returns 
 */
export function IndexEntryMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class IndexEntryMixinImpl extends Base implements IndexEntry {

        public compareShape<ComparisonResult>(shape: IndexShape, strategy: IndexShapeComparisonStrategy<ComparisonResult>): IndexShapeComparisonResult<ComparisonResult> {
            return strategy.execute(this, shape);
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

    }
}

export function indexEntryFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(IndexEntryMixin);
}