import { DatasetSemantizer, NamedNode, Resource, Semantizer, DatasetSemantizerMixinConstructor, DefaultGraph } from "@semantizer/types";

const foaf = 'http://xmlns.com/foaf/0.1/';

export type MyersBriggs = 'ESTJ' | 'INFP' | 'ESFP' | 'INTJ' | 'ESFJ' | 'INTP' | 'ENFP' | 'ISTJ' | 'ESTP' | 'INFJ' | 'ENFJ' | 'ISTP' | 'ENTJ' | 'ISFP' | 'ENTP' | 'ISFJ';

export interface Person {
    // getPastProject(): Thing;
    getGivenName(thing?: Resource | DefaultGraph | undefined, graph?: NamedNode): string | undefined;
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
    getKnows(): Person[];
}

export function FoafPersonMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {
    
    return class FoafPersonImpl extends Base implements Person {

        public getGivenName(thing?: Resource | DefaultGraph | undefined, graph?: NamedNode): string | undefined {
            const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
            return this.getLiteral(dataFactory.namedNode(""), dataFactory.namedNode(foaf + 'givenName'), graph)?.value;
        }

        public getLastName(): string {
            throw new Error("Method not implemented.");
        }

        public getFamilyName(): string {
            throw new Error("Method not implemented.");
        }

        public getFirstName(): string {
            throw new Error("Method not implemented.");
        }

        public getMyersBriggs(): MyersBriggs {
            throw new Error("Method not implemented.");
        }

        public getMyersBriggsAll(): MyersBriggs[] {
            throw new Error("Method not implemented.");
        }
        
        public getKnows(): Person[] {
            throw new Error("Method not implemented.");
        }

    }

}
