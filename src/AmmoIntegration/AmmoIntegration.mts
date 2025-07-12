import { getOrThrowDataChunkSize } from "../Core/AbsChunkedHeightMap.mjs";
import { TCompressAlgoritm, THeightMapArrayTypeBag } from "../Core/CompressedPatchedHeightMap.mjs";
import { HeightMapArrType } from "../Core/HeightMap.mjs";

export type TCompressAlgoritmOrNone = TCompressAlgoritm | 'none';
export type TTT<T extends TCompressAlgoritmOrNone> =
    T extends 'none' ? HeightMapArrType :
    T extends 'x4'   ? THeightMapArrayTypeBag<T> :
    T extends 'x2'   ? THeightMapArrayTypeBag<T> :
    never;

export function getBuffer<TCompress extends TCompressAlgoritmOrNone>(
    width: number,
    depth: number,
    patchSize: number,
    dataChunkSize: number,
    compressAlgoritm: TCompress
): TTT<TCompress> {

    if (typeof Ammo === 'undefined') {
        console.error("Ammo not exists");
        throw new Error();
    }

    const chunkSize    = getOrThrowDataChunkSize(patchSize, dataChunkSize);
    const numChunksX   = ((width - 1) / (chunkSize - 1)) | 0;
    const numChunksZ   = ((depth - 1) / (chunkSize - 1)) | 0;
    const chunkArrSize = chunkSize ** 2;
    const chunkCount   = numChunksX * numChunksZ;

    if (compressAlgoritm !== "none") {

        const patchXBatchingCount = compressAlgoritm === "x4" ? 4 : 2;

        if (numChunksX < patchXBatchingCount) {
            console.error("The chunkSize (%d) should be at least (%d) times smaller than the width (%d)\n", chunkSize, patchXBatchingCount, width);
            throw new Error();
        }
    }
    
    const bsz = compressAlgoritm === "x2" ? 2 :
                compressAlgoritm === "x4" ? 1 :
                                            4; // float32
    
    const len = chunkArrSize * chunkCount;
    const ptr = Ammo._malloc(bsz * len);
    
    switch (compressAlgoritm) {
        case "x4": return new Uint8Array(Ammo.HEAPU8.buffer, ptr, len) as unknown as TTT<TCompress>;
        case "x2": return new Uint16Array(Ammo.HEAPU16.buffer, ptr, len) as unknown as TTT<TCompress>;
        default:   return new Float32Array(Ammo.HEAPF32.buffer, ptr, len) as unknown as TTT<TCompress>;
    }
}