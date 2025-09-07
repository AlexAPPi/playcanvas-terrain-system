import { int } from "../Extras/Types.mjs";
import { BOTTOM, LEFT, RIGHT, TOP } from "../Core/LodInfo.mjs";
import { instDataSize, PatchInstancing as PatchInstancingNative, TInstCoordsOffsetArrType } from "../Core/PatchInstancing.mjs";
import { IPatchInstancing, updateBuffer } from "./IPatchInstancing.mjs";

export default class PatchInstancing extends PatchInstancingNative<pcx.MeshInstance> implements IPatchInstancing<TInstCoordsOffsetArrType> {

    public readonly bufferType = TInstCoordsOffsetArrType;
    public readonly itemBufferSize = 2;
    
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

    public begin(castShadow: boolean = false) {
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
                                chunkObject.castShadow = castShadow;
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

                                    updateBuffer(vertexBuffer, chunk.data, length);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}