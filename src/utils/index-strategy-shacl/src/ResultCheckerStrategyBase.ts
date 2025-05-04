import { IndexEntry } from "@semantizer/mixin-index";
import { ResultChecker, ResultCheckerStrategy } from "./types";

export abstract class ResultCheckerStrategyBase implements ResultCheckerStrategy {

    private _checker: ResultChecker | undefined;

    public setChecker(checker: ResultChecker): void {
        this._checker = checker;
    }

    public getChecker(): ResultChecker {
        if (!this._checker)
            throw new Error("No checker has been assigned to the strategy.");
        return this._checker;
    }

    abstract check(entry: IndexEntry): boolean;
}