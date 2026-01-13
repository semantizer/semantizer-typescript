import { DatasetSemantizer, Quad } from '@semantizer/types';

export type Changelog = DatasetSemantizer & ChangelogMixinNamespace;
export type ChangelogMixinNamespace = { changelog: ChangelogMixinOperations };

export interface ChangelogMixinOperations {
    getChangelogAddedQuads(): Quad[];
    getChangelogDeletedQuads(): Quad[];
    hasBeenChanged(): boolean;
}