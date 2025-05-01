import { IndexEntry, MatchShaclPropertyPredicateAndObject } from "@semantizer/mixin-index";
import { ResultCheckerStrategyBase } from "./ResultCheckerStrategyBase.js";

export class ResultCheckerStrategySingle extends ResultCheckerStrategyBase {

    public check(entry: IndexEntry): boolean {
        const strategy = new MatchShaclPropertyPredicateAndObject(entry.getSemantizer(), entry.getBaseUri(), );
        const shapeToCompare = this.getChecker().getTargetShape();
        return entry.doesMatchShape(shapeToCompare, strategy);
    }

}