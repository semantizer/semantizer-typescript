import { LoggingLevel, NamedNode, Semantizer, Term, WithSemantizer } from "@semantizer/types";
import { HttpError } from "@semantizer/http-error";
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

    public _instanceName: string;

    public constructor(entryStreamTransformer: EntryStreamTransformer<Entry>) {
        this._entryStreamTransformer = entryStreamTransformer;
        this._resultStream = this.makeResultStream();
        this._resultCount = 0;
        this._hasLimit = false;
        this._isInitialized = true;
        this._instanceName = (Math.random() + 1).toString(36).substring(7);
    }

    public abstract getName(): string;

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
        resultStream._read = () => {};
        return resultStream;
    }

    protected pushResult(result: NamedNode | null): void {
        if (result !== null) {
            this.log('INFO', `Strategy ${this.getName()} - ${this._instanceName} has found a result: ${result.value}`);
            this._resultCount++;
        }
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
        this.log('INFO', `Strategy ${this.getName()} result stream has been destroyed.`);
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
            throw new Error("Strategy is not attached to a Semantizer instance.");
        return this._semantizer;
    }

    public setSemantizer(semantizer: Semantizer): void {
        this._semantizer = semantizer;
    }

    protected async processEntryStream(entryStream: Readable, index: Index): Promise<void> {
        // entryStream.on('data', async (entry: Entry) => {
        //     if (this.hasReachLimit()) {
        //         this.destroyResultStream();
        //         return; // when we have enough results, we should stop the streaming process.
        //     }
        // });
        entryStream.on('end', () => this.endResultStream());
        entryStream.on('error', (error) => this.log('ERROR', `An error occured while querying index: ${index.getBaseUri().value}: ${error.toString()}.`));
    }

    protected async process(index: Index): Promise<void> {
        try {
            const entryStream = await index.mixins.index.loadEntryStream(this.getEntryStreamTransformer());
            this.processEntryStream(entryStream, index);
        } catch (e) {
            if (e instanceof HttpError) {
                this.log('ERROR', `A HTTP ${e.code} error occured while loading the index ${index.getBaseUri().value}`);
            }
            else this.log('ERROR', "An error occured while loading the index " + index.getBaseUri().value);
        }
    }

    protected endResultStream(): void {
        this.pushResult(null);
        this.log('INFO', `Strategy ${this.getName()} - ${this._instanceName} is terminated.`);
    }

    public query(index: Index, options?: IndexQueryingOptions): Readable {
        this.log('INFO', `Strategy ${this.getName()} - ${this._instanceName} is starting.`);
        this.init(options);
        this.process(index);
        return this.getResultStream();
    }

}