import { Dataset, Semantizer, ShaclValidationReport, ShaclValidator } from "@semantizer/types";
import { IndexQueryingStrategyBaseDefaultImpl } from "./IndexQueryingStrategyBaseDefaultImpl.js";
import { EntryStreamTransformer, IndexEntry } from "./types.js";
import { Readable } from "stream";

/**
 * 2024-10-03: The reason is that in the future
 * we should be able to express the shape with a SPARQL query. We would have a strategy that accepts a SPARQL query as input. In a 
 * first step, if the underlying engine (like Comunica) does not support named graph querying, the passed-in SPARQL query should 
 * not handle the source selection (find final indexes to query) but let the strategy find the final indexes (the strategy will 
 * have to parse the SPARQL to understand what shapes it has to find). When named graph querying would be possible with the SPARQL 
 * engine, the strategy could take a complete SPARQL query and let the engine does all the work (use link traversal to discover 
 * sources).
 */
export class IndexQueryingStrategyBaseShapeImpl<Entry extends IndexEntry = IndexEntry> extends IndexQueryingStrategyBaseDefaultImpl<Entry> {

    private _shape: Dataset;
    private _shaclValidator: ShaclValidator;

    public constructor(shape: Dataset, shaclValidator: ShaclValidator, entryStreamTransformer: EntryStreamTransformer<Entry>, semantizer?: Semantizer) {
        super(entryStreamTransformer, semantizer);
        this._shape = shape;
        this._shaclValidator = shaclValidator;
    }

    public getShape(): Dataset {
        return this._shape;
    }

    public getShaclValidator(): ShaclValidator {
        return this._shaclValidator;
    }

    public async validate(entry: Dataset): Promise<ShaclValidationReport> {
        return await this._shaclValidator.validate(this.getShape(), entry);
    }

    public async doEntryConformsToShape(entry: Dataset): Promise<boolean> {
        return (await this.validate(entry)).doConforms();
    }

    protected async processEntry(entry: Entry, entryStream: Readable): Promise<void> {
        if (await this.doEntryConformsToShape(entry)) {
            this.pushResult(entry.getBaseUri());
        }
    }

}