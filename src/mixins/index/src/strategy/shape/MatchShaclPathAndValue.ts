import { NamedNode, Semantizer } from "@semantizer/types";
import { IndexShape, IndexShapeComparisonStrategy } from "../../types";
import { MatchShaclPropertyPredicateAndObject } from "./MatchShaclPropertyPredicateAndObject";

export class MatchShaclPathAndValue extends MatchShaclPropertyPredicateAndObject {

    private _value: string;

    public constructor(semantizer: Semantizer, referenceEntry: NamedNode, shaclPath: string, value: string) {
        super(semantizer, referenceEntry, shaclPath);
        this._value = value;
    }

    public doesMatch(referenceShape: IndexShape, shapeToMatchWith: IndexShape): boolean {
        let result = false;

        if (super.doesMatch(referenceShape, shapeToMatchWith)) {

        }

        return result;
    }

}