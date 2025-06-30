import RdfjsDatasetImpl from "@semantizer/rdfjs-dataset-impl";
import { BlankNode, LoggingComponent, LoggingLevel, NamedNode, Quad, Quad_Subject, QuadSubject, Semantizer, WithBaseUri, WithLoggingOptions, WithMixins, WithSemantizer } from '@semantizer/types';

export class DatasetCoreRdfjsImpl extends RdfjsDatasetImpl implements WithSemantizer, WithBaseUri, WithMixins {

    private _semantizer: Semantizer;
    private _baseUri: Quad_Subject;

    public constructor(semantizer: Semantizer, baseUri?: QuadSubject, quads?: Iterable<Quad>) {
        super(quads);
        this._semantizer = semantizer;
        const { namedNode } = this._semantizer.getConfiguration().getRdfDataModelFactory();
        if (baseUri) {
            const namedNodeBaseUri = typeof baseUri === 'string' ? namedNode(baseUri) : baseUri;
            baseUri && namedNodeBaseUri.value !== '' && new URL(namedNodeBaseUri.value); // check URL is valid
            this._baseUri = baseUri ? namedNodeBaseUri : namedNode('');
        } else {
            this._baseUri = namedNode('');
        }
    }

    public get mixins() {
        return {}
    }

    public getLoggingComponent(): LoggingComponent {
        return {
            type: 'PACKAGE',
            name: 'core-rdfjs'
        }
    }

    public log(level: LoggingLevel, message: string, options?: WithLoggingOptions): void {
        this.getSemantizer().log(this, level, message, options);
    }
    
    public logInfo(message: string, options?: WithLoggingOptions): void {
        this.getSemantizer().logInfo(this, message, options);
    }
    
    public logWarning(message: string, options?: WithLoggingOptions): void {
        this.getSemantizer().logWarning(this, message, options);
    }
    
    public logError(message: string, options?: WithLoggingOptions): void {
        this.getSemantizer().logError(this, message, options);
    }

    public getBaseUri(): Quad_Subject {
        return this._baseUri;
    }

    public setBaseUri(baseUri: QuadSubject): void {
        const base = typeof baseUri === 'string'
            ? this.getSemantizer().getConfiguration().getRdfDataModelFactory().namedNode(baseUri)
            : baseUri;
        this._baseUri = base;
    }

    public getSemantizer(): Semantizer {
        return this._semantizer;
    }

    public setSemantizer(semantizer: Semantizer): void {
        this._semantizer = semantizer;
    }

    protected _create(quads?: Iterable<Quad>): DatasetCoreRdfjsImpl {
        return new DatasetCoreRdfjsImpl(this._semantizer, this._baseUri, quads);
    }

    // TODO: move to a Utility class
    public createNamedNode(from: NamedNode | BlankNode | string): NamedNode | BlankNode {
        return typeof from === 'string' ? this.getSemantizer().getConfiguration().getRdfDataModelFactory().namedNode(from) : from;
    }

}

export default DatasetCoreRdfjsImpl;