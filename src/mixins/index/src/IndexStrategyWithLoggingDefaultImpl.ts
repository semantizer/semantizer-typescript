import { NamedNode } from "@semantizer/types";
import { IndexLoggingLevel, IndexStrategyLog, IndexStrategyLoggingOperations } from "./types";
import { IndexStrategyLogDefaultImpl } from "./IndexStrategyLogDefaultImpl";

export class IndexStrategyWithLoggingDefaultImpl implements IndexStrategyLoggingOperations {

    private _log: IndexStrategyLog;
    private _loggingEnabled: boolean;
    private _loggingLevel: IndexLoggingLevel;

    public constructor(enableLogging: boolean = false, loggingLevel: IndexLoggingLevel = 'WARN') {
        this._log = new IndexStrategyLogDefaultImpl();
        this._loggingEnabled = enableLogging;
        this._loggingLevel = loggingLevel;
    }

    protected addLogEntry(level: IndexLoggingLevel, indexEntry: NamedNode, message: string): void {
        if (this.isLoggingEnabled()) {
            this._log.addEntry(level, indexEntry, message);
        }
    }

    public enableLogging(level: IndexLoggingLevel): void {
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
    
    public getLog(): IndexStrategyLog {
        return this._log; // TODO: return a copy
    }
    
}