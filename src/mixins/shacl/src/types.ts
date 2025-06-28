import { DatasetSemantizer, BlankNode, NamedNode, Quad_Graph, Quad_Object, Quad_Subject, Term } from "@semantizer/types";
import { DatasetMixinNamespace } from "@semantizer/mixin-dataset";

export type ShaclShape = DatasetSemantizer<ShaclShapeMixinNamespace>;
export type ShaclShapeMixinNamespace = DatasetMixinNamespace & { shacl: ShaclShapeMixinOperations };

export interface ShaclShapeMixinOperations {
    getDatatype(property: Term | string, graph?: Quad_Graph | string): NamedNode | undefined;
    getPath(property: Term | string, graph?: Quad_Graph | string): NamedNode | undefined;
    getPropertiesAll(shape: Quad_Subject | string, graph?: Quad_Graph | string): Term[] | undefined;
    getMinCount(property: Term | string, graph?: Quad_Graph | string): number | undefined;
    getMaxCount(property: Term | string, graph?: Quad_Graph | string): number | undefined;
    isMandatory(property: Term | string, graph?: Quad_Graph | string): boolean;
    isMultiple(property: Term | string, graph?: Quad_Graph | string): boolean;

    isClosed(shape: Quad_Subject | string, graph?: Quad_Graph | string): boolean | undefined;
    setIsClosed(shape: Quad_Subject | string, closed: boolean, oldClosed?: boolean, graph?: Quad_Graph | string): void;

    createShapeAsNamedNode(uri: NamedNode | string, graph?: Quad_Graph | string): NamedNode;
    createShapeAsBlankNode(name?: string, graph?: Quad_Graph | string): BlankNode;

    createPropertyAsNamedNode(shape: Quad_Subject | string, uri: NamedNode | string, graph?: Quad_Graph | string): NamedNode;
    createPropertyAsBlankNode(shape: Quad_Subject | string, name?: string, graph?: Quad_Graph | string): BlankNode;

    setPath(property: NamedNode | BlankNode | string, path: NamedNode | string, oldPath?: NamedNode, graph?: Quad_Graph | string): void;
    addHasValue(subject: NamedNode | BlankNode | string, value: NamedNode | BlankNode | string, graph?: Quad_Graph | string): void;
    setMinCount(property: NamedNode | BlankNode | string, minCount: number, oldMinCount?: number, graph?: Quad_Graph | string): void;
    setMaxCount(property: NamedNode | BlankNode | string, minCount: number, oldMaxCount?: number, graph?: Quad_Graph | string): void;
    addQualifiedValueShape(property: NamedNode | BlankNode | string, shape: NamedNode | BlankNode, graph?: Quad_Graph | string): void;
    setQualifiedMinCount(property: NamedNode | BlankNode | string, qualifiedMinCount: number, oldQualifiedMinCount?: number, graph?: Quad_Graph | string): void;
}