import type { int } from "../Extras/Types.mjs";
import type { IPatch } from "./IPatch.mjs";
import type { IPatchLod, IPatchLodBase } from "./IPatchLod.mjs";
import type { IInstancingObject, IPatchInstancing, ISingleLodInfoInstancing, TBulder, TDestructor, TSelector } from "./IPatchInstancing.mjs";
import { getLodId } from "./LodEstimator.mjs";
import { BOTTOM, LEFT, RIGHT, TOP, type IReadonlyLodInfo } from "./LodInfo.mjs";
import type { IGridPatchedLod } from "./GridBuilder.mjs";

export const comInstDataSize = 4;
export const combineGroupLen = 6;

export type  TComInstCoordsOffsetArrType = Uint8Array;
export const TComInstCoordsOffsetArrType = Uint8Array;

export interface ICombineItem {
    mainId: int,
    groupId: int,
    angle: int,
}

export interface ILodCombineData<T extends IInstancingObject> {
    groups: ISingleLodInfoInstancing<T, TComInstCoordsOffsetArrType>[],
    items: ICombineItem[][][][]
}

export default class PatchCombineInstancing<T extends IInstancingObject> implements IPatchInstancing<T, TComInstCoordsOffsetArrType> {

    private _patchCount: int;

    public data: ILodCombineData<T>[];
    public get patchCount() { return this._patchCount; }

    constructor() {
        this.data = [];
        this._patchCount = 0;
    }
    
    public forEach(fn: TSelector<T, TComInstCoordsOffsetArrType>) {

        for (let c = 0; c < this.data.length; c++) {

            for (let i = 0; i < combineGroupLen; i++) {
                
                const segment = this.data[c].groups[i];

                fn(segment);
            }
        }
    }

    public destroySegmentObjects(index: int, destructor: TDestructor<T>) {

        for (let i = 0; i < combineGroupLen; i++) {
            
            const segment = this.data[index].groups[i];

            if (segment.object) {
                destructor(segment.object);
                segment.object = null;
            }
        }
    }

    public destroy(destructor: TDestructor<T>) {
        for (let i = 0; i < this.data.length; i++) {
            this.destroySegmentObjects(i, destructor);
        }
        this.data.length = 0;
    }

    public build(grid: IGridPatchedLod, objectBuilder?: TBulder<T, TComInstCoordsOffsetArrType>) {

        this._patchCount = grid.numPatchesX * grid.numPatchesZ;
        this.data = new Array(grid.lodInfo.length);

        for (let lodCore = 0; lodCore < this.data.length; lodCore++) {
            this.data[lodCore] = this._buildInfo(lodCore, grid.lodInfo[lodCore], this._patchCount, objectBuilder);
        }
    }

    private _buildInfo<T extends IInstancingObject>(lodCore: int, lodInfo: IReadonlyLodInfo, patchCount: int, objectBuilder?: TBulder<T, TComInstCoordsOffsetArrType>): ILodCombineData<T> {

        const groups = new Array<ISingleLodInfoInstancing<T, TComInstCoordsOffsetArrType>>(combineGroupLen);
        const items  = new Array<ICombineItem[][][]>(LEFT);

        for (let l = 0; l < LEFT; l++)   { items[l] = new Array<ICombineItem[][]>(RIGHT);
        for (let r = 0; r < RIGHT; r++)  { items[l][r] = new Array<ICombineItem[]>(TOP);
        for (let t = 0; t < TOP; t++)    { items[l][r][t] = new Array<ICombineItem>(BOTTOM);
        for (let b = 0; b < BOTTOM; b++) {

            const id = getLodId(lodCore, l, r, t, b);
            const vl = getLodCombineData(lodCore, l, r, t, b);
            const { mainId, groupId } = vl;

            items[l][r][t][b] = vl;

            // build data for main case
            if (id === mainId) {

                const info = lodInfo.info[l][r][t][b];
                const lod: IPatchLodBase = {
                    core: lodCore,
                    left: l,
                    right: r,
                    top: t,
                    bottom: b
                };

                const data   = new TComInstCoordsOffsetArrType(patchCount * comInstDataSize);
                const object = objectBuilder ? objectBuilder(lod, info, data, patchCount) : null;

                groups[groupId] = {
                    vertexBaseIndex: info.start,
                    vertexCount: info.count,
                    count: 0,
                    lod: lod,
                    data: data,
                    object: object,
                    hasChanges: false,
                };
            }
        }}}}

        return {
            groups,
            items
        };
    }

    public get(lod: IPatchLod): ISingleLodInfoInstancing<T, TComInstCoordsOffsetArrType> {
        const data = this.data[lod.core];
        const groupId = data.items[lod.left][lod.right][lod.top][lod.bottom].groupId;
        return data.groups[groupId];
    }

    public increment(lod: IPatchLod, patch: IPatch): ISingleLodInfoInstancing<T, TComInstCoordsOffsetArrType> {
        
        const data   = this.data[lod.core];
        const item   = data.items[lod.left][lod.right][lod.top][lod.bottom];
        const single = data.groups[item.groupId];

        const prevIndex = single.count;
        const index     = prevIndex * comInstDataSize;

        if (single.data[index + 0] !== patch.x ||
            single.data[index + 1] !== patch.z ||
            single.data[index + 2] !== item.angle) {
            single.data[index + 0] = patch.x;
            single.data[index + 1] = patch.z;
            single.data[index + 2] = item.angle;
            single.hasChanges = true;
        }

        single.count++;
        return single;
    }

    public zeroAll() {

        for (let lodCore = 0; lodCore < this.data.length; lodCore++) {

            for (let i = 0; i < combineGroupLen; i++) {

                const single = this.data[lodCore].groups[i];

                single.count = 0;
            }
        }
    }
}

export function getLodCombineData(lodCore: int, l: int, r: int, t: int, b: int) {

    // We are looking for which shape can be replaced by rotation.
    // Angle 1 = 90, 2 = 180, 3 = 270

    // |\|/|/                   |\|/|\|
    // |\|/|\  => rotate(90) => |/|\|/|
    // |/|\|/                    \ / \

    let mainId;
    let groupId;
    let angle;

    if (l === 0 && r === 0 && t === 0 && b === 0) {
        mainId  = getLodId(lodCore, 0, 0, 0, 0);
        groupId = 0;
        angle   = 0;
    }
    else if (l === 1 && r === 0 && t === 0 && b === 0) {
        mainId  = getLodId(lodCore, 1, 0, 0, 0);
        groupId = 1;
        angle   = 0;
    }
    else if (l === 0 && r === 0 && t === 1 && b === 0) {
        mainId  = getLodId(lodCore, 1, 0, 0, 0);
        groupId = 1;
        angle   = 90;
    }
    else if (l === 0 && r === 1 && t === 0 && b === 0) {
        mainId  = getLodId(lodCore, 1, 0, 0, 0);
        groupId = 1;
        angle   = 180;
    }
    else if (l === 0 && r === 0 && t === 0 && b === 1) {
        mainId  = getLodId(lodCore, 1, 0, 0, 0);
        groupId = 1;
        angle   = 270;
    }
    else if (l === 1 && r === 0 && t === 1 && b === 0) {
        mainId  = getLodId(lodCore, 1, 0, 1, 0);
        groupId = 2;
        angle   = 0;
    }
    else if (l === 0 && r === 1 && t === 1 && b === 0) {
        mainId  = getLodId(lodCore, 1, 0, 1, 0);
        groupId = 2;
        angle   = 90;
    }
    else if (l === 0 && r === 1 && t === 0 && b === 1) {
        mainId  = getLodId(lodCore, 1, 0, 1, 0);
        groupId = 2;
        angle   = 180;
    }
    else if (l === 1 && r === 0 && t === 0 && b === 1) {
        mainId  = getLodId(lodCore, 1, 0, 1, 0);
        groupId = 2;
        angle   = 270;
    }
    else if (l === 1 && r === 1 && t === 0 && b === 0) {
        mainId  = getLodId(lodCore, 1, 1, 0, 0);
        groupId = 3;
        angle   = 0;
    }
    else if (l === 0 && r === 0 && t === 1 && b === 1) {
        mainId  = getLodId(lodCore, 1, 1, 0, 0);
        groupId = 3;
        angle   = 90;
    }
    else if (l === 1 && r === 0 && t === 1 && b === 1) {
        mainId  = getLodId(lodCore, 1, 0, 1, 1);
        groupId = 4;
        angle   = 0;
    }
    else if (l === 1 && r === 1 && t === 1 && b === 0) {
        mainId  = getLodId(lodCore, 1, 0, 1, 1);
        groupId = 4;
        angle   = 90;
    }
    else if (l === 0 && r === 1 && t === 1 && b === 1) {
        mainId  = getLodId(lodCore, 1, 0, 1, 1);
        groupId = 4;
        angle   = 180;
    }
    else if (l === 1 && r === 1 && t === 0 && b === 1) {
        mainId  = getLodId(lodCore, 1, 0, 1, 1);
        groupId = 4;
        angle   = 270;
    }
    else if (l === 1 && r === 1 && t === 1 && b === 1) {
        mainId  = getLodId(lodCore, 1, 1, 1, 1);
        groupId = 5;
        angle   = 0;
    }
    else {
        throw new Error(`Can\'t combine ${lodCore},${l},${r},${t},${b}`);
    }

    return {
        mainId,
        groupId,
        angle: angle / 90, // save for uint8
    };
} 