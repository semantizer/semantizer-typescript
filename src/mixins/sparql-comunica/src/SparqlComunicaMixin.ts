import { QueryEngine } from "@comunica/query-sparql-rdfjs";
import { BindingsStream } from "@comunica/types";
import { DatasetSemantizerConstructor, Semantizer, WithMixins } from "@semantizer/types";
import { Store } from "n3";
import { SparqlComunicaRdfjsMixinNamespace, SparqlComunicaRdfjsMixinOperations } from "./types";

export function SparqlComunicaMixin<
    TMixins extends object,
    TBase extends DatasetSemantizerConstructor<TMixins>
>(Base: TBase) {

    return class SparqlComunicaRdfjsMixinImpl extends Base implements WithMixins<TMixins & SparqlComunicaRdfjsMixinNamespace> {

        public get mixins(): TMixins & SparqlComunicaRdfjsMixinNamespace {
            const parentMixins = super.mixins as TMixins & Partial<{ sparql: Partial<SparqlComunicaRdfjsMixinOperations> }>;

            return {
                ...parentMixins,
                sparql: {
                    ...(parentMixins.sparql ?? {}),

                    executeSparqlQuery: async (sparqlQuery: string): Promise<BindingsStream> => {
                        const engine = new QueryEngine();
                        const store = new Store();
                        store.addAll(this);
                        return engine.queryBindings(sparqlQuery, { sources: [store] });
                    }

                }

            }

        }

    }

}

export function sparqlComunicaFactory(semantizer: Semantizer) {
    return semantizer.getMixinFactory(SparqlComunicaMixin);
}