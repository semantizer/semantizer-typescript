import { ChangelogMixin, ChangelogMixinConstructor } from '@semantizer/mixin-changelog';
import { Semantizer } from '@semantizer/types';
import { Serializer, SolidChangelogN3, SolidChangelogN3Operations } from './types';

export function SolidChangelogN3Mixin<
    TBase extends ChangelogMixinConstructor
>(Base: TBase) {

    return class SolidChangelogN3MixinImpl extends Base implements SolidChangelogN3Operations {

        public get solid() {

            return {

                getSolidChangelogN3: (turtleSerializer: Serializer): string => {
                    // let prefixes: string[] = ["@prefix solid: <http://www.w3.org/ns/solid/terms#>."];
                    const prefixes = new Set<string>();
                    prefixes.add("@prefix solid: <http://www.w3.org/ns/solid/terms#>.");
                    let inserted: string = '';
                    let deleted: string = '';

                    if (this.getChangelogAddedQuads().length > 0) {
                        inserted += 'solid:inserts { ';
                        const transformed = turtleSerializer.transform(this.getChangelogAddedQuads());
                        transformed.split("\n").filter(line => line.startsWith("@prefix")).forEach(prefix => prefixes.add(prefix));
                        inserted += transformed.split("\n").filter(line => !line.startsWith("@prefix")).join("\n");
                        inserted += '}';
                        inserted += this.getChangelogDeletedQuads().length > 0 ? ';\n' : '.';
                    }

                    if (this.getChangelogDeletedQuads().length > 0) {
                        deleted += 'solid:deletes { ';
                        const transformed = turtleSerializer.transform(this.getChangelogDeletedQuads());
                        transformed.split("\n").filter(line => line.startsWith("@prefix")).forEach(prefix => prefixes.add(prefix));
                        deleted += transformed.split("\n").filter(line => !line.startsWith("@prefix")).join("\n");
                        deleted += '}.';
                        // deleted += this.getChangelogDeletedQuads().length > 0 ? ';\n' : '.';
                    }

                    let changelog = Array.from(prefixes).join('\n') + '\n\n';

                    if (this.getChangelogAddedQuads().length > 0) {
                        changelog += `_:patch a solid:InsertDeletePatch;\n`;
                    }

                    changelog += inserted;
                    changelog += deleted;

                    return changelog;
                }

            }

        }

    }

}

export function solidChangelogN3Factory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory<ChangelogMixinConstructor, SolidChangelogN3>(SolidChangelogN3Mixin, ChangelogMixin(_DatasetImpl));
}