import { BlankNode, Dataset, DatasetSemantizer, NamedNode, Quad_Graph, Quad_Object, Quad_Subject } from "@semantizer/types";

export interface ShapeOperations {

    getPath(property: NamedNode | BlankNode | string, graph?: Quad_Graph | string): NamedNode | undefined;

    isClosed(shape: Quad_Subject | string, graph?: Quad_Graph | string): boolean;
    setIsClosed(shape: Quad_Subject | string, closed: boolean, graph?: Quad_Graph | string): void;

    createShapeAsNamedNode(uri: NamedNode | string, graph?: Quad_Graph | string): NamedNode;
    createShapeAsBlankNode(name?: string, graph?: Quad_Graph | string): BlankNode;

    createPropertyAsNamedNode(shape: Quad_Subject | string, uri: NamedNode | string, graph?: Quad_Graph | string): NamedNode;
    createPropertyAsBlankNode(shape: Quad_Subject | string, name?: string, graph?: Quad_Graph | string): BlankNode;

    setPath(property: NamedNode | BlankNode | string, path: NamedNode, graph?: Quad_Graph | string): void;
    addHasValue(property: NamedNode | BlankNode | string, value: Quad_Object, graph?: Quad_Graph | string): void;
    setMinCount(property: NamedNode | BlankNode | string, minCount: number, graph?: Quad_Graph | string): void;
    setMaxCount(property: NamedNode | BlankNode | string, minCount: number, graph?: Quad_Graph | string): void;
    addQualifiedValueShape(property: NamedNode | BlankNode | string, shape: NamedNode | BlankNode, graph?: Quad_Graph | string): void;
    setQualifiedMinCount(property: NamedNode | BlankNode | string, qualifiedMinCount: number, graph?: Quad_Graph | string): void;
}

export interface ShaclValidator {
    validate(shapeGraph: Dataset, dataGraph: Dataset): ShaclValidationReport;
}

export interface ShaclValidationReport {
    doConforms(): boolean;
    getResults(): ShaclValidationResult[];
}

export interface ShaclValidationResult {

}

export type Shape = DatasetSemantizer & ShapeOperations;