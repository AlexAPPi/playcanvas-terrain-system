import type { int } from "./Types.mjs";

export abstract class AbsStore2D<T extends string | number | object> {

    protected _p: T[];
    protected _cols = 0;
    protected _rows = 0;

    protected abstract _initArrayType(size: int): T[];

    public init(cols: int, rows: int): void {

        this._cols = cols;
        this._rows = rows;

        const size = cols * rows;
        
        this._p = this._initArrayType(size);
    }

    public initByVal(cols: int, rows: int, val: T | (() => T)): void {

        this.init(cols, rows);

        const size = cols * rows;
        const valIsFunc = typeof val === 'function';

        for (let i = 0 ; i < size; i++) {
            this._p[i] = valIsFunc ? val() : val;
        }
    }

    public initByStore(cols: int, rows: int, val: Record<int, T>): void {
        this._cols = cols;
        this._rows = rows;
        this._p = val as T[];
    }

    public addr(): Record<number, T> {
        return this._p;
    }

    public size(): int {
        return this._rows * this._cols;
    }

    public get(col: int, row: int): T {
        return this._p[row * this._cols + col];
    }

    public set(col: int, row: int, value: T) {
        this._p[row * this._cols + col] = value;
    }

    public getByIndex(index: int) {
        return this._p[index];
    }
    
    public setByIndex(index: int, value: T) {
        this._p[index] = value;
    }
}

export class ObjStore2D<T extends object> extends AbsStore2D<T> {

    protected override _initArrayType(size: number): T[] {
        return new Array<T>(size);
    }
}