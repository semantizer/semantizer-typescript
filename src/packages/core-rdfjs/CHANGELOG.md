# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- setBaseUri accepts a string as argument.

## [1.0.0-beta.2.0.0] - 2025-03-24

### Added

- `DatasetCoreRdfjsImpl:getBaseUri` method.
- `DatasetCoreRdfjsImpl:setBaseUri` method.
- Add prepublishOnly script.

### Changed

- Upgrade `@semantizer/types` to version ^1.0.0-beta.2.1.0.
- Upgrade `@semantizer/rdfjs-dataset-impl` to version ^1.0.0-beta.2.0.0.
- `DatasetCoreRdfjsImpl` class implements `WithBaseUri` interface.
- `DatasetCoreRdfjsImpl:constructor` method accepts a `NamedNode` or string as `baseUri` params (removed `origin` param).

## [1.0.0-beta.1] - 2025-10-01

Initial release.

[unreleased]: 
[1.0.0-beta.2.0.0]: 
[1.0.0-beta.1]: 
