import { LoggingLevel, Semantizer, Term, WithSemantizer } from "@semantizer/types";

export class IndexStrategyBaseDefaultImpl implements WithSemantizer {

    private _semantizer: Semantizer | undefined;

    public constructor(semantizer?: Semantizer) {
        this._semantizer = semantizer;
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
    
}