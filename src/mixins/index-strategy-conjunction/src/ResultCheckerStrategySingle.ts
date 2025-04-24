import { ResultCheckerStrategyBase } from "./ResultCheckerStrategyBase.js";
import { IndexEntry, IndexShapeComparisonStrategyDefaultImpl } from "@semantizer/mixin-index";

export class ResultCheckerStrategySingle extends ResultCheckerStrategyBase {

    public check(entry: IndexEntry): boolean {
        const strategy = new IndexShapeComparisonStrategyDefaultImpl(this.getChecker().getSemantizer().log);
        const shapeToCompare = this.getChecker().getTargetShape();
        const check = entry.compareShape(shapeToCompare, strategy);
        return check.areTargetedRdfTypePathsAndTargetedPropertyPathsAndValuesEqual();
    }

}