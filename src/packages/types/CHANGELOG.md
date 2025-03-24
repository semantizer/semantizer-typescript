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

[unreleased]: https://github.com/assemblee-virtuelle/semantizer-typescript/compare/v1.0.0-alpha.3...HEAD
[1.0.0-alpha.3]: https://github.com/assemblee-virtuelle/semantizer-typescript/compare/v1.0.0-alpha.2...v1.0.0-alpha.3
[1.0.0-alpha.2]: https://github.com/assemblee-virtuelle/semantizer-typescript/compare/v1.0.0-alpha.1...v1.0.0-alpha.2
[1.0.0-alpha.1]: https://github.com/assemblee-virtuelle/semantizer-typescript/compare/v1.0.0-alpha...v1.0.0-alpha.1
[1.0.0-alpha]: https://github.com/assemblee-virtuelle/semantizer-typescript/releases/tag/v1.0.0-alpha
