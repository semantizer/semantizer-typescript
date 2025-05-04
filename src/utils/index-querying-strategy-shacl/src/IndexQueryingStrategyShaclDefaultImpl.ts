import { EntryStreamTransformer, EntryStreamTransformerDefaultImpl, Index, IndexEntry } from "@semantizer/mixin-index";
import { Dataset, NamedNode, Semantizer, ShaclValidator } from "@semantizer/types";
import { IndexQueryingStrategyShaclUsingFinalIndex } from "@semantizer/utils-index-strategy-final-shape";
import { Readable } from "stream";

// TODO: add a bypass shape mode on target indexes to avoid to recompare
// the shape as all the index's entries are supposed to target a valid 
// shape.
export class IndexQueryingStrategyShaclDefaultImpl extends IndexQueryingStrategyShaclUsingFinalIndex {

    private _entryStreams: Readable[];

    public constructor(finalIndexShape: Dataset, subIndexShape: Dataset, shaclValidator: ShaclValidator, entryStreamTransformer: EntryStreamTransformer<IndexEntry>, semantizer?: Semantizer) {
        super(finalIndexShape, subIndexShape, shaclValidator, entryStreamTransformer, semantizer);
        this._entryStreams = [];
    }

    private async addIndex(index: Index): Promise<void> {
        const entryStreamStrategy = new EntryStreamTransformerDefaultImpl(this.getSemantizer());
        const entryStream = await index.loadEntryStream(entryStreamStrategy);
        this._entryStreams.push(entryStream);
        entryStream.on('data', (entry: IndexEntry) => this.pushResult(entry.getBaseUri()));
    }

    protected pushResult(result: NamedNode | null): void {
        super.pushResult(result);
    }

    public async process(index: Index): Promise<void> {
        this.addIndex(index);
    }

    // public query(index: Index, options?: IndexQueryingOptions): Readable {
    //     this.init(options);
    //     this.
    //     let resultCount = 0;
    //     const limitCount: number = limit ? limit : 30;
    //     const finalIndexesStrategy = new IndexStrategyFinalIndexesDefaultImpl(this.getSemantizer());
    //     const finalIndexStream = finalIndexesStrategy.execute(rootIndex, this.getShape(), limit);
    //     const resultChecker = this.makeResultChecker();

    //     resultChecker.on('data', (entry: IndexEntry) => {
    //         if (resultCount >= limitCount) {
    //             resultChecker.pause();
    //             resultCount = 0;
    //         } else {
    //             const target = entry.getTarget();
    //             if (target && target.termType === 'NamedNode') {
    //                 callbackfn(target);
    //                 resultCount++;
    //             }
    //         }
    //     });

    //     finalIndexStream.on('data', (result: FinalIndexResult) => resultChecker.addIndex(result.getIndex()));
    //     finalIndexStream.on('error', (error) => console.warn(error));

    //     return new Promise<void>((resolve, reject) => {
    //         resultChecker.on('end', () => { resolve() });
    //         resultChecker.on('error', (error) => reject(error));
    //     })

    // }

}