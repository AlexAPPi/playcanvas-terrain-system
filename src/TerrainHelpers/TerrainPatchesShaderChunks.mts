import { THeightMapFormat } from "../TerrainSystem/AbsHeightMap.mjs";
import { littleEndian } from "../Shared/Utils.mjs";

export const vertexCoordAttrName   = "vertex_position";
export const vertexHeightAttrName  = "vertex_height";
export const vertexNormalAttrName  = "vertex_normal";

export const patchInstCoordOffsetParamName = "vertex_postion_offset";
export const patchCoordOffsetParamName     = "uTerrainPatchCoordOffset";
export const patchLodCoreParamName         = "uTerrainPatchLodCore";

export const terrainHeightMapParamName = "uTerrainHeightMap";
export const terrainMaxHeightParamName = "uTerrainMaxHeight";
export const terrainSplatMapParamName  = "uTerrainSplatMap";

export const littleEndianValue = littleEndian ? 'true' : 'false';

export const definesVS = /** @type glsl */
`
    #define HM_NUM_CHUNKS_X     (%%HM_NUM_CHUNKS_X%%)
    #define HM_NUM_CHUNKS_X_U   (uint(HM_NUM_CHUNKS_X))
    #define HM_CHUNK_SIZE       (%%HM_CHUNK_SIZE%%)
    #define HM_CHUNK_SIZE_U     (uint(HM_CHUNK_SIZE))
    #define HM_CHUNK_SIZE_M1_U  (HM_CHUNK_SIZE_U - 1u)
    #define HM_CHUNK_SIZE_F     (float(HM_CHUNK_SIZE))
    #define TR_SIZE             (ivec2(%%TR_SIZE_X%%, %%TR_SIZE_Z%%))
    #define TR_SIZE_F           (vec2(%%TR_SIZE_X_F%%, %%TR_SIZE_Z_F%%))
    #define TR_SIZE_U           (uvec2(TR_SIZE))
    #define TR_SIZE_H_F         (TR_SIZE_F / 2.0)
    #define TR_SIZE_H_N_F       (-TR_SIZE_H_F)
    #define TR_PATCH_SIZE_X     (%%TR_PATCH_SIZE_X%%)
    #define TR_PATCH_SIZE_M1    (TR_PATCH_SIZE_X - 1.0)
    #define TR_PATCH_SIZE_M1_H  (TR_PATCH_SIZE_M1 / 2.0)
    #define TR_PATCH_SIZE_M1_F  (vec2(TR_PATCH_SIZE_M1_H, TR_PATCH_SIZE_M1_H))
`;

export const baseOriginalVS = /** @type glsl */
`
    attribute uvec2 ${vertexCoordAttrName};
`;

export const OLD_baseForInstancingVS = /** @type glsl */
`
    attribute uvec2 ${vertexCoordAttrName};
    attribute uvec2 ${patchInstCoordOffsetParamName};
`;

export const baseForInstancingVS = /** @type glsl */
`
    attribute uvec2 ${vertexCoordAttrName};
    attribute uvec2 ${patchInstCoordOffsetParamName};
`;

export const baseForCombineInstancingVS = /** @type glsl */
`
    attribute uvec2 ${vertexCoordAttrName};
    attribute uvec4 ${patchInstCoordOffsetParamName};
`;

export const heightMapSamplerBugFix = /** @type glsl */
`
    uniform highp %%HEIGHT_MAP_SAMPLER%% ${terrainHeightMapParamName};
    
    #if defined (WEBGPU)
        #define fix_${terrainHeightMapParamName} highp %%HEIGHT_MAP_SAMPLER%%(${terrainHeightMapParamName}_texture, ${terrainHeightMapParamName}_sampler)
    #else
        #define fix_${terrainHeightMapParamName} ${terrainHeightMapParamName}
    #endif
`;

export const baseClearVS = /** @type glsl */
`
    uniform mat4 matrix_viewProjection;
    uniform mat4 matrix_model;
    uniform mat3 matrix_normal;

    uniform mediump vec2 ${patchCoordOffsetParamName};
    uniform mediump float ${patchLodCoreParamName};

    uniform mediump float ${terrainMaxHeightParamName};

    vec2 dCurrentTerrainXZ;
    float dCurrentTerrainHeight;
`;

export const baseClearSubVS = /** @type glsl */
`
    vec3 dPositionW;
    mat4 dModelMatrix;
    mat3 dNormalMatrix;

    vec3 dCurrentTerrainNormal;
`;

export const currentTerrainXZForInstancingChunkVS = /** @type glsl */
`
    vec2 getCurrentTerrainXZ() {
        return vec2(${vertexCoordAttrName} + ${patchInstCoordOffsetParamName});
    }
`;

export const currentTerrainXZForCombineInstancingChunkVS = /** @type glsl */
`
    vec4 rotatePatchXZCoff[4] = vec4[4](
        vec4( 1.0,  0.0,  0.0,  1.0),
        vec4( 0.0,  1.0, -1.0,  0.0),
        vec4(-1.0,  0.0,  0.0, -1.0),
        vec4( 0.0, -1.0,  1.0,  0.0)
    );

    vec2 rotatePatchXZ(vec2 coord, uint angle) {
        vec2 offset = coord - TR_PATCH_SIZE_M1_H;
        vec4 transf = rotatePatchXZCoff[angle];
        return TR_PATCH_SIZE_M1_H + offset.xx * transf.xz + offset.yy * transf.yw;
    }

    vec2 getCurrentTerrainXZ() {
        vec2 orgXZ = vec2(${vertexCoordAttrName});
        uint angle = ${patchInstCoordOffsetParamName}.z;
        vec2 rotXZ = rotatePatchXZ(orgXZ, angle);
        return rotXZ + vec2(${patchInstCoordOffsetParamName}.xy) * TR_PATCH_SIZE_M1;
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
    
    uvec2 clampTerrainXZ(vec2 xz) {
        return uvec2(clamp(xz, vec2(0.0), TR_SIZE_F));
    }
    
    vec2 getTerrainXZ(ivec2 offset) {
        return dCurrentTerrainXZ + vec2(offset);
    }
`;

export const terrainHeightFactorR32FVS = 
`
    float getTerrainHeightFactorFromTexture(uvec3 coord) {
        return texelFetch(fix_${terrainHeightMapParamName}, ivec3(coord), 0).r;
    }
`;

// https://stackoverflow.com/questions/63827836/is-it-possible-to-do-a-rgba-to-float-and-back-round-trip-and-read-the-pixels-in
// note: the 0.1s here an there are voodoo related to precision
/*
    float rgba8uToFloat0(uvec4 v) {
        vec4 bits  = vec4(${littleEndian ? 'v' : 'v.abgr'});
        float sign = mix(-1.0, 1.0, step(bits[3], 128.0));
        float expo = floor(mod(bits[3] + 0.1, 128.0)) * 2.0 + floor((bits[2] + 0.1) / 128.0) - 127.0;
        float sig  = bits[0] + bits[1] * 256.0 + floor(mod(bits[2] + 0.1, 128.0)) * 256.0 * 256.0;
        return sign * (1.0 + sig / 8388607.0) * pow(2.0, expo);
    }
*/

export const terrainHeightFactorRGBA8UVS =
`    
    float rgba8uToFloat(uvec4 v) {
        uvec4 bits = ${littleEndian ? 'v' : 'v.abgr'};
        float sign = 2.0 * step(float(bits[3]), 128.0) - 1.0;
        float expo = float((bits[3] & 127u) * 2u + bits[2] / 128u) - 127.0;
        float sig  = float(bits[0] + bits[1] * 256u + (bits[2] & 127u) * 65536u);
        return sign * (1.0 + sig / 8388607.0) * pow(2.0, expo);
    }

    float getTerrainHeightFactorFromTexture(uvec3 coord) {
        uvec4 rgba = texelFetch(fix_${terrainHeightMapParamName}, ivec3(coord), 0);
        return rgba8uToFloat(rgba);
    }
`;

// Compress height by x coord [patch0, patch1] ...
// see: CompressedPatchedHeightMap file
export const terrainHeightFactorRG16UX2VS =
`
    float getTerrainHeightFactorFromTexture(uvec3 coord) {

        uint level    = coord.b;
        uint newLevel = level / 2u;
        uint shift    = level & 1u;

        uvec4 rgba = texelFetch(fix_${terrainHeightMapParamName}, ivec3(coord.xy, newLevel), 0);

        return float(rgba[shift]) / 65535.0;
    }
`;

// Compress height by x coord [patch0, patch1, patch2, patch3] ...
// see: CompressedPatchedHeightMap file
export const terrainHeightFactorRGBA8UX4VS =
`
    float getTerrainHeightFactorFromTexture(uvec3 coord) {

        uint level    = coord.b;
        uint newLevel = level / 4u;
        uint shift    = level & 3u;

        uvec4 rgba = texelFetch(fix_${terrainHeightMapParamName}, ivec3(coord.xy, newLevel), 0);

        return float(rgba[shift]) / 255.0;
    }
`;

export const terrainChunkBufferCoordVS =
`
    uvec3 getTerrainChunkBufferCoord(uvec2 xz) {

        uvec2 ck = xz / HM_CHUNK_SIZE_U;

        uint localX = xz[0] % HM_CHUNK_SIZE_U;
        uint localZ = xz[1] % HM_CHUNK_SIZE_U;
        uint level  = ck[1] * HM_NUM_CHUNKS_X_U + ck[0];

        return uvec3(localX, localZ, level);
    }

    uvec3 getTerrainChunkBufferRelativeCoord(ivec2 offset) {
        vec2  oc = getTerrainXZ(offset);
        uvec2 xz = clampTerrainXZ(oc);
        return getTerrainChunkBufferCoord(xz);
    }
`;

export const terrainHeightFactorChunkVS = 
`
    float getTerrainHeightFactor(ivec2 offset) {
        uvec3 coord = getTerrainChunkBufferRelativeCoord(offset);
        return getTerrainHeightFactorFromTexture(coord);
    }
`;

export const terrainHeightChunkVS =
`
    float getTerrainHeight(ivec2 offset) {
        return getTerrainHeightFactor(offset) * ${terrainMaxHeightParamName};
    }
    
    float getCurrentTerrainHeight() {
        return getTerrainHeight(ivec2(0, 0));
    }
`;

export const instancingVS = ``;
export const transformInstancingVS = ``;
export const transformDeclVS = ``;

export const transformVS = /** @type glsl */
`
    //varying float vPatchLod;
    varying vec2 vUvCoord;
    varying vec2 vGridPosition;

    mat4 getModelMatrix() {
        return matrix_model;
    }

    vec3 getWorldPosition() {
        return dPositionW;
    }
    
    vec4 getPosition() {
    
        dModelMatrix = getModelMatrix();
        dCurrentTerrainXZ = getCurrentTerrainXZ();
        dCurrentTerrainHeight = getCurrentTerrainHeight();

        vec2 centeredXZ = TR_SIZE_H_N_F + dCurrentTerrainXZ;
        vec4 localPos   = vec4(centeredXZ.r, dCurrentTerrainHeight, centeredXZ.g, 1.0);
        
        vec4 posW      = dModelMatrix * localPos;
        vec4 screenPos = matrix_viewProjection * posW;

        dPositionW = posW.xyz;

        //vPatchLod     = ${patchLodCoreParamName};
        vGridPosition = dCurrentTerrainXZ;
        vUvCoord      = getCurrentTerrainUvCoord();

        return screenPos;
    }
`;

export const uv0VS = /** @type glsl */
`
`;

// FIX: bug with getUv0 for V1 Engine
export const startUv0VS = /** @type glsl */
` 
    vec2 getUv0() {
        return vec2(0.0);
    }
`;

export const normalByHeightMapVS = /** @type glsl */
`
    vec3 getCurrentTerrainNormal() {

        float step  = pow(2.0, ${patchLodCoreParamName} + 1.0) / 2.0;
        float left  = getTerrainHeightFactor(ivec2( step,  0));
        float right = getTerrainHeightFactor(ivec2(-step,  0));
        float up    = getTerrainHeightFactor(ivec2( 0,     step));
        float down  = getTerrainHeightFactor(ivec2( 0,    -step));

        vec3 normal = vec3(left, step * 0.02, down) - vec3(right, 0, up);

        return normalize(normal);
    }
`;

export const normalVS = /** @type glsl */
`
    vec3 getNormal() {
        dNormalMatrix = matrix_normal;
        return normalize(dNormalMatrix * dCurrentTerrainNormal);
    }
`;

export const normalCoreVS = /** @type glsl */
`
    // FIX: vertex_normal undeclaration
    vec3 vertex_normal;
    vec3 dCurrentTerrainNormal;

    vec3 getLocalNormal(vec3 vertexNormal) {

        dCurrentTerrainNormal = getCurrentTerrainNormal();
        vertex_normal = dCurrentTerrainNormal;

        return dCurrentTerrainNormal;
    }

    mat3 getNormalMatrix(mat4 modelMatrix) {
        return matrix_normal;
    }
`;

export const startVS = /** @type glsl */
`
    void main(void) {

        gl_Position = getPosition();

    #if defined(SHADOW_PASS)
    #else
        dCurrentTerrainNormal = getCurrentTerrainNormal();
    #endif
`;

export const gammaNormalizeHeaderPS = /** @type glsl */
`
    #define GAMMA_NORMALIZE
`;

export const gammaNormalizeChunkPS = /** @type glsl */
`
    vec3 autoGammaCorrectInput(vec3 v) {
        #if defined(GAMMA_NORMALIZE)
            return gammaCorrectInput(v);
        #else
            return v;
        #endif
    }

    vec4 autoGammaCorrectInput(vec4 v) {
        #if defined(GAMMA_NORMALIZE)
            return gammaCorrectInput(v);
        #else
            return v;
        #endif
    }
`;

export const maxLayersCount = 5; // Default + R + G + B + A
export const diffusePS = /** @type glsl */
`
    uniform mediump sampler2D ${terrainSplatMapParamName};
    uniform mediump sampler2DArray uTerrainLayersDiffuse;
    //uniform mediump sampler2DArray uTerrainLayersNormalMap;
    uniform float uTerrainLayersCount;
    uniform float uTerrainLayersFlags[${maxLayersCount}];
    uniform vec2 uTerrainLayersScale[${maxLayersCount}];
    uniform vec2 uTerrainLayersOffset[${maxLayersCount}];

    //varying float vPatchLod;
    varying vec2 vUvCoord;
    varying vec2 vGridPosition;

    void getAlbedo() {

        vec4 splat     = autoGammaCorrectInput(texture(${terrainSplatMapParamName}, vUvCoord));
        vec2 uvTexZero = uTerrainLayersOffset[0] + vUvCoord * uTerrainLayersScale[0]; // / (vPatchLod + 1.0);
        vec4 texZero   = texture(uTerrainLayersDiffuse, vec3(uvTexZero, 0));
        vec3 albedo    = texZero.rgb;

        for (int i = 1; i < ${maxLayersCount}; ++i) {

            if (uTerrainLayersFlags[i] > 0.0 && splat[i - 1] > 0.0) {

                vec2 uv  = uTerrainLayersOffset[i] + vUvCoord * uTerrainLayersScale[i];
                vec4 tex = texture(uTerrainLayersDiffuse, vec3(uv, i));

                albedo = mix(albedo, tex.rgb, splat[i - 1]);
            }
        }

        dAlbedo = autoGammaCorrectInput(albedo);
    }
`;

export const heightMapFactorsChunks = {
    terrainHeightFactorR32FVS,
    terrainHeightFactorRGBA8UVS,
    terrainHeightFactorRG16UX2VS,
    terrainHeightFactorRGBA8UX4VS,
}

export const chunks = {

    ...heightMapFactorsChunks,

    heightMapSamplerBugFix,

    currentTerrainXZForCombineInstancingChunkVS,
    currentTerrainXZForInstancingChunkVS,
    currentTerrainXZChunkVS,

    terrainHeightFactorChunkVS,

    terrainHeightChunkVS,
    terrainCoordsChunkVS,
    terrainChunkBufferCoordVS,

    normalByHeightMapVS,

    // Vertex
    definesVS,
    baseForCombineInstancingVS,
    baseForInstancingVS,
    baseOriginalVS,
    baseClearVS,
    baseClearSubVS,

    transformDeclVS,
    
    transformVS,
    instancingVS,
    transformInstancingVS,
    normalVS,
    normalCoreVS,

    uv0VS,
    startVS,
    startUv0VS,

    // Fragment
    gammaNormalizeHeaderPS,
    gammaNormalizeChunkPS,
    diffusePS,
}

export interface ITerrainHeightFactorVSStore {
    terrainHeightFactorR32FVS: string,
    terrainHeightFactorRGBA8UVS: string,
    terrainHeightFactorRG16UX2VS: string,
    terrainHeightFactorRGBA8UX4VS: string,
}

export function getTerrainHeightFactorVS(format: THeightMapFormat, chunksStore: ITerrainHeightFactorVSStore) {
    switch (format) {
        case 'r32f':   return chunksStore.terrainHeightFactorR32FVS;
        case 'rgba':   return chunksStore.terrainHeightFactorRGBA8UVS;
        case 'rgbaX2': return chunksStore.terrainHeightFactorRG16UX2VS;
        case 'rgbaX4': return chunksStore.terrainHeightFactorRGBA8UX4VS;
        default: break;
    }
    throw new Error('Format not supported');
}

export function getTextureType(format: THeightMapFormat) {
    switch (format) {
        case 'r32f':   return pc.PIXELFORMAT_R32F;
        case 'rgba':   return pc.PIXELFORMAT_RGBA8U;
        case 'rgbaX2': return pc.PIXELFORMAT_RG16U;
        case 'rgbaX4': return pc.PIXELFORMAT_RGBA8U;
        default: break;
    }
    throw new Error('Format not supported');
}

export function getSamplerType(format: THeightMapFormat) {
    switch (format) {
        case 'r32f':   return 'sampler2DArray';
        case 'rgba':   return 'usampler2DArray';
        case 'rgbaX2': return 'usampler2DArray';
        case 'rgbaX4': return 'usampler2DArray';
        default: break;
    }
    throw new Error('Format not supported');
}

export interface ITerrainShaderOptions {
    width: number,
    depth: number,
    patchSize: number,
    heightMapChunkSize: number,
    instancing: 'simple' | 'combine' | false,
    heightMapFormat: THeightMapFormat,
    chunksStore?: typeof chunks,
    engineVersion: 'v1' | 'v2'
}

export function getTerrainShaderChunks({
    width,
    depth,
    patchSize,
    heightMapChunkSize,
    instancing,
    heightMapFormat,
    chunksStore = chunks,
    engineVersion = 'v1',
}: ITerrainShaderOptions): Record<string, string> {

    const definesVS = chunksStore.definesVS
        .replace('%%HM_NUM_CHUNKS_X%%', String((width - 1) / (heightMapChunkSize - 1) | 0))
        .replace('%%HM_CHUNK_SIZE%%', String(heightMapChunkSize | 0))
        .replace('%%TR_SIZE_X%%', String(width))
        .replace('%%TR_SIZE_Z%%', String(depth))
        .replace('%%TR_SIZE_X_F%%', width.toFixed(1))
        .replace('%%TR_SIZE_Z_F%%', depth.toFixed(1))
        .replace('%%TR_PATCH_SIZE_X%%', patchSize.toFixed(1));

    const terrainHeightFactorVS = getTerrainHeightFactorVS(heightMapFormat, chunksStore);

    const baseClearVS = chunksStore.baseClearVS + chunksStore.heightMapSamplerBugFix.replaceAll('%%HEIGHT_MAP_SAMPLER%%', getSamplerType(heightMapFormat));

    const baseCoordVS = instancing === 'combine' ? chunksStore.baseForCombineInstancingVS :
                        instancing === 'simple'  ? chunksStore.baseForInstancingVS :
                                                   chunksStore.baseOriginalVS;

    const currentTerrainXZVS = instancing === 'combine' ? chunksStore.currentTerrainXZForCombineInstancingChunkVS :
                               instancing === 'simple'  ? chunksStore.currentTerrainXZForInstancingChunkVS :
                                                          chunksStore.currentTerrainXZChunkVS;
    
    if (engineVersion === 'v2') {

        const normalCoreVS = chunksStore.normalByHeightMapVS + chunksStore.normalCoreVS;
        const transformVS = definesVS
            + baseCoordVS
            + baseClearVS
            + currentTerrainXZVS
            + terrainHeightFactorVS
            + chunksStore.terrainCoordsChunkVS
            + chunksStore.terrainChunkBufferCoordVS
            + chunksStore.terrainHeightFactorChunkVS
            + chunksStore.terrainHeightChunkVS
            + chunksStore.transformVS;

        const diffusePS = chunksStore.gammaNormalizeChunkPS
                        + chunksStore.diffusePS;

        return {
            
            // Vertex
            normalCoreVS,
            transformVS,
            transformCoreVS: "",
            transformInstancingVS: "",

            // Fragment
            diffusePS,
        };
    }

    const startVS = chunksStore.normalByHeightMapVS + chunksStore.startUv0VS + chunksStore.startVS;
    const baseVS = baseCoordVS + baseClearVS + chunksStore.baseClearSubVS;
    const transformVS = definesVS
        + currentTerrainXZVS
        + terrainHeightFactorVS
        + chunksStore.terrainCoordsChunkVS
        + chunksStore.terrainChunkBufferCoordVS
        + chunksStore.terrainHeightFactorChunkVS
        + chunksStore.terrainHeightChunkVS
        + chunksStore.transformVS;

    const diffusePS = chunksStore.gammaNormalizeHeaderPS
                    + chunksStore.gammaNormalizeChunkPS
                    + chunksStore.diffusePS;

    return {

        // Vertex
        baseVS,
        transformVS,
        normalVS: chunksStore.normalVS,
        uv0VS: chunksStore.uv0VS,
        startVS,

        transformDeclVS: chunksStore.transformDeclVS,
        instancingVS: chunksStore.instancingVS,

        // Fragment
        diffusePS,
    }
}