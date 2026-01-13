import { BindingsStream } from "@comunica/types";
import { DatasetSemantizer } from "@semantizer/types";

export type SparqlComunicaRdfjs = DatasetSemantizer<SparqlComunicaRdfjsMixinNamespace>;
export type SparqlComunicaRdfjsMixinNamespace = { sparql: SparqlComunicaRdfjsMixinOperations };

export interface SparqlComunicaRdfjsMixinOperations {
    executeSparqlQuery(sparqlQuery: string): Promise<BindingsStream>;
}