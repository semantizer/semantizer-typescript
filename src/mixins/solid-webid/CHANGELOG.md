# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0-beta.3.0.0] - 2025-03-24

### Added

- Add prepublishOnly script.
- Add `SolidWebIdProfileMixin:check` method.
- Add `SolidPreferencesMixin` mixin.
- Add `solidPreferencesFactory` factory function.
- Add `createSolidPreferencesDocument` function.
- Add `SolidWebIdOperations:getPrivateTypeIndex` method.

### Changed 

- The `SolidWebIdProfileMixin:getPrimaryTopic` method is replaced by the one of the webid mixin.
- All `SolidWebIdMixin` mixin methods implementation: they now call the `getPrimaryTopic` method to get the WebId.
- The operations from `SolidWebIdOperations` now return `NamedNode` instead of mixin types.
- Rename `SolidWebIdOperations:getPreferencesFile` to `getPreferencesDocument`.

### Fixed

- `SolidWebIdProfileMixin` mixin now takes a `WebIdProfileConstructor` base type (TBase).
- Fix `SolidWebIdProfileMixin:loadExtendedProfile` method.
- `SolidWebIdMixin` mixin now takes a `WebIdProfileConstructor` base type (TBase).
- The factory function `solidWebIdProfileFactory` and `solidWebIdFactory` now use the `WebIdProfileMixin` mixin.

## [1.0.0-beta.2.0.1] - 2025-02-27

## [1.0.0-beta.2.0.0] - 2025-02-27

## [1.0.0-beta.1] - 2025-01-10

Initial release.

[unreleased]: 
[1.0.0-beta.3.0.0]: 
[1.0.0-beta.2.0.1]: 
[1.0.0-beta.2.0.0]: 
[1.0.0-beta.1]: 
