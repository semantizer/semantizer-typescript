import rdfjsFetch from '@rdfjs/fetch';
import { DatasetCoreRdfjs, Quad, Loader, Fetch } from "@semantizer/types";

export class LoaderRdfjs implements Loader {

    public async load(uri: string, fetch?: Fetch): Promise<DatasetCoreRdfjs<Quad, Quad>> {
        const response = await rdfjsFetch<DatasetCoreRdfjs<Quad>, Quad, Quad>(uri, { fetch });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        return await response.dataset();
    }

}