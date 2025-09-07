import type { int } from "../Extras/Types.mjs";
import PatchCombineInstancingNative, { combineGroupLen, comInstDataSize, TComInstCoordsOffsetArrType } from "../Core/PatchCombineInstancing.mjs";
import { type IPatchInstancing, updateBuffer } from "./IPatchInstancing.mjs";

export default class PatchCombineInstancing extends PatchCombineInstancingNative<pcx.MeshInstance> implements IPatchInstancing<TComInstCoordsOffsetArrType> {

    public readonly bufferType = TComInstCoordsOffsetArrType;
    public readonly itemBufferSize = 4;
    
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

    public begin(castShadow: boolean = false) {

        for (let c = 0; c < this.data.length; c++) {

            for (let i = 0; i < combineGroupLen; i++) {

                const chunk = this.data[c].groups[i];
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

                        updateBuffer(vertexBuffer, chunk.data, length);
                    }
                }
            }
        }
    }
}