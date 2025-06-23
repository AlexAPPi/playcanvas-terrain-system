import { float, int } from "./Types.mjs";

export function getText(val: number, minWidth: number, prefix: string) {

    const str = val.toString();
    const strLen = str.length;
    const appendCount = minWidth - strLen;

    let result = str;

    for (let i = 0; i < appendCount; i++) {
        result = prefix + result;
    }

    return result;
}

export function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}

export function randomFloat() {
    return Math.random();
}

export function randomFloatRange(start: float, end: float) {

    if (end == start) {
        throw new Error("Invalid random range");
    }

    const delta = end - start;

    const randomValue = randomFloat() * delta + start;

    return randomValue;
}

export function calcNextPowerOfTwo(x: int): int {
    
    let ret = 1;

    if (x == 1) {
        return 2;
    }

    while (ret < x) {
        ret = ret * 2;
    }

    return ret;
}

/** A random number from -1.0 to 1.0 */
export function nrand() {
	return Math.random() * 2.0 - 1.0;
}

export const setPrecision = (graphicsDevice: pcx.GraphicsDevice, shaderCode: string) => {
    return "precision " + graphicsDevice.precision + " float;\n" + shaderCode;
}

export const littleEndian = (() => {
    const uint8Array  = new Uint8Array([0xAA, 0xBB]);
    const uint16array = new Uint16Array(uint8Array.buffer);
    return uint16array[0] === 0xBBAA;
})();

export const checkSupportR32FTexture = (graphicsDevice: pcx.GraphicsDevice) => {
    
    try {
        
        // TODO: need more test...
        // TODO: on iphone not work r32f textures
        if (navigator.platform.match(/iPhone|iPod|iPad/) !== null ||
            navigator.platform.startsWith("Mac") && navigator.maxTouchPoints > 4) {
            return false;
        }

        if (graphicsDevice.isWebGL2) {

            const gl = (graphicsDevice as pcx.WebglGraphicsDevice).gl;
    
            let result = gl.getExtension("EXT_color_buffer_float");
            if (result) {
                result = gl.getExtension("OES_texture_float");
            }
            
            if (!!result) {
                return false;
            }
        }

        return true;
    }
    catch (ex) {
        return false;
    }
}