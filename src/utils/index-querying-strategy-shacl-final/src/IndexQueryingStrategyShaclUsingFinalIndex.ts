import indexFactory, { EntryStreamTransformer, Index, IndexEntry, IndexQueryingOptions, IndexQueryingStrategy, IndexQueryingStrategyBaseShapeImpl } from "@semantizer/mixin-index";
import { Dataset, NamedNode, ShaclValidator } from "@semantizer/types";
import { HttpError } from "@semantizer/http-error";
import { Readable } from "stream";

export class IndexQueryingStrategyShaclUsingFinalIndex<Entry extends IndexEntry = IndexEntry> extends IndexQueryingStrategyBaseShapeImpl<Entry> {

    private _finalIndexStrategy: IndexQueryingStrategy;
    private _results: Set<string>; // results already returned.

    public constructor(targetShape: Dataset, finalIndexStrategy: IndexQueryingStrategy, shaclValidator: ShaclValidator, entryStreamTransformer: EntryStreamTransformer<Entry>) {
        super(targetShape, shaclValidator, entryStreamTransformer);
        this._finalIndexStrategy = finalIndexStrategy;
        this._results = new Set<string>();
    }

    public async process(finalIndex: Index): Promise<void> {
        return await this.processFinalIndex(finalIndex);
    }

    protected async processFinalIndex(finalIndex: Index): Promise<void> {
        try {
            const entryStreamStrategy = this.getEntryStreamTransformer(); // new EntryStreamTransformerDefaultImpl(this.getSemantizer());
            const entryStream = await finalIndex.mixins.index.loadEntryStream(entryStreamStrategy);
            entryStream.on('error', (error) => this.log('ERROR', "An error occured during the processing a final index."));
            for await (const entry of entryStream) {
                await this.processFinalIndexEntry(entry);
            }
        } catch (e) {
            if (e instanceof HttpError) {
                this.log('ERROR', `A HTTP ${e.code} error occured while loading the final index ${finalIndex.getBaseUri().value}`);
            }
            else this.log('ERROR', "An error occured while loading the final index " + finalIndex.getBaseUri().value);
        }
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

    protected async validateEntry(entry: Entry, target: NamedNode): Promise<void> {
        const report = await this.getShaclValidator().validate(this.getTargetShape(), entry);
        if (report.doConforms()) {
            this.pushResult(target);
        }
    }

    protected pushResult(result: NamedNode | null) {
        if (result !== null) {
            this._results.add(result.value);
        }
        super.pushResult(result);
    }

    private async processFinalIndexStream(index: Index): Promise<void> {
        const finalIndexStream = index.mixins.index.query(this._finalIndexStrategy);
        finalIndexStream.on('error', (error) => this.log('ERROR', error.toString()));
        for await (const finalIndex of finalIndexStream) {
            const finalIndexDataset = this.getSemantizer().build(indexFactory);
            finalIndexDataset.setBaseUri(finalIndex);
            await this.process(finalIndexDataset); 
        }
        this.endResultStream();
    }

    public query(index: Index, options?: IndexQueryingOptions): Readable {
        this.log('INFO', `Strategy ${this.getName()} - ${this._instanceName} is starting.`);
        this.init(options);
        this.processFinalIndexStream(index);
        return this.getResultStream();
    }

    public getName(): string {
        return "IndexQueryingStrategyShaclUsingFinalIndex";
    }

}