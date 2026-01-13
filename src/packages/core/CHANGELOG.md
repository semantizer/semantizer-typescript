# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0-beta.2.0.0] - 2025-03-24

### Changed

- The `DatasetBaseFactoryImpl:load` method accepts a `NamedNode` as resource and takes a fetch param.
- The `DatasetBaseFactoryImpl:build` method uses `Dataset:getBaseUri` instead of deprecated `Dataset:getOrigin`.
- The `MixinFactoryImpl:load` method accepts a `NamedNode` as resource and takes a fetch param.
- The `MixinFactoryImpl:build` method uses `Dataset:getBaseUri` instead of deprecated `Dataset:getOrigin`.
- The `SemantizerImpl:load` method accepts a fetch param.

## [1.0.0-beta.1] - 2025-10-01

Initial release.

[unreleased]: 
[1.0.0-beta.2.0.0]: 
[1.0.0-beta.1]: 
