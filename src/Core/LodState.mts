import type { float, int } from "../Extras/Types.mjs";
import type { IPatchLod } from "./IPatchLod.mjs";
import type LodManager from "./LodManager.mjs";
import { getText } from "../Extras/Utils.mjs";
import { ObjStore2D } from "../Extras/Store2D.mjs";

export const defaultPatchLod: Readonly<IPatchLod> = {
    distance: 0,
    core:     0,
    left:     0,
    right:    0,
    top:      0,
    bottom:   0,
}

const getZeroPatchLod = (): IPatchLod => ({
    distance: 0,
    core:     0,
    left:     0,
    right:    0,
    top:      0,
    bottom:   0,
});

export interface ILodState {
    getPatchLod(patchX: int, patchZ: int): IPatchLod;
    getPatchLodByIndex(index: int): IPatchLod;
    getLodForDistance(distance: float): int;
    updatePatchLod(patchX: number, patchZ: number): boolean;
}

export default class LodState implements ILodState {

    private _zFar: float;
    private _map: ObjStore2D<IPatchLod>;
    private _regions: float[];
    private _lodManager: LodManager;

    public get lodManager() { return this._lodManager; }
    public get zFar() { return this._zFar; }
    public get regions() { return this._regions; }
    public get map() { return this._map; }
    
    constructor(lodManager: LodManager, zFar: float) {
        this.setLodManager(lodManager);
        this.setZFar(zFar);
    }

    public setLodManager(lodManager: LodManager, removeFromPrev: boolean = true) {
        
        if (this._lodManager && removeFromPrev) {
            this._lodManager.removeState(this);
        }

        this._lodManager = lodManager;
        this._lodManager.addState(this);

        this._regions = new Array<number>(this._lodManager.count);
        this._map = new ObjStore2D<IPatchLod>();
        this._map.initByVal(this._lodManager.numPatchesX, this._lodManager.numPatchesZ, getZeroPatchLod);
    }

    public destroy() {
        this._lodManager?.removeState(this);
        this._lodManager = null!;
    }

    public setZFar(zFar: float) {
        this._zFar = zFar;
        this._calcLodRegions();
    }

    protected _calcLodRegions() {
        
        // TODO: We can use the ring system to determine the LOD.
        // TODO: Based on the heights we can calculate the optimal lods

        let sum = 0;
    
        for (let i = 0; i < this._regions.length; i++) {
            sum += i + 1;
        }

        let x = this._zFar / sum;
        let temp = 0;
    
        for (let i = 0; i < this._regions.length; i++) {
            const curRange = (x * (i + 1)) | 0;
            this._regions[i] = temp + curRange;
            temp += curRange;
        }
    }

    public getPatchLod(patchX: int, patchZ: int) {
        return this._map.get(patchX, patchZ);
    }

    public getPatchLodByIndex(index: int) {
        return this._map.getByIndex(index);
    }
    
    public getLodForDistance(distance: float) {

        let lod = this._regions.length - 1;

        for (let i = 0; i < this._regions.length; i++) {

            if (distance < this._regions[i]) {
                
                lod = i;
                break;
            }
        }
    
        return lod;
    }

    public updatePatchLod(patchX: number, patchZ: number) {

        const item    = this._map.get(patchX, patchZ);
        const coreLod = item.core;

        let hasChange   = false;
        let indexLeft   = patchX;
        let indexRight  = patchX;
        let indexTop    = patchZ;
        let indexBottom = patchZ;

        if (patchX > 0) {

            indexLeft--;

            const prev = item.left;
            const next = this._map.get(indexLeft, patchZ).core > coreLod ? 1 : 0;

            if (prev !== next) {
                item.left = next;
                hasChange = true;
            }
        }

        if (patchX < this._lodManager.numPatchesX - 1) {

            indexRight++;

            const prev = item.right;
            const next = this._map.get(indexRight, patchZ).core > coreLod ? 1 : 0;

            if (prev !== next) {
                item.right = next;
                hasChange = true;
            }
        }

        if (patchZ > 0) {

            indexBottom--;

            const prev = item.bottom;
            const next = this._map.get(patchX, indexBottom).core > coreLod ? 1 : 0;

            if (prev !== next) {
                item.bottom = next;
                hasChange = true;
            }
        }

        if (patchZ < this._lodManager.numPatchesZ - 1) {

            indexTop++;

            const prev = item.top;
            const next = this._map.get(patchX, indexTop).core > coreLod ? 1 : 0;

            if (prev !== next) {
                item.top = next;
                hasChange = true;
            }
        }

        return hasChange;
    }

    public printLodMap() {

        const maxLodMaxZ = this._lodManager.numPatchesZ - 1;
        const maxLodMaxX = this._lodManager.numPatchesX;

        let maxCore = 0;
        let str = '';

        for (let lodMapZ = maxLodMaxZ; lodMapZ > -1; lodMapZ--) {

            for (let lodMapX = 0; lodMapX < maxLodMaxX; lodMapX++) {

                const value = this._map.get(lodMapX, lodMapZ).core;

                if (maxCore < value) {
                    maxCore = value;
                }
            }
        }

        const lodMaxNumberCount  = maxLodMaxZ.toString().length;
        const coreMaxNumberCount = maxCore.toString().length;
        
        for (let lodMapZ = maxLodMaxZ; lodMapZ > -1; lodMapZ--) {

            str += getText(lodMapZ, lodMaxNumberCount, ' ') + ': ';

            for (let lodMapX = 0; lodMapX < maxLodMaxX; lodMapX++) {

                const value = this._map.get(lodMapX, lodMapZ).core;

                str += getText(value, coreMaxNumberCount, ' ') + ' ';
            }

            str += '\n';
        }

        console.log(str);
    }
}