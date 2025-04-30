import { Literal, LoggingLevel, NamedNode, Semantizer, Term } from "@semantizer/types";
import { IndexEntry, IndexShapeProperty } from "../../types.js";

type PredicateObjectCombination = { predicate: NamedNode, object: NamedNode | Literal };

export class MatchShaclPropertyPredicateAndObject {

    private _semantizer: Semantizer;
    private _referenceEntry: IndexEntry;
    private _predicateObjectCombinationsToMatch: PredicateObjectCombination[];
    private _referenceShapeProperties: IndexShapeProperty[];

    public constructor(semantizer: Semantizer, referenceEntry: IndexEntry, ...predicateObjectCombinationsToMatch: PredicateObjectCombination[]) {
        this._semantizer = semantizer;
        this._referenceEntry = referenceEntry;
        this._predicateObjectCombinationsToMatch = predicateObjectCombinationsToMatch;
        this._referenceShapeProperties = referenceEntry.getShapeDataset().getPropertiesAll();
    }

    public countPredicateObjectCombinationsToMatch(): number {
        return this._predicateObjectCombinationsToMatch.length;
    }

    public getPredicateObjectCombinationsToMatch(): PredicateObjectCombination[] {
        return this._predicateObjectCombinationsToMatch;
    }

    protected log(level: LoggingLevel, message: string, code?: number, subject?: Term): void {
        this._semantizer.log(level, message, code, subject);
    }

    protected getReferenceShapeProperties(): IndexShapeProperty[] {
        return this._referenceShapeProperties;
    }

    protected getMatchingProperties(properties: IndexShapeProperty[]): IndexShapeProperty[] {
        const results: IndexShapeProperty[] = [];
        for (const { predicate, object } of this.getPredicateObjectCombinationsToMatch()) {
            const matchPredicate = (property: IndexShapeProperty) => property.getPath().equals(predicate);
            const matchObject = (property: IndexShapeProperty) => property.getValue()?.equals(object) ?? false;
            const property = properties.find((p: IndexShapeProperty) => matchPredicate(p) && matchObject(p));
            if (property) {
                results.push(property);
            } else {
                const message = `Can't find a property matching the ${predicate.value} predicate and the  ${object.value} object for the tested index entry. Look at the MatchShaclPropertyPredicateAndObject strategy of the Index mixin.`;
                this.log("WARN", message, undefined, this._referenceEntry.getBaseUri());
            }
        }
        return results;
    }

    public doesMatch(): boolean {
        const properties = this.getMatchingProperties(this.getReferenceShapeProperties());
        return properties.length === this.countPredicateObjectCombinationsToMatch();
    }

}