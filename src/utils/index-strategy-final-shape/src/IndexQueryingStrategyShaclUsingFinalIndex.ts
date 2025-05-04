import indexFactory, { EntryStreamTransformer, Index, IndexEntry, IndexQueryingOptions, IndexQueryingStrategy, IndexQueryingStrategyBaseShapeImpl } from "@semantizer/mixin-index";
import { Dataset, NamedNode, Semantizer, ShaclValidator } from "@semantizer/types";
import { Readable } from "stream";
import { IndexStrategyFinalShapeDefaultImpl } from "./IndexStrategyFinalShapeDefaultImpl.js";

export class IndexQueryingStrategyShaclUsingFinalIndex<Entry extends IndexEntry = IndexEntry> extends IndexQueryingStrategyBaseShapeImpl<Entry> {

    private _finalIndexStrategy: IndexQueryingStrategy;

    public constructor(finalIndexShape: Dataset, subIndexShape: Dataset, shaclValidator: ShaclValidator, entryStreamTransformer: EntryStreamTransformer<Entry>, semantizer?: Semantizer) {
        super(finalIndexShape, shaclValidator, entryStreamTransformer, semantizer);
        this._finalIndexStrategy = new IndexStrategyFinalShapeDefaultImpl(finalIndexShape, subIndexShape, shaclValidator, entryStreamTransformer, semantizer);
    }

    public getFinalIndexesStream(index: Index): Readable {
        const finalIndexStream = index.query(this._finalIndexStrategy);
        finalIndexStream.on('data', (result: NamedNode) => {
            this.log('INFO', "Found final index " + result.value);
        });
        finalIndexStream.on('error', (error) => this.log('ERROR', error.toString()));
        return finalIndexStream;
    }

    public query(index: Index, options?: IndexQueryingOptions): Readable {
        this.init(options);
        this.getFinalIndexesStream(index).on('data', (finalIndex: NamedNode) => {
            const finalIndexDataset = this.getSemantizer().build(indexFactory);
            finalIndexDataset.setBaseUri(finalIndex);
            this.process(finalIndexDataset); 
        });
        return this.getResultStream();
    }

}