import { int } from "../Shared/Types.mjs";
import { IFrustum, IGridPatchRenderPreparer } from "../TerrainSystem/GeomipGridRenderPreparer.mjs";
import { IPatchLod } from "../TerrainSystem/LodManager.mjs";
import TerrainPatchesBasic, { TerrainPatchBufferBasic } from "./TerrainPatchesBasic.mjs";
import { lodCoreParamName } from "./TerrainPatchesShaderChunks.mjs";

export interface IRenderOptions {
    wireframe?: boolean,
    castShadow?: boolean,
    receiveShadow?: boolean,
}

export default class TerrainRenderPreparer implements IGridPatchRenderPreparer {

    private _wireframe: boolean;
    private _castShadow: boolean;
    private _receiveShadow: boolean;
    private _hasUpdatedHeights: boolean;

    public get wireframe(): boolean { return this._wireframe; }
    public set wireframe(v: boolean) {
        this._wireframe = v;
        this._updateMeshes();
    }

    public get castShadow(): boolean { return this._castShadow; }
    public set castShadow(v: boolean) {
        this._castShadow = v;
        this._updateMeshes();
    }

    public get receiveShadow(): boolean { return this._receiveShadow; }
    public set receiveShadow(v: boolean) {
        this._receiveShadow = v;
        this._updateMeshes();
    }

    readonly patchesStore: TerrainPatchesBasic<TerrainPatchBufferBasic>;

    constructor(patchesStore: TerrainPatchesBasic<TerrainPatchBufferBasic>, options: IRenderOptions) {
        this.patchesStore = patchesStore;
        this._wireframe = options.wireframe ?? false;
        this._castShadow = options.castShadow ?? true;
        this._receiveShadow = options.receiveShadow ?? false;
        this._hasUpdatedHeights = false;
    }

    protected _updateMeshes() {

        for (const meshInstance of this.patchesStore.meshInstanceArray) {
            this._updateMesh(meshInstance);
        }

        this.patchesStore.instancing.forEach(item => {
            this._updateMesh(item.object);
        });
    }

    protected _updateMesh(meshInstance?: pcx.MeshInstance | null) {
        if (meshInstance) {
            meshInstance.mesh.primitive[0].type = this._wireframe ? pc.PRIMITIVE_LINES : pc.PRIMITIVE_TRIANGLES;
            meshInstance.castShadow = this._castShadow;
            meshInstance.receiveShadow = this._receiveShadow;
        }
    }

    public preparePatch(visible: boolean, baseIndex: int, baseVertex: int, count: int, patchX: int, patchZ: int, minX: int, minZ: int, size: int, lodInfo: Readonly<IPatchLod>) {
        
        const terrain = this.patchesStore.terrain;
        const patchIndex = patchZ * terrain.numPatchesX + patchX;
        const buffer = this.patchesStore.bufferArray[patchIndex];
        const currHash = baseIndex / count;

        buffer.hash              = currHash;
        buffer.visible           = visible;
        buffer.indicesBaseIndex  = baseIndex;
        buffer.indicesBaseVertex = baseVertex;
        buffer.indicesCount      = count;
        buffer.lod               = lodInfo;

        if (buffer.heightsUpdated) {
            buffer.heightsUpdated = false;
            buffer.heightsUpdatedThisFrame = visible;

            this._hasUpdatedHeights = true;
        }

        if (this.patchesStore.instancing.enabled) {

            if (visible) {

                const inst = this.patchesStore.instancing.increment(lodInfo, minX, minZ);
                
                if (inst.object) {

                    const meshInstance = inst.object;
                    const primitive = meshInstance.mesh.primitive[0];

                    meshInstance.visible = true;
                    meshInstance.visibleThisFrame = true;
                    meshInstance.castShadow = this._castShadow;
                    meshInstance.receiveShadow = this._receiveShadow;

                    primitive.type = this._wireframe ? pc.PRIMITIVE_LINES : pc.PRIMITIVE_TRIANGLES;
                }
            }
            
            return;
        }

        const meshInstance = this.patchesStore.createOrGetPatchMesh(patchIndex);
        const mesh = meshInstance.mesh;
        const primitive = mesh.primitive[0];

        if (meshInstance) {
            meshInstance.visible = visible;
            meshInstance.visibleThisFrame = visible;

            meshInstance.castShadow    = this._castShadow;
            meshInstance.receiveShadow = this._receiveShadow;
        }

        primitive.base  = baseIndex;
        primitive.count = count;
        primitive.type  = this._wireframe ? pc.PRIMITIVE_LINES : pc.PRIMITIVE_TRIANGLES;
        
        meshInstance.setParameter(lodCoreParamName, lodInfo.core);
    }

    public render(frustum?: IFrustum) {

        // TODO: In theory we can control the quality of the model for shadows
        // TODO: Add support for Occlusion culling

        this._hasUpdatedHeights = false;

        const useInstancing = this.patchesStore.instancing.enabled;

        if (useInstancing) {
            this.patchesStore.instancing.begin(false, false);
        }

        this.patchesStore.startRender();
        this.patchesStore.terrain.eachPatches(this, frustum);
        this.patchesStore.endRender(this._hasUpdatedHeights);

        if (useInstancing) {
            this.patchesStore.instancing.end();
        }
    }
}