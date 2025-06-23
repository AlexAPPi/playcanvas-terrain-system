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

    public updateLods(localCameraPos: RefObject<IVector3>, useYPos: boolean = true, center: boolean = true) {
        this.lodManager.update(localCameraPos, this.heightMap, useYPos, center);
    }

    public eachPatches(renderPreparer: IGridPatchRenderPreparer, frustum?: IFrustum) {

        const patchSizeNorm = this.patchSize - 1;

        for (let patchZ = 0; patchZ < this.numPatchesZ; patchZ++) {

            const minZ = patchZ * patchSizeNorm;

            for (let patchX = 0; patchX < this.numPatchesX; patchX++) {

                const minX = patchX * patchSizeNorm;

                const visible = !!frustum && this.isPatchInsideViewFrustumBySphere(patchX, patchZ, frustum);

                const plod = this.lodManager.getPatchLod(patchX, patchZ);
                const info = this.lodInfo[plod.core].info[plod.left][plod.right][plod.top][plod.bottom];

                const baseIndex  = info.start;
                const baseVertex = minZ * this.width + minX;
                
                renderPreparer.preparePatch(visible, baseIndex, baseVertex, info.count, patchX, patchZ, minX, minZ, this.patchSize, plod);
            }
        }
    }

    public isPatchInsideViewFrustumBySphere(patchBaseX: int, patchBaseZ: int, frustum: IFrustum): boolean {

        const patchMinHeight = this.heightMap.getPatchMin(patchBaseX, patchBaseZ);
        const patchMaxHeight = this.heightMap.getPatchMax(patchBaseX, patchBaseZ);
        
        const patchRadiusBySize   = this.patchSize / 2;
        const patchRediusByHeight = (patchMaxHeight - patchMinHeight) / 2;

        const patchCenterX   = (patchBaseX * this.patchSize) + patchRadiusBySize;
        const patchCenterY   = (patchMaxHeight + patchMinHeight) / 2;
        const patchCenterZ   = (patchBaseZ * this.patchSize) + patchRadiusBySize;
        const radius         = (patchRadiusBySize > patchRediusByHeight ? patchRadiusBySize : patchRediusByHeight) * Math.SQRT2;

        // center the patches relative to the entity center
        const patchCenteredX = (-this.width / 2) + patchCenterX;
        const patchCenteredZ = (-this.depth / 2) + patchCenterZ;

        return frustum.containsSphere(patchCenteredX, patchCenterY, patchCenteredZ, radius);
    }
}

export default GeomipGridRenderPreparer