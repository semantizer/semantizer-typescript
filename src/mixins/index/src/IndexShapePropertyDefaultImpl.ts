import { Literal, NamedNode } from "@semantizer/types";
import { IndexShapeProperty } from "./types";

export class IndexShapePropertyDefaultImpl implements IndexShapeProperty {

    private _path: NamedNode;
    private _value: Literal | NamedNode | undefined;

    public constructor(path: NamedNode, value: Literal | NamedNode | undefined) {
        this._path = path;
        this._value = value;
    }

    public getValue(): Literal | NamedNode | undefined {
        return this._value;
    }

    public getPath(): NamedNode {
        return this._path;
    }

    public hasSamePath(other: IndexShapeProperty): boolean {
        return this.getPath()?.equals(other.getPath()) ?? false;
    }

    public hasSameValue(other: IndexShapeProperty): boolean {
        if (!this.getValue())
            throw new Error("This property to compare has no value."); // SHOULD BE LOGGED INSTEAD OF THROW
        return this.getValue()!.equals(other.getValue()); // this.getValue must be checked before
    }

    public equals(other: IndexShapeProperty): boolean {
        return this.hasSamePath(other) && this.hasSameValue(other);
    }

}