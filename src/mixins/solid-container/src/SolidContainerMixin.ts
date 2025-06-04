import { DatasetMixinConstructor } from "@semantizer/mixin-dataset";
import { NamedNode, Semantizer } from '@semantizer/types';

const LDP = 'http://www.w3.org/ns/ldp#';

export function SolidContainerMixin<
    TBase extends DatasetMixinConstructor
>(Base: TBase) {

    return class SolidContainerMixinImpl extends Base {

        public constructor(...args: any[]) {
            super(...args);
            this.mixins.solid = {
                ...(this.mixins.solid ?? {}),
                
                getContainedResources: (): NamedNode[] | undefined => {
                    return this.mixins.dataset.getObjectUriAll(this.getBaseUri(), LDP + 'contains');
                }

            }

        }

    }

}

export function solidContainerFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(SolidContainerMixin);
}