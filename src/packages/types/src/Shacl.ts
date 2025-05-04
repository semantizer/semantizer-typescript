import { Dataset } from "@rdfjs/types";

export interface ShaclValidator {
    validate(shapeGraph: Dataset, dataGraph: Dataset): Promise<ShaclValidationReport>;
}

export interface ShaclValidationReport {
    doConforms(): boolean;
    getResults(): ShaclValidationResult[];
}

export interface ShaclValidationResult {

}