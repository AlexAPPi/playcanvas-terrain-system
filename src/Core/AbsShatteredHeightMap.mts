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
    getPerformPatchMin(patchBaseX: int, patchBaseZ: int): float;
    getPerformPatchMax(patchBaseX: int, patchBaseZ: int): float;
}

export interface IReadonlyAbsShatteredHeightMapTypped<TData extends Float32Array | Uint16Array | Uint8Array = HeightMapArrType> extends IReadonlyAbsShatteredHeightMap, IReadonlyHeightMap<TData> {

}

export abstract class AbsShatteredHeightMap<TData extends Float32Array | Uint16Array | Uint8Array = HeightMapArrType> extends HeightMap<TData> implements IReadonlyAbsShatteredHeightMapTypped<TData> {
    
    protected _patchSize: int;
    protected _numPatchesX: int;
    protected _numPatchesZ: int;
    protected _patchesSegmentSize: int;
    protected _minMaxPatchesCoords: int[];

    protected _performMinPatchesValue: float[];
    protected _performMaxPatchesValue: float[];

    public get patchSize()   { return this._patchSize; }
    public get numPatchesX() { return this._numPatchesX; }
    public get numPatchesZ() { return this._numPatchesZ; }

    public constructor(width: int, depth: int, patchSize: int, maxHeight: float);
    public constructor(width: int, depth: int, patchSize: int, maxHeight: float, buffer: TData, itemSize?: int, itemHeightIndexOffset?: int);
    public constructor(width: int, depth: int, patchSize: int, maxHeight: float, buffer?: TData | undefined, itemSize: int = defaultHeightVertexSize, itemHeightIndexOffset: int = 0) {
        super(width, depth, maxHeight, buffer! /** TS huck */, itemSize, itemHeightIndexOffset);
        this._setPatchSize(patchSize);
        this._clearMinMax();
    }
    
    protected _setPatchSize(patchSize: int) {

        // We can use shared buffer for calculation in multi threads
        this._patchSize   = patchSize;
        this._numPatchesX = ((this.width - 1) / (this._patchSize - 1)) | 0;
        this._numPatchesZ = ((this.depth - 1) / (this._patchSize - 1)) | 0;
        this._patchesSegmentSize = this._numPatchesX * this._numPatchesZ * minMaxStackSize;
        this._minMaxPatchesCoords = new Array<int>(minMaxGlobalSize + this._patchesSegmentSize * 2);

        // Alloc memory for performance values
        this._performMinPatchesValue = new Array<float>(this._numPatchesX * this._numPatchesZ);
        this._performMaxPatchesValue = new Array<float>(this._numPatchesX * this._numPatchesZ);
    }

    protected _clearMinMax() {
        this._minMaxPatchesCoords.fill(0);
        this._performMinPatchesValue.fill(0);
        this._performMaxPatchesValue.fill(0);
    }

    protected _recalculatePerformanceValuesByMaxHeight(oldMaxHeight: float, newMaxHeight: float) {

        const factor = oldMaxHeight / newMaxHeight;
        const count  = this._performMinPatchesValue.length;

        for (let i = 0; i < count; i++) {
            this._performMinPatchesValue[i] *= factor;
            this._performMaxPatchesValue[i] *= factor;
        }
    }

    public override setMaxHeight(maxHeight: float): void {
        const oldMaxHeight = this.maxHeight;
        super.setMaxHeight(maxHeight);
        this._recalculatePerformanceValuesByMaxHeight(oldMaxHeight, maxHeight);
    }

    public getPerformPatchMin(patchBaseX: int, patchBaseZ: int): float {
        return this._performMinPatchesValue[patchBaseZ * this._numPatchesX + patchBaseX];
    }

    public getPerformPatchMax(patchBaseX: int, patchBaseZ: int): float {
        return this._performMaxPatchesValue[patchBaseZ * this._numPatchesX + patchBaseX];
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
        return this.get(this._minMaxPatchesCoords[0], this._minMaxPatchesCoords[1]);
    }

    public getMax() {
        return this.get(this._minMaxPatchesCoords[2], this._minMaxPatchesCoords[3]);
    }

    public getMinFactor() {
        return this.getFactor(this._minMaxPatchesCoords[0], this._minMaxPatchesCoords[1]);
    }

    public getMaxFactor() {
        return this.getFactor(this._minMaxPatchesCoords[2], this._minMaxPatchesCoords[3]);
    }

    public getPatchMin(patchBaseX: int, patchBaseZ: int) {
        const index = minMaxGlobalSize + (patchBaseZ * this._numPatchesX + patchBaseX) * minMaxStackSize;
        return this.get(this._minMaxPatchesCoords[index], this._minMaxPatchesCoords[index + 1]);
    }

    public getPatchMax(patchBaseX: int, patchBaseZ: int) {
        const index = minMaxGlobalSize + (patchBaseZ * this._numPatchesX + patchBaseX) * minMaxStackSize + this._patchesSegmentSize;
        return this.get(this._minMaxPatchesCoords[index], this._minMaxPatchesCoords[index + 1]);
    }

    public getPatchMinFactor(patchBaseX: int, patchBaseZ: int) {
        const index = minMaxGlobalSize + (patchBaseZ * this._numPatchesX + patchBaseX) * minMaxStackSize;
        return this.getFactor(this._minMaxPatchesCoords[index], this._minMaxPatchesCoords[index + 1]);
    }

    public getPatchMaxFactor(patchBaseX: int, patchBaseZ: int) {
        const index = minMaxGlobalSize + (patchBaseZ * this._numPatchesX + patchBaseX) * minMaxStackSize + this._patchesSegmentSize;
        return this.getFactor(this._minMaxPatchesCoords[index], this._minMaxPatchesCoords[index + 1]);
    }

    public recalculateAABB() {

        this._minMaxPatchesCoords[0] = 0;
        this._minMaxPatchesCoords[1] = 0;
        this._minMaxPatchesCoords[2] = 0;
        this._minMaxPatchesCoords[3] = 0;

        let minValue = Number.MAX_SAFE_INTEGER;
        let maxValue = Number.MIN_SAFE_INTEGER;
        
        for (let patchZ = 0; patchZ < this._numPatchesZ; patchZ++) {

            for (let patchX = 0; patchX < this._numPatchesX; patchX++) {

                const patchIdx = patchZ * this._numPatchesX + patchX;
                const minIndex = minMaxGlobalSize + patchIdx * minMaxStackSize;
                const maxIndex = minIndex + this._patchesSegmentSize;

                const patchMinValue = this.get(this._minMaxPatchesCoords[minIndex], this._minMaxPatchesCoords[minIndex + 1]);
                const patchMaxValue = this.get(this._minMaxPatchesCoords[maxIndex], this._minMaxPatchesCoords[maxIndex + 1]);

                // update performace values
                this._performMinPatchesValue[patchIdx] = patchMinValue;
                this._performMaxPatchesValue[patchIdx] = patchMaxValue;

                if (minValue > patchMinValue) {
                    minValue = patchMinValue;
                    this._minMaxPatchesCoords[0] = this._minMaxPatchesCoords[minIndex];
                    this._minMaxPatchesCoords[1] = this._minMaxPatchesCoords[minIndex + 1];
                }

                if (maxValue < patchMaxValue) {
                    maxValue = patchMaxValue;
                    this._minMaxPatchesCoords[2] = this._minMaxPatchesCoords[maxIndex];
                    this._minMaxPatchesCoords[3] = this._minMaxPatchesCoords[maxIndex + 1];
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

        let globalMinV = Number.MAX_SAFE_INTEGER;
        let globalMaxV = Number.MIN_SAFE_INTEGER;

        let globalMinX = 0;
        let globalMinZ = 0;
        let globalMaxX = 0;
        let globalMaxZ = 0;

        for (let z = fixedMinZ; z < fixedMaxZ; z += this._patchSize) {
            
            for (let x = fixedMinX; x < fixedMaxX; x += this._patchSize) {
                
                const patchX = x / this._patchSize | 0;
                const patchZ = z / this._patchSize | 0;
                const patchI = patchZ * this._numPatchesX + patchX;
                const minIdx = minMaxGlobalSize + patchI * minMaxStackSize;
                const maxIdx = minIdx + this._patchesSegmentSize;
                
                const firstPatchX = patchX * (this._patchSize - 1);
                const firstPatchZ = patchZ * (this._patchSize - 1);
                const lastPatchX  = firstPatchX + this._patchSize;
                const lastPatchZ  = firstPatchZ + this._patchSize;

                let minV = Number.MAX_SAFE_INTEGER;
                let maxV = Number.MIN_SAFE_INTEGER;
                let minX = firstPatchX;
                let minZ = firstPatchZ;
                let maxX = firstPatchX;
                let maxZ = firstPatchZ;

                for (let innerZ = firstPatchZ; innerZ < lastPatchZ; innerZ++) {

                    for (let innerX = firstPatchX; innerX < lastPatchX; innerX++) {
                        
                        const value = this.get(innerX, innerZ);

                        if (minV > value) {
                            minV = value;
                            minX = innerX;
                            minZ = innerZ;
                        }

                        if (maxV < value) {
                            maxV = value;
                            maxX = innerX;
                            maxZ = innerZ;
                        }
                    }
                }

                if (globalMinV > minV) {
                    globalMinV = minV;
                    globalMinX = minX;
                    globalMinZ = minZ;
                }

                if (globalMaxV < maxV) {
                    globalMaxV = maxV;
                    globalMaxX = maxX;
                    globalMaxZ = maxZ;
                }

                this._minMaxPatchesCoords[minIdx]     = minX;
                this._minMaxPatchesCoords[minIdx + 1] = minZ;
                this._minMaxPatchesCoords[maxIdx]     = maxX;
                this._minMaxPatchesCoords[maxIdx + 1] = maxZ;

                // Update performance values
                this._performMinPatchesValue[patchI] = minV;
                this._performMaxPatchesValue[patchI] = maxV;
            }
        }

        if (this.getMin() > globalMinV) {
            this._minMaxPatchesCoords[0] = globalMinX;
            this._minMaxPatchesCoords[1] = globalMinZ;
        }

        if (this.getMax() < globalMaxV) {
            this._minMaxPatchesCoords[2] = globalMaxX;
            this._minMaxPatchesCoords[3] = globalMaxZ;
        }
    }
}