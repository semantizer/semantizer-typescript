import { BlankNode, DataFactory, DefaultGraph, Literal, NamedNode, Quad, Quad_Graph, Quad_Object, Quad_Predicate, Quad_Subject } from "@rdfjs/types";
import { LoggingEntryCallback, LoggingLevel, QuadIterableSemantizer, QuadSubject, WithLogging, WithLoggingOptions } from "./Common";
import { DatasetBaseFactory, DatasetSemantizer } from "./Datasets";
import { Fetch, Loader, LoaderQuadStream } from "./Loader";

export type MixinConstructor<T = {}> = new (...args: any[]) => T;
export type DatasetImplConstructor<T extends object = {}> = new (semantizer: Semantizer, baseUri?: QuadSubject, quads?: Iterable<Quad>) => DatasetSemantizer<T>;

export type DatasetFactoryFunction<
    DatasetImpl extends DatasetImplConstructor,
    DatasetMixin extends DatasetSemantizer
> = (semantizer: Semantizer) => MixinFactory<DatasetImpl, DatasetMixin>;

export type MixinFactoryFunction<
    TBase extends MixinConstructor, 
    TMixin extends DatasetSemantizer
> = (semantizer: Semantizer) => MixinFactory<TBase, TMixin>;

export interface Semantizer {
    getConfiguration(): Configuration;
    setConfiguration(configuration: Configuration): void;
    
    getMixinFactory<TMixin extends DatasetSemantizer>(mixin: (Base: DatasetImplConstructor) => MixinConstructor<TMixin>): MixinFactory<DatasetImplConstructor, TMixin>;
    getMixinFactory<TBase extends MixinConstructor, TMixin extends DatasetSemantizer>(mixin: (Base: TBase) => MixinConstructor<TMixin>, baseClass: TBase): MixinFactory<TBase, TMixin>;
    getMixinFactory<TBase extends MixinConstructor, TMixin extends DatasetSemantizer>(mixin: (Base: TBase | DatasetImplConstructor) => MixinConstructor<TMixin>, baseClass?: TBase): MixinFactory<DatasetImplConstructor, TMixin> | MixinFactory<TBase, TMixin>;
    
    load<TBase extends MixinConstructor, TMixin extends DatasetSemantizer>(resource: string | NamedNode, mixinFactoryFunction: MixinFactoryFunction<TBase, TMixin>, fetch?: Fetch): Promise<TMixin>;
    load<TBase extends MixinConstructor, TMixin extends DatasetSemantizer>(resource: string | NamedNode, mixinFactoryFunctionOrFetch?: MixinFactoryFunction<TBase, TMixin> | Fetch, fetch?: Fetch): Promise<DatasetSemantizer | TMixin>;

    build<TBase extends MixinConstructor, TMixin extends DatasetSemantizer>(): DatasetSemantizer;
    build<TBase extends MixinConstructor, TMixin extends DatasetSemantizer>(fromDataset: QuadIterableSemantizer): DatasetSemantizer;
    build<TBase extends MixinConstructor, TMixin extends DatasetSemantizer>(mixinFactoryFunction: MixinFactoryFunction<TBase, TMixin>): TMixin;
    build<TBase extends MixinConstructor, TMixin extends DatasetSemantizer>(mixinFactoryFunction: MixinFactoryFunction<TBase, TMixin>, fromDataset?: QuadIterableSemantizer): TMixin;
    build<TBase extends MixinConstructor, TMixin extends DatasetSemantizer>(mixinFactoryFunctionOrDataset?: MixinFactoryFunction<TBase, TMixin> | QuadIterableSemantizer, fromDataset?: QuadIterableSemantizer): DatasetSemantizer | TMixin;

    log(component: WithLogging, level: LoggingLevel, message: string, options?: WithLoggingOptions): void;
    logInfo(component: WithLogging, message: string, options?: WithLoggingOptions): void;
    logWarning(component: WithLogging, message: string, options?: WithLoggingOptions): void;
    logError(component: WithLogging, message: string, options?: WithLoggingOptions): void;

    // Could be moved to a dedicated mixin, like the one to create quad 
    createQuad(subject: Quad_Subject, predicate: Quad_Predicate, object: Quad_Object, graph?: Quad_Graph): Quad;
    createDefaultGraph(): DefaultGraph;
    createBlankNode(value?: string): BlankNode;
    createNamedNode(uri: string): NamedNode;
    createLiteral(value: string, languageOrDatatype?: string | NamedNode): Literal;

    // TODO: Can be moved to another class
    // getContext(): Context | undefined;
    // setContext(context: Context): void;
    // expand(uri: string): string;
    // shorten(uri: string): string;
}

export interface Configuration {
    getLoader(): Loader;
    getLoaderQuadStream(): LoaderQuadStream;
    getRdfDataModelFactory(): DataFactory;
    getMixinFactoryImpl(): MixinFactoryConstructor<any, any>;
    getDatasetBaseFactory(): DatasetBaseFactory;
    getDatasetImpl(): DatasetImplConstructor;

    setLoader(loader: Loader): void;
    setLoaderQuadStream(loaderQuadStream: LoaderQuadStream): void;
    setRdfDataModelFactory(dataFactory: DataFactory): void;
    setMixinFactoryImpl(mixinFactoryConstructor: MixinFactoryConstructor<any, any>): void;
    setDatasetBaseFactory(datasetBaseFactory: DatasetBaseFactory): void;
    setDatasetImpl(datasetConstructor: DatasetImplConstructor): void;

    enableLogging(level?: LoggingLevel): void;
    disableLogging(): void;
    setLoggingLevel(level: LoggingLevel): void;
    isLoggingEnabled(): boolean;
    getLoggingLevel(): LoggingLevel;
    getRegisteredLoggingEntryCallbacks(): Set<LoggingEntryCallback>;
    registerLoggingEntryCallback(callback: LoggingEntryCallback): void;
    unregisterLoggingEntryCallback(callback: LoggingEntryCallback): void;
}

export interface MixinFactory<
    TBase extends MixinConstructor, 
    TMixin extends DatasetSemantizer
> {
    load(resource: string | NamedNode, fetch?: Fetch): Promise<TMixin>;
    build(dataset?: QuadIterableSemantizer): TMixin;
}

export type MixinFactoryConstructor<
    TBase extends MixinConstructor, 
    TMixin extends DatasetSemantizer
> = new (semantizer: Semantizer, mixin: (Base: TBase) => MixinConstructor<TMixin>, baseClass: TBase) => MixinFactory<TBase, TMixin>;