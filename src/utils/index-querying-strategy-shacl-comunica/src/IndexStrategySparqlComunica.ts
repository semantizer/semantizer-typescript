import { QueryEngine } from "@comunica/query-sparql";
import { EntryStreamTransformer, Index, IndexEntry, IndexQueryingOptions } from "@semantizer/mixin-index";
import { Dataset, NamedNode, ShaclValidator } from "@semantizer/types";
import { IndexQueryingStrategyShaclUsingFinalIndex } from "@semantizer/utils-index-querying-strategy-shacl-final";
import { Readable } from "stream";

export class IndexStrategySparqlComunica extends IndexQueryingStrategyShaclUsingFinalIndex {

    private _sparqlQuery: string;
    private _finalIndexes: NamedNode[];

    /**
     * Here a shape param is expected to be able to find the final indexes. It could be removed when 
     * we will be able to query named graphs with Comunica. If we use the link traversal without the 
     * named graphs querying ability, the request will be very uneffiscient since all the indexes 
     * would be queried (because Comunica use all the sources it discovers). 
     * @param sparqlQuery 
     * @param shape Needed to find the final indexes to query.
     */
    public constructor(sparqlQuery: string, finalIndexShape: Dataset, subIndexShape: Dataset, shaclValidator: ShaclValidator, entryStreamTransformer: EntryStreamTransformer<IndexEntry>) {
        super(finalIndexShape, subIndexShape, shaclValidator, entryStreamTransformer);
        this._sparqlQuery = sparqlQuery;
        this._finalIndexes = [];
    }

    protected init(options?: IndexQueryingOptions): void {
        if (this.isInitialized()) {
            this._finalIndexes = [];
        }
        super.init(options);
    }

    public getSparqlQuery(): string {
        return this._sparqlQuery;
    }

    public getFinalIndexes(): NamedNode[] {
        return this._finalIndexes;
    }

    protected async process(index: Index): Promise<void> {
        const comunicaEngine = new QueryEngine();
        const finalIndexes = this.getFinalIndexes().map((finalIndex) => finalIndex.value);

        // ts-ignore is required below to ignore the sources options type issue: Type 'string[]' 
        // is not assignable to type '[QuerySourceUnidentified, ...QuerySourceUnidentified[]]'.
        // Source provides no match for required element at position 0 in target.
        // @ts-ignore
        const bindingsStream = await comunicaEngine.queryBindings(this.getSparqlQuery(), { sources: finalIndexes, unionDefaultGraph: true });

        bindingsStream.on('data', (binding) => {
            const result: NamedNode = binding.get('result');
            this.pushResult(result);
            this.log('INFO', "Found result " + result.value);
        });

        bindingsStream.on('end', () => this.pushResult(null));
        bindingsStream.on('error', (error) => {
            this.log('ERROR', "No final index found.");
            this.pushResult(null);
        });
    }

    public query(index: Index, options?: IndexQueryingOptions): Readable {
        super.init(options);
        const finalIndexStream = this.getFinalIndexesStream(index);
        finalIndexStream.on('data', (result: NamedNode) => {
            this._finalIndexes.push(result);
        });
        finalIndexStream.on('end', () => {
            if (this.getFinalIndexes().length > 0) {
                this.process(index);
            }
            else {
                this.log('WARN', "No final index found.");
                this.pushResult(null);
            }
        });

        return this.getResultStream();
    }

}
