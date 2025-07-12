import { coordsVertexSize, type IReadonlyCoordsBuffer } from "../Core/CoordsBuffer.mjs";
import GPUHeightMapBuffer from "./GPUHeightMapBuffer.mjs";
import type { IPatchInstancing } from "./IPatchInstancing.mjs";

export default class GPUBuffersManager {

    private _heightMap: GPUHeightMapBuffer;
    private _sharedIndexBuffer: pcx.IndexBuffer;
    private _sharedVertexBuffer: pcx.VertexBuffer;

    public get heightMap() { return this._heightMap; }
    public get sharedIndexBuffer() { return this._sharedIndexBuffer; }
    public get sharedVertexBuffer() { return this._sharedVertexBuffer; }

    constructor (heightMap: GPUHeightMapBuffer) {
        this._heightMap = heightMap;
        this.updateIndexBuffer();
        this.updateVertexBuffer();
    }

    public destroy() {
        this._sharedIndexBuffer?.destroy();
        this._sharedVertexBuffer?.destroy();
    }

    private _buildVertexFormat(graphicsDevice: pcx.GraphicsDevice, vertexBuffer: IReadonlyCoordsBuffer) {

        const coordsFormat = (vertexBuffer.patchVertexBufferTyped instanceof Uint8Array) ? pc.TYPE_UINT8 : pc.TYPE_UINT16;
        const vertexDesc = [{
            semantic: pc.SEMANTIC_POSITION,
            components: coordsVertexSize,
            type: coordsFormat,
            normalize: false,
            asInt: true
        }];

        return new pc.VertexFormat(graphicsDevice, vertexDesc, vertexBuffer.patchVertexBufferLength);
    }

    public updateIndexBuffer() {

        const graphicsDevice = this._heightMap.app.graphicsDevice;
        const patchIndices = this._heightMap.field.patchIndices;

        this._sharedIndexBuffer?.destroy();
        this._sharedIndexBuffer = new pc.IndexBuffer(
            graphicsDevice,
            pc.INDEXFORMAT_UINT32,
            patchIndices.length,
            pc.BUFFER_STATIC,
            patchIndices,
            { storage: false }
        );
    }

    public updateVertexBuffer() {

        const graphicsDevice = this._heightMap.app.graphicsDevice;
        const coordBuffer = this._heightMap.field.patchVertices;
        const bufferData = coordBuffer.patchVertexBufferData;
        const format = this._buildVertexFormat(graphicsDevice, coordBuffer);

        this._sharedVertexBuffer?.destroy();
        this._sharedVertexBuffer = new pc.VertexBuffer(graphicsDevice, format, format.vertexCount, {
            usage: pc.BUFFER_STATIC,
            storage: false,
            data: bufferData,
        });
    }

    protected _buildInstancingVertexFormat(instancer: IPatchInstancing<any>) {

        const graphicsDevice = this._heightMap.app.graphicsDevice;
        const type = instancer.bufferType === Uint16Array ? pc.TYPE_UINT16 :
                     instancer.bufferType === Uint8Array ?  pc.TYPE_UINT8 :
                                                            pc.TYPE_FLOAT32;

        return new pc.VertexFormat(graphicsDevice, [{
            semantic: pc.SEMANTIC_ATTR10,
            components: instancer.itemBufferSize,
            type: type,
            normalize: false,
            asInt: true
        }]);
    }

    public buildInstancingVertexBuffer(instancer: IPatchInstancing<any>, data: Uint16Array | Uint8Array) {
        const vertexFormat = this._buildInstancingVertexFormat(instancer);
        const numVertices  = data.length / instancer.itemBufferSize;
        return new pc.VertexBuffer(vertexFormat.device, vertexFormat, numVertices, {
            usage: pc.BUFFER_GPUDYNAMIC,
            data: data,
            storage: false,
        });
    }
}