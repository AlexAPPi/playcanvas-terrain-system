import { int } from "../Shared/Types.mjs";
import { BOTTOM, LEFT, RIGHT, TOP } from "../TerrainSystem/LodInfo.mjs";
import { PatchInstancing } from "../TerrainSystem/PatchInstancing.mjs";

export class TerrainPathcesInstancing extends PatchInstancing<pcx.MeshInstance> {

    public enabled: boolean = false;

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

                                if (chunk.hasChanges) {

                                    // update vertex buffer
                                    // TODO: unlock for chunk
                                    if (chunkObject.instancingData) {
                                        chunkObject.instancingData.vertexBuffer?.unlock();
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}