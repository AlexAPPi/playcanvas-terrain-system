import { getSamplerType, getTerrainHeightFactorVS, heightMapFactorsChunks, terrainHeightMapParamName, terrainMaxHeightParamName, terrainMinHeightParamName } from "../TerrainHelpers/TerrainPatchesShaderChunks.mjs";
import { THeightMapFormat } from "../TerrainSystem/AbsHeightMap.mjs";

export const vindexAttrName = "vertex_position";
export const offsetAttrName = "vertex_offset";
export const shapeAttrName  = "vertex_shape";

export const timeParamName          = "uTime";
export const offsetXZParamName      = "uOffsetXZ";
export const offset2XZParamName     = "uOffset2XZ";
export const drawPosParamName       = "uDrawPosition";
export const windIntensityParamName = "uWindIntensity";

export const instancingVS = ``;
export const transformInstancingVS = ``;
export const transformDeclVS = ``;

export const definesVS = /** @type glsl */
`
    precision highp float;

    #define PI 3.141592654

    #define HM_NUM_CHUNKS_X (%%HM_NUM_CHUNKS_X%%)
    #define HM_CHUNK_SIZE   (%%HM_CHUNK_SIZE%%)
    #define HM_CHUNK_SIZE_F (float(HM_CHUNK_SIZE))
    #define TR_SIZE         (ivec2(%%TR_SIZE_X%%, %%TR_SIZE_Z%%))
    #define TR_SIZE_F       (vec2(%%TR_SIZE_X_F%%, %%TR_SIZE_Z_F%%))
    #define TR_SIZE_BOUND_F (TR_SIZE_F - 2.0)      
    #define TR_SIZE_H_F     (TR_SIZE_F / 2.0)
    #define TR_SIZE_H_N_F   (-TR_SIZE_H_F)

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
    vec3 getLocalNormal(vec3 vertexNormal) {
        return dLocalNormal;
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

        dModelMatrix = getModelMatrix();

        vec4 posW      = dModelMatrix * vec4(dLocalPosition, 1.0);
        vec4 screenPos = matrix_viewProjection * posW;

        dPositionW = posW.xyz;

        return screenPos;
    }
`;

export const normalVS = /** @type glsl */
`
    vec3 getNormal() {
        dNormalMatrix = matrix_normal;
        return normalize(dNormalMatrix * dLocalNormal);
    }
`;

export const uv0VS = /** @type glsl */
`
    vec2 getUv0() {
        return vec2(bedge, di * 2.0);
    }
`;

// bug with getUv0
export const startUv0VS = /** @type glsl */
`    
    vec2 getUv0() {
        return vec2(bedge, di * 2.0);
    }
`;

export const baseVS = /** @type glsl */
`
    uniform mat4 matrix_viewProjection;
    uniform mat4 matrix_model;
    uniform mat3 matrix_normal;
    
    uniform highp usampler2D uDataMap;
    uniform %%HEIGHT_MAP_SAMPLER%% ${terrainHeightMapParamName};

    uniform float ${terrainMinHeightParamName};
    uniform float ${terrainMaxHeightParamName};

    uniform vec3  ${drawPosParamName};       // centre of where we want to draw
    uniform float ${timeParamName};          // used to animate blades
    uniform float ${windIntensityParamName};

    uniform vec2 ${offsetXZParamName}[8];    // center offset from draw pos lod 1
    uniform vec2 ${offset2XZParamName}[16];  // center offset from draw pos lod 2

    attribute float ${vindexAttrName};
    attribute vec4 ${offsetAttrName};
    attribute vec4 ${shapeAttrName};
    // mediump

    float vi;     // vertex index for this side of the blade
    float di;     // div index (0 .. BLADE_DIVS)
    float hpct;   // percent of height of blade this vertex is at
    float bside;  // front/back side of blade
    float bedge;  // left/right edge (x=0 or x=1)
    vec3 vpos;    // Vertex position - start with 2D shape, no bend applied

    vec2 dPatchOffsetXZ;
    vec3 dLocalNormal;
    vec3 dLocalPosition;
    vec3 dPositionW;
    mat4 dModelMatrix;
    mat3 dNormalMatrix;
`;

export const terrainHeightMapVS = 
`
    vec2 clampTerrainXZ(vec2 xz) {
        return clamp(xz, vec2(0.0), TR_SIZE_F);
    }

    ivec3 getTerrainChunkUV(vec2 origXZ) {

        vec2 xz = clampTerrainXZ(origXZ);
        vec2 cc = floor(xz / HM_CHUNK_SIZE_F);

        int localX = int(xz[0]) % HM_CHUNK_SIZE;
        int localZ = int(xz[1]) % HM_CHUNK_SIZE;
        int chunkX = int(cc[0]);
        int chunkZ = int(cc[1]);
        int level  = chunkZ * HM_NUM_CHUNKS_X + chunkX;

        return ivec3(localX, localZ, level);
    }

    float getTerrainHeightFactor(vec2 xz) {
        ivec3 uv = getTerrainChunkUV(xz);
        return getTerrainHeightFactorFromTexture(uv);
    }

    float getTerrainHeight(vec2 xz) {
        return getTerrainHeightFactor(xz) * (${terrainMaxHeightParamName} - ${terrainMinHeightParamName}) + ${terrainMinHeightParamName};
    }

    float getTerrainHeightInterpolated(vec2 xz) {

        // here we can calculate normal

        vec2 floorXZ = floor(xz);

        float x0z0 = getTerrainHeight(floorXZ);

        if ((floorXZ[0] + 1.0 >= TR_SIZE_F[0]) ||
            (floorXZ[1] + 1.0 >= TR_SIZE_F[1])) {
            return x0z0;
        }

        float x1z0 = getTerrainHeight(floorXZ + vec2(1.0, 0.0));
        float x0z1 = getTerrainHeight(floorXZ + vec2(0.0, 1.0));
        float x1z1 = getTerrainHeight(floorXZ + vec2(1.0, 1.0));

        float factorX = xz[0] - floorXZ[0];
        float factorZ = xz[1] - floorXZ[1];

        float interpolatedBottom = (x1z0 - x0z0) * factorX + x0z0;
        float interpolatedTop    = (x1z1 - x0z1) * factorX + x0z1;
        float finalHeight = (interpolatedTop - interpolatedBottom) * factorZ + interpolatedBottom;

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

            vi    = mod(lod2nVi, LOD2_BLADE_VERTS);
            di    = floor(vi / 2.0);
            hpct  = di / LOD2_BLADE_SEGS;
            bside = floor(lod2nVi / LOD2_BLADE_VERTS);

            dPatchOffsetXZ = ${offset2XZParamName}[patchIndex];
        }
        else if (nnVi < LOD0_BLADE_VERTS_COUNT) {

            vi    = mod(nnVi, LOD0_BLADE_VERTS);
            di    = floor(vi / 2.0);
            hpct  = di / LOD0_BLADE_SEGS;
            bside = floor(nnVi / LOD0_BLADE_VERTS);

            dPatchOffsetXZ = vec2(0.0);
        }
        else {

            float lod1nnVi = nnVi - LOD0_BLADE_VERTS_COUNT;
            float lod1nVi  = mod(lod1nnVi, LOD1_BLADE_VERTS_COUNT);
            int patchIndex = int(lod1nnVi / LOD1_BLADE_VERTS_COUNT);

            vi    = mod(lod1nVi, LOD1_BLADE_VERTS);
            di    = floor(vi / 2.0);
            hpct  = di / LOD1_BLADE_SEGS;
            bside = floor(lod1nVi / LOD1_BLADE_VERTS);

            dPatchOffsetXZ = ${offsetXZParamName}[patchIndex];
        }
        
        bedge = mod(vi, 2.0);
    }
`;

// https://community.khronos.org/t/discarding-polygons-in-vertex-shader/103839/9
export const startVS = /** @type glsl */
`
    ${startUv0VS}

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
            xz[0] > TR_SIZE_BOUND_F[0] ||
            xz[1] > TR_SIZE_BOUND_F[1]) {
            return 0.0;
        }

        return 1.0;
    }

    varying vec2 vUvCoord;
    varying vec3 vColor;

    void main(void) {

        decodeBlade();

        vec4 offset = ${offsetAttrName};
        vec4 shape  = ${shapeAttrName};

        // Based on centre of view cone position, what grid tile should
        // this piece of grass be drawn at?
        vec2 quadCenterPos = ${drawPosParamName}.xz;
        vec2 bladeOffset   = offset.xy;
        vec2 patchCenter   = floor((quadCenterPos - bladeOffset) / PATCH_SIZE) * PATCH_SIZE + HALF_PATCH_SIZE + dPatchOffsetXZ;

        // Find the blade mesh x,y position
        vec2 bladePos = patchCenter + bladeOffset;

        float distanceFromBladeToQuadCenter = distance(bladePos, quadCenterPos);

        // Local quad center position in terrain
        // because the positions are shifted by half the size of the terrain
        vec2 localQuadCenterPos = quadCenterPos + TR_SIZE_H_F;

        float drawPosAltitude = ${drawPosParamName}.y;
        float quadCenterAltitude = getTerrainHeight(localQuadCenterPos);
        float distanceQuadCenterToDraw = distance(quadCenterAltitude, drawPosAltitude);

        // if (distanceQuadCenterToDraw > MAX_ZINIT_DISTANCE) {
        //    gl_Position = vec4(1.0, 1.0, 1.0, 0.0);
        //    return;
        // }

        float degenerateByDistanceFromQuadCenterToDraw  = smoothstep(1.0, 0.8, distanceQuadCenterToDraw / MAX_ZINIT_DISTANCE);
        float degenerateByDistanceFromBladeToQuadCenter = smoothstep(1.0, 0.92, distanceFromBladeToQuadCenter / CIRCLE_RADIUS);

        // Vertex position - start with 2D shape, no bend applied
        vpos = vec3(
            shape.x * (bedge - 0.5) * (1.0 - pow(hpct, 3.0)), // taper blade edges as approach tip
            0.0, // flat y, unbent
            shape.y * hpct // height of vtx, unbent
        );

        // Start computing a normal for this vertex
        vec3 normal = vec3(0.0, bside * -2.0 + 1.0, 0.0);

        // Apply blade's natural curve amount
        float curve = shape.w;

        // Then add animated curve amount by time using this blade's
        // unique properties to randomize its oscillation
        curve += shape.w + 0.125 * (sin(${timeParamName} * 4.0 + offset.w * 0.2 * shape.y + offset.x + offset.y));

        // put lean and curve together
        float rot = shape.z + curve * hpct;
        vec2 rotv = vec2(cos(rot), sin(rot));

        vpos.yz   = rotate(vpos.y, vpos.z, rotv);
        normal.yz = rotate(normal.y, normal.z, rotv);

        // rotation of this blade as a vector
        rotv = vec2(cos(offset.w), sin(offset.w));

        vpos.xy   = rotate(vpos.x, vpos.y, rotv);
        normal.xy = rotate(normal.x, normal.y, rotv);

        // TODO
        float wind = 0.5;

        wind = (clamp(wind, 0.25, 1.0) - 0.25) * (1.0 / 0.75);
        wind = wind * wind * ${windIntensityParamName};
        wind *= hpct; // scale wind by height of blade
        wind = -wind;
        rotv = vec2(cos(wind), sin(wind));

        // Wind blows in axis-aligned direction to make things simpler
        vpos.yz   = rotate(vpos.y, vpos.z, rotv);
        normal.yz = rotate(normal.y, normal.z, rotv);

        // grass texture coordinate for this vertex
        vUvCoord = getUv0();

        // Vertex color must be brighter because it is multiplied with blade texture
        // Each blade is randomly colourized a bit by its position
        vColor = vec3(cos(offset.x), sin(offset.y), sin(offset.x));

        // Local blade position in terrain
        // because the positions are shifted by half the size of the terrain
        vec2 bladeLocalPos = bladePos + TR_SIZE_H_F;
        
        // Sample the heightfield data texture to get altitude for this blade position
        float bladeAltitude = getTerrainHeightInterpolated(bladeLocalPos);
        float grassFactor   = getGrassFactor(bladeLocalPos);

        // Determine if we want the grass to appear or not
        // Use the noise channel to perturb the blade altitude grass starts growing at.
        // float noisyAltitude = grassFactor * TRANSITION_NOISE - (TRANSITION_NOISE / 2.0);
        // float degenerateByNoise = (clamp(noisyAltitude, TRANSITION_LOW, TRANSITION_HIGH) - TRANSITION_LOW) * (1.0 / (TRANSITION_HIGH - TRANSITION_LOW));

        // Transition geometry toward degenerate as we approach terrain altitude
        vpos *= grassFactor * degenerateByDistanceFromQuadCenterToDraw * degenerateByDistanceFromBladeToQuadCenter; // degenerateByNoise

        // Translate to world coordinates
        vpos.x += bladePos.x;
        vpos.y += bladePos.y;
        vpos.z += bladeAltitude;
        
        dLocalPosition = vpos.xzy;
        dLocalNormal   = normal.xzy;

        gl_Position = getPosition();
`;

export const diffusePS = /** @type glsl */
`
    uniform sampler2D uDiffuseTex;
    uniform vec3 uDiffuseColor;
    uniform vec3 uDiffuseColorRandom;

    varying vec2 vUvCoord;
    varying vec3 vColor;

    vec4 mGamma = vec4(2.2);

    void getAlbedo() {

        vec3 tex = pow(texture2D(uDiffuseTex, vUvCoord), mGamma).rgb;

        dAlbedo = tex * uDiffuseColor + vColor * uDiffuseColorRandom;
    }
`;

export const chunks = {

    ...heightMapFactorsChunks,

    definesVS,
    definesBladeVS,
    bladeDecoderVS,

    terrainHeightMapVS,

    // Vertex
    baseVS,
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
    chunksStore?: typeof chunks
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
    chunksStore = chunks
}: IGrassShaderOptions): Record<string, string> {

    const definesVS = chunksStore.definesVS
    .replace('%%HM_NUM_CHUNKS_X%%', String((width - 1) / (heightMapChunkSize - 1) | 0))
    .replace('%%HM_CHUNK_SIZE%%', String(heightMapChunkSize | 0))
    .replace('%%TR_SIZE_X%%', String(width))
    .replace('%%TR_SIZE_Z%%', String(depth))
    .replace('%%TR_SIZE_X_F%%', width.toFixed(1))
    .replace('%%TR_SIZE_Z_F%%', depth.toFixed(1))
    .replace('%%BLADE_HEIGHT_TALL%%', bladeMaxHeight.toFixed(1))
    .replace('%%PATCH_SIZE%%', radius.toFixed(1))
    .replace('%%TRANSITION_LOW%%', transitionLow.toString())
    .replace('%%TRANSITION_HIGH%%', transitionHigh.toString());

    const definesBladeVS = chunksStore.definesBladeVS
    .replace('%%LOD0_BLADE_SEGS%%', lod0BladeSegs.toFixed(1))
    .replace('%%LOD1_BLADE_SEGS%%', lod1BladeSegs.toFixed(1))
    .replace('%%LOD2_BLADE_SEGS%%', lod2BladeSegs.toFixed(1));

    const clearBaseVS = chunksStore.baseVS
    .replace('%%HEIGHT_MAP_SAMPLER%%', getSamplerType(heightMapFormat));
    
    const baseVS = definesVS + definesBladeVS + clearBaseVS;

    const terrainHeightFactorVS = getTerrainHeightFactorVS(heightMapFormat, chunksStore);
    const startVS = terrainHeightFactorVS
        + chunksStore.terrainHeightMapVS
        + chunksStore.bladeDecoderVS
        + chunksStore.startVS;

    return {
        baseVS: baseVS,
        transformVS: chunksStore.transformVS,
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