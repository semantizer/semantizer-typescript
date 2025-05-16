import { EntryStreamTransformer, EntryStreamTransformerDefaultImpl, Index, IndexEntry, IndexQueryingStrategy } from "@semantizer/mixin-index";
import { Dataset, NamedNode, ShaclValidator } from "@semantizer/types";
import { IndexQueryingStrategyShaclUsingFinalIndex } from "@semantizer/utils-index-querying-strategy-shacl-final";
import { Readable } from "stream";

// TODO: add a bypass shape mode on target indexes to avoid to recompare
// the shape as all the index's entries are supposed to target a valid 
// shape.
interface IndexQueryingStrategyShaclOption {
    bypassShapeValidation?: boolean;
}

interface InternalShape {
    id: string;
    shape: Dataset;
    origin?: string;
    conforms?: boolean;
}

export class IndexQueryingStrategyShaclDefaultImpl<Entry extends IndexEntry = IndexEntry> extends IndexQueryingStrategyShaclUsingFinalIndex<Entry> {

    private _entryStreams: Readable[];
    private _results: Set<string>; // results already returned.

    public constructor(targetShape: Dataset, finalIndexStrategy: IndexQueryingStrategy, shaclValidator: ShaclValidator, entryStreamTransformer: EntryStreamTransformer<Entry>) {
        super(targetShape, finalIndexStrategy, shaclValidator, entryStreamTransformer);
        this._entryStreams = [];
        this._results = new Set<string>();
    }

    public async process(finalIndex: Index): Promise<void> {
        this.processFinalIndex(finalIndex);
    }

    private async processFinalIndex(finalIndex: Index): Promise<void> {
        const entryStreamStrategy = new EntryStreamTransformerDefaultImpl(this.getSemantizer());
        const entryStream = await finalIndex.loadEntryStream(entryStreamStrategy);
        this._entryStreams.push(entryStream);
        entryStream.on('data', (entry: Entry) => this.processFinalIndexEntry(entry));
        entryStream.on('error', (error) => this.log('ERROR', "An error occured during the processing a final index."));
    }

    protected async processFinalIndexEntry(entry: Entry): Promise<void> {
        try {
            const target = this.getEntryTargetEnsuringItIsANamedNode(entry);
            if (this.isResultHasNotAlreadyBeenReturned(target)) {
                await this.validateEntry(entry, target);
            }
        } catch (e) {
            this.log('ERROR', "Unable to process entry " + entry.getBaseUri().value);
        }
    }

    protected getEntryTargetEnsuringItIsANamedNode(entry: Entry): NamedNode {
        const target = entry.getTarget();
        if (target) {
            if (target.termType === 'NamedNode') {
                return target;
            } else this.log('WARN', "Target entry uses a blank node as target which is not recommended.");
        }
        this.log('ERROR', "Target entry does not have a target.");
        throw new Error();
    }

    protected isResultHasNotAlreadyBeenReturned(result: NamedNode): boolean {
        return !this._results.has(result.value);
    }

    protected pushTargetResult(result: NamedNode | null) {
        if (result) {
            this._results.add(result.value);
            super.pushTargetResult(result);
        }
    }

    protected async validateEntry(entry: Entry, target: NamedNode): Promise<void> {
        const report = await this.getShaclValidator().validate(this.getTargetShape(), entry);
        if (report.doConforms()) {
            this.pushTargetResult(target);
        }
    }

}