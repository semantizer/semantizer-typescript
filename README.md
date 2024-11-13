# Semantizer

Semantizer is a TypeScript library to ease the development of applications working with RDF documents. This library is modular and offers mixins that provide useful methods to manipulate [RDF datasets](https://www.w3.org/TR/rdf11-concepts/#section-dataset). Semantizer also give you the ability to easily write your own mixins to fit to your data models. Doing so you can quickly obtain a layer to load, modify and save your RDF data. In particular, this library can be used to build [Solid](https://solidproject.org) applications.

Semantizer supports the whole RDF model out of the box, including blank nodes. The default implementation uses RDFJS but this can be changed. Semantizer can be used in replacement or with other libraries such as LDO or solid-client.

## Get started

```bash
npm install @semantizer/default
```

```ts
import semantizer from "@semantizer/default";
import { webIdProfileFactory } from "@semantizer/mixin-solid-webid";

// To create an RDF dataset
const localDataset = semantizer.build();
localDataset.addLiteral(...);

// To create an RDF dataset using the solid-webid mixin
const localWebId = semantizer.build(webIdProfileFactory);
const localPrimaryTopic = localWebId.getPrimaryTopic();

// To load a distant dataset
const distantDataset = await semantizer.load("http://example.org/dataset");

// To load a distant dataset using the solid-webid mixin
const distantWebId = await semantizer.load("http://example.org/webid", webIdProfileFactory);
const distantPrimaryTopic = distantWebId.getPrimaryTopic();
```

## Available mixins

The base mixin is the "dataset" mixin. It offers basic methods such as `getLiteral()`, `getLinkedObject()` and so on. The documentation of each mixin is available into the mixin directory. Click on the name of a mixin below to access to its documentation.

| Mixin      | Description |
| -----------| ----------- |
| [dataset](./src/mixins/dataset/) | The base mixin. Provides essential methods. |
| [index](./src/mixins/index/) | A mixin to query indexes. |
| [literal-helper-add](./src/mixins/literal-helper-add/) | A mixin that provides helper methods to add literals to the dataset with various datatypes. |
| [solid-webid](./src/mixins/solid-webid/) | A mixin to manipulate [Solid WebId profiles](https://solid.github.io/webid-profile/). |
| [typeindex](./src/mixins/typeindex/) | A mixin to manipulate [TypeIndexes](https://solid.github.io/type-indexes/). |
| [webid](./src/mixins/webid/) | A mixin to manipulate [WebId](https://w3c.github.io/WebID/spec/identity/) profiles. |

## Development

### Mixin development

TDB.

### Core developement

| Package      | Description |
| -----------| ----------- |
| [core](./src/packages/core/) | Text |
| [core-rdfjs](./src/packages/core-rdfjs/) | Text |
| [default](./src/packages/default/) | Text |
| [loader-quad-stream-rdfjs](./src/packages/loader-quad-stream-rdfjs/) | Text |
| [loader-rdfjs](./src/packages/loader-rdfjs/) | Text |
| [rdfjs-dataset-impl](./src/packages/rdfjs-dataset-impl/) | Text |
| [types](./src/packages/types/) | Text |

## Funders and supporters

A great thank to all our ongoing and past funders:

<img src="logos/logo-ademe.svg" height="100">
<img src="logos/logo-fondation-de-france.webp" height="100">
<img src="logos/logo-fondation-credit-cooperatif.svg" height="50">
<img src="logos/logo-inria.svg" height="50">
<img src="logos/logo-startinblox.png" height="50">

This library is supported by these projects:

<img src="logos/logo-dfc.png" height="100">
<img src="logos/logo-mycelium.svg" height="100">

## History

This library was writen for the [Data Food Consortium](https://datafoodconsortium.org) project (DFC) which aims to provide interoperability between food supply chain platforms. We use the semantizer library inside our connector library to help developers to exchange data expressed with the DFC ontology.