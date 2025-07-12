import type { float, int } from "../Extras/Types.mjs";
import { HeightMapArrType, defaultHeightVertexSize, type IReadonlyHeightMap } from "./HeightMap.mjs";
import { AbsShatteredHeightMap, type IReadonlyAbsShatteredHeightMap } from "./AbsShatteredHeightMap.mjs";

export interface IReadonlyAbsChunkedHeightMap extends IReadonlyAbsShatteredHeightMap {

    readonly dataChunkSize: int;
    readonly dataNumChunksX: int;
    readonly dataNumChunksZ: int;
    readonly dataChunkSizeFactor: float;

    getChunkIndex(chunkX: int, chunkZ: int): int;
    getChunkBuffer(type: Float32ArrayConstructor, chunkX: int, chunkZ: int): Float32Array;
    getChunkBuffer(type: Uint16ArrayConstructor, chunkX: int, chunkZ: int): Uint16Array;
    getChunkBuffer(type: Uint8ArrayConstructor, chunkX: int, chunkZ: int): Uint8Array;
    getChunksBuffers(type: Float32ArrayConstructor): Float32Array[];
    getChunksBuffers(type: Uint16ArrayConstructor): Uint16Array[];
    getChunksBuffers(type: Uint8ArrayConstructor): Uint8Array[];

    getChunkBuffer<T extends Float32ArrayConstructor | Uint16ArrayConstructor | Uint8ArrayConstructor>(type: T, chunkX: int, chunkZ: int): any;
    getChunksBuffers<T extends Float32ArrayConstructor | Uint16ArrayConstructor | Uint8ArrayConstructor>(type: T): any;
}

export interface IReadonlyAbsChunkedHeightMapTypped<TData extends Float32Array | Uint16Array | Uint8Array = HeightMapArrType> extends IReadonlyAbsChunkedHeightMap, IReadonlyHeightMap<TData> {
}

export const minMaxStackSize = 2;

export function getOrThrowDataChunkSize(patchSize: int, dataChunkSize: int) {

    if ((dataChunkSize - 1) % (patchSize - 1) !== 0) {
        const recommendedWidth = ((dataChunkSize - 1 + patchSize - 1) / (dataChunkSize - 1)) * (patchSize - 1) + 1;
        console.error("DataChunkSize minus 1 (%d) must be divisible by patchSize minus 1 (%d)\n", dataChunkSize, patchSize);
        console.error("Try using DataChunkSize = %d\n", recommendedWidth);
        throw new Error();
    }

    return dataChunkSize;
}

export abstract class AbsChunkedHeightMap<TData extends Float32Array | Uint16Array | Uint8Array = HeightMapArrType> extends AbsShatteredHeightMap<TData> implements IReadonlyAbsChunkedHeightMapTypped<TData> {

    protected _patchesSegmentSize: int;
    protected _minMaxHeightCoords: int[];
    protected _minHeightCoord: int[];
    protected _maxHeightCoord: int[];
    protected _dataChunkSize: int;
    protected _dataNumChunksX: int;
    protected _dataNumChunksZ: int;
    protected _dataChunkSizeFactor: float;

    public get dataChunkSize()       { return this._dataChunkSize; }
    public get dataNumChunksX()      { return this._dataNumChunksX; }
    public get dataNumChunksZ()      { return this._dataNumChunksZ; }
    public get dataChunkSizeFactor() { return this._dataChunkSizeFactor; }

    public constructor(width: int, depth: int, patchSize: int, dataChunkSize: int, maxHeight: float);
    public constructor(width: int, depth: int, patchSize: int, dataChunkSize: int, maxHeight: float, buffer: TData, itemSize?: int, itemHeightIndexOffset?: int);
    public constructor(width: int, depth: int, patchSize: int, dataChunkSize: int, maxHeight: float, buffer?: TData | undefined, itemSize: int = defaultHeightVertexSize, itemHeightIndexOffset: int = 0) {
        super(width, depth, patchSize, maxHeight, buffer! /** TS huck */, itemSize, itemHeightIndexOffset);
        this._setDataChunkSize(dataChunkSize);
    }

    protected _setDataChunkSize(value: int) {
        this._dataChunkSize  = getOrThrowDataChunkSize(this._patchSize, value);
        this._dataNumChunksX = ((this.width - 1) / (this._dataChunkSize - 1)) | 0;
        this._dataNumChunksZ = ((this.depth - 1) / (this._dataChunkSize - 1)) | 0;
        this._dataChunkSizeFactor = this._patchSize === this._dataChunkSize
            ? 1.0
            : this._patchSize / (this._dataChunkSize + this._patchSize - (this._dataChunkSize % this._patchSize));
    }
    
    public override getIndex(x: int, z: int): int {

        const localX = x % this._dataChunkSize;
        const localZ = z % this._dataChunkSize;
        const chunkX = x / this._dataChunkSize | 0;
        const chunkZ = z / this._dataChunkSize | 0;

        const chunkOffset = (chunkZ * this._dataNumChunksX + chunkX) * (this._dataChunkSize ** 2);
        const localIndex  = (localZ * this._dataChunkSize + localX);

        return chunkOffset + localIndex;
    }
    
    public getChunkIndex(chunkX: int, chunkZ: int): int {
        return chunkZ * this._dataNumChunksX + chunkX;
    }

    public getChunkBuffer(type: Float32ArrayConstructor, chunkX: int, chunkZ: int): Float32Array;
    public getChunkBuffer(type: Uint16ArrayConstructor, chunkX: int, chunkZ: int): Uint16Array;
    public getChunkBuffer(type: Uint8ArrayConstructor, chunkX: int, chunkZ: int): Uint8Array;
    public getChunkBuffer(type: any, chunkX: int, chunkZ: int) {
        const size        = this.dataChunkSize ** 2;
        const chunkLevel  = chunkZ * this.dataNumChunksX + chunkX;
        const chunkOffset = chunkLevel * size * this.data.BYTES_PER_ELEMENT;
        const count       = size * (this.data.BYTES_PER_ELEMENT / type.BYTES_PER_ELEMENT);
        return new type(this.data.buffer, this.data.byteOffset + chunkOffset, count);
    }

    public getChunksBuffers(type: Float32ArrayConstructor): Float32Array[];
    public getChunksBuffers(type: Uint16ArrayConstructor): Uint16Array[];
    public getChunksBuffers(type: Uint8ArrayConstructor): Uint8Array[];
    public getChunksBuffers(type: any) {

        const result = new Array(this._dataNumChunksX * this._dataNumChunksZ);

        for (let chunkZ = 0; chunkZ < this._dataNumChunksZ; chunkZ++) {

            for (let chunkX = 0; chunkX < this._dataNumChunksX; chunkX++) {
                
                const index = chunkZ * this._dataNumChunksX + chunkX;
                result[index] = this.getChunkBuffer(type, chunkX, chunkZ);
            }
        }
        
        return result;
    }
}

export default AbsChunkedHeightMap;