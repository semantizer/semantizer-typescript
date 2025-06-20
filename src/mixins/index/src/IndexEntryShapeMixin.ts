
import { DatasetMixin, DatasetMixinNamespace } from "@semantizer/mixin-dataset";
import { BlankNode, DatasetSemantizerConstructor, NamedNode, Quad_Graph, Quad_Object, Quad_Subject, Semantizer, WithMixins } from "@semantizer/types";
import { IndexIntryShapeMixinNamespace, IndexEntryShapeMixinOperations } from "./types.js";
import { ShaclShapeMixinNamespace, ShaclShapeMixin } from "@semantizer/mixin-shacl";
import { IDX, RDF, RDFJS } from "./namespaces.js";

export function IndexEntryShapeMixin<
    TMixins extends ShaclShapeMixinNamespace,
    TBase extends DatasetSemantizerConstructor<TMixins>
>(Base: TBase) {

    return class IndexEntryShapeMixinImpl extends Base implements WithMixins<TMixins & IndexIntryShapeMixinNamespace> {

        public constructor(...args: any[]) {
            super(...args);
            this.mixins.shacl.createShapeAsNamedNode(IDX.INDEX_ENTRY);
            this.mixins.dataset.addObjectUri(IDX.INDEX_ENTRY, RDF.TYPE, RDFJS.CLASS);
            this.mixins.shacl.setIsClosed(IDX.INDEX_ENTRY, false);
        }

        public get mixins(): TMixins & IndexIntryShapeMixinNamespace {
            const parentMixins = super.mixins as TMixins & Partial<{ entry: Partial<IndexEntryShapeMixinOperations> }>;

            return {
                ...parentMixins,

                entry: {
                    ...(parentMixins.entry ?? {}),

                    addPropertyToTargetFinalResult: (shape?: NamedNode | string): void => {
                        const property = this.mixins.shacl.createPropertyAsBlankNode(shape ?? IDX.INDEX_ENTRY);
                        this.mixins.shacl.setPath(property, IDX.HAS_TARGET);
                        this.mixins.shacl.setMinCount(property, 1);
                    }

                }
            
            }

        }

    }

}

export function indexEntryShapeFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(IndexEntryShapeMixin, ShaclShapeMixin(DatasetMixin(_DatasetImpl)));
}

function test(semantizer: Semantizer) {
    const sh = semantizer.build(indexEntryShapeFactory);
    sh.mixins.shacl
}