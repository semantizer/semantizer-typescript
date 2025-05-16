import { BlankNode, Dataset, DatasetSemantizer, NamedNode, Quad_Graph, Quad_Object, Quad_Subject } from "@semantizer/types";

export interface ShapeOperations {
    shacl_getPath(property: NamedNode | BlankNode | string, graph?: Quad_Graph | string): NamedNode | undefined;

    shacl_isClosed(shape: Quad_Subject | string, graph?: Quad_Graph | string): boolean | undefined;
    shacl_setIsClosed(shape: Quad_Subject | string, closed: boolean, graph?: Quad_Graph | string): void;

    shacl_createShapeAsNamedNode(uri: NamedNode | string, graph?: Quad_Graph | string): NamedNode;
    shacl_createShapeAsBlankNode(name?: string, graph?: Quad_Graph | string): BlankNode;

    shacl_createPropertyAsNamedNode(shape: Quad_Subject | string, uri: NamedNode | string, graph?: Quad_Graph | string): NamedNode;
    shacl_createPropertyAsBlankNode(shape: Quad_Subject | string, name?: string, graph?: Quad_Graph | string): BlankNode;

    shacl_setPath(property: NamedNode | BlankNode | string, path: NamedNode, oldPath?: NamedNode, graph?: Quad_Graph | string): void;
    shacl_addHasValue(property: NamedNode | BlankNode | string, value: Quad_Object, graph?: Quad_Graph | string): void;
    shacl_setMinCount(property: NamedNode | BlankNode | string, minCount: number, oldMinCount?: number, graph?: Quad_Graph | string): void;
    shacl_setMaxCount(property: NamedNode | BlankNode | string, minCount: number, oldMaxCount?: number, graph?: Quad_Graph | string): void;
    shacl_addQualifiedValueShape(property: NamedNode | BlankNode | string, shape: NamedNode | BlankNode, graph?: Quad_Graph | string): void;
    shacl_setQualifiedMinCount(property: NamedNode | BlankNode | string, qualifiedMinCount: number, oldQualifiedMinCount?: number, graph?: Quad_Graph | string): void;
}

export type Shape = DatasetSemantizer & ShapeOperations;