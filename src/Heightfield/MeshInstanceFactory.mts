import type { IPatchLodBase } from "../Core/IPatchLod.mjs";
import type { ISingleLodInfo } from "../Core/LodInfo.mjs";
import type { IPatchInstancing } from "./IPatchInstancing.mjs";
import { getFieldShaderChunks, patchCoordOffsetParamName, patchInstCoordOffsetAttrName, patchLodCoreParamName, heightMapParamName, vertexCoordAttrName } from "./ShaderChunks.mjs";
import PatchCombineInstancing from "./PatchCombineInstancing.mjs";
import PatchInstancing from "./PatchInstancing.mjs";
import GPUWireframeBufferManager from "./GPUWireframeBuffersManager.mjs";
import GPUBuffersManager from "./GPUBuffersManager.mjs";

export default class MeshInstanceFactory {

    private _aabb: pcx.BoundingBox;
    private _buffersManager: GPUBuffersManager;
    private _wireframeBuffersManager: GPUWireframeBufferManager;

    public get aabb() { return this._aabb; }
    public get buffersManager() { return this._buffersManager; }
    public get wireframeBuffersManager() { return this._wireframeBuffersManager; }

    constructor(buffersManager: GPUBuffersManager, wireframeBuffersManager: GPUWireframeBufferManager) {
        this._aabb = new pc.BoundingBox();
        this._buffersManager = buffersManager;
        this._wireframeBuffersManager = wireframeBuffersManager;
        this.updateAabb();
    }

    public updateAabb() {
        
        const field     = this._buffersManager.heightMap.field;
        const halfWidth = field.width / 2;
        const halfDepth = field.depth / 2;

        this._aabb.setMinMax(
            new pc.Vec3(-halfWidth, 0,               -halfDepth),
            new pc.Vec3(+halfWidth, field.maxHeight, +halfDepth)
        );
    }

    public createInstancingMesh(entity: pcx.Entity, material: pcx.Material, lodInfo: IPatchLodBase, primitiveInfo: ISingleLodInfo, instancer: IPatchInstancing<any>, data: Uint16Array | Uint8Array): pcx.MeshInstance {

        const graphicsDevice = this._buffersManager.heightMap.app.graphicsDevice;
        const patchMesh = new pc.Mesh(graphicsDevice);
        const primitive = patchMesh.primitive[0];
        const instancingBuf = this._buffersManager.buildInstancingVertexBuffer(instancer, data);

        patchMesh.aabb = this.aabb;
        patchMesh.indexBuffer[0] = this._buffersManager.sharedIndexBuffer;
        patchMesh.vertexBuffer   = this._buffersManager.sharedVertexBuffer;

        primitive.type = pc.PRIMITIVE_TRIANGLES;
        primitive.base = primitiveInfo.start;
        primitive.count = primitiveInfo.count;
        primitive.indexed = true;

        const patchMeshInstance = new pc.MeshInstance(patchMesh, material, entity);

        patchMeshInstance.cull = false;
        patchMeshInstance.visible = false;
        patchMeshInstance.visibleThisFrame = false;
        patchMeshInstance.castShadow = false;
        patchMeshInstance.receiveShadow = false;

        patchMeshInstance.setParameter(patchLodCoreParamName, lodInfo.core, 0xffffffff);
        patchMeshInstance.setInstancing(instancingBuf, false);

        return patchMeshInstance;
    }

    public createPatchMesh(patchIndex: number, entity: pcx.Entity, material: pcx.Material): pcx.MeshInstance {

        const field = this._buffersManager.heightMap.field;
        const graphicsDevice = this._buffersManager.heightMap.app.graphicsDevice;

        const patchMesh = new pc.Mesh(graphicsDevice);
        const primitive = patchMesh.primitive[0];

        patchMesh.aabb = this.aabb;
        patchMesh.indexBuffer[0] = this._buffersManager.sharedIndexBuffer;
        patchMesh.vertexBuffer   = this._buffersManager.sharedVertexBuffer;

        primitive.type = pc.PRIMITIVE_TRIANGLES;
        primitive.base = 0;
        primitive.count = 0;
        primitive.indexed = true;

        const patchMeshInstance = new pc.MeshInstance(patchMesh, material, entity);

        patchMeshInstance.cull = false;
        patchMeshInstance.visible = false;
        patchMeshInstance.visibleThisFrame = false;
        patchMeshInstance.castShadow = false;
        patchMeshInstance.receiveShadow = false;

        const patchX = patchIndex % field.numPatchesX;
        const patchZ = patchIndex / field.numPatchesX | 0;

        const minX = patchX * (field.patchSize - 1);
        const minZ = patchZ * (field.patchSize - 1);

        patchMeshInstance.setParameter(patchCoordOffsetParamName, [minX, minZ], 0xffffffff);
        patchMeshInstance.setInstancing(null);

        return patchMeshInstance;
    }

    public destroyMesh(meshInstance: pcx.MeshInstance) {
    
        // dont destroy shared index and vertex buffers and wireframe shared index buffer
        if (meshInstance.mesh) {
            meshInstance.mesh.indexBuffer = [null] as unknown as pcx.IndexBuffer[];
            meshInstance.mesh.vertexBuffer = null as unknown as pcx.VertexBuffer;
        }

        meshInstance.destroy();
        meshInstance.mesh?.destroy();

        if (meshInstance.instancingData) {
            
            meshInstance.instancingData.destroy?.();
            meshInstance.instancingData.vertexBuffer?.destroy();
        }
    }

    public bindDependenciesToMaterial(instancing: IPatchInstancing<any> | undefined, material: pcx.StandardMaterial, update: boolean = true) {

        const heightMapBuffer = this._buffersManager.heightMap;
        const instancingType =  instancing instanceof PatchCombineInstancing ? 'combine' :
                                instancing instanceof PatchInstancing ? 'simple' :
                                false;

        material.setAttribute(patchInstCoordOffsetAttrName, pc.SEMANTIC_ATTR10);
        material.setAttribute(vertexCoordAttrName, pc.SEMANTIC_POSITION);
        material.setParameter(heightMapParamName, heightMapBuffer.texture);
        material.setParameter(patchLodCoreParamName, 0);

        if (instancingType) {
            material.deleteParameter(patchCoordOffsetParamName);
        }
        else {
            material.setParameter(patchCoordOffsetParamName, [0, 0]);
        }

        const pcVersion = `v${pc.version[0]}` as unknown as any;
        const field = heightMapBuffer.field;
        const chunksStore = getFieldShaderChunks({
            width: field.width,
            depth: field.depth,
            patchSize: field.patchSize,
            heightMapChunkSize: field.heightMap.dataChunkSize,
            heightMapFormat: heightMapBuffer.format,
            engineVersion: pcVersion,
            instancing: instancingType,
        });
        
        const chunkNames = Object.keys(chunksStore);
        const shaderChunks = material.getShaderChunks?.(pc.SHADERLANGUAGE_GLSL);

        if (shaderChunks) {

            for (let chunkName of chunkNames) {
                shaderChunks.set(chunkName, chunksStore[chunkName]);
            }
            
            material.shaderChunksVersion = pc.CHUNKAPI_1_70;
        }
        else {

            const chunks: Record<string, string> = material.chunks;

            for (let chunkName of chunkNames) {
                chunks[chunkName] = chunksStore[chunkName];
            }
            
            chunks.APIVersion = pc.CHUNKAPI_1_70;
        }

        if (update) {
            material.update();
        }
    }
}