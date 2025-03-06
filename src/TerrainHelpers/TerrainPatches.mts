import { IPatchLod } from "../TerrainSystem/LodManager.mjs";
import { coordsVertexSize, IReadonlyCoordsBuffer } from "../TerrainSystem/CoordsBuffer.mjs";
import TerrainPatchesBasic, { TerrainPatchBufferBasic } from "./TerrainPatchesBasic.mjs";
import { patchCoordOffsetParamName, terrainHeightMapParamName, getTerrainShaderChunks, vertexCoordAttrName, patchLodCoreParamName, patchInstCoordOffsetParamName, getTextureType } from "./TerrainPatchesShaderChunks.mjs";
import { int } from "../Shared/Types.mjs";
import { ISingleLodInfo } from "../TerrainSystem/LodInfo.mjs";
import { instDataSize, TInstCoordsOffsetArrType } from "../TerrainSystem/PatchInstancing.mjs";
import { IZone } from "../TerrainSystem/IZone.mjs";
import { IReadonlyAbsHeightMap, THeightMapFormat } from "../TerrainSystem/AbsHeightMap.mjs";
import CompressedPatchedHeightMap from "../TerrainSystem/CompressedPatchedHeightMap.mjs";
import BaseTerrain from "../TerrainSystem/Terrain.mjs";
import { CustomMesh, CustomMeshInstance, IPrimitive } from "../EngineExtensions/Renderer.mjs";

export interface IPatchPrimitive {
    [patchCoordOffsetParamName]: [number, number] | Float32Array,
    [patchLodCoreParamName]: number,
}

export function getHeightMapFormat(graphicsDevice: pcx.GraphicsDevice, heightMap: IReadonlyAbsHeightMap) {

    // TODO: check support float32 texture
    let hmFormat: THeightMapFormat = 'rgba';

    if (heightMap instanceof CompressedPatchedHeightMap) {
        hmFormat = heightMap.compressAlgoritm === 'x4' ? 'rgbaX4' : 'rgbaX2';
    }

    return hmFormat;
}

export function getHeightMapChunkBufferType(graphicsDevice: pcx.GraphicsDevice, format: number) {

    if (format === pc.PIXELFORMAT_RG16U) {
        return Uint16Array;
    }

    return Uint8Array;
}

export default class TerrainPatches extends TerrainPatchesBasic<TerrainPatchBufferBasic, IPatchPrimitive> {

    private _heightMap: pcx.Texture;
    private _heightMapLevelsType: Float32ArrayConstructor | Uint16ArrayConstructor | Uint8ArrayConstructor;
    private _sharedIndexBuffer: pcx.IndexBuffer;
    private _sharedVertexBuffer: pcx.VertexBuffer;

    public get heightMapTexture() { return this._heightMap; }

    private _updatePatchHeightsOnGPU(patchX: int, patchZ: int) {

        // TODO: a batch update may be required.

        // TODO: transform in heightmap class
        const dataChunkSize = this.terrain.heightMap.dataChunkSize;
        const factor        = this.terrain.heightMap.dataChunkSizeFactor;
        const dataChunkX    = patchX * factor | 0;
        const dataChunkZ    = patchZ * factor | 0;

        const level  = this.terrain.heightMap.getChunkIndex(dataChunkX, dataChunkZ);
        const buffer = this.terrain.heightMap.getChunkBuffer(this._heightMapLevelsType, dataChunkX, dataChunkZ);

        if (this._app.graphicsDevice.isWebGL2) {

            const gl = (this._app.graphicsDevice as pcx.WebglGraphicsDevice).gl;
            const textureFormat = this._heightMap.impl._glFormat;
            const texturePixelT = this._heightMap.impl._glPixelType;
            const textureTarget = this._heightMap.impl._glTarget;
            const textureObject = this._heightMap.impl._glTexture;

            gl.bindTexture(textureTarget, textureObject);
            gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, level, dataChunkSize, dataChunkSize, 1, textureFormat, texturePixelT, buffer);
        }
        else if (this._app.graphicsDevice.isWebGPU) {

            const webgpu  = (this._app.graphicsDevice as any).wgpu as GPUDevice;
            const texture = (this._heightMap.impl.gpuTexture) as GPUTexture;

            webgpu.queue.writeTexture(
                {
                    texture: texture,
                    origin: [0, 0, level],
                    mipLevel: 0
                },
                buffer,
                {
                    offset: 0,
                    bytesPerRow: 4 * dataChunkSize, // always 4 for rgba format
                    rowsPerImage: dataChunkSize
                },
                {
                    width: dataChunkSize,
                    height: dataChunkSize
                }
            );
        }
    }

    private _updateHeightMap(zone: IZone) {
        this.forEach(zone, (patchIndex, x, z) => {
            this._updatePatchHeightsOnGPU(x, z);
        });
    }

    protected _createPatchBuffer(patchIndex: int, baseIndex: int, baseVertex: int, count: int, patchX: int, patchZ: int, minX: int, minZ: int, size: int, lod: IPatchLod) {

        const patchBuf = new TerrainPatchBufferBasic(patchIndex, minX, minZ, size);

        patchBuf.lod = lod;
        patchBuf.indicesBaseIndex = baseIndex;
        patchBuf.indicesBaseVertex = baseVertex;
        patchBuf.indicesCount = count;
        patchBuf.dependencesUpdated = false;
        patchBuf.heightsUpdated = false;
        
        return patchBuf;
    }
    
    private _buildVertexFormat(graphicsDevice: pcx.GraphicsDevice, vertexBuffer: IReadonlyCoordsBuffer) {
        
        // We can use uint8 for patches smaller than 255, but we only use 2 bytes,
        // for optimal performance need 4 bytes for the buffer.
        const coordsFormat = (vertexBuffer.patchVertexBufferTyped instanceof Uint8Array) ? pc.TYPE_UINT8 : pc.TYPE_UINT16;
        const vertexDesc = [{
            semantic: pc.SEMANTIC_POSITION,
            components: coordsVertexSize,
            type: coordsFormat,
            normalize: false,
            asInt: true
        }];

        return new pc.VertexFormat(graphicsDevice, vertexDesc, vertexBuffer.patchVertexBufferLength);
    }

    protected _buildInstancingVertexFormat(graphicsDevice: pcx.GraphicsDevice) {
        // We can use uint8, but we only use 2 bytes,
        // for optimal performance need 4 bytes for the buffer.
        return new pc.VertexFormat(graphicsDevice, [{
            semantic: pc.SEMANTIC_ATTR10,
            components: coordsVertexSize,
            type: pc.TYPE_UINT16,
            normalize: false,
            asInt: true
        }]);
    }

    protected _buildInstancingVertexBuffer(graphicsDevice: pcx.GraphicsDevice, data: TInstCoordsOffsetArrType) {
        return new pc.VertexBuffer(graphicsDevice, this._buildInstancingVertexFormat(graphicsDevice), data.length / instDataSize, {
            usage: pc.BUFFER_STREAM,
            data: data,
            storage: false,
        });
    }

    protected _setCustomPrimitiveChunks(terrain: BaseTerrain, mesh: pcx.Mesh & CustomMesh<IPatchPrimitive>) {

        const patches = new Array<IPrimitive<IPatchPrimitive>>(terrain.numPatchesX * terrain.numPatchesZ);

        for (let patchZ = 0; patchZ < terrain.numPatchesZ; patchZ++) {

            for (let patchX = 0; patchX < terrain.numPatchesX; patchX++) {

                const patchIndex = patchZ * terrain.numPatchesX + patchX;
                const patchBuf   = this.bufferArray[patchIndex];

                patches[patchIndex] = {
                    type: pc.PRIMITIVE_TRIANGLES,
                    enabled: false,
                    base: 0,
                    count: 0,
                    indexed: true,
                    attributes: {
                        [patchCoordOffsetParamName]: [patchBuf.minX, patchBuf.minZ],
                        [patchLodCoreParamName]: patchBuf.lod.core,
                    }
                };
            }
        }

        mesh.primitiveChunks = [patches];
    }

    protected override _createCustomBagMesh(app: pcx.AppBase, entity: pcx.Entity, material: pcx.Material, terrain: BaseTerrain): pcx.MeshInstance & CustomMeshInstance<IPatchPrimitive> {

        const patchMesh = new pc.Mesh(app.graphicsDevice) as pcx.Mesh & CustomMesh<IPatchPrimitive>;
        const primitive = patchMesh.primitive[0];

        patchMesh.aabb = this.aabb;
        patchMesh.indexBuffer[0] = this._sharedIndexBuffer;
        patchMesh.vertexBuffer   = this._sharedVertexBuffer;

        this._setCustomPrimitiveChunks(terrain, patchMesh);

        primitive.type = pc.PRIMITIVE_TRIANGLES;
        primitive.base = 0;
        primitive.count = 0;
        primitive.indexed = true;

        const patchMeshInstance = new pc.MeshInstance(patchMesh, material, entity) as pcx.MeshInstance & CustomMeshInstance<IPatchPrimitive>;

        patchMeshInstance.cull = false;
        patchMeshInstance.visible = false;
        patchMeshInstance.visibleThisFrame = false;
        patchMeshInstance.castShadow = false;
        patchMeshInstance.receiveShadow = false;

        patchMeshInstance.setParameter(patchLodCoreParamName, 0, 0xffffffff);
        patchMeshInstance.setParameter(patchCoordOffsetParamName, [0, 0], 0xffffffff);
        patchMeshInstance.setInstancing(null);
        patchMeshInstance.setCustomAabb(this.aabb);

        return patchMeshInstance;
    }

    protected override _createInstancingMesh(app: pcx.AppBase, entity: pcx.Entity, material: pcx.Material, lodInfo: IPatchLod, primitiveInfo: ISingleLodInfo, data: TInstCoordsOffsetArrType): pcx.MeshInstance {
        
        const patchMesh = new pc.Mesh(app.graphicsDevice);
        const primitive = patchMesh.primitive[0];
        const instancingBuf = this._buildInstancingVertexBuffer(app.graphicsDevice, data);

        patchMesh.aabb = this.aabb;
        patchMesh.indexBuffer[0] = this._sharedIndexBuffer;
        patchMesh.vertexBuffer   = this._sharedVertexBuffer;

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
        patchMeshInstance.setCustomAabb(this.aabb);

        return patchMeshInstance;
    }

    protected override _createPatchMesh(patchIndex: number, app: pcx.AppBase, entity: pcx.Entity, material: pcx.Material): pcx.MeshInstance {

        const patchBuf  = this.bufferArray[patchIndex];
        const patchMesh = new pc.Mesh(app.graphicsDevice);
        const primitive = patchMesh.primitive[0];

        patchMesh.aabb = this.aabb;
        patchMesh.indexBuffer[0] = this._sharedIndexBuffer;
        patchMesh.vertexBuffer   = this._sharedVertexBuffer;

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

        patchMeshInstance.setParameter(patchCoordOffsetParamName, [patchBuf.minX, patchBuf.minZ], 0xffffffff);
        patchMeshInstance.setInstancing(null);
        patchMeshInstance.setCustomAabb(this.aabb);

        return patchMeshInstance;
    }

    private _destroyMesh(meshInstance: pcx.MeshInstance) {

        // TODO: dont destroy shared index and vertex buffers
        if (meshInstance.mesh) {
            meshInstance.mesh.indexBuffer = [null] as unknown as pcx.IndexBuffer[];
            meshInstance.mesh.vertexBuffer = null as unknown as pcx.VertexBuffer;
        }

        meshInstance.destroy();

        if (meshInstance.mesh) {
            meshInstance.mesh.destroy();
        }

        if (meshInstance.instancingData) {
            
                                                       // @ts-ignore
            if (meshInstance.instancingData.destroy) { // @ts-ignore
                meshInstance.instancingData.destroy();
            }

            meshInstance.instancingData.vertexBuffer?.destroy();
        }
    }

    protected override _destroyInstancingMesh(mesh: pcx.MeshInstance): void {
        this._destroyMesh(mesh);
    }

    protected override _destroyPatchMesh(patchIndex: number): void {

        const patchMeshInstance = this.meshInstanceArray[patchIndex];

        if (patchMeshInstance) {
            this._destroyMesh(patchMeshInstance);
        }
    }

    protected override _destroyCustomBagMesh(mesh: pcx.MeshInstance & CustomMeshInstance): void {
        this._destroyMesh(mesh);
    }

    private _updateIndexBuffer(graphicsDevice: pcx.GraphicsDevice) {
        this._sharedIndexBuffer?.destroy();
        this._sharedIndexBuffer = new pc.IndexBuffer(
            graphicsDevice,
            pc.INDEXFORMAT_UINT32,
            this.terrain.patchIndices.length,
            pc.BUFFER_STATIC,
            this.terrain.patchIndices,
            { storage: false }
        );
    }

    private _updateVertexBuffer(graphicsDevice: pcx.GraphicsDevice) {
        const format = this._buildVertexFormat(graphicsDevice, this.terrain.patchVertices);
        this._sharedVertexBuffer?.destroy();
        this._sharedVertexBuffer = new pc.VertexBuffer(graphicsDevice, format, format.vertexCount, {
            usage: pc.BUFFER_STATIC,
            storage: false,
            data: this.terrain.patchVertices.patchVertexBufferData,
        });
    }

    private _initHeightMapTexture(app: pcx.AppBase) {

        this._heightMap?.destroy();

        const heightFormat  = getHeightMapFormat(app.graphicsDevice, this.terrain.heightMap);
        const format        = getTextureType(heightFormat);
        const bufFormat     = getHeightMapChunkBufferType(app.graphicsDevice, format);
        const dataChunkSize = this.terrain.heightMap.dataChunkSize;
        const chunks        = this.terrain.heightMap.getChunksBuffers(bufFormat);

        this._heightMapLevelsType = bufFormat;
        this._heightMap = new pc.Texture(app.graphicsDevice, {
            width: dataChunkSize,
            height: dataChunkSize,
            format: format,
            mipmaps: false,
            minFilter: pc.FILTER_LINEAR,
            magFilter: pc.FILTER_LINEAR,
            addressU: pc.ADDRESS_CLAMP_TO_EDGE,
            addressV: pc.ADDRESS_CLAMP_TO_EDGE,
            addressW: pc.ADDRESS_CLAMP_TO_EDGE,
            flipY: app.graphicsDevice.isWebGPU,
            arrayLength: chunks.length,
            levels: [chunks]
        });
    }

    public override updateIndexBuffer() {

        this._updateIndexBuffer(this._app.graphicsDevice);

        if (this.customForwardRenderer ||
            this.instancing.enabled) {
            this.updateMeshes();
        }
        else {

            for (const item of this.meshInstanceArray) {

                if (item) {
                    item.mesh.indexBuffer[0] = this._sharedIndexBuffer;
                }
            }
        }
    }

    private _bindDependenciesToMaterial(material: pcx.StandardMaterial) {

        material.setAttribute(patchInstCoordOffsetParamName, pc.SEMANTIC_ATTR10);
        material.setAttribute(vertexCoordAttrName, pc.SEMANTIC_POSITION);
        material.setParameter(patchLodCoreParamName, 0);
        material.setParameter(patchCoordOffsetParamName, [0, 0]);
        material.setParameter(terrainHeightMapParamName, this._heightMap);

        const format = getHeightMapFormat(this._app.graphicsDevice, this.terrain.heightMap);
        const chunksStore = getTerrainShaderChunks({
            width: this.terrain.width,
            depth: this.terrain.depth,
            heightMapChunkSize: this.terrain.heightMap.dataChunkSize, 
            instancing: this.instancing.enabled,
            heightMapFormat: format,
        });
        
        const chunkNames = Object.keys(chunksStore);

        for (let chunkName of chunkNames) {
            material.chunks[chunkName] = chunksStore[chunkName];
        }
        
        material.chunks.APIVersion = pc.CHUNKAPI_1_70;
        material.update();
    }

    public override updateMaterial(material: pcx.StandardMaterial): void {
        this._bindDependenciesToMaterial(material);
        super.updateMaterial(material);
    }

    public override updateHeights(zone: IZone) {
        super.updateHeights(zone);
        this._updateHeightMap(zone);
    }

    public init(app: pcx.AppBase, entity: pcx.Entity, material: pcx.StandardMaterial) {
        this._initHeightMapTexture(app);
        this._updateIndexBuffer(app.graphicsDevice);
        this._updateVertexBuffer(app.graphicsDevice);
        super.init(app, entity, material);
    }
}