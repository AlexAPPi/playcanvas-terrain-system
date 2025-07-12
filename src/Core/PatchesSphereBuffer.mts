import type { float, int } from "../Extras/Types.mjs";
import type { IReadonlyAbsShatteredHeightMap } from "./AbsShatteredHeightMap.mjs";
import type { IZone } from "./IZone.mjs";

export const bufferItemSize = 4; // (x, y, z, radius)

// Our system is divided into a general part and an engine part,
// for optimization we use the engine part in this file. (playcanvas Vec3, Mat4, BoundingSphere)

export default class PatchesSphereBuffer {

    private _scale: pcx.Vec3;
    private _matrix: pcx.Mat4;
    private _heightMap: IReadonlyAbsShatteredHeightMap;
    private _localBuffer: number[];
    private _worldSpheres: pcx.BoundingSphere[];

    public get heightMap() { return this._heightMap; }
    public get buffer() { return this._localBuffer; }
    public get spheres() { return this._worldSpheres; }

    constructor(heightMap: IReadonlyAbsShatteredHeightMap, matrix?: pcx.Mat4) {
        this._heightMap = heightMap;
        this._localBuffer = new Array<number>(this._heightMap.numPatchesX * this._heightMap.numPatchesZ * bufferItemSize);
        this._localBuffer.fill(0);
        this._scale = new pc.Vec3();
        this._matrix = new pc.Mat4();
        this._initWorldSpheres();
        this.setMatrix(matrix ?? pc.Mat4.IDENTITY, false);
    }

    protected _initWorldSpheres() {

        this._worldSpheres = new Array<pcx.BoundingSphere>(this._heightMap.numPatchesX * this._heightMap.numPatchesZ);

        for (let patchZ = 0; patchZ < this._heightMap.numPatchesZ; patchZ++) {

            for (let patchX = 0; patchX < this._heightMap.numPatchesX; patchX++) {

                const index = patchX + patchZ * this._heightMap.numPatchesX;

                this._worldSpheres[index] = new pc.BoundingSphere(); 
            }
        }
    }

    public setMatrix(matrix: pcx.Mat4, recalculate: boolean = true) {

        this._matrix.copy(matrix);
        this._matrix.getScale(this._scale);

        if (recalculate) {
            this._recalculateWorldBoundingSpheres();
        }
    }
    
    public patchVisible(patchX: int, patchZ: int, margin: float, frustum: pcx.Frustum) {
        
        const sphereIdx = patchX + patchZ * this._heightMap.numPatchesX;
        const sphere = this._worldSpheres[sphereIdx];
        const prevRadius = sphere.radius;

        sphere.radius *= margin;

        const result = frustum.containsSphere(sphere);

        sphere.radius = prevRadius;

        return result > 0;
    }

    public recalculate() {

        for (let patchZ = 0; patchZ < this._heightMap.numPatchesZ; patchZ++) {

            for (let patchX = 0; patchX < this._heightMap.numPatchesX; patchX++) {

                this.recalculateBoundingSphere(patchX, patchZ);
            }
        }
    }

    public recalculateZone(zone: IZone): void {
        
        if (zone.maxX < 0) return;
        if (zone.maxZ < 0) return;

        const fixedMinX = Math.max(zone.minX, 0);
        const fixedMinZ = Math.max(zone.minZ, 0);
        const fixedMaxX = Math.min(zone.maxX, this._heightMap.width);
        const fixedMaxZ = Math.min(zone.maxZ, this._heightMap.depth);

        for (let z = fixedMinZ; z < fixedMaxZ; z += this._heightMap.patchSize) {
            
            for (let x = fixedMinX; x < fixedMaxX; x += this._heightMap.patchSize) {

                const patchX = x / this._heightMap.patchSize | 0;
                const patchZ = z / this._heightMap.patchSize | 0;

                this.recalculateBoundingSphere(patchX, patchZ);
            }
        }
    }

    public recalculateBoundingSphere(patchX: int, patchZ: int) {

        const index = (patchX + patchZ * this._heightMap.numPatchesX) * bufferItemSize;

        const patchMinHeight = this._heightMap.getPatchMin(patchX, patchZ);
        const patchMaxHeight = this._heightMap.getPatchMax(patchX, patchZ);
        
        const patchRadiusBySize   = this._heightMap.patchSize / 2;
        const patchRediusByHeight = (patchMaxHeight - patchMinHeight) / 2;

        const patchCenterX = (patchX * this._heightMap.patchSize) + patchRadiusBySize;
        const patchCenterY = (patchMaxHeight + patchMinHeight) / 2;
        const patchCenterZ = (patchZ * this._heightMap.patchSize) + patchRadiusBySize;
        const radius       = (patchRadiusBySize > patchRediusByHeight ? patchRadiusBySize : patchRediusByHeight) * Math.SQRT2;

        // We construct coordinates relative to the center of the height map

        this._localBuffer[index + 0] = patchCenterX + this._heightMap.width / -2;
        this._localBuffer[index + 1] = patchCenterY;
        this._localBuffer[index + 2] = patchCenterZ + this._heightMap.depth / -2;
        this._localBuffer[index + 3] = radius;
        
        this._recalculateWorldBoundingSphere(patchX, patchZ);
    }

    private _recalculateWorldBoundingSpheres() {

        for (let patchZ = 0; patchZ < this._heightMap.numPatchesZ; patchZ++) {

            for (let patchX = 0; patchX < this._heightMap.numPatchesX; patchX++) {

                this._recalculateWorldBoundingSphere(patchX, patchZ);
            }
        }
    }

    private _recalculateWorldBoundingSphere(patchX: int, patchZ: int) {

        const sphereIdx = patchX + patchZ * this._heightMap.numPatchesX;
        const bufferIdx = sphereIdx * bufferItemSize;
        const locRadius = this._localBuffer[bufferIdx + 3];
        const wrlSphere = this._worldSpheres[sphereIdx];

        wrlSphere.center.set(
            this._localBuffer[bufferIdx + 0],
            this._localBuffer[bufferIdx + 1],
            this._localBuffer[bufferIdx + 2]
        );

        wrlSphere.radius = Math.sqrt(
            (this._scale.x * locRadius) ** 2 +
            (this._scale.y * locRadius) ** 2 +
            (this._scale.z * locRadius) ** 2
        );

        this._matrix.transformPoint(wrlSphere.center, wrlSphere.center);
    }
}