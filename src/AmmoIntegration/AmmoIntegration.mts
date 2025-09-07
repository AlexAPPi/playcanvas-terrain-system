import { getOrThrowDataChunkSize } from "../Core/AbsChunkedHeightMap.mjs";
import { TValueType } from "../Core/PatchedHeightMap.mjs";

export type TTT<T extends TValueType> =
    T extends '32f' ? Float32Array :
    T extends '16u' ? Uint16Array :
    T extends '8u'  ? Uint8Array :
    never;

export function getBuffer<TTValueType extends TValueType>(
    width: number,
    depth: number,
    patchSize: number,
    dataChunkSize: number,
    valueType: TTValueType
): TTT<TTValueType> {

    if (typeof Ammo === 'undefined') {
        throw new Error("Ammo not exists");
    }

    const chunkSize    = getOrThrowDataChunkSize(patchSize, dataChunkSize);
    const numChunksX   = ((width - 1) / (chunkSize - 1)) | 0;
    const numChunksZ   = ((depth - 1) / (chunkSize - 1)) | 0;
    const chunkArrSize = chunkSize ** 2;
    const chunkCount   = numChunksX * numChunksZ;
    const bsz = valueType === "32f" ? 4 :
                valueType === "16u" ? 2 :
                valueType === "8u"  ? 1 : 0;
    
    const len = chunkArrSize * chunkCount;
    const ptr = Ammo._malloc(bsz * len);
    
    switch (valueType) {
        case "32f": return new Float32Array(Ammo.HEAPF32.buffer, ptr, len) as unknown as TTT<TTValueType>;
        case "16u": return new Uint16Array(Ammo.HEAPU16.buffer, ptr, len) as unknown as TTT<TTValueType>;
        case "8u":  return new Uint8Array(Ammo.HEAPU8.buffer, ptr, len) as unknown as TTT<TTValueType>;
        default: throw new Error("Unsupported value type");
    }
}