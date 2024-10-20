import type { float, int } from "../Shared/Types.mjs";
import AbsPatchedHeightMap, { getOrThrowDataChunkSize, IReadonlyAbsPatchedHeightMapTypped } from "./AbsPatchedHeightMap.mjs";

export type TCompressAlgoritm = 'x2' | 'x4';

export class CompressedPatchedHeightMap extends AbsPatchedHeightMap<Uint16Array | Uint8Array> implements IReadonlyAbsPatchedHeightMapTypped<Uint16Array | Uint8Array> {

    private _compressAlgoritm: TCompressAlgoritm;
    private _patchXBatchSize: int;
    private _maxSafeFactor: int;

    public get compressAlgoritm() { return this._compressAlgoritm; }

    private static createBuffer(width: int, depth: int, chunkSize: int, algoritm: TCompressAlgoritm): Uint16Array | Uint8Array {

        const numChunksX   = ((width - 1) / (chunkSize - 1)) | 0;
        const numChunksZ   = ((depth - 1) / (chunkSize - 1)) | 0;
        const chunkArrSize = chunkSize ** 2;
        const chunkCount   = numChunksX * numChunksZ;
        const patchXBatchingCount = algoritm === 'x4' ? 4 : 2;

        if (numChunksX < patchXBatchingCount) {
            console.error("The chunkSize (%d) should be at least (%d) times smaller than the width (%d)\n", chunkSize, patchXBatchingCount, width);
            throw new Error();
        }

        if (algoritm === 'x4') {
            return new Uint8Array(chunkArrSize * chunkCount);
        }

        return new Uint16Array(chunkArrSize * chunkCount);
    }

    constructor(width: int, depth: int, patchSize: int, dataChunkSize: int, minHeight: float, maxHeight: float, algoritm: TCompressAlgoritm) {
        const validDataChunkSize = getOrThrowDataChunkSize(patchSize, dataChunkSize);
        const buffer = CompressedPatchedHeightMap.createBuffer(width, depth, validDataChunkSize, algoritm);
        super(width, depth, patchSize, dataChunkSize, minHeight, maxHeight, buffer, 1, 0);
        this._compressAlgoritm = algoritm;
        this._patchXBatchSize  = algoritm === 'x4' ? 4 : 2;
        this._maxSafeFactor    = algoritm === 'x4' ? 0xff : 0xffff;
    }

    public override getChunkIndex(chunkX: int, chunkZ: int): int {
        return (chunkZ * this.dataNumChunksX + chunkX) / this._patchXBatchSize | 0;
    }

    public override getChunkBuffer(type: Float32ArrayConstructor, chunkX: int, chunkZ: int): Float32Array;
    public override getChunkBuffer(type: Uint16ArrayConstructor, chunkX: int, chunkZ: int): Uint16Array;
    public override getChunkBuffer(type: Uint8ArrayConstructor, chunkX: int, chunkZ: int): Uint8Array;
    public override getChunkBuffer(type: any, chunkX: int, chunkZ: int) {
        const size        = this.dataChunkSize ** 2;
        const chunkLevel  = (chunkZ * this.dataNumChunksX + chunkX) / this._patchXBatchSize | 0;
        const chunkOffset = chunkLevel * size * this.data.BYTES_PER_ELEMENT * this._patchXBatchSize;
        const count       = size * this._patchXBatchSize * (this.data.BYTES_PER_ELEMENT / type.BYTES_PER_ELEMENT);
        return new type(this.data.buffer, chunkOffset, count);
    }

    public override getChunksBuffers(type: Float32ArrayConstructor): Float32Array[];
    public override getChunksBuffers(type: Uint16ArrayConstructor): Uint16Array[];
    public override getChunksBuffers(type: Uint8ArrayConstructor): Uint8Array[];
    public override getChunksBuffers(type: any) {

        const result = new Array((this.dataNumChunksX / this._patchXBatchSize) * this.dataNumChunksZ);
        
        for (let chunkZ = 0; chunkZ < this.dataNumChunksZ; chunkZ++) {

            for (let chunkX = 0; chunkX < this.dataNumChunksX; chunkX += this._patchXBatchSize) {

                const index = (chunkZ * this.dataNumChunksX + chunkX) / this._patchXBatchSize | 0;
                result[index] = this.getChunkBuffer(type, chunkX, chunkZ);
            }
        }

        return result;
    }

    protected override _encodeHeightFactor(store: Uint16Array | Uint8Array, index: int, value: float) {
        store[index] = Math.min(value * this._maxSafeFactor, this._maxSafeFactor);
    }
    
    protected override _decodeHeightFactor(store: Uint16Array | Uint8Array, index: int) {
        return store[index] / this._maxSafeFactor;
    }
    
    public override getIndex(x: int, z: int): int {

        const localX = x % this.dataChunkSize;
        const localZ = z % this.dataChunkSize;
        const chunkX = Math.ceil(x / this.dataChunkSize) - (localX > 0 ? 1 : 0);
        const chunkZ = Math.ceil(z / this.dataChunkSize) - (localZ > 0 ? 1 : 0);

        const chunkLevel  = (chunkZ * this.dataNumChunksX + chunkX) / this._patchXBatchSize | 0;
        const chunkOffset = chunkLevel * (this.dataChunkSize ** 2);
        const localIndex  = localZ * this.dataChunkSize + localX;
        const numCompress = chunkX % this._patchXBatchSize; // compress by x axis

        return (chunkOffset + localIndex) * this._patchXBatchSize + numCompress;
    }
}

export default CompressedPatchedHeightMap;