import type { RefObject, IVector3, float, int } from "../Shared/Types.mjs";
import { ObjStore2D } from "../Shared/Store2D.mjs";
import { getText } from "../Shared/Utils.mjs";
import Vector3Math from "../Shared/Vector3Math.mjs";
import type { IReadonlyAbsPatchedHeightMap } from "./AbsPatchedHeightMap.mjs";

export interface IPatchLod {
    distance: float;
    core: int;
    left: int;
    right: int;
    top: int;
    bottom: int;
}

export const getLodHash = (lod: IPatchLod): int => {
    return 17 * lod.core * 31 * lod.top * 31 * lod.left * 31 * lod.bottom * 31 * lod.right;
}

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

export class LodManager {

    private _zFar: int;
    private _map: ObjStore2D<IPatchLod>;
    private _regions: float[];

    private _patchSize: int;
    private _numPatchesX: int;
    private _numPatchesZ: int;

    private _maxLOD: int;

    public get zFar() { return this._zFar; }
    public get maxLOD() { return this._maxLOD; }

    public constructor(zFar: int, patchSize: int, numPatchesX: int, numPatchesZ: int) {
        this.setParams(zFar, patchSize, numPatchesX, numPatchesZ);
    }

    public setZFar(zFar: int) {
        this._zFar = zFar;
        this._calcLodRegions();
    }

    public setParams(zFar: int, patchSize: int, numPatchesX: int, numPatchesZ: int) {

        this._patchSize   = patchSize;
        this._numPatchesX = numPatchesX;
        this._numPatchesZ = numPatchesZ;

        this._calcMaxLOD();

        this._map = new ObjStore2D<IPatchLod>();
        this._map.initByVal(numPatchesX, numPatchesZ, getZeroPatchLod);
        this._regions = new Array<number>(this._maxLOD + 1);

        this.setZFar(zFar);
    }

    private _calcMaxLOD() {

        const numSegments          = this._patchSize - 1;
        const numSegmentsLog2      = Math.log2(numSegments);
        const numSegmentsLog2Ceil  = Math.ceil(numSegmentsLog2);
        const numSegmentsLog2Floor = Math.floor(numSegmentsLog2);

        if (numSegmentsLog2Ceil !== numSegmentsLog2Floor) {
            throw new Error("The number of vertices in the patch minus one must be a power of two\n");
        }
    
        const patchSizeLog2 = numSegmentsLog2Floor;

        this._maxLOD = patchSizeLog2 - 1;
    }

    private _calcLodRegions() {

        // TODO: We can use the ring system to determine the LOD.
        // TODO: Based on the heights we can calculate the optimal lods

        let sum = 0;
    
        for (let i = 0; i < this._maxLOD + 1; i++) {
            sum += i + 1;
        }

        let x = this._zFar / sum;
        let temp = 0;
    
        for (let i = 0; i < this._maxLOD + 1; i++) {
            const curRange = (x * (i + 1)) | 0;
            this._regions[i] = temp + curRange;
            temp += curRange;
        }
    }

    public printLodMap() {
        
        let str = '';

        const maxLodMaxZ  = this._numPatchesZ - 1;
        const maxLodMaxX  = this._numPatchesX;

        let maxCore = 0;

        for (let lodMapZ = maxLodMaxZ; lodMapZ >= 0; lodMapZ--) {

            for (let lodMapX = 0 ; lodMapX < maxLodMaxX; lodMapX++) {

                const value = this._map.get(lodMapX, lodMapZ).core;

                if (maxCore < value) {
                    maxCore = value;
                }
            }
        }

        const lodMaxNumberCount  = maxLodMaxZ.toString().length;
        const coreMaxNumberCount = maxCore.toString().length;
        
        for (let lodMapZ = maxLodMaxZ; lodMapZ >= 0; lodMapZ--) {
            str += getText(lodMapZ, lodMaxNumberCount, ' ') + ': ';
            for (let lodMapX = 0 ; lodMapX < maxLodMaxX; lodMapX++) {
                const value = this._map.get(lodMapX, lodMapZ).core;
                str += getText(value, coreMaxNumberCount, ' ') + ' ';
            }
            str += '\n';
        }

        console.log(str);
    }

    public distanceToLod(distance: float) {

        let lod = this._maxLOD;

        for (let i = 0; i < this._maxLOD; i++) {

            if (distance < this._regions[i]) {
                
                lod = i;
                break;
            }
        }
    
        return lod;
    }

    public getPatchLod(patchX: int, patchZ: int) {
        return this._map.get(patchX, patchZ);
    }

    public getPatchLodByIndex(index: int) {
        return this._map.getByIndex(index);
    }

    public update(cameraPos: RefObject<IVector3>, heightMap: IReadonlyAbsPatchedHeightMap, center: boolean = true): boolean {
        const a = this.updateLodMapPass1(cameraPos, heightMap, center);
        const b = this.updateLodMapPass2();
        return a || b;
    }

    protected updateLodMapPass1(cameraPos: RefObject<IVector3>, heightMap: IReadonlyAbsPatchedHeightMap, center: boolean) {

        let hasChange = false;

        const centerStep = this._patchSize / 2 | 0;
        const halfWidth  = heightMap.width / 2;
        const halfDepth  = heightMap.depth / 2; 

        for (let lodMapZ = 0; lodMapZ < this._numPatchesZ; lodMapZ++) {

            for (let lodMapX = 0; lodMapX < this._numPatchesX; lodMapX++) {

                const x = lodMapX * (this._patchSize - 1) + centerStep;
                const z = lodMapZ * (this._patchSize - 1) + centerStep;

                const patchCenterX     = center ? -halfWidth + x : x;
                const patchCenterY     = (heightMap.getPatchMax(lodMapX, lodMapZ) + heightMap.getPatchMin(lodMapX, lodMapZ)) / 2;
                const patchCenterZ     = center ? -halfDepth + z : z;
                const distanceToCamera = Vector3Math.distanceV3XYZ(cameraPos, patchCenterX, patchCenterY, patchCenterZ);
                //const distanceToCamera = Vector2Math.distanceX1Z1X2Z2(cameraPos.x, cameraPos.z, patchCenterX, patchCenterZ);

                const coreLod   = this.distanceToLod(distanceToCamera);
                const pPatchLOD = this._map.get(lodMapX, lodMapZ);

                if (pPatchLOD.core !== coreLod) {
                    hasChange = true;
                }

                pPatchLOD.distance = distanceToCamera;
                pPatchLOD.core = coreLod;
            }
        }

        return hasChange;
    }

    protected updateLodMapPass2() {

        let hasChange = false;

        for (let lodMapZ = 0; lodMapZ < this._numPatchesZ ; lodMapZ++) {

            for (let lodMapX = 0; lodMapX < this._numPatchesX ; lodMapX++) {

                const item    = this._map.get(lodMapX, lodMapZ);
                const coreLod = item.core;
    
                let indexLeft   = lodMapX;
                let indexRight  = lodMapX;
                let indexTop    = lodMapZ;
                let indexBottom = lodMapZ;
    
                if (lodMapX > 0) {

                    indexLeft--;

                    const prev = item.left;
                    const next = this._map.get(indexLeft, lodMapZ).core > coreLod ? 1 : 0;

                    item.left = next;

                    if (prev !== next) {
                        hasChange = true;
                    }
                }
    
                if (lodMapX < this._numPatchesX - 1) {

                    indexRight++;

                    const prev = item.right;
                    const next = this._map.get(indexRight, lodMapZ).core > coreLod ? 1 : 0;

                    item.right = next;

                    if (prev !== next) {
                        hasChange = true;
                    }
                }
    
                if (lodMapZ > 0) {

                    indexBottom--;

                    const prev = item.bottom;
                    const next = this._map.get(lodMapX, indexBottom).core > coreLod ? 1 : 0;

                    item.bottom = next;

                    if (prev !== next) {
                        hasChange = true;
                    }
                }
    
                if (lodMapZ < this._numPatchesZ - 1) {

                    indexTop++;

                    const prev = item.top;
                    const next = this._map.get(lodMapX, indexTop).core > coreLod ? 1 : 0;

                    item.top = next;

                    if (prev !== next) {
                        hasChange = true;
                    }
                }
            }
        }

        return hasChange;
    }
}

export default LodManager;