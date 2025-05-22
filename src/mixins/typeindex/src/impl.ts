import { DatasetSemantizerMixinConstructor, NamedNode, Semantizer, Term } from "@semantizer/types";
import { TypeIndex } from "./types.js";
import { RDF, TYPE_INDEX } from "./voc.js";

export function TypeIndexMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {
    return class TypeIndexImpl extends Base implements TypeIndex {

        public get typeindex() {

            return {

                registerInstanceForClass: (registration: NamedNode | string, instance: NamedNode | string, forClass: NamedNode | string, graph?: Term | string): void => {
                    this.addObjectUri(registration, RDF.TYPE, TYPE_INDEX.TypeRegistration, this.getDefaultGraphTerm());
                    this.addObjectUri(registration, TYPE_INDEX.forClass, forClass, this.getDefaultGraphTerm());
                    this.addObjectUri(registration, TYPE_INDEX.instance, instance);
                },

                getRegistrationForClassAll: (forClass: NamedNode | string, graph?: Term | string): NamedNode[] | undefined => {
                    const results: NamedNode[] = [];
                    const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                    const namedGraph = graph ? (typeof graph === 'string') ? dataFactory.namedNode(graph) : graph : undefined;
                    const registrations = this.match(
                        undefined,
                        dataFactory.namedNode(TYPE_INDEX.forClass),
                        (typeof forClass === 'string') ? dataFactory.namedNode(forClass) : forClass,
                        namedGraph
                    );
                    for (const registration of registrations) {
                        if (registration.subject.termType === 'NamedNode') {
                            results.push(registration.subject);
                        }
                    }
                    return  results.length > 0 ? results : undefined;
                },
                
                getRegisteredInstanceForClass: (forClass: NamedNode | string, graph?: Term | string): NamedNode | undefined => {
                    const registrations = this.typeindex.getRegisteredInstanceForClassAll(forClass);
                    return registrations && registrations[0] ? registrations[0] : undefined;
                },

                getRegisteredInstanceForClassAll: (forClass: NamedNode | string, graph?: Term | string): NamedNode[] | undefined => {
                    const results: NamedNode[] = [];
                    const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                    const namedGraph = graph ? (typeof graph === 'string') ? dataFactory.namedNode(graph) : graph : undefined;
                    const registrations = this.typeindex.getRegistrationForClassAll(forClass, graph);
                    if (registrations) {
                        for (const registration of registrations) {
                            const instances = this.match(
                                registration,
                                dataFactory.namedNode(TYPE_INDEX.instance),
                                undefined,
                                namedGraph
                            );
                            for (const instance of instances) {
                                if (instance.object.termType === 'NamedNode') {
                                    results.push(instance.object);
                                }
                            }
                        }
                    }
                    return results.length > 0 ? results : undefined;
                }

            }

        }
        
    }
}

export function typeIndexFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(TypeIndexMixin);
}

export function createPublicTypeIndex(semantizer: Semantizer): TypeIndex {
    const typeIndex = semantizer.build(typeIndexFactory);
    typeIndex.addObjectUri(typeIndex.getBaseUri(), RDF.TYPE, TYPE_INDEX.TypeIndex, typeIndex.getDefaultGraphTerm());
    typeIndex.addObjectUri(typeIndex.getBaseUri(), RDF.TYPE, TYPE_INDEX.ListedDocument, typeIndex.getDefaultGraphTerm());
    return typeIndex;
}

export function createPrivateTypeIndex(semantizer: Semantizer): TypeIndex {
    const typeIndex = semantizer.build(typeIndexFactory);
    typeIndex.addObjectUri(typeIndex.getBaseUri(), RDF.TYPE, TYPE_INDEX.TypeIndex, typeIndex.getDefaultGraphTerm());
    typeIndex.addObjectUri(typeIndex.getBaseUri(), RDF.TYPE, TYPE_INDEX.UnlistedDocument, typeIndex.getDefaultGraphTerm());
    return typeIndex;
}

// export function TypeIndexRegistrationMixin<
//     TBase extends new (...args: any[]) => Dataset
// >(Base: TBase) {
//     return class TypeIndexRegistrationImpl extends Base implements TypeIndexRegistration {

//     }

// }

// export function TypeIndexRegistrationStatementMixin<
//     TBase extends new (...args: any[]) => Dataset
// >(Base: TBase) {
 
//     return class TypeIndexRegistrationStatementImpl extends Base implements TypeIndexStatement {

//     }

// }