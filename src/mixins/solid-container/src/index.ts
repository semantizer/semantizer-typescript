import { Semantizer, DatasetSemantizer, DatasetSemantizerMixinConstructor, NamedNode } from '@semantizer/types';

const LDP = 'http://www.w3.org/ns/ldp#';

export type SolidContainer = DatasetSemantizer & SolidContainerOperations;

export interface SolidContainerOperations {
    getContainedResources(): NamedNode[] | undefined;
}

export function SolidContainerMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class SolidContainerMixinImpl extends Base implements SolidContainer {

        public getContainedResources(): NamedNode[] | undefined {
            return this.getObjectUriAll(this.getBaseUri(), LDP + 'contains');
        }

    }

}

export function solidContainerFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(SolidContainerMixin);
}