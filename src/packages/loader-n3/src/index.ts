import { HttpError } from "@semantizer/http-error";
import { DatasetCoreRdfjs, Fetch, Loader, LoggingComponent, Quad } from "@semantizer/types";
import { LoaderBase } from "@semantizer/util-loader-base";
import N3 from "n3";

type DatasetCoreRdfjsConstructor = (quads: Quad[]) => DatasetCoreRdfjs<Quad, Quad>;

export class LoaderN3 extends LoaderBase implements Loader {

    private _DatasetCoreRdfjsImpl: DatasetCoreRdfjsConstructor;

    public constructor(DatasetCoreRdfjsImpl: DatasetCoreRdfjsConstructor) {
        super();
        this._DatasetCoreRdfjsImpl = DatasetCoreRdfjsImpl;
    }

    public getLoggingComponent(): LoggingComponent {
        return {
            type: 'PACKAGE',
            name: 'loader-n3'
        }
    }

    public async load(uri: string, fetchFunction?: Fetch): Promise<DatasetCoreRdfjs<Quad, Quad>> {
        const effectiveFetchFunction = fetchFunction ? fetchFunction : fetch;
        this.logInfo(`Loading ${uri}`);
        const response = await effectiveFetchFunction(uri);

        if (!response.ok) {
            throw new HttpError(response.statusText, response.status);
        }

        const parser = new N3.Parser({ format: 'text/turtle', baseIRI: uri });
        const quads = parser.parse(await response.text());
        
        return this._DatasetCoreRdfjsImpl(quads);
    }

}