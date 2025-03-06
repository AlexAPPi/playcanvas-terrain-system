import { THeightMapFormat } from "../TerrainSystem/AbsHeightMap.mjs";

export const vertexCoordAttrName   = "vertex_position";
export const vertexHeightAttrName  = "vertex_height";
export const vertexNormalAttrName  = "vertex_normal";

export const patchInstCoordOffsetParamName = "vertex_postion_offset";
export const patchCoordOffsetParamName     = "uTerrainPatchCoordOffset";
export const patchLodCoreParamName         = "uTerrainPatchLodCore";

export const terrainHeightMapParamName = "uTerrainHeightMap";
export const terrainMinHeightParamName = "uTerrainMinHeight";
export const terrainMaxHeightParamName = "uTerrainMaxHeight";
export const terrainSplatMapParamName  = "uTerrainSplatMap";

export const littleEndian = (() => {
    const uint8Array  = new Uint8Array([0xAA, 0xBB]);
    const uint16array = new Uint16Array(uint8Array.buffer);
    return uint16array[0] === 0xBBAA;
})();

export const littleEndianValue = littleEndian ? 'true' : 'false';

export const definesVS = /** @type glsl */
`
    #define HM_NUM_CHUNKS_X (%%HM_NUM_CHUNKS_X%%)
    #define HM_CHUNK_SIZE   (%%HM_CHUNK_SIZE%%)
    #define HM_CHUNK_SIZE_F (float(HM_CHUNK_SIZE))
    #define TR_SIZE         (ivec2(%%TR_SIZE_X%%, %%TR_SIZE_Z%%))
    #define TR_SIZE_F       (vec2(%%TR_SIZE_X_F%%, %%TR_SIZE_Z_F%%))
    #define TR_SIZE_H_F     (TR_SIZE_F / 2.0)
    #define TR_SIZE_H_N_F   (-TR_SIZE_H_F)
`;

export const baseOriginalVS = /** @type glsl */
`
    attribute uvec2 ${vertexCoordAttrName};
`;

export const baseForInstancingVS = /** @type glsl */
`
    attribute uvec2 ${vertexCoordAttrName};
    attribute uvec2 ${patchInstCoordOffsetParamName};
`;

//uniform vec2 ${terrainSizeParamName};
//uniform float ${terrainHeightMapChunkSizeParamName};

export const baseClearVS = /** @type glsl */
`
    // #define #baseDefinesVS
    // #define #baseOriginalVS [OR] #baseForInstancingVS

    uniform mat4 matrix_viewProjection;
    uniform mat4 matrix_model;
    uniform mat3 matrix_normal;

    uniform vec2 ${patchCoordOffsetParamName};
    uniform float ${patchLodCoreParamName};

    uniform %%HEIGHT_MAP_SAMPLER%% ${terrainHeightMapParamName};

    uniform float ${terrainMinHeightParamName};
    uniform float ${terrainMaxHeightParamName};
    
    vec3 dPositionW;
    mat4 dModelMatrix;
    mat3 dNormalMatrix;
    vec2 dCurrentTerrainXZ;
    vec3 dCurrentTerrainNormal;
    float dCurrentTerrainHeight;
`;

export const currentTerrainXZForInstancingChunkVS = /** @type glsl */
`
    vec2 getCurrentTerrainXZ() {
        return vec2(${vertexCoordAttrName}) + vec2(${patchInstCoordOffsetParamName});
    }
`;

export const currentTerrainXZChunkVS = 
`
    vec2 getCurrentTerrainXZ() {
        return vec2(${vertexCoordAttrName}) + ${patchCoordOffsetParamName};
    }
`;

export const terrainCoordsChunkVS =
`
    vec2 getCurrentTerrainUvCoord() {
        vec2 xz = dCurrentTerrainXZ;
        vec2 uv = (xz + 0.5) / TR_SIZE_F;
        return uv;
    }

    vec2 clampTerrainXZ(vec2 xz) {
        return clamp(xz, vec2(0.0), TR_SIZE_F);
    }

    vec2 getTerrainXZ(ivec2 offset) {
        return dCurrentTerrainXZ + vec2(offset);
    }
`;

// Not support for webgpu
export const terrainHeightFactorRGB8VS =
`
    float rgb8ToFloat(ivec3 v) {
        uvec3 uints = uvec3(v * 255.0);
        uint scaled = (uints.r << 16) | (uints.g << 8) | uints.b;
        return float(scaled) / 16777215.0;
    }

    float getTerrainHeightFactorFromTexture(ivec3 uv) {
        vec3 rgb = texture(${terrainHeightMapParamName}, uv);
        return rgb8ToFloat(rgb);
    }
`;

export const terrainHeightFactorR32FVS = 
`
    float getTerrainHeightFactorFromTexture(ivec3 uv) {
        return texture(${terrainHeightMapParamName}, uv).r;
    }
`;

// https://stackoverflow.com/questions/63827836/is-it-possible-to-do-a-rgba-to-float-and-back-round-trip-and-read-the-pixels-in
// note: the 0.1s here an there are voodoo related to precision
export const terrainHeightFactorRGBA8VS =
`
    float rgba8ToFloat(vec4 v) {
        vec4 bits  = ${littleEndian ? 'v' : 'v.abgr'} * 255.0;
        float sign = mix(-1.0, 1.0, step(bits[3], 128.0));
        float expo = floor(mod(bits[3] + 0.1, 128.0)) * 2.0 + floor((bits[2] + 0.1) / 128.0) - 127.0;
        float sig  = bits[0] + bits[1] * 256.0 + floor(mod(bits[2] + 0.1, 128.0)) * 256.0 * 256.0;
        return sign * (1.0 + sig / 8388607.0) * pow(2.0, expo);
    }
    
    float getTerrainHeightFactorFromTexture(ivec3 uv) {
        vec4 rgba = texelFetch(${terrainHeightMapParamName}, uv, 0);
        return rgba8ToFloat(rgba);
    }
`;

// TODO: check littleEndian
// Compress height by x coord [patch0, patch1] ...
// see: CompressedPatchedHeightMap file
export const terrainHeightFactorRG16UX2VS =
`
    float getTerrainHeightFactorFromTexture(ivec3 uv) {

        int level    = uv.b;
        int newLevel = level / 2;
        int chunkX   = level % HM_NUM_CHUNKS_X;
        int shift    = chunkX % 2;

        #if defined(WEBGPU)
        uvec4 rgba = texelFetch(usampler2DArray(${terrainHeightMapParamName}_texture, ${terrainHeightMapParamName}_sampler), ivec3(uv.rg, newLevel), 0);
        #else
        uvec4 rgba = texelFetch(${terrainHeightMapParamName}, ivec3(uv.rg, newLevel), 0);
        #endif
        
        uint value   = (shift == 0) ? rgba.r : rgba.g;
        return float(value) / 65535.0;
    }
`;

export const terrainHeightFactorRGBA8UX4VS =
`
    float getTerrainHeightFactorFromTexture(ivec3 uv) {

        int level    = uv.b;
        int newLevel = level / 4;
        int chunkX   = level % HM_NUM_CHUNKS_X;
        int shift    = chunkX % 4;

        #if defined(WEBGPU)
        uvec4 rgba = texelFetch(usampler2DArray(${terrainHeightMapParamName}_texture, ${terrainHeightMapParamName}_sampler), ivec3(uv.rg, newLevel), 0);
        #else
        uvec4 rgba = texelFetch(${terrainHeightMapParamName}, ivec3(uv.rg, newLevel), 0);
        #endif

        return float(rgba[shift]) / 255.0;
    }
`;

export const terrainChunkUVVS =
`
    // #define #terrainCoordsChunkVS

    ivec3 getTerrainChunkUV(ivec2 offset) {

        vec2 oc = getTerrainXZ(offset);
        vec2 xz = clampTerrainXZ(oc);
        vec2 cc = floor(xz / HM_CHUNK_SIZE_F);

        int localX = int(xz[0]) % HM_CHUNK_SIZE;
        int localZ = int(xz[1]) % HM_CHUNK_SIZE;
        int chunkX = int(cc[0]);
        int chunkZ = int(cc[1]);
        int level  = chunkZ * HM_NUM_CHUNKS_X + chunkX;

        return ivec3(localX, localZ, level);
    }
`;

export const terrainHeightFactorChunkVS = 
`
    // #define #terrainHeightFactorRGBA8VS [OR] #terrainHeightFactorRGB8VS
    // #define #terrainChunkUVVS

    float getTerrainHeightFactor(ivec2 offset) {
        ivec3 uv = getTerrainChunkUV(offset);
        return getTerrainHeightFactorFromTexture(uv);
    }
`;

// TODO: optimization by static
export const terrainHeightChunkVS =
`
    // #define #terrainHeightFactorChunkVS
    
    float getTerrainHeight(ivec2 offset) {
        return getTerrainHeightFactor(offset) * (${terrainMaxHeightParamName} - ${terrainMinHeightParamName}) + ${terrainMinHeightParamName};
    }

    float getCurrentTerrainHeight() {
        return getTerrainHeight(ivec2(0, 0));
    }
`;

export const instancingVS = ``;
export const transformInstancingVS = ``;
export const transformDeclVS = ``;

export const transformVS = 
`
    // #define #terrainHeightChunkVS

    mat4 getModelMatrix() {
        return matrix_model;
    }

    vec4 getPosition() {
    
        dModelMatrix = getModelMatrix();

        vec2 centeredXZ = TR_SIZE_H_N_F + dCurrentTerrainXZ;
        vec4 localPos   = vec4(centeredXZ.r, dCurrentTerrainHeight, centeredXZ.g, 1.0);
        
        vec4 posW      = dModelMatrix * localPos;
        vec4 screenPos = matrix_viewProjection * posW;

        dPositionW = posW.xyz;

        return screenPos;
    }
    
    vec3 getWorldPosition() {
        return dPositionW;
    }
`;

export const uv0VS = /** @type glsl */
`
`;

// bug with getUv0
export const startUv0VS = /** @type glsl */
` 
    vec2 getUv0() {
        return getCurrentTerrainUvCoord();
    }
`;

export const normalByHeightMapVS  = /** @type glsl */
`
    vec3 getCurrentTerrainNormal() {

        float step = pow(2.0, ${patchLodCoreParamName} + 1.0) / 2.0;

        float left  = getTerrainHeight(ivec2( step,  0));
        float right = getTerrainHeight(ivec2(-step,  0));
        float up    = getTerrainHeight(ivec2( 0,     step));
        float down  = getTerrainHeight(ivec2( 0,    -step));
        vec3 normal = vec3(left - right, 2.0 * step, down - up);
        
        return normalize(normal);
    }
`;

export const normalCoreVS = /** @type glsl */
`
    vec3 getLocalNormal(vec3 vertexNormal) {
        return dCurrentTerrainNormal;
    }

    mat3 getNormalMatrix(mat4 modelMatrix) {
        return matrix_normal;
    }
`;

export const normalVS = /** @type glsl */
`
    // #define #normalByHeightMapVS

    vec3 getNormal() {
        dNormalMatrix = matrix_normal;
        return normalize(dNormalMatrix * dCurrentTerrainNormal);
    }
`;

export const startVS = /** @type glsl */
`
    ${startUv0VS}

    varying vec2 vUvCoord;
    varying vec2 vGridPosition;

    void main(void) {

        dCurrentTerrainXZ     = getCurrentTerrainXZ();
        dCurrentTerrainHeight = getCurrentTerrainHeight();
        dCurrentTerrainNormal = getCurrentTerrainNormal();

        vGridPosition = dCurrentTerrainXZ;
        vUvCoord      = getCurrentTerrainUvCoord();
        gl_Position   = getPosition();
`;

export const maxLayersCount = 16;
export const diffusePS = /** @type glsl */
`
    uniform sampler2D ${terrainSplatMapParamName};
    uniform mediump sampler2DArray uTerrainLayersDiffuse;
    //uniform mediump sampler2DArray uTerrainLayersNormalMap;
    uniform float uTerrainLayersCount;
    uniform float uTerrainLayersFlags[${maxLayersCount}];
    uniform vec2 uTerrainLayersScale[${maxLayersCount}];
    uniform vec2 uTerrainLayersOffset[${maxLayersCount}];

    varying vec2 vUvCoord;
    varying vec2 vGridPosition;

    vec4 mGamma = vec4(2.2);

    void getAlbedo() {

        vec3 albedo = vec3(0.0);
        vec4 splat  = pow(texture2D(${terrainSplatMapParamName}, vUvCoord), vec4(2.2));
        int count   = int(uTerrainLayersCount);

        for (int i = 0; i < ${maxLayersCount}; ++i) {

            if (uTerrainLayersFlags[i] > 0.0) {

                vec2 uv = uTerrainLayersOffset[i] + vUvCoord * uTerrainLayersScale[i];
                vec3 pos = vec3(uv, float(i));
                vec4 tex = pow(texture(uTerrainLayersDiffuse, pos), mGamma);
                
                if (i == 0) {
                    albedo = tex.rgb;
                }
                else {
                    albedo = mix(albedo, tex.rgb, splat[i - 1]);
                }
            }
        }
        
        dAlbedo = albedo;
    }
`;

export const heightMapFactorsChunks = {
    terrainHeightFactorR32FVS,
    terrainHeightFactorRGBA8VS,
    terrainHeightFactorRGB8VS,
    terrainHeightFactorRG16UX2VS,
    terrainHeightFactorRGBA8UX4VS,
}

export const chunks = {

    ...heightMapFactorsChunks,

    currentTerrainXZForInstancingChunkVS,
    currentTerrainXZChunkVS,

    terrainHeightFactorChunkVS,

    terrainHeightChunkVS,
    terrainCoordsChunkVS,
    terrainChunkUVVS,

    normalByHeightMapVS,


    // Vertex
    definesVS,
    baseForInstancingVS,
    baseOriginalVS,
    baseClearVS,

    transformDeclVS,
    
    transformVS,
    instancingVS,
    transformInstancingVS,
    normalCoreVS,
    normalVS,

    uv0VS,
    startVS,

    // Fragment
    diffusePS,
}

export interface ITerrainHeightFactorVSStore {
    terrainHeightFactorR32FVS: string,
    terrainHeightFactorRGBA8VS: string,
    terrainHeightFactorRGB8VS: string,
    terrainHeightFactorRG16UX2VS: string,
    terrainHeightFactorRGBA8UX4VS: string,
}

export function getTerrainHeightFactorVS(format: THeightMapFormat, chunksStore: ITerrainHeightFactorVSStore) {
    switch (format) {
        case 'r32f':   return chunksStore.terrainHeightFactorR32FVS;
        case 'rgba':   return chunksStore.terrainHeightFactorRGBA8VS;
        case 'rgb':    return chunksStore.terrainHeightFactorRGB8VS;
        case 'rgbaX2': return chunksStore.terrainHeightFactorRG16UX2VS;
        case 'rgbaX4': return chunksStore.terrainHeightFactorRGBA8UX4VS;
        default: break;
    }
    throw new Error('Format not supported');
}

export function getTextureType(format: THeightMapFormat) {
    switch (format) {
        case 'r32f':   return pc.PIXELFORMAT_R32F;
        case 'rgba':   return pc.PIXELFORMAT_RGBA8;
        case 'rgbaX2': return pc.PIXELFORMAT_RG16U;
        case 'rgbaX4': return pc.PIXELFORMAT_RGBA8U;
        default: break;
    }
    throw new Error('Format not supported');
}

export function getSamplerType(format: THeightMapFormat) {
    switch (format) {
        case 'r32f':   return 'highp sampler2DArray';
        case 'rgba':   return 'highp sampler2DArray';
        case 'rgbaX2': return 'highp usampler2DArray';
        case 'rgbaX4': return 'highp usampler2DArray';
        default: break;
    }
    throw new Error('Format not supported');
}

export interface ITerrainShaderOptions {
    width: number,
    depth: number,
    heightMapChunkSize: number,
    instancing: boolean,
    heightMapFormat: THeightMapFormat,
    chunksStore?: typeof chunks
}

export function getTerrainShaderChunks({
    width,
    depth,
    heightMapChunkSize,
    instancing,
    heightMapFormat,
    chunksStore = chunks
}: ITerrainShaderOptions): Record<string, string> {

    const definesVS = chunksStore.definesVS
    .replace('%%HM_NUM_CHUNKS_X%%', String((width - 1) / (heightMapChunkSize - 1) | 0))
    .replace('%%HM_CHUNK_SIZE%%', String(heightMapChunkSize | 0))
    .replace('%%TR_SIZE_X%%', String(width))
    .replace('%%TR_SIZE_Z%%', String(depth))
    .replace('%%TR_SIZE_X_F%%', width.toFixed(1))
    .replace('%%TR_SIZE_Z_F%%', depth.toFixed(1));

    const baseClearVS = chunksStore.baseClearVS
    .replace('%%HEIGHT_MAP_SAMPLER%%', getSamplerType(heightMapFormat));

    const terrainHeightFactorVS = getTerrainHeightFactorVS(heightMapFormat, chunksStore);
    const startVS = chunksStore.normalByHeightMapVS + chunksStore.startVS;
    const baseVS = (instancing ? chunksStore.baseForInstancingVS : chunksStore.baseOriginalVS) + baseClearVS;
    const transformVS = definesVS
        + (instancing ? chunksStore.currentTerrainXZForInstancingChunkVS : chunksStore.currentTerrainXZChunkVS)
        + terrainHeightFactorVS
        + chunksStore.terrainCoordsChunkVS
        + chunksStore.terrainChunkUVVS
        + chunksStore.terrainHeightFactorChunkVS
        + chunksStore.terrainHeightChunkVS
        + chunksStore.transformVS;

    return {
        // Vertex
        baseVS,
        transformVS,
        transformDeclVS: chunksStore.transformDeclVS,
        instancingVS: chunksStore.instancingVS,
        //transformInstancingVS: chunks.transformInstancingVS,
        //normalCoreVS: chunks.normalCoreVS,
        normalVS: chunksStore.normalVS,
        uv0VS: chunksStore.uv0VS,
        startVS: startVS,

        // Fragment
        diffusePS: chunksStore.diffusePS,
    };
}