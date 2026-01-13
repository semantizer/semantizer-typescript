export interface HttpError extends Error {
    readonly code: number;
}

export class HttpError extends Error implements HttpError {

    public constructor(message: string, public readonly code: number) {
        super(message);
    }

}