import { BlankNode, DatasetSemantizerMixinConstructor, Literal, NamedNode, Semantizer } from "@semantizer/types";
// import { indexShapePropertyPatternFactory, indexShapePropertyValueFactory } from "./IndexShapePropertyMixin.js";
import { IndexShape, IndexShapeComparisonStrategy, IndexShapeProperty } from "./types";
import { RDF, SHACL } from "./namespaces.js";
import { IndexShapePropertyDefaultImpl } from "./IndexShapePropertyDefaultImpl.js";

export function IndexShapeMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class IndexShapeMixinImpl extends Base implements IndexShape {

        public constructor(...args: any[]) {
            super(...args);
            // Should be removed and moved to factory instead to avoid adding it 
            // twice (one from entry transformer + this one)?
            this.addObjectUri(this.getBaseUri(), RDF.TYPE, SHACL.NODE_SHAPE);
        }

        public doesMatch(other: IndexShape, strategy: IndexShapeComparisonStrategy): boolean {
            return strategy.doesMatch(this, other);
        }

        // TODO: ENHANCE
        public countProperties(): number {
            return this.getPropertiesAll().length;
        }

        public forEachProperty(callbackfn: (value: IndexShapeProperty, index?: number | undefined, array?: IndexShapeProperty[] | undefined) => void): void {
            this.getPropertiesAll().forEach(p => callbackfn(p));
        }

        public addTargetRdfType(rdfType: NamedNode): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const path = dataFactory.namedNode(RDF.TYPE);
            const predicate = dataFactory.namedNode(SHACL.HAS_VALUE);
            _addProperty(this, path, predicate, rdfType);
            this.addObjectUri(this.getBaseUri(), RDF.TYPE, SHACL.HAS_VALUE, )
        }

        public addValueProperty(path: NamedNode, value: NamedNode | Literal | BlankNode): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = dataFactory.namedNode(SHACL.HAS_VALUE);
            _addProperty(this, path, predicate, value);
        }

        public addPatternProperty(path: NamedNode, value: NamedNode | Literal | BlankNode): void {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = dataFactory.namedNode(SHACL.PATTERN);
            _addProperty(this, path, predicate, value);
        }

        public getPropertiesAll(): IndexShapeProperty[] {
            const results: IndexShapePropertyDefaultImpl[] = [];
            const properties = this.getObjectLinkedAll(this.getBaseUri(), SHACL.PROPERTY);
            if (properties) {
                for (const property of properties) {
                    if (['NamedNode', 'BlankNode'].includes(property.termType)) {
                        const propertyDataset = this.getSubGraph(property as NamedNode | BlankNode, this.getDefaultGraphTerm());
                        if (propertyDataset) {
                            for (const quad of propertyDataset) {
                                if (quad.predicate.termType === 'NamedNode' && ['NamedNode', 'BlankNode', 'Literal'].includes(quad.object.termType)) {
                                    results.push(
                                        new IndexShapePropertyDefaultImpl(
                                            quad.predicate,
                                            quad.object as NamedNode | Literal
                                        )
                                    );
                                }
                            }
                        }
                    }
                }
            }
            return results;
        }

    }

}

export function indexShapeFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(IndexShapeMixin);
}

// TODO: we should not use blank nodes anymore
const _addProperty = (shape: IndexShape, path: NamedNode, predicate: NamedNode, value: NamedNode | Literal | BlankNode): void => {
    const dataFactory = shape.getSemantizer().getConfiguration().getRdfDataModelFactory();
    const property = dataFactory.blankNode();

    shape.add(
        dataFactory.quad(
            property,
            dataFactory.namedNode(SHACL.PATH),
            path
        )
    );

    shape.add(
        dataFactory.quad(
            property,
            predicate,
            value
        )
    );

    shape.add(
        dataFactory.quad(
            shape.getBaseUri()!,
            dataFactory.namedNode(SHACL.PROPERTY),
            property
        )
    );
}