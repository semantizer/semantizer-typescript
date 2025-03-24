import N3 from "n3";
import { HttpError } from "@semantizer/http-error";
import { DatasetCoreRdfjs, Quad, Loader, Fetch } from "@semantizer/types";

type DatasetCoreRdfjsConstructor = (quads: Quad[]) => DatasetCoreRdfjs<Quad, Quad>;

export class LoaderN3 implements Loader {

    private _DatasetCoreRdfjsImpl: DatasetCoreRdfjsConstructor;

    public constructor(DatasetCoreRdfjsImpl: DatasetCoreRdfjsConstructor) {
        this._DatasetCoreRdfjsImpl = DatasetCoreRdfjsImpl;
    }

    public async load(uri: string, fetchFunction?: Fetch): Promise<DatasetCoreRdfjs<Quad, Quad>> {
        const effectiveFetchFunction = fetchFunction ? fetchFunction : fetch; 
        const response = await effectiveFetchFunction(uri);

        if (!response.ok) {
            throw new HttpError(response.statusText, response.status);
        }

        const parser = new N3.Parser({ format: 'text/turtle', baseIRI: uri });
        const quads = parser.parse(await response.text());
        
        return this._DatasetCoreRdfjsImpl(quads);
    }

}