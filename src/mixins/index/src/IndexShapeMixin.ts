import { BlankNode, DatasetSemantizerMixinConstructor, Literal, NamedNode, Semantizer, ShaclValidator } from "@semantizer/types";
import { RDF, SHACL } from "./namespaces.js";
import { IndexShape, IndexShapeProperty } from "./types";

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

        public doesMatch(other: IndexShape, shaclValidator: ShaclValidator): boolean {
            throw new Error("Not implemented.");
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
            throw new Error("Not implemented.");
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