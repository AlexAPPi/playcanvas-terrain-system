import type { RefObject, IVector3, int } from "../Extras/Types.mjs";
import type { IReadonlyAbsHeightMap } from "./AbsHeightMap.mjs";
import type { ILodState } from "./LodState.mjs";
import LodEstimator from "./LodEstimator.mjs";

export default class LodManager {

    private _states: ILodState[];

    private _patchSize: int;
    private _numPatchesX: int;
    private _numPatchesZ: int;
    private _lodCount: int;

    public get states()      { return this._states; }
    public get patchSize()   { return this._patchSize; }
    public get numPatchesX() { return this._numPatchesX; }
    public get numPatchesZ() { return this._numPatchesZ; }
    public get count()       { return this._lodCount; }
    public get max()         { return this._lodCount - 1; }

    public constructor(lodEstimator: LodEstimator) {
        this._states = [];
        this._patchSize = lodEstimator.patchSize;
        this._numPatchesX = lodEstimator.numPatchesX;
        this._numPatchesZ = lodEstimator.numPatchesZ;
        this._lodCount = lodEstimator.count;
    }

    public hasState(state: ILodState) {
        return this._states.indexOf(state) !== -1;
    }

    public addState(state: ILodState) {
        if (this._states.indexOf(state) === -1) {
            this._states.push(state);
        }
    }
    
    public removeState(state: ILodState) {

        const idx = this._states.indexOf(state);

        if (idx !== -1) {
            this._states.splice(idx, 1);
        }
    }

    public update(localViewPos: RefObject<IVector3>, heightMap: IReadonlyAbsHeightMap, useYPos: boolean = true): boolean {
        const a = this._updateLodMapPass1(localViewPos, heightMap, useYPos);
        const b = this._updateLodMapPass2();
        return a || b;
    }

    protected _updateLodMapPass1(localViewPos: RefObject<IVector3>, heightMap: IReadonlyAbsHeightMap, useYPos: boolean) {
        
        const halfWidth   = heightMap.width / 2;
        const halfDepth   = heightMap.depth / 2;
        const centerStep  = this.patchSize / 2 | 0;
        const patchSizeM1 = this.patchSize - 1;

        let proxyPatchCenterY = 0;
        let hasChange = false;

        if (useYPos) {

            const normalizeCameraX = Math.min(Math.max(localViewPos.x + halfWidth, 0), heightMap.width - 1);
            const normalizeCameraZ = Math.min(Math.max(localViewPos.z + halfDepth, 0), heightMap.depth - 1);
            const cameraPosAltitude = heightMap.get(normalizeCameraX | 0, normalizeCameraZ | 0);

            proxyPatchCenterY = (localViewPos.y - cameraPosAltitude) ** 2;
        }

        for (let lodMapZ = 0; lodMapZ < this.numPatchesZ; lodMapZ++) {

            for (let lodMapX = 0; lodMapX < this.numPatchesX; lodMapX++) {

                const x = lodMapX * patchSizeM1 + centerStep;
                const z = lodMapZ * patchSizeM1 + centerStep;

                const patchCenterX = -halfWidth + x;
                const patchCenterZ = -halfDepth + z;
                const distanceToCamera = Math.sqrt(
                    (localViewPos.x - patchCenterX) ** 2 +
                    (localViewPos.z - patchCenterZ) ** 2 +
                    proxyPatchCenterY
                );

                for (const state of this._states) {

                    const coreLod  = state.getLodForDistance(distanceToCamera);
                    const patchLod = state.getPatchLod(lodMapX, lodMapZ);

                    patchLod.distance = distanceToCamera;

                    if (patchLod.core !== coreLod) {
                        patchLod.core = coreLod;
                        hasChange = true;
                    }
                }
            }
        }

        return hasChange;
    }

    protected _updateLodMapPass2() {

        let hasChange = false;

        for (let lodMapZ = 0; lodMapZ < this.numPatchesZ; lodMapZ++) {

            for (let lodMapX = 0; lodMapX < this.numPatchesX; lodMapX++) {

                for (const state of this._states) {

                    if (state.updatePatchLod(lodMapX, lodMapZ)) {
                        hasChange = true;
                    }
                }
            }
        }

        return hasChange;
    }
}