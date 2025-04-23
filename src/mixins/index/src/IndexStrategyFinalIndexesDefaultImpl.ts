import { NamedNode, Semantizer } from "@semantizer/types";
import { Readable } from "stream";
import { EntryStreamTransformerStrategyDefaultImpl } from "./EntryStreamTransformerStrategyDefaultImpl";
import { indexFactory } from "./IndexMixin.js";
import { IndexShapeComparisonStrategyDefaultImpl } from "./IndexShapeComparisonStrategyDefaultImpl";
import { IndexStrategyBaseDefaultImpl } from "./IndexStrategyBaseDefaultImpl";
import { FinalIndexResult, Index, IndexEntry, IndexShape, IndexStrategyFinalIndexes } from "./types";

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

export class IndexStrategyFinalIndexesDefaultImpl extends IndexStrategyBaseDefaultImpl implements IndexStrategyFinalIndexes {

    private _shapeComparisonStrategy = new IndexShapeComparisonStrategyDefaultImpl(this.log);

    public constructor(semantizer?: Semantizer) {
        super(semantizer);
    }

    public execute(rootIndex: NamedNode | string, shape: IndexShape, maxFind?: number): Readable {
        let foundFinalIndexCount: number = 0;
        const promises: Promise<void>[] = [];

        const resultStream = new Readable({ objectMode: true });
        resultStream._read = () => { };

        const processSubIndex = async (entry: IndexEntry, entryStream: Readable) => {
            const subIndex = entry.getSubIndex();
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
            const indexDataset = this.getSemantizer().build(indexFactory);
            indexDataset.setBaseUri(indexUri);
            return indexDataset;
        }

        const process = async (index: NamedNode | string) => {
            return new Promise<void>(async (resolve, reject) => {
                if (maxFind && foundFinalIndexCount < maxFind - 1) {
                    const indexDataset = makeIndexDataset(index);
                    const transformer = new EntryStreamTransformerStrategyDefaultImpl(this.getSemantizer());
                    const entryStream = await indexDataset.loadEntryStream(transformer);

                    entryStream.on('data', async (entry: IndexEntry) => {
                        if (maxFind && foundFinalIndexCount >= maxFind) {
                            entryStream.pause(); // if the stream is not paused, the call to destroy() would have no effect
                            entryStream.destroy(); // handled by the 'close' event (see below)
                            return; // when we have enough results, we should stop the streaming process.
                        }

                        const comparisonResult = entry.compareShape(shape, this._shapeComparisonStrategy); // indexDataset.compareEntryWithShape(entry, shape, this._shapeComparisonStrategy) // entry.compareShape(shape);

                        if (comparisonResult.areTargetedRdfTypePathsAndTargetedPropertyPathsAndValuesEqual()) {
                            const subIndex = entry.getSubIndex();
                            if (subIndex) {
                                // const subIndexDataset = makeIndexDataset(subIndex);
                                const result = new FinalIndexResultImpl(subIndex, comparisonResult.getComparedPath());
                                resultStream.push(result);
                                foundFinalIndexCount++;
                            }
                        }

                        else if (comparisonResult.areTargetedRdfTypePathsAndTargetedPropertyPathsEqual() && entry.hasSubIndex()) {
                            if (maxFind && foundFinalIndexCount < maxFind - 1) {
                                await processSubIndex(entry, entryStream);
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