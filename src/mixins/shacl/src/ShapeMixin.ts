import { BlankNode, DatasetSemantizerMixinConstructor, NamedNode, Quad, Quad_Graph, Quad_Object, Quad_Subject, Semantizer, Term } from "@semantizer/types";
import { Shape } from "./types";
import { RDF, SHACL } from "./ns";

export function ShapeMixin<
    TBase extends DatasetSemantizerMixinConstructor
>(Base: TBase) {

    return class ShapeMixinImpl extends Base implements Shape {
        
        public shacl_getPath(property: NamedNode | BlankNode | string, graph?: Quad_Graph | string): NamedNode | undefined {
            return this.getObjectUri(property, SHACL.PATH, graph);
        }
        
        public shacl_isClosed(shape: Quad_Subject | string, graph?: Quad_Graph | string): boolean | undefined {
            return this.getObjectBoolean(shape, SHACL.CLOSED, graph);
        }
        
        public shacl_setIsClosed(shape: Quad_Subject | string, closed: boolean, graph?: Quad_Graph | string): void {
            throw new Error("Method not implemented.");
        }
        
        public shacl_createShapeAsNamedNode(uri: NamedNode | string, graph?: Quad_Graph | string): NamedNode {
            this.addObjectUri(uri, RDF.TYPE, SHACL.NODE_SHAPE, graph);
            return typeof uri === 'string' ? this.getSemantizer().getConfiguration().getRdfDataModelFactory().namedNode(uri) : uri;
        }
        
        public shacl_createShapeAsBlankNode(name?: string, graph?: Quad_Graph | string): BlankNode {
            throw new Error("Method not implemented.");
        }
        
        public shacl_createPropertyAsNamedNode(shape: Quad_Subject | string, uri: NamedNode | string, graph?: Quad_Graph | string): NamedNode {
            throw new Error("Method not implemented.");
        }
        
        public shacl_createPropertyAsBlankNode(shape: Quad_Subject | string, name?: string, graph?: Quad_Graph | string): BlankNode {
            const property = this.getSemantizer().getConfiguration().getRdfDataModelFactory().blankNode(name);
            this.addObjectBlankNode(shape, SHACL.PROPERTY, property, graph);
            return property;
        }
        
        public shacl_setPath(property: NamedNode | BlankNode | string, path: NamedNode, oldPath?: NamedNode, graph?: Quad_Graph | string): void {
            this.setObjectUri(property, SHACL.PATH, path, oldPath, graph);
        }
        
        public shacl_addHasValue(property: NamedNode | BlankNode | string, value: Quad_Object, graph?: Quad_Graph | string): void {
            throw new Error("Method not implemented.");
        }
        
        public shacl_setMinCount(property: NamedNode | BlankNode | string, minCount: number, oldMinCount?: number, graph?: Quad_Graph | string): void {
            throw new Error("Method not implemented.");
        }
        
        public shacl_setMaxCount(property: NamedNode | BlankNode | string, minCount: number, oldMaxCount?: number, graph?: Quad_Graph | string): void {
            throw new Error("Method not implemented.");
        }
        
        public shacl_addQualifiedValueShape(property: NamedNode | BlankNode | string, shape: NamedNode | BlankNode, graph?: Quad_Graph | string): void {
            throw new Error("Method not implemented.");
        }
        
        public shacl_setQualifiedMinCount(property: NamedNode | BlankNode | string, qualifiedMinCount: number, oldQualifiedMinCount?: number, graph?: Quad_Graph | string): void {
            throw new Error("Method not implemented.");
        }

    }

}