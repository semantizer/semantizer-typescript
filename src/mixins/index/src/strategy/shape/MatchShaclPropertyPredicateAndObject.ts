import { Literal, LoggingLevel, NamedNode, Semantizer, Term } from "@semantizer/types";
import { IndexShape, IndexShapeComparisonStrategy, IndexShapeProperty } from "../../types.js";

type PredicateObjectCombination = { predicate: NamedNode, object: NamedNode | Literal };

export class MatchShaclPropertyPredicateAndObject implements IndexShapeComparisonStrategy {

    private _semantizer: Semantizer;
    private _referenceEntry: NamedNode;
    // private _predicateToMatch: NamedNode;
    // private _objectToMatch: NamedNode | Literal;
    private _predicateObjectCombinationsToMatch: PredicateObjectCombination[];
    private _referenceShapeProperties: IndexShapeProperty[];

    // TODO: These properties will be recomputed for each tested entry. But the shape to 
    // compare is normally the same for all the tested index(es). So we could avoid to 
    // recompute these properties by caching them somewhere?
    private _shapeToMatchWithProperties: IndexShapeProperty[];

    public constructor(semantizer: Semantizer, referenceEntry: NamedNode, ...predicateObjectCombinationsToMatch: PredicateObjectCombination[]) {
        this._semantizer = semantizer;
        this._referenceEntry = referenceEntry;
        // this._predicateToMatch = predicateToMatch;
        // this._objectToMatch = objectToMatch;
        this._predicateObjectCombinationsToMatch = predicateObjectCombinationsToMatch;
        this._referenceShapeProperties = [];
        this._shapeToMatchWithProperties = [];
    }

    private init(referenceShape: IndexShape, shapeToMatchWith: IndexShape): void {
        this._referenceShapeProperties = referenceShape.getPropertiesAll();
        this._shapeToMatchWithProperties = shapeToMatchWith.getPropertiesAll();
    }

    // public getPredicateToMatch(): NamedNode {
    //     return this._predicateToMatch;
    // }

    // public getObjectToMatch(): NamedNode | Literal {
    //     return this._objectToMatch;
    // }

    public getPredicateObjectCombinationsToMatch(): PredicateObjectCombination[] {
        return this._predicateObjectCombinationsToMatch;
    }

    protected logMissingMatchingPropertyPredicate(testedShape: 'reference shape' | 'shape to compare'): void {
        const message = `Can't find a ${testedShape} property matching the ${this.getPredicateToMatch().value} predicate for the tested index entry. Look at the MatchShaclPropertyPredicateAndObject strategy of the Index mixin.`;
        this.log("WARN", message, undefined, this._referenceEntry);
    }

    protected log(level: LoggingLevel, message: string, code?: number, subject?: Term): void {
        this._semantizer.log(level, message, code, subject);
    }

    protected getReferenceShapeProperties(): IndexShapeProperty[] {
        return this._referenceShapeProperties;
    }

    protected getShapeToMatchWithProperties(): IndexShapeProperty[] {
        return this._shapeToMatchWithProperties;
    }

    protected getMatchingProperty(properties: IndexShapeProperty[]): IndexShapeProperty | undefined {
        const matchPredicate = (property: IndexShapeProperty) => property.getPath().equals(this.getPredicateToMatch());
        const matchObject = (property: IndexShapeProperty) => property.getValue()?.equals(this.getObjectToMatch()) ?? false;
        return properties.find((p: IndexShapeProperty) => matchPredicate(p) && matchObject(p));
    }

    protected getReferenceShapeMatchingProperty(): IndexShapeProperty | undefined {
        const property = this.getMatchingProperty(this.getReferenceShapeProperties());
        if (!property) {
            this.logMissingMatchingPropertyPredicate('reference shape');
        }
        return property;
    }

    protected getShapeToMatchMatchingProperty(): IndexShapeProperty | undefined {
        const property = this.getMatchingProperty(this.getShapeToMatchWithProperties());
        if (!property) {
            this.logMissingMatchingPropertyPredicate('shape to compare');
        }
        return property;
    }

    public doTargetSameRdfClass(): boolean {
        let result = false;

        const referenceShapeShaclPathRdfTypeProperty = this.getReferenceShapeMatchingProperty();

        if (referenceShapeShaclPathRdfTypeProperty) {
            const shapeToMatchWithShaclPathRdfTypeProperty = this.getShapeToMatchMatchingProperty();

            if (shapeToMatchWithShaclPathRdfTypeProperty) {
                result = referenceShapeShaclPathRdfTypeProperty.hasSameValue(shapeToMatchWithShaclPathRdfTypeProperty);
            }
        }

        return result;
    }

    public doesMatch(referenceShape: IndexShape, shapeToMatchWith: IndexShape): boolean {
        this.init(referenceShape, shapeToMatchWith);
        return this.doTargetSameRdfClass();
    }

}