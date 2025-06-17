import { ChangelogMixinNamespace } from '@semantizer/mixin-changelog';
import { DatasetSemantizer, Quad } from '@semantizer/types';

export type SolidChangelogN3 = DatasetSemantizer<SolidChangelogN3MixinNamespace>;
export type SolidChangelogN3MixinNamespace = ChangelogMixinNamespace & { changelog: SolidChangelogN3MixinOperations };

export interface Serializer {
    transform(quads: Iterable<Quad>): string;
}

export interface SolidChangelogN3MixinOperations {
    getSolidChangelogN3(turtleSerializer: Serializer): string;
}
