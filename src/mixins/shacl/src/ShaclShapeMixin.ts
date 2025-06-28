
import { DatasetMixin, DatasetMixinNamespace } from "@semantizer/mixin-dataset";
import { BlankNode, DatasetSemantizerConstructor, NamedNode, Quad_Graph, Quad_Object, Quad_Subject, Semantizer, Term, WithMixins } from "@semantizer/types";
import { RDF, SHACL } from "./ns.js";
import { ShaclShapeMixinNamespace, ShaclShapeMixinOperations } from "./types";

export function ShaclShapeMixin<
    TMixins extends DatasetMixinNamespace,
    TBase extends DatasetSemantizerConstructor<TMixins>
>(Base: TBase) {

    return class ShaclShapeMixinImpl extends Base implements WithMixins<TMixins & ShaclShapeMixinNamespace> {

        public get mixins(): TMixins & ShaclShapeMixinNamespace {
            const parentMixins = super.mixins as TMixins & Partial<{ shacl: Partial<ShaclShapeMixinOperations> }>;

            return {
                ...parentMixins,

                shacl: {
                    ...(parentMixins.shacl ?? {}),

                    getDatatype: (property: Term | string, graph?: Quad_Graph | string): NamedNode | undefined => {
                        return this.mixins.dataset.getObjectUri(property, SHACL.DATATYPE, graph);
                    },

                    getPath: (property: Term | string, graph?: Quad_Graph | string): NamedNode | undefined => {
                        return this.mixins.dataset.getObjectUri(property, SHACL.PATH, graph);
                    },

                    getPropertiesAll: (shape: Quad_Subject | string, graph?: Quad_Graph | string): Term[] | undefined => {
                        return this.mixins.dataset.getObjectLinkedAll(shape, SHACL.PROPERTY, graph);
                    },

                    getMinCount: (property: Term | string, graph?: Quad_Graph | string): number | undefined => {
                        return this.mixins.dataset.getObjectInteger(property, SHACL.MIN_COUNT, graph);
                    },
                    
                    getMaxCount: (property: Term | string, graph?: Quad_Graph | string): number | undefined => {
                        return this.mixins.dataset.getObjectInteger(property, SHACL.MAX_COUNT, graph);
                    },

                    isClosed: (shape: Quad_Subject | string, graph?: Quad_Graph | string): boolean | undefined => {
                        return this.mixins.dataset.getObjectBoolean(shape, SHACL.CLOSED, graph);
                    },

                    isMandatory: (property: Term | string, graph?: Quad_Graph | string): boolean => {
                        const minCount = this.mixins.shacl.getMinCount(property, graph);
                        return (minCount !== undefined && minCount > 0);
                    },

                    isMultiple: (property: Term | string, graph?: Quad_Graph | string): boolean => {
                        const maxCount = this.mixins.shacl.getMaxCount(property, graph);
                        return (maxCount === undefined || maxCount > 1);
                    },

                    setIsClosed: (shape: Quad_Subject | string, closed: boolean, oldClosed?: boolean, graph?: Quad_Graph | string): void => {
                        this.mixins.dataset.setObjectBoolean(shape, SHACL.CLOSED, closed, oldClosed, graph);
                    },

                    createShapeAsNamedNode: (uri: NamedNode | string, graph?: Quad_Graph | string): NamedNode => {
                        this.mixins.dataset.addObjectUri(uri, RDF.TYPE, SHACL.NODE_SHAPE, graph);
                        return typeof uri === 'string' ? this.getSemantizer().getConfiguration().getRdfDataModelFactory().namedNode(uri) : uri;
                    },

                    createShapeAsBlankNode: (name?: string, graph?: Quad_Graph | string): BlankNode => {
                        throw new Error("Method not implemented.");
                    },

                    createPropertyAsNamedNode: (shape: Quad_Subject | string, uri: NamedNode | string, graph?: Quad_Graph | string): NamedNode => {
                        throw new Error("Method not implemented.");
                    },

                    createPropertyAsBlankNode: (shape: Quad_Subject | string, name?: string, graph?: Quad_Graph | string): BlankNode => {
                        const property = this.getSemantizer().getConfiguration().getRdfDataModelFactory().blankNode(name);
                        this.mixins.dataset.addObjectBlankNode(shape, SHACL.PROPERTY, property, graph);
                        return property;
                    },

                    setPath: (property: NamedNode | BlankNode | string, path: NamedNode | string, oldPath?: NamedNode, graph?: Quad_Graph | string): void => {
                        this.mixins.dataset.setObjectUri(property, SHACL.PATH, path, oldPath, graph);
                    },

                    addHasValue: (subject: NamedNode | BlankNode | string, value: NamedNode | BlankNode | string, graph?: Quad_Graph | string): void => {
                        this.mixins.dataset.addObjectUriOrBlankNode(subject, SHACL.HAS_VALUE, value, graph);
                    },

                    setMinCount: (property: NamedNode | BlankNode | string, minCount: number, oldMinCount?: number, graph?: Quad_Graph | string): void => {
                        this.mixins.dataset.setObjectInteger(property, SHACL.MIN_COUNT, minCount, oldMinCount, graph);
                    },

                    setMaxCount: (property: NamedNode | BlankNode | string, minCount: number, oldMaxCount?: number, graph?: Quad_Graph | string): void => {
                        this.mixins.dataset.setObjectInteger(property, SHACL.MAX_COUNT, minCount, oldMaxCount, graph);
                    },

                    addQualifiedValueShape: (property: NamedNode | BlankNode | string, shape: NamedNode | BlankNode, graph?: Quad_Graph | string): void => {
                        throw new Error("Method not implemented.");
                    },

                    setQualifiedMinCount: (property: NamedNode | BlankNode | string, qualifiedMinCount: number, oldQualifiedMinCount?: number, graph?: Quad_Graph | string): void => {
                        this.mixins.dataset.setObjectInteger(property, SHACL.QUALIFIED_MIN_COUNT, qualifiedMinCount, oldQualifiedMinCount, graph);
                    }

                }

            }

        }

    }

}

export function shaclShapeFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(ShaclShapeMixin, DatasetMixin(_DatasetImpl));
}