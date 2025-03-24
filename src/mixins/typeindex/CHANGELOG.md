# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0-beta.2.0.0] - 2025-03-24

### Added

- Add prepublishOnly script.
- Add the `TypeIndex:registerInstanceForClass` method.

### Changed

- Upgrade `@semantizer/types` to version ^2.1.0.
- The `TypeIndex:getRegisteredInstanceForClass` now accepts a `NamedNode` and returns a `NamedNode` instead of a `DatasetSemantizer`.
- The `TypeIndex` methods `getRegistrationForClassAll`, `getRegisteredInstanceForClass` and `getRegisteredInstanceForClassAll` now accept a graph parameter.

### Fixed

- The `TypeIndex` type now extends `DatasetSemantizer` instead of `Dataset`.

### Removed

- Removed methods from interfaces `TypeIndexRegistrationNonDestructiveOperations`, `TypeIndexRegistrationDestructiveOperations` and `TypeIndexStatementNonDestructiveOperations`.

## [1.0.0-beta.1] - 2025-01-10

Initial release.

[unreleased]: 
[1.0.0-beta.2.0.0]: 
[1.0.0-beta.1]: 
