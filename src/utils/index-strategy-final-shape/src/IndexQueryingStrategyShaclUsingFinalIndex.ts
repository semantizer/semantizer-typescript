import { EntryStreamTransformer, Index, IndexEntry, IndexQueryingOptions, IndexQueryingStrategy, IndexQueryingStrategyBaseShapeImpl } from "@semantizer/mixin-index";
import { Dataset, NamedNode, Semantizer, ShaclValidator } from "@semantizer/types";
import { Readable } from "stream";
import { IndexStrategyFinalShapeDefaultImpl } from "./IndexStrategyFinalShapeDefaultImpl";

export class IndexQueryingStrategyShaclUsingFinalIndex<Entry extends IndexEntry = IndexEntry> extends IndexQueryingStrategyBaseShapeImpl<Entry> {

    private _finalIndexStrategy: IndexQueryingStrategy;

    public constructor(finalIndexShape: Dataset, subIndexShape: Dataset, shaclValidator: ShaclValidator, entryStreamTransformer: EntryStreamTransformer<Entry>, semantizer?: Semantizer) {
        super(finalIndexShape, shaclValidator, entryStreamTransformer, semantizer);
        this._finalIndexStrategy = new IndexStrategyFinalShapeDefaultImpl(finalIndexShape, subIndexShape, shaclValidator, entryStreamTransformer, semantizer);
    }

    protected getFinalIndexes(index: Index, callBack: (indexes: string[]) => void): Readable {
        const finalIndexes: string[] = [];
        const finalIndexStream = index.query(this._finalIndexStrategy);
        finalIndexStream.on('data', (result: NamedNode) => {
            finalIndexes.push(result.value);
            this.log('INFO', "Found final index " + result.value);
        });
        finalIndexStream.on('end', () => callBack(finalIndexes));
        finalIndexStream.on('error', (error) => this.log('ERROR', error.toString()));
        return finalIndexStream;
    }

    public query(index: Index, options?: IndexQueryingOptions): Readable {
        this.getFinalIndexes(index, async (finalIndexes: string[]) => {
            if (finalIndexes.length > 0) {
                super.query(index, options);
            }
            else {
                this.log('WARN', "No final index found.");
                this.pushResult(null);
            }
        });

        return this.getResultStream();
    }

}