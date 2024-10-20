export const vertexShader = /** @type glsl */
`
    attribute vec3 aPosition;
    attribute vec2 aUv0;

    uniform mat4 matrix_model;
    uniform mat4 matrix_viewProjection;

    varying vec2 vUv0;

    void main(void)
    {
        vUv0 = aUv0;
        gl_Position = matrix_viewProjection * matrix_model * vec4(aPosition, 1.0);
    }
`;

export const factorMethod = /** @type glsl */
`
    varying vec2 vUv0;

    uniform sampler2D uHeightMap;
    uniform float uBrushOpacity;
    uniform vec4 uBrushMask;

    float getFactor() {
        vec4 heightMap = texture2D(uHeightMap, vUv0);
        float height   = (heightMap.r + heightMap.g + heightMap.b) / 3.0 / heightMap.a;
        float factor   = height * uBrushOpacity;
        return factor;
    }
`;

export const fragmentShader = /** @type glsl */
`
    ${factorMethod}

    void main(void)
    {
        float factor = getFactor();
        vec4 color = vec4(uBrushMask * factor);

        gl_FragColor = color;
    }
`;

export const fragmentInvertShader = /** @type glsl */
`
    ${factorMethod}

    void main(void)
    {
        float levels = 4.0;
        float factor = getFactor();
        vec4 color   = vec4(factor);

        if (uBrushMask.r > 0.0) { color.r = 0.0; levels -= 1.0; }
        if (uBrushMask.g > 0.0) { color.g = 0.0; levels -= 1.0; }
        if (uBrushMask.b > 0.0) { color.b = 0.0; levels -= 1.0; }
        if (uBrushMask.a > 0.0) { color.a = 0.0; levels -= 1.0; }

        gl_FragColor = color / levels;
    }
`;