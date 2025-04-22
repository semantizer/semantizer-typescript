import { NamedNode } from "@semantizer/types";
import { IndexLoggingLevel, IndexStrategyLogEntry } from "./types";

export class IndexStrategyLogEntryDefaultImpl implements IndexStrategyLogEntry {

    private _level: IndexLoggingLevel;
    private _indexEntry: NamedNode;
    private _message: string;

    public constructor(level: IndexLoggingLevel, indexEntry: NamedNode, message: string) {
        this._level = level;
        this._indexEntry = indexEntry;
        this._message = message;
    }

    public getLevel(): IndexLoggingLevel {
        return this._level;
    }

    public getIndexEntry(): NamedNode {
        return this._indexEntry;
    }

    public getMessage(): string {
        return this._message;
    }
    
}