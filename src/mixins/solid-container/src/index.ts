import { Semantizer, DatasetSemantizer, DatasetSemantizerMixinConstructor } from '@semantizer/types';

const LDP = 'http://www.w3.org/ns/ldp#';

export type SolidContainer = DatasetSemantizer & SolidContainerOperations;

export interface SolidContainerOperations {
    getContainedResources(): DatasetSemantizer[];
}

export function SolidContainerMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class SolidContainerMixinImpl extends Base implements SolidContainer {

        public getContainedResources(): DatasetSemantizer[] {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = dataFactory.namedNode(LDP + 'contains');
            return this.getLinkedObjectAll(predicate);
        }

    }

}

export function solidContainerFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(SolidContainerMixin);
}