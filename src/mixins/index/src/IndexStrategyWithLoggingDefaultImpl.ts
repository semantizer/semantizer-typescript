import { NamedNode, Semantizer, WithSemantizer } from "@semantizer/types";
import { IndexLoggingLevel, IndexStrategyLogEntryCallback, IndexStrategyLoggingOperations } from "./types";

export class IndexStrategyWithLoggingDefaultImpl implements WithSemantizer, IndexStrategyLoggingOperations {

    private _loggingEnabled: boolean;
    private _loggingLevel: IndexLoggingLevel;
    private _semantizer: Semantizer | undefined;
    private _logEntryCallbacks: Set<IndexStrategyLogEntryCallback>;

    public constructor(semantizer?: Semantizer, enableLogging: boolean = false, loggingLevel: IndexLoggingLevel = 'WARN') {
        this._loggingEnabled = enableLogging;
        this._loggingLevel = loggingLevel;
        this._semantizer = semantizer;
        this._logEntryCallbacks = new Set();
    }
    
    public getSemantizer(): Semantizer {
        if (!this._semantizer)
            throw new Error("Strategy is not attached to a Semantizer instance.")
        return this._semantizer;
    }
    
    public setSemantizer(semantizer: Semantizer): void {
        this._semantizer = semantizer;
    }

    protected addLogEntry(level: IndexLoggingLevel, indexEntry: NamedNode, message: string): void {
        if (this._logEntryCallbacks.size > 0) {
            const logEntry = { level, indexEntry, message };
            for (const callback of this._logEntryCallbacks) {
                callback(logEntry);
            }
        }
    }

    public enableLogging(level: IndexLoggingLevel = 'WARN'): void {
        this._loggingEnabled = true;
        this.setLoggingLevel(level);
    }

    public setLoggingLevel(level: IndexLoggingLevel): void {
        this._loggingLevel = level;
    }
    
    public disableLogging(): void {
        this._loggingEnabled = false;
    }
    
    public isLoggingEnabled(): boolean {
        return this._loggingEnabled;
    }
    
    public getLoggingLevel(): IndexLoggingLevel {
        return this._loggingLevel;
    }
    
    public registerEntryCallback(callback: IndexStrategyLogEntryCallback): void {
        this._logEntryCallbacks.add(callback);
    }
    
}