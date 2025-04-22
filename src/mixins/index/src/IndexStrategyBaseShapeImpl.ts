import { DatasetSemantizer, NamedNode, Semantizer } from "@semantizer/types";
import { Index, IndexLoggingLevel, IndexShape } from "./types";
import { IndexStrategyBaseImpl } from "./IndexStrategyBaseImpl.js";

/**
 * 2024-10-03: The reason is that in the future
 * we should be able to express the shape with a SPARQL query. We would have a strategy that accepts a SPARQL query as input. In a 
 * first step, if the underlying engine (like Comunica) does not support named graph querying, the passed-in SPARQL query should 
 * not handle the source selection (find final indexes to query) but let the strategy find the final indexes (the strategy will 
 * have to parse the SPARQL to understand what shapes it has to find). When named graph querying would be possible with the SPARQL 
 * engine, the strategy could take a complete SPARQL query and let the engine does all the work (use link traversal to discover 
 * sources).
 */
export abstract class IndexStrategyBaseShapeImpl extends IndexStrategyBaseImpl {

    private _shape: IndexShape

    public constructor(shape: IndexShape, enableLogging: boolean = false, loggingLevel: IndexLoggingLevel = 'WARN') {
        super(enableLogging, loggingLevel);
        this._shape = shape;
    }

    public getShape(): IndexShape {
        return this._shape;
    }
    
    public abstract execute(index: NamedNode | string, callbackfn: (target: NamedNode) => void, limit?: number | undefined): Promise<void>;

}