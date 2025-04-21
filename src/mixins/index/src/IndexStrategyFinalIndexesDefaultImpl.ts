import { NamedNode, Semantizer } from "@semantizer/types";
import { Readable } from "stream";
import { FinalIndexResult, Index, IndexShape, IndexStrategyFinalIndexes } from "./types";
import { indexFactory } from "./IndexMixin.js";
import { EntryStreamTransformerStrategyDefaultImpl } from "./EntryStreamTransformerStrategyDefaultImpl";
import { IndexShapeComparisonStrategyDefaultImpl } from "./IndexShapeComparisonStrategyDefaultImpl";

class FinalIndexResultImpl implements FinalIndexResult {

    private _index: NamedNode;
    private _path: NamedNode;

    public constructor(index: NamedNode, path: NamedNode) {
        this._index = index;
        this._path = path;
    }

    public getIndex(): NamedNode {
        return this._index;
    }

    public getPath(): NamedNode<string> {
        return this._path;
    }

}

export class IndexStrategyFinalIndexesDefaultImpl implements IndexStrategyFinalIndexes {

    private _semantizer: Semantizer;
    private _shapeComparisonStrategy = new IndexShapeComparisonStrategyDefaultImpl();

    public constructor(semantizer: Semantizer) {
        this._semantizer = semantizer;
    }

    public execute(rootIndex: NamedNode | string, shape: IndexShape, maxFind?: number): Readable {
        let foundFinalIndexCount: number = 0;
        const promises: Promise<void>[] = [];

        const resultStream = new Readable({ objectMode: true });
        resultStream._read = () => { };

        const processSubIndex = async (index: Index, entry: NamedNode, entryStream: Readable) => {
            const subIndex = index.getEntrySubIndex(entry); // entry.getSubIndex();
            if (subIndex) {
                try {
                    entryStream.pause();
                    const subIndexPromise = process(subIndex);
                    promises.push(subIndexPromise);
                    await subIndexPromise;
                    entryStream.resume();
                }
                catch (e) { console.error("Error while loading " + subIndex + e) }
            } else { console.error("No subIndexFound for potencial result source.") }
        }

        const makeIndexDataset = (indexUri: NamedNode | string): Index => {
            const indexDataset = this._semantizer.build(indexFactory);
            indexDataset.setBaseUri(indexUri);
            return indexDataset;
        }

        const process = async (index: NamedNode | string) => {
            return new Promise<void>(async (resolve, reject) => {
                if (maxFind && foundFinalIndexCount < maxFind - 1) {
                    const indexDataset = makeIndexDataset(index);
                    const entryStream = await indexDataset.loadEntryStream(new EntryStreamTransformerStrategyDefaultImpl());

                    entryStream.on('data', async (entry: NamedNode) => {
                        if (maxFind && foundFinalIndexCount >= maxFind) {
                            entryStream.pause(); // if the stream is not paused, the call to destroy() would have no effect
                            entryStream.destroy(); // handled by the 'close' event (see below)
                            return; // when we have enough results, we should stop the streaming process.
                        }

                        // TODO: maybe the comparison can be checked directly into the Transform stream (loadEntryStream method)?
                        const comparisonResult = indexDataset.compareEntryWithShape(entry, shape, this._shapeComparisonStrategy) // entry.compareShape(shape);

                        if (comparisonResult.getResult() === 1) {
                            const subIndex = indexDataset.getEntrySubIndex(entry); // entry.getSubIndex();
                            if (subIndex) {
                                // const subIndexDataset = makeIndexDataset(subIndex);
                                const result = new FinalIndexResultImpl(subIndex, comparisonResult.getComparedPath());
                                resultStream.push(result)
                                foundFinalIndexCount++;
                            }
                        }

                        // else if (comparisonResult.getResult() === 0 && entry.hasSubIndex()) {
                        else if (comparisonResult.getResult() === 0 && indexDataset.hasEntrySubIndex(entry)) {
                            if (maxFind && foundFinalIndexCount < maxFind - 1) {
                                await processSubIndex(indexDataset, entry, entryStream);
                            }
                        }
                    });

                    entryStream.on('end', () => resolve());

                    promises.push(new Promise<void>((resolveThis, rejectThis) => {
                        entryStream.on('end', async () => resolveThis());
                        entryStream.on('error', (error) => rejectThis(error));
                    }));
                }

                else resolve();
            });
        }

        process(rootIndex).then(() => {
            Promise.all(promises).then(() => resultStream.push(null));
        });

        return resultStream;
    }

}