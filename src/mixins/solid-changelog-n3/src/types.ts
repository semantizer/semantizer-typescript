import { Changelog } from '@semantizer/mixin-changelog';
import { Quad } from '@semantizer/types';

export interface Serializer {
    transform(quads: Iterable<Quad>): string;
}

export interface SolidChangelogN3Operations {
    solid: {
        getSolidChangelogN3(turtleSerializer: Serializer): string;
    }
}

export type SolidChangelogN3 = Changelog & SolidChangelogN3Operations;