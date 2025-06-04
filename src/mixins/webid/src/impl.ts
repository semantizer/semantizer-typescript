import { DatasetMixinConstructor } from "@semantizer/mixin-dataset";
import { NamedNode, Semantizer, Term } from "@semantizer/types";
import { WebIdProfile } from "./types";

export function WebIdProfileMixin<
    TBase extends DatasetMixinConstructor
>(Base: TBase) {
    return class WebIdProfileImpl extends Base implements WebIdProfile {

        public get webid() {

            return {

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

export function webIdFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(WebIdProfileMixin);
}