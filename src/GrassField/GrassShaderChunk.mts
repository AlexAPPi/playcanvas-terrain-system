import { getSamplerType, heightMapSampler, maxHeightParamName } from "../Heightfield/ShaderChunks.mjs";
import { THeightMapFormat } from "../Core/AbsHeightMap.mjs";

export const vindexAttrName = "vertex_position";
export const offsetAttrName = "vertex_offset";
export const shapeAttrName  = "vertex_shape";

export const timeParamName            = "uTime";
export const fieldScaleParamName      = "uFieldScale";
export const lod1OffsetXZParamName    = "uLod1OffsetXZ";
export const lod2OffsetXZParamName    = "uLod2OffsetXZ";
export const drawPosParamName         = "uDrawPosition";
export const windIntensityParamName   = "uWindIntensity";
export const circleSmoothingParamName = "uCircleSmoothing";
export const maxSlopeFactorParamName  = "uMaxSlopeFactor";

export const instancingVS = ``;
export const transformInstancingVS = ``;
export const transformDeclVS = ``;

export const definesVS = /** @type glsl */
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
    #define FIELD_SIZE_H_N_F      (-FIELD_SIZE_H_F)

    #define GRASS_FIELD_RADIUS      (%%GRASS_FIELD_RADIUS%%)
    #define GRASS_FIELD_SIZE_F      (GRASS_FIELD_RADIUS * 2.0)
    #define GRASS_PATCH_SIZE_F      (GRASS_FIELD_RADIUS / 2.5)
    #define GRASS_HALF_PATCH_SIZE_F (GRASS_FIELD_RADIUS / 5.0)
    #define GRASS_FIELD_SIZE        (vec2(GRASS_FIELD_SIZE_F))

    #define MAX_ZINIT_DISTANCE (300.0)
`;

export const definesBladeVS = /** @type glsl */
`
    #define SIDE_COUNT             (%%SIDE_COUNT%%) // # blade side count [1 or 2]

    #define LOD0_BLADE_SEGS        (%%LOD0_BLADE_SEGS%%) // # of blade segments lod 0
    #define LOD1_BLADE_SEGS        (%%LOD1_BLADE_SEGS%%) // # of blade segments lod 1
    #define LOD2_BLADE_SEGS        (%%LOD2_BLADE_SEGS%%) // # of blade segments lod 2

    #define LOD0_BLADE_DIVS        (LOD0_BLADE_SEGS + 1.0)  // # of divisions
    #define LOD0_BLADE_VERTS       (LOD0_BLADE_DIVS * 2.0)  // # of vertices (per side, so 1/2 total)
    #define LOD0_BLADE_VERTS_COUNT (LOD0_BLADE_VERTS * SIDE_COUNT) // # of vertices

    #define LOD1_BLADE_DIVS        (LOD1_BLADE_SEGS > 0.0 ? LOD1_BLADE_SEGS + 1.0 : 0.0) // # of divisions
    #define LOD1_BLADE_VERTS       (LOD1_BLADE_DIVS * 2.0)                               // # of vertices (per side, so 1/2 total)
    #define LOD1_BLADE_VERTS_COUNT (LOD1_BLADE_VERTS * SIDE_COUNT)                       // # of vertices

    #define LOD2_BLADE_DIVS        (LOD2_BLADE_SEGS > 0.0 ? LOD2_BLADE_SEGS + 1.0 : 0.0) // # of divisions
    #define LOD2_BLADE_VERTS       (LOD2_BLADE_DIVS * 2.0)                               // # of vertices (per side, so 1/2 total)
    #define LOD2_BLADE_VERTS_COUNT (LOD2_BLADE_VERTS * SIDE_COUNT)                       // # of vertices
    
    #define LOD2_BLADE_VERTS_ALL_COUNT (LOD2_BLADE_VERTS_COUNT * 16.0) // # of vertices all fragments for LOD2

    #define LOD0_GRASS_PATCH_CENTER_OFFSET   (vec2(GRASS_HALF_PATCH_SIZE_F)) // offset for lod0 patch start
`;

export const normalCoreVS = /** @type glsl */
`
    // FIX: vertex_normal undeclaration
    vec3 vertex_normal;

    vec3 getLocalNormal(vec3 vertexNormal) {

        // Set default shader normal
        vertex_normal = dVertexNormal;

        return dVertexNormal;
    }

    mat3 getNormalMatrix(mat4 modelMatrix) {
        return matrix_normal;
    }
`;

export const transformVS = /** @type glsl */
`
    vec3 getWorldPosition() {
        return dPositionW;
    }

    mat4 getModelMatrix() {
        return matrix_model;
    }

    vec4 getPosition() {

        decodeBlade();
        calculateBladeVertex();

        dModelMatrix = getModelMatrix();

        vec4 posW      = dModelMatrix * vec4(dVertexPosition, 1.0);
        vec4 screenPos = matrix_viewProjection * posW;

        dPositionW = posW.xyz;

        return screenPos;
    }
`;

export const normalVS = /** @type glsl */
`
    vec3 getNormal() {
        dNormalMatrix = matrix_normal;
        return normalize(dNormalMatrix * dVertexNormal);
    }
`;

export const uv0VS = /** @type glsl */
`
    vec2 getUv0() {
        return vec2(dEdgeOfBlade, dDivVertexIndex * 2.0);
    }
`;

// bug with getUv0
export const startUv0VS = /** @type glsl */
`    
    vec2 getUv0() {
        return vec2(dEdgeOfBlade, dDivVertexIndex * 2.0);
    }
`;

export const baseVS = /** @type glsl */
`
    uniform mat4 matrix_viewProjection;
    uniform mat4 matrix_model;
    uniform mat3 matrix_normal;

    uniform highp usampler2D uDataMap;
    uniform highp sampler2D uComputeHMData;
    uniform highp sampler2D uComputeNMData;

    uniform vec3  ${fieldScaleParamName};
    uniform float ${maxHeightParamName};

    uniform vec3  ${drawPosParamName};       // centre of where we want to draw
    uniform float ${timeParamName};          // used to animate blades
    uniform float ${windIntensityParamName};
    uniform float ${circleSmoothingParamName};
    uniform float ${maxSlopeFactorParamName};

    uniform vec2 ${lod1OffsetXZParamName}[8];  // center offset from draw pos lod 1
    uniform vec2 ${lod2OffsetXZParamName}[16]; // center offset from draw pos lod 2

    attribute float ${vindexAttrName};
    attribute vec4 ${offsetAttrName};
    attribute vec4 ${shapeAttrName};

    float dVertexIndex;           // vertex index for this side of the blade
    float dDivVertexIndex;        // div index (0 .. BLADE_DIVS)
    float dPercentOfBladeHeight;  // percent of height of blade this vertex is at
    float dSideOfBlade;           // front/back side of blade
    float dEdgeOfBlade;           // left/right edge (x=0 or x=1)
    vec2 dBladeFieldXZPos;        // blade xz position on field
    vec3 dVertexPosition;         // vertex position - start with 2D shape, no bend applied
    vec3 dVertexNormal;           // vertex normal
    vec2 dGrassPatchOffsetXZ;     // grass patch center
    vec3 dFieldSurfaceNormal;     // field surface normal
    float dFieldSurfaceAltitude;  // field surface altitude
`;

export const baseClearSubVS = /** @type glsl */
`
    vec3 dPositionW;
    mat4 dModelMatrix;
    mat3 dNormalMatrix;
`;

export const bladeDecoderVS = /** @type glsl */
`
    void decodeBlade() {

#if defined(USE_LOD2)

        float nnVi = ${vindexAttrName} - LOD2_BLADE_VERTS_ALL_COUNT;

        if (nnVi < 0.0) {

            float lod2nVi  = mod(${vindexAttrName}, LOD2_BLADE_VERTS_COUNT);
            int patchIndex = int(${vindexAttrName} / LOD2_BLADE_VERTS_COUNT);

            dVertexIndex          = mod(lod2nVi, LOD2_BLADE_VERTS);
            dDivVertexIndex       = floor(dVertexIndex / 2.0);
            dPercentOfBladeHeight = dDivVertexIndex / LOD2_BLADE_SEGS;
            dSideOfBlade          = floor(lod2nVi / LOD2_BLADE_VERTS);

            dGrassPatchOffsetXZ = ${lod2OffsetXZParamName}[patchIndex];
        }
        else {
#else

        float nnVi = ${vindexAttrName};

#endif

#if defined(USE_LOD1)

            if (nnVi < LOD0_BLADE_VERTS_COUNT) {

#endif
                dVertexIndex          = mod(nnVi, LOD0_BLADE_VERTS);
                dDivVertexIndex       = floor(dVertexIndex / 2.0);
                dPercentOfBladeHeight = dDivVertexIndex / LOD0_BLADE_SEGS;
                dSideOfBlade          = floor(nnVi / LOD0_BLADE_VERTS);

                dGrassPatchOffsetXZ = LOD0_GRASS_PATCH_CENTER_OFFSET;

#if defined(USE_LOD1)

            }
            else {
            
                float lod1nnVi = nnVi - LOD0_BLADE_VERTS_COUNT;
                float lod1nVi  = mod(lod1nnVi, LOD1_BLADE_VERTS_COUNT);
                int patchIndex = int(lod1nnVi / LOD1_BLADE_VERTS_COUNT);

                dVertexIndex          = mod(lod1nVi, LOD1_BLADE_VERTS);
                dDivVertexIndex       = floor(dVertexIndex / 2.0);
                dPercentOfBladeHeight = dDivVertexIndex / LOD1_BLADE_SEGS;
                dSideOfBlade          = floor(lod1nVi / LOD1_BLADE_VERTS);

                dGrassPatchOffsetXZ = ${lod1OffsetXZParamName}[patchIndex];
            }
#endif

#if defined(USE_LOD2)

        }

#endif

        dEdgeOfBlade = mod(dVertexIndex, 2.0);
    }
`;

export const calculateLocalVS =  /** @type glsl */
`
    // Rotate by an angle
    vec2 rotate(float x, float y, float r) {
        float c = cos(r);
        float s = sin(r);
        return vec2(x * c - y * s, x * s + y * c);
    }

    // Rotate by a vector
    vec2 rotate(float x, float y, vec2 r) {
        return vec2(x * r.x - y * r.y, x * r.y + y * r.x);
    }
    
    mat3 getSurfaceRotationMatrix(vec3 surfaceNormal) {

        vec3 initialNormal = vec3(0.0, 1.0, 0.0);
        vec3 targetNormal = normalize(surfaceNormal);

        float dotProd = dot(initialNormal, targetNormal);
        
        // we do not consider negative parallel normal (if dotProd < -0.9999)
        if (dotProd > 0.9999) {
            return mat3(1.0);
        }

        vec3 axis = normalize(cross(initialNormal, targetNormal));
        float angle = acos(dotProd);
        
        float s = sin(angle);
        float c = cos(angle);
        float t = 1.0 - c;

        return mat3(
            t * axis.x * axis.x + c,
            t * axis.x * axis.y - s * axis.z,
            t * axis.x * axis.z + s * axis.y,
            
            t * axis.x * axis.y + s * axis.z,
            t * axis.y * axis.y + c,
            t * axis.y * axis.z - s * axis.x,
            
            t * axis.x * axis.z - s * axis.y,
            t * axis.y * axis.z + s * axis.x,
            t * axis.z * axis.z + c
        );
    }

    float getGrassFactor(vec2 xz, vec3 surfaceNormal) {
        return (all(greaterThanEqual(xz, vec2(0.0))) &&
                all(lessThanEqual(xz, FIELD_SIZE_BOUND_F)) &&
                surfaceNormal.y >= ${maxSlopeFactorParamName})
                ? surfaceNormal.y : 0.0;
    }
    
    float unpackFactorFromRGBA(vec4 rgba) {
        // TODO: optimization
        const vec4 bitShifts = vec4(1.0, 1.0 / (255.0), 1.0 / (255.0 * 255.0), 1.0 / (255.0 * 255.0 * 255.0)); 
        return dot(rgba, bitShifts);
    }

    varying vec2 vUvFieldCoord;
    varying vec2 vUvCoord;
    varying vec3 vColor;

    void calculateBladeVertex() {

        vec4 offset = ${offsetAttrName};
        vec4 shape  = ${shapeAttrName};

        // vec4 offset = vec4(${offsetAttrName}.xyz, 0.0);
        // vec4 shape = vec4(0.05, 1.5, 0.0, 0.0);

        // Based on centre of view cone position, what grid tile should
        // this piece of grass be drawn at?
        vec2 viewerPos   = ${drawPosParamName}.xz;
        vec2 bladeOffset = offset.xy;

        // Find the virtual patch center
        vec2 virtualPatchCenter = floor((viewerPos - bladeOffset) / GRASS_PATCH_SIZE_F) * GRASS_PATCH_SIZE_F + dGrassPatchOffsetXZ;

        // Find the blade mesh x,y position
        vec2 bladePos = virtualPatchCenter + bladeOffset;

        // Local blade position in field
        // because the positions are shifted by half the size of the field
        dBladeFieldXZPos = bladePos / ${fieldScaleParamName}.xz + FIELD_SIZE_H_F;

        // Find the blade pos in compute data
        vec2 grassFieldBladePos = bladePos / ${fieldScaleParamName}.xz - floor(viewerPos / ${fieldScaleParamName}.xz) + GRASS_FIELD_RADIUS;
        vec2 grassFieldBladeClampPos = clamp(grassFieldBladePos, vec2(0.0), GRASS_FIELD_SIZE);

        vec2 grassFieldBladeUV = grassFieldBladeClampPos / GRASS_FIELD_SIZE_F;
        vec4 bladeComputeHMData = texture2D(uComputeHMData, grassFieldBladeUV);
        vec4 bladeComputeNMData = texture2D(uComputeNMData, grassFieldBladeUV);

        dFieldSurfaceAltitude = unpackFactorFromRGBA(bladeComputeHMData.rgba) * ${maxHeightParamName};
        dFieldSurfaceNormal = bladeComputeNMData.rgb;

        dFieldSurfaceAltitude *= ${fieldScaleParamName}.y;

        // Sample the heightfield data texture to get altitude for this blade position
        float grassFactor = getGrassFactor(dBladeFieldXZPos, dFieldSurfaceNormal);

        float distanceFromBladeToQuadCenter = distance(bladePos, viewerPos);
        float degenerateByDistanceFromBladeToQuadCenter = smoothstep(0.92, 1.0, GRASS_PATCH_SIZE_F * ${circleSmoothingParamName} / distanceFromBladeToQuadCenter);

        // Vertex position - start with 2D shape, no bend applied
        dVertexPosition = vec3(
            shape.x * (dEdgeOfBlade - 0.5) * (1.0 - pow(dPercentOfBladeHeight, 3.0)), // taper blade edges as approach tip
            0.0, // flat y, unbent
            shape.y * dPercentOfBladeHeight // height of vtx, unbent
        );

        // Start computing a normal for this vertex
        dVertexNormal = vec3(0.0, dSideOfBlade * -2.0 + 1.0, 0.0);

        // Apply blade's natural curve amount
        // Then add animated curve amount by time using this blade's
        // unique properties to randomize its oscillation
        float curve = shape.w * 2.0 + 0.125 * sin(${timeParamName} * 4.0 + offset.w * 0.2 * shape.y + offset.x + offset.y);

        // TODO
        float wind = 0.5;

        wind = (clamp(wind, 0.25, 1.0) - 0.25) * (1.0 / 0.75);
        wind = wind * wind * ${windIntensityParamName};
        wind *= dPercentOfBladeHeight; // scale wind by height of blade
        wind = -wind;

        // put lean and curve together
        float rot = shape.z + curve * dPercentOfBladeHeight;
        vec2 rotv = vec2(cos(rot), sin(rot));

        dVertexPosition.yz = rotate(dVertexPosition.y, dVertexPosition.z, rotv);
        dVertexNormal.yz   = rotate(dVertexNormal.y, dVertexNormal.z, rotv);

        // rotation of this blade as a vector
        rotv = vec2(cos(offset.w), sin(offset.w));

        dVertexPosition.xy = rotate(dVertexPosition.x, dVertexPosition.y, rotv);
        dVertexNormal.xy   = rotate(dVertexNormal.x, dVertexNormal.y, rotv);

        // wind blows in axis-aligned direction to make things simpler
        rotv = vec2(cos(wind), sin(wind));
        
        dVertexPosition.yz = rotate(dVertexPosition.y, dVertexPosition.z, rotv);
        dVertexNormal.yz   = rotate(dVertexNormal.y, dVertexNormal.z, rotv);

        // rotation of surface normal
        mat3 surfaceRotationMat = getSurfaceRotationMatrix(dFieldSurfaceNormal);
        dVertexPosition = surfaceRotationMat * dVertexPosition;
        dVertexNormal   = surfaceRotationMat * dVertexNormal;

        float drawPosAltitude = ${drawPosParamName}.y;
        float distanceQuadCenterToDraw = distance(dFieldSurfaceAltitude, drawPosAltitude);
        float degenerateByDistanceFromBladeToDraw = smoothstep(0.81, 1.0, MAX_ZINIT_DISTANCE / distanceQuadCenterToDraw);

        // Transition geometry toward degenerate as we approach field altitude
        float degenerateFactor = grassFactor * degenerateByDistanceFromBladeToDraw * degenerateByDistanceFromBladeToQuadCenter;

        dVertexPosition *= degenerateFactor;
        dVertexNormal *= degenerateFactor;

        // Translate to world coordinates
        dVertexPosition.x += bladePos.x;
        dVertexPosition.y += bladePos.y;
        dVertexPosition.z += dFieldSurfaceAltitude;
        
        // Translate to xz plane
        dVertexPosition = dVertexPosition.xzy;
        dVertexNormal   = normalize(dVertexNormal.xzy);

        // grass texture coordinate for this vertex
        vUvCoord = vec2(dEdgeOfBlade, dDivVertexIndex * 2.0);

        // field texture coordinate for this vertex
        vUvFieldCoord = dBladeFieldXZPos / FIELD_SIZE_F;

        // Vertex color must be brighter because it is multiplied with blade texture
        // Each blade is randomly colourized a bit by its position
        vColor = vec3(cos(${offsetAttrName}.x), sin(${offsetAttrName}.y), sin(${offsetAttrName}.x));
    }
`;

// https://community.khronos.org/t/discarding-polygons-in-vertex-shader/103839/9
export const startVS = /** @type glsl */
`
    ${startUv0VS}

    void main(void) {

        gl_Position = getPosition();
`;

export const diffusePS = /** @type glsl */
`
    uniform sampler2D uDiffuseTex;
    uniform vec3 uDiffuseColor;
    uniform vec3 uDiffuseColorRandom;

    varying vec2 vUvFieldCoord;
    varying vec2 vUvCoord;
    varying vec3 vColor;

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

    void getAlbedo() {

        vec3 tex = autoGammaCorrectInput(texture2D(uDiffuseTex, vUvCoord).rgb);

        dAlbedo = tex * uDiffuseColor + vColor * uDiffuseColorRandom;
    }
`;

export const chunks = {

    heightMapSampler,

    definesVS,
    definesBladeVS,
    bladeDecoderVS,
    calculateLocalVS,

    // Vertex
    baseVS,
    baseClearSubVS,
    transformVS,
    transformDeclVS,
    instancingVS,
    transformInstancingVS,
    normalCoreVS,
    normalVS,
    uv0VS,
    startVS,

    // Fragment
    diffusePS,
}

export interface IGrassShaderOptions {
    width: number,
    depth: number,
    heightMapChunkSize: number,
    heightMapFormat: THeightMapFormat,
    lod0BladeSegs: number,
    lod1BladeSegs: number,
    lod2BladeSegs: number,
    sideCount: number,
    radius: number,
    chunksStore?: typeof chunks,
    engineVersion?: 'v1' | 'v2'
}

export function getGrassShaderChunks({
    width,
    depth,
    heightMapChunkSize,
    heightMapFormat,
    lod0BladeSegs,
    lod1BladeSegs,
    lod2BladeSegs,
    sideCount,
    radius,
    chunksStore = chunks,
    engineVersion = 'v1',
}: IGrassShaderOptions): Record<string, string> {

    const definesVS = chunksStore.definesVS
        .replace('%%HM_NUM_CHUNKS_X%%', String((width - 1) / (heightMapChunkSize - 1) | 0))
        .replace('%%HM_CHUNK_SIZE%%', String(heightMapChunkSize | 0))
        .replace('%%FIELD_SIZE_X%%', String(width))
        .replace('%%FIELD_SIZE_Z%%', String(depth))
        .replace('%%FIELD_SIZE_X_F%%', width.toFixed(1))
        .replace('%%FIELD_SIZE_Z_F%%', depth.toFixed(1))
        .replace('%%GRASS_FIELD_RADIUS%%', radius.toFixed(1));
    
    const definesBladeVS = chunksStore.definesBladeVS
        .replace('%%SIDE_COUNT%%', sideCount.toFixed(1))
        .replace('%%LOD0_BLADE_SEGS%%', lod0BladeSegs.toFixed(1))
        .replace('%%LOD1_BLADE_SEGS%%', lod1BladeSegs.toFixed(1))
        .replace('%%LOD2_BLADE_SEGS%%', lod2BladeSegs.toFixed(1))
        + (lod1BladeSegs > 0 ? '\r\n#define USE_LOD1\r\n' : '')
        + (lod2BladeSegs > 0 ? '\r\n#define USE_LOD2\r\n' : '');

    const heightMapVS = chunksStore.heightMapSampler.replaceAll('%%HEIGHT_MAP_SAMPLER%%', getSamplerType(heightMapFormat));
    const baseClearVS = chunksStore.baseVS + heightMapVS;
    
    const transformVS = chunksStore.bladeDecoderVS
                      + chunksStore.calculateLocalVS
                      + chunksStore.transformVS;

    const diffusePS = '#define GAMMA_NORMALIZE\r\n'
                    + chunksStore.diffusePS;

    if (engineVersion === 'v2') {
        
        const transform2VS = definesVS + definesBladeVS + baseClearVS + transformVS;

        return {
            // Vertex
            transformVS: transform2VS,
            transformCoreVS: "",
            transformInstancingVS: "",
            normalCoreVS: chunksStore.normalCoreVS,

            // Fragment
            diffusePS: diffusePS,
        };
    }
    
    const baseVS = definesVS +
                   definesBladeVS +
                   baseClearVS +
                   chunksStore.baseClearSubVS;

    return {
        // Vertex
        baseVS,
        startVS: chunksStore.startVS,
        transformVS: transformVS,
        transformDeclVS: chunksStore.transformDeclVS,
        instancingVS: chunksStore.instancingVS,
        normalVS: chunksStore.normalVS,
        uv0VS: chunksStore.uv0VS,

        // Fragment
        diffusePS: diffusePS,
    };
}