
import { DatasetMixin, DatasetMixinNamespace } from "@semantizer/mixin-dataset";
import { BlankNode, DatasetSemantizerConstructor, NamedNode, Quad_Graph, Quad_Object, Quad_Subject, Semantizer, WithMixins } from "@semantizer/types";
import { RDF, SHACL } from "./ns";
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

                    getPath: (property: NamedNode | BlankNode | string, graph?: Quad_Graph | string): NamedNode | undefined => {
                        return this.mixins.dataset.getObjectUri(property, SHACL.PATH, graph);
                    },

                    isClosed: (shape: Quad_Subject | string, graph?: Quad_Graph | string): boolean | undefined => {
                        return this.mixins.dataset.getObjectBoolean(shape, SHACL.CLOSED, graph);
                    },

                    setIsClosed: (shape: Quad_Subject | string, closed: boolean, graph?: Quad_Graph | string): void => {
                        throw new Error("Method not implemented.");
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

                    setPath: (property: NamedNode | BlankNode | string, path: NamedNode, oldPath?: NamedNode, graph?: Quad_Graph | string): void => {
                        this.mixins.dataset.setObjectUri(property, SHACL.PATH, path, oldPath, graph);
                    },

                    addHasValue: (property: NamedNode | BlankNode | string, value: Quad_Object, graph?: Quad_Graph | string): void => {
                        throw new Error("Method not implemented.");
                    },

                    setMinCount: (property: NamedNode | BlankNode | string, minCount: number, oldMinCount?: number, graph?: Quad_Graph | string): void => {
                        throw new Error("Method not implemented.");
                    },

                    setMaxCount: (property: NamedNode | BlankNode | string, minCount: number, oldMaxCount?: number, graph?: Quad_Graph | string): void => {
                        throw new Error("Method not implemented.");
                    },

                    addQualifiedValueShape: (property: NamedNode | BlankNode | string, shape: NamedNode | BlankNode, graph?: Quad_Graph | string): void => {
                        throw new Error("Method not implemented.");
                    },

                    setQualifiedMinCount: (property: NamedNode | BlankNode | string, qualifiedMinCount: number, oldQualifiedMinCount?: number, graph?: Quad_Graph | string): void => {
                        throw new Error("Method not implemented.");
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