import { Semantizer, DatasetSemantizer, DatasetSemantizerMixinConstructor } from '@semantizer/types';

export type Catalog = DatasetSemantizer & SolidContainerOperations;

const LDP = 'http://www.w3.org/ns/ldp#';

export interface SolidContainerOperations {
    getContainedResources(): DatasetSemantizer[];
}

export function SolidContainerMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class SolidContainerMixinImpl extends Base implements SolidContainerOperations {

        public getContainedResources(): DatasetSemantizer[] {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            const predicate = dataFactory.namedNode(LDP + 'contains');
            return this.getLinkedObjectAll(predicate);
        }

    }

}

export function solidContainerFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(SolidContainerMixin);
}