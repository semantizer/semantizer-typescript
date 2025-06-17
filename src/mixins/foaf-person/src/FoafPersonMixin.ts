import { DatasetSemantizerConstructor, Quad_Graph, Quad_Subject, Semantizer, WithMixins } from "@semantizer/types";
import { FOAF, MyersBriggs } from "./ns.js";
import { FoafPerson, FoafPersonMixinNamespace, FoafPersonMixinOperations } from "./types";
import { DatasetMixin, DatasetMixinNamespace } from "@semantizer/mixin-dataset";

export function FoafPersonMixin<
    TMixins extends DatasetMixinNamespace,
    TBase extends DatasetSemantizerConstructor<TMixins>
>(Base: TBase) {

    return class FoafPersonImpl extends Base implements WithMixins<TMixins & FoafPersonMixinNamespace> {

        public get mixins(): TMixins & FoafPersonMixinNamespace {
            const parentMixins = super.mixins as TMixins & Partial<{ foaf: Partial<FoafPersonMixinOperations> }>;

            return {
                ...parentMixins,
                foaf: {
                    ...(parentMixins.foaf ?? {}),

                    getAge: (subject: Quad_Subject | string, graph?: Quad_Graph | string): number | undefined => {
                        return this.mixins.dataset.getObjectInteger(subject ?? this.getBaseUri(), FOAF.AGE, graph ?? this.mixins.dataset.getDefaultGraphTerm());
                    },

                    getGivenName: (subject?: Quad_Subject | string, graph?: Quad_Graph | string): string | undefined => {
                        return this.mixins.dataset.getObjectStringNoLocale(subject ?? this.getBaseUri(), FOAF.GIVEN_NAME, graph ?? this.mixins.dataset.getDefaultGraphTerm());
                    },

                    getLastName: (): string => {
                        throw new Error("Method not implemented.");
                    },

                    getFamilyName: (): string => {
                        throw new Error("Method not implemented.");
                    },

                    getFirstName: (): string => {
                        throw new Error("Method not implemented.");
                    },

                    getMyersBriggs: (): MyersBriggs => {
                        throw new Error("Method not implemented.");
                    },

                    getMyersBriggsAll: (): MyersBriggs[] => {
                        throw new Error("Method not implemented.");
                    },

                    getKnows: (): FoafPerson[] => {
                        throw new Error("Method not implemented.");
                    }
                }

            }

        }

    }

}

export function foafPersonFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(FoafPersonMixin, DatasetMixin(_DatasetImpl));
}
