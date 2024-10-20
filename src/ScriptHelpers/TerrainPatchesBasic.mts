import { RenderPatchCallback } from "../TerrainSystem/GeomipGridRenderPreparer.mjs";
import { IPatchLod } from "../TerrainSystem/LodManager.mjs";
import BaseTerrain from "../TerrainSystem/Terrain.mjs";
import { ISingleLodInfo } from "../TerrainSystem/LodInfo.mjs";
import { TerrainPathcesInstancing } from "./TerrainPatchesInstancing.mjs";
import { TInstCoordsOffsetArrType } from "../TerrainSystem/PatchInstancing.mjs";

export class TerrainPatchBufferBasic {

    readonly minX: number;
    readonly minZ: number;
    readonly size: number;

    readonly index: number;

    readonly useIndices: Uint16Array | Uint32Array | false;
    readonly useIndicesFormat: number | false;

    public visible: boolean;

    public hash: number;
    public lod: IPatchLod;
    public indicesBaseIndex: number;
    public indicesBaseVertex: number;
    public indicesCount: number;

    public dependencesUpdated: boolean;
    public heightsUpdated: boolean;
    public heightsUpdatedThisFrame: boolean;

    public lastChangeTime: number;
    public lastChangeAttachTime: number;
    public lastChangeHeightsTime: number;

    constructor(index: number, minX: number, minZ: number, size: number) {
        this.minX  = minX;
        this.minZ  = minZ;
        this.size  = size;
        this.index = index;
        this.hash  = 0;
    }
}

export default abstract class TerrainPatchesBasic<TPatchBuffer extends TerrainPatchBufferBasic = TerrainPatchBufferBasic> {

    private _init: boolean;
    private _aabb: pcx.BoundingBox;
    private _patchAvalableCount: number;
    private _changesIds: number[];
    private _prevInstancing: boolean;

    protected _entity: pcx.Entity;
    protected _app: pcx.AppBase;
    protected _material: pcx.StandardMaterial;

    protected _lastChangeTime: number;
    protected _lastChangeAttachTime: number;
    protected _lastChangeHeightsTime: number;

    private _bufferArray: TPatchBuffer[];
    private _meshInstanceArray: Array<pcx.MeshInstance | undefined>;

    public readonly terrain: BaseTerrain;
    public readonly instancing: TerrainPathcesInstancing;

    public get bufferArray(): Readonly<typeof this._bufferArray> {return this._bufferArray; }
    public get meshInstanceArray(): Readonly<typeof this._meshInstanceArray> { return this._meshInstanceArray; }
    public get aabb() { return this._aabb; }

    constructor(terrain: BaseTerrain) {
        this.terrain = terrain;
        this.instancing = new TerrainPathcesInstancing();
        this._prevInstancing = false;
        this._bufferArray = new Array(this.terrain.numPatchesX * this.terrain.numPatchesZ);
        this._meshInstanceArray = new Array(this.terrain.numPatchesX * this.terrain.numPatchesZ);
        this._patchAvalableCount = 0;
        this._changesIds = [];
        this._aabb = new pc.BoundingBox();
        this._init = false;
        this.updateAabb();
    }

    public updateAabb() {
        
        const halfWidth = this.terrain.width / 2;
        const halfDepth = this.terrain.depth / 2;

        this._aabb.setMinMax(
            new pc.Vec3(-halfWidth, this.terrain.minHeight, -halfDepth),
            new pc.Vec3(+halfWidth, this.terrain.maxHeight, +halfDepth)
        );

        for (const meshInstance of this._meshInstanceArray) {
            if (meshInstance) {
                meshInstance.aabb = this._aabb;
            }
        }
        
        if (this.instancing.enabled) {
            this.instancing.forEach(item => {
                if (item.object) {
                    item.object.aabb = this._aabb;
                }
            });
        }
    }

    public startRender() {
    }

    private _forceUpdateRenderComponent(entity: pcx.Entity) {

        // if instancing was used, then we delete all previous instances
        let append = !this._prevInstancing;

        const count = this.instancing.enabled ? this.instancing.meshInstanceCount : this._patchAvalableCount;
        const meshInstances = new Array<pcx.MeshInstance>(count);

        if (this.instancing.enabled) {
            this.instancing.appendMeshInstances(meshInstances);
            append = false; // always destroy prev meshInstances
        }
        else {
            let i = 0;

            for (let patchIndex = 0; patchIndex < this._meshInstanceArray.length; patchIndex++) {
                const patchMeshInstance = this._meshInstanceArray[patchIndex];
                if (patchMeshInstance) {
                    meshInstances[i++] = patchMeshInstance;
                }
            }

            this._changesIds.length = 0;
        }

        this._prevInstancing = this.instancing.enabled;

        if (entity.render) {

            // TODO: https://github.com/playcanvas/engine/issues/6680
            if (append) {
                // @ts-ignore
                entity.render._meshInstances = [];
            }

            entity.render.meshInstances = meshInstances;
        }
        else {
            entity.addComponent('render', {
                meshInstances: meshInstances,
            });
        }

        // Update shadows
        for (const meshInstance of meshInstances) {
            meshInstance.cull = false;
            meshInstance.castShadow = false;
            meshInstance.receiveShadow = false;
        }
    }
    
    private _updateRenderComponent(entity: pcx.Entity) {

        if (!entity.enabled || this.instancing.enabled || this._changesIds.length === 0) {
            return;
        }

        this._forceUpdateRenderComponent(entity);
    }

    public abstract updateIndexBuffer(): void;

    public updateLods() {
        this.updateIndexBuffer();
        this.updateMeshes();
    }

    public updateDependencies(minX: number, maxX: number, minZ: number, maxZ: number) {

        if (maxX < 0) return;
        if (maxZ < 0) return;

        if (minX < 0) minX = 0;
        if (minZ < 0) minZ = 0;
        if (maxX > this.terrain.width) maxX = this.terrain.width;
        if (maxZ > this.terrain.depth) maxZ = this.terrain.depth;

        const minPatchX = Math.ceil(minX / this.terrain.patchSize) - (minX % this.terrain.patchSize > 0 ? 1 : 0);
        const minPatchZ = Math.ceil(minZ / this.terrain.patchSize) - (minZ % this.terrain.patchSize > 0 ? 1 : 0);
        const maxPatchX = Math.ceil(maxX / this.terrain.patchSize) - (maxX % this.terrain.patchSize > 0 ? 1 : 0);
        const maxPatchZ = Math.ceil(maxZ / this.terrain.patchSize) - (maxZ % this.terrain.patchSize > 0 ? 1 : 0);

        const normalizeMinX = Math.max(minPatchX, 0);
        const normalizeMinZ = Math.max(minPatchZ, 0);
        const normalizeMaxX = Math.min(maxPatchX + 1, this.terrain.numPatchesX);
        const normalizeMaxZ = Math.min(maxPatchZ + 1, this.terrain.numPatchesZ);
        const now = performance.now();

        for (let z = normalizeMinZ; z < normalizeMaxZ; z++) {

            for (let x = normalizeMinX; x < normalizeMaxX; x++) {

                const patchIndex = z * this.terrain.numPatchesX + x;
                const patchBuffer = this._bufferArray[patchIndex];

                patchBuffer.lastChangeTime = now;
                patchBuffer.lastChangeAttachTime = now;
            }
        }

        this._lastChangeTime = now;
        this._lastChangeAttachTime = now;
    }

    public updateHeights(minX: number, maxX: number, minZ: number, maxZ: number) {

        if (maxX < 0) return;
        if (maxZ < 0) return;

        if (minX < 0) minX = 0;
        if (minZ < 0) minZ = 0;
        if (maxX > this.terrain.width) maxX = this.terrain.width;
        if (maxZ > this.terrain.depth) maxZ = this.terrain.depth;

        const minPatchX = Math.ceil(minX / this.terrain.patchSize) - (minX % this.terrain.patchSize > 0 ? 1 : 0);
        const minPatchZ = Math.ceil(minZ / this.terrain.patchSize) - (minZ % this.terrain.patchSize > 0 ? 1 : 0);
        const maxPatchX = Math.ceil(maxX / this.terrain.patchSize) - (maxX % this.terrain.patchSize > 0 ? 1 : 0);
        const maxPatchZ = Math.ceil(maxZ / this.terrain.patchSize) - (maxZ % this.terrain.patchSize > 0 ? 1 : 0);

        const normalizeMinX = Math.max(minPatchX, 0);
        const normalizeMinZ = Math.max(minPatchZ, 0);
        const normalizeMaxX = Math.min(maxPatchX + 1, this.terrain.numPatchesX);
        const normalizeMaxZ = Math.min(maxPatchZ + 1, this.terrain.numPatchesZ);
        const now = performance.now();

        for (let z = normalizeMinZ; z < normalizeMaxZ; z++) {

            for (let x = normalizeMinX; x < normalizeMaxX; x++) {

                const patchIndex  = z * this.terrain.numPatchesX + x;
                const patchBuffer = this._bufferArray[patchIndex];

                patchBuffer.lastChangeTime = now;
                patchBuffer.lastChangeHeightsTime = now;
                patchBuffer.heightsUpdated = true;
            }
        }

        this._lastChangeTime = now;
        this._lastChangeHeightsTime = now;
    }

    private _addPatchBuffer(patchIndex: number, buffer: TPatchBuffer) {

        if (this._bufferArray[patchIndex]) {
            throw new Error('Buffer has already been added');
        }

        this._bufferArray[patchIndex] = buffer;
    }

    private _addPatchMeshInstance(patchIndex: number, meshInstance: pcx.MeshInstance) {

        if (this._meshInstanceArray[patchIndex]) {
            throw new Error('Mesh instance has already been added');
        }

        this._meshInstanceArray[patchIndex] = meshInstance;
        this._changesIds.push(patchIndex);
        this._patchAvalableCount++;
    }

    protected abstract _createInstancingMesh(app: pcx.AppBase, entity: pcx.Entity, material: pcx.Material, lodInfo: IPatchLod, primitiveInfo: ISingleLodInfo, data: TInstCoordsOffsetArrType): pcx.MeshInstance;
    protected abstract _createPatchBuffer(patchIndex: number, baseIndex: number, baseVertex: number, count: number, patchX: number, patchZ: number, minX: number, minZ: number, size: number, lod: IPatchLod): TPatchBuffer;
    protected abstract _createPatchMesh(patchIndex: number, app: pcx.AppBase, entity: pcx.Entity, material: pcx.Material): pcx.MeshInstance;
    
    protected abstract _destroyInstancingMesh(mesh: pcx.MeshInstance): void;
    protected abstract _destroyPatchMesh(patchIndex: number): void;

    public endRender(hasUpdateHeights: boolean) {
        this._updateRenderComponent(this._entity);
    }

    public createOrGetPatchMesh(patchIndex: number) {

        let patch = this._meshInstanceArray[patchIndex];
        if (!patch) {
            patch = this._createPatchMesh(patchIndex, this._app, this._entity, this._material);
            this._addPatchMeshInstance(patchIndex, patch);
        }

        return patch;
    }

    public destroyPatchMesh(patchIndex: number) {

        this._destroyPatchMesh(patchIndex);

        const patchMeshInstance = this._meshInstanceArray[patchIndex];

        if (patchMeshInstance) {

            this._patchAvalableCount--;
            this._changesIds.push(patchIndex);

            delete this._meshInstanceArray[patchIndex];
        }
    }

    public destroyPatchesMesh() {
        for (let z = 0; z < this.terrain.numPatchesZ; z++) {
            for (let x = 0; x < this.terrain.numPatchesX; x++) {
                const index = z * this.terrain.numPatchesX + x;
                this.destroyPatchMesh(index);
            }
        }
    }

    public updatePatchesMeshMaterial() {
        for (let z = 0; z < this.terrain.numPatchesZ; z++) {
            for (let x = 0; x < this.terrain.numPatchesX; x++) {

                const index = z * this.terrain.numPatchesX + x;
                const meshInstance = this._meshInstanceArray[index];

                if (meshInstance) {
                    meshInstance.material = this._material;
                }
            }
        }
    }

    public updateMeshes() {

        if (!this._init) {
            return;
        }

        this.instancing.destroy((mesh) => {
            this._destroyInstancingMesh(mesh);
        });

        if (this.instancing.enabled) {
            this.destroyPatchesMesh();
            this.instancing.buildFromTerrain(this.terrain, (lodInfo, primitiveInfo, data) => {
                return this._createInstancingMesh(this._app, this._entity, this._material, lodInfo, primitiveInfo, data);
            });
        }
        else {
            this.updatePatchesMeshMaterial();
        }

        this._forceUpdateRenderComponent(this._entity);
    }

    public updateMaterial(material: pcx.StandardMaterial) {
        this._material = material;
    }

    public update(app: pcx.AppBase, entity: pcx.Entity, material: pcx.StandardMaterial) {

        this._init = true;
        this._app = app;
        this._entity = entity;

        const patchCallback: RenderPatchCallback = (visible, baseIndex, baseVertex, count, patchX, patchZ, minX, minZ, size, lod) => {
            const patchIndex = patchZ * this.terrain.numPatchesX + patchX;
            const buffer = this._createPatchBuffer(patchIndex, baseIndex, baseVertex, count, patchX, patchZ, minX, minZ, size, lod);
            this._addPatchBuffer(patchIndex, buffer);
        }

        this.updateMaterial(material);
        this.terrain.initPatches(patchCallback);
        this.updateMeshes();
    }
}