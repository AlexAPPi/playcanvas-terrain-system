import { clamp } from "../Extras/Utils.mjs";
import type Terrain from "../Scripts/Terrain.mjs";
import type GrassField from "../Scripts/GrassField.mjs";
import { drawBox } from "../Extras/Debug.mjs";

export const lod0PatchCount = 1;
export const lod1PatchCount = 8;
export const lod2PatchCount = 16;

export const cameraCornersColor = pc.Color.YELLOW;
export const cameraCornersIndices = [
    [0,1], [1,2], [2,3], [3,0],
    [4,5], [5,6], [6,7], [7,4],
    [0,4], [1,5], [2,6], [3,7]
];

export const patchLod1Matrix: Readonly<number[]> = [
    2, 2,  1, 2,  0, 2,
    0, 1,  0, 0,  1, 0,
    2, 0,  2, 1,  1, 1
];

export const patchLod2Matrix: Readonly<number[]> = [
    4, 4,  3, 4,  2, 4,  1, 4,
    0, 4,  0, 3,  0, 2,  0, 1,
    0, 0,  1, 0,  2, 0,  3, 0,
    4, 0,  4, 1,  4, 2,  4, 3
];

export default class GrassFieldFrustum {
    
    private _lod1Offsets: number[] = [
        0, 0,  0, 0,
        0, 0,  0, 0,
        0, 0,  0, 0,
        0, 0,  0, 0,
    ];

    private _lod2Offsets: number[] = [
        0, 0,  0, 0,  0, 0,  0, 0,
        0, 0,  0, 0,  0, 0,  0, 0,
        0, 0,  0, 0,  0, 0,  0, 0,
        0, 0,  0, 0,  0, 0,  0, 0,
    ];

    private _lod1MinMaxStore: Array<[pcx.Vec3, pcx.Vec3, boolean]> = [];
    private _lod2MinMaxStore: Array<[pcx.Vec3, pcx.Vec3, boolean]> = [];

    private _worldCornes = [new pc.Vec3(), new pc.Vec3(), new pc.Vec3(), new pc.Vec3(), new pc.Vec3(), new pc.Vec3(), new pc.Vec3(), new pc.Vec3()];
    private _bufferedCornes = false;

    public get lod1Offsets(): number[] { return this._lod1Offsets; }
    public get lod2Offsets(): number[] { return this._lod2Offsets; }

    constructor(
        readonly terrain: Terrain,
        readonly camera: pcx.Camera,
    ) {
        // update set check is visible for version 2
        if (this.camera?.frustum.planes &&
            this.camera.frustum.planes[0] instanceof pc.Plane) {
            this._checkIsVisible = this._checkIsVisibleNew as any;
        }
        else {
            this._checkIsVisible = this._checkIsVisibleOld as any;
        }
    }

    private _checkIsVisible(min: pcx.Vec3, max: pcx.Vec3, frustumPlanes: pcx.Plane[] | number[][]) {
        return false;
    }

    private _checkIsVisibleOld(min: pcx.Vec3, max: pcx.Vec3, frustumPlanes: number[][]) {

        for (let p = 0; p < 6; p++) {
            
            const frustumPlane = frustumPlanes[p];
            const d = Math.max(min.x * frustumPlane[0], max.x * frustumPlane[0])
                    + Math.max(min.y * frustumPlane[1], max.y * frustumPlane[1])
                    + Math.max(min.z * frustumPlane[2], max.z * frustumPlane[2])
                    + frustumPlane[3];

            if (d <= 0) {
                return false;
            }
        }

        return true;
    }

    private _checkIsVisibleNew(min: pcx.Vec3, max: pcx.Vec3, frustumPlanes: pcx.Plane[]) {

        for (let p = 0; p < 6; p++) {
            
            const frustumPlane = frustumPlanes[p];
            const d = Math.max(min.x * frustumPlane.normal.x, max.x * frustumPlane.normal.x)
                    + Math.max(min.y * frustumPlane.normal.y, max.y * frustumPlane.normal.y)
                    + Math.max(min.z * frustumPlane.normal.z, max.z * frustumPlane.normal.z)
                    + frustumPlane.distance;

            if (d <= 0) {
                return false;
            }
        }

        return true;
    }

    private _updateMinMaxFromPatches(min: pcx.Vec3, max: pcx.Vec3) {

        const width = this.terrain.object.width;
        const depth = this.terrain.object.depth;
        const patchSize = this.terrain.object.patchSize;
        const heightMap = this.terrain.object.heightMap;

        const minPatchX = clamp(min.x, 0, width) / patchSize | 0;
        const minPatchZ = clamp(min.z, 0, depth) / patchSize | 0;
        const maxPatchX = clamp(max.x, 0, width) / patchSize | 0;
        const maxPatchZ = clamp(max.z, 0, depth) / patchSize | 0;

        const min00 = heightMap.getPerformPatchMin(minPatchX, minPatchZ);
        const min01 = heightMap.getPerformPatchMin(minPatchX, maxPatchZ);
        const min10 = heightMap.getPerformPatchMin(maxPatchX, minPatchZ);
        const min11 = heightMap.getPerformPatchMin(maxPatchX, maxPatchZ);

        const max00 = heightMap.getPerformPatchMax(minPatchX, minPatchZ);
        const max01 = heightMap.getPerformPatchMax(minPatchX, maxPatchZ);
        const max10 = heightMap.getPerformPatchMax(maxPatchX, minPatchZ);
        const max11 = heightMap.getPerformPatchMax(maxPatchX, maxPatchZ);

        min.y = Math.min(min00, min01, min10, min11);
        max.y = Math.max(max00, max01, max10, max11);
    }

    private _internalFrustum(
        count: number,
        patchSize: number,
        patchMatrix: Readonly<number[]>,
        patchOffset: number,
        minMaxStore: Array<[pcx.Vec3, pcx.Vec3, boolean]>,
        offsetArr: number[],
        inverse: boolean,
        cameraPos: pcx.Vec3,
        freeze: boolean,
    ) {
        let visibleCount = 0;

        const terrainScale  = this.terrain.entity.getScale();
        const frustumPlanes = this.camera.frustum.planes;

        // 5 because lod0 + lod1 + lod2
        const step = patchSize * 2;

        // local - relative of start terrain xz
        const terrainWidth = this.terrain.object.width;
        const terrainDepth = this.terrain.object.depth;

        for (let i = 0; i < count; i++) {

            if (!minMaxStore[i]) minMaxStore[i] = [new pc.Vec3(), new pc.Vec3(), false];
            if (!freeze) {

                const patchX = patchMatrix[i * 2 + 0];
                const patchZ = patchMatrix[i * 2 + 1];
                const relativeCenterX = step * (patchX - patchOffset);
                const relativeCenterZ = step * (patchZ - patchOffset);

                const worldCenterX = cameraPos.x + relativeCenterX;
                const worldCenterZ = cameraPos.z + relativeCenterZ;

                const worldMinX = worldCenterX - patchSize;
                const worldMinZ = worldCenterZ - patchSize;
                const worldMaxX = worldCenterX + patchSize;
                const worldMaxZ = worldCenterZ + patchSize;

                const localMinX = worldMinX / terrainScale.x + terrainWidth / 2;
                const localMinZ = worldMinZ / terrainScale.z + terrainDepth / 2;
                const localMaxX = worldMaxX / terrainScale.x + terrainWidth / 2;
                const localMaxZ = worldMaxZ / terrainScale.z + terrainDepth / 2;

                let visible = false;

                if (localMaxX > 0 &&
                    localMaxZ > 0 &&
                    localMinX < terrainWidth &&
                    localMinZ < terrainDepth) {

                    minMaxStore[i][0].set(localMinX, 0, localMinZ);
                    minMaxStore[i][1].set(localMaxX, 0, localMaxZ);

                    this._updateMinMaxFromPatches(minMaxStore[i][0], minMaxStore[i][1]);

                    const worldMinY = minMaxStore[i][0].y * terrainScale.y;
                    const worldMaxY = minMaxStore[i][1].y * terrainScale.y;

                    minMaxStore[i][0].set(worldMinX, worldMinY, worldMinZ);
                    minMaxStore[i][1].set(worldMaxX, worldMaxY, worldMaxZ);

                    visible = this._checkIsVisible(minMaxStore[i][0], minMaxStore[i][1], frustumPlanes);

                    if (visible) {
                        // add start offset for patch center
                        offsetArr[visibleCount * 2 + 0] = relativeCenterX + patchSize;
                        offsetArr[visibleCount * 2 + 1] = relativeCenterZ + patchSize;
                    }
                }
                else {
                    minMaxStore[i][0].set(worldMinX, 0, worldMinZ);
                    minMaxStore[i][1].set(worldMaxX, 0, worldMaxZ);
                }

                minMaxStore[i][2] = visible;
            }

            const min = minMaxStore[i][0];
            const max = minMaxStore[i][1];
            const vis = minMaxStore[i][2];

            //if (freeze) {
                drawBox({ min, max, color: vis ? pc.Color.GREEN : pc.Color.RED });
            //}

            visibleCount += Number(vis);
        }

        if (!freeze && inverse && visibleCount > 0) {

            const hiddenCount = count - visibleCount;

            for (let i = visibleCount; i > -1; i--) {

                const indexIn = (hiddenCount + i) * 2;
                const indexOr = i * 2;

                offsetArr[indexIn + 0] = offsetArr[indexOr + 0];
                offsetArr[indexIn + 1] = offsetArr[indexOr + 1];
            }
        }

        return visibleCount;
    }

    public frustumLod1(cameraPos: pcx.Vec3, patchSize: number, freeze: boolean) {
        return this._internalFrustum(lod1PatchCount, patchSize, patchLod1Matrix, 1, this._lod1MinMaxStore, this._lod1Offsets, false, cameraPos, freeze);
    }

    public frustumLod2(cameraPos: pcx.Vec3, patchSize: number, freeze: boolean) {
        return this._internalFrustum(lod2PatchCount, patchSize, patchLod2Matrix, 2, this._lod2MinMaxStore, this._lod2Offsets, true, cameraPos, freeze);
    }

    public drawCornes(freeze: boolean) {

        if (freeze) {

            if (!this._bufferedCornes) {

                this._bufferedCornes = true;

                const cornes = this.camera.getFrustumCorners();
                const cameraMat = this.camera.node.getWorldTransform();
                for (let i = 0; i < cornes.length; i++) {
                    const ref = this._worldCornes[i].copy(cornes[i]);
                    cameraMat.transformPoint(ref, ref);
                }
            }

            for (let i = 0; i < cameraCornersIndices.length; i++) {

                const start = this._worldCornes[cameraCornersIndices[i][0]];
                const end   = this._worldCornes[cameraCornersIndices[i][1]];
                this.terrain.app.drawLine(start, end, cameraCornersColor, false);
            }
        }
        else {
            this._bufferedCornes = false;
        }
    }
}