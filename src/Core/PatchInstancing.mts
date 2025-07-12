import type { int } from "../Extras/Types.mjs";
import type { IPatch } from "./IPatch.mjs";
import type { IPatchLodBase } from "./IPatchLod.mjs";
import type { IInstancingObject, IPatchInstancing, ISingleLodInfoInstancing, TBulder, TDestructor, TSelector } from "./IPatchInstancing.mjs";
import { BOTTOM, LEFT, RIGHT, TOP, type IReadonlyLodInfo } from "./LodInfo.mjs";
import type { IGridPatchedLod } from "./GridBuilder.mjs";

export const instDataSize = 2;

export type  TInstCoordsOffsetArrType = Uint16Array;
export const TInstCoordsOffsetArrType = Uint16Array;

export class PatchInstancing<T extends IInstancingObject> implements IPatchInstancing<T, TInstCoordsOffsetArrType> {

    private _patchCount: int;

    public data: ISingleLodInfoInstancing<T, TInstCoordsOffsetArrType>[][][][][];
    public get patchCount() { return this._patchCount; }

    constructor() {
        this.data = [];
        this._patchCount = 0;
    }
    
    public forEach(fn: TSelector<T, TInstCoordsOffsetArrType>) {
        for (let c = 0; c < this.data.length; c++) {
            for (let l = 0; l < LEFT; l++) {
                for (let r = 0; r < RIGHT; r++) {
                    for (let t = 0; t < TOP; t++) {
                        for (let b = 0; b < BOTTOM; b++) {
                            const segment = this.data[c][l][r][t][b];
                            fn(segment);
                        }
                    }
                }
            }
        }
    }

    public destroySegmentObjects(index: int, destructor: TDestructor<T>) {
        for (let l = 0; l < LEFT; l++) {
            for (let r = 0; r < RIGHT; r++) {
                for (let t = 0; t < TOP; t++) {
                    for (let b = 0; b < BOTTOM; b++) {

                        const segment = this.data[index][l][r][t][b];
                        
                        if (segment.object) {
                            destructor(segment.object);
                            segment.object = null;
                        }
                    }
                }
            }
        }
    }

    public destroy(destructor: TDestructor<T>) {
        for (let i = 0; i < this.data.length; i++) {
            this.destroySegmentObjects(i, destructor);
        }
        this.data.length = 0;
    }

    public build(grid: IGridPatchedLod, objectBuilder?: TBulder<T, TInstCoordsOffsetArrType>) {

        this._patchCount = grid.numPatchesX * grid.numPatchesZ;
        this.data = new Array(grid.lodInfo.length);

        for (let lodCore = 0; lodCore < this.data.length; lodCore++) {
            this.data[lodCore] = this._buildInfo(lodCore, grid.lodInfo[lodCore], this._patchCount, objectBuilder);
        }
    }

    private _buildInfo<T extends IInstancingObject>(lodCore: int, lodInfo: IReadonlyLodInfo, patchCount: int, objectBuilder?: TBulder<T, TInstCoordsOffsetArrType>): ISingleLodInfoInstancing<T, TInstCoordsOffsetArrType>[][][][] {

        const arr = new Array<ISingleLodInfoInstancing<T, TInstCoordsOffsetArrType>[][][]>(LEFT);
    
        for (let l = 0; l < LEFT; l++)   { arr[l] = new Array(RIGHT);
        for (let r = 0; r < RIGHT; r++)  { arr[l][r] = new Array(TOP);
        for (let t = 0; t < TOP; t++)    { arr[l][r][t] = new Array(BOTTOM);
        for (let b = 0; b < BOTTOM; b++) {

            const info = lodInfo.info[l][r][t][b];
            const lod: IPatchLodBase = {
                core: lodCore,
                left: l,
                right: r,
                top: t,
                bottom: b
            };

            const data   = new TInstCoordsOffsetArrType(patchCount * instDataSize);
            const object = objectBuilder ? objectBuilder(lod, info, data, patchCount) : null;

            arr[l][r][t][b] = {
                vertexBaseIndex: info.start,
                vertexCount: info.count,
                count: 0,
                lod: lod,
                data: data,
                object: object,
                hasChanges: false,
            };
        }}}}
    
        return arr;
    }

    public get(lod: IPatchLodBase): ISingleLodInfoInstancing<T, TInstCoordsOffsetArrType> {
        return this.data[lod.core][lod.left][lod.right][lod.top][lod.bottom];
    }
    
    public increment(lod: IPatchLodBase, patch: IPatch): ISingleLodInfoInstancing<T, TInstCoordsOffsetArrType> {
        
        const single    = this.get(lod);
        const prevIndex = single.count;
        const index     = prevIndex * instDataSize;

        if (single.data[index + 0] !== patch.minX ||
            single.data[index + 1] !== patch.minZ) {
            single.data[index + 0] = patch.minX;
            single.data[index + 1] = patch.minZ;
            single.hasChanges = true;
        }

        single.count++;
        return single;
    }

    public zeroAll() {

        for (let lodCore = 0; lodCore < this.data.length; lodCore++) {
            for (let l = 0; l < LEFT; l++) {
                for (let r = 0; r < RIGHT; r++) {
                    for (let t = 0; t < TOP; t++) {
                        for (let b = 0; b < BOTTOM; b++) {

                            const single = this.data[lodCore][l][r][t][b];
                                  single.count = 0;
                        }
                    }
                }
            }
        }
    }
}