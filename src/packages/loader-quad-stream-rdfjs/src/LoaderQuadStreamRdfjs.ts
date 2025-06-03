import rdfjsFetch from '@rdfjs/fetch';
import { HttpError } from "@semantizer/http-error";
import { DatasetCoreRdfjs, LoaderQuadStream, LoggingComponent, Quad, Stream } from "@semantizer/types";
import { LoaderBase } from "@semantizer/util-loader-base";

export class LoaderQuadStreamRdfjs extends LoaderBase implements LoaderQuadStream {

    public getLoggingComponent(): LoggingComponent {
        return {
            type: 'PACKAGE',
            name: 'loader-quad-stream-rdfjs'
        }
    }

    public async load(uri: string): Promise<Stream<Quad>> {
        this.logInfo(`Loading ${uri}`);

        const response = await rdfjsFetch<DatasetCoreRdfjs<Quad>, Quad, Quad>(uri);
        
        if (!response.ok) {
            throw new HttpError(response.statusText, response.status);
        }

        return response.quadStream();
    }

}