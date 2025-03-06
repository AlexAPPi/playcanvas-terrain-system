export const vertexNormalAttrName = "_";

export const getNormalByAttr = /** @type glsl */
`
    attribute uint ${vertexNormalAttrName};

    vec3 decodeNormal(uint data) {

        if (data == 0u) {
            return vec3(0, 1, 0);
        }

        uvec3 d = uvec3(data, data >> 15, data >> 31) & uvec3(32767u, 65535u, 1u);
        vec3 v  = vec3(d) * 2.0 / vec3(32767.0, 65535.0, 1.0) - 1.0;

        v.z = sqrt(clamp(1.0 - dot(v.xy, v.xy), 0.0, 1.0)) * ((d.z == 1u) ? -1.0 : 1.0);
        
        return normalize(v);
    }

    vec3 getNormalByAttr() {
        return decodeNormal(${vertexNormalAttrName});
    }
`;