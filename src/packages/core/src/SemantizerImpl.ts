import { Configuration, Constructor, Semantizer, DatasetSemantizer, MixinFactory, MixinFactoryFunction, DatasetImplConstructor, QuadIterableSemantizer, Fetch, NamedNode, LoggingLevel, LoggingEntryCallback, Term } from "@semantizer/types";
import { MixinFactoryImpl } from "./MixinFactoryImpl.js";

type T = new (...args: any[]) => DatasetSemantizer;

export class SemantizerImpl implements Semantizer {

    private _configuration: Configuration;
    private _loggingEnabled: boolean;
    private _loggingLevel: LoggingLevel;
    private _logEntryCallbacks: Set<LoggingEntryCallback>;

    public constructor(configuration: Configuration, enableLogging: boolean = false, loggingLevel: LoggingLevel = 'WARN') {
        this._configuration = configuration;
        this._loggingEnabled = enableLogging;
        this._loggingLevel = loggingLevel;
        this._logEntryCallbacks = new Set();
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

    public log(level: LoggingLevel, message: string, code?: number, subject?: Term): void {
        if (this._logEntryCallbacks.size > 0) {
            const date = new Date();
            const loggingEntry = { date, level, subject, code, message };
            for (const callback of this._logEntryCallbacks) {
                callback(loggingEntry);
            }
        }
    }

    public enableLogging(level: LoggingLevel = 'WARN'): void {
        this._loggingEnabled = true;
        this.setLoggingLevel(level);
    }

    public setLoggingLevel(level: LoggingLevel): void {
        this._loggingLevel = level;
    }
    
    public disableLogging(): void {
        this._loggingEnabled = false;
    }
    
    public isLoggingEnabled(): boolean {
        return this._loggingEnabled;
    }
    
    public getLoggingLevel(): LoggingLevel {
        return this._loggingLevel;
    }
    
    public registerEntryCallback(callback: LoggingEntryCallback): void {
        this._logEntryCallbacks.add(callback);
    }

    public unregisterEntryCallback(callback: LoggingEntryCallback): void {
        this._logEntryCallbacks.delete(callback);
    }

}