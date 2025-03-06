import { int } from "../Shared/Types.mjs";
import { BOTTOM, ISingleLodInfo, LEFT, LodInfo, RIGHT, TOP } from "./LodInfo.mjs";
import { IPatchLod } from "./LodManager.mjs";
import BaseTerrain from "./Terrain.mjs";

export const instDataSize = 2;

export interface IInstancingObject {
}

// We can use uint8, but we only use 2 bytes,
// for optimal performance need 4 bytes for the buffer.
export type  TInstCoordsOffsetArrType = Uint16Array;
export const TInstCoordsOffsetArrType = Uint16Array;

export type TBulder<T extends IInstancingObject> = (lodInfo: IPatchLod, primitiveInfo: ISingleLodInfo, instancingData: TInstCoordsOffsetArrType, maxInstancingCount: int) => T | null;
export type TDestructor<T extends IInstancingObject> = (object: T) => void;
export type TSelector<T extends IInstancingObject> = (item: ISingleLodInfoInstancing<T>) => void;

/**
 * Lod data type with indexes [LODCORE][LEFT][RIGHT][TOP][BOTTOM]
 */
export type TData<T extends IInstancingObject> = ISingleLodInfoInstancing<T>[][][][][];

export interface ISingleLodInfoInstancing<T extends IInstancingObject> {
    vertexBaseIndex: int;
    vertexCount: int;
    data: Uint16Array;
    count: int;
    object: T | null;
    hasChanges: boolean;
}

export class PatchInstancing<T extends IInstancingObject> {

    private _patchCount: int;

    public data: TData<T>;
    public get patchCount() { return this._patchCount; }

    constructor() {
        this.data = [];
        this._patchCount = 0;
    }
    
    public forEach(fn: TSelector<T>) {
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

    public buildFromTerrain(terrain: BaseTerrain, objectBuilder?: TBulder<T>) {

        this._patchCount = terrain.numPatchesX * terrain.numPatchesZ;
        this.data = new Array(terrain.lodInfo.length);

        for (let lodCore = 0; lodCore < this.data.length; lodCore++) {
            this.data[lodCore] = this._buildInfo(lodCore, terrain.lodInfo[lodCore], this._patchCount, objectBuilder);
        }
    }

    private _buildInfo<T extends IInstancingObject>(lodCore: int, lodInfo: Readonly<Readonly<LodInfo>>, patchCount: int, objectBuilder?: TBulder<T>): ISingleLodInfoInstancing<T>[][][][] {

        const arr: ISingleLodInfoInstancing<T>[][][][] = new Array(LEFT);
    
        for (let l = 0 ; l < LEFT ; l++) {
    
            arr[l] = new Array(RIGHT);
    
            for (let r = 0 ; r < RIGHT ; r++) {
    
                arr[l][r] = new Array(TOP);
    
                for (let t = 0 ; t < TOP ; t++) {
                    
                    arr[l][r][t] = new Array(BOTTOM);
    
                    for (let b = 0 ; b < BOTTOM ; b++) {
    
                        const info = lodInfo.info[l][r][t][b];
                        const lod: IPatchLod = {
                            distance: -1,
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
                            data: data,
                            object: object,
                            hasChanges: false,
                        };
                    }
                }
            }
        }
    
        return arr;
    }

    public get(lod: IPatchLod): ISingleLodInfoInstancing<T> {
        return this.data[lod.core][lod.left][lod.right][lod.top][lod.bottom];
    }

    public increment(lod: IPatchLod, x: int, z: int): ISingleLodInfoInstancing<T> {
        
        const single    = this.get(lod);
        const prevIndex = single.count;
        const index     = prevIndex * instDataSize;

        if (single.data[index + 0] !== x ||
            single.data[index + 1] !== z) {
            single.data[index + 0] = x;
            single.data[index + 1] = z;
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