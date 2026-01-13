import dataFactory from "@rdfjs/data-model";
import { ConfigurationImpl, DatasetBaseFactoryImpl, MixinFactoryImpl, SemantizerImpl } from "@semantizer/core";
import { DatasetCoreRdfjsImpl } from "@semantizer/core-rdfjs";
import { LoaderRdfjs } from "@semantizer/loader-rdfjs";
import { LoaderQuadStreamRdfjs } from "@semantizer/loader-quad-stream-rdfjs";

const semantizer = new SemantizerImpl(
    new ConfigurationImpl({
        loader: new LoaderRdfjs(),
        loaderQuadStream: new LoaderQuadStreamRdfjs(),
        datasetImpl: DatasetCoreRdfjsImpl,
        rdfModelDataFactory: dataFactory,
        mixinFactoryImpl: MixinFactoryImpl,
        datasetBaseFactoryImpl: DatasetBaseFactoryImpl
    })
);

export default semantizer;