import { Quad } from "@semantizer/types";

export interface EntryStreamTransformerStrategy<Entry> {
    transform(quad: Quad): Entry | undefined;
}