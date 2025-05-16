import { EntryStreamTransformer, Index, IndexEntry, indexFactory, IndexQueryingStrategyBaseShapeImpl } from "@semantizer/mixin-index";
import { Dataset, ShaclValidator } from "@semantizer/types";
import { Readable } from "stream";

export class IndexStrategyFinalShapeDefaultImpl<Entry extends IndexEntry = IndexEntry> extends IndexQueryingStrategyBaseShapeImpl<Entry> {

    private _promises: Promise<void>[];
    private _subIndexShape: Dataset;

    public constructor(targetShape: Dataset, subIndexShape: Dataset, shaclValidator: ShaclValidator, entryStreamTransformer: EntryStreamTransformer<Entry>) {
        super(targetShape, shaclValidator, entryStreamTransformer);
        this._promises = [];
        this._subIndexShape = subIndexShape;
    }

    private getPromises(): Promise<void>[] {
        return this._promises;
    }

    private pushPromise(promise: Promise<void>): void {
        this._promises.push(promise);
    }

    private async doEntryHasFinalIndex(entry: Dataset): Promise<boolean> {
        return this.doEntryConformsToTargetShape(entry);
    }

    private async doEntryHasSubIndexToExplore(entry: Dataset): Promise<boolean> {
        const validationReport = await this.getShaclValidator().validate(this._subIndexShape, entry);
        return validationReport.doConforms();
    }

    protected async processFinalIndexEntry(entry: Entry, entryStream: Readable): Promise<void> {
        // We found a final index
        if (await this.doEntryHasFinalIndex(entry)) {
            const subIndex = entry.getSubIndex();
            if (subIndex) {
                this.pushResult(subIndex);
            }
        }

        // We found a sub index to explore
        else if (await this.doEntryHasSubIndexToExplore(entry)) {
            if (this.canContinue()) {
                await this.processSubIndex(entry, entryStream);
            }
        }
    }

    protected processEntryStream(entryStream: Readable): void {
        super.processEntryStream(entryStream);
        this.pushPromise(new Promise<void>((resolveThis, rejectThis) => {
            entryStream.on('end', async () => resolveThis());
            entryStream.on('error', (error) => rejectThis(error));
        }));
    }

    private async processSubIndex(entry: Entry, entryStream: Readable): Promise<void> {
        const subIndexUri = entry.getSubIndex();
        if (subIndexUri) {
            try {
                entryStream.pause();
                const subIndex: Index = this.getSemantizer().build(indexFactory);
                subIndex.setBaseUri(subIndexUri);
                const subIndexPromise = this.process(subIndex);
                this.pushPromise(subIndexPromise);
                await subIndexPromise;
                entryStream.resume();
            }
            catch (e) { this.log('ERROR', "Error while loading " + subIndexUri + e) }
        } else { this.log('WARN', "No subIndex found for potencial result source.") }
    }

    protected endResultStream(): void {
        Promise.all(this.getPromises()).then(() => super.endResultStream());
    }

}