const idx = 'https://ns.inria.fr/idx/terms#';
const shacl = 'https://www.w3.org/ns/shacl#';
const rdf = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const rdfjs = 'http://www.w3.org/2000/01/rdf-schema#';

export const IDX = {
    namespace: idx,
    INDEX_ENTRY: idx + 'IndexEntry',
    HAS_SUB_INDEX: idx + 'hasSubIndex',
    HAS_TARGET: idx + 'hasTarget',
    HAS_SHAPE: idx + 'hasShape',
}

export const SHACL = {
    namespace: shacl,
    NODE_SHAPE: shacl + 'NodeShape',
    HAS_VALUE: shacl + 'hasValue',
    PATH: shacl + 'path',
    PATTERN: shacl + 'pattern',
    PROPERTY: shacl + 'property',
}

export const RDF = {
    namespace: rdf,
    TYPE: rdf + 'type',
}

export const RDFJS = {
    namespace: rdfjs,
    CLASS: rdfjs + 'Class',
}