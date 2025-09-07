import SquareIterator from "../Core/SquareIterator.mjs";
import type { IPatchInstancing } from "./IPatchInstancing.mjs";
import MeshInstanceFactory from "./MeshInstanceFactory.mjs";
import PatchCombineInstancing from "./PatchCombineInstancing.mjs";
import PatchInstancing from "./PatchInstancing.mjs";
import { patchInstCoordOffsetAttrName, type TInstancingType, vertexCoordAttrName } from "./ShaderChunks.mjs";

export default class EntityPatchesMesh extends SquareIterator {

    public static createMaterial(): pcx.StandardMaterial {

        const material = new pc.StandardMaterial();
              material.name = "HeightfieldMaterial";

        material.setAttribute(patchInstCoordOffsetAttrName, pc.SEMANTIC_ATTR10);
        material.setAttribute(vertexCoordAttrName, pc.SEMANTIC_POSITION);

        return material;
    }

    protected readonly _patchSize: number;
    protected readonly _numPatchesX: number;
    protected readonly _numPatchesZ: number;

    private _layerName: string;
    private _entity: pcx.Entity;
    private _material: pcx.StandardMaterial;
    private _meshFactory: MeshInstanceFactory;
    private _patchAvalableCount: number;
    private _changesIds: number[];
    private _meshInstanceArray: Array<pcx.MeshInstance | undefined>;
    private _instancingType: TInstancingType;
    private _instancing: IPatchInstancing<any> | undefined;
    private _prevUseMeshBag: boolean;

    public get instancing() { return this._instancing; }
    public get meshFactory() { return this._meshFactory; }
    public get meshInstanceArray(): Readonly<typeof this._meshInstanceArray> { return this._meshInstanceArray; }
    public get aabb() { return this._meshFactory.aabb; }
    public get material() { return this._material; }
    public get entity() { return this._entity; }

    public get patchSize() { return this._patchSize; }
    public get numPatchesX() { return this._numPatchesX; }
    public get numPatchesZ() { return this._numPatchesZ; }

    public get layerName() { return this._layerName; }
    public set layerName(value: string) {

        const update = this._layerName !== value;
        this._layerName = value;

        if (update) {
            this._forceUpdateRenderComponent();
            this._updateLayer();
        }
    }
    
    constructor(meshFactory: MeshInstanceFactory, entity: pcx.Entity, layerName: string) {

        super(meshFactory.buffersManager.heightMap.field);

        this._patchSize   = this.field.patchSize;
        this._numPatchesX = this.field.numPatchesX;
        this._numPatchesZ = this.field.numPatchesZ;

        this._layerName = layerName;
        this._entity = entity;
        this._material = EntityPatchesMesh.createMaterial();
        this._meshFactory = meshFactory;
        this._patchAvalableCount = 0;
        this._changesIds = [];
        this._instancingType = false;
        this._prevUseMeshBag = false;
        this._meshInstanceArray = new Array(this._numPatchesX * this._numPatchesZ);

        this._meshFactory.bindDependenciesToMaterial(this.instancing, this._material, true);
    }

    private _updateLayer() {

        if (this._entity.render) {

            const app = this._meshFactory.buffersManager.heightMap.app;
            const layer = app.scene.layers.getLayerByName(this._layerName);

            this._entity.render.layers = [layer!.id];
        }
    }

    protected _updateMeshInstanceForRender(meshInstances: pcx.MeshInstance[]) {
        for (let i = 0; i < meshInstances.length; i++) {
            const meshInstance = meshInstances[i];
            meshInstance.cull = false;
            meshInstance.visible = false;
            meshInstance.castShadow = false;
            meshInstance.receiveShadow = true;
        }
    }

    protected _createRenderComponent(meshInstances: pcx.MeshInstance[]) {
        this._entity.addComponent('render', {
            meshInstances: meshInstances,
            castShadows: false,
            castShadowsLightmap: false,
            receiveShadows: true,
        });
    }

    protected _updateRenderComponent(append: boolean, meshInstances: pcx.MeshInstance[]) {

        // TODO: https://github.com/playcanvas/engine/issues/6680
        if (append) {
            (this._entity.render as any)._meshInstances.length = 0;
        }

        this._entity.render!.meshInstances = meshInstances;
    }

    private _forceUpdateRenderComponent() {

        let append = false; // destroy prev meshInstances by default

        const count = this.instancing
            ? this.instancing.meshInstanceCount
            : this._patchAvalableCount;
            
        const meshInstances = new Array<pcx.MeshInstance>(count);
                
        if (this.instancing) {
            this.instancing.appendMeshInstances(meshInstances);
        }
        else {
        
            // if instancing was used, then we delete all previous instances
            // or use custom renderer
            append = !this._prevUseMeshBag;
        
            let i = 0;

            for (let patchIndex = 0; patchIndex < this._meshInstanceArray.length; patchIndex++) {
                const patchMeshInstance = this._meshInstanceArray[patchIndex];
                if (patchMeshInstance) {
                    meshInstances[i++] = patchMeshInstance;
                }
            }

            this._changesIds.length = 0;
        }

        this._prevUseMeshBag = !!this.instancing;

        if (this._entity.render) {
            this._updateRenderComponent(append, meshInstances);
        }
        else {
            this._createRenderComponent(meshInstances);
            this._updateLayer();
        }

        this._updateMeshInstanceForRender(meshInstances);
    }

    public updateAabb() {

        for (const meshInstance of this._meshInstanceArray) {
            if (meshInstance) {
                meshInstance.mesh.aabb = this._meshFactory.aabb;
            }
        }
        
        this.instancing?.forEach(item => {
            if (item.object) {
                item.object.mesh.aabb = this._meshFactory.aabb;
            }
        });
    }

    public updateRenderComponent() {

        if (this.instancing || this._changesIds.length === 0 || !this._entity.enabled) {
            return;
        }

        this._forceUpdateRenderComponent();
    }

    private _addPatchMeshInstance(patchIndex: number, meshInstance: pcx.MeshInstance) {

        if (this._meshInstanceArray[patchIndex]) {
            throw new Error('Mesh instance has already been added');
        }

        this._meshInstanceArray[patchIndex] = meshInstance;
        this._changesIds.push(patchIndex);
        this._patchAvalableCount++;
    }

    public getOrCreatePatchMesh(patchIndex: number) {

        let patch = this._meshInstanceArray[patchIndex];
        if (!patch) {
            patch = this._meshFactory.createPatchMesh(patchIndex, this._entity, this._material);
            this._addPatchMeshInstance(patchIndex, patch);
        }

        return patch;
    }

    public destroyPatchMesh(patchIndex: number) {

        const patchMeshInstance = this._meshInstanceArray[patchIndex];

        if (patchMeshInstance) {

            this._meshFactory.destroyMesh(patchMeshInstance);

            this._patchAvalableCount--;
            this._changesIds.push(patchIndex);

            delete this._meshInstanceArray[patchIndex];
        }
    }

    public destroyInstancingPatchesMesh() {
        this._instancing?.destroy((mesh) => {
            this._meshFactory.destroyMesh(mesh);
        });
    }

    public destroyPatchesMesh() {
        for (let i = 0; i < this._meshInstanceArray.length; i++) {
            this.destroyPatchMesh(i);
        }
    }

    private _clearMeshes() {

        // Destroy for recreate
        this.destroyInstancingPatchesMesh();

        // Destroy patches meshes, they will not be used in custom or instanced rendering
        if (this._instancing) {
            this.destroyPatchesMesh();
        }
    }

    public setInstancingType(type: TInstancingType) {

        if (this._instancingType === type) {
            return;
        }

        this._clearMeshes();
        this._instancingType = type;
        this._instancing = type === 'combine' ? new PatchCombineInstancing() :
                           type === 'simple'  ? new PatchInstancing() :
                           undefined;

        this._meshFactory.bindDependenciesToMaterial(this._instancing, this._material, true);

        this.updateMeshes();
    }

    public updatePatchesMeshMaterial() {

        const field = this._meshFactory.buffersManager.heightMap.field;
        const numPatchesX = field.numPatchesX;
        const numPatchesZ = field.numPatchesZ;

        for (let z = 0; z < numPatchesZ; z++) {

            for (let x = 0; x < numPatchesX; x++) {

                const index = z * numPatchesX + x;
                const meshInstance = this._meshInstanceArray[index];

                if (meshInstance) {
                    meshInstance.material = this._material;
                }
            }
        }
    }

    public updateMeshes() {

        this._clearMeshes();
        
        if (this.instancing) {
            this.instancing.build(this._meshFactory.buffersManager.heightMap.field, (lodInfo, primitiveInfo, data) => {
                return this._meshFactory.createInstancingMesh(this._entity, this._material, lodInfo, primitiveInfo, this.instancing!, data);
            });
        }
        else {
            this.updatePatchesMeshMaterial();
        }

        this._forceUpdateRenderComponent();
    }

    public destroy() {
        this.destroyPatchesMesh();
        this.destroyInstancingPatchesMesh();
        this._material.destroy();
        this._entity.destroy();
    }
}