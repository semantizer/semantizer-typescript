import { BlankNode, DatasetSemantizerMixinConstructor, Literal, NamedNode, Semantizer } from "@semantizer/types";
import { indexShapePropertyPatternFactory, indexShapePropertyValueFactory } from "./IndexShapePropertyMixin.js";
import { IndexShape, IndexShapeComparisonResult, IndexShapeProperty } from "./types";
import { RDF, SHACL } from "./namespaces.js";

export function IndexShapeMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class IndexShapeMixinImpl extends Base implements IndexShape {

        public constructor(...args: any[]) {
            super(...args);
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            this.add(
                dataFactory.quad(
                    this.getBaseUri()!,
                    dataFactory.namedNode(RDF.TYPE),
                    dataFactory.namedNode(SHACL.NODE_SHAPE)
                )
            );
        }

        // public hasMultiCriteria(): boolean {
        //     return this.getFilterProperties().length > 1;
        // }

        // public getRdfTypeProperty(): IndexShapeProperty {
        //     for (const p of this.getPropertiesAll()) {
        //         const path = p.getPath();
        //         if (path && path.value === RDF.TYPE) {
        //             return p;
        //         }
        //     }
        //     throw new Error("No Rdf type property was found.");
        // }

        // public getFilterProperties(): IndexShapeProperty[] {
        //     const properties: IndexShapeProperty[] = [];
        //     for (const p of this.getPropertiesAll()) {
        //         const path = p.getPath();
        //         if (path && path.value !== RDF.TYPE) {
        //             properties.push(p);
        //         }
        //     }
        //     return properties;
        // }

        // /**
        //  * 
        //  * @param other 
        //  * @returns -2 if the targeted RDF types are different, -1 if the targeted RDF types 
        //  * are equals but the targeted values path are different, 0 if the targeted RDF types 
        //  * are equals and the targeted values path are equals, and 1 if the targeted RDF types 
        //  * are equals and the targeted values are equals.
        //  */
        // public compares(other: IndexShape): IndexShapeComparisonResult {
        //     const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();

        //     if (!this.getRdfTypeProperty().equals(other.getRdfTypeProperty())) {
        //         return new IndexShapeComparisonResultImpl(-2, dataFactory.namedNode(RDF.TYPE));
        //     }

        //     for (const thisProperty of this.getFilterProperties()) {
        //         for (const otherProperty of other.getFilterProperties()) {
        //             const comparisonResult = thisProperty.compares(otherProperty);
        //             if (comparisonResult === 0 || comparisonResult === 1) {
        //                 return new IndexShapeComparisonResultImpl(comparisonResult, thisProperty.getPath()!);
        //             }
        //         }
        //     }

        //     return new IndexShapeComparisonResultImpl(-1, dataFactory.namedNode('')); //throw new Error("No filter property was found."); // return -1;
        // }

        // TODO: enhance
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
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            // const predicate = dataFactory.namedNode(SHACL.PROPERTY);
            const properties = this.getObjectLinkedAll(this.getBaseUri(), SHACL.PROPERTY);
            const results: IndexShapeProperty[] = [];

            // Warning here: this code creates the property which can be either instance of 
            // ShapePropertyValue or ShapePropertyPattern. To evaluate which one to create 
            // we test if the property has a sh:pattern predicate. In the case of the meta-meta 
            // index (root level), the sh:pattern will likely not be present and a Value 
            // property will be created instead of a Pattern property. At this step we can't 
            // know which one to create. There is no pb since this code is called each time we 
            // try to access to the properties of the shape.
            if (properties) {
                for (const property of properties) {
                    if (property.termType === 'NamedNode' || property.termType === 'BlankNode' || typeof property === 'string') {
                        const dataset = this.getSubGraph(property, this.getDefaultGraphTerm());
                        if (dataset) {
                            if (dataset.some(q => q.predicate.equals(dataFactory.namedNode(SHACL.PATTERN)))) {
                                results.push(this.getSemantizer().build(indexShapePropertyPatternFactory, dataset));
                            }
                            else results.push(this.getSemantizer().build(indexShapePropertyValueFactory, dataset));
                        }
                    } else throw new Error("Invalid property type.");
                }
            }

            return results;
        }

    }

}

export function indexShapeFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(IndexShapeMixin);
}

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

export class IndexShapeComparisonResultImpl implements IndexShapeComparisonResult<number> {

    private _result: number;
    private _path: NamedNode;

    public constructor(result: number, path: NamedNode) {
        this._result = result;
        this._path = path;
    }

    public getResult(): number {
        return this._result;
    }

    public getComparedPath(): NamedNode {
        return this._path;
    }

}