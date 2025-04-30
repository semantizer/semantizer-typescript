import { BlankNode, DatasetSemantizerMixinConstructor, NamedNode, Quad, Quad_Graph, Quad_Object, Quad_Subject, Semantizer, Term } from "@semantizer/types";
import { Shape } from "./types";

export function ShapeMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class ShapeMixinImpl extends Base implements Shape {
        
        getPath(property: NamedNode | BlankNode | string, graph?: Quad_Graph | string): NamedNode | undefined {
            throw new Error("Method not implemented.");
        }
        isClosed(shape: Quad_Subject | string, graph?: Quad_Graph | string): boolean {
            throw new Error("Method not implemented.");
        }
        setIsClosed(shape: Quad_Subject | string, closed: boolean, graph?: Quad_Graph | string): void {
            throw new Error("Method not implemented.");
        }
        createShapeAsNamedNode(uri: NamedNode | string, graph?: Quad_Graph | string): NamedNode {
            throw new Error("Method not implemented.");
        }
        createShapeAsBlankNode(name?: string, graph?: Quad_Graph | string): BlankNode {
            throw new Error("Method not implemented.");
        }
        createPropertyAsNamedNode(shape: Quad_Subject | string, uri: NamedNode | string, graph?: Quad_Graph | string): NamedNode {
            throw new Error("Method not implemented.");
        }
        createPropertyAsBlankNode(shape: Quad_Subject | string, name?: string, graph?: Quad_Graph | string): BlankNode {
            throw new Error("Method not implemented.");
        }
        setPath(property: NamedNode | BlankNode | string, path: NamedNode, graph?: Quad_Graph | string): void {
            throw new Error("Method not implemented.");
        }
        addHasValue(property: NamedNode | BlankNode | string, value: Quad_Object, graph?: Quad_Graph | string): void {
            throw new Error("Method not implemented.");
        }
        setMinCount(property: NamedNode | BlankNode | string, minCount: number, graph?: Quad_Graph | string): void {
            throw new Error("Method not implemented.");
        }
        setMaxCount(property: NamedNode | BlankNode | string, minCount: number, graph?: Quad_Graph | string): void {
            throw new Error("Method not implemented.");
        }
        addQualifiedValueShape(property: NamedNode | BlankNode | string, shape: NamedNode | BlankNode, graph?: Quad_Graph | string): void {
            throw new Error("Method not implemented.");
        }
        setQualifiedMinCount(property: NamedNode | BlankNode | string, qualifiedMinCount: number, graph?: Quad_Graph | string): void {
            throw new Error("Method not implemented.");
        }

    }

}