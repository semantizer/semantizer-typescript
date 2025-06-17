import { Configuration, MixinFactoryConstructor, DataFactory, DatasetBaseFactory, DatasetImplConstructor, Loader, Quad, LoaderQuadStream, LoggingEntryCallback, LoggingLevel } from "@semantizer/types";

type DatasetBaseFactoryConstructor<TBase extends DatasetImplConstructor> = new(impl: TBase) => DatasetBaseFactory;

interface ConfigurationConstructorParameters {
    loader: Loader;
    loaderQuadStream: LoaderQuadStream;
    rdfModelDataFactory: DataFactory;
    datasetImpl: DatasetImplConstructor;//<SemantizerType>
    mixinFactoryImpl: MixinFactoryConstructor<any, any>;
    datasetBaseFactoryImpl: DatasetBaseFactoryConstructor<any>;
    enableLogging?: boolean;
    loggingLevel?: LoggingLevel;

    // datasetSemantizerBaseRdfjsImpl: DatasetSemantizerBaseRdfjsConstructor,
    // datasetMixin?: DatasetSemantizer //DatasetMixin,
    // datasetMixin: (Base: DatasetImpl) => Constructor<DatasetMixin>
}

export class ConfigurationImpl implements Configuration {

    private _loader: Loader;
    private _loaderQuadStream: LoaderQuadStream;
    private _rdfModelDataFactory: DataFactory;
    private _mixinFactoryImpl: MixinFactoryConstructor<any, any>;
    private _datasetImpl: DatasetImplConstructor;
    private _datasetBaseFactory: DatasetBaseFactory;
    private _loggingEnabled: boolean;
    private _loggingLevel: LoggingLevel;
    private _logEntryCallbacks: Set<LoggingEntryCallback>;

    public constructor(params: ConfigurationConstructorParameters) {
        this._loader = params.loader;
        this._loaderQuadStream = params.loaderQuadStream;
        this._datasetImpl = params.datasetImpl;
        this._rdfModelDataFactory = params.rdfModelDataFactory;
        this._mixinFactoryImpl = params.mixinFactoryImpl;
        this._datasetBaseFactory = new (params.datasetBaseFactoryImpl)(params.datasetImpl);
        this._loggingEnabled = params.enableLogging ?? false;
        this._loggingLevel = params.loggingLevel ?? 'WARN';
        this._logEntryCallbacks = new Set();
    }

    public getMixinFactoryImpl(): MixinFactoryConstructor<any, any> {
        return this._mixinFactoryImpl;
    }

    public getDatasetBaseFactory(): DatasetBaseFactory {
        return this._datasetBaseFactory;
    }

    public getLoader(): Loader {
        return this._loader;
    }

    public getLoaderQuadStream(): LoaderQuadStream {
        return this._loaderQuadStream;
    }

    public getRdfDataModelFactory(): DataFactory<Quad, Quad> {
        return this._rdfModelDataFactory;
    }

    public getDatasetImpl(): DatasetImplConstructor { 
        return this._datasetImpl;
    }

    public setLoader(loader: Loader): void {
        this._loader = loader;
    }
    
    public setLoaderQuadStream(loaderQuadStream: LoaderQuadStream): void {
        this._loaderQuadStream = loaderQuadStream;
    }
    
    public setRdfDataModelFactory(dataFactory: DataFactory): void {
        this._rdfModelDataFactory = dataFactory;
    }
    
    public setMixinFactoryImpl(mixinFactoryConstructor: MixinFactoryConstructor<any, any>): void {
        this._mixinFactoryImpl = mixinFactoryConstructor;
    }
    
    public setDatasetBaseFactory(datasetBaseFactory: DatasetBaseFactory): void {
        this._datasetBaseFactory = datasetBaseFactory;
    }
    
    public setDatasetImpl(datasetConstructor: DatasetImplConstructor): void {
        this._datasetImpl = datasetConstructor;
    }
    
    public enableLogging(level: LoggingLevel = 'WARN'): void {
        this._loggingEnabled = true;
        this.setLoggingLevel(level);
    }
    
    public disableLogging(): void {
        this._loggingEnabled = false;
    }
    
    public setLoggingLevel(level: LoggingLevel): void {
        this._loggingLevel = level;
    }
    
    public isLoggingEnabled(): boolean {
        return this._loggingEnabled;
    }
    
    public getLoggingLevel(): LoggingLevel {
        return this._loggingLevel;
    }

    public getRegisteredLoggingEntryCallbacks(): Set<LoggingEntryCallback> {
        return this._logEntryCallbacks;
    }
    
    public registerLoggingEntryCallback(callback: LoggingEntryCallback): void {
        this._logEntryCallbacks.add(callback);
    }
    
    public unregisterLoggingEntryCallback(callback: LoggingEntryCallback): void {
        this._logEntryCallbacks.delete(callback);
    }
    
}