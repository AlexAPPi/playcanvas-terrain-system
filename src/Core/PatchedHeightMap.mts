import type { float, int } from "../Extras/Types.mjs";
import AbsChunkedHeightMap, { getOrThrowDataChunkSize, IReadonlyAbsChunkedHeightMapTypped } from "./AbsChunkedHeightMap.mjs";
import { defaultHeightVertexSize } from "./HeightMap.mjs";

export type TValueType = "32f" | "16u" | "8u";
export type THeightMapArrayTypeBag<T extends TValueType> =
    T extends "32f" ? Float32Array :
    T extends "16u" ? Uint16Array :
    T extends "8u" ? Uint8Array :
    never;

// We store the raw height only for float32; for other types, we store a factor in memory.

export class PatchedHeightMap<TTValueType extends TValueType>
     extends AbsChunkedHeightMap<THeightMapArrayTypeBag<TTValueType>>
  implements IReadonlyAbsChunkedHeightMapTypped<THeightMapArrayTypeBag<TTValueType>> {
    
    private _valueType: TTValueType;
    private _maxSafeFactor: int;
    private _heightDecoderValue: float;
    private _netMaxHeight: float | null;

    public get netMaxHeight() { return this._netMaxHeight; }
    public get valueType(): TValueType { return this._valueType; }

    public static createBuffer<TTValueType extends TValueType>(width: int, depth: int, chunkSize: int, valueType: TTValueType): THeightMapArrayTypeBag<TTValueType> {

        const numChunksX   = ((width - 1) / (chunkSize - 1)) | 0;
        const numChunksZ   = ((depth - 1) / (chunkSize - 1)) | 0;
        const chunkArrSize = chunkSize ** 2;
        const chunkCount   = numChunksX * numChunksZ;

        return (
            valueType === "32f" ? new Float32Array(chunkArrSize * chunkCount) :
            valueType === "16u" ? new Uint16Array(chunkArrSize * chunkCount) :
            valueType === "8u"  ? new Uint8Array(chunkArrSize * chunkCount) :
                                  new Float32Array(chunkArrSize * chunkCount)
        ) as unknown as THeightMapArrayTypeBag<TTValueType>;
    }

    public constructor(width: int, depth: int, patchSize: int, dataChunkSize: int, maxHeight: float, valueType: TTValueType);
    public constructor(width: int, depth: int, patchSize: int, dataChunkSize: int, maxHeight: float, valueType: TTValueType, buffer: THeightMapArrayTypeBag<TTValueType>, itemSize?: int, itemHeightIndexOffset?: int);
    public constructor(width: int, depth: int, patchSize: int, dataChunkSize: int, maxHeight: float, valueType: TTValueType, buffer?: THeightMapArrayTypeBag<TTValueType>, itemSize: int = defaultHeightVertexSize, itemHeightIndexOffset: int = 0) {
        const validDataChunkSize = getOrThrowDataChunkSize(patchSize, dataChunkSize);
        const tmpBuffer = buffer ?? PatchedHeightMap.createBuffer(width, depth, validDataChunkSize, valueType);
        super(width, depth, patchSize, dataChunkSize, maxHeight, tmpBuffer, itemSize, itemHeightIndexOffset);
        this._netMaxHeight = null;
        this._valueType = valueType;
        this._maxSafeFactor =
            valueType === "32f" ? 1.0 :
            valueType === "16u" ? 0xffff :
            valueType === "8u"  ? 0xff :
            1.0;
        this._recalculateDecoderValue();
    }

    public override setMaxHeight(maxHeight: float) {

        // Save last net max height
        if (this._valueType === '32f' &&
            this._netMaxHeight === null) {
            this._netMaxHeight = this.maxHeight;
        }

        // Save prev value
        super.setMaxHeight(maxHeight);
        this._recalculateDecoderValue();
    }

    protected _recalculateDecoderValue() {
        this._heightDecoderValue = this.maxHeight / this._maxSafeFactor;
    }

    public updateValuesByMaxHeight(): boolean {

        // No dirty data
        if (this._netMaxHeight === null ||
            this._valueType !== '32f') {
            return false;
        }

        const data = this.data;
        const len  = this.data.length;
        const max  = this.maxHeight;

        for (let i = 0; i < len; i++) {
            // Normalize for new max
            data[i] = data[i] / this._netMaxHeight * max;
        }

        this._netMaxHeight === null;
        return true;
    }

    protected override _encodeHeight(store: THeightMapArrayTypeBag<TTValueType>, index: int, value: float, max: float) {

        const normalize = Math.max(Math.min(value, max), 0);

        if (this._valueType === '32f') {

            // Is not dirty max height ?
            if (this._netMaxHeight === null) {
                store[index] = normalize;
            }
            else {
                // convert to net
                store[index] = normalize / max * this._netMaxHeight;
            }
        }
        else {
            // save factor for not float32 value type
            const factor = normalize / max;
            store[index] = Math.min(factor * this._maxSafeFactor, this._maxSafeFactor);
        }
    }

    protected override _decodeHeight(store: THeightMapArrayTypeBag<TTValueType>, index: int, max: float) {

        if (this._valueType === '32f') {

            if (this._netMaxHeight === null) {
                return store[index];
            }

            // Normalize for dirty max height
            return store[index] / this._netMaxHeight * max;
        }

        return store[index] * this._heightDecoderValue;
    }

    protected override _decodeHeightFactor(store: THeightMapArrayTypeBag<TTValueType>, index: int, max: float) {

        if (this._valueType === '32f') {

            if (this._netMaxHeight === null) {
                return store[index] / max;
            }

            return store[index] / this._netMaxHeight;
        }

        return store[index] / this._maxSafeFactor;
    }
}

export default PatchedHeightMap;