import { DatasetSemantizerMixinConstructor, NamedNode, Semantizer, Term } from "@semantizer/types";
import { WebIdProfile } from "./types";

export function WebIdProfileMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {
    return class WebIdProfileImpl extends Base implements WebIdProfile {

        public getMaker(subject?: Term | string, graph?: Term | string): NamedNode | undefined {
            return this.getObjectUri(subject ?? this.getBaseUri(), 'http://xmlns.com/foaf/0.1/maker', graph ?? this.getDefaultGraphTerm());
        }
        
        public getPrimaryTopic(subject?: Term | string, graph?: Term | string): NamedNode | undefined {
            return this.getObjectUri(subject ?? this.getBaseUri(), 'http://xmlns.com/foaf/0.1/primaryTopic', graph ?? this.getDefaultGraphTerm());
        }
    }
}

export function webIdFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(WebIdProfileMixin);
}

export default webIdFactory;