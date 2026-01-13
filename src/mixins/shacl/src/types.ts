import { DatasetMixinNamespace } from "@semantizer/mixin-dataset";
import { BlankNode, DatasetSemantizer, NamedNode, Quad_Subject, QuadGraph, QuadPredicate, QuadSubject } from "@semantizer/types";

export type ShaclShape = DatasetSemantizer<ShaclShapeMixinNamespace>;
export type ShaclShapeMixinNamespace = DatasetMixinNamespace & { shacl: ShaclShapeMixinOperations };

export interface ShaclShapeMixinOperations {
    getDatatype(property: QuadSubject, graph?: QuadGraph): NamedNode | undefined;
    getPath(property: QuadSubject, graph?: QuadGraph): NamedNode | undefined;
    getPropertiesAll(shape: QuadSubject, graph?: QuadGraph): Quad_Subject[] | undefined;
    getMinCount(property: QuadSubject, graph?: QuadGraph): number | undefined;
    getMaxCount(property: QuadSubject, graph?: QuadGraph): number | undefined;
    isMandatory(property: QuadSubject, graph?: QuadGraph): boolean;
    isMultiple(property: QuadSubject, graph?: QuadGraph): boolean;

    isClosed(shape: QuadSubject, graph?: QuadGraph): boolean | undefined;
    setIsClosed(shape: QuadSubject, closed: boolean, oldClosed?: boolean, graph?: QuadGraph): void;

    createShapeAsNamedNode(uri: NamedNode | string, graph?: QuadGraph): NamedNode;
    createShapeAsBlankNode(name?: string, graph?: QuadGraph): BlankNode;

    createPropertyAsNamedNode(shape: QuadSubject, uri: NamedNode | string, graph?: QuadGraph): NamedNode;
    createPropertyAsBlankNode(shape: QuadSubject, name?: string, graph?: QuadGraph): BlankNode;

    setPath(property: QuadSubject, path: QuadPredicate, oldPath?: NamedNode, graph?: QuadGraph): void;
    addHasValue(subject: QuadSubject, value: QuadSubject, graph?: QuadGraph): void;
    setMinCount(property: QuadSubject, minCount: number, oldMinCount?: number, graph?: QuadGraph): void;
    setMaxCount(property: QuadSubject, minCount: number, oldMaxCount?: number, graph?: QuadGraph): void;
    addQualifiedValueShape(property: QuadSubject, shape: NamedNode | BlankNode, graph?: QuadGraph): void;
    setQualifiedMinCount(property: QuadSubject, qualifiedMinCount: number, oldQualifiedMinCount?: number, graph?: QuadGraph): void;
}