import { LoggingComponent, LoggingLevel, Semantizer, WithLoggingOptions } from "@semantizer/types";

export abstract class LoaderBase {

    private _semantizer: Semantizer | undefined;

    public constructor(semantizer?: Semantizer) {
        this._semantizer = semantizer;
    }

    public getSemantizer(): Semantizer {
        if (!this._semantizer) {
            throw new Error('Semantizer is not set.');
        }
        return this._semantizer;
    }

    public setSemantizer(semantizer: Semantizer): void {
        this._semantizer = semantizer;
    }

    abstract getLoggingComponent(): LoggingComponent;

    public log(level: LoggingLevel, message: string, options?: WithLoggingOptions): void {
        this.getSemantizer().log(this, level, message, options);
    }

    public logInfo(message: string, options?: WithLoggingOptions): void {
        this.getSemantizer().logInfo(this, message, options);
    }

    public logWarning(message: string, options?: WithLoggingOptions): void {
        this.getSemantizer().logWarning(this, message, options);
    }

    public logError(message: string, options?: WithLoggingOptions): void {
        this.getSemantizer().logError(this, message, options);
    }

}