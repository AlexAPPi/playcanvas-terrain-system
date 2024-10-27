import type { IVector3, RefObject, float, int } from "../Shared/Types.mjs";
import GeomipGridBuilder from "./GeomipGridBuilder.mjs";
import { IPatchLod, defaultPatchLod } from "./LodManager.mjs";

export type PatchInitFunction = (baseIndex: int, baseVertex: int, count: int, patchX: int, patchZ: int, minX: int, minZ: int, size: int, lodInfo: Readonly<IPatchLod>) => void;
export type RenderPreparerPatchFunction = (visible: boolean, baseIndex: int, baseVertex: int, count: int, patchX: int, patchZ: int, minX: int, minZ: int, size: int, lodInfo: Readonly<IPatchLod>) => void;
export type FrustumSphereTestFunction = (localX: float, localY: float, localZ: float, radius: float) => boolean;

export interface IGridPatchInitializer {
    initPatch: PatchInitFunction,
}

export interface IGridPatchRenderPreparer {
    preparePatch: RenderPreparerPatchFunction,
}

export interface IFrustum {
    containsSphere: FrustumSphereTestFunction,
}

export class GeomipGridRenderPreparer extends GeomipGridBuilder {

    public initPatches(initializer: IGridPatchInitializer) {
        
        for (let patchZ = 0; patchZ < this.numPatchesZ; patchZ++) {

            for (let patchX = 0; patchX < this.numPatchesX; patchX++) {

                const minX = patchX * (this.patchSize - 1);
                const minZ = patchZ * (this.patchSize - 1);

                const info       = this.lodInfo[0].info[0][0][0][0];
                const baseIndex  = info.start;
                const baseVertex = minZ * this.width + minX;
                
                initializer.initPatch(baseIndex, baseVertex, info.count, patchX, patchZ, minX, minZ, this.patchSize, defaultPatchLod);
            }
        }
    }
    
    public printLodMap() {
        this.lodManager.printLodMap();
    }

    public updateLods(localCameraPos: RefObject<IVector3>, center: boolean = true) {
        this.lodManager.update(localCameraPos, this.heightMap, center);
    }

    public eachPatches(renderPreparer: IGridPatchRenderPreparer, frustum?: IFrustum) {

        for (let patchZ = 0; patchZ < this.numPatchesZ; patchZ++) {

            for (let patchX = 0; patchX < this.numPatchesX; patchX++) {

                const minX = patchX * (this.patchSize - 1);
                const minZ = patchZ * (this.patchSize - 1);

                const visible = !!frustum && this._isPatchInsideViewFrustumBySphere(patchX, patchZ, frustum);

                const plod = this.lodManager.getPatchLod(patchX, patchZ);
                const C = plod.core;
                const L = plod.left;
                const R = plod.right;
                const T = plod.top;
                const B = plod.bottom;
                const info = this.lodInfo[C].info[L][R][T][B];

                const baseIndex  = info.start;
                const baseVertex = minZ * this.width + minX;
                
                renderPreparer.preparePatch(visible, baseIndex, baseVertex, info.count, patchX, patchZ, minX, minZ, this.patchSize, plod);
            }
        }
    }

    private _isPatchInsideViewFrustumBySphere(patchBaseX: int, patchBaseZ: int, frustum: IFrustum): boolean {

        const patchMinHeight = this.heightMap.getPatchMin(patchBaseX, patchBaseZ);
        const patchMaxHeight = this.heightMap.getPatchMax(patchBaseX, patchBaseZ);

        const patchRadius       = this.patchSize / 2;
        const patchHeightRadius = patchMaxHeight - patchMinHeight;

        const patchCenterX   = (patchBaseX * this.patchSize) + patchRadius;
        const patchCenterY   = (patchMaxHeight + patchMinHeight) / 2;
        const patchCenterZ   = (patchBaseZ * this.patchSize) + patchRadius;
        const radius         = (patchRadius > patchHeightRadius ? patchRadius : patchHeightRadius) * Math.SQRT2;

        // center the patches relative to the entity center
        const patchCenteredX = (-this.width / 2) + patchCenterX;
        const patchCenteredZ = (-this.depth / 2) + patchCenterZ;

        return frustum.containsSphere(patchCenteredX, patchCenterY, patchCenteredZ, radius);
    }
}

export default GeomipGridRenderPreparer