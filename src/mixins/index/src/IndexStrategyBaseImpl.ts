import { DatasetSemantizer, NamedNode, Semantizer } from "@semantizer/types";
import { Index, IndexStrategyLog, IndexLoggingLevel, IndexStrategy } from "./types";
import { IndexStrategyLogDefaultImpl } from "./IndexStrategyLogDefaultImpl";
import { IndexStrategyWithLoggingDefaultImpl } from "./IndexStrategyWithLoggingDefaultImpl";

export abstract class IndexStrategyBaseImpl extends IndexStrategyWithLoggingDefaultImpl implements IndexStrategy {

    private _semantizer: Semantizer | undefined;

    public constructor(enableLogging: boolean = false, loggingLevel: IndexLoggingLevel = 'WARN') {
        super(enableLogging, loggingLevel);
    }

    public setSemantizer(semantizer: Semantizer): void {
        this._semantizer = semantizer;
    }

    public getSemantizer(): Semantizer {
        if (!this._semantizer)
            throw new Error("Strategy is not attached to a Semantizer instance.")
        return this._semantizer;
    }
    
    public abstract execute(index: NamedNode | string, callbackfn: (target: NamedNode) => void, limit?: number | undefined): Promise<void>;

}