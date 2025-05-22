import { DatasetSemantizer, NamedNode, Resource, Semantizer, DatasetSemantizerMixinConstructor, DefaultGraph, Term, Quad_Subject, Quad_Graph } from "@semantizer/types";
import { FOAF, MyersBriggs } from "./ns.js";
import { FoafPerson } from "./types";

export function FoafPersonMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class FoafPersonImpl extends Base { // implements FoafPerson {

        public constructor(...args: any[]) {
            super(...args);
            this.mixins.foaf = {
                ...(this.mixins.foaf ?? {}),
                
                getAge: (subject: Quad_Subject | string, graph?: Quad_Graph | string): number | undefined => {
                    return this.getObjectInteger(subject ?? this.getBaseUri(), FOAF.AGE, graph ?? this.getDefaultGraphTerm());
                },

                getGivenName: (subject?: Quad_Subject | string, graph?: Quad_Graph | string): string | undefined => {
                    return this.getObjectStringNoLocale(subject ?? this.getBaseUri(), FOAF.GIVEN_NAME, graph ?? this.getDefaultGraphTerm());
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

export function foafPersonFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(FoafPersonMixin);
}
