import type { float, int } from "../Extras/Types.mjs";
import type { IReadonlyAbsHeightMap } from "./AbsHeightMap.mjs";
import type { IZone } from "./IZone.mjs";
import HeightMap, { defaultHeightVertexSize, type HeightMapArrType, type IReadonlyHeightMap } from "./HeightMap.mjs";

export const minMaxStackSize  = 2;
export const minMaxGlobalSize = 2 * minMaxStackSize;

export interface IReadonlyAbsShatteredHeightMap extends IReadonlyAbsHeightMap {

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
}

export interface IReadonlyAbsShatteredHeightMapTypped<TData extends Float32Array | Uint16Array | Uint8Array = HeightMapArrType> extends IReadonlyAbsShatteredHeightMap, IReadonlyHeightMap<TData> {

}

export abstract class AbsShatteredHeightMap<TData extends Float32Array | Uint16Array | Uint8Array = HeightMapArrType> extends HeightMap<TData> implements IReadonlyAbsShatteredHeightMapTypped<TData> {
    
    protected _patchSize: int;
    protected _numPatchesX: int;
    protected _numPatchesZ: int;
    protected _patchesSegmentSize: int;
    protected _minMaxHeightCoords: int[];

    public get patchSize()   { return this._patchSize; }
    public get numPatchesX() { return this._numPatchesX; }
    public get numPatchesZ() { return this._numPatchesZ; }

    public constructor(width: int, depth: int, patchSize: int, maxHeight: float);
    public constructor(width: int, depth: int, patchSize: int, maxHeight: float, buffer: TData, itemSize?: int, itemHeightIndexOffset?: int);
    public constructor(width: int, depth: int, patchSize: int, maxHeight: float, buffer?: TData | undefined, itemSize: int = defaultHeightVertexSize, itemHeightIndexOffset: int = 0) {
        super(width, depth, maxHeight, buffer! /** TS huck */, itemSize, itemHeightIndexOffset);
        this._setPatchSize(patchSize);
        this._clearMinMaxHeightCoords();
    }
    
    protected _setPatchSize(patchSize: int) {
        this._patchSize   = patchSize;
        this._numPatchesX = ((this.width - 1) / (this._patchSize - 1)) | 0;
        this._numPatchesZ = ((this.depth - 1) / (this._patchSize - 1)) | 0;
        this._patchesSegmentSize = this._numPatchesX * this._numPatchesZ * minMaxStackSize;
        this._minMaxHeightCoords = new Array<int>(minMaxGlobalSize + this._patchesSegmentSize * 2);
    }

    protected _clearMinMaxHeightCoords() {
        this._minMaxHeightCoords.fill(0);
    }

    public getEntriesPatchMin(x: int, z: int) {
        const patchX = x / this._patchSize | 0;
        const patchZ = z / this._patchSize | 0;
        return this.getPatchMin(patchX, patchZ);
    }

    public getEntriesPatchMax(x: int, z: int) {
        const patchX = x / this._patchSize | 0;
        const patchZ = z / this._patchSize | 0;
        return this.getPatchMax(patchX, patchZ);
    }

    public getEntriesPatchMinFactor(x: int, z: int) {
        const patchX = x / this._patchSize | 0;
        const patchZ = z / this._patchSize | 0;
        return this.getPatchMinFactor(patchX, patchZ);
    }

    public getEntriesPatchMaxFactor(x: int, z: int) {
        const patchX = x / this._patchSize | 0;
        const patchZ = z / this._patchSize | 0;
        return this.getPatchMaxFactor(patchX, patchZ);
    }

    public getMin() {
        return this.get(this._minMaxHeightCoords[0], this._minMaxHeightCoords[1]);
    }

    public getMax() {
        return this.get(this._minMaxHeightCoords[2], this._minMaxHeightCoords[3]);
    }

    public getMinFactor() {
        return this.getFactor(this._minMaxHeightCoords[0], this._minMaxHeightCoords[1]);
    }

    public getMaxFactor() {
        return this.getFactor(this._minMaxHeightCoords[2], this._minMaxHeightCoords[3]);
    }

    public getPatchMin(patchBaseX: int, patchBaseZ: int) {
        const index = minMaxGlobalSize + (patchBaseZ * this._numPatchesX + patchBaseX) * minMaxStackSize;
        return this.get(this._minMaxHeightCoords[index], this._minMaxHeightCoords[index + 1]);
    }

    public getPatchMax(patchBaseX: int, patchBaseZ: int) {
        const index = minMaxGlobalSize + (patchBaseZ * this._numPatchesX + patchBaseX) * minMaxStackSize + this._patchesSegmentSize;
        return this.get(this._minMaxHeightCoords[index], this._minMaxHeightCoords[index + 1]);
    }

    public getPatchMinFactor(patchBaseX: int, patchBaseZ: int) {
        const index = minMaxGlobalSize + (patchBaseZ * this._numPatchesX + patchBaseX) * minMaxStackSize;
        return this.getFactor(this._minMaxHeightCoords[index], this._minMaxHeightCoords[index + 1]);
    }

    public getPatchMaxFactor(patchBaseX: int, patchBaseZ: int) {
        const index = minMaxGlobalSize + (patchBaseZ * this._numPatchesX + patchBaseX) * minMaxStackSize + this._patchesSegmentSize;
        return this.getFactor(this._minMaxHeightCoords[index], this._minMaxHeightCoords[index + 1]);
    }

    public recalculateAABB() {

        this._minMaxHeightCoords[0] = 0;
        this._minMaxHeightCoords[1] = 0;
        this._minMaxHeightCoords[2] = 0;
        this._minMaxHeightCoords[3] = 0;

        let minFactor = Number.MAX_SAFE_INTEGER;
        let maxFactor = Number.MIN_SAFE_INTEGER;
        
        for (let patchZ = 0; patchZ < this._numPatchesZ; patchZ++) {

            for (let patchX = 0; patchX < this._numPatchesX; patchX++) {

                const minIndex = minMaxGlobalSize + (patchZ * this._numPatchesX + patchX) * minMaxStackSize;
                const maxIndex = minIndex + this._patchesSegmentSize;

                const patchMinFactor = this.getFactor(this._minMaxHeightCoords[minIndex], this._minMaxHeightCoords[minIndex + 1]);
                const patchMaxfactor = this.getFactor(this._minMaxHeightCoords[maxIndex], this._minMaxHeightCoords[maxIndex + 1]);

                if (minFactor > patchMinFactor) {
                    minFactor = patchMinFactor;
                    this._minMaxHeightCoords[0] = this._minMaxHeightCoords[minIndex];
                    this._minMaxHeightCoords[1] = this._minMaxHeightCoords[minIndex + 1];
                }

                if (maxFactor < patchMaxfactor) {
                    maxFactor = patchMaxfactor;
                    this._minMaxHeightCoords[2] = this._minMaxHeightCoords[maxIndex];
                    this._minMaxHeightCoords[3] = this._minMaxHeightCoords[maxIndex + 1];
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

        let globalMinF = Number.MAX_SAFE_INTEGER;
        let globalMaxF = Number.MIN_SAFE_INTEGER;

        let globalMinX = 0;
        let globalMinZ = 0;
        let globalMaxX = 0;
        let globalMaxZ = 0;

        for (let z = fixedMinZ; z < fixedMaxZ; z += this._patchSize) {
            
            for (let x = fixedMinX; x < fixedMaxX; x += this._patchSize) {
                
                const patchX   = x / this._patchSize | 0;
                const patchZ   = z / this._patchSize | 0;
                const patchI   = patchZ * this._numPatchesX + patchX;
                const minIndex = minMaxGlobalSize + patchI * minMaxStackSize;
                const maxIndex = minIndex + this._patchesSegmentSize;
                
                const firstPatchX = patchX * this._patchSize;
                const firstPatchZ = patchZ * this._patchSize;
                const lastPatchX  = firstPatchX + this._patchSize;
                const lastPatchZ  = firstPatchZ + this._patchSize;

                let minF = Number.MAX_SAFE_INTEGER;
                let maxF = Number.MIN_SAFE_INTEGER;
                let minX = firstPatchX;
                let minZ = firstPatchZ;
                let maxX = firstPatchX;
                let maxZ = firstPatchZ;

                for (let innerZ = firstPatchZ + 1; innerZ < lastPatchZ; innerZ++) {

                    for (let innerX = firstPatchX + 1; innerX < lastPatchX; innerX++) {
                        
                        const factor = this.getFactor(innerX, innerZ);

                        if (minF > factor) {
                            minF = factor;
                            minX = innerX;
                            minZ = innerZ;
                        }

                        if (maxF < factor) {
                            maxF = factor;
                            maxX = innerX;
                            maxZ = innerZ;
                        }
                    }
                }

                if (globalMinF > minF) {
                    globalMinF = minF;
                    globalMinX = minX;
                    globalMinZ = minZ;
                }

                if (globalMaxF < maxF) {
                    globalMaxF = maxF;
                    globalMaxX = maxX;
                    globalMaxZ = maxZ;
                }

                this._minMaxHeightCoords[minIndex]     = minX;
                this._minMaxHeightCoords[minIndex + 1] = minZ;
                this._minMaxHeightCoords[maxIndex]     = maxX;
                this._minMaxHeightCoords[maxIndex + 1] = maxZ;
            }
        }

        if (this.getMinFactor() > globalMinF) {
            this._minMaxHeightCoords[0] = globalMinX;
            this._minMaxHeightCoords[1] = globalMinZ;
        }

        if (this.getMaxFactor() < globalMaxF) {
            this._minMaxHeightCoords[2] = globalMaxX;
            this._minMaxHeightCoords[3] = globalMaxZ;
        }
    }
}