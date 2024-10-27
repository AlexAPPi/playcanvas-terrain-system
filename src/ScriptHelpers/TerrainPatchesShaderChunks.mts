export const vertexCoordAttrName   = "vertex_position";
export const vertexHeightAttrName  = "vertex_height";
export const vertexNormalAttrName  = "vertex_normal";

export const patchInstCoordOffsetParamName = "vertex_postion_offset";
export const patchCoordOffsetParamName  = "uTerrainPatchCoordOffset";

export const useBaseVertexParamName = "uTerrainUseBaseVertex";
export const baseVertexParamName    = "uTerrainPatchBaseVertex";
export const lodCoreParamName       = "uTerrainPatchLodCore";

export const terrainHeightMapParamName          = "uTerrainHeightMap";
export const terrainHeightMapChunkSizeParamName = "uTerrainHeightMapChunkSize";
export const terrainSizeParamName               = "uTerrainSize";
export const terrainMinHeightParamName          = "uTerrainMinHeight";
export const terrainMaxHeightParamName          = "uTerrainMaxHeight";
export const terrainSplatMapParamName           = "uTerrainSplatMap";
export const terrainPatchSizeParamName          = "uTerrainPatchSize";

export const littleEndian = (() => {
    const uint8Array  = new Uint8Array([0xAA, 0xBB]);
    const uint16array = new Uint16Array(uint8Array.buffer);
    return uint16array[0] === 0xBBAA;
})();

export const littleEndianValue = littleEndian ? 'true' : 'false';

export const baseOriginalVS = /** @type glsl */
`
    attribute uvec2 ${vertexCoordAttrName};
`;

export const baseForInstancingVS = /** @type glsl */
`
    attribute uvec2 ${vertexCoordAttrName};
    attribute uvec2 ${patchInstCoordOffsetParamName};
`;

export const baseClearVS = /** @type glsl */
`
    // #define #baseOriginalVS [OR] #baseForInstancingVS

    uniform mat4 matrix_viewProjection;
    uniform mat4 matrix_model;
    uniform mat3 matrix_normal;

    uniform vec2 ${terrainSizeParamName};
    uniform vec2 ${patchCoordOffsetParamName};
    
    uniform float ${lodCoreParamName};

    uniform mediump sampler2DArray ${terrainHeightMapParamName};
    uniform float ${terrainHeightMapChunkSizeParamName};

    uniform float ${terrainMinHeightParamName};
    uniform float ${terrainMaxHeightParamName};

    float dNumChunksX;
    vec3 dPositionW;
    mat4 dModelMatrix;
    mat3 dNormalMatrix;
    vec2 dCurrentTerrainXZ;
    float dCurrentHeight;
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
        vec2 uv = (xz + 0.5) / ${terrainSizeParamName};
        return uv;
    }

    vec2 clampTerrainXZ(vec2 xz) {
        return vec2(
            clamp(xz[0], 0.0, ${terrainSizeParamName}[0]),
            clamp(xz[1], 0.0, ${terrainSizeParamName}[1])
        );
    }

    vec2 getTerrainXZ(ivec2 offset) {
        return dCurrentTerrainXZ + vec2(offset);
    }
`;

// Not support for webgpu
export const terrainHeightFactorRGB8VS =
`
    float rgb8ToFloat(vec3 v) {
        uvec3 uints = uvec3(v * 255.0);
        uint scaled = (uints.r << 16) | (uints.g << 8) | uints.b;
        return float(scaled) / 16777215.0;
    }

    float getTerrainHeightFactorFromTexture(vec3 uv) {
        vec3 rgb = texture(${terrainHeightMapParamName}, uv);
        return rgb8ToFloat(rgb);
    }
`;

export const terrainHeightFactorR32FVS = 
`
    float getTerrainHeightFactorFromTexture(vec3 uv) {
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
    
    float getTerrainHeightFactorFromTexture(vec3 uv) {
        vec4 rgba = texture(${terrainHeightMapParamName}, uv);
        return rgba8ToFloat(rgba);
    }
`;

// TODO: check littleEndian
// Compress height by x coord [patch0, patch1] ...
// see: CompressedPatchedHeightMap file
export const terrainHeightFactorRGBA8X2VS =
`
    float getTerrainHeightFactorFromTexture(vec3 uv) {
        int level  = int(uv.b);
        int newLevel = level / 2;
        int chunkX = level % int(dNumChunksX);
        int shift  = chunkX % 2;
        vec4 rgba = texture(${terrainHeightMapParamName}, vec3(uv.rg, newLevel));
        vec2 rg = ((shift == 0) ? rgba.rg : rgba.ba) * 255.0;
        return float((uint(rg.g) << 8) | uint(rg.r)) / 65535.0;
    }
`;

export const terrainHeightFactorRGBA8X4VS =
`
    float getTerrainHeightFactorFromTexture(vec3 uv) {
        int level    = int(uv.b);
        int newLevel = level / 4;
        int chunkX   = level % int(dNumChunksX);
        int shift    = chunkX % 4;
        vec4 rgba    = texture(${terrainHeightMapParamName}, vec3(uv.rg, newLevel));
        return rgba[shift];
    }
`;

export const terrainChunkUVVS =
`
    // #define #terrainCoordsChunkVS

    vec3 getTerrainChunkUV(ivec2 offset) {

        vec2 xz = clampTerrainXZ(getTerrainXZ(offset));

        int chunkSize = int(${terrainHeightMapChunkSizeParamName});
        
        int localX    = int(xz.r) % chunkSize;
        int localZ    = int(xz.g) % chunkSize;

        float chunkX  = ceil(xz.r / ${terrainHeightMapChunkSizeParamName}) - (localX > 0 ? 1.0 : 0.0);
        float chunkZ  = ceil(xz.g / ${terrainHeightMapChunkSizeParamName}) - (localZ > 0 ? 1.0 : 0.0);

        float level       = chunkZ * dNumChunksX + chunkX;
        vec2  patchTexPos = vec2(localX, localZ) + 0.5;

        return vec3(patchTexPos / ${terrainHeightMapChunkSizeParamName}, level);
    }
`;

export const terrainHeightFactorChunkVS = 
`
    // #define #terrainHeightFactorRGBA8VS [OR] #terrainHeightFactorRGB8VS
    // #define #terrainChunkUVVS

    float getTerrainHeightFactor(ivec2 offset) {
        vec3 uv = getTerrainChunkUV(offset);
        return getTerrainHeightFactorFromTexture(uv);
    }
`;

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
    
        dModelMatrix      = getModelMatrix();
        dCurrentTerrainXZ = getCurrentTerrainXZ();
        dCurrentHeight    = getCurrentTerrainHeight();

        vec2 globXZ   = -${terrainSizeParamName} / 2.0 + dCurrentTerrainXZ;
        vec3 localPos = vec3(globXZ.r, dCurrentHeight, globXZ.g);

        vec4 posW = dModelMatrix * vec4(localPos, 1.0);

        dPositionW = posW.xyz;

        vec4 screenPos = matrix_viewProjection * posW;
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
    vec3 getTerrainNormal() {

        float step = pow(2.0, ${lodCoreParamName} + 1.0) / 2.0;

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
        vec3 localNormal = vec3(0.0, 1.0, 0.0);
        return localNormal;
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

        vec3 tempNormal = getTerrainNormal();

        return normalize(dNormalMatrix * tempNormal);
    }
`;

export const startVS = /** @type glsl */
`
    ${startUv0VS}

    varying vec2 vUvCoord;
    varying vec2 vGridPosition;

    void main(void) {

        dNumChunksX = (${terrainSizeParamName}.r - 1.0) / (${terrainHeightMapChunkSizeParamName} - 1.0);

        gl_Position   = getPosition();
        vGridPosition = dCurrentTerrainXZ;
        vUvCoord      = getCurrentTerrainUvCoord();
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

    void getAlbedo() {

        vec3 albedo = vec3(0.0);
        vec4 splat  = pow(texture2D(${terrainSplatMapParamName}, vUvCoord), vec4(2.2));
        int count   = int(uTerrainLayersCount);

        for (int i = 0; i < ${maxLayersCount}; ++i) {

            if (uTerrainLayersFlags[i] > 0.0) {

                vec2 uv = uTerrainLayersOffset[i] + vUvCoord * uTerrainLayersScale[i];
                vec3 pos = vec3(uv, float(i));
                vec4 fct = vec4(2.2);
                vec4 tex = pow(texture(uTerrainLayersDiffuse, pos), fct);
                
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

export const chunks = {

    currentTerrainXZForInstancingChunkVS,
    currentTerrainXZChunkVS,

    terrainHeightFactorR32FVS,
    terrainHeightFactorRGBA8VS,
    terrainHeightFactorRGB8VS,
    terrainHeightFactorRGBA8X2VS,
    terrainHeightFactorRGBA8X4VS,

    terrainHeightFactorChunkVS,

    terrainHeightChunkVS,
    terrainCoordsChunkVS,
    terrainChunkUVVS,

    normalByHeightMapVS,


    // Vertex
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

/**
 * @variant rgb - format by uint8[3] texture
 * @variant r23f - format by float32 texture
 * @variant rgba - foramt by uint8[4] texture
 * @variant rgbaX2 - format compressed by 2 patches by x coordinate
 * @see CompressedPatchedHeightMap
 */
export type THeightMapFormat = 'r32f' | 'rgba' | 'rgbaX2' | 'rgbaX4' | 'rgb';
export function getTerrainHeightFactorVS(format: THeightMapFormat, chunksStore: typeof chunks = chunks) {
    switch (format) {
        case 'r32f':   return chunksStore.terrainHeightFactorR32FVS;
        case 'rgba':   return chunksStore.terrainHeightFactorRGBA8VS;
        case 'rgb':    return chunksStore.terrainHeightFactorRGB8VS;
        case 'rgbaX2': return chunksStore.terrainHeightFactorRGBA8X2VS;
        case 'rgbaX4': return chunksStore.terrainHeightFactorRGBA8X4VS;
        default: break;
    }
    throw new Error('Format not supported');
}

export interface ITerrainShaderOptions {
    instancing: boolean,
    heightMapFormat: THeightMapFormat,
    chunksStore?: typeof chunks
}

export function getTerrainShaderChunks({instancing, heightMapFormat, chunksStore = chunks}: ITerrainShaderOptions): Record<string, string> {
    
    const terrainHeightFactorVS = getTerrainHeightFactorVS(heightMapFormat, chunksStore);
    const baseVS = (instancing ? chunksStore.baseForInstancingVS : chunksStore.baseOriginalVS) + chunksStore.baseClearVS;
    const transformVS = (instancing ? chunksStore.currentTerrainXZForInstancingChunkVS : chunksStore.currentTerrainXZChunkVS)
        + terrainHeightFactorVS
        + chunksStore.terrainCoordsChunkVS
        + chunksStore.terrainChunkUVVS
        + chunksStore.terrainHeightFactorChunkVS
        + chunksStore.terrainHeightChunkVS
        + chunksStore.transformVS;
    
    const normalVS = chunksStore.normalByHeightMapVS + chunksStore.normalVS;

    return {
        // Vertex
        baseVS,
        transformVS,
        transformDeclVS: chunksStore.transformDeclVS,
        instancingVS: chunksStore.instancingVS,
        //transformInstancingVS: chunks.transformInstancingVS,
        //normalCoreVS: chunks.normalCoreVS,
        normalVS,
        uv0VS: chunksStore.uv0VS,
        startVS: chunksStore.startVS,

        // Fragment
        diffusePS: chunksStore.diffusePS,
    };
}