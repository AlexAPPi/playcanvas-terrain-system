import type { int } from "../Extras/Types.mjs";
import { checkSupportR32FTexture } from "../Extras/Utils.mjs";
import type { IReadonlyAbsHeightMap, THeightMapFormat } from "../Core/AbsHeightMap.mjs";
import CompressedPatchedHeightMap from "../Core/CompressedPatchedHeightMap.mjs";
import SquareIterator from "../Core/SquareIterator.mjs";
import type { IZone } from "../Core/IZone.mjs";
import Heightfield from "../Core/Heightfield.mjs";
import { getTextureType } from "./ShaderChunks.mjs";

export default class GPUHeightMapBuffer extends SquareIterator {

    private _app: pcx.AppBase;
    private _format: THeightMapFormat;
    private _texture: pcx.Texture;
    private _textureLevelsType: Float32ArrayConstructor | Uint16ArrayConstructor | Uint8ArrayConstructor;

    public get app() { return this._app; }
    public get format() { return this._format; }
    public get texture() { return this._texture; }

    constructor (app: pcx.AppBase, field: Heightfield) {
        super(field);
        this._app = app;
        this._init();
    }

    public destroy() {
        this._texture?.destroy();
    }

    private _init() {

        this._texture?.destroy();

        const device        = this._app.graphicsDevice;
        const heightFormat  = getHeightMapFormat(device, this.field.heightMap);
        const format        = getTextureType(heightFormat);
        const bufFormat     = getHeightMapChunkBufferType(device, format);
        const dataChunkSize = this.field.heightMap.dataChunkSize;
        const chunks        = this.field.heightMap.getChunksBuffers(bufFormat);

        this._format = heightFormat;
        this._textureLevelsType = bufFormat;
        this._texture = new pc.Texture(device, {
            width: dataChunkSize,
            height: dataChunkSize,
            format: format,
            mipmaps: false,
            minFilter: pc.FILTER_NEAREST,
            magFilter: pc.FILTER_NEAREST,
            addressU: pc.ADDRESS_CLAMP_TO_EDGE,
            addressV: pc.ADDRESS_CLAMP_TO_EDGE,
            addressW: pc.ADDRESS_CLAMP_TO_EDGE,
            flipY: device.isWebGPU,
            arrayLength: chunks.length,
            levels: [chunks]
        });
    }

    public updateHeightMapChunk(chunkX: int, chunkZ: int) {
        
        // The height map is updated by updating the entire chunk,
        // which is sufficient if the chunk size is not large.

        const dataChunkSize = this.field.heightMap.dataChunkSize;
        const level  = this.field.heightMap.getChunkIndex(chunkX, chunkZ);
        const buffer = this.field.heightMap.getChunkBuffer(this._textureLevelsType, chunkX, chunkZ);

        if (this._app.graphicsDevice.isWebGL2) {

            const gl = (this._app.graphicsDevice as pcx.WebglGraphicsDevice).gl;
            const textureFormat = this._texture.impl._glFormat;
            const texturePixelT = this._texture.impl._glPixelType;
            const textureTarget = this._texture.impl._glTarget;
            const textureObject = this._texture.impl._glTexture;

            gl.bindTexture(textureTarget, textureObject);
            gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, level, dataChunkSize, dataChunkSize, 1, textureFormat, texturePixelT, buffer);
        }
        else if (this._app.graphicsDevice.isWebGPU) {

            const webgpu  = (this._app.graphicsDevice as any).wgpu as GPUDevice;
            const texture = (this._texture.impl.gpuTexture) as GPUTexture;

            webgpu.queue.writeTexture(
                {
                    texture: texture,
                    origin: [0, 0, level]
                },
                buffer,
                {
                    offset: 0,
                    bytesPerRow: dataChunkSize * 4, // always 4 for rgba format
                    rowsPerImage: dataChunkSize
                },
                {
                    width: dataChunkSize,
                    height: dataChunkSize
                }
            );
        }
    }

    public updateHeightMap(zone: IZone) {
        
        // Ignore update if height map need upload
        if (this._texture._needsUpload) {
            return;
        }

        this._forEach(
            zone,
            this.field.heightMap.dataChunkSize,
            this.field.heightMap.dataNumChunksX,
            this.field.heightMap.dataNumChunksZ,
            (patchIndex, x, z) => {
                this.updateHeightMapChunk(x, z);
            }
        );
    }
}

export function getHeightMapFormat(graphicsDevice: pcx.GraphicsDevice, heightMap: IReadonlyAbsHeightMap) {
    
    let hmFormat: THeightMapFormat = checkSupportR32FTexture(graphicsDevice) ? 'r32f' : 'rgba';

    if (heightMap instanceof CompressedPatchedHeightMap) {
        hmFormat = heightMap.compressAlgoritm === 'x4' ? 'rgbaX4' : 'rgbaX2';
    }

    return hmFormat;
}

export function getHeightMapChunkBufferType(graphicsDevice: pcx.GraphicsDevice, format: number) {

    if (format === pc.PIXELFORMAT_R32F) {
        return Float32Array;
    }

    if (format === pc.PIXELFORMAT_RG16U) {
        return Uint16Array;
    }

    if (format === pc.PIXELFORMAT_RGBA8U) {
        return Uint8Array;
    }

    throw new Error('Unsupported format');
}