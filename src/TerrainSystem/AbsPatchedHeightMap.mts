import type { float, int } from "../Shared/Types.mjs";
import type { IZone } from "./IZone.mjs";
import type { IReadonlyAbsHeightMap } from "./AbsHeightMap.mjs";
import HeightMap, { HeightMapArrType, defaultHeightVertexSize, IReadonlyHeightMap } from "./HeightMap.mjs";

export interface IReadonlyAbsPatchedHeightMap extends IReadonlyAbsHeightMap {

    readonly dataChunkSize: int;
    readonly dataNumChunksX: int;
    readonly dataNumChunksZ: int;
    readonly dataChunkSizeFactor: float;
    readonly patchSize: int;
    readonly numPatchesX: int;
    readonly numPatchesZ: int;

    getMin(): float;
    getMax(): float;
    getMinFactor(): float;
    getMaxFactor(): float;
    getEntriesPatchMin(x: float, z: float): float;
    getEntriesPatchMax(x: float, z: float): float;
    getEntriesPatchMinFactor(x: float, z: float): float;
    getEntriesPatchMaxFactor(x: float, z: float): float;
    getPatchMin(patchBaseX: int, patchBaseZ: int): float;
    getPatchMax(patchBaseX: int, patchBaseZ: int): float;
    getPatchMinFactor(patchBaseX: int, patchBaseZ: int): float;
    getPatchMaxFactor(patchBaseX: int, patchBaseZ: int): float;

    getChunkIndex(chunkX: int, chunkZ: int): int;
    getChunkBuffer(type: Float32ArrayConstructor, chunkX: int, chunkZ: int): Float32Array;
    getChunkBuffer(type: Uint16ArrayConstructor, chunkX: int, chunkZ: int): Uint16Array;
    getChunkBuffer(type: Uint8ArrayConstructor, chunkX: int, chunkZ: int): Uint8Array;
    getChunksBuffers(type: Float32ArrayConstructor): Float32Array[];
    getChunksBuffers(type: Uint16ArrayConstructor): Uint16Array[];
    getChunksBuffers(type: Uint8ArrayConstructor): Uint8Array[];
}

export interface IReadonlyAbsPatchedHeightMapTypped<TData extends Float32Array | Uint16Array | Uint8Array = HeightMapArrType> extends IReadonlyAbsPatchedHeightMap, IReadonlyHeightMap<TData> {

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

export abstract class AbsPatchedHeightMap<TData extends Float32Array | Uint16Array | Uint8Array = HeightMapArrType> extends HeightMap<TData> implements IReadonlyAbsPatchedHeightMapTypped<TData> {

    protected _patchSize: int;
    protected _numPatchesX: int;
    protected _numPatchesZ: int;
    protected _patchesSegmentSize: int;
    protected _minMaxHeightCoords: int[];
    protected _minHeightCoord: int[];
    protected _maxHeightCoord: int[];
    protected _dataChunkSize: int;
    protected _dataNumChunksX: int;
    protected _dataNumChunksZ: int;
    protected _dataChunkSizeFactor: float;

    public get patchSize()           { return this._patchSize; }
    public get numPatchesX()         { return this._numPatchesX; }
    public get numPatchesZ()         { return this._numPatchesZ; }
    public get dataChunkSize()       { return this._dataChunkSize; }
    public get dataNumChunksX()      { return this._dataNumChunksX; }
    public get dataNumChunksZ()      { return this._dataNumChunksZ; }
    public get dataChunkSizeFactor() { return this._dataChunkSizeFactor; }

    public constructor(width: int, depth: int, patchSize: int, dataChunkSize: int, minHeight: float, maxHeight: float);
    public constructor(width: int, depth: int, patchSize: int, dataChunkSize: int, minHeight: float, maxHeight: float, buffer: TData, itemSize?: int, itemHeightIndexOffset?: int);
    public constructor(width: int, depth: int, patchSize: int, dataChunkSize: int, minHeight: float, maxHeight: float, buffer?: TData | undefined, itemSize: int = defaultHeightVertexSize, itemHeightIndexOffset: int = 0) {
        super(width, depth, minHeight, maxHeight, buffer! /** TS huck */, itemSize, itemHeightIndexOffset);
        this._minHeightCoord = [0, 0];
        this._maxHeightCoord = [0, 0];
        this._setPatchSize(patchSize);
        this._setDataChunkSize(dataChunkSize);
        this._clearMinMaxHeightCoords();
    }

    protected _setPatchSize(patchSize: int) {
        this._patchSize   = patchSize;
        this._numPatchesX = ((this.width - 1) / (this._patchSize - 1)) | 0;
        this._numPatchesZ = ((this.depth - 1) / (this._patchSize - 1)) | 0;
        this._patchesSegmentSize = this._numPatchesX * this._numPatchesZ * minMaxStackSize;
        this._minMaxHeightCoords = new Array<int>(this._patchesSegmentSize * 2);
    }

    protected _setDataChunkSize(value: int) {
        this._dataChunkSize  = getOrThrowDataChunkSize(this._patchSize, value);
        this._dataNumChunksX = ((this.width - 1) / (this._dataChunkSize - 1)) | 0;
        this._dataNumChunksZ = ((this.depth - 1) / (this._dataChunkSize - 1)) | 0;
        this._dataChunkSizeFactor = this._patchSize / (this._dataChunkSize + this._patchSize - (this._dataChunkSize % this._patchSize));
    }
    
    public override getIndex(x: int, z: int): int {

        const localX = x % this._dataChunkSize;
        const localZ = z % this._dataChunkSize;
        const chunkX = Math.ceil(x / this._dataChunkSize) - (localX > 0 ? 1 : 0);
        const chunkZ = Math.ceil(z / this._dataChunkSize) - (localZ > 0 ? 1 : 0);

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
        return new type(this.data.buffer, chunkOffset, count);
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

    public getEntriesPatchMin(x: int, z: int) {
        const patchX = Math.ceil(x / this._patchSize) - (x % this._patchSize > 0 ? 1 : 0);
        const patchZ = Math.ceil(z / this._patchSize) - (z % this._patchSize > 0 ? 1 : 0);
        return this.getPatchMin(patchX, patchZ);
    }

    public getEntriesPatchMax(x: int, z: int) {
        const patchX = Math.ceil(x / this._patchSize) - (x % this._patchSize > 0 ? 1 : 0);
        const patchZ = Math.ceil(z / this._patchSize) - (z % this._patchSize > 0 ? 1 : 0);
        return this.getPatchMax(patchX, patchZ);
    }

    public getEntriesPatchMinFactor(x: int, z: int) {
        const patchX = Math.ceil(x / this._patchSize) - (x % this._patchSize > 0 ? 1 : 0);
        const patchZ = Math.ceil(z / this._patchSize) - (z % this._patchSize > 0 ? 1 : 0);
        return this.getPatchMinFactor(patchX, patchZ);
    }

    public getEntriesPatchMaxFactor(x: int, z: int) {
        const patchX = Math.ceil(x / this._patchSize) - (x % this._patchSize > 0 ? 1 : 0);
        const patchZ = Math.ceil(z / this._patchSize) - (z % this._patchSize > 0 ? 1 : 0);
        return this.getPatchMaxFactor(patchX, patchZ);
    }

    public getMin() {
        return this.get(this._minHeightCoord[0], this._minHeightCoord[1]);
    }

    public getMax() {
        return this.get(this._maxHeightCoord[0], this._maxHeightCoord[1]);
    }

    public getMinFactor() {
        return this.getFactor(this._minHeightCoord[0], this._minHeightCoord[1]);
    }

    public getMaxFactor() {
        return this.getFactor(this._maxHeightCoord[0], this._maxHeightCoord[1]);
    }

    public getPatchMin(patchBaseX: int, patchBaseZ: int) {
        const index = (patchBaseZ * this._numPatchesX + patchBaseX) * minMaxStackSize;
        return this.get(this._minMaxHeightCoords[index], this._minMaxHeightCoords[index + 1]);
    }

    public getPatchMax(patchBaseX: int, patchBaseZ: int) {
        const index = (patchBaseZ * this._numPatchesX + patchBaseX) * minMaxStackSize + this._patchesSegmentSize;
        return this.get(this._minMaxHeightCoords[index], this._minMaxHeightCoords[index + 1]);
    }

    public getPatchMinFactor(patchBaseX: int, patchBaseZ: int) {
        const index = (patchBaseZ * this._numPatchesX + patchBaseX) * minMaxStackSize;
        return this.getFactor(this._minMaxHeightCoords[index], this._minMaxHeightCoords[index + 1]);
    }

    public getPatchMaxFactor(patchBaseX: int, patchBaseZ: int) {
        const index = (patchBaseZ * this._numPatchesX + patchBaseX) * minMaxStackSize + this._patchesSegmentSize;
        return this.getFactor(this._minMaxHeightCoords[index], this._minMaxHeightCoords[index + 1]);
    }

    protected _clearMinMaxHeightCoords() {

        this._minHeightCoord[0] = 0;
        this._minHeightCoord[1] = 0;
        this._maxHeightCoord[0] = 0;
        this._maxHeightCoord[1] = 0;

        for (let i = 0; i < this._minMaxHeightCoords.length; i++) {
            this._minMaxHeightCoords[i] = 0;
        }
    }

    public recalculateAABB() {

        this._minHeightCoord[0] = 0;
        this._minHeightCoord[1] = 0;
        this._maxHeightCoord[0] = 0;
        this._maxHeightCoord[1] = 0;

        let minFactor = 1;
        let maxFactor = 0;

        for (let patchZ = 0; patchZ < this._numPatchesZ; patchZ++) {

            for (let patchX = 0; patchX < this._numPatchesX; patchX++) {

                const minIndex = (patchZ * this._numPatchesX + patchX) * minMaxStackSize;
                const maxIndex = minIndex + this._patchesSegmentSize;

                const patchMinFactor = this.getFactor(this._minMaxHeightCoords[minIndex], this._minMaxHeightCoords[minIndex + 1]);
                const patchMaxfactor = this.getFactor(this._minMaxHeightCoords[maxIndex], this._minMaxHeightCoords[maxIndex + 1]);

                if (minFactor > patchMinFactor) {
                    minFactor = patchMinFactor;
                    this._minHeightCoord[0] = this._minMaxHeightCoords[minIndex];
                    this._minHeightCoord[1] = this._minMaxHeightCoords[minIndex + 1];
                }

                if (maxFactor < patchMaxfactor) {
                    maxFactor = patchMaxfactor;
                    this._maxHeightCoord[0] = this._minMaxHeightCoords[maxIndex];
                    this._maxHeightCoord[1] = this._minMaxHeightCoords[maxIndex + 1];
                }
            }
        }
    }

    public recalculateMinMax(zone: IZone): void {
        
        if (zone.maxX < 0) return;
        if (zone.maxZ < 0) return;

        const fixedMinX = Math.max(zone.minX, 0);
        const fixedMinZ = Math.max(zone.minZ, 0);
        const fixedMaxX = Math.min(zone.maxX, this.width);
        const fixedMaxZ = Math.min(zone.maxZ, this.depth);

        for (let z = fixedMinZ; z < fixedMaxZ; z += this._patchSize) {

            for (let x = fixedMinX; x < fixedMaxX; x += this._patchSize) {
                
                const patchX   = Math.ceil(x / this._patchSize) - (x % this._patchSize > 0 ? 1 : 0);
                const patchZ   = Math.ceil(z / this._patchSize) - (z % this._patchSize > 0 ? 1 : 0);
                const patchI   = patchZ * this._numPatchesX + patchX;
                const minIndex = patchI * minMaxStackSize;
                const maxIndex = minIndex + this._patchesSegmentSize;
                
                const firstPatchX = patchX * this._patchSize;
                const firstPatchZ = patchZ * this._patchSize;
                const lastPatchX  = firstPatchX + this._patchSize;
                const lastPatchZ  = firstPatchZ + this._patchSize;

                let min = Number.MAX_SAFE_INTEGER;
                let max = Number.MIN_SAFE_INTEGER;
                let minX = firstPatchX;
                let minZ = firstPatchZ;
                let maxX = firstPatchX;
                let maxZ = firstPatchZ;

                for (let innerZ = firstPatchZ + 1; innerZ < lastPatchZ; innerZ++) {

                    for (let innerX = firstPatchX + 1; innerX < lastPatchX; innerX++) {
                        
                        const factor = this.getFactor(innerX, innerZ);

                        if (min > factor) {
                            min = factor;
                            minX = innerX;
                            minZ = innerZ;
                        }

                        if (max < factor) {
                            max = factor;
                            maxX = innerX;
                            maxZ = innerZ;
                        }
                    }
                }

                this._minMaxHeightCoords[minIndex]     = minX;
                this._minMaxHeightCoords[minIndex + 1] = minZ;
                this._minMaxHeightCoords[maxIndex]     = maxX;
                this._minMaxHeightCoords[maxIndex + 1] = maxZ;
            }
        }
    }
}

export default AbsPatchedHeightMap;