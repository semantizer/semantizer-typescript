import rdfjsFetch from '@rdfjs/fetch';
import { HttpError } from "@semantizer/http-error";
import { DatasetCoreRdfjs, Fetch, Loader, Quad } from "@semantizer/types";

export class LoaderRdfjs implements Loader {

    public async load(uri: string, fetch?: Fetch): Promise<DatasetCoreRdfjs<Quad, Quad>> {
        const response = await rdfjsFetch<DatasetCoreRdfjs<Quad>, Quad, Quad>(uri, { fetch });

        if (!response.ok) {
            throw new HttpError(response.statusText, response.status);
        }

        return await response.dataset();
    }

}