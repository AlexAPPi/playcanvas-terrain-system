import { int } from "../Shared/Types.mjs";
import { BOTTOM, LEFT, RIGHT, TOP } from "../TerrainSystem/LodInfo.mjs";
import { instDataSize, PatchInstancing, TInstCoordsOffsetArrType } from "../TerrainSystem/PatchesInstancing.mjs";
import { ITerrainPatchesInstancing } from "./ITerrainPatchesInstancing.mjs";

export class TerrainPathcesInstancing extends PatchInstancing<pcx.MeshInstance> implements ITerrainPatchesInstancing<TInstCoordsOffsetArrType> {

    bufferType = TInstCoordsOffsetArrType;
    itemBufferSize = 2;
    
    public get meshInstanceCount() { return this.data.length * LEFT * RIGHT * TOP * BOTTOM; }

    public appendMeshInstances(arr: pcx.MeshInstance[], offset: int = 0) {

        let i = 0;
        
        for (let c = 0; c < this.data.length; c++) {
            for (let l = 0; l < LEFT; l++) {
                for (let r = 0; r < RIGHT; r++) {
                    for (let t = 0; t < TOP; t++) {
                        for (let b = 0; b < BOTTOM; b++) {

                            const chunk = this.data[c][l][r][t][b];

                            if (chunk.object) {
                                arr[i++ + offset] = chunk.object;
                            }
                        }
                    }
                }
            }
        }

        return i;
    }

    public begin(castShadow: boolean = false, receiveShadow: boolean = false) {
        for (let c = 0; c < this.data.length; c++) {
            for (let l = 0; l < LEFT; l++) {
                for (let r = 0; r < RIGHT; r++) {
                    for (let t = 0; t < TOP; t++) {
                        for (let b = 0; b < BOTTOM; b++) {

                            const chunk = this.data[c][l][r][t][b];
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
            }
        }
    }

    public end() {
        for (let c = 0; c < this.data.length; c++) {
            for (let l = 0; l < LEFT; l++) {
                for (let r = 0; r < RIGHT; r++) {
                    for (let t = 0; t < TOP; t++) {
                        for (let b = 0; b < BOTTOM; b++) {

                            const chunk = this.data[c][l][r][t][b];
                            const chunkObject = chunk.object;
                            
                            if (chunkObject && chunk.count > 0) {
                                
                                chunkObject.instancingCount = chunk.count;

                                if (chunk.hasChanges && chunkObject.instancingData) {

                                    // TODO: performance improvement
                                    //chunkObject.instancingData.vertexBuffer?.unlock();

                                    const length = chunk.count * instDataSize;
                                    const vertexBuffer = chunkObject.instancingData.vertexBuffer;

                                    this._updateBuffer(vertexBuffer, chunk.data, length);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private _updateBuffer(vertexBuffer: pcx.VertexBuffer | null, data: TInstCoordsOffsetArrType, length: int) {

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