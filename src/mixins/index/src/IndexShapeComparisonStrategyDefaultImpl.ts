import { LoggingLevel, NamedNode, Term } from "@semantizer/types";
import { RDF, SHACL } from "./namespaces.js";
import { IndexShape, IndexShapeComparisonStrategy, IndexShapeProperty } from "./types";

export class IndexShapeComparisonStrategyDefaultImpl implements IndexShapeComparisonStrategy<IndexShapeComparisonStrategyResult> {

    private _propertiesOfEntryShape: IndexShapeProperty[];
    private _propertiesOfShapeToCompare: IndexShapeProperty[];
    private _addLogEntry: (level: LoggingLevel, message: string, code?: number, subject?: Term) => void;

    public constructor(addLogEntry: (level: LoggingLevel, message: string, code?: number, subject?: Term) => void) {
        this._propertiesOfEntryShape = [];
        this._propertiesOfShapeToCompare = [];
        this._addLogEntry = addLogEntry;
    }

    private init(entryShape: IndexShape, shapeToCompare: IndexShape): void {
        this._propertiesOfEntryShape = entryShape.getPropertiesAll();
        this._propertiesOfShapeToCompare = shapeToCompare.getPropertiesAll();
    }

    protected addLogEntry(level: LoggingLevel, message: string, code?: number, subject?: Term): void {
        this._addLogEntry(level, message, code, subject);
    }

    public getPropertyHavingPathEqualToRdfType(properties: IndexShapeProperty[]): IndexShapeProperty {
        const property = properties.find((p: IndexShapeProperty) => p.getPath().value === SHACL.PATH && p.getValue()?.value === RDF.TYPE);
        if (!property) throw new Error("Shape does not have a target path.");
        return property;
    }

    public getPropertiesWithWithSchaclPathDifferentThanRdfType(properties: IndexShapeProperty[]): IndexShapeProperty[] {
        return properties.filter((p: IndexShapeProperty) => p.getPath().value === SHACL.PATH && p.getValue()?.value !== RDF.TYPE);
    }

    public getPropertyForSchaclPath(properties: IndexShapeProperty[], shaclPathValue: string): IndexShapeProperty[] {
        return properties.filter((p: IndexShapeProperty) => p.getPath().value === SHACL.PATH && p.getValue()?.value == shaclPathValue);
    }


    public doTargetSameRdfClass(): boolean {
        const targetOfEntryShape = this.getPropertyHavingPathEqualToRdfType(this._propertiesOfEntryShape);
        const targetOfShapeToCompare = this.getPropertyHavingPathEqualToRdfType(this._propertiesOfShapeToCompare);
        return targetOfEntryShape.hasSameValue(targetOfShapeToCompare);
    }

    public doesEntryMatchWithShapeToCompareProperty(shapeProperty: IndexShapeProperty): number {
        let result = -1;
        const entryShapeProperties = this.getPropertiesWithWithSchaclPathDifferentThanRdfType(this._propertiesOfEntryShape);
        for (const entryShapeProperty of entryShapeProperties) {

        }
        return result;
    }

    /**
     * @param shapeToCompareProperty 
     * @returns -1 if paths are different or if both paths and values are different, 0 if paths are the same 
     * but `this` property has no value, and 1 if both paths and values are equals.
     */
    // public compares(entryShapeProperty: IndexShapeProperty, shapeToCompareProperty: IndexShapeProperty): number {
    //     if (!entryShapeProperty.hasSamePath(shapeToCompareProperty)) {
    //         return -1;
    //     }

    //     if (entryShapeProperty.getValue()) {
    //         return entryShapeProperty.hasSameValue(shapeToCompareProperty) ? 1 : -1;
    //     }

    //     return 0;
    // }

    public doTargetSameValuesPathAndValues(): number {
        let result: number = -1;

        const entryShapeProperties = this.getPropertiesWithWithSchaclPathDifferentThanRdfType(this._propertiesOfEntryShape);
        const shapeToCompareProperties = this.getPropertiesWithWithSchaclPathDifferentThanRdfType(this._propertiesOfShapeToCompare);

        if (shapeToCompareProperties.length > 0) {
            for (const shapeToCompareProperty of shapeToCompareProperties) {
                const entryShapeSameShaclPathValueProperty = entryShapeProperties.find(p => p.hasSameValue(shapeToCompareProperty));
                if (entryShapeSameShaclPathValueProperty) {
                    const entryShapeValueProperty = entryShapeProperties.find(p => p.getPath().value === SHACL.HAS_VALUE);
                    if (shapeToCompareProperty.hasSameValue(entryShapeSameShaclPathValueProperty)) {
                        result = 0;
                    }
                    if (entryShapeValueProperty && entryShapeValueProperty.hasSameValue()) {
                        result = 1;
                        break;
                    }
                }
            }
        }

        return result;
    }

    // protected mustTargetSameClass(): void {
    //     if (!this.doTargetSameClass) {
    //         throw new Error("The entry does not target the same class.");
    //     }
    // }

    // public execute(entry: IndexEntry, shape: IndexShape): IndexShapeComparisonResult<number> {
    public execute(entryShape: IndexShape, shapeToCompare: IndexShape): IndexShapeComparisonStrategyResult {
        this.init(entryShape, shapeToCompare);

        let result: number = -2;

        if (this.doTargetSameRdfClass()) {
            result = this.doTargetSameValuesPathAndValues();
        }

        return new IndexShapeComparisonStrategyResult(result);
    }

}


class IndexShapeComparisonStrategyResult {

    private _result: number;

    /**
     * @param result Pass -2 if the targeted RDF types are different, -1 if the targeted RDF types 
     * are equals but the targeted values path are different, 0 if the targeted RDF types 
     * are equals and the targeted values path are equals, and 1 if the targeted RDF types 
     * are equals and the targeted values are equals.
     */
    public constructor(result: number) {
        this._result = result;
    }

    public areTargetedRdfTypePathsDifferent(): boolean {
        return this._result === -2;
    }

    public areTargetedRdfTypePathsEqual(): boolean {
        return this._result >= -1;
    }

    public areTargetedRdfTypePathsEqualButTargetedPropertyPathsAreDifferent(): boolean {
        return this._result === -1;
    }

    public areTargetedRdfTypePathsAndTargetedPropertyPathsEqual(): boolean {
        return this._result === 0;
    }

    public areTargetedRdfTypePathsAndTargetedPropertyPathsAndValuesEqual(): boolean {
        return this._result === 1;
    }

    public getComparedPath(): NamedNode {
        throw new Error;
    }

}

//     /**
//          * 
//          * @param other 
//          * @returns -2 if the targeted RDF types are different, -1 if the targeted RDF types 
//          * are equals but the targeted values path are different, 0 if the targeted RDF types 
//          * are equals and the targeted values path are equals, and 1 if the targeted RDF types 
//          * are equals and the targeted values are equals.
//          */
//     public compares(other: IndexShape): IndexShapeComparisonResult < number > {
//     const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();

//     if(!this.getRdfTypeProperty().equals(other.getRdfTypeProperty())) {
//     return new IndexShapeComparisonResultImpl(-2, dataFactory.namedNode(RDF.TYPE));
// }

// for (const thisProperty of this.getFilterProperties()) {
//     for (const otherProperty of other.getFilterProperties()) {
//         const comparisonResult = thisProperty.compares(otherProperty);
//         if (comparisonResult === 0 || comparisonResult === 1) {
//             return new IndexShapeComparisonResultImpl(comparisonResult, thisProperty.getPath()!);
//         }
//     }
// }

// return new IndexShapeComparisonResultImpl(-1, dataFactory.namedNode('')); //throw new Error("No filter property was found."); // return -1;
//     }

//     public getPropertiesAll(): IndexShapeProperty[] {
//     const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
//     // const predicate = dataFactory.namedNode(SHACL.PROPERTY);
//     const properties = this.getObjectLinkedAll(this.getBaseUri(), SHACL.PROPERTY);
//     const results: IndexShapeProperty[] = [];

//     // Warning here: this code creates the property which can be either instance of 
//     // ShapePropertyValue or ShapePropertyPattern. To evaluate which one to create 
//     // we test if the property has a sh:pattern predicate. In the case of the meta-meta 
//     // index (root level), the sh:pattern will likely not be present and a Value 
//     // property will be created instead of a Pattern property. At this step we can't 
//     // know which one to create. There is no pb since this code is called each time we 
//     // try to access to the properties of the shape.
//     if (properties) {
//         for (const property of properties) {
//             if (property.termType === 'NamedNode' || property.termType === 'BlankNode' || typeof property === 'string') {
//                 const dataset = this.getSubGraph(property, this.getDefaultGraphTerm());
//                 if (dataset) {
//                     if (dataset.some(q => q.predicate.equals(dataFactory.namedNode(SHACL.PATTERN)))) {
//                         results.push(this.getSemantizer().build(indexShapePropertyPatternFactory, dataset));
//                     }
//                     else results.push(this.getSemantizer().build(indexShapePropertyValueFactory, dataset));
//                 }
//             } else throw new Error("Invalid property type.");
//         }
//     }

//     return results;
// }

