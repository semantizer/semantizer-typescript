import { BlankNode, DatasetSemantizerMixinConstructor, NamedNode, Quad, Semantizer, Term } from "@semantizer/types";
import { Readable, Transform } from "stream";
// import { indexEntryFactory } from "./IndexEntryMixin.js";
import { indexEntryFactory } from "./IndexEntryMixin";
import { IDX, SHACL } from "./namespaces.js";
import { EntryStreamTransformerStrategy, Index, IndexQueryingOptions, IndexShape, IndexShapeComparisonStrategy, IndexStrategy } from "./types";
// import { indexEntryFactory } from "./IndexEntryMixin";

export function IndexMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class IndexMixinImpl extends Base implements Index {

        /**
         * Transforms the quad stream of this dataset into an IndexEntry stream.
         * @returns A Readable stream of IndexEntry with their linked objects (shape and properties).
         */
        public async loadEntryStream(strategy: EntryStreamTransformerStrategy<any>): Promise<Readable> {
            const quadStream = await this.loadQuadStream();

            const entryStream = new Transform({
                objectMode: true,

                transform(quad: Quad, encoding, callback) {
                    const entry = strategy.transform(quad);
                    if (entry) {
                        this.push(entry);
                    }
                    callback(); // not sure if this is necessary?
                }
            });

            // @ts-ignore
            return quadStream.pipe(entryStream); // WARNING: the pipe method comes from the implementation of the underlying used parser (it can comes from @rdfjs/common-formats if the package loader-rdfjs is used (which uses @rdfjs/fetch)).
            // TODO: ask @rdfjs/types why the Stream interface does not export a pipe method (and also other methods of streams like pause, resume and destroy).
        }

        // public async forEachEntry(callbackfn: (value: NamedNode, index?: number, array?: NamedNode[]) => Promise<void>): Promise<void> {
        //     const indexEntryType = this.getSemantizer().getConfiguration().getRdfDataModelFactory().namedNode('https://ns.inria.fr/idx/terms#IndexEntry');
        //     this.forEachSubGraph(async (subGraph) => {
        //         if (subGraph.isDefaultGraphRdfTypeOf(indexEntryType)) {
        //             await callbackfn(this.getSemantizer().build(indexEntryFactory, subGraph));
        //         }
        //     });
        // }

        public async findTargetsRecursively(strategy: IndexStrategy, callbackfn: (target: NamedNode) => void, options?: IndexQueryingOptions): Promise<void> {
            strategy.setSemantizer(this.getSemantizer());
            await strategy.execute(this.getBaseUri(), callbackfn, options?.limit);
        }

        // public createEntry()
        // public setEntryProperty
        // public addEntryShapeProperty(entry, property);

        public hasEntrySubIndex(entry: NamedNode | string): boolean {
            return this.getObjectUri(entry, IDX.HAS_SUB_INDEX) !== undefined;
        }

        public getEntryTarget(entry: NamedNode | string): NamedNode | undefined {
            return this.getObjectUri(entry, IDX.HAS_TARGET);
        }

        public getEntrySubIndex(entry: NamedNode | string): NamedNode | undefined {
            return this.getObjectUri(entry, IDX.HAS_SUB_INDEX);
        }

        public getEntryShape(entry: NamedNode | string): NamedNode | BlankNode | undefined {
            return this.getObjectLinked(entry, IDX.HAS_SHAPE);
        }

        public compareEntryWithShape<ComparisonResult>(entry: NamedNode | string, shape: IndexShape, strategy: IndexShapeComparisonStrategy<ComparisonResult>): ComparisonResult {
            const entryThing = this.getSubGraph(entry, this.getDefaultGraphTerm());

            if (!entryThing) {
                throw new Error(`Nothing to compare: the entry ${entry} does not exist.`);
            }

            const entryDataset = this.getSemantizer().build(indexEntryFactory, entryThing);
            return entryDataset.compareShape(shape, strategy);
        }

        public countEntryShapeProperties(entry: NamedNode | string): number {
            const properties = this.getEntryShapePropertiesAll(entry);
            return properties?.length ?? 0;
        }

        public getEntryShapePropertiesAll(entry: NamedNode | string): Term[] | undefined {
            const shape = this.getEntryShape(entry);
            return shape ? this.getObjectLinkedAll(shape, SHACL.PROPERTY) : undefined;
        }
    }

}

export function indexFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(IndexMixin);
}