import { DatasetMixin, DatasetMixinNamespace } from "@semantizer/mixin-dataset";
import { DatasetSemantizerConstructor, NamedNode, Semantizer, WithMixins } from '@semantizer/types';
import { SolidContainerMixinNamespace, SolidContainerMixinOperations } from "./types";

const LDP = 'http://www.w3.org/ns/ldp#';

export function SolidContainerMixin<
    TMixins extends DatasetMixinNamespace,
    TBase extends DatasetSemantizerConstructor<TMixins>
>(Base: TBase) {

    return class SolidContainerMixinImpl extends Base implements WithMixins<TMixins & SolidContainerMixinNamespace> {

        public get mixins(): TMixins & SolidContainerMixinNamespace {
            const parentMixins = super.mixins as TMixins & Partial<{ solid: Partial<SolidContainerMixinOperations> }>;

            return {
                ...parentMixins,
                solid: {
                    ...(parentMixins.solid ?? {}),
                    getContainedResources: (): NamedNode[] | undefined => {
                        return this.mixins.dataset.getObjectUriAll(this.getBaseUri(), LDP + 'contains');
                    }
                }

            }

        }

    }

}

export function solidContainerFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(SolidContainerMixin, DatasetMixin(_DatasetImpl));
}