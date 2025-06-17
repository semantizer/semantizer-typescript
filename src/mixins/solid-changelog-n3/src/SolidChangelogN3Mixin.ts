import { ChangelogMixin, ChangelogMixinNamespace } from '@semantizer/mixin-changelog';
import { DatasetSemantizerConstructor, Semantizer, WithMixins } from '@semantizer/types';
import { Serializer, SolidChangelogN3, SolidChangelogN3MixinNamespace, SolidChangelogN3MixinOperations } from './types';

export function SolidChangelogN3Mixin<
    TMixins extends ChangelogMixinNamespace,
    TBase extends DatasetSemantizerConstructor<TMixins>
>(Base: TBase) {

    return class SolidChangelogN3MixinImpl extends Base implements WithMixins<TMixins & SolidChangelogN3MixinNamespace> {

        public get mixins(): TMixins & SolidChangelogN3MixinNamespace {
            const parentMixins = super.mixins as TMixins & Partial<{ changelog: Partial<SolidChangelogN3MixinOperations> }>;

            return {
                ...parentMixins,
                changelog: {
                    ...(parentMixins.changelog ?? {}),

                    getSolidChangelogN3: (turtleSerializer: Serializer): string => {
                        // let prefixes: string[] = ["@prefix solid: <http://www.w3.org/ns/solid/terms#>."];
                        const prefixes = new Set<string>();
                        prefixes.add("@prefix solid: <http://www.w3.org/ns/solid/terms#>.");
                        let inserted: string = '';
                        let deleted: string = '';

                        if (this.mixins.changelog.getChangelogAddedQuads().length > 0) {
                            inserted += 'solid:inserts { ';
                            const transformed = turtleSerializer.transform(this.mixins.changelog.getChangelogAddedQuads());
                            transformed.split("\n").filter(line => line.startsWith("@prefix")).forEach(prefix => prefixes.add(prefix));
                            inserted += transformed.split("\n").filter(line => !line.startsWith("@prefix")).join("\n");
                            inserted += '}';
                            inserted += this.mixins.changelog.getChangelogDeletedQuads().length > 0 ? ';\n' : '.';
                        }

                        if (this.mixins.changelog.getChangelogDeletedQuads().length > 0) {
                            deleted += 'solid:deletes { ';
                            const transformed = turtleSerializer.transform(this.mixins.changelog.getChangelogDeletedQuads());
                            transformed.split("\n").filter(line => line.startsWith("@prefix")).forEach(prefix => prefixes.add(prefix));
                            deleted += transformed.split("\n").filter(line => !line.startsWith("@prefix")).join("\n");
                            deleted += '}.';
                            // deleted += this.getChangelogDeletedQuads().length > 0 ? ';\n' : '.';
                        }

                        let changelog = Array.from(prefixes).join('\n') + '\n\n';

                        if (this.mixins.changelog.getChangelogAddedQuads().length > 0) {
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

}

export function solidChangelogN3Factory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(SolidChangelogN3Mixin, ChangelogMixin(_DatasetImpl));
}