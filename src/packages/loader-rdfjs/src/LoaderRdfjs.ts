import rdfjsFetch from '@rdfjs/fetch';
import { HttpError } from "@semantizer/http-error";
import { DatasetCoreRdfjs, Fetch, Loader, LoggingComponent, Quad } from "@semantizer/types";
import { LoaderBase } from "@semantizer/util-loader-base";

export class LoaderRdfjs extends LoaderBase implements Loader {

    public getLoggingComponent(): LoggingComponent {
        return {
            type: 'PACKAGE',
            name: 'loader-rdfjs'
        }
    }

    public async load(uri: string, fetch?: Fetch): Promise<DatasetCoreRdfjs<Quad, Quad>> {
        this.logInfo(`Loading ${uri}`);

        const response = await rdfjsFetch<DatasetCoreRdfjs<Quad>, Quad, Quad>(uri, { fetch });

        if (!response.ok) {
            throw new HttpError(response.statusText, response.status);
        }

        return await response.dataset();
    }

}