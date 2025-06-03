import { EntryStreamTransformer, Index, IndexEntry, indexFactory, IndexQueryingOptions, IndexQueryingStrategyBaseShapeImpl } from "@semantizer/mixin-index";
import { Dataset, LoggingComponent, LoggingLevel, ShaclValidator, WithLoggingOptions } from "@semantizer/types";
import { Readable } from "stream";

export class IndexStrategyFinalShapeDefaultImpl<Entry extends IndexEntry = IndexEntry> extends IndexQueryingStrategyBaseShapeImpl<Entry> {

    private _subIndexShape: Dataset;
    private _rootIndex: Index | undefined;

    public constructor(targetShape: Dataset, subIndexShape: Dataset, shaclValidator: ShaclValidator, entryStreamTransformer: EntryStreamTransformer<Entry>) {
        super(targetShape, shaclValidator, entryStreamTransformer);
        this._subIndexShape = subIndexShape;
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

    protected async processEntryStream(entryStream: Readable, index: Index): Promise<void> {
        await super.processEntryStream(entryStream, index);
        for await (const entry of entryStream) {
            await this.processFinalIndexEntry(entry, entryStream);
        }
    }

    private async processSubIndex(entry: Entry, entryStream: Readable): Promise<void> {
        const subIndexUri = entry.getSubIndex();
        this.logInfo(`found a sub-index: ${subIndexUri?.value}`);
        if (subIndexUri) {
            try {
                entryStream.pause();
                const subIndex: Index = this.getSemantizer().build(indexFactory);
                subIndex.setBaseUri(subIndexUri);
                await this.process(subIndex);
                entryStream.resume();
            }
            catch (e) { this.logError("Error while loading " + subIndexUri + e) }
        } else { this.logWarning("No subIndex found for potencial result source.") }
    }

    public isRootIndex(index: Index): boolean {
        if (!this._rootIndex) {
            throw new Error("Root index is not defined.");
        }
        return index.getBaseUri().equals(this._rootIndex.getBaseUri());
    }

    protected endResultStream(index: Index): void {
        if (this.isRootIndex(index)) {
            super.endResultStream(index);
        }
    }

    public query(index: Index, options?: IndexQueryingOptions): Readable {
        this._rootIndex = index;
        return super.query(index, options);
    }

    public log(level: LoggingLevel, message: string, options?: WithLoggingOptions): void {
        const newOptions = { ...options, source: "IndexStrategyFinalShapeDefaultImpl" };
        super.log(level, message, newOptions);
    }

    public getLoggingComponent(): LoggingComponent {
        return {
            type: 'UTIL',
            name: 'index-querying-strategy-shacl-final'
        }
    }

}