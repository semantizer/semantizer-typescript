const shaclNamespace = 'http://www.w3.org/ns/shacl#';
const rdfNamespace = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

export const RDF = {
    namespace: rdfNamespace,
    TYPE: rdfNamespace + 'type'
}

export const SHACL = {
    namespace: shaclNamespace,
    NODE_SHAPE: shaclNamespace + 'NodeShape',
    CLOSED: shaclNamespace + 'closed',
    HAS_VALUE: shaclNamespace + 'hasValue',
    PATH: shaclNamespace + 'path',
    PATTERN: shaclNamespace + 'pattern',
    PROPERTY: shaclNamespace + 'property',
    MIN_COUNT: shaclNamespace + 'minCount',
    MAX_COUNT: shaclNamespace + 'maxCount',
    NODE: shaclNamespace + 'node',
    QUALIFIED_VALUE_SHAPE: shaclNamespace + 'qualifiedValueShape',
    QUALIFIED_MIN_COUNT: shaclNamespace + 'qualifiedMinCount'
}