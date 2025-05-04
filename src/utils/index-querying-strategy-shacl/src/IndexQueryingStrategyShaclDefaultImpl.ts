import { EntryStreamTransformer, EntryStreamTransformerDefaultImpl, Index, IndexEntry } from "@semantizer/mixin-index";
import { Dataset, NamedNode, ShaclValidator } from "@semantizer/types";
import { IndexQueryingStrategyShaclUsingFinalIndex } from "@semantizer/utils-index-querying-strategy-shacl-final";
import { Readable } from "stream";

// TODO: add a bypass shape mode on target indexes to avoid to recompare
// the shape as all the index's entries are supposed to target a valid 
// shape.
export class IndexQueryingStrategyShaclDefaultImpl extends IndexQueryingStrategyShaclUsingFinalIndex {

    private _entryStreams: Readable[];
    private _results: string[];

    public constructor(finalIndexShape: Dataset, subIndexShape: Dataset, shaclValidator: ShaclValidator, entryStreamTransformer: EntryStreamTransformer<IndexEntry>) {
        super(finalIndexShape, subIndexShape, shaclValidator, entryStreamTransformer);
        this._entryStreams = [];
        this._results = [];
    }

    private async addIndex(index: Index): Promise<void> {
        const entryStreamStrategy = new EntryStreamTransformerDefaultImpl(this.getSemantizer());
        const entryStream = await index.loadEntryStream(entryStreamStrategy);
        this._entryStreams.push(entryStream);
        entryStream.on('data', (entry: IndexEntry) => this.pushEntry(entry));
    }

    protected isTargetUnique(target: NamedNode): boolean {
        return this._results.find((result) => target.value === result) === undefined;
    }

    protected pushEntry(entry: IndexEntry): void {
        const target = entry.getTarget();
        if (target && target.termType === 'NamedNode' && this.isTargetUnique(target)) {
            this.pushResult(target);
        }
        else this.log('ERROR', "Target entry does not have a valid target");
    }

    protected pushResult(result: NamedNode | null): void {
        super.pushResult(result);
    }

    public async process(index: Index): Promise<void> {
        this.addIndex(index);
    }

}