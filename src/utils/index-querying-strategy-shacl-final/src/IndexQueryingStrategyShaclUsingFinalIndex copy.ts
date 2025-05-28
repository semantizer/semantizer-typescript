import indexFactory, { EntryStreamTransformer, Index, IndexEntry, IndexQueryingOptions, IndexQueryingStrategy, IndexQueryingStrategyBaseShapeImpl } from "@semantizer/mixin-index";
import { Dataset, NamedNode, ShaclValidator } from "@semantizer/types";
import { Readable } from "stream";

export abstract class IndexQueryingStrategyShaclUsingFinalIndex<Entry extends IndexEntry = IndexEntry> extends IndexQueryingStrategyBaseShapeImpl<Entry> {

    private _finalIndexPromises: Promise<void>[];
    private _finalIndexStrategy: IndexQueryingStrategy;

    public constructor(targetShape: Dataset, finalIndexStrategy: IndexQueryingStrategy, shaclValidator: ShaclValidator, entryStreamTransformer: EntryStreamTransformer<Entry>) {
        super(targetShape, shaclValidator, entryStreamTransformer);
        this._finalIndexPromises = [];
        this._finalIndexStrategy = finalIndexStrategy;
    }

    protected abstract onFinalIndexesStreamEnd(): void;

    protected getFinalIndexesStream(index: Index): Readable {
        const finalIndexStream = index.mixins.index.query(this._finalIndexStrategy);
        finalIndexStream.on('error', (error) => this.log('ERROR', error.toString()));
        finalIndexStream.on('end', () => this.onFinalIndexesStreamEnd());
        return finalIndexStream;
    }

    public query(index: Index, options?: IndexQueryingOptions): Readable {
        this.log('INFO', `Strategy ${this.getName()} is starting.`);
        this.init(options);
        this.getFinalIndexesStream(index).on('data', (finalIndex: NamedNode) => {
            const finalIndexDataset = this.getSemantizer().build(indexFactory);
            finalIndexDataset.setBaseUri(finalIndex);
            this.process(finalIndexDataset); 
        });
        return this.getResultStream();
    }

    public getName(): string {
        return "IndexQueryingStrategyShaclUsingFinalIndex";
    }

}