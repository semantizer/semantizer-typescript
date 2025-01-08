import { Changelog, ChangelogMixin, ChangelogMixinConstructor } from '@semantizer/mixin-changelog';
import { DatasetSemantizer, Quad, Semantizer } from '@semantizer/types';

export type SolidChangelogN3 = Changelog & SolidChangelogN3Operations;

export interface SolidChangelogN3Operations {
    getSolidChangelogN3(turtleSerializerFunction: (quad: Quad) => string): string;
}

export function SolidChangelogN3Mixin<
    TBase extends ChangelogMixinConstructor
>(Base: TBase) {

    return class SolidChangelogN3MixinImpl extends Base implements SolidChangelogN3Operations {

        public getSolidChangelogN3(turtleSerializerFunction: (quad: Quad) => string): string {
            let changelog = "@prefix solid: <http://www.w3.org/ns/solid/terms#>.\n";
            changelog += `_:patch a solid:InsertDeletePatch;\n`;

            if (this.getChangelogAddedQuads().length > 0) {
                changelog += 'solid:inserts { ';

                this.getChangelogAddedQuads().forEach((addedQuad, index) => {
                    changelog += `${turtleSerializerFunction(addedQuad)} `;
                });

                changelog += '}\n';
            }

            // TODO: handle deletes and where
            changelog += '.';

            return changelog;
        }

    }

}

export function solidChangelogN3Factory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory<ChangelogMixinConstructor, SolidChangelogN3>(SolidChangelogN3Mixin, ChangelogMixin(_DatasetImpl));
}