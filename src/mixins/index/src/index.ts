import { indexFactory } from "./IndexMixin.js";

export * from './namespaces.js';

export {
    IndexMixin,
    indexFactory
} from "./IndexMixin.js";

// export {
//     IndexEntryMixin,
//     indexEntryFactory
// } from "./IndexEntryMixin.js";

export {
    IndexShapeMixin,
    indexShapeFactory
} from "./IndexShapeMixin.js";

// export {
//     IndexShapePropertyMixin,
//     indexShapePropertyValueFactory,
//     indexShapePropertyPatternFactory
// } from "./IndexShapePropertyMixin.js";

export { 
    Index,
    IndexEntry,
    IndexShape,
    // IndexShapeComparisonResult,
    IndexShapeProperty,
    IndexStrategy,
    IndexStrategyFinalIndexes,
    FinalIndexResult
} from "./types.js";

export * from './IndexShapeComparisonStrategyDefaultImpl.js';
export * from './strategy/shape/MatchShaclPropertyPredicateAndObject.js';
export { IndexStrategyBaseShapeImpl } from "./strategy/index/IndexStrategyBaseShapeImpl.js";

export { IndexStrategyFinalIndexesDefaultImpl } from "./strategy/index/IndexStrategyFinalIndexesDefaultImpl.js";
export * from './strategy/entry/EntryStreamTransformerStrategyDefaultImpl.js';

export default indexFactory;