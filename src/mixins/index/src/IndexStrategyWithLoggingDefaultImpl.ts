import { NamedNode, Semantizer, WithSemantizer } from "@semantizer/types";
import { IndexLoggingLevel, IndexStrategyLog, IndexStrategyLogEntry, IndexStrategyLoggingOperations } from "./types";
import { IndexStrategyLogDefaultImpl } from "./IndexStrategyLogDefaultImpl";

export class IndexStrategyWithLoggingDefaultImpl implements WithSemantizer, IndexStrategyLoggingOperations {

    private _log: IndexStrategyLog;
    private _loggingEnabled: boolean;
    private _loggingLevel: IndexLoggingLevel;
    private _semantizer: Semantizer | undefined;

    public constructor(enableLogging: boolean = false, loggingLevel: IndexLoggingLevel = 'WARN') {
        this._log = new IndexStrategyLogDefaultImpl();
        this._loggingEnabled = enableLogging;
        this._loggingLevel = loggingLevel;
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
        if (this.isLoggingEnabled()) {
            this._log.addEntry(level, indexEntry, message);
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
    
    public registerEntryCallback(callback: (logEntry: IndexStrategyLogEntry) => void): void {

    }
    
}