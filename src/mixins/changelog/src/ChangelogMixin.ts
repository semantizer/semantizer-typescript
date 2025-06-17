import { DatasetSemantizerConstructor, Quad, Semantizer, WithMixins } from '@semantizer/types';
import { ChangelogMixinNamespace, ChangelogMixinOperations } from './types';

export const AddedQuadsSymbol = Symbol('changelogAddedQuads');
export const DeletedQuadsSymbol = Symbol('changelogDeletedQuads');

export function ChangelogMixin<
    TMixins extends object,
    TBase extends DatasetSemantizerConstructor<TMixins>
>(Base: TBase) {

    return class ChangelogMixinImpl extends Base implements WithMixins<TMixins & ChangelogMixinNamespace> {

        [AddedQuadsSymbol]: Quad[] = [];
        [DeletedQuadsSymbol]: Quad[] = [];

        public get mixins(): TMixins & ChangelogMixinNamespace {
            const parentMixins = super.mixins as TMixins & Partial<{ changelog: Partial<ChangelogMixinOperations> }>;

            return {
                ...parentMixins,
                changelog: {
                    ...(parentMixins.changelog ?? {}),

                    add: (quad: Quad): this => {
                        this[AddedQuadsSymbol].push(quad);
                        return super.add(quad);
                    },

                    delete: (quad: Quad): this => {
                        this[DeletedQuadsSymbol].push(quad);
                        return super.delete(quad);
                    },

                    getChangelogDeletedQuads: (): Quad[] => {
                        return this[DeletedQuadsSymbol];
                    },

                    getChangelogAddedQuads: (): Quad[] => {
                        return this[AddedQuadsSymbol];
                    },

                    hasBeenChanged: (): boolean => {
                        return this[AddedQuadsSymbol].length > 0 || this[DeletedQuadsSymbol].length > 0;
                    }

                }

            }

        }

    }

}

export function changelogFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(ChangelogMixin);
}