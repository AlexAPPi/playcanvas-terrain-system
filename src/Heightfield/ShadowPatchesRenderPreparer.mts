import type { IPatchLod } from "../Core/IPatchLod.mjs";
import type { ISingleLodInfo } from "../Core/LodInfo.mjs";
import type { ILodState } from "../Core/LodState.mjs";
import type { IPatchesState } from "../Core/PatchesManager.mjs";
import type { int } from "../Extras/Types.mjs";
import EntityPatchesMesh from "./EntityPatchesMesh.mjs";
import MeshInstanceFactory from "./MeshInstanceFactory.mjs";
import Patch from "./Patch.mjs";
import { patchLodCoreParamName } from "./ShaderChunks.mjs";

export default class ShadowPatchesRenderPreparer extends EntityPatchesMesh implements IPatchesState {

    private _bufferArray: Patch[];
    private _lodState: ILodState;

    public get lodState() { return this._lodState; }
    public get bufferArray(): Readonly<Readonly<Patch>[]> { return this._bufferArray; }

    constructor(lodSate: ILodState, meshFactory: MeshInstanceFactory, entity: pcx.Entity, layerName: string) {
        super(meshFactory, entity, layerName);
        this._lodState = lodSate;
        this._bufferArray = new Array(this.meshInstanceArray.length);
    }

    protected override _createRenderComponent(meshInstances: pcx.MeshInstance[]) {
        this.entity.addComponent('render', {
            meshInstances: meshInstances,
            castShadows: true,
            castShadowsLightmap: true,
            receiveShadows: false,
        });
    }

    protected override _updateMeshInstanceForRender(meshInstances: pcx.MeshInstance[]) {

        for (let i = 0; i < meshInstances.length; i++) {
            const meshInstance = meshInstances[i];
            meshInstance.cull = false;
            meshInstance.visible = true;
            meshInstance.castShadow = true;
            meshInstance.receiveShadow = false;
        }
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
            const inst = this.instancing.increment(lod, buffer);
            if (inst.object && inst.count === 1) {
                inst.object.castShadow = true;
            }
        }
        else {
            const meshInstance = this.getOrCreatePatchMesh(index);
            const mesh = meshInstance.mesh;
            const primitive = mesh.primitive[0];

            primitive.base  = info.start;
            primitive.count = info.count;

            meshInstance.castShadow = true;
            meshInstance.setParameter(patchLodCoreParamName, lod.core);
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