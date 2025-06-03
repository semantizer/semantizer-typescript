import { Configuration, Constructor, Semantizer, DatasetSemantizer, MixinFactory, MixinFactoryFunction, DatasetImplConstructor, QuadIterableSemantizer, Fetch, NamedNode, LoggingLevel, LoggingEntryCallback, Term, LoggingComponent, BlankNode, DefaultGraph, Literal, Quad, Quad_Graph, Quad_Object, Quad_Predicate, Quad_Subject, LoggingEntry, WithLogging, WithLoggingOptions } from "@semantizer/types";
import { MixinFactoryImpl } from "./MixinFactoryImpl.js";

type T = new (...args: any[]) => DatasetSemantizer;

export class SemantizerImpl implements Semantizer {

    private _configuration: Configuration;

    public constructor(configuration: Configuration) {
        this._configuration = configuration;
        configuration.getLoader().setSemantizer(this);
        configuration.getLoaderQuadStream().setSemantizer(this);
    }
    
    public getConfiguration(): Configuration {
        return this._configuration;
    }

    public setConfiguration(configuration: Configuration): void {
        this._configuration = configuration;
    }

    // don't move mixinFactory into Config because otherwise, config will depend on Semantizer
    public getMixinFactory<TMixin extends DatasetSemantizer>(mixin: (Base: DatasetImplConstructor) => Constructor<TMixin>): MixinFactory<DatasetImplConstructor, TMixin>;
    public getMixinFactory<TBase extends Constructor, TMixin extends DatasetSemantizer>(mixin: (Base: TBase) => Constructor<TMixin>, baseClass: TBase): MixinFactory<TBase, TMixin>;
    public getMixinFactory<TBase extends Constructor, TMixin extends DatasetSemantizer>(mixin: (Base: TBase | DatasetImplConstructor) => Constructor<TMixin>, baseClass?: TBase): MixinFactory<DatasetImplConstructor, TMixin> | MixinFactory<TBase, TMixin> {
        return baseClass ? new MixinFactoryImpl(this, mixin, baseClass) : new MixinFactoryImpl<DatasetImplConstructor, TMixin>(this, mixin, this.getConfiguration().getDatasetImpl());
    }

    public async load<TBase extends Constructor, TMixin extends DatasetSemantizer>(resource: string | NamedNode, mixinFactoryFunction: MixinFactoryFunction<TBase, TMixin>, fetch?: Fetch): Promise<TMixin>;
    public async load<TBase extends Constructor, TMixin extends DatasetSemantizer>(resource: string | NamedNode, mixinFactoryFunction?: MixinFactoryFunction<TBase, TMixin>, fetch?: Fetch): Promise<DatasetSemantizer | TMixin> {
        return mixinFactoryFunction ? await mixinFactoryFunction(this).load(resource, fetch) : this.getConfiguration().getDatasetBaseFactory().load(this, resource, fetch);
    }

    public build<TBase extends Constructor, TMixin extends DatasetSemantizer>(): DatasetSemantizer;
    public build<TBase extends Constructor, TMixin extends DatasetSemantizer>(fromDataset: QuadIterableSemantizer): DatasetSemantizer;
    public build<TBase extends Constructor, TMixin extends DatasetSemantizer>(mixinFactoryFunction: MixinFactoryFunction<TBase, TMixin>): TMixin;
    public build<TBase extends Constructor, TMixin extends DatasetSemantizer>(mixinFactoryFunction: MixinFactoryFunction<TBase, TMixin>, fromDataset?: QuadIterableSemantizer): TMixin;
    public build<TBase extends Constructor, TMixin extends DatasetSemantizer>(mixinFactoryFunctionOrDataset?: MixinFactoryFunction<TBase, TMixin> | QuadIterableSemantizer, fromDataset?: QuadIterableSemantizer): DatasetSemantizer | TMixin {
        return mixinFactoryFunctionOrDataset && typeof mixinFactoryFunctionOrDataset === 'function' ? mixinFactoryFunctionOrDataset(this).build(fromDataset) : this.getConfiguration().getDatasetBaseFactory().build(this, mixinFactoryFunctionOrDataset ?? fromDataset);
    }

    public createQuad(subject: Quad_Subject, predicate: Quad_Predicate, object: Quad_Object, graph?: Quad_Graph): Quad {
        return this.getConfiguration().getRdfDataModelFactory().quad(subject, predicate, object, graph);
    }
    
    public createDefaultGraph(): DefaultGraph {
        return this.getConfiguration().getRdfDataModelFactory().defaultGraph();
    }
    
    public createBlankNode(value?: string): BlankNode {
        return this.getConfiguration().getRdfDataModelFactory().blankNode(value);
    }
    
    public createNamedNode(uri: string): NamedNode {
        return this.getConfiguration().getRdfDataModelFactory().namedNode(uri);
    }
    
    public createLiteral(value: string, languageOrDatatype?: string | NamedNode): Literal {
        return this.getConfiguration().getRdfDataModelFactory().literal(value, languageOrDatatype);
    }

    public getLoggingComponent(): LoggingComponent {
        return {
            type: 'PACKAGE',
            name: 'core'
        }
    }

    protected createLoggingEntry(component: WithLogging, level: LoggingLevel, message: string, options?: WithLoggingOptions): LoggingEntry {
        return {
            component: component.getLoggingComponent(),
            date: new Date(),
            level,
            message,
            code: options?.code,
            instance: options?.instance,
            source: options?.source,
            subject: options?.subject
        }
    }

    public log(component: WithLogging, level: LoggingLevel, message: string, options?: WithLoggingOptions): void {
        const loggingEntryCallbacks = this.getConfiguration().getRegisteredLoggingEntryCallbacks();
        if (loggingEntryCallbacks.size > 0) {
            const loggingEntry = this.createLoggingEntry(component, level, message, options);
            for (const callback of loggingEntryCallbacks) {
                callback(loggingEntry);
            }
        }
    }

    public logInfo(component: WithLogging, message: string, options?: WithLoggingOptions): void {
        this.log(component, 'INFO', message, options);
    }
    
    public logWarning(component: WithLogging, message: string, options?: WithLoggingOptions): void {
        this.log(component, 'WARN', message, options);
    }

    public logError(component: WithLogging, message: string, options?: WithLoggingOptions): void {
        this.log(component, 'ERROR', message, options);
    }

}