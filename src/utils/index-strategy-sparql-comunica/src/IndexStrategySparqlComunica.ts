import { QueryEngine } from "@comunica/query-sparql";
import { EntryStreamTransformer, Index, IndexEntry, IndexQueryingOptions, IndexQueryingStrategy, IndexStrategyBaseShapeImpl } from "@semantizer/mixin-index";
import { ShaclValidator } from "@semantizer/mixin-shacl";
import { Dataset, NamedNode, Semantizer } from "@semantizer/types";
import { IndexStrategyFinalShapeDefaultImpl } from "@semantizer/utils-index-strategy-final-shape";
import { Readable } from "stream";

export class IndexStrategySparqlComunica extends IndexStrategyBaseShapeImpl implements IndexQueryingStrategy {

    private _sparqlQuery: string;
    // private _subIndexShape: Dataset;
    private _resultStream: Readable;
    private _finalIndexStrategy: IndexQueryingStrategy;

    /**
     * Here a shape param is expected to be able to find the final indexes. It could be removed when 
     * we will be able to query named graphs with Comunica. If we use the link traversal without the 
     * named graphs querying ability, the request will be very uneffiscient since all the indexes 
     * would be queried (because Comunica use all the sources it discovers). 
     * @param sparqlQuery 
     * @param shape Needed to find the final indexes to query.
     */
    public constructor(sparqlQuery: string, finalIndexShape: Dataset, subIndexShape: Dataset, shaclValidator: ShaclValidator, entryStreamTransformer: EntryStreamTransformer<IndexEntry>, semantizer?: Semantizer) {
        super(finalIndexShape, semantizer);
        this._sparqlQuery = sparqlQuery;
        // this._subIndexShape = subIndexShape;
        this._resultStream = this.makeResultStream();
        this._finalIndexStrategy = new IndexStrategyFinalShapeDefaultImpl(finalIndexShape, subIndexShape, shaclValidator, entryStreamTransformer, semantizer);
    }

    public getSparqlQuery(): string {
        return this._sparqlQuery;
    }

    private pushResult(result: NamedNode | null): void {
        this._resultStream.push(result);
    }

    private makeResultStream(): Readable {
        const resultStream = new Readable({ objectMode: true });
        resultStream._read = () => { };
        return resultStream;
    }

    private getFinalIndexes(index: Index, callBack: (indexes: string[]) => void): Readable {
        const finalIndexes: string[] = [];
        const finalIndexStream = index.query(this._finalIndexStrategy);
        finalIndexStream.on('data', (result: NamedNode) => {
            finalIndexes.push(result.value);
            this.log('INFO', "Found final index " + result.value);
        });
        finalIndexStream.on('end', () => callBack(finalIndexes));
        finalIndexStream.on('error', (error) => this.log('ERROR', error.toString()));
        return finalIndexStream;
    }

    public query(index: Index, options?: IndexQueryingOptions): Readable {
        this.getFinalIndexes(index, async (finalIndexes: string[]) => {
            if (finalIndexes.length > 0) {
                const comunicaEngine = new QueryEngine();

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
            else {
                this.log('WARN', "No final index found.");
                this.pushResult(null);
            }
        });

        return this._resultStream;
    }

}
