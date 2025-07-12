import { int } from "../Extras/Types.mjs";

export class GrassFieldTexture {

    public static readonly MAX_CHANEL = 8;

    private _texture: pcx.Texture;
    private _buffer: Uint8Array;
    private _width: number;
    private _depth: number;

    public get texture() { return this._texture; }

    constructor(graphicsDevice: pcx.GraphicsDevice, width: number, depth: number, buffer?: Uint8Array) {

        this._width = width;
        this._depth = depth;

        const w = (width - 1) / 4 + 1;
        const d = (depth - 1) / 4 + 1;

        this._buffer = buffer ?? new Uint8Array(w * d * 4); // => 1 byte = 8 bits => 8 / 2 = 4 bit for 8 levels
        this._texture = new pc.Texture(graphicsDevice, {
            width: w,
            height: d,
            format: pc.PIXELFORMAT_RGBA8U,
            mipmaps: false,
            minFilter: pc.FILTER_NEAREST,
            magFilter: pc.FILTER_NEAREST,
            addressU: pc.ADDRESS_CLAMP_TO_EDGE,
            addressV: pc.ADDRESS_CLAMP_TO_EDGE,
            flipY: graphicsDevice.isWebGPU,
            levels: [this._buffer]
        });
    }

    public destroy() {
        this._texture?.destroy();
    }

    public setChannel(x: int, z: int, channel: int) {
        const index = (x + z * this._width) / 4 | 0;
        const value = this._buffer[index];
    }

    public setPixel() {

        if (this._texture) {

            const device = this._texture.device;
            const dataChunkSize = 1;
            const buffer = new Uint8Array(4);

            if (device.isWebGL2) {

                const gl = (device as pcx.WebglGraphicsDevice).gl;
                const textureFormat = this._texture.impl._glFormat;
                const texturePixelT = this._texture.impl._glPixelType;
                const textureTarget = this._texture.impl._glTarget;
                const textureObject = this._texture.impl._glTexture;

                gl.bindTexture(textureTarget, textureObject);
                gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, 0, dataChunkSize, dataChunkSize, 1, textureFormat, texturePixelT, buffer);
            }
            else if (device.isWebGPU) {

                const webgpu  = (device as any).wgpu as GPUDevice;
                const texture = (this._texture.impl.gpuTexture) as GPUTexture;

                webgpu.queue.writeTexture(
                    {
                        texture: texture,
                        origin: [0, 0, 0],
                        mipLevel: 0
                    },
                    buffer,
                    {
                        offset: 0,
                        bytesPerRow: 4 * dataChunkSize, // always 4 for rgba format
                        rowsPerImage: dataChunkSize
                    },
                    {
                        width: dataChunkSize,
                        height: dataChunkSize
                    }
                );
            }
        }
    }
}