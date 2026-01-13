Example of final shape:
```turtle
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix schema: <http://schema.org/> .
@prefix idx: <https://ns.inria.fr/idx/terms#>.
@prefix ex: <http://example.org#>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.

idx:IndexEntry
    a rdfs:Class, sh:NodeShape ;
    sh:closed false;
    sh:property [
        sh:path idx:hasSubIndex;
        sh:minCount 1;
    ];
    sh:property [
        sh:path idx:hasShape ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
        sh:property [
            sh:path sh:property ;
            sh:minCount 1;
            sh:qualifiedValueShape 
                [
                    sh:and (
                        [ sh:path sh:path ; sh:hasValue rdf:type ] 
                        [ sh:path sh:hasValue; sh:hasValue ex:User ]
                    )
                ], 
                [
                    sh:and (
                        [ sh:path sh:path; sh:hasValue ex:skills ]
                        [ sh:path sh:hasValue; sh:hasValue ex:skill-engineer ]
                    )
                ];
            sh:qualifiedMinCount 1 ;
        ];
    ].
```

Example of sub-index shape:
```turtle
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix schema: <http://schema.org/> .
@prefix idx: <https://ns.inria.fr/idx/terms#>.
@prefix ex: <http://example.org#>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.

idx:IndexEntry
    a rdfs:Class, sh:NodeShape ;
    #sh:closed false;
    sh:property [
        sh:path idx:hasSubIndex;
        sh:minCount 1;
    ];
    sh:property [
        sh:path idx:hasShape ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
        sh:property [
            sh:path sh:property ;
            sh:minCount 1;
            sh:qualifiedValueShape 
                [
                    sh:and (
                        [ sh:path sh:path ; sh:hasValue rdf:type ]
                        [ sh:path sh:hasValue; sh:hasValue ex:User ]
                    )
                ],
                [
                    sh:and (
                        [ sh:path sh:path ; sh:hasValue ex:skills ] 
                        [ sh:path sh:hasValue ; sh:maxCount 0 ]
                    )
                ];
            sh:qualifiedMinCount 1;            
        ]
    ].
```

Example of SPARQL query:
```sparql
PREFIX idx: <https://ns.inria.fr/idx/terms#>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX ex: <http://example.org#>

SELECT DISTINCT ?result WHERE {
    ?prop0 a idx:IndexEntry;
    idx:hasShape [
        sh:property [
            sh:path ex:skills;
            sh:hasValue ex:skill-engineer
        ]
    ];
    idx:hasTarget ?result.
} LIMIT 5
```