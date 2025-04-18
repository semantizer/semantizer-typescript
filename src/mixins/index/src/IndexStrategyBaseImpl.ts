import { DatasetSemantizer, NamedNode, Semantizer } from "@semantizer/types";
import { Index, IndexStrategy } from "./types";

export abstract class IndexStrategyBaseImpl implements IndexStrategy {

    private _semantizer: Semantizer | undefined;

    public constructor(semantizer: Semantizer) {
        this._semantizer = semantizer;
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