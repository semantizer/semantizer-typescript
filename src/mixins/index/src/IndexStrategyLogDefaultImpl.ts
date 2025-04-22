import { NamedNode } from "@semantizer/types";
import { IndexStrategyLogEntry, IndexLoggingLevel, IndexStrategyLog } from "./types";
import { IndexStrategyLogEntryDefaultImpl } from "./IndexStrategyLogEntryDefaultImpl";

export class IndexStrategyLogDefaultImpl implements IndexStrategyLog {

    private _entries: IndexStrategyLogEntryDefaultImpl[];

    public constructor() {
        this._entries = [];
    }

    public addEntry(level: IndexLoggingLevel, indexEntry: NamedNode, message: string): void {
        this._entries.push(new IndexStrategyLogEntryDefaultImpl(level, indexEntry, message));
    }

    hasErrors(): boolean {
        throw new Error("Method not implemented.");
    }
    
    hasWarnings(): boolean {
        throw new Error("Method not implemented.");
    }

    countErrors(): number {
        throw new Error("Method not implemented.");
    }

    countWarnings(): number {
        throw new Error("Method not implemented.");
    }

    getErrors(): Iterable<IndexStrategyLogEntry>;
    getErrors(entry: NamedNode | string): Iterable<IndexStrategyLogEntry>;
    getErrors(entry?: unknown): Iterable<import("./types").IndexStrategyLogEntry> {
        throw new Error("Method not implemented.");
    }

    getEntries(): Iterable<IndexStrategyLogEntry> {
        throw new Error("Method not implemented.");
    }

}