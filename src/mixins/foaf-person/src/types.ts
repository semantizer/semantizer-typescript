import { DatasetSemantizer, Quad_Graph, Quad_Subject } from "@semantizer/types";
import { MyersBriggs } from "./ns";
import { DatasetMixinNamespace } from "@semantizer/mixin-dataset";

export type FoafPerson = DatasetSemantizer & FoafPersonMixinNamespace;
export type FoafPersonMixinNamespace = DatasetMixinNamespace & { foaf: FoafPersonMixinOperations };

export interface FoafPersonMixinOperations {
    getAge(subject: Quad_Subject | string, graph?: Quad_Graph | string): number | undefined;

    // getPastProject(): Thing;
    getGivenName(subject?: Quad_Subject | string, graph?: Quad_Graph | string): string | undefined;
    getLastName(): string;
    // getPublications(): Document[];
    // getCurrentProject(): Thing;
    getFamilyName(): string;
    getFirstName(): string;
    // getWorkInfoHomepage(): Document;
    getMyersBriggs(): MyersBriggs;
    getMyersBriggsAll(): MyersBriggs[];
    // getSchoolHomepage(): Document;
    // getImg(): Image;
    // getWorkplaceHomepage(): Document;
    getKnows(): FoafPerson[];
}