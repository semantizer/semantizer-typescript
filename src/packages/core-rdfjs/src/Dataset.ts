import RdfjsDatasetImpl from "@semantizer/rdfjs-dataset-impl";
import { BlankNode, NamedNode, Quad, Semantizer, WithOrigin, WithSemantizer, WithBaseUri } from '@semantizer/types';

export class DatasetCoreRdfjsImpl extends RdfjsDatasetImpl implements WithSemantizer, WithOrigin, WithBaseUri {

    private _semantizer: Semantizer;
    private _baseUri: NamedNode;
    private _origin: NamedNode | BlankNode | undefined;
    private _originDocument: NamedNode | undefined;
    private _originThing: NamedNode | BlankNode | undefined;

    public constructor(semantizer: Semantizer, baseUri?: NamedNode | string, quads?: Iterable<Quad>) {
        super(quads);
        this._semantizer = semantizer;
        const { namedNode } = this._semantizer.getConfiguration().getRdfDataModelFactory();
        if (baseUri) {
            const namedNodeBaseUri = typeof baseUri === 'string' ? namedNode(baseUri) : baseUri;
            baseUri && namedNodeBaseUri.value !== '' && new URL(namedNodeBaseUri.value); // check URL is valid
            this._baseUri = baseUri ? namedNodeBaseUri : namedNode('');
            this._origin = this._baseUri;
        } else {
            this._baseUri = namedNode('');
            this._origin = this._baseUri;
        }
    }

    public getBaseUri(): NamedNode {
        return this._baseUri;
    }
    
    public setBaseUri(baseUri: NamedNode): void {
        this._baseUri = baseUri;
    }
    
    public getSemantizer(): Semantizer {
        return this._semantizer;
    }

    protected _create(quads?: Iterable<Quad>): DatasetCoreRdfjsImpl {
        return new DatasetCoreRdfjsImpl(this._semantizer, this._originDocument, quads);
    }

    // TODO: move to a Utility class
    public createNamedNode(from: NamedNode | BlankNode | string): NamedNode | BlankNode {
        return typeof from === 'string'? this.getSemantizer().getConfiguration().getRdfDataModelFactory().namedNode(from): from;
    }

    public getOrigin(): NamedNode | BlankNode | undefined {
        return this._origin;
    }

    public setOrigin(origin: NamedNode | BlankNode): void {
        this._origin = origin;
    }

    public getOriginDocument(): NamedNode | undefined {
        return this._originDocument;
    }

    public getOriginThing(): NamedNode | BlankNode | undefined {
        return this._originThing;
    }

    public setOriginThing(thing: NamedNode | BlankNode): void {
        this._originThing = thing;
    }

}

export default DatasetCoreRdfjsImpl;