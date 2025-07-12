import { IVector2, IVector3, RefObject, float, int } from "../Extras/Types.mjs";
import AbsHeightMap, { IReadonlyAbsHeightMap } from "./AbsHeightMap.mjs";

export interface IVertexHeightsInfo {
    maxHeight: float;
}

export interface ICoordsReader {
    width: number;
    getPosition(index: int, buf: RefObject<IVector3>): boolean;
    getPositionWithHeightByFactor(index: int, buf: RefObject<IVector3>): boolean;
    getCoords(index: int, buf: RefObject<IVector3>): boolean;
}

export interface IReadonlyCoordsBuffer extends ICoordsReader {

    readonly heightMap: IReadonlyAbsHeightMap;
    readonly patchVertexBufferLength: number;
    readonly patchVertexBufferTyped: Uint16Array | Uint8Array;
    readonly patchVertexBufferData: Readonly<ArrayBuffer>;
}

export const coordsVertexSize = 2;

export class CoordsBuffer implements IReadonlyCoordsBuffer {
    
    private _width: int;
    private _depth: int;
    private _patchSize: int;
    private _data: ArrayBuffer;
    private _dataTyped: Uint16Array;
    private _length: number;

    readonly heightMap: AbsHeightMap;

    public get patchVertexBufferLength() { return this._length; }
    public get patchVertexBufferData()   { return this._data; }
    public get patchVertexBufferTyped()  { return this._dataTyped; }

    public get width()       { return this._width; }
    public get depth()       { return this._depth; }
    public get patchSize()   { return this._patchSize; }

    constructor(heightMap: AbsHeightMap, patchSize: number) {

        this.heightMap  = heightMap;
        
        this._patchSize = patchSize;
        this._width = heightMap.width;
        this._depth = heightMap.depth;
        this._length = this._patchSize * this._patchSize;

        const coordsArrLength  = this._length * coordsVertexSize;
        const coordsByteLength = coordsArrLength * Uint16Array.BYTES_PER_ELEMENT;

        this._data      = new ArrayBuffer(coordsByteLength);
        this._dataTyped = new Uint16Array(this._data, 0, coordsArrLength);
    }
    
    public init() {

        let index = 0;

        for (let z = 0; z < this._patchSize; z++) {

            for (let x = 0; x < this._patchSize; x++) {

                this._dataTyped[index++] = x;
                this._dataTyped[index++] = z;
            }
        }
    }
    
    public getPosition(index: int, buf: RefObject<IVector3>) {

        const x = index % this._width | 0;
        const z = index / this._width | 0;

        buf.x = x;
        buf.y = this.heightMap.get(x, z);
        buf.z = z;
        
        return true;
    }

    public getPositionWithHeightByFactor(index: int, buf: RefObject<IVector3>) {

        const x = index % this._width | 0;
        const z = index / this._width | 0;

        buf.x = x;
        buf.y = this.heightMap.getFactor(x, z);
        buf.z = z;
        
        return true;
    }

    public getCoords(index: number, buf: IVector3): boolean {

        const x = index % this._width | 0;
        const z = index / this._width | 0;

        buf.x = x;
        buf.z = z;
        
        return true;
    }
}

export default CoordsBuffer;