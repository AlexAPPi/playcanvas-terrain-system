import type { float, int } from "../Extras/Types.mjs";
import AbsChunkedHeightMap, { getOrThrowDataChunkSize, type IReadonlyAbsChunkedHeightMapTypped } from "./AbsChunkedHeightMap.mjs";

export interface IReadonlyPatchedHeightMap extends IReadonlyAbsChunkedHeightMapTypped<Float32Array> {
}

export class PatchedHeightMap extends AbsChunkedHeightMap<Float32Array> implements IReadonlyPatchedHeightMap {

    private static createBuffer(width: int, depth: int, chunkSize: int): Float32Array {

        const numChunksX   = ((width - 1) / (chunkSize - 1)) | 0;
        const numChunksZ   = ((depth - 1) / (chunkSize - 1)) | 0;
        const chunkArrSize = chunkSize ** 2;
        const chunkCount   = numChunksX * numChunksZ;
    
        return new Float32Array(chunkArrSize * chunkCount);
    }

    constructor(width: int, depth: int, patchSize: int, dataChunkSize: int, maxHeight: float, buffer?: Float32Array) {
        const validDataChunkSize = getOrThrowDataChunkSize(patchSize, dataChunkSize);
        const tmpBuffer = buffer ?? PatchedHeightMap.createBuffer(width, depth, validDataChunkSize);
        super(width, depth, patchSize, dataChunkSize, maxHeight, tmpBuffer, 1, 0);
    }
}

export default PatchedHeightMap;