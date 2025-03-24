# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0-beta.2.1.0] - 2025-03-24

### Added

- Add `Dataset:deleteObjectUri` method.
- Add `Dataset:deleteObjectDecimal` method.
- Add `Dataset:setObjectStringNoLocale` method.
- Add `Dataset:setObjectUri` method.
- Add `Dataset:setObjectDecimal` method.
- Add `Dataset:setObjectStringNoLocaleAll` method.
- Add `Dataset:setObjectUriAll` method.
- Add `Dataset:setObjectDecimalAll` method.
- Add `prepublishOnly` script.

## [1.0.0-beta.2.0.0] - 2025-02-27

### Added

- Export Quad_Subject, Quad_Predicate, Quad_Object, and Quad_Graph from `@rdfjs/types`.
- Add `WithBaseUri` interface to replace deprecated `WithOrigin`.
- Add `Dataset:getDefaultGraphTerm()`.
- Type `DatasetSemantizer` extends `WithBaseUri` interface.
- Type `DatasetSemantizerRdfjsMixinConstructor` extends `WithBaseUri` interface.

### Changed

- Upgrade `@rdfjs/types` to version ^2.0.0.
- `Dataset:getSubGraph` allows string as subject and `DefaultGraph` for parentGraph.
- `Dataset:getSubGraphAll` allows DefaultGraph or string as parentGraph.
- Adders and getters for all types (uri, boolean, date and, number and string) now accept string.

### Deprecated

- Depreacate `WithOrigin` interface (replaced by `WithBaseUri`).
- Deprecate `Dataset:addLinkedObject` method (replaced by `addObjectUri` and `addObjectBlankNode`).
- Deprecate `Dataset:getLinkedObject` method (replaced by `getObjectLinked`).
- Deprecate `Dataset:getLinkedObjectAll` method (replaced by `getObjectLinkedAll`).

### Fixed

- Remove extra "include" element in tsconfig (`ContextImpl`).

## [1.0.0-beta.1] - 2025-10-01

Initial release.

[unreleased]: https://github.com/semantizer/semantizer-typescript/compare/bd0b26837fbd636b69704b602b93c0edda4945bf...dev
[1.0.0-beta.2.1.0]: https://github.com/semantizer/semantizer-typescript/compare/393d9cc8cb44c630ca3e38d8c956ddb99107a625...bd0b26837fbd636b69704b602b93c0edda4945bf
[1.0.0-beta.2.0.0]: https://github.com/semantizer/semantizer-typescript/compare/662b21eef8913c8009ead13f6b4b3cc84e064379...393d9cc8cb44c630ca3e38d8c956ddb99107a625
[1.0.0-beta.1]: https://github.com/semantizer/semantizer-typescript/commit/662b21eef8913c8009ead13f6b4b3cc84e064379
