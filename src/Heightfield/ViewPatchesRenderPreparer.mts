import type { int } from "../Extras/Types.mjs";
import type { IPatchLod, IPatchLodBase } from "../Core/IPatchLod.mjs";
import { patchLodCoreParamName } from "./ShaderChunks.mjs";
import EntityPatchesMesh from "./EntityPatchesMesh.mjs";
import MeshInstanceFactory from "./MeshInstanceFactory.mjs";
import Patch from "./Patch.mjs";
import type { ISingleLodInfo } from "../Core/LodInfo.mjs";
import type { IPatchesState } from "../Core/PatchesManager.mjs";
import type { ILodState } from "../Core/LodState.mjs";

export interface IRenderOptions {
    wireframe?: boolean,
    castShadow?: boolean,
    receiveShadow?: boolean,
}

export default class ViewPatchesRenderPreparer extends EntityPatchesMesh implements IPatchesState {

    private _wireframe: boolean;
    private _castShadow: boolean;
    private _receiveShadow: boolean;
    private _bufferArray: Patch[];
    private _lodState: ILodState;

    public get lodState() { return this._lodState; }
    public get bufferArray(): Readonly<Readonly<Patch>[]> { return this._bufferArray; }

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

    constructor(lodSate: ILodState, meshFactory: MeshInstanceFactory, entity: pcx.Entity, layerName: string, options?: IRenderOptions) {
        super(meshFactory, entity, layerName);
        this._lodState = lodSate;
        this._wireframe = options?.wireframe ?? false;
        this._castShadow = options?.castShadow ?? false;
        this._receiveShadow = options?.receiveShadow ?? false;
        this._bufferArray = new Array(this.meshInstanceArray.length);
    }

    protected _updateMesh(meshInstance: pcx.MeshInstance | null | undefined, lod: IPatchLodBase) {

        if (meshInstance) {

            meshInstance.castShadow = this._castShadow;
            meshInstance.receiveShadow = this._receiveShadow;

            const newRenderStyle = this._wireframe ? pc.RENDERSTYLE_WIREFRAME : pc.RENDERSTYLE_SOLID;
            
            // @ts-ignore
            meshInstance._renderStyle = newRenderStyle;

            if (this._wireframe) {

                const wireframeData = this.meshFactory.wireframeBuffersManager.get(lod);

                meshInstance.mesh.indexBuffer[pc.RENDERSTYLE_WIREFRAME] = wireframeData.buffer;
                meshInstance.mesh.primitive[pc.RENDERSTYLE_WIREFRAME] = wireframeData.primitive;
            }
        }
    }

    protected _unsetIfNeedWireframe(meshInstance: pcx.MeshInstance | null | undefined, lod: IPatchLodBase) {

        if (meshInstance && !this._wireframe) {
            
            delete meshInstance.mesh.indexBuffer[pc.RENDERSTYLE_WIREFRAME];
            delete meshInstance.mesh.primitive[pc.RENDERSTYLE_WIREFRAME];
        }
    }

    protected _updateMeshes() {

        for (let i = 0; i < this.meshInstanceArray.length; i++) {

            const meshInstance = this.meshInstanceArray[i];
            const buffer = this._bufferArray[i];

            this._updateMesh(meshInstance, buffer.lod);
            this._unsetIfNeedWireframe(meshInstance, buffer.lod);
        }

        this.instancing?.forEach(item => {
            this._updateMesh(item.object, item.lod);
            this._unsetIfNeedWireframe(item.object, item.lod);
        });
    }

    public override updateMeshes() {
        super.updateMeshes();
        this._updateMeshes();
    }

    public initPatch(patchX: int, patchZ: int, size: int, minX: int, minZ: int, info: Readonly<ISingleLodInfo>, lodInfo: Readonly<IPatchLod>): void {

        const index  = patchZ * this._numPatchesX + patchX;
        const buffer = new Patch(index, patchX, patchZ, minX, minZ, size);

        buffer.lod = lodInfo;
        buffer.indicesBaseIndex = info.start;
        buffer.indicesCount = info.count;

        this._bufferArray[index] = buffer;
    }

    public updatePatch(patchX: int, patchZ: int, visible: boolean, info: Readonly<ISingleLodInfo>, lod: Readonly<IPatchLod>): void {
        
        const index  = patchZ * this._numPatchesX + patchX;
        const buffer = this._bufferArray[index];
        
        buffer.visible          = visible;
        buffer.indicesBaseIndex = info.start;
        buffer.indicesCount     = info.count;
        buffer.lod              = lod;

        if (this.instancing) {

            if (visible) {
                
                const inst = this.instancing.increment(lod, buffer);
                
                if (inst.count === 1 && inst.object) {

                    const meshInstance = inst.object;

                    meshInstance.visible = true;
                }
            }
        }
        else {

            const meshInstance = this.getOrCreatePatchMesh(index);

            meshInstance.visible = visible;

            if (visible) {

                const mesh = meshInstance.mesh;
                const primitive = mesh.primitive[0];

                primitive.base  = info.start;
                primitive.count = info.count;

                meshInstance.setParameter(patchLodCoreParamName, lod.core);

                this._updateMesh(meshInstance, lod);
            }
        }
    }

    public beforeUpdate(): void {
        this.instancing?.begin(false);
    }

    public afterUpdate(): void {
        this.instancing?.end();
        this.updateRenderComponent();
    }
}