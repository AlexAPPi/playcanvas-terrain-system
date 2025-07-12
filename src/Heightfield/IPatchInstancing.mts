import type { int } from "../Extras/Types.mjs";
import type { IPatchInstancing as IPatchesInstancingNative } from "../Core/IPatchInstancing.mjs";

export function updateBuffer(vertexBuffer: pcx.VertexBuffer | null, data: Uint16Array | Uint8Array, length: int) {

    if (vertexBuffer) {

        const device = vertexBuffer.device;

        if (device.isWebGL2) {
            const gl = (device as pcx.WebglGraphicsDevice).gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer.impl.bufferId);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, data, 0, length);
        }
        else if (device.isWebGPU) {
            const wgpu   = (device as any).wgpu as GPUDevice;
            const buffer = vertexBuffer.impl.buffer as GPUBuffer;
            wgpu.queue.writeBuffer(buffer, 0, data, 0, length);
        }
        else {
            console.error('Unsupported device');
        }
    }
}

export interface IPatchInstancing<TData extends Uint16Array | Uint8Array> extends IPatchesInstancingNative<pcx.MeshInstance, TData> {

    readonly bufferType: Uint16ArrayConstructor | Uint8ArrayConstructor;
    readonly itemBufferSize: number;
    readonly meshInstanceCount: number;
    
    appendMeshInstances(arr: pcx.MeshInstance[], offset?: number): number;

    begin(castShadow?: boolean, receiveShadow?: boolean): void;

    end(): void;
}