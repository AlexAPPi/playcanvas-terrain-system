import type { int } from "../Shared/Types.mjs";
import { defaultPatchLod, IPatchLod, IPatchLodBase } from "../TerrainSystem/LodManager.mjs";
import BaseTerrain from "../TerrainSystem/Terrain.mjs";
import { ISingleLodInfo } from "../TerrainSystem/LodInfo.mjs";
import { IGridPatchInitializer } from "../TerrainSystem/GeomipGridRenderPreparer.mjs";
import { IZone } from "../TerrainSystem/IZone.mjs";
import { CustomMeshInstance } from "../EngineExtensions/Renderer.mjs";
import { ITerrainPatchesInstancing } from "./ITerrainPatchesInstancing.mjs";

export type TForEachPatchCallback = (patchIndex: int, x: int, z: int) => void | boolean;

export class TerrainPatchBufferBasic {

    readonly index: number;
    readonly x: number;
    readonly z: number;
    readonly minX: number;
    readonly minZ: number;
    readonly size: number;

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

    constructor(index: number, x: number, z: number, minX: number, minZ: number, size: number) {

        this.index = index;
        this.x     = x;
        this.z     = z;
        
        this.minX  = minX;
        this.minZ  = minZ;
        this.size  = size;
        
        this.visible = false;
        this.hash  = 0;
        this.lod = defaultPatchLod;
        this.indicesBaseIndex = 0;
        this.indicesBaseVertex = 0;
        this.indicesCount = 0;
        this.dependencesUpdated = false;
        this.heightsUpdated = false;
        this.heightsUpdatedThisFrame = false;
        this.lastChangeTime = 0;
        this.lastChangeAttachTime = 0;
        this.lastChangeHeightsTime = 0;
    }
}

export default abstract class TerrainPatchesBasic<
    TPatchBuffer extends TerrainPatchBufferBasic = TerrainPatchBufferBasic,
    TPatchPrimitive extends Record<string, any> = Record<string, any>
> {
    private _init: boolean;
    private _aabb: pcx.BoundingBox;
    private _patchAvalableCount: number;
    private _changesIds: number[];
    private _useMashesBag: boolean;

    protected _entity: pcx.Entity;
    protected _app: pcx.AppBase;
    protected _material: pcx.StandardMaterial;

    protected _lastChangeTime: number;
    protected _lastChangeAttachTime: number;
    protected _lastChangeHeightsTime: number;

    private _bufferArray: TPatchBuffer[];
    private _meshInstanceArray: Array<pcx.MeshInstance | undefined>;
    private _customMeshInstance: (pcx.MeshInstance & CustomMeshInstance<TPatchPrimitive>) | undefined;
    private _instancing: ITerrainPatchesInstancing<any> | undefined;

    public customForwardRenderer: boolean = false;

    public readonly terrain: BaseTerrain;

    public get instancing() { return this._instancing; }

    public get bufferArray(): Readonly<typeof this._bufferArray> { return this._bufferArray; }
    public get meshInstanceArray(): Readonly<typeof this._meshInstanceArray> { return this._meshInstanceArray; }
    public get aabb() { return this._aabb; }
    public get customMeshInstance() { return this._customMeshInstance; }

    public abstract heightMapTexture: pcx.Texture;

    constructor(terrain: BaseTerrain, instancer?: ITerrainPatchesInstancing<any>) {
        this.terrain = terrain;
        this.customForwardRenderer = false;
        this._useMashesBag = false;
        this._bufferArray = new Array(this.terrain.numPatchesX * this.terrain.numPatchesZ);
        this._meshInstanceArray = new Array(this.terrain.numPatchesX * this.terrain.numPatchesZ);
        this._customMeshInstance = undefined;
        this._patchAvalableCount = 0;
        this._changesIds = [];
        this._aabb = new pc.BoundingBox();
        this._init = false;
        this._instancing = instancer;
        this.updateAabb();
    }

    public setMaterial(material: pcx.StandardMaterial) {
        this._material = material;
    }

    public setInstancing(value: ITerrainPatchesInstancing<any> | undefined, updateMeshes: boolean = true) {

        if (this._instancing === value) {
            return;
        }

        this._destroyMeshes();
        this._instancing = value;

        if (updateMeshes) {
            this.updateMeshes();
        }
    }

    public updateAabb() {
        
        const halfWidth = this.terrain.width / 2;
        const halfDepth = this.terrain.depth / 2;

        this._aabb.setMinMax(
            new pc.Vec3(-halfWidth, 0,                      -halfDepth),
            new pc.Vec3(+halfWidth, this.terrain.maxHeight, +halfDepth)
        );

        if (this._customMeshInstance) {
            this._customMeshInstance.setCustomAabb(this._aabb);
            this._customMeshInstance.mesh.aabb = this._aabb;
        }

        for (const meshInstance of this._meshInstanceArray) {
            if (meshInstance) {
                meshInstance.setCustomAabb(this._aabb);
                meshInstance.mesh.aabb = this._aabb;
            }
        }
        
        if (this.instancing) {
            this.instancing.forEach(item => {
                if (item.object) {
                    item.object.setCustomAabb(this._aabb);
                    item.object.mesh.aabb = this._aabb;
                }
            });
        }
    }

    public startUpdate() {
    }

    private _forceUpdateRenderComponent(entity: pcx.Entity) {

        let append = false; // destroy prev meshInstances by default
        let meshInstances: Array<pcx.MeshInstance>;

        if (this.customForwardRenderer &&
            this._customMeshInstance) {
            this._useMashesBag = true;
            meshInstances = [this._customMeshInstance];
        }
        else {

            const count = this.instancing
                ? this.instancing.meshInstanceCount
                : this._patchAvalableCount;
            
            meshInstances = new Array<pcx.MeshInstance>(count);
                
            if (this.instancing) {
                this.instancing.appendMeshInstances(meshInstances);
            }
            else {
            
                // if instancing was used, then we delete all previous instances
                // or use custom renderer
                append = !this._useMashesBag;
            
                let i = 0;

                for (let patchIndex = 0; patchIndex < this._meshInstanceArray.length; patchIndex++) {
                    const patchMeshInstance = this._meshInstanceArray[patchIndex];
                    if (patchMeshInstance) {
                        meshInstances[i++] = patchMeshInstance;
                    }
                }

                this._changesIds.length = 0;
            }

            this._useMashesBag = !!this.instancing;
        }

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
                cull: false,
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

        if (this.customForwardRenderer ||
            this.instancing ||
            this._changesIds.length === 0 ||
            !entity.enabled) {
            return;
        }

        this._forceUpdateRenderComponent(entity);
    }

    public abstract updateIndexBuffer(): void;

    public updateLods() {
        this.updateIndexBuffer();
        this.updateMeshes();
    }

    protected _forEach(zone: IZone, quad: int, numQuadX: int, numQuadZ: int, callback: TForEachPatchCallback) {

        if (zone.maxX < 0) return;
        if (zone.maxZ < 0) return;

        const minX = Math.max(zone.minX, 0);
        const minZ = Math.max(zone.minZ, 0);
        const maxX = Math.min(zone.maxX, this.terrain.width);
        const maxZ = Math.min(zone.maxZ, this.terrain.depth);

        const minPatchX = minX / quad | 0;
        const minPatchZ = minZ / quad | 0;
        const maxPatchX = maxX / quad | 0;
        const maxPatchZ = maxZ / quad | 0;

        const normalizeMinX = Math.max(minPatchX, 0);
        const normalizeMinZ = Math.max(minPatchZ, 0);
        const normalizeMaxX = Math.min(maxPatchX + 1, numQuadX);
        const normalizeMaxZ = Math.min(maxPatchZ + 1, numQuadZ);

        for (let z = normalizeMinZ; z < normalizeMaxZ; z++) {

            for (let x = normalizeMinX; x < normalizeMaxX; x++) {

                const patchIndex = z * numQuadX + x;

                if (callback(patchIndex, x, z) === false) {
                    return;
                }
            }
        }
    }

    public forEach(zone: IZone, callback: TForEachPatchCallback) {

        this._forEach(
            zone,
            this.terrain.patchSize,
            this.terrain.numPatchesX,
            this.terrain.numPatchesZ,
            callback
        );
    }

    public updateDependencies(zone: IZone) {

        const now = performance.now();

        this.forEach(zone, (patchIndex) => {
            
            const patchBuffer = this._bufferArray[patchIndex];

            patchBuffer.lastChangeTime = now;
            patchBuffer.lastChangeAttachTime = now;
        });

        this._lastChangeTime = now;
        this._lastChangeAttachTime = now;
    }
    
    public updateHeights(zone: IZone) {

        const now = performance.now();

        this.forEach(zone, (patchIndex) => {

            const patchBuffer = this._bufferArray[patchIndex];

            patchBuffer.lastChangeTime = now;
            patchBuffer.lastChangeHeightsTime = now;
            patchBuffer.heightsUpdated = true;
        });

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

    protected abstract _createCustomBagMesh(app: pcx.AppBase, entity: pcx.Entity, material: pcx.Material, terrain: BaseTerrain): pcx.MeshInstance & CustomMeshInstance<TPatchPrimitive>;
    protected abstract _createInstancingMesh(app: pcx.AppBase, entity: pcx.Entity, material: pcx.Material, lodInfo: IPatchLodBase, primitiveInfo: ISingleLodInfo, instancer: ITerrainPatchesInstancing<any>, data: Uint16Array | Uint8Array): pcx.MeshInstance;
    protected abstract _createPatchBuffer(patchIndex: number, baseIndex: number, baseVertex: number, count: number, patchX: number, patchZ: number, minX: number, minZ: number, size: number, lod: IPatchLod): TPatchBuffer;
    protected abstract _createPatchMesh(patchIndex: number, app: pcx.AppBase, entity: pcx.Entity, material: pcx.Material): pcx.MeshInstance;
    
    protected abstract _destroyCustomBagMesh(mesh: pcx.MeshInstance): void;
    protected abstract _destroyInstancingMesh(mesh: pcx.MeshInstance): void;
    protected abstract _destroyPatchMesh(patchIndex: number): void;

    public endUpdate(hasUpdateHeights: boolean) {
        this._updateRenderComponent(this._entity);
    }

    public getOrCreatePatchMesh(patchIndex: number) {

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

    private _destroyMeshes() {

        if (this._customMeshInstance) {
            this._destroyCustomBagMesh(this._customMeshInstance);
            this._customMeshInstance = undefined;
        }

        this.instancing?.destroy((mesh) => {
            this._destroyInstancingMesh(mesh);
        });

        if (this.customForwardRenderer || this.instancing) {
            this.destroyPatchesMesh();
        }
    }

    public updateMeshes() {

        if (!this._init) {
            return;
        }

        this._destroyMeshes();
        
        if (this.customForwardRenderer) {
            this._customMeshInstance = this._createCustomBagMesh(this._app, this._entity, this._material, this.terrain);
        }
        else if (this.instancing) {
            this.instancing.buildFromTerrain(this.terrain, (lodInfo, primitiveInfo, data) => {
                return this._createInstancingMesh(this._app, this._entity, this._material, lodInfo, primitiveInfo, this.instancing!, data);
            });
        }
        else {
            this.updatePatchesMeshMaterial();
        }

        this._forceUpdateRenderComponent(this._entity);
    }

    public init(app: pcx.AppBase, entity: pcx.Entity, material: pcx.StandardMaterial) {

        if (this._init) {
            throw new Error('The terrain patches was initialized earlier');
        }

        this._init = true;
        this._app = app;
        this._entity = entity;

        // for other language use internal class
        const initializer: IGridPatchInitializer = {
            initPatch: (baseIndex: int, baseVertex: int, count: int, patchX: int, patchZ: int, minX: int, minZ: int, size: int, lodInfo: Readonly<IPatchLod>) => {
                const patchIndex = patchZ * this.terrain.numPatchesX + patchX;
                const buffer = this._createPatchBuffer(patchIndex, baseIndex, baseVertex, count, patchX, patchZ, minX, minZ, size, lodInfo);
                this._addPatchBuffer(patchIndex, buffer);
            }
        }

        this.setMaterial(material);
        this.terrain.initPatches(initializer);
        this.updateMeshes();
    }
}