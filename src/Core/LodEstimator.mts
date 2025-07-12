import type { int } from "../Extras/Types.mjs";
import type { IPatchLodBase } from "./IPatchLod.mjs";

export function getLodId(c: int, l: int, r: int, t: int, b: int) {
            
    const lodCore = c + 1;
    const lodBinaryValue = (l << 3) | (r << 2) | (t << 1) | b;
    
    return lodCore * 16 - lodBinaryValue;
}

export function getLodInfoId(lod: IPatchLodBase) {
    return getLodId(lod.core, lod.left, lod.right, lod.top, lod.bottom);
}

export function decodeLodId(id: int): IPatchLodBase {

    const cAdjusted  = Math.floor(id / 16);
    const binaryPart = id % 16;

    const left   = (binaryPart >> 3) & 1;
    const right  = (binaryPart >> 2) & 1;
    const top    = (binaryPart >> 1) & 1;
    const bottom = binaryPart & 1;

    const core = cAdjusted - 1;

    return { core, left, right, top, bottom };
}

export default class LodEstimator {

    private _patchSize: int;
    private _numPatchesX: int;
    private _numPatchesZ: int;
    private _lodCount: int;

    public get patchSize()   { return this._patchSize; }
    public get numPatchesX() { return this._numPatchesX; }
    public get numPatchesZ() { return this._numPatchesZ; }
    public get count()       { return this._lodCount; }
    public get max()         { return this._lodCount - 1; }

    public constructor(patchSize: int, numPatchesX: int, numPatchesZ: int) {
        this.setParams(patchSize, numPatchesX, numPatchesZ);
    }

    public setParams(patchSize: int, numPatchesX: int, numPatchesZ: int) {

        this._patchSize   = patchSize;
        this._numPatchesX = numPatchesX;
        this._numPatchesZ = numPatchesZ;

        this._calcMaxLOD();
    }

    private _calcMaxLOD() {

        const numSegments          = this._patchSize - 1;
        const numSegmentsLog2      = Math.log2(numSegments);
        const numSegmentsLog2Ceil  = Math.ceil(numSegmentsLog2);
        const numSegmentsLog2Floor = Math.floor(numSegmentsLog2);

        if (numSegmentsLog2Ceil !== numSegmentsLog2Floor) {
            throw new Error("The number of vertices in the patch minus one must be a power of two\n");
        }

        this._lodCount = numSegmentsLog2Floor;
    }
}