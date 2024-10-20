import type { float, int } from "../Shared/Types.mjs";
import AbsPatchedHeightMap, { getOrThrowDataChunkSize, IReadonlyAbsPatchedHeightMapTypped } from "./AbsPatchedHeightMap.mjs";

export interface IReadonlyPatchedHeightMap extends IReadonlyAbsPatchedHeightMapTypped<Float32Array> {
}

export function createBuffer(width: int, depth: int, chunkSize: int) {

    const numChunksX   = ((width - 1) / (chunkSize - 1)) | 0;
    const numChunksZ   = ((depth - 1) / (chunkSize - 1)) | 0;
    const chunkArrSize = chunkSize * chunkSize;
    const chunkCount   = numChunksX * numChunksZ;

    return new Float32Array(chunkArrSize * chunkCount);
}

export class PatchedHeightMap extends AbsPatchedHeightMap<Float32Array> implements IReadonlyPatchedHeightMap {
    constructor(width: int, depth: int, patchSize: int, dataChunkSize: int, minHeight: float, maxHeight: float) {
        super(width, depth, patchSize, dataChunkSize, minHeight, maxHeight, createBuffer(width, depth, getOrThrowDataChunkSize(patchSize, dataChunkSize)), 1, 0);
    }
}

export default PatchedHeightMap;