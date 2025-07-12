import type { int, RefObject, unsigned_int } from "../Extras/Types.mjs";
import { BOTTOM, LEFT, LodInfo, RIGHT, TOP, type IReadonlyLodInfo } from "./LodInfo.mjs";
import LodEstimator from "./LodEstimator.mjs";

export interface IGrid {
    readonly width: int;
    readonly depth: int;
}

export interface IGridPatched extends IGrid {
    readonly patchSize: int;
}

export interface IGridPatchedInfo extends IGridPatched {
    readonly numPatchesX: int;
    readonly numPatchesZ: int;
}

export interface IGridPatchedLod extends IGridPatchedInfo {
    readonly lodEstimator: LodEstimator;
    readonly lodInfo: IReadonlyLodInfo[];
}

export class GridBuilder implements IGridPatchedLod {

    private _lodInfo: LodInfo[];
    private _lodEstimator: LodEstimator;
    private _indices: Uint32Array;
    private _width: number;
    private _depth: number;
    private _patchSize: number;
    private _numPatchesX: number;
    private _numPatchesZ: number;

    public get width() { return this._width; }
    public get depth() { return this._depth; }
    public get patchSize() { return this._patchSize; }
    public get numPatchesX() { return this._numPatchesX; }
    public get numPatchesZ() { return this._numPatchesZ; }
    public get maxLOD() { return this.lodEstimator.max; }
    public get lodCount() { return this.lodEstimator.count; }

    public get patchIndices(): Readonly<Uint32Array> { return this._indices as any; }
    public get lodEstimator() { return this._lodEstimator; }
    public get lodInfo(): IReadonlyLodInfo[] { return this._lodInfo; }

    constructor(grid: RefObject<IGridPatched>) {

        this._width       = grid.width;
        this._depth       = grid.depth;
        this._patchSize   = grid.patchSize;
        this._numPatchesX = ((this._width - 1) / (this._patchSize - 1)) | 0;
        this._numPatchesZ = ((this._depth - 1) / (this._patchSize - 1)) | 0;

        if (this._width >= 0xffff) {
            console.error("Max width = %d\n", 0xffff -1);
            throw new Error();
        }

        if (this._depth >= 0xffff) {
            console.error("Max depth = %d\n", 0xffff -1);
            throw new Error();
        }

        if ((this._width - 1) % (this._patchSize - 1) !== 0) {
            const recommendedWidth = ((this._width - 1 + this._patchSize - 1) / (this._patchSize - 1)) * (this._patchSize - 1) + 1;
            console.error("Width minus 1 (%d) must be divisible by patchSize minus 1 (%d)\n", this._width, this._patchSize);
            console.error("Try using Width = %d\n", recommendedWidth);
            throw new Error();
        }

        if ((this._depth - 1) % (this._patchSize - 1) !== 0) {
            const recommendedDepth = ((this._depth - 1 + this._patchSize - 1) / (this._patchSize - 1)) * (this._patchSize - 1) + 1;
            console.error("Depth minus 1 (%d) must be divisible by patchSize minus 1 (%d)\n", this._depth, this._patchSize);
            console.error("Try using Width = %d\n", recommendedDepth);
            throw new Error();
        }

        if (this._patchSize < 3) {
            console.error("The minimum patch size is 3 (%d)\n", this._patchSize);
            throw new Error();
        }
    
        if (this._patchSize % 2 === 0) {
            console.error("Patch size must be an odd number (%d)\n", this._patchSize);
            throw new Error();
        }

        this._buildLodsAndIndices();
    }

    private _buildLodsAndIndices() {

        this._lodEstimator = new LodEstimator(this._patchSize, this._numPatchesX, this._numPatchesZ);
        this._lodInfo = new Array(this._lodEstimator.count);

        for (let i = 0; i < this._lodInfo.length; i++) {
            this._lodInfo[i] = new LodInfo();
        }

        let numIndices = this._calcNumIndices();

        this._indices = new Uint32Array(numIndices);

        numIndices = this._initIndices(this._indices);
        //console.log("Final number of indices %d\n", numIndices);
    }
    
    private _calcNumIndices(): int {
        
        let numQuads = (this.patchSize - 1) ** 2;
        let numIndices = 0;

        const maxPermutationsPerLevel = 16; // true/false for each of the four sides
        const indicesPerQuad = 6;           // two triangles

        for (let lod = 0; lod < this.lodCount; lod++) {
            //console.log("LOD %d: num quads %d\n", lod, numQuads);
            numIndices += numQuads * indicesPerQuad * maxPermutationsPerLevel;
            numQuads /= 4;
        }

        //console.log("Initial number of indices %d\n", numIndices);
        return numIndices;
    }

    private _initIndices(indices: Uint32Array): int {

        let index = 0;

        for (let lod = 0; lod < this.lodCount; lod++) {
            //console.log("*** Init indices lod %d ***\n", lod);
            index = this._initIndicesLOD(index, indices, lod);
        }

        return index;
    }

    private _initIndicesLOD(index: int, indices: Uint32Array, lod: int): int {

        let totalIndicesForLOD = 0;
    
        for (let l = 0; l < LEFT; l++) {
            for (let r = 0; r < RIGHT; r++) {
                for (let t = 0; t < TOP; t++) {
                    for (let b = 0; b < BOTTOM; b++) {

                        const info  = this._lodInfo[lod].info[l][r][t][b];
                        const start = index;
                        
                        index = this._initIndicesLODSingle(index, indices, lod, lod + l, lod + r, lod + t, lod + b);
    
                        info.start = start;
                        info.count = index - start;

                        totalIndicesForLOD += info.count;
                    }
                }
            }
        }
    
        //console.log("Total indices for LOD: %d\n", totalIndicesForLOD);
        return index;
    }

    private _initIndicesLODSingle(index: int, indices: Uint32Array, lodCore: int, lodLeft: int, lodRight: int, lodTop: int, lodBottom: int): int {

        const width   = this.patchSize;
        const fanStep = Math.pow(2, lodCore + 1);      // lod = 0 --> 2, lod = 1 --> 4, lod = 2 --> 8, etc
        const endPos  = this.patchSize - 1 - fanStep;  // patch size 5, fan step 2 --> EndPos = 2; patch size 9, fan step 2 --> EndPos = 6

        for (let z = 0 ; z <= endPos; z += fanStep) {
            for (let x = 0 ; x <= endPos; x += fanStep) {
                const lLeft   = x == 0      ? lodLeft   : lodCore;
                const lRight  = x == endPos ? lodRight  : lodCore;
                const lBottom = z == 0      ? lodBottom : lodCore;
                const lTop    = z == endPos ? lodTop    : lodCore;
                index = this._createTriangleFan(index, indices, lodCore, lLeft, lRight, lTop, lBottom, x, z, width);
            }
        }
        
        return index;
    }

    private _createTriangleFan(index: int, indices: Uint32Array, lodCore: int, lodLeft: int, lodRight: int, lodTop: int, lodBottom: int, x: int, z: int, width: int): unsigned_int {

        const stepLeft   = Math.pow(2, lodLeft); // because LOD starts at zero...
        const stepRight  = Math.pow(2, lodRight);
        const stepTop    = Math.pow(2, lodTop);
        const stepBottom = Math.pow(2, lodBottom);
        const stepCenter = Math.pow(2, lodCore);

        const indexCenter = (z + stepCenter) * width + x + stepCenter;

        // first up
        let indexTemp1 = z * width + x;
        let indexTemp2 = (z + stepLeft) * width + x;

        index = this._addTriangle(index, indices, indexCenter, indexTemp1, indexTemp2);

        // second up
        if (lodLeft == lodCore) {
            indexTemp1 = indexTemp2;
            indexTemp2 += stepLeft * width;

            index = this._addTriangle(index, indices, indexCenter, indexTemp1, indexTemp2);
        }

        // first right
        indexTemp1 = indexTemp2;
        indexTemp2 += stepTop;

        index = this._addTriangle(index, indices, indexCenter, indexTemp1, indexTemp2);

        // second right
        if (lodTop === lodCore) {
            indexTemp1 = indexTemp2;
            indexTemp2 += stepTop;

            index = this._addTriangle(index, indices, indexCenter, indexTemp1, indexTemp2);
        }

        // first down
        indexTemp1 = indexTemp2;
        indexTemp2 -= stepRight * width;

        index = this._addTriangle(index, indices, indexCenter, indexTemp1, indexTemp2);

        // second down
        if (lodRight === lodCore) {
            indexTemp1 = indexTemp2;
            indexTemp2 -= stepRight * width;

            index = this._addTriangle(index, indices, indexCenter, indexTemp1, indexTemp2);
        }

        // first left
        indexTemp1 = indexTemp2;
        indexTemp2 -= stepBottom;

        index = this._addTriangle(index, indices, indexCenter, indexTemp1, indexTemp2);

        // second left
        if (lodBottom === lodCore) {
            indexTemp1 = indexTemp2;
            indexTemp2 -= stepBottom;

            index = this._addTriangle(index, indices, indexCenter, indexTemp1, indexTemp2);
        }

        return index;
    }

    private _addTriangle(index: unsigned_int, indices: Uint32Array, v1: unsigned_int, v2: unsigned_int, v3: unsigned_int) {
        indices[index++] = v1;
        indices[index++] = v2;
        indices[index++] = v3;
        return index;
    }
}

export default GridBuilder;