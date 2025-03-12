import { Constructor, DatasetImplConstructor, DatasetSemantizer, Fetch, MixinFactory, NamedNode, QuadIterableSemantizer, Semantizer } from "@semantizer/types";

// (TODO move to default ? or to a dedicated package.)
// (Add also a MixinFactoryDatasetCore package ?)
// --> Not necessarily as this does not depend on other packages than types.
export class MixinFactoryImpl<
    TBase extends Constructor, 
    TMixin extends DatasetSemantizer
> implements MixinFactory<TBase, TMixin> {

    private _semantizer: Semantizer;
    private _mixedClass: Constructor<TMixin>;

    constructor(semantizer: Semantizer, mixin: (Base: TBase) => Constructor<TMixin>, baseClass: TBase) {
        this._semantizer = semantizer;
        this._mixedClass = mixin(baseClass);
    }

    /**
     * This method creates a base dataset (Dataset mixin) and passes it to the build method 
     * to get the mixed in resulting dataset.
     * @param resourceUri 
     * @throws An `Error` if the `resourceUri` is not a valid URL.
     * @returns A `DatasetSemantizer` based mixin.
     */
    public async load(resourceUri: string | NamedNode, fetch?: Fetch): Promise<TMixin> {
        const ressourceUriString = typeof resourceUri === 'string' ? resourceUri : resourceUri.value;
        // First, we check the resource URL and remove the fragment part
        const resourceUrl = new URL(ressourceUriString); // throws if not a valid URL
        resourceUrl.hash = ''; // delete the hash part

        const baseUri = this._semantizer.getConfiguration().getRdfDataModelFactory().namedNode(resourceUrl.toString());
        const datasetCore = await this._semantizer.getConfiguration().getLoader().load(resourceUrl.toString(), fetch);
        const dataset = new (this._semantizer.getConfiguration().getDatasetImpl())(this._semantizer, baseUri, datasetCore);
        return this.build(dataset);
    }

    public build(sourceDataset?: QuadIterableSemantizer): TMixin {
        const baseUri = sourceDataset? sourceDataset.getBaseUri(): undefined;
        const dataset = new this._mixedClass(this._semantizer, baseUri, sourceDataset); // warning: no check on params (TS mixin)
        return dataset;
    }

}