import { DatasetMixin, DatasetMixinNamespace } from "@semantizer/mixin-dataset";
import { DatasetSemantizerConstructor, NamedNode, Semantizer, Term, WithMixins } from "@semantizer/types";
import { TypeIndex, TypeIndexMixinNamespace, TypeIndexMixinOperations } from "./types.js";
import { RDF, TYPE_INDEX } from "./voc.js";

export function TypeIndexMixin<
TMixins extends DatasetMixinNamespace,
    TBase extends DatasetSemantizerConstructor<TMixins>
>(Base: TBase) {
    return class TypeIndexImpl extends Base implements WithMixins<TMixins & TypeIndexMixinNamespace> {

        public get mixins(): TMixins & TypeIndexMixinNamespace {
            const parentMixins = super.mixins as TMixins & Partial<{ typeindex: Partial<TypeIndexMixinOperations> }>;

            return {
                ...parentMixins,
                typeindex: {
                    ...(parentMixins.typeindex ?? {}),

                registerInstanceForClass: (registration: NamedNode | string, instance: NamedNode | string, forClass: NamedNode | string, graph?: Term | string): void => {
                    this.mixins.dataset.addObjectUri(registration, RDF.TYPE, TYPE_INDEX.TypeRegistration, this.mixins.dataset.getDefaultGraphTerm());
                    this.mixins.dataset.addObjectUri(registration, TYPE_INDEX.forClass, forClass, this.mixins.dataset.getDefaultGraphTerm());
                    this.mixins.dataset.addObjectUri(registration, TYPE_INDEX.instance, instance);
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
                    const registrations = this.mixins.typeindex.getRegisteredInstanceForClassAll(forClass);
                    return registrations && registrations[0] ? registrations[0] : undefined;
                },

                getRegisteredInstanceForClassAll: (forClass: NamedNode | string, graph?: Term | string): NamedNode[] | undefined => {
                    const results: NamedNode[] = [];
                    const dataFactory = this.getSemantizer().getConfiguration().getRdfDataModelFactory();
                    const namedGraph = graph ? (typeof graph === 'string') ? dataFactory.namedNode(graph) : graph : undefined;
                    const registrations = this.mixins.typeindex.getRegistrationForClassAll(forClass, graph);
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
}

export function typeIndexFactory(semantizer: Semantizer) {
    const _DatasetImpl = semantizer.getConfiguration().getDatasetImpl();
    return semantizer.getMixinFactory(TypeIndexMixin, DatasetMixin(_DatasetImpl));
}

export function createPublicTypeIndex(semantizer: Semantizer): TypeIndex {
    const typeIndex = semantizer.build(typeIndexFactory);
    typeIndex.mixins.dataset.addObjectUri(typeIndex.getBaseUri(), RDF.TYPE, TYPE_INDEX.TypeIndex, typeIndex.mixins.dataset.getDefaultGraphTerm());
    typeIndex.mixins.dataset.addObjectUri(typeIndex.getBaseUri(), RDF.TYPE, TYPE_INDEX.ListedDocument, typeIndex.mixins.dataset.getDefaultGraphTerm());
    return typeIndex;
}

export function createPrivateTypeIndex(semantizer: Semantizer): TypeIndex {
    const typeIndex = semantizer.build(typeIndexFactory);
    typeIndex.mixins.dataset.addObjectUri(typeIndex.getBaseUri(), RDF.TYPE, TYPE_INDEX.TypeIndex, typeIndex.mixins.dataset.getDefaultGraphTerm());
    typeIndex.mixins.dataset.addObjectUri(typeIndex.getBaseUri(), RDF.TYPE, TYPE_INDEX.UnlistedDocument, typeIndex.mixins.dataset.getDefaultGraphTerm());
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