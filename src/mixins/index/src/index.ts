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
export { IndexStrategyBaseShapeImpl } from "./IndexStrategyBaseShapeImpl.js";

export { IndexStrategyFinalIndexesDefaultImpl } from "./IndexStrategyFinalIndexesDefaultImpl.js";
export * from './EntryStreamTransformerStrategyDefaultImpl.js';

export default indexFactory;