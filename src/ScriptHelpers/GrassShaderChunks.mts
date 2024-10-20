export const baseVS = /** @type glsl */
`
    attribute uint vertex_position;

    uniform float minX;
    uniform float minZ;
    uniform float step;
    uniform float pitch;
    uniform float yaw;
    uniform float width;
    uniform float height;
    uniform float bendStrength;

    uniform mat4 matrix_viewProjection;
    uniform mat4 matrix_model;
    uniform mat3 matrix_normal;

    vec3 dPositionW;
    mat4 dModelMatrix;
    mat3 dNormalMatrix;
`;

export const instancingVS = /** @type glsl */
`
    attribute vec4 instance_line1;
    attribute vec4 instance_line2;
    attribute vec4 instance_line3;
    attribute vec4 instance_line4;
`;

export const transformVS = /** @type glsl */
`
    mat4 getModelMatrix() {
        return mat4(instance_line1, instance_line2, instance_line3, instance_line4);
    }

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float easeOut(float x, float t) {
        return 1.0 - pow(1.0 - x, t);
    }

    int GRASS_SEGMENTS = 6;
    int GRASS_VERTICES = 14;

    float getZSide(int vertIndex) {
        int vertID = vertIndex % GRASS_VERTICES;
        return -(float(vertIndex / GRASS_VERTICES) * 2.0 - 1.0);
    }

    vec3 getVertexLocalPosition(int vertIndex) {

        if (vertIndex == 0) {
            return vec3(0.0);
        }

        if ((vertIndex > GRASS_VERTICES         && vertIndex < GRASS_VERTICES + 4) ||
            (vertIndex > GRASS_VERTICES * 2 - 2 && vertIndex < GRASS_VERTICES * 2 + 2)
        ) {
            return vec3(0);
        }
        
        bool isFirstIndex = false;

        if (vertIndex == 1) {
            vertIndex = 2;
            isFirstIndex = true;
        }

        float GRASS_LOD_DIST = 15.0;
        float GRASS_MAX_DIST = 100.0;

        float vertID = float(vertIndex % GRASS_VERTICES);
        float zSide  = -(float(vertIndex / GRASS_VERTICES) * 2.0 - 1.0); // 1 = front, -1 = back
        float xSide  = mod(vertID, 2.0);                                 // 0 = left, 1 = right
        float heightPercent = (vertID - xSide) / float(GRASS_SEGMENTS * 2);
        float highLODOut    = GRASS_LOD_DIST;//smoothstep(GRASS_LOD_DIST * 0.5, GRASS_LOD_DIST, distance(cameraPosition, grassBladeWorldPos));

        float randomHeight = 1.0;
        float randomWidth  = 1.0;

        float grassTotalHeight    = height * randomHeight;
        float grassTotalWidthHigh = easeOut(1.0 - heightPercent, 2.0);
        float grassTotalWidthLow  = 1.0 - heightPercent;
        float grassTotalWidth     = width * mix(grassTotalWidthHigh, grassTotalWidthLow, highLODOut) * randomWidth;

        // Shift verts
        float x = (xSide - 0.5) * grassTotalWidth;
        float y = heightPercent * grassTotalHeight;

        if (vertIndex == 2 && isFirstIndex == true) {
            return vec3(-x, y, 0);
        }
        
        return vec3(x, y, 0);
    }

    vec4 getPosition() {

        dModelMatrix = getModelMatrix();

        vec3 locP = getVertexLocalPosition(gl_VertexID);
        vec4 posW = dModelMatrix * vec4(locP, 1.0);

        dPositionW = posW.xyz;

        vec4 screenPos = matrix_viewProjection * posW;
        return screenPos;
    }

    vec3 getWorldPosition() {
        return dPositionW;
    }
`;

export const normalVS = /** @type glsl */
`
    vec3 calculateNormal()
    {
        int triVertexIndex = gl_VertexID % 3;

        vec3 pos1;
        vec3 pos2;
        vec3 pos3;

        if (triVertexIndex == 0) {
            pos1 = getVertexLocalPosition(gl_VertexID);
            pos2 = getVertexLocalPosition(gl_VertexID + 1);
            pos3 = getVertexLocalPosition(gl_VertexID + 2);
        } else if (triVertexIndex == 1) {
            pos1 = getVertexLocalPosition(gl_VertexID - 1);
            pos2 = getVertexLocalPosition(gl_VertexID);
            pos3 = getVertexLocalPosition(gl_VertexID + 1);
        } else {
            pos1 = getVertexLocalPosition(gl_VertexID - 2);
            pos2 = getVertexLocalPosition(gl_VertexID - 1);
            pos3 = getVertexLocalPosition(gl_VertexID);
        }

        vec3 v1 = pos2 - pos1;
        vec3 v2 = pos3 - pos1;
        vec3 n = normalize(cross(v1, v2));

        if (gl_VertexID % GRASS_VERTICES % 2 == 1) {
            //return -n;
        }

        return n;
    }
    
    vec3 getNormal()
    {
        dNormalMatrix = mat3(instance_line1.xyz, instance_line2.xyz, instance_line3.xyz);

        vec3 tempNormal = calculateNormal();

        return normalize(dNormalMatrix * tempNormal);
    }
`;

export const diffusePS = /** @type glsl */
`
    uniform vec3 ground_color;

    void getAlbedo()
    {
        dAlbedo = ground_color;
    }
`;

export const grassShaderChunks: Record<string, string> = {

    // Vertex
    baseVS,
    //transformDeclVS,
    transformVS,
    normalVS,
    //uv0VS,
    //startVS,

    // Fragment
    diffusePS,
}


export const buildMatrix =
`

        /*
        float width     = x;
        float distance  = y;
        float bentPitch = pitch - distance * bendStrength;

        return vec3(
            cos(yaw) * -width + cos(bentPitch) * distance * sin(yaw),
            sin(bentPitch) * distance,
            sin(yaw) * width + cos(bentPitch) * distance * cos(yaw)
        );
        */

    getModelMatrixByTRS() {

        const qx = r.x;
        const qy = r.y;
        const qz = r.z;
        const qw = r.w;

        const sx = s.x;
        const sy = s.y;
        const sz = s.z;

        const x2 = qx + qx;
        const y2 = qy + qy;
        const z2 = qz + qz;
        const xx = qx * x2;
        const xy = qx * y2;
        const xz = qx * z2;
        const yy = qy * y2;
        const yz = qy * z2;
        const zz = qz * z2;
        const wx = qw * x2;
        const wy = qw * y2;
        const wz = qw * z2;

        const m = this.data;

        m[0] = (1 - (yy + zz)) * sx;
        m[1] = (xy + wz) * sx;
        m[2] = (xz - wy) * sx;
        m[3] = 0;

        m[4] = (xy - wz) * sy;
        m[5] = (1 - (xx + zz)) * sy;
        m[6] = (yz + wx) * sy;
        m[7] = 0;

        m[8] = (xz + wy) * sz;
        m[9] = (yz - wx) * sz;
        m[10] = (1 - (xx + yy)) * sz;
        m[11] = 0;

        m[12] = t.x;
        m[13] = t.y;
        m[14] = t.z;
        m[15] = 1;
    }
`;