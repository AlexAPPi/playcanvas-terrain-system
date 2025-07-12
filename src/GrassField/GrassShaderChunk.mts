import { getSamplerType, getFieldHeightFactorVS, heightMapFactorsChunks, heightMapSampler, maxHeightParamName } from "../Heightfield/ShaderChunks.mjs";
import { THeightMapFormat } from "../Core/AbsHeightMap.mjs";

export const vindexAttrName = "vertex_position";
export const offsetAttrName = "vertex_offset";
export const shapeAttrName  = "vertex_shape";

export const timeParamName          = "uTime";
export const fieldScaleParamName    = "uFieldScale";
export const lod1OffsetXZParamName  = "uLod1OffsetXZ";
export const lod2OffsetXZParamName  = "uLod2OffsetXZ";
export const drawPosParamName       = "uDrawPosition";
export const windIntensityParamName = "uWindIntensity";

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

    #define PATCH_SIZE         (%%PATCH_SIZE%%)
    #define HALF_PATCH_SIZE    (PATCH_SIZE / 2.0)

    #define BLADE_HEIGHT_TALL  (%%BLADE_HEIGHT_TALL%%) // height of a tall blade

    #define TRANSITION_LOW     (%%TRANSITION_LOW%%)   // elevation of beach-grass transition (start)
    #define TRANSITION_HIGH    (%%TRANSITION_HIGH%%)  // (end)
    #define TRANSITION_NOISE   (0.06)                 // transition noise scale
    #define CIRCLE_RADIUS      (PATCH_SIZE * 2.9)
    #define MAX_ZINIT_DISTANCE (300.0)
`;

export const definesBladeVS = /** @type glsl */
`
    #define LOD0_BLADE_SEGS        (%%LOD0_BLADE_SEGS%%) // # of blade segments lod 0
    #define LOD1_BLADE_SEGS        (%%LOD1_BLADE_SEGS%%) // # of blade segments lod 1
    #define LOD2_BLADE_SEGS        (%%LOD2_BLADE_SEGS%%) // # of blade segments lod 2

    #define LOD0_BLADE_DIVS        (LOD0_BLADE_SEGS + 1.0)  // # of divisions
    #define LOD0_BLADE_VERTS       (LOD0_BLADE_DIVS * 2.0)  // # of vertices (per side, so 1/2 total)
    #define LOD0_BLADE_VERTS_COUNT (LOD0_BLADE_VERTS * 2.0) // # of vertices

    #define LOD1_BLADE_DIVS        (LOD1_BLADE_SEGS + 1.0)  // # of divisions
    #define LOD1_BLADE_VERTS       (LOD1_BLADE_DIVS * 2.0)  // # of vertices (per side, so 1/2 total)
    #define LOD1_BLADE_VERTS_COUNT (LOD1_BLADE_VERTS * 2.0) // # of vertices

    #define LOD2_BLADE_DIVS        (LOD2_BLADE_SEGS + 1.0)  // # of divisions
    #define LOD2_BLADE_VERTS       (LOD2_BLADE_DIVS * 2.0)  // # of vertices (per side, so 1/2 total)
    #define LOD2_BLADE_VERTS_COUNT (LOD2_BLADE_VERTS * 2.0) // # of vertices
    
    #define LOD2_BLADE_VERTS_ALL_COUNT (LOD2_BLADE_VERTS_COUNT * 16.0) // # of vertices all fragments
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

    uniform mediump usampler2D uDataMap;

    uniform vec3  ${fieldScaleParamName};
    uniform float ${maxHeightParamName};
    
    uniform vec3  ${drawPosParamName};       // centre of where we want to draw
    uniform float ${timeParamName};          // used to animate blades
    uniform float ${windIntensityParamName};

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
    vec3 dVertexPosition;         // Vertex position - start with 2D shape, no bend applied
    vec3 dVertexNormal;           // Vertex normal
    vec2 dFieldPatchOffsetXZ;     // field patch offset from center
`;

export const baseClearSubVS = /** @type glsl */
`
    vec3 dPositionW;
    mat4 dModelMatrix;
    mat3 dNormalMatrix;
`;

export const fieldHeightMapVS = 
`
    uvec2 clampFieldXZ(vec2 xz) {
        return uvec2(clamp(xz, vec2(0.0), FIELD_SIZE_F));
    }

    uvec3 getFieldChunkBufferCoord(vec2 origXZ) {

        uvec2 xz = clampFieldXZ(origXZ);
        uvec2 ck = xz / HM_CHUNK_SIZE_U;

        uint localX = xz[0] % HM_CHUNK_SIZE_U;
        uint localZ = xz[1] % HM_CHUNK_SIZE_U;
        uint level  = ck[1] * HM_NUM_CHUNKS_X_U + ck[0];

        return uvec3(localX, localZ, level);
    }
    
    float getFieldHeightFactor(vec2 xz) {
        uvec3 coord = getFieldChunkBufferCoord(xz);
        return getFieldHeightFactorFromTexture(coord);
    }

    float getFieldHeight(vec2 xz) {
        return getFieldHeightFactor(xz) * ${maxHeightParamName};
    }
    
    float getFieldHeightInterpolated(vec2 xz) {

        // here we can calculate normal

        vec2 floorXZ = floor(xz);

        float x0z0 = getFieldHeight(floorXZ);

        if ((floorXZ[0] + 1.0 >= FIELD_SIZE_F[0]) ||
            (floorXZ[1] + 1.0 >= FIELD_SIZE_F[1])) {
            return x0z0;
        }

        float x1z0 = getFieldHeight(floorXZ + vec2(1.0, 0.0));
        float x0z1 = getFieldHeight(floorXZ + vec2(0.0, 1.0));
        float x1z1 = getFieldHeight(floorXZ + vec2(1.0, 1.0));

        float factorX = xz[0] - floorXZ[0];
        float factorZ = xz[1] - floorXZ[1];

        float interpolatedBottom = (x1z0 - x0z0) * factorX + x0z0;
        float interpolatedTop    = (x1z1 - x0z1) * factorX + x0z1;
        float finalHeight        = (interpolatedTop - interpolatedBottom) * factorZ + interpolatedBottom;

        return finalHeight;
    }
`;

export const bladeDecoderVS = /** @type glsl */
`
    void decodeBlade() {

        float nnVi = ${vindexAttrName} - LOD2_BLADE_VERTS_ALL_COUNT;

        if (nnVi < 0.0) {

            float lod2nVi  = mod(${vindexAttrName}, LOD2_BLADE_VERTS_COUNT);
            int patchIndex = int(${vindexAttrName} / LOD2_BLADE_VERTS_COUNT);

            dVertexIndex          = mod(lod2nVi, LOD2_BLADE_VERTS);
            dDivVertexIndex       = floor(dVertexIndex / 2.0);
            dPercentOfBladeHeight = dDivVertexIndex / LOD2_BLADE_SEGS;
            dSideOfBlade          = floor(lod2nVi / LOD2_BLADE_VERTS);

            dFieldPatchOffsetXZ = ${lod2OffsetXZParamName}[patchIndex];
        }
        else if (nnVi < LOD0_BLADE_VERTS_COUNT) {

            dVertexIndex          = mod(nnVi, LOD0_BLADE_VERTS);
            dDivVertexIndex       = floor(dVertexIndex / 2.0);
            dPercentOfBladeHeight = dDivVertexIndex / LOD0_BLADE_SEGS;
            dSideOfBlade          = floor(nnVi / LOD0_BLADE_VERTS);

            dFieldPatchOffsetXZ = vec2(0.0);
        }
        else {

            float lod1nnVi = nnVi - LOD0_BLADE_VERTS_COUNT;
            float lod1nVi  = mod(lod1nnVi, LOD1_BLADE_VERTS_COUNT);
            int patchIndex = int(lod1nnVi / LOD1_BLADE_VERTS_COUNT);

            dVertexIndex          = mod(lod1nVi, LOD1_BLADE_VERTS);
            dDivVertexIndex       = floor(dVertexIndex / 2.0);
            dPercentOfBladeHeight = dDivVertexIndex / LOD1_BLADE_SEGS;
            dSideOfBlade          = floor(lod1nVi / LOD1_BLADE_VERTS);

            dFieldPatchOffsetXZ = ${lod1OffsetXZParamName}[patchIndex];
        }
        
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

    float getGrassFactor(vec2 oxz) {
    
        vec2 xz = floor(oxz);

        if (xz[0] < 0.0 ||
            xz[1] < 0.0 ||
            xz[0] > FIELD_SIZE_BOUND_F[0] ||
            xz[1] > FIELD_SIZE_BOUND_F[1]) {
            return 0.0;
        }

        return 1.0;
    }
    
    varying vec2 vUvFieldCoord;
    varying vec2 vUvCoord;
    varying vec3 vColor;

    void calculateBladeVertex() {
        
        vec4 offset = ${offsetAttrName};
        vec4 shape  = ${shapeAttrName};

        // Based on centre of view cone position, what grid tile should
        // this piece of grass be drawn at?
        vec2 quadCenterPos = ${drawPosParamName}.xz;
        vec2 bladeOffset   = offset.xy;
        vec2 patchCenter   = floor((quadCenterPos - bladeOffset) / PATCH_SIZE) * PATCH_SIZE + HALF_PATCH_SIZE + dFieldPatchOffsetXZ;

        float drawPosAltitude = ${drawPosParamName}.y;

        // Find the blade mesh x,y position
        vec2 bladePos = patchCenter + bladeOffset;

        // Local quad center position in field
        // because the positions are shifted by half the size of the field
        // vec2 localQuadCenterPos = quadCenterPos + FIELD_SIZE_H_F;

        float distanceFromBladeToQuadCenter = distance(bladePos, quadCenterPos);
        float degenerateByDistanceFromBladeToQuadCenter = smoothstep(0.92, 1.0, CIRCLE_RADIUS / distanceFromBladeToQuadCenter);

        // Vertex position - start with 2D shape, no bend applied
        dVertexPosition = vec3(
            shape.x * (dEdgeOfBlade - 0.5) * (1.0 - pow(dPercentOfBladeHeight, 3.0)), // taper blade edges as approach tip
            0.0, // flat y, unbent
            shape.y * dPercentOfBladeHeight // height of vtx, unbent
        );

        // Apply blade's natural curve amount
        float curve = shape.w;

        // Then add animated curve amount by time using this blade's
        // unique properties to randomize its oscillation
        curve += shape.w + 0.125 * (sin(${timeParamName} * 4.0 + offset.w * 0.2 * shape.y + offset.x + offset.y));

        // TODO
        float wind = 0.5;

        wind = (clamp(wind, 0.25, 1.0) - 0.25) * (1.0 / 0.75);
        wind = wind * wind * ${windIntensityParamName};
        wind *= dPercentOfBladeHeight; // scale wind by height of blade
        wind = -wind;

        // Start computing a normal for this vertex
        dVertexNormal = vec3(0.0, dSideOfBlade * -2.0 + 1.0, 0.0);

        // put lean and curve together
        float rot = shape.z + curve * dPercentOfBladeHeight;
        vec2 rotv = vec2(cos(rot), sin(rot));

        dVertexPosition.yz = rotate(dVertexPosition.y, dVertexPosition.z, rotv);
        dVertexNormal.yz   = rotate(dVertexNormal.y, dVertexNormal.z, rotv);

        // rotation of this blade as a vector
        rotv = vec2(cos(offset.w), sin(offset.w));

        dVertexPosition.xy = rotate(dVertexPosition.x, dVertexPosition.y, rotv);
        dVertexNormal.xy   = rotate(dVertexNormal.x, dVertexNormal.y, rotv);

        rotv = vec2(cos(wind), sin(wind));

        // Wind blows in axis-aligned direction to make things simpler
        dVertexPosition.yz = rotate(dVertexPosition.y, dVertexPosition.z, rotv);
        dVertexNormal.yz   = rotate(dVertexNormal.y, dVertexNormal.z, rotv);

        // Local blade position in field
        // because the positions are shifted by half the size of the field
        dBladeFieldXZPos = bladePos / ${fieldScaleParamName}.xz + FIELD_SIZE_H_F;
        
        // Sample the heightfield data texture to get altitude for this blade position
        float bladeAltitude = getFieldHeightInterpolated(dBladeFieldXZPos) * ${fieldScaleParamName}.y;
        float grassFactor   = getGrassFactor(dBladeFieldXZPos);

        float distanceQuadCenterToDraw = distance(bladeAltitude, drawPosAltitude);
        float degenerateByDistanceFromBladeToDraw = smoothstep(0.81, 1.0, MAX_ZINIT_DISTANCE / distanceQuadCenterToDraw);

        // Determine if we want the grass to appear or not
        // Use the noise channel to perturb the blade altitude grass starts growing at.
        // float noisyAltitude = grassFactor * TRANSITION_NOISE - (TRANSITION_NOISE / 2.0);
        // float degenerateByNoise = (clamp(noisyAltitude, TRANSITION_LOW, TRANSITION_HIGH) - TRANSITION_LOW) * (1.0 / (TRANSITION_HIGH - TRANSITION_LOW));

        // Transition geometry toward degenerate as we approach field altitude
        dVertexPosition *= grassFactor * degenerateByDistanceFromBladeToDraw * degenerateByDistanceFromBladeToQuadCenter; // degenerateByNoise

        // Translate to world coordinates
        dVertexPosition.x += bladePos.x;
        dVertexPosition.y += bladePos.y;
        dVertexPosition.z += bladeAltitude;
        
        // Translate to xz plane
        dVertexPosition = dVertexPosition.xzy;
        dVertexNormal   = dVertexNormal.xzy;

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

    ...heightMapFactorsChunks,

    heightMapSampler,

    definesVS,
    definesBladeVS,
    bladeDecoderVS,
    calculateLocalVS,

    fieldHeightMapVS,

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
    bladeMaxHeight: number,
    lod0BladeSegs: number,
    lod1BladeSegs: number,
    lod2BladeSegs: number,
    radius: number,
    transitionLow: number,
    transitionHigh: number,
    chunksStore?: typeof chunks,
    engineVersion?: 'v1' | 'v2'
}

export function getGrassShaderChunks({
    width,
    depth,
    heightMapChunkSize,
    heightMapFormat,
    bladeMaxHeight,
    lod0BladeSegs,
    lod1BladeSegs,
    lod2BladeSegs,
    radius,
    transitionLow,
    transitionHigh,
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
        .replace('%%BLADE_HEIGHT_TALL%%', bladeMaxHeight.toFixed(1))
        .replace('%%PATCH_SIZE%%', radius.toFixed(1))
        .replace('%%TRANSITION_LOW%%', transitionLow.toString())
        .replace('%%TRANSITION_HIGH%%', transitionHigh.toString());
    
    const definesBladeVS = chunksStore.definesBladeVS
        .replace('%%LOD0_BLADE_SEGS%%', lod0BladeSegs.toFixed(1))
        .replace('%%LOD1_BLADE_SEGS%%', lod1BladeSegs.toFixed(1))
        .replace('%%LOD2_BLADE_SEGS%%', lod2BladeSegs.toFixed(1));

    const heightMapVS = chunksStore.heightMapSampler.replaceAll('%%HEIGHT_MAP_SAMPLER%%', getSamplerType(heightMapFormat));
    const baseClearVS = chunksStore.baseVS + heightMapVS;
    const heightFactorVS = getFieldHeightFactorVS(heightMapFormat, chunksStore);

    const transformVS = heightFactorVS
                      + chunksStore.fieldHeightMapVS
                      + chunksStore.bladeDecoderVS
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