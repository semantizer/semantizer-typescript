import { Quad } from "@semantizer/types";

export interface EntryStreamTransformer<Entry> {
    transform(quad: Quad): Entry | undefined;
}