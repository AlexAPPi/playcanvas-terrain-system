import { IPatchesInstancing } from "../TerrainSystem/IPatchesInstancing.mjs";

export interface ITerrainPatchesInstancing<TData extends Uint16Array | Uint8Array> extends IPatchesInstancing<pcx.MeshInstance, TData> {

    bufferType: Uint16ArrayConstructor | Uint8ArrayConstructor;

    itemBufferSize: number;
    meshInstanceCount: number;
    
    appendMeshInstances(arr: pcx.MeshInstance[], offset?: number): number;

    begin(castShadow?: boolean, receiveShadow?: boolean): void;

    end(): void;
}