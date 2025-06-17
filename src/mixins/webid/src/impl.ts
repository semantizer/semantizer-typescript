import { DatasetMixin, DatasetMixinNamespace } from "@semantizer/mixin-dataset";
import { DatasetSemantizerConstructor, NamedNode, Semantizer, Term, WithMixins } from "@semantizer/types";
import { WebIdProfileMixinNamespace, WebIdProfileMixinOperations } from "./types";

export function WebIdProfileMixin<
    TMixins extends DatasetMixinNamespace,
    TBase extends DatasetSemantizerConstructor<TMixins>
>(Base: TBase) {
    return class WebIdProfileImpl extends Base implements WithMixins<TMixins & WebIdProfileMixinNamespace> {

        public get mixins(): TMixins & WebIdProfileMixinNamespace {
            const parentMixins = super.mixins as TMixins & Partial<{ webid: Partial<WebIdProfileMixinOperations> }>;

            return {
                ...parentMixins,
                webid: {
                    ...(parentMixins.webid ?? {}),
                    getMaker: (subject?: Term | string, graph?: Term | string): NamedNode | undefined => {
                        return this.mixins.dataset.getObjectUri(subject ?? this.getBaseUri(), 'http://xmlns.com/foaf/0.1/maker', graph ?? this.mixins.dataset.getDefaultGraphTerm());
                    },

                    getPrimaryTopic: (subject?: Term | string, graph?: Term | string): NamedNode | undefined => {
                        return this.mixins.dataset.getObjectUri(subject ?? this.getBaseUri(), 'http://xmlns.com/foaf/0.1/primaryTopic', graph ?? this.mixins.dataset.getDefaultGraphTerm());
                    }
                }

            }

        }

    }
}

export function webIdFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(WebIdProfileMixin, DatasetMixin(_DatasetImpl));
}