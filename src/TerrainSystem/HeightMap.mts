import type { float, int } from "../Shared/Types.mjs";
import AbsHeightMap, { IReadonlyAbsHeightMap } from "./AbsHeightMap.mjs";

export type  HeightMapArrType = Float32Array;
export const HeightMapArrType = Float32Array;

export const defaultHeightVertexSize: int = 1;

export interface IReadonlyHeightMap<TData = HeightMapArrType> extends IReadonlyAbsHeightMap {
    readonly itemSize: int;
    readonly itemHeightIndexOffset: int;
    readonly data: TData;
}

export class HeightMap<TData extends Float32Array | Uint16Array | Uint8Array = HeightMapArrType> extends AbsHeightMap implements IReadonlyHeightMap<TData> {

    private _width: int = 0;
    private _depth: int = 0;
    private _minHeight: float = 0;
    private _maxHeight: float = 0;
    private _data: TData;
    
    private _itemSize: int;
    private _itemHeightIndexOffset: int;

    public get size()  { return this._width * this._depth; }
    public get width() { return this._width; }
    public get depth() { return this._depth; }
    public get data()  { return this._data as Readonly<TData>; }

    public get itemSize()              { return this._itemSize; }
    public get itemHeightIndexOffset() { return this._itemHeightIndexOffset; }

    public get minHeight()  { return this._minHeight; }
    public get maxHeight()  { return this._maxHeight; }

    public constructor(width: int, depth: int, minHeight: float, maxHeight: float);
    public constructor(width: int, depth: int, minHeight: float, maxHeight: float, buffer: TData, itemSize?: int, itemHeightIndexOffset?: int);
    public constructor(width: int, depth: int, minHeight: float, maxHeight: float, buffer?: TData | undefined, itemSize: int = defaultHeightVertexSize, itemHeightIndexOffset: int = 0) {
        super();
        this._init(width, depth, minHeight, maxHeight, buffer!, itemSize, itemHeightIndexOffset);
    }

    protected _init(width: int, depth: int, minHeight: float, maxHeight: float): void;
    protected _init(width: int, depth: int, minHeight: float, maxHeight: float, buffer: TData, itemSize?: int, itemHeightIndexOffset?: int): void;
    protected _init(width: int, depth: int, minHeight: float, maxHeight: float, buffer?: TData | undefined, itemSize: int = defaultHeightVertexSize, itemHeightIndexOffset: int = 0): void {

        this._width = width;
        this._depth = depth;
        this._maxHeight = minHeight;
        this._maxHeight = maxHeight;

        if (buffer) {

            if (itemSize < itemHeightIndexOffset) {
                throw new Error("ItemSize can't less or eq ItemHeightIndexOffset");
            }

            if (buffer.length < (width * depth) * itemSize) {
                throw new Error("Buffer has invalid length");
            }

            this._data = buffer;
            this._itemSize = itemSize;
            this._itemHeightIndexOffset = itemHeightIndexOffset;
        }
        else {
            // TODO: type checker
            this._data = new HeightMapArrType(width * depth * defaultHeightVertexSize) as unknown as TData;
            this._itemSize = defaultHeightVertexSize;
            this._itemHeightIndexOffset = 0;
        }
    }

    protected _encodeHeightFactor(store: TData, index: int, value: float) {

        /*
        // to RGB vector
        if (heightMapHeightBlockSize === 3) {

            if (value < 0 || value > 1) {
                store[index * heightMapHeightBlockSize + 0] = 0;
                store[index * heightMapHeightBlockSize + 1] = 0;
                store[index * heightMapHeightBlockSize + 2] = 0;
            }
            else {
        
                const scaled = Math.floor(value * 16777215);
                const r = (scaled >> 16) & 0xFF;
                const g = (scaled >> 8) & 0xFF;
                const b = (scaled & 0xFF);
            
                store[index * heightMapHeightBlockSize + 0] = r;
                store[index * heightMapHeightBlockSize + 1] = g;
                store[index * heightMapHeightBlockSize + 2] = b;
            }

            return;
        }
        */

        store[index] = value;
    }
    
    protected _decodeHeightFactor(store: Record<number, number>, index: int) {
    
        /*
        // from RGB vector
        if (heightMapHeightBlockSize === 3) {

            const r = store[index * heightMapHeightBlockSize + 0];
            const g = store[index * heightMapHeightBlockSize + 1];
            const b = store[index * heightMapHeightBlockSize + 2];
        
            const scaled = (r << 16) | (g << 8) | b;
            
            return scaled / 16777215;
        }
        */
        
        return store[index];
    }
    
    protected _decodeHeight(store: Record<number, number>, index: int, min: float, max: float) {
        return this._decodeHeightFactor(store, index) * (max - min) + min;
    }

    protected _encodeAndSetHeightFactor(store: TData, index: int, realHeight: float, min: float, max: float) {

        const normalize = Math.max(Math.min(realHeight, max), min);
        const factor    = (normalize - min) / (max - min);
    
               this._encodeHeightFactor(store, index, factor);
        return this._decodeHeightFactor(store, index);
    }
    
    public getIndex(x: int, z: int) {
        return (z * this._width + x) * this._itemSize + this._itemHeightIndexOffset;
    }

    public getFactor(x: int, z: int) {
        const index = this.getIndex(x, z);
        return this._decodeHeightFactor(this._data, index);
    }

    public override get(x: int, z: int) {
        const index = this.getIndex(x, z);
        return this._decodeHeight(this._data, index, this._minHeight, this._maxHeight);
    }

    public override set(x: int, z: int, value: float) {
        const index = this.getIndex(x, z);
        return this._encodeAndSetHeightFactor(this._data, index, value, this._minHeight, this._maxHeight);
    }

    public setMinMaxHeight(minHeight: float, maxHeight: float) {

        if (this._minHeight > this._maxHeight) {
            return;
        }

        this._minHeight = minHeight;
        this._maxHeight = maxHeight;
    }

    public override append(x: int, z: int, value: float) {

        const index     = this.getIndex(x, z);
        const oldValue  = this._decodeHeight(this._data, index, this._minHeight, this._maxHeight);
        const canValue  = oldValue + value;

        return this._encodeAndSetHeightFactor(this._data, index, canValue, this._minHeight, this._maxHeight);
    }

    public override multiply(x: int, z: int, value: float, heightIfZero: float = 0) {

        const index     = this.getIndex(x, z);
        const oldValue  = this._decodeHeight(this._data, index, this._minHeight, this._maxHeight) || heightIfZero;
        const canValue  = oldValue * value;

        return this._encodeAndSetHeightFactor(this._data, index, canValue, this._minHeight, this._maxHeight);
    }
}

export default HeightMap;