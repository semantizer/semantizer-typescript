import { EntryStreamTransformer, Index, IndexEntry, IndexQueryingOptions, IndexQueryingStrategy, IndexQueryingStrategyBaseDefaultImpl } from "@semantizer/mixin-index";
import { Readable } from "stream";
import { NamedNode } from "@semantizer/types";

export class IndexQueryingStrategyShaclConjunctionDefaultImpl<Entry extends IndexEntry = IndexEntry> extends IndexQueryingStrategyBaseDefaultImpl<Entry> {

    private _targetStrategies: IndexQueryingStrategy[];
    private _results: Map<string, number>;

    public constructor(targetStrategies: IndexQueryingStrategy[], entryStreamTransformer: EntryStreamTransformer<Entry>) {
        super(entryStreamTransformer);
        this._targetStrategies = targetStrategies;
        this._results = new Map<string, number>();
    }

    protected processEntry(entry: Entry, entryStream: Readable): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected isResultIsKnown(result: NamedNode): boolean {
        return this._results.has(result.value);
    }

    protected countStrategies(): number {
        return this._targetStrategies.length;
    }

    protected isResultCountValid(resultCount: number): boolean {
        return resultCount >= this.countStrategies();
    }

    protected processResult(result: NamedNode): void {
        let resultCount = this._results.get(result.value);
        if (resultCount && !this.isResultCountValid(resultCount)) {
            resultCount += 1;
            this._results.set(result.value, resultCount);
            if (this.isResultCountValid(resultCount)) {
                this.pushResult(result);
            } 
        } else {
            this._results.set(result.value, 1);
        }
    }

    public query(index: Index, options?: IndexQueryingOptions): Readable {
        this.init(options);
        for (const targetStrategy of this._targetStrategies) {
            index.query(targetStrategy).on('data', (result: NamedNode) => this.processResult(result));
        }
        return this.getResultStream();
    }

}