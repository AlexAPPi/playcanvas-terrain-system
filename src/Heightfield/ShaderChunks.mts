import { THeightMapFormat } from "../Core/AbsHeightMap.mjs";
import { littleEndian } from "../Extras/Utils.mjs";

export const vertexCoordAttrName   = "vertex_position";
export const vertexHeightAttrName  = "vertex_height";
export const vertexNormalAttrName  = "vertex_normal";

export const patchInstCoordOffsetAttrName = "vertex_postion_offset";

export const patchCoordOffsetParamName     = "uPatchCoordOffset";
export const patchLodCoreParamName         = "uPatchLodCore";

export const heightMapParamName = "uHeightMap";
export const maxHeightParamName = "uMaxHeight";
export const splatMapParamName  = "uSplatMap";

export const cameraPositionParamName = "uCameraPos";

export const littleEndianValue = littleEndian ? 'true' : 'false';

export const definesVS = /** @type glsl */
`
    #define HM_NUM_CHUNKS_X        (%%HM_NUM_CHUNKS_X%%)
    #define HM_NUM_CHUNKS_X_U      (uint(HM_NUM_CHUNKS_X))
    #define HM_CHUNK_SIZE          (%%HM_CHUNK_SIZE%%)
    #define HM_CHUNK_SIZE_U        (uint(HM_CHUNK_SIZE))
    #define HM_CHUNK_SIZE_M1_U     (HM_CHUNK_SIZE_U - 1u)
    #define HM_CHUNK_SIZE_F        (float(HM_CHUNK_SIZE))
    #define FIELD_SIZE             (ivec2(%%FIELD_SIZE_X%%, %%FIELD_SIZE_Z%%))
    #define FIELD_SIZE_F           (vec2(%%FIELD_SIZE_X_F%%, %%FIELD_SIZE_Z_F%%))
    #define FIELD_SIZE_U           (uvec2(FIELD_SIZE))
    #define FIELD_SIZE_H_F         (FIELD_SIZE_F / 2.0)
    #define FIELD_SIZE_H_N_F       (-FIELD_SIZE_H_F)
    #define FIELD_PATCH_SIZE_X     (%%FIELD_PATCH_SIZE_X%%)
    #define FIELD_PATCH_SIZE_M1    (FIELD_PATCH_SIZE_X - 1.0)
    #define FIELD_PATCH_SIZE_M1_H  (FIELD_PATCH_SIZE_M1 / 2.0)
    #define FIELD_PATCH_SIZE_M1_F  (vec2(FIELD_PATCH_SIZE_M1_H, FIELD_PATCH_SIZE_M1_H))
`;

export const baseOriginalVS = /** @type glsl */
`
    uniform vec2 ${patchCoordOffsetParamName};

    attribute uvec2 ${vertexCoordAttrName};
`;

export const baseForInstancingVS = /** @type glsl */
`
    attribute uvec2 ${vertexCoordAttrName};
    attribute uvec2 ${patchInstCoordOffsetAttrName};
`;

export const baseForCombineInstancingVS = /** @type glsl */
`
    attribute uvec2 ${vertexCoordAttrName};
    attribute uvec4 ${patchInstCoordOffsetAttrName};
`;

export const heightMapSampler = /** @type glsl */
`
    uniform highp %%HEIGHT_MAP_SAMPLER%% ${heightMapParamName};
`;

export const baseClearVS = /** @type glsl */
`
    uniform mat4 matrix_viewProjection;
    uniform mat4 matrix_model;
    uniform mat3 matrix_normal;

    uniform vec3 ${cameraPositionParamName};
    
    uniform float ${maxHeightParamName};
    uniform float ${patchLodCoreParamName};

    vec2 dCurrentFieldXZ;
    float dCurrentFieldHeight;
`;

export const baseClearSubVS = /** @type glsl */
`
    vec3 dPositionW;
    mat4 dModelMatrix;
    mat3 dNormalMatrix;

    vec3 dCurrentFieldNormal;
`;

export const currentFieldXZChunkVS = 
`
    vec2 getCurrentFieldXZ() {
        return vec2(${vertexCoordAttrName}) + ${patchCoordOffsetParamName};
    }
`;

export const currentFieldXZForInstancingChunkVS = /** @type glsl */
`
    vec2 getCurrentFieldXZ() {
        return vec2(${vertexCoordAttrName} + ${patchInstCoordOffsetAttrName});
    }
`;

export const currentFieldXZForCombineInstancingChunkVS = /** @type glsl */
`
    const vec4 rotatePatchXZCoff[4] = vec4[4](
        vec4( 1.0,  0.0,  0.0,  1.0),
        vec4( 0.0,  1.0, -1.0,  0.0),
        vec4(-1.0,  0.0,  0.0, -1.0),
        vec4( 0.0, -1.0,  1.0,  0.0)
    );

    vec2 rotatePatchXZ(vec2 coord, uint angle) {
        vec2 offset = coord - FIELD_PATCH_SIZE_M1_H;
        vec4 transf = rotatePatchXZCoff[angle];
        return FIELD_PATCH_SIZE_M1_H + offset.xx * transf.xz + offset.yy * transf.yw;
    }

    vec2 getCurrentFieldXZ() {
        uint angle = ${patchInstCoordOffsetAttrName}.z;
        vec2 orgXZ = vec2(${vertexCoordAttrName});
        vec2 rotXZ = rotatePatchXZ(orgXZ, angle);
        return rotXZ + vec2(${patchInstCoordOffsetAttrName}.xy) * FIELD_PATCH_SIZE_M1;
    }
`;

export const fieldCoordsChunkVS =
`
    vec2 getCurrentFieldUvCoord() {
        vec2 xz = dCurrentFieldXZ;
        vec2 uv = (xz + 0.5) / FIELD_SIZE_F;
        return uv;
    }
    
    uvec2 clampFieldXZ(vec2 xz) {
        return uvec2(clamp(xz, vec2(0.0), FIELD_SIZE_F));
    }
    
    vec2 getFieldXZ(ivec2 offset) {
        return dCurrentFieldXZ + vec2(offset);
    }
`;

export const fieldHeightFactorR32FVS = 
`
    float getFieldHeightFactorFromTexture(uvec3 coord) {
        return texelFetch(${heightMapParamName}, ivec3(coord), 0).r;
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

export const fieldHeightFactorRGBA8UVS =
`
    float rgba8uToFloat(uvec4 v) {
        uvec4 bits = ${littleEndian ? 'v' : 'v.abgr'};
        float sign = 2.0 * step(float(bits[3]), 128.0) - 1.0;
        float expo = float((bits[3] & 127u) * 2u + bits[2] / 128u) - 127.0;
        float sig  = float(bits[0] + bits[1] * 256u + (bits[2] & 127u) * 65536u);
        return sign * (1.0 + sig / 8388607.0) * pow(2.0, expo);
    }

    float getFieldHeightFactorFromTexture(uvec3 coord) {
        uvec4 rgba = texelFetch(${heightMapParamName}, ivec3(coord), 0);
        return rgba8uToFloat(rgba);
    }
`;

// Compress height by x coord [patch0, patch1] ...
// see: CompressedPatchedHeightMap file
export const fieldHeightFactorRG16UX2VS =
`
    float getFieldHeightFactorFromTexture(uvec3 coord) {

        uint level    = coord.b;
        uint newLevel = level / 2u;
        uint shift    = level & 1u;

        uvec4 rgba = texelFetch(${heightMapParamName}, ivec3(coord.xy, newLevel), 0);

        return float(rgba[shift]) / 65535.0;
    }
`;

// Compress height by x coord [patch0, patch1, patch2, patch3] ...
// see: CompressedPatchedHeightMap file
export const fieldHeightFactorRGBA8UX4VS =
`
    float getFieldHeightFactorFromTexture(uvec3 coord) {

        uint level    = coord.b;
        uint newLevel = level / 4u;
        uint shift    = level & 3u;

        uvec4 rgba = texelFetch(${heightMapParamName}, ivec3(coord.xy, newLevel), 0);

        return float(rgba[shift]) / 255.0;
    }
`;

export const fieldChunkBufferCoordVS =
`
    uvec3 getFieldChunkBufferCoord(uvec2 xz) {

        uvec2 ck = xz / HM_CHUNK_SIZE_U;

        uint localX = xz[0] % HM_CHUNK_SIZE_U;
        uint localZ = xz[1] % HM_CHUNK_SIZE_U;
        uint level  = ck[1] * HM_NUM_CHUNKS_X_U + ck[0];

        return uvec3(localX, localZ, level);
    }

    uvec3 getFieldChunkBufferRelativeCoord(ivec2 offset) {
        vec2  oc = getFieldXZ(offset);
        uvec2 xz = clampFieldXZ(oc);
        return getFieldChunkBufferCoord(xz);
    }
`;

export const fieldHeightFactorChunkVS = 
`
    float getFieldHeightFactor(ivec2 offset) {
        uvec3 coord = getFieldChunkBufferRelativeCoord(offset);
        return getFieldHeightFactorFromTexture(coord);
    }
`;

export const fieldHeightChunkVS =
`
    float getFieldHeight(ivec2 offset) {
        return getFieldHeightFactor(offset) * ${maxHeightParamName};
    }
    
    float getCurrentFieldHeight() {
        return getFieldHeight(ivec2(0, 0));
    }
`;

export const instancingVS = ``;
export const transformInstancingVS = ``;
export const transformDeclVS = ``;

export const transformVS = /** @type glsl */
`
#if defined(SHADOW_PASS)
#else
    varying float vPatchLod;
    varying vec2 vUvCoord;
    varying vec2 vFieldPosition;

    varying float vCloseMask;
    varying float vMiddleMask;
#endif

    mat4 getModelMatrix() {
        return matrix_model;
    }

    vec3 getWorldPosition() {
        return dPositionW;
    }
    
    vec4 getPosition() {

        dModelMatrix = getModelMatrix();
        dCurrentFieldXZ = getCurrentFieldXZ();
        dCurrentFieldHeight = getCurrentFieldHeight();

        vec2 centeredXZ = FIELD_SIZE_H_N_F + dCurrentFieldXZ;
        vec4 localPos   = vec4(centeredXZ.r, dCurrentFieldHeight, centeredXZ.g, 1.0);
        
        vec4 posW      = dModelMatrix * localPos;
        vec4 screenPos = matrix_viewProjection * posW;

        dPositionW = posW.xyz;

#if defined(SHADOW_PASS)
#else
        float dis = length(${cameraPositionParamName} - dPositionW);

        vMiddleMask = smoothstep(600.0 + 100.0, 600.0, dis);
        vCloseMask  = smoothstep(200.0 + 50.0, 200.0, dis);

        vFieldPosition = dCurrentFieldXZ;
        vUvCoord       = getCurrentFieldUvCoord();
        vPatchLod      = ${patchLodCoreParamName};
#endif

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
    vec3 getCurrentFieldNormal() {

        float step  = pow(2.0, ${patchLodCoreParamName} + 1.0) / 2.0;
        float left  = getFieldHeightFactor(ivec2( step,  0));
        float right = getFieldHeightFactor(ivec2(-step,  0));
        float up    = getFieldHeightFactor(ivec2( 0,     step));
        float down  = getFieldHeightFactor(ivec2( 0,    -step));

        vec3 normal = vec3(left, step * 0.02, down) - vec3(right, 0, up);

        return normalize(normal);
    }
`;

export const normalVS = /** @type glsl */
`
    vec3 getNormal() {
        dNormalMatrix = matrix_normal;
        return normalize(dNormalMatrix * dCurrentFieldNormal);
    }
`;

export const normalCoreVS = /** @type glsl */
`
    // FIX: vertex_normal undeclaration
    vec3 vertex_normal;
    vec3 dCurrentFieldNormal;

    vec3 getLocalNormal(vec3 vertexNormal) {

        dCurrentFieldNormal = getCurrentFieldNormal();
        vertex_normal = dCurrentFieldNormal;

        return dCurrentFieldNormal;
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
        dCurrentFieldNormal = getCurrentFieldNormal();
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
export const layersDiffuseParamName = "uLayersDiffuse";
export const layersNormalsParamName = "uLayersNormals";
export const layersFlagsParamName   = "uLayersFlags";
export const layersScaleParamName   = "uLayersScale";
export const layersOffsetParamName  = "uLayersOffset";
export const diffusePS = /** @type glsl */
`
    uniform mediump sampler2D ${splatMapParamName};
    uniform mediump sampler2DArray ${layersDiffuseParamName};
    //uniform mediump sampler2DArray ${layersNormalsParamName};
    uniform float ${layersFlagsParamName}[${maxLayersCount}];
    uniform vec2 ${layersScaleParamName}[${maxLayersCount}];
    uniform vec2 ${layersOffsetParamName}[${maxLayersCount}];

    varying float vPatchLod;
    varying vec2 vUvCoord;
    varying vec2 vFieldPosition;

    varying float vCloseMask;
    varying float vMiddleMask;

    const float closeUvScale  = 1.0;
    const float middleUvScale = 0.6;
    const float farUvScale    = 0.3;

    vec3 distanceDiffuseTexture(vec2 uv, int level) {
        vec3 finalUv = vec3(${layersOffsetParamName}[level] + uv * ${layersScaleParamName}[level], level);
        //vec3 finalTx = texture(${layersDiffuseParamName}, finalUv * vec3(farUvScale, farUvScale, 1.0)).rgb;
        //finalTx = mix(finalTx, texture(${layersDiffuseParamName}, finalUv * vec3(middleUvScale, middleUvScale, 1.0)).rgb, vMiddleMask);
        //finalTx = mix(finalTx, texture(${layersDiffuseParamName}, finalUv * vec3(closeUvScale, closeUvScale, 1.0)).rgb, vCloseMask);
        return texture(${layersDiffuseParamName}, finalUv).rgb;
    }

    void getAlbedo() {

        vec4 splatMap = texture2D(${splatMapParamName}, vUvCoord);
        vec3 albedo   = distanceDiffuseTexture(vUvCoord, 0);

        for (int i = 1; i < ${maxLayersCount}; ++i) {

            float splatFactor = splatMap[i - 1];

#if defined(WEBGPU)
            if (${layersFlagsParamName}[i] > 0.0) {
#else
            if (${layersFlagsParamName}[i] > 0.0 && splatFactor > 0.0) {
#endif
                albedo = mix(albedo, distanceDiffuseTexture(vUvCoord, i), splatFactor);
            }
        }
        
        dAlbedo = autoGammaCorrectInput(albedo);
    }
`;

export const heightMapFactorsChunks = {
    fieldHeightFactorR32FVS,
    fieldHeightFactorRGBA8UVS,
    fieldHeightFactorRG16UX2VS,
    fieldHeightFactorRGBA8UX4VS,
}

export const chunks = {

    ...heightMapFactorsChunks,

    heightMapSampler,

    currentFieldXZForCombineInstancingChunkVS,
    currentFieldXZForInstancingChunkVS,
    currentFieldXZChunkVS,

    fieldHeightFactorChunkVS,

    fieldHeightChunkVS,
    fieldCoordsChunkVS,
    fieldChunkBufferCoordVS,

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

export interface IFieldHeightFactorVSStore {
    fieldHeightFactorR32FVS: string,
    fieldHeightFactorRGBA8UVS: string,
    fieldHeightFactorRG16UX2VS: string,
    fieldHeightFactorRGBA8UX4VS: string,
}

export function getFieldHeightFactorVS(format: THeightMapFormat, chunksStore: IFieldHeightFactorVSStore) {
    switch (format) {
        case 'r32f':   return chunksStore.fieldHeightFactorR32FVS;
        case 'rgba':   return chunksStore.fieldHeightFactorRGBA8UVS;
        case 'rgbaX2': return chunksStore.fieldHeightFactorRG16UX2VS;
        case 'rgbaX4': return chunksStore.fieldHeightFactorRGBA8UX4VS;
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

export type TInstancingType = 'simple' | 'combine' | false;

export interface IFieldShaderOptions {
    width: number,
    depth: number,
    patchSize: number,
    heightMapChunkSize: number,
    instancing: TInstancingType,
    heightMapFormat: THeightMapFormat,
    chunksStore?: typeof chunks,
    engineVersion: 'v1' | 'v2'
}

export function getFieldShaderChunks({
    width,
    depth,
    patchSize,
    heightMapChunkSize,
    instancing,
    heightMapFormat,
    chunksStore = chunks,
    engineVersion = 'v1',
}: IFieldShaderOptions): Record<string, string> {

    const definesVS = chunksStore.definesVS
        .replace('%%HM_NUM_CHUNKS_X%%', String((width - 1) / (heightMapChunkSize - 1) | 0))
        .replace('%%HM_CHUNK_SIZE%%', String(heightMapChunkSize | 0))
        .replace('%%FIELD_SIZE_X%%', String(width))
        .replace('%%FIELD_SIZE_Z%%', String(depth))
        .replace('%%FIELD_SIZE_X_F%%', width.toFixed(1))
        .replace('%%FIELD_SIZE_Z_F%%', depth.toFixed(1))
        .replace('%%FIELD_PATCH_SIZE_X%%', patchSize.toFixed(1));

    const fieldHeightFactorVS = getFieldHeightFactorVS(heightMapFormat, chunksStore);

    const hmVS = chunksStore.heightMapSampler.replaceAll('%%HEIGHT_MAP_SAMPLER%%', getSamplerType(heightMapFormat));
    const baseClearVS = chunksStore.baseClearVS + hmVS;

    const baseCoordVS = instancing === 'combine' ? chunksStore.baseForCombineInstancingVS :
                        instancing === 'simple'  ? chunksStore.baseForInstancingVS :
                                                   chunksStore.baseOriginalVS;

    const currentFieldXZVS = instancing === 'combine' ? chunksStore.currentFieldXZForCombineInstancingChunkVS :
                             instancing === 'simple'  ? chunksStore.currentFieldXZForInstancingChunkVS :
                                                        chunksStore.currentFieldXZChunkVS;
    
    if (engineVersion === 'v2') {

        const normalCoreVS = chunksStore.normalByHeightMapVS + chunksStore.normalCoreVS;
        const transformVS = definesVS
            + baseCoordVS
            + baseClearVS
            + currentFieldXZVS
            + fieldHeightFactorVS
            + chunksStore.fieldCoordsChunkVS
            + chunksStore.fieldChunkBufferCoordVS
            + chunksStore.fieldHeightFactorChunkVS
            + chunksStore.fieldHeightChunkVS
            + chunksStore.transformVS;

        const diffusePS = chunksStore.gammaNormalizeChunkPS
                        + chunksStore.diffusePS;

        return {
            
            // Vertex
            normalCoreVS,
            transformVS,
            transformCoreVS: '',
            transformInstancingVS: '',

            // Fragment
            diffusePS,
        };
    }

    const startVS = chunksStore.normalByHeightMapVS + chunksStore.startUv0VS + chunksStore.startVS;
    const baseVS = baseCoordVS + baseClearVS + chunksStore.baseClearSubVS;
    const transformVS = definesVS
        + currentFieldXZVS
        + fieldHeightFactorVS
        + chunksStore.fieldCoordsChunkVS
        + chunksStore.fieldChunkBufferCoordVS
        + chunksStore.fieldHeightFactorChunkVS
        + chunksStore.fieldHeightChunkVS
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