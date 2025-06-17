# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Replace getOriginUri by getBaseUri.

## [1.0.0-beta.2.0.0] - 2025-03-24

### Added

- Add `getDefaultGraphTerm` method.
- Add `deleteObjectUri` method.
- Add `deleteObjectDecimal` method.
- Add `setObjectDecimal` method.
- Add `setObjectStringNoLocale` method.
- Add `setObjectUri` method.
- Add `setObjectStringNoLocaleAll` method.
- Add `setObjectUriAll` method.
- Add `setObjectDecimalAll` method.
- Add utils `getTermsFromQuadSubjectPredicateAndGraph` function.
- Add utils `getTermsFromTermOrStringOrNull` function.

### Changed

- Upgrade `@semantizer/types` to version ^2.1.0.
- `Dataset:getSubGraph` allows string as subject and `DefaultGraph` for parentGraph.
- `Dataset:getSubGraphAll` allows DefaultGraph or string as parentGraph.
- Adders and getters for all types (uri, boolean, date and, number and string) now accept string.

## [1.0.0-beta.1] - 2024-10-01

Initial release.

[unreleased]: 
[1.0.0-beta.2.0.0]: 
[1.0.0-beta.1]: 
