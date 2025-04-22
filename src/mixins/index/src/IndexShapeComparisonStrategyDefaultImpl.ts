import { BlankNode, DatasetSemantizer, Literal, NamedNode } from "@semantizer/types";
import { Index, IndexEntry, IndexStrategyLog, IndexShape, IndexShapeComparisonResult, IndexShapeComparisonStrategy, IndexLoggingLevel } from "./types";
import { IndexShapeComparisonResultImpl } from "./IndexShapeMixin";
import { IDX, RDF, SHACL } from "./namespaces";

/**
 * @param other 
 * @returns -2 if the targeted RDF types are different, -1 if the targeted RDF types 
 * are equals but the targeted values path are different, 0 if the targeted RDF types 
 * are equals and the targeted values path are equals, and 1 if the targeted RDF types 
 * are equals and the targeted values are equals.
 */
export class IndexShapeComparisonStrategyDefaultImpl implements IndexShapeComparisonStrategy<number> {

    private _propertiesOfEntryShape: ShapeProperty[];
    private _propertiesOfShapeToCompare: ShapeProperty[];
    private _addLogEntry: (level: IndexLoggingLevel, indexEntry: NamedNode, message: string) => void;

    public constructor(addLogEntry: (level: IndexLoggingLevel, indexEntry: NamedNode, message: string) => void) {
        this._propertiesOfEntryShape = [];
        this._propertiesOfShapeToCompare = [];
        this._addLogEntry = addLogEntry;
    }

    private init(entry: IndexEntry, shape: IndexShape): void {
        const entryShape = this.getEntryShape(entry);
        this._propertiesOfEntryShape = this.getShapePropertiesAll(entryShape);
        this._propertiesOfShapeToCompare = this.getShapePropertiesAll(shape);
    }

    protected addLogEntry(level: IndexLoggingLevel, indexEntry: NamedNode, message: string): void {
        this._addLogEntry(level, indexEntry, message);
    }

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

    // public getEntryRdfTypePropertyValue(index: Index, entry: NamedNode | string): NamedNode | undefined {
    //     return index.getObjectUri(property, SHACL.PATH)
    // }

    public getEntryShape(entry: IndexEntry): DatasetSemantizer {
        const entryShapeTerm = entry.getObjectLinked(entry.getBaseUri(), IDX.HAS_SHAPE);
        if (!entryShapeTerm) {
            this.addLogEntry('ERROR', entry.getBaseUri(), "Entry has no shape");
            throw new Error("Entry has no shape");
        }
        const entryShape = entry.getSubGraph(entryShapeTerm, entry.getDefaultGraphTerm());
        if (!entryShape) throw new Error("Entry has no shape");
        return entryShape;
    }

    public getShapePropertiesAll(shape: DatasetSemantizer): ShapeProperty[] {
        const results: ShapeProperty[] = [];
        const properties = shape.getObjectLinkedAll(shape.getBaseUri(), SHACL.PROPERTY);
        if (properties) {
            for (const property of properties) {
                if (['NamedNode', 'BlankNode'].includes(property.termType)) {
                    const propertyDataset = shape.getSubGraph(property as NamedNode | BlankNode, shape.getDefaultGraphTerm());
                    if (propertyDataset) {
                        for (const quad of propertyDataset) {
                            if (quad.predicate.termType === 'NamedNode' && ['NamedNode', 'BlankNode', 'Literal'].includes(quad.object.termType)) {
                                results.push(
                                    new ShapeProperty(
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

    public getTargetShapeProperty(properties: ShapeProperty[]): ShapeProperty {
        const target = properties.find((p: ShapeProperty) => p.getPath().value === RDF.TYPE);
        if (!target) throw new Error("Shape does not have a target path.");
        return target;
    }

    public doTargetSameClass(): boolean {
        const targetOfEntryShape = this.getTargetShapeProperty(this._propertiesOfEntryShape);
        const targetOfShapeToCompare = this.getTargetShapeProperty(this._propertiesOfShapeToCompare);
        return targetOfEntryShape.hasSameValue(targetOfShapeToCompare);
    }

    protected mustTargetSameClass(): void {
        if (!this.doTargetSameClass) {
            throw new Error("The entry does not target the same class.");
        }
    }

    public execute(entry: IndexEntry, shape: IndexShape): IndexShapeComparisonResult<number> {
        this.init(entry, shape);
        this.mustTargetSameClass();
    }
}

    /**
         * 
         * @param other 
         * @returns -2 if the targeted RDF types are different, -1 if the targeted RDF types 
         * are equals but the targeted values path are different, 0 if the targeted RDF types 
         * are equals and the targeted values path are equals, and 1 if the targeted RDF types 
         * are equals and the targeted values are equals.
         */
    public compares(other: IndexShape): IndexShapeComparisonResult < number > {
    const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();

    if(!this.getRdfTypeProperty().equals(other.getRdfTypeProperty())) {
    return new IndexShapeComparisonResultImpl(-2, dataFactory.namedNode(RDF.TYPE));
}

for (const thisProperty of this.getFilterProperties()) {
    for (const otherProperty of other.getFilterProperties()) {
        const comparisonResult = thisProperty.compares(otherProperty);
        if (comparisonResult === 0 || comparisonResult === 1) {
            return new IndexShapeComparisonResultImpl(comparisonResult, thisProperty.getPath()!);
        }
    }
}

return new IndexShapeComparisonResultImpl(-1, dataFactory.namedNode('')); //throw new Error("No filter property was found."); // return -1;
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

class ShapeProperty {

    private _path: NamedNode;
    private _value: Literal | NamedNode | undefined;

    public constructor(path: NamedNode, value: Literal | NamedNode | undefined) {
        this._path = path;
        this._value = value;
    }

    public getValue(): Literal | NamedNode | undefined {
        return this._value;
    }

    public getPath(): NamedNode {
        return this._path;
    }

    public hasSamePath(other: ShapeProperty): boolean {
        return this.getPath()?.equals(other.getPath()) ?? false;
    }

    public hasSameValue(other: ShapeProperty): boolean {
        if (!this.getValue())
            throw new Error("This property to compare has no value.");
        return this.getValue()!.equals(other.getValue()); // this.getValue must be checked before
    }

    public equals(other: ShapeProperty): boolean {
        return this.hasSamePath(other) && this.hasSameValue(other);
    }

    /**
     * @param other 
     * @returns -1 if paths are different or if both paths and values are different, 0 if paths are the same 
     * but `this` property has no value, and 1 if both paths and values are equals.
     */
    public compares(other: ShapeProperty): number {
        if (!this.hasSamePath(other)) {
            return -1
        }

        if (this.getValue()) {
            return this.hasSameValue(other) ? 1 : -1;
        }

        return 0;
    }

}