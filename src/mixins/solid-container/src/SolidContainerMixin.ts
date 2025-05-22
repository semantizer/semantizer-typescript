import { DatasetSemantizerMixinConstructor, NamedNode, Semantizer } from '@semantizer/types';
import { SolidContainer } from './types';

const LDP = 'http://www.w3.org/ns/ldp#';

export function SolidContainerMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class SolidContainerMixinImpl extends Base { //implements SolidContainer {

        public constructor(...args: any[]) {
            super(...args);
            this.mixins.solid = {
                ...(this.mixins.solid ?? {}),
                
                getContainedResources: (): NamedNode[] | undefined => {
                    return this.getObjectUriAll(this.getBaseUri(), LDP + 'contains');
                }

            }

        }

    }

}

export function solidContainerFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(SolidContainerMixin);
}