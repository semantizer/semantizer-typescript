import { BlankNode, DatasetSemantizerMixinConstructor, NamedNode, Semantizer } from "@semantizer/types";
import { indexShapeFactory } from "./IndexShapeMixin.js";
import { IDX } from "./namespaces.js";
import { IndexEntry, IndexShape, IndexShapeComparisonResult } from "./types";

export function IndexEntryMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class IndexEntryMixinImpl extends Base implements IndexEntry {

        // public compareShape(shape: IndexShape): IndexShapeComparisonResult {
        //     const blankNodeShape = this.getShape();

        //     if (!blankNodeShape) {
        //         throw new Error("The entry does not have a shape.");
        //     }

        //     const datasetShape = this.getSubGraph(blankNodeShape, this.getDefaultGraphTerm());
        //     const thisShape = this.getSemantizer().build(indexShapeFactory, datasetShape);

        //     return thisShape.compares(shape);
        // }

        // TODO: rewrite
        public hasSubIndex(): boolean {
            return this.getObjectUri(this.getBaseUri(), IDX.HAS_SUB_INDEX) !== undefined;
        }

        public getTarget(): NamedNode | undefined {
            return this.getObjectUri(this.getBaseUri(), IDX.HAS_TARGET);
        }

        public getSubIndex(): NamedNode | undefined {
            // const predicate = this.getSemantizer().getConfiguration().getRdfDataModelFactory().namedNode('https://ns.inria.fr/idx/terms#hasSubIndex');
            // const dataset = this.getObjectUri(this.getBaseUri(), predicate); // this.getLinkedObject(predicate);
            // return dataset ? this.getSemantizer().build(indexFactory, dataset): undefined;
            return this.getObjectUri(this.getBaseUri(), IDX.HAS_SUB_INDEX);
        }

        public getShape(): BlankNode | undefined {
            // const predicate = this.getSemantizer().getConfiguration().getRdfDataModelFactory().namedNode('https://ns.inria.fr/idx/terms#hasShape');
            // const dataset = this.getObjectUri(this.getBaseUri(), predicate); // this.getLinkedObject(predicate);
            // return dataset ? this.getSemantizer().build(indexShapeFactory, dataset) : undefined;
            const shape = this.getObjectLinked(this.getBaseUri(), IDX.HAS_SHAPE);

            if (shape && shape.termType !== 'BlankNode') {
                throw new Error("Invalid index: a shape is not a BlankNode.");
            }

            return shape;
        }

    }
}

export function indexEntryFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(IndexEntryMixin);
}