import type { float } from "../Extras/Types.mjs";
import { getHeightMapFormat } from "../Heightfield/GPUHeightMapBuffer.mjs";
import { getAltitudeFromTextureVSCode, getSamplerType, getAltitudeFromTextureChunks, heightMapParamName, heightMapSampler, maxHeightParamName } from "../Heightfield/ShaderChunks.mjs";
import Terrain from "../Scripts/Terrain.mjs";

const defines =
`
    #define HM_NUM_CHUNKS_X       (%%HM_NUM_CHUNKS_X%%)
    #define HM_NUM_CHUNKS_X_U     (uint(HM_NUM_CHUNKS_X))
    #define HM_CHUNK_SIZE         (%%HM_CHUNK_SIZE%%)
    #define HM_CHUNK_SIZE_F       (float(HM_CHUNK_SIZE))
    #define HM_CHUNK_SIZE_U       (uint(HM_CHUNK_SIZE))

    #define FIELD_SIZE            (ivec2(%%FIELD_SIZE_X%%, %%FIELD_SIZE_Z%%))
    #define FIELD_SIZE_F          (vec2(%%FIELD_SIZE_X_F%%, %%FIELD_SIZE_Z_F%%))
    #define FIELD_SIZE_BOUND_F    (FIELD_SIZE_F - 2.0)      
    #define FIELD_SIZE_H_F        (FIELD_SIZE_F / 2.0)

    #define GRASS_FIELD_SIZE_F    (vec2(%%GRASS_FIELD_SIZE_X%%, %%GRASS_FIELD_SIZE_Z%%))
    #define GRASS_FIELD_SIZE_H_F  (GRASS_FIELD_SIZE_F / 2.0)
`;

const uniforms = 
`
    uniform float ${maxHeightParamName};
`;

const heightMapDecoder =
`
    uvec3 getFieldChunkBufferCoord(vec2 nXZ) {
        uvec2 xz = uvec2(clamp(nXZ, vec2(0.0), FIELD_SIZE_F));
        uvec2 ck = xz / HM_CHUNK_SIZE_U, local = xz % HM_CHUNK_SIZE_U;
        return uvec3(local, ck.y * HM_NUM_CHUNKS_X_U + ck.x);
    }
    
    float getAltitude(vec2 xz) {
        uvec3 coord = getFieldChunkBufferCoord(xz);
        return getAltitudeFromTexture(coord);
    }

    float getAltitudeInterpolatedAndNormal(vec2 xz, out vec3 surfaceNormal) {

        float x0z0 = getAltitude(xz);
        float x1z0 = getAltitude(xz + vec2(1.0, 0.0));
        float x0z1 = getAltitude(xz + vec2(0.0, 1.0));
        float x1z1 = getAltitude(xz + vec2(1.0, 1.0));

        float factorX = xz[0] - floor(xz[0]);
        float factorZ = xz[1] - floor(xz[1]);

        float interpolatedBottom = (x1z0 - x0z0) * factorX + x0z0;
        float interpolatedTop    = (x1z1 - x0z1) * factorX + x0z1;
        float finalHeight        = (interpolatedTop - interpolatedBottom) * factorZ + interpolatedBottom;

        float left  = x1z0;
        float right = getAltitude(xz + vec2(-1.0, 0));
        float up    = x0z1;
        float down  = getAltitude(xz + vec2(0, -1.0));

        surfaceNormal = normalize(vec3(left, 2.0, down) - vec3(right, 0.0, up));

        return finalHeight;
    }
`;

const vshader =
`
    attribute vec2 vertex_position;

    uniform vec3 uViewerPosition;
    uniform vec3 uTerrainScale;

    varying vec2 vOffset;

    void main(void)
    {
        gl_Position = vec4(vertex_position, 0.5, 1.0);

        vOffset = floor(uViewerPosition.xz / uTerrainScale.xz) + FIELD_SIZE_H_F - GRASS_FIELD_SIZE_H_F;
    }
`;

const fshader =
`
    uniform vec3 uTerrainScale;

    varying vec2 vOffset;

    vec4 packFloatFrom0To1ToRGBA(float value) {
        float r = floor(value * 255.0);
        float g = floor(fract(value * 255.0) * 255.0);
        float b = floor(fract(value * 255.0 * 255.0) * 255.0);
        float a = floor(fract(value * 255.0 * 255.0 * 255.0) * 255.0);
        return vec4(r, g, b, a) / 255.0;
    }
    
    void main(void) {

        vec2 pixelXY = gl_FragCoord.xy;
        vec2 fieldPointXZ = vOffset + pixelXY;
        vec3 fieldPointNormal;

        float fieldPointAltitude = getAltitudeInterpolatedAndNormal(fieldPointXZ, fieldPointNormal);
        float fieldPointFactor = fieldPointAltitude / ${maxHeightParamName};

        pcFragColor0 = packFloatFrom0To1ToRGBA(fieldPointFactor);
        pcFragColor1 = vec4(fieldPointNormal, 1.0);
    }
`;

export default class GrassFieldCompute {

    private _shader: pcx.Shader;
    private _bufferHm: pcx.Texture;
    private _bufferNm: pcx.Texture;

    private _renderTarget: pcx.RenderTarget;
    private _quadRenderPass: pcx.RenderPassShaderQuad;
    private _viewport: pcx.Vec4;

    public readonly accuracy = 1.0;

    public readonly size;
    public readonly normalizeRadius;
    public readonly patchRadius;

    public get bufferHeightMap() { return this._bufferHm; }
    public get bufferNormalMap() { return this._bufferNm; }

    public static getNormalizeRadius(radius: float) {
        return Math.floor(radius);
    }

    constructor(
        readonly graphicsDevice: pcx.GraphicsDevice,
        readonly radius: float,
        readonly terrain: Terrain
    ) {
        this.normalizeRadius = GrassFieldCompute.getNormalizeRadius(this.radius);
        this.patchRadius = this.normalizeRadius / 5;

        // Add pixel for render far blade pos more (radius + randValue)
        this.size = this.normalizeRadius * 2.0;

        this._initShader();
        this._initRenderTarget();

        this._viewport = new pc.Vec4(0, 0, this.size * this.accuracy, this.size * this.accuracy);
        this._quadRenderPass = new pc.RenderPassShaderQuad(this.graphicsDevice);
        this._quadRenderPass.shader = this._shader;
        this._quadRenderPass.init(this._renderTarget);
    }
    
    public destroy() {
        this._quadRenderPass?.destroy();
        this._renderTarget?.destroy();
        this._bufferHm?.destroy();
        this._bufferNm?.destroy();
        this._shader?.destroy();
    }

    public update(localPosition: pcx.Vec3) {

        const graphicsDevice = this.graphicsDevice as pcx.NullGraphicsDevice;

        graphicsDevice.scope.resolve(heightMapParamName).setValue(this.terrain.heightMapTexture);
        graphicsDevice.scope.resolve(maxHeightParamName).setValue(this.terrain.height);
        graphicsDevice.scope.resolve('uViewerPosition').setValue(localPosition.toArray());
        graphicsDevice.scope.resolve('uTerrainScale').setValue(this.terrain.entity.getScale().toArray());

        // backup current settings
        const { vx, vy, vw, vh, sx, sy, sw, sh } = graphicsDevice;

        // set new values
        graphicsDevice.setViewport(this._viewport.x, this._viewport.y, this._viewport.z, this._viewport.w);
        graphicsDevice.setScissor(this._viewport.x, this._viewport.y, this._viewport.z, this._viewport.w);

        this._quadRenderPass.render();

        graphicsDevice.setViewport(vx, vy, vw, vh);
        graphicsDevice.setScissor(sx, sy, sw, sh);

        // debug
        // pc!.app!.drawTexture( 0.5, -0.6, 0.5, 0.3, this._buffer, undefined as any);
    }

    private _initShader() {

        const heightMap = this.terrain.object.heightMap;
        const hmFormat = getHeightMapFormat(this.graphicsDevice, heightMap);
        const heightMapFragment = heightMapSampler.replaceAll('%%HEIGHT_MAP_SAMPLER%%', getSamplerType(hmFormat));
        const altitudeFromTextureFragment = getAltitudeFromTextureVSCode(hmFormat, getAltitudeFromTextureChunks);
        const definesFragment = defines
            .replace('%%HM_NUM_CHUNKS_X%%', String(heightMap.dataNumChunksX))
            .replace('%%HM_CHUNK_SIZE%%', String(heightMap.dataChunkSize))
            .replace('%%FIELD_SIZE_X%%', String(heightMap.width))
            .replace('%%FIELD_SIZE_Z%%', String(heightMap.depth))
            .replace('%%FIELD_SIZE_X_F%%', heightMap.width.toFixed(1))
            .replace('%%FIELD_SIZE_Z_F%%', heightMap.depth.toFixed(1))
            .replace('%%GRASS_FIELD_SIZE_X%%', String(this.size))
            .replace('%%GRASS_FIELD_SIZE_Z%%', String(this.size));
        
        const vertexShader = definesFragment
                            + vshader;
                            
        const fragmentShader = definesFragment
                                + uniforms
                                + heightMapFragment
                                + altitudeFromTextureFragment
                                + heightMapDecoder
                                + fshader;
        
        this._shader = pc.ShaderUtils.createShader(this.graphicsDevice, {
            uniqueName: "GrassFieldComputeShader",
            useTransformFeedback: false,
            vertexGLSL: vertexShader,
            fragmentGLSL: fragmentShader,
            attributes: {
                vertex_position: pc.SEMANTIC_POSITION
            },
        });
    }

    private _initBufferTexture(name: string, format: typeof pc.PIXELFORMAT_RGBA8 | typeof pc.PIXELFORMAT_R32F = pc.PIXELFORMAT_RGBA8) {

        return new pc.Texture(this.graphicsDevice, {
            name,
            format,
            width: this.size * this.accuracy,
            height: this.size * this.accuracy,
            mipmaps: false,
            storage: true,
            type: pc.TEXTURETYPE_DEFAULT,
            addressU: pc.ADDRESS_CLAMP_TO_EDGE,
            addressV: pc.ADDRESS_CLAMP_TO_EDGE,
            minFilter: pc.FILTER_LINEAR_MIPMAP_LINEAR,
            magFilter: pc.FILTER_LINEAR,
            flipY: !this.graphicsDevice.isWebGPU
        });
    }

    private _initRenderTarget() {
        this._bufferHm = this._initBufferTexture('GrassBufferHM');
        this._bufferNm = this._initBufferTexture('GrassBufferNM');
        this._renderTarget = new pc.RenderTarget({
            colorBuffers: [this._bufferHm, this._bufferNm],
            flipY: !this.graphicsDevice.isWebGPU,
            stencil: false,
            depth: false
        });
    }
}