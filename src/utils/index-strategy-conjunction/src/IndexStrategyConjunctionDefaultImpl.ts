import { FinalIndexResult, IndexEntry, IndexShapeProperty, IndexStrategyBaseShapeImpl, IndexStrategyFinalIndexesDefaultImpl, RDF } from "@semantizer/mixin-index";
import { NamedNode } from "@semantizer/types";
import { ResultCheckerDefaultImpl } from "./ResultCheckerDefaultImpl.js";
// import { ResultCheckerStrategyMultiple } from "./ResultCheckerStrategyMultiple.js";
import { ResultCheckerStrategySingle } from "./ResultCheckerStrategySingle.js";
import { ResultCheckerStrategy } from "./types.js";

// TODO: add a bypass shape mode on target indexes to avoid to recompare
// the shape as all the index's entries are supposed to target a valid 
// shape.
export class IndexStrategyConjunctionDefaultImpl extends IndexStrategyBaseShapeImpl {

    protected hasShapeMultiCriteria(): boolean {
        const properties = this.getShape().getPropertiesAll().filter((p: IndexShapeProperty) => p.getPath().value !== RDF.TYPE);
        return properties ? properties.length > 1 : false;
    }

    private selectResultCheckerStategy(): ResultCheckerStrategy {
        // return this.hasShapeMultiCriteria() ? new ResultCheckerStrategyMultiple() : new ResultCheckerStrategySingle();
        return new ResultCheckerStrategySingle();
    }

    private makeResultChecker(): ResultCheckerDefaultImpl {
        const strategy = this.selectResultCheckerStategy();
        return new ResultCheckerDefaultImpl(this.getSemantizer(), this.getShape(), strategy);
    }

    public async execute(rootIndex: NamedNode | string, callbackfn: (target: NamedNode) => void, limit?: number): Promise<void> {
        let resultCount = 0;
        const limitCount: number = limit ? limit : 30;
        const finalIndexesStrategy = new IndexStrategyFinalIndexesDefaultImpl(this.getSemantizer());
        const finalIndexStream = finalIndexesStrategy.execute(rootIndex, this.getShape(), limit);
        const resultChecker = this.makeResultChecker();

        resultChecker.on('data', (entry: IndexEntry) => {
            if (resultCount >= limitCount) {
                resultChecker.pause();
                resultCount = 0;
            } else {
                const target = entry.getTarget();
                if (target && target.termType === 'NamedNode') {
                    callbackfn(target);
                    resultCount++;
                }
            }
        });

        finalIndexStream.on('data', (result: FinalIndexResult) => resultChecker.addIndex(result.getIndex()));
        finalIndexStream.on('error', (error) => console.warn(error));

        return new Promise<void>((resolve, reject) => {
            resultChecker.on('end', () => { resolve() });
            resultChecker.on('error', (error) => reject(error));
        })

    }

}