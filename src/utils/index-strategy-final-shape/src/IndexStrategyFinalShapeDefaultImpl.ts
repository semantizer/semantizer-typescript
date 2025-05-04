import { EntryStreamTransformer, Index, IndexEntry, indexFactory, IndexQueryingOptions, IndexQueryingStrategyBaseShapeImpl } from "@semantizer/mixin-index";
import { Dataset, NamedNode, Semantizer, ShaclValidator } from "@semantizer/types";
import { Readable } from "stream";

export class IndexStrategyFinalShapeDefaultImpl<Entry extends IndexEntry = IndexEntry> extends IndexQueryingStrategyBaseShapeImpl {

    private _shaclValidator: ShaclValidator;
    private _entryStreamTransformer: EntryStreamTransformer<Entry>;
    private _foundFinalIndexCount: number;
    private _options: IndexQueryingOptions | undefined;
    private _hasLimit: boolean;
    private _promises: Promise<void>[];
    private _resultStream: Readable;
    private _isInitialized: boolean;

    private _subIndexShape: Dataset;

    public constructor(finalIndexShape: Dataset, subIndexShape: Dataset, shaclValidator: ShaclValidator, entryStreamTransformer: EntryStreamTransformer<Entry>, semantizer?: Semantizer) {
        super(finalIndexShape, semantizer);
        this._shaclValidator = shaclValidator;
        this._entryStreamTransformer = entryStreamTransformer;
        this._foundFinalIndexCount = 0;
        this._hasLimit = false;
        this._promises = [];
        this._resultStream = this.makeResultStream();
        this._isInitialized = true;
        this._subIndexShape = subIndexShape;
    }

    private init(options?: IndexQueryingOptions): void {
        this.setOptions(options);

        if (!this._isInitialized) {
            this._foundFinalIndexCount = 0;
            this._hasLimit = false;
            this._promises = [];
            this._resultStream = this.makeResultStream();
        } else this._isInitialized = false;
    }

    private getResultStream(): Readable {
        return this._resultStream;
    }

    public getEntryStreamTransformer(): EntryStreamTransformer<Entry> {
        return this._entryStreamTransformer;
    }

    public getFoundFinalIndexCount(): number {
        return this._foundFinalIndexCount;
    }

    public getOptions(): IndexQueryingOptions | undefined {
        return this._options;
    }

    private setOptions(options: IndexQueryingOptions | undefined) {
        this._options = options;
        const limit = this.getOptions()?.limit;
        this._hasLimit = (limit !== undefined && limit > 0);
    }

    public hasLimit(): boolean {
        return this._hasLimit;
    }

    private getPromises(): Promise<void>[] {
        return this._promises;
    }

    private pushPromise(promise: Promise<void>): void {
        this._promises.push(promise);
    }

    private pushResult(result: NamedNode | null): void {
        this._foundFinalIndexCount++;
        this._resultStream.push(result);
    }

    private destroyResultStream(): void {
        this._resultStream.pause(); // if the stream is not paused, the call to destroy() would have no effect
        this._resultStream.destroy(); // handled by the 'close' event (see below)
    }

    public canContinue(): boolean {
        return this.hasLimit() ? (this.getFoundFinalIndexCount() < this._options!.limit! - 1) : true;
    }

    public hasReachLimit(): boolean {
        return this.hasLimit() && (this.getFoundFinalIndexCount() >= this._options!.limit!);
    }

    private async doEntryHasFinalIndex(entry: Dataset): Promise<boolean> {
        const validationReport = await this._shaclValidator.validate(this.getShape(), entry);
        return validationReport.doConforms();
    }

    private async doEntryHasSubIndexToExplore(entry: Dataset): Promise<boolean> {
        const validationReport = await this._shaclValidator.validate(this._subIndexShape, entry);
        return validationReport.doConforms();
    }

    private async process(index: Index): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            if (this.canContinue()) {
                const entryStream = await index.loadEntryStream(this.getEntryStreamTransformer());

                entryStream.on('data', async (entry: Entry) => {
                    if (this.hasReachLimit()) {
                        this.destroyResultStream();
                        return; // when we have enough results, we should stop the streaming process.
                    }

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
                });

                entryStream.on('end', () => resolve());
                entryStream.on('error', () => reject());

                this.pushPromise(new Promise<void>((resolveThis, rejectThis) => {
                    entryStream.on('end', async () => resolveThis());
                    entryStream.on('error', (error) => rejectThis(error));
                }));
            }

            else resolve();
        });
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

    private makeResultStream(): Readable {
        const resultStream = new Readable({ objectMode: true });
        resultStream._read = () => {};
        return resultStream;
    }
    
    private endResultStream(): void {
        Promise.all(this.getPromises()).then(() => this.pushResult(null));
    }

    public query(index: Index, options?: IndexQueryingOptions): Readable {
        this.init(options);
        this.process(index).then(() => this.endResultStream());
        return this.getResultStream();
    }

}