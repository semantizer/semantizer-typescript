import { EntryStreamTransformer, Index, IndexEntry, IndexQueryingOptions, IndexQueryingStrategy, IndexQueryingStrategyBaseShapeImpl } from "@semantizer/mixin-index";
import { Dataset, NamedNode, Semantizer, ShaclValidator } from "@semantizer/types";
import { Readable } from "stream";
import { IndexStrategyFinalShapeDefaultImpl } from "./IndexStrategyFinalShapeDefaultImpl.js";

export class IndexQueryingStrategyShaclUsingFinalIndex<Entry extends IndexEntry = IndexEntry> extends IndexQueryingStrategyBaseShapeImpl<Entry> {

    private _finalIndexStrategy: IndexQueryingStrategy;
    private _finalIndexes: NamedNode[];

    public constructor(finalIndexShape: Dataset, subIndexShape: Dataset, shaclValidator: ShaclValidator, entryStreamTransformer: EntryStreamTransformer<Entry>, semantizer?: Semantizer) {
        super(finalIndexShape, shaclValidator, entryStreamTransformer, semantizer);
        this._finalIndexStrategy = new IndexStrategyFinalShapeDefaultImpl(finalIndexShape, subIndexShape, shaclValidator, entryStreamTransformer, semantizer);
        this._finalIndexes = [];
    }

    protected init(options?: IndexQueryingOptions): void {
        if (this.isInitialized()) {
            this._finalIndexes = [];
        }
        super.init(options);
    }

    public getFinalIndexes(): NamedNode[] {
        return this._finalIndexes;
    }

    protected getFinalIndexesStream(index: Index, callBack: (indexes: NamedNode[]) => void): Readable {
        const finalIndexes: NamedNode[] = [];
        const finalIndexStream = index.query(this._finalIndexStrategy);
        finalIndexStream.on('data', (result: NamedNode) => {
            finalIndexes.push(result);
            this.log('INFO', "Found final index " + result.value);
        });
        finalIndexStream.on('end', () => callBack(finalIndexes));
        finalIndexStream.on('error', (error) => this.log('ERROR', error.toString()));
        return finalIndexStream;
    }

    public query(index: Index, options?: IndexQueryingOptions): Readable {
        this.getFinalIndexesStream(index, async (finalIndexes: NamedNode[]) => {
            if (finalIndexes.length > 0) {
                this._finalIndexes = finalIndexes;
                this.process(index);
            }
            else {
                this.log('WARN', "No final index found.");
                this.pushResult(null);
            }
        });

        return this.getResultStream();
    }

}