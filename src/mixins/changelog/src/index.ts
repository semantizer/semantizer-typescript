import { DatasetSemantizer, DatasetSemantizerMixinConstructor, Quad, Semantizer } from '@semantizer/types';

const AddedQuadsSymbol = Symbol('changelogAddedQuads');
const DeletedQuadsSymbol = Symbol('changelogDeletedQuads');

export type Changelog = DatasetSemantizer & ChangelogOperations;
export type ChangelogMixinConstructor = new (...args: any[]) => Changelog;

export interface ChangelogOperations {
    getChangelogAddedQuads(): Quad[];
    getChangelogDeletedQuads(): Quad[];
    hasBeenChanged(): boolean;
}

export function ChangelogMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class ChangelogMixinImpl extends Base implements Changelog {

        [AddedQuadsSymbol]: Quad[] = [];
        [DeletedQuadsSymbol]: Quad[] = [];

        public add(quad: Quad): this {
            this[AddedQuadsSymbol].push(quad);
            return super.add(quad);
        }
    
        public delete(quad: Quad): this {
            this[DeletedQuadsSymbol].push(quad);
            return super.delete(quad);
        }

        public getChangelogDeletedQuads(): Quad[] {
            return this[DeletedQuadsSymbol];
        }

        public getChangelogAddedQuads(): Quad[] {
            return this[AddedQuadsSymbol];
        }

        public hasBeenChanged(): boolean {
            return this[AddedQuadsSymbol].length > 0 || this[DeletedQuadsSymbol].length > 0;
        }

    }

}

export function changelogFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(ChangelogMixin);
}