import { NamedNode, Semantizer } from "@semantizer/types";
import { IndexEntry, IndexShape } from "@semantizer/mixin-index";

export interface ResultChecker {
    getSemantizer(): Semantizer;
    getTargetShape(): IndexShape;
    addIndex(index: NamedNode): Promise<void>;
    pause(): this;
    resume(): this;
}
export interface ResultCheckerStrategy {
    getChecker(): ResultChecker;
    setChecker(checker: ResultChecker): void;
    check(entry: IndexEntry): boolean;
}