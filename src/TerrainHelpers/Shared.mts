export const setPrecision = (graphicsDevice: pcx.GraphicsDevice, shaderCode: string) => {
    return "precision " + graphicsDevice.precision + " float;\n" + shaderCode;
}

export const checkGDSupportR32F = (graphicsDevice: pcx.GraphicsDevice) => {
    
    // TODO: maybe not support
    if (graphicsDevice.isWebGPU) {
        return true;
    }

    let result: unknown = false;
    
    if (graphicsDevice.isWebGL2) {

        const gl = (graphicsDevice as pcx.WebglGraphicsDevice).gl;

        result = gl.getExtension("EXT_color_buffer_float");

        if (result) {
            result = gl.getExtension("OES_texture_float");
        }
    }

    //alert(JSON.stringify(result));

    return !!result;
}