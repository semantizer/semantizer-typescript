import { LoggingLevel, NamedNode, Semantizer, Term, WithSemantizer } from "@semantizer/types";
import { EntryStreamTransformer, Index, IndexEntry, IndexQueryingOptions, IndexQueryingStrategy } from "./types";
import { Readable } from "stream";

export abstract class IndexQueryingStrategyBaseDefaultImpl<Entry extends IndexEntry = IndexEntry> implements WithSemantizer, IndexQueryingStrategy {

    private _semantizer: Semantizer | undefined;
    private _entryStreamTransformer: EntryStreamTransformer<Entry>;
    private _resultStream: Readable;
    private _resultCount: number;
    private _options: IndexQueryingOptions | undefined;
    private _hasLimit: boolean;
    private _isInitialized: boolean;

    public constructor(entryStreamTransformer: EntryStreamTransformer<Entry>) {
        this._entryStreamTransformer = entryStreamTransformer;
        this._resultStream = this.makeResultStream();
        this._resultCount = 0;
        this._hasLimit = false;
        this._isInitialized = true;
    }

    public isInitialized(): boolean {
        return this._isInitialized;
    }

    protected init(options?: IndexQueryingOptions): void {
        this.setOptions(options);

        if (!this._isInitialized) {
            this._resultStream = this.makeResultStream();
            this._resultCount = 0;
        } else this._isInitialized = false;
    }

    public hasLimit(): boolean {
        return this._hasLimit;
    }

    protected makeResultStream(): Readable {
        const resultStream = new Readable({ objectMode: true });
        resultStream._read = () => { };
        return resultStream;
    }

    protected pushTargetResult(result: NamedNode | null): void {
        this._resultCount++;
        this._resultStream.push(result);
    }

    public getEntryStreamTransformer(): EntryStreamTransformer<Entry> {
        return this._entryStreamTransformer;
    }

    public getResultCount(): number {
        return this._resultCount;
    }

    public canContinue(): boolean {
        return this.hasLimit() ? (this.getResultCount() < this._options!.limit! - 1) : true;
    }

    public hasReachLimit(): boolean {
        return this.hasLimit() && (this.getResultCount() >= this._options!.limit!);
    }

    protected destroyResultStream(): void {
        this._resultStream.pause(); // if the stream is not paused, the call to destroy() would have no effect
        this._resultStream.destroy(); // handled by the 'close' event (see below)
    }

    public getResultStream(): Readable {
        return this._resultStream;
    }

    public getOptions(): IndexQueryingOptions | undefined {
        return this._options;
    }

    protected setOptions(options: IndexQueryingOptions | undefined) {
        this._options = options;
        const limit = options?.limit;
        this._hasLimit = (limit !== undefined && limit > 0);
    }

    public log(level: LoggingLevel, message: string, code?: number, subject?: Term): void {
        this.getSemantizer().log(level, message, code, subject);
    }

    public getSemantizer(): Semantizer {
        if (!this._semantizer)
            throw new Error("Strategy is not attached to a Semantizer instance.")
        return this._semantizer;
    }

    public setSemantizer(semantizer: Semantizer): void {
        this._semantizer = semantizer;
    }

    // protected abstract processFinalIndexEntry(entry: Entry, entryStream: Readable): Promise<void>;

    protected processEntryStream(entryStream: Readable): void {
        entryStream.on('data', async (entry: Entry) => {
            if (this.hasReachLimit()) {
                this.destroyResultStream();
                return; // when we have enough results, we should stop the streaming process.
            }
            // this.processFinalIndexEntry(entry, entryStream);
        });

        entryStream.on('end', () => this.endResultStream());
        entryStream.on('error', (error) => this.log('ERROR', "An error occured while querying index: " + error.toString()));
    }

    protected async process(index: Index): Promise<void> {
        const entryStream = await index.loadEntryStream(this.getEntryStreamTransformer());
        this.processEntryStream(entryStream);
    }

    protected endResultStream(): void {
        this.pushTargetResult(null);
    }

    public query(index: Index, options?: IndexQueryingOptions): Readable {
        this.init(options);
        this.process(index);
        return this.getResultStream();
    }

}