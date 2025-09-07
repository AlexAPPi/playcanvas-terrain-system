import type { IPatchLodBase } from "../Core/IPatchLod.mjs";
import { BOTTOM, LEFT, RIGHT, TOP, type IReadonlyLodInfo } from "../Core/LodInfo.mjs";
import GPUBuffersManager from "./GPUBuffersManager.mjs";

export interface IInternalWireframeData {
    buffer: pcx.IndexBuffer | null;
    primitive: {
        type: number,
        base: number,
        baseVertex: number,
        count: number,
        indexed: true
    }
}

export interface IWireframeData extends IInternalWireframeData {
    buffer: pcx.IndexBuffer;
}

const offsets = [[0, 1], [1, 2], [2, 0]];

export default class GPUWireframeBufferManager {
    
    private _byffersManager: GPUBuffersManager;
    private _lodInfo: IReadonlyLodInfo[];
    private _data: IInternalWireframeData[][][][][];

    public get lodInfo() { return this._lodInfo; }
    public get buffersManager() { return this._byffersManager; }

    public constructor(byffersManager: GPUBuffersManager, lodInfo: IReadonlyLodInfo[]) {
        this._byffersManager = byffersManager;
        this._lodInfo = lodInfo;
        this._initData();
    }

    private _initData() {

        this._data = new Array(this._lodInfo.length);

        for (let lodCore = 0; lodCore < this._data.length; lodCore++) {

            const arr = new Array<IInternalWireframeData[][][]>(LEFT);
        
            for (let l = 0; l < LEFT; l++)   { arr[l] = new Array(RIGHT);
            for (let r = 0; r < RIGHT; r++)  { arr[l][r] = new Array(TOP);
            for (let t = 0; t < TOP; t++)    { arr[l][r][t] = new Array(BOTTOM);
            for (let b = 0; b < BOTTOM; b++) {
                
                arr[l][r][t][b] = {
                    buffer: null,
                    primitive: {
                        type: pc.PRIMITIVE_LINES,
                        base: 0,
                        baseVertex: 0,
                        count: 0,
                        indexed: true
                    }
                };
            }}}}

            this._data[lodCore] = arr;
        }
    }

    private _recreateWireframeData(lod: IPatchLodBase) {

        const lodInfo = this._lodInfo[lod.core].info[lod.left][lod.right][lod.top][lod.bottom];
        const bufferScope = this._data[lod.core][lod.left][lod.right][lod.top][lod.bottom];

        bufferScope.buffer?.destroy();

        const indexBuffer = this._byffersManager.sharedIndexBuffer;
        const numVertices = this._byffersManager.sharedVertexBuffer.numVertices;

        const seen = new Set();
        const base = lodInfo.start;
        const count = lodInfo.count;
        const srcIndices = new Uint32Array(indexBuffer.storage);
        const tmpIndices = [];

        for (let j = base; j < base + count; j += 3) {
            for (let k = 0; k < 3; k++) {
                const i1 = srcIndices[j + offsets[k][0]];
                const i2 = srcIndices[j + offsets[k][1]];
                const hash = (i1 > i2) ? ((i2 * numVertices) + i1) : ((i1 * numVertices) + i2);
                if (!seen.has(hash)) {
                    seen.add(hash);
                    tmpIndices.push(i1, i2);
                }
            }
        }

        const dstIndices = new Uint32Array(tmpIndices);

        bufferScope.primitive.count = dstIndices.length;
        bufferScope.buffer = new pc.IndexBuffer(
            indexBuffer.device,
            pc.INDEXFORMAT_UINT32,
            dstIndices.length,
            pc.BUFFER_STATIC,
            dstIndices.buffer,
            { storage: false }
        );
    }

    private _getOrCreateWireframeData(lod: IPatchLodBase) {

        const bufferScope = this._data[lod.core][lod.left][lod.right][lod.top][lod.bottom];

        if (!bufferScope.buffer) {
            this._recreateWireframeData(lod);
        }

        return bufferScope as unknown as IWireframeData;
    }

    public get(lod: IPatchLodBase) {
        return this._getOrCreateWireframeData(lod);
    }

    public freeData(lod: IPatchLodBase) {
        const bufferScope = this._data[lod.core][lod.left][lod.right][lod.top][lod.bottom];
        bufferScope.buffer?.destroy();
        bufferScope.buffer = null;
    }

    public free() {
        for (let core = 0; core < this._data.length; core++) {
            for (let left = 0; left < LEFT; left++) {
                for (let right = 0; right < RIGHT; right++) {
                    for (let top = 0; top < TOP; top++) {
                        for (let bottom = 0; bottom < BOTTOM; bottom++) {

                            this.freeData({ core, left, right, top, bottom });
                        }
                    }
                }
            }
        }
    }

    public destroy() {
        this.free();
    }
}