import { DatasetMixin, DatasetMixinNamespace } from "@semantizer/mixin-dataset";
import { DatasetRdfjs, DatasetSemantizerConstructor, LoggingComponent, NamedNode, Quad, Quad_Subject, Semantizer, ShaclValidator, Term, WithMixins } from "@semantizer/types";
import { Readable, Transform } from "stream";
import { IDX, SHACL } from "./namespaces.js";
import { EntryStreamTransformer, IndexMixinNamespace, IndexMixinOperations, IndexQueryingOptions, IndexQueryingStrategy } from "./types";

export function IndexMixin<
    TMixins extends DatasetMixinNamespace,
    TBase extends DatasetSemantizerConstructor<TMixins>
>(Base: TBase) {

    return class IndexMixinImpl extends Base implements WithMixins<TMixins & IndexMixinNamespace> {

        public get mixins(): TMixins & IndexMixinNamespace {
            const parentMixins = super.mixins as TMixins & Partial<{ index: Partial<IndexMixinOperations> }>;

            return {
                ...parentMixins,
                index: {
                    ...(parentMixins.index ?? {}),

                    /**
                     * Transforms the quad stream of this dataset into an IndexEntry stream.
                     * @returns A Readable stream of IndexEntry with their linked objects (shape and properties).
                     */
                    loadEntryStream: async (strategy: EntryStreamTransformer<any>): Promise<Readable> => {
                        const quadStream = await this.mixins.dataset.loadQuadStream();

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
                        return quadStream.pipe(entryStream);
                        // WARNING: the pipe method comes from the implementation of the underlying used parser 
                        // (it can comes from @rdfjs/common-formats if the package loader-rdfjs is used (which 
                        // uses @rdfjs/fetch)).
                        // TODO: ask @rdfjs/types why the Stream interface does not export a pipe method 
                        // (and also other methods of streams like pause, resume and destroy).
                    },

                    // public async forEachEntry(callbackfn: (value: NamedNode, index?: number, array?: NamedNode[]) => Promise<void>): Promise<void> {
                    //     const indexEntryType = this.getSemantizer().getConfiguration().getRdfDataModelFactory().namedNode('https://ns.inria.fr/idx/terms#IndexEntry');
                    //     this.forEachSubGraph(async (subGraph) => {
                    //         if (subGraph.isDefaultGraphRdfTypeOf(indexEntryType)) {
                    //             await callbackfn(this.getSemantizer().build(indexEntryFactory, subGraph));
                    //         }
                    //     });
                    // }

                    // getLoggingComponent: (): LoggingComponent => {
                    //     return {
                    //         type: 'MIXIN',
                    //         name: 'index'
                    //     }
                    // },

                    query: (strategy: IndexQueryingStrategy, options?: IndexQueryingOptions): Readable => {
                        this.logInfo("Start querying...");
                        strategy.setSemantizer(this.getSemantizer());
                        return strategy.query(this, options);
                    },

                    // public createEntry()
                    // public setEntryProperty
                    // public addEntryShapeProperty(entry, property);

                    hasEntrySubIndex: (entry: NamedNode | string): boolean => {
                        return this.mixins.dataset.getObjectUri(entry, IDX.HAS_SUB_INDEX) !== undefined;
                    },

                    getEntryTarget: (entry: NamedNode | string): NamedNode | undefined => {
                        return this.mixins.dataset.getObjectUri(entry, IDX.HAS_TARGET);
                    },

                    getEntrySubIndex: (entry: NamedNode | string): NamedNode | undefined => {
                        return this.mixins.dataset.getObjectUri(entry, IDX.HAS_SUB_INDEX);
                    },

                    getEntryShape: (entry: NamedNode | string): Quad_Subject | undefined => {
                        return this.mixins.dataset.getObjectLinked(entry, IDX.HAS_SHAPE);
                    },

                    doesEntryMatchShape: (entry: NamedNode | string, shape: DatasetRdfjs, shaclValidator: ShaclValidator): boolean => {
                        throw new Error("Not implemented");
                    },

                    countEntryShapeProperties: (entry: NamedNode | string): number => {
                        const properties = this.mixins.index.getEntryShapePropertiesAll(entry);
                        return properties?.length ?? 0;
                    },

                    getEntryShapePropertiesAll: (entry: NamedNode | string): Term[] | undefined => {
                        const shape = this.mixins.index.getEntryShape(entry);
                        return shape ? this.mixins.dataset.getObjectLinkedAll(shape, SHACL.PROPERTY) : undefined;
                    },
                }

            }

        }

        public getLoggingComponent(): LoggingComponent {
            return {
                type: 'MIXIN',
                name: 'index'
            }
        }

    }

}

export function indexFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(IndexMixin, DatasetMixin(_DatasetImpl));
}