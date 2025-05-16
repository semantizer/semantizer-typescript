import { EntryStreamTransformer, EntryStreamTransformerDefaultImpl, Index, IndexEntry, IndexQueryingStrategy } from "@semantizer/mixin-index";
import { BlankNode, Dataset, NamedNode, ShaclValidator } from "@semantizer/types";
import { IndexQueryingStrategyShaclUsingFinalIndex } from "@semantizer/utils-index-querying-strategy-shacl-final";
import { Readable } from "stream";

// TODO: add a bypass shape mode on target indexes to avoid to recompare
// the shape as all the index's entries are supposed to target a valid 
// shape.
interface IndexQueryingStrategyShaclOption {
    bypassShapeValidation?: boolean;
}

interface InternalShape {
    id: string;
    shape: Dataset;
    origin?: string;
    conforms?: boolean;
}

export class IndexQueryingStrategyShaclDefaultImpl<Entry extends IndexEntry = IndexEntry> extends IndexQueryingStrategyShaclUsingFinalIndex<Entry> {

    private _entryStreams: Readable[];
    private _results: Set<string>; // results already returned.
    private _resultShapes: Map<string, string>; // associates a result with some shapes ids.
    private _shapes: InternalShape[]; // store entry parsed shapes and computed merged shapes.

    public constructor(targetShape: Dataset, finalIndexStrategy: IndexQueryingStrategy, shaclValidator: ShaclValidator, entryStreamTransformer: EntryStreamTransformer<Entry>) {
        super(targetShape, finalIndexStrategy, shaclValidator, entryStreamTransformer);
        this._entryStreams = [];
        this._results = new Set<string>();
        this._resultShapes = new Map<string, string>();
        this._shapes = [];
    }

    public async process(finalIndex: Index): Promise<void> {
        this.processFinalIndex(finalIndex);
    }

    private async processFinalIndex(finalIndex: Index): Promise<void> {
        const entryStreamStrategy = new EntryStreamTransformerDefaultImpl(this.getSemantizer());
        const entryStream = await finalIndex.loadEntryStream(entryStreamStrategy);
        this._entryStreams.push(entryStream);
        entryStream.on('data', (entry: Entry) => this.processFinalIndexEntry(entry));
        entryStream.on('error', (error) => this.log('ERROR', "An error occured during the processing a final index."));
    }

    protected async processFinalIndexEntry(entry: Entry): Promise<void> {
        try {
            const target = this.getEntryTargetEnsuringItIsANamedNode(entry);
            if (this.isResultHasNotAlreadyBeenReturned(target)) {
                const entryShape = this.storeEntryShape(entry);
                const shapeId = this.storeMappingBetweenEntryTargetAndShapeIds(target, entryShape);
                const internalShape = this.computeAndStoreMergedShapeIfNecessary(shapeId);
                await this.validateEntry(entry, internalShape, target);
            }
        } catch (e) {
            this.log('ERROR', "Unable to process entry " + entry.getBaseUri().value);
        }
    }

    // protected doesEntryTargetHasNeverBeenReturnedAsResultYet(entry: Entry): boolean {
    //     const target = entry.getTarget();
    //     if (target) {
    //         if (target.termType === 'NamedNode') {
    //             return this.isResultHasNotAlreadyBeenReturned(target);
    //         } else this.log('WARN', "Target entry uses a blank node as target which is not recommended.");
    //     } else {
    //         this.log('ERROR', "Target entry does not have a target.");
    //         throw new Error();
    //     }
    //     return false;
    // }

    protected getEntryTargetEnsuringItIsANamedNode(entry: Entry): NamedNode {
        const target = entry.getTarget();
        if (target) {
            if (target.termType === 'NamedNode') {
                return target;
            } else this.log('WARN', "Target entry uses a blank node as target which is not recommended.");
        }
        this.log('ERROR', "Target entry does not have a target.");
        throw new Error();
    }

    // protected isTargetUnique(target: NamedNode): boolean {
    //     // throw new Error("Not implemented");
    //     // return this._results.find((result) => target.value === result) === undefined;
    // }

    protected isResultHasNotAlreadyBeenReturned(result: NamedNode): boolean {
        return !this._results.has(result.value);
    }

    // protected getShape(shape: NamedNode | BlankNode, blankNodeOrigin?: NamedNode): InternalShape | undefined {
    //     return this._shapes.find(s => {
    //         if (s.origin.equals(shape)) {
    //             if (shape.termType === 'BlankNode') {
    //                 return blankNodeOrigin && s.blankNodeOrigin && s.blankNodeOrigin.equals(blankNodeOrigin);
    //             } else return true;
    //         } else return false;
    //     });
    // }

    // protected getShapeForEntryAndAddItIfNecessary(entry: Entry): Dataset | undefined {
    //     let result: Dataset | undefined = undefined;
    //     const shape = entry.getShape();
    //     if (shape) {
    //         const blankNodeOrigin = shape.termType === 'BlankNode' ? entry.getBaseUri() : undefined;
    //         const shapeWithOrigin = this.getShape(shape, blankNodeOrigin);
    //         if (shapeWithOrigin) {
    //             result = shapeWithOrigin.shape;
    //         }
    //         else {
    //             result = entry.getShapeDataset();
    //             if (result) {
    //                 this._shapes.push({
    //                     origin: shape,
    //                     blankNodeOrigin,
    //                     shape: result
    //                 });
    //             } else this.log('ERROR', "Target entry does not have a valid shape.");
    //         }
    //     } else this.log('ERROR', "Target entry does not have a shape.");
    //     return result;
    // }

    // protected getTemporaryShapeAndCreateItIfNecessary(): Dataset | undefined {

    // }

    // protected async validateTemporaryShape(): Promise<boolean> {
    //     const temporaryShape = this.getTemporaryShapeAndCreateItIfNecessary();
    //     if (temporaryShape) {
    //         const result = await this.getShaclValidator().validate(this.getTargetShape(), temporaryShape);
    //         return result.doConforms();
    //     } else {
    //         this.log('ERROR', "Unable to find a temporary shape for entry.");
    //         return false;
    //     }
    // }

    protected pushTargetResult(result: NamedNode | null) {
        if (result) {
            this._results.add(result.value);
            super.pushResult(result);
        }
    }

    protected hasShapeUsingIdComparison(id: string): boolean {
        return this._shapes.find(s => s.id === id) !== undefined;
    }

    protected hasShapeUsingOriginComparison(shape: NamedNode | BlankNode): boolean {
        return this._shapes.find(s => s.origin === shape.value) !== undefined;
    }

    protected addInternalShape(id: string, shape: Dataset, origin?: string, conforms?: boolean): InternalShape {
        const internalShape = { id, shape, origin, conforms };
        this._shapes.push(internalShape);
        return internalShape;
    }

    protected addInternalShapeWithAutoGeneratedId(shape: Dataset, origin?: string, conforms?: boolean): InternalShape {
        const id = this._shapes.length.toString();
        return this.addInternalShape(id, shape, origin, conforms);
    }

    protected getInternalShapeFromId(shapeId: string): InternalShape | undefined {
        return this._shapes.find(s => s.id === shapeId);
    }

    protected setInternalShapeConformsResult(shapeId: string, conformsResult: boolean): void {
        const internalShape = this._shapes.find(s => s.id === shapeId);
        if (internalShape) {
            internalShape.conforms = conformsResult;
        } else {
            this.log('ERROR', "Unable to find internal shape");
            throw new Error();
        }
    }

    protected storeEntryShape(entry: Entry): NamedNode | BlankNode {
        const entryShape = entry.getShape();
        if (entryShape) {
            if (!this.hasShapeUsingOriginComparison(entryShape)) {
                const entryShapeDataset = entry.getShapeDataset();
                if (entryShapeDataset) {
                    this.addInternalShapeWithAutoGeneratedId(entryShapeDataset, entryShape.value);
                } else {
                    this.log('ERROR', "Unable to find a shape dataset for the target entry.");
                    throw new Error();
                }
            }
        } else {
            this.log('ERROR', "Target entry does not have a shape.");
            throw new Error();
        }

        return entryShape;
    }

    protected hasResultShape(entryShape: NamedNode | BlankNode): boolean {
        return this._resultShapes.has(entryShape.value);
    }

    protected getResultShapeId(target: NamedNode | BlankNode): string | undefined {
        return this._resultShapes.get(target.value);
    }

    protected getShapeIdUsingOriginComparison(shape: NamedNode | BlankNode): string | undefined {
        return this._shapes.find(s => s.origin === shape.value)?.id;
    }

    protected setResultShape(target: NamedNode | BlankNode, shapeId: string): void {
        this._resultShapes.set(target.value, shapeId);
    }

    protected storeMappingBetweenEntryTargetAndShapeIds(target: NamedNode, entryShape: NamedNode | BlankNode): string {
        // const target = entry.getTarget();
        let shapeId = this.getShapeIdUsingOriginComparison(entryShape);

        if (shapeId) {
            // if (target) {
                const resultShapeId = this.getResultShapeId(target);
                if (resultShapeId) {
                    if (!this.doesShapeIdIncludeOther(resultShapeId, shapeId)) {
                        shapeId = this.mergeShapeId(resultShapeId, shapeId);
                    }
                }
                this.setResultShape(target, shapeId);
            // }
        } else {
            this.log('ERROR', "Unable to get the shape id for the target of the entry.");
            throw new Error();
        }

        return shapeId;
    }

    protected doesShapeIdIncludeOther(shapeId: string, otherShapeId: string): boolean {
        return this.splitShapeId(shapeId).includes(otherShapeId);
    }

    protected mergeShapeId(shapeId: string, otherShapeId: string): string {
        return `${shapeId}+${otherShapeId}`;
    }

    protected splitShapeId(shapeId: string): string[] {
        return shapeId.split('+');
    }

    protected doesShapeNeedToBeMerged(shapeId: string): boolean {
        return this.splitShapeId(shapeId).length > 1;
    }

    protected computeAndStoreMergedShapeIfNecessary(shapeId: string): InternalShape {
        let internalShape = this.getInternalShapeFromId(shapeId);
        if (!internalShape) {
            if (this.doesShapeNeedToBeMerged(shapeId)) {
                const shapeIds = this.splitShapeId(shapeId);
                const mergedShape = this.getSemantizer().build();
                for (const shapeIdToMerge of shapeIds) {
                    const shapeToMerge = this.getInternalShapeFromId(shapeIdToMerge);
                    if (shapeToMerge) {
                        for (const quad of shapeToMerge.shape) {
                            if (quad.subject.termType === 'NamedNode' && shapeToMerge.origin && quad.subject.value === shapeToMerge.origin) {
                                quad.subject.value = "";
                            }
                            mergedShape.add(quad);
                        }
                        // mergedShape.addAll(shapeToMerge.shape);
                    } else {
                        this.log('ERROR', "Unable to merge shape for id " + shapeId);
                        throw new Error();
                    }
                }
                internalShape = this.addInternalShape(shapeId, mergedShape);
            } else {
                this.log('ERROR', "Internal shape not found.");
                throw new Error();
            }
        }
        return internalShape;
    }

    protected async isEntryConformsToTargetShape(entry: Entry, internalShape: InternalShape): Promise<boolean> {
        let conforms = internalShape.conforms;
        if (conforms === undefined) {
            // TODO: the data graph must be the entry with the merged shape, not the merged shape.
            const report = await this.getShaclValidator().validate(this.getTargetShape(), entry);
            conforms = report.doConforms();
            this.setInternalShapeConformsResult(internalShape.id, conforms);
        }
        return conforms;
    }

    protected async validateEntry(entry: Entry, internalShape: InternalShape, target: NamedNode): Promise<void> {
        if (await this.isEntryConformsToTargetShape(entry, internalShape)) {
            this.pushTargetResult(target);
        }
    }

}