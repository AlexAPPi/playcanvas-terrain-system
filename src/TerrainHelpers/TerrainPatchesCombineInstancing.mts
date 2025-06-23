import { int } from "../Shared/Types.mjs";
import { combineGroupLen, comInstDataSize, PatchCombineInstancing, TComInstCoordsOffsetArrType } from "../TerrainSystem/PatchesCombineInstancing.mjs";
import { ITerrainPatchesInstancing } from "./ITerrainPatchesInstancing.mjs";

export class TerrainPathcesCombineInstancing extends PatchCombineInstancing<pcx.MeshInstance> implements ITerrainPatchesInstancing<TComInstCoordsOffsetArrType> {

    bufferType = TComInstCoordsOffsetArrType;
    itemBufferSize = 4;
    
    public get meshInstanceCount() { return this.data.length * combineGroupLen; }

    public appendMeshInstances(arr: pcx.MeshInstance[], offset: int = 0) {

        let meshIndex = 0;
        
        for (let c = 0; c < this.data.length; c++) {

            for (let i = 0; i < combineGroupLen; i++) {

                const chunk = this.data[c].groups[i];

                if (chunk.object) {
                    arr[meshIndex++ + offset] = chunk.object;
                }
            }
        }

        return meshIndex;
    }

    public begin(castShadow: boolean = false, receiveShadow: boolean = false) {

        for (let c = 0; c < this.data.length; c++) {

            for (let i = 0; i < combineGroupLen; i++) {

                const chunk = this.data[c].groups[i];
                const chunkObject = chunk.object;

                chunk.count = 0;
                chunk.hasChanges = false;

                if (chunkObject) {
                    chunkObject.visible = false;
                    chunkObject.visibleThisFrame = false;
                    chunkObject.castShadow = castShadow;
                    chunkObject.receiveShadow = receiveShadow;
                }
            }
        }
    }

    public end() {

        for (let c = 0; c < this.data.length; c++) {

            for (let i = 0; i < combineGroupLen; i++) {

                const chunk = this.data[c].groups[i];
                const chunkObject = chunk.object;
                
                if (chunkObject && chunk.count > 0) {
                    
                    chunkObject.instancingCount = chunk.count;

                    if (chunk.hasChanges && chunkObject.instancingData) {

                        // TODO: performance improvement
                        //chunkObject.instancingData.vertexBuffer?.unlock();

                        const length = chunk.count * comInstDataSize;
                        const vertexBuffer = chunkObject.instancingData.vertexBuffer;

                        this._updateBuffer(vertexBuffer, chunk.data, length);
                    }
                }
            }
        }
    }

    private _updateBuffer(vertexBuffer: pcx.VertexBuffer | null, data: TComInstCoordsOffsetArrType, length: int) {

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
}