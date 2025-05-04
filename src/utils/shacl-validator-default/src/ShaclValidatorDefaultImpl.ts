import ShaclValidatorZazuko from "rdf-validate-shacl";
import { Dataset, ShaclValidationReport, ShaclValidationResult, ShaclValidator } from "@semantizer/types";

type ShaclValidationReportZazuko = Awaited<ReturnType<ShaclValidatorZazuko["validate"]>>;

export class ValidatorImpl implements ShaclValidator {
    
    public async validate(shapeGraph: Dataset, dataGraph: Dataset): Promise<ShaclValidationReport> {
        const validator = new ShaclValidatorZazuko(shapeGraph, {});
        const validationReport = await validator.validate(dataGraph);
        return new ValidationReportImpl(validationReport);
    }

}

export class ValidationReportImpl implements ShaclValidationReport {

    private _validationReport: ShaclValidationReportZazuko;

    public constructor(validationReport: ShaclValidationReportZazuko) {
        this._validationReport = validationReport;
    }

    doConforms(): boolean {
        return this._validationReport.conforms;
    }

    getResults(): ShaclValidationResult[] {
        throw new Error("Method not implemented.");
    }
    
}