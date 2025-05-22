import { DatasetSemantizer, Quad_Graph, Quad_Subject, Term } from "@semantizer/types";
import { MyersBriggs } from "./ns";

declare module "@semantizer/types" {
    interface MixinNamespace {
        foaf?: FoafPersonOperations;
    }
}

export interface FoafPersonOperations {
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

export type FoafPerson = DatasetSemantizer & FoafPersonOperations;