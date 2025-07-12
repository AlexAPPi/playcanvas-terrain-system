import type { float, int, IVector3, RefObject } from "../Extras/Types.mjs";
import type { IPatchLod } from "./IPatchLod.mjs";
import { defaultPatchLod, ILodState } from "./LodState.mjs";
import LodManager from "./LodManager.mjs";
import PatchesSphereBuffer from "./PatchesSphereBuffer.mjs";
import type { IGridPatchedLod } from "./GridBuilder.mjs";
import type { ISingleLodInfo } from "./LodInfo.mjs";

export interface IPatchesState {
    readonly lodState: ILodState;
    beforeUpdate(): void;
    afterUpdate(): void;
    initPatch(patchX: int, patchZ: int, size: int, minX: int, minZ: int, info: Readonly<ISingleLodInfo>, lodInfo: Readonly<IPatchLod>): void;
    updatePatch(patchX: int, patchZ: int, visible: boolean, info: Readonly<ISingleLodInfo>, lodInfo: Readonly<IPatchLod>): void;
}

export default class PatchesManager {

    private _grid: IGridPatchedLod;
    private _spheres: PatchesSphereBuffer;
    private _lodManager: LodManager;
    private _states: IPatchesState[];

    public get grid() { return this._grid; }
    public get spheres() { return this._spheres; }
    public get lodManager() { return this._lodManager; }
    public get states(): Readonly<Readonly<IPatchesState>[]> { return this._states; }

    public constructor(grid: IGridPatchedLod, spheres: PatchesSphereBuffer) {
        this._grid = grid;
        this._spheres = spheres;
        this._lodManager = new LodManager(grid.lodEstimator);
        this._states = [];
    }

    public hasState(state: IPatchesState) {
        return this._states.indexOf(state) !== -1;
    }

    public addState(state: IPatchesState) {

        if (!this._lodManager.hasState(state.lodState)) {
            console.warn("Lod state has different lod manager with patches manager");
            return;
        }

        if (this._states.indexOf(state) === -1) {
            this._states.push(state);
        }

        this._initSingleState(state);
    }

    public removeState(state: IPatchesState) {
        
        const idx = this._states.indexOf(state);

        if (idx !== -1) {
            this._states.splice(idx, 1);
        }
    }

    private _initSingleState(state: IPatchesState) {

        const numPatchesX = this._grid.numPatchesX;
        const numPatchesZ = this._grid.numPatchesZ;
        const patchSize   = this._grid.patchSize;

        for (let patchZ = 0; patchZ < numPatchesZ; patchZ++) {

            for (let patchX = 0; patchX < numPatchesX; patchX++) {

                const minX = patchX * (patchSize - 1);
                const minZ = patchZ * (patchSize - 1);
                const info = this._grid.lodInfo[0].info[0][0][0][0];

                state.initPatch(patchX, patchZ, patchSize, minX, minZ, info, defaultPatchLod);
            }
        }
    }

    public update(frustum?: pcx.Frustum, frustumMargin: float = 1) {

        const numStates = this._states.length;
        const numPatchesX = this._grid.numPatchesX;
        const numPatchesZ = this._grid.numPatchesZ;

        for (let i = 0; i < numStates; i++) {
            this._states[i].beforeUpdate();
        }

        for (let patchZ = 0; patchZ < numPatchesZ; patchZ++) {

            for (let patchX = 0; patchX < numPatchesX; patchX++) {

                const visible = !!frustum && this._spheres.patchVisible(patchX, patchZ, frustumMargin, frustum);

                for (let i = 0; i < numStates; i++) {

                    const state = this._states[i];
                    const plod = state.lodState.getPatchLod(patchX, patchZ);
                    const info = this._grid.lodInfo[plod.core].info[plod.left][plod.right][plod.top][plod.bottom];

                    state.updatePatch(patchX, patchZ, visible, info, plod);
                }
            }
        }

        for (let i = 0; i < numStates; i++) {
            this._states[i].afterUpdate();
        }
    }

    public updateLods(localViewPos: RefObject<IVector3>, useYPos: boolean = true) {
        this.lodManager.update(localViewPos, this._spheres.heightMap, useYPos);
    }
}