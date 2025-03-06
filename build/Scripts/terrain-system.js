"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
;
(() => {
    const defs = {};
    const resolved = {};
    // save original define and require
    window.___amd___OriginalDefine = window.define;
    window.___amd___OriginalRequire = window.require;
    if (!window.define && !window.require) {
        const define = (id, deps, factory) => {
            if (defs[id]) {
                throw new Error('Duplicate definition for ' + id);
            }
            defs[id] = [deps, factory];
        };
        define.amd = {
            bundle: true, // this implementation works only with bundled amd modules
            dynamic: false, // does not support dynamic or async loading
        };
        const require = (id) => {
            if (id === 'require')
                return require;
            if (id === 'exports')
                return {};
            if (resolved[id])
                return resolved[id];
            if (!defs[id]) {
                console.log(defs, id);
                throw new Error('No definition for ' + id);
            }
            const moduleExports = {};
            const deps = defs[id][0];
            const factory = defs[id][1];
            const args = deps.map(dep => {
                if (dep === 'exports') {
                    return moduleExports;
                }
                return require(dep);
            });
            factory.apply(null, args);
            return resolved[id] = moduleExports;
        };
        window.define = define;
        window.require = require;
    }
    window.___amd___requireResolver = () => {
        for (const id in defs) {
            if (defs.hasOwnProperty(id)) {
                const deps = defs[id][0];
                if (deps) {
                    deps.map(dep => {
                        if (dep !== 'require' &&
                            dep !== 'exports') {
                            if (!resolved.hasOwnProperty(dep)) {
                                require(dep);
                            }
                            if (!defs.hasOwnProperty(dep) &&
                                !resolved.hasOwnProperty(dep)) {
                                throw new Error(`Failed define '${id}' dep not found '${dep}'`);
                            }
                        }
                    });
                }
                require(id);
                delete defs[id];
            }
        }
        // return original define and require
        window.define = window.___amd___OriginalDefine;
        window.require = window.___amd___OriginalRequire;
        // clear
        delete window.___amd___requireResolver;
        delete window.___amd___OriginalDefine;
        delete window.___amd___OriginalRequire;
    };
})();
define("src/EngineExtensions/Renderer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (() => {
        if (!window.EXPERIMENTAL_TERRAIN_CUSTOM_RENDER) {
            return;
        }
        const originalDrawInstance = pc.ForwardRenderer.prototype.drawInstance;
        pc.ForwardRenderer.prototype.drawInstance = function (device, meshInstance, mesh, style, normal) {
            if (mesh.primitiveChunks) {
                const modelMatrix = meshInstance.node.worldTransform;
                this.modelMatrixId.setValue(modelMatrix.data);
                if (normal) {
                    const normalMatrix = meshInstance.node.normalMatrix;
                    this.normalMatrixId.setValue(normalMatrix.data);
                }
                let vb0;
                let vb1;
                let indexBuffer;
                if (device.isWebGPU) {
                    vb0 = device.vertexBuffers[0];
                    vb1 = device.vertexBuffers[1];
                    indexBuffer = device.indexBuffer;
                }
                let keepBuffers = false;
                for (const primitive of mesh.primitiveChunks[style]) {
                    if (primitive.enabled) {
                        if (primitive.attributes) {
                            for (const scopeId in primitive.attributes) {
                                device.scope.resolve(scopeId).setValue(primitive.attributes[scopeId]);
                            }
                        }
                        // Keep buffer
                        if (device.isWebGPU) {
                            device.draw(primitive, 1, true);
                            device.indexBuffer = indexBuffer;
                            device.vertexBuffers.push(vb0, vb1);
                        }
                        else {
                            device.draw(primitive, 0, keepBuffers);
                            keepBuffers = true;
                        }
                    }
                }
                if (device.isWebGPU) {
                    device.indexBuffer = null;
                    device.vertexBuffers.length = 0;
                }
            }
            else {
                originalDrawInstance.call(this, device, meshInstance, mesh, style, normal);
            }
        };
    })();
});
define("src/Shared/Types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("src/GrassFieldHelpers/GrassFieldTexture", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GrassFieldTexture = void 0;
    class GrassFieldTexture {
        get texture() { return this._texture; }
        constructor(graphicsDevice, width, depth, buffer) {
            this._width = width;
            this._depth = depth;
            const w = (width - 1) / 4 + 1;
            const d = (depth - 1) / 4 + 1;
            this._buffer = buffer !== null && buffer !== void 0 ? buffer : new Uint8Array(w * d * 4); // => 1 byte = 8 bits => 8 / 2 = 4 bit for 8 levels
            this._texture = new pc.Texture(graphicsDevice, {
                width: w,
                height: d,
                format: pc.PIXELFORMAT_RGBA8U,
                mipmaps: false,
                minFilter: pc.FILTER_NEAREST,
                magFilter: pc.FILTER_NEAREST,
                addressU: pc.ADDRESS_CLAMP_TO_EDGE,
                addressV: pc.ADDRESS_CLAMP_TO_EDGE,
                flipY: graphicsDevice.isWebGPU,
                levels: [this._buffer]
            });
        }
        destroy() {
            var _a;
            (_a = this._texture) === null || _a === void 0 ? void 0 : _a.destroy();
        }
        setChannel(x, z, channel) {
            const index = (x + z * this._width) / 4 | 0;
            const value = this._buffer[index];
        }
        setPixel() {
            if (this._texture) {
                const device = this._texture.device;
                const dataChunkSize = 1;
                const buffer = new Uint8Array(4);
                if (device.isWebGL2) {
                    const gl = device.gl;
                    const textureFormat = this._texture.impl._glFormat;
                    const texturePixelT = this._texture.impl._glPixelType;
                    const textureTarget = this._texture.impl._glTarget;
                    const textureObject = this._texture.impl._glTexture;
                    gl.bindTexture(textureTarget, textureObject);
                    gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, 0, dataChunkSize, dataChunkSize, 1, textureFormat, texturePixelT, buffer);
                }
                else if (device.isWebGPU) {
                    const webgpu = device.wgpu;
                    const texture = (this._texture.impl.gpuTexture);
                    webgpu.queue.writeTexture({
                        texture: texture,
                        origin: [0, 0, 0],
                        mipLevel: 0
                    }, buffer, {
                        offset: 0,
                        bytesPerRow: 4 * dataChunkSize, // always 4 for rgba format
                        rowsPerImage: dataChunkSize
                    }, {
                        width: dataChunkSize,
                        height: dataChunkSize
                    });
                }
            }
        }
    }
    exports.GrassFieldTexture = GrassFieldTexture;
    GrassFieldTexture.MAX_CHANEL = 8;
});
define("src/Shared/Compressor", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Compressor {
        static _concatChunks(chunks, totalLength) {
            let position = 0;
            // Concatenate all Uint8Array chunks into a single ArrayBuffer
            const resultBuffer = new Uint8Array(totalLength);
            for (const chunk of chunks) {
                resultBuffer.set(chunk, position);
                position += chunk.length;
            }
            return resultBuffer.buffer;
        }
        static _getResult(reader) {
            return __awaiter(this, void 0, void 0, function* () {
                let totalLength = 0;
                const chunks = [];
                while (true) {
                    const { done, value } = yield reader.read();
                    if (done)
                        break;
                    chunks.push(value);
                    totalLength += value.length;
                }
                return this._concatChunks(chunks, totalLength);
            });
        }
        static compressBuffer(buffer_1) {
            return __awaiter(this, arguments, void 0, function* (buffer, format = 'gzip') {
                const compressedStream = new CompressionStream(format);
                const writer = compressedStream.writable.getWriter();
                writer.write(new Uint8Array(buffer));
                writer.close();
                const reader = compressedStream.readable.getReader();
                return this._getResult(reader);
            });
        }
        static decompressBuffer(buffer_1) {
            return __awaiter(this, arguments, void 0, function* (buffer, format = 'gzip') {
                const decompressedStream = new DecompressionStream(format);
                const reader = decompressedStream.readable.getReader();
                const writer = decompressedStream.writable.getWriter();
                // Write the compressed buffer to the writer
                writer.write(new Uint8Array(buffer));
                writer.close();
                return this._getResult(reader);
            });
        }
    }
    exports.default = Compressor;
});
define("src/TerrainSystem/AbsHeightMapFileIO", ["require", "exports", "src/Shared/Compressor"], function (require, exports, Compressor_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbsHeightMapFileIO = exports.heightMapFileCompressedFormat = exports.factorSize = exports.heightMapVersion = void 0;
    Compressor_mjs_1 = __importDefault(Compressor_mjs_1);
    exports.heightMapVersion = 99;
    exports.factorSize = 3;
    exports.heightMapFileCompressedFormat = 'gzip';
    class AbsHeightMapFileIO {
        __readHeightFactor(view, headerSize, width, x, z) {
            const index = z * width + x;
            const r = view.getUint8(headerSize + index * exports.factorSize + 0);
            const g = view.getUint8(headerSize + index * exports.factorSize + 1);
            const b = view.getUint8(headerSize + index * exports.factorSize + 2);
            const scaled = (r << 16) | (g << 8) | b;
            const factor = scaled / 16777215;
            return factor;
        }
        __writeHeightFactor(view, headerSize, heightMap, x, z) {
            const index = z * heightMap.width + x;
            const factor = heightMap.getFactor(x, z);
            const scaled = Math.floor(factor * 16777215);
            const r = (scaled >> 16) & 0xFF;
            const g = (scaled >> 8) & 0xFF;
            const b = (scaled & 0xFF);
            view.setUint8(headerSize + index * exports.factorSize + 0, r);
            view.setUint8(headerSize + index * exports.factorSize + 1, g);
            view.setUint8(headerSize + index * exports.factorSize + 2, b);
        }
        __importFromFile(heightMap, buffer, options) {
            return __awaiter(this, void 0, void 0, function* () {
                // TODO:
                // header version 99
                // headerByteSize, version, width, depth, minHeight, maxHeight
                const nBuffer = yield Compressor_mjs_1.default.decompressBuffer(buffer, exports.heightMapFileCompressedFormat);
                const view = new DataView(nBuffer);
                const version = view.getUint32(1, true);
                if (version !== exports.heightMapVersion) {
                    console.warn('Height map version: %f no support.', version);
                    return null;
                }
                const headerSize = view.getUint8(0);
                const width = view.getUint32(5, true);
                const depth = view.getUint32(9, true);
                const minHeight = view.getFloat32(13, true);
                const maxHeight = view.getFloat32(17, true);
                const delta = (options === null || options === void 0 ? void 0 : options.adaptiveMinMaxHeight)
                    ? heightMap.maxHeight - heightMap.minHeight
                    : maxHeight - minHeight;
                const resultMinHeight = (options === null || options === void 0 ? void 0 : options.adaptiveMinMaxHeight) ? heightMap.minHeight : minHeight;
                if (heightMap.width !== width ||
                    heightMap.depth !== depth &&
                        options &&
                        options.adaptiveWidthAndDepth) {
                    // TODO: its work for x^n + 1, z^n + 1
                    const factorX = (width - 1) / (heightMap.width - 1);
                    const factorZ = (depth - 1) / (heightMap.depth - 1);
                    for (let z = 0; z < depth; z += factorZ) {
                        for (let x = 0; x < width; x += factorX) {
                            // TODO: smooth for heightMap more import data
                            const factor = this.__readHeightFactor(view, headerSize, width, x | 0, z | 0);
                            const height = resultMinHeight + factor * delta;
                            heightMap.set(x / factorX, z / factorZ, height);
                        }
                    }
                }
                else {
                    for (let z = 0; (z < depth) && (z < heightMap.depth); z++) {
                        for (let x = 0; (x < width) && (x < heightMap.width); x++) {
                            const factor = this.__readHeightFactor(view, headerSize, width, x, z);
                            const height = resultMinHeight + factor * delta;
                            heightMap.set(x, z, height);
                        }
                    }
                }
                return {
                    width,
                    depth,
                    minHeight,
                    maxHeight
                };
            });
        }
        __exportToBuffer(heightMap) {
            return __awaiter(this, void 0, void 0, function* () {
                // TODO:
                // header version 99
                // headerByteSize, version, width, depth, minHeight, maxHeight
                const headerSize = 1 + 4 + 4 + 4 + 4 + 4;
                const buffer = new ArrayBuffer(headerSize + exports.factorSize * heightMap.width * heightMap.depth);
                const view = new DataView(buffer);
                view.setUint8(0, headerSize);
                view.setUint32(1, exports.heightMapVersion, true);
                view.setUint32(5, heightMap.width, true);
                view.setUint32(9, heightMap.depth, true);
                view.setFloat32(13, heightMap.minHeight, true);
                view.setFloat32(17, heightMap.maxHeight, true);
                for (let z = 0; z < heightMap.depth; z++) {
                    for (let x = 0; x < heightMap.width; x++) {
                        this.__writeHeightFactor(view, headerSize, heightMap, x, z);
                    }
                }
                return Compressor_mjs_1.default.compressBuffer(buffer, exports.heightMapFileCompressedFormat);
            });
        }
    }
    exports.AbsHeightMapFileIO = AbsHeightMapFileIO;
    exports.default = AbsHeightMapFileIO;
});
define("src/TerrainSystem/IZone", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("src/TerrainSystem/AbsHeightMap", ["require", "exports", "src/TerrainSystem/AbsHeightMapFileIO"], function (require, exports, AbsHeightMapFileIO_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbsHeightMap = void 0;
    AbsHeightMapFileIO_mjs_1 = __importDefault(AbsHeightMapFileIO_mjs_1);
    class AbsHeightMap extends AbsHeightMapFileIO_mjs_1.default {
        constructor() {
            super(...arguments);
            this.minX = 0;
            this.minZ = 0;
        }
        get maxX() { return this.width; }
        get maxZ() { return this.depth; }
        getHeightInterpolated(x, z) {
            const intX = x | 0;
            const intZ = z | 0;
            const x0z0 = this.get(intX, intZ);
            if ((intX + 1 >= this.width) ||
                (intZ + 1 >= this.depth)) {
                return x0z0;
            }
            const x1z0 = this.get(intX + 1, intZ);
            const x0z1 = this.get(intX, intZ + 1);
            const x1z1 = this.get(intX + 1, intZ + 1);
            const factorX = x - intX;
            const interpolatedBottom = (x1z0 - x0z0) * factorX + x0z0;
            const interpolatedTop = (x1z1 - x0z1) * factorX + x0z1;
            const factorZ = z - intZ;
            const finalHeight = (interpolatedTop - interpolatedBottom) * factorZ + interpolatedBottom;
            return finalHeight;
        }
        substract(x, z, value) {
            return this.append(x, z, -value);
        }
        divide(x, z, value, heightIfZero = 0) {
            return this.multiply(x, z, 1 / value, heightIfZero);
        }
        fromFile(buffer, options) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.__importFromFile(this, buffer, options);
            });
        }
        toFile() {
            return __awaiter(this, void 0, void 0, function* () {
                const buffer = yield this.__exportToBuffer(this);
                return new Blob([buffer], { type: "application/octet-stream" });
            });
        }
        toBuffer(buffer) {
            const width = this.width;
            const delta = this.maxHeight - this.minHeight;
            for (let z = 0; z < this.depth; z++) {
                for (let x = 0; x < this.width; x++) {
                    const h = this.get(x, z);
                    const v = (h - this.minHeight) / delta * 255;
                    const pos = (x + z * width) * 4;
                    buffer[pos] = v;
                    buffer[pos + 1] = v;
                    buffer[pos + 2] = v;
                    buffer[pos + 3] = 255;
                }
            }
        }
        toCanvas() {
            const canvas = document.createElement('canvas');
            const width = this.width;
            const height = this.depth;
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Failed create canvas 2d context');
            }
            const imageData = ctx.getImageData(0, 0, width, height);
            const buffer = imageData.data;
            this.toBuffer(buffer);
            ctx.putImageData(imageData, 0, 0);
            return canvas;
        }
        /**
         * Save height map to image of base64
         */
        toImage(type, quality) {
            const canvas = this.toCanvas();
            return canvas.toDataURL(type, quality);
        }
        /**
         * Load height map from image
         * @param img
         */
        fromImage(img) {
            const bufferWidth = img.width;
            const bufferHeight = img.height;
            if (bufferWidth % 2 !== 0 || bufferHeight % 2 !== 0) {
                throw new Error("Map sizes not divisible by 2 are not supported");
            }
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = bufferWidth;
            canvas.height = bufferHeight;
            context.drawImage(img, 0, 0);
            const imageData = context.getImageData(0, 0, bufferWidth, bufferHeight);
            const imageBuffer = imageData.data;
            const demMinMax = this.maxHeight - this.minHeight;
            const maxSegmentX = this.width - 1;
            const maxSegmentZ = this.depth - 1;
            const factorX = bufferWidth / maxSegmentX;
            const factorZ = bufferHeight / maxSegmentZ;
            for (let z = 0; z < this.depth; z++) {
                for (let x = 0; x < this.width; x++) {
                    let normalizeX = x === maxSegmentX ? x - 1 : x;
                    let normalizeZ = z === maxSegmentZ ? z - 1 : z;
                    const heightMapX = (normalizeX * factorX) | 0;
                    const heightMapZ = (normalizeZ * factorZ) | 0;
                    const pos = (heightMapX + heightMapZ * bufferWidth) * 4;
                    const r = imageBuffer[pos];
                    const g = imageBuffer[pos + 1];
                    const b = imageBuffer[pos + 2];
                    const a = imageBuffer[pos + 3];
                    const coeff = (r + g + b) / 3 / a;
                    const height = this.minHeight + demMinMax * coeff;
                    this.set(x, z, height);
                }
            }
        }
        smoothZone(zone, np, radius) {
            if (zone.maxX < 0)
                return;
            if (zone.maxZ < 0)
                return;
            if (np < 0 || np > 1)
                return;
            if (radius === 0)
                radius = 1;
            const minX = Math.max(zone.minX, 0);
            const minZ = Math.max(zone.minZ, 0);
            const maxX = Math.min(zone.maxX, this.width);
            const maxZ = Math.min(zone.maxZ, this.depth);
            const cp = 1 - np;
            for (let x = minX; x < maxX; x++) {
                for (let z = minZ; z < maxZ; z++) {
                    const prevHeight = this.get(x, z);
                    let updtHeight;
                    let neighNumber = 0;
                    let neighAverage = 0;
                    for (let rx = -radius; rx <= radius; rx++) {
                        for (let rz = -radius; rz <= radius; rz++) {
                            const innerX = (x + rx);
                            const innerZ = (z + rz);
                            if (innerX < 0 || innerX >= this.width)
                                continue;
                            if (innerZ < 0 || innerZ >= this.depth)
                                continue;
                            const height = (innerX === x && innerZ === z)
                                ? prevHeight
                                : this.get(innerX, innerZ);
                            neighNumber++;
                            neighAverage += height;
                        }
                    }
                    neighAverage /= neighNumber;
                    updtHeight = neighAverage * np + prevHeight * cp;
                    this.set(x, z, updtHeight);
                }
            }
        }
        smooth(np, radius) {
            this.smoothZone(this, np, radius);
        }
        normalize(minHeight, maxHeight) {
            if (minHeight > maxHeight) {
                return;
            }
            const minMaxDelta = this.maxHeight - this.minHeight;
            const minMaxRange = maxHeight - minHeight;
            for (let z = 0; z < this.depth; z++) {
                for (let x = 0; x < this.width; x++) {
                    const currentHeight = this.get(x, z);
                    const normalizeHeight = ((currentHeight - minHeight) / minMaxDelta) * minMaxRange + maxHeight;
                    this.set(x, z, normalizeHeight);
                }
            }
        }
        combineHeights(type, heightMap, value, zone, heightIfZero = 0, minHeight = null, maxHeight = null) {
            if (zone.maxX < 0)
                return;
            if (zone.maxZ < 0)
                return;
            const lenX = zone.maxX - zone.minX;
            const lenZ = zone.maxZ - zone.minZ;
            if (lenX < 1 || lenZ < 1 || value === 0) {
                return;
            }
            const fixedMinX = Math.max(zone.minX, 0);
            const fixedMinZ = Math.max(zone.minZ, 0);
            const fixedMaxX = Math.min(zone.maxX, this.width);
            const fixedMaxZ = Math.min(zone.maxZ, this.depth);
            const coeffFactorX = (heightMap.width - 1) / lenX;
            const coeffFactorZ = (heightMap.depth - 1) / lenZ;
            for (let z = fixedMinZ; z < fixedMaxZ; z++) {
                for (let x = fixedMinX; x < fixedMaxX; x++) {
                    const x2 = (coeffFactorX * (x - zone.minX)) | 0;
                    const z2 = (coeffFactorZ * (z - zone.minZ)) | 0;
                    const height = heightMap.get(x2, z2);
                    const smoothAppendValue = height * value;
                    const oldHeight = this.get(x, z) || heightIfZero;
                    let candidate = type === '+' ? oldHeight + smoothAppendValue :
                        type === '-' ? oldHeight - smoothAppendValue :
                            type === '*' ? oldHeight * smoothAppendValue :
                                type === '/' ? oldHeight / smoothAppendValue :
                                    oldHeight;
                    if (minHeight !== null && candidate < minHeight) {
                        candidate = minHeight;
                    }
                    if (maxHeight !== null && candidate > maxHeight) {
                        candidate = maxHeight;
                    }
                    this.set(x, z, candidate);
                }
            }
        }
    }
    exports.AbsHeightMap = AbsHeightMap;
    exports.default = AbsHeightMap;
});
define("src/TerrainHelpers/TerrainPatchesShaderChunks", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.chunks = exports.heightMapFactorsChunks = exports.diffusePS = exports.maxLayersCount = exports.startVS = exports.normalVS = exports.normalCoreVS = exports.normalByHeightMapVS = exports.startUv0VS = exports.uv0VS = exports.transformVS = exports.transformDeclVS = exports.transformInstancingVS = exports.instancingVS = exports.terrainHeightChunkVS = exports.terrainHeightFactorChunkVS = exports.terrainChunkUVVS = exports.terrainHeightFactorRGBA8UX4VS = exports.terrainHeightFactorRG16UX2VS = exports.terrainHeightFactorRGBA8VS = exports.terrainHeightFactorR32FVS = exports.terrainHeightFactorRGB8VS = exports.terrainCoordsChunkVS = exports.currentTerrainXZChunkVS = exports.currentTerrainXZForInstancingChunkVS = exports.baseClearVS = exports.baseForInstancingVS = exports.baseOriginalVS = exports.definesVS = exports.littleEndianValue = exports.littleEndian = exports.terrainSplatMapParamName = exports.terrainMaxHeightParamName = exports.terrainMinHeightParamName = exports.terrainHeightMapParamName = exports.patchLodCoreParamName = exports.patchCoordOffsetParamName = exports.patchInstCoordOffsetParamName = exports.vertexNormalAttrName = exports.vertexHeightAttrName = exports.vertexCoordAttrName = void 0;
    exports.getTerrainHeightFactorVS = getTerrainHeightFactorVS;
    exports.getTextureType = getTextureType;
    exports.getSamplerType = getSamplerType;
    exports.getTerrainShaderChunks = getTerrainShaderChunks;
    exports.vertexCoordAttrName = "vertex_position";
    exports.vertexHeightAttrName = "vertex_height";
    exports.vertexNormalAttrName = "vertex_normal";
    exports.patchInstCoordOffsetParamName = "vertex_postion_offset";
    exports.patchCoordOffsetParamName = "uTerrainPatchCoordOffset";
    exports.patchLodCoreParamName = "uTerrainPatchLodCore";
    exports.terrainHeightMapParamName = "uTerrainHeightMap";
    exports.terrainMinHeightParamName = "uTerrainMinHeight";
    exports.terrainMaxHeightParamName = "uTerrainMaxHeight";
    exports.terrainSplatMapParamName = "uTerrainSplatMap";
    exports.littleEndian = (() => {
        const uint8Array = new Uint8Array([0xAA, 0xBB]);
        const uint16array = new Uint16Array(uint8Array.buffer);
        return uint16array[0] === 0xBBAA;
    })();
    exports.littleEndianValue = exports.littleEndian ? 'true' : 'false';
    exports.definesVS = `
    #define HM_NUM_CHUNKS_X (%%HM_NUM_CHUNKS_X%%)
    #define HM_CHUNK_SIZE   (%%HM_CHUNK_SIZE%%)
    #define HM_CHUNK_SIZE_F (float(HM_CHUNK_SIZE))
    #define TR_SIZE         (ivec2(%%TR_SIZE_X%%, %%TR_SIZE_Z%%))
    #define TR_SIZE_F       (vec2(%%TR_SIZE_X_F%%, %%TR_SIZE_Z_F%%))
    #define TR_SIZE_H_F     (TR_SIZE_F / 2.0)
    #define TR_SIZE_H_N_F   (-TR_SIZE_H_F)
`;
    exports.baseOriginalVS = `
    attribute uvec2 ${exports.vertexCoordAttrName};
`;
    exports.baseForInstancingVS = `
    attribute uvec2 ${exports.vertexCoordAttrName};
    attribute uvec2 ${exports.patchInstCoordOffsetParamName};
`;
    //uniform vec2 ${terrainSizeParamName};
    //uniform float ${terrainHeightMapChunkSizeParamName};
    exports.baseClearVS = `
    // #define #baseDefinesVS
    // #define #baseOriginalVS [OR] #baseForInstancingVS

    uniform mat4 matrix_viewProjection;
    uniform mat4 matrix_model;
    uniform mat3 matrix_normal;

    uniform vec2 ${exports.patchCoordOffsetParamName};
    uniform float ${exports.patchLodCoreParamName};

    uniform %%HEIGHT_MAP_SAMPLER%% ${exports.terrainHeightMapParamName};

    uniform float ${exports.terrainMinHeightParamName};
    uniform float ${exports.terrainMaxHeightParamName};
    
    vec3 dPositionW;
    mat4 dModelMatrix;
    mat3 dNormalMatrix;
    vec2 dCurrentTerrainXZ;
    vec3 dCurrentTerrainNormal;
    float dCurrentTerrainHeight;
`;
    exports.currentTerrainXZForInstancingChunkVS = `
    vec2 getCurrentTerrainXZ() {
        return vec2(${exports.vertexCoordAttrName}) + vec2(${exports.patchInstCoordOffsetParamName});
    }
`;
    exports.currentTerrainXZChunkVS = `
    vec2 getCurrentTerrainXZ() {
        return vec2(${exports.vertexCoordAttrName}) + ${exports.patchCoordOffsetParamName};
    }
`;
    exports.terrainCoordsChunkVS = `
    vec2 getCurrentTerrainUvCoord() {
        vec2 xz = dCurrentTerrainXZ;
        vec2 uv = (xz + 0.5) / TR_SIZE_F;
        return uv;
    }

    vec2 clampTerrainXZ(vec2 xz) {
        return clamp(xz, vec2(0.0), TR_SIZE_F);
    }

    vec2 getTerrainXZ(ivec2 offset) {
        return dCurrentTerrainXZ + vec2(offset);
    }
`;
    // Not support for webgpu
    exports.terrainHeightFactorRGB8VS = `
    float rgb8ToFloat(ivec3 v) {
        uvec3 uints = uvec3(v * 255.0);
        uint scaled = (uints.r << 16) | (uints.g << 8) | uints.b;
        return float(scaled) / 16777215.0;
    }

    float getTerrainHeightFactorFromTexture(ivec3 uv) {
        vec3 rgb = texture(${exports.terrainHeightMapParamName}, uv);
        return rgb8ToFloat(rgb);
    }
`;
    exports.terrainHeightFactorR32FVS = `
    float getTerrainHeightFactorFromTexture(ivec3 uv) {
        return texture(${exports.terrainHeightMapParamName}, uv).r;
    }
`;
    // https://stackoverflow.com/questions/63827836/is-it-possible-to-do-a-rgba-to-float-and-back-round-trip-and-read-the-pixels-in
    // note: the 0.1s here an there are voodoo related to precision
    exports.terrainHeightFactorRGBA8VS = `
    float rgba8ToFloat(vec4 v) {
        vec4 bits  = ${exports.littleEndian ? 'v' : 'v.abgr'} * 255.0;
        float sign = mix(-1.0, 1.0, step(bits[3], 128.0));
        float expo = floor(mod(bits[3] + 0.1, 128.0)) * 2.0 + floor((bits[2] + 0.1) / 128.0) - 127.0;
        float sig  = bits[0] + bits[1] * 256.0 + floor(mod(bits[2] + 0.1, 128.0)) * 256.0 * 256.0;
        return sign * (1.0 + sig / 8388607.0) * pow(2.0, expo);
    }
    
    float getTerrainHeightFactorFromTexture(ivec3 uv) {
        vec4 rgba = texelFetch(${exports.terrainHeightMapParamName}, uv, 0);
        return rgba8ToFloat(rgba);
    }
`;
    // TODO: check littleEndian
    // Compress height by x coord [patch0, patch1] ...
    // see: CompressedPatchedHeightMap file
    exports.terrainHeightFactorRG16UX2VS = `
    float getTerrainHeightFactorFromTexture(ivec3 uv) {

        int level    = uv.b;
        int newLevel = level / 2;
        int chunkX   = level % HM_NUM_CHUNKS_X;
        int shift    = chunkX % 2;

        #if defined(WEBGPU)
        uvec4 rgba = texelFetch(usampler2DArray(${exports.terrainHeightMapParamName}_texture, ${exports.terrainHeightMapParamName}_sampler), ivec3(uv.rg, newLevel), 0);
        #else
        uvec4 rgba = texelFetch(${exports.terrainHeightMapParamName}, ivec3(uv.rg, newLevel), 0);
        #endif
        
        uint value   = (shift == 0) ? rgba.r : rgba.g;
        return float(value) / 65535.0;
    }
`;
    exports.terrainHeightFactorRGBA8UX4VS = `
    float getTerrainHeightFactorFromTexture(ivec3 uv) {

        int level    = uv.b;
        int newLevel = level / 4;
        int chunkX   = level % HM_NUM_CHUNKS_X;
        int shift    = chunkX % 4;

        #if defined(WEBGPU)
        uvec4 rgba = texelFetch(usampler2DArray(${exports.terrainHeightMapParamName}_texture, ${exports.terrainHeightMapParamName}_sampler), ivec3(uv.rg, newLevel), 0);
        #else
        uvec4 rgba = texelFetch(${exports.terrainHeightMapParamName}, ivec3(uv.rg, newLevel), 0);
        #endif

        return float(rgba[shift]) / 255.0;
    }
`;
    exports.terrainChunkUVVS = `
    // #define #terrainCoordsChunkVS

    ivec3 getTerrainChunkUV(ivec2 offset) {

        vec2 oc = getTerrainXZ(offset);
        vec2 xz = clampTerrainXZ(oc);
        vec2 cc = floor(xz / HM_CHUNK_SIZE_F);

        int localX = int(xz[0]) % HM_CHUNK_SIZE;
        int localZ = int(xz[1]) % HM_CHUNK_SIZE;
        int chunkX = int(cc[0]);
        int chunkZ = int(cc[1]);
        int level  = chunkZ * HM_NUM_CHUNKS_X + chunkX;

        return ivec3(localX, localZ, level);
    }
`;
    exports.terrainHeightFactorChunkVS = `
    // #define #terrainHeightFactorRGBA8VS [OR] #terrainHeightFactorRGB8VS
    // #define #terrainChunkUVVS

    float getTerrainHeightFactor(ivec2 offset) {
        ivec3 uv = getTerrainChunkUV(offset);
        return getTerrainHeightFactorFromTexture(uv);
    }
`;
    // TODO: optimization by static
    exports.terrainHeightChunkVS = `
    // #define #terrainHeightFactorChunkVS
    
    float getTerrainHeight(ivec2 offset) {
        return getTerrainHeightFactor(offset) * (${exports.terrainMaxHeightParamName} - ${exports.terrainMinHeightParamName}) + ${exports.terrainMinHeightParamName};
    }

    float getCurrentTerrainHeight() {
        return getTerrainHeight(ivec2(0, 0));
    }
`;
    exports.instancingVS = ``;
    exports.transformInstancingVS = ``;
    exports.transformDeclVS = ``;
    exports.transformVS = `
    // #define #terrainHeightChunkVS

    mat4 getModelMatrix() {
        return matrix_model;
    }

    vec4 getPosition() {
    
        dModelMatrix = getModelMatrix();

        vec2 centeredXZ = TR_SIZE_H_N_F + dCurrentTerrainXZ;
        vec4 localPos   = vec4(centeredXZ.r, dCurrentTerrainHeight, centeredXZ.g, 1.0);
        
        vec4 posW      = dModelMatrix * localPos;
        vec4 screenPos = matrix_viewProjection * posW;

        dPositionW = posW.xyz;

        return screenPos;
    }
    
    vec3 getWorldPosition() {
        return dPositionW;
    }
`;
    exports.uv0VS = `
`;
    // bug with getUv0
    exports.startUv0VS = ` 
    vec2 getUv0() {
        return getCurrentTerrainUvCoord();
    }
`;
    exports.normalByHeightMapVS = `
    vec3 getCurrentTerrainNormal() {

        float step = pow(2.0, ${exports.patchLodCoreParamName} + 1.0) / 2.0;

        float left  = getTerrainHeight(ivec2( step,  0));
        float right = getTerrainHeight(ivec2(-step,  0));
        float up    = getTerrainHeight(ivec2( 0,     step));
        float down  = getTerrainHeight(ivec2( 0,    -step));
        vec3 normal = vec3(left - right, 2.0 * step, down - up);
        
        return normalize(normal);
    }
`;
    exports.normalCoreVS = `
    vec3 getLocalNormal(vec3 vertexNormal) {
        return dCurrentTerrainNormal;
    }

    mat3 getNormalMatrix(mat4 modelMatrix) {
        return matrix_normal;
    }
`;
    exports.normalVS = `
    // #define #normalByHeightMapVS

    vec3 getNormal() {
        dNormalMatrix = matrix_normal;
        return normalize(dNormalMatrix * dCurrentTerrainNormal);
    }
`;
    exports.startVS = `
    ${exports.startUv0VS}

    varying vec2 vUvCoord;
    varying vec2 vGridPosition;

    void main(void) {

        dCurrentTerrainXZ     = getCurrentTerrainXZ();
        dCurrentTerrainHeight = getCurrentTerrainHeight();
        dCurrentTerrainNormal = getCurrentTerrainNormal();

        vGridPosition = dCurrentTerrainXZ;
        vUvCoord      = getCurrentTerrainUvCoord();
        gl_Position   = getPosition();
`;
    exports.maxLayersCount = 16;
    exports.diffusePS = `
    uniform sampler2D ${exports.terrainSplatMapParamName};
    uniform mediump sampler2DArray uTerrainLayersDiffuse;
    //uniform mediump sampler2DArray uTerrainLayersNormalMap;
    uniform float uTerrainLayersCount;
    uniform float uTerrainLayersFlags[${exports.maxLayersCount}];
    uniform vec2 uTerrainLayersScale[${exports.maxLayersCount}];
    uniform vec2 uTerrainLayersOffset[${exports.maxLayersCount}];

    varying vec2 vUvCoord;
    varying vec2 vGridPosition;

    vec4 mGamma = vec4(2.2);

    void getAlbedo() {

        vec3 albedo = vec3(0.0);
        vec4 splat  = pow(texture2D(${exports.terrainSplatMapParamName}, vUvCoord), vec4(2.2));
        int count   = int(uTerrainLayersCount);

        for (int i = 0; i < ${exports.maxLayersCount}; ++i) {

            if (uTerrainLayersFlags[i] > 0.0) {

                vec2 uv = uTerrainLayersOffset[i] + vUvCoord * uTerrainLayersScale[i];
                vec3 pos = vec3(uv, float(i));
                vec4 tex = pow(texture(uTerrainLayersDiffuse, pos), mGamma);
                
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
    exports.heightMapFactorsChunks = {
        terrainHeightFactorR32FVS: exports.terrainHeightFactorR32FVS,
        terrainHeightFactorRGBA8VS: exports.terrainHeightFactorRGBA8VS,
        terrainHeightFactorRGB8VS: exports.terrainHeightFactorRGB8VS,
        terrainHeightFactorRG16UX2VS: exports.terrainHeightFactorRG16UX2VS,
        terrainHeightFactorRGBA8UX4VS: exports.terrainHeightFactorRGBA8UX4VS,
    };
    exports.chunks = Object.assign(Object.assign({}, exports.heightMapFactorsChunks), { currentTerrainXZForInstancingChunkVS: exports.currentTerrainXZForInstancingChunkVS,
        currentTerrainXZChunkVS: exports.currentTerrainXZChunkVS,
        terrainHeightFactorChunkVS: exports.terrainHeightFactorChunkVS,
        terrainHeightChunkVS: exports.terrainHeightChunkVS,
        terrainCoordsChunkVS: exports.terrainCoordsChunkVS,
        terrainChunkUVVS: exports.terrainChunkUVVS,
        normalByHeightMapVS: exports.normalByHeightMapVS,
        // Vertex
        definesVS: exports.definesVS,
        baseForInstancingVS: exports.baseForInstancingVS,
        baseOriginalVS: exports.baseOriginalVS,
        baseClearVS: exports.baseClearVS,
        transformDeclVS: exports.transformDeclVS,
        transformVS: exports.transformVS,
        instancingVS: exports.instancingVS,
        transformInstancingVS: exports.transformInstancingVS,
        normalCoreVS: exports.normalCoreVS,
        normalVS: exports.normalVS,
        uv0VS: exports.uv0VS,
        startVS: exports.startVS,
        // Fragment
        diffusePS: exports.diffusePS });
    function getTerrainHeightFactorVS(format, chunksStore) {
        switch (format) {
            case 'r32f': return chunksStore.terrainHeightFactorR32FVS;
            case 'rgba': return chunksStore.terrainHeightFactorRGBA8VS;
            case 'rgb': return chunksStore.terrainHeightFactorRGB8VS;
            case 'rgbaX2': return chunksStore.terrainHeightFactorRG16UX2VS;
            case 'rgbaX4': return chunksStore.terrainHeightFactorRGBA8UX4VS;
            default: break;
        }
        throw new Error('Format not supported');
    }
    function getTextureType(format) {
        switch (format) {
            case 'r32f': return pc.PIXELFORMAT_R32F;
            case 'rgba': return pc.PIXELFORMAT_RGBA8;
            case 'rgbaX2': return pc.PIXELFORMAT_RG16U;
            case 'rgbaX4': return pc.PIXELFORMAT_RGBA8U;
            default: break;
        }
        throw new Error('Format not supported');
    }
    function getSamplerType(format) {
        switch (format) {
            case 'r32f': return 'highp sampler2DArray';
            case 'rgba': return 'highp sampler2DArray';
            case 'rgbaX2': return 'highp usampler2DArray';
            case 'rgbaX4': return 'highp usampler2DArray';
            default: break;
        }
        throw new Error('Format not supported');
    }
    function getTerrainShaderChunks({ width, depth, heightMapChunkSize, instancing, heightMapFormat, chunksStore = exports.chunks }) {
        const definesVS = chunksStore.definesVS
            .replace('%%HM_NUM_CHUNKS_X%%', String((width - 1) / (heightMapChunkSize - 1) | 0))
            .replace('%%HM_CHUNK_SIZE%%', String(heightMapChunkSize | 0))
            .replace('%%TR_SIZE_X%%', String(width))
            .replace('%%TR_SIZE_Z%%', String(depth))
            .replace('%%TR_SIZE_X_F%%', width.toFixed(1))
            .replace('%%TR_SIZE_Z_F%%', depth.toFixed(1));
        const baseClearVS = chunksStore.baseClearVS
            .replace('%%HEIGHT_MAP_SAMPLER%%', getSamplerType(heightMapFormat));
        const terrainHeightFactorVS = getTerrainHeightFactorVS(heightMapFormat, chunksStore);
        const startVS = chunksStore.normalByHeightMapVS + chunksStore.startVS;
        const baseVS = (instancing ? chunksStore.baseForInstancingVS : chunksStore.baseOriginalVS) + baseClearVS;
        const transformVS = definesVS
            + (instancing ? chunksStore.currentTerrainXZForInstancingChunkVS : chunksStore.currentTerrainXZChunkVS)
            + terrainHeightFactorVS
            + chunksStore.terrainCoordsChunkVS
            + chunksStore.terrainChunkUVVS
            + chunksStore.terrainHeightFactorChunkVS
            + chunksStore.terrainHeightChunkVS
            + chunksStore.transformVS;
        return {
            // Vertex
            baseVS,
            transformVS,
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
});
define("src/GrassFieldHelpers/GrassShaderChunk", ["require", "exports", "src/TerrainHelpers/TerrainPatchesShaderChunks"], function (require, exports, TerrainPatchesShaderChunks_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.chunks = exports.diffusePS = exports.startVS = exports.bladeDecoderVS = exports.terrainHeightMapVS = exports.baseVS = exports.startUv0VS = exports.uv0VS = exports.normalVS = exports.transformVS = exports.normalCoreVS = exports.definesBladeVS = exports.definesVS = exports.transformDeclVS = exports.transformInstancingVS = exports.instancingVS = exports.windIntensityParamName = exports.drawPosParamName = exports.offset2XZParamName = exports.offsetXZParamName = exports.timeParamName = exports.shapeAttrName = exports.offsetAttrName = exports.vindexAttrName = void 0;
    exports.getGrassShaderChunks = getGrassShaderChunks;
    exports.vindexAttrName = "vertex_position";
    exports.offsetAttrName = "vertex_offset";
    exports.shapeAttrName = "vertex_shape";
    exports.timeParamName = "uTime";
    exports.offsetXZParamName = "uOffsetXZ";
    exports.offset2XZParamName = "uOffset2XZ";
    exports.drawPosParamName = "uDrawPosition";
    exports.windIntensityParamName = "uWindIntensity";
    exports.instancingVS = ``;
    exports.transformInstancingVS = ``;
    exports.transformDeclVS = ``;
    exports.definesVS = `
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
    exports.definesBladeVS = `
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
    exports.normalCoreVS = `
    vec3 getLocalNormal(vec3 vertexNormal) {
        return dLocalNormal;
    }

    mat3 getNormalMatrix(mat4 modelMatrix) {
        return matrix_normal;
    }
`;
    exports.transformVS = `
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
    exports.normalVS = `
    vec3 getNormal() {
        dNormalMatrix = matrix_normal;
        return normalize(dNormalMatrix * dLocalNormal);
    }
`;
    exports.uv0VS = `
    vec2 getUv0() {
        return vec2(bedge, di * 2.0);
    }
`;
    // bug with getUv0
    exports.startUv0VS = `    
    vec2 getUv0() {
        return vec2(bedge, di * 2.0);
    }
`;
    exports.baseVS = `
    uniform mat4 matrix_viewProjection;
    uniform mat4 matrix_model;
    uniform mat3 matrix_normal;
    
    uniform highp usampler2D uDataMap;
    uniform %%HEIGHT_MAP_SAMPLER%% ${TerrainPatchesShaderChunks_mjs_1.terrainHeightMapParamName};

    uniform float ${TerrainPatchesShaderChunks_mjs_1.terrainMinHeightParamName};
    uniform float ${TerrainPatchesShaderChunks_mjs_1.terrainMaxHeightParamName};

    uniform vec3  ${exports.drawPosParamName};       // centre of where we want to draw
    uniform float ${exports.timeParamName};          // used to animate blades
    uniform float ${exports.windIntensityParamName};

    uniform vec2 ${exports.offsetXZParamName}[8];    // center offset from draw pos lod 1
    uniform vec2 ${exports.offset2XZParamName}[16];  // center offset from draw pos lod 2

    attribute float ${exports.vindexAttrName};
    attribute vec4 ${exports.offsetAttrName};
    attribute vec4 ${exports.shapeAttrName};
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
    exports.terrainHeightMapVS = `
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
        return getTerrainHeightFactor(xz) * (${TerrainPatchesShaderChunks_mjs_1.terrainMaxHeightParamName} - ${TerrainPatchesShaderChunks_mjs_1.terrainMinHeightParamName}) + ${TerrainPatchesShaderChunks_mjs_1.terrainMinHeightParamName};
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
    exports.bladeDecoderVS = `
    void decodeBlade() {

        float nnVi = ${exports.vindexAttrName} - LOD2_BLADE_VERTS_ALL_COUNT;

        if (nnVi < 0.0) {

            float lod2nVi  = mod(${exports.vindexAttrName}, LOD2_BLADE_VERTS_COUNT);
            int patchIndex = int(${exports.vindexAttrName} / LOD2_BLADE_VERTS_COUNT);

            vi    = mod(lod2nVi, LOD2_BLADE_VERTS);
            di    = floor(vi / 2.0);
            hpct  = di / LOD2_BLADE_SEGS;
            bside = floor(lod2nVi / LOD2_BLADE_VERTS);

            dPatchOffsetXZ = ${exports.offset2XZParamName}[patchIndex];
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

            dPatchOffsetXZ = ${exports.offsetXZParamName}[patchIndex];
        }
        
        bedge = mod(vi, 2.0);
    }
`;
    // https://community.khronos.org/t/discarding-polygons-in-vertex-shader/103839/9
    exports.startVS = `
    ${exports.startUv0VS}

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

        vec4 offset = ${exports.offsetAttrName};
        vec4 shape  = ${exports.shapeAttrName};

        // Based on centre of view cone position, what grid tile should
        // this piece of grass be drawn at?
        vec2 quadCenterPos = ${exports.drawPosParamName}.xz;
        vec2 bladeOffset   = offset.xy;
        vec2 patchCenter   = floor((quadCenterPos - bladeOffset) / PATCH_SIZE) * PATCH_SIZE + HALF_PATCH_SIZE + dPatchOffsetXZ;

        // Find the blade mesh x,y position
        vec2 bladePos = patchCenter + bladeOffset;

        float distanceFromBladeToQuadCenter = distance(bladePos, quadCenterPos);

        // Local quad center position in terrain
        // because the positions are shifted by half the size of the terrain
        vec2 localQuadCenterPos = quadCenterPos + TR_SIZE_H_F;

        float drawPosAltitude = ${exports.drawPosParamName}.y;
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
        curve += shape.w + 0.125 * (sin(${exports.timeParamName} * 4.0 + offset.w * 0.2 * shape.y + offset.x + offset.y));

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
        wind = wind * wind * ${exports.windIntensityParamName};
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
    exports.diffusePS = `
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
    exports.chunks = Object.assign(Object.assign({}, TerrainPatchesShaderChunks_mjs_1.heightMapFactorsChunks), { definesVS: exports.definesVS,
        definesBladeVS: exports.definesBladeVS,
        bladeDecoderVS: exports.bladeDecoderVS,
        terrainHeightMapVS: exports.terrainHeightMapVS,
        // Vertex
        baseVS: exports.baseVS,
        transformVS: exports.transformVS,
        transformDeclVS: exports.transformDeclVS,
        instancingVS: exports.instancingVS,
        transformInstancingVS: exports.transformInstancingVS,
        normalCoreVS: exports.normalCoreVS,
        normalVS: exports.normalVS,
        uv0VS: exports.uv0VS,
        startVS: exports.startVS,
        // Fragment
        diffusePS: exports.diffusePS });
    function getGrassShaderChunks({ width, depth, heightMapChunkSize, heightMapFormat, bladeMaxHeight, lod0BladeSegs, lod1BladeSegs, lod2BladeSegs, radius, transitionLow, transitionHigh, chunksStore = exports.chunks }) {
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
            .replace('%%HEIGHT_MAP_SAMPLER%%', (0, TerrainPatchesShaderChunks_mjs_1.getSamplerType)(heightMapFormat));
        const baseVS = definesVS + definesBladeVS + clearBaseVS;
        const terrainHeightFactorVS = (0, TerrainPatchesShaderChunks_mjs_1.getTerrainHeightFactorVS)(heightMapFormat, chunksStore);
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
});
/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 *
 * Version 2012-03-09
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 *
 * --------------------
 * TypeScriptified 2016
 */
define("src/GrassFieldHelpers/simplex", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = simplex;
    class Grad {
        constructor(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        dot2(x, y) {
            return this.x * x + this.y * y;
        }
        dot3(x, y, z) {
            return this.x * x + this.y * y + this.z * z;
        }
    }
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const perm = new Array(512);
    const gradP = new Array(512);
    const grad3 = [
        new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
        new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
        new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)
    ];
    const p = [
        151, 160, 137, 91, 90, 15,
        131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
        190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
        88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
        77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
        102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
        135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
        5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
        223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
        129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
        251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
        49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
        138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
    ];
    // This isn't a very good seeding function, but it works ok. It supports 2^16
    // different seed values. Write something better if you need more seeds.
    function seed(seed) {
        if (seed > 0 && seed < 1) {
            // Scale the seed out
            seed *= 65536;
        }
        seed = Math.floor(seed);
        if (seed < 256) {
            seed |= seed << 8;
        }
        for (let i = 0; i < 256; i++) {
            let v;
            if (i & 1) {
                v = p[i] ^ (seed & 255);
            }
            else {
                v = p[i] ^ ((seed >> 8) & 255);
            }
            perm[i] = perm[i + 256] = v;
            gradP[i] = gradP[i + 256] = grad3[v % 12];
        }
    }
    seed(0);
    // 2D simplex noise
    function simplex(xin, yin) {
        let n0, n1, n2; // Noise contributions from the three corners
        // Skew the input space to determine which simplex cell we're in
        const s = (xin + yin) * F2; // Hairy factor for 2D
        let i = Math.floor(xin + s);
        let j = Math.floor(yin + s);
        const t = (i + j) * G2;
        const x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
        const y0 = yin - j + t;
        // For the 2D case, the simplex shape is an equilateral triangle.
        // Determine which simplex we are in.
        let i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
        if (x0 > y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
            i1 = 1;
            j1 = 0;
        }
        else { // upper triangle, YX order: (0,0)->(0,1)->(1,1)
            i1 = 0;
            j1 = 1;
        }
        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
        // c = (3-sqrt(3))/6
        const x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
        const y2 = y0 - 1 + 2 * G2;
        // Work out the hashed gradient indices of the three simplex corners
        i &= 255;
        j &= 255;
        const gi0 = gradP[i + perm[j]];
        const gi1 = gradP[i + i1 + perm[j + j1]];
        const gi2 = gradP[i + 1 + perm[j + 1]];
        // Calculate the contribution from the three corners
        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) {
            n0 = 0;
        }
        else {
            t0 *= t0;
            n0 = t0 * t0 * gi0.dot2(x0, y0); // (x,y) of grad3 used for 2D gradient
        }
        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) {
            n1 = 0;
        }
        else {
            t1 *= t1;
            n1 = t1 * t1 * gi1.dot2(x1, y1);
        }
        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) {
            n2 = 0;
        }
        else {
            t2 *= t2;
            n2 = t2 * t2 * gi2.dot2(x2, y2);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 70 * (n0 + n1 + n2);
    }
});
define("src/Shared/Debug", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.drawDirectionVector = drawDirectionVector;
    exports.drawPoint = drawPoint;
    exports.drawBox = drawBox;
    const tmpVec = new pc.Vec3();
    function drawDirectionVector(position, dir, color = pc.Color.RED) {
        // Draw the vector
        const start = position;
        const end = tmpVec.add2(position, dir);
        pc.app.drawLine(start, end, color, false);
    }
    function drawPoint({ center, radius = 0.1, numSegments = 4, color = pc.Color.RED, layer, depthTest = false }) {
        const block = 6 * 3;
        const points = new Array(numSegments * block);
        const step = 2 * Math.PI / numSegments;
        let angle = 0;
        for (let i = 0; i < numSegments; i++) {
            const sin0 = Math.sin(angle);
            const cos0 = Math.cos(angle);
            angle += step;
            const sin1 = Math.sin(angle);
            const cos1 = Math.cos(angle);
            const j = i * block;
            points[j + 0] = center.x + radius * sin0;
            points[j + 1] = center.y;
            points[j + 2] = center.z + radius * cos0;
            points[j + 3] = center.x + radius * sin1;
            points[j + 4] = center.y;
            points[j + 5] = center.z + radius * cos1;
            points[j + 6] = center.x;
            points[j + 7] = center.y + radius * sin0;
            points[j + 8] = center.z + radius * cos0;
            points[j + 9] = center.x;
            points[j + 10] = center.y + radius * sin1;
            points[j + 11] = center.z + radius * cos1;
            points[j + 12] = center.x + radius * cos0;
            points[j + 13] = center.y + radius * sin0;
            points[j + 14] = center.z;
            points[j + 15] = center.x + radius * cos1;
            points[j + 16] = center.y + radius * sin1;
            points[j + 17] = center.z;
        }
        pc.app.drawLineArrays(points, color, depthTest, layer);
    }
    function drawBox({ min, max, color = pc.Color.RED, layer, depthTest = false }) {
        var _a;
        (_a = pc.app) === null || _a === void 0 ? void 0 : _a.drawWireAlignedBox(min, max, color, depthTest, layer);
    }
});
define("src/Shared/Utils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toHalfFloat = toHalfFloat;
    exports.fromHalfFloat = fromHalfFloat;
    exports.getText = getText;
    exports.clamp = clamp;
    exports.randomFloat = randomFloat;
    exports.randomFloatRange = randomFloatRange;
    exports.calcNextPowerOfTwo = calcNextPowerOfTwo;
    exports.nrand = nrand;
    // Fast Half Float Conversions, http://www.fox-toolkit.org/ftp/fasthalffloatconversion.pdf
    const _tables = /*@__PURE__*/ _generateTables();
    function _generateTables() {
        // float32 to float16 helpers
        const buffer = new ArrayBuffer(4);
        const floatView = new Float32Array(buffer);
        const uint32View = new Uint32Array(buffer);
        const baseTable = new Uint32Array(512);
        const shiftTable = new Uint32Array(512);
        for (let i = 0; i < 256; ++i) {
            const e = i - 127;
            // very small number (0, -0)
            if (e < -27) {
                baseTable[i] = 0x0000;
                baseTable[i | 0x100] = 0x8000;
                shiftTable[i] = 24;
                shiftTable[i | 0x100] = 24;
                // small number (denorm)
            }
            else if (e < -14) {
                baseTable[i] = 0x0400 >> (-e - 14);
                baseTable[i | 0x100] = (0x0400 >> (-e - 14)) | 0x8000;
                shiftTable[i] = -e - 1;
                shiftTable[i | 0x100] = -e - 1;
                // normal number
            }
            else if (e <= 15) {
                baseTable[i] = (e + 15) << 10;
                baseTable[i | 0x100] = ((e + 15) << 10) | 0x8000;
                shiftTable[i] = 13;
                shiftTable[i | 0x100] = 13;
                // large number (Infinity, -Infinity)
            }
            else if (e < 128) {
                baseTable[i] = 0x7c00;
                baseTable[i | 0x100] = 0xfc00;
                shiftTable[i] = 24;
                shiftTable[i | 0x100] = 24;
                // stay (NaN, Infinity, -Infinity)
            }
            else {
                baseTable[i] = 0x7c00;
                baseTable[i | 0x100] = 0xfc00;
                shiftTable[i] = 13;
                shiftTable[i | 0x100] = 13;
            }
        }
        // float16 to float32 helpers
        const mantissaTable = new Uint32Array(2048);
        const exponentTable = new Uint32Array(64);
        const offsetTable = new Uint32Array(64);
        for (let i = 1; i < 1024; ++i) {
            let m = i << 13; // zero pad mantissa bits
            let e = 0; // zero exponent
            // normalized
            while ((m & 0x00800000) === 0) {
                m <<= 1;
                e -= 0x00800000; // decrement exponent
            }
            m &= ~0x00800000; // clear leading 1 bit
            e += 0x38800000; // adjust bias
            mantissaTable[i] = m | e;
        }
        for (let i = 1024; i < 2048; ++i) {
            mantissaTable[i] = 0x38000000 + ((i - 1024) << 13);
        }
        for (let i = 1; i < 31; ++i) {
            exponentTable[i] = i << 23;
        }
        exponentTable[31] = 0x47800000;
        exponentTable[32] = 0x80000000;
        for (let i = 33; i < 63; ++i) {
            exponentTable[i] = 0x80000000 + ((i - 32) << 23);
        }
        exponentTable[63] = 0xc7800000;
        for (let i = 1; i < 64; ++i) {
            if (i !== 32) {
                offsetTable[i] = 1024;
            }
        }
        return {
            floatView: floatView,
            uint32View: uint32View,
            baseTable: baseTable,
            shiftTable: shiftTable,
            mantissaTable: mantissaTable,
            exponentTable: exponentTable,
            offsetTable: offsetTable
        };
    }
    // float32 to float16
    function toHalfFloat(val) {
        if (Math.abs(val) > 65504)
            console.warn('THREE.DataUtils.toHalfFloat(): Value out of range.');
        val = clamp(val, -65504, 65504);
        _tables.floatView[0] = val;
        const f = _tables.uint32View[0];
        const e = (f >> 23) & 0x1ff;
        return _tables.baseTable[e] + ((f & 0x007fffff) >> _tables.shiftTable[e]);
    }
    // float16 to float32
    function fromHalfFloat(val) {
        const m = val >> 10;
        _tables.uint32View[0] = _tables.mantissaTable[_tables.offsetTable[m] + (val & 0x3ff)] + _tables.exponentTable[m];
        return _tables.floatView[0];
    }
    function getText(val, minWidth, prefix) {
        const str = val.toString();
        const strLen = str.length;
        const appendCount = minWidth - strLen;
        let result = str;
        for (let i = 0; i < appendCount; i++) {
            result = prefix + result;
        }
        return result;
    }
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    function randomFloat() {
        return Math.random();
    }
    function randomFloatRange(start, end) {
        if (end == start) {
            throw new Error("Invalid random range");
        }
        const delta = end - start;
        const randomValue = randomFloat() * delta + start;
        return randomValue;
    }
    function calcNextPowerOfTwo(x) {
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
    function nrand() {
        return Math.random() * 2.0 - 1.0;
    }
});
define("src/TerrainSystem/CoordsBuffer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CoordsBuffer = exports.coordsVertexSize = void 0;
    exports.coordsVertexSize = 2;
    class CoordsBuffer {
        get patchVertexBufferLength() { return this._length; }
        get patchVertexBufferData() { return this._data; }
        get patchVertexBufferTyped() { return this._dataTyped; }
        get width() { return this._width; }
        get depth() { return this._depth; }
        get patchSize() { return this._patchSize; }
        constructor(heightMap, patchSize) {
            this.heightMap = heightMap;
            // We can use uint8 for patches smaller than 255, but we only use 2 bytes,
            // for optimal performance need 4 bytes for the buffer.
            this._patchSize = patchSize;
            this._width = heightMap.width;
            this._depth = heightMap.depth;
            this._length = this._patchSize * this._patchSize;
            const coordsArrLength = this._length * exports.coordsVertexSize;
            const coordsByteLength = coordsArrLength * Uint16Array.BYTES_PER_ELEMENT;
            this._data = new ArrayBuffer(coordsByteLength);
            this._dataTyped = new Uint16Array(this._data, 0, coordsArrLength);
        }
        init() {
            let index = 0;
            for (let z = 0; z < this._patchSize; z++) {
                for (let x = 0; x < this._patchSize; x++) {
                    this._dataTyped[index++] = x;
                    this._dataTyped[index++] = z;
                }
            }
        }
        getPosition(index, buf) {
            const x = index % this._width | 0;
            const z = index / this._width | 0;
            buf.x = x;
            buf.y = this.heightMap.get(x, z);
            buf.z = z;
            return true;
        }
        getPositionWithHeightByFactor(index, buf) {
            const x = index % this._width | 0;
            const z = index / this._width | 0;
            buf.x = x;
            buf.y = this.heightMap.getFactor(x, z);
            buf.z = z;
            return true;
        }
        getCoords(index, buf) {
            const x = index % this._width | 0;
            const z = index / this._width | 0;
            buf.x = x;
            buf.z = z;
            return true;
        }
    }
    exports.CoordsBuffer = CoordsBuffer;
    exports.default = CoordsBuffer;
});
define("src/TerrainSystem/HeightMap", ["require", "exports", "src/TerrainSystem/AbsHeightMap"], function (require, exports, AbsHeightMap_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HeightMap = exports.defaultHeightVertexSize = exports.HeightMapArrType = void 0;
    AbsHeightMap_mjs_1 = __importDefault(AbsHeightMap_mjs_1);
    exports.HeightMapArrType = Float32Array;
    exports.defaultHeightVertexSize = 1;
    class HeightMap extends AbsHeightMap_mjs_1.default {
        get size() { return this._width * this._depth; }
        get width() { return this._width; }
        get depth() { return this._depth; }
        get data() { return this._data; }
        get format() { return 'rgba'; }
        get itemSize() { return this._itemSize; }
        get itemHeightIndexOffset() { return this._itemHeightIndexOffset; }
        get minHeight() { return this._minHeight; }
        get maxHeight() { return this._maxHeight; }
        constructor(width, depth, minHeight, maxHeight, buffer, itemSize = exports.defaultHeightVertexSize, itemHeightIndexOffset = 0) {
            super();
            this._width = 0;
            this._depth = 0;
            this._minHeight = 0;
            this._maxHeight = 0;
            this._init(width, depth, minHeight, maxHeight, buffer, itemSize, itemHeightIndexOffset);
        }
        _init(width, depth, minHeight, maxHeight, buffer, itemSize = exports.defaultHeightVertexSize, itemHeightIndexOffset = 0) {
            this._width = width;
            this._depth = depth;
            this._maxHeight = minHeight;
            this._maxHeight = maxHeight;
            if (buffer) {
                if (itemSize < itemHeightIndexOffset) {
                    throw new Error("ItemSize can't less or eq ItemHeightIndexOffset");
                }
                if (buffer.length < (width * depth) * itemSize) {
                    throw new Error("Buffer has invalid length");
                }
                this._data = buffer;
                this._itemSize = itemSize;
                this._itemHeightIndexOffset = itemHeightIndexOffset;
            }
            else {
                // TODO: type checker
                this._data = new exports.HeightMapArrType(width * depth * exports.defaultHeightVertexSize);
                this._itemSize = exports.defaultHeightVertexSize;
                this._itemHeightIndexOffset = 0;
            }
        }
        _encodeHeightFactor(store, index, value) {
            store[index] = value;
        }
        _decodeHeightFactor(store, index) {
            return store[index];
        }
        _decodeHeight(store, index, min, max) {
            return this._decodeHeightFactor(store, index) * (max - min) + min;
        }
        _encodeAndSetHeightFactor(store, index, realHeight, min, max) {
            const normalize = Math.max(Math.min(realHeight, max), min);
            const factor = (normalize - min) / (max - min);
            this._encodeHeightFactor(store, index, factor);
            return this._decodeHeightFactor(store, index);
        }
        getIndex(x, z) {
            return (z * this._width + x) * this._itemSize + this._itemHeightIndexOffset;
        }
        getFactor(x, z) {
            const index = this.getIndex(x, z);
            return this._decodeHeightFactor(this._data, index);
        }
        get(x, z) {
            const index = this.getIndex(x, z);
            return this._decodeHeight(this._data, index, this._minHeight, this._maxHeight);
        }
        set(x, z, value) {
            const index = this.getIndex(x, z);
            return this._encodeAndSetHeightFactor(this._data, index, value, this._minHeight, this._maxHeight);
        }
        setMinMaxHeight(minHeight, maxHeight) {
            if (this._minHeight > this._maxHeight) {
                return;
            }
            this._minHeight = minHeight;
            this._maxHeight = maxHeight;
        }
        append(x, z, value) {
            const index = this.getIndex(x, z);
            const oldValue = this._decodeHeight(this._data, index, this._minHeight, this._maxHeight);
            const canValue = oldValue + value;
            return this._encodeAndSetHeightFactor(this._data, index, canValue, this._minHeight, this._maxHeight);
        }
        multiply(x, z, value, heightIfZero = 0) {
            const index = this.getIndex(x, z);
            const oldValue = this._decodeHeight(this._data, index, this._minHeight, this._maxHeight) || heightIfZero;
            const canValue = oldValue * value;
            return this._encodeAndSetHeightFactor(this._data, index, canValue, this._minHeight, this._maxHeight);
        }
    }
    exports.HeightMap = HeightMap;
    exports.default = HeightMap;
});
define("src/TerrainSystem/AbsPatchedHeightMap", ["require", "exports", "src/TerrainSystem/HeightMap"], function (require, exports, HeightMap_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbsPatchedHeightMap = exports.minMaxStackSize = void 0;
    exports.getOrThrowDataChunkSize = getOrThrowDataChunkSize;
    HeightMap_mjs_1 = __importStar(HeightMap_mjs_1);
    exports.minMaxStackSize = 2;
    function getOrThrowDataChunkSize(patchSize, dataChunkSize) {
        if ((dataChunkSize - 1) % (patchSize - 1) !== 0) {
            const recommendedWidth = ((dataChunkSize - 1 + patchSize - 1) / (dataChunkSize - 1)) * (patchSize - 1) + 1;
            console.error("DataChunkSize minus 1 (%d) must be divisible by patchSize minus 1 (%d)\n", dataChunkSize, patchSize);
            console.error("Try using DataChunkSize = %d\n", recommendedWidth);
            throw new Error();
        }
        return dataChunkSize;
    }
    class AbsPatchedHeightMap extends HeightMap_mjs_1.default {
        get patchSize() { return this._patchSize; }
        get numPatchesX() { return this._numPatchesX; }
        get numPatchesZ() { return this._numPatchesZ; }
        get dataChunkSize() { return this._dataChunkSize; }
        get dataNumChunksX() { return this._dataNumChunksX; }
        get dataNumChunksZ() { return this._dataNumChunksZ; }
        get dataChunkSizeFactor() { return this._dataChunkSizeFactor; }
        constructor(width, depth, patchSize, dataChunkSize, minHeight, maxHeight, buffer, itemSize = HeightMap_mjs_1.defaultHeightVertexSize, itemHeightIndexOffset = 0) {
            super(width, depth, minHeight, maxHeight, buffer /** TS huck */, itemSize, itemHeightIndexOffset);
            this._minHeightCoord = [0, 0];
            this._maxHeightCoord = [0, 0];
            this._setPatchSize(patchSize);
            this._setDataChunkSize(dataChunkSize);
            this._clearMinMaxHeightCoords();
        }
        _setPatchSize(patchSize) {
            this._patchSize = patchSize;
            this._numPatchesX = ((this.width - 1) / (this._patchSize - 1)) | 0;
            this._numPatchesZ = ((this.depth - 1) / (this._patchSize - 1)) | 0;
            this._patchesSegmentSize = this._numPatchesX * this._numPatchesZ * exports.minMaxStackSize;
            this._minMaxHeightCoords = new Array(this._patchesSegmentSize * 2);
        }
        _setDataChunkSize(value) {
            this._dataChunkSize = getOrThrowDataChunkSize(this._patchSize, value);
            this._dataNumChunksX = ((this.width - 1) / (this._dataChunkSize - 1)) | 0;
            this._dataNumChunksZ = ((this.depth - 1) / (this._dataChunkSize - 1)) | 0;
            this._dataChunkSizeFactor = this._patchSize / (this._dataChunkSize + this._patchSize - (this._dataChunkSize % this._patchSize));
        }
        getIndex(x, z) {
            const localX = x % this._dataChunkSize;
            const localZ = z % this._dataChunkSize;
            const chunkX = Math.floor(x / this._dataChunkSize);
            const chunkZ = Math.floor(z / this._dataChunkSize);
            const chunkOffset = (chunkZ * this._dataNumChunksX + chunkX) * (Math.pow(this._dataChunkSize, 2));
            const localIndex = (localZ * this._dataChunkSize + localX);
            return chunkOffset + localIndex;
        }
        getChunkIndex(chunkX, chunkZ) {
            return chunkZ * this._dataNumChunksX + chunkX;
        }
        getChunkBuffer(type, chunkX, chunkZ) {
            const size = Math.pow(this.dataChunkSize, 2);
            const chunkLevel = chunkZ * this.dataNumChunksX + chunkX;
            const chunkOffset = chunkLevel * size * this.data.BYTES_PER_ELEMENT;
            const count = size * (this.data.BYTES_PER_ELEMENT / type.BYTES_PER_ELEMENT);
            return new type(this.data.buffer, chunkOffset, count);
        }
        getChunksBuffers(type) {
            const result = new Array(this._dataNumChunksX * this._dataNumChunksZ);
            for (let chunkZ = 0; chunkZ < this._dataNumChunksZ; chunkZ++) {
                for (let chunkX = 0; chunkX < this._dataNumChunksX; chunkX++) {
                    const index = chunkZ * this._dataNumChunksX + chunkX;
                    result[index] = this.getChunkBuffer(type, chunkX, chunkZ);
                }
            }
            return result;
        }
        getEntriesPatchMin(x, z) {
            const patchX = Math.floor(x / this._patchSize);
            const patchZ = Math.floor(z / this._patchSize);
            return this.getPatchMin(patchX, patchZ);
        }
        getEntriesPatchMax(x, z) {
            const patchX = Math.floor(x / this._patchSize);
            const patchZ = Math.floor(z / this._patchSize);
            return this.getPatchMax(patchX, patchZ);
        }
        getEntriesPatchMinFactor(x, z) {
            const patchX = Math.floor(x / this._patchSize);
            const patchZ = Math.floor(z / this._patchSize);
            return this.getPatchMinFactor(patchX, patchZ);
        }
        getEntriesPatchMaxFactor(x, z) {
            const patchX = Math.floor(x / this._patchSize);
            const patchZ = Math.floor(z / this._patchSize);
            return this.getPatchMaxFactor(patchX, patchZ);
        }
        getMin() {
            return this.get(this._minHeightCoord[0], this._minHeightCoord[1]);
        }
        getMax() {
            return this.get(this._maxHeightCoord[0], this._maxHeightCoord[1]);
        }
        getMinFactor() {
            return this.getFactor(this._minHeightCoord[0], this._minHeightCoord[1]);
        }
        getMaxFactor() {
            return this.getFactor(this._maxHeightCoord[0], this._maxHeightCoord[1]);
        }
        getPatchMin(patchBaseX, patchBaseZ) {
            const index = (patchBaseZ * this._numPatchesX + patchBaseX) * exports.minMaxStackSize;
            return this.get(this._minMaxHeightCoords[index], this._minMaxHeightCoords[index + 1]);
        }
        getPatchMax(patchBaseX, patchBaseZ) {
            const index = (patchBaseZ * this._numPatchesX + patchBaseX) * exports.minMaxStackSize + this._patchesSegmentSize;
            return this.get(this._minMaxHeightCoords[index], this._minMaxHeightCoords[index + 1]);
        }
        getPatchMinFactor(patchBaseX, patchBaseZ) {
            const index = (patchBaseZ * this._numPatchesX + patchBaseX) * exports.minMaxStackSize;
            return this.getFactor(this._minMaxHeightCoords[index], this._minMaxHeightCoords[index + 1]);
        }
        getPatchMaxFactor(patchBaseX, patchBaseZ) {
            const index = (patchBaseZ * this._numPatchesX + patchBaseX) * exports.minMaxStackSize + this._patchesSegmentSize;
            return this.getFactor(this._minMaxHeightCoords[index], this._minMaxHeightCoords[index + 1]);
        }
        _clearMinMaxHeightCoords() {
            this._minHeightCoord[0] = 0;
            this._minHeightCoord[1] = 0;
            this._maxHeightCoord[0] = 0;
            this._maxHeightCoord[1] = 0;
            for (let i = 0; i < this._minMaxHeightCoords.length; i++) {
                this._minMaxHeightCoords[i] = 0;
            }
        }
        recalculateAABB() {
            this._minHeightCoord[0] = 0;
            this._minHeightCoord[1] = 0;
            this._maxHeightCoord[0] = 0;
            this._maxHeightCoord[1] = 0;
            let minFactor = 1;
            let maxFactor = 0;
            for (let patchZ = 0; patchZ < this._numPatchesZ; patchZ++) {
                for (let patchX = 0; patchX < this._numPatchesX; patchX++) {
                    const minIndex = (patchZ * this._numPatchesX + patchX) * exports.minMaxStackSize;
                    const maxIndex = minIndex + this._patchesSegmentSize;
                    const patchMinFactor = this.getFactor(this._minMaxHeightCoords[minIndex], this._minMaxHeightCoords[minIndex + 1]);
                    const patchMaxfactor = this.getFactor(this._minMaxHeightCoords[maxIndex], this._minMaxHeightCoords[maxIndex + 1]);
                    if (minFactor > patchMinFactor) {
                        minFactor = patchMinFactor;
                        this._minHeightCoord[0] = this._minMaxHeightCoords[minIndex];
                        this._minHeightCoord[1] = this._minMaxHeightCoords[minIndex + 1];
                    }
                    if (maxFactor < patchMaxfactor) {
                        maxFactor = patchMaxfactor;
                        this._maxHeightCoord[0] = this._minMaxHeightCoords[maxIndex];
                        this._maxHeightCoord[1] = this._minMaxHeightCoords[maxIndex + 1];
                    }
                }
            }
        }
        recalculateMinMax(zone) {
            if (zone.maxX < 0)
                return;
            if (zone.maxZ < 0)
                return;
            const fixedMinX = Math.max(zone.minX, 0);
            const fixedMinZ = Math.max(zone.minZ, 0);
            const fixedMaxX = Math.min(zone.maxX, this.width);
            const fixedMaxZ = Math.min(zone.maxZ, this.depth);
            for (let z = fixedMinZ; z < fixedMaxZ; z += this._patchSize) {
                for (let x = fixedMinX; x < fixedMaxX; x += this._patchSize) {
                    const patchX = Math.floor(x / this._patchSize);
                    const patchZ = Math.floor(z / this._patchSize);
                    const patchI = patchZ * this._numPatchesX + patchX;
                    const minIndex = patchI * exports.minMaxStackSize;
                    const maxIndex = minIndex + this._patchesSegmentSize;
                    const firstPatchX = patchX * this._patchSize;
                    const firstPatchZ = patchZ * this._patchSize;
                    const lastPatchX = firstPatchX + this._patchSize;
                    const lastPatchZ = firstPatchZ + this._patchSize;
                    let min = Number.MAX_SAFE_INTEGER;
                    let max = Number.MIN_SAFE_INTEGER;
                    let minX = firstPatchX;
                    let minZ = firstPatchZ;
                    let maxX = firstPatchX;
                    let maxZ = firstPatchZ;
                    for (let innerZ = firstPatchZ + 1; innerZ < lastPatchZ; innerZ++) {
                        for (let innerX = firstPatchX + 1; innerX < lastPatchX; innerX++) {
                            const factor = this.getFactor(innerX, innerZ);
                            if (min > factor) {
                                min = factor;
                                minX = innerX;
                                minZ = innerZ;
                            }
                            if (max < factor) {
                                max = factor;
                                maxX = innerX;
                                maxZ = innerZ;
                            }
                        }
                    }
                    this._minMaxHeightCoords[minIndex] = minX;
                    this._minMaxHeightCoords[minIndex + 1] = minZ;
                    this._minMaxHeightCoords[maxIndex] = maxX;
                    this._minMaxHeightCoords[maxIndex + 1] = maxZ;
                }
            }
        }
    }
    exports.AbsPatchedHeightMap = AbsPatchedHeightMap;
    exports.default = AbsPatchedHeightMap;
});
define("src/TerrainSystem/LodInfo", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LodInfo = exports.BOTTOM = exports.TOP = exports.RIGHT = exports.LEFT = void 0;
    exports.initInfo = initInfo;
    exports.LEFT = 2;
    exports.RIGHT = 2;
    exports.TOP = 2;
    exports.BOTTOM = 2;
    function initInfo() {
        const arr = [];
        for (let l = 0; l < exports.LEFT; l++) {
            arr[l] = [];
            for (let r = 0; r < exports.RIGHT; r++) {
                arr[l][r] = [];
                for (let t = 0; t < exports.TOP; t++) {
                    arr[l][r][t] = [];
                    for (let b = 0; b < exports.BOTTOM; b++) {
                        arr[l][r][t][b] = {
                            start: 0,
                            count: 0
                        };
                    }
                }
            }
        }
        return arr;
    }
    class LodInfo {
        constructor() {
            this.info = initInfo();
        }
        clear() {
            for (let l = 0; l < exports.LEFT; l++) {
                for (let r = 0; r < exports.RIGHT; r++) {
                    for (let t = 0; t < exports.TOP; t++) {
                        for (let b = 0; b < exports.BOTTOM; b++) {
                            const single = this.info[l][r][t][b];
                            single.start = 0;
                            single.count = 0;
                        }
                    }
                }
            }
        }
    }
    exports.LodInfo = LodInfo;
    exports.default = LodInfo;
});
define("src/Shared/Store2D", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ObjStore2D = exports.AbsStore2D = void 0;
    class AbsStore2D {
        constructor() {
            this._cols = 0;
            this._rows = 0;
        }
        init(cols, rows) {
            this._cols = cols;
            this._rows = rows;
            const size = cols * rows;
            this._p = this._initArrayType(size);
        }
        initByVal(cols, rows, val) {
            this.init(cols, rows);
            const size = cols * rows;
            const valIsFunc = typeof val === 'function';
            for (let i = 0; i < size; i++) {
                this._p[i] = valIsFunc ? val() : val;
            }
        }
        initByStore(cols, rows, val) {
            this._cols = cols;
            this._rows = rows;
            this._p = val;
        }
        addr() {
            return this._p;
        }
        size() {
            return this._rows * this._cols;
        }
        get(col, row) {
            return this._p[row * this._cols + col];
        }
        set(col, row, value) {
            this._p[row * this._cols + col] = value;
        }
        getByIndex(index) {
            return this._p[index];
        }
        setByIndex(index, value) {
            this._p[index] = value;
        }
    }
    exports.AbsStore2D = AbsStore2D;
    class ObjStore2D extends AbsStore2D {
        _initArrayType(size) {
            return new Array(size);
        }
    }
    exports.ObjStore2D = ObjStore2D;
});
define("src/Shared/Vector3Math", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.set = set;
    exports.distance = distance;
    exports.distanceV3XYZ = distanceV3XYZ;
    exports.distanceX1Y1Z1X2Y2Z2 = distanceX1Y1Z1X2Y2Z2;
    exports.normalize = normalize;
    exports.normalizeRef = normalizeRef;
    exports.add = add;
    exports.addRef = addRef;
    exports.subtract = subtract;
    exports.cross = cross;
    /**
     * Sets the specified 3-dimensional vector to the supplied numerical values.
     */
    function set(to, x, y, z) {
        to.x = x;
        to.y = y;
        to.z = z;
        return to;
    }
    /**
     * Returns the Euclidean distance between the two given points.
     */
    function distance(value1, value2) {
        const dx = value1.x - value2.x;
        const dy = value1.y - value2.y;
        const dz = value1.z - value2.z;
        const ls = dx * dx + dy * dy + dz * dz;
        return Math.sqrt(ls);
    }
    /**
     * Returns the Euclidean distance between the two given points.
     */
    function distanceV3XYZ(value1, x, y, z) {
        const dx = value1.x - x;
        const dy = value1.y - y;
        const dz = value1.z - z;
        const ls = dx * dx + dy * dy + dz * dz;
        return Math.sqrt(ls);
    }
    /**
     * Returns the Euclidean distance between the two given points.
     */
    function distanceX1Y1Z1X2Y2Z2(x1, y1, z1, x2, y2, z2) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        const dz = z1 - z2;
        const ls = dx * dx + dy * dy + dz * dz;
        return Math.sqrt(ls);
    }
    /**
     * Returns a vector with the same direction as the given vector, but with a length of 1.
     */
    function normalize(value, out) {
        const ls = value.x * value.x + value.y * value.y + value.z * value.z;
        const length = Math.sqrt(ls);
        return set(out, value.x / length, value.y / length, value.z / length);
    }
    /**
     * Update the vector with the same direction as the given vector, but with a length of 1.
     */
    function normalizeRef(refValue) {
        const ls = refValue.x * refValue.x + refValue.y * refValue.y + refValue.z * refValue.z;
        const length = Math.sqrt(ls);
        refValue.x /= length;
        refValue.y /= length;
        refValue.z /= length;
        return refValue;
    }
    /**
     * Adds two vectors.
     */
    function add(left, right, out) {
        return set(out, left.x + right.x, left.y + right.y, left.z + right.z);
    }
    /**
     * Adds two vectors.
     */
    function addRef(refLeft, right) {
        return add(refLeft, right, refLeft);
    }
    /**
     * Subtracts the second vector from the first.
     */
    function subtract(left, right, out) {
        return set(out, left.x - right.x, left.y - right.y, left.z - right.z);
    }
    /**
     * Computes the cross product of two vectors.
     */
    function cross(vector1, vector2, out) {
        return set(out, vector1.y * vector2.z - vector1.z * vector2.y, vector1.z * vector2.x - vector1.x * vector2.z, vector1.x * vector2.y - vector1.y * vector2.x);
    }
    exports.default = {
        set,
        normalize,
        normalizeRef,
        add,
        subtract,
        addRef,
        distance,
        distanceV3XYZ,
        distanceX1Y1Z1X2Y2Z2,
        cross
    };
});
define("src/TerrainSystem/LodManager", ["require", "exports", "src/Shared/Store2D", "src/Shared/Utils", "src/Shared/Vector3Math"], function (require, exports, Store2D_mjs_1, Utils_mjs_1, Vector3Math_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LodManager = exports.defaultPatchLod = exports.getLodHash = void 0;
    Vector3Math_mjs_1 = __importDefault(Vector3Math_mjs_1);
    const getLodHash = (lod) => {
        return 17 * lod.core * 31 * lod.top * 31 * lod.left * 31 * lod.bottom * 31 * lod.right;
    };
    exports.getLodHash = getLodHash;
    exports.defaultPatchLod = {
        distance: 0,
        core: 0,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    };
    const getZeroPatchLod = () => ({
        distance: 0,
        core: 0,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    });
    class LodManager {
        get zFar() { return this._zFar; }
        get maxLOD() { return this._maxLOD; }
        constructor(zFar, patchSize, numPatchesX, numPatchesZ) {
            this.setParams(zFar, patchSize, numPatchesX, numPatchesZ);
        }
        setZFar(zFar) {
            this._zFar = zFar;
            this._calcLodRegions();
        }
        setParams(zFar, patchSize, numPatchesX, numPatchesZ) {
            this._patchSize = patchSize;
            this._numPatchesX = numPatchesX;
            this._numPatchesZ = numPatchesZ;
            this._calcMaxLOD();
            this._map = new Store2D_mjs_1.ObjStore2D();
            this._map.initByVal(numPatchesX, numPatchesZ, getZeroPatchLod);
            this._regions = new Array(this._maxLOD + 1);
            this.setZFar(zFar);
        }
        _calcMaxLOD() {
            const numSegments = this._patchSize - 1;
            const numSegmentsLog2 = Math.log2(numSegments);
            const numSegmentsLog2Ceil = Math.ceil(numSegmentsLog2);
            const numSegmentsLog2Floor = Math.floor(numSegmentsLog2);
            if (numSegmentsLog2Ceil !== numSegmentsLog2Floor) {
                throw new Error("The number of vertices in the patch minus one must be a power of two\n");
            }
            const patchSizeLog2 = numSegmentsLog2Floor;
            this._maxLOD = patchSizeLog2 - 1;
        }
        _calcLodRegions() {
            // TODO: We can use the ring system to determine the LOD.
            // TODO: Based on the heights we can calculate the optimal lods
            let sum = 0;
            for (let i = 0; i < this._maxLOD + 1; i++) {
                sum += i + 1;
            }
            let x = this._zFar / sum;
            let temp = 0;
            for (let i = 0; i < this._maxLOD + 1; i++) {
                const curRange = (x * (i + 1)) | 0;
                this._regions[i] = temp + curRange;
                temp += curRange;
            }
        }
        printLodMap() {
            let str = '';
            const maxLodMaxZ = this._numPatchesZ - 1;
            const maxLodMaxX = this._numPatchesX;
            let maxCore = 0;
            for (let lodMapZ = maxLodMaxZ; lodMapZ >= 0; lodMapZ--) {
                for (let lodMapX = 0; lodMapX < maxLodMaxX; lodMapX++) {
                    const value = this._map.get(lodMapX, lodMapZ).core;
                    if (maxCore < value) {
                        maxCore = value;
                    }
                }
            }
            const lodMaxNumberCount = maxLodMaxZ.toString().length;
            const coreMaxNumberCount = maxCore.toString().length;
            for (let lodMapZ = maxLodMaxZ; lodMapZ >= 0; lodMapZ--) {
                str += (0, Utils_mjs_1.getText)(lodMapZ, lodMaxNumberCount, ' ') + ': ';
                for (let lodMapX = 0; lodMapX < maxLodMaxX; lodMapX++) {
                    const value = this._map.get(lodMapX, lodMapZ).core;
                    str += (0, Utils_mjs_1.getText)(value, coreMaxNumberCount, ' ') + ' ';
                }
                str += '\n';
            }
            console.log(str);
        }
        distanceToLod(distance) {
            let lod = this._maxLOD;
            for (let i = 0; i < this._maxLOD; i++) {
                if (distance < this._regions[i]) {
                    lod = i;
                    break;
                }
            }
            return lod;
        }
        getPatchLod(patchX, patchZ) {
            return this._map.get(patchX, patchZ);
        }
        getPatchLodByIndex(index) {
            return this._map.getByIndex(index);
        }
        update(cameraPos, heightMap, center = true) {
            const a = this.updateLodMapPass1(cameraPos, heightMap, center);
            const b = this.updateLodMapPass2();
            return a || b;
        }
        updateLodMapPass1(cameraPos, heightMap, center) {
            let hasChange = false;
            const centerStep = this._patchSize / 2 | 0;
            const halfWidth = heightMap.width / 2;
            const halfDepth = heightMap.depth / 2;
            for (let lodMapZ = 0; lodMapZ < this._numPatchesZ; lodMapZ++) {
                for (let lodMapX = 0; lodMapX < this._numPatchesX; lodMapX++) {
                    const x = lodMapX * (this._patchSize - 1) + centerStep;
                    const z = lodMapZ * (this._patchSize - 1) + centerStep;
                    const patchCenterX = center ? -halfWidth + x : x;
                    const patchCenterY = (heightMap.getPatchMax(lodMapX, lodMapZ) + heightMap.getPatchMin(lodMapX, lodMapZ)) / 2;
                    const patchCenterZ = center ? -halfDepth + z : z;
                    const distanceToCamera = Vector3Math_mjs_1.default.distanceV3XYZ(cameraPos, patchCenterX, patchCenterY, patchCenterZ);
                    //const distanceToCamera = Vector2Math.distanceX1Z1X2Z2(cameraPos.x, cameraPos.z, patchCenterX, patchCenterZ);
                    const coreLod = this.distanceToLod(distanceToCamera);
                    const pPatchLOD = this._map.get(lodMapX, lodMapZ);
                    if (pPatchLOD.core !== coreLod) {
                        hasChange = true;
                    }
                    pPatchLOD.distance = distanceToCamera;
                    pPatchLOD.core = coreLod;
                }
            }
            return hasChange;
        }
        updateLodMapPass2() {
            let hasChange = false;
            for (let lodMapZ = 0; lodMapZ < this._numPatchesZ; lodMapZ++) {
                for (let lodMapX = 0; lodMapX < this._numPatchesX; lodMapX++) {
                    const item = this._map.get(lodMapX, lodMapZ);
                    const coreLod = item.core;
                    let indexLeft = lodMapX;
                    let indexRight = lodMapX;
                    let indexTop = lodMapZ;
                    let indexBottom = lodMapZ;
                    if (lodMapX > 0) {
                        indexLeft--;
                        const prev = item.left;
                        const next = this._map.get(indexLeft, lodMapZ).core > coreLod ? 1 : 0;
                        item.left = next;
                        if (prev !== next) {
                            hasChange = true;
                        }
                    }
                    if (lodMapX < this._numPatchesX - 1) {
                        indexRight++;
                        const prev = item.right;
                        const next = this._map.get(indexRight, lodMapZ).core > coreLod ? 1 : 0;
                        item.right = next;
                        if (prev !== next) {
                            hasChange = true;
                        }
                    }
                    if (lodMapZ > 0) {
                        indexBottom--;
                        const prev = item.bottom;
                        const next = this._map.get(lodMapX, indexBottom).core > coreLod ? 1 : 0;
                        item.bottom = next;
                        if (prev !== next) {
                            hasChange = true;
                        }
                    }
                    if (lodMapZ < this._numPatchesZ - 1) {
                        indexTop++;
                        const prev = item.top;
                        const next = this._map.get(lodMapX, indexTop).core > coreLod ? 1 : 0;
                        item.top = next;
                        if (prev !== next) {
                            hasChange = true;
                        }
                    }
                }
            }
            return hasChange;
        }
    }
    exports.LodManager = LodManager;
    exports.default = LodManager;
});
define("src/TerrainSystem/GridBuilder", ["require", "exports", "src/TerrainSystem/LodInfo", "src/TerrainSystem/LodManager"], function (require, exports, LodInfo_mjs_1, LodManager_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GridBuilder = void 0;
    LodManager_mjs_1 = __importDefault(LodManager_mjs_1);
    class GridBuilder {
        get zFar() { return this._lodManager.zFar; }
        get width() { return this._grid.width; }
        get depth() { return this._grid.depth; }
        get patchSize() { return this._grid.patchSize; }
        get numPatchesX() { return this._grid.numPatchesX; }
        get numPatchesZ() { return this._grid.numPatchesZ; }
        get maxLOD() { return this.lodManager.maxLOD; }
        get patchIndices() { return this._indices; }
        get lodManager() { return this._lodManager; }
        get lodInfo() { return this._lodInfo; }
        constructor(grid, zFar) {
            this._grid = grid;
            const width = grid.width;
            const depth = grid.depth;
            const patchSize = grid.patchSize;
            const numPatchesX = grid.numPatchesX;
            const numPatchesZ = grid.numPatchesZ;
            if (width >= 0xffff) {
                console.error("Max width = %d\n", 0xffff - 1);
                throw new Error();
            }
            if (depth >= 0xffff) {
                console.error("Max depth = %d\n", 0xffff - 1);
                throw new Error();
            }
            if ((width - 1) % (patchSize - 1) !== 0) {
                const recommendedWidth = ((width - 1 + patchSize - 1) / (patchSize - 1)) * (patchSize - 1) + 1;
                console.error("Width minus 1 (%d) must be divisible by patchSize minus 1 (%d)\n", width, patchSize);
                console.error("Try using Width = %d\n", recommendedWidth);
                throw new Error();
            }
            if ((depth - 1) % (patchSize - 1) !== 0) {
                const recommendedDepth = ((depth - 1 + patchSize - 1) / (patchSize - 1)) * (patchSize - 1) + 1;
                console.error("Depth minus 1 (%d) must be divisible by patchSize minus 1 (%d)\n", depth, patchSize);
                console.error("Try using Width = %d\n", recommendedDepth);
                throw new Error();
            }
            if (patchSize < 3) {
                console.error("The minimum patch size is 3 (%d)\n", patchSize);
                throw new Error();
            }
            if (patchSize % 2 === 0) {
                console.error("Patch size must be an odd number (%d)\n", patchSize);
                throw new Error();
            }
            this._buildLodsAndIndices(zFar, patchSize, numPatchesX, numPatchesZ);
        }
        setZFar(zFar) {
            this._lodManager.setZFar(zFar);
        }
        _buildLodsAndIndices(zFar, patchSize, numPatchesX, numPatchesZ) {
            this._lodManager = new LodManager_mjs_1.default(zFar, patchSize, numPatchesX, numPatchesZ);
            this._lodInfo = new Array(this._lodManager.maxLOD + 1);
            for (let i = 0; i < this._lodInfo.length; i++) {
                this._lodInfo[i] = new LodInfo_mjs_1.LodInfo();
            }
            let numIndices = this._calcNumIndices();
            this._indices = new Uint32Array(numIndices);
            numIndices = this._initIndices(this._indices);
            //console.log("Final number of indices %d\n", numIndices);
        }
        _calcNumIndices() {
            let numQuads = (this.patchSize - 1) * (this.patchSize - 1);
            let numIndices = 0;
            const maxPermutationsPerLevel = 16; // true/false for each of the four sides
            const indicesPerQuad = 6; // two triangles
            for (let lod = 0; lod <= this.maxLOD; lod++) {
                //console.log("LOD %d: num quads %d\n", lod, numQuads);
                numIndices += numQuads * indicesPerQuad * maxPermutationsPerLevel;
                numQuads /= 4;
            }
            //console.log("Initial number of indices %d\n", numIndices);
            return numIndices;
        }
        _initIndices(indices) {
            let index = 0;
            for (let lod = 0; lod <= this.maxLOD; lod++) {
                //console.log("*** Init indices lod %d ***\n", lod);
                index = this._initIndicesLOD(index, indices, lod);
            }
            return index;
        }
        _initIndicesLOD(index, indices, lod) {
            let totalIndicesForLOD = 0;
            for (let l = 0; l < LodInfo_mjs_1.LEFT; l++) {
                for (let r = 0; r < LodInfo_mjs_1.RIGHT; r++) {
                    for (let t = 0; t < LodInfo_mjs_1.TOP; t++) {
                        for (let b = 0; b < LodInfo_mjs_1.BOTTOM; b++) {
                            const info = this._lodInfo[lod].info[l][r][t][b];
                            info.start = index;
                            index = this._initIndicesLODSingle(index, indices, lod, lod + l, lod + r, lod + t, lod + b);
                            info.count = index - info.start;
                            totalIndicesForLOD += info.count;
                        }
                    }
                }
            }
            //console.log("Total indices for LOD: %d\n", totalIndicesForLOD);
            return index;
        }
        _initIndicesLODSingle(index, indices, lodCore, lodLeft, lodRight, lodTop, lodBottom) {
            const width = this.patchSize;
            const fanStep = Math.pow(2, lodCore + 1); // lod = 0 --> 2, lod = 1 --> 4, lod = 2 --> 8, etc
            const endPos = this.patchSize - 1 - fanStep; // patch size 5, fan step 2 --> EndPos = 2; patch size 9, fan step 2 --> EndPos = 6
            for (let z = 0; z <= endPos; z += fanStep) {
                for (let x = 0; x <= endPos; x += fanStep) {
                    const lLeft = x == 0 ? lodLeft : lodCore;
                    const lRight = x == endPos ? lodRight : lodCore;
                    const lBottom = z == 0 ? lodBottom : lodCore;
                    const lTop = z == endPos ? lodTop : lodCore;
                    index = this._createTriangleFan(index, indices, lodCore, lLeft, lRight, lTop, lBottom, x, z, width);
                }
            }
            return index;
        }
        _createTriangleFan(index, indices, lodCore, lodLeft, lodRight, lodTop, lodBottom, x, z, width) {
            const stepLeft = Math.pow(2, lodLeft); // because LOD starts at zero...
            const stepRight = Math.pow(2, lodRight);
            const stepTop = Math.pow(2, lodTop);
            const stepBottom = Math.pow(2, lodBottom);
            const stepCenter = Math.pow(2, lodCore);
            const indexCenter = (z + stepCenter) * width + x + stepCenter;
            // first up
            let indexTemp1 = z * width + x;
            let indexTemp2 = (z + stepLeft) * width + x;
            index = this._addTriangle(index, indices, indexCenter, indexTemp1, indexTemp2);
            // second up
            if (lodLeft == lodCore) {
                indexTemp1 = indexTemp2;
                indexTemp2 += stepLeft * width;
                index = this._addTriangle(index, indices, indexCenter, indexTemp1, indexTemp2);
            }
            // first right
            indexTemp1 = indexTemp2;
            indexTemp2 += stepTop;
            index = this._addTriangle(index, indices, indexCenter, indexTemp1, indexTemp2);
            // second right
            if (lodTop === lodCore) {
                indexTemp1 = indexTemp2;
                indexTemp2 += stepTop;
                index = this._addTriangle(index, indices, indexCenter, indexTemp1, indexTemp2);
            }
            // first down
            indexTemp1 = indexTemp2;
            indexTemp2 -= stepRight * width;
            index = this._addTriangle(index, indices, indexCenter, indexTemp1, indexTemp2);
            // second down
            if (lodRight === lodCore) {
                indexTemp1 = indexTemp2;
                indexTemp2 -= stepRight * width;
                index = this._addTriangle(index, indices, indexCenter, indexTemp1, indexTemp2);
            }
            // first left
            indexTemp1 = indexTemp2;
            indexTemp2 -= stepBottom;
            index = this._addTriangle(index, indices, indexCenter, indexTemp1, indexTemp2);
            // second left
            if (lodBottom === lodCore) {
                indexTemp1 = indexTemp2;
                indexTemp2 -= stepBottom;
                index = this._addTriangle(index, indices, indexCenter, indexTemp1, indexTemp2);
            }
            return index;
        }
        _addTriangle(index, indices, v1, v2, v3) {
            indices[index++] = v1;
            indices[index++] = v2;
            indices[index++] = v3;
            return index;
        }
        destroy() {
            // TODO
        }
    }
    exports.GridBuilder = GridBuilder;
    exports.default = GridBuilder;
});
define("src/TerrainSystem/GeomipGridBuilder", ["require", "exports", "src/TerrainSystem/CoordsBuffer", "src/TerrainSystem/GridBuilder"], function (require, exports, CoordsBuffer_mjs_1, GridBuilder_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GeomipGridBuilder = void 0;
    GridBuilder_mjs_1 = __importDefault(GridBuilder_mjs_1);
    class GeomipGridBuilder extends GridBuilder_mjs_1.default {
        get patchVertices() { return this._vertices; }
        get heightMap() { return this._heightMap; }
        constructor(heightMap, zFar) {
            super(heightMap, zFar);
            this._heightMap = heightMap;
            this._vertices = new CoordsBuffer_mjs_1.CoordsBuffer(this._heightMap, this._heightMap.patchSize);
            this._vertices.init();
        }
    }
    exports.GeomipGridBuilder = GeomipGridBuilder;
    exports.default = GeomipGridBuilder;
});
define("src/TerrainSystem/GeomipGridRenderPreparer", ["require", "exports", "src/TerrainSystem/GeomipGridBuilder", "src/TerrainSystem/LodManager"], function (require, exports, GeomipGridBuilder_mjs_1, LodManager_mjs_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GeomipGridRenderPreparer = void 0;
    GeomipGridBuilder_mjs_1 = __importDefault(GeomipGridBuilder_mjs_1);
    class GeomipGridRenderPreparer extends GeomipGridBuilder_mjs_1.default {
        initPatches(initializer) {
            for (let patchZ = 0; patchZ < this.numPatchesZ; patchZ++) {
                for (let patchX = 0; patchX < this.numPatchesX; patchX++) {
                    const minX = patchX * (this.patchSize - 1);
                    const minZ = patchZ * (this.patchSize - 1);
                    const info = this.lodInfo[0].info[0][0][0][0];
                    const baseIndex = info.start;
                    const baseVertex = minZ * this.width + minX;
                    initializer.initPatch(baseIndex, baseVertex, info.count, patchX, patchZ, minX, minZ, this.patchSize, LodManager_mjs_2.defaultPatchLod);
                }
            }
        }
        printLodMap() {
            this.lodManager.printLodMap();
        }
        updateLods(localCameraPos, center = true) {
            this.lodManager.update(localCameraPos, this.heightMap, center);
        }
        eachPatches(renderPreparer, frustum) {
            const patchSizeNorm = this.patchSize - 1;
            for (let patchZ = 0; patchZ < this.numPatchesZ; patchZ++) {
                const minZ = patchZ * patchSizeNorm;
                for (let patchX = 0; patchX < this.numPatchesX; patchX++) {
                    const minX = patchX * patchSizeNorm;
                    const visible = !!frustum && this._isPatchInsideViewFrustumBySphere(patchX, patchZ, frustum);
                    const plod = this.lodManager.getPatchLod(patchX, patchZ);
                    const C = plod.core;
                    const L = plod.left;
                    const R = plod.right;
                    const T = plod.top;
                    const B = plod.bottom;
                    const info = this.lodInfo[C].info[L][R][T][B];
                    const baseIndex = info.start;
                    const baseVertex = minZ * this.width + minX;
                    renderPreparer.preparePatch(visible, baseIndex, baseVertex, info.count, patchX, patchZ, minX, minZ, this.patchSize, plod);
                }
            }
        }
        _isPatchInsideViewFrustumBySphere(patchBaseX, patchBaseZ, frustum) {
            const patchMinHeight = this.heightMap.getPatchMin(patchBaseX, patchBaseZ);
            const patchMaxHeight = this.heightMap.getPatchMax(patchBaseX, patchBaseZ);
            const patchRadius = this.patchSize / 2;
            const patchHeightRadius = patchMaxHeight - patchMinHeight;
            const patchCenterX = (patchBaseX * this.patchSize) + patchRadius;
            const patchCenterY = (patchMaxHeight + patchMinHeight) / 2;
            const patchCenterZ = (patchBaseZ * this.patchSize) + patchRadius;
            const radius = (patchRadius > patchHeightRadius ? patchRadius : patchHeightRadius) * Math.SQRT2;
            // center the patches relative to the entity center
            const patchCenteredX = (-this.width / 2) + patchCenterX;
            const patchCenteredZ = (-this.depth / 2) + patchCenterZ;
            return frustum.containsSphere(patchCenteredX, patchCenterY, patchCenteredZ, radius);
        }
    }
    exports.GeomipGridRenderPreparer = GeomipGridRenderPreparer;
    exports.default = GeomipGridRenderPreparer;
});
define("src/TerrainSystem/GeomipGrid", ["require", "exports", "src/TerrainSystem/GeomipGridRenderPreparer"], function (require, exports, GeomipGridRenderPreparer_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GeomipGrid = void 0;
    GeomipGridRenderPreparer_mjs_1 = __importDefault(GeomipGridRenderPreparer_mjs_1);
    class GeomipGrid extends GeomipGridRenderPreparer_mjs_1.default {
        setHeight(x, z, value) {
            this._heightMap.set(x, z, value);
        }
        appendToHeight(x, z, value) {
            this._heightMap.append(x, z, value);
        }
        multiplyToHeight(x, z, value, defaultHeight = 0) {
            this._heightMap.multiply(x, z, value, defaultHeight);
        }
        smoothHeightsZone(zone, np, radius) {
            this._heightMap.smoothZone(zone, np, radius);
        }
        loadHeightMapFromFile(buffer_1, options_1) {
            return __awaiter(this, arguments, void 0, function* (buffer, options, np = -1, radius = 0) {
                const header = yield this._heightMap.fromFile(buffer, options);
                this._heightMap.smooth(np, radius);
                this._heightMap.recalculateMinMax(this._heightMap);
                this._heightMap.recalculateAABB();
                return header;
            });
        }
        loadHeightMapFromImg(img, np = -1, radius = 0) {
            this._heightMap.fromImage(img);
            this._heightMap.smooth(np, radius);
            this._heightMap.recalculateMinMax(this._heightMap);
            this._heightMap.recalculateAABB();
        }
        normalizeHeightMap(minHeight, maxHeight) {
            minHeight !== null && minHeight !== void 0 ? minHeight : (minHeight = this._heightMap.minHeight);
            maxHeight !== null && maxHeight !== void 0 ? maxHeight : (maxHeight = this._heightMap.maxHeight);
            this._heightMap.normalize(minHeight, maxHeight);
        }
        setMinMaxHeight(minHeight, maxHeight) {
            this._heightMap.setMinMaxHeight(minHeight, maxHeight);
        }
        appendHeightMap(heightMap, value, zone, minHeight = null, maxHeight = null) {
            this._heightMap.combineHeights('+', heightMap, value, zone, 0, minHeight, maxHeight);
        }
        recalculateMinMax(zone, aabb = true) {
            this._heightMap.recalculateMinMax(zone);
            if (aabb) {
                this._heightMap.recalculateAABB();
            }
        }
    }
    exports.GeomipGrid = GeomipGrid;
    exports.default = GeomipGrid;
});
define("src/TerrainSystem/Terrain", ["require", "exports", "src/TerrainSystem/GeomipGrid"], function (require, exports, GeomipGrid_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseTerrain = void 0;
    GeomipGrid_mjs_1 = __importDefault(GeomipGrid_mjs_1);
    class BaseTerrain extends GeomipGrid_mjs_1.default {
        get minHeight() { return this.heightMap.minHeight; }
        get maxHeight() { return this.heightMap.maxHeight; }
    }
    exports.BaseTerrain = BaseTerrain;
    exports.default = BaseTerrain;
});
define("src/TerrainSystem/MidpointDispTerrain", ["require", "exports", "src/Shared/Utils", "src/TerrainSystem/Terrain"], function (require, exports, Utils_mjs_2, Terrain_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MidpointDispTerrain = void 0;
    Terrain_mjs_1 = __importDefault(Terrain_mjs_1);
    class MidpointDispTerrain extends Terrain_mjs_1.default {
        createMidpointDisplacement(roughness) {
            if (roughness < 0.0) {
                throw Error("roughness must be positive");
            }
            this._createMidpointDisplacementF32(roughness);
            this.normalizeHeightMap();
        }
        _createMidpointDisplacementF32(roughness) {
            let rectSize = (0, Utils_mjs_2.calcNextPowerOfTwo)(this.width);
            let curHeight = rectSize / 2.0;
            const heightReduce = Math.pow(2.0, -roughness);
            while (rectSize > 0) {
                this._diamondStep(rectSize, curHeight);
                this._squareStep(rectSize, curHeight);
                rectSize = (rectSize / 2) | 0;
                curHeight *= heightReduce;
            }
        }
        _diamondStep(rectSize, curHeight) {
            const HalfRectSize = Math.floor(rectSize / 2);
            for (let y = 0; y < this.depth; y += rectSize) {
                for (let x = 0; x < this.width; x += rectSize) {
                    let nextX = (x + rectSize) % this.width;
                    let nextY = (y + rectSize) % this.depth;
                    if (nextX < x) {
                        nextX = this.width - 1;
                    }
                    if (nextY < y) {
                        nextY = this.depth - 1;
                    }
                    const topLeft = this.heightMap.get(x, y);
                    const topRight = this.heightMap.get(nextX, y);
                    const bottomLeft = this.heightMap.get(x, nextY);
                    const bottomRight = this.heightMap.get(nextX, nextY);
                    const midX = (x + HalfRectSize) % this.width;
                    const midY = (y + HalfRectSize) % this.depth;
                    const randValue = (0, Utils_mjs_2.randomFloatRange)(curHeight, -curHeight);
                    const midPoint = (topLeft + topRight + bottomLeft + bottomRight) / 4.0;
                    this.setHeight(midX, midY, midPoint + randValue);
                }
            }
        }
        _squareStep(rectSize, curHeight) {
            const halfRectSize = (rectSize / 2) | 0;
            for (let y = 0; y < this.depth; y += rectSize) {
                for (let x = 0; x < this.width; x += rectSize) {
                    let nextX = (x + rectSize) % this.width;
                    let nextY = (y + rectSize) % this.depth;
                    if (nextX < x) {
                        nextX = this.width - 1;
                    }
                    if (nextY < y) {
                        nextY = this.depth - 1;
                    }
                    const midX = (x + halfRectSize) % this.width;
                    const midY = (y + halfRectSize) % this.depth;
                    const prevMidX = (x - halfRectSize + this.width) % this.width;
                    const prevMidY = (y - halfRectSize + this.depth) % this.depth;
                    const curTopLeft = this.heightMap.get(x, y);
                    const curTopRight = this.heightMap.get(nextX, y);
                    const curCenter = this.heightMap.get(midX, midY);
                    const prevYCenter = this.heightMap.get(midX, prevMidY);
                    const curBotLeft = this.heightMap.get(x, nextY);
                    const prevXCenter = this.heightMap.get(prevMidX, midY);
                    const curLeftMid = (curTopLeft + curCenter + curBotLeft + prevXCenter) / 4.0 + (0, Utils_mjs_2.randomFloatRange)(-curHeight, curHeight);
                    const curTopMid = (curTopLeft + curCenter + curTopRight + prevYCenter) / 4.0 + (0, Utils_mjs_2.randomFloatRange)(-curHeight, curHeight);
                    this.setHeight(midX, y, curTopMid);
                    this.setHeight(x, midY, curLeftMid);
                }
            }
        }
    }
    exports.MidpointDispTerrain = MidpointDispTerrain;
});
define("src/TerrainSystem/TerrainRaycastResult", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerrainRaycastResult = void 0;
    class TerrainRaycastResult {
        constructor() {
            this.vertexIndex = 0;
            this.distance = Number.MAX_VALUE;
            this.localNormal = new pc.Vec3(0, 1, 0);
            this.normal = new pc.Vec3(0, 1, 0);
            this.localPoint = new pc.Vec3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
            this.point = new pc.Vec3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        }
        clear() {
            this.vertexIndex = 0;
            this.distance = Number.MAX_VALUE;
            this.localNormal.set(0, 1, 0);
            this.normal.set(0, 1, 0);
            this.localPoint.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
            this.point.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        }
    }
    exports.TerrainRaycastResult = TerrainRaycastResult;
    exports.default = TerrainRaycastResult;
});
define("src/TerrainSystem/PatchInstancing", ["require", "exports", "src/TerrainSystem/LodInfo"], function (require, exports, LodInfo_mjs_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PatchInstancing = exports.TInstCoordsOffsetArrType = exports.instDataSize = void 0;
    exports.instDataSize = 2;
    exports.TInstCoordsOffsetArrType = Uint16Array;
    class PatchInstancing {
        get patchCount() { return this._patchCount; }
        constructor() {
            this.data = [];
            this._patchCount = 0;
        }
        forEach(fn) {
            for (let c = 0; c < this.data.length; c++) {
                for (let l = 0; l < LodInfo_mjs_2.LEFT; l++) {
                    for (let r = 0; r < LodInfo_mjs_2.RIGHT; r++) {
                        for (let t = 0; t < LodInfo_mjs_2.TOP; t++) {
                            for (let b = 0; b < LodInfo_mjs_2.BOTTOM; b++) {
                                const segment = this.data[c][l][r][t][b];
                                fn(segment);
                            }
                        }
                    }
                }
            }
        }
        destroySegmentObjects(index, destructor) {
            for (let l = 0; l < LodInfo_mjs_2.LEFT; l++) {
                for (let r = 0; r < LodInfo_mjs_2.RIGHT; r++) {
                    for (let t = 0; t < LodInfo_mjs_2.TOP; t++) {
                        for (let b = 0; b < LodInfo_mjs_2.BOTTOM; b++) {
                            const segment = this.data[index][l][r][t][b];
                            if (segment.object) {
                                destructor(segment.object);
                                segment.object = null;
                            }
                        }
                    }
                }
            }
        }
        destroy(destructor) {
            for (let i = 0; i < this.data.length; i++) {
                this.destroySegmentObjects(i, destructor);
            }
            this.data.length = 0;
        }
        buildFromTerrain(terrain, objectBuilder) {
            this._patchCount = terrain.numPatchesX * terrain.numPatchesZ;
            this.data = new Array(terrain.lodInfo.length);
            for (let lodCore = 0; lodCore < this.data.length; lodCore++) {
                this.data[lodCore] = this._buildInfo(lodCore, terrain.lodInfo[lodCore], this._patchCount, objectBuilder);
            }
        }
        _buildInfo(lodCore, lodInfo, patchCount, objectBuilder) {
            const arr = new Array(LodInfo_mjs_2.LEFT);
            for (let l = 0; l < LodInfo_mjs_2.LEFT; l++) {
                arr[l] = new Array(LodInfo_mjs_2.RIGHT);
                for (let r = 0; r < LodInfo_mjs_2.RIGHT; r++) {
                    arr[l][r] = new Array(LodInfo_mjs_2.TOP);
                    for (let t = 0; t < LodInfo_mjs_2.TOP; t++) {
                        arr[l][r][t] = new Array(LodInfo_mjs_2.BOTTOM);
                        for (let b = 0; b < LodInfo_mjs_2.BOTTOM; b++) {
                            const info = lodInfo.info[l][r][t][b];
                            const lod = {
                                distance: -1,
                                core: lodCore,
                                left: l,
                                right: r,
                                top: t,
                                bottom: b
                            };
                            const data = new exports.TInstCoordsOffsetArrType(patchCount * exports.instDataSize);
                            const object = objectBuilder ? objectBuilder(lod, info, data, patchCount) : null;
                            arr[l][r][t][b] = {
                                vertexBaseIndex: info.start,
                                vertexCount: info.count,
                                count: 0,
                                data: data,
                                object: object,
                                hasChanges: false,
                            };
                        }
                    }
                }
            }
            return arr;
        }
        get(lod) {
            return this.data[lod.core][lod.left][lod.right][lod.top][lod.bottom];
        }
        increment(lod, x, z) {
            const single = this.get(lod);
            const prevIndex = single.count;
            const index = prevIndex * exports.instDataSize;
            if (single.data[index + 0] !== x ||
                single.data[index + 1] !== z) {
                single.data[index + 0] = x;
                single.data[index + 1] = z;
                single.hasChanges = true;
            }
            single.count++;
            return single;
        }
        zeroAll() {
            for (let lodCore = 0; lodCore < this.data.length; lodCore++) {
                for (let l = 0; l < LodInfo_mjs_2.LEFT; l++) {
                    for (let r = 0; r < LodInfo_mjs_2.RIGHT; r++) {
                        for (let t = 0; t < LodInfo_mjs_2.TOP; t++) {
                            for (let b = 0; b < LodInfo_mjs_2.BOTTOM; b++) {
                                const single = this.data[lodCore][l][r][t][b];
                                single.count = 0;
                            }
                        }
                    }
                }
            }
        }
    }
    exports.PatchInstancing = PatchInstancing;
});
define("src/TerrainHelpers/TerrainPatchesInstancing", ["require", "exports", "src/TerrainSystem/LodInfo", "src/TerrainSystem/PatchInstancing"], function (require, exports, LodInfo_mjs_3, PatchInstancing_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerrainPathcesInstancing = void 0;
    class TerrainPathcesInstancing extends PatchInstancing_mjs_1.PatchInstancing {
        constructor() {
            super(...arguments);
            this.enabled = false;
        }
        get meshInstanceCount() { return this.data.length * LodInfo_mjs_3.LEFT * LodInfo_mjs_3.RIGHT * LodInfo_mjs_3.TOP * LodInfo_mjs_3.BOTTOM; }
        appendMeshInstances(arr, offset = 0) {
            let i = 0;
            for (let c = 0; c < this.data.length; c++) {
                for (let l = 0; l < LodInfo_mjs_3.LEFT; l++) {
                    for (let r = 0; r < LodInfo_mjs_3.RIGHT; r++) {
                        for (let t = 0; t < LodInfo_mjs_3.TOP; t++) {
                            for (let b = 0; b < LodInfo_mjs_3.BOTTOM; b++) {
                                const chunk = this.data[c][l][r][t][b];
                                if (chunk.object) {
                                    arr[i++ + offset] = chunk.object;
                                }
                            }
                        }
                    }
                }
            }
            return i;
        }
        begin(castShadow = false, receiveShadow = false) {
            for (let c = 0; c < this.data.length; c++) {
                for (let l = 0; l < LodInfo_mjs_3.LEFT; l++) {
                    for (let r = 0; r < LodInfo_mjs_3.RIGHT; r++) {
                        for (let t = 0; t < LodInfo_mjs_3.TOP; t++) {
                            for (let b = 0; b < LodInfo_mjs_3.BOTTOM; b++) {
                                const chunk = this.data[c][l][r][t][b];
                                const chunkObject = chunk.object;
                                chunk.count = 0;
                                chunk.hasChanges = false;
                                if (chunkObject) {
                                    chunkObject.visible = false;
                                    chunkObject.visibleThisFrame = false;
                                    chunkObject.castShadow = castShadow;
                                    chunkObject.receiveShadow = receiveShadow;
                                }
                            }
                        }
                    }
                }
            }
        }
        end() {
            for (let c = 0; c < this.data.length; c++) {
                for (let l = 0; l < LodInfo_mjs_3.LEFT; l++) {
                    for (let r = 0; r < LodInfo_mjs_3.RIGHT; r++) {
                        for (let t = 0; t < LodInfo_mjs_3.TOP; t++) {
                            for (let b = 0; b < LodInfo_mjs_3.BOTTOM; b++) {
                                const chunk = this.data[c][l][r][t][b];
                                const chunkObject = chunk.object;
                                if (chunkObject && chunk.count > 0) {
                                    chunkObject.instancingCount = chunk.count;
                                    if (chunk.hasChanges && chunkObject.instancingData) {
                                        // TODO: performance improvement
                                        //chunkObject.instancingData.vertexBuffer?.unlock();
                                        const length = chunk.count * PatchInstancing_mjs_1.instDataSize;
                                        const vertexBuffer = chunkObject.instancingData.vertexBuffer;
                                        this._writeBuffer(vertexBuffer, chunk.data, length);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        _writeBuffer(vertexBuffer, data, length) {
            if (vertexBuffer) {
                const device = vertexBuffer.device;
                if (device.isWebGL2) {
                    const gl = device.gl;
                    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer.impl.bufferId);
                    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data, 0, length);
                }
                else if (device.isWebGPU) {
                    const wgpu = device.wgpu;
                    const buffer = vertexBuffer.impl.buffer;
                    wgpu.queue.writeBuffer(buffer, 0, data, 0, length);
                }
                else {
                    console.error('Unsupported device');
                }
            }
        }
    }
    exports.TerrainPathcesInstancing = TerrainPathcesInstancing;
});
define("src/TerrainHelpers/TerrainPatchesBasic", ["require", "exports", "src/TerrainSystem/LodManager", "src/TerrainHelpers/TerrainPatchesInstancing"], function (require, exports, LodManager_mjs_3, TerrainPatchesInstancing_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerrainPatchBufferBasic = void 0;
    class TerrainPatchBufferBasic {
        constructor(index, minX, minZ, size) {
            this.minX = minX;
            this.minZ = minZ;
            this.size = size;
            this.index = index;
            this.visible = false;
            this.hash = 0;
            this.lod = LodManager_mjs_3.defaultPatchLod;
            this.indicesBaseIndex = 0;
            this.indicesBaseVertex = 0;
            this.indicesCount = 0;
            this.dependencesUpdated = false;
            this.heightsUpdated = false;
            this.heightsUpdatedThisFrame = false;
            this.lastChangeTime = 0;
            this.lastChangeAttachTime = 0;
            this.lastChangeHeightsTime = 0;
        }
    }
    exports.TerrainPatchBufferBasic = TerrainPatchBufferBasic;
    class TerrainPatchesBasic {
        get bufferArray() { return this._bufferArray; }
        get meshInstanceArray() { return this._meshInstanceArray; }
        get aabb() { return this._aabb; }
        get customMeshInstance() { return this._customMeshInstance; }
        constructor(terrain) {
            this.customForwardRenderer = false;
            this.terrain = terrain;
            this.instancing = new TerrainPatchesInstancing_mjs_1.TerrainPathcesInstancing();
            this.customForwardRenderer = false;
            this._useMashesBag = false;
            this._bufferArray = new Array(this.terrain.numPatchesX * this.terrain.numPatchesZ);
            this._meshInstanceArray = new Array(this.terrain.numPatchesX * this.terrain.numPatchesZ);
            this._customMeshInstance = undefined;
            this._patchAvalableCount = 0;
            this._changesIds = [];
            this._aabb = new pc.BoundingBox();
            this._init = false;
            this.updateAabb();
        }
        updateAabb() {
            const halfWidth = this.terrain.width / 2;
            const halfDepth = this.terrain.depth / 2;
            this._aabb.setMinMax(new pc.Vec3(-halfWidth, this.terrain.minHeight, -halfDepth), new pc.Vec3(+halfWidth, this.terrain.maxHeight, +halfDepth));
            if (this._customMeshInstance) {
                this._customMeshInstance.setCustomAabb(this._aabb);
                this._customMeshInstance.mesh.aabb = this._aabb;
            }
            for (const meshInstance of this._meshInstanceArray) {
                if (meshInstance) {
                    meshInstance.setCustomAabb(this._aabb);
                    meshInstance.mesh.aabb = this._aabb;
                }
            }
            if (this.instancing.enabled) {
                this.instancing.forEach(item => {
                    if (item.object) {
                        item.object.setCustomAabb(this._aabb);
                        item.object.mesh.aabb = this._aabb;
                    }
                });
            }
        }
        startRender() {
        }
        _forceUpdateRenderComponent(entity) {
            let append = false; // destroy prev meshInstances by default
            let meshInstances;
            if (this.customForwardRenderer &&
                this._customMeshInstance) {
                this._useMashesBag = true;
                meshInstances = [this._customMeshInstance];
            }
            else {
                const count = this.instancing.enabled
                    ? this.instancing.meshInstanceCount
                    : this._patchAvalableCount;
                meshInstances = new Array(count);
                if (this.instancing.enabled) {
                    this.instancing.appendMeshInstances(meshInstances);
                }
                else {
                    // if instancing was used, then we delete all previous instances
                    // or use custom renderer
                    append = !this._useMashesBag;
                    let i = 0;
                    for (let patchIndex = 0; patchIndex < this._meshInstanceArray.length; patchIndex++) {
                        const patchMeshInstance = this._meshInstanceArray[patchIndex];
                        if (patchMeshInstance) {
                            meshInstances[i++] = patchMeshInstance;
                        }
                    }
                    this._changesIds.length = 0;
                }
                this._useMashesBag = this.instancing.enabled;
            }
            if (entity.render) {
                // TODO: https://github.com/playcanvas/engine/issues/6680
                if (append) {
                    // @ts-ignore
                    entity.render._meshInstances = [];
                }
                entity.render.meshInstances = meshInstances;
            }
            else {
                entity.addComponent('render', {
                    meshInstances: meshInstances,
                    cull: false,
                });
            }
            // Update shadows
            for (const meshInstance of meshInstances) {
                meshInstance.cull = false;
                meshInstance.castShadow = false;
                meshInstance.receiveShadow = false;
            }
        }
        _updateRenderComponent(entity) {
            if (this.customForwardRenderer ||
                this.instancing.enabled ||
                this._changesIds.length === 0 ||
                !entity.enabled) {
                return;
            }
            this._forceUpdateRenderComponent(entity);
        }
        updateLods() {
            this.updateIndexBuffer();
            this.updateMeshes();
        }
        forEach(zone, callback) {
            if (zone.maxX < 0)
                return;
            if (zone.maxZ < 0)
                return;
            const minX = Math.max(zone.minX, 0);
            const minZ = Math.max(zone.minZ, 0);
            const maxX = Math.min(zone.maxX, this.terrain.width);
            const maxZ = Math.min(zone.maxZ, this.terrain.depth);
            const minPatchX = Math.floor(minX / this.terrain.patchSize);
            const minPatchZ = Math.floor(minZ / this.terrain.patchSize);
            const maxPatchX = Math.floor(maxX / this.terrain.patchSize);
            const maxPatchZ = Math.floor(maxZ / this.terrain.patchSize);
            const normalizeMinX = Math.max(minPatchX, 0);
            const normalizeMinZ = Math.max(minPatchZ, 0);
            const normalizeMaxX = Math.min(maxPatchX + 1, this.terrain.numPatchesX);
            const normalizeMaxZ = Math.min(maxPatchZ + 1, this.terrain.numPatchesZ);
            for (let z = normalizeMinZ; z < normalizeMaxZ; z++) {
                for (let x = normalizeMinX; x < normalizeMaxX; x++) {
                    const patchIndex = z * this.terrain.numPatchesX + x;
                    if (callback(patchIndex, x, z) === false) {
                        return;
                    }
                }
            }
        }
        updateDependencies(zone) {
            const now = performance.now();
            this.forEach(zone, (patchIndex) => {
                const patchBuffer = this._bufferArray[patchIndex];
                patchBuffer.lastChangeTime = now;
                patchBuffer.lastChangeAttachTime = now;
            });
            this._lastChangeTime = now;
            this._lastChangeAttachTime = now;
        }
        updateHeights(zone) {
            const now = performance.now();
            this.forEach(zone, (patchIndex) => {
                const patchBuffer = this._bufferArray[patchIndex];
                patchBuffer.lastChangeTime = now;
                patchBuffer.lastChangeHeightsTime = now;
                patchBuffer.heightsUpdated = true;
            });
            this._lastChangeTime = now;
            this._lastChangeHeightsTime = now;
        }
        _addPatchBuffer(patchIndex, buffer) {
            if (this._bufferArray[patchIndex]) {
                throw new Error('Buffer has already been added');
            }
            this._bufferArray[patchIndex] = buffer;
        }
        _addPatchMeshInstance(patchIndex, meshInstance) {
            if (this._meshInstanceArray[patchIndex]) {
                throw new Error('Mesh instance has already been added');
            }
            this._meshInstanceArray[patchIndex] = meshInstance;
            this._changesIds.push(patchIndex);
            this._patchAvalableCount++;
        }
        endRender(hasUpdateHeights) {
            this._updateRenderComponent(this._entity);
        }
        getOrCreatePatchMesh(patchIndex) {
            let patch = this._meshInstanceArray[patchIndex];
            if (!patch) {
                patch = this._createPatchMesh(patchIndex, this._app, this._entity, this._material);
                this._addPatchMeshInstance(patchIndex, patch);
            }
            return patch;
        }
        destroyPatchMesh(patchIndex) {
            this._destroyPatchMesh(patchIndex);
            const patchMeshInstance = this._meshInstanceArray[patchIndex];
            if (patchMeshInstance) {
                this._patchAvalableCount--;
                this._changesIds.push(patchIndex);
                delete this._meshInstanceArray[patchIndex];
            }
        }
        destroyPatchesMesh() {
            for (let z = 0; z < this.terrain.numPatchesZ; z++) {
                for (let x = 0; x < this.terrain.numPatchesX; x++) {
                    const index = z * this.terrain.numPatchesX + x;
                    this.destroyPatchMesh(index);
                }
            }
        }
        updatePatchesMeshMaterial() {
            for (let z = 0; z < this.terrain.numPatchesZ; z++) {
                for (let x = 0; x < this.terrain.numPatchesX; x++) {
                    const index = z * this.terrain.numPatchesX + x;
                    const meshInstance = this._meshInstanceArray[index];
                    if (meshInstance) {
                        meshInstance.material = this._material;
                    }
                }
            }
        }
        updateMeshes() {
            if (!this._init) {
                return;
            }
            if (this._customMeshInstance) {
                this._destroyCustomBagMesh(this._customMeshInstance);
                this._customMeshInstance = undefined;
            }
            this.instancing.destroy((mesh) => {
                this._destroyInstancingMesh(mesh);
            });
            if (this.customForwardRenderer) {
                this.destroyPatchesMesh();
                this._customMeshInstance = this._createCustomBagMesh(this._app, this._entity, this._material, this.terrain);
            }
            else if (this.instancing.enabled) {
                this.destroyPatchesMesh();
                this.instancing.buildFromTerrain(this.terrain, (lodInfo, primitiveInfo, data) => {
                    return this._createInstancingMesh(this._app, this._entity, this._material, lodInfo, primitiveInfo, data);
                });
            }
            else {
                this.updatePatchesMeshMaterial();
            }
            this._forceUpdateRenderComponent(this._entity);
        }
        updateMaterial(material) {
            this._material = material;
        }
        init(app, entity, material) {
            if (this._init) {
                throw new Error('The terrain patches was initialized earlier');
            }
            this._init = true;
            this._app = app;
            this._entity = entity;
            // for other language use internal class
            const initializer = {
                initPatch: (baseIndex, baseVertex, count, patchX, patchZ, minX, minZ, size, lodInfo) => {
                    const patchIndex = patchZ * this.terrain.numPatchesX + patchX;
                    const buffer = this._createPatchBuffer(patchIndex, baseIndex, baseVertex, count, patchX, patchZ, minX, minZ, size, lodInfo);
                    this._addPatchBuffer(patchIndex, buffer);
                }
            };
            this.updateMaterial(material);
            this.terrain.initPatches(initializer);
            this.updateMeshes();
        }
    }
    exports.default = TerrainPatchesBasic;
});
define("src/TerrainSystem/CompressedPatchedHeightMap", ["require", "exports", "src/TerrainSystem/AbsPatchedHeightMap", "src/TerrainSystem/HeightMap"], function (require, exports, AbsPatchedHeightMap_mjs_1, HeightMap_mjs_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompressedPatchedHeightMap = void 0;
    AbsPatchedHeightMap_mjs_1 = __importStar(AbsPatchedHeightMap_mjs_1);
    class CompressedPatchedHeightMap extends AbsPatchedHeightMap_mjs_1.default {
        get compressAlgoritm() { return this._compressAlgoritm; }
        static createBuffer(width, depth, chunkSize, algoritm) {
            const numChunksX = ((width - 1) / (chunkSize - 1)) | 0;
            const numChunksZ = ((depth - 1) / (chunkSize - 1)) | 0;
            const chunkArrSize = Math.pow(chunkSize, 2);
            const chunkCount = numChunksX * numChunksZ;
            const patchXBatchingCount = algoritm === "x4" ? 4 : 2;
            if (numChunksX < patchXBatchingCount) {
                console.error("The chunkSize (%d) should be at least (%d) times smaller than the width (%d)\n", chunkSize, patchXBatchingCount, width);
                throw new Error();
            }
            return (algoritm === "x2"
                ? new Uint16Array(chunkArrSize * chunkCount)
                : new Uint8Array(chunkArrSize * chunkCount));
        }
        constructor(width, depth, patchSize, dataChunkSize, minHeight, maxHeight, algoritm, buffer, itemSize = HeightMap_mjs_2.defaultHeightVertexSize, itemHeightIndexOffset = 0) {
            const validDataChunkSize = (0, AbsPatchedHeightMap_mjs_1.getOrThrowDataChunkSize)(patchSize, dataChunkSize);
            const tmpBuffer = buffer !== null && buffer !== void 0 ? buffer : CompressedPatchedHeightMap.createBuffer(width, depth, validDataChunkSize, algoritm);
            super(width, depth, patchSize, dataChunkSize, minHeight, maxHeight, tmpBuffer, itemSize, itemHeightIndexOffset);
            this._compressAlgoritm = algoritm;
            this._patchXBatchSize = algoritm === "x4" ? 4 : 2;
            this._maxSafeFactor = algoritm === "x4" ? 0xff : 0xffff;
        }
        getChunkIndex(chunkX, chunkZ) {
            return (chunkZ * this.dataNumChunksX + chunkX) / this._patchXBatchSize | 0;
        }
        getChunkBuffer(type, chunkX, chunkZ) {
            const size = Math.pow(this.dataChunkSize, 2);
            const chunkLevel = (chunkZ * this.dataNumChunksX + chunkX) / this._patchXBatchSize | 0;
            const chunkOffset = chunkLevel * size * this.data.BYTES_PER_ELEMENT * this._patchXBatchSize;
            const count = size * this._patchXBatchSize * (this.data.BYTES_PER_ELEMENT / type.BYTES_PER_ELEMENT);
            return new type(this.data.buffer, chunkOffset, count);
        }
        getChunksBuffers(type) {
            const result = new Array((this.dataNumChunksX / this._patchXBatchSize) * this.dataNumChunksZ);
            for (let chunkZ = 0; chunkZ < this.dataNumChunksZ; chunkZ++) {
                for (let chunkX = 0; chunkX < this.dataNumChunksX; chunkX += this._patchXBatchSize) {
                    const index = (chunkZ * this.dataNumChunksX + chunkX) / this._patchXBatchSize | 0;
                    result[index] = this.getChunkBuffer(type, chunkX, chunkZ);
                }
            }
            return result;
        }
        _encodeHeightFactor(store, index, value) {
            store[index] = Math.min(value * this._maxSafeFactor, this._maxSafeFactor);
        }
        _decodeHeightFactor(store, index) {
            return store[index] / this._maxSafeFactor;
        }
        getIndex(x, z) {
            const localX = x % this.dataChunkSize;
            const localZ = z % this.dataChunkSize;
            const chunkX = Math.floor(x / this.dataChunkSize);
            const chunkZ = Math.floor(z / this.dataChunkSize);
            const chunkLevel = (chunkZ * this.dataNumChunksX + chunkX) / this._patchXBatchSize | 0;
            const chunkOffset = chunkLevel * (Math.pow(this.dataChunkSize, 2));
            const localIndex = localZ * this.dataChunkSize + localX;
            const numCompress = chunkX % this._patchXBatchSize; // compress by x axis
            return (chunkOffset + localIndex) * this._patchXBatchSize + numCompress;
        }
    }
    exports.CompressedPatchedHeightMap = CompressedPatchedHeightMap;
    exports.default = CompressedPatchedHeightMap;
});
define("src/TerrainHelpers/TerrainPatches", ["require", "exports", "src/TerrainSystem/CoordsBuffer", "src/TerrainHelpers/TerrainPatchesBasic", "src/TerrainHelpers/TerrainPatchesShaderChunks", "src/TerrainSystem/PatchInstancing", "src/TerrainSystem/CompressedPatchedHeightMap"], function (require, exports, CoordsBuffer_mjs_2, TerrainPatchesBasic_mjs_1, TerrainPatchesShaderChunks_mjs_2, PatchInstancing_mjs_2, CompressedPatchedHeightMap_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getHeightMapFormat = getHeightMapFormat;
    exports.getHeightMapChunkBufferType = getHeightMapChunkBufferType;
    TerrainPatchesBasic_mjs_1 = __importStar(TerrainPatchesBasic_mjs_1);
    CompressedPatchedHeightMap_mjs_1 = __importDefault(CompressedPatchedHeightMap_mjs_1);
    function getHeightMapFormat(graphicsDevice, heightMap) {
        // TODO: check support float32 texture
        let hmFormat = 'rgba';
        if (heightMap instanceof CompressedPatchedHeightMap_mjs_1.default) {
            hmFormat = heightMap.compressAlgoritm === 'x4' ? 'rgbaX4' : 'rgbaX2';
        }
        return hmFormat;
    }
    function getHeightMapChunkBufferType(graphicsDevice, format) {
        if (format === pc.PIXELFORMAT_RG16U) {
            return Uint16Array;
        }
        return Uint8Array;
    }
    class TerrainPatches extends TerrainPatchesBasic_mjs_1.default {
        get heightMapTexture() { return this._heightMap; }
        _updatePatchHeightsOnGPU(patchX, patchZ) {
            // TODO: a batch update may be required.
            // TODO: transform in heightmap class
            const dataChunkSize = this.terrain.heightMap.dataChunkSize;
            const factor = this.terrain.heightMap.dataChunkSizeFactor;
            const dataChunkX = patchX * factor | 0;
            const dataChunkZ = patchZ * factor | 0;
            const level = this.terrain.heightMap.getChunkIndex(dataChunkX, dataChunkZ);
            const buffer = this.terrain.heightMap.getChunkBuffer(this._heightMapLevelsType, dataChunkX, dataChunkZ);
            if (this._app.graphicsDevice.isWebGL2) {
                const gl = this._app.graphicsDevice.gl;
                const textureFormat = this._heightMap.impl._glFormat;
                const texturePixelT = this._heightMap.impl._glPixelType;
                const textureTarget = this._heightMap.impl._glTarget;
                const textureObject = this._heightMap.impl._glTexture;
                gl.bindTexture(textureTarget, textureObject);
                gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, level, dataChunkSize, dataChunkSize, 1, textureFormat, texturePixelT, buffer);
            }
            else if (this._app.graphicsDevice.isWebGPU) {
                const webgpu = this._app.graphicsDevice.wgpu;
                const texture = (this._heightMap.impl.gpuTexture);
                webgpu.queue.writeTexture({
                    texture: texture,
                    origin: [0, 0, level],
                    mipLevel: 0
                }, buffer, {
                    offset: 0,
                    bytesPerRow: 4 * dataChunkSize, // always 4 for rgba format
                    rowsPerImage: dataChunkSize
                }, {
                    width: dataChunkSize,
                    height: dataChunkSize
                });
            }
        }
        _updateHeightMap(zone) {
            this.forEach(zone, (patchIndex, x, z) => {
                this._updatePatchHeightsOnGPU(x, z);
            });
        }
        _createPatchBuffer(patchIndex, baseIndex, baseVertex, count, patchX, patchZ, minX, minZ, size, lod) {
            const patchBuf = new TerrainPatchesBasic_mjs_1.TerrainPatchBufferBasic(patchIndex, minX, minZ, size);
            patchBuf.lod = lod;
            patchBuf.indicesBaseIndex = baseIndex;
            patchBuf.indicesBaseVertex = baseVertex;
            patchBuf.indicesCount = count;
            patchBuf.dependencesUpdated = false;
            patchBuf.heightsUpdated = false;
            return patchBuf;
        }
        _buildVertexFormat(graphicsDevice, vertexBuffer) {
            // We can use uint8 for patches smaller than 255, but we only use 2 bytes,
            // for optimal performance need 4 bytes for the buffer.
            const coordsFormat = (vertexBuffer.patchVertexBufferTyped instanceof Uint8Array) ? pc.TYPE_UINT8 : pc.TYPE_UINT16;
            const vertexDesc = [{
                    semantic: pc.SEMANTIC_POSITION,
                    components: CoordsBuffer_mjs_2.coordsVertexSize,
                    type: coordsFormat,
                    normalize: false,
                    asInt: true
                }];
            return new pc.VertexFormat(graphicsDevice, vertexDesc, vertexBuffer.patchVertexBufferLength);
        }
        _buildInstancingVertexFormat(graphicsDevice) {
            // We can use uint8, but we only use 2 bytes,
            // for optimal performance need 4 bytes for the buffer.
            return new pc.VertexFormat(graphicsDevice, [{
                    semantic: pc.SEMANTIC_ATTR10,
                    components: CoordsBuffer_mjs_2.coordsVertexSize,
                    type: pc.TYPE_UINT16,
                    normalize: false,
                    asInt: true
                }]);
        }
        _buildInstancingVertexBuffer(graphicsDevice, data) {
            return new pc.VertexBuffer(graphicsDevice, this._buildInstancingVertexFormat(graphicsDevice), data.length / PatchInstancing_mjs_2.instDataSize, {
                usage: pc.BUFFER_STREAM,
                data: data,
                storage: false,
            });
        }
        _setCustomPrimitiveChunks(terrain, mesh) {
            const patches = new Array(terrain.numPatchesX * terrain.numPatchesZ);
            for (let patchZ = 0; patchZ < terrain.numPatchesZ; patchZ++) {
                for (let patchX = 0; patchX < terrain.numPatchesX; patchX++) {
                    const patchIndex = patchZ * terrain.numPatchesX + patchX;
                    const patchBuf = this.bufferArray[patchIndex];
                    patches[patchIndex] = {
                        type: pc.PRIMITIVE_TRIANGLES,
                        enabled: false,
                        base: 0,
                        count: 0,
                        indexed: true,
                        attributes: {
                            [TerrainPatchesShaderChunks_mjs_2.patchCoordOffsetParamName]: [patchBuf.minX, patchBuf.minZ],
                            [TerrainPatchesShaderChunks_mjs_2.patchLodCoreParamName]: patchBuf.lod.core,
                        }
                    };
                }
            }
            mesh.primitiveChunks = [patches];
        }
        _createCustomBagMesh(app, entity, material, terrain) {
            const patchMesh = new pc.Mesh(app.graphicsDevice);
            const primitive = patchMesh.primitive[0];
            patchMesh.aabb = this.aabb;
            patchMesh.indexBuffer[0] = this._sharedIndexBuffer;
            patchMesh.vertexBuffer = this._sharedVertexBuffer;
            this._setCustomPrimitiveChunks(terrain, patchMesh);
            primitive.type = pc.PRIMITIVE_TRIANGLES;
            primitive.base = 0;
            primitive.count = 0;
            primitive.indexed = true;
            const patchMeshInstance = new pc.MeshInstance(patchMesh, material, entity);
            patchMeshInstance.cull = false;
            patchMeshInstance.visible = false;
            patchMeshInstance.visibleThisFrame = false;
            patchMeshInstance.castShadow = false;
            patchMeshInstance.receiveShadow = false;
            patchMeshInstance.setParameter(TerrainPatchesShaderChunks_mjs_2.patchLodCoreParamName, 0, 0xffffffff);
            patchMeshInstance.setParameter(TerrainPatchesShaderChunks_mjs_2.patchCoordOffsetParamName, [0, 0], 0xffffffff);
            patchMeshInstance.setInstancing(null);
            patchMeshInstance.setCustomAabb(this.aabb);
            return patchMeshInstance;
        }
        _createInstancingMesh(app, entity, material, lodInfo, primitiveInfo, data) {
            const patchMesh = new pc.Mesh(app.graphicsDevice);
            const primitive = patchMesh.primitive[0];
            const instancingBuf = this._buildInstancingVertexBuffer(app.graphicsDevice, data);
            patchMesh.aabb = this.aabb;
            patchMesh.indexBuffer[0] = this._sharedIndexBuffer;
            patchMesh.vertexBuffer = this._sharedVertexBuffer;
            primitive.type = pc.PRIMITIVE_TRIANGLES;
            primitive.base = primitiveInfo.start;
            primitive.count = primitiveInfo.count;
            primitive.indexed = true;
            const patchMeshInstance = new pc.MeshInstance(patchMesh, material, entity);
            patchMeshInstance.cull = false;
            patchMeshInstance.visible = false;
            patchMeshInstance.visibleThisFrame = false;
            patchMeshInstance.castShadow = false;
            patchMeshInstance.receiveShadow = false;
            patchMeshInstance.setParameter(TerrainPatchesShaderChunks_mjs_2.patchLodCoreParamName, lodInfo.core, 0xffffffff);
            patchMeshInstance.setInstancing(instancingBuf, false);
            patchMeshInstance.setCustomAabb(this.aabb);
            return patchMeshInstance;
        }
        _createPatchMesh(patchIndex, app, entity, material) {
            const patchBuf = this.bufferArray[patchIndex];
            const patchMesh = new pc.Mesh(app.graphicsDevice);
            const primitive = patchMesh.primitive[0];
            patchMesh.aabb = this.aabb;
            patchMesh.indexBuffer[0] = this._sharedIndexBuffer;
            patchMesh.vertexBuffer = this._sharedVertexBuffer;
            primitive.type = pc.PRIMITIVE_TRIANGLES;
            primitive.base = 0;
            primitive.count = 0;
            primitive.indexed = true;
            const patchMeshInstance = new pc.MeshInstance(patchMesh, material, entity);
            patchMeshInstance.cull = false;
            patchMeshInstance.visible = false;
            patchMeshInstance.visibleThisFrame = false;
            patchMeshInstance.castShadow = false;
            patchMeshInstance.receiveShadow = false;
            patchMeshInstance.setParameter(TerrainPatchesShaderChunks_mjs_2.patchCoordOffsetParamName, [patchBuf.minX, patchBuf.minZ], 0xffffffff);
            patchMeshInstance.setInstancing(null);
            patchMeshInstance.setCustomAabb(this.aabb);
            return patchMeshInstance;
        }
        _destroyMesh(meshInstance) {
            var _a;
            // TODO: dont destroy shared index and vertex buffers
            if (meshInstance.mesh) {
                meshInstance.mesh.indexBuffer = [null];
                meshInstance.mesh.vertexBuffer = null;
            }
            meshInstance.destroy();
            if (meshInstance.mesh) {
                meshInstance.mesh.destroy();
            }
            if (meshInstance.instancingData) {
                // @ts-ignore
                if (meshInstance.instancingData.destroy) { // @ts-ignore
                    meshInstance.instancingData.destroy();
                }
                (_a = meshInstance.instancingData.vertexBuffer) === null || _a === void 0 ? void 0 : _a.destroy();
            }
        }
        _destroyInstancingMesh(mesh) {
            this._destroyMesh(mesh);
        }
        _destroyPatchMesh(patchIndex) {
            const patchMeshInstance = this.meshInstanceArray[patchIndex];
            if (patchMeshInstance) {
                this._destroyMesh(patchMeshInstance);
            }
        }
        _destroyCustomBagMesh(mesh) {
            this._destroyMesh(mesh);
        }
        _updateIndexBuffer(graphicsDevice) {
            var _a;
            (_a = this._sharedIndexBuffer) === null || _a === void 0 ? void 0 : _a.destroy();
            this._sharedIndexBuffer = new pc.IndexBuffer(graphicsDevice, pc.INDEXFORMAT_UINT32, this.terrain.patchIndices.length, pc.BUFFER_STATIC, this.terrain.patchIndices, { storage: false });
        }
        _updateVertexBuffer(graphicsDevice) {
            var _a;
            const format = this._buildVertexFormat(graphicsDevice, this.terrain.patchVertices);
            (_a = this._sharedVertexBuffer) === null || _a === void 0 ? void 0 : _a.destroy();
            this._sharedVertexBuffer = new pc.VertexBuffer(graphicsDevice, format, format.vertexCount, {
                usage: pc.BUFFER_STATIC,
                storage: false,
                data: this.terrain.patchVertices.patchVertexBufferData,
            });
        }
        _initHeightMapTexture(app) {
            var _a;
            (_a = this._heightMap) === null || _a === void 0 ? void 0 : _a.destroy();
            const heightFormat = getHeightMapFormat(app.graphicsDevice, this.terrain.heightMap);
            const format = (0, TerrainPatchesShaderChunks_mjs_2.getTextureType)(heightFormat);
            const bufFormat = getHeightMapChunkBufferType(app.graphicsDevice, format);
            const dataChunkSize = this.terrain.heightMap.dataChunkSize;
            const chunks = this.terrain.heightMap.getChunksBuffers(bufFormat);
            this._heightMapLevelsType = bufFormat;
            this._heightMap = new pc.Texture(app.graphicsDevice, {
                width: dataChunkSize,
                height: dataChunkSize,
                format: format,
                mipmaps: false,
                minFilter: pc.FILTER_LINEAR,
                magFilter: pc.FILTER_LINEAR,
                addressU: pc.ADDRESS_CLAMP_TO_EDGE,
                addressV: pc.ADDRESS_CLAMP_TO_EDGE,
                addressW: pc.ADDRESS_CLAMP_TO_EDGE,
                flipY: app.graphicsDevice.isWebGPU,
                arrayLength: chunks.length,
                levels: [chunks]
            });
        }
        updateIndexBuffer() {
            this._updateIndexBuffer(this._app.graphicsDevice);
            if (this.customForwardRenderer ||
                this.instancing.enabled) {
                this.updateMeshes();
            }
            else {
                for (const item of this.meshInstanceArray) {
                    if (item) {
                        item.mesh.indexBuffer[0] = this._sharedIndexBuffer;
                    }
                }
            }
        }
        _bindDependenciesToMaterial(material) {
            material.setAttribute(TerrainPatchesShaderChunks_mjs_2.patchInstCoordOffsetParamName, pc.SEMANTIC_ATTR10);
            material.setAttribute(TerrainPatchesShaderChunks_mjs_2.vertexCoordAttrName, pc.SEMANTIC_POSITION);
            material.setParameter(TerrainPatchesShaderChunks_mjs_2.patchLodCoreParamName, 0);
            material.setParameter(TerrainPatchesShaderChunks_mjs_2.patchCoordOffsetParamName, [0, 0]);
            material.setParameter(TerrainPatchesShaderChunks_mjs_2.terrainHeightMapParamName, this._heightMap);
            const format = getHeightMapFormat(this._app.graphicsDevice, this.terrain.heightMap);
            const chunksStore = (0, TerrainPatchesShaderChunks_mjs_2.getTerrainShaderChunks)({
                width: this.terrain.width,
                depth: this.terrain.depth,
                heightMapChunkSize: this.terrain.heightMap.dataChunkSize,
                instancing: this.instancing.enabled,
                heightMapFormat: format,
            });
            const chunkNames = Object.keys(chunksStore);
            for (let chunkName of chunkNames) {
                material.chunks[chunkName] = chunksStore[chunkName];
            }
            material.chunks.APIVersion = pc.CHUNKAPI_1_70;
            material.update();
        }
        updateMaterial(material) {
            this._bindDependenciesToMaterial(material);
            super.updateMaterial(material);
        }
        updateHeights(zone) {
            super.updateHeights(zone);
            this._updateHeightMap(zone);
        }
        init(app, entity, material) {
            this._initHeightMapTexture(app);
            this._updateIndexBuffer(app.graphicsDevice);
            this._updateVertexBuffer(app.graphicsDevice);
            super.init(app, entity, material);
        }
    }
    exports.default = TerrainPatches;
});
define("src/TerrainHelpers/TerrainRenderPreparer", ["require", "exports", "src/TerrainHelpers/TerrainPatchesShaderChunks"], function (require, exports, TerrainPatchesShaderChunks_mjs_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TerrainRenderPreparer {
        get wireframe() { return this._wireframe; }
        set wireframe(v) {
            this._wireframe = v;
            this._updateMeshes();
        }
        get castShadow() { return this._castShadow; }
        set castShadow(v) {
            this._castShadow = v;
            this._updateMeshes();
        }
        get receiveShadow() { return this._receiveShadow; }
        set receiveShadow(v) {
            this._receiveShadow = v;
            this._updateMeshes();
        }
        constructor(patchesStore, options) {
            var _a, _b, _c;
            this.patchesStore = patchesStore;
            this._wireframe = (_a = options.wireframe) !== null && _a !== void 0 ? _a : false;
            this._castShadow = (_b = options.castShadow) !== null && _b !== void 0 ? _b : false;
            this._receiveShadow = (_c = options.receiveShadow) !== null && _c !== void 0 ? _c : false;
            this._hasUpdatedHeights = false;
        }
        _updateMeshes() {
            const customMeshInstance = this.patchesStore.customMeshInstance;
            if (customMeshInstance) {
                this._updateMesh(customMeshInstance);
            }
            for (const meshInstance of this.patchesStore.meshInstanceArray) {
                this._updateMesh(meshInstance);
            }
            this.patchesStore.instancing.forEach(item => {
                this._updateMesh(item.object);
            });
        }
        _updateMesh(meshInstance) {
            if (meshInstance) {
                meshInstance.mesh.primitive[0].type = this._wireframe ? pc.PRIMITIVE_LINES : pc.PRIMITIVE_TRIANGLES;
                meshInstance.castShadow = this._castShadow;
                meshInstance.receiveShadow = this._receiveShadow;
            }
        }
        preparePatch(visible, baseIndex, baseVertex, count, patchX, patchZ, minX, minZ, size, lodInfo) {
            const terrain = this.patchesStore.terrain;
            const patchIndex = patchZ * terrain.numPatchesX + patchX;
            const buffer = this.patchesStore.bufferArray[patchIndex];
            const currHash = baseIndex / count;
            buffer.hash = currHash;
            buffer.visible = visible;
            buffer.indicesBaseIndex = baseIndex;
            buffer.indicesBaseVertex = baseVertex;
            buffer.indicesCount = count;
            buffer.lod = lodInfo;
            if (buffer.heightsUpdated) {
                buffer.heightsUpdated = false;
                buffer.heightsUpdatedThisFrame = visible;
                this._hasUpdatedHeights = true;
            }
            if (this.patchesStore.customForwardRenderer) {
                const primitive = this.patchesStore.customMeshInstance.mesh.primitiveChunks[0][patchIndex];
                primitive.enabled = visible;
                primitive.base = baseIndex;
                primitive.count = count;
                primitive.type = this._wireframe ? pc.PRIMITIVE_LINES : pc.PRIMITIVE_TRIANGLES;
                primitive.attributes[TerrainPatchesShaderChunks_mjs_3.patchLodCoreParamName] = lodInfo.core;
                return;
            }
            if (this.patchesStore.instancing.enabled) {
                if (visible) {
                    const inst = this.patchesStore.instancing.increment(lodInfo, minX, minZ);
                    if (inst.object) {
                        const meshInstance = inst.object;
                        const primitive = meshInstance.mesh.primitive[0];
                        meshInstance.visible = true;
                        meshInstance.visibleThisFrame = true;
                        meshInstance.castShadow = this._castShadow;
                        meshInstance.receiveShadow = this._receiveShadow;
                        primitive.type = this._wireframe ? pc.PRIMITIVE_LINES : pc.PRIMITIVE_TRIANGLES;
                    }
                }
                return;
            }
            const meshInstance = this.patchesStore.getOrCreatePatchMesh(patchIndex);
            const mesh = meshInstance.mesh;
            const primitive = mesh.primitive[0];
            if (meshInstance) {
                meshInstance.visible = visible;
                meshInstance.visibleThisFrame = visible;
                meshInstance.castShadow = this._castShadow;
                meshInstance.receiveShadow = this._receiveShadow;
            }
            primitive.base = baseIndex;
            primitive.count = count;
            primitive.type = this._wireframe ? pc.PRIMITIVE_LINES : pc.PRIMITIVE_TRIANGLES;
            meshInstance.setParameter(TerrainPatchesShaderChunks_mjs_3.patchLodCoreParamName, lodInfo.core);
        }
        render(frustum) {
            // TODO: In theory we can control the quality of the model for shadows
            // TODO: Add support for Occlusion culling
            this._hasUpdatedHeights = false;
            if (this.patchesStore.customForwardRenderer) {
                const customMeshInstance = this.patchesStore.customMeshInstance;
                if (customMeshInstance) {
                    customMeshInstance.visible = true;
                    customMeshInstance.castShadow = this._castShadow;
                    customMeshInstance.receiveShadow = this._receiveShadow;
                    const mesh = customMeshInstance.mesh;
                    const primitive = mesh.primitive[0];
                    primitive.type = this._wireframe ? pc.PRIMITIVE_LINES : pc.PRIMITIVE_TRIANGLES;
                }
            }
            if (this.patchesStore.instancing.enabled) {
                this.patchesStore.instancing.begin(false, false);
            }
            this.patchesStore.startRender();
            this.patchesStore.terrain.eachPatches(this, frustum);
            this.patchesStore.endRender(this._hasUpdatedHeights);
            if (this.patchesStore.instancing.enabled) {
                this.patchesStore.instancing.end();
            }
        }
    }
    exports.default = TerrainRenderPreparer;
});
define("src/TerrainHelpers/Brush", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("src/TerrainHelpers/ColorPainterShaders", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fragmentInvertShader = exports.fragmentShader = exports.factorMethod = exports.vertexShader = void 0;
    exports.vertexShader = `
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
    exports.factorMethod = `
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
    exports.fragmentShader = `
    ${exports.factorMethod}

    void main(void)
    {
        float factor = getFactor();
        vec4 color = vec4(uBrushMask * factor);

        gl_FragColor = color;
    }
`;
    exports.fragmentInvertShader = `
    ${exports.factorMethod}

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
});
define("src/TerrainHelpers/Shared", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkGDSupportR32F = exports.setPrecision = void 0;
    const setPrecision = (graphicsDevice, shaderCode) => {
        return "precision " + graphicsDevice.precision + " float;\n" + shaderCode;
    };
    exports.setPrecision = setPrecision;
    const checkGDSupportR32F = (graphicsDevice) => {
        // TODO: maybe not support
        if (graphicsDevice.isWebGPU) {
            return true;
        }
        let result = false;
        if (graphicsDevice.isWebGL2) {
            const gl = graphicsDevice.gl;
            result = gl.getExtension("EXT_color_buffer_float");
            if (result) {
                result = gl.getExtension("OES_texture_float");
            }
        }
        //alert(JSON.stringify(result));
        return !!result;
    };
    exports.checkGDSupportR32F = checkGDSupportR32F;
});
define("src/TerrainHelpers/ColorPainter", ["require", "exports", "src/TerrainHelpers/ColorPainterShaders", "src/TerrainHelpers/Shared"], function (require, exports, ColorPainterShaders_mjs_1, Shared_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.painterLayerName = exports.painterCameraFar = void 0;
    exports.painterCameraFar = 10;
    exports.painterLayerName = 'TerrainEditor';
    class ColorPainter {
        get painting() { return this._painting; }
        get cameraFar() { return exports.painterCameraFar; }
        get background() { return this._buffer; }
        constructor(app, buffer) {
            this._painting = false;
            this._painterMask = new Float32Array(4);
            this._buffer = buffer;
            this._app = app;
            this._initCamera();
            this._initShaders();
            this._initMaterials();
            this._initEntities();
        }
        _initCamera() {
            const painterLayer = this._app.scene.layers.getLayerByName(exports.painterLayerName);
            this._painterRenderTarget = new pc.RenderTarget({
                colorBuffer: this._buffer,
                flipY: this._app.graphicsDevice.isWebGPU,
                depth: false,
            });
            this._painterCameraEntity = new pc.Entity('TerrainPainterCamera');
            this._painterCameraEntity.setLocalPosition(0, 0, exports.painterCameraFar);
            this._painterCameraEntity.lookAt(0, 0, 0);
            this._painterCameraEntity.addComponent('camera', {
                projection: pc.PROJECTION_ORTHOGRAPHIC,
                clearColorBuffer: false,
                clearDepthBuffer: false,
                priority: -1,
                layers: [painterLayer.id],
                nearClip: 0.1,
                farClip: exports.painterCameraFar * 2,
                renderTarget: this._painterRenderTarget,
            });
            this._app.root.addChild(this._painterCameraEntity);
            this._painterCameraEntity.enabled = false;
            this._painterCameraEntity.camera.frustumCulling = false;
            this._painterCameraEntity.camera.orthoHeight = exports.painterCameraFar;
        }
        _initEntities() {
            const painterLayer = this._app.scene.layers.getLayerByName(exports.painterLayerName);
            painterLayer.transparentSortMode = pc.SORTMODE_MANUAL;
            this._painterEntity = new pc.Entity('TerrainBrushPainter');
            this._painterEntity.addComponent('render', {
                type: 'plane',
                layers: [painterLayer.id],
                material: this._painterMaterial,
                castShadows: false,
                castShadowsLightmap: false,
                receiveShadows: false
            });
            this._painterInvertEntity = new pc.Entity('TerrainBrushPainterInvert');
            this._painterInvertEntity.addComponent('render', {
                type: 'plane',
                layers: [painterLayer.id],
                material: this._painterInvertMaterial,
                castShadows: false,
                castShadowsLightmap: false,
                receiveShadows: false,
            });
            this._painterEntity.render.meshInstances[0].drawOrder = 1;
            this._painterInvertEntity.render.meshInstances[0].drawOrder = 0;
            this._app.root.addChild(this._painterInvertEntity);
            this._app.root.addChild(this._painterEntity);
            this._painterInvertEntity.setLocalEulerAngles(90, 0, 0);
            this._painterEntity.setLocalEulerAngles(90, 0, 0);
            this._painterInvertEntity.enabled = false;
            this._painterEntity.enabled = false;
        }
        _initShaders() {
            const vertex = ColorPainterShaders_mjs_1.vertexShader;
            const fragment = (0, Shared_mjs_1.setPrecision)(this._app.graphicsDevice, ColorPainterShaders_mjs_1.fragmentShader);
            const fragmentInvert = (0, Shared_mjs_1.setPrecision)(this._app.graphicsDevice, ColorPainterShaders_mjs_1.fragmentInvertShader);
            this._painterShader = pc.createShaderFromCode(this._app.graphicsDevice, vertex, fragment, 'PainterFragmentShader', {
                aPosition: pc.SEMANTIC_POSITION,
                aUv0: pc.SEMANTIC_TEXCOORD0
            });
            this._painterInvertShader = pc.createShaderFromCode(this._app.graphicsDevice, vertex, fragmentInvert, 'PainterInvertFragmentShader', {
                aPosition: pc.SEMANTIC_POSITION,
                aUv0: pc.SEMANTIC_TEXCOORD0
            });
        }
        _initMaterials() {
            this._painterMaterial = new pc.Material();
            this._painterMaterial.name = 'BrushPainterMaterial';
            // @ts-ignore
            this._painterMaterial.shader = this._painterShader;
            this._painterMaterial.blendType = pc.BLEND_ADDITIVE;
            this._painterMaterial.update();
            this._painterInvertMaterial = new pc.Material();
            this._painterInvertMaterial.name = 'BrushPainterInvertMaterial';
            // @ts-ignore
            this._painterInvertMaterial.shader = this._painterInvertShader;
            this._painterInvertMaterial.blendType = pc.BLEND_SUBTRACTIVE;
            this._painterInvertMaterial.update();
        }
        _updateRuntimeSettings(dt) {
            const originalOpacity = this._brushSettings.opacity;
            const opacity = originalOpacity;
            this._painterMaterial.setParameter('uBrushOpacity', opacity);
            this._painterInvertMaterial.setParameter('uBrushOpacity', opacity);
        }
        _updatePositionAndScale(x, y, scaleWidth, scaleHeight) {
            const far = this.cameraFar * 2;
            const ration = this.background.width / this.background.height;
            x = x * far * ration - this.cameraFar * ration;
            y = y * far - this.cameraFar;
            scaleWidth = scaleWidth * this.background.width / far / 2.5;
            scaleHeight = scaleHeight * this.background.height / far / 2.5;
            this._setScale(scaleWidth, scaleHeight);
            this._setPosition(x, y);
        }
        startPaint(dt, x, y, scaleWidth, scaleHeight) {
            this._updateRuntimeSettings(dt);
            this._updatePositionAndScale(x, y, scaleWidth, scaleHeight);
            this._painting = true;
            this._painterInvertEntity.enabled = true;
            this._painterEntity.enabled = true;
            this._painterCameraEntity.enabled = true;
        }
        stopPaint() {
            this._painting = false;
            this._painterInvertEntity.enabled = false;
            this._painterEntity.enabled = false;
            this._painterCameraEntity.enabled = false;
        }
        _setScale(x, y) {
            this._painterEntity.setLocalScale(x, 1, y);
            this._painterInvertEntity.setLocalScale(x, 1, y);
        }
        _setPosition(x, y) {
            this._painterEntity.setLocalPosition(x, y, 0);
            this._painterInvertEntity.setLocalPosition(x, y, 0);
        }
        updateSettings(brushSettings, activeLayer) {
            this._painterMask.fill(0);
            if (activeLayer > 0) {
                this._painterMask[activeLayer - 1] = 1;
            }
            const brushTexture = brushSettings.textures[brushSettings.active].resource;
            this._painterMaterial.setParameter('uBrushMask', this._painterMask);
            this._painterMaterial.setParameter('uHeightMap', brushTexture);
            this._painterInvertMaterial.setParameter('uBrushMask', this._painterMask);
            this._painterInvertMaterial.setParameter('uHeightMap', brushTexture);
            this._brushSettings = brushSettings;
        }
    }
    exports.default = ColorPainter;
});
define("src/Shared/EnumConverter", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isNumeric = isNumeric;
    exports.mapTitleEnum = mapTitleEnum;
    exports.mapEnum = mapEnum;
    function isNumeric(value) {
        return /^-?\d+$/.test(value);
    }
    function mapTitleEnum(someEnum) {
        const result = [];
        for (let value in someEnum) {
            if (!someEnum.hasOwnProperty(value) ||
                isNumeric(value)) {
                continue;
            }
            const enumEntry = {};
            enumEntry[value] = someEnum[value];
            result.push(enumEntry);
        }
        return result;
    }
    function mapEnum(someEnum) {
        const result = [];
        for (let value in someEnum) {
            if (!someEnum.hasOwnProperty(value)) {
                continue;
            }
            const enumEntry = {};
            enumEntry[value] = someEnum[value];
            result.push(enumEntry);
        }
        return result;
    }
});
define("src/TerrainHelpers/Enums", ["require", "exports", "src/Shared/EnumConverter"], function (require, exports, EnumConverter_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.terrainHeightsCompressAlgoritm = exports.terrainHeightsCompressAlgoritmDefault = exports.terrainPatchSizeEnum = exports.terrainPatchSizeEnumDefault = exports.terrainSizeEnum = exports.terrainSizeEnumDefault = void 0;
    exports.terrainSizeEnumDefault = 513;
    exports.terrainSizeEnum = (0, EnumConverter_mjs_1.mapEnum)({
        '128': 129,
        '256': 257,
        '512': 513,
        '1024': 1025,
        '2048': 2049,
        '4096': 4097,
        '8192': 8193,
        '16384': 16385,
        '32768': 32769,
    });
    exports.terrainPatchSizeEnumDefault = 33;
    exports.terrainPatchSizeEnum = (0, EnumConverter_mjs_1.mapEnum)({
        '16': 17,
        '32': 33,
        '64': 65,
        '128': 129,
        '256': 257,
        '512': 513,
        '1024': 1025,
    });
    exports.terrainHeightsCompressAlgoritmDefault = 'none';
    exports.terrainHeightsCompressAlgoritm = (0, EnumConverter_mjs_1.mapEnum)({
        'None': 'none',
        'X2': 'x2',
        'X4': 'x4'
    });
});
define("src/TerrainSystem/Triangle", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Triangle = void 0;
    const tmpTriVecA = new pc.Vec3();
    const tmpTriVecB = new pc.Vec3();
    class Triangle extends pc.Tri {
        getNormal(rsh) {
            tmpTriVecA.sub2(this.v1, this.v0);
            tmpTriVecB.sub2(this.v2, this.v0);
            rsh.cross(tmpTriVecA, tmpTriVecB).normalize();
        }
    }
    exports.Triangle = Triangle;
    exports.default = Triangle;
});
define("src/TerrainSystem/HeightfieldShape", ["require", "exports", "src/TerrainSystem/TerrainRaycastResult", "src/TerrainSystem/Triangle"], function (require, exports, TerrainRaycastResult_mjs_1, Triangle_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.intersectsRayBox = intersectsRayBox;
    TerrainRaycastResult_mjs_1 = __importDefault(TerrainRaycastResult_mjs_1);
    Triangle_mjs_1 = __importDefault(Triangle_mjs_1);
    const infinite = 9999999;
    const modelTransform = new pc.Mat4();
    const tmpRay = new pc.Ray();
    const tmpRaycastVec = new pc.Vec3();
    const tmpPos1 = new pc.Vec3();
    const tmpPos2 = new pc.Vec3();
    const tmpPos3 = new pc.Vec3();
    const triangle = new Triangle_mjs_1.default();
    const debugTmpVec = new pc.Vec3();
    const debugTransform = new pc.Mat4();
    const debugPositions = new Array(16);
    let debugTransformIsIdentity = true;
    function debugDrawTriangleLines(tri, color = pc.Color.YELLOW) {
        var _a;
        /*
        [
            tri.v0.x, tri.v0.y, tri.v0.z, tri.v1.x, tri.v1.y, tri.v1.z,
            tri.v1.x, tri.v1.y, tri.v1.z, tri.v2.x, tri.v2.y, tri.v2.z,
            tri.v2.x, tri.v2.y, tri.v2.z, tri.v0.x, tri.v0.y, tri.v0.z,
        ], color, false);
        ]
        */
        debugTransform.transformPoint(tri.v0, debugTmpVec);
        debugPositions[0] = debugPositions[15] = debugTmpVec.x;
        debugPositions[1] = debugPositions[16] = debugTmpVec.y;
        debugPositions[2] = debugPositions[17] = debugTmpVec.z;
        debugTransform.transformPoint(tri.v1, debugTmpVec);
        debugPositions[3] = debugPositions[6] = debugTmpVec.x;
        debugPositions[4] = debugPositions[7] = debugTmpVec.y;
        debugPositions[5] = debugPositions[8] = debugTmpVec.z;
        debugTransform.transformPoint(tri.v2, debugTmpVec);
        debugPositions[9] = debugPositions[12] = debugTmpVec.x;
        debugPositions[10] = debugPositions[13] = debugTmpVec.y;
        debugPositions[11] = debugPositions[14] = debugTmpVec.z;
        (_a = pc.app) === null || _a === void 0 ? void 0 : _a.drawLineArrays(debugPositions, color, false);
    }
    function intersectsRayBox(aabb, ray) {
        const rayOrigin = ray.origin;
        const rayDirection = ray.direction;
        const minX = aabb.minX;
        const maxX = aabb.maxX;
        const minY = aabb.minY;
        const maxY = aabb.maxY;
        const minZ = aabb.minZ;
        const maxZ = aabb.maxZ;
        let tmin = (minX - rayOrigin.x) / rayDirection.x;
        let tmax = (maxX - rayOrigin.x) / rayDirection.x;
        if (tmin > tmax) {
            let temp = tmin;
            tmin = tmax;
            tmax = temp;
        }
        let tymin = (minY - rayOrigin.y) / rayDirection.y;
        let tymax = (maxY - rayOrigin.y) / rayDirection.y;
        if (tymin > tymax) {
            let temp = tymin;
            tymin = tymax;
            tymax = temp;
        }
        if ((tmin > tymax) || (tymin > tmax)) {
            return false;
        }
        if (tymin > tmin) {
            tmin = tymin;
        }
        if (tymax < tmax) {
            tmax = tymax;
        }
        let tzmin = (minZ - rayOrigin.z) / rayDirection.z;
        let tzmax = (maxZ - rayOrigin.z) / rayDirection.z;
        if (tzmin > tzmax) {
            let temp = tzmin;
            tzmin = tzmax;
            tzmax = temp;
        }
        if ((tmin > tzmax) || (tzmin > tmax)) {
            return false;
        }
        return true;
    }
    class HeightfieldShape {
        constructor(heightMap) {
            this._heightMap = heightMap;
            this._beginPos = new pc.Vec3();
            this._endPos = new pc.Vec3();
            this.updateBoundingBox();
        }
        updateBoundingBox() {
            const halfWidth = this._heightMap.width / 2;
            const halfDepth = this._heightMap.depth / 2;
            this._boundingBox = {
                minX: -halfWidth,
                minY: this._heightMap.minHeight,
                minZ: -halfDepth,
                maxX: halfWidth,
                maxY: this._heightMap.maxHeight,
                maxZ: halfDepth,
            };
        }
        _triangleIntersectsRay(tri, ray, bestResult) {
            if (tri.intersectsRay(ray, tmpRaycastVec)) {
                const distance = tmpRaycastVec.distance(ray.origin);
                if (bestResult.distance > distance) {
                    bestResult.distance = distance;
                    tri.getNormal(bestResult.localNormal);
                    bestResult.normal.copy(bestResult.localNormal);
                    bestResult.localPoint.copy(tmpRaycastVec);
                    bestResult.point.copy(tmpRaycastVec);
                    debugDrawTriangleLines(tri, pc.Color.RED);
                    const distanceP0 = bestResult.point.distance(tri.v0);
                    const distanceP1 = bestResult.point.distance(tri.v1);
                    const distanceP2 = bestResult.point.distance(tri.v2);
                    if (distanceP0 > distanceP1) {
                        if (distanceP1 > distanceP2) {
                            bestResult.vertexIndex = tri.index2;
                        }
                        else {
                            bestResult.vertexIndex = tri.index1;
                        }
                    }
                    else {
                        if (distanceP0 > distanceP2) {
                            bestResult.vertexIndex = tri.index2;
                        }
                        else {
                            bestResult.vertexIndex = tri.index0;
                        }
                    }
                    return true;
                }
            }
            //debugDrawTriangleLines(tri);
            return false;
        }
        _assignPosition(index, buf) {
            const x = index % this._heightMap.width | 0;
            const z = index / this._heightMap.width | 0;
            buf.x = (-this._heightMap.width / 2) + x;
            buf.y = this._heightMap.get(x, z);
            buf.z = (-this._heightMap.depth / 2) + z;
        }
        _quadAction(rs, ray, result) {
            const x = rs.prevX;
            const z = rs.prevZ;
            if (x < 0 || z < 0 || x >= this._heightMap.width - 1 || z >= this._heightMap.depth - 1) {
                return false;
            }
            const xFan2 = x % 2 === 0;
            const zFan2 = z % 2 === 0;
            let index0, index1, index2;
            {
                if (xFan2 !== zFan2) {
                    index0 = (z + 0) * this._heightMap.width + (x + 0);
                    index1 = (z + 1) * this._heightMap.width + (x + 0);
                    index2 = (z + 0) * this._heightMap.width + (x + 1);
                }
                else {
                    index0 = (z + 0) * this._heightMap.width + (x + 0);
                    index1 = (z + 1) * this._heightMap.width + (x + 1);
                    index2 = (z + 0) * this._heightMap.width + (x + 1);
                }
                this._assignPosition(index0, tmpPos1);
                this._assignPosition(index1, tmpPos2);
                this._assignPosition(index2, tmpPos3);
                triangle.index0 = index0;
                triangle.index1 = index1;
                triangle.index2 = index2;
                triangle.set(tmpPos1, tmpPos2, tmpPos3);
            }
            if (this._triangleIntersectsRay(triangle, ray, result)) {
                return true;
            }
            {
                if (xFan2 !== zFan2) {
                    index0 = (z + 0) * this._heightMap.width + (x + 1);
                    index1 = (z + 1) * this._heightMap.width + (x + 0);
                    index2 = (z + 1) * this._heightMap.width + (x + 1);
                }
                else {
                    index0 = (z + 0) * this._heightMap.width + (x + 0);
                    index1 = (z + 1) * this._heightMap.width + (x + 0);
                    index2 = (z + 1) * this._heightMap.width + (x + 1);
                }
                this._assignPosition(index0, tmpPos1);
                this._assignPosition(index1, tmpPos2);
                this._assignPosition(index2, tmpPos3);
                triangle.index0 = index0;
                triangle.index1 = index1;
                triangle.index2 = index2;
                triangle.set(tmpPos1, tmpPos2, tmpPos3);
            }
            if (this._triangleIntersectsRay(triangle, ray, result)) {
                return true;
            }
            return false;
        }
        _intersectsRay(localRay, result = new TerrainRaycastResult_mjs_1.default()) {
            if (!intersectsRayBox(this._boundingBox, localRay)) {
                return false;
            }
            this._beginPos.copy(localRay.origin);
            this._beginPos.x += this._boundingBox.maxX;
            this._beginPos.z += this._boundingBox.maxZ;
            this._endPos.copy(localRay.direction).add(this._beginPos);
            let rayDirectionFlatX = this._endPos.x - this._beginPos.x;
            let rayDirectionFlatZ = this._endPos.z - this._beginPos.z;
            const maxDistanceFlat = Math.sqrt(Math.pow(rayDirectionFlatX, 2) + Math.pow(rayDirectionFlatZ, 2));
            if (maxDistanceFlat < 0.0001) {
                // Consider the ray vertical
                rayDirectionFlatX = 0;
                rayDirectionFlatZ = 0;
            }
            else {
                rayDirectionFlatX /= maxDistanceFlat;
                rayDirectionFlatZ /= maxDistanceFlat;
            }
            const xiStep = rayDirectionFlatX > 0 ? 1 : rayDirectionFlatX < 0 ? -1 : 0;
            const ziStep = rayDirectionFlatZ > 0 ? 1 : rayDirectionFlatZ < 0 ? -1 : 0;
            const paramDeltaX = xiStep !== 0 ? 1 / Math.abs(rayDirectionFlatX) : infinite;
            const paramDeltaZ = ziStep !== 0 ? 1 / Math.abs(rayDirectionFlatZ) : infinite;
            let paramCrossX;
            let paramCrossZ;
            if (xiStep !== 0) {
                paramCrossX = xiStep === 1
                    ? (Math.ceil(this._beginPos.x) - this._beginPos.x) * paramDeltaX
                    : (this._beginPos.x - Math.floor(this._beginPos.x)) * paramDeltaX;
            }
            else {
                paramCrossX = infinite; // Will never cross on X
            }
            if (ziStep !== 0) {
                paramCrossZ = ziStep === 1
                    ? (Math.ceil(this._beginPos.z) - this._beginPos.z) * paramDeltaZ
                    : (this._beginPos.z - Math.floor(this._beginPos.z)) * paramDeltaZ;
            }
            else {
                paramCrossZ = infinite; // Will never cross on Z
            }
            const rs = {
                x: this._beginPos.x | 0,
                z: this._beginPos.z | 0,
                param: 0,
                prevX: 0,
                prevZ: 0,
                prevParam: 0,
                maxDistanceFlat: maxDistanceFlat,
            };
            // Workaround cases where the ray starts at an integer position
            if (paramCrossX === 0.0) {
                paramCrossX += paramDeltaX;
                // If going backwards, we should ignore the position we would get by the above flooring,
                // because the ray is not heading in that direction
                if (xiStep === -1) {
                    rs.x -= 1;
                }
            }
            if (paramCrossZ === 0.0) {
                paramCrossZ += paramDeltaZ;
                if (ziStep === -1)
                    rs.z -= 1;
            }
            let hasHit = false;
            while (!hasHit) {
                rs.prevX = rs.x;
                rs.prevZ = rs.z;
                rs.prevParam = rs.param;
                if (paramCrossX < paramCrossZ) {
                    // X lane
                    rs.x += xiStep;
                    // Assign before advancing the param,
                    // to be in sync with the initialization step
                    rs.param = paramCrossX;
                    paramCrossX += paramDeltaX;
                }
                else {
                    // Z lane
                    rs.z += ziStep;
                    rs.param = paramCrossZ;
                    paramCrossZ += paramDeltaZ;
                }
                if (this._quadAction(rs, localRay, result)) {
                    hasHit = true;
                }
                if (rs.param > rs.maxDistanceFlat) {
                    rs.param = rs.maxDistanceFlat;
                    break;
                }
            }
            return hasHit;
        }
        intersectsRay(worldTranform, ray, result = new TerrainRaycastResult_mjs_1.default()) {
            if (worldTranform) {
                modelTransform.copy(worldTranform).invert();
                modelTransform.transformPoint(ray.origin, tmpRay.origin);
                modelTransform.transformVector(ray.direction, tmpRay.direction);
                debugTransform.copy(worldTranform);
                debugTransformIsIdentity = false;
            }
            else if (!debugTransformIsIdentity) {
                debugTransform.setIdentity();
                debugTransformIsIdentity = true;
            }
            const hit = this._intersectsRay(worldTranform ? tmpRay : ray, result);
            if (hit && worldTranform) {
                // update world point and normal, but save local
                worldTranform.transformPoint(result.point, result.point);
                worldTranform.transformVector(result.normal, result.normal);
            }
            return !!hit;
        }
    }
    exports.default = HeightfieldShape;
});
define("src/TerrainSystem/PatchedHeightMap", ["require", "exports", "src/TerrainSystem/AbsPatchedHeightMap"], function (require, exports, AbsPatchedHeightMap_mjs_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PatchedHeightMap = void 0;
    AbsPatchedHeightMap_mjs_2 = __importStar(AbsPatchedHeightMap_mjs_2);
    class PatchedHeightMap extends AbsPatchedHeightMap_mjs_2.default {
        static createBuffer(width, depth, chunkSize) {
            const numChunksX = ((width - 1) / (chunkSize - 1)) | 0;
            const numChunksZ = ((depth - 1) / (chunkSize - 1)) | 0;
            const chunkArrSize = chunkSize * chunkSize;
            const chunkCount = numChunksX * numChunksZ;
            return new Float32Array(chunkArrSize * chunkCount);
        }
        constructor(width, depth, patchSize, dataChunkSize, minHeight, maxHeight, buffer) {
            const validDataChunkSize = (0, AbsPatchedHeightMap_mjs_2.getOrThrowDataChunkSize)(patchSize, dataChunkSize);
            const tmpBuffer = buffer !== null && buffer !== void 0 ? buffer : PatchedHeightMap.createBuffer(width, depth, validDataChunkSize);
            super(width, depth, patchSize, dataChunkSize, minHeight, maxHeight, tmpBuffer, 1, 0);
        }
    }
    exports.PatchedHeightMap = PatchedHeightMap;
    exports.default = PatchedHeightMap;
});
define("src/TerrainHelpers/Frustum", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Frustum = void 0;
    const tmpVec = new pc.Vec3();
    const tmpRad = new pc.Vec3();
    const tmpSphere = new pc.BoundingSphere();
    class Frustum {
        get margin() { return this._margin; }
        set margin(value) { this._margin = value; }
        get frustum() { return this._frustum; }
        set frustum(value) { this._frustum = value; }
        get transform() { return this._mat; }
        set transform(value) {
            this._mat.copy(value);
            this._mat.getScale(this._scale);
        }
        constructor() {
            this._margin = 1;
            this._mat = new pc.Mat4();
            this._scale = new pc.Vec3();
        }
        containsSphere(localX, localY, localZ, radius) {
            tmpVec.set(localX, localY, localZ);
            tmpRad.copy(this._scale).mulScalar(radius);
            this._mat.transformPoint(tmpVec, tmpVec);
            // @ts-ignore [PLAYCANVAS:DOC]: center private in v2
            tmpSphere.center = tmpVec;
            tmpSphere.radius = tmpRad.distance(pc.Vec3.ZERO) * this._margin;
            return this._frustum.containsSphere(tmpSphere) > 0;
        }
    }
    exports.Frustum = Frustum;
});
define("src/Scripts/BigTerrainEditor", ["require", "exports", "src/Shared/Debug", "src/TerrainSystem/MidpointDispTerrain", "src/TerrainSystem/TerrainRaycastResult", "src/TerrainSystem/HeightMap", "src/TerrainHelpers/TerrainRenderPreparer", "src/TerrainHelpers/ColorPainter", "src/TerrainHelpers/TerrainPatches", "src/TerrainHelpers/Enums", "src/TerrainHelpers/TerrainPatchesShaderChunks", "src/TerrainSystem/HeightfieldShape", "src/TerrainSystem/PatchedHeightMap", "src/TerrainSystem/CompressedPatchedHeightMap", "src/TerrainHelpers/Frustum", "src/Shared/EnumConverter"], function (require, exports, Debug_mjs_1, MidpointDispTerrain_mjs_1, TerrainRaycastResult_mjs_2, HeightMap_mjs_3, TerrainRenderPreparer_mjs_1, ColorPainter_mjs_1, TerrainPatches_mjs_1, Enums_mjs_1, TerrainPatchesShaderChunks_mjs_4, HeightfieldShape_mjs_1, PatchedHeightMap_mjs_1, CompressedPatchedHeightMap_mjs_2, Frustum_mjs_1, EnumConverter_mjs_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.bigTerrainEditorScriptName = exports.BigTerrainEditor = exports.RenderMode = void 0;
    TerrainRaycastResult_mjs_2 = __importDefault(TerrainRaycastResult_mjs_2);
    HeightMap_mjs_3 = __importDefault(HeightMap_mjs_3);
    TerrainRenderPreparer_mjs_1 = __importDefault(TerrainRenderPreparer_mjs_1);
    ColorPainter_mjs_1 = __importDefault(ColorPainter_mjs_1);
    TerrainPatches_mjs_1 = __importDefault(TerrainPatches_mjs_1);
    HeightfieldShape_mjs_1 = __importDefault(HeightfieldShape_mjs_1);
    PatchedHeightMap_mjs_1 = __importDefault(PatchedHeightMap_mjs_1);
    CompressedPatchedHeightMap_mjs_2 = __importDefault(CompressedPatchedHeightMap_mjs_2);
    const brushMinSize = 2;
    const brushMaxSize = 250;
    const tmpMat = new pc.Mat4();
    const terrainLocalVertexPos = new pc.Vec3();
    const heightMapExt = '.hm';
    var RenderMode;
    (function (RenderMode) {
        RenderMode[RenderMode["Standard"] = 1] = "Standard";
        RenderMode[RenderMode["InstancingAccelerator"] = 2] = "InstancingAccelerator";
        RenderMode[RenderMode["CustomForwardRenderer"] = 3] = "CustomForwardRenderer";
    })(RenderMode || (exports.RenderMode = RenderMode = {}));
    class BigTerrainEditor extends pc.ScriptType {
        constructor() {
            super(...arguments);
            this._lock = 0;
            this._localCameraPosition = new pc.Vec3();
            this._roughness = 1.0;
            this._minHeight = 0.0;
            this._rayStart = new pc.Vec3();
            this._rayEnd = new pc.Vec3();
            this._rayDirection = new pc.Vec3();
            this._ray = new pc.Ray();
            this._lastLodGridUpdate = 0;
            this._brushSizeStep = 1;
            this._brushOpacityStep = 0.01;
            this._intersectsRayResult = false;
            this._keyAddLock = true;
            this._keySubLock = true;
        }
        get shape() { return this._heightFieldShape; }
        get terrain() { return this._terrain; }
        get terrainRenderPreparer() { return this._renderPreparer; }
        get lock() { return this._lock; }
        addLock() {
            this._lock++;
        }
        freeLock() {
            this._lock--;
        }
        postInitialize() {
            this._initializeMouse();
            this._initializeKeyboard();
            this._initBrush();
            this._initTerrain();
            this._createTerrainMaterial();
            this._updateTerrainMaterialParameters();
            this._updateLayers();
            this._updateHeightMapFromAttr();
            this._updateBrush();
            this._updatePainterMaterial();
            this._updateMesh();
            this.on('attr:renderMode', () => {
                this._renderPreparer.patchesStore.customForwardRenderer = this.renderMode === RenderMode.CustomForwardRenderer;
                this._renderPreparer.patchesStore.instancing.enabled = this.renderMode === RenderMode.InstancingAccelerator;
                this._renderPreparer.patchesStore.updateMaterial(this._material);
                this._renderPreparer.patchesStore.updateMeshes();
            });
            this.on('attr:wireframe', () => { this._renderPreparer.wireframe = this.wireframe; });
            this.on('attr:castShadow', () => { this._renderPreparer.castShadow = this.castShadow; });
            this.on('attr:receiveShadow', () => { this._renderPreparer.receiveShadow = this.receiveShadow; });
            this.on('attr:activeLayer', () => {
                this._updatePainterMaterial();
            });
            this.on('attr:layers', () => {
                this._updateLayers();
            });
            this.on('attr:brush', () => {
                this._updateBrush();
                this._updatePainterMaterial();
            });
            this.on('attr:height', () => {
                this._terrain.setMinMaxHeight(this._minHeight, this.height);
                this._updateTerrainMaterialParameters();
            });
            this.on('attr:zFar', () => {
                this._terrain.setZFar(this.zFar);
            });
        }
        _initBrush() {
            const splatMap = this.painterSettings.splatMap.resource;
            this._brushHeightMap = new HeightMap_mjs_3.default(256, 256, 0, 100);
            this._colorPainter = new ColorPainter_mjs_1.default(this.app, splatMap);
        }
        _updatePainterMaterial() {
            this._colorPainter.updateSettings(this.brush, this.activeLayer);
        }
        _updateBrush() {
            this._brushSize = this.brush.size | 0;
            this._brushOpacity = this.brush.opacity;
            const activeBrush = this.brush.active | 0;
            if (activeBrush === this._activeBrush) {
                return;
            }
            if (!this.brush.textures[activeBrush]) {
                console.error('Brush image unset.');
                return;
            }
            const brushTexture = this.brush.textures[activeBrush].resource;
            const brushImg = brushTexture.getSource();
            if (!brushImg) {
                console.error('Brush image unset.');
                return;
            }
            this._activeBrush = activeBrush;
            this._brushHeightMap.fromImage(brushImg);
            this._brushHeightMap.smooth(1, 1);
            console.log(this._brushHeightMap);
        }
        _initTerrain() {
            const tmpChunkSize = this.patchSize * 2 - 1;
            const chunkSize = Math.min(this.width, this.depth, tmpChunkSize);
            const heightMap = this.compressAlgoritm !== 'none'
                ? new CompressedPatchedHeightMap_mjs_2.default(this.width, this.depth, this.patchSize, chunkSize, this._minHeight, this.height, this.compressAlgoritm)
                : new PatchedHeightMap_mjs_1.default(this.width, this.depth, this.patchSize, chunkSize, this._minHeight, this.height);
            this._terrain = new MidpointDispTerrain_mjs_1.MidpointDispTerrain(heightMap, this.zFar);
            this._heightFieldShape = new HeightfieldShape_mjs_1.default(heightMap);
            this._raycastResult = new TerrainRaycastResult_mjs_2.default();
            this._frustum = new Frustum_mjs_1.Frustum();
            const patcher = new TerrainPatches_mjs_1.default(this._terrain);
            this._renderPreparer = new TerrainRenderPreparer_mjs_1.default(patcher, {
                wireframe: this.wireframe,
                castShadow: this.castShadow,
                receiveShadow: this.receiveShadow,
            });
            console.log(this._terrain, this._heightFieldShape, this._renderPreparer);
        }
        _createTerrainMaterial() {
            this._material = new pc.StandardMaterial();
            this._material.name = "Terrain Material";
        }
        _updateTerrainMaterialParameters() {
            this._material.setParameter(TerrainPatchesShaderChunks_mjs_4.terrainSplatMapParamName, this._colorPainter.background);
            this._material.setParameter(TerrainPatchesShaderChunks_mjs_4.terrainMinHeightParamName, this._terrain.minHeight);
            this._material.setParameter(TerrainPatchesShaderChunks_mjs_4.terrainMaxHeightParamName, this._terrain.maxHeight);
        }
        _updateLayers() {
            var _a;
            // TODO
            const maxCount = 16;
            const width = 1024;
            const height = 1024;
            let length = 0;
            let flags = [];
            let scales = [];
            let offsets = [];
            let diffuses = [];
            let normals = [];
            for (let i = 0; i < maxCount; i++) {
                let flag = 0;
                if (i < this.layers.length) {
                    const layer = this.layers[i];
                    const diffuse = layer.diffuse;
                    const normalMap = layer.normalMap;
                    if (diffuse) {
                        flag++;
                        length++;
                        diffuses.push(diffuse.resource.getSource());
                        scales.push(layer.size.x, layer.size.y);
                        offsets.push(layer.offset.x, layer.offset.y);
                        if (normalMap) {
                            flag++;
                            normals.push(normalMap.resource.getSource());
                        }
                    }
                }
                flags.push(flag);
            }
            (_a = this._layersDiffuse) === null || _a === void 0 ? void 0 : _a.destroy();
            this._layersDiffuse = new pc.Texture(this.app.graphicsDevice, {
                name: 'terrainLayersDiffuse',
                format: pc.PIXELFORMAT_RGBA8,
                width: width,
                height: height,
                arrayLength: length,
                magFilter: pc.FILTER_NEAREST,
                minFilter: pc.FILTER_NEAREST_MIPMAP_NEAREST,
                mipmaps: true,
                addressU: pc.ADDRESS_REPEAT,
                addressV: pc.ADDRESS_REPEAT,
                addressW: pc.ADDRESS_CLAMP_TO_EDGE,
                levels: [diffuses]
            });
            this._layersDiffuse.upload();
            this._material.setParameter(`uTerrainLayersCount`, length);
            this._material.setParameter(`uTerrainLayersDiffuse`, this._layersDiffuse);
            this._material.setParameter(`uTerrainLayersFlags[0]`, flags);
            this._material.setParameter(`uTerrainLayersScale[0]`, scales);
            this._material.setParameter(`uTerrainLayersOffset[0]`, offsets);
        }
        _updateMesh() {
            this._renderPreparer.patchesStore.customForwardRenderer = this.renderMode === RenderMode.CustomForwardRenderer;
            this._renderPreparer.patchesStore.instancing.enabled = this.renderMode === RenderMode.InstancingAccelerator;
            this._renderPreparer.patchesStore.init(this.app, this.entity, this._material);
        }
        _initializeMouse() {
            var _a, _b;
            (_a = this.app.mouse) === null || _a === void 0 ? void 0 : _a.on(pc.EVENT_MOUSEMOVE, this._onMouseMove, this);
            (_b = this.app.mouse) === null || _b === void 0 ? void 0 : _b.on(pc.EVENT_MOUSEWHEEL, this._onMouseWheel, this);
            this.on('destroy', () => {
                var _a, _b;
                (_a = this.app.mouse) === null || _a === void 0 ? void 0 : _a.off(pc.EVENT_MOUSEMOVE, this._onMouseMove, this);
                (_b = this.app.mouse) === null || _b === void 0 ? void 0 : _b.off(pc.EVENT_MOUSEWHEEL, this._onMouseWheel, this);
            });
        }
        _onMouseMove(event) {
            this._lastMouseMoveEvent = event;
        }
        _onMouseWheel(event) {
            const candidate = this._brushSize + event.wheelDelta * this._brushSizeStep;
            this._brushSize = Math.min(Math.max(candidate, brushMinSize), brushMaxSize);
        }
        _initializeKeyboard() {
            var _a, _b;
            (_a = this.app.keyboard) === null || _a === void 0 ? void 0 : _a.on(pc.EVENT_KEYDOWN, this._onKeyboardDown, this);
            (_b = this.app.keyboard) === null || _b === void 0 ? void 0 : _b.on(pc.EVENT_KEYUP, this._onKeyboardUp, this);
            this.on('destroy', () => {
                var _a, _b;
                (_a = this.app.mouse) === null || _a === void 0 ? void 0 : _a.off(pc.EVENT_KEYDOWN, this._onKeyboardDown, this);
                (_b = this.app.mouse) === null || _b === void 0 ? void 0 : _b.off(pc.EVENT_KEYUP, this._onKeyboardUp, this);
            });
        }
        _onKeyboardDown(event) {
            if (this._keyAddLock === false && event.key === pc.KEY_ADD) {
                this._keyAddLock = true;
                this._brushOpacity = Math.max(this._brushOpacity + this._brushOpacityStep, 0);
            }
            if (this._keySubLock === false && event.key === pc.KEY_SUBTRACT) {
                this._keySubLock = true;
                this._brushOpacity = Math.min(this._brushOpacity - this._brushOpacityStep, 1);
            }
        }
        _onKeyboardUp(event) {
            if (event.key === pc.KEY_ADD) {
                this._keyAddLock = false;
            }
            else if (event.key === pc.KEY_SUBTRACT) {
                this._keySubLock = false;
            }
        }
        _updateHeightMapFromAttr() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.heightMap.file) {
                    if (!this.heightMap.file.resource) {
                        console.warn('Height map file unset.');
                        return;
                    }
                    const data = this.heightMap.file.resource;
                    yield this._terrain.loadHeightMapFromFile(data, {
                        adaptiveMinMaxHeight: true,
                        adaptiveWidthAndDepth: true,
                    });
                }
                else {
                    const texture = this.heightMap.texture;
                    if (!texture) {
                        console.warn('Height map image unset.');
                        return;
                    }
                    const resource = texture.resource;
                    const img = resource.getSource();
                    if (!img) {
                        console.warn('Height map image unset.');
                        return;
                    }
                    this._terrain.loadHeightMapFromImg(img, this.heightMap.smoothFactor, this.heightMap.smoothRadius);
                    // TODO: clear heightmap
                    resource.destroy();
                }
                this._renderPreparer.patchesStore.updateAabb();
                this._renderPreparer.patchesStore.updateHeights({
                    minX: 0,
                    minZ: 0,
                    maxX: this.width,
                    maxZ: this.depth
                });
            });
        }
        _saveHeightMapToImg() {
            const base64 = this._terrain.heightMap.toImage();
            const image = new Image();
            image.src = base64;
            const w = window.open(undefined, '_blank');
            w.document.write(image.outerHTML);
        }
        _saveHeightMapToFile() {
            return __awaiter(this, void 0, void 0, function* () {
                const blob = yield this._terrain.heightMap.toFile();
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                const timestamp = new Date();
                document.body.appendChild(a);
                a.href = blobUrl;
                a.download = `hm_${+timestamp}${heightMapExt}`;
                a.click();
                URL.revokeObjectURL(blobUrl);
            });
        }
        update(dt) {
            var _a, _b, _c, _d, _e, _f;
            if (this._colorPainter.painting) {
                this._colorPainter.stopPaint();
            }
            if (this.autoRender &&
                this.cameraEntity &&
                this.cameraEntity.camera) {
                const camera = this.cameraEntity.camera;
                const mat = this.entity.getWorldTransform();
                const scale = mat.getScale();
                if (this._lastMouseMoveEvent) {
                    let hasChanges = false;
                    camera.screenToWorld(this._lastMouseMoveEvent.x, this._lastMouseMoveEvent.y, camera.nearClip, this._rayStart);
                    camera.screenToWorld(this._lastMouseMoveEvent.x, this._lastMouseMoveEvent.y, camera.farClip, this._rayEnd);
                    this._rayDirection.sub2(this._rayEnd, this._rayStart);
                    const changeRay = !this._ray.origin.equals(this._rayStart) || !this._ray.direction.equals(this._rayDirection);
                    if (changeRay) {
                        this._ray.set(this._rayStart, this._rayDirection);
                        this._raycastResult.clear();
                        this._intersectsRayResult = this._heightFieldShape.intersectsRay(mat, this._ray, this._raycastResult);
                    }
                    if (this._intersectsRayResult) {
                        const brushSizeX = this._brushSize / scale.x | 0;
                        const brushSizeZ = this._brushSize / scale.z | 0;
                        this._terrain.patchVertices.getPosition(this._raycastResult.vertexIndex, terrainLocalVertexPos);
                        (0, Debug_mjs_1.drawPoint)({ center: this._raycastResult.point, radius: this._brushSize, numSegments: 10, depthTest: true, color: pc.Color.GRAY });
                        (0, Debug_mjs_1.drawDirectionVector)(this._raycastResult.point, this._raycastResult.normal, pc.Color.MAGENTA);
                        if (this._lock < 1 &&
                            ((_a = this.app.mouse) === null || _a === void 0 ? void 0 : _a.isPressed(pc.MOUSEBUTTON_LEFT))) {
                            if (this.painting) {
                                const width = this._terrain.width - 1;
                                const depth = this._terrain.depth - 1;
                                const x = terrainLocalVertexPos.x / width;
                                const y = terrainLocalVertexPos.z / depth;
                                const scaleW = brushSizeX / width;
                                const scaleH = brushSizeZ / depth;
                                this._colorPainter.startPaint(dt, x, y, scaleW, scaleH);
                            }
                            else {
                                const average = (brushSizeX + brushSizeZ) / 2;
                                const centerX = terrainLocalVertexPos.x | 0;
                                const centerZ = terrainLocalVertexPos.z | 0;
                                const zone = {
                                    minX: centerX - brushSizeX,
                                    maxX: centerX + brushSizeX + 1,
                                    minZ: centerZ - brushSizeZ,
                                    maxZ: centerZ + brushSizeZ + 1,
                                };
                                if ((_b = this.app.keyboard) === null || _b === void 0 ? void 0 : _b.isPressed(pc.KEY_ALT)) {
                                    this._terrain.smoothHeightsZone(zone, average * this._brushOpacity * dt, 1);
                                }
                                else {
                                    const negative = !!((_c = this.app.keyboard) === null || _c === void 0 ? void 0 : _c.isPressed(pc.KEY_CONTROL));
                                    const appendValue = (negative ? -average : average) * this._brushOpacity * dt / 100;
                                    this._terrain.appendHeightMap(this._brushHeightMap, appendValue, zone);
                                }
                                this._terrain.recalculateMinMax(zone);
                                this._renderPreparer.patchesStore.updateHeights(zone);
                                hasChanges = true;
                            }
                        }
                    }
                }
                tmpMat.invert(mat);
                tmpMat.transformPoint(camera.entity.getPosition(), this._localCameraPosition);
                this._frustum.frustum = camera.frustum;
                this._frustum.transform = mat;
                this._terrain.updateLods(this._localCameraPosition);
                this._renderPreparer.render(this._frustum);
            }
            if ((_d = this.app.keyboard) === null || _d === void 0 ? void 0 : _d.wasPressed(pc.KEY_L)) {
                this._terrain.printLodMap();
            }
            if ((_e = this.app.keyboard) === null || _e === void 0 ? void 0 : _e.wasPressed(pc.KEY_P)) {
                this._saveHeightMapToImg();
            }
            if ((_f = this.app.keyboard) === null || _f === void 0 ? void 0 : _f.wasPressed(pc.KEY_O)) {
                this._saveHeightMapToFile();
            }
            // Debug
            //this.app.drawTexture( 0.5, -0.6, 0.5, 0.3, this.painterSettings.splatMap.resource, undefined as any);
        }
    }
    exports.BigTerrainEditor = BigTerrainEditor;
    exports.default = BigTerrainEditor;
    exports.bigTerrainEditorScriptName = "bigTerrainEditor";
    pc.registerScript(BigTerrainEditor, exports.bigTerrainEditorScriptName);
    BigTerrainEditor.attributes.add("renderMode", { type: "number", enum: (0, EnumConverter_mjs_2.mapTitleEnum)(RenderMode), default: RenderMode.Standard });
    BigTerrainEditor.attributes.add("castShadow", { type: "boolean", default: true, });
    BigTerrainEditor.attributes.add("receiveShadow", { type: "boolean", default: true, });
    BigTerrainEditor.attributes.add("zFar", { type: "number", default: 5000, min: 1, step: 1, precision: 0, });
    BigTerrainEditor.attributes.add("width", { type: "number", enum: Enums_mjs_1.terrainSizeEnum, default: Enums_mjs_1.terrainSizeEnumDefault });
    BigTerrainEditor.attributes.add("depth", { type: "number", enum: Enums_mjs_1.terrainSizeEnum, default: Enums_mjs_1.terrainSizeEnumDefault });
    BigTerrainEditor.attributes.add("patchSize", { type: "number", enum: Enums_mjs_1.terrainPatchSizeEnum, default: Enums_mjs_1.terrainPatchSizeEnumDefault });
    BigTerrainEditor.attributes.add("height", { type: "number", default: 10, min: 1 });
    BigTerrainEditor.attributes.add("compressAlgoritm", { type: "string", enum: Enums_mjs_1.terrainHeightsCompressAlgoritm, default: Enums_mjs_1.terrainHeightsCompressAlgoritmDefault });
    BigTerrainEditor.attributes.add("layer", { type: "string", default: 'TerrainEditor' });
    BigTerrainEditor.attributes.add("autoRender", { type: "boolean", default: true });
    BigTerrainEditor.attributes.add("cameraEntity", { type: "entity" });
    BigTerrainEditor.attributes.add("painting", { type: "boolean", default: false });
    BigTerrainEditor.attributes.add("wireframe", { type: "boolean", default: false });
    BigTerrainEditor.attributes.add("heightMap", {
        type: 'json',
        schema: [
            {
                name: 'file',
                type: 'asset',
                assetType: 'binary',
            },
            {
                name: 'texture',
                type: "asset",
                assetType: 'texture',
            },
            {
                name: 'smoothFactor',
                description: `
                To what extent neighbors influence the new height:
                Value of 0 will ignore neighbors (no smoothing).
                Value of 1 will ignore the node old height.
            `,
                type: "number",
                default: 1,
                min: 0,
                max: 1,
            },
            {
                name: 'smoothRadius',
                description: `The radius of factor smooth.`,
                type: "number",
                default: 1,
                step: 1,
                min: 1,
            }
        ]
    });
    BigTerrainEditor.attributes.add("brush", {
        type: "json",
        schema: [
            {
                name: "active",
                description: "The brush texture index.",
                type: "number",
                default: 0,
                min: 0,
                step: 1,
                precision: 0,
            },
            {
                name: "size",
                description: "The brush size",
                type: "number",
                default: 10,
                min: brushMinSize,
                max: brushMaxSize,
                step: 1,
                precision: 0,
            },
            {
                name: "opacity",
                description: "The brush opacity",
                type: "number",
                default: 0.5,
                min: 0,
                max: 1,
            },
            {
                name: "textures",
                description: "The brush textures",
                type: "asset",
                assetType: 'texture',
                array: true,
            }
        ]
    });
    BigTerrainEditor.attributes.add("activeLayer", { type: 'number', default: 0, min: 0, max: 32, step: 1, precision: 0 });
    BigTerrainEditor.attributes.add("layers", {
        type: "json",
        array: true,
        schema: [
            {
                name: "name",
                title: "Name",
                type: "string",
            },
            {
                name: "diffuse",
                title: "Diffuse",
                type: "asset",
                assetType: "texture",
            },
            {
                name: "normalMap",
                title: "Normal Map",
                type: "asset",
                assetType: "texture",
            },
            {
                name: "size",
                title: "Size",
                type: "vec2",
                default: [1, 1]
            },
            {
                name: "offset",
                title: "Offset",
                type: "vec2",
                default: [0, 0]
            },
        ]
    });
    BigTerrainEditor.attributes.add("painterSettings", {
        type: "json",
        schema: [
            {
                name: "splatMap",
                type: "asset",
                assetType: "texture",
                title: "Splat Map",
            },
        ]
    });
});
define("src/Scripts/FlyCamera", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.flyCameraScriptName = exports.FlyCamera = void 0;
    class FlyCamera extends pc.ScriptType {
        constructor() {
            super(...arguments);
            this.mobileControl = false;
        }
        initialize() {
            // Camera euler angle rotation around x and y axes
            const eulers = this.entity.getLocalEulerAngles();
            this.ex = (eulers.z - eulers.x);
            this.ey = (eulers.z - eulers.y);
            this.moved = false;
            this.rightDown = false;
            this.middleDown = false;
            // Disabling the context menu stops the browser displaying a menu when
            // you right-click the page
            if (this.app.mouse) {
                this.app.mouse.disableContextMenu();
                this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
                this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
                this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
            }
        }
        append(x, y) {
            this.ex += x;
            this.ey += y;
            this.ex = pc.math.clamp(this.ex, -90, 90);
        }
        translate(x, y, z) {
            this.entity.translateLocal(x, y, z);
        }
        update(dt) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            // Update the camera's orientation
            this.entity.setLocalEulerAngles(this.ex, this.ey, 0);
            const app = this.app;
            let speed = this.speed;
            if ((_a = app.keyboard) === null || _a === void 0 ? void 0 : _a.isPressed(pc.KEY_SPACE)) {
                speed = this.slowSpeed;
            }
            if ((_b = app.keyboard) === null || _b === void 0 ? void 0 : _b.isPressed(pc.KEY_SHIFT)) {
                speed = this.fastSpeed;
            }
            // Joypad control
            const joystickMover = touchJoypad === null || touchJoypad === void 0 ? void 0 : touchJoypad.sticks['joystick0'];
            const joystickRoter = touchJoypad === null || touchJoypad === void 0 ? void 0 : touchJoypad.sticks['joystick1'];
            if (this.mobileControls && (touchJoypad === null || touchJoypad === void 0 ? void 0 : touchJoypad.buttons.wasPressed('button2'))) {
                this.mobileControl = !this.mobileControl;
                this.mobileControls.enabled = this.mobileControl;
            }
            if (joystickRoter) {
                this.append(joystickRoter.y, -joystickRoter.x);
            }
            if (joystickMover) {
                this.translate(speed * joystickMover.x * dt, 0, -speed * joystickMover.y * dt);
            }
            // Update the camera's position
            if (((_c = app.keyboard) === null || _c === void 0 ? void 0 : _c.isPressed(pc.KEY_UP)) || ((_d = app.keyboard) === null || _d === void 0 ? void 0 : _d.isPressed(pc.KEY_W))) {
                this.translate(0, 0, -speed * dt);
            }
            else if (((_e = app.keyboard) === null || _e === void 0 ? void 0 : _e.isPressed(pc.KEY_DOWN)) || ((_f = app.keyboard) === null || _f === void 0 ? void 0 : _f.isPressed(pc.KEY_S))) {
                this.translate(0, 0, speed * dt);
            }
            if (((_g = app.keyboard) === null || _g === void 0 ? void 0 : _g.isPressed(pc.KEY_LEFT)) || ((_h = app.keyboard) === null || _h === void 0 ? void 0 : _h.isPressed(pc.KEY_A))) {
                this.translate(-speed * dt, 0, 0);
            }
            else if (((_j = app.keyboard) === null || _j === void 0 ? void 0 : _j.isPressed(pc.KEY_RIGHT)) || ((_k = app.keyboard) === null || _k === void 0 ? void 0 : _k.isPressed(pc.KEY_D))) {
                this.translate(speed * dt, 0, 0);
            }
        }
        onMouseMove(event) {
            if (!this.mode) {
                if (!pc.Mouse.isPointerLocked())
                    return;
            }
            if (!this.rightDown &&
                !this.middleDown)
                return;
            // Update the current Euler angles, clamp the pitch.
            if (!this.moved) {
                // first move event can be very large
                this.moved = true;
                return;
            }
            if (this.rightDown) {
                this.append(-event.dy / this.sensitivity, -event.dx / this.sensitivity);
            }
            if (this.middleDown) {
                let speed = this.speed;
                if (this.app.keyboard.isPressed(pc.KEY_SHIFT)) {
                    speed = this.fastSpeed;
                }
                this.translate(-(event.dx / 5) * speed, (event.dy / 5) * speed, 0);
            }
        }
        onMouseDown(event) {
            // When the mouse button is clicked try and capture the pointer
            if (!this.mode && !pc.Mouse.isPointerLocked()) {
                this.app.mouse.enablePointerLock();
            }
            if (event.button === pc.MOUSEBUTTON_RIGHT) {
                this.rightDown = true;
            }
            if (event.button === pc.MOUSEBUTTON_MIDDLE) {
                this.middleDown = true;
            }
        }
        onMouseUp(event) {
            if (event.button === pc.MOUSEBUTTON_RIGHT) {
                this.rightDown = false;
            }
            if (event.button === pc.MOUSEBUTTON_MIDDLE) {
                this.middleDown = false;
            }
        }
    }
    exports.FlyCamera = FlyCamera;
    exports.default = FlyCamera;
    exports.flyCameraScriptName = 'flyCamera';
    pc.registerScript(FlyCamera, exports.flyCameraScriptName);
    FlyCamera.attributes.add('mobileControls', {
        type: 'entity',
    });
    FlyCamera.attributes.add('speed', {
        type: 'number',
        default: 10
    });
    FlyCamera.attributes.add('slowSpeed', {
        type: 'number',
        default: 1
    });
    FlyCamera.attributes.add('fastSpeed', {
        type: 'number',
        default: 20
    });
    FlyCamera.attributes.add('sensitivity', {
        type: 'number',
        min: 1,
        default: 5
    });
    FlyCamera.attributes.add('mode', {
        type: 'number',
        default: 0,
        enum: [{
                "Lock": 0
            }, {
                "Drag": 1
            }]
    });
});
define("src/Scripts/FpsCounter", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fpsCounterScriptName = void 0;
    class FpsCounter extends pc.ScriptType {
        initialize() {
            const constr = window.FPSMeter;
            if (constr) {
                this.fps = new constr({
                    heat: true,
                    graph: true
                });
            }
        }
        update(dt) {
            var _a;
            (_a = this.fps) === null || _a === void 0 ? void 0 : _a.tick();
        }
    }
    exports.default = FpsCounter;
    exports.fpsCounterScriptName = 'FpsCounter';
    pc.registerScript(FpsCounter, exports.fpsCounterScriptName);
});
define("src/Shared/Random", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Random {
        constructor(seed) {
            this.seed = seed;
            this._tmp = seed;
        }
        reset() {
            this._tmp = this.seed;
        }
        next() {
            this._tmp = (this._tmp * 48271) % 2147483647;
            this._tick = this._tmp / 2147483647;
            return this._tick;
        }
        nextFloat(min, max) {
            return this.next() * (max - min) + min;
        }
        nextInt(min, max) {
            return this.nextFloat(min, max) | 0;
        }
        random() {
            return this.next();
        }
        nrand() {
            return this.nextFloat(-1, 1);
        }
    }
    exports.default = Random;
});
define("src/Scripts/GrassField", ["require", "exports", "src/GrassFieldHelpers/GrassFieldTexture", "src/GrassFieldHelpers/GrassShaderChunk", "src/Shared/Debug", "src/Shared/Random", "src/TerrainHelpers/TerrainPatches", "src/TerrainHelpers/TerrainPatchesShaderChunks", "src/Scripts/BigTerrainEditor"], function (require, exports, GrassFieldTexture_mjs_1, GrassShaderChunk_mjs_1, Debug_mjs_2, Random_mjs_1, TerrainPatches_mjs_2, TerrainPatchesShaderChunks_mjs_5, BigTerrainEditor_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.grassFieldScriptName = exports.GrassField = exports.quadMatrixIndexes = exports.quad2Matrix = exports.quad1Matrix = void 0;
    Random_mjs_1 = __importDefault(Random_mjs_1);
    exports.quad1Matrix = [
        2, 2,
        1, 2,
        0, 2,
        0, 1,
        0, 0,
        1, 0,
        2, 0,
        2, 1,
        1, 1
    ];
    exports.quad2Matrix = [
        4, 4,
        3, 4,
        2, 4,
        1, 4,
        0, 4,
        0, 3,
        0, 2,
        0, 1,
        0, 0,
        1, 0,
        2, 0,
        3, 0,
        4, 0,
        4, 1,
        4, 2,
        4, 3
    ];
    exports.quadMatrixIndexes = [
        [4, 3, 2], // 0
        [5, 8, 1], // 1
        [6, 7, 0], // 2
    ];
    const lod1QuadCount = 8;
    const lod2QuadCount = 16;
    class GrassField extends pc.ScriptType {
        constructor() {
            super(...arguments);
            this.transitionLow = 0.31;
            this.transitionHigh = 0.36;
            this._bufferStore = {};
            this._time = 0;
            this._lastDrawPos = new pc.Vec3();
            this._lod1MinMaxStore = [];
            this._lod2MinMaxStore = [];
            this._offsetLod1Arr = [
                0, 0,
                0, 0,
                0, 0,
                0, 0,
                0, 0,
                0, 0,
                0, 0,
                0, 0,
            ];
            this._offsetLod2Arr = [
                0, 0,
                0, 0,
                0, 0,
                0, 0,
                0, 0,
                0, 0,
                0, 0,
                0, 0,
                0, 0,
                0, 0,
                0, 0,
                0, 0,
                0, 0,
                0, 0,
                0, 0,
                0, 0,
            ];
        }
        get checkRadius() { return this.radius / 2; }
        get patchRadius() { return this.radius / 2; }
        destroy() {
            var _a, _b, _c, _d, _e;
            (_a = this._sharedIndexBuffer) === null || _a === void 0 ? void 0 : _a.destroy();
            (_b = this._sharedVertexBuffer) === null || _b === void 0 ? void 0 : _b.destroy();
            (_c = this._sharedInstancingBuffer) === null || _c === void 0 ? void 0 : _c.destroy();
            if (this._meshInst) {
                (_e = (_d = this._meshInst.instancingData) === null || _d === void 0 ? void 0 : _d.vertexBuffer) === null || _e === void 0 ? void 0 : _e.destroy();
                this._meshInst.destroy();
                if (this._meshInst.mesh) {
                    this._meshInst.mesh.destroy();
                }
                if (this._material) {
                    this._material.destroy();
                }
            }
            if (this.entity.render) {
                this.entity.render.meshInstances = [];
            }
        }
        _initBladesAndEditMode() {
            this._updateGrassMesh(this.app.graphicsDevice, this.patchRadius);
            if (this.painting) {
                this._terrainEditor.addLock();
            }
        }
        postInitialize() {
            var _a;
            const terrainEntity = this.entity.root.findByName('Terrain');
            const bigTerrainScript = (_a = terrainEntity.script) === null || _a === void 0 ? void 0 : _a.get(BigTerrainEditor_mjs_1.bigTerrainEditorScriptName);
            this._terrainEditor = bigTerrainScript;
            this._terrainEntity = terrainEntity;
            this._cameraEntity = bigTerrainScript.cameraEntity;
            this._dataTexture = new GrassFieldTexture_mjs_1.GrassFieldTexture(this.app.graphicsDevice, this._terrainEditor.width, this._terrainEditor.depth);
            this._initBladesAndEditMode();
            this.on('enable', () => this._initBladesAndEditMode());
            this.on('disable', () => {
                this.destroy();
                this._terrainEditor.freeLock();
            });
            this.on('attr:painting', () => {
                if (this.painting) {
                    this._terrainEditor.addLock();
                }
                else {
                    this._terrainEditor.freeLock();
                }
            });
            this.on('attr:wireframe', () => {
                var _a, _b;
                const primitive = (_b = (_a = this._meshInst) === null || _a === void 0 ? void 0 : _a.mesh) === null || _b === void 0 ? void 0 : _b.primitive;
                if (primitive && primitive[0]) {
                    primitive[0].type = this.wireframe ? pc.PRIMITIVE_LINES : pc.PRIMITIVE_TRIANGLES;
                }
            });
            this.on('attr:castShadow', () => {
                this._meshInst.castShadow = this.castShadow;
            });
            this.on('attr:receiveShadow', () => {
                this._meshInst.receiveShadow = this.receiveShadow;
            });
            this.on('attr:seed', () => this._updateMeshInstancing(this.app.graphicsDevice, this.patchRadius));
            this.on('attr:numBlades', () => this._updateMeshInstancing(this.app.graphicsDevice, this.patchRadius));
            this.on('attr:bladeWidth', () => this._updateMeshInstancing(this.app.graphicsDevice, this.patchRadius));
            this.on('attr:bladeMinHeight', () => this._updateMeshInstancing(this.app.graphicsDevice, this.patchRadius));
            this.on('attr:bladeMaxHeight', () => this._updateMeshInstancing(this.app.graphicsDevice, this.patchRadius));
            this.on('attr:radius', () => this._updateGrassMesh(this.app.graphicsDevice, this.patchRadius));
            this.on('attr:lod0BladeSegs', () => this._updateGrassMesh(this.app.graphicsDevice, this.patchRadius));
            this.on('attr:lod1BladeSegs', () => this._updateGrassMesh(this.app.graphicsDevice, this.patchRadius));
        }
        update(dt) {
            const cameraPos = this._cameraEntity.getPosition();
            const existsTexs = !!this.textures && this.textures.length > 0;
            const color = existsTexs ? this.textures[0].color : pc.Color.WHITE;
            const rand = existsTexs ? this.textures[0].colorRandom : pc.Vec3.ZERO;
            const tex = existsTexs ? this.textures[0].diffuse.resource : null;
            if (!this.freezeDrawPos) {
                this._lastDrawPos.copy(cameraPos);
            }
            this._time += dt;
            this._material.setParameter(GrassShaderChunk_mjs_1.timeParamName, this._time);
            this._material.setParameter(GrassShaderChunk_mjs_1.windIntensityParamName, this.windIntensity);
            this._material.setParameter(GrassShaderChunk_mjs_1.drawPosParamName, [this._lastDrawPos.x, this._lastDrawPos.y, this._lastDrawPos.z]);
            this._material.setParameter('uDiffuseColor', [color.r, color.g, color.b]);
            this._material.setParameter('uDiffuseColorRandom', [rand.x, rand.y, rand.z]);
            this._material.setParameter('uDiffuseTex', tex);
            this._frustum(cameraPos, this._cameraEntity.camera.camera, this.freezeDrawPos);
        }
        updateAabb() {
            var _a;
            const terrain = this._terrainEditor.terrain;
            const halfWidth = terrain.width / 2;
            const halfDepth = terrain.depth / 2;
            (_a = this._aabb) !== null && _a !== void 0 ? _a : (this._aabb = new pc.BoundingBox());
            this._aabb.setMinMax(new pc.Vec3(-halfWidth, terrain.minHeight, -halfDepth), new pc.Vec3(+halfWidth, terrain.maxHeight, +halfDepth));
            if (this._meshInst) {
                this._meshInst.setCustomAabb(this._aabb);
            }
        }
        _frustumHelper(count, quadMatrix, quadOffset, minMaxStore, offsetArr, inverse, cameraPos, camera, freeze) {
            const checkRadius = this.checkRadius;
            const minHeight = this._terrainEditor.terrain.minHeight;
            const maxHeight = this._terrainEditor.terrain.maxHeight;
            const frustumPlanes = camera.frustum.planes;
            const checkIsVisible = (min, max) => {
                for (let p = 0; p < 6; p++) {
                    const frustumPlane = frustumPlanes[p];
                    const d = Math.max(min.x * frustumPlane[0], max.x * frustumPlane[0])
                        + Math.max(min.y * frustumPlane[1], max.y * frustumPlane[1])
                        + Math.max(min.z * frustumPlane[2], max.z * frustumPlane[2])
                        + frustumPlane[3];
                    if (d <= 0) {
                        return false;
                    }
                }
                return true;
            };
            let visibleCount = 0;
            for (let i = 0; i < count; i++) {
                if (!minMaxStore[i])
                    minMaxStore[i] = [new pc.Vec3(), new pc.Vec3(), false];
                if (!freeze) {
                    const quadMatrixX = quadMatrix[i * 2 + 0];
                    const quadMatrixZ = quadMatrix[i * 2 + 1];
                    const localCenterX = this.radius * (quadMatrixX - quadOffset);
                    const localCenterZ = this.radius * (quadMatrixZ - quadOffset);
                    const worldCenterX = cameraPos.x + localCenterX;
                    const worldCenterZ = cameraPos.z + localCenterZ;
                    minMaxStore[i][0].set(worldCenterX - checkRadius, minHeight, worldCenterZ - checkRadius);
                    minMaxStore[i][1].set(worldCenterX + checkRadius, maxHeight, worldCenterZ + checkRadius);
                    const visible = checkIsVisible(minMaxStore[i][0], minMaxStore[i][1]);
                    if (visible) {
                        offsetArr[visibleCount * 2 + 0] = localCenterX;
                        offsetArr[visibleCount * 2 + 1] = localCenterZ;
                    }
                    minMaxStore[i][2] = visible;
                }
                const min = minMaxStore[i][0];
                const max = minMaxStore[i][1];
                const vis = minMaxStore[i][2];
                if (freeze) {
                    (0, Debug_mjs_2.drawBox)({ min, max, color: vis ? pc.Color.GREEN : pc.Color.RED });
                }
                visibleCount += Number(vis);
            }
            if (!freeze && inverse && visibleCount > 0) {
                const hiddenCount = count - visibleCount;
                for (let i = visibleCount; i > -1; i--) {
                    const indexIn = (hiddenCount + i) * 2;
                    const indexOr = i * 2;
                    offsetArr[indexIn + 0] = offsetArr[indexOr + 0];
                    offsetArr[indexIn + 1] = offsetArr[indexOr + 1];
                }
            }
            return visibleCount;
        }
        _frustum(cameraPos, camera, freeze) {
            var _a;
            const visibleLod1Count = this._frustumHelper(lod1QuadCount, exports.quad1Matrix, 1, this._lod1MinMaxStore, this._offsetLod1Arr, false, cameraPos, camera, freeze);
            const visibleLod2Count = this._frustumHelper(lod2QuadCount, exports.quad2Matrix, 2, this._lod2MinMaxStore, this._offsetLod2Arr, true, cameraPos, camera, freeze);
            const meshInst = this._meshInst;
            const mesh = meshInst.mesh;
            const primitive = mesh.primitive[0];
            const base = this.lod2BladeSegs * 12 * (lod2QuadCount - visibleLod2Count);
            const count = this.lod0BladeSegs * 12
                + this.lod1BladeSegs * 12 * visibleLod1Count
                + this.lod2BladeSegs * 12 * visibleLod2Count;
            meshInst.setParameter(`${GrassShaderChunk_mjs_1.offsetXZParamName}[0]`, this._offsetLod1Arr);
            meshInst.setParameter(`${GrassShaderChunk_mjs_1.offset2XZParamName}[0]`, this._offsetLod2Arr);
            // always true for lod 0
            meshInst.visible = this.autoRender || freeze;
            meshInst.visibleThisFrame = this.autoRender || freeze;
            primitive.base = base;
            primitive.count = count;
            if ((_a = this.app.keyboard) === null || _a === void 0 ? void 0 : _a.wasReleased(pc.KEY_V)) {
                console.log(visibleLod1Count);
                console.log(visibleLod2Count);
                console.log(this._offsetLod1Arr);
                console.log(this._offsetLod2Arr);
            }
        }
        _updateGrassMesh(graphicsDevice, radius) {
            this._updateMeshBuffers(graphicsDevice);
            this._updateMeshMaterial(graphicsDevice);
            this._updateMeshInstance(graphicsDevice);
            this._updateMeshInstancing(graphicsDevice, radius);
            this.updateAabb();
            const meshInstances = [this._meshInst];
            if (this.entity.render) {
                this.entity.render.meshInstances = meshInstances;
            }
            else {
                this.entity.addComponent('render', {
                    meshInstances: meshInstances,
                    castShadows: this.castShadow,
                    receiveShadows: this.receiveShadow,
                    cull: false,
                });
            }
            this._meshInst.castShadow = this.castShadow;
            this._meshInst.receiveShadow = this.receiveShadow;
        }
        _updateMeshInstancing(graphicsDevice, radius) {
            var _a, _b, _c;
            if (this._meshInst) {
                this._updateInstancingBuffer(graphicsDevice, radius);
                (_c = (_b = (_a = this._meshInst) === null || _a === void 0 ? void 0 : _a.instancingData) === null || _b === void 0 ? void 0 : _b.vertexBuffer) === null || _c === void 0 ? void 0 : _c.destroy();
                this._meshInst.setInstancing(this._sharedInstancingBuffer);
            }
        }
        _updateMeshInstance(graphicsDevice) {
            var _a, _b, _c, _d;
            (_c = (_b = (_a = this._meshInst) === null || _a === void 0 ? void 0 : _a.instancingData) === null || _b === void 0 ? void 0 : _b.vertexBuffer) === null || _c === void 0 ? void 0 : _c.destroy();
            (_d = this._meshInst) === null || _d === void 0 ? void 0 : _d.destroy();
            const mesh = new pc.Mesh(graphicsDevice);
            const primitive = mesh.primitive[0];
            mesh.indexBuffer[0] = this._sharedIndexBuffer;
            mesh.vertexBuffer = this._sharedVertexBuffer;
            primitive.type = this.wireframe ? pc.PRIMITIVE_LINES : pc.PRIMITIVE_TRIANGLES;
            primitive.base = 0;
            primitive.count = this._bufferStore.index.length;
            primitive.indexed = true;
            this._meshInst = new pc.MeshInstance(mesh, this._material, this.entity);
        }
        /**
        * Sets up indices for single blade mesh.
        * @param id array of indices
        * @param vc1 vertex start offset for front side of blade
        * @param vc2 vertex start offset for back side of blade
        * @param i index offset
        */
        _initBladeIndices(id, vc1, vc2, i, bladeSegs) {
            let seg;
            // blade front side
            for (seg = 0; seg < bladeSegs; ++seg) {
                id[i++] = vc1 + 0; // tri 1
                id[i++] = vc1 + 1;
                id[i++] = vc1 + 2;
                id[i++] = vc1 + 2; // tri 2
                id[i++] = vc1 + 1;
                id[i++] = vc1 + 3;
                vc1 += 2;
            }
            // blade back side
            for (seg = 0; seg < bladeSegs; ++seg) {
                id[i++] = vc2 + 2; // tri 1
                id[i++] = vc2 + 1;
                id[i++] = vc2 + 0;
                id[i++] = vc2 + 3; // tri 2
                id[i++] = vc2 + 1;
                id[i++] = vc2 + 2;
                vc2 += 2;
            }
            return i;
        }
        /** Set up indices for 1 blade */
        _initBladeIndexVerts(vindex) {
            for (let i = 0; i < vindex.length; ++i) {
                vindex[i] = i;
            }
        }
        _initBladeOffsetShapeVerts(offsetShape, radius, numBlades) {
            const normalizeValue = offsetShape instanceof Uint16Array ? pc.FloatPacking.float2Half : (x) => x;
            const random = new Random_mjs_1.default(this.seed);
            const heightFactor = this.bladeMaxHeight - this.bladeMinHeight;
            //let noise = 0;
            for (let i = 0; i < numBlades; ++i) {
                //noise = Math.abs(simplex(offsetShape[i * 8 + 0] * 0.03, offsetShape[i * 8 + 2] * 0.03));
                //noise = noise * noise * noise;
                //noise *= 5.0;
                const x = random.nrand() * radius;
                const y = random.nrand() * radius;
                const z = 0;
                const rotation = Math.PI * 2.0 * random.random();
                const width = this.bladeWidth + random.random() * this.bladeWidth * 0.5;
                const height = this.bladeMinHeight + Math.pow(random.random(), 4.0) * heightFactor;
                const lean = 0.01 + random.random() * 0.3;
                const curve = 0.05 + random.random() * 0.3;
                offsetShape[i * 8 + 0] = normalizeValue(x); // x
                offsetShape[i * 8 + 1] = normalizeValue(y); // y
                offsetShape[i * 8 + 2] = normalizeValue(z); // z
                offsetShape[i * 8 + 3] = normalizeValue(rotation); // rot
                offsetShape[i * 8 + 4] = normalizeValue(width); // width
                offsetShape[i * 8 + 5] = normalizeValue(height); //+ noise; //+ height
                offsetShape[i * 8 + 6] = normalizeValue(lean); // lean
                offsetShape[i * 8 + 7] = normalizeValue(curve); // curve
            }
        }
        _updateInstancingBuffer(graphicsDevice, radius) {
            var _a;
            (_a = this._sharedInstancingBuffer) === null || _a === void 0 ? void 0 : _a.destroy();
            const lod0PatchCount = 1;
            const lod1PatchCount = 8;
            const lod2PatchCount = 16;
            const patchNumBlades = (this.numBlades / (lod0PatchCount + lod1PatchCount + lod2PatchCount)) | 0;
            const offsetAndShapeLength = patchNumBlades * 8;
            if (this._bufferStore.offsetAndShape === undefined ||
                this._bufferStore.offsetAndShape.length !== offsetAndShapeLength) {
                this._bufferStore.offsetAndShape = new Float32Array(offsetAndShapeLength);
            }
            this._initBladeOffsetShapeVerts(this._bufferStore.offsetAndShape, radius, patchNumBlades);
            const type = this._bufferStore.offsetAndShape instanceof Uint16Array ? pc.TYPE_FLOAT16 : pc.TYPE_FLOAT32;
            const instancingFormat = new pc.VertexFormat(graphicsDevice, [
                {
                    semantic: pc.SEMANTIC_ATTR10,
                    components: 4,
                    type: type,
                    normalize: false,
                    asInt: false
                },
                {
                    semantic: pc.SEMANTIC_ATTR11,
                    components: 4,
                    type: type,
                    normalize: false,
                    asInt: false,
                },
            ]);
            this._sharedInstancingBuffer = new pc.VertexBuffer(graphicsDevice, instancingFormat, patchNumBlades, {
                usage: pc.BUFFER_STATIC,
                data: this._bufferStore.offsetAndShape,
                storage: false,
            });
        }
        _getVertexFormat(graphicsDevice) {
            return new pc.VertexFormat(graphicsDevice, [{
                    semantic: pc.SEMANTIC_POSITION,
                    components: 1,
                    type: pc.TYPE_FLOAT32,
                    normalize: false,
                    asInt: false
                }]);
        }
        _updateMeshBuffers(graphicsDevice) {
            var _a, _b;
            (_a = this._sharedIndexBuffer) === null || _a === void 0 ? void 0 : _a.destroy();
            (_b = this._sharedVertexBuffer) === null || _b === void 0 ? void 0 : _b.destroy();
            const lod0VC = (this.lod0BladeSegs + 1) * 2;
            const lod1VC = (this.lod1BladeSegs + 1) * 2;
            const lod2VC = (this.lod2BladeSegs + 1) * 2;
            const indexLength = this.lod0BladeSegs * 12 + this.lod1BladeSegs * 12 * lod1QuadCount + this.lod2BladeSegs * 12 * lod2QuadCount;
            const indexVertsLength = lod0VC * 2 + lod1VC * 2 * lod1QuadCount + lod2VC * 2 * lod2QuadCount;
            if (this._bufferStore.index === undefined ||
                this._bufferStore.index.length !== indexLength) {
                this._bufferStore.index = new Uint16Array(indexLength);
                let index = 0;
                for (let i = 0; i < lod2QuadCount; i++) {
                    const lod2VC1 = i * lod2VC * 2;
                    const lod2VC2 = lod2VC1 + lod2VC;
                    index = this._initBladeIndices(this._bufferStore.index, lod2VC1, lod2VC2, index, this.lod2BladeSegs);
                }
                const lod0VC1 = lod2QuadCount * lod2VC * 2;
                const lod0VC2 = lod0VC1 + lod0VC;
                index = this._initBladeIndices(this._bufferStore.index, lod0VC1, lod0VC2, index, this.lod0BladeSegs);
                for (let i = 0; i < lod1QuadCount; i++) {
                    const lod1VC1 = lod0VC2 + lod0VC + i * lod1VC * 2;
                    const lod1VC2 = lod1VC1 + lod1VC;
                    index = this._initBladeIndices(this._bufferStore.index, lod1VC1, lod1VC2, index, this.lod1BladeSegs);
                }
            }
            if (this._bufferStore.indexVerts === undefined ||
                this._bufferStore.indexVerts.length !== indexVertsLength) {
                this._bufferStore.indexVerts = new Float32Array(indexVertsLength);
                this._initBladeIndexVerts(this._bufferStore.indexVerts);
            }
            this._sharedIndexBuffer = new pc.IndexBuffer(graphicsDevice, pc.INDEXFORMAT_UINT16, this._bufferStore.index.length, pc.BUFFER_STATIC, this._bufferStore.index, { storage: false });
            this._sharedVertexBuffer = new pc.VertexBuffer(graphicsDevice, this._getVertexFormat(graphicsDevice), this._bufferStore.indexVerts.length, {
                usage: pc.BUFFER_STATIC,
                data: this._bufferStore.indexVerts,
                storage: false,
            });
        }
        _updateMeshMaterial(graphicsDevice) {
            var _a;
            (_a = this._material) === null || _a === void 0 ? void 0 : _a.destroy();
            this._material = new pc.StandardMaterial();
            this._material.name = "GrassFieldMaterial";
            this._material.blendType = pc.BLEND_NONE;
            const terrain = this._terrainEditor.terrain;
            const patches = this._terrainEditor.terrainRenderPreparer.patchesStore;
            const heightMap = patches.heightMapTexture;
            this._material.setAttribute(GrassShaderChunk_mjs_1.vindexAttrName, pc.SEMANTIC_POSITION);
            this._material.setAttribute(GrassShaderChunk_mjs_1.offsetAttrName, pc.SEMANTIC_ATTR10);
            this._material.setAttribute(GrassShaderChunk_mjs_1.shapeAttrName, pc.SEMANTIC_ATTR11);
            this._material.setParameter('uDataMap', this._dataTexture.texture);
            this._material.setParameter(TerrainPatchesShaderChunks_mjs_5.terrainHeightMapParamName, heightMap);
            this._material.setParameter(TerrainPatchesShaderChunks_mjs_5.terrainMinHeightParamName, terrain.minHeight);
            this._material.setParameter(TerrainPatchesShaderChunks_mjs_5.terrainMaxHeightParamName, terrain.maxHeight);
            this._material.setParameter(`${GrassShaderChunk_mjs_1.offsetXZParamName}[0]`, this._offsetLod1Arr);
            this._material.setParameter(`${GrassShaderChunk_mjs_1.offset2XZParamName}[0]`, this._offsetLod2Arr);
            this._material.setParameter(GrassShaderChunk_mjs_1.drawPosParamName, [0, 0, 0]);
            this._material.setParameter(GrassShaderChunk_mjs_1.timeParamName, this._time);
            this._material.setParameter(GrassShaderChunk_mjs_1.windIntensityParamName, 0);
            const hmFormat = (0, TerrainPatches_mjs_2.getHeightMapFormat)(graphicsDevice, terrain.heightMap);
            const chunks = (0, GrassShaderChunk_mjs_1.getGrassShaderChunks)({
                width: terrain.width,
                depth: terrain.depth,
                heightMapChunkSize: terrain.heightMap.dataChunkSize,
                heightMapFormat: hmFormat,
                bladeMaxHeight: this.bladeMaxHeight * 1.5,
                lod0BladeSegs: this.lod0BladeSegs,
                lod1BladeSegs: this.lod1BladeSegs,
                lod2BladeSegs: this.lod2BladeSegs,
                radius: this.radius,
                transitionLow: this.transitionLow,
                transitionHigh: this.transitionHigh,
            });
            const chunkNames = Object.keys(chunks);
            for (let chunkName of chunkNames) {
                this._material.chunks[chunkName] = chunks[chunkName];
            }
            this._material.chunks.APIVersion = pc.CHUNKAPI_1_70;
            this._material.update();
        }
    }
    exports.GrassField = GrassField;
    exports.default = GrassField;
    exports.grassFieldScriptName = "grassField";
    pc.registerScript(GrassField, exports.grassFieldScriptName);
    GrassField.attributes.add("painting", { type: "boolean", default: false });
    GrassField.attributes.add("castShadow", { type: "boolean", default: true, });
    GrassField.attributes.add("receiveShadow", { type: "boolean", default: true, });
    GrassField.attributes.add("wireframe", { type: "boolean", default: false });
    GrassField.attributes.add("freezeDrawPos", { type: "boolean", default: false });
    GrassField.attributes.add("autoRender", { type: "boolean", default: true });
    GrassField.attributes.add("seed", { type: "number", default: 53464546455, min: 1, step: 1, precision: 0 });
    GrassField.attributes.add("windIntensity", { type: "number", default: 0, min: -30, max: 30 });
    GrassField.attributes.add("numBlades", { type: "number", default: 4000, min: 0, max: 8000000, step: 1, precision: 0 });
    GrassField.attributes.add("radius", { type: "number", default: 80, min: 1, max: 10000 });
    GrassField.attributes.add("lod0BladeSegs", { type: "number", default: 3, min: 1, max: 10, step: 1, precision: 0 });
    GrassField.attributes.add("lod1BladeSegs", { type: "number", default: 2, min: 1, max: 10, step: 1, precision: 0 });
    GrassField.attributes.add("lod2BladeSegs", { type: "number", default: 1, min: 1, max: 10, step: 1, precision: 0 });
    GrassField.attributes.add("bladeWidth", { type: "number", default: 0.04, min: 0.01, max: 5 });
    GrassField.attributes.add("bladeMinHeight", { type: "number", default: 0.25, min: 0.01, max: 10 });
    GrassField.attributes.add("bladeMaxHeight", { type: "number", default: 1, min: 0.01, max: 10 });
    GrassField.attributes.add("textures", {
        type: "json",
        array: true,
        schema: [
            {
                name: "name",
                title: "Name",
                type: "string",
            },
            {
                name: "diffuse",
                title: "Diffuse",
                type: "asset",
                assetType: "texture",
            },
            {
                name: "color",
                title: "Color",
                type: "rgb"
            },
            {
                name: "colorRandom",
                title: "Color Random",
                type: "vec3",
                default: [0.01, 0.01, 0.01]
            }
        ]
    });
});
define("src/Shared/Vector2Math", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Vector2Math = void 0;
    exports.distanceX1Z1X2Z2 = distanceX1Z1X2Z2;
    /**
     * Returns the Euclidean distance between the two given points.
     */
    function distanceX1Z1X2Z2(x1, z1, x2, z2) {
        const dx = x1 - x2;
        const dz = z1 - z2;
        const ls = dx * dx + dz * dz;
        return Math.sqrt(ls);
    }
    exports.Vector2Math = {
        distanceX1Z1X2Z2,
    };
    exports.default = exports.Vector2Math;
});
;
(() => {
    if (window.___amd___requireResolver) {
        window.___amd___requireResolver();
    }
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVycmFpbi1zeXN0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zYXNyYy9yZXF1cmVkU3RhcnQuanMiLCIuLi8uLi9zcmMvRW5naW5lRXh0ZW5zaW9ucy9SZW5kZXJlci5tdHMiLCIuLi8uLi9zcmMvU2hhcmVkL1R5cGVzLm10cyIsIi4uLy4uL3NyYy9HcmFzc0ZpZWxkSGVscGVycy9HcmFzc0ZpZWxkVGV4dHVyZS5tdHMiLCIuLi8uLi9zcmMvU2hhcmVkL0NvbXByZXNzb3IubXRzIiwiLi4vLi4vc3JjL1RlcnJhaW5TeXN0ZW0vQWJzSGVpZ2h0TWFwRmlsZUlPLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluU3lzdGVtL0lab25lLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluU3lzdGVtL0Fic0hlaWdodE1hcC5tdHMiLCIuLi8uLi9zcmMvVGVycmFpbkhlbHBlcnMvVGVycmFpblBhdGNoZXNTaGFkZXJDaHVua3MubXRzIiwiLi4vLi4vc3JjL0dyYXNzRmllbGRIZWxwZXJzL0dyYXNzU2hhZGVyQ2h1bmsubXRzIiwiLi4vLi4vc3JjL0dyYXNzRmllbGRIZWxwZXJzL3NpbXBsZXgubXRzIiwiLi4vLi4vc3JjL1NoYXJlZC9EZWJ1Zy5tdHMiLCIuLi8uLi9zcmMvU2hhcmVkL1V0aWxzLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluU3lzdGVtL0Nvb3Jkc0J1ZmZlci5tdHMiLCIuLi8uLi9zcmMvVGVycmFpblN5c3RlbS9IZWlnaHRNYXAubXRzIiwiLi4vLi4vc3JjL1RlcnJhaW5TeXN0ZW0vQWJzUGF0Y2hlZEhlaWdodE1hcC5tdHMiLCIuLi8uLi9zcmMvVGVycmFpblN5c3RlbS9Mb2RJbmZvLm10cyIsIi4uLy4uL3NyYy9TaGFyZWQvU3RvcmUyRC5tdHMiLCIuLi8uLi9zcmMvU2hhcmVkL1ZlY3RvcjNNYXRoLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluU3lzdGVtL0xvZE1hbmFnZXIubXRzIiwiLi4vLi4vc3JjL1RlcnJhaW5TeXN0ZW0vR3JpZEJ1aWxkZXIubXRzIiwiLi4vLi4vc3JjL1RlcnJhaW5TeXN0ZW0vR2VvbWlwR3JpZEJ1aWxkZXIubXRzIiwiLi4vLi4vc3JjL1RlcnJhaW5TeXN0ZW0vR2VvbWlwR3JpZFJlbmRlclByZXBhcmVyLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluU3lzdGVtL0dlb21pcEdyaWQubXRzIiwiLi4vLi4vc3JjL1RlcnJhaW5TeXN0ZW0vVGVycmFpbi5tdHMiLCIuLi8uLi9zcmMvVGVycmFpblN5c3RlbS9NaWRwb2ludERpc3BUZXJyYWluLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluU3lzdGVtL1RlcnJhaW5SYXljYXN0UmVzdWx0Lm10cyIsIi4uLy4uL3NyYy9UZXJyYWluU3lzdGVtL1BhdGNoSW5zdGFuY2luZy5tdHMiLCIuLi8uLi9zcmMvVGVycmFpbkhlbHBlcnMvVGVycmFpblBhdGNoZXNJbnN0YW5jaW5nLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluSGVscGVycy9UZXJyYWluUGF0Y2hlc0Jhc2ljLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluU3lzdGVtL0NvbXByZXNzZWRQYXRjaGVkSGVpZ2h0TWFwLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluSGVscGVycy9UZXJyYWluUGF0Y2hlcy5tdHMiLCIuLi8uLi9zcmMvVGVycmFpbkhlbHBlcnMvVGVycmFpblJlbmRlclByZXBhcmVyLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluSGVscGVycy9CcnVzaC5tdHMiLCIuLi8uLi9zcmMvVGVycmFpbkhlbHBlcnMvQ29sb3JQYWludGVyU2hhZGVycy5tdHMiLCIuLi8uLi9zcmMvVGVycmFpbkhlbHBlcnMvU2hhcmVkLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluSGVscGVycy9Db2xvclBhaW50ZXIubXRzIiwiLi4vLi4vc3JjL1NoYXJlZC9FbnVtQ29udmVydGVyLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluSGVscGVycy9FbnVtcy5tdHMiLCIuLi8uLi9zcmMvVGVycmFpblN5c3RlbS9UcmlhbmdsZS5tdHMiLCIuLi8uLi9zcmMvVGVycmFpblN5c3RlbS9IZWlnaHRmaWVsZFNoYXBlLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluU3lzdGVtL1BhdGNoZWRIZWlnaHRNYXAubXRzIiwiLi4vLi4vc3JjL1RlcnJhaW5IZWxwZXJzL0ZydXN0dW0ubXRzIiwiLi4vLi4vc3JjL1NjcmlwdHMvQmlnVGVycmFpbkVkaXRvci5tdHMiLCIuLi8uLi9zcmMvU2NyaXB0cy9GbHlDYW1lcmEubXRzIiwiLi4vLi4vc3JjL1NjcmlwdHMvRnBzQ291bnRlci5tdHMiLCIuLi8uLi9zcmMvU2hhcmVkL1JhbmRvbS5tdHMiLCIuLi8uLi9zcmMvU2NyaXB0cy9HcmFzc0ZpZWxkLm10cyIsIi4uLy4uL3NyYy9TaGFyZWQvVmVjdG9yMk1hdGgubXRzIiwiLi4vLi4vc3pzcmMvcmVxdXJlZEZpbmlzaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsQ0FBQztBQUFBLENBQUMsR0FBRyxFQUFFO0lBRU4sTUFBTSxJQUFJLEdBQU8sRUFBRSxDQUFDO0lBQ3BCLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUVwQixtQ0FBbUM7SUFDbkMsTUFBTSxDQUFDLHVCQUF1QixHQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDaEQsTUFBTSxDQUFDLHdCQUF3QixHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFFakQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFdkMsTUFBTSxNQUFNLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO1lBRXBDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUNuRCxDQUFDO1lBRUQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFB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QUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1lBQ3BDLE9BQU8sSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDNUMsQ0FBQztLQUNEO0lBRUQsTUFBTSxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUNuQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRWpDLE1BQU0sSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzNCLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRTVCLE1BQU0sS0FBSyxHQUFHO1FBQ2IsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztRQUN0RSxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdEUsQ0FBQTtJQUVELE1BQU0sQ0FBQyxHQUFHO1FBQ1QsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFO1FBQ3BCLEdBQUcsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsQ0FBQyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFO1FBQzNFLEdBQUcsRUFBRSxDQUFDLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLEVBQUU7UUFDM0UsRUFBRSxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxHQUFHO1FBQzNFLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsR0FBRztRQUMzRSxHQUFHLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUUsQ0FBQyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUUsRUFBRSxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUc7UUFDM0UsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUc7UUFDM0UsQ0FBQyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsRUFBRTtRQUMzRSxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFFLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFFLEVBQUUsRUFBQyxHQUFHLEVBQUMsQ0FBQztRQUMzRSxHQUFHLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUUsRUFBRSxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsR0FBRztRQUMzRSxHQUFHLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRztRQUMzRSxFQUFFLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFFLENBQUMsRUFBQyxHQUFHLEVBQUMsR0FBRztRQUMzRSxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxF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SUFDL0MsQ0FBQztJQUVELFNBQWdCLFNBQVMsQ0FDckIsRUFBQyxNQUFNLEVBQUUsTUFBTSxHQUFHLEdBQUcsRUFBRSxXQUFXLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsU0FBUyxHQUFHLEtBQUssRUFDOEI7UUFFcEgsTUFBTSxLQUFLLEdBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQixNQUFNLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDOUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsV0FBVyxDQUFDO1FBRXZDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUVkLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUVuQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFN0IsS0FBSyxJQUFJLElBQUksQ0FBQztZQUVkLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDN0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUU3QixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBRXBCLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN6QixNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztZQUV6QyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztZQUN6QyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDekIsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFFekMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBRXpDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztZQUMxQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztZQUUxQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztZQUMxQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztZQUMxQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFFMUIsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDMUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDMUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFFRCxFQUFFLENBQUMsR0FBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQsU0FBZ0IsT0FBTyxDQUNuQixFQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxTQUFTLEdBQUcsS0FBSyxFQUNnQzs7UUFFekYsTUFBQSxFQUFFLENBQUMsR0FBRywwQ0FBRSxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbEUsQ0FBQzs7Ozs7SUM2RUQsa0NBVUM7SUFHRCxzQ0FJQztJQUVELDBCQWFDO0lBRUQsc0JBRUM7SUFFRCxrQ0FFQztJQUVELDRDQVdDO0lBRUQsZ0RBYUM7SUFHRCxzQkFFQztJQXRORCwwRkFBMEY7SUFFMUYsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBRWhELFNBQVMsZUFBZTtRQUV2Qiw2QkFBNkI7UUFFN0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxXQUFXLENBQUUsQ0FBQyxDQUFFLENBQUM7UUFDcEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxZQUFZLENBQUUsTUFBTSxDQUFFLENBQUM7UUFDN0MsTUFBTSxVQUFVLEdBQUcsSUFBSSxXQUFXLENBQUUsTUFBTSxDQUFFLENBQUM7UUFFN0MsTUFBTSxTQUFTLEdBQUcsSUFBSSxXQUFXLENBQUUsR0FBRyxDQUFFLENBQUM7UUFDekMsTUFBTSxVQUFVLEdBQUcsSUFBSSxXQUFXLENBQUUsR0FBRyxDQUFFLENBQUM7UUFFMUMsS0FBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxFQUFHLENBQUMsRUFBRyxDQUFDO1lBRWpDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7WUFFbEIsNEJBQTRCO1lBRTVCLElBQUssQ0FBQyxHQUFHLENBQUUsRUFBRSxFQUFHLENBQUM7Z0JBRWhCLFNBQVMsQ0FBRSxDQUFDLENBQUUsR0FBRyxNQUFNLENBQUM7Z0JBQ3hCLFNBQVMsQ0FBRSxDQUFDLEdBQUcsS0FBSyxDQUFFLEdBQUcsTUFBTSxDQUFDO2dCQUNoQyxVQUFVLENBQUUsQ0FBQyxDQUFFLEdBQUcsRUFBRSxDQUFDO2dCQUNyQixVQUFVLENBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBRSxHQUFHLEVBQUUsQ0FBQztnQkFFN0Isd0JBQXdCO1lBRXpCLENBQUM7aUJBQU0sSUFBSyxDQUFDLEdBQUcsQ0FBRSxFQUFFLEVBQUcsQ0FBQztnQkFFdkIsU0FBUyxDQUFFLENBQUMsQ0FBRSxHQUFHLE1BQU0sSUFBSSxDQUFFLENBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBRSxDQUFDO2dCQUN4QyxTQUFTLENBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBRSxHQUFHLENBQUUsTUFBTSxJQUFJLENBQUUsQ0FBRSxDQUFDLEdBQUcsRUFBRSxDQUFFLENBQUUsR0FBRyxNQUFNLENBQUM7Z0JBQzdELFVBQVUsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzFCLFVBQVUsQ0FBRSxDQUFDLEdBQUcsS0FBSyxDQUFFLEdBQUcsQ0FBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUVsQyxnQkFBZ0I7WUFFakIsQ0FBQztpQkFBTSxJQUFLLENBQUMsSUFBSSxFQUFFLEVBQUcsQ0FBQztnQkFFdEIsU0FBUyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBRSxJQUFJLEVBQUUsQ0FBQztnQkFDbEMsU0FBUyxDQUFFLENBQUMsR0FBRyxLQUFLLENBQUUsR0FBRyxDQUFFLENBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBRSxJQUFJLEVBQUUsQ0FBRSxHQUFHLE1BQU0sQ0FBQztnQkFDdkQsVUFBVSxDQUFFLENBQUMsQ0FBRSxHQUFHLEVBQUUsQ0FBQztnQkFDckIsVUFBVSxDQUFFLENBQUMsR0FBRyxLQUFLLENBQUUsR0FBRyxFQUFFLENBQUM7Z0JBRTdCLHFDQUFxQztZQUV0QyxDQUFDO2lCQUFNLElBQUssQ0FBQyxHQUFHLEdBQUcsRUFBRyxDQUFDO2dCQUV0QixTQUFTLENBQUUsQ0FBQyxDQUFFLEdBQUcsTUFBTSxDQUFDO2dCQUN4QixTQUFTLENBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBRSxHQUFHLE1BQU0sQ0FBQztnQkFDaEMsVUFBVSxDQUFFLENBQUMsQ0FBRSxHQUFHLEVBQUUsQ0FBQztnQkFDckIsVUFBVSxDQUFFLENBQUMsR0FBRyxLQUFLLENBQUUsR0FBRyxFQUFFLENBQUM7Z0JBRTdCLGtDQUFrQztZQUVuQyxDQUFDO2lCQUFNLENBQUM7Z0JBRVAsU0FBUyxDQUFFLENBQUMsQ0FBRSxHQUFHLE1BQU0sQ0FBQztnQkFDeEIsU0FBUyxDQUFFLENBQUMsR0FBRyxLQUFLLENBQUUsR0FBRyxNQUFNLENBQUM7Z0JBQ2hDLFVBQVUsQ0FBRSxDQUFDLENBQUUsR0FBRyxFQUFFLENBQUM7Z0JBQ3JCLFVBQVUsQ0FBRSxDQUFDLEdBQUcsS0FBSyxDQUFFLEdBQUcsRUFBRSxDQUFDO1lBRTlCLENBQUM7UUFFRixDQUFDO1FBRUQsNkJBQTZCO1FBRTdCLE1BQU0sYUFBYSxHQUFHLElBQUksV0FBVyxDQUFFLElBQUksQ0FBRSxDQUFDO1FBQzlDLE1BQU0sYUFBYSxHQUFHLElBQUksV0FBVyxDQUFFLEVBQUUsQ0FBRSxDQUFDO1FBQzVDLE1BQU0sV0FBVyxHQUFHLElBQUksV0FBVyxDQUFFLEVBQUUsQ0FBRSxDQUFDO1FBRTFDLEtBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRyxDQUFDLEVBQUcsQ0FBQztZQUVsQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMseUJBQXlCO1lBQzFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLGdCQUFnQjtZQUUzQixhQUFhO1lBQ2IsT0FBUSxDQUFFLENBQUMsR0FBRyxVQUFVLENBQUUsS0FBSyxDQUFDLEVBQUcsQ0FBQztnQkFFbkMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDUixDQUFDLElBQUksVUFBVSxDQUFDLENBQUMscUJBQXFCO1lBRXZDLENBQUM7WUFFRCxDQUFDLElBQUksQ0FBRSxVQUFVLENBQUMsQ0FBQyxzQkFBc0I7WUFDekMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLGNBQWM7WUFFL0IsYUFBYSxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFNUIsQ0FBQztRQUVELEtBQU0sSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRyxDQUFDLEVBQUcsQ0FBQztZQUVyQyxhQUFhLENBQUUsQ0FBQyxDQUFFLEdBQUcsVUFBVSxHQUFHLENBQUUsQ0FBRSxDQUFDLEdBQUcsSUFBSSxDQUFFLElBQUksRUFBRSxDQUFFLENBQUM7UUFFMUQsQ0FBQztRQUVELEtBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRyxDQUFDLEVBQUcsQ0FBQztZQUVoQyxhQUFhLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUU5QixDQUFDO1FBRUQsYUFBYSxDQUFFLEVBQUUsQ0FBRSxHQUFHLFVBQVUsQ0FBQztRQUNqQyxhQUFhLENBQUUsRUFBRSxDQUFFLEdBQUcsVUFBVSxDQUFDO1FBRWpDLEtBQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRyxDQUFDLEVBQUcsQ0FBQztZQUVqQyxhQUFhLENBQUUsQ0FBQyxDQUFFLEdBQUcsVUFBVSxHQUFHLENBQUUsQ0FBRSxDQUFDLEdBQUcsRUFBRSxDQUFFLElBQUksRUFBRSxDQUFFLENBQUM7UUFFeEQsQ0FBQztRQUVELGFBQWEsQ0FBRSxFQUFFLENBQUUsR0FBRyxVQUFVLENBQUM7UUFFakMsS0FBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFHLENBQUMsRUFBRyxDQUFDO1lBRWhDLElBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRyxDQUFDO2dCQUVoQixXQUFXLENBQUUsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFDO1lBRXpCLENBQUM7UUFFRixDQUFDO1FBRUQsT0FBTztZQUNOLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLGFBQWEsRUFBRSxhQUFhO1lBQzVCLGFBQWEsRUFBRSxhQUFhO1lBQzVCLFdBQVcsRUFBRSxXQUFXO1NBQ3hCLENBQUM7SUFFSCxDQUFDO0lBRUQscUJBQXFCO0lBRXJCLFNBQWdCLFdBQVcsQ0FBQyxHQUFXO1FBRXRDLElBQUssSUFBSSxDQUFDLEdBQUcsQ0FBRSxHQUFHLENBQUUsR0FBRyxLQUFLO1lBQUcsT0FBTyxDQUFDLElBQUksQ0FBRSxvREFBb0QsQ0FBRSxDQUFDO1FBRXBHLEdBQUcsR0FBRyxLQUFLLENBQUUsR0FBRyxFQUFFLENBQUUsS0FBSyxFQUFFLEtBQUssQ0FBRSxDQUFDO1FBRW5DLE9BQU8sQ0FBQyxTQUFTLENBQUUsQ0FBQyxDQUFFLEdBQUcsR0FBRyxDQUFDO1FBQzdCLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUUsQ0FBQyxDQUFFLENBQUM7UUFDbEMsTUFBTSxDQUFDLEdBQUcsQ0FBRSxDQUFDLElBQUksRUFBRSxDQUFFLEdBQUcsS0FBSyxDQUFDO1FBQzlCLE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFFLENBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBRSxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUUsQ0FBQyxDQUFFLENBQUUsQ0FBQztJQUNuRixDQUFDO0lBRUQscUJBQXFCO0lBQ3JCLFNBQWdCLGFBQWEsQ0FBQyxHQUFXO1FBQ3hDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUM7UUFDcEIsT0FBTyxDQUFDLFVBQVUsQ0FBRSxDQUFDLENBQUUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBRSxHQUFHLEdBQUcsS0FBSyxDQUFFLENBQUUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFFLENBQUMsQ0FBRSxDQUFDO1FBQzNILE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBRSxDQUFDLENBQUUsQ0FBQztJQUMvQixDQUFDO0lBRUQsU0FBZ0IsT0FBTyxDQUFDLEdBQVcsRUFBRSxRQUFnQixFQUFFLE1BQWM7UUFFakUsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzNCLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDMUIsTUFBTSxXQUFXLEdBQUcsUUFBUSxHQUFHLE1BQU0sQ0FBQztRQUV0QyxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFFakIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ25DLE1BQU0sR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQzdCLENBQUM7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRUQsU0FBZ0IsS0FBSyxDQUFDLEtBQWEsRUFBRSxHQUFXLEVBQUUsR0FBVztRQUM1RCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELFNBQWdCLFdBQVc7UUFDdkIsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVELFNBQWdCLGdCQUFnQixDQUFDLEtBQVksRUFBRSxHQUFVO1FBRXJELElBQUksR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFRCxNQUFNLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDO1FBRTFCLE1BQU0sV0FBVyxHQUFHLFdBQVcsRUFBRSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7UUFFbEQsT0FBTyxXQUFXLENBQUM7SUFDdkIsQ0FBQztJQUVELFNBQWdCLGtCQUFrQixDQUFDLENBQU07UUFFckMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBRVosSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDVCxPQUFPLENBQUMsQ0FBQztRQUNiLENBQUM7UUFFRCxPQUFPLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNiLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRCx1Q0FBdUM7SUFDdkMsU0FBZ0IsS0FBSztRQUNwQixPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO0lBQ2pDLENBQUM7Ozs7OztJQ2pNWSxRQUFBLGdCQUFnQixHQUFHLENBQUMsQ0FBQztJQUVsQyxNQUFhLFlBQVk7UUFXckIsSUFBVyx1QkFBdUIsS0FBSyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzdELElBQVcscUJBQXFCLEtBQU8sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUMzRCxJQUFXLHNCQUFzQixLQUFNLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFFaEUsSUFBVyxLQUFLLEtBQVcsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNoRCxJQUFXLEtBQUssS0FBVyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2hELElBQVcsU0FBUyxLQUFPLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFFcEQsWUFBWSxTQUF1QixFQUFFLFNBQWlCO1lBRWxELElBQUksQ0FBQyxTQUFTLEdBQUksU0FBUyxDQUFDO1lBRTVCLDBFQUEwRTtZQUMxRSx1REFBdUQ7WUFFdkQsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7WUFDNUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO1lBQzlCLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztZQUM5QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUVqRCxNQUFNLGVBQWUsR0FBSSxJQUFJLENBQUMsT0FBTyxHQUFHLHdCQUFnQixDQUFDO1lBQ3pELE1BQU0sZ0JBQWdCLEdBQUcsZUFBZSxHQUFHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQztZQUV6RSxJQUFJLENBQUMsS0FBSyxHQUFRLElBQUksV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDcEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBRU0sSUFBSTtZQUVQLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztZQUVkLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBRXZDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBRXZDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzdCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2pDLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUVNLFdBQVcsQ0FBQyxLQUFVLEVBQUUsR0FBd0I7WUFFbkQsTUFBTSxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUVsQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNWLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRVYsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVNLDZCQUE2QixDQUFDLEtBQVUsRUFBRSxHQUF3QjtZQUVyRSxNQUFNLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDbEMsTUFBTSxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBRWxDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFVixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRU0sU0FBUyxDQUFDLEtBQWEsRUFBRSxHQUFhO1lBRXpDLE1BQU0sQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUNsQyxNQUFNLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFFbEMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDVixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVWLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7S0FDSjtJQXRGRCxvQ0FzRkM7SUFFRCxrQkFBZSxZQUFZLENBQUM7Ozs7Ozs7SUM3R2YsUUFBQSxnQkFBZ0IsR0FBRyxZQUFZLENBQUM7SUFFaEMsUUFBQSx1QkFBdUIsR0FBUSxDQUFDLENBQUM7SUFROUMsTUFBYSxTQUFvRixTQUFRLDBCQUFZO1FBV2pILElBQVcsSUFBSSxLQUFNLE9BQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN4RCxJQUFXLEtBQUssS0FBSyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzFDLElBQVcsS0FBSyxLQUFLLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDMUMsSUFBVyxJQUFJLEtBQU0sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFBLENBQUMsQ0FBQztRQUN4QyxJQUFXLE1BQU0sS0FBdUIsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRXhELElBQVcsUUFBUSxLQUFrQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQzdELElBQVcscUJBQXFCLEtBQUssT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1FBRTFFLElBQVcsU0FBUyxLQUFNLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDbkQsSUFBVyxTQUFTLEtBQU0sT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUluRCxZQUFtQixLQUFVLEVBQUUsS0FBVSxFQUFFLFNBQWdCLEVBQUUsU0FBZ0IsRUFBRSxNQUEwQixFQUFFLFdBQWdCLCtCQUF1QixFQUFFLHdCQUE2QixDQUFDO1lBQzlLLEtBQUssRUFBRSxDQUFDO1lBeEJKLFdBQU0sR0FBUSxDQUFDLENBQUM7WUFDaEIsV0FBTSxHQUFRLENBQUMsQ0FBQztZQUNoQixlQUFVLEdBQVUsQ0FBQyxDQUFDO1lBQ3RCLGVBQVUsR0FBVSxDQUFDLENBQUM7WUFzQjFCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU8sRUFBRSxRQUFRLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUM3RixDQUFDO1FBSVMsS0FBSyxDQUFDLEtBQVUsRUFBRSxLQUFVLEVBQUUsU0FBZ0IsRUFBRSxTQUFnQixFQUFFLE1BQTBCLEVBQUUsV0FBZ0IsK0JBQXVCLEVBQUUsd0JBQTZCLENBQUM7WUFFM0ssSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDcEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDcEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7WUFDNUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7WUFFNUIsSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFFVCxJQUFJLFFBQVEsR0FBRyxxQkFBcUIsRUFBRSxDQUFDO29CQUNuQyxNQUFNLElBQUksS0FBSyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7Z0JBQ3ZFLENBQUM7Z0JBRUQsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLFFBQVEsRUFBRSxDQUFDO29CQUM3QyxNQUFNLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7Z0JBQ2pELENBQUM7Z0JBRUQsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO2dCQUMxQixJQUFJLENBQUMsc0JBQXNCLEdBQUcscUJBQXFCLENBQUM7WUFDeEQsQ0FBQztpQkFDSSxDQUFDO2dCQUNGLHFCQUFxQjtnQkFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLHdCQUFnQixDQUFDLEtBQUssR0FBRyxLQUFLLEdBQUcsK0JBQXVCLENBQXFCLENBQUM7Z0JBQy9GLElBQUksQ0FBQyxTQUFTLEdBQUcsK0JBQXVCLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLENBQUM7WUFDcEMsQ0FBQztRQUNMLENBQUM7UUFFUyxtQkFBbUIsQ0FBQyxLQUFZLEVBQUUsS0FBVSxFQUFFLEtBQVk7WUFDaEUsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUN6QixDQUFDO1FBRVMsbUJBQW1CLENBQUMsS0FBNkIsRUFBRSxLQUFVO1lBQ25FLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLENBQUM7UUFFUyxhQUFhLENBQUMsS0FBNkIsRUFBRSxLQUFVLEVBQUUsR0FBVSxFQUFFLEdBQVU7WUFDckYsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUN0RSxDQUFDO1FBRVMseUJBQXlCLENBQUMsS0FBWSxFQUFFLEtBQVUsRUFBRSxVQUFpQixFQUFFLEdBQVUsRUFBRSxHQUFVO1lBRW5HLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDM0QsTUFBTSxNQUFNLEdBQU0sQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFFM0MsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDdEQsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2xELENBQUM7UUFFTSxRQUFRLENBQUMsQ0FBTSxFQUFFLENBQU07WUFDMUIsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDO1FBQ2hGLENBQUM7UUFFTSxTQUFTLENBQUMsQ0FBTSxFQUFFLENBQU07WUFDM0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEMsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBRWUsR0FBRyxDQUFDLENBQU0sRUFBRSxDQUFNO1lBQzlCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNuRixDQUFDO1FBRWUsR0FBRyxDQUFDLENBQU0sRUFBRSxDQUFNLEVBQUUsS0FBWTtZQUM1QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsQyxPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEcsQ0FBQztRQUVNLGVBQWUsQ0FBQyxTQUFnQixFQUFFLFNBQWdCO1lBRXJELElBQUksSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ3BDLE9BQU87WUFDWCxDQUFDO1lBRUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7WUFDNUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDaEMsQ0FBQztRQUVlLE1BQU0sQ0FBQyxDQUFNLEVBQUUsQ0FBTSxFQUFFLEtBQVk7WUFFL0MsTUFBTSxLQUFLLEdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEMsTUFBTSxRQUFRLEdBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMxRixNQUFNLFFBQVEsR0FBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBRW5DLE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6RyxDQUFDO1FBRWUsUUFBUSxDQUFDLENBQU0sRUFBRSxDQUFNLEVBQUUsS0FBWSxFQUFFLGVBQXNCLENBQUM7WUFFMUUsTUFBTSxLQUFLLEdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEMsTUFBTSxRQUFRLEdBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxZQUFZLENBQUM7WUFDMUcsTUFBTSxRQUFRLEdBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztZQUVuQyxPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDekcsQ0FBQztLQUNKO0lBaElELDhCQWdJQztJQUVELGtCQUFlLFNBQVMsQ0FBQzs7Ozs7O0lDbEd6QiwwREFVQzs7SUFaWSxRQUFBLGVBQWUsR0FBRyxDQUFDLENBQUM7SUFFakMsU0FBZ0IsdUJBQXVCLENBQUMsU0FBYyxFQUFFLGFBQWtCO1FBRXRFLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDOUMsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsYUFBYSxHQUFHLENBQUMsR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0csT0FBTyxDQUFDLEtBQUssQ0FBQywwRUFBMEUsRUFBRSxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDcEgsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUN0QixDQUFDO1FBRUQsT0FBTyxhQUFhLENBQUM7SUFDekIsQ0FBQztJQUVELE1BQXNCLG1CQUE4RixTQUFRLHVCQUFnQjtRQWN4SSxJQUFXLFNBQVMsS0FBZSxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQzVELElBQVcsV0FBVyxLQUFhLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDOUQsSUFBVyxXQUFXLEtBQWEsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUM5RCxJQUFXLGFBQWEsS0FBVyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLElBQVcsY0FBYyxLQUFVLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFDakUsSUFBVyxjQUFjLEtBQVUsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUNqRSxJQUFXLG1CQUFtQixLQUFLLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztRQUl0RSxZQUFtQixLQUFVLEVBQUUsS0FBVSxFQUFFLFNBQWMsRUFBRSxhQUFrQixFQUFFLFNBQWdCLEVBQUUsU0FBZ0IsRUFBRSxNQUEwQixFQUFFLFdBQWdCLHVDQUF1QixFQUFFLHdCQUE2QixDQUFDO1lBQ2xOLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTyxDQUFDLGNBQWMsRUFBRSxRQUFRLEVBQUUscUJBQXFCLENBQUMsQ0FBQztZQUNuRyxJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDcEMsQ0FBQztRQUVTLGFBQWEsQ0FBQyxTQUFjO1lBQ2xDLElBQUksQ0FBQyxVQUFVLEdBQUssU0FBUyxDQUFDO1lBQzlCLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLEdBQUcsdUJBQWUsQ0FBQztZQUNuRixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxLQUFLLENBQU0sSUFBSSxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVFLENBQUM7UUFFUyxpQkFBaUIsQ0FBQyxLQUFVO1lBQ2xDLElBQUksQ0FBQyxjQUFjLEdBQUksdUJBQXVCLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN2RSxJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxRSxJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxRSxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDcEksQ0FBQztRQUVlLFFBQVEsQ0FBQyxDQUFNLEVBQUUsQ0FBTTtZQUVuQyxNQUFNLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUN2QyxNQUFNLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUN2QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRW5ELE1BQU0sV0FBVyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFBLElBQUksQ0FBQyxjQUFjLEVBQUksQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUMxRixNQUFNLFVBQVUsR0FBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1lBRTVELE9BQU8sV0FBVyxHQUFHLFVBQVUsQ0FBQztRQUNwQyxDQUFDO1FBRU0sYUFBYSxDQUFDLE1BQVcsRUFBRSxNQUFXO1lBQ3pDLE9BQU8sTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO1FBQ2xELENBQUM7UUFLTSxjQUFjLENBQUMsSUFBUyxFQUFFLE1BQVcsRUFBRSxNQUFXO1lBQ3JELE1BQU0sSUFBSSxHQUFVLFNBQUEsSUFBSSxDQUFDLGFBQWEsRUFBSSxDQUFDLENBQUEsQ0FBQztZQUM1QyxNQUFNLFVBQVUsR0FBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUM7WUFDMUQsTUFBTSxXQUFXLEdBQUcsVUFBVSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1lBQ3BFLE1BQU0sS0FBSyxHQUFTLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDbEYsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUtNLGdCQUFnQixDQUFDLElBQVM7WUFFN0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFdEUsS0FBSyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFFM0QsS0FBSyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztvQkFFM0QsTUFBTSxLQUFLLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO29CQUNyRCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUM5RCxDQUFDO1lBQ0wsQ0FBQztZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7UUFFTSxrQkFBa0IsQ0FBQyxDQUFNLEVBQUUsQ0FBTTtZQUNwQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDL0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQy9DLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVNLGtCQUFrQixDQUFDLENBQU0sRUFBRSxDQUFNO1lBQ3BDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMvQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDL0MsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRU0sd0JBQXdCLENBQUMsQ0FBTSxFQUFFLENBQU07WUFDMUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMvQyxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVNLHdCQUF3QixDQUFDLENBQU0sRUFBRSxDQUFNO1lBQzFDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMvQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDL0MsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2xELENBQUM7UUFFTSxNQUFNO1lBQ1QsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFTSxNQUFNO1lBQ1QsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFTSxZQUFZO1lBQ2YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVFLENBQUM7UUFFTSxZQUFZO1lBQ2YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVFLENBQUM7UUFFTSxXQUFXLENBQUMsVUFBZSxFQUFFLFVBQWU7WUFDL0MsTUFBTSxLQUFLLEdBQUcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUMsR0FBRyx1QkFBZSxDQUFDO1lBQzlFLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFGLENBQUM7UUFFTSxXQUFXLENBQUMsVUFBZSxFQUFFLFVBQWU7WUFDL0MsTUFBTSxLQUFLLEdBQUcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUMsR0FBRyx1QkFBZSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztZQUN6RyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRixDQUFDO1FBRU0saUJBQWlCLENBQUMsVUFBZSxFQUFFLFVBQWU7WUFDckQsTUFBTSxLQUFLLEdBQUcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUMsR0FBRyx1QkFBZSxDQUFDO1lBQzlFLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hHLENBQUM7UUFFTSxpQkFBaUIsQ0FBQyxVQUFlLEVBQUUsVUFBZTtZQUNyRCxNQUFNLEtBQUssR0FBRyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxHQUFHLHVCQUFlLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDO1lBQ3pHLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hHLENBQUM7UUFFUyx3QkFBd0I7WUFFOUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDdkQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNwQyxDQUFDO1FBQ0wsQ0FBQztRQUVNLGVBQWU7WUFFbEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFNUIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO1lBQ2xCLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztZQUVsQixLQUFLLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO2dCQUV4RCxLQUFLLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO29CQUV4RCxNQUFNLFFBQVEsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxHQUFHLHVCQUFlLENBQUM7b0JBQ3pFLE1BQU0sUUFBUSxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUM7b0JBRXJELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbEgsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUVsSCxJQUFJLFNBQVMsR0FBRyxjQUFjLEVBQUUsQ0FBQzt3QkFDN0IsU0FBUyxHQUFHLGNBQWMsQ0FBQzt3QkFDM0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQzdELElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDckUsQ0FBQztvQkFFRCxJQUFJLFNBQVMsR0FBRyxjQUFjLEVBQUUsQ0FBQzt3QkFDN0IsU0FBUyxHQUFHLGNBQWMsQ0FBQzt3QkFDM0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQzdELElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDckUsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7UUFFTSxpQkFBaUIsQ0FBQyxJQUFXO1lBRWhDLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDO2dCQUFFLE9BQU87WUFDMUIsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUM7Z0JBQUUsT0FBTztZQUUxQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVsRCxLQUFLLElBQUksQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBRTFELEtBQUssSUFBSSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFFMUQsTUFBTSxNQUFNLEdBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNqRCxNQUFNLE1BQU0sR0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ2pELE1BQU0sTUFBTSxHQUFLLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztvQkFDckQsTUFBTSxRQUFRLEdBQUcsTUFBTSxHQUFHLHVCQUFlLENBQUM7b0JBQzFDLE1BQU0sUUFBUSxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUM7b0JBRXJELE1BQU0sV0FBVyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO29CQUM3QyxNQUFNLFdBQVcsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztvQkFDN0MsTUFBTSxVQUFVLEdBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7b0JBQ2xELE1BQU0sVUFBVSxHQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO29CQUVsRCxJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7b0JBQ2xDLElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDbEMsSUFBSSxJQUFJLEdBQUcsV0FBVyxDQUFDO29CQUN2QixJQUFJLElBQUksR0FBRyxXQUFXLENBQUM7b0JBQ3ZCLElBQUksSUFBSSxHQUFHLFdBQVcsQ0FBQztvQkFDdkIsSUFBSSxJQUFJLEdBQUcsV0FBVyxDQUFDO29CQUV2QixLQUFLLElBQUksTUFBTSxHQUFHLFdBQVcsR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLFVBQVUsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO3dCQUUvRCxLQUFLLElBQUksTUFBTSxHQUFHLFdBQVcsR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLFVBQVUsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDOzRCQUUvRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQzs0QkFFOUMsSUFBSSxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUM7Z0NBQ2YsR0FBRyxHQUFHLE1BQU0sQ0FBQztnQ0FDYixJQUFJLEdBQUcsTUFBTSxDQUFDO2dDQUNkLElBQUksR0FBRyxNQUFNLENBQUM7NEJBQ2xCLENBQUM7NEJBRUQsSUFBSSxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUM7Z0NBQ2YsR0FBRyxHQUFHLE1BQU0sQ0FBQztnQ0FDYixJQUFJLEdBQUcsTUFBTSxDQUFDO2dDQUNkLElBQUksR0FBRyxNQUFNLENBQUM7NEJBQ2xCLENBQUM7d0JBQ0wsQ0FBQztvQkFDTCxDQUFDO29CQUVELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsR0FBTyxJQUFJLENBQUM7b0JBQzlDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO29CQUM5QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLEdBQU8sSUFBSSxDQUFDO29CQUM5QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztnQkFDbEQsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO0tBQ0o7SUFyUUQsa0RBcVFDO0lBRUQsa0JBQWUsbUJBQW1CLENBQUM7Ozs7OztJQ3JUbkMsNEJBNEJDO0lBdENZLFFBQUEsSUFBSSxHQUFLLENBQUMsQ0FBQztJQUNYLFFBQUEsS0FBSyxHQUFJLENBQUMsQ0FBQztJQUNYLFFBQUEsR0FBRyxHQUFNLENBQUMsQ0FBQztJQUNYLFFBQUEsTUFBTSxHQUFHLENBQUMsQ0FBQztJQU94QixTQUFnQixRQUFRO1FBRXBCLE1BQU0sR0FBRyxHQUEyQixFQUFFLENBQUM7UUFFdkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUcsQ0FBQyxHQUFHLFlBQUksRUFBRyxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBRTlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFWixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRyxDQUFDLEdBQUcsYUFBSyxFQUFHLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBRS9CLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBRWYsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUcsQ0FBQyxHQUFHLFdBQUcsRUFBRyxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUU3QixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO29CQUVsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRyxDQUFDLEdBQUcsY0FBTSxFQUFHLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBRWhDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRzs0QkFDZCxLQUFLLEVBQUUsQ0FBQzs0QkFDUixLQUFLLEVBQUUsQ0FBQzt5QkFDWCxDQUFDO29CQUNOLENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO1FBRUQsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQsTUFBYSxPQUFPO1FBS2hCO1lBQ0ksSUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBRU0sS0FBSztZQUNSLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFHLENBQUMsR0FBRyxZQUFJLEVBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUcsQ0FBQyxHQUFHLGFBQUssRUFBRyxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUMvQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRyxDQUFDLEdBQUcsV0FBRyxFQUFHLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQzdCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFHLENBQUMsR0FBRyxjQUFNLEVBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQzs0QkFDaEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDckMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7NEJBQ2pCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO3dCQUNyQixDQUFDO29CQUNMLENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO0tBQ0o7SUF0QkQsMEJBc0JDO0lBRUQsa0JBQWUsT0FBTyxDQUFDOzs7Ozs7SUNoRXZCLE1BQXNCLFVBQVU7UUFBaEM7WUFHYyxVQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsVUFBSyxHQUFHLENBQUMsQ0FBQztRQXVEeEIsQ0FBQztRQW5EVSxJQUFJLENBQUMsSUFBUyxFQUFFLElBQVM7WUFFNUIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFFbEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztZQUV6QixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVNLFNBQVMsQ0FBQyxJQUFTLEVBQUUsSUFBUyxFQUFFLEdBQWtCO1lBRXJELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRXRCLE1BQU0sSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7WUFDekIsTUFBTSxTQUFTLEdBQUcsT0FBTyxHQUFHLEtBQUssVUFBVSxDQUFDO1lBRTVDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFHLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDekMsQ0FBQztRQUNMLENBQUM7UUFFTSxXQUFXLENBQUMsSUFBUyxFQUFFLElBQVMsRUFBRSxHQUFtQjtZQUN4RCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsRUFBRSxHQUFHLEdBQVUsQ0FBQztRQUN6QixDQUFDO1FBRU0sSUFBSTtZQUNQLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNuQixDQUFDO1FBRU0sSUFBSTtZQUNQLE9BQU8sSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25DLENBQUM7UUFFTSxHQUFHLENBQUMsR0FBUSxFQUFFLEdBQVE7WUFDekIsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFFTSxHQUFHLENBQUMsR0FBUSxFQUFFLEdBQVEsRUFBRSxLQUFRO1lBQ25DLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQzVDLENBQUM7UUFFTSxVQUFVLENBQUMsS0FBVTtZQUN4QixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUVNLFVBQVUsQ0FBQyxLQUFVLEVBQUUsS0FBUTtZQUNsQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUMzQixDQUFDO0tBQ0o7SUEzREQsZ0NBMkRDO0lBRUQsTUFBYSxVQUE2QixTQUFRLFVBQWE7UUFFeEMsY0FBYyxDQUFDLElBQVk7WUFDMUMsT0FBTyxJQUFJLEtBQUssQ0FBSSxJQUFJLENBQUMsQ0FBQztRQUM5QixDQUFDO0tBQ0o7SUFMRCxnQ0FLQzs7Ozs7SUMvREQsa0JBS0M7SUFLRCw0QkFNQztJQUtELHNDQU1DO0lBS0Qsb0RBTUM7SUFLRCw4QkFXQztJQUtELG9DQVNDO0lBS0Qsa0JBT0M7SUFLRCx3QkFFQztJQUtELDRCQU9DO0lBS0Qsc0JBT0M7SUFsSEQ7O09BRUc7SUFDSCxTQUFnQixHQUFHLENBQXFCLEVBQUssRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVM7UUFDMUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNULEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1QsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixRQUFRLENBQUMsTUFBMEIsRUFBRSxNQUEwQjtRQUMzRSxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDL0IsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQy9CLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMvQixNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUN2QyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsYUFBYSxDQUFDLE1BQTBCLEVBQUUsQ0FBUSxFQUFFLENBQVEsRUFBRSxDQUFRO1FBQ2xGLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixvQkFBb0IsQ0FBQyxFQUFTLEVBQUUsRUFBUyxFQUFFLEVBQVMsRUFBRSxFQUFTLEVBQUUsRUFBUyxFQUFFLEVBQVM7UUFDakcsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNuQixNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ25CLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDbkIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDdkMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQWdCLFNBQVMsQ0FBd0IsS0FBeUIsRUFBRSxHQUFTO1FBRWpGLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFN0IsT0FBTyxHQUFHLENBQ04sR0FBRyxFQUNILEtBQUssQ0FBQyxDQUFDLEdBQUcsTUFBTSxFQUNoQixLQUFLLENBQUMsQ0FBQyxHQUFHLE1BQU0sRUFDaEIsS0FBSyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQ25CLENBQUM7SUFDTixDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixZQUFZLENBQXFCLFFBQVc7UUFFeEQsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDdkYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUU3QixRQUFRLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQztRQUNyQixRQUFRLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQztRQUNyQixRQUFRLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQztRQUNyQixPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixHQUFHLENBQXdCLElBQXdCLEVBQUUsS0FBeUIsRUFBRSxHQUFTO1FBQ3JHLE9BQU8sR0FBRyxDQUNOLEdBQUcsRUFDSCxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQ2hCLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFDaEIsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUNuQixDQUFDO0lBQ04sQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsTUFBTSxDQUFDLE9BQWlCLEVBQUUsS0FBeUI7UUFDL0QsT0FBTyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixRQUFRLENBQXdCLElBQXdCLEVBQUUsS0FBeUIsRUFBRSxHQUFTO1FBQzFHLE9BQU8sR0FBRyxDQUNOLEdBQUcsRUFDSCxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQ2hCLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFDaEIsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUNuQixDQUFDO0lBQ04sQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsS0FBSyxDQUF3QixPQUEyQixFQUFFLE9BQTJCLEVBQUUsR0FBUztRQUM1RyxPQUFPLEdBQUcsQ0FDTixHQUFHLEVBQ0gsT0FBTyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFDN0MsT0FBTyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFDN0MsT0FBTyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FDaEQsQ0FBQztJQUNOLENBQUM7SUFFRCxrQkFBZTtRQUNYLEdBQUc7UUFDSCxTQUFTO1FBQ1QsWUFBWTtRQUNaLEdBQUc7UUFDSCxRQUFRO1FBQ1IsTUFBTTtRQUNOLFFBQVE7UUFDUixhQUFhO1FBQ2Isb0JBQW9CO1FBQ3BCLEtBQUs7S0FDUixDQUFBOzs7Ozs7O0lDbEhNLE1BQU0sVUFBVSxHQUFHLENBQUMsR0FBYyxFQUFPLEVBQUU7UUFDOUMsT0FBTyxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztJQUMzRixDQUFDLENBQUE7SUFGWSxRQUFBLFVBQVUsY0FFdEI7SUFFWSxRQUFBLGVBQWUsR0FBd0I7UUFDaEQsUUFBUSxFQUFFLENBQUM7UUFDWCxJQUFJLEVBQU0sQ0FBQztRQUNYLElBQUksRUFBTSxDQUFDO1FBQ1gsS0FBSyxFQUFLLENBQUM7UUFDWCxHQUFHLEVBQU8sQ0FBQztRQUNYLE1BQU0sRUFBSSxDQUFDO0tBQ2QsQ0FBQTtJQUVELE1BQU0sZUFBZSxHQUFHLEdBQWMsRUFBRSxDQUFDLENBQUM7UUFDdEMsUUFBUSxFQUFFLENBQUM7UUFDWCxJQUFJLEVBQU0sQ0FBQztRQUNYLElBQUksRUFBTSxDQUFDO1FBQ1gsS0FBSyxFQUFLLENBQUM7UUFDWCxHQUFHLEVBQU8sQ0FBQztRQUNYLE1BQU0sRUFBSSxDQUFDO0tBQ2QsQ0FBQyxDQUFDO0lBRUgsTUFBYSxVQUFVO1FBWW5CLElBQVcsSUFBSSxLQUFLLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDeEMsSUFBVyxNQUFNLEtBQUssT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUU1QyxZQUFtQixJQUFTLEVBQUUsU0FBYyxFQUFFLFdBQWdCLEVBQUUsV0FBZ0I7WUFDNUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRU0sT0FBTyxDQUFDLElBQVM7WUFDcEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFTSxTQUFTLENBQUMsSUFBUyxFQUFFLFNBQWMsRUFBRSxXQUFnQixFQUFFLFdBQWdCO1lBRTFFLElBQUksQ0FBQyxVQUFVLEdBQUssU0FBUyxDQUFDO1lBQzlCLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1lBRWhDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUVuQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksd0JBQVUsRUFBYSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBUyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRXBELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkIsQ0FBQztRQUVPLFdBQVc7WUFFZixNQUFNLFdBQVcsR0FBWSxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztZQUNqRCxNQUFNLGVBQWUsR0FBUSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sbUJBQW1CLEdBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN4RCxNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFekQsSUFBSSxtQkFBbUIsS0FBSyxvQkFBb0IsRUFBRSxDQUFDO2dCQUMvQyxNQUFNLElBQUksS0FBSyxDQUFDLHdFQUF3RSxDQUFDLENBQUM7WUFDOUYsQ0FBQztZQUVELE1BQU0sYUFBYSxHQUFHLG9CQUFvQixDQUFDO1lBRTNDLElBQUksQ0FBQyxPQUFPLEdBQUcsYUFBYSxHQUFHLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRU8sZUFBZTtZQUVuQix5REFBeUQ7WUFDekQsK0RBQStEO1lBRS9ELElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztZQUVaLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUN4QyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqQixDQUFDO1lBRUQsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7WUFDekIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBRWIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3hDLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxRQUFRLENBQUM7Z0JBQ25DLElBQUksSUFBSSxRQUFRLENBQUM7WUFDckIsQ0FBQztRQUNMLENBQUM7UUFFTSxXQUFXO1lBRWQsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBRWIsTUFBTSxVQUFVLEdBQUksSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7WUFDMUMsTUFBTSxVQUFVLEdBQUksSUFBSSxDQUFDLFlBQVksQ0FBQztZQUV0QyxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFFaEIsS0FBSyxJQUFJLE9BQU8sR0FBRyxVQUFVLEVBQUUsT0FBTyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO2dCQUVyRCxLQUFLLElBQUksT0FBTyxHQUFHLENBQUMsRUFBRyxPQUFPLEdBQUcsVUFBVSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUM7b0JBRXJELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUM7b0JBRW5ELElBQUksT0FBTyxHQUFHLEtBQUssRUFBRSxDQUFDO3dCQUNsQixPQUFPLEdBQUcsS0FBSyxDQUFDO29CQUNwQixDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1lBRUQsTUFBTSxpQkFBaUIsR0FBSSxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ3hELE1BQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUVyRCxLQUFLLElBQUksT0FBTyxHQUFHLFVBQVUsRUFBRSxPQUFPLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUM7Z0JBQ3JELEdBQUcsSUFBSSxJQUFBLG1CQUFPLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztnQkFDdkQsS0FBSyxJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUcsT0FBTyxHQUFHLFVBQVUsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO29CQUNyRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUNuRCxHQUFHLElBQUksSUFBQSxtQkFBTyxFQUFDLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7Z0JBQ3pELENBQUM7Z0JBQ0QsR0FBRyxJQUFJLElBQUksQ0FBQztZQUNoQixDQUFDO1lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQixDQUFDO1FBRU0sYUFBYSxDQUFDLFFBQWU7WUFFaEMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUV2QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUVwQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBRTlCLEdBQUcsR0FBRyxDQUFDLENBQUM7b0JBQ1IsTUFBTTtnQkFDVixDQUFDO1lBQ0wsQ0FBQztZQUVELE9BQU8sR0FBRyxDQUFDO1FBQ2YsQ0FBQztRQUVNLFdBQVcsQ0FBQyxNQUFXLEVBQUUsTUFBVztZQUN2QyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBRU0sa0JBQWtCLENBQUMsS0FBVTtZQUNoQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFTSxNQUFNLENBQUMsU0FBOEIsRUFBRSxTQUF1QyxFQUFFLFNBQWtCLElBQUk7WUFDekcsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDL0QsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLENBQUM7UUFFUyxpQkFBaUIsQ0FBQyxTQUE4QixFQUFFLFNBQXVDLEVBQUUsTUFBZTtZQUVoSCxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFFdEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sU0FBUyxHQUFJLFNBQVMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sU0FBUyxHQUFJLFNBQVMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBRXZDLEtBQUssSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUM7Z0JBRTNELEtBQUssSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUM7b0JBRTNELE1BQU0sQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDO29CQUN2RCxNQUFNLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQztvQkFFdkQsTUFBTSxZQUFZLEdBQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckQsTUFBTSxZQUFZLEdBQU8sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDakgsTUFBTSxZQUFZLEdBQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckQsTUFBTSxnQkFBZ0IsR0FBRyx5QkFBVyxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztvQkFDeEcsOEdBQThHO29CQUU5RyxNQUFNLE9BQU8sR0FBSyxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7b0JBQ3ZELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFFbEQsSUFBSSxTQUFTLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRSxDQUFDO3dCQUM3QixTQUFTLEdBQUcsSUFBSSxDQUFDO29CQUNyQixDQUFDO29CQUVELFNBQVMsQ0FBQyxRQUFRLEdBQUcsZ0JBQWdCLENBQUM7b0JBQ3RDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO2dCQUM3QixDQUFDO1lBQ0wsQ0FBQztZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ3JCLENBQUM7UUFFUyxpQkFBaUI7WUFFdkIsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBRXRCLEtBQUssSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFHLE9BQU8sRUFBRSxFQUFFLENBQUM7Z0JBRTVELEtBQUssSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFHLE9BQU8sRUFBRSxFQUFFLENBQUM7b0JBRTVELE1BQU0sSUFBSSxHQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDaEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztvQkFFMUIsSUFBSSxTQUFTLEdBQUssT0FBTyxDQUFDO29CQUMxQixJQUFJLFVBQVUsR0FBSSxPQUFPLENBQUM7b0JBQzFCLElBQUksUUFBUSxHQUFNLE9BQU8sQ0FBQztvQkFDMUIsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDO29CQUUxQixJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUUsQ0FBQzt3QkFFZCxTQUFTLEVBQUUsQ0FBQzt3QkFFWixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUN2QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBRXRFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO3dCQUVqQixJQUFJLElBQUksS0FBSyxJQUFJLEVBQUUsQ0FBQzs0QkFDaEIsU0FBUyxHQUFHLElBQUksQ0FBQzt3QkFDckIsQ0FBQztvQkFDTCxDQUFDO29CQUVELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxFQUFFLENBQUM7d0JBRWxDLFVBQVUsRUFBRSxDQUFDO3dCQUViLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7d0JBQ3hCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFFdkUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7d0JBRWxCLElBQUksSUFBSSxLQUFLLElBQUksRUFBRSxDQUFDOzRCQUNoQixTQUFTLEdBQUcsSUFBSSxDQUFDO3dCQUNyQixDQUFDO29CQUNMLENBQUM7b0JBRUQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFLENBQUM7d0JBRWQsV0FBVyxFQUFFLENBQUM7d0JBRWQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQzt3QkFDekIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUV4RSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzt3QkFFbkIsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFLENBQUM7NEJBQ2hCLFNBQVMsR0FBRyxJQUFJLENBQUM7d0JBQ3JCLENBQUM7b0JBQ0wsQ0FBQztvQkFFRCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsRUFBRSxDQUFDO3dCQUVsQyxRQUFRLEVBQUUsQ0FBQzt3QkFFWCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO3dCQUN0QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBRXJFLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO3dCQUVoQixJQUFJLElBQUksS0FBSyxJQUFJLEVBQUUsQ0FBQzs0QkFDaEIsU0FBUyxHQUFHLElBQUksQ0FBQzt3QkFDckIsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1lBRUQsT0FBTyxTQUFTLENBQUM7UUFDckIsQ0FBQztLQUNKO0lBOVBELGdDQThQQztJQUVELGtCQUFlLFVBQVUsQ0FBQzs7Ozs7OztJQ3RSMUIsTUFBYSxXQUFXO1FBT3BCLElBQVcsSUFBSSxLQUFLLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25ELElBQVcsS0FBSyxLQUFLLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQy9DLElBQVcsS0FBSyxLQUFLLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQy9DLElBQVcsU0FBUyxLQUFLLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELElBQVcsV0FBVyxLQUFLLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQzNELElBQVcsV0FBVyxLQUFLLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQzNELElBQVcsTUFBTSxLQUFLLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRXRELElBQVcsWUFBWSxLQUE0QixPQUFPLElBQUksQ0FBQyxRQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ2pGLElBQVcsVUFBVSxLQUFpQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLElBQVcsT0FBTyxLQUFvQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBRTdFLFlBQVksSUFBNkIsRUFBRSxJQUFXO1lBRWxELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBRWxCLE1BQU0sS0FBSyxHQUFTLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDL0IsTUFBTSxLQUFLLEdBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUMvQixNQUFNLFNBQVMsR0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ25DLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDckMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUVyQyxJQUFJLEtBQUssSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFDbEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxNQUFNLEdBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUN0QixDQUFDO1lBRUQsSUFBSSxLQUFLLElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQ2xCLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsTUFBTSxHQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM3QyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7WUFDdEIsQ0FBQztZQUVELElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ3RDLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMvRixPQUFPLENBQUMsS0FBSyxDQUFDLGtFQUFrRSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDcEcsT0FBTyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7WUFDdEIsQ0FBQztZQUVELElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ3RDLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMvRixPQUFPLENBQUMsS0FBSyxDQUFDLGtFQUFrRSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDcEcsT0FBTyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7WUFDdEIsQ0FBQztZQUVELElBQUksU0FBUyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLG9DQUFvQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUMvRCxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7WUFDdEIsQ0FBQztZQUVELElBQUksU0FBUyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDdEIsT0FBTyxDQUFDLEtBQUssQ0FBQyx5Q0FBeUMsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDcEUsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ3RCLENBQUM7WUFFRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDekUsQ0FBQztRQUVNLE9BQU8sQ0FBQyxJQUFTO1lBQ3BCLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFTyxvQkFBb0IsQ0FBQyxJQUFTLEVBQUUsU0FBYyxFQUFFLFdBQWdCLEVBQUUsV0FBZ0I7WUFFdEYsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLHdCQUFVLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDN0UsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUV2RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLHFCQUFPLEVBQUUsQ0FBQztZQUNyQyxDQUFDO1lBRUQsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRXhDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFNUMsVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzlDLDBEQUEwRDtRQUM5RCxDQUFDO1FBRU8sZUFBZTtZQUVuQixJQUFJLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzNELElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztZQUVuQixNQUFNLHVCQUF1QixHQUFHLEVBQUUsQ0FBQyxDQUFDLHdDQUF3QztZQUM1RSxNQUFNLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBVyxnQkFBZ0I7WUFFcEQsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztnQkFDMUMsdURBQXVEO2dCQUN2RCxVQUFVLElBQUksUUFBUSxHQUFHLGNBQWMsR0FBRyx1QkFBdUIsQ0FBQztnQkFDbEUsUUFBUSxJQUFJLENBQUMsQ0FBQztZQUNsQixDQUFDO1lBRUQsNERBQTREO1lBQzVELE9BQU8sVUFBVSxDQUFDO1FBQ3RCLENBQUM7UUFFTyxZQUFZLENBQUMsT0FBb0I7WUFFckMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBRWQsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztnQkFDMUMsb0RBQW9EO2dCQUNwRCxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3RELENBQUM7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU8sZUFBZSxDQUFDLEtBQVUsRUFBRSxPQUFvQixFQUFFLEdBQVE7WUFFOUQsSUFBSSxrQkFBa0IsR0FBRyxDQUFDLENBQUM7WUFFM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGtCQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG1CQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDN0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGlCQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzt3QkFDM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG9CQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzs0QkFFOUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ2pELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDOzRCQUNuQixLQUFLLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQzs0QkFFNUYsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzs0QkFDaEMsa0JBQWtCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQzt3QkFDckMsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1lBRUQsaUVBQWlFO1lBQ2pFLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFTyxxQkFBcUIsQ0FBQyxLQUFVLEVBQUUsT0FBb0IsRUFBRSxPQUFZLEVBQUUsT0FBWSxFQUFFLFFBQWEsRUFBRSxNQUFXLEVBQUUsU0FBYztZQUVsSSxNQUFNLEtBQUssR0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQy9CLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFPLG1EQUFtRDtZQUNuRyxNQUFNLE1BQU0sR0FBSSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBRSxtRkFBbUY7WUFFbEksS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUcsQ0FBQyxJQUFJLE1BQU0sRUFBRyxDQUFDLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQzFDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFHLENBQUMsSUFBSSxNQUFNLEVBQUcsQ0FBQyxJQUFJLE9BQU8sRUFBRSxDQUFDO29CQUMxQyxNQUFNLEtBQUssR0FBSyxDQUFDLElBQUksQ0FBQyxDQUFNLENBQUMsQ0FBQyxPQUFPLENBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztvQkFDbEQsTUFBTSxNQUFNLEdBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFFLENBQUMsQ0FBQyxPQUFPLENBQUM7b0JBQ2xELE1BQU0sT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO29CQUNsRCxNQUFNLElBQUksR0FBTSxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQztvQkFDbEQsS0FBSyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDeEcsQ0FBQztZQUNMLENBQUM7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU8sa0JBQWtCLENBQUMsS0FBVSxFQUFFLE9BQW9CLEVBQUUsT0FBWSxFQUFFLE9BQVksRUFBRSxRQUFhLEVBQUUsTUFBVyxFQUFFLFNBQWMsRUFBRSxDQUFNLEVBQUUsQ0FBTSxFQUFFLEtBQVU7WUFFM0osTUFBTSxRQUFRLEdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxnQ0FBZ0M7WUFDekUsTUFBTSxTQUFTLEdBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDekMsTUFBTSxPQUFPLEdBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDdkMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDMUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFeEMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUM7WUFFOUQsV0FBVztZQUNYLElBQUksVUFBVSxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQy9CLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7WUFFNUMsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRS9FLFlBQVk7WUFDWixJQUFJLE9BQU8sSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDckIsVUFBVSxHQUFHLFVBQVUsQ0FBQztnQkFDeEIsVUFBVSxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBRS9CLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNuRixDQUFDO1lBRUQsY0FBYztZQUNkLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFDeEIsVUFBVSxJQUFJLE9BQU8sQ0FBQztZQUV0QixLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFL0UsZUFBZTtZQUNmLElBQUksTUFBTSxLQUFLLE9BQU8sRUFBRSxDQUFDO2dCQUNyQixVQUFVLEdBQUcsVUFBVSxDQUFDO2dCQUN4QixVQUFVLElBQUksT0FBTyxDQUFDO2dCQUV0QixLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDbkYsQ0FBQztZQUVELGFBQWE7WUFDYixVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQ3hCLFVBQVUsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBRWhDLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUUvRSxjQUFjO1lBQ2QsSUFBSSxRQUFRLEtBQUssT0FBTyxFQUFFLENBQUM7Z0JBQ3ZCLFVBQVUsR0FBRyxVQUFVLENBQUM7Z0JBQ3hCLFVBQVUsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO2dCQUVoQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDbkYsQ0FBQztZQUVELGFBQWE7WUFDYixVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQ3hCLFVBQVUsSUFBSSxVQUFVLENBQUM7WUFFekIsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRS9FLGNBQWM7WUFDZCxJQUFJLFNBQVMsS0FBSyxPQUFPLEVBQUUsQ0FBQztnQkFDeEIsVUFBVSxHQUFHLFVBQVUsQ0FBQztnQkFDeEIsVUFBVSxJQUFJLFVBQVUsQ0FBQztnQkFFekIsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ25GLENBQUM7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU8sWUFBWSxDQUFDLEtBQW1CLEVBQUUsT0FBb0IsRUFBRSxFQUFnQixFQUFFLEVBQWdCLEVBQUUsRUFBZ0I7WUFDaEgsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3RCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUN0QixPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdEIsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVNLE9BQU87WUFDVixPQUFPO1FBQ1gsQ0FBQztLQUNKO0lBL09ELGtDQStPQztJQUVELGtCQUFlLFdBQVcsQ0FBQzs7Ozs7OztJQ3RQM0IsTUFBYSxpQkFBa0IsU0FBUSx5QkFBVztRQU05QyxJQUFXLGFBQWEsS0FBNEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUM1RSxJQUFXLFNBQVMsS0FBbUMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUVoRixZQUFZLFNBQThDLEVBQUUsSUFBVztZQUVuRSxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRXZCLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1lBQzVCLElBQUksQ0FBQyxTQUFTLEdBQUksSUFBSSwrQkFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMvRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFCLENBQUM7S0FDSjtJQWpCRCw4Q0FpQkM7SUFFRCxrQkFBZSxpQkFBaUIsQ0FBQzs7Ozs7OztJQ1RqQyxNQUFhLHdCQUF5QixTQUFRLCtCQUFpQjtRQUVwRCxXQUFXLENBQUMsV0FBa0M7WUFFakQsS0FBSyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFFdkQsS0FBSyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztvQkFFdkQsTUFBTSxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDM0MsTUFBTSxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFFM0MsTUFBTSxJQUFJLEdBQVMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3BELE1BQU0sU0FBUyxHQUFJLElBQUksQ0FBQyxLQUFLLENBQUM7b0JBQzlCLE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztvQkFFNUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsZ0NBQWUsQ0FBQyxDQUFDO2dCQUMxSCxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7UUFFTSxXQUFXO1lBQ2QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNsQyxDQUFDO1FBRU0sVUFBVSxDQUFDLGNBQW1DLEVBQUUsU0FBa0IsSUFBSTtZQUN6RSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBRU0sV0FBVyxDQUFDLGNBQXdDLEVBQUUsT0FBa0I7WUFFM0UsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFFekMsS0FBSyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFFdkQsTUFBTSxJQUFJLEdBQUcsTUFBTSxHQUFHLGFBQWEsQ0FBQztnQkFFcEMsS0FBSyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztvQkFFdkQsTUFBTSxJQUFJLEdBQUcsTUFBTSxHQUFHLGFBQWEsQ0FBQztvQkFFcEMsTUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsaUNBQWlDLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFFN0YsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUN6RCxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO29CQUNwQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO29CQUNwQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO29CQUNyQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO29CQUNuQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO29CQUN0QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFOUMsTUFBTSxTQUFTLEdBQUksSUFBSSxDQUFDLEtBQUssQ0FBQztvQkFDOUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO29CQUU1QyxjQUFjLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzlILENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUVPLGlDQUFpQyxDQUFDLFVBQWUsRUFBRSxVQUFlLEVBQUUsT0FBaUI7WUFFekYsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzFFLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUUxRSxNQUFNLFdBQVcsR0FBUyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztZQUM3QyxNQUFNLGlCQUFpQixHQUFHLGNBQWMsR0FBRyxjQUFjLENBQUM7WUFFMUQsTUFBTSxZQUFZLEdBQUssQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFdBQVcsQ0FBQztZQUNuRSxNQUFNLFlBQVksR0FBSyxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0QsTUFBTSxZQUFZLEdBQUssQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFdBQVcsQ0FBQztZQUNuRSxNQUFNLE1BQU0sR0FBVyxDQUFDLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFFeEcsbURBQW1EO1lBQ25ELE1BQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQztZQUN4RCxNQUFNLGNBQWMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUM7WUFFeEQsT0FBTyxPQUFPLENBQUMsY0FBYyxDQUFDLGNBQWMsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3hGLENBQUM7S0FDSjtJQTdFRCw0REE2RUM7SUFFRCxrQkFBZSx3QkFBd0IsQ0FBQTs7Ozs7OztJQzdGdkMsTUFBYSxVQUFXLFNBQVEsc0NBQXdCO1FBRTdDLFNBQVMsQ0FBQyxDQUFNLEVBQUUsQ0FBTSxFQUFFLEtBQVk7WUFDekMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRU0sY0FBYyxDQUFDLENBQU0sRUFBRSxDQUFNLEVBQUUsS0FBWTtZQUM5QyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFTSxnQkFBZ0IsQ0FBQyxDQUFNLEVBQUUsQ0FBTSxFQUFFLEtBQVksRUFBRSxnQkFBdUIsQ0FBQztZQUMxRSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxhQUFhLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBRU0saUJBQWlCLENBQUMsSUFBVyxFQUFFLEVBQVMsRUFBRSxNQUFhO1lBQzFELElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUVZLHFCQUFxQjtpRUFBQyxNQUFtQixFQUFFLE9BQXFDLEVBQUUsS0FBWSxDQUFDLENBQUMsRUFBRSxTQUFjLENBQUM7Z0JBQzFILE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUMvRCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUNsQyxPQUFPLE1BQU0sQ0FBQztZQUNsQixDQUFDO1NBQUE7UUFFTSxvQkFBb0IsQ0FBQyxHQUFnQixFQUFFLEtBQVksQ0FBQyxDQUFDLEVBQUUsU0FBYyxDQUFDO1lBQ3pFLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3RDLENBQUM7UUFFTSxrQkFBa0IsQ0FBQyxTQUFpQixFQUFFLFNBQWlCO1lBRTFELFNBQVMsYUFBVCxTQUFTLGNBQVQsU0FBUyxJQUFULFNBQVMsR0FBSyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBQztZQUN4QyxTQUFTLGFBQVQsU0FBUyxjQUFULFNBQVMsSUFBVCxTQUFTLEdBQUssSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUM7WUFFeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFFTSxlQUFlLENBQUMsU0FBZ0IsRUFBRSxTQUFnQjtZQUNyRCxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVNLGVBQWUsQ0FDbEIsU0FBb0IsRUFDcEIsS0FBWSxFQUNaLElBQVcsRUFDWCxZQUEwQixJQUFJLEVBQzlCLFlBQTBCLElBQUk7WUFFOUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDekYsQ0FBQztRQUVNLGlCQUFpQixDQUFDLElBQVcsRUFBRSxPQUFnQixJQUFJO1lBRXRELElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFeEMsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDUCxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3RDLENBQUM7UUFDTCxDQUFDO0tBQ0o7SUEvREQsZ0NBK0RDO0lBRUQsa0JBQWUsVUFBVSxDQUFBOzs7Ozs7O0lDckV6QixNQUFhLFdBQVksU0FBUSx3QkFBVTtRQUN2QyxJQUFXLFNBQVMsS0FBSyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUMzRCxJQUFXLFNBQVMsS0FBSyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztLQUM5RDtJQUhELGtDQUdDO0lBRUQsa0JBQWUsV0FBVyxDQUFDOzs7Ozs7O0lDSDNCLE1BQWEsbUJBQW9CLFNBQVEscUJBQVc7UUFFekMsMEJBQTBCLENBQUMsU0FBZ0I7WUFFOUMsSUFBSSxTQUFTLEdBQUcsR0FBRyxFQUFFLENBQUM7Z0JBQ2xCLE1BQU0sS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7WUFDOUMsQ0FBQztZQUVELElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUM5QixDQUFDO1FBRU8sOEJBQThCLENBQUMsU0FBZ0I7WUFFbkQsSUFBSSxRQUFRLEdBQUksSUFBQSw4QkFBa0IsRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0MsSUFBSSxTQUFTLEdBQUcsUUFBUSxHQUFHLEdBQUcsQ0FBQztZQUUvQixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRS9DLE9BQU8sUUFBUSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUVsQixJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBRXRDLFFBQVEsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzlCLFNBQVMsSUFBSSxZQUFZLENBQUM7WUFDOUIsQ0FBQztRQUNMLENBQUM7UUFFTyxZQUFZLENBQUMsUUFBYSxFQUFFLFNBQWdCO1lBRWhELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRTlDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxRQUFRLEVBQUUsQ0FBQztnQkFFNUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLFFBQVEsRUFBRSxDQUFDO29CQUU1QyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO29CQUN4QyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO29CQUV4QyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQzt3QkFDWixLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7b0JBQzNCLENBQUM7b0JBRUQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUM7d0JBQ1osS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO29CQUMzQixDQUFDO29CQUVELE1BQU0sT0FBTyxHQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDN0MsTUFBTSxRQUFRLEdBQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNqRCxNQUFNLFVBQVUsR0FBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ2pELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFFckQsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztvQkFDN0MsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztvQkFFN0MsTUFBTSxTQUFTLEdBQUcsSUFBQSw0QkFBZ0IsRUFBQyxTQUFTLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDMUQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxPQUFPLEdBQUcsUUFBUSxHQUFHLFVBQVUsR0FBRyxXQUFXLENBQUMsR0FBRyxHQUFHLENBQUM7b0JBRXZFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEdBQUcsU0FBUyxDQUFDLENBQUM7Z0JBQ3JELENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUVPLFdBQVcsQ0FBQyxRQUFhLEVBQUUsU0FBZ0I7WUFFL0MsTUFBTSxZQUFZLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXhDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxRQUFRLEVBQUUsQ0FBQztnQkFFNUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLFFBQVEsRUFBRSxDQUFDO29CQUU1QyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO29CQUN4QyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO29CQUV4QyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQzt3QkFDWixLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7b0JBQzNCLENBQUM7b0JBRUQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUM7d0JBQ1osS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO29CQUMzQixDQUFDO29CQUVELE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7b0JBQzdDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7b0JBRTdDLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztvQkFDOUQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO29CQUU5RCxNQUFNLFVBQVUsR0FBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQzdDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDakQsTUFBTSxTQUFTLEdBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNuRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQ3ZELE1BQU0sVUFBVSxHQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDakQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUV2RCxNQUFNLFVBQVUsR0FBRyxDQUFDLFVBQVUsR0FBRyxTQUFTLEdBQUcsVUFBVSxHQUFHLFdBQVcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFBLDRCQUFnQixFQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUN2SCxNQUFNLFNBQVMsR0FBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLEdBQUcsV0FBVyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFBLDRCQUFnQixFQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUV4SCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQ25DLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDeEMsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO0tBQ0o7SUF4R0Qsa0RBd0dDOzs7Ozs7SUM1R0QsTUFBYSxvQkFBb0I7UUFBakM7WUFFVyxnQkFBVyxHQUFHLENBQUMsQ0FBQztZQUNoQixhQUFRLEdBQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUMvQixnQkFBVyxHQUFHLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25DLFdBQU0sR0FBUSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuQyxlQUFVLEdBQUksSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDaEYsVUFBSyxHQUFTLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBVTNGLENBQUM7UUFSVSxLQUFLO1lBQ1IsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7WUFDckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDekUsQ0FBQztLQUNKO0lBakJELG9EQWlCQztJQUVELGtCQUFlLG9CQUFvQixDQUFDOzs7Ozs7SUNkdkIsUUFBQSxZQUFZLEdBQUcsQ0FBQyxDQUFDO0lBUWpCLFFBQUEsd0JBQXdCLEdBQUcsV0FBVyxDQUFDO0lBb0JwRCxNQUFhLGVBQWU7UUFLeEIsSUFBVyxVQUFVLEtBQUssT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUVwRDtZQUNJLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ2YsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUVNLE9BQU8sQ0FBQyxFQUFnQjtZQUMzQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDeEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGtCQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG1CQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzt3QkFDN0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGlCQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzs0QkFDM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG9CQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQ0FDOUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDekMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDOzRCQUNoQixDQUFDO3dCQUNMLENBQUM7b0JBQ0wsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7UUFFTSxxQkFBcUIsQ0FBQyxLQUFVLEVBQUUsVUFBMEI7WUFDL0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGtCQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG1CQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDN0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGlCQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzt3QkFDM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG9CQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzs0QkFFOUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFFN0MsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7Z0NBQ2pCLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7Z0NBQzNCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDOzRCQUMxQixDQUFDO3dCQUNMLENBQUM7b0JBQ0wsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7UUFFTSxPQUFPLENBQUMsVUFBMEI7WUFDckMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDOUMsQ0FBQztZQUNELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBRU0sZ0JBQWdCLENBQUMsT0FBb0IsRUFBRSxhQUEwQjtZQUVwRSxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztZQUM3RCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFOUMsS0FBSyxJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUUsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUM7Z0JBQzFELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQzdHLENBQUM7UUFDTCxDQUFDO1FBRU8sVUFBVSxDQUE4QixPQUFZLEVBQUUsT0FBb0MsRUFBRSxVQUFlLEVBQUUsYUFBMEI7WUFFM0ksTUFBTSxHQUFHLEdBQXdDLElBQUksS0FBSyxDQUFDLGtCQUFJLENBQUMsQ0FBQztZQUVqRSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRyxDQUFDLEdBQUcsa0JBQUksRUFBRyxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUU5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsbUJBQUssQ0FBQyxDQUFDO2dCQUUxQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRyxDQUFDLEdBQUcsbUJBQUssRUFBRyxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUUvQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsaUJBQUcsQ0FBQyxDQUFDO29CQUUzQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRyxDQUFDLEdBQUcsaUJBQUcsRUFBRyxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUU3QixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsb0JBQU0sQ0FBQyxDQUFDO3dCQUVqQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRyxDQUFDLEdBQUcsb0JBQU0sRUFBRyxDQUFDLEVBQUUsRUFBRSxDQUFDOzRCQUVoQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUN0QyxNQUFNLEdBQUcsR0FBYztnQ0FDbkIsUUFBUSxFQUFFLENBQUMsQ0FBQztnQ0FDWixJQUFJLEVBQUUsT0FBTztnQ0FDYixJQUFJLEVBQUUsQ0FBQztnQ0FDUCxLQUFLLEVBQUUsQ0FBQztnQ0FDUixHQUFHLEVBQUUsQ0FBQztnQ0FDTixNQUFNLEVBQUUsQ0FBQzs2QkFDWixDQUFDOzRCQUVGLE1BQU0sSUFBSSxHQUFLLElBQUksZ0NBQXdCLENBQUMsVUFBVSxHQUFHLG9CQUFZLENBQUMsQ0FBQzs0QkFDdkUsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQzs0QkFFakYsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHO2dDQUNkLGVBQWUsRUFBRSxJQUFJLENBQUMsS0FBSztnQ0FDM0IsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLO2dDQUN2QixLQUFLLEVBQUUsQ0FBQztnQ0FDUixJQUFJLEVBQUUsSUFBSTtnQ0FDVixNQUFNLEVBQUUsTUFBTTtnQ0FDZCxVQUFVLEVBQUUsS0FBSzs2QkFDcEIsQ0FBQzt3QkFDTixDQUFDO29CQUNMLENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUM7WUFFRCxPQUFPLEdBQUcsQ0FBQztRQUNmLENBQUM7UUFFTSxHQUFHLENBQUMsR0FBYztZQUNyQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBRU0sU0FBUyxDQUFDLEdBQWMsRUFBRSxDQUFNLEVBQUUsQ0FBTTtZQUUzQyxNQUFNLE1BQU0sR0FBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDL0IsTUFBTSxLQUFLLEdBQU8sU0FBUyxHQUFHLG9CQUFZLENBQUM7WUFFM0MsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUM1QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzNCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQzdCLENBQUM7WUFFRCxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO1FBRU0sT0FBTztZQUVWLEtBQUssSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO2dCQUMxRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsa0JBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUM1QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsbUJBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUM3QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsaUJBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDOzRCQUMzQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsb0JBQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dDQUU5QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUN4QyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQzs0QkFDM0IsQ0FBQzt3QkFDTCxDQUFDO29CQUNMLENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO0tBQ0o7SUFsSkQsMENBa0pDOzs7Ozs7SUMvS0QsTUFBYSx3QkFBeUIsU0FBUSxxQ0FBaUM7UUFBL0U7O1lBRVcsWUFBTyxHQUFZLEtBQUssQ0FBQztRQTJHcEMsQ0FBQztRQXpHRyxJQUFXLGlCQUFpQixLQUFLLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsa0JBQUksR0FBRyxtQkFBSyxHQUFHLGlCQUFHLEdBQUcsb0JBQU0sQ0FBQyxDQUFDLENBQUM7UUFFbEYsbUJBQW1CLENBQUMsR0FBdUIsRUFBRSxTQUFjLENBQUM7WUFFL0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRVYsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxrQkFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQzVCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxtQkFBSyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQzdCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxpQkFBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7NEJBQzNCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxvQkFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0NBRTlCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBRXZDLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO29DQUNmLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO2dDQUNyQyxDQUFDOzRCQUNMLENBQUM7d0JBQ0wsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1lBRUQsT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLGFBQXNCLEtBQUssRUFBRSxnQkFBeUIsS0FBSztZQUNwRSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDeEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGtCQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG1CQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzt3QkFDN0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGlCQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzs0QkFDM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG9CQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQ0FFOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDdkMsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztnQ0FFakMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7Z0NBQ2hCLEtBQUssQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO2dDQUV6QixJQUFJLFdBQVcsRUFBRSxDQUFDO29DQUNkLFdBQVcsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO29DQUM1QixXQUFXLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO29DQUNyQyxXQUFXLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztvQ0FDcEMsV0FBVyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7Z0NBQzlDLENBQUM7NEJBQ0wsQ0FBQzt3QkFDTCxDQUFDO29CQUNMLENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO1FBRU0sR0FBRztZQUNOLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUN4QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsa0JBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUM1QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsbUJBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUM3QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsaUJBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDOzRCQUMzQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsb0JBQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dDQUU5QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUN2QyxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO2dDQUVqQyxJQUFJLFdBQVcsSUFBSSxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDO29DQUVqQyxXQUFXLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7b0NBRTFDLElBQUksS0FBSyxDQUFDLFVBQVUsSUFBSSxXQUFXLENBQUMsY0FBYyxFQUFFLENBQUM7d0NBRWpELGdDQUFnQzt3Q0FDaEMsb0RBQW9EO3dDQUVwRCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLGtDQUFZLENBQUM7d0NBQzFDLE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDO3dDQUU3RCxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO29DQUN4RCxDQUFDO2dDQUNMLENBQUM7NEJBQ0wsQ0FBQzt3QkFDTCxDQUFDO29CQUNMLENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO1FBRU8sWUFBWSxDQUFDLFlBQXFDLEVBQUUsSUFBaUIsRUFBRSxNQUFXO1lBRXRGLElBQUksWUFBWSxFQUFFLENBQUM7Z0JBRWYsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQztnQkFFbkMsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ2xCLE1BQU0sRUFBRSxHQUFJLE1BQWtDLENBQUMsRUFBRSxDQUFDO29CQUNsRCxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDM0QsRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMxRCxDQUFDO3FCQUNJLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUN2QixNQUFNLElBQUksR0FBTSxNQUFjLENBQUMsSUFBaUIsQ0FBQztvQkFDakQsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFtQixDQUFDO29CQUNyRCxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3ZELENBQUM7cUJBQ0ksQ0FBQztvQkFDRixPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQ3hDLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztLQUNKO0lBN0dELDREQTZHQzs7Ozs7O0lDckdELE1BQWEsdUJBQXVCO1FBdUJoQyxZQUFZLEtBQWEsRUFBRSxJQUFZLEVBQUUsSUFBWSxFQUFFLElBQVk7WUFDL0QsSUFBSSxDQUFDLElBQUksR0FBSSxJQUFJLENBQUM7WUFDbEIsSUFBSSxDQUFDLElBQUksR0FBSSxJQUFJLENBQUM7WUFDbEIsSUFBSSxDQUFDLElBQUksR0FBSSxJQUFJLENBQUM7WUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDckIsSUFBSSxDQUFDLElBQUksR0FBSSxDQUFDLENBQUM7WUFDZixJQUFJLENBQUMsR0FBRyxHQUFHLGdDQUFlLENBQUM7WUFDM0IsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7WUFDaEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7WUFDNUIsSUFBSSxDQUFDLHVCQUF1QixHQUFHLEtBQUssQ0FBQztZQUNyQyxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxDQUFDLENBQUM7UUFDbkMsQ0FBQztLQUNKO0lBekNELDBEQXlDQztJQUVELE1BQThCLG1CQUFtQjtRQTRCN0MsSUFBVyxXQUFXLEtBQXlDLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDMUYsSUFBVyxpQkFBaUIsS0FBK0MsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1FBQzVHLElBQVcsSUFBSSxLQUFLLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDeEMsSUFBVyxrQkFBa0IsS0FBSyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7UUFJcEUsWUFBWSxPQUFvQjtZQVp6QiwwQkFBcUIsR0FBWSxLQUFLLENBQUM7WUFhMUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLHVEQUF3QixFQUFFLENBQUM7WUFDakQsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQztZQUNuQyxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztZQUMzQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbkYsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDekYsSUFBSSxDQUFDLG1CQUFtQixHQUFHLFNBQVMsQ0FBQztZQUNyQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbEMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3RCLENBQUM7UUFFTSxVQUFVO1lBRWIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUV6QyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FDaEIsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQzNELElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUM5RCxDQUFDO1lBRUYsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ25ELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDcEQsQ0FBQztZQUVELEtBQUssTUFBTSxZQUFZLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQ2pELElBQUksWUFBWSxFQUFFLENBQUM7b0JBQ2YsWUFBWSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3ZDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ3hDLENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUMxQixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDM0IsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7d0JBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztvQkFDdkMsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7UUFDTCxDQUFDO1FBRU0sV0FBVztRQUNsQixDQUFDO1FBRU8sMkJBQTJCLENBQUMsTUFBa0I7WUFFbEQsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsd0NBQXdDO1lBQzVELElBQUksYUFBc0MsQ0FBQztZQUUzQyxJQUFJLElBQUksQ0FBQyxxQkFBcUI7Z0JBQzFCLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUMzQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztnQkFDMUIsYUFBYSxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDL0MsQ0FBQztpQkFDSSxDQUFDO2dCQUVGLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTztvQkFDakMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCO29CQUNuQyxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDO2dCQUUvQixhQUFhLEdBQUcsSUFBSSxLQUFLLENBQW1CLEtBQUssQ0FBQyxDQUFDO2dCQUVuRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQzFCLElBQUksQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3ZELENBQUM7cUJBQ0ksQ0FBQztvQkFFRixnRUFBZ0U7b0JBQ2hFLHlCQUF5QjtvQkFDekIsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztvQkFFN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUVWLEtBQUssSUFBSSxVQUFVLEdBQUcsQ0FBQyxFQUFFLFVBQVUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQUM7d0JBQ2pGLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUM5RCxJQUFJLGlCQUFpQixFQUFFLENBQUM7NEJBQ3BCLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGlCQUFpQixDQUFDO3dCQUMzQyxDQUFDO29CQUNMLENBQUM7b0JBRUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUNoQyxDQUFDO2dCQUVELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7WUFDakQsQ0FBQztZQUVELElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUVoQix5REFBeUQ7Z0JBQ3pELElBQUksTUFBTSxFQUFFLENBQUM7b0JBQ1QsYUFBYTtvQkFDYixNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7Z0JBQ3RDLENBQUM7Z0JBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1lBQ2hELENBQUM7aUJBQ0ksQ0FBQztnQkFDRixNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRTtvQkFDMUIsYUFBYSxFQUFFLGFBQWE7b0JBQzVCLElBQUksRUFBRSxLQUFLO2lCQUNkLENBQUMsQ0FBQztZQUNQLENBQUM7WUFFRCxpQkFBaUI7WUFDakIsS0FBSyxNQUFNLFlBQVksSUFBSSxhQUFhLEVBQUUsQ0FBQztnQkFDdkMsWUFBWSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7Z0JBQzFCLFlBQVksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO2dCQUNoQyxZQUFZLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztZQUN2QyxDQUFDO1FBQ0wsQ0FBQztRQUVPLHNCQUFzQixDQUFDLE1BQWtCO1lBRTdDLElBQUksSUFBSSxDQUFDLHFCQUFxQjtnQkFDMUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPO2dCQUN2QixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUM3QixDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDbEIsT0FBTztZQUNYLENBQUM7WUFFRCxJQUFJLENBQUMsMkJBQTJCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUlNLFVBQVU7WUFDYixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDeEIsQ0FBQztRQUVNLE9BQU8sQ0FBQyxJQUFXLEVBQUUsUUFBK0I7WUFFdkQsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUM7Z0JBQUUsT0FBTztZQUMxQixJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQztnQkFBRSxPQUFPO1lBRTFCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDcEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFckQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM1RCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDNUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUU1RCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN4RSxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUV4RSxLQUFLLElBQUksQ0FBQyxHQUFHLGFBQWEsRUFBRSxDQUFDLEdBQUcsYUFBYSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBRWpELEtBQUssSUFBSSxDQUFDLEdBQUcsYUFBYSxFQUFFLENBQUMsR0FBRyxhQUFhLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFFakQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztvQkFFcEQsSUFBSSxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUUsQ0FBQzt3QkFDdkMsT0FBTztvQkFDWCxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUVNLGtCQUFrQixDQUFDLElBQVc7WUFFakMsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBRTlCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUU7Z0JBRTlCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRWxELFdBQVcsQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDO2dCQUNqQyxXQUFXLENBQUMsb0JBQW9CLEdBQUcsR0FBRyxDQUFDO1lBQzNDLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLGVBQWUsR0FBRyxHQUFHLENBQUM7WUFDM0IsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEdBQUcsQ0FBQztRQUNyQyxDQUFDO1FBRU0sYUFBYSxDQUFDLElBQVc7WUFFNUIsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBRTlCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUU7Z0JBRTlCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRWxELFdBQVcsQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDO2dCQUNqQyxXQUFXLENBQUMscUJBQXFCLEdBQUcsR0FBRyxDQUFDO2dCQUN4QyxXQUFXLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztZQUN0QyxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxlQUFlLEdBQUcsR0FBRyxDQUFDO1lBQzNCLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxHQUFHLENBQUM7UUFDdEMsQ0FBQztRQUVPLGVBQWUsQ0FBQyxVQUFrQixFQUFFLE1BQW9CO1lBRTVELElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO2dCQUNoQyxNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUM7WUFDckQsQ0FBQztZQUVELElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQzNDLENBQUM7UUFFTyxxQkFBcUIsQ0FBQyxVQUFrQixFQUFFLFlBQThCO1lBRTVFLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7Z0JBQ3RDLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztZQUM1RCxDQUFDO1lBRUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxHQUFHLFlBQVksQ0FBQztZQUNuRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMvQixDQUFDO1FBV00sU0FBUyxDQUFDLGdCQUF5QjtZQUN0QyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFTSxvQkFBb0IsQ0FBQyxVQUFrQjtZQUUxQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEQsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNULEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ25GLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbEQsQ0FBQztZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFTSxnQkFBZ0IsQ0FBQyxVQUFrQjtZQUV0QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFbkMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFOUQsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO2dCQUVwQixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRWxDLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQy9DLENBQUM7UUFDTCxDQUFDO1FBRU0sa0JBQWtCO1lBQ3JCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNoRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDaEQsTUFBTSxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztvQkFDL0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNqQyxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7UUFFTSx5QkFBeUI7WUFDNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ2hELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUVoRCxNQUFNLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO29CQUMvQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBRXBELElBQUksWUFBWSxFQUFFLENBQUM7d0JBQ2YsWUFBWSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO29CQUMzQyxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUVNLFlBQVk7WUFFZixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNkLE9BQU87WUFDWCxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsU0FBUyxDQUFDO1lBQ3pDLENBQUM7WUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUM3QixJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEMsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUM3QixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDaEgsQ0FBQztpQkFDSSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2dCQUMxQixJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxFQUFFO29CQUM1RSxPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM3RyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7aUJBQ0ksQ0FBQztnQkFDRixJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUNyQyxDQUFDO1lBRUQsSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRU0sY0FBYyxDQUFDLFFBQThCO1lBQ2hELElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzlCLENBQUM7UUFFTSxJQUFJLENBQUMsR0FBZ0IsRUFBRSxNQUFrQixFQUFFLFFBQThCO1lBRTVFLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQztZQUNuRSxDQUFDO1lBRUQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7WUFDaEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFFdEIsd0NBQXdDO1lBQ3hDLE1BQU0sV0FBVyxHQUEwQjtnQkFDdkMsU0FBUyxFQUFFLENBQUMsU0FBYyxFQUFFLFVBQWUsRUFBRSxLQUFVLEVBQUUsTUFBVyxFQUFFLE1BQVcsRUFBRSxJQUFTLEVBQUUsSUFBUyxFQUFFLElBQVMsRUFBRSxPQUE0QixFQUFFLEVBQUU7b0JBQ2hKLE1BQU0sVUFBVSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7b0JBQzlELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDNUgsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQzdDLENBQUM7YUFDSixDQUFBO1lBRUQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDeEIsQ0FBQztLQUNKO0lBMVhELHNDQTBYQzs7Ozs7OztJQ3phRCxNQUFhLDBCQUNSLFNBQVEsaUNBQStEO1FBT3hFLElBQVcsZ0JBQWdCLEtBQUssT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1FBRXhELE1BQU0sQ0FBQyxZQUFZLENBQXNDLEtBQVUsRUFBRSxLQUFVLEVBQUUsU0FBYyxFQUFFLFFBQW1CO1lBRXhILE1BQU0sVUFBVSxHQUFLLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekQsTUFBTSxVQUFVLEdBQUssQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6RCxNQUFNLFlBQVksR0FBRyxTQUFBLFNBQVMsRUFBSSxDQUFDLENBQUEsQ0FBQztZQUNwQyxNQUFNLFVBQVUsR0FBSyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQzdDLE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdEQsSUFBSSxVQUFVLEdBQUcsbUJBQW1CLEVBQUUsQ0FBQztnQkFDbkMsT0FBTyxDQUFDLEtBQUssQ0FBQyxnRkFBZ0YsRUFBRSxTQUFTLEVBQUUsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3ZJLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUN0QixDQUFDO1lBRUQsT0FBTyxDQUFDLFFBQVEsS0FBSyxJQUFJO2dCQUNyQixDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQztnQkFDNUMsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUMsQ0FDRSxDQUFDO1FBQ3RELENBQUM7UUFJRCxZQUFtQixLQUFVLEVBQUUsS0FBVSxFQUFFLFNBQWMsRUFBRSxhQUFrQixFQUFFLFNBQWdCLEVBQUUsU0FBZ0IsRUFBRSxRQUE0QixFQUFFLE1BQW1ELEVBQUUsV0FBZ0IsdUNBQXVCLEVBQUUsd0JBQTZCLENBQUM7WUFDelEsTUFBTSxrQkFBa0IsR0FBRyxJQUFBLGlEQUF1QixFQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUM3RSxNQUFNLFNBQVMsR0FBRyxNQUFNLGFBQU4sTUFBTSxjQUFOLE1BQU0sR0FBSSwwQkFBMEIsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNoSCxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1lBQ2hILElBQUksQ0FBQyxpQkFBaUIsR0FBRyxRQUFRLENBQUM7WUFDbEMsSUFBSSxDQUFDLGdCQUFnQixHQUFJLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxjQUFjLEdBQU0sUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDL0QsQ0FBQztRQUVlLGFBQWEsQ0FBQyxNQUFXLEVBQUUsTUFBVztZQUNsRCxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBS2UsY0FBYyxDQUFDLElBQVMsRUFBRSxNQUFXLEVBQUUsTUFBVztZQUM5RCxNQUFNLElBQUksR0FBVSxTQUFBLElBQUksQ0FBQyxhQUFhLEVBQUksQ0FBQyxDQUFBLENBQUM7WUFDNUMsTUFBTSxVQUFVLEdBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO1lBQ3hGLE1BQU0sV0FBVyxHQUFHLFVBQVUsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7WUFDNUYsTUFBTSxLQUFLLEdBQVMsSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDMUcsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUtlLGdCQUFnQixDQUFDLElBQVM7WUFFdEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUU5RixLQUFLLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO2dCQUUxRCxLQUFLLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxNQUFNLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7b0JBRWpGLE1BQU0sS0FBSyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztvQkFDbEYsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDOUQsQ0FBQztZQUNMLENBQUM7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO1FBRWtCLG1CQUFtQixDQUFDLEtBQWlELEVBQUUsS0FBVSxFQUFFLEtBQVk7WUFDOUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzlFLENBQUM7UUFFa0IsbUJBQW1CLENBQUMsS0FBaUQsRUFBRSxLQUFVO1lBQ2hHLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDOUMsQ0FBQztRQUVlLFFBQVEsQ0FBQyxDQUFNLEVBQUUsQ0FBTTtZQUVuQyxNQUFNLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUN0QyxNQUFNLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUN0QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDbEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRWxELE1BQU0sVUFBVSxHQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztZQUN4RixNQUFNLFdBQVcsR0FBRyxVQUFVLEdBQUcsQ0FBQyxTQUFBLElBQUksQ0FBQyxhQUFhLEVBQUksQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUMzRCxNQUFNLFVBQVUsR0FBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7WUFDekQsTUFBTSxXQUFXLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLHFCQUFxQjtZQUV6RSxPQUFPLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxXQUFXLENBQUM7UUFDNUUsQ0FBQztLQUNKO0lBaEdELGdFQWdHQztJQUVELGtCQUFlLDBCQUEwQixDQUFDOzs7OztJQ3hGMUMsZ0RBVUM7SUFFRCxrRUFPQzs7O0lBbkJELFNBQWdCLGtCQUFrQixDQUFDLGNBQWtDLEVBQUUsU0FBZ0M7UUFFbkcsc0NBQXNDO1FBQ3RDLElBQUksUUFBUSxHQUFxQixNQUFNLENBQUM7UUFFeEMsSUFBSSxTQUFTLFlBQVksd0NBQTBCLEVBQUUsQ0FBQztZQUNsRCxRQUFRLEdBQUcsU0FBUyxDQUFDLGdCQUFnQixLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFDekUsQ0FBQztRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxTQUFnQiwyQkFBMkIsQ0FBQyxjQUFrQyxFQUFFLE1BQWM7UUFFMUYsSUFBSSxNQUFNLEtBQUssRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDbEMsT0FBTyxXQUFXLENBQUM7UUFDdkIsQ0FBQztRQUVELE9BQU8sVUFBVSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxNQUFxQixjQUFlLFNBQVEsaUNBQTZEO1FBT3JHLElBQVcsZ0JBQWdCLEtBQUssT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUVqRCx3QkFBd0IsQ0FBQyxNQUFXLEVBQUUsTUFBVztZQUVyRCx3Q0FBd0M7WUFFeEMscUNBQXFDO1lBQ3JDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQztZQUMzRCxNQUFNLE1BQU0sR0FBVSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQztZQUNqRSxNQUFNLFVBQVUsR0FBTSxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUMxQyxNQUFNLFVBQVUsR0FBTSxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUUxQyxNQUFNLEtBQUssR0FBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzVFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRXhHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBRXBDLE1BQU0sRUFBRSxHQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBMEMsQ0FBQyxFQUFFLENBQUM7Z0JBQ3BFLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDckQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO2dCQUN4RCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ3JELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFFdEQsRUFBRSxDQUFDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQzdDLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2pJLENBQUM7aUJBQ0ksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFFekMsTUFBTSxNQUFNLEdBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFzQixDQUFDLElBQWlCLENBQUM7Z0JBQ3BFLE1BQU0sT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFlLENBQUM7Z0JBRWhFLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUNyQjtvQkFDSSxPQUFPLEVBQUUsT0FBTztvQkFDaEIsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUM7b0JBQ3JCLFFBQVEsRUFBRSxDQUFDO2lCQUNkLEVBQ0QsTUFBTSxFQUNOO29CQUNJLE1BQU0sRUFBRSxDQUFDO29CQUNULFdBQVcsRUFBRSxDQUFDLEdBQUcsYUFBYSxFQUFFLDJCQUEyQjtvQkFDM0QsWUFBWSxFQUFFLGFBQWE7aUJBQzlCLEVBQ0Q7b0JBQ0ksS0FBSyxFQUFFLGFBQWE7b0JBQ3BCLE1BQU0sRUFBRSxhQUFhO2lCQUN4QixDQUNKLENBQUM7WUFDTixDQUFDO1FBQ0wsQ0FBQztRQUVPLGdCQUFnQixDQUFDLElBQVc7WUFDaEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNwQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVTLGtCQUFrQixDQUFDLFVBQWUsRUFBRSxTQUFjLEVBQUUsVUFBZSxFQUFFLEtBQVUsRUFBRSxNQUFXLEVBQUUsTUFBVyxFQUFFLElBQVMsRUFBRSxJQUFTLEVBQUUsSUFBUyxFQUFFLEdBQWM7WUFFaEssTUFBTSxRQUFRLEdBQUcsSUFBSSxpREFBdUIsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUUzRSxRQUFRLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUNuQixRQUFRLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO1lBQ3RDLFFBQVEsQ0FBQyxpQkFBaUIsR0FBRyxVQUFVLENBQUM7WUFDeEMsUUFBUSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7WUFDOUIsUUFBUSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztZQUNwQyxRQUFRLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztZQUVoQyxPQUFPLFFBQVEsQ0FBQztRQUNwQixDQUFDO1FBRU8sa0JBQWtCLENBQUMsY0FBa0MsRUFBRSxZQUFtQztZQUU5RiwwRUFBMEU7WUFDMUUsdURBQXVEO1lBQ3ZELE1BQU0sWUFBWSxHQUFHLENBQUMsWUFBWSxDQUFDLHNCQUFzQixZQUFZLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDO1lBQ2xILE1BQU0sVUFBVSxHQUFHLENBQUM7b0JBQ2hCLFFBQVEsRUFBRSxFQUFFLENBQUMsaUJBQWlCO29CQUM5QixVQUFVLEVBQUUsbUNBQWdCO29CQUM1QixJQUFJLEVBQUUsWUFBWTtvQkFDbEIsU0FBUyxFQUFFLEtBQUs7b0JBQ2hCLEtBQUssRUFBRSxJQUFJO2lCQUNkLENBQUMsQ0FBQztZQUVILE9BQU8sSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDLGNBQWMsRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDakcsQ0FBQztRQUVTLDRCQUE0QixDQUFDLGNBQWtDO1lBQ3JFLDZDQUE2QztZQUM3Qyx1REFBdUQ7WUFDdkQsT0FBTyxJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ3hDLFFBQVEsRUFBRSxFQUFFLENBQUMsZUFBZTtvQkFDNUIsVUFBVSxFQUFFLG1DQUFnQjtvQkFDNUIsSUFBSSxFQUFFLEVBQUUsQ0FBQyxXQUFXO29CQUNwQixTQUFTLEVBQUUsS0FBSztvQkFDaEIsS0FBSyxFQUFFLElBQUk7aUJBQ2QsQ0FBQyxDQUFDLENBQUM7UUFDUixDQUFDO1FBRVMsNEJBQTRCLENBQUMsY0FBa0MsRUFBRSxJQUE4QjtZQUNyRyxPQUFPLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLDRCQUE0QixDQUFDLGNBQWMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsa0NBQVksRUFBRTtnQkFDdEgsS0FBSyxFQUFFLEVBQUUsQ0FBQyxhQUFhO2dCQUN2QixJQUFJLEVBQUUsSUFBSTtnQkFDVixPQUFPLEVBQUUsS0FBSzthQUNqQixDQUFDLENBQUM7UUFDUCxDQUFDO1FBRVMseUJBQXlCLENBQUMsT0FBb0IsRUFBRSxJQUE0QztZQUVsRyxNQUFNLE9BQU8sR0FBRyxJQUFJLEtBQUssQ0FBOEIsT0FBTyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFbEcsS0FBSyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFFMUQsS0FBSyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQztvQkFFMUQsTUFBTSxVQUFVLEdBQUcsTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO29CQUN6RCxNQUFNLFFBQVEsR0FBSyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUVoRCxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7d0JBQ2xCLElBQUksRUFBRSxFQUFFLENBQUMsbUJBQW1CO3dCQUM1QixPQUFPLEVBQUUsS0FBSzt3QkFDZCxJQUFJLEVBQUUsQ0FBQzt3QkFDUCxLQUFLLEVBQUUsQ0FBQzt3QkFDUixPQUFPLEVBQUUsSUFBSTt3QkFDYixVQUFVLEVBQUU7NEJBQ1IsQ0FBQywwREFBeUIsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDOzRCQUMzRCxDQUFDLHNEQUFxQixDQUFDLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJO3lCQUM3QztxQkFDSixDQUFDO2dCQUNOLENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFa0Isb0JBQW9CLENBQUMsR0FBZ0IsRUFBRSxNQUFrQixFQUFFLFFBQXNCLEVBQUUsT0FBb0I7WUFFdEgsTUFBTSxTQUFTLEdBQUcsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQTJDLENBQUM7WUFDNUYsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV6QyxTQUFTLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDM0IsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUM7WUFDbkQsU0FBUyxDQUFDLFlBQVksR0FBSyxJQUFJLENBQUMsbUJBQW1CLENBQUM7WUFFcEQsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztZQUVuRCxTQUFTLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztZQUN4QyxTQUFTLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztZQUNuQixTQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUNwQixTQUFTLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUV6QixNQUFNLGlCQUFpQixHQUFHLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBMkQsQ0FBQztZQUVySSxpQkFBaUIsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO1lBQy9CLGlCQUFpQixDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDbEMsaUJBQWlCLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO1lBQzNDLGlCQUFpQixDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFDckMsaUJBQWlCLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztZQUV4QyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsc0RBQXFCLEVBQUUsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3JFLGlCQUFpQixDQUFDLFlBQVksQ0FBQywwREFBeUIsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUM5RSxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUUzQyxPQUFPLGlCQUFpQixDQUFDO1FBQzdCLENBQUM7UUFFa0IscUJBQXFCLENBQUMsR0FBZ0IsRUFBRSxNQUFrQixFQUFFLFFBQXNCLEVBQUUsT0FBa0IsRUFBRSxhQUE2QixFQUFFLElBQThCO1lBRXBMLE1BQU0sU0FBUyxHQUFHLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDbEQsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUVsRixTQUFTLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDM0IsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUM7WUFDbkQsU0FBUyxDQUFDLFlBQVksR0FBSyxJQUFJLENBQUMsbUJBQW1CLENBQUM7WUFFcEQsU0FBUyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsbUJBQW1CLENBQUM7WUFDeEMsU0FBUyxDQUFDLElBQUksR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDO1lBQ3JDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQztZQUN0QyxTQUFTLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUV6QixNQUFNLGlCQUFpQixHQUFHLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRTNFLGlCQUFpQixDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7WUFDL0IsaUJBQWlCLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNsQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7WUFDM0MsaUJBQWlCLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztZQUNyQyxpQkFBaUIsQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO1lBRXhDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxzREFBcUIsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ2hGLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdEQsaUJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUUzQyxPQUFPLGlCQUFpQixDQUFDO1FBQzdCLENBQUM7UUFFa0IsZ0JBQWdCLENBQUMsVUFBa0IsRUFBRSxHQUFnQixFQUFFLE1BQWtCLEVBQUUsUUFBc0I7WUFFaEgsTUFBTSxRQUFRLEdBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMvQyxNQUFNLFNBQVMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFekMsU0FBUyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQzNCLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1lBQ25ELFNBQVMsQ0FBQyxZQUFZLEdBQUssSUFBSSxDQUFDLG1CQUFtQixDQUFDO1lBRXBELFNBQVMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLG1CQUFtQixDQUFDO1lBQ3hDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLFNBQVMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ3BCLFNBQVMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBRXpCLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFM0UsaUJBQWlCLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztZQUMvQixpQkFBaUIsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ2xDLGlCQUFpQixDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztZQUMzQyxpQkFBaUIsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3JDLGlCQUFpQixDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFFeEMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLDBEQUF5QixFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDdEcsaUJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFM0MsT0FBTyxpQkFBaUIsQ0FBQztRQUM3QixDQUFDO1FBRU8sWUFBWSxDQUFDLFlBQThCOztZQUUvQyxxREFBcUQ7WUFDckQsSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3BCLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsSUFBSSxDQUFpQyxDQUFDO2dCQUN2RSxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFtQyxDQUFDO1lBQ3pFLENBQUM7WUFFRCxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFdkIsSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3BCLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDaEMsQ0FBQztZQUVELElBQUksWUFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUVhLGFBQWE7Z0JBQ3hELElBQUksWUFBWSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLGFBQWE7b0JBQ3BELFlBQVksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzFDLENBQUM7Z0JBRUQsTUFBQSxZQUFZLENBQUMsY0FBYyxDQUFDLFlBQVksMENBQUUsT0FBTyxFQUFFLENBQUM7WUFDeEQsQ0FBQztRQUNMLENBQUM7UUFFa0Isc0JBQXNCLENBQUMsSUFBc0I7WUFDNUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRWtCLGlCQUFpQixDQUFDLFVBQWtCO1lBRW5ELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRTdELElBQUksaUJBQWlCLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3pDLENBQUM7UUFDTCxDQUFDO1FBRWtCLHFCQUFxQixDQUFDLElBQTJDO1lBQ2hGLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVPLGtCQUFrQixDQUFDLGNBQWtDOztZQUN6RCxNQUFBLElBQUksQ0FBQyxrQkFBa0IsMENBQUUsT0FBTyxFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FDeEMsY0FBYyxFQUNkLEVBQUUsQ0FBQyxrQkFBa0IsRUFDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUNoQyxFQUFFLENBQUMsYUFBYSxFQUNoQixJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFDekIsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQ3JCLENBQUM7UUFDTixDQUFDO1FBRU8sbUJBQW1CLENBQUMsY0FBa0M7O1lBQzFELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNuRixNQUFBLElBQUksQ0FBQyxtQkFBbUIsMENBQUUsT0FBTyxFQUFFLENBQUM7WUFDcEMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUU7Z0JBQ3ZGLEtBQUssRUFBRSxFQUFFLENBQUMsYUFBYTtnQkFDdkIsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLHFCQUFxQjthQUN6RCxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRU8scUJBQXFCLENBQUMsR0FBZ0I7O1lBRTFDLE1BQUEsSUFBSSxDQUFDLFVBQVUsMENBQUUsT0FBTyxFQUFFLENBQUM7WUFFM0IsTUFBTSxZQUFZLEdBQUksa0JBQWtCLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JGLE1BQU0sTUFBTSxHQUFVLElBQUEsK0NBQWMsRUFBQyxZQUFZLENBQUMsQ0FBQztZQUNuRCxNQUFNLFNBQVMsR0FBTywyQkFBMkIsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzlFLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQztZQUMzRCxNQUFNLE1BQU0sR0FBVSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV6RSxJQUFJLENBQUMsb0JBQW9CLEdBQUcsU0FBUyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUU7Z0JBQ2pELEtBQUssRUFBRSxhQUFhO2dCQUNwQixNQUFNLEVBQUUsYUFBYTtnQkFDckIsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsU0FBUyxFQUFFLEVBQUUsQ0FBQyxhQUFhO2dCQUMzQixTQUFTLEVBQUUsRUFBRSxDQUFDLGFBQWE7Z0JBQzNCLFFBQVEsRUFBRSxFQUFFLENBQUMscUJBQXFCO2dCQUNsQyxRQUFRLEVBQUUsRUFBRSxDQUFDLHFCQUFxQjtnQkFDbEMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxxQkFBcUI7Z0JBQ2xDLEtBQUssRUFBRSxHQUFHLENBQUMsY0FBYyxDQUFDLFFBQVE7Z0JBQ2xDLFdBQVcsRUFBRSxNQUFNLENBQUMsTUFBTTtnQkFDMUIsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDO2FBQ25CLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFZSxpQkFBaUI7WUFFN0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFbEQsSUFBSSxJQUFJLENBQUMscUJBQXFCO2dCQUMxQixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUMxQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDeEIsQ0FBQztpQkFDSSxDQUFDO2dCQUVGLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7b0JBRXhDLElBQUksSUFBSSxFQUFFLENBQUM7d0JBQ1AsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDO29CQUN2RCxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUVPLDJCQUEyQixDQUFDLFFBQThCO1lBRTlELFFBQVEsQ0FBQyxZQUFZLENBQUMsOERBQTZCLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3pFLFFBQVEsQ0FBQyxZQUFZLENBQUMsb0RBQW1CLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDakUsUUFBUSxDQUFDLFlBQVksQ0FBQyxzREFBcUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoRCxRQUFRLENBQUMsWUFBWSxDQUFDLDBEQUF5QixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekQsUUFBUSxDQUFDLFlBQVksQ0FBQywwREFBeUIsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFbEUsTUFBTSxNQUFNLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNwRixNQUFNLFdBQVcsR0FBRyxJQUFBLHVEQUFzQixFQUFDO2dCQUN2QyxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO2dCQUN6QixLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO2dCQUN6QixrQkFBa0IsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxhQUFhO2dCQUN4RCxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPO2dCQUNuQyxlQUFlLEVBQUUsTUFBTTthQUMxQixDQUFDLENBQUM7WUFFSCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRTVDLEtBQUssSUFBSSxTQUFTLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQy9CLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3hELENBQUM7WUFFRCxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDO1lBQzlDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN0QixDQUFDO1FBRWUsY0FBYyxDQUFDLFFBQThCO1lBQ3pELElBQUksQ0FBQywyQkFBMkIsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzQyxLQUFLLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFZSxhQUFhLENBQUMsSUFBVztZQUNyQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBRU0sSUFBSSxDQUFDLEdBQWdCLEVBQUUsTUFBa0IsRUFBRSxRQUE4QjtZQUM1RSxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzdDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN0QyxDQUFDO0tBQ0o7SUFuWUQsaUNBbVlDOzs7OztJQzdaRCxNQUFxQixxQkFBcUI7UUFPdEMsSUFBVyxTQUFTLEtBQWMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUMzRCxJQUFXLFNBQVMsQ0FBQyxDQUFVO1lBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBRUQsSUFBVyxVQUFVLEtBQWMsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUM3RCxJQUFXLFVBQVUsQ0FBQyxDQUFVO1lBQzVCLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBRUQsSUFBVyxhQUFhLEtBQWMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUNuRSxJQUFXLGFBQWEsQ0FBQyxDQUFVO1lBQy9CLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBSUQsWUFBWSxZQUEyRSxFQUFFLE9BQXVCOztZQUM1RyxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztZQUNqQyxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQUEsT0FBTyxDQUFDLFNBQVMsbUNBQUksS0FBSyxDQUFDO1lBQzdDLElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBQSxPQUFPLENBQUMsVUFBVSxtQ0FBSSxLQUFLLENBQUM7WUFDL0MsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFBLE9BQU8sQ0FBQyxhQUFhLG1DQUFJLEtBQUssQ0FBQztZQUNyRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDO1FBQ3BDLENBQUM7UUFFUyxhQUFhO1lBRW5CLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQztZQUNoRSxJQUFJLGtCQUFrQixFQUFFLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUN6QyxDQUFDO1lBRUQsS0FBSyxNQUFNLFlBQVksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQzdELElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbkMsQ0FBQztZQUVELElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDeEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRVMsV0FBVyxDQUFDLFlBQXNDO1lBQ3hELElBQUksWUFBWSxFQUFFLENBQUM7Z0JBQ2YsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztnQkFDcEcsWUFBWSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO2dCQUMzQyxZQUFZLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7WUFDckQsQ0FBQztRQUNMLENBQUM7UUFFTSxZQUFZLENBQUMsT0FBZ0IsRUFBRSxTQUFjLEVBQUUsVUFBZSxFQUFFLEtBQVUsRUFBRSxNQUFXLEVBQUUsTUFBVyxFQUFFLElBQVMsRUFBRSxJQUFTLEVBQUUsSUFBUyxFQUFFLE9BQTRCO1lBRXRLLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDO1lBQzFDLE1BQU0sVUFBVSxHQUFHLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQztZQUN6RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN6RCxNQUFNLFFBQVEsR0FBRyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBRW5DLE1BQU0sQ0FBQyxJQUFJLEdBQWdCLFFBQVEsQ0FBQztZQUNwQyxNQUFNLENBQUMsT0FBTyxHQUFhLE9BQU8sQ0FBQztZQUNuQyxNQUFNLENBQUMsZ0JBQWdCLEdBQUksU0FBUyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxpQkFBaUIsR0FBRyxVQUFVLENBQUM7WUFDdEMsTUFBTSxDQUFDLFlBQVksR0FBUSxLQUFLLENBQUM7WUFDakMsTUFBTSxDQUFDLEdBQUcsR0FBaUIsT0FBTyxDQUFDO1lBRW5DLElBQUksTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN4QixNQUFNLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztnQkFDOUIsTUFBTSxDQUFDLHVCQUF1QixHQUFHLE9BQU8sQ0FBQztnQkFDekMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQztZQUNuQyxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBRTFDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsa0JBQW1CLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFFNUYsU0FBUyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7Z0JBQzVCLFNBQVMsQ0FBQyxJQUFJLEdBQU0sU0FBUyxDQUFDO2dCQUM5QixTQUFTLENBQUMsS0FBSyxHQUFLLEtBQUssQ0FBQztnQkFDMUIsU0FBUyxDQUFDLElBQUksR0FBTSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUM7Z0JBRWxGLFNBQVMsQ0FBQyxVQUFVLENBQUMsc0RBQXFCLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO2dCQUUzRCxPQUFPO1lBQ1gsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBRXZDLElBQUksT0FBTyxFQUFFLENBQUM7b0JBRVYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBRXpFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO3dCQUVkLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7d0JBQ2pDLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUVqRCxZQUFZLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzt3QkFDNUIsWUFBWSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQzt3QkFDckMsWUFBWSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO3dCQUMzQyxZQUFZLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7d0JBRWpELFNBQVMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDO29CQUNuRixDQUFDO2dCQUNMLENBQUM7Z0JBRUQsT0FBTztZQUNYLENBQUM7WUFFRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUM7WUFDL0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVwQyxJQUFJLFlBQVksRUFBRSxDQUFDO2dCQUNmLFlBQVksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO2dCQUMvQixZQUFZLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDO2dCQUV4QyxZQUFZLENBQUMsVUFBVSxHQUFNLElBQUksQ0FBQyxXQUFXLENBQUM7Z0JBQzlDLFlBQVksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUNyRCxDQUFDO1lBRUQsU0FBUyxDQUFDLElBQUksR0FBSSxTQUFTLENBQUM7WUFDNUIsU0FBUyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDeEIsU0FBUyxDQUFDLElBQUksR0FBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUM7WUFFaEYsWUFBWSxDQUFDLFlBQVksQ0FBQyxzREFBcUIsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVNLE1BQU0sQ0FBQyxPQUFrQjtZQUU1QixzRUFBc0U7WUFDdEUsMENBQTBDO1lBRTFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7WUFFaEMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBRTFDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQztnQkFFaEUsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO29CQUNyQixrQkFBa0IsQ0FBQyxPQUFPLEdBQVMsSUFBSSxDQUFDO29CQUN4QyxrQkFBa0IsQ0FBQyxVQUFVLEdBQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQztvQkFDcEQsa0JBQWtCLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7b0JBRXZELE1BQU0sSUFBSSxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQztvQkFDckMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFcEMsU0FBUyxDQUFDLElBQUksR0FBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUM7Z0JBQ3BGLENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBRUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBRXJELElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3ZDLENBQUM7UUFDTCxDQUFDO0tBQ0o7SUExS0Qsd0NBMEtDOzs7Ozs7Ozs7O0lFdkxZLFFBQUEsWUFBWSxHQUN6Qjs7Ozs7Ozs7Ozs7Ozs7Q0FjQyxDQUFDO0lBRVcsUUFBQSxZQUFZLEdBQ3pCOzs7Ozs7Ozs7Ozs7O0NBYUMsQ0FBQztJQUVXLFFBQUEsY0FBYyxHQUMzQjtNQUNNLG9CQUFZOzs7Ozs7Ozs7Q0FTakIsQ0FBQztJQUVXLFFBQUEsb0JBQW9CLEdBQ2pDO01BQ00sb0JBQVk7Ozs7Ozs7Ozs7Ozs7OztDQWVqQixDQUFDOzs7Ozs7SUMvREssTUFBTSxZQUFZLEdBQUcsQ0FBQyxjQUFrQyxFQUFFLFVBQWtCLEVBQUUsRUFBRTtRQUNuRixPQUFPLFlBQVksR0FBRyxjQUFjLENBQUMsU0FBUyxHQUFHLFdBQVcsR0FBRyxVQUFVLENBQUM7SUFDOUUsQ0FBQyxDQUFBO0lBRlksUUFBQSxZQUFZLGdCQUV4QjtJQUVNLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxjQUFrQyxFQUFFLEVBQUU7UUFFckUsMEJBQTBCO1FBQzFCLElBQUksY0FBYyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzFCLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxJQUFJLE1BQU0sR0FBWSxLQUFLLENBQUM7UUFFNUIsSUFBSSxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFMUIsTUFBTSxFQUFFLEdBQUksY0FBMEMsQ0FBQyxFQUFFLENBQUM7WUFFMUQsTUFBTSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsd0JBQXdCLENBQUMsQ0FBQztZQUVuRCxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUNULE1BQU0sR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDbEQsQ0FBQztRQUNMLENBQUM7UUFFRCxnQ0FBZ0M7UUFFaEMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3BCLENBQUMsQ0FBQTtJQXZCWSxRQUFBLGtCQUFrQixzQkF1QjlCOzs7Ozs7SUN2QlksUUFBQSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7SUFDdEIsUUFBQSxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7SUFFaEQsTUFBcUIsWUFBWTtRQW1CN0IsSUFBVyxRQUFRLEtBQU8sT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFXLFNBQVMsS0FBTSxPQUFPLHdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUNwRCxJQUFXLFVBQVUsS0FBSyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBRWhELFlBQVksR0FBZ0IsRUFBRSxNQUFtQjtZQUU3QyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztZQUN2QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1lBRWhCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBRU8sV0FBVztZQUVmLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsd0JBQWdCLENBQUUsQ0FBQztZQUU5RSxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDO2dCQUM1QyxXQUFXLEVBQUUsSUFBSSxDQUFDLE9BQU87Z0JBQ3pCLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRO2dCQUN4QyxLQUFLLEVBQUUsS0FBSzthQUNmLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUNsRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSx3QkFBZ0IsQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRTtnQkFDN0MsVUFBVSxFQUFFLEVBQUUsQ0FBQyx1QkFBdUI7Z0JBQ3RDLGdCQUFnQixFQUFFLEtBQUs7Z0JBQ3ZCLGdCQUFnQixFQUFFLEtBQUs7Z0JBQ3ZCLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ1osTUFBTSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztnQkFDekIsUUFBUSxFQUFFLEdBQUc7Z0JBQ2IsT0FBTyxFQUFFLHdCQUFnQixHQUFHLENBQUM7Z0JBQzdCLFlBQVksRUFBRSxJQUFJLENBQUMsb0JBQW9CO2FBQzFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUVuRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUMxQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTyxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7WUFDekQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU8sQ0FBQyxXQUFXLEdBQUcsd0JBQWdCLENBQUM7UUFDckUsQ0FBQztRQUVPLGFBQWE7WUFFakIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyx3QkFBZ0IsQ0FBRSxDQUFDO1lBRTlFLFlBQVksQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDO1lBRXRELElBQUksQ0FBQyxjQUFjLEdBQUksSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDNUQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFO2dCQUN2QyxJQUFJLEVBQUUsT0FBTztnQkFDYixNQUFNLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO2dCQUN6QixRQUFRLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtnQkFDL0IsV0FBVyxFQUFFLEtBQUs7Z0JBQ2xCLG1CQUFtQixFQUFFLEtBQUs7Z0JBQzFCLGNBQWMsRUFBRSxLQUFLO2FBQ3hCLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxvQkFBb0IsR0FBSSxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsb0JBQW9CLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRTtnQkFDN0MsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsTUFBTSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztnQkFDekIsUUFBUSxFQUFFLElBQUksQ0FBQyxzQkFBc0I7Z0JBQ3JDLFdBQVcsRUFBRSxLQUFLO2dCQUNsQixtQkFBbUIsRUFBRSxLQUFLO2dCQUMxQixjQUFjLEVBQUUsS0FBSzthQUN4QixDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztZQUMzRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1lBRWpFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRTdDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVsRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUMxQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDeEMsQ0FBQztRQUVPLFlBQVk7WUFFaEIsTUFBTSxNQUFNLEdBQUcsc0NBQVksQ0FBQztZQUM1QixNQUFNLFFBQVEsR0FBRyxJQUFBLHlCQUFZLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsd0NBQWMsQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sY0FBYyxHQUFHLElBQUEseUJBQVksRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSw4Q0FBb0IsQ0FBQyxDQUFDO1lBRXBGLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsdUJBQXVCLEVBQUU7Z0JBQy9HLFNBQVMsRUFBRSxFQUFFLENBQUMsaUJBQWlCO2dCQUMvQixJQUFJLEVBQUUsRUFBRSxDQUFDLGtCQUFrQjthQUM5QixDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsNkJBQTZCLEVBQUU7Z0JBQ2pJLFNBQVMsRUFBRSxFQUFFLENBQUMsaUJBQWlCO2dCQUMvQixJQUFJLEVBQUUsRUFBRSxDQUFDLGtCQUFrQjthQUM5QixDQUFDLENBQUM7UUFDUCxDQUFDO1FBRU8sY0FBYztZQUVsQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDMUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksR0FBRyxzQkFBc0IsQ0FBQztZQUNwRCxhQUFhO1lBQ2IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQ25ELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQztZQUNwRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFL0IsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2hELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEdBQUcsNEJBQTRCLENBQUM7WUFDaEUsYUFBYTtZQUNiLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDO1lBQy9ELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDO1lBQzdELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN6QyxDQUFDO1FBRU8sc0JBQXNCLENBQUMsRUFBVTtZQUNyQyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQztZQUNwRCxNQUFNLE9BQU8sR0FBRyxlQUFlLENBQUM7WUFDaEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDN0QsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUVPLHVCQUF1QixDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsVUFBa0IsRUFBRSxXQUFtQjtZQUV6RixNQUFNLEdBQUcsR0FBTSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztZQUNsQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQztZQUU5RCxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7WUFDL0MsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUU3QixVQUFVLEdBQUksVUFBVSxHQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFJLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDL0QsV0FBVyxHQUFHLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBRS9ELElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFTSxVQUFVLENBQUMsRUFBVSxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsVUFBa0IsRUFBRSxXQUFtQjtZQUV2RixJQUFJLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBRTVELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUNuQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUM3QyxDQUFDO1FBRU0sU0FBUztZQUNaLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQzFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNwQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUM5QyxDQUFDO1FBRU8sU0FBUyxDQUFDLENBQVMsRUFBRSxDQUFTO1lBQ2xDLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFTyxZQUFZLENBQUMsQ0FBUyxFQUFFLENBQVM7WUFDckMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFTSxjQUFjLENBQUMsYUFBNkIsRUFBRSxXQUFtQjtZQUVwRSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUxQixJQUFJLFdBQVcsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDbEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNDLENBQUM7WUFFRCxNQUFNLFlBQVksR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUF1QixDQUFDO1lBRTFGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztZQUUvRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFFckUsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7UUFDeEMsQ0FBQztLQUNKO0lBaE5ELCtCQWdOQzs7Ozs7SUN2TkQsOEJBRUM7SUFFRCxvQ0FpQkM7SUFFRCwwQkFnQkM7SUF2Q0QsU0FBZ0IsU0FBUyxDQUFDLEtBQWE7UUFDbkMsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRCxTQUFnQixZQUFZLENBQW9DLFFBQVc7UUFFdkUsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBRWxCLEtBQUssSUFBSSxLQUFLLElBQUksUUFBUSxFQUFFLENBQUM7WUFFekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO2dCQUMvQixTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDbkIsU0FBUztZQUNiLENBQUM7WUFFRCxNQUFNLFNBQVMsR0FBNEIsRUFBRSxDQUFDO1lBQzlDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVELFNBQWdCLE9BQU8sQ0FBb0MsUUFBVztRQUVsRSxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFFbEIsS0FBSyxJQUFJLEtBQUssSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUV6QixJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUNsQyxTQUFTO1lBQ2IsQ0FBQztZQUVELE1BQU0sU0FBUyxHQUE0QixFQUFFLENBQUM7WUFDOUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDOzs7Ozs7SUNyQ1ksUUFBQSxzQkFBc0IsR0FBRyxHQUFHLENBQUM7SUFDN0IsUUFBQSxlQUFlLEdBQUcsSUFBQSwyQkFBTyxFQUFDO1FBQ25DLEtBQUssRUFBSSxHQUFHO1FBQ1osS0FBSyxFQUFJLEdBQUc7UUFDWixLQUFLLEVBQUksR0FBRztRQUNaLE1BQU0sRUFBRyxJQUFJO1FBQ2IsTUFBTSxFQUFHLElBQUk7UUFDYixNQUFNLEVBQUcsSUFBSTtRQUNiLE1BQU0sRUFBRyxJQUFJO1FBQ2IsT0FBTyxFQUFFLEtBQUs7UUFDZCxPQUFPLEVBQUUsS0FBSztLQUNqQixDQUFDLENBQUM7SUFFVSxRQUFBLDJCQUEyQixHQUFHLEVBQUUsQ0FBQztJQUNqQyxRQUFBLG9CQUFvQixHQUFHLElBQUEsMkJBQU8sRUFBQztRQUN4QyxJQUFJLEVBQUssRUFBRTtRQUNYLElBQUksRUFBSyxFQUFFO1FBQ1gsSUFBSSxFQUFLLEVBQUU7UUFDWCxLQUFLLEVBQUksR0FBRztRQUNaLEtBQUssRUFBSSxHQUFHO1FBQ1osS0FBSyxFQUFJLEdBQUc7UUFDWixNQUFNLEVBQUcsSUFBSTtLQUNoQixDQUFDLENBQUM7SUFFVSxRQUFBLHFDQUFxQyxHQUFHLE1BQU0sQ0FBQztJQUMvQyxRQUFBLDhCQUE4QixHQUFHLElBQUEsMkJBQU8sRUFBQztRQUNsRCxNQUFNLEVBQUUsTUFBTTtRQUNkLElBQUksRUFBRSxJQUFJO1FBQ1YsSUFBSSxFQUFFLElBQUk7S0FDYixDQUFDLENBQUM7Ozs7OztJQzdCSCxNQUFNLFVBQVUsR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNqQyxNQUFNLFVBQVUsR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUVqQyxNQUFhLFFBQVMsU0FBUSxFQUFFLENBQUMsR0FBRztRQU1oQyxTQUFTLENBQUMsR0FBYTtZQUNuQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2xDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEMsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDbEQsQ0FBQztLQUNKO0lBWEQsNEJBV0M7SUFFRCxrQkFBZSxRQUFRLENBQUM7Ozs7O0lDK0N4Qiw0Q0F3REM7OztJQXBHRCxNQUFNLFFBQVEsR0FBVSxPQUFPLENBQUM7SUFDaEMsTUFBTSxjQUFjLEdBQUksSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdEMsTUFBTSxNQUFNLEdBQVksSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDckMsTUFBTSxhQUFhLEdBQUssSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdEMsTUFBTSxPQUFPLEdBQVcsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdEMsTUFBTSxPQUFPLEdBQVcsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdEMsTUFBTSxPQUFPLEdBQVcsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFdEMsTUFBTSxRQUFRLEdBQVMsSUFBSSxzQkFBUSxFQUFFLENBQUM7SUFDdEMsTUFBTSxXQUFXLEdBQU0sSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDckMsTUFBTSxjQUFjLEdBQUcsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDckMsTUFBTSxjQUFjLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFckMsSUFBSSx3QkFBd0IsR0FBRyxJQUFJLENBQUM7SUFPcEMsU0FBUyxzQkFBc0IsQ0FBQyxHQUFZLEVBQUUsS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTTs7UUFDakU7Ozs7Ozs7VUFPRTtRQUNGLGNBQWMsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNuRCxjQUFjLENBQUMsQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDdkQsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELGNBQWMsQ0FBQyxDQUFDLENBQUMsR0FBRyxjQUFjLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN2RCxjQUFjLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDbkQsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ3RELGNBQWMsQ0FBQyxDQUFDLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN0RCxjQUFjLENBQUMsQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDdEQsY0FBYyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ25ELGNBQWMsQ0FBQyxDQUFDLENBQUMsR0FBSSxjQUFjLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN4RCxjQUFjLENBQUMsRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDeEQsY0FBYyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ3hELE1BQUEsRUFBRSxDQUFDLEdBQUcsMENBQUUsY0FBYyxDQUFDLGNBQWMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELFNBQWdCLGdCQUFnQixDQUFDLElBQVcsRUFBRSxHQUFZO1FBRXRELE1BQU0sU0FBUyxHQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDaEMsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUVuQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN2QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUV2QixJQUFJLElBQUksR0FBRyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUNqRCxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUVqRCxJQUFJLElBQUksR0FBRyxJQUFJLEVBQUUsQ0FBQztZQUNkLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztZQUNoQixJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ1osSUFBSSxHQUFHLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRUQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDbEQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFFbEQsSUFBSSxLQUFLLEdBQUcsS0FBSyxFQUFFLENBQUM7WUFDaEIsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDO1lBQ2pCLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDZCxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLENBQUM7UUFFRCxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDbkMsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVELElBQUksS0FBSyxHQUFHLElBQUksRUFBRSxDQUFDO1lBQ2YsSUFBSSxHQUFHLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRUQsSUFBSSxLQUFLLEdBQUcsSUFBSSxFQUFFLENBQUM7WUFDZixJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFRCxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUVsRCxJQUFJLEtBQUssR0FBRyxLQUFLLEVBQUUsQ0FBQztZQUNoQixJQUFJLElBQUksR0FBRyxLQUFLLENBQUM7WUFDakIsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNkLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDakIsQ0FBQztRQUVELElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNuQyxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELE1BQXFCLGdCQUFnQjtRQU9qQyxZQUFZLFNBQXVDO1lBQy9DLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1lBQzVCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDL0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBRU0saUJBQWlCO1lBRXBCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUM1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7WUFFNUMsSUFBSSxDQUFDLFlBQVksR0FBRztnQkFDaEIsSUFBSSxFQUFFLENBQUMsU0FBUztnQkFDaEIsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUztnQkFDL0IsSUFBSSxFQUFFLENBQUMsU0FBUztnQkFDaEIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUztnQkFDL0IsSUFBSSxFQUFFLFNBQVM7YUFDbEIsQ0FBQTtRQUNMLENBQUM7UUFFUyxzQkFBc0IsQ0FBQyxHQUFhLEVBQUUsR0FBWSxFQUFFLFVBQWdDO1lBRTFGLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLEVBQUUsQ0FBQztnQkFFeEMsTUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRXBELElBQUksVUFBVSxDQUFDLFFBQVEsR0FBRyxRQUFRLEVBQUUsQ0FBQztvQkFDakMsVUFBVSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7b0JBRS9CLEdBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUV0QyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQy9DLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUMxQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFFckMsc0JBQXNCLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBRTFDLE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDckQsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNyRCxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBRXJELElBQUksVUFBVSxHQUFHLFVBQVUsRUFBRSxDQUFDO3dCQUUxQixJQUFJLFVBQVUsR0FBRyxVQUFVLEVBQUUsQ0FBQzs0QkFDMUIsVUFBVSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO3dCQUN4QyxDQUFDOzZCQUNJLENBQUM7NEJBQ0YsVUFBVSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO3dCQUN4QyxDQUFDO29CQUNMLENBQUM7eUJBQ0ksQ0FBQzt3QkFFRixJQUFJLFVBQVUsR0FBRyxVQUFVLEVBQUUsQ0FBQzs0QkFDMUIsVUFBVSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO3dCQUN4QyxDQUFDOzZCQUNJLENBQUM7NEJBQ0YsVUFBVSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO3dCQUN4QyxDQUFDO29CQUNMLENBQUM7b0JBRUQsT0FBTyxJQUFJLENBQUM7Z0JBQ2hCLENBQUM7WUFDTCxDQUFDO1lBRUQsOEJBQThCO1lBQzlCLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFUyxlQUFlLENBQUMsS0FBVSxFQUFFLEdBQXdCO1lBRTFELE1BQU0sQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDNUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUU1QyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFFUyxXQUFXLENBQUMsRUFBcUIsRUFBRSxHQUFZLEVBQUUsTUFBNEI7WUFFbkYsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNuQixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBRW5CLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUM5RixPQUFPLEtBQUssQ0FBQztZQUNkLENBQUM7WUFFSyxNQUFNLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxQixNQUFNLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUUxQixJQUFJLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDO1lBRTNCLENBQUM7Z0JBQ0csSUFBSSxLQUFLLEtBQUssS0FBSyxFQUFFLENBQUM7b0JBQ2xCLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDbkQsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNuRCxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELENBQUM7cUJBQU0sQ0FBQztvQkFDSixNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ25ELE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDbkQsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUN2RCxDQUFDO2dCQUVELElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBRXRDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO2dCQUN6QixRQUFRLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztnQkFDekIsUUFBUSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7Z0JBRXpCLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUM1QyxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsc0JBQXNCLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUNyRCxPQUFPLElBQUksQ0FBQztZQUNoQixDQUFDO1lBRUQsQ0FBQztnQkFDRyxJQUFJLEtBQUssS0FBSyxLQUFLLEVBQUUsQ0FBQztvQkFDbEIsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNuRCxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ25ELE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDdkQsQ0FBQztxQkFBTSxDQUFDO29CQUNKLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDbkQsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNuRCxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELENBQUM7Z0JBRUQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3RDLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFFdEMsUUFBUSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7Z0JBQ3pCLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO2dCQUN6QixRQUFRLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztnQkFFekIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzVDLENBQUM7WUFFRCxJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQ3JELE9BQU8sSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU8sY0FBYyxDQUFDLFFBQWlCLEVBQUUsU0FBK0IsSUFBSSxrQ0FBb0IsRUFBRTtZQUUvRixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUNqRCxPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDO1lBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDO1lBQzNDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDO1lBRTNDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTFELElBQUksaUJBQWlCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDMUQsSUFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUUxRCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQUEsaUJBQWlCLEVBQUksQ0FBQyxDQUFBLEdBQUcsU0FBQSxpQkFBaUIsRUFBSSxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRW5GLElBQUksZUFBZSxHQUFHLE1BQU0sRUFBRSxDQUFDO2dCQUMzQiw0QkFBNEI7Z0JBQzVCLGlCQUFpQixHQUFHLENBQUMsQ0FBQztnQkFDdEIsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1lBQzFCLENBQUM7aUJBQ0ksQ0FBQztnQkFDRixpQkFBaUIsSUFBSSxlQUFlLENBQUM7Z0JBQ3JDLGlCQUFpQixJQUFJLGVBQWUsQ0FBQztZQUN6QyxDQUFDO1lBRUQsTUFBTSxNQUFNLEdBQUcsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxRSxNQUFNLE1BQU0sR0FBRyxpQkFBaUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTFFLE1BQU0sV0FBVyxHQUFHLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUM5RSxNQUFNLFdBQVcsR0FBRyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFFOUUsSUFBSSxXQUFXLENBQUM7WUFDaEIsSUFBSSxXQUFXLENBQUM7WUFFaEIsSUFBSSxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ2YsV0FBVyxHQUFHLE1BQU0sS0FBSyxDQUFDO29CQUN0QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXO29CQUNoRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUM7WUFDMUUsQ0FBQztpQkFDSSxDQUFDO2dCQUNGLFdBQVcsR0FBRyxRQUFRLENBQUMsQ0FBRSx3QkFBd0I7WUFDckQsQ0FBQztZQUVELElBQUksTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUNmLFdBQVcsR0FBRyxNQUFNLEtBQUssQ0FBQztvQkFDdEIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVztvQkFDaEUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDO1lBQzFFLENBQUM7aUJBQ0ksQ0FBQztnQkFDRixXQUFXLEdBQUcsUUFBUSxDQUFDLENBQUUsd0JBQXdCO1lBQ3JELENBQUM7WUFFRCxNQUFNLEVBQUUsR0FBc0I7Z0JBQzFCLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUN2QixDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQkFDdkIsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsU0FBUyxFQUFFLENBQUM7Z0JBQ1osZUFBZSxFQUFFLGVBQWU7YUFDbkMsQ0FBQztZQUVMLCtEQUErRDtZQUMvRCxJQUFJLFdBQVcsS0FBSyxHQUFHLEVBQUUsQ0FBQztnQkFDbkIsV0FBVyxJQUFJLFdBQVcsQ0FBQztnQkFDM0Isd0ZBQXdGO2dCQUN4RixtREFBbUQ7Z0JBQ25ELElBQUksTUFBTSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQ2hCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNkLENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxXQUFXLEtBQUssR0FBRyxFQUFFLENBQUM7Z0JBQ3RCLFdBQVcsSUFBSSxXQUFXLENBQUM7Z0JBQzNCLElBQUksTUFBTSxLQUFLLENBQUMsQ0FBQztvQkFDYixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQixDQUFDO1lBRUQsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBRW5CLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFFYixFQUFFLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLEVBQUUsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDaEIsRUFBRSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO2dCQUV4QixJQUFJLFdBQVcsR0FBRyxXQUFXLEVBQUUsQ0FBQztvQkFDNUIsU0FBUztvQkFDVCxFQUFFLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQztvQkFDZixxQ0FBcUM7b0JBQ3JDLDZDQUE2QztvQkFDN0MsRUFBRSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7b0JBQ3ZCLFdBQVcsSUFBSSxXQUFXLENBQUM7Z0JBQy9CLENBQUM7cUJBQ0ksQ0FBQztvQkFDRixTQUFTO29CQUNULEVBQUUsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDO29CQUNmLEVBQUUsQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO29CQUN2QixXQUFXLElBQUksV0FBVyxDQUFDO2dCQUMvQixDQUFDO2dCQUVELElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQ3pDLE1BQU0sR0FBRyxJQUFJLENBQUM7Z0JBQ2xCLENBQUM7Z0JBRUQsSUFBSSxFQUFFLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDaEMsRUFBRSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDO29CQUM5QixNQUFNO2dCQUNWLENBQUM7WUFDTCxDQUFDO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQztRQUVNLGFBQWEsQ0FBQyxhQUEwQyxFQUFFLEdBQVksRUFBRSxTQUErQixJQUFJLGtDQUFvQixFQUFFO1lBRXBJLElBQUksYUFBYSxFQUFFLENBQUM7Z0JBQ2hCLGNBQWMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzVDLGNBQWMsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3pELGNBQWMsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRWhFLGNBQWMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ25DLHdCQUF3QixHQUFHLEtBQUssQ0FBQztZQUNyQyxDQUFDO2lCQUNJLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO2dCQUNqQyxjQUFjLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzdCLHdCQUF3QixHQUFHLElBQUksQ0FBQztZQUNwQyxDQUFDO1lBRUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRXRFLElBQUksR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO2dCQUN2QixnREFBZ0Q7Z0JBQ2hELGFBQWEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3pELGFBQWEsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEUsQ0FBQztZQUVELE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUNqQixDQUFDO0tBQ0o7SUF6U0QsbUNBeVNDOzs7Ozs7O0lDOVpELE1BQWEsZ0JBQWlCLFNBQVEsaUNBQWlDO1FBRTNELE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBVSxFQUFFLEtBQVUsRUFBRSxTQUFjO1lBRTlELE1BQU0sVUFBVSxHQUFLLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekQsTUFBTSxVQUFVLEdBQUssQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6RCxNQUFNLFlBQVksR0FBRyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzNDLE1BQU0sVUFBVSxHQUFLLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFFN0MsT0FBTyxJQUFJLFlBQVksQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVELFlBQVksS0FBVSxFQUFFLEtBQVUsRUFBRSxTQUFjLEVBQUUsYUFBa0IsRUFBRSxTQUFnQixFQUFFLFNBQWdCLEVBQUUsTUFBcUI7WUFDN0gsTUFBTSxrQkFBa0IsR0FBRyxJQUFBLGlEQUF1QixFQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUM3RSxNQUFNLFNBQVMsR0FBRyxNQUFNLGFBQU4sTUFBTSxjQUFOLE1BQU0sR0FBSSxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQzVGLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7S0FDSjtJQWpCRCw0Q0FpQkM7SUFFRCxrQkFBZSxnQkFBZ0IsQ0FBQzs7Ozs7O0lDdEJoQyxNQUFNLE1BQU0sR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM3QixNQUFNLE1BQU0sR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM3QixNQUFNLFNBQVMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUUxQyxNQUFhLE9BQU87UUFPaEIsSUFBVyxNQUFNLEtBQWlCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDeEQsSUFBVyxNQUFNLENBQUMsS0FBWSxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUV6RCxJQUFXLE9BQU8sS0FBdUIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNoRSxJQUFXLE9BQU8sQ0FBQyxLQUFrQixJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUVqRSxJQUFXLFNBQVMsS0FBb0IsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMzRCxJQUFXLFNBQVMsQ0FBQyxLQUFlO1lBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBRUQ7WUFDSSxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsSUFBSSxHQUFNLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxNQUFNLEdBQUksSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakMsQ0FBQztRQUVNLGNBQWMsQ0FBQyxNQUFhLEVBQUUsTUFBYSxFQUFFLE1BQWEsRUFBRSxNQUFhO1lBRTVFLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRXpDLG9EQUFvRDtZQUNwRCxTQUFTLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUMxQixTQUFTLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBRWhFLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7S0FDSjtJQXRDRCwwQkFzQ0M7Ozs7Ozs7Ozs7Ozs7O0lDUEQsTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZCLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQztJQUN6QixNQUFNLE1BQU0sR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM3QixNQUFNLHFCQUFxQixHQUFHLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzVDLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQztJQUUzQixJQUFZLFVBSVg7SUFKRCxXQUFZLFVBQVU7UUFDbEIsbURBQVksQ0FBQTtRQUNaLDZFQUF5QixDQUFBO1FBQ3pCLDZFQUF5QixDQUFBO0lBQzdCLENBQUMsRUFKVyxVQUFVLDBCQUFWLFVBQVUsUUFJckI7SUFFRCxNQUFhLGdCQUFpQixTQUFRLEVBQUUsQ0FBQyxVQUFVO1FBQW5EOztZQTRCWSxVQUFLLEdBQUcsQ0FBQyxDQUFDO1lBSVYseUJBQW9CLEdBQUcsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFckMsZUFBVSxHQUFHLEdBQUcsQ0FBQztZQUVqQixlQUFVLEdBQUcsR0FBRyxDQUFDO1lBSWpCLGNBQVMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMxQixZQUFPLEdBQUcsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDeEIsa0JBQWEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM5QixTQUFJLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7WUFJcEIsdUJBQWtCLEdBQVcsQ0FBQyxDQUFDO1lBSy9CLG1CQUFjLEdBQVcsQ0FBQyxDQUFDO1lBRTNCLHNCQUFpQixHQUFXLElBQUksQ0FBQztZQUNqQyx5QkFBb0IsR0FBWSxLQUFLLENBQUM7WUFpUHRDLGdCQUFXLEdBQUcsSUFBSSxDQUFDO1lBQ25CLGdCQUFXLEdBQUcsSUFBSSxDQUFDO1FBOE0vQixDQUFDO1FBL2RHLElBQVcsS0FBSyxLQUFLLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUNyRCxJQUFXLE9BQU8sS0FBSyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzlDLElBQVcscUJBQXFCLEtBQUssT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUluRSxJQUFXLElBQUksS0FBSyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBZ0NqQyxPQUFPO1lBQ1YsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFFTSxRQUFRO1lBQ1gsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFFTSxjQUFjO1lBRWpCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBRTNCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFFcEIsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLGdDQUFnQyxFQUFFLENBQUM7WUFFeEMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRXJCLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFbkIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxVQUFVLEtBQUssVUFBVSxDQUFDLHFCQUFxQixDQUFDO2dCQUMvRyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLEtBQUssVUFBVSxDQUFDLHFCQUFxQixDQUFDO2dCQUM1RyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNqRSxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNyRCxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLElBQUksQ0FBQyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pGLElBQUksQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWxHLElBQUksQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO2dCQUM3QixJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUNsQyxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO2dCQUN2QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQ2xDLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO2dCQUN4QixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDNUQsSUFBSSxDQUFDLGdDQUFnQyxFQUFFLENBQUM7WUFDNUMsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFTyxVQUFVO1lBQ2QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsUUFBdUIsQ0FBQztZQUN2RSxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksdUJBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksMEJBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFTyxzQkFBc0I7WUFDMUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDcEUsQ0FBQztRQUVPLFlBQVk7WUFFaEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztZQUV4QyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFFMUMsSUFBSSxXQUFXLEtBQUssSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUNwQyxPQUFPO1lBQ1gsQ0FBQztZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO2dCQUNwQyxPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQ3BDLE9BQU87WUFDWCxDQUFDO1lBRUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBdUIsQ0FBQztZQUM5RSxNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsU0FBUyxFQUE0QixDQUFDO1lBRXBFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDWixPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQ3BDLE9BQU87WUFDWCxDQUFDO1lBRUQsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7WUFDaEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWxDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFTyxZQUFZO1lBRWhCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztZQUNqRSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEtBQUssTUFBTTtnQkFDbEQsQ0FBQyxDQUFDLElBQUksd0NBQTBCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUM7Z0JBQ3hJLENBQUMsQ0FBQyxJQUFJLDhCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUV4RyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksNkNBQW1CLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSw4QkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksa0NBQW9CLEVBQUUsQ0FBQztZQUNqRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUkscUJBQU8sRUFBRSxDQUFDO1lBRTlCLE1BQU0sT0FBTyxHQUFHLElBQUksNEJBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLG1DQUFxQixDQUFDLE9BQU8sRUFBRTtnQkFDdEQsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO2dCQUN6QixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7Z0JBQzNCLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTthQUNwQyxDQUFDLENBQUM7WUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM3RSxDQUFDO1FBRU8sc0JBQXNCO1lBQzFCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUMzQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxrQkFBa0IsQ0FBQztRQUM3QyxDQUFDO1FBRU8sZ0NBQWdDO1lBQ3BDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLHlEQUF3QixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDckYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsMERBQXlCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQywwREFBeUIsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7UUFFTyxhQUFhOztZQUVqQixPQUFPO1lBQ1AsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLE1BQU0sS0FBSyxHQUFJLElBQUksQ0FBQztZQUNwQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFFcEIsSUFBSSxNQUFNLEdBQUssQ0FBQyxDQUFDO1lBQ2pCLElBQUksS0FBSyxHQUFNLEVBQUUsQ0FBQztZQUNsQixJQUFJLE1BQU0sR0FBSyxFQUFFLENBQUM7WUFDbEIsSUFBSSxPQUFPLEdBQUksRUFBRSxDQUFDO1lBQ2xCLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUNsQixJQUFJLE9BQU8sR0FBSSxFQUFFLENBQUM7WUFFbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUVoQyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7Z0JBRWIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFFekIsTUFBTSxLQUFLLEdBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDakMsTUFBTSxPQUFPLEdBQUssS0FBSyxDQUFDLE9BQU8sQ0FBQztvQkFDaEMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztvQkFFbEMsSUFBSSxPQUFPLEVBQUUsQ0FBQzt3QkFFVixJQUFJLEVBQUUsQ0FBQzt3QkFDUCxNQUFNLEVBQUUsQ0FBQzt3QkFDVCxRQUFRLENBQUMsSUFBSSxDQUFFLE9BQU8sQ0FBQyxRQUF3QixDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7d0JBQzdELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDeEMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUU3QyxJQUFJLFNBQVMsRUFBRSxDQUFDOzRCQUNaLElBQUksRUFBRSxDQUFDOzRCQUNQLE9BQU8sQ0FBQyxJQUFJLENBQUUsU0FBUyxDQUFDLFFBQXdCLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQzt3QkFDbEUsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7Z0JBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQixDQUFDO1lBRUQsTUFBQSxJQUFJLENBQUMsY0FBYywwQ0FBRSxPQUFPLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRTtnQkFDMUQsSUFBSSxFQUFFLHNCQUFzQjtnQkFDNUIsTUFBTSxFQUFFLEVBQUUsQ0FBQyxpQkFBaUI7Z0JBQzVCLEtBQUssRUFBRSxLQUFLO2dCQUNaLE1BQU0sRUFBRSxNQUFNO2dCQUNkLFdBQVcsRUFBRSxNQUFNO2dCQUNuQixTQUFTLEVBQUUsRUFBRSxDQUFDLGNBQWM7Z0JBQzVCLFNBQVMsRUFBRSxFQUFFLENBQUMsNkJBQTZCO2dCQUMzQyxPQUFPLEVBQUUsSUFBSTtnQkFDYixRQUFRLEVBQUUsRUFBRSxDQUFDLGNBQWM7Z0JBQzNCLFFBQVEsRUFBRSxFQUFFLENBQUMsY0FBYztnQkFDM0IsUUFBUSxFQUFFLEVBQUUsQ0FBQyxxQkFBcUI7Z0JBQ2xDLE1BQU0sRUFBRSxDQUFFLFFBQWUsQ0FBRTthQUM5QixDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRTdCLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLHFCQUFxQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUMxRSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyx3QkFBd0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyx5QkFBeUIsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBRU8sV0FBVztZQUNmLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxVQUFVLEtBQUssVUFBVSxDQUFDLHFCQUFxQixDQUFDO1lBQy9HLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsS0FBSyxVQUFVLENBQUMscUJBQXFCLENBQUM7WUFDNUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbEYsQ0FBQztRQUVPLGdCQUFnQjs7WUFDcEIsTUFBQSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssMENBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNoRSxNQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSywwQ0FBRSxFQUFFLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbEUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFOztnQkFDcEIsTUFBQSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssMENBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDakUsTUFBQSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssMENBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3ZFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVPLFlBQVksQ0FBQyxLQUFxQjtZQUN0QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDO1FBQ3JDLENBQUM7UUFFTyxhQUFhLENBQUMsS0FBcUI7WUFDdkMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7WUFDM0UsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFTyxtQkFBbUI7O1lBQ3ZCLE1BQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLDBDQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDcEUsTUFBQSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsMENBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNoRSxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7O2dCQUNwQixNQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSywwQ0FBRSxHQUFHLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNsRSxNQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSywwQ0FBRSxHQUFHLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2xFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUlPLGVBQWUsQ0FBQyxLQUF3QjtZQUU1QyxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssS0FBSyxJQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN6RCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztnQkFDeEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLENBQUM7WUFFRCxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssS0FBSyxJQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUM5RCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztnQkFDeEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLENBQUM7UUFDTCxDQUFDO1FBRU8sYUFBYSxDQUFDLEtBQXdCO1lBQzFDLElBQUksS0FBSyxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQzdCLENBQUM7aUJBQ0ksSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDckMsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDN0IsQ0FBQztRQUNMLENBQUM7UUFFYSx3QkFBd0I7O2dCQUVsQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBRXRCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO3dCQUN2QyxPQUFPO29CQUNYLENBQUM7b0JBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBdUIsQ0FBQztvQkFDekQsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRTt3QkFDNUMsb0JBQW9CLEVBQUUsSUFBSTt3QkFDMUIscUJBQXFCLEVBQUUsSUFBSTtxQkFDOUIsQ0FBQyxDQUFDO2dCQUNQLENBQUM7cUJBQ0ksQ0FBQztvQkFFRixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQztvQkFFdkMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUNYLE9BQU8sQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQzt3QkFDeEMsT0FBTztvQkFDWCxDQUFDO29CQUVELE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUF1QixDQUFDO29CQUNqRCxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsU0FBUyxFQUFTLENBQUM7b0JBRXhDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQzt3QkFDUCxPQUFPLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7d0JBQ3hDLE9BQU87b0JBQ1gsQ0FBQztvQkFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUVsRyx3QkFBd0I7b0JBQ3hCLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDdkIsQ0FBQztnQkFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDO29CQUM1QyxJQUFJLEVBQUUsQ0FBQztvQkFDUCxJQUFJLEVBQUUsQ0FBQztvQkFDUCxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUs7b0JBQ2hCLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSztpQkFDbkIsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztTQUFBO1FBRU8sbUJBQW1CO1lBRXZCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2pELE1BQU0sS0FBSyxHQUFJLElBQUksS0FBSyxFQUFFLENBQUM7WUFFM0IsS0FBSyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUM7WUFFbkIsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFFLENBQUM7WUFDNUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFYSxvQkFBb0I7O2dCQUU5QixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNwRCxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMxQyxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUU3QixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFN0IsQ0FBQyxDQUFDLElBQUksR0FBTyxPQUFPLENBQUM7Z0JBQ3JCLENBQUMsQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFNBQVMsR0FBRyxZQUFZLEVBQUUsQ0FBQztnQkFDL0MsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUVWLEdBQUcsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakMsQ0FBQztTQUFBO1FBRU0sTUFBTSxDQUFDLEVBQVU7O1lBRXBCLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNuQyxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsVUFBVTtnQkFDZixJQUFJLENBQUMsWUFBWTtnQkFDakIsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFFM0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7Z0JBQ3hDLE1BQU0sR0FBRyxHQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDL0MsTUFBTSxLQUFLLEdBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUU5QixJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO29CQUUzQixJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7b0JBRXZCLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUM5RyxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFFM0csSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBRXRELE1BQU0sU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBRTlHLElBQUksU0FBUyxFQUFFLENBQUM7d0JBQ1osSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7d0JBQ2xELElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7d0JBQzVCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDMUcsQ0FBQztvQkFFRCxJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO3dCQUU1QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNqRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUVqRCxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUscUJBQXFCLENBQUMsQ0FBQzt3QkFFaEcsSUFBQSxxQkFBUyxFQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO3dCQUNsSSxJQUFBLCtCQUFtQixFQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBRTdGLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDOzZCQUNkLE1BQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLDBDQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsQ0FBQSxFQUFFLENBQUM7NEJBRWpELElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dDQUVoQixNQUFNLEtBQUssR0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7Z0NBQ3hDLE1BQU0sS0FBSyxHQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztnQ0FDeEMsTUFBTSxDQUFDLEdBQVMscUJBQXFCLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztnQ0FDaEQsTUFBTSxDQUFDLEdBQVMscUJBQXFCLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztnQ0FDaEQsTUFBTSxNQUFNLEdBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztnQ0FDbkMsTUFBTSxNQUFNLEdBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztnQ0FFbkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDOzRCQUM1RCxDQUFDO2lDQUNJLENBQUM7Z0NBRUYsTUFBTSxPQUFPLEdBQUcsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dDQUM5QyxNQUFNLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dDQUM1QyxNQUFNLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dDQUM1QyxNQUFNLElBQUksR0FBRztvQ0FDVCxJQUFJLEVBQUUsT0FBTyxHQUFHLFVBQVU7b0NBQzFCLElBQUksRUFBRSxPQUFPLEdBQUcsVUFBVSxHQUFHLENBQUM7b0NBQzlCLElBQUksRUFBRSxPQUFPLEdBQUcsVUFBVTtvQ0FDMUIsSUFBSSxFQUFFLE9BQU8sR0FBRyxVQUFVLEdBQUcsQ0FBQztpQ0FDakMsQ0FBQTtnQ0FFRCxJQUFJLE1BQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLDBDQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztvQ0FDM0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dDQUNoRixDQUFDO3FDQUNJLENBQUM7b0NBQ0YsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUEsTUFBQSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsMENBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQSxDQUFDO29DQUNoRSxNQUFNLFdBQVcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQztvQ0FDcEYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0NBQzNFLENBQUM7Z0NBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQ0FDdEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO2dDQUN0RCxVQUFVLEdBQUcsSUFBSSxDQUFDOzRCQUN0QixDQUFDO3dCQUNMLENBQUM7b0JBQ0wsQ0FBQztnQkFDTCxDQUFDO2dCQUVELE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ25CLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFFOUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQztnQkFDekMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO2dCQUU5QixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9DLENBQUM7WUFFRCxJQUFJLE1BQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLDBDQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNoQyxDQUFDO1lBRUQsSUFBSSxNQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSwwQ0FBRSxVQUFVLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQy9CLENBQUM7WUFFRCxJQUFJLE1BQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLDBDQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDaEMsQ0FBQztZQUVELFFBQVE7WUFDUix1R0FBdUc7UUFDM0csQ0FBQztLQUNKO0lBdmZELDRDQXVmQztJQUVELGtCQUFlLGdCQUFnQixDQUFDO0lBQ25CLFFBQUEsMEJBQTBCLEdBQUcsa0JBQWtCLENBQUM7SUFFN0QsRUFBRSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsRUFBRSxrQ0FBMEIsQ0FBQyxDQUFDO0lBRWhFLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBQSxnQ0FBWSxFQUFDLFVBQVUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNoSSxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUM7SUFDbkYsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ3RGLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzRyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLDJCQUFlLEVBQUUsT0FBTyxFQUFFLGtDQUFzQixFQUFFLENBQUMsQ0FBQztJQUNySCxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLDJCQUFlLEVBQUUsT0FBTyxFQUFFLGtDQUFzQixFQUFFLENBQUMsQ0FBQztJQUNySCxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLGdDQUFvQixFQUFFLE9BQU8sRUFBRSx1Q0FBMkIsRUFBRSxDQUFDLENBQUM7SUFDbkksZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbkYsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLDBDQUE4QixFQUFFLE9BQU8sRUFBRSxpREFBcUMsRUFBRSxDQUFDLENBQUM7SUFFOUosZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZGLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNsRixnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ3BFLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNqRixnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFFbEYsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUU7UUFDekMsSUFBSSxFQUFFLE1BQU07UUFDWixNQUFNLEVBQUU7WUFDSjtnQkFDSSxJQUFJLEVBQUUsTUFBTTtnQkFDWixJQUFJLEVBQUUsT0FBTztnQkFDYixTQUFTLEVBQUUsUUFBUTthQUN0QjtZQUNEO2dCQUNJLElBQUksRUFBRSxTQUFTO2dCQUNmLElBQUksRUFBRSxPQUFPO2dCQUNiLFNBQVMsRUFBRSxTQUFTO2FBQ3ZCO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLFdBQVcsRUFBRTs7OzthQUlaO2dCQUNELElBQUksRUFBRSxRQUFRO2dCQUNkLE9BQU8sRUFBRSxDQUFDO2dCQUNWLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEdBQUcsRUFBRSxDQUFDO2FBQ1Q7WUFDRDtnQkFDSSxJQUFJLEVBQUUsY0FBYztnQkFDcEIsV0FBVyxFQUFFLDhCQUE4QjtnQkFDM0MsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsR0FBRyxFQUFFLENBQUM7YUFDVDtTQUNKO0tBQ0osQ0FBQyxDQUFDO0lBRUgsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUU7UUFDckMsSUFBSSxFQUFFLE1BQU07UUFDWixNQUFNLEVBQUU7WUFDSjtnQkFDSSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxXQUFXLEVBQUUsMEJBQTBCO2dCQUN2QyxJQUFJLEVBQUUsUUFBUTtnQkFDZCxPQUFPLEVBQUUsQ0FBQztnQkFDVixHQUFHLEVBQUUsQ0FBQztnQkFDTixJQUFJLEVBQUUsQ0FBQztnQkFDUCxTQUFTLEVBQUUsQ0FBQzthQUNmO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLE1BQU07Z0JBQ1osV0FBVyxFQUFFLGdCQUFnQjtnQkFDN0IsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsR0FBRyxFQUFFLFlBQVk7Z0JBQ2pCLEdBQUcsRUFBRSxZQUFZO2dCQUNqQixJQUFJLEVBQUUsQ0FBQztnQkFDUCxTQUFTLEVBQUUsQ0FBQzthQUNmO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsV0FBVyxFQUFFLG1CQUFtQjtnQkFDaEMsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsT0FBTyxFQUFFLEdBQUc7Z0JBQ1osR0FBRyxFQUFFLENBQUM7Z0JBQ04sR0FBRyxFQUFFLENBQUM7YUFDVDtZQUNEO2dCQUNJLElBQUksRUFBRSxVQUFVO2dCQUNoQixXQUFXLEVBQUUsb0JBQW9CO2dCQUNqQyxJQUFJLEVBQUUsT0FBTztnQkFDYixTQUFTLEVBQUUsU0FBUztnQkFDcEIsS0FBSyxFQUFFLElBQUk7YUFDZDtTQUNKO0tBQ0osQ0FBQyxDQUFDO0lBRUgsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFdkgsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7UUFDdEMsSUFBSSxFQUFFLE1BQU07UUFDWixLQUFLLEVBQUUsSUFBSTtRQUNYLE1BQU0sRUFBRTtZQUNKO2dCQUNJLElBQUksRUFBRSxNQUFNO2dCQUNaLEtBQUssRUFBRSxNQUFNO2dCQUNiLElBQUksRUFBRSxRQUFRO2FBQ2pCO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLElBQUksRUFBRSxPQUFPO2dCQUNiLFNBQVMsRUFBRSxTQUFTO2FBQ3ZCO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLEtBQUssRUFBRSxZQUFZO2dCQUNuQixJQUFJLEVBQUUsT0FBTztnQkFDYixTQUFTLEVBQUUsU0FBUzthQUN2QjtZQUNEO2dCQUNJLElBQUksRUFBRSxNQUFNO2dCQUNaLEtBQUssRUFBRSxNQUFNO2dCQUNiLElBQUksRUFBRSxNQUFNO2dCQUNaLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDbEI7WUFDRDtnQkFDSSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxLQUFLLEVBQUUsUUFBUTtnQkFDZixJQUFJLEVBQUUsTUFBTTtnQkFDWixPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ2xCO1NBQ0o7S0FDSixDQUFDLENBQUM7SUFFSCxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFO1FBQy9DLElBQUksRUFBRSxNQUFNO1FBQ1osTUFBTSxFQUFFO1lBQ0o7Z0JBQ0ksSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLElBQUksRUFBRSxPQUFPO2dCQUNiLFNBQVMsRUFBRSxTQUFTO2dCQUNwQixLQUFLLEVBQUUsV0FBVzthQUNyQjtTQUNKO0tBQ0osQ0FBQyxDQUFDOzs7Ozs7SUM1ckJILE1BQWEsU0FBVSxTQUFRLEVBQUUsQ0FBQyxVQUFVO1FBQTVDOztZQWNZLGtCQUFhLEdBQVksS0FBSyxDQUFDO1FBOEkzQyxDQUFDO1FBNUlVLFVBQVU7WUFFYixrREFBa0Q7WUFDbEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBRWpELElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFFeEIsc0VBQXNFO1lBQ3RFLDJCQUEyQjtZQUMzQixJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzlELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzlELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDaEUsQ0FBQztRQUNMLENBQUM7UUFFTSxNQUFNLENBQUMsQ0FBUyxFQUFFLENBQVM7WUFDOUIsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDYixJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNiLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRU0sU0FBUyxDQUFDLENBQW9CLEVBQUUsQ0FBVSxFQUFFLENBQVU7WUFDekQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBRU0sTUFBTSxDQUFDLEVBQVU7O1lBRXBCLGtDQUFrQztZQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVyRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1lBRXJCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDdkIsSUFBSSxNQUFBLEdBQUcsQ0FBQyxRQUFRLDBDQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztnQkFDeEMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDM0IsQ0FBQztZQUNELElBQUksTUFBQSxHQUFHLENBQUMsUUFBUSwwQ0FBRSxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7Z0JBQ3hDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQzNCLENBQUM7WUFFRCxpQkFBaUI7WUFDakIsTUFBTSxhQUFhLEdBQUcsV0FBVyxhQUFYLFdBQVcsdUJBQVgsV0FBVyxDQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN2RCxNQUFNLGFBQWEsR0FBRyxXQUFXLGFBQVgsV0FBVyx1QkFBWCxXQUFXLENBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRXZELElBQUksSUFBSSxDQUFDLGNBQWMsS0FBSSxXQUFXLGFBQVgsV0FBVyx1QkFBWCxXQUFXLENBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQSxFQUFFLENBQUM7Z0JBQ3BFLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO2dCQUN6QyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ3JELENBQUM7WUFFRCxJQUFJLGFBQWEsRUFBRSxDQUFDO2dCQUNoQixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkQsQ0FBQztZQUVELElBQUksYUFBYSxFQUFFLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLGFBQWEsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ25GLENBQUM7WUFFRCwrQkFBK0I7WUFDL0IsSUFBSSxDQUFBLE1BQUEsR0FBRyxDQUFDLFFBQVEsMENBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBSSxNQUFBLEdBQUcsQ0FBQyxRQUFRLDBDQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUEsRUFBRSxDQUFDO2dCQUMxRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDdEMsQ0FBQztpQkFBTSxJQUFJLENBQUEsTUFBQSxHQUFHLENBQUMsUUFBUSwwQ0FBRSxTQUFTLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFJLE1BQUEsR0FBRyxDQUFDLFFBQVEsMENBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQSxFQUFFLENBQUM7Z0JBQ25GLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDckMsQ0FBQztZQUVELElBQUksQ0FBQSxNQUFBLEdBQUcsQ0FBQyxRQUFRLDBDQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQUksTUFBQSxHQUFHLENBQUMsUUFBUSwwQ0FBRSxTQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFBLEVBQUUsQ0FBQztnQkFDNUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLENBQUM7aUJBQU0sSUFBSSxDQUFBLE1BQUEsR0FBRyxDQUFDLFFBQVEsMENBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBSSxNQUFBLEdBQUcsQ0FBQyxRQUFRLDBDQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUEsRUFBRSxDQUFDO2dCQUNwRixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLENBQUM7UUFDTCxDQUFDO1FBRU8sV0FBVyxDQUFDLEtBQXFCO1lBRXJDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFO29CQUMzQixPQUFPO1lBQ2YsQ0FBQztZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUztnQkFDZixDQUFDLElBQUksQ0FBQyxVQUFVO2dCQUNoQixPQUFPO1lBR1gsb0RBQW9EO1lBQ3BELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2QscUNBQXFDO2dCQUNyQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztnQkFDbEIsT0FBTztZQUNYLENBQUM7WUFFRCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDakIsSUFBSSxDQUFDLE1BQU0sQ0FDUCxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFDNUIsQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQy9CLENBQUM7WUFDTixDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBRWxCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ3ZCLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFTLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO29CQUM3QyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDM0IsQ0FBQztnQkFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLENBQUM7UUFDTCxDQUFDO1FBRU8sV0FBVyxDQUFDLEtBQXFCO1lBRXJDLCtEQUErRDtZQUMvRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUN4QyxDQUFDO1lBRUQsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUN4QyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUMxQixDQUFDO1lBRUQsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2dCQUN6QyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUMzQixDQUFDO1FBQ0wsQ0FBQztRQUVPLFNBQVMsQ0FBQyxLQUFxQjtZQUVuQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQzNCLENBQUM7WUFFRCxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQzVCLENBQUM7UUFDTCxDQUFDO0tBQ0o7SUE1SkQsOEJBNEpDO0lBRUQsa0JBQWUsU0FBUyxDQUFDO0lBQ1osUUFBQSxtQkFBbUIsR0FBRyxXQUFXLENBQUM7SUFFL0MsRUFBRSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsMkJBQW1CLENBQUMsQ0FBQztJQUdsRCxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtRQUN2QyxJQUFJLEVBQUUsUUFBUTtLQUNqQixDQUFDLENBQUM7SUFFSCxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUU7UUFDOUIsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsRUFBRTtLQUNkLENBQUMsQ0FBQztJQUVILFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRTtRQUNsQyxJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxDQUFDO0tBQ2IsQ0FBQyxDQUFDO0lBRUgsU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFO1FBQ2xDLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLEVBQUU7S0FDZCxDQUFDLENBQUM7SUFFSCxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUU7UUFDcEMsSUFBSSxFQUFFLFFBQVE7UUFDZCxHQUFHLEVBQUUsQ0FBQztRQUNOLE9BQU8sRUFBRSxDQUFDO0tBQ2IsQ0FBQyxDQUFDO0lBRUgsU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFO1FBQzdCLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLENBQUM7UUFDVixJQUFJLEVBQUUsQ0FBQztnQkFDSCxNQUFNLEVBQUUsQ0FBQzthQUNaLEVBQUU7Z0JBQ0MsTUFBTSxFQUFFLENBQUM7YUFDWixDQUFDO0tBQ0wsQ0FBQyxDQUFDOzs7Ozs7SUNyTUgsTUFBTSxVQUFXLFNBQVEsRUFBRSxDQUFDLFVBQVU7UUFJbEMsVUFBVTtZQUVOLE1BQU0sTUFBTSxHQUFJLE1BQWMsQ0FBQyxRQUFRLENBQUM7WUFFeEMsSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFDVCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksTUFBTSxDQUFDO29CQUNsQixJQUFJLEVBQUUsSUFBSTtvQkFDVixLQUFLLEVBQUUsSUFBSTtpQkFDZCxDQUFDLENBQUM7WUFDUCxDQUFDO1FBQ0wsQ0FBQztRQUVELE1BQU0sQ0FBQyxFQUFVOztZQUNiLE1BQUEsSUFBSSxDQUFDLEdBQUcsMENBQUUsSUFBSSxFQUFFLENBQUM7UUFDckIsQ0FBQztLQUNKO0lBRUQsa0JBQWUsVUFBVSxDQUFDO0lBQ2IsUUFBQSxvQkFBb0IsR0FBRyxZQUFZLENBQUM7SUFFakQsRUFBRSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsNEJBQW9CLENBQUMsQ0FBQzs7Ozs7SUN4QnBELE1BQXFCLE1BQU07UUFPdkIsWUFBWSxJQUFZO1lBQ3BCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxJQUFJLEdBQUksSUFBSSxDQUFDO1FBQ3RCLENBQUM7UUFFRCxLQUFLO1lBQ0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQzFCLENBQUM7UUFFRCxJQUFJO1lBQ0EsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLEdBQUcsVUFBVSxDQUFDO1lBQzdDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7WUFDcEMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7UUFFRCxTQUFTLENBQUMsR0FBVyxFQUFFLEdBQVc7WUFDOUIsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBQzNDLENBQUM7UUFFRCxPQUFPLENBQUMsR0FBVyxFQUFFLEdBQVc7WUFDNUIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVELE1BQU07WUFDRixPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBRUQsS0FBSztZQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDO0tBQ0o7SUFyQ0QseUJBcUNDOzs7Ozs7O0lDZFksUUFBQSxXQUFXLEdBQUc7UUFDdkIsQ0FBQyxFQUFFLENBQUM7UUFDSixDQUFDLEVBQUUsQ0FBQztRQUNKLENBQUMsRUFBRSxDQUFDO1FBQ0osQ0FBQyxFQUFFLENBQUM7UUFDSixDQUFDLEVBQUUsQ0FBQztRQUNKLENBQUMsRUFBRSxDQUFDO1FBQ0osQ0FBQyxFQUFFLENBQUM7UUFDSixDQUFDLEVBQUUsQ0FBQztRQUNKLENBQUMsRUFBRSxDQUFDO0tBQ1AsQ0FBQztJQUVXLFFBQUEsV0FBVyxHQUFHO1FBQ3ZCLENBQUMsRUFBRSxDQUFDO1FBQ0osQ0FBQyxFQUFFLENBQUM7UUFDSixDQUFDLEVBQUUsQ0FBQztRQUNKLENBQUMsRUFBRSxDQUFDO1FBQ0osQ0FBQyxFQUFFLENBQUM7UUFDSixDQUFDLEVBQUUsQ0FBQztRQUNKLENBQUMsRUFBRSxDQUFDO1FBQ0osQ0FBQyxFQUFFLENBQUM7UUFDSixDQUFDLEVBQUUsQ0FBQztRQUNKLENBQUMsRUFBRSxDQUFDO1FBQ0osQ0FBQyxFQUFFLENBQUM7UUFDSixDQUFDLEVBQUUsQ0FBQztRQUNKLENBQUMsRUFBRSxDQUFDO1FBQ0osQ0FBQyxFQUFFLENBQUM7UUFDSixDQUFDLEVBQUUsQ0FBQztRQUNKLENBQUMsRUFBRSxDQUFDO0tBQ1AsQ0FBQztJQUVXLFFBQUEsaUJBQWlCLEdBQUc7UUFDN0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUk7UUFDZixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSTtRQUNmLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJO0tBQ2xCLENBQUM7SUFFRixNQUFNLGFBQWEsR0FBRyxDQUFDLENBQUM7SUFDeEIsTUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBU3pCLE1BQWEsVUFBVyxTQUFRLEVBQUUsQ0FBQyxVQUFVO1FBQTdDOztZQXNCVyxrQkFBYSxHQUFHLElBQUksQ0FBQztZQUNyQixtQkFBYyxHQUFHLElBQUksQ0FBQztZQUtyQixpQkFBWSxHQUFpQixFQUFTLENBQUM7WUFTdkMsVUFBSyxHQUFXLENBQUMsQ0FBQztZQUNsQixpQkFBWSxHQUFhLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3ZDLHFCQUFnQixHQUF5QyxFQUFFLENBQUM7WUFDNUQscUJBQWdCLEdBQXlDLEVBQUUsQ0FBQztZQUk1RCxtQkFBYyxHQUFhO2dCQUMvQixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQzthQUNQLENBQUM7WUFFTSxtQkFBYyxHQUFhO2dCQUMvQixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQztnQkFDSixDQUFDLEVBQUUsQ0FBQzthQUNQLENBQUM7UUF3aUJOLENBQUM7UUF0aUJHLElBQVcsV0FBVyxLQUFLLE9BQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BELElBQVcsV0FBVyxLQUFLLE9BQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTdDLE9BQU87O1lBRVYsTUFBQSxJQUFJLENBQUMsa0JBQWtCLDBDQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ25DLE1BQUEsSUFBSSxDQUFDLG1CQUFtQiwwQ0FBRSxPQUFPLEVBQUUsQ0FBQztZQUNwQyxNQUFBLElBQUksQ0FBQyx1QkFBdUIsMENBQUUsT0FBTyxFQUFFLENBQUM7WUFFeEMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBRWpCLE1BQUEsTUFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsMENBQUUsWUFBWSwwQ0FBRSxPQUFPLEVBQUUsQ0FBQztnQkFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFFekIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDbEMsQ0FBQztnQkFFRCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQkFDakIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDN0IsQ0FBQztZQUNMLENBQUM7WUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7WUFDMUMsQ0FBQztRQUNMLENBQUM7UUFFTyxzQkFBc0I7WUFFMUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUVqRSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDaEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNsQyxDQUFDO1FBQ0wsQ0FBQztRQUVNLGNBQWM7O1lBRWpCLE1BQU0sYUFBYSxHQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQWUsQ0FBQztZQUM5RSxNQUFNLGdCQUFnQixHQUFHLE1BQUEsYUFBYSxDQUFDLE1BQU0sMENBQUUsR0FBRyxDQUFDLGlEQUEwQixDQUFxQixDQUFDO1lBRW5HLElBQUksQ0FBQyxjQUFjLEdBQUcsZ0JBQWdCLENBQUM7WUFDdkMsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7WUFDcEMsSUFBSSxDQUFDLGFBQWEsR0FBSSxnQkFBZ0IsQ0FBQyxZQUFhLENBQUM7WUFDckQsSUFBSSxDQUFDLFlBQVksR0FBSyxJQUFJLHlDQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFM0gsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7WUFFOUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDZixJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ25DLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFO2dCQUMxQixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUFDLENBQUM7cUJBQ2xDLENBQUM7b0JBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFBQyxDQUFDO1lBQzFELENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUU7O2dCQUUzQixNQUFNLFNBQVMsR0FBRyxNQUFBLE1BQUEsSUFBSSxDQUFDLFNBQVMsMENBQUUsSUFBSSwwQ0FBRSxTQUFTLENBQUM7Z0JBRWxELElBQUksU0FBUyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUM1QixTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztnQkFDckYsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDaEQsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtnQkFDL0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUN0RCxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFZLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUM1RyxJQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFPLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUM1RyxJQUFJLENBQUMsRUFBRSxDQUFDLGlCQUFpQixFQUFNLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUM1RyxJQUFJLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUM1RyxJQUFJLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUM1RyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBVSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDdkcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDdkcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDM0csQ0FBQztRQUVNLE1BQU0sQ0FBQyxFQUFVO1lBRXBCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbkQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQ25FLE1BQU0sSUFBSSxHQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3ZFLE1BQU0sR0FBRyxHQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFFcEUsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdEMsQ0FBQztZQUVELElBQUksQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLG9DQUFhLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLDZDQUFzQixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyx1Q0FBZ0IsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvRyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLEdBQVUsQ0FBQyxDQUFDO1lBRXZELElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFjLENBQUMsTUFBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDckYsQ0FBQztRQUVNLFVBQVU7O1lBRWIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUM7WUFDNUMsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDcEMsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7WUFFcEMsTUFBQSxJQUFJLENBQUMsS0FBSyxvQ0FBVixJQUFJLENBQUMsS0FBSyxHQUFLLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxFQUFDO1lBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUNoQixJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUN0RCxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUN6RCxDQUFDO1lBRUYsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3QyxDQUFDO1FBQ0wsQ0FBQztRQUVPLGNBQWMsQ0FDbEIsS0FBYSxFQUNiLFVBQW9CLEVBQ3BCLFVBQWtCLEVBQ2xCLFdBQWlELEVBQ2pELFNBQW1CLEVBQ25CLE9BQWdCLEVBQ2hCLFNBQW1CLEVBQ25CLE1BQWtCLEVBQ2xCLE1BQWU7WUFFZixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ3JDLE1BQU0sU0FBUyxHQUFLLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztZQUMxRCxNQUFNLFNBQVMsR0FBSyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7WUFDMUQsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDNUMsTUFBTSxjQUFjLEdBQUcsQ0FBQyxHQUFhLEVBQUUsR0FBYSxFQUFFLEVBQUU7Z0JBRXBELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFFekIsTUFBTSxZQUFZLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBcUIsQ0FBQztvQkFDMUQsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQzswQkFDMUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQzswQkFDMUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQzswQkFDMUQsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUUxQixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzt3QkFDVCxPQUFPLEtBQUssQ0FBQztvQkFDakIsQ0FBQztnQkFDTCxDQUFDO2dCQUVELE9BQU8sSUFBSSxDQUFDO1lBQ2hCLENBQUMsQ0FBQTtZQUVELElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQztZQUVyQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBRTdCLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO29CQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUU1RSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBRVYsTUFBTSxXQUFXLEdBQUksVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQzNDLE1BQU0sV0FBVyxHQUFJLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUMzQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxDQUFDO29CQUM5RCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxDQUFDO29CQUM5RCxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQztvQkFDaEQsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUM7b0JBRWhELFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQ2pCLFlBQVksR0FBRyxXQUFXLEVBQzFCLFNBQVMsRUFDVCxZQUFZLEdBQUcsV0FBVyxDQUM3QixDQUFDO29CQUVGLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQ2pCLFlBQVksR0FBRyxXQUFXLEVBQzFCLFNBQVMsRUFDVCxZQUFZLEdBQUcsV0FBVyxDQUM3QixDQUFDO29CQUVGLE1BQU0sT0FBTyxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRXJFLElBQUksT0FBTyxFQUFFLENBQUM7d0JBQ1YsU0FBUyxDQUFDLFlBQVksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDO3dCQUMvQyxTQUFTLENBQUMsWUFBWSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUM7b0JBQ25ELENBQUM7b0JBRUQsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztnQkFDaEMsQ0FBQztnQkFFRCxNQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLE1BQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUIsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUU5QixJQUFJLE1BQU0sRUFBRSxDQUFDO29CQUNULElBQUEsbUJBQU8sRUFBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDdEUsQ0FBQztnQkFFRCxZQUFZLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hDLENBQUM7WUFFRCxJQUFJLENBQUMsTUFBTSxJQUFJLE9BQU8sSUFBSSxZQUFZLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBRXpDLE1BQU0sV0FBVyxHQUFHLEtBQUssR0FBRyxZQUFZLENBQUM7Z0JBRXpDLEtBQUssSUFBSSxDQUFDLEdBQUcsWUFBWSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUVyQyxNQUFNLE9BQU8sR0FBRyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3RDLE1BQU0sT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBRXRCLFNBQVMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDaEQsU0FBUyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxDQUFDO1lBQ0wsQ0FBQztZQUVELE9BQU8sWUFBWSxDQUFDO1FBQ3hCLENBQUM7UUFFTyxRQUFRLENBQUMsU0FBbUIsRUFBRSxNQUFrQixFQUFFLE1BQWU7O1lBRXJFLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsbUJBQVcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDMUosTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxtQkFBVyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUV6SixNQUFNLFFBQVEsR0FBSSxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ2pDLE1BQU0sSUFBSSxHQUFRLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDaEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQyxNQUFNLElBQUksR0FBUSxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsR0FBRyxDQUFDLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQy9FLE1BQU0sS0FBSyxHQUFPLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRTtrQkFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLEdBQUcsZ0JBQWdCO2tCQUMxQyxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsR0FBRyxnQkFBZ0IsQ0FBQztZQUU3RCxRQUFRLENBQUMsWUFBWSxDQUFDLEdBQUcsd0NBQWlCLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDdEUsUUFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHLHlDQUFrQixLQUFLLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRXZFLHdCQUF3QjtZQUN4QixRQUFRLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLElBQUksTUFBTSxDQUFDO1lBQzdDLFFBQVEsQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsVUFBVSxJQUFJLE1BQU0sQ0FBQztZQUV0RCxTQUFTLENBQUMsSUFBSSxHQUFJLElBQUksQ0FBQztZQUN2QixTQUFTLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUV4QixJQUFJLE1BQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLDBDQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUNqQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNyQyxDQUFDO1FBQ0wsQ0FBQztRQUVPLGdCQUFnQixDQUFDLGNBQWtDLEVBQUUsTUFBYztZQUV2RSxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMscUJBQXFCLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUVsQixNQUFNLGFBQWEsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV2QyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7WUFDckQsQ0FBQztpQkFDSSxDQUFDO2dCQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRTtvQkFDL0IsYUFBYSxFQUFFLGFBQWE7b0JBQzVCLFdBQVcsRUFBRSxJQUFJLENBQUMsVUFBVTtvQkFDNUIsY0FBYyxFQUFFLElBQUksQ0FBQyxhQUFhO29CQUNsQyxJQUFJLEVBQUUsS0FBSztpQkFDZCxDQUFDLENBQUM7WUFDUCxDQUFDO1lBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUM1QyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQ3RELENBQUM7UUFFTyxxQkFBcUIsQ0FBQyxjQUFrQyxFQUFFLE1BQWM7O1lBQzVFLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNqQixJQUFJLENBQUMsdUJBQXVCLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNyRCxNQUFBLE1BQUEsTUFBQSxJQUFJLENBQUMsU0FBUywwQ0FBRSxjQUFjLDBDQUFFLFlBQVksMENBQUUsT0FBTyxFQUFFLENBQUM7Z0JBQ3hELElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBQy9ELENBQUM7UUFDTCxDQUFDO1FBRU8sbUJBQW1CLENBQUMsY0FBa0M7O1lBRTFELE1BQUEsTUFBQSxNQUFBLElBQUksQ0FBQyxTQUFTLDBDQUFFLGNBQWMsMENBQUUsWUFBWSwwQ0FBRSxPQUFPLEVBQUUsQ0FBQztZQUN4RCxNQUFBLElBQUksQ0FBQyxTQUFTLDBDQUFFLE9BQU8sRUFBRSxDQUFDO1lBRTFCLE1BQU0sSUFBSSxHQUFHLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUN6QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXBDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1lBQzlDLElBQUksQ0FBQyxZQUFZLEdBQUssSUFBSSxDQUFDLG1CQUFtQixDQUFDO1lBRS9DLFNBQVMsQ0FBQyxJQUFJLEdBQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDO1lBQ2pGLFNBQVMsQ0FBQyxJQUFJLEdBQU0sQ0FBQyxDQUFDO1lBQ3RCLFNBQVMsQ0FBQyxLQUFLLEdBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBQ25ELFNBQVMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBRXpCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBRUQ7Ozs7OztVQU1FO1FBQ00saUJBQWlCLENBQUMsRUFBNEIsRUFBRSxHQUFXLEVBQUUsR0FBVyxFQUFFLENBQVMsRUFBRSxTQUFpQjtZQUUxRyxJQUFJLEdBQVcsQ0FBQztZQUVoQixtQkFBbUI7WUFDbkIsS0FBSyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxTQUFTLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQztnQkFDcEMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVE7Z0JBQzNCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ2xCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ2xCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRO2dCQUMzQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUNsQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUNsQixHQUFHLElBQUksQ0FBQyxDQUFDO1lBQ1osQ0FBQztZQUVELGtCQUFrQjtZQUNsQixLQUFLLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLFNBQVMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO2dCQUNwQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUTtnQkFDM0IsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDbEIsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDbEIsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVE7Z0JBQzNCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ2xCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ2xCLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDWixDQUFDO1lBRUQsT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDO1FBRUQsaUNBQWlDO1FBQ3pCLG9CQUFvQixDQUFDLE1BQW9CO1lBQzdDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ3JDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEIsQ0FBQztRQUNMLENBQUM7UUFFTywwQkFBMEIsQ0FBQyxXQUF1QyxFQUFFLE1BQWMsRUFBRSxTQUFpQjtZQUV6RyxNQUFNLGNBQWMsR0FBRyxXQUFXLFlBQVksV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxRyxNQUFNLE1BQU0sR0FBRyxJQUFJLG9CQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUUvRCxnQkFBZ0I7WUFDaEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUVqQywwRkFBMEY7Z0JBQzFGLGdDQUFnQztnQkFDaEMsZUFBZTtnQkFFZixNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsTUFBTSxDQUFDO2dCQUNsQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsTUFBTSxDQUFDO2dCQUNsQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRVosTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNqRCxNQUFNLEtBQUssR0FBTSxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztnQkFDM0UsTUFBTSxNQUFNLEdBQUssSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxZQUFZLENBQUM7Z0JBQ3JGLE1BQU0sSUFBSSxHQUFPLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDO2dCQUM5QyxNQUFNLEtBQUssR0FBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQztnQkFFOUMsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDaEQsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDaEQsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDaEQsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTTtnQkFFekQsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUUsUUFBUTtnQkFDekQsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMscUJBQXFCO2dCQUN0RSxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBRyxPQUFPO2dCQUN4RCxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBRSxRQUFRO1lBQzdELENBQUM7UUFDTCxDQUFDO1FBRU8sdUJBQXVCLENBQUMsY0FBa0MsRUFBRSxNQUFjOztZQUU5RSxNQUFBLElBQUksQ0FBQyx1QkFBdUIsMENBQUUsT0FBTyxFQUFFLENBQUM7WUFFeEMsTUFBTSxjQUFjLEdBQUcsQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sY0FBYyxHQUFHLENBQUMsQ0FBQztZQUN6QixNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUM7WUFDMUIsTUFBTSxjQUFjLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsY0FBYyxHQUFHLGNBQWMsR0FBRyxjQUFjLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqRyxNQUFNLG9CQUFvQixHQUFHLGNBQWMsR0FBRyxDQUFDLENBQUM7WUFFaEQsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsS0FBSyxTQUFTO2dCQUM5QyxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEtBQUssb0JBQW9CLEVBQUUsQ0FBQztnQkFDbkUsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLEdBQUcsSUFBSSxZQUFZLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUM5RSxDQUFDO1lBRUQsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQztZQUUxRixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsWUFBWSxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUM7WUFDekcsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFO2dCQUN6RDtvQkFDSSxRQUFRLEVBQUUsRUFBRSxDQUFDLGVBQWU7b0JBQzVCLFVBQVUsRUFBRSxDQUFDO29CQUNiLElBQUksRUFBRSxJQUFJO29CQUNWLFNBQVMsRUFBRSxLQUFLO29CQUNoQixLQUFLLEVBQUUsS0FBSztpQkFDZjtnQkFDRDtvQkFDSSxRQUFRLEVBQUUsRUFBRSxDQUFDLGVBQWU7b0JBQzVCLFVBQVUsRUFBRSxDQUFDO29CQUNiLElBQUksRUFBRSxJQUFJO29CQUNWLFNBQVMsRUFBRSxLQUFLO29CQUNoQixLQUFLLEVBQUUsS0FBSztpQkFDZjthQUNKLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRTtnQkFDakcsS0FBSyxFQUFFLEVBQUUsQ0FBQyxhQUFhO2dCQUN2QixJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjO2dCQUN0QyxPQUFPLEVBQUUsS0FBSzthQUNqQixDQUFDLENBQUM7UUFDUCxDQUFDO1FBRU8sZ0JBQWdCLENBQUMsY0FBa0M7WUFDdkQsT0FBTyxJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ3hDLFFBQVEsRUFBRSxFQUFFLENBQUMsaUJBQWlCO29CQUM5QixVQUFVLEVBQUUsQ0FBQztvQkFDYixJQUFJLEVBQUUsRUFBRSxDQUFDLFlBQVk7b0JBQ3JCLFNBQVMsRUFBRSxLQUFLO29CQUNoQixLQUFLLEVBQUUsS0FBSztpQkFDZixDQUFDLENBQUMsQ0FBQztRQUNSLENBQUM7UUFFTyxrQkFBa0IsQ0FBQyxjQUFrQzs7WUFFekQsTUFBQSxJQUFJLENBQUMsa0JBQWtCLDBDQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ25DLE1BQUEsSUFBSSxDQUFDLG1CQUFtQiwwQ0FBRSxPQUFPLEVBQUUsQ0FBQztZQUVwQyxNQUFNLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUMsTUFBTSxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1QyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsR0FBRyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLEdBQUcsYUFBYSxDQUFDO1lBQ2hJLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLGFBQWEsR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLGFBQWEsQ0FBQztZQUU5RixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxLQUFLLFNBQVM7Z0JBQ3JDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxXQUFXLEVBQUUsQ0FBQztnQkFDakQsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEdBQUcsSUFBSSxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBRXZELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztnQkFFZCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBRXJDLE1BQU0sT0FBTyxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDO29CQUMvQixNQUFNLE9BQU8sR0FBRyxPQUFPLEdBQUcsTUFBTSxDQUFDO29CQUVqQyxLQUFLLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDekcsQ0FBQztnQkFFRCxNQUFNLE9BQU8sR0FBRyxhQUFhLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFDM0MsTUFBTSxPQUFPLEdBQUcsT0FBTyxHQUFHLE1BQU0sQ0FBQztnQkFFakMsS0FBSyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBRXJHLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxhQUFhLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFFckMsTUFBTSxPQUFPLEdBQUcsT0FBTyxHQUFHLE1BQU0sR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztvQkFDbEQsTUFBTSxPQUFPLEdBQUcsT0FBTyxHQUFHLE1BQU0sQ0FBQztvQkFFakMsS0FBSyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3pHLENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsS0FBSyxTQUFTO2dCQUMxQyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEtBQUssZ0JBQWdCLEVBQUUsQ0FBQztnQkFDM0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEdBQUcsSUFBSSxZQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDbEUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDNUQsQ0FBQztZQUVELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLEVBQUUsQ0FBQyxXQUFXLENBQ3hDLGNBQWMsRUFDZCxFQUFFLENBQUMsa0JBQWtCLEVBQ3JCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFDOUIsRUFBRSxDQUFDLGFBQWEsRUFDaEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQ3ZCLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUNyQixDQUFDO1lBRUYsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtnQkFDdkksS0FBSyxFQUFFLEVBQUUsQ0FBQyxhQUFhO2dCQUN2QixJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVO2dCQUNsQyxPQUFPLEVBQUUsS0FBSzthQUNqQixDQUFDLENBQUM7UUFDUCxDQUFDO1FBRU8sbUJBQW1CLENBQUMsY0FBa0M7O1lBRTFELE1BQUEsSUFBSSxDQUFDLFNBQVMsMENBQUUsT0FBTyxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzNDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLG9CQUFvQixDQUFDO1lBQzNDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUM7WUFFekMsTUFBTSxPQUFPLEdBQUssSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUM7WUFDOUMsTUFBTSxPQUFPLEdBQUssSUFBSSxDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLENBQUM7WUFDekUsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDO1lBRTNDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLHFDQUFjLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDbEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMscUNBQWMsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsb0NBQWEsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFL0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsMERBQXlCLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDbEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsMERBQXlCLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzFFLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLDBEQUF5QixFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxRSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxHQUFHLHdDQUFpQixLQUFLLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzVFLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcseUNBQWtCLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFN0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsdUNBQWdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsb0NBQWEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsNkNBQXNCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFdkQsTUFBTSxRQUFRLEdBQUcsSUFBQSx1Q0FBa0IsRUFBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sTUFBTSxHQUFHLElBQUEsMkNBQW9CLEVBQUM7Z0JBQ2hDLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztnQkFDcEIsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO2dCQUNwQixrQkFBa0IsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLGFBQWE7Z0JBQ25ELGVBQWUsRUFBRSxRQUFRO2dCQUN6QixjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWMsR0FBRyxHQUFHO2dCQUN6QyxhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWE7Z0JBQ2pDLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtnQkFDakMsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO2dCQUNqQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07Z0JBQ25CLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtnQkFDakMsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjO2FBQ3RDLENBQUMsQ0FBQztZQUVILE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFdkMsS0FBSyxJQUFJLFNBQVMsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3pELENBQUM7WUFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQztZQUNwRCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzVCLENBQUM7S0FDSjtJQWhuQkQsZ0NBZ25CQztJQUVELGtCQUFlLFVBQVUsQ0FBQztJQUNiLFFBQUEsb0JBQW9CLEdBQUcsWUFBWSxDQUFDO0lBRWpELEVBQUUsQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLDRCQUFvQixDQUFDLENBQUM7SUFFcEQsVUFBVSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUMzRSxVQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQzdFLFVBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUM7SUFDaEYsVUFBVSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUM1RSxVQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ2hGLFVBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDNUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMzRyxVQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzlGLFVBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLElB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QUUsRUFBUyxFQUFFLEVBQVM7UUFDdkUsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNuQixNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ25CLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUM3QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVZLFFBQUEsV0FBVyxHQUFHO1FBQ3ZCLGdCQUFnQjtLQUNuQixDQUFBO0lBRUQsa0JBQWUsbUJBQVcsQ0FBQzs7QUNoQjNCLENBQUM7QUFBQSxDQUFDLEdBQUcsRUFBRTtJQUNILElBQUksTUFBTSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDbEMsTUFBTSxDQUFDLHdCQUF3QixFQUFFLENBQUM7SUFDdEMsQ0FBQztBQUNMLENBQUMsQ0FBQyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyI7KCgpID0+IHtcclxuXHJcblx0Y29uc3QgZGVmcyAgICAgPSB7fTtcclxuXHRjb25zdCByZXNvbHZlZCA9IHt9O1xyXG5cclxuXHQvLyBzYXZlIG9yaWdpbmFsIGRlZmluZSBhbmQgcmVxdWlyZVxyXG5cdHdpbmRvdy5fX19hbWRfX19PcmlnaW5hbERlZmluZSAgPSB3aW5kb3cuZGVmaW5lO1xyXG5cdHdpbmRvdy5fX19hbWRfX19PcmlnaW5hbFJlcXVpcmUgPSB3aW5kb3cucmVxdWlyZTtcclxuXHJcblx0aWYgKCF3aW5kb3cuZGVmaW5lICYmICF3aW5kb3cucmVxdWlyZSkge1xyXG5cclxuXHRcdGNvbnN0IGRlZmluZSA9IChpZCwgZGVwcywgZmFjdG9yeSkgPT4ge1xyXG5cclxuXHRcdFx0aWYgKGRlZnNbaWRdKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdEdXBsaWNhdGUgZGVmaW5pdGlvbiBmb3IgJyArIGlkKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZGVmc1tpZF0gPSBbZGVwcywgZmFjdG9yeV07XHJcblx0XHR9XHJcblxyXG5cdFx0ZGVmaW5lLmFtZCA9IHtcclxuXHRcdFx0YnVuZGxlOiB0cnVlLCAgIC8vIHRoaXMgaW1wbGVtZW50YXRpb24gd29ya3Mgb25seSB3aXRoIGJ1bmRsZWQgYW1kIG1vZHVsZXNcclxuXHRcdFx0ZHluYW1pYzogZmFsc2UsIC8vIGRvZXMgbm90IHN1cHBvcnQgZHluYW1pYyBvciBhc3luYyBsb2FkaW5nXHJcblx0XHR9O1xyXG5cclxuXHRcdGNvbnN0IHJlcXVpcmUgPSAoaWQpID0+IHtcclxuXHJcblx0XHRcdGlmIChpZCA9PT0gJ3JlcXVpcmUnKSByZXR1cm4gcmVxdWlyZTtcclxuXHRcdFx0aWYgKGlkID09PSAnZXhwb3J0cycpIHJldHVybiB7fTtcclxuXHRcdFx0aWYgKHJlc29sdmVkW2lkXSkgICAgIHJldHVybiByZXNvbHZlZFtpZF07XHJcblxyXG5cdFx0XHRpZiAoIWRlZnNbaWRdKSB7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coZGVmcywgaWQpO1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignTm8gZGVmaW5pdGlvbiBmb3IgJyArIGlkKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Y29uc3QgbW9kdWxlRXhwb3J0cyA9IHt9O1xyXG5cdFx0XHRjb25zdCBkZXBzICAgID0gZGVmc1tpZF1bMF07XHJcblx0XHRcdGNvbnN0IGZhY3RvcnkgPSBkZWZzW2lkXVsxXTtcclxuXHRcdFx0Y29uc3QgYXJncyA9IGRlcHMubWFwKGRlcCA9PiB7XHJcblxyXG5cdFx0XHRcdGlmIChkZXAgPT09ICdleHBvcnRzJykge1xyXG5cdFx0XHRcdFx0cmV0dXJuIG1vZHVsZUV4cG9ydHM7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gcmVxdWlyZShkZXApO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdGZhY3RvcnkuYXBwbHkobnVsbCwgYXJncyk7XHJcblxyXG5cdFx0XHRyZXR1cm4gcmVzb2x2ZWRbaWRdID0gbW9kdWxlRXhwb3J0cztcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0d2luZG93LmRlZmluZSAgPSBkZWZpbmU7XHJcblx0XHR3aW5kb3cucmVxdWlyZSA9IHJlcXVpcmU7XHJcblx0fVxyXG5cclxuXHR3aW5kb3cuX19fYW1kX19fcmVxdWlyZVJlc29sdmVyID0gKCkgPT4ge1xyXG5cclxuXHRcdGZvciAoY29uc3QgaWQgaW4gZGVmcykge1xyXG5cclxuXHRcdFx0aWYgKGRlZnMuaGFzT3duUHJvcGVydHkoaWQpKSB7XHJcblxyXG5cdFx0XHRcdGNvbnN0IGRlcHMgPSBkZWZzW2lkXVswXTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAoZGVwcykge1xyXG5cdFx0XHRcdFx0ZGVwcy5tYXAoZGVwID0+IHtcclxuXHRcclxuXHRcdFx0XHRcdFx0aWYgKGRlcCAhPT0gJ3JlcXVpcmUnICYmXHJcblx0XHRcdFx0XHRcdFx0ZGVwICE9PSAnZXhwb3J0cycpIHtcclxuXHJcblx0XHRcdFx0XHRcdFx0aWYgKCFyZXNvbHZlZC5oYXNPd25Qcm9wZXJ0eShkZXApKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRyZXF1aXJlKGRlcCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoIWRlZnMuaGFzT3duUHJvcGVydHkoZGVwKSAmJlxyXG5cdFx0XHRcdFx0XHRcdFx0IXJlc29sdmVkLmhhc093blByb3BlcnR5KGRlcCkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgZGVmaW5lICcke2lkfScgZGVwIG5vdCBmb3VuZCAnJHtkZXB9J2ApO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXF1aXJlKGlkKTtcclxuXHJcblx0XHRcdFx0ZGVsZXRlIGRlZnNbaWRdO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIHJldHVybiBvcmlnaW5hbCBkZWZpbmUgYW5kIHJlcXVpcmVcclxuXHRcdHdpbmRvdy5kZWZpbmUgID0gd2luZG93Ll9fX2FtZF9fX09yaWdpbmFsRGVmaW5lO1xyXG5cdFx0d2luZG93LnJlcXVpcmUgPSB3aW5kb3cuX19fYW1kX19fT3JpZ2luYWxSZXF1aXJlO1xyXG5cclxuXHRcdC8vIGNsZWFyXHJcblx0XHRkZWxldGUgd2luZG93Ll9fX2FtZF9fX3JlcXVpcmVSZXNvbHZlcjtcclxuXHRcdGRlbGV0ZSB3aW5kb3cuX19fYW1kX19fT3JpZ2luYWxEZWZpbmU7XHJcblx0XHRkZWxldGUgd2luZG93Ll9fX2FtZF9fX09yaWdpbmFsUmVxdWlyZTtcclxuXHR9O1xyXG59KSgpOyIsIlxyXG4vKipcclxuICogUHJpbWl0aXZlIG9iamVjdCBkZXNjcmliaW5nIGhvdyB0byBzdWJtaXQgY3VycmVudCB2ZXJ0ZXgvaW5kZXggYnVmZmVycy5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVByaW1pdGl2ZTxUTWFwIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgYW55PiA9IFJlY29yZDxzdHJpbmcsIGFueT4+IHtcclxuXHJcbiAgICAvKiogVHJ1ZSBpZiBlbmFibGVkICovXHJcbiAgICBlbmFibGVkOiBib29sZWFuO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHR5cGUgb2YgcHJpbWl0aXZlIHRvIHJlbmRlci4gQ2FuIGJlOlxyXG4gICAgICogXHJcbiAgICAgKiAtIHtAbGluayBwY3guUFJJTUlUSVZFX1BPSU5UU31cclxuICAgICAqIC0ge0BsaW5rIHBjeC5QUklNSVRJVkVfTElORVN9XHJcbiAgICAgKiAtIHtAbGluayBwY3guUFJJTUlUSVZFX0xJTkVMT09QfVxyXG4gICAgICogLSB7QGxpbmsgcGN4LlBSSU1JVElWRV9MSU5FU1RSSVB9XHJcbiAgICAgKiAtIHtAbGluayBwY3guUFJJTUlUSVZFX1RSSUFOR0xFU31cclxuICAgICAqIC0ge0BsaW5rIHBjeC5QUklNSVRJVkVfVFJJU1RSSVB9XHJcbiAgICAgKiAtIHtAbGluayBwY3guUFJJTUlUSVZFX1RSSUZBTn1cclxuICAgICAqL1xyXG4gICAgdHlwZTogbnVtYmVyO1xyXG4gXHJcbiAgICAvKiogVGhlIG9mZnNldCBvZiB0aGUgZmlyc3QgaW5kZXggb3IgdmVydGV4IHRvIGRpc3BhdGNoIGluIHRoZSBkcmF3IGNhbGwuICovXHJcbiAgICBiYXNlOiBudW1iZXI7XHJcblxyXG4gICAgLyoqIFRoZSBudW1iZXIgb2YgaW5kaWNlcyBvciB2ZXJ0aWNlcyB0byBkaXNwYXRjaCBpbiB0aGUgZHJhdyBjYWxsLiAqL1xyXG4gICAgY291bnQ6IG51bWJlcjtcclxuXHJcbiAgICAvKiogVHJ1ZSB0byBpbnRlcnByZXQgdGhlIHByaW1pdGl2ZSBhcyBpbmRleGVkLCB0aGVyZWJ5IHVzaW5nIHRoZSBjdXJyZW50bHkgc2V0IGluZGV4IGJ1ZmZlciBhbmQgZmFsc2Ugb3RoZXJ3aXNlLiAqL1xyXG4gICAgaW5kZXhlZDogYm9vbGVhbjtcclxuXHJcbiAgICBhdHRyaWJ1dGVzOiBUTWFwO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEN1c3RvbU1lc2g8VE1hcCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIGFueT4gPSBSZWNvcmQ8c3RyaW5nLCBhbnk+PiB7XHJcbiAgICBwcmltaXRpdmVDaHVua3M6IElQcmltaXRpdmU8VE1hcD5bXVtdO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEN1c3RvbU1lc2hJbnN0YW5jZTxUTWFwIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgYW55PiA9IFJlY29yZDxzdHJpbmcsIGFueT4+IHtcclxuICAgIG1lc2g6IHBjeC5NZXNoICYgQ3VzdG9tTWVzaDxUTWFwPjtcclxufVxyXG5cclxuKCgpID0+IHtcclxuXHJcbiAgICBpZiAoISh3aW5kb3cgYXMgYW55KS5FWFBFUklNRU5UQUxfVEVSUkFJTl9DVVNUT01fUkVOREVSKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG9yaWdpbmFsRHJhd0luc3RhbmNlID0gcGMuRm9yd2FyZFJlbmRlcmVyLnByb3RvdHlwZS5kcmF3SW5zdGFuY2U7XHJcblxyXG4gICAgcGMuRm9yd2FyZFJlbmRlcmVyLnByb3RvdHlwZS5kcmF3SW5zdGFuY2UgPSBmdW5jdGlvbiAoXHJcbiAgICAgICAgZGV2aWNlOiBwY3guV2ViZ2xHcmFwaGljc0RldmljZSxcclxuICAgICAgICBtZXNoSW5zdGFuY2U6IHBjeC5NZXNoSW5zdGFuY2UgJiBDdXN0b21NZXNoSW5zdGFuY2UsXHJcbiAgICAgICAgbWVzaDogcGN4Lk1lc2ggJiBDdXN0b21NZXNoLFxyXG4gICAgICAgIHN0eWxlOiBudW1iZXIsXHJcbiAgICAgICAgbm9ybWFsPzogYm9vbGVhblxyXG4gICAgKSB7XHJcblxyXG4gICAgICAgIGlmIChtZXNoLnByaW1pdGl2ZUNodW5rcykge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbW9kZWxNYXRyaXggPSAobWVzaEluc3RhbmNlLm5vZGUgYXMgYW55KS53b3JsZFRyYW5zZm9ybTtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbE1hdHJpeElkLnNldFZhbHVlKG1vZGVsTWF0cml4LmRhdGEpO1xyXG5cclxuICAgICAgICAgICAgaWYgKG5vcm1hbCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgbm9ybWFsTWF0cml4ID0gbWVzaEluc3RhbmNlLm5vZGUubm9ybWFsTWF0cml4O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub3JtYWxNYXRyaXhJZC5zZXRWYWx1ZShub3JtYWxNYXRyaXguZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB2YjA7XHJcbiAgICAgICAgICAgIGxldCB2YjE7XHJcbiAgICAgICAgICAgIGxldCBpbmRleEJ1ZmZlcjtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChkZXZpY2UuaXNXZWJHUFUpIHtcclxuICAgICAgICAgICAgICAgIHZiMCA9IGRldmljZS52ZXJ0ZXhCdWZmZXJzWzBdO1xyXG4gICAgICAgICAgICAgICAgdmIxID0gZGV2aWNlLnZlcnRleEJ1ZmZlcnNbMV07XHJcbiAgICAgICAgICAgICAgICBpbmRleEJ1ZmZlciA9IGRldmljZS5pbmRleEJ1ZmZlcjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGtlZXBCdWZmZXJzID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHByaW1pdGl2ZSBvZiBtZXNoLnByaW1pdGl2ZUNodW5rc1tzdHlsZV0pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocHJpbWl0aXZlLmVuYWJsZWQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByaW1pdGl2ZS5hdHRyaWJ1dGVzKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHNjb3BlSWQgaW4gcHJpbWl0aXZlLmF0dHJpYnV0ZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZS5zY29wZS5yZXNvbHZlKHNjb3BlSWQpLnNldFZhbHVlKHByaW1pdGl2ZS5hdHRyaWJ1dGVzW3Njb3BlSWRdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gS2VlcCBidWZmZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGV2aWNlLmlzV2ViR1BVKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2UuZHJhdyhwcmltaXRpdmUsIDEsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGV2aWNlLmluZGV4QnVmZmVyID0gaW5kZXhCdWZmZXIhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2UudmVydGV4QnVmZmVycy5wdXNoKHZiMCwgdmIxKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZS5kcmF3KHByaW1pdGl2ZSwgMCwga2VlcEJ1ZmZlcnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZWVwQnVmZmVycyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZGV2aWNlLmlzV2ViR1BVKSB7XHJcbiAgICAgICAgICAgICAgICBkZXZpY2UuaW5kZXhCdWZmZXIgPSBudWxsITtcclxuICAgICAgICAgICAgICAgIGRldmljZS52ZXJ0ZXhCdWZmZXJzLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIG9yaWdpbmFsRHJhd0luc3RhbmNlLmNhbGwodGhpcywgZGV2aWNlLCBtZXNoSW5zdGFuY2UsIG1lc2gsIHN0eWxlLCBub3JtYWwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiZXhwb3J0IHR5cGUgaW50ID0gbnVtYmVyO1xuZXhwb3J0IHR5cGUgdW5zaWduZWRpbnQgPSBudW1iZXI7XG5leHBvcnQgdHlwZSBmbG9hdCA9IG51bWJlcjtcbmV4cG9ydCB0eXBlIFJlZk9iamVjdDxUIGV4dGVuZHMgb2JqZWN0PiA9IFQ7XG5leHBvcnQgdHlwZSBJVmVjdG9yMiA9IHsgeDogZmxvYXQsIHk6IGZsb2F0IH07XG5leHBvcnQgdHlwZSBJVmVjdG9yMyA9IHsgeDogZmxvYXQsIHk6IGZsb2F0LCB6OiBmbG9hdCB9O1xuZXhwb3J0IHR5cGUgSVZlY3RvcjQgPSB7IHg6IGZsb2F0LCB5OiBmbG9hdCwgejogZmxvYXQsIHc6IGZsb2F0IH07XG5leHBvcnQgdHlwZSBJTWF0cml4NCA9IHsgZGF0YTogRmxvYXQzMkFycmF5IH07IiwiaW1wb3J0IHsgaW50IH0gZnJvbSBcIi4uL1NoYXJlZC9UeXBlcy5tanNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBHcmFzc0ZpZWxkVGV4dHVyZSB7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBNQVhfQ0hBTkVMID0gODtcclxuXHJcbiAgICBwcml2YXRlIF90ZXh0dXJlOiBwY3guVGV4dHVyZTtcclxuICAgIHByaXZhdGUgX2J1ZmZlcjogVWludDhBcnJheTtcclxuICAgIHByaXZhdGUgX3dpZHRoOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIF9kZXB0aDogbnVtYmVyO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgdGV4dHVyZSgpIHsgcmV0dXJuIHRoaXMuX3RleHR1cmU7IH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihncmFwaGljc0RldmljZTogcGN4LkdyYXBoaWNzRGV2aWNlLCB3aWR0aDogbnVtYmVyLCBkZXB0aDogbnVtYmVyLCBidWZmZXI/OiBVaW50OEFycmF5KSB7XHJcblxyXG4gICAgICAgIHRoaXMuX3dpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5fZGVwdGggPSBkZXB0aDtcclxuXHJcbiAgICAgICAgY29uc3QgdyA9ICh3aWR0aCAtIDEpIC8gNCArIDE7XHJcbiAgICAgICAgY29uc3QgZCA9IChkZXB0aCAtIDEpIC8gNCArIDE7XHJcblxyXG4gICAgICAgIHRoaXMuX2J1ZmZlciA9IGJ1ZmZlciA/PyBuZXcgVWludDhBcnJheSh3ICogZCAqIDQpOyAvLyA9PiAxIGJ5dGUgPSA4IGJpdHMgPT4gOCAvIDIgPSA0IGJpdCBmb3IgOCBsZXZlbHNcclxuICAgICAgICB0aGlzLl90ZXh0dXJlID0gbmV3IHBjLlRleHR1cmUoZ3JhcGhpY3NEZXZpY2UsIHtcclxuICAgICAgICAgICAgd2lkdGg6IHcsXHJcbiAgICAgICAgICAgIGhlaWdodDogZCxcclxuICAgICAgICAgICAgZm9ybWF0OiBwYy5QSVhFTEZPUk1BVF9SR0JBOFUsXHJcbiAgICAgICAgICAgIG1pcG1hcHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBtaW5GaWx0ZXI6IHBjLkZJTFRFUl9ORUFSRVNULFxyXG4gICAgICAgICAgICBtYWdGaWx0ZXI6IHBjLkZJTFRFUl9ORUFSRVNULFxyXG4gICAgICAgICAgICBhZGRyZXNzVTogcGMuQUREUkVTU19DTEFNUF9UT19FREdFLFxyXG4gICAgICAgICAgICBhZGRyZXNzVjogcGMuQUREUkVTU19DTEFNUF9UT19FREdFLFxyXG4gICAgICAgICAgICBmbGlwWTogZ3JhcGhpY3NEZXZpY2UuaXNXZWJHUFUsXHJcbiAgICAgICAgICAgIGxldmVsczogW3RoaXMuX2J1ZmZlcl1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGVzdHJveSgpIHtcclxuICAgICAgICB0aGlzLl90ZXh0dXJlPy5kZXN0cm95KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldENoYW5uZWwoeDogaW50LCB6OiBpbnQsIGNoYW5uZWw6IGludCkge1xyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gKHggKyB6ICogdGhpcy5fd2lkdGgpIC8gNCB8IDA7XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9idWZmZXJbaW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRQaXhlbCgpIHtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX3RleHR1cmUpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGRldmljZSA9IHRoaXMuX3RleHR1cmUuZGV2aWNlO1xyXG4gICAgICAgICAgICBjb25zdCBkYXRhQ2h1bmtTaXplID0gMTtcclxuICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoNCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZGV2aWNlLmlzV2ViR0wyKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2wgPSAoZGV2aWNlIGFzIHBjeC5XZWJnbEdyYXBoaWNzRGV2aWNlKS5nbDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRleHR1cmVGb3JtYXQgPSB0aGlzLl90ZXh0dXJlLmltcGwuX2dsRm9ybWF0O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dHVyZVBpeGVsVCA9IHRoaXMuX3RleHR1cmUuaW1wbC5fZ2xQaXhlbFR5cGU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0dXJlVGFyZ2V0ID0gdGhpcy5fdGV4dHVyZS5pbXBsLl9nbFRhcmdldDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRleHR1cmVPYmplY3QgPSB0aGlzLl90ZXh0dXJlLmltcGwuX2dsVGV4dHVyZTtcclxuXHJcbiAgICAgICAgICAgICAgICBnbC5iaW5kVGV4dHVyZSh0ZXh0dXJlVGFyZ2V0LCB0ZXh0dXJlT2JqZWN0KTtcclxuICAgICAgICAgICAgICAgIGdsLnRleFN1YkltYWdlM0QoZ2wuVEVYVFVSRV8yRF9BUlJBWSwgMCwgMCwgMCwgMCwgZGF0YUNodW5rU2l6ZSwgZGF0YUNodW5rU2l6ZSwgMSwgdGV4dHVyZUZvcm1hdCwgdGV4dHVyZVBpeGVsVCwgYnVmZmVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChkZXZpY2UuaXNXZWJHUFUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCB3ZWJncHUgID0gKGRldmljZSBhcyBhbnkpLndncHUgYXMgR1BVRGV2aWNlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dHVyZSA9ICh0aGlzLl90ZXh0dXJlLmltcGwuZ3B1VGV4dHVyZSkgYXMgR1BVVGV4dHVyZTtcclxuXHJcbiAgICAgICAgICAgICAgICB3ZWJncHUucXVldWUud3JpdGVUZXh0dXJlKFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZTogdGV4dHVyZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luOiBbMCwgMCwgMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pcExldmVsOiAwXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBidWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ5dGVzUGVyUm93OiA0ICogZGF0YUNodW5rU2l6ZSwgLy8gYWx3YXlzIDQgZm9yIHJnYmEgZm9ybWF0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvd3NQZXJJbWFnZTogZGF0YUNodW5rU2l6ZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogZGF0YUNodW5rU2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBkYXRhQ2h1bmtTaXplXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbXByZXNzb3Ige1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF9jb25jYXRDaHVua3MoY2h1bmtzOiBVaW50OEFycmF5W10sIHRvdGFsTGVuZ3RoOiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgbGV0IHBvc2l0aW9uID0gMDtcclxuXHJcbiAgICAgICAgLy8gQ29uY2F0ZW5hdGUgYWxsIFVpbnQ4QXJyYXkgY2h1bmtzIGludG8gYSBzaW5nbGUgQXJyYXlCdWZmZXJcclxuICAgICAgICBjb25zdCByZXN1bHRCdWZmZXIgPSBuZXcgVWludDhBcnJheSh0b3RhbExlbmd0aCk7ICAgICAgICBcclxuICAgICAgICBmb3IgKGNvbnN0IGNodW5rIG9mIGNodW5rcykge1xyXG4gICAgICAgICAgICByZXN1bHRCdWZmZXIuc2V0KGNodW5rLCBwb3NpdGlvbik7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uICs9IGNodW5rLmxlbmd0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHRCdWZmZXIuYnVmZmVyO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIF9nZXRSZXN1bHQocmVhZGVyOiBSZWFkYWJsZVN0cmVhbURlZmF1bHRSZWFkZXI8YW55Pikge1xyXG5cclxuICAgICAgICBsZXQgdG90YWxMZW5ndGggPSAwO1xyXG5cclxuICAgICAgICBjb25zdCBjaHVua3M6IFVpbnQ4QXJyYXlbXSA9IFtdO1xyXG5cclxuICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICBjb25zdCB7IGRvbmUsIHZhbHVlIH0gPSBhd2FpdCByZWFkZXIucmVhZCgpO1xyXG4gICAgICAgICAgICBpZiAoZG9uZSkgYnJlYWs7XHJcbiAgICAgICAgICAgIGNodW5rcy5wdXNoKHZhbHVlKTtcclxuICAgICAgICAgICAgdG90YWxMZW5ndGggKz0gdmFsdWUubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmNhdENodW5rcyhjaHVua3MsIHRvdGFsTGVuZ3RoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGNvbXByZXNzQnVmZmVyKGJ1ZmZlcjogQXJyYXlCdWZmZXIsIGZvcm1hdDogQ29tcHJlc3Npb25Gb3JtYXQgPSAnZ3ppcCcpIHtcclxuXHJcbiAgICAgICAgY29uc3QgY29tcHJlc3NlZFN0cmVhbSA9IG5ldyBDb21wcmVzc2lvblN0cmVhbShmb3JtYXQpO1xyXG4gICAgICAgIGNvbnN0IHdyaXRlciA9IGNvbXByZXNzZWRTdHJlYW0ud3JpdGFibGUuZ2V0V3JpdGVyKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgd3JpdGVyLndyaXRlKG5ldyBVaW50OEFycmF5KGJ1ZmZlcikpO1xyXG4gICAgICAgIHdyaXRlci5jbG9zZSgpO1xyXG5cclxuICAgICAgICBjb25zdCByZWFkZXIgPSBjb21wcmVzc2VkU3RyZWFtLnJlYWRhYmxlLmdldFJlYWRlcigpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0UmVzdWx0KHJlYWRlcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBkZWNvbXByZXNzQnVmZmVyKGJ1ZmZlcjogQXJyYXlCdWZmZXIsIGZvcm1hdDogQ29tcHJlc3Npb25Gb3JtYXQgPSAnZ3ppcCcpIHtcclxuXHJcbiAgICAgICAgY29uc3QgZGVjb21wcmVzc2VkU3RyZWFtID0gbmV3IERlY29tcHJlc3Npb25TdHJlYW0oZm9ybWF0KTtcclxuICAgICAgICBjb25zdCByZWFkZXIgPSBkZWNvbXByZXNzZWRTdHJlYW0ucmVhZGFibGUuZ2V0UmVhZGVyKCk7XHJcbiAgICAgICAgY29uc3Qgd3JpdGVyID0gZGVjb21wcmVzc2VkU3RyZWFtLndyaXRhYmxlLmdldFdyaXRlcigpO1xyXG4gICAgXHJcbiAgICAgICAgLy8gV3JpdGUgdGhlIGNvbXByZXNzZWQgYnVmZmVyIHRvIHRoZSB3cml0ZXJcclxuICAgICAgICB3cml0ZXIud3JpdGUobmV3IFVpbnQ4QXJyYXkoYnVmZmVyKSk7XHJcbiAgICAgICAgd3JpdGVyLmNsb3NlKCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRSZXN1bHQocmVhZGVyKTtcclxuICAgIH1cclxufSIsImltcG9ydCBDb21wcmVzc29yIGZyb20gXCIuLi9TaGFyZWQvQ29tcHJlc3Nvci5tanNcIjtcclxuaW1wb3J0IHR5cGUgeyBmbG9hdCwgaW50IH0gZnJvbSBcIi4uL1NoYXJlZC9UeXBlcy5tanNcIjtcclxuaW1wb3J0IHR5cGUgQWJzSGVpZ2h0TWFwIGZyb20gXCIuL0Fic0hlaWdodE1hcC5tanNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBoZWlnaHRNYXBWZXJzaW9uID0gOTk7XHJcbmV4cG9ydCBjb25zdCBmYWN0b3JTaXplID0gMztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUhlaWdodE1hcEZpbGVJbXBvcnRPcHRpb25zIHtcclxuICAgIGFkYXB0aXZlV2lkdGhBbmREZXB0aD86IGJvb2xlYW4sXHJcbiAgICBhZGFwdGl2ZU1pbk1heEhlaWdodD86IGJvb2xlYW4sXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUltcG9ydEZpbGVIZWFkZXIge1xyXG4gICAgd2lkdGg6IGludCxcclxuICAgIGRlcHRoOiBpbnQsXHJcbiAgICBtaW5IZWlnaHQ6IGZsb2F0LFxyXG4gICAgbWF4SGVpZ2h0OiBmbG9hdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgaGVpZ2h0TWFwRmlsZUNvbXByZXNzZWRGb3JtYXQ6IENvbXByZXNzaW9uRm9ybWF0ID0gJ2d6aXAnO1xyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFic0hlaWdodE1hcEZpbGVJTyB7XHJcblxyXG4gICAgcHJpdmF0ZSBfX3JlYWRIZWlnaHRGYWN0b3IodmlldzogRGF0YVZpZXcsIGhlYWRlclNpemU6IGludCwgd2lkdGg6IGludCwgeDogaW50LCB6OiBpbnQpIHtcclxuXHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB6ICogd2lkdGggKyB4O1xyXG4gICAgICAgIGNvbnN0IHIgPSB2aWV3LmdldFVpbnQ4KGhlYWRlclNpemUgKyBpbmRleCAqIGZhY3RvclNpemUgKyAwKTtcclxuICAgICAgICBjb25zdCBnID0gdmlldy5nZXRVaW50OChoZWFkZXJTaXplICsgaW5kZXggKiBmYWN0b3JTaXplICsgMSk7XHJcbiAgICAgICAgY29uc3QgYiA9IHZpZXcuZ2V0VWludDgoaGVhZGVyU2l6ZSArIGluZGV4ICogZmFjdG9yU2l6ZSArIDIpO1xyXG4gICAgXHJcbiAgICAgICAgY29uc3Qgc2NhbGVkID0gKHIgPDwgMTYpIHwgKGcgPDwgOCkgfCBiO1xyXG4gICAgICAgIGNvbnN0IGZhY3RvciA9IHNjYWxlZCAvIDE2Nzc3MjE1O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBmYWN0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfX3dyaXRlSGVpZ2h0RmFjdG9yKHZpZXc6IERhdGFWaWV3LCBoZWFkZXJTaXplOiBpbnQsIGhlaWdodE1hcDogQWJzSGVpZ2h0TWFwLCB4OiBpbnQsIHo6IGludCkge1xyXG4gICAgICAgIGNvbnN0IGluZGV4ICA9IHogKiBoZWlnaHRNYXAud2lkdGggKyB4O1xyXG4gICAgICAgIGNvbnN0IGZhY3RvciA9IGhlaWdodE1hcC5nZXRGYWN0b3IoeCwgeik7XHJcbiAgICAgICAgY29uc3Qgc2NhbGVkID0gTWF0aC5mbG9vcihmYWN0b3IgKiAxNjc3NzIxNSk7XHJcbiAgICAgICAgY29uc3QgciA9IChzY2FsZWQgPj4gMTYpICYgMHhGRjtcclxuICAgICAgICBjb25zdCBnID0gKHNjYWxlZCA+PiA4KSAmIDB4RkY7XHJcbiAgICAgICAgY29uc3QgYiA9IChzY2FsZWQgJiAweEZGKTtcclxuXHJcbiAgICAgICAgdmlldy5zZXRVaW50OChoZWFkZXJTaXplICsgaW5kZXggKiBmYWN0b3JTaXplICsgMCwgcik7XHJcbiAgICAgICAgdmlldy5zZXRVaW50OChoZWFkZXJTaXplICsgaW5kZXggKiBmYWN0b3JTaXplICsgMSwgZyk7XHJcbiAgICAgICAgdmlldy5zZXRVaW50OChoZWFkZXJTaXplICsgaW5kZXggKiBmYWN0b3JTaXplICsgMiwgYik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFzeW5jIF9faW1wb3J0RnJvbUZpbGUoaGVpZ2h0TWFwOiBBYnNIZWlnaHRNYXAsIGJ1ZmZlcjogQXJyYXlCdWZmZXIsIG9wdGlvbnM/OiBJSGVpZ2h0TWFwRmlsZUltcG9ydE9wdGlvbnMpOiBQcm9taXNlPElJbXBvcnRGaWxlSGVhZGVyIHwgbnVsbD4ge1xyXG5cclxuICAgICAgICAvLyBUT0RPOlxyXG4gICAgICAgIC8vIGhlYWRlciB2ZXJzaW9uIDk5XHJcbiAgICAgICAgLy8gaGVhZGVyQnl0ZVNpemUsIHZlcnNpb24sIHdpZHRoLCBkZXB0aCwgbWluSGVpZ2h0LCBtYXhIZWlnaHRcclxuXHJcbiAgICAgICAgY29uc3QgbkJ1ZmZlciA9IGF3YWl0IENvbXByZXNzb3IuZGVjb21wcmVzc0J1ZmZlcihidWZmZXIsIGhlaWdodE1hcEZpbGVDb21wcmVzc2VkRm9ybWF0KTtcclxuICAgICAgICBjb25zdCB2aWV3ICAgID0gbmV3IERhdGFWaWV3KG5CdWZmZXIpO1xyXG4gICAgICAgIGNvbnN0IHZlcnNpb24gPSB2aWV3LmdldFVpbnQzMigxLCB0cnVlKTtcclxuXHJcbiAgICAgICAgaWYgKHZlcnNpb24gIT09IGhlaWdodE1hcFZlcnNpb24pIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdIZWlnaHQgbWFwIHZlcnNpb246ICVmIG5vIHN1cHBvcnQuJywgdmVyc2lvbik7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIGNvbnN0IGhlYWRlclNpemUgPSB2aWV3LmdldFVpbnQ4KDApO1xyXG4gICAgICAgIGNvbnN0IHdpZHRoICAgICAgPSB2aWV3LmdldFVpbnQzMig1LCB0cnVlKTtcclxuICAgICAgICBjb25zdCBkZXB0aCAgICAgID0gdmlldy5nZXRVaW50MzIoOSwgdHJ1ZSk7XHJcbiAgICAgICAgY29uc3QgbWluSGVpZ2h0ICA9IHZpZXcuZ2V0RmxvYXQzMigxMywgdHJ1ZSk7XHJcbiAgICAgICAgY29uc3QgbWF4SGVpZ2h0ICA9IHZpZXcuZ2V0RmxvYXQzMigxNywgdHJ1ZSk7XHJcbiAgICBcclxuICAgICAgICBjb25zdCBkZWx0YSA9IG9wdGlvbnM/LmFkYXB0aXZlTWluTWF4SGVpZ2h0XHJcbiAgICAgICAgICAgID8gaGVpZ2h0TWFwLm1heEhlaWdodCAtIGhlaWdodE1hcC5taW5IZWlnaHRcclxuICAgICAgICAgICAgOiBtYXhIZWlnaHQgLSBtaW5IZWlnaHQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgcmVzdWx0TWluSGVpZ2h0ID0gb3B0aW9ucz8uYWRhcHRpdmVNaW5NYXhIZWlnaHQgPyBoZWlnaHRNYXAubWluSGVpZ2h0IDogbWluSGVpZ2h0O1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChoZWlnaHRNYXAud2lkdGggIT09IHdpZHRoIHx8XHJcbiAgICAgICAgICAgIGhlaWdodE1hcC5kZXB0aCAhPT0gZGVwdGggJiZcclxuICAgICAgICAgICAgb3B0aW9ucyAmJlxyXG4gICAgICAgICAgICBvcHRpb25zLmFkYXB0aXZlV2lkdGhBbmREZXB0aCkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gVE9ETzogaXRzIHdvcmsgZm9yIHhebiArIDEsIHpebiArIDFcclxuICAgICAgICAgICAgY29uc3QgZmFjdG9yWCA9ICh3aWR0aCAtIDEpIC8gKGhlaWdodE1hcC53aWR0aCAtIDEpO1xyXG4gICAgICAgICAgICBjb25zdCBmYWN0b3JaID0gKGRlcHRoIC0gMSkgLyAoaGVpZ2h0TWFwLmRlcHRoIC0gMSk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCB6ID0gMDsgeiA8IGRlcHRoOyB6ICs9IGZhY3RvclopIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHdpZHRoOyB4ICs9IGZhY3RvclgpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogc21vb3RoIGZvciBoZWlnaHRNYXAgbW9yZSBpbXBvcnQgZGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZhY3RvciA9IHRoaXMuX19yZWFkSGVpZ2h0RmFjdG9yKHZpZXcsIGhlYWRlclNpemUsIHdpZHRoLCB4IHwgMCwgeiB8IDApO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IHJlc3VsdE1pbkhlaWdodCArIGZhY3RvciAqIGRlbHRhO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHRNYXAuc2V0KHggLyBmYWN0b3JYLCB6IC8gZmFjdG9yWiwgaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICBcclxuICAgICAgICAgICAgZm9yIChsZXQgeiA9IDA7ICh6IDwgZGVwdGgpICYmICh6IDwgaGVpZ2h0TWFwLmRlcHRoKTsgeisrKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB4ID0gMDsgKHggPCB3aWR0aCkgJiYgKHggPCBoZWlnaHRNYXAud2lkdGgpOyB4KyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmFjdG9yID0gdGhpcy5fX3JlYWRIZWlnaHRGYWN0b3IodmlldywgaGVhZGVyU2l6ZSwgd2lkdGgsIHgsIHopO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IHJlc3VsdE1pbkhlaWdodCArIGZhY3RvciAqIGRlbHRhO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodE1hcC5zZXQoeCwgeiwgaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgd2lkdGgsXHJcbiAgICAgICAgICAgIGRlcHRoLFxyXG4gICAgICAgICAgICBtaW5IZWlnaHQsXHJcbiAgICAgICAgICAgIG1heEhlaWdodFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYXN5bmMgX19leHBvcnRUb0J1ZmZlcihoZWlnaHRNYXA6IEFic0hlaWdodE1hcCkge1xyXG4gICAgXHJcbiAgICAgICAgLy8gVE9ETzpcclxuICAgICAgICAvLyBoZWFkZXIgdmVyc2lvbiA5OVxyXG4gICAgICAgIC8vIGhlYWRlckJ5dGVTaXplLCB2ZXJzaW9uLCB3aWR0aCwgZGVwdGgsIG1pbkhlaWdodCwgbWF4SGVpZ2h0XHJcbiAgICBcclxuICAgICAgICBjb25zdCBoZWFkZXJTaXplID0gMSArIDQgKyA0ICsgNCArIDQgKyA0O1xyXG4gICAgICAgIGNvbnN0IGJ1ZmZlciAgICAgPSBuZXcgQXJyYXlCdWZmZXIoaGVhZGVyU2l6ZSArIGZhY3RvclNpemUgKiBoZWlnaHRNYXAud2lkdGggKiBoZWlnaHRNYXAuZGVwdGgpO1xyXG4gICAgICAgIGNvbnN0IHZpZXcgICAgICAgPSBuZXcgRGF0YVZpZXcoYnVmZmVyKTtcclxuICAgIFxyXG4gICAgICAgIHZpZXcuc2V0VWludDggICgwLCBoZWFkZXJTaXplKTtcclxuICAgICAgICB2aWV3LnNldFVpbnQzMiAoMSwgaGVpZ2h0TWFwVmVyc2lvbiwgdHJ1ZSk7XHJcbiAgICAgICAgdmlldy5zZXRVaW50MzIgKDUsIGhlaWdodE1hcC53aWR0aCwgdHJ1ZSk7XHJcbiAgICAgICAgdmlldy5zZXRVaW50MzIgKDksIGhlaWdodE1hcC5kZXB0aCwgdHJ1ZSk7XHJcbiAgICAgICAgdmlldy5zZXRGbG9hdDMyKDEzLCBoZWlnaHRNYXAubWluSGVpZ2h0LCB0cnVlKTtcclxuICAgICAgICB2aWV3LnNldEZsb2F0MzIoMTcsIGhlaWdodE1hcC5tYXhIZWlnaHQsIHRydWUpO1xyXG4gICAgXHJcbiAgICAgICAgZm9yIChsZXQgeiA9IDA7IHogPCBoZWlnaHRNYXAuZGVwdGg7IHorKykge1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCBoZWlnaHRNYXAud2lkdGg7IHgrKykge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuX193cml0ZUhlaWdodEZhY3Rvcih2aWV3LCBoZWFkZXJTaXplLCBoZWlnaHRNYXAsIHgsIHopO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gQ29tcHJlc3Nvci5jb21wcmVzc0J1ZmZlcihidWZmZXIsIGhlaWdodE1hcEZpbGVDb21wcmVzc2VkRm9ybWF0KTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQWJzSGVpZ2h0TWFwRmlsZUlPOyIsImltcG9ydCB0eXBlIHsgaW50IH0gZnJvbSBcIi4uL1NoYXJlZC9UeXBlcy5tanNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBJWm9uZSB7XG4gICAgbWluWDogaW50O1xuICAgIG1heFg6IGludDtcbiAgICBtaW5aOiBpbnQ7XG4gICAgbWF4WjogaW50O1xufSIsImltcG9ydCB0eXBlIHsgZmxvYXQsIGludCB9IGZyb20gXCIuLi9TaGFyZWQvVHlwZXMubWpzXCI7XHJcbmltcG9ydCBBYnNIZWlnaHRNYXBGaWxlSU8sIHsgSUhlaWdodE1hcEZpbGVJbXBvcnRPcHRpb25zIH0gZnJvbSBcIi4vQWJzSGVpZ2h0TWFwRmlsZUlPLm1qc1wiO1xyXG5pbXBvcnQgdHlwZSB7IElab25lIH0gZnJvbSBcIi4vSVpvbmUubWpzXCI7XHJcblxyXG4vKipcclxuICogQHZhcmlhbnQgcmdiIC0gZm9ybWF0IGJ5IHVpbnQ4WzNdIHRleHR1cmVcclxuICogQHZhcmlhbnQgcjIzZiAtIGZvcm1hdCBieSBmbG9hdDMyIHRleHR1cmVcclxuICogQHZhcmlhbnQgcmdiYSAtIGZvcmFtdCBieSB1aW50OFs0XSB0ZXh0dXJlXHJcbiAqIEB2YXJpYW50IHJnYmFYMiAtIGZvcm1hdCBjb21wcmVzc2VkIGJ5IDIgcGF0Y2hlcyBieSB4IGNvb3JkaW5hdGVcclxuICogQHZhcmlhbnQgcmdiYVg0IC0gZm9ybWF0IGNvbXByZXNzZWQgYnkgNCBwYXRjaGVzIGJ5IHggY29vcmRpbmF0ZVxyXG4gKiBAc2VlIENvbXByZXNzZWRQYXRjaGVkSGVpZ2h0TWFwXHJcbiAqL1xyXG5leHBvcnQgdHlwZSBUSGVpZ2h0TWFwRm9ybWF0ID0gJ3IzMmYnIHwgJ3JnYmEnIHwgJ3JnYmFYMicgfCAncmdiYVg0JyB8ICdyZ2InO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJUmVhZG9ubHlBYnNIZWlnaHRNYXAge1xyXG5cclxuICAgIHJlYWRvbmx5IHdpZHRoOiBpbnQ7XHJcbiAgICByZWFkb25seSBkZXB0aDogaW50O1xyXG5cclxuICAgIHJlYWRvbmx5IG1pbkhlaWdodDogZmxvYXQ7XHJcbiAgICByZWFkb25seSBtYXhIZWlnaHQ6IGZsb2F0O1xyXG5cclxuICAgIGdldCh4OiBpbnQsIHo6IGludCk6IGZsb2F0O1xyXG4gICAgZ2V0RmFjdG9yKHg6IGludCwgejogaW50KTogZmxvYXQ7XHJcbiAgICBnZXRIZWlnaHRJbnRlcnBvbGF0ZWQoeDogZmxvYXQsIHo6IGZsb2F0KTogZmxvYXQ7XHJcbiAgICB0b0ZpbGUoKTogUHJvbWlzZTxCbG9iPjtcclxuICAgIHRvQ2FudmFzKCk6IEhUTUxDYW52YXNFbGVtZW50O1xyXG4gICAgdG9CdWZmZXIoYnVmZmVyOiBVaW50OEFycmF5IHwgVWludDhDbGFtcGVkQXJyYXkpOiB2b2lkO1xyXG4gICAgdG9JbWFnZSh0eXBlPzogc3RyaW5nIHwgdW5kZWZpbmVkLCBxdWFsaXR5PzogYW55KTogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQWJzSGVpZ2h0TWFwIGV4dGVuZHMgQWJzSGVpZ2h0TWFwRmlsZUlPIGltcGxlbWVudHMgSVJlYWRvbmx5QWJzSGVpZ2h0TWFwLCBJWm9uZSB7XHJcblxyXG4gICAgcHVibGljIGFic3RyYWN0IHdpZHRoOiBpbnQ7XHJcbiAgICBwdWJsaWMgYWJzdHJhY3QgZGVwdGg6IGludDtcclxuXHJcbiAgICBwdWJsaWMgYWJzdHJhY3QgbWluSGVpZ2h0OiBmbG9hdDtcclxuICAgIHB1YmxpYyBhYnN0cmFjdCBtYXhIZWlnaHQ6IGZsb2F0O1xyXG5cclxuICAgIHB1YmxpYyBhYnN0cmFjdCBnZXQoeDogaW50LCB6OiBpbnQpOiBmbG9hdDtcclxuICAgIHB1YmxpYyBhYnN0cmFjdCBzZXQoeDogaW50LCB6OiBpbnQsIHZhbHVlOiBmbG9hdCk6IGZsb2F0O1xyXG4gICAgcHVibGljIGFic3RyYWN0IGdldEZhY3Rvcih4OiBpbnQsIHo6IGludCk6IGZsb2F0O1xyXG5cclxuICAgIHB1YmxpYyByZWFkb25seSBtaW5YID0gMDtcclxuICAgIHB1YmxpYyByZWFkb25seSBtaW5aID0gMDtcclxuICAgIFxyXG4gICAgcHVibGljIGdldCBtYXhYKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG4gICAgcHVibGljIGdldCBtYXhaKCkgeyByZXR1cm4gdGhpcy5kZXB0aDsgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRIZWlnaHRJbnRlcnBvbGF0ZWQoeDogZmxvYXQsIHo6IGZsb2F0KSB7XHJcblxyXG4gICAgICAgIGNvbnN0IGludFggPSB4IHwgMDtcclxuICAgICAgICBjb25zdCBpbnRaID0geiB8IDA7XHJcbiAgICAgICAgY29uc3QgeDB6MCA9IHRoaXMuZ2V0KGludFgsIGludFopO1xyXG5cclxuICAgICAgICBpZiAoKGludFggKyAxID49IHRoaXMud2lkdGgpIHx8XHJcbiAgICAgICAgICAgIChpbnRaICsgMSA+PSB0aGlzLmRlcHRoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4geDB6MDtcclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICBjb25zdCB4MXowID0gdGhpcy5nZXQoaW50WCArIDEsIGludFopO1xyXG4gICAgICAgIGNvbnN0IHgwejEgPSB0aGlzLmdldChpbnRYLCAgICAgaW50WiArIDEpO1xyXG4gICAgICAgIGNvbnN0IHgxejEgPSB0aGlzLmdldChpbnRYICsgMSwgaW50WiArIDEpO1xyXG4gICAgXHJcbiAgICAgICAgY29uc3QgZmFjdG9yWCA9IHggLSBpbnRYO1xyXG4gICAgXHJcbiAgICAgICAgY29uc3QgaW50ZXJwb2xhdGVkQm90dG9tID0gKHgxejAgLSB4MHowKSAqIGZhY3RvclggKyB4MHowO1xyXG4gICAgICAgIGNvbnN0IGludGVycG9sYXRlZFRvcCAgICA9ICh4MXoxIC0geDB6MSkgKiBmYWN0b3JYICsgeDB6MTtcclxuICAgIFxyXG4gICAgICAgIGNvbnN0IGZhY3RvclogPSB6IC0gaW50WjtcclxuXHJcbiAgICAgICAgY29uc3QgZmluYWxIZWlnaHQgPSAoaW50ZXJwb2xhdGVkVG9wIC0gaW50ZXJwb2xhdGVkQm90dG9tKSAqIGZhY3RvclogKyBpbnRlcnBvbGF0ZWRCb3R0b207XHJcbiAgICBcclxuICAgICAgICByZXR1cm4gZmluYWxIZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFic3RyYWN0IGFwcGVuZCh4OiBpbnQsIHo6IGludCwgdmFsdWU6IGZsb2F0KTogZmxvYXQ7XHJcblxyXG4gICAgcHVibGljIHN1YnN0cmFjdCh4OiBpbnQsIHo6IGludCwgdmFsdWU6IGZsb2F0KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYXBwZW5kKHgsIHosIC12YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFic3RyYWN0IG11bHRpcGx5KHg6IGludCwgejogaW50LCB2YWx1ZTogZmxvYXQsIGhlaWdodElmWmVybz86IGZsb2F0KTogZmxvYXQ7XHJcblxyXG4gICAgcHVibGljIGRpdmlkZSh4OiBpbnQsIHo6IGludCwgdmFsdWU6IGZsb2F0LCBoZWlnaHRJZlplcm86IGZsb2F0ID0gMCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm11bHRpcGx5KHgsIHosIDEgLyB2YWx1ZSwgaGVpZ2h0SWZaZXJvKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgZnJvbUZpbGUoYnVmZmVyOiBBcnJheUJ1ZmZlciwgb3B0aW9ucz86IElIZWlnaHRNYXBGaWxlSW1wb3J0T3B0aW9ucykge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9faW1wb3J0RnJvbUZpbGUodGhpcywgYnVmZmVyLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgdG9GaWxlKCkge1xyXG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IHRoaXMuX19leHBvcnRUb0J1ZmZlcih0aGlzKTtcclxuICAgICAgICByZXR1cm4gbmV3IEJsb2IoW2J1ZmZlcl0sIHsgdHlwZTogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIiB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdG9CdWZmZXIoYnVmZmVyOiBVaW50OEFycmF5IHwgVWludDhDbGFtcGVkQXJyYXkpOiB2b2lkIHtcclxuXHJcbiAgICAgICAgY29uc3Qgd2lkdGggID0gdGhpcy53aWR0aDtcclxuICAgICAgICBjb25zdCBkZWx0YSAgPSB0aGlzLm1heEhlaWdodCAtIHRoaXMubWluSGVpZ2h0O1xyXG5cclxuICAgICAgICBmb3IgKGxldCB6ID0gMDsgeiA8IHRoaXMuZGVwdGg7IHorKykge1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBjb25zdCBoICAgPSB0aGlzLmdldCh4LCB6KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHYgICA9IChoIC0gdGhpcy5taW5IZWlnaHQpIC8gZGVsdGEgKiAyNTU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwb3MgPSAoeCArIHogKiB3aWR0aCkgKiA0O1xyXG5cclxuICAgICAgICAgICAgICAgIGJ1ZmZlcltwb3NdICAgICA9IHY7XHJcbiAgICAgICAgICAgICAgICBidWZmZXJbcG9zICsgMV0gPSB2O1xyXG4gICAgICAgICAgICAgICAgYnVmZmVyW3BvcyArIDJdID0gdjtcclxuICAgICAgICAgICAgICAgIGJ1ZmZlcltwb3MgKyAzXSA9IDI1NTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdG9DYW52YXMoKTogSFRNTENhbnZhc0VsZW1lbnQge1xyXG5cclxuICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICBjb25zdCB3aWR0aCAgPSB0aGlzLndpZHRoO1xyXG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuZGVwdGg7XHJcblxyXG4gICAgICAgIGNhbnZhcy53aWR0aCAgPSB3aWR0aDtcclxuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgICAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcbiAgICAgICAgaWYgKCFjdHgpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgY3JlYXRlIGNhbnZhcyAyZCBjb250ZXh0Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBpbWFnZURhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIGNvbnN0IGJ1ZmZlciAgICA9IGltYWdlRGF0YS5kYXRhO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudG9CdWZmZXIoYnVmZmVyKTtcclxuICAgICAgICBjdHgucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XHJcblxyXG4gICAgICAgIHJldHVybiBjYW52YXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTYXZlIGhlaWdodCBtYXAgdG8gaW1hZ2Ugb2YgYmFzZTY0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB0b0ltYWdlKHR5cGU/OiBzdHJpbmcgfCB1bmRlZmluZWQsIHF1YWxpdHk/OiBhbnkpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMudG9DYW52YXMoKTtcclxuICAgICAgICByZXR1cm4gY2FudmFzLnRvRGF0YVVSTCh0eXBlLCBxdWFsaXR5KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIExvYWQgaGVpZ2h0IG1hcCBmcm9tIGltYWdlXHJcbiAgICAgKiBAcGFyYW0gaW1nIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZnJvbUltYWdlKGltZzogSW1hZ2VCaXRtYXApIHtcclxuXHJcbiAgICAgICAgY29uc3QgYnVmZmVyV2lkdGggID0gaW1nLndpZHRoO1xyXG4gICAgICAgIGNvbnN0IGJ1ZmZlckhlaWdodCA9IGltZy5oZWlnaHQ7XHJcblxyXG4gICAgICAgIGlmIChidWZmZXJXaWR0aCAlIDIgIT09IDAgfHwgYnVmZmVySGVpZ2h0ICUgMiAhPT0gMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNYXAgc2l6ZXMgbm90IGRpdmlzaWJsZSBieSAyIGFyZSBub3Qgc3VwcG9ydGVkXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2FudmFzICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICAgICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIikhO1xyXG5cclxuICAgICAgICBjYW52YXMud2lkdGggID0gYnVmZmVyV2lkdGg7XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGJ1ZmZlckhlaWdodDtcclxuICAgIFxyXG4gICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGltZywgMCwgMCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGltYWdlRGF0YSAgID0gY29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgYnVmZmVyV2lkdGgsIGJ1ZmZlckhlaWdodCk7XHJcbiAgICAgICAgY29uc3QgaW1hZ2VCdWZmZXIgPSBpbWFnZURhdGEuZGF0YTtcclxuXHJcbiAgICAgICAgY29uc3QgZGVtTWluTWF4ICAgPSB0aGlzLm1heEhlaWdodCAtIHRoaXMubWluSGVpZ2h0O1xyXG4gICAgICAgIGNvbnN0IG1heFNlZ21lbnRYID0gdGhpcy53aWR0aCAtIDE7XHJcbiAgICAgICAgY29uc3QgbWF4U2VnbWVudFogPSB0aGlzLmRlcHRoIC0gMTtcclxuICAgICAgICBjb25zdCBmYWN0b3JYICAgICA9IGJ1ZmZlcldpZHRoICAvIG1heFNlZ21lbnRYO1xyXG4gICAgICAgIGNvbnN0IGZhY3RvclogICAgID0gYnVmZmVySGVpZ2h0IC8gbWF4U2VnbWVudFo7XHJcblxyXG4gICAgICAgIGZvciAobGV0IHogPSAwOyB6IDwgdGhpcy5kZXB0aDsgeisrKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgbm9ybWFsaXplWCA9IHggPT09IG1heFNlZ21lbnRYID8geCAtIDEgOiB4O1xyXG4gICAgICAgICAgICAgICAgbGV0IG5vcm1hbGl6ZVogPSB6ID09PSBtYXhTZWdtZW50WiA/IHogLSAxIDogejtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBoZWlnaHRNYXBYID0gKG5vcm1hbGl6ZVggKiBmYWN0b3JYKSB8IDA7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBoZWlnaHRNYXBaID0gKG5vcm1hbGl6ZVogKiBmYWN0b3JaKSB8IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgcG9zID0gKGhlaWdodE1hcFggKyBoZWlnaHRNYXBaICogYnVmZmVyV2lkdGgpICogNDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHIgPSBpbWFnZUJ1ZmZlcltwb3NdO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZyA9IGltYWdlQnVmZmVyW3BvcyArIDFdO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYiA9IGltYWdlQnVmZmVyW3BvcyArIDJdO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYSA9IGltYWdlQnVmZmVyW3BvcyArIDNdO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvZWZmICA9IChyICsgZyArIGIpIC8gMyAvIGE7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLm1pbkhlaWdodCArIGRlbU1pbk1heCAqIGNvZWZmO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KHgsIHosIGhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzbW9vdGhab25lKHpvbmU6IElab25lLCBucDogZmxvYXQsIHJhZGl1czogaW50KSB7XHJcblxyXG4gICAgICAgIGlmICh6b25lLm1heFggPCAwKSByZXR1cm47XHJcbiAgICAgICAgaWYgKHpvbmUubWF4WiA8IDApIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYgKG5wIDwgMCB8fCBucCA+IDEpIHJldHVybjtcclxuICAgICAgICBpZiAocmFkaXVzID09PSAwKSByYWRpdXMgPSAxO1xyXG5cclxuICAgICAgICBjb25zdCBtaW5YID0gTWF0aC5tYXgoem9uZS5taW5YLCAwKTtcclxuICAgICAgICBjb25zdCBtaW5aID0gTWF0aC5tYXgoem9uZS5taW5aLCAwKTtcclxuICAgICAgICBjb25zdCBtYXhYID0gTWF0aC5taW4oem9uZS5tYXhYLCB0aGlzLndpZHRoKTtcclxuICAgICAgICBjb25zdCBtYXhaID0gTWF0aC5taW4oem9uZS5tYXhaLCB0aGlzLmRlcHRoKTtcclxuXHJcbiAgICAgICAgY29uc3QgY3AgPSAxIC0gbnA7XHJcblxyXG4gICAgICAgIGZvciAobGV0IHggPSBtaW5YOyB4IDwgbWF4WDsgeCsrKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCB6ID0gbWluWjsgeiA8IG1heFo7IHorKykge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZIZWlnaHQgPSB0aGlzLmdldCh4LCB6KTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgdXBkdEhlaWdodDtcclxuICAgICAgICAgICAgICAgIGxldCBuZWlnaE51bWJlciAgPSAwO1xyXG4gICAgICAgICAgICAgICAgbGV0IG5laWdoQXZlcmFnZSA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcnggPSAtcmFkaXVzOyByeCA8PSByYWRpdXM7IHJ4KyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcnogPSAtcmFkaXVzOyByeiA8PSByYWRpdXM7IHJ6KyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlubmVyWCA9ICh4ICsgcngpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbm5lclogPSAoeiArIHJ6KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbm5lclggPCAwIHx8IGlubmVyWCA+PSB0aGlzLndpZHRoKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlubmVyWiA8IDAgfHwgaW5uZXJaID49IHRoaXMuZGVwdGgpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaGVpZ2h0ID0gKGlubmVyWCA9PT0geCAmJiBpbm5lclogPT09IHopXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHByZXZIZWlnaHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdGhpcy5nZXQoaW5uZXJYLCBpbm5lclopO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbmVpZ2hOdW1iZXIrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmVpZ2hBdmVyYWdlICs9IGhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbmVpZ2hBdmVyYWdlIC89IG5laWdoTnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgdXBkdEhlaWdodCA9IG5laWdoQXZlcmFnZSAqIG5wICsgcHJldkhlaWdodCAqIGNwO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KHgsIHosIHVwZHRIZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzbW9vdGgobnA6IGZsb2F0LCByYWRpdXM6IGludCkge1xyXG4gICAgICAgIHRoaXMuc21vb3RoWm9uZSh0aGlzLCBucCwgcmFkaXVzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbm9ybWFsaXplKG1pbkhlaWdodDogZmxvYXQsIG1heEhlaWdodDogZmxvYXQpIHtcclxuXHJcbiAgICAgICAgaWYgKG1pbkhlaWdodCA+IG1heEhlaWdodCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBtaW5NYXhEZWx0YSA9IHRoaXMubWF4SGVpZ2h0IC0gdGhpcy5taW5IZWlnaHQ7XHJcbiAgICAgICAgY29uc3QgbWluTWF4UmFuZ2UgPSBtYXhIZWlnaHQgLSBtaW5IZWlnaHQ7XHJcblxyXG4gICAgICAgIGZvciAobGV0IHogPSAwOyB6IDwgdGhpcy5kZXB0aDsgeisrKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRIZWlnaHQgICA9IHRoaXMuZ2V0KHgsIHopO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplSGVpZ2h0ID0gKChjdXJyZW50SGVpZ2h0IC0gbWluSGVpZ2h0KSAvIG1pbk1heERlbHRhKSAqIG1pbk1heFJhbmdlICsgbWF4SGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KHgsIHosIG5vcm1hbGl6ZUhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNvbWJpbmVIZWlnaHRzKFxyXG4gICAgICAgIHR5cGU6ICcrJyB8ICctJyB8ICcqJyB8ICcvJyxcclxuICAgICAgICBoZWlnaHRNYXA6IEFic0hlaWdodE1hcCxcclxuICAgICAgICB2YWx1ZTogZmxvYXQsXHJcbiAgICAgICAgem9uZTogSVpvbmUsXHJcbiAgICAgICAgaGVpZ2h0SWZaZXJvOiBmbG9hdCA9IDAsXHJcbiAgICAgICAgbWluSGVpZ2h0OiBmbG9hdCB8IG51bGwgPSBudWxsLFxyXG4gICAgICAgIG1heEhlaWdodDogZmxvYXQgfCBudWxsID0gbnVsbFxyXG4gICAgKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHpvbmUubWF4WCA8IDApIHJldHVybjtcclxuICAgICAgICBpZiAoem9uZS5tYXhaIDwgMCkgcmV0dXJuO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IGxlblggPSB6b25lLm1heFggLSB6b25lLm1pblg7XHJcbiAgICAgICAgY29uc3QgbGVuWiA9IHpvbmUubWF4WiAtIHpvbmUubWluWjtcclxuXHJcbiAgICAgICAgaWYgKGxlblggPCAxIHx8IGxlblogPCAxIHx8IHZhbHVlID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGZpeGVkTWluWCA9IE1hdGgubWF4KHpvbmUubWluWCwgMCk7XHJcbiAgICAgICAgY29uc3QgZml4ZWRNaW5aID0gTWF0aC5tYXgoem9uZS5taW5aLCAwKTtcclxuICAgICAgICBjb25zdCBmaXhlZE1heFggPSBNYXRoLm1pbih6b25lLm1heFgsIHRoaXMud2lkdGgpO1xyXG4gICAgICAgIGNvbnN0IGZpeGVkTWF4WiA9IE1hdGgubWluKHpvbmUubWF4WiwgdGhpcy5kZXB0aCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGNvZWZmRmFjdG9yWCA9IChoZWlnaHRNYXAud2lkdGggLSAxKSAvIGxlblg7XHJcbiAgICAgICAgY29uc3QgY29lZmZGYWN0b3JaID0gKGhlaWdodE1hcC5kZXB0aCAtIDEpIC8gbGVuWjtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgeiA9IGZpeGVkTWluWjsgeiA8IGZpeGVkTWF4WjsgeisrKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCB4ID0gZml4ZWRNaW5YOyB4IDwgZml4ZWRNYXhYOyB4KyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCB4MiA9IChjb2VmZkZhY3RvclggKiAoeCAtIHpvbmUubWluWCkpIHwgMDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHoyID0gKGNvZWZmRmFjdG9yWiAqICh6IC0gem9uZS5taW5aKSkgfCAwO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaGVpZ2h0ID0gaGVpZ2h0TWFwLmdldCh4MiwgejIpO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc21vb3RoQXBwZW5kVmFsdWUgPSBoZWlnaHQgKiB2YWx1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBvbGRIZWlnaHQgPSB0aGlzLmdldCh4LCB6KSB8fCBoZWlnaHRJZlplcm87XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGNhbmRpZGF0ZSA9IHR5cGUgPT09ICcrJyA/IG9sZEhlaWdodCArIHNtb290aEFwcGVuZFZhbHVlIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlID09PSAnLScgPyBvbGRIZWlnaHQgLSBzbW9vdGhBcHBlbmRWYWx1ZSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA9PT0gJyonID8gb2xkSGVpZ2h0ICogc21vb3RoQXBwZW5kVmFsdWUgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUgPT09ICcvJyA/IG9sZEhlaWdodCAvIHNtb290aEFwcGVuZFZhbHVlIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmIChtaW5IZWlnaHQgIT09IG51bGwgJiYgY2FuZGlkYXRlIDwgbWluSGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FuZGlkYXRlID0gbWluSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAobWF4SGVpZ2h0ICE9PSBudWxsICYmIGNhbmRpZGF0ZSA+IG1heEhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbmRpZGF0ZSA9IG1heEhlaWdodDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldCh4LCB6LCBjYW5kaWRhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBYnNIZWlnaHRNYXA7IiwiaW1wb3J0IHsgVEhlaWdodE1hcEZvcm1hdCB9IGZyb20gXCIuLi9UZXJyYWluU3lzdGVtL0Fic0hlaWdodE1hcC5tanNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCB2ZXJ0ZXhDb29yZEF0dHJOYW1lICAgPSBcInZlcnRleF9wb3NpdGlvblwiO1xyXG5leHBvcnQgY29uc3QgdmVydGV4SGVpZ2h0QXR0ck5hbWUgID0gXCJ2ZXJ0ZXhfaGVpZ2h0XCI7XHJcbmV4cG9ydCBjb25zdCB2ZXJ0ZXhOb3JtYWxBdHRyTmFtZSAgPSBcInZlcnRleF9ub3JtYWxcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBwYXRjaEluc3RDb29yZE9mZnNldFBhcmFtTmFtZSA9IFwidmVydGV4X3Bvc3Rpb25fb2Zmc2V0XCI7XHJcbmV4cG9ydCBjb25zdCBwYXRjaENvb3JkT2Zmc2V0UGFyYW1OYW1lICAgICA9IFwidVRlcnJhaW5QYXRjaENvb3JkT2Zmc2V0XCI7XHJcbmV4cG9ydCBjb25zdCBwYXRjaExvZENvcmVQYXJhbU5hbWUgICAgICAgICA9IFwidVRlcnJhaW5QYXRjaExvZENvcmVcIjtcclxuXHJcbmV4cG9ydCBjb25zdCB0ZXJyYWluSGVpZ2h0TWFwUGFyYW1OYW1lID0gXCJ1VGVycmFpbkhlaWdodE1hcFwiO1xyXG5leHBvcnQgY29uc3QgdGVycmFpbk1pbkhlaWdodFBhcmFtTmFtZSA9IFwidVRlcnJhaW5NaW5IZWlnaHRcIjtcclxuZXhwb3J0IGNvbnN0IHRlcnJhaW5NYXhIZWlnaHRQYXJhbU5hbWUgPSBcInVUZXJyYWluTWF4SGVpZ2h0XCI7XHJcbmV4cG9ydCBjb25zdCB0ZXJyYWluU3BsYXRNYXBQYXJhbU5hbWUgID0gXCJ1VGVycmFpblNwbGF0TWFwXCI7XHJcblxyXG5leHBvcnQgY29uc3QgbGl0dGxlRW5kaWFuID0gKCgpID0+IHtcclxuICAgIGNvbnN0IHVpbnQ4QXJyYXkgID0gbmV3IFVpbnQ4QXJyYXkoWzB4QUEsIDB4QkJdKTtcclxuICAgIGNvbnN0IHVpbnQxNmFycmF5ID0gbmV3IFVpbnQxNkFycmF5KHVpbnQ4QXJyYXkuYnVmZmVyKTtcclxuICAgIHJldHVybiB1aW50MTZhcnJheVswXSA9PT0gMHhCQkFBO1xyXG59KSgpO1xyXG5cclxuZXhwb3J0IGNvbnN0IGxpdHRsZUVuZGlhblZhbHVlID0gbGl0dGxlRW5kaWFuID8gJ3RydWUnIDogJ2ZhbHNlJztcclxuXHJcbmV4cG9ydCBjb25zdCBkZWZpbmVzVlMgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gXHJcbiAgICAjZGVmaW5lIEhNX05VTV9DSFVOS1NfWCAoJSVITV9OVU1fQ0hVTktTX1glJSlcclxuICAgICNkZWZpbmUgSE1fQ0hVTktfU0laRSAgICglJUhNX0NIVU5LX1NJWkUlJSlcclxuICAgICNkZWZpbmUgSE1fQ0hVTktfU0laRV9GIChmbG9hdChITV9DSFVOS19TSVpFKSlcclxuICAgICNkZWZpbmUgVFJfU0laRSAgICAgICAgIChpdmVjMiglJVRSX1NJWkVfWCUlLCAlJVRSX1NJWkVfWiUlKSlcclxuICAgICNkZWZpbmUgVFJfU0laRV9GICAgICAgICh2ZWMyKCUlVFJfU0laRV9YX0YlJSwgJSVUUl9TSVpFX1pfRiUlKSlcclxuICAgICNkZWZpbmUgVFJfU0laRV9IX0YgICAgIChUUl9TSVpFX0YgLyAyLjApXHJcbiAgICAjZGVmaW5lIFRSX1NJWkVfSF9OX0YgICAoLVRSX1NJWkVfSF9GKVxyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IGJhc2VPcmlnaW5hbFZTID0gLyoqIEB0eXBlIGdsc2wgKi9cclxuYFxyXG4gICAgYXR0cmlidXRlIHV2ZWMyICR7dmVydGV4Q29vcmRBdHRyTmFtZX07XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3QgYmFzZUZvckluc3RhbmNpbmdWUyA9IC8qKiBAdHlwZSBnbHNsICovXHJcbmBcclxuICAgIGF0dHJpYnV0ZSB1dmVjMiAke3ZlcnRleENvb3JkQXR0ck5hbWV9O1xyXG4gICAgYXR0cmlidXRlIHV2ZWMyICR7cGF0Y2hJbnN0Q29vcmRPZmZzZXRQYXJhbU5hbWV9O1xyXG5gO1xyXG5cclxuLy91bmlmb3JtIHZlYzIgJHt0ZXJyYWluU2l6ZVBhcmFtTmFtZX07XHJcbi8vdW5pZm9ybSBmbG9hdCAke3RlcnJhaW5IZWlnaHRNYXBDaHVua1NpemVQYXJhbU5hbWV9O1xyXG5cclxuZXhwb3J0IGNvbnN0IGJhc2VDbGVhclZTID0gLyoqIEB0eXBlIGdsc2wgKi9cclxuYFxyXG4gICAgLy8gI2RlZmluZSAjYmFzZURlZmluZXNWU1xyXG4gICAgLy8gI2RlZmluZSAjYmFzZU9yaWdpbmFsVlMgW09SXSAjYmFzZUZvckluc3RhbmNpbmdWU1xyXG5cclxuICAgIHVuaWZvcm0gbWF0NCBtYXRyaXhfdmlld1Byb2plY3Rpb247XHJcbiAgICB1bmlmb3JtIG1hdDQgbWF0cml4X21vZGVsO1xyXG4gICAgdW5pZm9ybSBtYXQzIG1hdHJpeF9ub3JtYWw7XHJcblxyXG4gICAgdW5pZm9ybSB2ZWMyICR7cGF0Y2hDb29yZE9mZnNldFBhcmFtTmFtZX07XHJcbiAgICB1bmlmb3JtIGZsb2F0ICR7cGF0Y2hMb2RDb3JlUGFyYW1OYW1lfTtcclxuXHJcbiAgICB1bmlmb3JtICUlSEVJR0hUX01BUF9TQU1QTEVSJSUgJHt0ZXJyYWluSGVpZ2h0TWFwUGFyYW1OYW1lfTtcclxuXHJcbiAgICB1bmlmb3JtIGZsb2F0ICR7dGVycmFpbk1pbkhlaWdodFBhcmFtTmFtZX07XHJcbiAgICB1bmlmb3JtIGZsb2F0ICR7dGVycmFpbk1heEhlaWdodFBhcmFtTmFtZX07XHJcbiAgICBcclxuICAgIHZlYzMgZFBvc2l0aW9uVztcclxuICAgIG1hdDQgZE1vZGVsTWF0cml4O1xyXG4gICAgbWF0MyBkTm9ybWFsTWF0cml4O1xyXG4gICAgdmVjMiBkQ3VycmVudFRlcnJhaW5YWjtcclxuICAgIHZlYzMgZEN1cnJlbnRUZXJyYWluTm9ybWFsO1xyXG4gICAgZmxvYXQgZEN1cnJlbnRUZXJyYWluSGVpZ2h0O1xyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IGN1cnJlbnRUZXJyYWluWFpGb3JJbnN0YW5jaW5nQ2h1bmtWUyA9IC8qKiBAdHlwZSBnbHNsICovXHJcbmBcclxuICAgIHZlYzIgZ2V0Q3VycmVudFRlcnJhaW5YWigpIHtcclxuICAgICAgICByZXR1cm4gdmVjMigke3ZlcnRleENvb3JkQXR0ck5hbWV9KSArIHZlYzIoJHtwYXRjaEluc3RDb29yZE9mZnNldFBhcmFtTmFtZX0pO1xyXG4gICAgfVxyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IGN1cnJlbnRUZXJyYWluWFpDaHVua1ZTID0gXHJcbmBcclxuICAgIHZlYzIgZ2V0Q3VycmVudFRlcnJhaW5YWigpIHtcclxuICAgICAgICByZXR1cm4gdmVjMigke3ZlcnRleENvb3JkQXR0ck5hbWV9KSArICR7cGF0Y2hDb29yZE9mZnNldFBhcmFtTmFtZX07XHJcbiAgICB9XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3QgdGVycmFpbkNvb3Jkc0NodW5rVlMgPVxyXG5gXHJcbiAgICB2ZWMyIGdldEN1cnJlbnRUZXJyYWluVXZDb29yZCgpIHtcclxuICAgICAgICB2ZWMyIHh6ID0gZEN1cnJlbnRUZXJyYWluWFo7XHJcbiAgICAgICAgdmVjMiB1diA9ICh4eiArIDAuNSkgLyBUUl9TSVpFX0Y7XHJcbiAgICAgICAgcmV0dXJuIHV2O1xyXG4gICAgfVxyXG5cclxuICAgIHZlYzIgY2xhbXBUZXJyYWluWFoodmVjMiB4eikge1xyXG4gICAgICAgIHJldHVybiBjbGFtcCh4eiwgdmVjMigwLjApLCBUUl9TSVpFX0YpO1xyXG4gICAgfVxyXG5cclxuICAgIHZlYzIgZ2V0VGVycmFpblhaKGl2ZWMyIG9mZnNldCkge1xyXG4gICAgICAgIHJldHVybiBkQ3VycmVudFRlcnJhaW5YWiArIHZlYzIob2Zmc2V0KTtcclxuICAgIH1cclxuYDtcclxuXHJcbi8vIE5vdCBzdXBwb3J0IGZvciB3ZWJncHVcclxuZXhwb3J0IGNvbnN0IHRlcnJhaW5IZWlnaHRGYWN0b3JSR0I4VlMgPVxyXG5gXHJcbiAgICBmbG9hdCByZ2I4VG9GbG9hdChpdmVjMyB2KSB7XHJcbiAgICAgICAgdXZlYzMgdWludHMgPSB1dmVjMyh2ICogMjU1LjApO1xyXG4gICAgICAgIHVpbnQgc2NhbGVkID0gKHVpbnRzLnIgPDwgMTYpIHwgKHVpbnRzLmcgPDwgOCkgfCB1aW50cy5iO1xyXG4gICAgICAgIHJldHVybiBmbG9hdChzY2FsZWQpIC8gMTY3NzcyMTUuMDtcclxuICAgIH1cclxuXHJcbiAgICBmbG9hdCBnZXRUZXJyYWluSGVpZ2h0RmFjdG9yRnJvbVRleHR1cmUoaXZlYzMgdXYpIHtcclxuICAgICAgICB2ZWMzIHJnYiA9IHRleHR1cmUoJHt0ZXJyYWluSGVpZ2h0TWFwUGFyYW1OYW1lfSwgdXYpO1xyXG4gICAgICAgIHJldHVybiByZ2I4VG9GbG9hdChyZ2IpO1xyXG4gICAgfVxyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IHRlcnJhaW5IZWlnaHRGYWN0b3JSMzJGVlMgPSBcclxuYFxyXG4gICAgZmxvYXQgZ2V0VGVycmFpbkhlaWdodEZhY3RvckZyb21UZXh0dXJlKGl2ZWMzIHV2KSB7XHJcbiAgICAgICAgcmV0dXJuIHRleHR1cmUoJHt0ZXJyYWluSGVpZ2h0TWFwUGFyYW1OYW1lfSwgdXYpLnI7XHJcbiAgICB9XHJcbmA7XHJcblxyXG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy82MzgyNzgzNi9pcy1pdC1wb3NzaWJsZS10by1kby1hLXJnYmEtdG8tZmxvYXQtYW5kLWJhY2stcm91bmQtdHJpcC1hbmQtcmVhZC10aGUtcGl4ZWxzLWluXHJcbi8vIG5vdGU6IHRoZSAwLjFzIGhlcmUgYW4gdGhlcmUgYXJlIHZvb2RvbyByZWxhdGVkIHRvIHByZWNpc2lvblxyXG5leHBvcnQgY29uc3QgdGVycmFpbkhlaWdodEZhY3RvclJHQkE4VlMgPVxyXG5gXHJcbiAgICBmbG9hdCByZ2JhOFRvRmxvYXQodmVjNCB2KSB7XHJcbiAgICAgICAgdmVjNCBiaXRzICA9ICR7bGl0dGxlRW5kaWFuID8gJ3YnIDogJ3YuYWJncid9ICogMjU1LjA7XHJcbiAgICAgICAgZmxvYXQgc2lnbiA9IG1peCgtMS4wLCAxLjAsIHN0ZXAoYml0c1szXSwgMTI4LjApKTtcclxuICAgICAgICBmbG9hdCBleHBvID0gZmxvb3IobW9kKGJpdHNbM10gKyAwLjEsIDEyOC4wKSkgKiAyLjAgKyBmbG9vcigoYml0c1syXSArIDAuMSkgLyAxMjguMCkgLSAxMjcuMDtcclxuICAgICAgICBmbG9hdCBzaWcgID0gYml0c1swXSArIGJpdHNbMV0gKiAyNTYuMCArIGZsb29yKG1vZChiaXRzWzJdICsgMC4xLCAxMjguMCkpICogMjU2LjAgKiAyNTYuMDtcclxuICAgICAgICByZXR1cm4gc2lnbiAqICgxLjAgKyBzaWcgLyA4Mzg4NjA3LjApICogcG93KDIuMCwgZXhwbyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZsb2F0IGdldFRlcnJhaW5IZWlnaHRGYWN0b3JGcm9tVGV4dHVyZShpdmVjMyB1dikge1xyXG4gICAgICAgIHZlYzQgcmdiYSA9IHRleGVsRmV0Y2goJHt0ZXJyYWluSGVpZ2h0TWFwUGFyYW1OYW1lfSwgdXYsIDApO1xyXG4gICAgICAgIHJldHVybiByZ2JhOFRvRmxvYXQocmdiYSk7XHJcbiAgICB9XHJcbmA7XHJcblxyXG4vLyBUT0RPOiBjaGVjayBsaXR0bGVFbmRpYW5cclxuLy8gQ29tcHJlc3MgaGVpZ2h0IGJ5IHggY29vcmQgW3BhdGNoMCwgcGF0Y2gxXSAuLi5cclxuLy8gc2VlOiBDb21wcmVzc2VkUGF0Y2hlZEhlaWdodE1hcCBmaWxlXHJcbmV4cG9ydCBjb25zdCB0ZXJyYWluSGVpZ2h0RmFjdG9yUkcxNlVYMlZTID1cclxuYFxyXG4gICAgZmxvYXQgZ2V0VGVycmFpbkhlaWdodEZhY3RvckZyb21UZXh0dXJlKGl2ZWMzIHV2KSB7XHJcblxyXG4gICAgICAgIGludCBsZXZlbCAgICA9IHV2LmI7XHJcbiAgICAgICAgaW50IG5ld0xldmVsID0gbGV2ZWwgLyAyO1xyXG4gICAgICAgIGludCBjaHVua1ggICA9IGxldmVsICUgSE1fTlVNX0NIVU5LU19YO1xyXG4gICAgICAgIGludCBzaGlmdCAgICA9IGNodW5rWCAlIDI7XHJcblxyXG4gICAgICAgICNpZiBkZWZpbmVkKFdFQkdQVSlcclxuICAgICAgICB1dmVjNCByZ2JhID0gdGV4ZWxGZXRjaCh1c2FtcGxlcjJEQXJyYXkoJHt0ZXJyYWluSGVpZ2h0TWFwUGFyYW1OYW1lfV90ZXh0dXJlLCAke3RlcnJhaW5IZWlnaHRNYXBQYXJhbU5hbWV9X3NhbXBsZXIpLCBpdmVjMyh1di5yZywgbmV3TGV2ZWwpLCAwKTtcclxuICAgICAgICAjZWxzZVxyXG4gICAgICAgIHV2ZWM0IHJnYmEgPSB0ZXhlbEZldGNoKCR7dGVycmFpbkhlaWdodE1hcFBhcmFtTmFtZX0sIGl2ZWMzKHV2LnJnLCBuZXdMZXZlbCksIDApO1xyXG4gICAgICAgICNlbmRpZlxyXG4gICAgICAgIFxyXG4gICAgICAgIHVpbnQgdmFsdWUgICA9IChzaGlmdCA9PSAwKSA/IHJnYmEuciA6IHJnYmEuZztcclxuICAgICAgICByZXR1cm4gZmxvYXQodmFsdWUpIC8gNjU1MzUuMDtcclxuICAgIH1cclxuYDtcclxuXHJcbmV4cG9ydCBjb25zdCB0ZXJyYWluSGVpZ2h0RmFjdG9yUkdCQThVWDRWUyA9XHJcbmBcclxuICAgIGZsb2F0IGdldFRlcnJhaW5IZWlnaHRGYWN0b3JGcm9tVGV4dHVyZShpdmVjMyB1dikge1xyXG5cclxuICAgICAgICBpbnQgbGV2ZWwgICAgPSB1di5iO1xyXG4gICAgICAgIGludCBuZXdMZXZlbCA9IGxldmVsIC8gNDtcclxuICAgICAgICBpbnQgY2h1bmtYICAgPSBsZXZlbCAlIEhNX05VTV9DSFVOS1NfWDtcclxuICAgICAgICBpbnQgc2hpZnQgICAgPSBjaHVua1ggJSA0O1xyXG5cclxuICAgICAgICAjaWYgZGVmaW5lZChXRUJHUFUpXHJcbiAgICAgICAgdXZlYzQgcmdiYSA9IHRleGVsRmV0Y2godXNhbXBsZXIyREFycmF5KCR7dGVycmFpbkhlaWdodE1hcFBhcmFtTmFtZX1fdGV4dHVyZSwgJHt0ZXJyYWluSGVpZ2h0TWFwUGFyYW1OYW1lfV9zYW1wbGVyKSwgaXZlYzModXYucmcsIG5ld0xldmVsKSwgMCk7XHJcbiAgICAgICAgI2Vsc2VcclxuICAgICAgICB1dmVjNCByZ2JhID0gdGV4ZWxGZXRjaCgke3RlcnJhaW5IZWlnaHRNYXBQYXJhbU5hbWV9LCBpdmVjMyh1di5yZywgbmV3TGV2ZWwpLCAwKTtcclxuICAgICAgICAjZW5kaWZcclxuXHJcbiAgICAgICAgcmV0dXJuIGZsb2F0KHJnYmFbc2hpZnRdKSAvIDI1NS4wO1xyXG4gICAgfVxyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IHRlcnJhaW5DaHVua1VWVlMgPVxyXG5gXHJcbiAgICAvLyAjZGVmaW5lICN0ZXJyYWluQ29vcmRzQ2h1bmtWU1xyXG5cclxuICAgIGl2ZWMzIGdldFRlcnJhaW5DaHVua1VWKGl2ZWMyIG9mZnNldCkge1xyXG5cclxuICAgICAgICB2ZWMyIG9jID0gZ2V0VGVycmFpblhaKG9mZnNldCk7XHJcbiAgICAgICAgdmVjMiB4eiA9IGNsYW1wVGVycmFpblhaKG9jKTtcclxuICAgICAgICB2ZWMyIGNjID0gZmxvb3IoeHogLyBITV9DSFVOS19TSVpFX0YpO1xyXG5cclxuICAgICAgICBpbnQgbG9jYWxYID0gaW50KHh6WzBdKSAlIEhNX0NIVU5LX1NJWkU7XHJcbiAgICAgICAgaW50IGxvY2FsWiA9IGludCh4elsxXSkgJSBITV9DSFVOS19TSVpFO1xyXG4gICAgICAgIGludCBjaHVua1ggPSBpbnQoY2NbMF0pO1xyXG4gICAgICAgIGludCBjaHVua1ogPSBpbnQoY2NbMV0pO1xyXG4gICAgICAgIGludCBsZXZlbCAgPSBjaHVua1ogKiBITV9OVU1fQ0hVTktTX1ggKyBjaHVua1g7XHJcblxyXG4gICAgICAgIHJldHVybiBpdmVjMyhsb2NhbFgsIGxvY2FsWiwgbGV2ZWwpO1xyXG4gICAgfVxyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IHRlcnJhaW5IZWlnaHRGYWN0b3JDaHVua1ZTID0gXHJcbmBcclxuICAgIC8vICNkZWZpbmUgI3RlcnJhaW5IZWlnaHRGYWN0b3JSR0JBOFZTIFtPUl0gI3RlcnJhaW5IZWlnaHRGYWN0b3JSR0I4VlNcclxuICAgIC8vICNkZWZpbmUgI3RlcnJhaW5DaHVua1VWVlNcclxuXHJcbiAgICBmbG9hdCBnZXRUZXJyYWluSGVpZ2h0RmFjdG9yKGl2ZWMyIG9mZnNldCkge1xyXG4gICAgICAgIGl2ZWMzIHV2ID0gZ2V0VGVycmFpbkNodW5rVVYob2Zmc2V0KTtcclxuICAgICAgICByZXR1cm4gZ2V0VGVycmFpbkhlaWdodEZhY3RvckZyb21UZXh0dXJlKHV2KTtcclxuICAgIH1cclxuYDtcclxuXHJcbi8vIFRPRE86IG9wdGltaXphdGlvbiBieSBzdGF0aWNcclxuZXhwb3J0IGNvbnN0IHRlcnJhaW5IZWlnaHRDaHVua1ZTID1cclxuYFxyXG4gICAgLy8gI2RlZmluZSAjdGVycmFpbkhlaWdodEZhY3RvckNodW5rVlNcclxuICAgIFxyXG4gICAgZmxvYXQgZ2V0VGVycmFpbkhlaWdodChpdmVjMiBvZmZzZXQpIHtcclxuICAgICAgICByZXR1cm4gZ2V0VGVycmFpbkhlaWdodEZhY3RvcihvZmZzZXQpICogKCR7dGVycmFpbk1heEhlaWdodFBhcmFtTmFtZX0gLSAke3RlcnJhaW5NaW5IZWlnaHRQYXJhbU5hbWV9KSArICR7dGVycmFpbk1pbkhlaWdodFBhcmFtTmFtZX07XHJcbiAgICB9XHJcblxyXG4gICAgZmxvYXQgZ2V0Q3VycmVudFRlcnJhaW5IZWlnaHQoKSB7XHJcbiAgICAgICAgcmV0dXJuIGdldFRlcnJhaW5IZWlnaHQoaXZlYzIoMCwgMCkpO1xyXG4gICAgfVxyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IGluc3RhbmNpbmdWUyA9IGBgO1xyXG5leHBvcnQgY29uc3QgdHJhbnNmb3JtSW5zdGFuY2luZ1ZTID0gYGA7XHJcbmV4cG9ydCBjb25zdCB0cmFuc2Zvcm1EZWNsVlMgPSBgYDtcclxuXHJcbmV4cG9ydCBjb25zdCB0cmFuc2Zvcm1WUyA9IFxyXG5gXHJcbiAgICAvLyAjZGVmaW5lICN0ZXJyYWluSGVpZ2h0Q2h1bmtWU1xyXG5cclxuICAgIG1hdDQgZ2V0TW9kZWxNYXRyaXgoKSB7XHJcbiAgICAgICAgcmV0dXJuIG1hdHJpeF9tb2RlbDtcclxuICAgIH1cclxuXHJcbiAgICB2ZWM0IGdldFBvc2l0aW9uKCkge1xyXG4gICAgXHJcbiAgICAgICAgZE1vZGVsTWF0cml4ID0gZ2V0TW9kZWxNYXRyaXgoKTtcclxuXHJcbiAgICAgICAgdmVjMiBjZW50ZXJlZFhaID0gVFJfU0laRV9IX05fRiArIGRDdXJyZW50VGVycmFpblhaO1xyXG4gICAgICAgIHZlYzQgbG9jYWxQb3MgICA9IHZlYzQoY2VudGVyZWRYWi5yLCBkQ3VycmVudFRlcnJhaW5IZWlnaHQsIGNlbnRlcmVkWFouZywgMS4wKTtcclxuICAgICAgICBcclxuICAgICAgICB2ZWM0IHBvc1cgICAgICA9IGRNb2RlbE1hdHJpeCAqIGxvY2FsUG9zO1xyXG4gICAgICAgIHZlYzQgc2NyZWVuUG9zID0gbWF0cml4X3ZpZXdQcm9qZWN0aW9uICogcG9zVztcclxuXHJcbiAgICAgICAgZFBvc2l0aW9uVyA9IHBvc1cueHl6O1xyXG5cclxuICAgICAgICByZXR1cm4gc2NyZWVuUG9zO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB2ZWMzIGdldFdvcmxkUG9zaXRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIGRQb3NpdGlvblc7XHJcbiAgICB9XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3QgdXYwVlMgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gXHJcbmA7XHJcblxyXG4vLyBidWcgd2l0aCBnZXRVdjBcclxuZXhwb3J0IGNvbnN0IHN0YXJ0VXYwVlMgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gIFxyXG4gICAgdmVjMiBnZXRVdjAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGdldEN1cnJlbnRUZXJyYWluVXZDb29yZCgpO1xyXG4gICAgfVxyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IG5vcm1hbEJ5SGVpZ2h0TWFwVlMgID0gLyoqIEB0eXBlIGdsc2wgKi9cclxuYFxyXG4gICAgdmVjMyBnZXRDdXJyZW50VGVycmFpbk5vcm1hbCgpIHtcclxuXHJcbiAgICAgICAgZmxvYXQgc3RlcCA9IHBvdygyLjAsICR7cGF0Y2hMb2RDb3JlUGFyYW1OYW1lfSArIDEuMCkgLyAyLjA7XHJcblxyXG4gICAgICAgIGZsb2F0IGxlZnQgID0gZ2V0VGVycmFpbkhlaWdodChpdmVjMiggc3RlcCwgIDApKTtcclxuICAgICAgICBmbG9hdCByaWdodCA9IGdldFRlcnJhaW5IZWlnaHQoaXZlYzIoLXN0ZXAsICAwKSk7XHJcbiAgICAgICAgZmxvYXQgdXAgICAgPSBnZXRUZXJyYWluSGVpZ2h0KGl2ZWMyKCAwLCAgICAgc3RlcCkpO1xyXG4gICAgICAgIGZsb2F0IGRvd24gID0gZ2V0VGVycmFpbkhlaWdodChpdmVjMiggMCwgICAgLXN0ZXApKTtcclxuICAgICAgICB2ZWMzIG5vcm1hbCA9IHZlYzMobGVmdCAtIHJpZ2h0LCAyLjAgKiBzdGVwLCBkb3duIC0gdXApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBub3JtYWxpemUobm9ybWFsKTtcclxuICAgIH1cclxuYDtcclxuXHJcbmV4cG9ydCBjb25zdCBub3JtYWxDb3JlVlMgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gXHJcbiAgICB2ZWMzIGdldExvY2FsTm9ybWFsKHZlYzMgdmVydGV4Tm9ybWFsKSB7XHJcbiAgICAgICAgcmV0dXJuIGRDdXJyZW50VGVycmFpbk5vcm1hbDtcclxuICAgIH1cclxuXHJcbiAgICBtYXQzIGdldE5vcm1hbE1hdHJpeChtYXQ0IG1vZGVsTWF0cml4KSB7XHJcbiAgICAgICAgcmV0dXJuIG1hdHJpeF9ub3JtYWw7XHJcbiAgICB9XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3Qgbm9ybWFsVlMgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gXHJcbiAgICAvLyAjZGVmaW5lICNub3JtYWxCeUhlaWdodE1hcFZTXHJcblxyXG4gICAgdmVjMyBnZXROb3JtYWwoKSB7XHJcbiAgICAgICAgZE5vcm1hbE1hdHJpeCA9IG1hdHJpeF9ub3JtYWw7XHJcbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZShkTm9ybWFsTWF0cml4ICogZEN1cnJlbnRUZXJyYWluTm9ybWFsKTtcclxuICAgIH1cclxuYDtcclxuXHJcbmV4cG9ydCBjb25zdCBzdGFydFZTID0gLyoqIEB0eXBlIGdsc2wgKi9cclxuYFxyXG4gICAgJHtzdGFydFV2MFZTfVxyXG5cclxuICAgIHZhcnlpbmcgdmVjMiB2VXZDb29yZDtcclxuICAgIHZhcnlpbmcgdmVjMiB2R3JpZFBvc2l0aW9uO1xyXG5cclxuICAgIHZvaWQgbWFpbih2b2lkKSB7XHJcblxyXG4gICAgICAgIGRDdXJyZW50VGVycmFpblhaICAgICA9IGdldEN1cnJlbnRUZXJyYWluWFooKTtcclxuICAgICAgICBkQ3VycmVudFRlcnJhaW5IZWlnaHQgPSBnZXRDdXJyZW50VGVycmFpbkhlaWdodCgpO1xyXG4gICAgICAgIGRDdXJyZW50VGVycmFpbk5vcm1hbCA9IGdldEN1cnJlbnRUZXJyYWluTm9ybWFsKCk7XHJcblxyXG4gICAgICAgIHZHcmlkUG9zaXRpb24gPSBkQ3VycmVudFRlcnJhaW5YWjtcclxuICAgICAgICB2VXZDb29yZCAgICAgID0gZ2V0Q3VycmVudFRlcnJhaW5VdkNvb3JkKCk7XHJcbiAgICAgICAgZ2xfUG9zaXRpb24gICA9IGdldFBvc2l0aW9uKCk7XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3QgbWF4TGF5ZXJzQ291bnQgPSAxNjtcclxuZXhwb3J0IGNvbnN0IGRpZmZ1c2VQUyA9IC8qKiBAdHlwZSBnbHNsICovXHJcbmBcclxuICAgIHVuaWZvcm0gc2FtcGxlcjJEICR7dGVycmFpblNwbGF0TWFwUGFyYW1OYW1lfTtcclxuICAgIHVuaWZvcm0gbWVkaXVtcCBzYW1wbGVyMkRBcnJheSB1VGVycmFpbkxheWVyc0RpZmZ1c2U7XHJcbiAgICAvL3VuaWZvcm0gbWVkaXVtcCBzYW1wbGVyMkRBcnJheSB1VGVycmFpbkxheWVyc05vcm1hbE1hcDtcclxuICAgIHVuaWZvcm0gZmxvYXQgdVRlcnJhaW5MYXllcnNDb3VudDtcclxuICAgIHVuaWZvcm0gZmxvYXQgdVRlcnJhaW5MYXllcnNGbGFnc1ske21heExheWVyc0NvdW50fV07XHJcbiAgICB1bmlmb3JtIHZlYzIgdVRlcnJhaW5MYXllcnNTY2FsZVske21heExheWVyc0NvdW50fV07XHJcbiAgICB1bmlmb3JtIHZlYzIgdVRlcnJhaW5MYXllcnNPZmZzZXRbJHttYXhMYXllcnNDb3VudH1dO1xyXG5cclxuICAgIHZhcnlpbmcgdmVjMiB2VXZDb29yZDtcclxuICAgIHZhcnlpbmcgdmVjMiB2R3JpZFBvc2l0aW9uO1xyXG5cclxuICAgIHZlYzQgbUdhbW1hID0gdmVjNCgyLjIpO1xyXG5cclxuICAgIHZvaWQgZ2V0QWxiZWRvKCkge1xyXG5cclxuICAgICAgICB2ZWMzIGFsYmVkbyA9IHZlYzMoMC4wKTtcclxuICAgICAgICB2ZWM0IHNwbGF0ICA9IHBvdyh0ZXh0dXJlMkQoJHt0ZXJyYWluU3BsYXRNYXBQYXJhbU5hbWV9LCB2VXZDb29yZCksIHZlYzQoMi4yKSk7XHJcbiAgICAgICAgaW50IGNvdW50ICAgPSBpbnQodVRlcnJhaW5MYXllcnNDb3VudCk7XHJcblxyXG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgJHttYXhMYXllcnNDb3VudH07ICsraSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHVUZXJyYWluTGF5ZXJzRmxhZ3NbaV0gPiAwLjApIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2ZWMyIHV2ID0gdVRlcnJhaW5MYXllcnNPZmZzZXRbaV0gKyB2VXZDb29yZCAqIHVUZXJyYWluTGF5ZXJzU2NhbGVbaV07XHJcbiAgICAgICAgICAgICAgICB2ZWMzIHBvcyA9IHZlYzModXYsIGZsb2F0KGkpKTtcclxuICAgICAgICAgICAgICAgIHZlYzQgdGV4ID0gcG93KHRleHR1cmUodVRlcnJhaW5MYXllcnNEaWZmdXNlLCBwb3MpLCBtR2FtbWEpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoaSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxiZWRvID0gdGV4LnJnYjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsYmVkbyA9IG1peChhbGJlZG8sIHRleC5yZ2IsIHNwbGF0W2kgLSAxXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgZEFsYmVkbyA9IGFsYmVkbztcclxuICAgIH1cclxuYDtcclxuXHJcbmV4cG9ydCBjb25zdCBoZWlnaHRNYXBGYWN0b3JzQ2h1bmtzID0ge1xyXG4gICAgdGVycmFpbkhlaWdodEZhY3RvclIzMkZWUyxcclxuICAgIHRlcnJhaW5IZWlnaHRGYWN0b3JSR0JBOFZTLFxyXG4gICAgdGVycmFpbkhlaWdodEZhY3RvclJHQjhWUyxcclxuICAgIHRlcnJhaW5IZWlnaHRGYWN0b3JSRzE2VVgyVlMsXHJcbiAgICB0ZXJyYWluSGVpZ2h0RmFjdG9yUkdCQThVWDRWUyxcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGNodW5rcyA9IHtcclxuXHJcbiAgICAuLi5oZWlnaHRNYXBGYWN0b3JzQ2h1bmtzLFxyXG5cclxuICAgIGN1cnJlbnRUZXJyYWluWFpGb3JJbnN0YW5jaW5nQ2h1bmtWUyxcclxuICAgIGN1cnJlbnRUZXJyYWluWFpDaHVua1ZTLFxyXG5cclxuICAgIHRlcnJhaW5IZWlnaHRGYWN0b3JDaHVua1ZTLFxyXG5cclxuICAgIHRlcnJhaW5IZWlnaHRDaHVua1ZTLFxyXG4gICAgdGVycmFpbkNvb3Jkc0NodW5rVlMsXHJcbiAgICB0ZXJyYWluQ2h1bmtVVlZTLFxyXG5cclxuICAgIG5vcm1hbEJ5SGVpZ2h0TWFwVlMsXHJcblxyXG5cclxuICAgIC8vIFZlcnRleFxyXG4gICAgZGVmaW5lc1ZTLFxyXG4gICAgYmFzZUZvckluc3RhbmNpbmdWUyxcclxuICAgIGJhc2VPcmlnaW5hbFZTLFxyXG4gICAgYmFzZUNsZWFyVlMsXHJcblxyXG4gICAgdHJhbnNmb3JtRGVjbFZTLFxyXG4gICAgXHJcbiAgICB0cmFuc2Zvcm1WUyxcclxuICAgIGluc3RhbmNpbmdWUyxcclxuICAgIHRyYW5zZm9ybUluc3RhbmNpbmdWUyxcclxuICAgIG5vcm1hbENvcmVWUyxcclxuICAgIG5vcm1hbFZTLFxyXG5cclxuICAgIHV2MFZTLFxyXG4gICAgc3RhcnRWUyxcclxuXHJcbiAgICAvLyBGcmFnbWVudFxyXG4gICAgZGlmZnVzZVBTLFxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElUZXJyYWluSGVpZ2h0RmFjdG9yVlNTdG9yZSB7XHJcbiAgICB0ZXJyYWluSGVpZ2h0RmFjdG9yUjMyRlZTOiBzdHJpbmcsXHJcbiAgICB0ZXJyYWluSGVpZ2h0RmFjdG9yUkdCQThWUzogc3RyaW5nLFxyXG4gICAgdGVycmFpbkhlaWdodEZhY3RvclJHQjhWUzogc3RyaW5nLFxyXG4gICAgdGVycmFpbkhlaWdodEZhY3RvclJHMTZVWDJWUzogc3RyaW5nLFxyXG4gICAgdGVycmFpbkhlaWdodEZhY3RvclJHQkE4VVg0VlM6IHN0cmluZyxcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRlcnJhaW5IZWlnaHRGYWN0b3JWUyhmb3JtYXQ6IFRIZWlnaHRNYXBGb3JtYXQsIGNodW5rc1N0b3JlOiBJVGVycmFpbkhlaWdodEZhY3RvclZTU3RvcmUpIHtcclxuICAgIHN3aXRjaCAoZm9ybWF0KSB7XHJcbiAgICAgICAgY2FzZSAncjMyZic6ICAgcmV0dXJuIGNodW5rc1N0b3JlLnRlcnJhaW5IZWlnaHRGYWN0b3JSMzJGVlM7XHJcbiAgICAgICAgY2FzZSAncmdiYSc6ICAgcmV0dXJuIGNodW5rc1N0b3JlLnRlcnJhaW5IZWlnaHRGYWN0b3JSR0JBOFZTO1xyXG4gICAgICAgIGNhc2UgJ3JnYic6ICAgIHJldHVybiBjaHVua3NTdG9yZS50ZXJyYWluSGVpZ2h0RmFjdG9yUkdCOFZTO1xyXG4gICAgICAgIGNhc2UgJ3JnYmFYMic6IHJldHVybiBjaHVua3NTdG9yZS50ZXJyYWluSGVpZ2h0RmFjdG9yUkcxNlVYMlZTO1xyXG4gICAgICAgIGNhc2UgJ3JnYmFYNCc6IHJldHVybiBjaHVua3NTdG9yZS50ZXJyYWluSGVpZ2h0RmFjdG9yUkdCQThVWDRWUztcclxuICAgICAgICBkZWZhdWx0OiBicmVhaztcclxuICAgIH1cclxuICAgIHRocm93IG5ldyBFcnJvcignRm9ybWF0IG5vdCBzdXBwb3J0ZWQnKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRleHR1cmVUeXBlKGZvcm1hdDogVEhlaWdodE1hcEZvcm1hdCkge1xyXG4gICAgc3dpdGNoIChmb3JtYXQpIHtcclxuICAgICAgICBjYXNlICdyMzJmJzogICByZXR1cm4gcGMuUElYRUxGT1JNQVRfUjMyRjtcclxuICAgICAgICBjYXNlICdyZ2JhJzogICByZXR1cm4gcGMuUElYRUxGT1JNQVRfUkdCQTg7XHJcbiAgICAgICAgY2FzZSAncmdiYVgyJzogcmV0dXJuIHBjLlBJWEVMRk9STUFUX1JHMTZVO1xyXG4gICAgICAgIGNhc2UgJ3JnYmFYNCc6IHJldHVybiBwYy5QSVhFTEZPUk1BVF9SR0JBOFU7XHJcbiAgICAgICAgZGVmYXVsdDogYnJlYWs7XHJcbiAgICB9XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Zvcm1hdCBub3Qgc3VwcG9ydGVkJyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRTYW1wbGVyVHlwZShmb3JtYXQ6IFRIZWlnaHRNYXBGb3JtYXQpIHtcclxuICAgIHN3aXRjaCAoZm9ybWF0KSB7XHJcbiAgICAgICAgY2FzZSAncjMyZic6ICAgcmV0dXJuICdoaWdocCBzYW1wbGVyMkRBcnJheSc7XHJcbiAgICAgICAgY2FzZSAncmdiYSc6ICAgcmV0dXJuICdoaWdocCBzYW1wbGVyMkRBcnJheSc7XHJcbiAgICAgICAgY2FzZSAncmdiYVgyJzogcmV0dXJuICdoaWdocCB1c2FtcGxlcjJEQXJyYXknO1xyXG4gICAgICAgIGNhc2UgJ3JnYmFYNCc6IHJldHVybiAnaGlnaHAgdXNhbXBsZXIyREFycmF5JztcclxuICAgICAgICBkZWZhdWx0OiBicmVhaztcclxuICAgIH1cclxuICAgIHRocm93IG5ldyBFcnJvcignRm9ybWF0IG5vdCBzdXBwb3J0ZWQnKTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJVGVycmFpblNoYWRlck9wdGlvbnMge1xyXG4gICAgd2lkdGg6IG51bWJlcixcclxuICAgIGRlcHRoOiBudW1iZXIsXHJcbiAgICBoZWlnaHRNYXBDaHVua1NpemU6IG51bWJlcixcclxuICAgIGluc3RhbmNpbmc6IGJvb2xlYW4sXHJcbiAgICBoZWlnaHRNYXBGb3JtYXQ6IFRIZWlnaHRNYXBGb3JtYXQsXHJcbiAgICBjaHVua3NTdG9yZT86IHR5cGVvZiBjaHVua3NcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRlcnJhaW5TaGFkZXJDaHVua3Moe1xyXG4gICAgd2lkdGgsXHJcbiAgICBkZXB0aCxcclxuICAgIGhlaWdodE1hcENodW5rU2l6ZSxcclxuICAgIGluc3RhbmNpbmcsXHJcbiAgICBoZWlnaHRNYXBGb3JtYXQsXHJcbiAgICBjaHVua3NTdG9yZSA9IGNodW5rc1xyXG59OiBJVGVycmFpblNoYWRlck9wdGlvbnMpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcclxuXHJcbiAgICBjb25zdCBkZWZpbmVzVlMgPSBjaHVua3NTdG9yZS5kZWZpbmVzVlNcclxuICAgIC5yZXBsYWNlKCclJUhNX05VTV9DSFVOS1NfWCUlJywgU3RyaW5nKCh3aWR0aCAtIDEpIC8gKGhlaWdodE1hcENodW5rU2l6ZSAtIDEpIHwgMCkpXHJcbiAgICAucmVwbGFjZSgnJSVITV9DSFVOS19TSVpFJSUnLCBTdHJpbmcoaGVpZ2h0TWFwQ2h1bmtTaXplIHwgMCkpXHJcbiAgICAucmVwbGFjZSgnJSVUUl9TSVpFX1glJScsIFN0cmluZyh3aWR0aCkpXHJcbiAgICAucmVwbGFjZSgnJSVUUl9TSVpFX1olJScsIFN0cmluZyhkZXB0aCkpXHJcbiAgICAucmVwbGFjZSgnJSVUUl9TSVpFX1hfRiUlJywgd2lkdGgudG9GaXhlZCgxKSlcclxuICAgIC5yZXBsYWNlKCclJVRSX1NJWkVfWl9GJSUnLCBkZXB0aC50b0ZpeGVkKDEpKTtcclxuXHJcbiAgICBjb25zdCBiYXNlQ2xlYXJWUyA9IGNodW5rc1N0b3JlLmJhc2VDbGVhclZTXHJcbiAgICAucmVwbGFjZSgnJSVIRUlHSFRfTUFQX1NBTVBMRVIlJScsIGdldFNhbXBsZXJUeXBlKGhlaWdodE1hcEZvcm1hdCkpO1xyXG5cclxuICAgIGNvbnN0IHRlcnJhaW5IZWlnaHRGYWN0b3JWUyA9IGdldFRlcnJhaW5IZWlnaHRGYWN0b3JWUyhoZWlnaHRNYXBGb3JtYXQsIGNodW5rc1N0b3JlKTtcclxuICAgIGNvbnN0IHN0YXJ0VlMgPSBjaHVua3NTdG9yZS5ub3JtYWxCeUhlaWdodE1hcFZTICsgY2h1bmtzU3RvcmUuc3RhcnRWUztcclxuICAgIGNvbnN0IGJhc2VWUyA9IChpbnN0YW5jaW5nID8gY2h1bmtzU3RvcmUuYmFzZUZvckluc3RhbmNpbmdWUyA6IGNodW5rc1N0b3JlLmJhc2VPcmlnaW5hbFZTKSArIGJhc2VDbGVhclZTO1xyXG4gICAgY29uc3QgdHJhbnNmb3JtVlMgPSBkZWZpbmVzVlNcclxuICAgICAgICArIChpbnN0YW5jaW5nID8gY2h1bmtzU3RvcmUuY3VycmVudFRlcnJhaW5YWkZvckluc3RhbmNpbmdDaHVua1ZTIDogY2h1bmtzU3RvcmUuY3VycmVudFRlcnJhaW5YWkNodW5rVlMpXHJcbiAgICAgICAgKyB0ZXJyYWluSGVpZ2h0RmFjdG9yVlNcclxuICAgICAgICArIGNodW5rc1N0b3JlLnRlcnJhaW5Db29yZHNDaHVua1ZTXHJcbiAgICAgICAgKyBjaHVua3NTdG9yZS50ZXJyYWluQ2h1bmtVVlZTXHJcbiAgICAgICAgKyBjaHVua3NTdG9yZS50ZXJyYWluSGVpZ2h0RmFjdG9yQ2h1bmtWU1xyXG4gICAgICAgICsgY2h1bmtzU3RvcmUudGVycmFpbkhlaWdodENodW5rVlNcclxuICAgICAgICArIGNodW5rc1N0b3JlLnRyYW5zZm9ybVZTO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgLy8gVmVydGV4XHJcbiAgICAgICAgYmFzZVZTLFxyXG4gICAgICAgIHRyYW5zZm9ybVZTLFxyXG4gICAgICAgIHRyYW5zZm9ybURlY2xWUzogY2h1bmtzU3RvcmUudHJhbnNmb3JtRGVjbFZTLFxyXG4gICAgICAgIGluc3RhbmNpbmdWUzogY2h1bmtzU3RvcmUuaW5zdGFuY2luZ1ZTLFxyXG4gICAgICAgIC8vdHJhbnNmb3JtSW5zdGFuY2luZ1ZTOiBjaHVua3MudHJhbnNmb3JtSW5zdGFuY2luZ1ZTLFxyXG4gICAgICAgIC8vbm9ybWFsQ29yZVZTOiBjaHVua3Mubm9ybWFsQ29yZVZTLFxyXG4gICAgICAgIG5vcm1hbFZTOiBjaHVua3NTdG9yZS5ub3JtYWxWUyxcclxuICAgICAgICB1djBWUzogY2h1bmtzU3RvcmUudXYwVlMsXHJcbiAgICAgICAgc3RhcnRWUzogc3RhcnRWUyxcclxuXHJcbiAgICAgICAgLy8gRnJhZ21lbnRcclxuICAgICAgICBkaWZmdXNlUFM6IGNodW5rc1N0b3JlLmRpZmZ1c2VQUyxcclxuICAgIH07XHJcbn0iLCJpbXBvcnQgeyBnZXRTYW1wbGVyVHlwZSwgZ2V0VGVycmFpbkhlaWdodEZhY3RvclZTLCBoZWlnaHRNYXBGYWN0b3JzQ2h1bmtzLCB0ZXJyYWluSGVpZ2h0TWFwUGFyYW1OYW1lLCB0ZXJyYWluTWF4SGVpZ2h0UGFyYW1OYW1lLCB0ZXJyYWluTWluSGVpZ2h0UGFyYW1OYW1lIH0gZnJvbSBcIi4uL1RlcnJhaW5IZWxwZXJzL1RlcnJhaW5QYXRjaGVzU2hhZGVyQ2h1bmtzLm1qc1wiO1xyXG5pbXBvcnQgeyBUSGVpZ2h0TWFwRm9ybWF0IH0gZnJvbSBcIi4uL1RlcnJhaW5TeXN0ZW0vQWJzSGVpZ2h0TWFwLm1qc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IHZpbmRleEF0dHJOYW1lID0gXCJ2ZXJ0ZXhfcG9zaXRpb25cIjtcclxuZXhwb3J0IGNvbnN0IG9mZnNldEF0dHJOYW1lID0gXCJ2ZXJ0ZXhfb2Zmc2V0XCI7XHJcbmV4cG9ydCBjb25zdCBzaGFwZUF0dHJOYW1lICA9IFwidmVydGV4X3NoYXBlXCI7XHJcblxyXG5leHBvcnQgY29uc3QgdGltZVBhcmFtTmFtZSAgICAgICAgICA9IFwidVRpbWVcIjtcclxuZXhwb3J0IGNvbnN0IG9mZnNldFhaUGFyYW1OYW1lICAgICAgPSBcInVPZmZzZXRYWlwiO1xyXG5leHBvcnQgY29uc3Qgb2Zmc2V0MlhaUGFyYW1OYW1lICAgICA9IFwidU9mZnNldDJYWlwiO1xyXG5leHBvcnQgY29uc3QgZHJhd1Bvc1BhcmFtTmFtZSAgICAgICA9IFwidURyYXdQb3NpdGlvblwiO1xyXG5leHBvcnQgY29uc3Qgd2luZEludGVuc2l0eVBhcmFtTmFtZSA9IFwidVdpbmRJbnRlbnNpdHlcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBpbnN0YW5jaW5nVlMgPSBgYDtcclxuZXhwb3J0IGNvbnN0IHRyYW5zZm9ybUluc3RhbmNpbmdWUyA9IGBgO1xyXG5leHBvcnQgY29uc3QgdHJhbnNmb3JtRGVjbFZTID0gYGA7XHJcblxyXG5leHBvcnQgY29uc3QgZGVmaW5lc1ZTID0gLyoqIEB0eXBlIGdsc2wgKi9cclxuYFxyXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xyXG5cclxuICAgICNkZWZpbmUgUEkgMy4xNDE1OTI2NTRcclxuXHJcbiAgICAjZGVmaW5lIEhNX05VTV9DSFVOS1NfWCAoJSVITV9OVU1fQ0hVTktTX1glJSlcclxuICAgICNkZWZpbmUgSE1fQ0hVTktfU0laRSAgICglJUhNX0NIVU5LX1NJWkUlJSlcclxuICAgICNkZWZpbmUgSE1fQ0hVTktfU0laRV9GIChmbG9hdChITV9DSFVOS19TSVpFKSlcclxuICAgICNkZWZpbmUgVFJfU0laRSAgICAgICAgIChpdmVjMiglJVRSX1NJWkVfWCUlLCAlJVRSX1NJWkVfWiUlKSlcclxuICAgICNkZWZpbmUgVFJfU0laRV9GICAgICAgICh2ZWMyKCUlVFJfU0laRV9YX0YlJSwgJSVUUl9TSVpFX1pfRiUlKSlcclxuICAgICNkZWZpbmUgVFJfU0laRV9CT1VORF9GIChUUl9TSVpFX0YgLSAyLjApICAgICAgXHJcbiAgICAjZGVmaW5lIFRSX1NJWkVfSF9GICAgICAoVFJfU0laRV9GIC8gMi4wKVxyXG4gICAgI2RlZmluZSBUUl9TSVpFX0hfTl9GICAgKC1UUl9TSVpFX0hfRilcclxuXHJcbiAgICAjZGVmaW5lIFBBVENIX1NJWkUgICAgICAgICAoJSVQQVRDSF9TSVpFJSUpXHJcbiAgICAjZGVmaW5lIEhBTEZfUEFUQ0hfU0laRSAgICAoUEFUQ0hfU0laRSAvIDIuMClcclxuXHJcbiAgICAjZGVmaW5lIEJMQURFX0hFSUdIVF9UQUxMICAoJSVCTEFERV9IRUlHSFRfVEFMTCUlKSAvLyBoZWlnaHQgb2YgYSB0YWxsIGJsYWRlXHJcblxyXG4gICAgI2RlZmluZSBUUkFOU0lUSU9OX0xPVyAgICAgKCUlVFJBTlNJVElPTl9MT1clJSkgICAvLyBlbGV2YXRpb24gb2YgYmVhY2gtZ3Jhc3MgdHJhbnNpdGlvbiAoc3RhcnQpXHJcbiAgICAjZGVmaW5lIFRSQU5TSVRJT05fSElHSCAgICAoJSVUUkFOU0lUSU9OX0hJR0glJSkgIC8vIChlbmQpXHJcbiAgICAjZGVmaW5lIFRSQU5TSVRJT05fTk9JU0UgICAoMC4wNikgICAgICAgICAgICAgICAgIC8vIHRyYW5zaXRpb24gbm9pc2Ugc2NhbGVcclxuICAgICNkZWZpbmUgQ0lSQ0xFX1JBRElVUyAgICAgIChQQVRDSF9TSVpFICogMi45KVxyXG4gICAgI2RlZmluZSBNQVhfWklOSVRfRElTVEFOQ0UgKDMwMC4wKVxyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IGRlZmluZXNCbGFkZVZTID0gLyoqIEB0eXBlIGdsc2wgKi9cclxuYFxyXG4gICAgI2RlZmluZSBMT0QwX0JMQURFX1NFR1MgICAgICAgICglJUxPRDBfQkxBREVfU0VHUyUlKSAvLyAjIG9mIGJsYWRlIHNlZ21lbnRzIGxvZCAwXHJcbiAgICAjZGVmaW5lIExPRDFfQkxBREVfU0VHUyAgICAgICAgKCUlTE9EMV9CTEFERV9TRUdTJSUpIC8vICMgb2YgYmxhZGUgc2VnbWVudHMgbG9kIDFcclxuICAgICNkZWZpbmUgTE9EMl9CTEFERV9TRUdTICAgICAgICAoJSVMT0QyX0JMQURFX1NFR1MlJSkgLy8gIyBvZiBibGFkZSBzZWdtZW50cyBsb2QgMlxyXG5cclxuICAgICNkZWZpbmUgTE9EMF9CTEFERV9ESVZTICAgICAgICAoTE9EMF9CTEFERV9TRUdTICsgMS4wKSAgLy8gIyBvZiBkaXZpc2lvbnNcclxuICAgICNkZWZpbmUgTE9EMF9CTEFERV9WRVJUUyAgICAgICAoTE9EMF9CTEFERV9ESVZTICogMi4wKSAgLy8gIyBvZiB2ZXJ0aWNlcyAocGVyIHNpZGUsIHNvIDEvMiB0b3RhbClcclxuICAgICNkZWZpbmUgTE9EMF9CTEFERV9WRVJUU19DT1VOVCAoTE9EMF9CTEFERV9WRVJUUyAqIDIuMCkgLy8gIyBvZiB2ZXJ0aWNlc1xyXG5cclxuICAgICNkZWZpbmUgTE9EMV9CTEFERV9ESVZTICAgICAgICAoTE9EMV9CTEFERV9TRUdTICsgMS4wKSAgLy8gIyBvZiBkaXZpc2lvbnNcclxuICAgICNkZWZpbmUgTE9EMV9CTEFERV9WRVJUUyAgICAgICAoTE9EMV9CTEFERV9ESVZTICogMi4wKSAgLy8gIyBvZiB2ZXJ0aWNlcyAocGVyIHNpZGUsIHNvIDEvMiB0b3RhbClcclxuICAgICNkZWZpbmUgTE9EMV9CTEFERV9WRVJUU19DT1VOVCAoTE9EMV9CTEFERV9WRVJUUyAqIDIuMCkgLy8gIyBvZiB2ZXJ0aWNlc1xyXG5cclxuICAgICNkZWZpbmUgTE9EMl9CTEFERV9ESVZTICAgICAgICAoTE9EMl9CTEFERV9TRUdTICsgMS4wKSAgLy8gIyBvZiBkaXZpc2lvbnNcclxuICAgICNkZWZpbmUgTE9EMl9CTEFERV9WRVJUUyAgICAgICAoTE9EMl9CTEFERV9ESVZTICogMi4wKSAgLy8gIyBvZiB2ZXJ0aWNlcyAocGVyIHNpZGUsIHNvIDEvMiB0b3RhbClcclxuICAgICNkZWZpbmUgTE9EMl9CTEFERV9WRVJUU19DT1VOVCAoTE9EMl9CTEFERV9WRVJUUyAqIDIuMCkgLy8gIyBvZiB2ZXJ0aWNlc1xyXG4gICAgXHJcbiAgICAjZGVmaW5lIExPRDJfQkxBREVfVkVSVFNfQUxMX0NPVU5UIChMT0QyX0JMQURFX1ZFUlRTX0NPVU5UICogMTYuMCkgLy8gIyBvZiB2ZXJ0aWNlcyBhbGwgZnJhZ21lbnRzXHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3Qgbm9ybWFsQ29yZVZTID0gLyoqIEB0eXBlIGdsc2wgKi9cclxuYFxyXG4gICAgdmVjMyBnZXRMb2NhbE5vcm1hbCh2ZWMzIHZlcnRleE5vcm1hbCkge1xyXG4gICAgICAgIHJldHVybiBkTG9jYWxOb3JtYWw7XHJcbiAgICB9XHJcblxyXG4gICAgbWF0MyBnZXROb3JtYWxNYXRyaXgobWF0NCBtb2RlbE1hdHJpeCkge1xyXG4gICAgICAgIHJldHVybiBtYXRyaXhfbm9ybWFsO1xyXG4gICAgfVxyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IHRyYW5zZm9ybVZTID0gLyoqIEB0eXBlIGdsc2wgKi9cclxuYFxyXG4gICAgdmVjMyBnZXRXb3JsZFBvc2l0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBkUG9zaXRpb25XO1xyXG4gICAgfVxyXG5cclxuICAgIG1hdDQgZ2V0TW9kZWxNYXRyaXgoKSB7XHJcbiAgICAgICAgcmV0dXJuIG1hdHJpeF9tb2RlbDtcclxuICAgIH1cclxuXHJcbiAgICB2ZWM0IGdldFBvc2l0aW9uKCkge1xyXG5cclxuICAgICAgICBkTW9kZWxNYXRyaXggPSBnZXRNb2RlbE1hdHJpeCgpO1xyXG5cclxuICAgICAgICB2ZWM0IHBvc1cgICAgICA9IGRNb2RlbE1hdHJpeCAqIHZlYzQoZExvY2FsUG9zaXRpb24sIDEuMCk7XHJcbiAgICAgICAgdmVjNCBzY3JlZW5Qb3MgPSBtYXRyaXhfdmlld1Byb2plY3Rpb24gKiBwb3NXO1xyXG5cclxuICAgICAgICBkUG9zaXRpb25XID0gcG9zVy54eXo7XHJcblxyXG4gICAgICAgIHJldHVybiBzY3JlZW5Qb3M7XHJcbiAgICB9XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3Qgbm9ybWFsVlMgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gXHJcbiAgICB2ZWMzIGdldE5vcm1hbCgpIHtcclxuICAgICAgICBkTm9ybWFsTWF0cml4ID0gbWF0cml4X25vcm1hbDtcclxuICAgICAgICByZXR1cm4gbm9ybWFsaXplKGROb3JtYWxNYXRyaXggKiBkTG9jYWxOb3JtYWwpO1xyXG4gICAgfVxyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IHV2MFZTID0gLyoqIEB0eXBlIGdsc2wgKi9cclxuYFxyXG4gICAgdmVjMiBnZXRVdjAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHZlYzIoYmVkZ2UsIGRpICogMi4wKTtcclxuICAgIH1cclxuYDtcclxuXHJcbi8vIGJ1ZyB3aXRoIGdldFV2MFxyXG5leHBvcnQgY29uc3Qgc3RhcnRVdjBWUyA9IC8qKiBAdHlwZSBnbHNsICovXHJcbmAgICAgXHJcbiAgICB2ZWMyIGdldFV2MCgpIHtcclxuICAgICAgICByZXR1cm4gdmVjMihiZWRnZSwgZGkgKiAyLjApO1xyXG4gICAgfVxyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IGJhc2VWUyA9IC8qKiBAdHlwZSBnbHNsICovXHJcbmBcclxuICAgIHVuaWZvcm0gbWF0NCBtYXRyaXhfdmlld1Byb2plY3Rpb247XHJcbiAgICB1bmlmb3JtIG1hdDQgbWF0cml4X21vZGVsO1xyXG4gICAgdW5pZm9ybSBtYXQzIG1hdHJpeF9ub3JtYWw7XHJcbiAgICBcclxuICAgIHVuaWZvcm0gaGlnaHAgdXNhbXBsZXIyRCB1RGF0YU1hcDtcclxuICAgIHVuaWZvcm0gJSVIRUlHSFRfTUFQX1NBTVBMRVIlJSAke3RlcnJhaW5IZWlnaHRNYXBQYXJhbU5hbWV9O1xyXG5cclxuICAgIHVuaWZvcm0gZmxvYXQgJHt0ZXJyYWluTWluSGVpZ2h0UGFyYW1OYW1lfTtcclxuICAgIHVuaWZvcm0gZmxvYXQgJHt0ZXJyYWluTWF4SGVpZ2h0UGFyYW1OYW1lfTtcclxuXHJcbiAgICB1bmlmb3JtIHZlYzMgICR7ZHJhd1Bvc1BhcmFtTmFtZX07ICAgICAgIC8vIGNlbnRyZSBvZiB3aGVyZSB3ZSB3YW50IHRvIGRyYXdcclxuICAgIHVuaWZvcm0gZmxvYXQgJHt0aW1lUGFyYW1OYW1lfTsgICAgICAgICAgLy8gdXNlZCB0byBhbmltYXRlIGJsYWRlc1xyXG4gICAgdW5pZm9ybSBmbG9hdCAke3dpbmRJbnRlbnNpdHlQYXJhbU5hbWV9O1xyXG5cclxuICAgIHVuaWZvcm0gdmVjMiAke29mZnNldFhaUGFyYW1OYW1lfVs4XTsgICAgLy8gY2VudGVyIG9mZnNldCBmcm9tIGRyYXcgcG9zIGxvZCAxXHJcbiAgICB1bmlmb3JtIHZlYzIgJHtvZmZzZXQyWFpQYXJhbU5hbWV9WzE2XTsgIC8vIGNlbnRlciBvZmZzZXQgZnJvbSBkcmF3IHBvcyBsb2QgMlxyXG5cclxuICAgIGF0dHJpYnV0ZSBmbG9hdCAke3ZpbmRleEF0dHJOYW1lfTtcclxuICAgIGF0dHJpYnV0ZSB2ZWM0ICR7b2Zmc2V0QXR0ck5hbWV9O1xyXG4gICAgYXR0cmlidXRlIHZlYzQgJHtzaGFwZUF0dHJOYW1lfTtcclxuICAgIC8vIG1lZGl1bXBcclxuXHJcbiAgICBmbG9hdCB2aTsgICAgIC8vIHZlcnRleCBpbmRleCBmb3IgdGhpcyBzaWRlIG9mIHRoZSBibGFkZVxyXG4gICAgZmxvYXQgZGk7ICAgICAvLyBkaXYgaW5kZXggKDAgLi4gQkxBREVfRElWUylcclxuICAgIGZsb2F0IGhwY3Q7ICAgLy8gcGVyY2VudCBvZiBoZWlnaHQgb2YgYmxhZGUgdGhpcyB2ZXJ0ZXggaXMgYXRcclxuICAgIGZsb2F0IGJzaWRlOyAgLy8gZnJvbnQvYmFjayBzaWRlIG9mIGJsYWRlXHJcbiAgICBmbG9hdCBiZWRnZTsgIC8vIGxlZnQvcmlnaHQgZWRnZSAoeD0wIG9yIHg9MSlcclxuICAgIHZlYzMgdnBvczsgICAgLy8gVmVydGV4IHBvc2l0aW9uIC0gc3RhcnQgd2l0aCAyRCBzaGFwZSwgbm8gYmVuZCBhcHBsaWVkXHJcblxyXG4gICAgdmVjMiBkUGF0Y2hPZmZzZXRYWjtcclxuICAgIHZlYzMgZExvY2FsTm9ybWFsO1xyXG4gICAgdmVjMyBkTG9jYWxQb3NpdGlvbjtcclxuICAgIHZlYzMgZFBvc2l0aW9uVztcclxuICAgIG1hdDQgZE1vZGVsTWF0cml4O1xyXG4gICAgbWF0MyBkTm9ybWFsTWF0cml4O1xyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IHRlcnJhaW5IZWlnaHRNYXBWUyA9IFxyXG5gXHJcbiAgICB2ZWMyIGNsYW1wVGVycmFpblhaKHZlYzIgeHopIHtcclxuICAgICAgICByZXR1cm4gY2xhbXAoeHosIHZlYzIoMC4wKSwgVFJfU0laRV9GKTtcclxuICAgIH1cclxuXHJcbiAgICBpdmVjMyBnZXRUZXJyYWluQ2h1bmtVVih2ZWMyIG9yaWdYWikge1xyXG5cclxuICAgICAgICB2ZWMyIHh6ID0gY2xhbXBUZXJyYWluWFoob3JpZ1haKTtcclxuICAgICAgICB2ZWMyIGNjID0gZmxvb3IoeHogLyBITV9DSFVOS19TSVpFX0YpO1xyXG5cclxuICAgICAgICBpbnQgbG9jYWxYID0gaW50KHh6WzBdKSAlIEhNX0NIVU5LX1NJWkU7XHJcbiAgICAgICAgaW50IGxvY2FsWiA9IGludCh4elsxXSkgJSBITV9DSFVOS19TSVpFO1xyXG4gICAgICAgIGludCBjaHVua1ggPSBpbnQoY2NbMF0pO1xyXG4gICAgICAgIGludCBjaHVua1ogPSBpbnQoY2NbMV0pO1xyXG4gICAgICAgIGludCBsZXZlbCAgPSBjaHVua1ogKiBITV9OVU1fQ0hVTktTX1ggKyBjaHVua1g7XHJcblxyXG4gICAgICAgIHJldHVybiBpdmVjMyhsb2NhbFgsIGxvY2FsWiwgbGV2ZWwpO1xyXG4gICAgfVxyXG5cclxuICAgIGZsb2F0IGdldFRlcnJhaW5IZWlnaHRGYWN0b3IodmVjMiB4eikge1xyXG4gICAgICAgIGl2ZWMzIHV2ID0gZ2V0VGVycmFpbkNodW5rVVYoeHopO1xyXG4gICAgICAgIHJldHVybiBnZXRUZXJyYWluSGVpZ2h0RmFjdG9yRnJvbVRleHR1cmUodXYpO1xyXG4gICAgfVxyXG5cclxuICAgIGZsb2F0IGdldFRlcnJhaW5IZWlnaHQodmVjMiB4eikge1xyXG4gICAgICAgIHJldHVybiBnZXRUZXJyYWluSGVpZ2h0RmFjdG9yKHh6KSAqICgke3RlcnJhaW5NYXhIZWlnaHRQYXJhbU5hbWV9IC0gJHt0ZXJyYWluTWluSGVpZ2h0UGFyYW1OYW1lfSkgKyAke3RlcnJhaW5NaW5IZWlnaHRQYXJhbU5hbWV9O1xyXG4gICAgfVxyXG5cclxuICAgIGZsb2F0IGdldFRlcnJhaW5IZWlnaHRJbnRlcnBvbGF0ZWQodmVjMiB4eikge1xyXG5cclxuICAgICAgICAvLyBoZXJlIHdlIGNhbiBjYWxjdWxhdGUgbm9ybWFsXHJcblxyXG4gICAgICAgIHZlYzIgZmxvb3JYWiA9IGZsb29yKHh6KTtcclxuXHJcbiAgICAgICAgZmxvYXQgeDB6MCA9IGdldFRlcnJhaW5IZWlnaHQoZmxvb3JYWik7XHJcblxyXG4gICAgICAgIGlmICgoZmxvb3JYWlswXSArIDEuMCA+PSBUUl9TSVpFX0ZbMF0pIHx8XHJcbiAgICAgICAgICAgIChmbG9vclhaWzFdICsgMS4wID49IFRSX1NJWkVfRlsxXSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHgwejA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmbG9hdCB4MXowID0gZ2V0VGVycmFpbkhlaWdodChmbG9vclhaICsgdmVjMigxLjAsIDAuMCkpO1xyXG4gICAgICAgIGZsb2F0IHgwejEgPSBnZXRUZXJyYWluSGVpZ2h0KGZsb29yWFogKyB2ZWMyKDAuMCwgMS4wKSk7XHJcbiAgICAgICAgZmxvYXQgeDF6MSA9IGdldFRlcnJhaW5IZWlnaHQoZmxvb3JYWiArIHZlYzIoMS4wLCAxLjApKTtcclxuXHJcbiAgICAgICAgZmxvYXQgZmFjdG9yWCA9IHh6WzBdIC0gZmxvb3JYWlswXTtcclxuICAgICAgICBmbG9hdCBmYWN0b3JaID0geHpbMV0gLSBmbG9vclhaWzFdO1xyXG5cclxuICAgICAgICBmbG9hdCBpbnRlcnBvbGF0ZWRCb3R0b20gPSAoeDF6MCAtIHgwejApICogZmFjdG9yWCArIHgwejA7XHJcbiAgICAgICAgZmxvYXQgaW50ZXJwb2xhdGVkVG9wICAgID0gKHgxejEgLSB4MHoxKSAqIGZhY3RvclggKyB4MHoxO1xyXG4gICAgICAgIGZsb2F0IGZpbmFsSGVpZ2h0ID0gKGludGVycG9sYXRlZFRvcCAtIGludGVycG9sYXRlZEJvdHRvbSkgKiBmYWN0b3JaICsgaW50ZXJwb2xhdGVkQm90dG9tO1xyXG5cclxuICAgICAgICByZXR1cm4gZmluYWxIZWlnaHQ7XHJcbiAgICB9XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3QgYmxhZGVEZWNvZGVyVlMgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gXHJcbiAgICB2b2lkIGRlY29kZUJsYWRlKCkge1xyXG5cclxuICAgICAgICBmbG9hdCBublZpID0gJHt2aW5kZXhBdHRyTmFtZX0gLSBMT0QyX0JMQURFX1ZFUlRTX0FMTF9DT1VOVDtcclxuXHJcbiAgICAgICAgaWYgKG5uVmkgPCAwLjApIHtcclxuXHJcbiAgICAgICAgICAgIGZsb2F0IGxvZDJuVmkgID0gbW9kKCR7dmluZGV4QXR0ck5hbWV9LCBMT0QyX0JMQURFX1ZFUlRTX0NPVU5UKTtcclxuICAgICAgICAgICAgaW50IHBhdGNoSW5kZXggPSBpbnQoJHt2aW5kZXhBdHRyTmFtZX0gLyBMT0QyX0JMQURFX1ZFUlRTX0NPVU5UKTtcclxuXHJcbiAgICAgICAgICAgIHZpICAgID0gbW9kKGxvZDJuVmksIExPRDJfQkxBREVfVkVSVFMpO1xyXG4gICAgICAgICAgICBkaSAgICA9IGZsb29yKHZpIC8gMi4wKTtcclxuICAgICAgICAgICAgaHBjdCAgPSBkaSAvIExPRDJfQkxBREVfU0VHUztcclxuICAgICAgICAgICAgYnNpZGUgPSBmbG9vcihsb2QyblZpIC8gTE9EMl9CTEFERV9WRVJUUyk7XHJcblxyXG4gICAgICAgICAgICBkUGF0Y2hPZmZzZXRYWiA9ICR7b2Zmc2V0MlhaUGFyYW1OYW1lfVtwYXRjaEluZGV4XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobm5WaSA8IExPRDBfQkxBREVfVkVSVFNfQ09VTlQpIHtcclxuXHJcbiAgICAgICAgICAgIHZpICAgID0gbW9kKG5uVmksIExPRDBfQkxBREVfVkVSVFMpO1xyXG4gICAgICAgICAgICBkaSAgICA9IGZsb29yKHZpIC8gMi4wKTtcclxuICAgICAgICAgICAgaHBjdCAgPSBkaSAvIExPRDBfQkxBREVfU0VHUztcclxuICAgICAgICAgICAgYnNpZGUgPSBmbG9vcihublZpIC8gTE9EMF9CTEFERV9WRVJUUyk7XHJcblxyXG4gICAgICAgICAgICBkUGF0Y2hPZmZzZXRYWiA9IHZlYzIoMC4wKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBmbG9hdCBsb2Qxbm5WaSA9IG5uVmkgLSBMT0QwX0JMQURFX1ZFUlRTX0NPVU5UO1xyXG4gICAgICAgICAgICBmbG9hdCBsb2QxblZpICA9IG1vZChsb2Qxbm5WaSwgTE9EMV9CTEFERV9WRVJUU19DT1VOVCk7XHJcbiAgICAgICAgICAgIGludCBwYXRjaEluZGV4ID0gaW50KGxvZDFublZpIC8gTE9EMV9CTEFERV9WRVJUU19DT1VOVCk7XHJcblxyXG4gICAgICAgICAgICB2aSAgICA9IG1vZChsb2QxblZpLCBMT0QxX0JMQURFX1ZFUlRTKTtcclxuICAgICAgICAgICAgZGkgICAgPSBmbG9vcih2aSAvIDIuMCk7XHJcbiAgICAgICAgICAgIGhwY3QgID0gZGkgLyBMT0QxX0JMQURFX1NFR1M7XHJcbiAgICAgICAgICAgIGJzaWRlID0gZmxvb3IobG9kMW5WaSAvIExPRDFfQkxBREVfVkVSVFMpO1xyXG5cclxuICAgICAgICAgICAgZFBhdGNoT2Zmc2V0WFogPSAke29mZnNldFhaUGFyYW1OYW1lfVtwYXRjaEluZGV4XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgYmVkZ2UgPSBtb2QodmksIDIuMCk7XHJcbiAgICB9XHJcbmA7XHJcblxyXG4vLyBodHRwczovL2NvbW11bml0eS5raHJvbm9zLm9yZy90L2Rpc2NhcmRpbmctcG9seWdvbnMtaW4tdmVydGV4LXNoYWRlci8xMDM4MzkvOVxyXG5leHBvcnQgY29uc3Qgc3RhcnRWUyA9IC8qKiBAdHlwZSBnbHNsICovXHJcbmBcclxuICAgICR7c3RhcnRVdjBWU31cclxuXHJcbiAgICAvLyBSb3RhdGUgYnkgYW4gYW5nbGVcclxuICAgIHZlYzIgcm90YXRlKGZsb2F0IHgsIGZsb2F0IHksIGZsb2F0IHIpIHtcclxuICAgICAgICBmbG9hdCBjID0gY29zKHIpO1xyXG4gICAgICAgIGZsb2F0IHMgPSBzaW4ocik7XHJcbiAgICAgICAgcmV0dXJuIHZlYzIoeCAqIGMgLSB5ICogcywgeCAqIHMgKyB5ICogYyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUm90YXRlIGJ5IGEgdmVjdG9yXHJcbiAgICB2ZWMyIHJvdGF0ZShmbG9hdCB4LCBmbG9hdCB5LCB2ZWMyIHIpIHtcclxuICAgICAgICByZXR1cm4gdmVjMih4ICogci54IC0geSAqIHIueSwgeCAqIHIueSArIHkgKiByLngpO1xyXG4gICAgfVxyXG5cclxuICAgIGZsb2F0IGdldEdyYXNzRmFjdG9yKHZlYzIgb3h6KSB7XHJcbiAgICBcclxuICAgICAgICB2ZWMyIHh6ID0gZmxvb3Iob3h6KTtcclxuXHJcbiAgICAgICAgaWYgKHh6WzBdIDwgMC4wIHx8XHJcbiAgICAgICAgICAgIHh6WzFdIDwgMC4wIHx8XHJcbiAgICAgICAgICAgIHh6WzBdID4gVFJfU0laRV9CT1VORF9GWzBdIHx8XHJcbiAgICAgICAgICAgIHh6WzFdID4gVFJfU0laRV9CT1VORF9GWzFdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwLjA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gMS4wO1xyXG4gICAgfVxyXG5cclxuICAgIHZhcnlpbmcgdmVjMiB2VXZDb29yZDtcclxuICAgIHZhcnlpbmcgdmVjMyB2Q29sb3I7XHJcblxyXG4gICAgdm9pZCBtYWluKHZvaWQpIHtcclxuXHJcbiAgICAgICAgZGVjb2RlQmxhZGUoKTtcclxuXHJcbiAgICAgICAgdmVjNCBvZmZzZXQgPSAke29mZnNldEF0dHJOYW1lfTtcclxuICAgICAgICB2ZWM0IHNoYXBlICA9ICR7c2hhcGVBdHRyTmFtZX07XHJcblxyXG4gICAgICAgIC8vIEJhc2VkIG9uIGNlbnRyZSBvZiB2aWV3IGNvbmUgcG9zaXRpb24sIHdoYXQgZ3JpZCB0aWxlIHNob3VsZFxyXG4gICAgICAgIC8vIHRoaXMgcGllY2Ugb2YgZ3Jhc3MgYmUgZHJhd24gYXQ/XHJcbiAgICAgICAgdmVjMiBxdWFkQ2VudGVyUG9zID0gJHtkcmF3UG9zUGFyYW1OYW1lfS54ejtcclxuICAgICAgICB2ZWMyIGJsYWRlT2Zmc2V0ICAgPSBvZmZzZXQueHk7XHJcbiAgICAgICAgdmVjMiBwYXRjaENlbnRlciAgID0gZmxvb3IoKHF1YWRDZW50ZXJQb3MgLSBibGFkZU9mZnNldCkgLyBQQVRDSF9TSVpFKSAqIFBBVENIX1NJWkUgKyBIQUxGX1BBVENIX1NJWkUgKyBkUGF0Y2hPZmZzZXRYWjtcclxuXHJcbiAgICAgICAgLy8gRmluZCB0aGUgYmxhZGUgbWVzaCB4LHkgcG9zaXRpb25cclxuICAgICAgICB2ZWMyIGJsYWRlUG9zID0gcGF0Y2hDZW50ZXIgKyBibGFkZU9mZnNldDtcclxuXHJcbiAgICAgICAgZmxvYXQgZGlzdGFuY2VGcm9tQmxhZGVUb1F1YWRDZW50ZXIgPSBkaXN0YW5jZShibGFkZVBvcywgcXVhZENlbnRlclBvcyk7XHJcblxyXG4gICAgICAgIC8vIExvY2FsIHF1YWQgY2VudGVyIHBvc2l0aW9uIGluIHRlcnJhaW5cclxuICAgICAgICAvLyBiZWNhdXNlIHRoZSBwb3NpdGlvbnMgYXJlIHNoaWZ0ZWQgYnkgaGFsZiB0aGUgc2l6ZSBvZiB0aGUgdGVycmFpblxyXG4gICAgICAgIHZlYzIgbG9jYWxRdWFkQ2VudGVyUG9zID0gcXVhZENlbnRlclBvcyArIFRSX1NJWkVfSF9GO1xyXG5cclxuICAgICAgICBmbG9hdCBkcmF3UG9zQWx0aXR1ZGUgPSAke2RyYXdQb3NQYXJhbU5hbWV9Lnk7XHJcbiAgICAgICAgZmxvYXQgcXVhZENlbnRlckFsdGl0dWRlID0gZ2V0VGVycmFpbkhlaWdodChsb2NhbFF1YWRDZW50ZXJQb3MpO1xyXG4gICAgICAgIGZsb2F0IGRpc3RhbmNlUXVhZENlbnRlclRvRHJhdyA9IGRpc3RhbmNlKHF1YWRDZW50ZXJBbHRpdHVkZSwgZHJhd1Bvc0FsdGl0dWRlKTtcclxuXHJcbiAgICAgICAgLy8gaWYgKGRpc3RhbmNlUXVhZENlbnRlclRvRHJhdyA+IE1BWF9aSU5JVF9ESVNUQU5DRSkge1xyXG4gICAgICAgIC8vICAgIGdsX1Bvc2l0aW9uID0gdmVjNCgxLjAsIDEuMCwgMS4wLCAwLjApO1xyXG4gICAgICAgIC8vICAgIHJldHVybjtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIGZsb2F0IGRlZ2VuZXJhdGVCeURpc3RhbmNlRnJvbVF1YWRDZW50ZXJUb0RyYXcgID0gc21vb3Roc3RlcCgxLjAsIDAuOCwgZGlzdGFuY2VRdWFkQ2VudGVyVG9EcmF3IC8gTUFYX1pJTklUX0RJU1RBTkNFKTtcclxuICAgICAgICBmbG9hdCBkZWdlbmVyYXRlQnlEaXN0YW5jZUZyb21CbGFkZVRvUXVhZENlbnRlciA9IHNtb290aHN0ZXAoMS4wLCAwLjkyLCBkaXN0YW5jZUZyb21CbGFkZVRvUXVhZENlbnRlciAvIENJUkNMRV9SQURJVVMpO1xyXG5cclxuICAgICAgICAvLyBWZXJ0ZXggcG9zaXRpb24gLSBzdGFydCB3aXRoIDJEIHNoYXBlLCBubyBiZW5kIGFwcGxpZWRcclxuICAgICAgICB2cG9zID0gdmVjMyhcclxuICAgICAgICAgICAgc2hhcGUueCAqIChiZWRnZSAtIDAuNSkgKiAoMS4wIC0gcG93KGhwY3QsIDMuMCkpLCAvLyB0YXBlciBibGFkZSBlZGdlcyBhcyBhcHByb2FjaCB0aXBcclxuICAgICAgICAgICAgMC4wLCAvLyBmbGF0IHksIHVuYmVudFxyXG4gICAgICAgICAgICBzaGFwZS55ICogaHBjdCAvLyBoZWlnaHQgb2YgdnR4LCB1bmJlbnRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBTdGFydCBjb21wdXRpbmcgYSBub3JtYWwgZm9yIHRoaXMgdmVydGV4XHJcbiAgICAgICAgdmVjMyBub3JtYWwgPSB2ZWMzKDAuMCwgYnNpZGUgKiAtMi4wICsgMS4wLCAwLjApO1xyXG5cclxuICAgICAgICAvLyBBcHBseSBibGFkZSdzIG5hdHVyYWwgY3VydmUgYW1vdW50XHJcbiAgICAgICAgZmxvYXQgY3VydmUgPSBzaGFwZS53O1xyXG5cclxuICAgICAgICAvLyBUaGVuIGFkZCBhbmltYXRlZCBjdXJ2ZSBhbW91bnQgYnkgdGltZSB1c2luZyB0aGlzIGJsYWRlJ3NcclxuICAgICAgICAvLyB1bmlxdWUgcHJvcGVydGllcyB0byByYW5kb21pemUgaXRzIG9zY2lsbGF0aW9uXHJcbiAgICAgICAgY3VydmUgKz0gc2hhcGUudyArIDAuMTI1ICogKHNpbigke3RpbWVQYXJhbU5hbWV9ICogNC4wICsgb2Zmc2V0LncgKiAwLjIgKiBzaGFwZS55ICsgb2Zmc2V0LnggKyBvZmZzZXQueSkpO1xyXG5cclxuICAgICAgICAvLyBwdXQgbGVhbiBhbmQgY3VydmUgdG9nZXRoZXJcclxuICAgICAgICBmbG9hdCByb3QgPSBzaGFwZS56ICsgY3VydmUgKiBocGN0O1xyXG4gICAgICAgIHZlYzIgcm90diA9IHZlYzIoY29zKHJvdCksIHNpbihyb3QpKTtcclxuXHJcbiAgICAgICAgdnBvcy55eiAgID0gcm90YXRlKHZwb3MueSwgdnBvcy56LCByb3R2KTtcclxuICAgICAgICBub3JtYWwueXogPSByb3RhdGUobm9ybWFsLnksIG5vcm1hbC56LCByb3R2KTtcclxuXHJcbiAgICAgICAgLy8gcm90YXRpb24gb2YgdGhpcyBibGFkZSBhcyBhIHZlY3RvclxyXG4gICAgICAgIHJvdHYgPSB2ZWMyKGNvcyhvZmZzZXQudyksIHNpbihvZmZzZXQudykpO1xyXG5cclxuICAgICAgICB2cG9zLnh5ICAgPSByb3RhdGUodnBvcy54LCB2cG9zLnksIHJvdHYpO1xyXG4gICAgICAgIG5vcm1hbC54eSA9IHJvdGF0ZShub3JtYWwueCwgbm9ybWFsLnksIHJvdHYpO1xyXG5cclxuICAgICAgICAvLyBUT0RPXHJcbiAgICAgICAgZmxvYXQgd2luZCA9IDAuNTtcclxuXHJcbiAgICAgICAgd2luZCA9IChjbGFtcCh3aW5kLCAwLjI1LCAxLjApIC0gMC4yNSkgKiAoMS4wIC8gMC43NSk7XHJcbiAgICAgICAgd2luZCA9IHdpbmQgKiB3aW5kICogJHt3aW5kSW50ZW5zaXR5UGFyYW1OYW1lfTtcclxuICAgICAgICB3aW5kICo9IGhwY3Q7IC8vIHNjYWxlIHdpbmQgYnkgaGVpZ2h0IG9mIGJsYWRlXHJcbiAgICAgICAgd2luZCA9IC13aW5kO1xyXG4gICAgICAgIHJvdHYgPSB2ZWMyKGNvcyh3aW5kKSwgc2luKHdpbmQpKTtcclxuXHJcbiAgICAgICAgLy8gV2luZCBibG93cyBpbiBheGlzLWFsaWduZWQgZGlyZWN0aW9uIHRvIG1ha2UgdGhpbmdzIHNpbXBsZXJcclxuICAgICAgICB2cG9zLnl6ICAgPSByb3RhdGUodnBvcy55LCB2cG9zLnosIHJvdHYpO1xyXG4gICAgICAgIG5vcm1hbC55eiA9IHJvdGF0ZShub3JtYWwueSwgbm9ybWFsLnosIHJvdHYpO1xyXG5cclxuICAgICAgICAvLyBncmFzcyB0ZXh0dXJlIGNvb3JkaW5hdGUgZm9yIHRoaXMgdmVydGV4XHJcbiAgICAgICAgdlV2Q29vcmQgPSBnZXRVdjAoKTtcclxuXHJcbiAgICAgICAgLy8gVmVydGV4IGNvbG9yIG11c3QgYmUgYnJpZ2h0ZXIgYmVjYXVzZSBpdCBpcyBtdWx0aXBsaWVkIHdpdGggYmxhZGUgdGV4dHVyZVxyXG4gICAgICAgIC8vIEVhY2ggYmxhZGUgaXMgcmFuZG9tbHkgY29sb3VyaXplZCBhIGJpdCBieSBpdHMgcG9zaXRpb25cclxuICAgICAgICB2Q29sb3IgPSB2ZWMzKGNvcyhvZmZzZXQueCksIHNpbihvZmZzZXQueSksIHNpbihvZmZzZXQueCkpO1xyXG5cclxuICAgICAgICAvLyBMb2NhbCBibGFkZSBwb3NpdGlvbiBpbiB0ZXJyYWluXHJcbiAgICAgICAgLy8gYmVjYXVzZSB0aGUgcG9zaXRpb25zIGFyZSBzaGlmdGVkIGJ5IGhhbGYgdGhlIHNpemUgb2YgdGhlIHRlcnJhaW5cclxuICAgICAgICB2ZWMyIGJsYWRlTG9jYWxQb3MgPSBibGFkZVBvcyArIFRSX1NJWkVfSF9GO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFNhbXBsZSB0aGUgaGVpZ2h0ZmllbGQgZGF0YSB0ZXh0dXJlIHRvIGdldCBhbHRpdHVkZSBmb3IgdGhpcyBibGFkZSBwb3NpdGlvblxyXG4gICAgICAgIGZsb2F0IGJsYWRlQWx0aXR1ZGUgPSBnZXRUZXJyYWluSGVpZ2h0SW50ZXJwb2xhdGVkKGJsYWRlTG9jYWxQb3MpO1xyXG4gICAgICAgIGZsb2F0IGdyYXNzRmFjdG9yICAgPSBnZXRHcmFzc0ZhY3RvcihibGFkZUxvY2FsUG9zKTtcclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIGlmIHdlIHdhbnQgdGhlIGdyYXNzIHRvIGFwcGVhciBvciBub3RcclxuICAgICAgICAvLyBVc2UgdGhlIG5vaXNlIGNoYW5uZWwgdG8gcGVydHVyYiB0aGUgYmxhZGUgYWx0aXR1ZGUgZ3Jhc3Mgc3RhcnRzIGdyb3dpbmcgYXQuXHJcbiAgICAgICAgLy8gZmxvYXQgbm9pc3lBbHRpdHVkZSA9IGdyYXNzRmFjdG9yICogVFJBTlNJVElPTl9OT0lTRSAtIChUUkFOU0lUSU9OX05PSVNFIC8gMi4wKTtcclxuICAgICAgICAvLyBmbG9hdCBkZWdlbmVyYXRlQnlOb2lzZSA9IChjbGFtcChub2lzeUFsdGl0dWRlLCBUUkFOU0lUSU9OX0xPVywgVFJBTlNJVElPTl9ISUdIKSAtIFRSQU5TSVRJT05fTE9XKSAqICgxLjAgLyAoVFJBTlNJVElPTl9ISUdIIC0gVFJBTlNJVElPTl9MT1cpKTtcclxuXHJcbiAgICAgICAgLy8gVHJhbnNpdGlvbiBnZW9tZXRyeSB0b3dhcmQgZGVnZW5lcmF0ZSBhcyB3ZSBhcHByb2FjaCB0ZXJyYWluIGFsdGl0dWRlXHJcbiAgICAgICAgdnBvcyAqPSBncmFzc0ZhY3RvciAqIGRlZ2VuZXJhdGVCeURpc3RhbmNlRnJvbVF1YWRDZW50ZXJUb0RyYXcgKiBkZWdlbmVyYXRlQnlEaXN0YW5jZUZyb21CbGFkZVRvUXVhZENlbnRlcjsgLy8gZGVnZW5lcmF0ZUJ5Tm9pc2VcclxuXHJcbiAgICAgICAgLy8gVHJhbnNsYXRlIHRvIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgdnBvcy54ICs9IGJsYWRlUG9zLng7XHJcbiAgICAgICAgdnBvcy55ICs9IGJsYWRlUG9zLnk7XHJcbiAgICAgICAgdnBvcy56ICs9IGJsYWRlQWx0aXR1ZGU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZExvY2FsUG9zaXRpb24gPSB2cG9zLnh6eTtcclxuICAgICAgICBkTG9jYWxOb3JtYWwgICA9IG5vcm1hbC54enk7XHJcblxyXG4gICAgICAgIGdsX1Bvc2l0aW9uID0gZ2V0UG9zaXRpb24oKTtcclxuYDtcclxuXHJcbmV4cG9ydCBjb25zdCBkaWZmdXNlUFMgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gXHJcbiAgICB1bmlmb3JtIHNhbXBsZXIyRCB1RGlmZnVzZVRleDtcclxuICAgIHVuaWZvcm0gdmVjMyB1RGlmZnVzZUNvbG9yO1xyXG4gICAgdW5pZm9ybSB2ZWMzIHVEaWZmdXNlQ29sb3JSYW5kb207XHJcblxyXG4gICAgdmFyeWluZyB2ZWMyIHZVdkNvb3JkO1xyXG4gICAgdmFyeWluZyB2ZWMzIHZDb2xvcjtcclxuXHJcbiAgICB2ZWM0IG1HYW1tYSA9IHZlYzQoMi4yKTtcclxuXHJcbiAgICB2b2lkIGdldEFsYmVkbygpIHtcclxuXHJcbiAgICAgICAgdmVjMyB0ZXggPSBwb3codGV4dHVyZTJEKHVEaWZmdXNlVGV4LCB2VXZDb29yZCksIG1HYW1tYSkucmdiO1xyXG5cclxuICAgICAgICBkQWxiZWRvID0gdGV4ICogdURpZmZ1c2VDb2xvciArIHZDb2xvciAqIHVEaWZmdXNlQ29sb3JSYW5kb207XHJcbiAgICB9XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3QgY2h1bmtzID0ge1xyXG5cclxuICAgIC4uLmhlaWdodE1hcEZhY3RvcnNDaHVua3MsXHJcblxyXG4gICAgZGVmaW5lc1ZTLFxyXG4gICAgZGVmaW5lc0JsYWRlVlMsXHJcbiAgICBibGFkZURlY29kZXJWUyxcclxuXHJcbiAgICB0ZXJyYWluSGVpZ2h0TWFwVlMsXHJcblxyXG4gICAgLy8gVmVydGV4XHJcbiAgICBiYXNlVlMsXHJcbiAgICB0cmFuc2Zvcm1WUyxcclxuICAgIHRyYW5zZm9ybURlY2xWUyxcclxuICAgIGluc3RhbmNpbmdWUyxcclxuICAgIHRyYW5zZm9ybUluc3RhbmNpbmdWUyxcclxuICAgIG5vcm1hbENvcmVWUyxcclxuICAgIG5vcm1hbFZTLFxyXG4gICAgdXYwVlMsXHJcbiAgICBzdGFydFZTLFxyXG5cclxuICAgIC8vIEZyYWdtZW50XHJcbiAgICBkaWZmdXNlUFMsXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUdyYXNzU2hhZGVyT3B0aW9ucyB7XHJcbiAgICB3aWR0aDogbnVtYmVyLFxyXG4gICAgZGVwdGg6IG51bWJlcixcclxuICAgIGhlaWdodE1hcENodW5rU2l6ZTogbnVtYmVyLFxyXG4gICAgaGVpZ2h0TWFwRm9ybWF0OiBUSGVpZ2h0TWFwRm9ybWF0LFxyXG4gICAgYmxhZGVNYXhIZWlnaHQ6IG51bWJlcixcclxuICAgIGxvZDBCbGFkZVNlZ3M6IG51bWJlcixcclxuICAgIGxvZDFCbGFkZVNlZ3M6IG51bWJlcixcclxuICAgIGxvZDJCbGFkZVNlZ3M6IG51bWJlcixcclxuICAgIHJhZGl1czogbnVtYmVyLFxyXG4gICAgdHJhbnNpdGlvbkxvdzogbnVtYmVyLFxyXG4gICAgdHJhbnNpdGlvbkhpZ2g6IG51bWJlcixcclxuICAgIGNodW5rc1N0b3JlPzogdHlwZW9mIGNodW5rc1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0R3Jhc3NTaGFkZXJDaHVua3Moe1xyXG4gICAgd2lkdGgsXHJcbiAgICBkZXB0aCxcclxuICAgIGhlaWdodE1hcENodW5rU2l6ZSxcclxuICAgIGhlaWdodE1hcEZvcm1hdCxcclxuICAgIGJsYWRlTWF4SGVpZ2h0LFxyXG4gICAgbG9kMEJsYWRlU2VncyxcclxuICAgIGxvZDFCbGFkZVNlZ3MsXHJcbiAgICBsb2QyQmxhZGVTZWdzLFxyXG4gICAgcmFkaXVzLFxyXG4gICAgdHJhbnNpdGlvbkxvdyxcclxuICAgIHRyYW5zaXRpb25IaWdoLFxyXG4gICAgY2h1bmtzU3RvcmUgPSBjaHVua3NcclxufTogSUdyYXNzU2hhZGVyT3B0aW9ucyk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xyXG5cclxuICAgIGNvbnN0IGRlZmluZXNWUyA9IGNodW5rc1N0b3JlLmRlZmluZXNWU1xyXG4gICAgLnJlcGxhY2UoJyUlSE1fTlVNX0NIVU5LU19YJSUnLCBTdHJpbmcoKHdpZHRoIC0gMSkgLyAoaGVpZ2h0TWFwQ2h1bmtTaXplIC0gMSkgfCAwKSlcclxuICAgIC5yZXBsYWNlKCclJUhNX0NIVU5LX1NJWkUlJScsIFN0cmluZyhoZWlnaHRNYXBDaHVua1NpemUgfCAwKSlcclxuICAgIC5yZXBsYWNlKCclJVRSX1NJWkVfWCUlJywgU3RyaW5nKHdpZHRoKSlcclxuICAgIC5yZXBsYWNlKCclJVRSX1NJWkVfWiUlJywgU3RyaW5nKGRlcHRoKSlcclxuICAgIC5yZXBsYWNlKCclJVRSX1NJWkVfWF9GJSUnLCB3aWR0aC50b0ZpeGVkKDEpKVxyXG4gICAgLnJlcGxhY2UoJyUlVFJfU0laRV9aX0YlJScsIGRlcHRoLnRvRml4ZWQoMSkpXHJcbiAgICAucmVwbGFjZSgnJSVCTEFERV9IRUlHSFRfVEFMTCUlJywgYmxhZGVNYXhIZWlnaHQudG9GaXhlZCgxKSlcclxuICAgIC5yZXBsYWNlKCclJVBBVENIX1NJWkUlJScsIHJhZGl1cy50b0ZpeGVkKDEpKVxyXG4gICAgLnJlcGxhY2UoJyUlVFJBTlNJVElPTl9MT1clJScsIHRyYW5zaXRpb25Mb3cudG9TdHJpbmcoKSlcclxuICAgIC5yZXBsYWNlKCclJVRSQU5TSVRJT05fSElHSCUlJywgdHJhbnNpdGlvbkhpZ2gudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgY29uc3QgZGVmaW5lc0JsYWRlVlMgPSBjaHVua3NTdG9yZS5kZWZpbmVzQmxhZGVWU1xyXG4gICAgLnJlcGxhY2UoJyUlTE9EMF9CTEFERV9TRUdTJSUnLCBsb2QwQmxhZGVTZWdzLnRvRml4ZWQoMSkpXHJcbiAgICAucmVwbGFjZSgnJSVMT0QxX0JMQURFX1NFR1MlJScsIGxvZDFCbGFkZVNlZ3MudG9GaXhlZCgxKSlcclxuICAgIC5yZXBsYWNlKCclJUxPRDJfQkxBREVfU0VHUyUlJywgbG9kMkJsYWRlU2Vncy50b0ZpeGVkKDEpKTtcclxuXHJcbiAgICBjb25zdCBjbGVhckJhc2VWUyA9IGNodW5rc1N0b3JlLmJhc2VWU1xyXG4gICAgLnJlcGxhY2UoJyUlSEVJR0hUX01BUF9TQU1QTEVSJSUnLCBnZXRTYW1wbGVyVHlwZShoZWlnaHRNYXBGb3JtYXQpKTtcclxuICAgIFxyXG4gICAgY29uc3QgYmFzZVZTID0gZGVmaW5lc1ZTICsgZGVmaW5lc0JsYWRlVlMgKyBjbGVhckJhc2VWUztcclxuXHJcbiAgICBjb25zdCB0ZXJyYWluSGVpZ2h0RmFjdG9yVlMgPSBnZXRUZXJyYWluSGVpZ2h0RmFjdG9yVlMoaGVpZ2h0TWFwRm9ybWF0LCBjaHVua3NTdG9yZSk7XHJcbiAgICBjb25zdCBzdGFydFZTID0gdGVycmFpbkhlaWdodEZhY3RvclZTXHJcbiAgICAgICAgKyBjaHVua3NTdG9yZS50ZXJyYWluSGVpZ2h0TWFwVlNcclxuICAgICAgICArIGNodW5rc1N0b3JlLmJsYWRlRGVjb2RlclZTXHJcbiAgICAgICAgKyBjaHVua3NTdG9yZS5zdGFydFZTO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgYmFzZVZTOiBiYXNlVlMsXHJcbiAgICAgICAgdHJhbnNmb3JtVlM6IGNodW5rc1N0b3JlLnRyYW5zZm9ybVZTLFxyXG4gICAgICAgIHRyYW5zZm9ybURlY2xWUzogY2h1bmtzU3RvcmUudHJhbnNmb3JtRGVjbFZTLFxyXG4gICAgICAgIGluc3RhbmNpbmdWUzogY2h1bmtzU3RvcmUuaW5zdGFuY2luZ1ZTLFxyXG4gICAgICAgIC8vdHJhbnNmb3JtSW5zdGFuY2luZ1ZTOiBjaHVua3MudHJhbnNmb3JtSW5zdGFuY2luZ1ZTLFxyXG4gICAgICAgIC8vbm9ybWFsQ29yZVZTOiBjaHVua3Mubm9ybWFsQ29yZVZTLFxyXG4gICAgICAgIG5vcm1hbFZTOiBjaHVua3NTdG9yZS5ub3JtYWxWUyxcclxuICAgICAgICB1djBWUzogY2h1bmtzU3RvcmUudXYwVlMsXHJcbiAgICAgICAgc3RhcnRWUzogc3RhcnRWUyxcclxuXHJcbiAgICAgICAgLy8gRnJhZ21lbnRcclxuICAgICAgICBkaWZmdXNlUFM6IGNodW5rc1N0b3JlLmRpZmZ1c2VQUyxcclxuICAgIH07XHJcbn0iLCIvKlxyXG4gKiBBIHNwZWVkLWltcHJvdmVkIHBlcmxpbiBhbmQgc2ltcGxleCBub2lzZSBhbGdvcml0aG1zIGZvciAyRC5cclxuICpcclxuICogQmFzZWQgb24gZXhhbXBsZSBjb2RlIGJ5IFN0ZWZhbiBHdXN0YXZzb24gKHN0ZWd1QGl0bi5saXUuc2UpLlxyXG4gKiBPcHRpbWlzYXRpb25zIGJ5IFBldGVyIEVhc3RtYW4gKHBlYXN0bWFuQGRyaXp6bGUuc3RhbmZvcmQuZWR1KS5cclxuICogQmV0dGVyIHJhbmsgb3JkZXJpbmcgbWV0aG9kIGJ5IFN0ZWZhbiBHdXN0YXZzb24gaW4gMjAxMi5cclxuICogQ29udmVydGVkIHRvIEphdmFzY3JpcHQgYnkgSm9zZXBoIEdlbnRsZS5cclxuICpcclxuICogVmVyc2lvbiAyMDEyLTAzLTA5XHJcbiAqXHJcbiAqIFRoaXMgY29kZSB3YXMgcGxhY2VkIGluIHRoZSBwdWJsaWMgZG9tYWluIGJ5IGl0cyBvcmlnaW5hbCBhdXRob3IsXHJcbiAqIFN0ZWZhbiBHdXN0YXZzb24uIFlvdSBtYXkgdXNlIGl0IGFzIHlvdSBzZWUgZml0LCBidXRcclxuICogYXR0cmlidXRpb24gaXMgYXBwcmVjaWF0ZWQuXHJcbiAqXHJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqIFR5cGVTY3JpcHRpZmllZCAyMDE2XHJcbiAqL1xyXG5cclxuY2xhc3MgR3JhZCB7XHJcblx0XHJcblx0eDogbnVtYmVyXHJcblx0eTogbnVtYmVyXHJcblx0ejogbnVtYmVyXHJcblxyXG5cdGNvbnN0cnVjdG9yICh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKSB7XHJcblx0XHR0aGlzLnggPSB4XHJcblx0XHR0aGlzLnkgPSB5XHJcblx0XHR0aGlzLnogPSB6XHJcblx0fVxyXG5cclxuXHRkb3QyICh4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG5cdFx0cmV0dXJuIHRoaXMueCAqIHggKyB0aGlzLnkgKiB5XHJcblx0fVxyXG5cclxuXHRkb3QzICh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKSB7XHJcblx0XHRyZXR1cm4gdGhpcy54ICogeCArIHRoaXMueSAqIHkgKyB0aGlzLnogKiB6XHJcblx0fVxyXG59XHJcblxyXG5jb25zdCBGMiA9IDAuNSAqIChNYXRoLnNxcnQoMykgLSAxKVxyXG5jb25zdCBHMiA9ICgzIC0gTWF0aC5zcXJ0KDMpKSAvIDZcclxuXHJcbmNvbnN0IHBlcm0gPSBuZXcgQXJyYXkoNTEyKVxyXG5jb25zdCBncmFkUCA9IG5ldyBBcnJheSg1MTIpXHJcblxyXG5jb25zdCBncmFkMyA9IFtcclxuXHRuZXcgR3JhZCgxLDEsMCksIG5ldyBHcmFkKC0xLDEsMCksIG5ldyBHcmFkKDEsLTEsMCksIG5ldyBHcmFkKC0xLC0xLDApLFxyXG5cdG5ldyBHcmFkKDEsMCwxKSwgbmV3IEdyYWQoLTEsMCwxKSwgbmV3IEdyYWQoMSwwLC0xKSwgbmV3IEdyYWQoLTEsMCwtMSksXHJcblx0bmV3IEdyYWQoMCwxLDEpLCBuZXcgR3JhZCgwLC0xLDEpLCBuZXcgR3JhZCgwLDEsLTEpLCBuZXcgR3JhZCgwLC0xLC0xKVxyXG5dXHJcblxyXG5jb25zdCBwID0gW1xyXG5cdDE1MSwxNjAsMTM3LDkxLDkwLDE1LFxyXG5cdDEzMSwxMywyMDEsOTUsOTYsNTMsMTk0LDIzMyw3LDIyNSwxNDAsMzYsMTAzLDMwLDY5LDE0Miw4LDk5LDM3LDI0MCwyMSwxMCwyMyxcclxuXHQxOTAsIDYsMTQ4LDI0NywxMjAsMjM0LDc1LDAsMjYsMTk3LDYyLDk0LDI1MiwyMTksMjAzLDExNywzNSwxMSwzMiw1NywxNzcsMzMsXHJcblx0ODgsMjM3LDE0OSw1Niw4NywxNzQsMjAsMTI1LDEzNiwxNzEsMTY4LCA2OCwxNzUsNzQsMTY1LDcxLDEzNCwxMzksNDgsMjcsMTY2LFxyXG5cdDc3LDE0NiwxNTgsMjMxLDgzLDExMSwyMjksMTIyLDYwLDIxMSwxMzMsMjMwLDIyMCwxMDUsOTIsNDEsNTUsNDYsMjQ1LDQwLDI0NCxcclxuXHQxMDIsMTQzLDU0LCA2NSwyNSw2MywxNjEsIDEsMjE2LDgwLDczLDIwOSw3NiwxMzIsMTg3LDIwOCwgODksMTgsMTY5LDIwMCwxOTYsXHJcblx0MTM1LDEzMCwxMTYsMTg4LDE1OSw4NiwxNjQsMTAwLDEwOSwxOTgsMTczLDE4NiwgMyw2NCw1MiwyMTcsMjI2LDI1MCwxMjQsMTIzLFxyXG5cdDUsMjAyLDM4LDE0NywxMTgsMTI2LDI1NSw4Miw4NSwyMTIsMjA3LDIwNiw1OSwyMjcsNDcsMTYsNTgsMTcsMTgyLDE4OSwyOCw0MixcclxuXHQyMjMsMTgzLDE3MCwyMTMsMTE5LDI0OCwxNTIsIDIsNDQsMTU0LDE2MywgNzAsMjIxLDE1MywxMDEsMTU1LDE2NywgNDMsMTcyLDksXHJcblx0MTI5LDIyLDM5LDI1MywgMTksOTgsMTA4LDExMCw3OSwxMTMsMjI0LDIzMiwxNzgsMTg1LCAxMTIsMTA0LDIxOCwyNDYsOTcsMjI4LFxyXG5cdDI1MSwzNCwyNDIsMTkzLDIzOCwyMTAsMTQ0LDEyLDE5MSwxNzksMTYyLDI0MSwgODEsNTEsMTQ1LDIzNSwyNDksMTQsMjM5LDEwNyxcclxuXHQ0OSwxOTIsMjE0LCAzMSwxODEsMTk5LDEwNiwxNTcsMTg0LCA4NCwyMDQsMTc2LDExNSwxMjEsNTAsNDUsMTI3LCA0LDE1MCwyNTQsXHJcblx0MTM4LDIzNiwyMDUsOTMsMjIyLDExNCw2NywyOSwyNCw3MiwyNDMsMTQxLDEyOCwxOTUsNzgsNjYsMjE1LDYxLDE1NiwxODBcclxuXVxyXG5cclxuLy8gVGhpcyBpc24ndCBhIHZlcnkgZ29vZCBzZWVkaW5nIGZ1bmN0aW9uLCBidXQgaXQgd29ya3Mgb2suIEl0IHN1cHBvcnRzIDJeMTZcclxuLy8gZGlmZmVyZW50IHNlZWQgdmFsdWVzLiBXcml0ZSBzb21ldGhpbmcgYmV0dGVyIGlmIHlvdSBuZWVkIG1vcmUgc2VlZHMuXHJcbmZ1bmN0aW9uIHNlZWQgKHNlZWQ6IG51bWJlcikge1xyXG5cdGlmIChzZWVkID4gMCAmJiBzZWVkIDwgMSkge1xyXG5cdFx0Ly8gU2NhbGUgdGhlIHNlZWQgb3V0XHJcblx0XHRzZWVkICo9IDY1NTM2XHJcblx0fVxyXG5cclxuXHRzZWVkID0gTWF0aC5mbG9vcihzZWVkKVxyXG5cdGlmIChzZWVkIDwgMjU2KSB7XHJcblx0XHRzZWVkIHw9IHNlZWQgPDwgOFxyXG5cdH1cclxuXHJcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCAyNTY7IGkrKykge1xyXG5cdFx0bGV0IHY6IG51bWJlclxyXG5cdFx0aWYgKGkgJiAxKSB7XHJcblx0XHRcdHYgPSBwW2ldIF4gKHNlZWQgJiAyNTUpXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR2ID0gcFtpXSBeICgoc2VlZCA+PiA4KSAmIDI1NSlcclxuXHRcdH1cclxuXHJcblx0XHRwZXJtW2ldID0gcGVybVtpICsgMjU2XSA9IHZcclxuXHRcdGdyYWRQW2ldID0gZ3JhZFBbaSArIDI1Nl0gPSBncmFkM1t2ICUgMTJdXHJcblx0fVxyXG59XHJcblxyXG5zZWVkKDApXHJcblxyXG4vLyAyRCBzaW1wbGV4IG5vaXNlXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNpbXBsZXgoeGluOiBudW1iZXIsIHlpbjogbnVtYmVyKSB7XHJcblx0bGV0IG4wOiBudW1iZXIsIG4xOiBudW1iZXIsIG4yOiBudW1iZXIgLy8gTm9pc2UgY29udHJpYnV0aW9ucyBmcm9tIHRoZSB0aHJlZSBjb3JuZXJzXHJcblx0Ly8gU2tldyB0aGUgaW5wdXQgc3BhY2UgdG8gZGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggY2VsbCB3ZSdyZSBpblxyXG5cdGNvbnN0IHMgPSAoeGluICsgeWluKSAqIEYyIC8vIEhhaXJ5IGZhY3RvciBmb3IgMkRcclxuXHRsZXQgaSA9IE1hdGguZmxvb3IoeGluICsgcylcclxuXHRsZXQgaiA9IE1hdGguZmxvb3IoeWluICsgcylcclxuXHRjb25zdCB0ID0gKGkgKyBqKSAqIEcyXHJcblx0Y29uc3QgeDAgPSB4aW4gLSBpICsgdCAvLyBUaGUgeCx5IGRpc3RhbmNlcyBmcm9tIHRoZSBjZWxsIG9yaWdpbiwgdW5za2V3ZWQuXHJcblx0Y29uc3QgeTAgPSB5aW4gLSBqICsgdFxyXG5cdC8vIEZvciB0aGUgMkQgY2FzZSwgdGhlIHNpbXBsZXggc2hhcGUgaXMgYW4gZXF1aWxhdGVyYWwgdHJpYW5nbGUuXHJcblx0Ly8gRGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggd2UgYXJlIGluLlxyXG5cdGxldCBpMTogbnVtYmVyLCBqMTogbnVtYmVyIC8vIE9mZnNldHMgZm9yIHNlY29uZCAobWlkZGxlKSBjb3JuZXIgb2Ygc2ltcGxleCBpbiAoaSxqKSBjb29yZHNcclxuXHRpZiAoeDAgPiB5MCkgeyAvLyBsb3dlciB0cmlhbmdsZSwgWFkgb3JkZXI6ICgwLDApLT4oMSwwKS0+KDEsMSlcclxuXHRcdGkxID0gMVxyXG5cdFx0ajEgPSAwXHJcblx0fSBlbHNlIHsgICAgLy8gdXBwZXIgdHJpYW5nbGUsIFlYIG9yZGVyOiAoMCwwKS0+KDAsMSktPigxLDEpXHJcblx0XHRpMSA9IDBcclxuXHRcdGoxID0gMVxyXG5cdH1cclxuXHQvLyBBIHN0ZXAgb2YgKDEsMCkgaW4gKGksaikgbWVhbnMgYSBzdGVwIG9mICgxLWMsLWMpIGluICh4LHkpLCBhbmRcclxuXHQvLyBhIHN0ZXAgb2YgKDAsMSkgaW4gKGksaikgbWVhbnMgYSBzdGVwIG9mICgtYywxLWMpIGluICh4LHkpLCB3aGVyZVxyXG5cdC8vIGMgPSAoMy1zcXJ0KDMpKS82XHJcblx0Y29uc3QgeDEgPSB4MCAtIGkxICsgRzIgLy8gT2Zmc2V0cyBmb3IgbWlkZGxlIGNvcm5lciBpbiAoeCx5KSB1bnNrZXdlZCBjb29yZHNcclxuXHRjb25zdCB5MSA9IHkwIC0gajEgKyBHMlxyXG5cdGNvbnN0IHgyID0geDAgLSAxICsgMiAqIEcyIC8vIE9mZnNldHMgZm9yIGxhc3QgY29ybmVyIGluICh4LHkpIHVuc2tld2VkIGNvb3Jkc1xyXG5cdGNvbnN0IHkyID0geTAgLSAxICsgMiAqIEcyXHJcblx0Ly8gV29yayBvdXQgdGhlIGhhc2hlZCBncmFkaWVudCBpbmRpY2VzIG9mIHRoZSB0aHJlZSBzaW1wbGV4IGNvcm5lcnNcclxuXHRpICY9IDI1NVxyXG5cdGogJj0gMjU1XHJcblx0Y29uc3QgZ2kwID0gZ3JhZFBbaSArIHBlcm1bal1dXHJcblx0Y29uc3QgZ2kxID0gZ3JhZFBbaSArIGkxICsgcGVybVtqICsgajFdXVxyXG5cdGNvbnN0IGdpMiA9IGdyYWRQW2kgKyAxICsgcGVybVtqICsgMV1dXHJcblx0Ly8gQ2FsY3VsYXRlIHRoZSBjb250cmlidXRpb24gZnJvbSB0aGUgdGhyZWUgY29ybmVyc1xyXG5cdGxldCB0MCA9IDAuNSAtIHgwICogeDAgLSB5MCAqIHkwXHJcblx0aWYgKHQwIDwgMCkge1xyXG5cdFx0bjAgPSAwXHJcblx0fSBlbHNlIHtcclxuXHRcdHQwICo9IHQwXHJcblx0XHRuMCA9IHQwICogdDAgKiBnaTAuZG90Mih4MCwgeTApICAvLyAoeCx5KSBvZiBncmFkMyB1c2VkIGZvciAyRCBncmFkaWVudFxyXG5cdH1cclxuXHRsZXQgdDEgPSAwLjUgLSB4MSAqIHgxIC0geTEgKiB5MVxyXG5cdGlmICh0MSA8IDApIHtcclxuXHRcdG4xID0gMFxyXG5cdH0gZWxzZSB7XHJcblx0XHR0MSAqPSB0MVxyXG5cdFx0bjEgPSB0MSAqIHQxICogZ2kxLmRvdDIoeDEsIHkxKVxyXG5cdH1cclxuXHRsZXQgdDIgPSAwLjUgLSB4MiAqIHgyIC0geTIgKiB5MlxyXG5cdGlmICh0MiA8IDApIHtcclxuXHRcdG4yID0gMFxyXG5cdH0gZWxzZSB7XHJcblx0XHR0MiAqPSB0MlxyXG5cdFx0bjIgPSB0MiAqIHQyICogZ2kyLmRvdDIoeDIsIHkyKVxyXG5cdH1cclxuXHQvLyBBZGQgY29udHJpYnV0aW9ucyBmcm9tIGVhY2ggY29ybmVyIHRvIGdldCB0aGUgZmluYWwgbm9pc2UgdmFsdWUuXHJcblx0Ly8gVGhlIHJlc3VsdCBpcyBzY2FsZWQgdG8gcmV0dXJuIHZhbHVlcyBpbiB0aGUgaW50ZXJ2YWwgWy0xLDFdLlxyXG5cdHJldHVybiA3MCAqIChuMCArIG4xICsgbjIpXHJcbn0iLCJjb25zdCB0bXBWZWMgPSBuZXcgcGMuVmVjMygpO1xuXG5leHBvcnQgZnVuY3Rpb24gZHJhd0RpcmVjdGlvblZlY3Rvcihwb3NpdGlvbjogcGN4LlZlYzMsIGRpcjogcGN4LlZlYzMsIGNvbG9yID0gcGMuQ29sb3IuUkVEKSB7XG5cbiAgICAvLyBEcmF3IHRoZSB2ZWN0b3JcbiAgICBjb25zdCBzdGFydCA9IHBvc2l0aW9uO1xuICAgIGNvbnN0IGVuZCA9IHRtcFZlYy5hZGQyKHBvc2l0aW9uLCBkaXIpO1xuICAgIFxuICAgIHBjLmFwcCEuZHJhd0xpbmUoc3RhcnQsIGVuZCwgY29sb3IsIGZhbHNlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRyYXdQb2ludChcbiAgICB7Y2VudGVyLCByYWRpdXMgPSAwLjEsIG51bVNlZ21lbnRzID0gNCwgY29sb3IgPSBwYy5Db2xvci5SRUQsIGxheWVyLCBkZXB0aFRlc3QgPSBmYWxzZSB9OlxuICAgIHtjZW50ZXI6IHBjeC5WZWMzLCByYWRpdXM/OiBudW1iZXIsIG51bVNlZ21lbnRzPzogbnVtYmVyLCBjb2xvcj86IHBjeC5Db2xvciwgZGVwdGhUZXN0PzogYm9vbGVhbiwgbGF5ZXI/OiBwY3guTGF5ZXJ9XG4pIHtcbiAgICBjb25zdCBibG9jayAgPSA2ICogMztcbiAgICBjb25zdCBwb2ludHMgPSBuZXcgQXJyYXkobnVtU2VnbWVudHMgKiBibG9jayk7XG4gICAgY29uc3Qgc3RlcCA9IDIgKiBNYXRoLlBJIC8gbnVtU2VnbWVudHM7XG5cbiAgICBsZXQgYW5nbGUgPSAwO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1TZWdtZW50czsgaSsrKSB7XG5cbiAgICAgICAgY29uc3Qgc2luMCA9IE1hdGguc2luKGFuZ2xlKTtcbiAgICAgICAgY29uc3QgY29zMCA9IE1hdGguY29zKGFuZ2xlKTtcblxuICAgICAgICBhbmdsZSArPSBzdGVwO1xuXG4gICAgICAgIGNvbnN0IHNpbjEgPSBNYXRoLnNpbihhbmdsZSk7XG4gICAgICAgIGNvbnN0IGNvczEgPSBNYXRoLmNvcyhhbmdsZSk7XG5cbiAgICAgICAgY29uc3QgaiA9IGkgKiBibG9jaztcblxuICAgICAgICBwb2ludHNbaiArIDBdID0gY2VudGVyLnggKyByYWRpdXMgKiBzaW4wO1xuICAgICAgICBwb2ludHNbaiArIDFdID0gY2VudGVyLnk7XG4gICAgICAgIHBvaW50c1tqICsgMl0gPSBjZW50ZXIueiArIHJhZGl1cyAqIGNvczA7XG5cbiAgICAgICAgcG9pbnRzW2ogKyAzXSA9IGNlbnRlci54ICsgcmFkaXVzICogc2luMTtcbiAgICAgICAgcG9pbnRzW2ogKyA0XSA9IGNlbnRlci55O1xuICAgICAgICBwb2ludHNbaiArIDVdID0gY2VudGVyLnogKyByYWRpdXMgKiBjb3MxO1xuXG4gICAgICAgIHBvaW50c1tqICsgNl0gPSBjZW50ZXIueDtcbiAgICAgICAgcG9pbnRzW2ogKyA3XSA9IGNlbnRlci55ICsgcmFkaXVzICogc2luMDtcbiAgICAgICAgcG9pbnRzW2ogKyA4XSA9IGNlbnRlci56ICsgcmFkaXVzICogY29zMDtcblxuICAgICAgICBwb2ludHNbaiArIDldICA9IGNlbnRlci54O1xuICAgICAgICBwb2ludHNbaiArIDEwXSA9IGNlbnRlci55ICsgcmFkaXVzICogc2luMTtcbiAgICAgICAgcG9pbnRzW2ogKyAxMV0gPSBjZW50ZXIueiArIHJhZGl1cyAqIGNvczE7XG5cbiAgICAgICAgcG9pbnRzW2ogKyAxMl0gPSBjZW50ZXIueCArIHJhZGl1cyAqIGNvczA7XG4gICAgICAgIHBvaW50c1tqICsgMTNdID0gY2VudGVyLnkgKyByYWRpdXMgKiBzaW4wO1xuICAgICAgICBwb2ludHNbaiArIDE0XSA9IGNlbnRlci56O1xuXG4gICAgICAgIHBvaW50c1tqICsgMTVdID0gY2VudGVyLnggKyByYWRpdXMgKiBjb3MxO1xuICAgICAgICBwb2ludHNbaiArIDE2XSA9IGNlbnRlci55ICsgcmFkaXVzICogc2luMTtcbiAgICAgICAgcG9pbnRzW2ogKyAxN10gPSBjZW50ZXIuejtcbiAgICB9XG5cbiAgICBwYy5hcHAhLmRyYXdMaW5lQXJyYXlzKHBvaW50cywgY29sb3IsIGRlcHRoVGVzdCwgbGF5ZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJhd0JveChcbiAgICB7bWluLCBtYXgsIGNvbG9yID0gcGMuQ29sb3IuUkVELCBsYXllciwgZGVwdGhUZXN0ID0gZmFsc2V9OlxuICAgIHttaW46IHBjeC5WZWMzLCBtYXg6IHBjeC5WZWMzLCBjb2xvcj86IHBjeC5Db2xvciwgZGVwdGhUZXN0PzogYm9vbGVhbiwgbGF5ZXI/OiBwY3guTGF5ZXJ9XG4pIHtcbiAgICBwYy5hcHA/LmRyYXdXaXJlQWxpZ25lZEJveChtaW4sIG1heCwgY29sb3IsIGRlcHRoVGVzdCwgbGF5ZXIpO1xufSIsImltcG9ydCB7IGZsb2F0LCBpbnQgfSBmcm9tIFwiLi9UeXBlcy5tanNcIjtcblxuLy8gRmFzdCBIYWxmIEZsb2F0IENvbnZlcnNpb25zLCBodHRwOi8vd3d3LmZveC10b29sa2l0Lm9yZy9mdHAvZmFzdGhhbGZmbG9hdGNvbnZlcnNpb24ucGRmXG5cbmNvbnN0IF90YWJsZXMgPSAvKkBfX1BVUkVfXyovIF9nZW5lcmF0ZVRhYmxlcygpO1xuXG5mdW5jdGlvbiBfZ2VuZXJhdGVUYWJsZXMoKSB7XG5cblx0Ly8gZmxvYXQzMiB0byBmbG9hdDE2IGhlbHBlcnNcblxuXHRjb25zdCBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoIDQgKTtcblx0Y29uc3QgZmxvYXRWaWV3ID0gbmV3IEZsb2F0MzJBcnJheSggYnVmZmVyICk7XG5cdGNvbnN0IHVpbnQzMlZpZXcgPSBuZXcgVWludDMyQXJyYXkoIGJ1ZmZlciApO1xuXG5cdGNvbnN0IGJhc2VUYWJsZSA9IG5ldyBVaW50MzJBcnJheSggNTEyICk7XG5cdGNvbnN0IHNoaWZ0VGFibGUgPSBuZXcgVWludDMyQXJyYXkoIDUxMiApO1xuXG5cdGZvciAoIGxldCBpID0gMDsgaSA8IDI1NjsgKysgaSApIHtcblxuXHRcdGNvbnN0IGUgPSBpIC0gMTI3O1xuXG5cdFx0Ly8gdmVyeSBzbWFsbCBudW1iZXIgKDAsIC0wKVxuXG5cdFx0aWYgKCBlIDwgLSAyNyApIHtcblxuXHRcdFx0YmFzZVRhYmxlWyBpIF0gPSAweDAwMDA7XG5cdFx0XHRiYXNlVGFibGVbIGkgfCAweDEwMCBdID0gMHg4MDAwO1xuXHRcdFx0c2hpZnRUYWJsZVsgaSBdID0gMjQ7XG5cdFx0XHRzaGlmdFRhYmxlWyBpIHwgMHgxMDAgXSA9IDI0O1xuXG5cdFx0XHQvLyBzbWFsbCBudW1iZXIgKGRlbm9ybSlcblxuXHRcdH0gZWxzZSBpZiAoIGUgPCAtIDE0ICkge1xuXG5cdFx0XHRiYXNlVGFibGVbIGkgXSA9IDB4MDQwMCA+PiAoIC0gZSAtIDE0ICk7XG5cdFx0XHRiYXNlVGFibGVbIGkgfCAweDEwMCBdID0gKCAweDA0MDAgPj4gKCAtIGUgLSAxNCApICkgfCAweDgwMDA7XG5cdFx0XHRzaGlmdFRhYmxlWyBpIF0gPSAtIGUgLSAxO1xuXHRcdFx0c2hpZnRUYWJsZVsgaSB8IDB4MTAwIF0gPSAtIGUgLSAxO1xuXG5cdFx0XHQvLyBub3JtYWwgbnVtYmVyXG5cblx0XHR9IGVsc2UgaWYgKCBlIDw9IDE1ICkge1xuXG5cdFx0XHRiYXNlVGFibGVbIGkgXSA9ICggZSArIDE1ICkgPDwgMTA7XG5cdFx0XHRiYXNlVGFibGVbIGkgfCAweDEwMCBdID0gKCAoIGUgKyAxNSApIDw8IDEwICkgfCAweDgwMDA7XG5cdFx0XHRzaGlmdFRhYmxlWyBpIF0gPSAxMztcblx0XHRcdHNoaWZ0VGFibGVbIGkgfCAweDEwMCBdID0gMTM7XG5cblx0XHRcdC8vIGxhcmdlIG51bWJlciAoSW5maW5pdHksIC1JbmZpbml0eSlcblxuXHRcdH0gZWxzZSBpZiAoIGUgPCAxMjggKSB7XG5cblx0XHRcdGJhc2VUYWJsZVsgaSBdID0gMHg3YzAwO1xuXHRcdFx0YmFzZVRhYmxlWyBpIHwgMHgxMDAgXSA9IDB4ZmMwMDtcblx0XHRcdHNoaWZ0VGFibGVbIGkgXSA9IDI0O1xuXHRcdFx0c2hpZnRUYWJsZVsgaSB8IDB4MTAwIF0gPSAyNDtcblxuXHRcdFx0Ly8gc3RheSAoTmFOLCBJbmZpbml0eSwgLUluZmluaXR5KVxuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0YmFzZVRhYmxlWyBpIF0gPSAweDdjMDA7XG5cdFx0XHRiYXNlVGFibGVbIGkgfCAweDEwMCBdID0gMHhmYzAwO1xuXHRcdFx0c2hpZnRUYWJsZVsgaSBdID0gMTM7XG5cdFx0XHRzaGlmdFRhYmxlWyBpIHwgMHgxMDAgXSA9IDEzO1xuXG5cdFx0fVxuXG5cdH1cblxuXHQvLyBmbG9hdDE2IHRvIGZsb2F0MzIgaGVscGVyc1xuXG5cdGNvbnN0IG1hbnRpc3NhVGFibGUgPSBuZXcgVWludDMyQXJyYXkoIDIwNDggKTtcblx0Y29uc3QgZXhwb25lbnRUYWJsZSA9IG5ldyBVaW50MzJBcnJheSggNjQgKTtcblx0Y29uc3Qgb2Zmc2V0VGFibGUgPSBuZXcgVWludDMyQXJyYXkoIDY0ICk7XG5cblx0Zm9yICggbGV0IGkgPSAxOyBpIDwgMTAyNDsgKysgaSApIHtcblxuXHRcdGxldCBtID0gaSA8PCAxMzsgLy8gemVybyBwYWQgbWFudGlzc2EgYml0c1xuXHRcdGxldCBlID0gMDsgLy8gemVybyBleHBvbmVudFxuXG5cdFx0Ly8gbm9ybWFsaXplZFxuXHRcdHdoaWxlICggKCBtICYgMHgwMDgwMDAwMCApID09PSAwICkge1xuXG5cdFx0XHRtIDw8PSAxO1xuXHRcdFx0ZSAtPSAweDAwODAwMDAwOyAvLyBkZWNyZW1lbnQgZXhwb25lbnRcblxuXHRcdH1cblxuXHRcdG0gJj0gfiAweDAwODAwMDAwOyAvLyBjbGVhciBsZWFkaW5nIDEgYml0XG5cdFx0ZSArPSAweDM4ODAwMDAwOyAvLyBhZGp1c3QgYmlhc1xuXG5cdFx0bWFudGlzc2FUYWJsZVsgaSBdID0gbSB8IGU7XG5cblx0fVxuXG5cdGZvciAoIGxldCBpID0gMTAyNDsgaSA8IDIwNDg7ICsrIGkgKSB7XG5cblx0XHRtYW50aXNzYVRhYmxlWyBpIF0gPSAweDM4MDAwMDAwICsgKCAoIGkgLSAxMDI0ICkgPDwgMTMgKTtcblxuXHR9XG5cblx0Zm9yICggbGV0IGkgPSAxOyBpIDwgMzE7ICsrIGkgKSB7XG5cblx0XHRleHBvbmVudFRhYmxlWyBpIF0gPSBpIDw8IDIzO1xuXG5cdH1cblxuXHRleHBvbmVudFRhYmxlWyAzMSBdID0gMHg0NzgwMDAwMDtcblx0ZXhwb25lbnRUYWJsZVsgMzIgXSA9IDB4ODAwMDAwMDA7XG5cblx0Zm9yICggbGV0IGkgPSAzMzsgaSA8IDYzOyArKyBpICkge1xuXG5cdFx0ZXhwb25lbnRUYWJsZVsgaSBdID0gMHg4MDAwMDAwMCArICggKCBpIC0gMzIgKSA8PCAyMyApO1xuXG5cdH1cblxuXHRleHBvbmVudFRhYmxlWyA2MyBdID0gMHhjNzgwMDAwMDtcblxuXHRmb3IgKCBsZXQgaSA9IDE7IGkgPCA2NDsgKysgaSApIHtcblxuXHRcdGlmICggaSAhPT0gMzIgKSB7XG5cblx0XHRcdG9mZnNldFRhYmxlWyBpIF0gPSAxMDI0O1xuXG5cdFx0fVxuXG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGZsb2F0VmlldzogZmxvYXRWaWV3LFxuXHRcdHVpbnQzMlZpZXc6IHVpbnQzMlZpZXcsXG5cdFx0YmFzZVRhYmxlOiBiYXNlVGFibGUsXG5cdFx0c2hpZnRUYWJsZTogc2hpZnRUYWJsZSxcblx0XHRtYW50aXNzYVRhYmxlOiBtYW50aXNzYVRhYmxlLFxuXHRcdGV4cG9uZW50VGFibGU6IGV4cG9uZW50VGFibGUsXG5cdFx0b2Zmc2V0VGFibGU6IG9mZnNldFRhYmxlXG5cdH07XG5cbn1cblxuLy8gZmxvYXQzMiB0byBmbG9hdDE2XG5cbmV4cG9ydCBmdW5jdGlvbiB0b0hhbGZGbG9hdCh2YWw6IG51bWJlcikge1xuXG5cdGlmICggTWF0aC5hYnMoIHZhbCApID4gNjU1MDQgKSBjb25zb2xlLndhcm4oICdUSFJFRS5EYXRhVXRpbHMudG9IYWxmRmxvYXQoKTogVmFsdWUgb3V0IG9mIHJhbmdlLicgKTtcblxuXHR2YWwgPSBjbGFtcCggdmFsLCAtIDY1NTA0LCA2NTUwNCApO1xuXG5cdF90YWJsZXMuZmxvYXRWaWV3WyAwIF0gPSB2YWw7XG5cdGNvbnN0IGYgPSBfdGFibGVzLnVpbnQzMlZpZXdbIDAgXTtcblx0Y29uc3QgZSA9ICggZiA+PiAyMyApICYgMHgxZmY7XG5cdHJldHVybiBfdGFibGVzLmJhc2VUYWJsZVsgZSBdICsgKCAoIGYgJiAweDAwN2ZmZmZmICkgPj4gX3RhYmxlcy5zaGlmdFRhYmxlWyBlIF0gKTtcbn1cblxuLy8gZmxvYXQxNiB0byBmbG9hdDMyXG5leHBvcnQgZnVuY3Rpb24gZnJvbUhhbGZGbG9hdCh2YWw6IG51bWJlcikge1xuXHRjb25zdCBtID0gdmFsID4+IDEwO1xuXHRfdGFibGVzLnVpbnQzMlZpZXdbIDAgXSA9IF90YWJsZXMubWFudGlzc2FUYWJsZVsgX3RhYmxlcy5vZmZzZXRUYWJsZVsgbSBdICsgKCB2YWwgJiAweDNmZiApIF0gKyBfdGFibGVzLmV4cG9uZW50VGFibGVbIG0gXTtcblx0cmV0dXJuIF90YWJsZXMuZmxvYXRWaWV3WyAwIF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZXh0KHZhbDogbnVtYmVyLCBtaW5XaWR0aDogbnVtYmVyLCBwcmVmaXg6IHN0cmluZykge1xuXG4gICAgY29uc3Qgc3RyID0gdmFsLnRvU3RyaW5nKCk7XG4gICAgY29uc3Qgc3RyTGVuID0gc3RyLmxlbmd0aDtcbiAgICBjb25zdCBhcHBlbmRDb3VudCA9IG1pbldpZHRoIC0gc3RyTGVuO1xuXG4gICAgbGV0IHJlc3VsdCA9IHN0cjtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXBwZW5kQ291bnQ7IGkrKykge1xuICAgICAgICByZXN1bHQgPSBwcmVmaXggKyByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsYW1wKHZhbHVlOiBudW1iZXIsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikge1xuXHRyZXR1cm4gTWF0aC5tYXgobWluLCBNYXRoLm1pbihtYXgsIHZhbHVlKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByYW5kb21GbG9hdCgpIHtcbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbUZsb2F0UmFuZ2Uoc3RhcnQ6IGZsb2F0LCBlbmQ6IGZsb2F0KSB7XG5cbiAgICBpZiAoZW5kID09IHN0YXJ0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcmFuZG9tIHJhbmdlXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IGRlbHRhID0gZW5kIC0gc3RhcnQ7XG5cbiAgICBjb25zdCByYW5kb21WYWx1ZSA9IHJhbmRvbUZsb2F0KCkgKiBkZWx0YSArIHN0YXJ0O1xuXG4gICAgcmV0dXJuIHJhbmRvbVZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsY05leHRQb3dlck9mVHdvKHg6IGludCk6IGludCB7XG4gICAgXG4gICAgbGV0IHJldCA9IDE7XG5cbiAgICBpZiAoeCA9PSAxKSB7XG4gICAgICAgIHJldHVybiAyO1xuICAgIH1cblxuICAgIHdoaWxlIChyZXQgPCB4KSB7XG4gICAgICAgIHJldCA9IHJldCAqIDI7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbn1cblxuLyoqIEEgcmFuZG9tIG51bWJlciBmcm9tIC0xLjAgdG8gMS4wICovXG5leHBvcnQgZnVuY3Rpb24gbnJhbmQoKSB7XG5cdHJldHVybiBNYXRoLnJhbmRvbSgpICogMi4wIC0gMS4wXG59IiwiaW1wb3J0IHsgSVZlY3RvcjIsIElWZWN0b3IzLCBSZWZPYmplY3QsIGZsb2F0LCBpbnQgfSBmcm9tIFwiLi4vU2hhcmVkL1R5cGVzLm1qc1wiO1xyXG5pbXBvcnQgQWJzSGVpZ2h0TWFwLCB7IElSZWFkb25seUFic0hlaWdodE1hcCB9IGZyb20gXCIuL0Fic0hlaWdodE1hcC5tanNcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVZlcnRleEhlaWdodHNJbmZvIHtcclxuICAgIG1pbkhlaWdodDogZmxvYXQ7XHJcbiAgICBtYXhIZWlnaHQ6IGZsb2F0O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElDb29yZHNSZWFkZXIge1xyXG4gICAgd2lkdGg6IG51bWJlcjtcclxuICAgIGdldFBvc2l0aW9uKGluZGV4OiBpbnQsIGJ1ZjogUmVmT2JqZWN0PElWZWN0b3IzPik6IGJvb2xlYW47XHJcbiAgICBnZXRQb3NpdGlvbldpdGhIZWlnaHRCeUZhY3RvcihpbmRleDogaW50LCBidWY6IFJlZk9iamVjdDxJVmVjdG9yMz4pOiBib29sZWFuO1xyXG4gICAgZ2V0Q29vcmRzKGluZGV4OiBpbnQsIGJ1ZjogUmVmT2JqZWN0PElWZWN0b3IyPik6IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVJlYWRvbmx5Q29vcmRzQnVmZmVyIGV4dGVuZHMgSUNvb3Jkc1JlYWRlciB7XHJcblxyXG4gICAgcmVhZG9ubHkgaGVpZ2h0TWFwOiBJUmVhZG9ubHlBYnNIZWlnaHRNYXA7XHJcbiAgICByZWFkb25seSBwYXRjaFZlcnRleEJ1ZmZlckxlbmd0aDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgcGF0Y2hWZXJ0ZXhCdWZmZXJUeXBlZDogVWludDE2QXJyYXkgfCBVaW50OEFycmF5O1xyXG4gICAgcmVhZG9ubHkgcGF0Y2hWZXJ0ZXhCdWZmZXJEYXRhOiBSZWFkb25seTxBcnJheUJ1ZmZlcj47XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBjb29yZHNWZXJ0ZXhTaXplID0gMjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb29yZHNCdWZmZXIgaW1wbGVtZW50cyBJUmVhZG9ubHlDb29yZHNCdWZmZXIge1xyXG4gICAgXHJcbiAgICBwcml2YXRlIF93aWR0aDogaW50O1xyXG4gICAgcHJpdmF0ZSBfZGVwdGg6IGludDtcclxuICAgIHByaXZhdGUgX3BhdGNoU2l6ZTogaW50O1xyXG4gICAgcHJpdmF0ZSBfZGF0YTogQXJyYXlCdWZmZXI7XHJcbiAgICBwcml2YXRlIF9kYXRhVHlwZWQ6IFVpbnQxNkFycmF5O1xyXG4gICAgcHJpdmF0ZSBfbGVuZ3RoOiBudW1iZXI7XHJcblxyXG4gICAgcmVhZG9ubHkgaGVpZ2h0TWFwOiBBYnNIZWlnaHRNYXA7XHJcblxyXG4gICAgcHVibGljIGdldCBwYXRjaFZlcnRleEJ1ZmZlckxlbmd0aCgpIHsgcmV0dXJuIHRoaXMuX2xlbmd0aDsgfVxyXG4gICAgcHVibGljIGdldCBwYXRjaFZlcnRleEJ1ZmZlckRhdGEoKSAgIHsgcmV0dXJuIHRoaXMuX2RhdGE7IH1cclxuICAgIHB1YmxpYyBnZXQgcGF0Y2hWZXJ0ZXhCdWZmZXJUeXBlZCgpICB7IHJldHVybiB0aGlzLl9kYXRhVHlwZWQ7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHdpZHRoKCkgICAgICAgeyByZXR1cm4gdGhpcy5fd2lkdGg7IH1cclxuICAgIHB1YmxpYyBnZXQgZGVwdGgoKSAgICAgICB7IHJldHVybiB0aGlzLl9kZXB0aDsgfVxyXG4gICAgcHVibGljIGdldCBwYXRjaFNpemUoKSAgIHsgcmV0dXJuIHRoaXMuX3BhdGNoU2l6ZTsgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKGhlaWdodE1hcDogQWJzSGVpZ2h0TWFwLCBwYXRjaFNpemU6IG51bWJlcikge1xyXG5cclxuICAgICAgICB0aGlzLmhlaWdodE1hcCAgPSBoZWlnaHRNYXA7XHJcblxyXG4gICAgICAgIC8vIFdlIGNhbiB1c2UgdWludDggZm9yIHBhdGNoZXMgc21hbGxlciB0aGFuIDI1NSwgYnV0IHdlIG9ubHkgdXNlIDIgYnl0ZXMsXHJcbiAgICAgICAgLy8gZm9yIG9wdGltYWwgcGVyZm9ybWFuY2UgbmVlZCA0IGJ5dGVzIGZvciB0aGUgYnVmZmVyLlxyXG5cclxuICAgICAgICB0aGlzLl9wYXRjaFNpemUgPSBwYXRjaFNpemU7XHJcbiAgICAgICAgdGhpcy5fd2lkdGggPSBoZWlnaHRNYXAud2lkdGg7XHJcbiAgICAgICAgdGhpcy5fZGVwdGggPSBoZWlnaHRNYXAuZGVwdGg7XHJcbiAgICAgICAgdGhpcy5fbGVuZ3RoID0gdGhpcy5fcGF0Y2hTaXplICogdGhpcy5fcGF0Y2hTaXplO1xyXG5cclxuICAgICAgICBjb25zdCBjb29yZHNBcnJMZW5ndGggID0gdGhpcy5fbGVuZ3RoICogY29vcmRzVmVydGV4U2l6ZTtcclxuICAgICAgICBjb25zdCBjb29yZHNCeXRlTGVuZ3RoID0gY29vcmRzQXJyTGVuZ3RoICogVWludDE2QXJyYXkuQllURVNfUEVSX0VMRU1FTlQ7XHJcblxyXG4gICAgICAgIHRoaXMuX2RhdGEgICAgICA9IG5ldyBBcnJheUJ1ZmZlcihjb29yZHNCeXRlTGVuZ3RoKTtcclxuICAgICAgICB0aGlzLl9kYXRhVHlwZWQgPSBuZXcgVWludDE2QXJyYXkodGhpcy5fZGF0YSwgMCwgY29vcmRzQXJyTGVuZ3RoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGluaXQoKSB7XHJcblxyXG4gICAgICAgIGxldCBpbmRleCA9IDA7XHJcblxyXG4gICAgICAgIGZvciAobGV0IHogPSAwOyB6IDwgdGhpcy5fcGF0Y2hTaXplOyB6KyspIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy5fcGF0Y2hTaXplOyB4KyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kYXRhVHlwZWRbaW5kZXgrK10gPSB4O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZGF0YVR5cGVkW2luZGV4KytdID0gejtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldFBvc2l0aW9uKGluZGV4OiBpbnQsIGJ1ZjogUmVmT2JqZWN0PElWZWN0b3IzPikge1xyXG5cclxuICAgICAgICBjb25zdCB4ID0gaW5kZXggJSB0aGlzLl93aWR0aCB8IDA7XHJcbiAgICAgICAgY29uc3QgeiA9IGluZGV4IC8gdGhpcy5fd2lkdGggfCAwO1xyXG5cclxuICAgICAgICBidWYueCA9IHg7XHJcbiAgICAgICAgYnVmLnkgPSB0aGlzLmhlaWdodE1hcC5nZXQoeCwgeik7XHJcbiAgICAgICAgYnVmLnogPSB6O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRQb3NpdGlvbldpdGhIZWlnaHRCeUZhY3RvcihpbmRleDogaW50LCBidWY6IFJlZk9iamVjdDxJVmVjdG9yMz4pIHtcclxuXHJcbiAgICAgICAgY29uc3QgeCA9IGluZGV4ICUgdGhpcy5fd2lkdGggfCAwO1xyXG4gICAgICAgIGNvbnN0IHogPSBpbmRleCAvIHRoaXMuX3dpZHRoIHwgMDtcclxuXHJcbiAgICAgICAgYnVmLnggPSB4O1xyXG4gICAgICAgIGJ1Zi55ID0gdGhpcy5oZWlnaHRNYXAuZ2V0RmFjdG9yKHgsIHopO1xyXG4gICAgICAgIGJ1Zi56ID0gejtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q29vcmRzKGluZGV4OiBudW1iZXIsIGJ1ZjogSVZlY3RvcjMpOiBib29sZWFuIHtcclxuXHJcbiAgICAgICAgY29uc3QgeCA9IGluZGV4ICUgdGhpcy5fd2lkdGggfCAwO1xyXG4gICAgICAgIGNvbnN0IHogPSBpbmRleCAvIHRoaXMuX3dpZHRoIHwgMDtcclxuXHJcbiAgICAgICAgYnVmLnggPSB4O1xyXG4gICAgICAgIGJ1Zi56ID0gejtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ29vcmRzQnVmZmVyOyIsImltcG9ydCB0eXBlIHsgZmxvYXQsIGludCB9IGZyb20gXCIuLi9TaGFyZWQvVHlwZXMubWpzXCI7XG5pbXBvcnQgQWJzSGVpZ2h0TWFwLCB7IElSZWFkb25seUFic0hlaWdodE1hcCwgVEhlaWdodE1hcEZvcm1hdCB9IGZyb20gXCIuL0Fic0hlaWdodE1hcC5tanNcIjtcblxuZXhwb3J0IHR5cGUgIEhlaWdodE1hcEFyclR5cGUgPSBGbG9hdDMyQXJyYXk7XG5leHBvcnQgY29uc3QgSGVpZ2h0TWFwQXJyVHlwZSA9IEZsb2F0MzJBcnJheTtcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRIZWlnaHRWZXJ0ZXhTaXplOiBpbnQgPSAxO1xuXG5leHBvcnQgaW50ZXJmYWNlIElSZWFkb25seUhlaWdodE1hcDxURGF0YSA9IEhlaWdodE1hcEFyclR5cGU+IGV4dGVuZHMgSVJlYWRvbmx5QWJzSGVpZ2h0TWFwIHtcbiAgICByZWFkb25seSBpdGVtU2l6ZTogaW50O1xuICAgIHJlYWRvbmx5IGl0ZW1IZWlnaHRJbmRleE9mZnNldDogaW50O1xuICAgIHJlYWRvbmx5IGRhdGE6IFREYXRhO1xufVxuXG5leHBvcnQgY2xhc3MgSGVpZ2h0TWFwPFREYXRhIGV4dGVuZHMgRmxvYXQzMkFycmF5IHwgVWludDE2QXJyYXkgfCBVaW50OEFycmF5ID0gSGVpZ2h0TWFwQXJyVHlwZT4gZXh0ZW5kcyBBYnNIZWlnaHRNYXAgaW1wbGVtZW50cyBJUmVhZG9ubHlIZWlnaHRNYXA8VERhdGE+IHtcblxuICAgIHByaXZhdGUgX3dpZHRoOiBpbnQgPSAwO1xuICAgIHByaXZhdGUgX2RlcHRoOiBpbnQgPSAwO1xuICAgIHByaXZhdGUgX21pbkhlaWdodDogZmxvYXQgPSAwO1xuICAgIHByaXZhdGUgX21heEhlaWdodDogZmxvYXQgPSAwO1xuICAgIHByaXZhdGUgX2RhdGE6IFREYXRhO1xuICAgIFxuICAgIHByaXZhdGUgX2l0ZW1TaXplOiBpbnQ7XG4gICAgcHJpdmF0ZSBfaXRlbUhlaWdodEluZGV4T2Zmc2V0OiBpbnQ7XG4gICAgXG4gICAgcHVibGljIGdldCBzaXplKCkgIHsgcmV0dXJuIHRoaXMuX3dpZHRoICogdGhpcy5fZGVwdGg7IH1cbiAgICBwdWJsaWMgZ2V0IHdpZHRoKCkgeyByZXR1cm4gdGhpcy5fd2lkdGg7IH1cbiAgICBwdWJsaWMgZ2V0IGRlcHRoKCkgeyByZXR1cm4gdGhpcy5fZGVwdGg7IH1cbiAgICBwdWJsaWMgZ2V0IGRhdGEoKSAgeyByZXR1cm4gdGhpcy5fZGF0YSB9XG4gICAgcHVibGljIGdldCBmb3JtYXQoKTogVEhlaWdodE1hcEZvcm1hdCB7IHJldHVybiAncmdiYSc7IH1cblxuICAgIHB1YmxpYyBnZXQgaXRlbVNpemUoKSAgICAgICAgICAgICAgeyByZXR1cm4gdGhpcy5faXRlbVNpemU7IH1cbiAgICBwdWJsaWMgZ2V0IGl0ZW1IZWlnaHRJbmRleE9mZnNldCgpIHsgcmV0dXJuIHRoaXMuX2l0ZW1IZWlnaHRJbmRleE9mZnNldDsgfVxuXG4gICAgcHVibGljIGdldCBtaW5IZWlnaHQoKSAgeyByZXR1cm4gdGhpcy5fbWluSGVpZ2h0OyB9XG4gICAgcHVibGljIGdldCBtYXhIZWlnaHQoKSAgeyByZXR1cm4gdGhpcy5fbWF4SGVpZ2h0OyB9XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3Iod2lkdGg6IGludCwgZGVwdGg6IGludCwgbWluSGVpZ2h0OiBmbG9hdCwgbWF4SGVpZ2h0OiBmbG9hdCk7XG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHdpZHRoOiBpbnQsIGRlcHRoOiBpbnQsIG1pbkhlaWdodDogZmxvYXQsIG1heEhlaWdodDogZmxvYXQsIGJ1ZmZlcjogVERhdGEsIGl0ZW1TaXplPzogaW50LCBpdGVtSGVpZ2h0SW5kZXhPZmZzZXQ/OiBpbnQpO1xuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvcih3aWR0aDogaW50LCBkZXB0aDogaW50LCBtaW5IZWlnaHQ6IGZsb2F0LCBtYXhIZWlnaHQ6IGZsb2F0LCBidWZmZXI/OiBURGF0YSB8IHVuZGVmaW5lZCwgaXRlbVNpemU6IGludCA9IGRlZmF1bHRIZWlnaHRWZXJ0ZXhTaXplLCBpdGVtSGVpZ2h0SW5kZXhPZmZzZXQ6IGludCA9IDApIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5faW5pdCh3aWR0aCwgZGVwdGgsIG1pbkhlaWdodCwgbWF4SGVpZ2h0LCBidWZmZXIhLCBpdGVtU2l6ZSwgaXRlbUhlaWdodEluZGV4T2Zmc2V0KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgX2luaXQod2lkdGg6IGludCwgZGVwdGg6IGludCwgbWluSGVpZ2h0OiBmbG9hdCwgbWF4SGVpZ2h0OiBmbG9hdCk6IHZvaWQ7XG4gICAgcHJvdGVjdGVkIF9pbml0KHdpZHRoOiBpbnQsIGRlcHRoOiBpbnQsIG1pbkhlaWdodDogZmxvYXQsIG1heEhlaWdodDogZmxvYXQsIGJ1ZmZlcjogVERhdGEsIGl0ZW1TaXplPzogaW50LCBpdGVtSGVpZ2h0SW5kZXhPZmZzZXQ/OiBpbnQpOiB2b2lkO1xuICAgIHByb3RlY3RlZCBfaW5pdCh3aWR0aDogaW50LCBkZXB0aDogaW50LCBtaW5IZWlnaHQ6IGZsb2F0LCBtYXhIZWlnaHQ6IGZsb2F0LCBidWZmZXI/OiBURGF0YSB8IHVuZGVmaW5lZCwgaXRlbVNpemU6IGludCA9IGRlZmF1bHRIZWlnaHRWZXJ0ZXhTaXplLCBpdGVtSGVpZ2h0SW5kZXhPZmZzZXQ6IGludCA9IDApOiB2b2lkIHtcblxuICAgICAgICB0aGlzLl93aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLl9kZXB0aCA9IGRlcHRoO1xuICAgICAgICB0aGlzLl9tYXhIZWlnaHQgPSBtaW5IZWlnaHQ7XG4gICAgICAgIHRoaXMuX21heEhlaWdodCA9IG1heEhlaWdodDtcblxuICAgICAgICBpZiAoYnVmZmVyKSB7XG5cbiAgICAgICAgICAgIGlmIChpdGVtU2l6ZSA8IGl0ZW1IZWlnaHRJbmRleE9mZnNldCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkl0ZW1TaXplIGNhbid0IGxlc3Mgb3IgZXEgSXRlbUhlaWdodEluZGV4T2Zmc2V0XCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYnVmZmVyLmxlbmd0aCA8ICh3aWR0aCAqIGRlcHRoKSAqIGl0ZW1TaXplKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQnVmZmVyIGhhcyBpbnZhbGlkIGxlbmd0aFwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fZGF0YSA9IGJ1ZmZlcjtcbiAgICAgICAgICAgIHRoaXMuX2l0ZW1TaXplID0gaXRlbVNpemU7XG4gICAgICAgICAgICB0aGlzLl9pdGVtSGVpZ2h0SW5kZXhPZmZzZXQgPSBpdGVtSGVpZ2h0SW5kZXhPZmZzZXQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBUT0RPOiB0eXBlIGNoZWNrZXJcbiAgICAgICAgICAgIHRoaXMuX2RhdGEgPSBuZXcgSGVpZ2h0TWFwQXJyVHlwZSh3aWR0aCAqIGRlcHRoICogZGVmYXVsdEhlaWdodFZlcnRleFNpemUpIGFzIHVua25vd24gYXMgVERhdGE7XG4gICAgICAgICAgICB0aGlzLl9pdGVtU2l6ZSA9IGRlZmF1bHRIZWlnaHRWZXJ0ZXhTaXplO1xuICAgICAgICAgICAgdGhpcy5faXRlbUhlaWdodEluZGV4T2Zmc2V0ID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBfZW5jb2RlSGVpZ2h0RmFjdG9yKHN0b3JlOiBURGF0YSwgaW5kZXg6IGludCwgdmFsdWU6IGZsb2F0KSB7XG4gICAgICAgIHN0b3JlW2luZGV4XSA9IHZhbHVlO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgX2RlY29kZUhlaWdodEZhY3RvcihzdG9yZTogUmVjb3JkPG51bWJlciwgbnVtYmVyPiwgaW5kZXg6IGludCkge1xuICAgICAgICByZXR1cm4gc3RvcmVbaW5kZXhdO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgX2RlY29kZUhlaWdodChzdG9yZTogUmVjb3JkPG51bWJlciwgbnVtYmVyPiwgaW5kZXg6IGludCwgbWluOiBmbG9hdCwgbWF4OiBmbG9hdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVjb2RlSGVpZ2h0RmFjdG9yKHN0b3JlLCBpbmRleCkgKiAobWF4IC0gbWluKSArIG1pbjtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgX2VuY29kZUFuZFNldEhlaWdodEZhY3RvcihzdG9yZTogVERhdGEsIGluZGV4OiBpbnQsIHJlYWxIZWlnaHQ6IGZsb2F0LCBtaW46IGZsb2F0LCBtYXg6IGZsb2F0KSB7XG5cbiAgICAgICAgY29uc3Qgbm9ybWFsaXplID0gTWF0aC5tYXgoTWF0aC5taW4ocmVhbEhlaWdodCwgbWF4KSwgbWluKTtcbiAgICAgICAgY29uc3QgZmFjdG9yICAgID0gKG5vcm1hbGl6ZSAtIG1pbikgLyAobWF4IC0gbWluKTtcbiAgICBcbiAgICAgICAgICAgICAgIHRoaXMuX2VuY29kZUhlaWdodEZhY3RvcihzdG9yZSwgaW5kZXgsIGZhY3Rvcik7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWNvZGVIZWlnaHRGYWN0b3Ioc3RvcmUsIGluZGV4KTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldEluZGV4KHg6IGludCwgejogaW50KSB7XG4gICAgICAgIHJldHVybiAoeiAqIHRoaXMuX3dpZHRoICsgeCkgKiB0aGlzLl9pdGVtU2l6ZSArIHRoaXMuX2l0ZW1IZWlnaHRJbmRleE9mZnNldDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0RmFjdG9yKHg6IGludCwgejogaW50KSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5nZXRJbmRleCh4LCB6KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlY29kZUhlaWdodEZhY3Rvcih0aGlzLl9kYXRhLCBpbmRleCk7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIGdldCh4OiBpbnQsIHo6IGludCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuZ2V0SW5kZXgoeCwgeik7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWNvZGVIZWlnaHQodGhpcy5fZGF0YSwgaW5kZXgsIHRoaXMuX21pbkhlaWdodCwgdGhpcy5fbWF4SGVpZ2h0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgc2V0KHg6IGludCwgejogaW50LCB2YWx1ZTogZmxvYXQpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmdldEluZGV4KHgsIHopO1xuICAgICAgICByZXR1cm4gdGhpcy5fZW5jb2RlQW5kU2V0SGVpZ2h0RmFjdG9yKHRoaXMuX2RhdGEsIGluZGV4LCB2YWx1ZSwgdGhpcy5fbWluSGVpZ2h0LCB0aGlzLl9tYXhIZWlnaHQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRNaW5NYXhIZWlnaHQobWluSGVpZ2h0OiBmbG9hdCwgbWF4SGVpZ2h0OiBmbG9hdCkge1xuXG4gICAgICAgIGlmICh0aGlzLl9taW5IZWlnaHQgPiB0aGlzLl9tYXhIZWlnaHQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX21pbkhlaWdodCA9IG1pbkhlaWdodDtcbiAgICAgICAgdGhpcy5fbWF4SGVpZ2h0ID0gbWF4SGVpZ2h0O1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBhcHBlbmQoeDogaW50LCB6OiBpbnQsIHZhbHVlOiBmbG9hdCkge1xuXG4gICAgICAgIGNvbnN0IGluZGV4ICAgICA9IHRoaXMuZ2V0SW5kZXgoeCwgeik7XG4gICAgICAgIGNvbnN0IG9sZFZhbHVlICA9IHRoaXMuX2RlY29kZUhlaWdodCh0aGlzLl9kYXRhLCBpbmRleCwgdGhpcy5fbWluSGVpZ2h0LCB0aGlzLl9tYXhIZWlnaHQpO1xuICAgICAgICBjb25zdCBjYW5WYWx1ZSAgPSBvbGRWYWx1ZSArIHZhbHVlO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9lbmNvZGVBbmRTZXRIZWlnaHRGYWN0b3IodGhpcy5fZGF0YSwgaW5kZXgsIGNhblZhbHVlLCB0aGlzLl9taW5IZWlnaHQsIHRoaXMuX21heEhlaWdodCk7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIG11bHRpcGx5KHg6IGludCwgejogaW50LCB2YWx1ZTogZmxvYXQsIGhlaWdodElmWmVybzogZmxvYXQgPSAwKSB7XG5cbiAgICAgICAgY29uc3QgaW5kZXggICAgID0gdGhpcy5nZXRJbmRleCh4LCB6KTtcbiAgICAgICAgY29uc3Qgb2xkVmFsdWUgID0gdGhpcy5fZGVjb2RlSGVpZ2h0KHRoaXMuX2RhdGEsIGluZGV4LCB0aGlzLl9taW5IZWlnaHQsIHRoaXMuX21heEhlaWdodCkgfHwgaGVpZ2h0SWZaZXJvO1xuICAgICAgICBjb25zdCBjYW5WYWx1ZSAgPSBvbGRWYWx1ZSAqIHZhbHVlO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9lbmNvZGVBbmRTZXRIZWlnaHRGYWN0b3IodGhpcy5fZGF0YSwgaW5kZXgsIGNhblZhbHVlLCB0aGlzLl9taW5IZWlnaHQsIHRoaXMuX21heEhlaWdodCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBIZWlnaHRNYXA7IiwiaW1wb3J0IHR5cGUgeyBmbG9hdCwgaW50IH0gZnJvbSBcIi4uL1NoYXJlZC9UeXBlcy5tanNcIjtcclxuaW1wb3J0IHR5cGUgeyBJWm9uZSB9IGZyb20gXCIuL0lab25lLm1qc1wiO1xyXG5pbXBvcnQgdHlwZSB7IElSZWFkb25seUFic0hlaWdodE1hcCB9IGZyb20gXCIuL0Fic0hlaWdodE1hcC5tanNcIjtcclxuaW1wb3J0IEhlaWdodE1hcCwgeyBIZWlnaHRNYXBBcnJUeXBlLCBkZWZhdWx0SGVpZ2h0VmVydGV4U2l6ZSwgSVJlYWRvbmx5SGVpZ2h0TWFwIH0gZnJvbSBcIi4vSGVpZ2h0TWFwLm1qc1wiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJUmVhZG9ubHlBYnNQYXRjaGVkSGVpZ2h0TWFwIGV4dGVuZHMgSVJlYWRvbmx5QWJzSGVpZ2h0TWFwIHtcclxuXHJcbiAgICByZWFkb25seSBkYXRhQ2h1bmtTaXplOiBpbnQ7XHJcbiAgICByZWFkb25seSBkYXRhTnVtQ2h1bmtzWDogaW50O1xyXG4gICAgcmVhZG9ubHkgZGF0YU51bUNodW5rc1o6IGludDtcclxuICAgIHJlYWRvbmx5IGRhdGFDaHVua1NpemVGYWN0b3I6IGZsb2F0O1xyXG4gICAgcmVhZG9ubHkgcGF0Y2hTaXplOiBpbnQ7XHJcbiAgICByZWFkb25seSBudW1QYXRjaGVzWDogaW50O1xyXG4gICAgcmVhZG9ubHkgbnVtUGF0Y2hlc1o6IGludDtcclxuXHJcbiAgICBnZXRNaW4oKTogZmxvYXQ7XHJcbiAgICBnZXRNYXgoKTogZmxvYXQ7XHJcbiAgICBnZXRNaW5GYWN0b3IoKTogZmxvYXQ7XHJcbiAgICBnZXRNYXhGYWN0b3IoKTogZmxvYXQ7XHJcbiAgICBnZXRFbnRyaWVzUGF0Y2hNaW4oeDogZmxvYXQsIHo6IGZsb2F0KTogZmxvYXQ7XHJcbiAgICBnZXRFbnRyaWVzUGF0Y2hNYXgoeDogZmxvYXQsIHo6IGZsb2F0KTogZmxvYXQ7XHJcbiAgICBnZXRFbnRyaWVzUGF0Y2hNaW5GYWN0b3IoeDogZmxvYXQsIHo6IGZsb2F0KTogZmxvYXQ7XHJcbiAgICBnZXRFbnRyaWVzUGF0Y2hNYXhGYWN0b3IoeDogZmxvYXQsIHo6IGZsb2F0KTogZmxvYXQ7XHJcbiAgICBnZXRQYXRjaE1pbihwYXRjaEJhc2VYOiBpbnQsIHBhdGNoQmFzZVo6IGludCk6IGZsb2F0O1xyXG4gICAgZ2V0UGF0Y2hNYXgocGF0Y2hCYXNlWDogaW50LCBwYXRjaEJhc2VaOiBpbnQpOiBmbG9hdDtcclxuICAgIGdldFBhdGNoTWluRmFjdG9yKHBhdGNoQmFzZVg6IGludCwgcGF0Y2hCYXNlWjogaW50KTogZmxvYXQ7XHJcbiAgICBnZXRQYXRjaE1heEZhY3RvcihwYXRjaEJhc2VYOiBpbnQsIHBhdGNoQmFzZVo6IGludCk6IGZsb2F0O1xyXG5cclxuICAgIGdldENodW5rSW5kZXgoY2h1bmtYOiBpbnQsIGNodW5rWjogaW50KTogaW50O1xyXG4gICAgZ2V0Q2h1bmtCdWZmZXIodHlwZTogRmxvYXQzMkFycmF5Q29uc3RydWN0b3IsIGNodW5rWDogaW50LCBjaHVua1o6IGludCk6IEZsb2F0MzJBcnJheTtcclxuICAgIGdldENodW5rQnVmZmVyKHR5cGU6IFVpbnQxNkFycmF5Q29uc3RydWN0b3IsIGNodW5rWDogaW50LCBjaHVua1o6IGludCk6IFVpbnQxNkFycmF5O1xyXG4gICAgZ2V0Q2h1bmtCdWZmZXIodHlwZTogVWludDhBcnJheUNvbnN0cnVjdG9yLCBjaHVua1g6IGludCwgY2h1bmtaOiBpbnQpOiBVaW50OEFycmF5O1xyXG4gICAgZ2V0Q2h1bmtzQnVmZmVycyh0eXBlOiBGbG9hdDMyQXJyYXlDb25zdHJ1Y3Rvcik6IEZsb2F0MzJBcnJheVtdO1xyXG4gICAgZ2V0Q2h1bmtzQnVmZmVycyh0eXBlOiBVaW50MTZBcnJheUNvbnN0cnVjdG9yKTogVWludDE2QXJyYXlbXTtcclxuICAgIGdldENodW5rc0J1ZmZlcnModHlwZTogVWludDhBcnJheUNvbnN0cnVjdG9yKTogVWludDhBcnJheVtdO1xyXG5cclxuICAgIGdldENodW5rQnVmZmVyPFQgZXh0ZW5kcyBGbG9hdDMyQXJyYXlDb25zdHJ1Y3RvciB8IFVpbnQxNkFycmF5Q29uc3RydWN0b3IgfCBVaW50OEFycmF5Q29uc3RydWN0b3I+KHR5cGU6IFQsIGNodW5rWDogaW50LCBjaHVua1o6IGludCk6IGFueTtcclxuICAgIGdldENodW5rc0J1ZmZlcnM8VCBleHRlbmRzIEZsb2F0MzJBcnJheUNvbnN0cnVjdG9yIHwgVWludDE2QXJyYXlDb25zdHJ1Y3RvciB8IFVpbnQ4QXJyYXlDb25zdHJ1Y3Rvcj4odHlwZTogVCk6IGFueTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJUmVhZG9ubHlBYnNQYXRjaGVkSGVpZ2h0TWFwVHlwcGVkPFREYXRhIGV4dGVuZHMgRmxvYXQzMkFycmF5IHwgVWludDE2QXJyYXkgfCBVaW50OEFycmF5ID0gSGVpZ2h0TWFwQXJyVHlwZT4gZXh0ZW5kcyBJUmVhZG9ubHlBYnNQYXRjaGVkSGVpZ2h0TWFwLCBJUmVhZG9ubHlIZWlnaHRNYXA8VERhdGE+IHtcclxuXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBtaW5NYXhTdGFja1NpemUgPSAyO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldE9yVGhyb3dEYXRhQ2h1bmtTaXplKHBhdGNoU2l6ZTogaW50LCBkYXRhQ2h1bmtTaXplOiBpbnQpIHtcclxuXHJcbiAgICBpZiAoKGRhdGFDaHVua1NpemUgLSAxKSAlIChwYXRjaFNpemUgLSAxKSAhPT0gMCkge1xyXG4gICAgICAgIGNvbnN0IHJlY29tbWVuZGVkV2lkdGggPSAoKGRhdGFDaHVua1NpemUgLSAxICsgcGF0Y2hTaXplIC0gMSkgLyAoZGF0YUNodW5rU2l6ZSAtIDEpKSAqIChwYXRjaFNpemUgLSAxKSArIDE7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkRhdGFDaHVua1NpemUgbWludXMgMSAoJWQpIG11c3QgYmUgZGl2aXNpYmxlIGJ5IHBhdGNoU2l6ZSBtaW51cyAxICglZClcXG5cIiwgZGF0YUNodW5rU2l6ZSwgcGF0Y2hTaXplKTtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwiVHJ5IHVzaW5nIERhdGFDaHVua1NpemUgPSAlZFxcblwiLCByZWNvbW1lbmRlZFdpZHRoKTtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGF0YUNodW5rU2l6ZTtcclxufVxyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFic1BhdGNoZWRIZWlnaHRNYXA8VERhdGEgZXh0ZW5kcyBGbG9hdDMyQXJyYXkgfCBVaW50MTZBcnJheSB8IFVpbnQ4QXJyYXkgPSBIZWlnaHRNYXBBcnJUeXBlPiBleHRlbmRzIEhlaWdodE1hcDxURGF0YT4gaW1wbGVtZW50cyBJUmVhZG9ubHlBYnNQYXRjaGVkSGVpZ2h0TWFwVHlwcGVkPFREYXRhPiB7XHJcblxyXG4gICAgcHJvdGVjdGVkIF9wYXRjaFNpemU6IGludDtcclxuICAgIHByb3RlY3RlZCBfbnVtUGF0Y2hlc1g6IGludDtcclxuICAgIHByb3RlY3RlZCBfbnVtUGF0Y2hlc1o6IGludDtcclxuICAgIHByb3RlY3RlZCBfcGF0Y2hlc1NlZ21lbnRTaXplOiBpbnQ7XHJcbiAgICBwcm90ZWN0ZWQgX21pbk1heEhlaWdodENvb3JkczogaW50W107XHJcbiAgICBwcm90ZWN0ZWQgX21pbkhlaWdodENvb3JkOiBpbnRbXTtcclxuICAgIHByb3RlY3RlZCBfbWF4SGVpZ2h0Q29vcmQ6IGludFtdO1xyXG4gICAgcHJvdGVjdGVkIF9kYXRhQ2h1bmtTaXplOiBpbnQ7XHJcbiAgICBwcm90ZWN0ZWQgX2RhdGFOdW1DaHVua3NYOiBpbnQ7XHJcbiAgICBwcm90ZWN0ZWQgX2RhdGFOdW1DaHVua3NaOiBpbnQ7XHJcbiAgICBwcm90ZWN0ZWQgX2RhdGFDaHVua1NpemVGYWN0b3I6IGZsb2F0O1xyXG5cclxuICAgIHB1YmxpYyBnZXQgcGF0Y2hTaXplKCkgICAgICAgICAgIHsgcmV0dXJuIHRoaXMuX3BhdGNoU2l6ZTsgfVxyXG4gICAgcHVibGljIGdldCBudW1QYXRjaGVzWCgpICAgICAgICAgeyByZXR1cm4gdGhpcy5fbnVtUGF0Y2hlc1g7IH1cclxuICAgIHB1YmxpYyBnZXQgbnVtUGF0Y2hlc1ooKSAgICAgICAgIHsgcmV0dXJuIHRoaXMuX251bVBhdGNoZXNaOyB9XHJcbiAgICBwdWJsaWMgZ2V0IGRhdGFDaHVua1NpemUoKSAgICAgICB7IHJldHVybiB0aGlzLl9kYXRhQ2h1bmtTaXplOyB9XHJcbiAgICBwdWJsaWMgZ2V0IGRhdGFOdW1DaHVua3NYKCkgICAgICB7IHJldHVybiB0aGlzLl9kYXRhTnVtQ2h1bmtzWDsgfVxyXG4gICAgcHVibGljIGdldCBkYXRhTnVtQ2h1bmtzWigpICAgICAgeyByZXR1cm4gdGhpcy5fZGF0YU51bUNodW5rc1o7IH1cclxuICAgIHB1YmxpYyBnZXQgZGF0YUNodW5rU2l6ZUZhY3RvcigpIHsgcmV0dXJuIHRoaXMuX2RhdGFDaHVua1NpemVGYWN0b3I7IH1cclxuXHJcbiAgICBwdWJsaWMgY29uc3RydWN0b3Iod2lkdGg6IGludCwgZGVwdGg6IGludCwgcGF0Y2hTaXplOiBpbnQsIGRhdGFDaHVua1NpemU6IGludCwgbWluSGVpZ2h0OiBmbG9hdCwgbWF4SGVpZ2h0OiBmbG9hdCk7XHJcbiAgICBwdWJsaWMgY29uc3RydWN0b3Iod2lkdGg6IGludCwgZGVwdGg6IGludCwgcGF0Y2hTaXplOiBpbnQsIGRhdGFDaHVua1NpemU6IGludCwgbWluSGVpZ2h0OiBmbG9hdCwgbWF4SGVpZ2h0OiBmbG9hdCwgYnVmZmVyOiBURGF0YSwgaXRlbVNpemU/OiBpbnQsIGl0ZW1IZWlnaHRJbmRleE9mZnNldD86IGludCk7XHJcbiAgICBwdWJsaWMgY29uc3RydWN0b3Iod2lkdGg6IGludCwgZGVwdGg6IGludCwgcGF0Y2hTaXplOiBpbnQsIGRhdGFDaHVua1NpemU6IGludCwgbWluSGVpZ2h0OiBmbG9hdCwgbWF4SGVpZ2h0OiBmbG9hdCwgYnVmZmVyPzogVERhdGEgfCB1bmRlZmluZWQsIGl0ZW1TaXplOiBpbnQgPSBkZWZhdWx0SGVpZ2h0VmVydGV4U2l6ZSwgaXRlbUhlaWdodEluZGV4T2Zmc2V0OiBpbnQgPSAwKSB7XHJcbiAgICAgICAgc3VwZXIod2lkdGgsIGRlcHRoLCBtaW5IZWlnaHQsIG1heEhlaWdodCwgYnVmZmVyISAvKiogVFMgaHVjayAqLywgaXRlbVNpemUsIGl0ZW1IZWlnaHRJbmRleE9mZnNldCk7XHJcbiAgICAgICAgdGhpcy5fbWluSGVpZ2h0Q29vcmQgPSBbMCwgMF07XHJcbiAgICAgICAgdGhpcy5fbWF4SGVpZ2h0Q29vcmQgPSBbMCwgMF07XHJcbiAgICAgICAgdGhpcy5fc2V0UGF0Y2hTaXplKHBhdGNoU2l6ZSk7XHJcbiAgICAgICAgdGhpcy5fc2V0RGF0YUNodW5rU2l6ZShkYXRhQ2h1bmtTaXplKTtcclxuICAgICAgICB0aGlzLl9jbGVhck1pbk1heEhlaWdodENvb3JkcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBfc2V0UGF0Y2hTaXplKHBhdGNoU2l6ZTogaW50KSB7XHJcbiAgICAgICAgdGhpcy5fcGF0Y2hTaXplICAgPSBwYXRjaFNpemU7XHJcbiAgICAgICAgdGhpcy5fbnVtUGF0Y2hlc1ggPSAoKHRoaXMud2lkdGggLSAxKSAvICh0aGlzLl9wYXRjaFNpemUgLSAxKSkgfCAwO1xyXG4gICAgICAgIHRoaXMuX251bVBhdGNoZXNaID0gKCh0aGlzLmRlcHRoIC0gMSkgLyAodGhpcy5fcGF0Y2hTaXplIC0gMSkpIHwgMDtcclxuICAgICAgICB0aGlzLl9wYXRjaGVzU2VnbWVudFNpemUgPSB0aGlzLl9udW1QYXRjaGVzWCAqIHRoaXMuX251bVBhdGNoZXNaICogbWluTWF4U3RhY2tTaXplO1xyXG4gICAgICAgIHRoaXMuX21pbk1heEhlaWdodENvb3JkcyA9IG5ldyBBcnJheTxpbnQ+KHRoaXMuX3BhdGNoZXNTZWdtZW50U2l6ZSAqIDIpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBfc2V0RGF0YUNodW5rU2l6ZSh2YWx1ZTogaW50KSB7XHJcbiAgICAgICAgdGhpcy5fZGF0YUNodW5rU2l6ZSAgPSBnZXRPclRocm93RGF0YUNodW5rU2l6ZSh0aGlzLl9wYXRjaFNpemUsIHZhbHVlKTtcclxuICAgICAgICB0aGlzLl9kYXRhTnVtQ2h1bmtzWCA9ICgodGhpcy53aWR0aCAtIDEpIC8gKHRoaXMuX2RhdGFDaHVua1NpemUgLSAxKSkgfCAwO1xyXG4gICAgICAgIHRoaXMuX2RhdGFOdW1DaHVua3NaID0gKCh0aGlzLmRlcHRoIC0gMSkgLyAodGhpcy5fZGF0YUNodW5rU2l6ZSAtIDEpKSB8IDA7XHJcbiAgICAgICAgdGhpcy5fZGF0YUNodW5rU2l6ZUZhY3RvciA9IHRoaXMuX3BhdGNoU2l6ZSAvICh0aGlzLl9kYXRhQ2h1bmtTaXplICsgdGhpcy5fcGF0Y2hTaXplIC0gKHRoaXMuX2RhdGFDaHVua1NpemUgJSB0aGlzLl9wYXRjaFNpemUpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIG92ZXJyaWRlIGdldEluZGV4KHg6IGludCwgejogaW50KTogaW50IHtcclxuXHJcbiAgICAgICAgY29uc3QgbG9jYWxYID0geCAlIHRoaXMuX2RhdGFDaHVua1NpemU7XHJcbiAgICAgICAgY29uc3QgbG9jYWxaID0geiAlIHRoaXMuX2RhdGFDaHVua1NpemU7XHJcbiAgICAgICAgY29uc3QgY2h1bmtYID0gTWF0aC5mbG9vcih4IC8gdGhpcy5fZGF0YUNodW5rU2l6ZSk7XHJcbiAgICAgICAgY29uc3QgY2h1bmtaID0gTWF0aC5mbG9vcih6IC8gdGhpcy5fZGF0YUNodW5rU2l6ZSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGNodW5rT2Zmc2V0ID0gKGNodW5rWiAqIHRoaXMuX2RhdGFOdW1DaHVua3NYICsgY2h1bmtYKSAqICh0aGlzLl9kYXRhQ2h1bmtTaXplICoqIDIpO1xyXG4gICAgICAgIGNvbnN0IGxvY2FsSW5kZXggID0gKGxvY2FsWiAqIHRoaXMuX2RhdGFDaHVua1NpemUgKyBsb2NhbFgpO1xyXG5cclxuICAgICAgICByZXR1cm4gY2h1bmtPZmZzZXQgKyBsb2NhbEluZGV4O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0Q2h1bmtJbmRleChjaHVua1g6IGludCwgY2h1bmtaOiBpbnQpOiBpbnQge1xyXG4gICAgICAgIHJldHVybiBjaHVua1ogKiB0aGlzLl9kYXRhTnVtQ2h1bmtzWCArIGNodW5rWDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q2h1bmtCdWZmZXIodHlwZTogRmxvYXQzMkFycmF5Q29uc3RydWN0b3IsIGNodW5rWDogaW50LCBjaHVua1o6IGludCk6IEZsb2F0MzJBcnJheTtcclxuICAgIHB1YmxpYyBnZXRDaHVua0J1ZmZlcih0eXBlOiBVaW50MTZBcnJheUNvbnN0cnVjdG9yLCBjaHVua1g6IGludCwgY2h1bmtaOiBpbnQpOiBVaW50MTZBcnJheTtcclxuICAgIHB1YmxpYyBnZXRDaHVua0J1ZmZlcih0eXBlOiBVaW50OEFycmF5Q29uc3RydWN0b3IsIGNodW5rWDogaW50LCBjaHVua1o6IGludCk6IFVpbnQ4QXJyYXk7XHJcbiAgICBwdWJsaWMgZ2V0Q2h1bmtCdWZmZXIodHlwZTogYW55LCBjaHVua1g6IGludCwgY2h1bmtaOiBpbnQpIHtcclxuICAgICAgICBjb25zdCBzaXplICAgICAgICA9IHRoaXMuZGF0YUNodW5rU2l6ZSAqKiAyO1xyXG4gICAgICAgIGNvbnN0IGNodW5rTGV2ZWwgID0gY2h1bmtaICogdGhpcy5kYXRhTnVtQ2h1bmtzWCArIGNodW5rWDtcclxuICAgICAgICBjb25zdCBjaHVua09mZnNldCA9IGNodW5rTGV2ZWwgKiBzaXplICogdGhpcy5kYXRhLkJZVEVTX1BFUl9FTEVNRU5UO1xyXG4gICAgICAgIGNvbnN0IGNvdW50ICAgICAgID0gc2l6ZSAqICh0aGlzLmRhdGEuQllURVNfUEVSX0VMRU1FTlQgLyB0eXBlLkJZVEVTX1BFUl9FTEVNRU5UKTtcclxuICAgICAgICByZXR1cm4gbmV3IHR5cGUodGhpcy5kYXRhLmJ1ZmZlciwgY2h1bmtPZmZzZXQsIGNvdW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q2h1bmtzQnVmZmVycyh0eXBlOiBGbG9hdDMyQXJyYXlDb25zdHJ1Y3Rvcik6IEZsb2F0MzJBcnJheVtdO1xyXG4gICAgcHVibGljIGdldENodW5rc0J1ZmZlcnModHlwZTogVWludDE2QXJyYXlDb25zdHJ1Y3Rvcik6IFVpbnQxNkFycmF5W107XHJcbiAgICBwdWJsaWMgZ2V0Q2h1bmtzQnVmZmVycyh0eXBlOiBVaW50OEFycmF5Q29uc3RydWN0b3IpOiBVaW50OEFycmF5W107XHJcbiAgICBwdWJsaWMgZ2V0Q2h1bmtzQnVmZmVycyh0eXBlOiBhbnkpIHtcclxuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IEFycmF5KHRoaXMuX2RhdGFOdW1DaHVua3NYICogdGhpcy5fZGF0YU51bUNodW5rc1opO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBjaHVua1ogPSAwOyBjaHVua1ogPCB0aGlzLl9kYXRhTnVtQ2h1bmtzWjsgY2h1bmtaKyspIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGNodW5rWCA9IDA7IGNodW5rWCA8IHRoaXMuX2RhdGFOdW1DaHVua3NYOyBjaHVua1grKykge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IGNodW5rWiAqIHRoaXMuX2RhdGFOdW1DaHVua3NYICsgY2h1bmtYO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IHRoaXMuZ2V0Q2h1bmtCdWZmZXIodHlwZSwgY2h1bmtYLCBjaHVua1opO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRFbnRyaWVzUGF0Y2hNaW4oeDogaW50LCB6OiBpbnQpIHtcclxuICAgICAgICBjb25zdCBwYXRjaFggPSBNYXRoLmZsb29yKHggLyB0aGlzLl9wYXRjaFNpemUpO1xyXG4gICAgICAgIGNvbnN0IHBhdGNoWiA9IE1hdGguZmxvb3IoeiAvIHRoaXMuX3BhdGNoU2l6ZSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UGF0Y2hNaW4ocGF0Y2hYLCBwYXRjaFopO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRFbnRyaWVzUGF0Y2hNYXgoeDogaW50LCB6OiBpbnQpIHtcclxuICAgICAgICBjb25zdCBwYXRjaFggPSBNYXRoLmZsb29yKHggLyB0aGlzLl9wYXRjaFNpemUpO1xyXG4gICAgICAgIGNvbnN0IHBhdGNoWiA9IE1hdGguZmxvb3IoeiAvIHRoaXMuX3BhdGNoU2l6ZSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UGF0Y2hNYXgocGF0Y2hYLCBwYXRjaFopO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRFbnRyaWVzUGF0Y2hNaW5GYWN0b3IoeDogaW50LCB6OiBpbnQpIHtcclxuICAgICAgICBjb25zdCBwYXRjaFggPSBNYXRoLmZsb29yKHggLyB0aGlzLl9wYXRjaFNpemUpO1xyXG4gICAgICAgIGNvbnN0IHBhdGNoWiA9IE1hdGguZmxvb3IoeiAvIHRoaXMuX3BhdGNoU2l6ZSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UGF0Y2hNaW5GYWN0b3IocGF0Y2hYLCBwYXRjaFopO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRFbnRyaWVzUGF0Y2hNYXhGYWN0b3IoeDogaW50LCB6OiBpbnQpIHtcclxuICAgICAgICBjb25zdCBwYXRjaFggPSBNYXRoLmZsb29yKHggLyB0aGlzLl9wYXRjaFNpemUpO1xyXG4gICAgICAgIGNvbnN0IHBhdGNoWiA9IE1hdGguZmxvb3IoeiAvIHRoaXMuX3BhdGNoU2l6ZSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UGF0Y2hNYXhGYWN0b3IocGF0Y2hYLCBwYXRjaFopO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRNaW4oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KHRoaXMuX21pbkhlaWdodENvb3JkWzBdLCB0aGlzLl9taW5IZWlnaHRDb29yZFsxXSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldE1heCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXQodGhpcy5fbWF4SGVpZ2h0Q29vcmRbMF0sIHRoaXMuX21heEhlaWdodENvb3JkWzFdKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TWluRmFjdG9yKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZhY3Rvcih0aGlzLl9taW5IZWlnaHRDb29yZFswXSwgdGhpcy5fbWluSGVpZ2h0Q29vcmRbMV0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRNYXhGYWN0b3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RmFjdG9yKHRoaXMuX21heEhlaWdodENvb3JkWzBdLCB0aGlzLl9tYXhIZWlnaHRDb29yZFsxXSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFBhdGNoTWluKHBhdGNoQmFzZVg6IGludCwgcGF0Y2hCYXNlWjogaW50KSB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSAocGF0Y2hCYXNlWiAqIHRoaXMuX251bVBhdGNoZXNYICsgcGF0Y2hCYXNlWCkgKiBtaW5NYXhTdGFja1NpemU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KHRoaXMuX21pbk1heEhlaWdodENvb3Jkc1tpbmRleF0sIHRoaXMuX21pbk1heEhlaWdodENvb3Jkc1tpbmRleCArIDFdKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0UGF0Y2hNYXgocGF0Y2hCYXNlWDogaW50LCBwYXRjaEJhc2VaOiBpbnQpIHtcclxuICAgICAgICBjb25zdCBpbmRleCA9IChwYXRjaEJhc2VaICogdGhpcy5fbnVtUGF0Y2hlc1ggKyBwYXRjaEJhc2VYKSAqIG1pbk1heFN0YWNrU2l6ZSArIHRoaXMuX3BhdGNoZXNTZWdtZW50U2l6ZTtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXQodGhpcy5fbWluTWF4SGVpZ2h0Q29vcmRzW2luZGV4XSwgdGhpcy5fbWluTWF4SGVpZ2h0Q29vcmRzW2luZGV4ICsgMV0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRQYXRjaE1pbkZhY3RvcihwYXRjaEJhc2VYOiBpbnQsIHBhdGNoQmFzZVo6IGludCkge1xyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gKHBhdGNoQmFzZVogKiB0aGlzLl9udW1QYXRjaGVzWCArIHBhdGNoQmFzZVgpICogbWluTWF4U3RhY2tTaXplO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZhY3Rvcih0aGlzLl9taW5NYXhIZWlnaHRDb29yZHNbaW5kZXhdLCB0aGlzLl9taW5NYXhIZWlnaHRDb29yZHNbaW5kZXggKyAxXSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFBhdGNoTWF4RmFjdG9yKHBhdGNoQmFzZVg6IGludCwgcGF0Y2hCYXNlWjogaW50KSB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSAocGF0Y2hCYXNlWiAqIHRoaXMuX251bVBhdGNoZXNYICsgcGF0Y2hCYXNlWCkgKiBtaW5NYXhTdGFja1NpemUgKyB0aGlzLl9wYXRjaGVzU2VnbWVudFNpemU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RmFjdG9yKHRoaXMuX21pbk1heEhlaWdodENvb3Jkc1tpbmRleF0sIHRoaXMuX21pbk1heEhlaWdodENvb3Jkc1tpbmRleCArIDFdKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgX2NsZWFyTWluTWF4SGVpZ2h0Q29vcmRzKCkge1xyXG5cclxuICAgICAgICB0aGlzLl9taW5IZWlnaHRDb29yZFswXSA9IDA7XHJcbiAgICAgICAgdGhpcy5fbWluSGVpZ2h0Q29vcmRbMV0gPSAwO1xyXG4gICAgICAgIHRoaXMuX21heEhlaWdodENvb3JkWzBdID0gMDtcclxuICAgICAgICB0aGlzLl9tYXhIZWlnaHRDb29yZFsxXSA9IDA7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fbWluTWF4SGVpZ2h0Q29vcmRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX21pbk1heEhlaWdodENvb3Jkc1tpXSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZWNhbGN1bGF0ZUFBQkIoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuX21pbkhlaWdodENvb3JkWzBdID0gMDtcclxuICAgICAgICB0aGlzLl9taW5IZWlnaHRDb29yZFsxXSA9IDA7XHJcbiAgICAgICAgdGhpcy5fbWF4SGVpZ2h0Q29vcmRbMF0gPSAwO1xyXG4gICAgICAgIHRoaXMuX21heEhlaWdodENvb3JkWzFdID0gMDtcclxuXHJcbiAgICAgICAgbGV0IG1pbkZhY3RvciA9IDE7XHJcbiAgICAgICAgbGV0IG1heEZhY3RvciA9IDA7XHJcblxyXG4gICAgICAgIGZvciAobGV0IHBhdGNoWiA9IDA7IHBhdGNoWiA8IHRoaXMuX251bVBhdGNoZXNaOyBwYXRjaForKykge1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgcGF0Y2hYID0gMDsgcGF0Y2hYIDwgdGhpcy5fbnVtUGF0Y2hlc1g7IHBhdGNoWCsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgbWluSW5kZXggPSAocGF0Y2haICogdGhpcy5fbnVtUGF0Y2hlc1ggKyBwYXRjaFgpICogbWluTWF4U3RhY2tTaXplO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbWF4SW5kZXggPSBtaW5JbmRleCArIHRoaXMuX3BhdGNoZXNTZWdtZW50U2l6ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRjaE1pbkZhY3RvciA9IHRoaXMuZ2V0RmFjdG9yKHRoaXMuX21pbk1heEhlaWdodENvb3Jkc1ttaW5JbmRleF0sIHRoaXMuX21pbk1heEhlaWdodENvb3Jkc1ttaW5JbmRleCArIDFdKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGNoTWF4ZmFjdG9yID0gdGhpcy5nZXRGYWN0b3IodGhpcy5fbWluTWF4SGVpZ2h0Q29vcmRzW21heEluZGV4XSwgdGhpcy5fbWluTWF4SGVpZ2h0Q29vcmRzW21heEluZGV4ICsgMV0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtaW5GYWN0b3IgPiBwYXRjaE1pbkZhY3Rvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIG1pbkZhY3RvciA9IHBhdGNoTWluRmFjdG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21pbkhlaWdodENvb3JkWzBdID0gdGhpcy5fbWluTWF4SGVpZ2h0Q29vcmRzW21pbkluZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9taW5IZWlnaHRDb29yZFsxXSA9IHRoaXMuX21pbk1heEhlaWdodENvb3Jkc1ttaW5JbmRleCArIDFdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtYXhGYWN0b3IgPCBwYXRjaE1heGZhY3Rvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIG1heEZhY3RvciA9IHBhdGNoTWF4ZmFjdG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21heEhlaWdodENvb3JkWzBdID0gdGhpcy5fbWluTWF4SGVpZ2h0Q29vcmRzW21heEluZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tYXhIZWlnaHRDb29yZFsxXSA9IHRoaXMuX21pbk1heEhlaWdodENvb3Jkc1ttYXhJbmRleCArIDFdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZWNhbGN1bGF0ZU1pbk1heCh6b25lOiBJWm9uZSk6IHZvaWQge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh6b25lLm1heFggPCAwKSByZXR1cm47XHJcbiAgICAgICAgaWYgKHpvbmUubWF4WiA8IDApIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3QgZml4ZWRNaW5YID0gTWF0aC5tYXgoem9uZS5taW5YLCAwKTtcclxuICAgICAgICBjb25zdCBmaXhlZE1pblogPSBNYXRoLm1heCh6b25lLm1pblosIDApO1xyXG4gICAgICAgIGNvbnN0IGZpeGVkTWF4WCA9IE1hdGgubWluKHpvbmUubWF4WCwgdGhpcy53aWR0aCk7XHJcbiAgICAgICAgY29uc3QgZml4ZWRNYXhaID0gTWF0aC5taW4oem9uZS5tYXhaLCB0aGlzLmRlcHRoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgeiA9IGZpeGVkTWluWjsgeiA8IGZpeGVkTWF4WjsgeiArPSB0aGlzLl9wYXRjaFNpemUpIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHggPSBmaXhlZE1pblg7IHggPCBmaXhlZE1heFg7IHggKz0gdGhpcy5fcGF0Y2hTaXplKSB7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGNoWCAgID0gTWF0aC5mbG9vcih4IC8gdGhpcy5fcGF0Y2hTaXplKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGNoWiAgID0gTWF0aC5mbG9vcih6IC8gdGhpcy5fcGF0Y2hTaXplKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGNoSSAgID0gcGF0Y2haICogdGhpcy5fbnVtUGF0Y2hlc1ggKyBwYXRjaFg7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtaW5JbmRleCA9IHBhdGNoSSAqIG1pbk1heFN0YWNrU2l6ZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1heEluZGV4ID0gbWluSW5kZXggKyB0aGlzLl9wYXRjaGVzU2VnbWVudFNpemU7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZpcnN0UGF0Y2hYID0gcGF0Y2hYICogdGhpcy5fcGF0Y2hTaXplO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZmlyc3RQYXRjaFogPSBwYXRjaFogKiB0aGlzLl9wYXRjaFNpemU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0UGF0Y2hYICA9IGZpcnN0UGF0Y2hYICsgdGhpcy5fcGF0Y2hTaXplO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdFBhdGNoWiAgPSBmaXJzdFBhdGNoWiArIHRoaXMuX3BhdGNoU2l6ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbWluID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF4ID0gTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVI7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWluWCA9IGZpcnN0UGF0Y2hYO1xyXG4gICAgICAgICAgICAgICAgbGV0IG1pblogPSBmaXJzdFBhdGNoWjtcclxuICAgICAgICAgICAgICAgIGxldCBtYXhYID0gZmlyc3RQYXRjaFg7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF4WiA9IGZpcnN0UGF0Y2haO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGlubmVyWiA9IGZpcnN0UGF0Y2haICsgMTsgaW5uZXJaIDwgbGFzdFBhdGNoWjsgaW5uZXJaKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaW5uZXJYID0gZmlyc3RQYXRjaFggKyAxOyBpbm5lclggPCBsYXN0UGF0Y2hYOyBpbm5lclgrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmFjdG9yID0gdGhpcy5nZXRGYWN0b3IoaW5uZXJYLCBpbm5lclopO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1pbiA+IGZhY3Rvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluID0gZmFjdG9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluWCA9IGlubmVyWDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pblogPSBpbm5lclo7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXggPCBmYWN0b3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heCA9IGZhY3RvcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFggPSBpbm5lclg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhaID0gaW5uZXJaO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuX21pbk1heEhlaWdodENvb3Jkc1ttaW5JbmRleF0gICAgID0gbWluWDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21pbk1heEhlaWdodENvb3Jkc1ttaW5JbmRleCArIDFdID0gbWluWjtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21pbk1heEhlaWdodENvb3Jkc1ttYXhJbmRleF0gICAgID0gbWF4WDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21pbk1heEhlaWdodENvb3Jkc1ttYXhJbmRleCArIDFdID0gbWF4WjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQWJzUGF0Y2hlZEhlaWdodE1hcDsiLCJpbXBvcnQgeyBpbnQgfSBmcm9tIFwiLi4vU2hhcmVkL1R5cGVzLm1qc1wiO1xuXG5leHBvcnQgY29uc3QgTEVGVCAgID0gMjtcbmV4cG9ydCBjb25zdCBSSUdIVCAgPSAyO1xuZXhwb3J0IGNvbnN0IFRPUCAgICA9IDI7XG5leHBvcnQgY29uc3QgQk9UVE9NID0gMjtcblxuZXhwb3J0IGludGVyZmFjZSBJU2luZ2xlTG9kSW5mbyB7XG4gICAgc3RhcnQ6IGludDtcbiAgICBjb3VudDogaW50O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdEluZm8oKTogSVNpbmdsZUxvZEluZm9bXVtdW11bXSB7XG5cbiAgICBjb25zdCBhcnI6IElTaW5nbGVMb2RJbmZvW11bXVtdW10gPSBbXTtcblxuICAgIGZvciAobGV0IGwgPSAwIDsgbCA8IExFRlQgOyBsKyspIHtcblxuICAgICAgICBhcnJbbF0gPSBbXTtcblxuICAgICAgICBmb3IgKGxldCByID0gMCA7IHIgPCBSSUdIVCA7IHIrKykge1xuXG4gICAgICAgICAgICBhcnJbbF1bcl0gPSBbXTtcblxuICAgICAgICAgICAgZm9yIChsZXQgdCA9IDAgOyB0IDwgVE9QIDsgdCsrKSB7XG5cbiAgICAgICAgICAgICAgICBhcnJbbF1bcl1bdF0gPSBbXTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGIgPSAwIDsgYiA8IEJPVFRPTSA7IGIrKykge1xuXG4gICAgICAgICAgICAgICAgICAgIGFycltsXVtyXVt0XVtiXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IDBcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYXJyO1xufVxuXG5leHBvcnQgY2xhc3MgTG9kSW5mbyB7XG5cbiAgICAvL2luZm9bTEVGVF1bUklHSFRdW1RPUF1bQk9UVE9NXTtcbiAgICBwdWJsaWMgaW5mbzogSVNpbmdsZUxvZEluZm9bXVtdW11bXTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmluZm8gPSBpbml0SW5mbygpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbGVhcigpIHtcbiAgICAgICAgZm9yIChsZXQgbCA9IDAgOyBsIDwgTEVGVCA7IGwrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgciA9IDAgOyByIDwgUklHSFQgOyByKyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB0ID0gMCA7IHQgPCBUT1AgOyB0KyspIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYiA9IDAgOyBiIDwgQk9UVE9NIDsgYisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzaW5nbGUgPSB0aGlzLmluZm9bbF1bcl1bdF1bYl07XG4gICAgICAgICAgICAgICAgICAgICAgICBzaW5nbGUuc3RhcnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2luZ2xlLmNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTG9kSW5mbzsiLCJpbXBvcnQgdHlwZSB7IGludCB9IGZyb20gXCIuL1R5cGVzLm1qc1wiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQWJzU3RvcmUyRDxUIGV4dGVuZHMgc3RyaW5nIHwgbnVtYmVyIHwgb2JqZWN0PiB7XG5cbiAgICBwcm90ZWN0ZWQgX3A6IFRbXTtcbiAgICBwcm90ZWN0ZWQgX2NvbHMgPSAwO1xuICAgIHByb3RlY3RlZCBfcm93cyA9IDA7XG5cbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgX2luaXRBcnJheVR5cGUoc2l6ZTogaW50KTogVFtdO1xuXG4gICAgcHVibGljIGluaXQoY29sczogaW50LCByb3dzOiBpbnQpOiB2b2lkIHtcblxuICAgICAgICB0aGlzLl9jb2xzID0gY29scztcbiAgICAgICAgdGhpcy5fcm93cyA9IHJvd3M7XG5cbiAgICAgICAgY29uc3Qgc2l6ZSA9IGNvbHMgKiByb3dzO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5fcCA9IHRoaXMuX2luaXRBcnJheVR5cGUoc2l6ZSk7XG4gICAgfVxuXG4gICAgcHVibGljIGluaXRCeVZhbChjb2xzOiBpbnQsIHJvd3M6IGludCwgdmFsOiBUIHwgKCgpID0+IFQpKTogdm9pZCB7XG5cbiAgICAgICAgdGhpcy5pbml0KGNvbHMsIHJvd3MpO1xuXG4gICAgICAgIGNvbnN0IHNpemUgPSBjb2xzICogcm93cztcbiAgICAgICAgY29uc3QgdmFsSXNGdW5jID0gdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJztcblxuICAgICAgICBmb3IgKGxldCBpID0gMCA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuX3BbaV0gPSB2YWxJc0Z1bmMgPyB2YWwoKSA6IHZhbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBpbml0QnlTdG9yZShjb2xzOiBpbnQsIHJvd3M6IGludCwgdmFsOiBSZWNvcmQ8aW50LCBUPik6IHZvaWQge1xuICAgICAgICB0aGlzLl9jb2xzID0gY29scztcbiAgICAgICAgdGhpcy5fcm93cyA9IHJvd3M7XG4gICAgICAgIHRoaXMuX3AgPSB2YWwgYXMgVFtdO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRyKCk6IFJlY29yZDxudW1iZXIsIFQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3A7XG4gICAgfVxuXG4gICAgcHVibGljIHNpemUoKTogaW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvd3MgKiB0aGlzLl9jb2xzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQoY29sOiBpbnQsIHJvdzogaW50KTogVCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wW3JvdyAqIHRoaXMuX2NvbHMgKyBjb2xdO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQoY29sOiBpbnQsIHJvdzogaW50LCB2YWx1ZTogVCkge1xuICAgICAgICB0aGlzLl9wW3JvdyAqIHRoaXMuX2NvbHMgKyBjb2xdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEJ5SW5kZXgoaW5kZXg6IGludCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcFtpbmRleF07XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBzZXRCeUluZGV4KGluZGV4OiBpbnQsIHZhbHVlOiBUKSB7XG4gICAgICAgIHRoaXMuX3BbaW5kZXhdID0gdmFsdWU7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgT2JqU3RvcmUyRDxUIGV4dGVuZHMgb2JqZWN0PiBleHRlbmRzIEFic1N0b3JlMkQ8VD4ge1xuXG4gICAgcHJvdGVjdGVkIG92ZXJyaWRlIF9pbml0QXJyYXlUeXBlKHNpemU6IG51bWJlcik6IFRbXSB7XG4gICAgICAgIHJldHVybiBuZXcgQXJyYXk8VD4oc2l6ZSk7XG4gICAgfVxufSIsImltcG9ydCB7IElWZWN0b3IzLCBmbG9hdCB9IGZyb20gXCIuL1R5cGVzLm1qc1wiO1xuXG4vKipcbiAqIFNldHMgdGhlIHNwZWNpZmllZCAzLWRpbWVuc2lvbmFsIHZlY3RvciB0byB0aGUgc3VwcGxpZWQgbnVtZXJpY2FsIHZhbHVlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldDxUIGV4dGVuZHMgSVZlY3RvcjM+KHRvOiBULCB4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogVCB7XG4gICAgdG8ueCA9IHg7XG4gICAgdG8ueSA9IHk7XG4gICAgdG8ueiA9IHo7XG4gICAgcmV0dXJuIHRvO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIEV1Y2xpZGVhbiBkaXN0YW5jZSBiZXR3ZWVuIHRoZSB0d28gZ2l2ZW4gcG9pbnRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2UodmFsdWUxOiBSZWFkb25seTxJVmVjdG9yMz4sIHZhbHVlMjogUmVhZG9ubHk8SVZlY3RvcjM+KSB7XG4gICAgY29uc3QgZHggPSB2YWx1ZTEueCAtIHZhbHVlMi54O1xuICAgIGNvbnN0IGR5ID0gdmFsdWUxLnkgLSB2YWx1ZTIueTtcbiAgICBjb25zdCBkeiA9IHZhbHVlMS56IC0gdmFsdWUyLno7XG4gICAgY29uc3QgbHMgPSBkeCAqIGR4ICsgZHkgKiBkeSArIGR6ICogZHo7XG4gICAgcmV0dXJuIE1hdGguc3FydChscyk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgRXVjbGlkZWFuIGRpc3RhbmNlIGJldHdlZW4gdGhlIHR3byBnaXZlbiBwb2ludHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZVYzWFlaKHZhbHVlMTogUmVhZG9ubHk8SVZlY3RvcjM+LCB4OiBmbG9hdCwgeTogZmxvYXQsIHo6IGZsb2F0KSB7XG4gICAgY29uc3QgZHggPSB2YWx1ZTEueCAtIHg7XG4gICAgY29uc3QgZHkgPSB2YWx1ZTEueSAtIHk7XG4gICAgY29uc3QgZHogPSB2YWx1ZTEueiAtIHo7XG4gICAgY29uc3QgbHMgPSBkeCAqIGR4ICsgZHkgKiBkeSArIGR6ICogZHo7XG4gICAgcmV0dXJuIE1hdGguc3FydChscyk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgRXVjbGlkZWFuIGRpc3RhbmNlIGJldHdlZW4gdGhlIHR3byBnaXZlbiBwb2ludHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZVgxWTFaMVgyWTJaMih4MTogZmxvYXQsIHkxOiBmbG9hdCwgejE6IGZsb2F0LCB4MjogZmxvYXQsIHkyOiBmbG9hdCwgejI6IGZsb2F0KSB7XG4gICAgY29uc3QgZHggPSB4MSAtIHgyO1xuICAgIGNvbnN0IGR5ID0geTEgLSB5MjtcbiAgICBjb25zdCBkeiA9IHoxIC0gejI7XG4gICAgY29uc3QgbHMgPSBkeCAqIGR4ICsgZHkgKiBkeSArIGR6ICogZHo7XG4gICAgcmV0dXJuIE1hdGguc3FydChscyk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHZlY3RvciB3aXRoIHRoZSBzYW1lIGRpcmVjdGlvbiBhcyB0aGUgZ2l2ZW4gdmVjdG9yLCBidXQgd2l0aCBhIGxlbmd0aCBvZiAxLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplPFRPdXQgZXh0ZW5kcyBJVmVjdG9yMz4odmFsdWU6IFJlYWRvbmx5PElWZWN0b3IzPiwgb3V0OiBUT3V0KTogVE91dCB7XG5cbiAgICBjb25zdCBscyA9IHZhbHVlLnggKiB2YWx1ZS54ICsgdmFsdWUueSAqIHZhbHVlLnkgKyB2YWx1ZS56ICogdmFsdWUuejtcbiAgICBjb25zdCBsZW5ndGggPSBNYXRoLnNxcnQobHMpO1xuXG4gICAgcmV0dXJuIHNldChcbiAgICAgICAgb3V0LFxuICAgICAgICB2YWx1ZS54IC8gbGVuZ3RoLFxuICAgICAgICB2YWx1ZS55IC8gbGVuZ3RoLFxuICAgICAgICB2YWx1ZS56IC8gbGVuZ3RoXG4gICAgKTtcbn1cblxuLyoqXG4gKiBVcGRhdGUgdGhlIHZlY3RvciB3aXRoIHRoZSBzYW1lIGRpcmVjdGlvbiBhcyB0aGUgZ2l2ZW4gdmVjdG9yLCBidXQgd2l0aCBhIGxlbmd0aCBvZiAxLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplUmVmPFQgZXh0ZW5kcyBJVmVjdG9yMz4ocmVmVmFsdWU6IFQpOiBUIHtcblxuICAgIGNvbnN0IGxzID0gcmVmVmFsdWUueCAqIHJlZlZhbHVlLnggKyByZWZWYWx1ZS55ICogcmVmVmFsdWUueSArIHJlZlZhbHVlLnogKiByZWZWYWx1ZS56O1xuICAgIGNvbnN0IGxlbmd0aCA9IE1hdGguc3FydChscyk7XG4gICAgXG4gICAgcmVmVmFsdWUueCAvPSBsZW5ndGg7XG4gICAgcmVmVmFsdWUueSAvPSBsZW5ndGg7XG4gICAgcmVmVmFsdWUueiAvPSBsZW5ndGg7XG4gICAgcmV0dXJuIHJlZlZhbHVlO1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIHZlY3RvcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGQ8VE91dCBleHRlbmRzIElWZWN0b3IzPihsZWZ0OiBSZWFkb25seTxJVmVjdG9yMz4sIHJpZ2h0OiBSZWFkb25seTxJVmVjdG9yMz4sIG91dDogVE91dCk6IFRPdXQge1xuICAgIHJldHVybiBzZXQoXG4gICAgICAgIG91dCxcbiAgICAgICAgbGVmdC54ICsgcmlnaHQueCxcbiAgICAgICAgbGVmdC55ICsgcmlnaHQueSxcbiAgICAgICAgbGVmdC56ICsgcmlnaHQuelxuICAgICk7XG59XG5cbi8qKlxuICogQWRkcyB0d28gdmVjdG9ycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFJlZihyZWZMZWZ0OiBJVmVjdG9yMywgcmlnaHQ6IFJlYWRvbmx5PElWZWN0b3IzPikge1xuICAgIHJldHVybiBhZGQocmVmTGVmdCwgcmlnaHQsIHJlZkxlZnQpO1xufVxuXG4vKipcbiAqIFN1YnRyYWN0cyB0aGUgc2Vjb25kIHZlY3RvciBmcm9tIHRoZSBmaXJzdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0PFRPdXQgZXh0ZW5kcyBJVmVjdG9yMz4obGVmdDogUmVhZG9ubHk8SVZlY3RvcjM+LCByaWdodDogUmVhZG9ubHk8SVZlY3RvcjM+LCBvdXQ6IFRPdXQpOiBUT3V0IHtcbiAgICByZXR1cm4gc2V0KFxuICAgICAgICBvdXQsXG4gICAgICAgIGxlZnQueCAtIHJpZ2h0LngsXG4gICAgICAgIGxlZnQueSAtIHJpZ2h0LnksXG4gICAgICAgIGxlZnQueiAtIHJpZ2h0LnpcbiAgICApO1xufVxuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWN0b3JzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3Jvc3M8VE91dCBleHRlbmRzIElWZWN0b3IzPih2ZWN0b3IxOiBSZWFkb25seTxJVmVjdG9yMz4sIHZlY3RvcjI6IFJlYWRvbmx5PElWZWN0b3IzPiwgb3V0OiBUT3V0KTogVE91dCB7XG4gICAgcmV0dXJuIHNldChcbiAgICAgICAgb3V0LFxuICAgICAgICB2ZWN0b3IxLnkgKiB2ZWN0b3IyLnogLSB2ZWN0b3IxLnogKiB2ZWN0b3IyLnksXG4gICAgICAgIHZlY3RvcjEueiAqIHZlY3RvcjIueCAtIHZlY3RvcjEueCAqIHZlY3RvcjIueixcbiAgICAgICAgdmVjdG9yMS54ICogdmVjdG9yMi55IC0gdmVjdG9yMS55ICogdmVjdG9yMi54XG4gICAgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIHNldCxcbiAgICBub3JtYWxpemUsXG4gICAgbm9ybWFsaXplUmVmLFxuICAgIGFkZCxcbiAgICBzdWJ0cmFjdCxcbiAgICBhZGRSZWYsXG4gICAgZGlzdGFuY2UsXG4gICAgZGlzdGFuY2VWM1hZWixcbiAgICBkaXN0YW5jZVgxWTFaMVgyWTJaMixcbiAgICBjcm9zc1xufSIsImltcG9ydCB0eXBlIHsgUmVmT2JqZWN0LCBJVmVjdG9yMywgZmxvYXQsIGludCB9IGZyb20gXCIuLi9TaGFyZWQvVHlwZXMubWpzXCI7XHJcbmltcG9ydCB7IE9ialN0b3JlMkQgfSBmcm9tIFwiLi4vU2hhcmVkL1N0b3JlMkQubWpzXCI7XHJcbmltcG9ydCB7IGdldFRleHQgfSBmcm9tIFwiLi4vU2hhcmVkL1V0aWxzLm1qc1wiO1xyXG5pbXBvcnQgVmVjdG9yM01hdGggZnJvbSBcIi4uL1NoYXJlZC9WZWN0b3IzTWF0aC5tanNcIjtcclxuaW1wb3J0IHR5cGUgeyBJUmVhZG9ubHlBYnNQYXRjaGVkSGVpZ2h0TWFwIH0gZnJvbSBcIi4vQWJzUGF0Y2hlZEhlaWdodE1hcC5tanNcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVBhdGNoTG9kIHtcclxuICAgIGRpc3RhbmNlOiBmbG9hdDtcclxuICAgIGNvcmU6IGludDtcclxuICAgIGxlZnQ6IGludDtcclxuICAgIHJpZ2h0OiBpbnQ7XHJcbiAgICB0b3A6IGludDtcclxuICAgIGJvdHRvbTogaW50O1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0TG9kSGFzaCA9IChsb2Q6IElQYXRjaExvZCk6IGludCA9PiB7XHJcbiAgICByZXR1cm4gMTcgKiBsb2QuY29yZSAqIDMxICogbG9kLnRvcCAqIDMxICogbG9kLmxlZnQgKiAzMSAqIGxvZC5ib3R0b20gKiAzMSAqIGxvZC5yaWdodDtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlZmF1bHRQYXRjaExvZDogUmVhZG9ubHk8SVBhdGNoTG9kPiA9IHtcclxuICAgIGRpc3RhbmNlOiAwLFxyXG4gICAgY29yZTogICAgIDAsXHJcbiAgICBsZWZ0OiAgICAgMCxcclxuICAgIHJpZ2h0OiAgICAwLFxyXG4gICAgdG9wOiAgICAgIDAsXHJcbiAgICBib3R0b206ICAgMCxcclxufVxyXG5cclxuY29uc3QgZ2V0WmVyb1BhdGNoTG9kID0gKCk6IElQYXRjaExvZCA9PiAoe1xyXG4gICAgZGlzdGFuY2U6IDAsXHJcbiAgICBjb3JlOiAgICAgMCxcclxuICAgIGxlZnQ6ICAgICAwLFxyXG4gICAgcmlnaHQ6ICAgIDAsXHJcbiAgICB0b3A6ICAgICAgMCxcclxuICAgIGJvdHRvbTogICAwLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjbGFzcyBMb2RNYW5hZ2VyIHtcclxuXHJcbiAgICBwcml2YXRlIF96RmFyOiBpbnQ7XHJcbiAgICBwcml2YXRlIF9tYXA6IE9ialN0b3JlMkQ8SVBhdGNoTG9kPjtcclxuICAgIHByaXZhdGUgX3JlZ2lvbnM6IGZsb2F0W107XHJcblxyXG4gICAgcHJpdmF0ZSBfcGF0Y2hTaXplOiBpbnQ7XHJcbiAgICBwcml2YXRlIF9udW1QYXRjaGVzWDogaW50O1xyXG4gICAgcHJpdmF0ZSBfbnVtUGF0Y2hlc1o6IGludDtcclxuXHJcbiAgICBwcml2YXRlIF9tYXhMT0Q6IGludDtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IHpGYXIoKSB7IHJldHVybiB0aGlzLl96RmFyOyB9XHJcbiAgICBwdWJsaWMgZ2V0IG1heExPRCgpIHsgcmV0dXJuIHRoaXMuX21heExPRDsgfVxyXG5cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvcih6RmFyOiBpbnQsIHBhdGNoU2l6ZTogaW50LCBudW1QYXRjaGVzWDogaW50LCBudW1QYXRjaGVzWjogaW50KSB7XHJcbiAgICAgICAgdGhpcy5zZXRQYXJhbXMoekZhciwgcGF0Y2hTaXplLCBudW1QYXRjaGVzWCwgbnVtUGF0Y2hlc1opO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRaRmFyKHpGYXI6IGludCkge1xyXG4gICAgICAgIHRoaXMuX3pGYXIgPSB6RmFyO1xyXG4gICAgICAgIHRoaXMuX2NhbGNMb2RSZWdpb25zKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFBhcmFtcyh6RmFyOiBpbnQsIHBhdGNoU2l6ZTogaW50LCBudW1QYXRjaGVzWDogaW50LCBudW1QYXRjaGVzWjogaW50KSB7XHJcblxyXG4gICAgICAgIHRoaXMuX3BhdGNoU2l6ZSAgID0gcGF0Y2hTaXplO1xyXG4gICAgICAgIHRoaXMuX251bVBhdGNoZXNYID0gbnVtUGF0Y2hlc1g7XHJcbiAgICAgICAgdGhpcy5fbnVtUGF0Y2hlc1ogPSBudW1QYXRjaGVzWjtcclxuXHJcbiAgICAgICAgdGhpcy5fY2FsY01heExPRCgpO1xyXG5cclxuICAgICAgICB0aGlzLl9tYXAgPSBuZXcgT2JqU3RvcmUyRDxJUGF0Y2hMb2Q+KCk7XHJcbiAgICAgICAgdGhpcy5fbWFwLmluaXRCeVZhbChudW1QYXRjaGVzWCwgbnVtUGF0Y2hlc1osIGdldFplcm9QYXRjaExvZCk7XHJcbiAgICAgICAgdGhpcy5fcmVnaW9ucyA9IG5ldyBBcnJheTxudW1iZXI+KHRoaXMuX21heExPRCArIDEpO1xyXG5cclxuICAgICAgICB0aGlzLnNldFpGYXIoekZhcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY2FsY01heExPRCgpIHtcclxuXHJcbiAgICAgICAgY29uc3QgbnVtU2VnbWVudHMgICAgICAgICAgPSB0aGlzLl9wYXRjaFNpemUgLSAxO1xyXG4gICAgICAgIGNvbnN0IG51bVNlZ21lbnRzTG9nMiAgICAgID0gTWF0aC5sb2cyKG51bVNlZ21lbnRzKTtcclxuICAgICAgICBjb25zdCBudW1TZWdtZW50c0xvZzJDZWlsICA9IE1hdGguY2VpbChudW1TZWdtZW50c0xvZzIpO1xyXG4gICAgICAgIGNvbnN0IG51bVNlZ21lbnRzTG9nMkZsb29yID0gTWF0aC5mbG9vcihudW1TZWdtZW50c0xvZzIpO1xyXG5cclxuICAgICAgICBpZiAobnVtU2VnbWVudHNMb2cyQ2VpbCAhPT0gbnVtU2VnbWVudHNMb2cyRmxvb3IpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIG51bWJlciBvZiB2ZXJ0aWNlcyBpbiB0aGUgcGF0Y2ggbWludXMgb25lIG11c3QgYmUgYSBwb3dlciBvZiB0d29cXG5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgY29uc3QgcGF0Y2hTaXplTG9nMiA9IG51bVNlZ21lbnRzTG9nMkZsb29yO1xyXG5cclxuICAgICAgICB0aGlzLl9tYXhMT0QgPSBwYXRjaFNpemVMb2cyIC0gMTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jYWxjTG9kUmVnaW9ucygpIHtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogV2UgY2FuIHVzZSB0aGUgcmluZyBzeXN0ZW0gdG8gZGV0ZXJtaW5lIHRoZSBMT0QuXHJcbiAgICAgICAgLy8gVE9ETzogQmFzZWQgb24gdGhlIGhlaWdodHMgd2UgY2FuIGNhbGN1bGF0ZSB0aGUgb3B0aW1hbCBsb2RzXHJcblxyXG4gICAgICAgIGxldCBzdW0gPSAwO1xyXG4gICAgXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9tYXhMT0QgKyAxOyBpKyspIHtcclxuICAgICAgICAgICAgc3VtICs9IGkgKyAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHggPSB0aGlzLl96RmFyIC8gc3VtO1xyXG4gICAgICAgIGxldCB0ZW1wID0gMDtcclxuICAgIFxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fbWF4TE9EICsgMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1clJhbmdlID0gKHggKiAoaSArIDEpKSB8IDA7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlZ2lvbnNbaV0gPSB0ZW1wICsgY3VyUmFuZ2U7XHJcbiAgICAgICAgICAgIHRlbXAgKz0gY3VyUmFuZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwcmludExvZE1hcCgpIHtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgc3RyID0gJyc7XHJcblxyXG4gICAgICAgIGNvbnN0IG1heExvZE1heFogID0gdGhpcy5fbnVtUGF0Y2hlc1ogLSAxO1xyXG4gICAgICAgIGNvbnN0IG1heExvZE1heFggID0gdGhpcy5fbnVtUGF0Y2hlc1g7XHJcblxyXG4gICAgICAgIGxldCBtYXhDb3JlID0gMDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgbG9kTWFwWiA9IG1heExvZE1heFo7IGxvZE1hcFogPj0gMDsgbG9kTWFwWi0tKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBsb2RNYXBYID0gMCA7IGxvZE1hcFggPCBtYXhMb2RNYXhYOyBsb2RNYXBYKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX21hcC5nZXQobG9kTWFwWCwgbG9kTWFwWikuY29yZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobWF4Q29yZSA8IHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4Q29yZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBsb2RNYXhOdW1iZXJDb3VudCAgPSBtYXhMb2RNYXhaLnRvU3RyaW5nKCkubGVuZ3RoO1xyXG4gICAgICAgIGNvbnN0IGNvcmVNYXhOdW1iZXJDb3VudCA9IG1heENvcmUudG9TdHJpbmcoKS5sZW5ndGg7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yIChsZXQgbG9kTWFwWiA9IG1heExvZE1heFo7IGxvZE1hcFogPj0gMDsgbG9kTWFwWi0tKSB7XHJcbiAgICAgICAgICAgIHN0ciArPSBnZXRUZXh0KGxvZE1hcFosIGxvZE1heE51bWJlckNvdW50LCAnICcpICsgJzogJztcclxuICAgICAgICAgICAgZm9yIChsZXQgbG9kTWFwWCA9IDAgOyBsb2RNYXBYIDwgbWF4TG9kTWF4WDsgbG9kTWFwWCsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX21hcC5nZXQobG9kTWFwWCwgbG9kTWFwWikuY29yZTtcclxuICAgICAgICAgICAgICAgIHN0ciArPSBnZXRUZXh0KHZhbHVlLCBjb3JlTWF4TnVtYmVyQ291bnQsICcgJykgKyAnICc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3RyICs9ICdcXG4nO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coc3RyKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGlzdGFuY2VUb0xvZChkaXN0YW5jZTogZmxvYXQpIHtcclxuXHJcbiAgICAgICAgbGV0IGxvZCA9IHRoaXMuX21heExPRDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9tYXhMT0Q7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDwgdGhpcy5fcmVnaW9uc1tpXSkge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsb2QgPSBpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICByZXR1cm4gbG9kO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRQYXRjaExvZChwYXRjaFg6IGludCwgcGF0Y2haOiBpbnQpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbWFwLmdldChwYXRjaFgsIHBhdGNoWik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFBhdGNoTG9kQnlJbmRleChpbmRleDogaW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hcC5nZXRCeUluZGV4KGluZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlKGNhbWVyYVBvczogUmVmT2JqZWN0PElWZWN0b3IzPiwgaGVpZ2h0TWFwOiBJUmVhZG9ubHlBYnNQYXRjaGVkSGVpZ2h0TWFwLCBjZW50ZXI6IGJvb2xlYW4gPSB0cnVlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3QgYSA9IHRoaXMudXBkYXRlTG9kTWFwUGFzczEoY2FtZXJhUG9zLCBoZWlnaHRNYXAsIGNlbnRlcik7XHJcbiAgICAgICAgY29uc3QgYiA9IHRoaXMudXBkYXRlTG9kTWFwUGFzczIoKTtcclxuICAgICAgICByZXR1cm4gYSB8fCBiO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB1cGRhdGVMb2RNYXBQYXNzMShjYW1lcmFQb3M6IFJlZk9iamVjdDxJVmVjdG9yMz4sIGhlaWdodE1hcDogSVJlYWRvbmx5QWJzUGF0Y2hlZEhlaWdodE1hcCwgY2VudGVyOiBib29sZWFuKSB7XHJcblxyXG4gICAgICAgIGxldCBoYXNDaGFuZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgY29uc3QgY2VudGVyU3RlcCA9IHRoaXMuX3BhdGNoU2l6ZSAvIDIgfCAwO1xyXG4gICAgICAgIGNvbnN0IGhhbGZXaWR0aCAgPSBoZWlnaHRNYXAud2lkdGggLyAyO1xyXG4gICAgICAgIGNvbnN0IGhhbGZEZXB0aCAgPSBoZWlnaHRNYXAuZGVwdGggLyAyOyBcclxuXHJcbiAgICAgICAgZm9yIChsZXQgbG9kTWFwWiA9IDA7IGxvZE1hcFogPCB0aGlzLl9udW1QYXRjaGVzWjsgbG9kTWFwWisrKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBsb2RNYXBYID0gMDsgbG9kTWFwWCA8IHRoaXMuX251bVBhdGNoZXNYOyBsb2RNYXBYKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCB4ID0gbG9kTWFwWCAqICh0aGlzLl9wYXRjaFNpemUgLSAxKSArIGNlbnRlclN0ZXA7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB6ID0gbG9kTWFwWiAqICh0aGlzLl9wYXRjaFNpemUgLSAxKSArIGNlbnRlclN0ZXA7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgcGF0Y2hDZW50ZXJYICAgICA9IGNlbnRlciA/IC1oYWxmV2lkdGggKyB4IDogeDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGNoQ2VudGVyWSAgICAgPSAoaGVpZ2h0TWFwLmdldFBhdGNoTWF4KGxvZE1hcFgsIGxvZE1hcFopICsgaGVpZ2h0TWFwLmdldFBhdGNoTWluKGxvZE1hcFgsIGxvZE1hcFopKSAvIDI7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRjaENlbnRlclogICAgID0gY2VudGVyID8gLWhhbGZEZXB0aCArIHogOiB6O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzdGFuY2VUb0NhbWVyYSA9IFZlY3RvcjNNYXRoLmRpc3RhbmNlVjNYWVooY2FtZXJhUG9zLCBwYXRjaENlbnRlclgsIHBhdGNoQ2VudGVyWSwgcGF0Y2hDZW50ZXJaKTtcclxuICAgICAgICAgICAgICAgIC8vY29uc3QgZGlzdGFuY2VUb0NhbWVyYSA9IFZlY3RvcjJNYXRoLmRpc3RhbmNlWDFaMVgyWjIoY2FtZXJhUG9zLngsIGNhbWVyYVBvcy56LCBwYXRjaENlbnRlclgsIHBhdGNoQ2VudGVyWik7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgY29yZUxvZCAgID0gdGhpcy5kaXN0YW5jZVRvTG9kKGRpc3RhbmNlVG9DYW1lcmEpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcFBhdGNoTE9EID0gdGhpcy5fbWFwLmdldChsb2RNYXBYLCBsb2RNYXBaKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocFBhdGNoTE9ELmNvcmUgIT09IGNvcmVMb2QpIHtcclxuICAgICAgICAgICAgICAgICAgICBoYXNDaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHBQYXRjaExPRC5kaXN0YW5jZSA9IGRpc3RhbmNlVG9DYW1lcmE7XHJcbiAgICAgICAgICAgICAgICBwUGF0Y2hMT0QuY29yZSA9IGNvcmVMb2Q7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBoYXNDaGFuZ2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHVwZGF0ZUxvZE1hcFBhc3MyKCkge1xyXG5cclxuICAgICAgICBsZXQgaGFzQ2hhbmdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGxvZE1hcFogPSAwOyBsb2RNYXBaIDwgdGhpcy5fbnVtUGF0Y2hlc1ogOyBsb2RNYXBaKyspIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGxvZE1hcFggPSAwOyBsb2RNYXBYIDwgdGhpcy5fbnVtUGF0Y2hlc1ggOyBsb2RNYXBYKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtICAgID0gdGhpcy5fbWFwLmdldChsb2RNYXBYLCBsb2RNYXBaKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvcmVMb2QgPSBpdGVtLmNvcmU7XHJcbiAgICBcclxuICAgICAgICAgICAgICAgIGxldCBpbmRleExlZnQgICA9IGxvZE1hcFg7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXhSaWdodCAgPSBsb2RNYXBYO1xyXG4gICAgICAgICAgICAgICAgbGV0IGluZGV4VG9wICAgID0gbG9kTWFwWjtcclxuICAgICAgICAgICAgICAgIGxldCBpbmRleEJvdHRvbSA9IGxvZE1hcFo7XHJcbiAgICBcclxuICAgICAgICAgICAgICAgIGlmIChsb2RNYXBYID4gMCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpbmRleExlZnQtLTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldiA9IGl0ZW0ubGVmdDtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5fbWFwLmdldChpbmRleExlZnQsIGxvZE1hcFopLmNvcmUgPiBjb3JlTG9kID8gMSA6IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubGVmdCA9IG5leHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2ICE9PSBuZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NoYW5nZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgICAgICAgICBpZiAobG9kTWFwWCA8IHRoaXMuX251bVBhdGNoZXNYIC0gMSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpbmRleFJpZ2h0Kys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXYgPSBpdGVtLnJpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLl9tYXAuZ2V0KGluZGV4UmlnaHQsIGxvZE1hcFopLmNvcmUgPiBjb3JlTG9kID8gMSA6IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ucmlnaHQgPSBuZXh0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJldiAhPT0gbmV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKGxvZE1hcFogPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4Qm90dG9tLS07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXYgPSBpdGVtLmJvdHRvbTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5fbWFwLmdldChsb2RNYXBYLCBpbmRleEJvdHRvbSkuY29yZSA+IGNvcmVMb2QgPyAxIDogMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5ib3R0b20gPSBuZXh0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJldiAhPT0gbmV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKGxvZE1hcFogPCB0aGlzLl9udW1QYXRjaGVzWiAtIDEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhUb3ArKztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldiA9IGl0ZW0udG9wO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLl9tYXAuZ2V0KGxvZE1hcFgsIGluZGV4VG9wKS5jb3JlID4gY29yZUxvZCA/IDEgOiAwO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpdGVtLnRvcCA9IG5leHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2ICE9PSBuZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NoYW5nZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaGFzQ2hhbmdlO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBMb2RNYW5hZ2VyOyIsImltcG9ydCB0eXBlIHsgZmxvYXQsIGludCwgUmVmT2JqZWN0LCB1bnNpZ25lZGludCBhcyB1bnNpZ25lZF9pbnQgfSBmcm9tIFwiLi4vU2hhcmVkL1R5cGVzLm1qc1wiO1xyXG5pbXBvcnQgeyBCT1RUT00sIExFRlQsIExvZEluZm8sIFJJR0hULCBUT1AgfSBmcm9tIFwiLi9Mb2RJbmZvLm1qc1wiO1xyXG5pbXBvcnQgTG9kTWFuYWdlciBmcm9tIFwiLi9Mb2RNYW5hZ2VyLm1qc1wiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJR3JpZCB7XHJcbiAgICByZWFkb25seSB3aWR0aDogaW50O1xyXG4gICAgcmVhZG9ubHkgZGVwdGg6IGludDtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJR3JpZFBhdGNoZWQgZXh0ZW5kcyBJR3JpZCB7XHJcbiAgICByZWFkb25seSBwYXRjaFNpemU6IGludDtcclxuICAgIHJlYWRvbmx5IG51bVBhdGNoZXNYOiBpbnQ7XHJcbiAgICByZWFkb25seSBudW1QYXRjaGVzWjogaW50O1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR3JpZEJ1aWxkZXIge1xyXG5cclxuICAgIHByaXZhdGUgX2xvZEluZm86IExvZEluZm9bXTtcclxuICAgIHByaXZhdGUgX2xvZE1hbmFnZXI6IExvZE1hbmFnZXI7XHJcbiAgICBwcml2YXRlIF9pbmRpY2VzOiBVaW50MzJBcnJheTtcclxuICAgIHByaXZhdGUgX2dyaWQ6IElHcmlkUGF0Y2hlZDtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IHpGYXIoKSB7IHJldHVybiB0aGlzLl9sb2RNYW5hZ2VyLnpGYXI7IH1cclxuICAgIHB1YmxpYyBnZXQgd2lkdGgoKSB7IHJldHVybiB0aGlzLl9ncmlkLndpZHRoOyB9XHJcbiAgICBwdWJsaWMgZ2V0IGRlcHRoKCkgeyByZXR1cm4gdGhpcy5fZ3JpZC5kZXB0aDsgfVxyXG4gICAgcHVibGljIGdldCBwYXRjaFNpemUoKSB7IHJldHVybiB0aGlzLl9ncmlkLnBhdGNoU2l6ZTsgfVxyXG4gICAgcHVibGljIGdldCBudW1QYXRjaGVzWCgpIHsgcmV0dXJuIHRoaXMuX2dyaWQubnVtUGF0Y2hlc1g7IH1cclxuICAgIHB1YmxpYyBnZXQgbnVtUGF0Y2hlc1ooKSB7IHJldHVybiB0aGlzLl9ncmlkLm51bVBhdGNoZXNaOyB9XHJcbiAgICBwdWJsaWMgZ2V0IG1heExPRCgpIHsgcmV0dXJuIHRoaXMubG9kTWFuYWdlci5tYXhMT0Q7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHBhdGNoSW5kaWNlcygpOiBSZWFkb25seTxVaW50MzJBcnJheT4geyByZXR1cm4gdGhpcy5faW5kaWNlcyBhcyBhbnk7IH1cclxuICAgIHB1YmxpYyBnZXQgbG9kTWFuYWdlcigpOiBMb2RNYW5hZ2VyIHsgcmV0dXJuIHRoaXMuX2xvZE1hbmFnZXI7IH1cclxuICAgIHB1YmxpYyBnZXQgbG9kSW5mbygpOiBSZWFkb25seTxSZWFkb25seTxMb2RJbmZvPj5bXSB7IHJldHVybiB0aGlzLl9sb2RJbmZvOyB9XHJcblxyXG4gICAgY29uc3RydWN0b3IoZ3JpZDogUmVmT2JqZWN0PElHcmlkUGF0Y2hlZD4sIHpGYXI6IGZsb2F0KSB7XHJcblxyXG4gICAgICAgIHRoaXMuX2dyaWQgPSBncmlkO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IHdpZHRoICAgICAgID0gZ3JpZC53aWR0aDtcclxuICAgICAgICBjb25zdCBkZXB0aCAgICAgICA9IGdyaWQuZGVwdGg7XHJcbiAgICAgICAgY29uc3QgcGF0Y2hTaXplICAgPSBncmlkLnBhdGNoU2l6ZTtcclxuICAgICAgICBjb25zdCBudW1QYXRjaGVzWCA9IGdyaWQubnVtUGF0Y2hlc1g7XHJcbiAgICAgICAgY29uc3QgbnVtUGF0Y2hlc1ogPSBncmlkLm51bVBhdGNoZXNaO1xyXG5cclxuICAgICAgICBpZiAod2lkdGggPj0gMHhmZmZmKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJNYXggd2lkdGggPSAlZFxcblwiLCAweGZmZmYgLTEpO1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChkZXB0aCA+PSAweGZmZmYpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIk1heCBkZXB0aCA9ICVkXFxuXCIsIDB4ZmZmZiAtMSk7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCh3aWR0aCAtIDEpICUgKHBhdGNoU2l6ZSAtIDEpICE9PSAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlY29tbWVuZGVkV2lkdGggPSAoKHdpZHRoIC0gMSArIHBhdGNoU2l6ZSAtIDEpIC8gKHBhdGNoU2l6ZSAtIDEpKSAqIChwYXRjaFNpemUgLSAxKSArIDE7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJXaWR0aCBtaW51cyAxICglZCkgbXVzdCBiZSBkaXZpc2libGUgYnkgcGF0Y2hTaXplIG1pbnVzIDEgKCVkKVxcblwiLCB3aWR0aCwgcGF0Y2hTaXplKTtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlRyeSB1c2luZyBXaWR0aCA9ICVkXFxuXCIsIHJlY29tbWVuZGVkV2lkdGgpO1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgoZGVwdGggLSAxKSAlIChwYXRjaFNpemUgLSAxKSAhPT0gMCkge1xyXG4gICAgICAgICAgICBjb25zdCByZWNvbW1lbmRlZERlcHRoID0gKChkZXB0aCAtIDEgKyBwYXRjaFNpemUgLSAxKSAvIChwYXRjaFNpemUgLSAxKSkgKiAocGF0Y2hTaXplIC0gMSkgKyAxO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRGVwdGggbWludXMgMSAoJWQpIG11c3QgYmUgZGl2aXNpYmxlIGJ5IHBhdGNoU2l6ZSBtaW51cyAxICglZClcXG5cIiwgZGVwdGgsIHBhdGNoU2l6ZSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJUcnkgdXNpbmcgV2lkdGggPSAlZFxcblwiLCByZWNvbW1lbmRlZERlcHRoKTtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGF0Y2hTaXplIDwgMykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVGhlIG1pbmltdW0gcGF0Y2ggc2l6ZSBpcyAzICglZClcXG5cIiwgcGF0Y2hTaXplKTtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgaWYgKHBhdGNoU2l6ZSAlIDIgPT09IDApIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlBhdGNoIHNpemUgbXVzdCBiZSBhbiBvZGQgbnVtYmVyICglZClcXG5cIiwgcGF0Y2hTaXplKTtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9idWlsZExvZHNBbmRJbmRpY2VzKHpGYXIsIHBhdGNoU2l6ZSwgbnVtUGF0Y2hlc1gsIG51bVBhdGNoZXNaKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0WkZhcih6RmFyOiBpbnQpIHtcclxuICAgICAgICB0aGlzLl9sb2RNYW5hZ2VyLnNldFpGYXIoekZhcik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgX2J1aWxkTG9kc0FuZEluZGljZXMoekZhcjogaW50LCBwYXRjaFNpemU6IGludCwgbnVtUGF0Y2hlc1g6IGludCwgbnVtUGF0Y2hlc1o6IGludCkge1xyXG5cclxuICAgICAgICB0aGlzLl9sb2RNYW5hZ2VyID0gbmV3IExvZE1hbmFnZXIoekZhciwgcGF0Y2hTaXplLCBudW1QYXRjaGVzWCwgbnVtUGF0Y2hlc1opO1xyXG4gICAgICAgIHRoaXMuX2xvZEluZm8gPSBuZXcgQXJyYXkodGhpcy5fbG9kTWFuYWdlci5tYXhMT0QgKyAxKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9sb2RJbmZvLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvZEluZm9baV0gPSBuZXcgTG9kSW5mbygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG51bUluZGljZXMgPSB0aGlzLl9jYWxjTnVtSW5kaWNlcygpO1xyXG5cclxuICAgICAgICB0aGlzLl9pbmRpY2VzID0gbmV3IFVpbnQzMkFycmF5KG51bUluZGljZXMpO1xyXG5cclxuICAgICAgICBudW1JbmRpY2VzID0gdGhpcy5faW5pdEluZGljZXModGhpcy5faW5kaWNlcyk7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkZpbmFsIG51bWJlciBvZiBpbmRpY2VzICVkXFxuXCIsIG51bUluZGljZXMpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIF9jYWxjTnVtSW5kaWNlcygpOiBpbnQge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBudW1RdWFkcyA9ICh0aGlzLnBhdGNoU2l6ZSAtIDEpICogKHRoaXMucGF0Y2hTaXplIC0gMSk7XHJcbiAgICAgICAgbGV0IG51bUluZGljZXMgPSAwO1xyXG5cclxuICAgICAgICBjb25zdCBtYXhQZXJtdXRhdGlvbnNQZXJMZXZlbCA9IDE2OyAvLyB0cnVlL2ZhbHNlIGZvciBlYWNoIG9mIHRoZSBmb3VyIHNpZGVzXHJcbiAgICAgICAgY29uc3QgaW5kaWNlc1BlclF1YWQgPSA2OyAgICAgICAgICAgLy8gdHdvIHRyaWFuZ2xlc1xyXG5cclxuICAgICAgICBmb3IgKGxldCBsb2QgPSAwOyBsb2QgPD0gdGhpcy5tYXhMT0Q7IGxvZCsrKSB7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJMT0QgJWQ6IG51bSBxdWFkcyAlZFxcblwiLCBsb2QsIG51bVF1YWRzKTtcclxuICAgICAgICAgICAgbnVtSW5kaWNlcyArPSBudW1RdWFkcyAqIGluZGljZXNQZXJRdWFkICogbWF4UGVybXV0YXRpb25zUGVyTGV2ZWw7XHJcbiAgICAgICAgICAgIG51bVF1YWRzIC89IDQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKFwiSW5pdGlhbCBudW1iZXIgb2YgaW5kaWNlcyAlZFxcblwiLCBudW1JbmRpY2VzKTtcclxuICAgICAgICByZXR1cm4gbnVtSW5kaWNlcztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0SW5kaWNlcyhpbmRpY2VzOiBVaW50MzJBcnJheSk6IGludCB7XHJcblxyXG4gICAgICAgIGxldCBpbmRleCA9IDA7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGxvZCA9IDA7IGxvZCA8PSB0aGlzLm1heExPRDsgbG9kKyspIHtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIioqKiBJbml0IGluZGljZXMgbG9kICVkICoqKlxcblwiLCBsb2QpO1xyXG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuX2luaXRJbmRpY2VzTE9EKGluZGV4LCBpbmRpY2VzLCBsb2QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXRJbmRpY2VzTE9EKGluZGV4OiBpbnQsIGluZGljZXM6IFVpbnQzMkFycmF5LCBsb2Q6IGludCk6IGludCB7XHJcblxyXG4gICAgICAgIGxldCB0b3RhbEluZGljZXNGb3JMT0QgPSAwO1xyXG4gICAgXHJcbiAgICAgICAgZm9yIChsZXQgbCA9IDA7IGwgPCBMRUZUOyBsKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPCBSSUdIVDsgcisrKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB0ID0gMDsgdCA8IFRPUDsgdCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYiA9IDA7IGIgPCBCT1RUT007IGIrKykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5mbyA9IHRoaXMuX2xvZEluZm9bbG9kXS5pbmZvW2xdW3JdW3RdW2JdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnN0YXJ0ID0gaW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gdGhpcy5faW5pdEluZGljZXNMT0RTaW5nbGUoaW5kZXgsIGluZGljZXMsIGxvZCwgbG9kICsgbCwgbG9kICsgciwgbG9kICsgdCwgbG9kICsgYik7XHJcbiAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5jb3VudCA9IGluZGV4IC0gaW5mby5zdGFydDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxJbmRpY2VzRm9yTE9EICs9IGluZm8uY291bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIlRvdGFsIGluZGljZXMgZm9yIExPRDogJWRcXG5cIiwgdG90YWxJbmRpY2VzRm9yTE9EKTtcclxuICAgICAgICByZXR1cm4gaW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdEluZGljZXNMT0RTaW5nbGUoaW5kZXg6IGludCwgaW5kaWNlczogVWludDMyQXJyYXksIGxvZENvcmU6IGludCwgbG9kTGVmdDogaW50LCBsb2RSaWdodDogaW50LCBsb2RUb3A6IGludCwgbG9kQm90dG9tOiBpbnQpOiBpbnQge1xyXG5cclxuICAgICAgICBjb25zdCB3aWR0aCAgID0gdGhpcy5wYXRjaFNpemU7XHJcbiAgICAgICAgY29uc3QgZmFuU3RlcCA9IE1hdGgucG93KDIsIGxvZENvcmUgKyAxKTsgICAgICAgLy8gbG9kID0gMCAtLT4gMiwgbG9kID0gMSAtLT4gNCwgbG9kID0gMiAtLT4gOCwgZXRjXHJcbiAgICAgICAgY29uc3QgZW5kUG9zICA9IHRoaXMucGF0Y2hTaXplIC0gMSAtIGZhblN0ZXA7ICAvLyBwYXRjaCBzaXplIDUsIGZhbiBzdGVwIDIgLS0+IEVuZFBvcyA9IDI7IHBhdGNoIHNpemUgOSwgZmFuIHN0ZXAgMiAtLT4gRW5kUG9zID0gNlxyXG5cclxuICAgICAgICBmb3IgKGxldCB6ID0gMCA7IHogPD0gZW5kUG9zIDsgeiArPSBmYW5TdGVwKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHggPSAwIDsgeCA8PSBlbmRQb3MgOyB4ICs9IGZhblN0ZXApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxMZWZ0ICAgPSB4ID09IDAgICAgICA/IGxvZExlZnQgICA6IGxvZENvcmU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsUmlnaHQgID0geCA9PSBlbmRQb3MgPyBsb2RSaWdodCAgOiBsb2RDb3JlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbEJvdHRvbSA9IHogPT0gMCAgICAgID8gbG9kQm90dG9tIDogbG9kQ29yZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxUb3AgICAgPSB6ID09IGVuZFBvcyA/IGxvZFRvcCAgICA6IGxvZENvcmU7XHJcbiAgICAgICAgICAgICAgICBpbmRleCA9IHRoaXMuX2NyZWF0ZVRyaWFuZ2xlRmFuKGluZGV4LCBpbmRpY2VzLCBsb2RDb3JlLCBsTGVmdCwgbFJpZ2h0LCBsVG9wLCBsQm90dG9tLCB4LCB6LCB3aWR0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NyZWF0ZVRyaWFuZ2xlRmFuKGluZGV4OiBpbnQsIGluZGljZXM6IFVpbnQzMkFycmF5LCBsb2RDb3JlOiBpbnQsIGxvZExlZnQ6IGludCwgbG9kUmlnaHQ6IGludCwgbG9kVG9wOiBpbnQsIGxvZEJvdHRvbTogaW50LCB4OiBpbnQsIHo6IGludCwgd2lkdGg6IGludCk6IHVuc2lnbmVkX2ludCB7XHJcblxyXG4gICAgICAgIGNvbnN0IHN0ZXBMZWZ0ICAgPSBNYXRoLnBvdygyLCBsb2RMZWZ0KTsgLy8gYmVjYXVzZSBMT0Qgc3RhcnRzIGF0IHplcm8uLi5cclxuICAgICAgICBjb25zdCBzdGVwUmlnaHQgID0gTWF0aC5wb3coMiwgbG9kUmlnaHQpO1xyXG4gICAgICAgIGNvbnN0IHN0ZXBUb3AgICAgPSBNYXRoLnBvdygyLCBsb2RUb3ApO1xyXG4gICAgICAgIGNvbnN0IHN0ZXBCb3R0b20gPSBNYXRoLnBvdygyLCBsb2RCb3R0b20pO1xyXG4gICAgICAgIGNvbnN0IHN0ZXBDZW50ZXIgPSBNYXRoLnBvdygyLCBsb2RDb3JlKTtcclxuXHJcbiAgICAgICAgY29uc3QgaW5kZXhDZW50ZXIgPSAoeiArIHN0ZXBDZW50ZXIpICogd2lkdGggKyB4ICsgc3RlcENlbnRlcjtcclxuXHJcbiAgICAgICAgLy8gZmlyc3QgdXBcclxuICAgICAgICBsZXQgaW5kZXhUZW1wMSA9IHogKiB3aWR0aCArIHg7XHJcbiAgICAgICAgbGV0IGluZGV4VGVtcDIgPSAoeiArIHN0ZXBMZWZ0KSAqIHdpZHRoICsgeDtcclxuXHJcbiAgICAgICAgaW5kZXggPSB0aGlzLl9hZGRUcmlhbmdsZShpbmRleCwgaW5kaWNlcywgaW5kZXhDZW50ZXIsIGluZGV4VGVtcDEsIGluZGV4VGVtcDIpO1xyXG5cclxuICAgICAgICAvLyBzZWNvbmQgdXBcclxuICAgICAgICBpZiAobG9kTGVmdCA9PSBsb2RDb3JlKSB7XHJcbiAgICAgICAgICAgIGluZGV4VGVtcDEgPSBpbmRleFRlbXAyO1xyXG4gICAgICAgICAgICBpbmRleFRlbXAyICs9IHN0ZXBMZWZ0ICogd2lkdGg7XHJcblxyXG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuX2FkZFRyaWFuZ2xlKGluZGV4LCBpbmRpY2VzLCBpbmRleENlbnRlciwgaW5kZXhUZW1wMSwgaW5kZXhUZW1wMik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBmaXJzdCByaWdodFxyXG4gICAgICAgIGluZGV4VGVtcDEgPSBpbmRleFRlbXAyO1xyXG4gICAgICAgIGluZGV4VGVtcDIgKz0gc3RlcFRvcDtcclxuXHJcbiAgICAgICAgaW5kZXggPSB0aGlzLl9hZGRUcmlhbmdsZShpbmRleCwgaW5kaWNlcywgaW5kZXhDZW50ZXIsIGluZGV4VGVtcDEsIGluZGV4VGVtcDIpO1xyXG5cclxuICAgICAgICAvLyBzZWNvbmQgcmlnaHRcclxuICAgICAgICBpZiAobG9kVG9wID09PSBsb2RDb3JlKSB7XHJcbiAgICAgICAgICAgIGluZGV4VGVtcDEgPSBpbmRleFRlbXAyO1xyXG4gICAgICAgICAgICBpbmRleFRlbXAyICs9IHN0ZXBUb3A7XHJcblxyXG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuX2FkZFRyaWFuZ2xlKGluZGV4LCBpbmRpY2VzLCBpbmRleENlbnRlciwgaW5kZXhUZW1wMSwgaW5kZXhUZW1wMik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBmaXJzdCBkb3duXHJcbiAgICAgICAgaW5kZXhUZW1wMSA9IGluZGV4VGVtcDI7XHJcbiAgICAgICAgaW5kZXhUZW1wMiAtPSBzdGVwUmlnaHQgKiB3aWR0aDtcclxuXHJcbiAgICAgICAgaW5kZXggPSB0aGlzLl9hZGRUcmlhbmdsZShpbmRleCwgaW5kaWNlcywgaW5kZXhDZW50ZXIsIGluZGV4VGVtcDEsIGluZGV4VGVtcDIpO1xyXG5cclxuICAgICAgICAvLyBzZWNvbmQgZG93blxyXG4gICAgICAgIGlmIChsb2RSaWdodCA9PT0gbG9kQ29yZSkge1xyXG4gICAgICAgICAgICBpbmRleFRlbXAxID0gaW5kZXhUZW1wMjtcclxuICAgICAgICAgICAgaW5kZXhUZW1wMiAtPSBzdGVwUmlnaHQgKiB3aWR0aDtcclxuXHJcbiAgICAgICAgICAgIGluZGV4ID0gdGhpcy5fYWRkVHJpYW5nbGUoaW5kZXgsIGluZGljZXMsIGluZGV4Q2VudGVyLCBpbmRleFRlbXAxLCBpbmRleFRlbXAyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZpcnN0IGxlZnRcclxuICAgICAgICBpbmRleFRlbXAxID0gaW5kZXhUZW1wMjtcclxuICAgICAgICBpbmRleFRlbXAyIC09IHN0ZXBCb3R0b207XHJcblxyXG4gICAgICAgIGluZGV4ID0gdGhpcy5fYWRkVHJpYW5nbGUoaW5kZXgsIGluZGljZXMsIGluZGV4Q2VudGVyLCBpbmRleFRlbXAxLCBpbmRleFRlbXAyKTtcclxuXHJcbiAgICAgICAgLy8gc2Vjb25kIGxlZnRcclxuICAgICAgICBpZiAobG9kQm90dG9tID09PSBsb2RDb3JlKSB7XHJcbiAgICAgICAgICAgIGluZGV4VGVtcDEgPSBpbmRleFRlbXAyO1xyXG4gICAgICAgICAgICBpbmRleFRlbXAyIC09IHN0ZXBCb3R0b207XHJcblxyXG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuX2FkZFRyaWFuZ2xlKGluZGV4LCBpbmRpY2VzLCBpbmRleENlbnRlciwgaW5kZXhUZW1wMSwgaW5kZXhUZW1wMik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfYWRkVHJpYW5nbGUoaW5kZXg6IHVuc2lnbmVkX2ludCwgaW5kaWNlczogVWludDMyQXJyYXksIHYxOiB1bnNpZ25lZF9pbnQsIHYyOiB1bnNpZ25lZF9pbnQsIHYzOiB1bnNpZ25lZF9pbnQpIHtcclxuICAgICAgICBpbmRpY2VzW2luZGV4KytdID0gdjE7XHJcbiAgICAgICAgaW5kaWNlc1tpbmRleCsrXSA9IHYyO1xyXG4gICAgICAgIGluZGljZXNbaW5kZXgrK10gPSB2MztcclxuICAgICAgICByZXR1cm4gaW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgLy8gVE9ET1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHcmlkQnVpbGRlcjsiLCJpbXBvcnQgdHlwZSB7IGZsb2F0LCBSZWZPYmplY3QsIHVuc2lnbmVkaW50IGFzIHVuc2lnbmVkX2ludCB9IGZyb20gXCIuLi9TaGFyZWQvVHlwZXMubWpzXCI7XHJcbmltcG9ydCB7IElSZWFkb25seUNvb3Jkc0J1ZmZlciwgQ29vcmRzQnVmZmVyIH0gZnJvbSBcIi4vQ29vcmRzQnVmZmVyLm1qc1wiO1xyXG5pbXBvcnQgQWJzUGF0Y2hlZEhlaWdodE1hcCwgeyB0eXBlIElSZWFkb25seUFic1BhdGNoZWRIZWlnaHRNYXAgfSBmcm9tIFwiLi9BYnNQYXRjaGVkSGVpZ2h0TWFwLm1qc1wiO1xyXG5pbXBvcnQgR3JpZEJ1aWxkZXIsIHsgSUdyaWRQYXRjaGVkIH0gZnJvbSBcIi4vR3JpZEJ1aWxkZXIubWpzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElHcm9taXBHcmlkV2l0aEhlaWdodCBleHRlbmRzIElHcmlkUGF0Y2hlZCB7XHJcbiAgICByZWFkb25seSBtaW5IZWlnaHQ6IGZsb2F0O1xyXG4gICAgcmVhZG9ubHkgbWF4SGVpZ2h0OiBmbG9hdDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdlb21pcEdyaWRCdWlsZGVyIGV4dGVuZHMgR3JpZEJ1aWxkZXIge1xyXG5cclxuICAgIHByaXZhdGUgX3ZlcnRpY2VzOiBDb29yZHNCdWZmZXI7XHJcblxyXG4gICAgcHJvdGVjdGVkIF9oZWlnaHRNYXA6IEFic1BhdGNoZWRIZWlnaHRNYXA8YW55PjtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IHBhdGNoVmVydGljZXMoKTogSVJlYWRvbmx5Q29vcmRzQnVmZmVyIHsgcmV0dXJuIHRoaXMuX3ZlcnRpY2VzOyB9XHJcbiAgICBwdWJsaWMgZ2V0IGhlaWdodE1hcCgpOiBJUmVhZG9ubHlBYnNQYXRjaGVkSGVpZ2h0TWFwIHsgcmV0dXJuIHRoaXMuX2hlaWdodE1hcDsgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKGhlaWdodE1hcDogUmVmT2JqZWN0PEFic1BhdGNoZWRIZWlnaHRNYXA8YW55Pj4sIHpGYXI6IGZsb2F0KSB7XHJcblxyXG4gICAgICAgIHN1cGVyKGhlaWdodE1hcCwgekZhcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5faGVpZ2h0TWFwID0gaGVpZ2h0TWFwO1xyXG4gICAgICAgIHRoaXMuX3ZlcnRpY2VzICA9IG5ldyBDb29yZHNCdWZmZXIodGhpcy5faGVpZ2h0TWFwLCB0aGlzLl9oZWlnaHRNYXAucGF0Y2hTaXplKTtcclxuICAgICAgICB0aGlzLl92ZXJ0aWNlcy5pbml0KCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdlb21pcEdyaWRCdWlsZGVyOyIsImltcG9ydCB0eXBlIHsgSVZlY3RvcjMsIFJlZk9iamVjdCwgZmxvYXQsIGludCB9IGZyb20gXCIuLi9TaGFyZWQvVHlwZXMubWpzXCI7XHJcbmltcG9ydCBHZW9taXBHcmlkQnVpbGRlciBmcm9tIFwiLi9HZW9taXBHcmlkQnVpbGRlci5tanNcIjtcclxuaW1wb3J0IHsgSVBhdGNoTG9kLCBkZWZhdWx0UGF0Y2hMb2QgfSBmcm9tIFwiLi9Mb2RNYW5hZ2VyLm1qc1wiO1xyXG5cclxuZXhwb3J0IHR5cGUgUGF0Y2hJbml0RnVuY3Rpb24gPSAoYmFzZUluZGV4OiBpbnQsIGJhc2VWZXJ0ZXg6IGludCwgY291bnQ6IGludCwgcGF0Y2hYOiBpbnQsIHBhdGNoWjogaW50LCBtaW5YOiBpbnQsIG1pblo6IGludCwgc2l6ZTogaW50LCBsb2RJbmZvOiBSZWFkb25seTxJUGF0Y2hMb2Q+KSA9PiB2b2lkO1xyXG5leHBvcnQgdHlwZSBSZW5kZXJQcmVwYXJlclBhdGNoRnVuY3Rpb24gPSAodmlzaWJsZTogYm9vbGVhbiwgYmFzZUluZGV4OiBpbnQsIGJhc2VWZXJ0ZXg6IGludCwgY291bnQ6IGludCwgcGF0Y2hYOiBpbnQsIHBhdGNoWjogaW50LCBtaW5YOiBpbnQsIG1pblo6IGludCwgc2l6ZTogaW50LCBsb2RJbmZvOiBSZWFkb25seTxJUGF0Y2hMb2Q+KSA9PiB2b2lkO1xyXG5leHBvcnQgdHlwZSBGcnVzdHVtU3BoZXJlVGVzdEZ1bmN0aW9uID0gKGxvY2FsWDogZmxvYXQsIGxvY2FsWTogZmxvYXQsIGxvY2FsWjogZmxvYXQsIHJhZGl1czogZmxvYXQpID0+IGJvb2xlYW47XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElHcmlkUGF0Y2hJbml0aWFsaXplciB7XHJcbiAgICBpbml0UGF0Y2g6IFBhdGNoSW5pdEZ1bmN0aW9uLFxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElHcmlkUGF0Y2hSZW5kZXJQcmVwYXJlciB7XHJcbiAgICBwcmVwYXJlUGF0Y2g6IFJlbmRlclByZXBhcmVyUGF0Y2hGdW5jdGlvbixcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJRnJ1c3R1bSB7XHJcbiAgICBjb250YWluc1NwaGVyZTogRnJ1c3R1bVNwaGVyZVRlc3RGdW5jdGlvbixcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdlb21pcEdyaWRSZW5kZXJQcmVwYXJlciBleHRlbmRzIEdlb21pcEdyaWRCdWlsZGVyIHtcclxuXHJcbiAgICBwdWJsaWMgaW5pdFBhdGNoZXMoaW5pdGlhbGl6ZXI6IElHcmlkUGF0Y2hJbml0aWFsaXplcikge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAobGV0IHBhdGNoWiA9IDA7IHBhdGNoWiA8IHRoaXMubnVtUGF0Y2hlc1o7IHBhdGNoWisrKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBwYXRjaFggPSAwOyBwYXRjaFggPCB0aGlzLm51bVBhdGNoZXNYOyBwYXRjaFgrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IG1pblggPSBwYXRjaFggKiAodGhpcy5wYXRjaFNpemUgLSAxKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1pblogPSBwYXRjaFogKiAodGhpcy5wYXRjaFNpemUgLSAxKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmZvICAgICAgID0gdGhpcy5sb2RJbmZvWzBdLmluZm9bMF1bMF1bMF1bMF07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNlSW5kZXggID0gaW5mby5zdGFydDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJhc2VWZXJ0ZXggPSBtaW5aICogdGhpcy53aWR0aCArIG1pblg7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGluaXRpYWxpemVyLmluaXRQYXRjaChiYXNlSW5kZXgsIGJhc2VWZXJ0ZXgsIGluZm8uY291bnQsIHBhdGNoWCwgcGF0Y2haLCBtaW5YLCBtaW5aLCB0aGlzLnBhdGNoU2l6ZSwgZGVmYXVsdFBhdGNoTG9kKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHByaW50TG9kTWFwKCkge1xyXG4gICAgICAgIHRoaXMubG9kTWFuYWdlci5wcmludExvZE1hcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVMb2RzKGxvY2FsQ2FtZXJhUG9zOiBSZWZPYmplY3Q8SVZlY3RvcjM+LCBjZW50ZXI6IGJvb2xlYW4gPSB0cnVlKSB7XHJcbiAgICAgICAgdGhpcy5sb2RNYW5hZ2VyLnVwZGF0ZShsb2NhbENhbWVyYVBvcywgdGhpcy5oZWlnaHRNYXAsIGNlbnRlcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGVhY2hQYXRjaGVzKHJlbmRlclByZXBhcmVyOiBJR3JpZFBhdGNoUmVuZGVyUHJlcGFyZXIsIGZydXN0dW0/OiBJRnJ1c3R1bSkge1xyXG5cclxuICAgICAgICBjb25zdCBwYXRjaFNpemVOb3JtID0gdGhpcy5wYXRjaFNpemUgLSAxO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBwYXRjaFogPSAwOyBwYXRjaFogPCB0aGlzLm51bVBhdGNoZXNaOyBwYXRjaForKykge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbWluWiA9IHBhdGNoWiAqIHBhdGNoU2l6ZU5vcm07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBwYXRjaFggPSAwOyBwYXRjaFggPCB0aGlzLm51bVBhdGNoZXNYOyBwYXRjaFgrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IG1pblggPSBwYXRjaFggKiBwYXRjaFNpemVOb3JtO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHZpc2libGUgPSAhIWZydXN0dW0gJiYgdGhpcy5faXNQYXRjaEluc2lkZVZpZXdGcnVzdHVtQnlTcGhlcmUocGF0Y2hYLCBwYXRjaFosIGZydXN0dW0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHBsb2QgPSB0aGlzLmxvZE1hbmFnZXIuZ2V0UGF0Y2hMb2QocGF0Y2hYLCBwYXRjaFopO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgQyA9IHBsb2QuY29yZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IEwgPSBwbG9kLmxlZnQ7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBSID0gcGxvZC5yaWdodDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IFQgPSBwbG9kLnRvcDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IEIgPSBwbG9kLmJvdHRvbTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGluZm8gPSB0aGlzLmxvZEluZm9bQ10uaW5mb1tMXVtSXVtUXVtCXTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNlSW5kZXggID0gaW5mby5zdGFydDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJhc2VWZXJ0ZXggPSBtaW5aICogdGhpcy53aWR0aCArIG1pblg7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHJlbmRlclByZXBhcmVyLnByZXBhcmVQYXRjaCh2aXNpYmxlLCBiYXNlSW5kZXgsIGJhc2VWZXJ0ZXgsIGluZm8uY291bnQsIHBhdGNoWCwgcGF0Y2haLCBtaW5YLCBtaW5aLCB0aGlzLnBhdGNoU2l6ZSwgcGxvZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaXNQYXRjaEluc2lkZVZpZXdGcnVzdHVtQnlTcGhlcmUocGF0Y2hCYXNlWDogaW50LCBwYXRjaEJhc2VaOiBpbnQsIGZydXN0dW06IElGcnVzdHVtKTogYm9vbGVhbiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHBhdGNoTWluSGVpZ2h0ID0gdGhpcy5oZWlnaHRNYXAuZ2V0UGF0Y2hNaW4ocGF0Y2hCYXNlWCwgcGF0Y2hCYXNlWik7XHJcbiAgICAgICAgY29uc3QgcGF0Y2hNYXhIZWlnaHQgPSB0aGlzLmhlaWdodE1hcC5nZXRQYXRjaE1heChwYXRjaEJhc2VYLCBwYXRjaEJhc2VaKTtcclxuXHJcbiAgICAgICAgY29uc3QgcGF0Y2hSYWRpdXMgICAgICAgPSB0aGlzLnBhdGNoU2l6ZSAvIDI7XHJcbiAgICAgICAgY29uc3QgcGF0Y2hIZWlnaHRSYWRpdXMgPSBwYXRjaE1heEhlaWdodCAtIHBhdGNoTWluSGVpZ2h0O1xyXG5cclxuICAgICAgICBjb25zdCBwYXRjaENlbnRlclggICA9IChwYXRjaEJhc2VYICogdGhpcy5wYXRjaFNpemUpICsgcGF0Y2hSYWRpdXM7XHJcbiAgICAgICAgY29uc3QgcGF0Y2hDZW50ZXJZICAgPSAocGF0Y2hNYXhIZWlnaHQgKyBwYXRjaE1pbkhlaWdodCkgLyAyO1xyXG4gICAgICAgIGNvbnN0IHBhdGNoQ2VudGVyWiAgID0gKHBhdGNoQmFzZVogKiB0aGlzLnBhdGNoU2l6ZSkgKyBwYXRjaFJhZGl1cztcclxuICAgICAgICBjb25zdCByYWRpdXMgICAgICAgICA9IChwYXRjaFJhZGl1cyA+IHBhdGNoSGVpZ2h0UmFkaXVzID8gcGF0Y2hSYWRpdXMgOiBwYXRjaEhlaWdodFJhZGl1cykgKiBNYXRoLlNRUlQyO1xyXG5cclxuICAgICAgICAvLyBjZW50ZXIgdGhlIHBhdGNoZXMgcmVsYXRpdmUgdG8gdGhlIGVudGl0eSBjZW50ZXJcclxuICAgICAgICBjb25zdCBwYXRjaENlbnRlcmVkWCA9ICgtdGhpcy53aWR0aCAvIDIpICsgcGF0Y2hDZW50ZXJYO1xyXG4gICAgICAgIGNvbnN0IHBhdGNoQ2VudGVyZWRaID0gKC10aGlzLmRlcHRoIC8gMikgKyBwYXRjaENlbnRlclo7XHJcblxyXG4gICAgICAgIHJldHVybiBmcnVzdHVtLmNvbnRhaW5zU3BoZXJlKHBhdGNoQ2VudGVyZWRYLCBwYXRjaENlbnRlclksIHBhdGNoQ2VudGVyZWRaLCByYWRpdXMpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHZW9taXBHcmlkUmVuZGVyUHJlcGFyZXIiLCJpbXBvcnQgdHlwZSB7IGZsb2F0LCBpbnQgfSBmcm9tIFwiLi4vU2hhcmVkL1R5cGVzLm1qc1wiO1xuaW1wb3J0IHR5cGUgeyBJSGVpZ2h0TWFwRmlsZUltcG9ydE9wdGlvbnMgfSBmcm9tIFwiLi9BYnNIZWlnaHRNYXBGaWxlSU8ubWpzXCI7XG5pbXBvcnQgR2VvbWlwR3JpZFJlbmRlclByZXBhcmVyIGZyb20gXCIuL0dlb21pcEdyaWRSZW5kZXJQcmVwYXJlci5tanNcIjtcbmltcG9ydCBIZWlnaHRNYXAgZnJvbSBcIi4vSGVpZ2h0TWFwLm1qc1wiO1xuaW1wb3J0IHsgSVpvbmUgfSBmcm9tIFwiLi9JWm9uZS5tanNcIjtcblxuZXhwb3J0IGNsYXNzIEdlb21pcEdyaWQgZXh0ZW5kcyBHZW9taXBHcmlkUmVuZGVyUHJlcGFyZXIge1xuXG4gICAgcHVibGljIHNldEhlaWdodCh4OiBpbnQsIHo6IGludCwgdmFsdWU6IGZsb2F0KSB7XG4gICAgICAgIHRoaXMuX2hlaWdodE1hcC5zZXQoeCwgeiwgdmFsdWUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhcHBlbmRUb0hlaWdodCh4OiBpbnQsIHo6IGludCwgdmFsdWU6IGZsb2F0KSB7XG4gICAgICAgIHRoaXMuX2hlaWdodE1hcC5hcHBlbmQoeCwgeiwgdmFsdWUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBtdWx0aXBseVRvSGVpZ2h0KHg6IGludCwgejogaW50LCB2YWx1ZTogZmxvYXQsIGRlZmF1bHRIZWlnaHQ6IGZsb2F0ID0gMCkge1xuICAgICAgICB0aGlzLl9oZWlnaHRNYXAubXVsdGlwbHkoeCwgeiwgdmFsdWUsIGRlZmF1bHRIZWlnaHQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzbW9vdGhIZWlnaHRzWm9uZSh6b25lOiBJWm9uZSwgbnA6IGZsb2F0LCByYWRpdXM6IGZsb2F0KSB7XG4gICAgICAgIHRoaXMuX2hlaWdodE1hcC5zbW9vdGhab25lKHpvbmUsIG5wLCByYWRpdXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBsb2FkSGVpZ2h0TWFwRnJvbUZpbGUoYnVmZmVyOiBBcnJheUJ1ZmZlciwgb3B0aW9ucz86IElIZWlnaHRNYXBGaWxlSW1wb3J0T3B0aW9ucywgbnA6IGZsb2F0ID0gLTEsIHJhZGl1czogaW50ID0gMCkge1xuICAgICAgICBjb25zdCBoZWFkZXIgPSBhd2FpdCB0aGlzLl9oZWlnaHRNYXAuZnJvbUZpbGUoYnVmZmVyLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5faGVpZ2h0TWFwLnNtb290aChucCwgcmFkaXVzKTtcbiAgICAgICAgdGhpcy5faGVpZ2h0TWFwLnJlY2FsY3VsYXRlTWluTWF4KHRoaXMuX2hlaWdodE1hcCk7XG4gICAgICAgIHRoaXMuX2hlaWdodE1hcC5yZWNhbGN1bGF0ZUFBQkIoKTtcbiAgICAgICAgcmV0dXJuIGhlYWRlcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgbG9hZEhlaWdodE1hcEZyb21JbWcoaW1nOiBJbWFnZUJpdG1hcCwgbnA6IGZsb2F0ID0gLTEsIHJhZGl1czogaW50ID0gMCkge1xuICAgICAgICB0aGlzLl9oZWlnaHRNYXAuZnJvbUltYWdlKGltZyk7XG4gICAgICAgIHRoaXMuX2hlaWdodE1hcC5zbW9vdGgobnAsIHJhZGl1cyk7XG4gICAgICAgIHRoaXMuX2hlaWdodE1hcC5yZWNhbGN1bGF0ZU1pbk1heCh0aGlzLl9oZWlnaHRNYXApO1xuICAgICAgICB0aGlzLl9oZWlnaHRNYXAucmVjYWxjdWxhdGVBQUJCKCk7XG4gICAgfVxuXG4gICAgcHVibGljIG5vcm1hbGl6ZUhlaWdodE1hcChtaW5IZWlnaHQ/OiBmbG9hdCwgbWF4SGVpZ2h0PzogZmxvYXQpIHtcbiAgICAgICAgXG4gICAgICAgIG1pbkhlaWdodCA/Pz0gdGhpcy5faGVpZ2h0TWFwLm1pbkhlaWdodDtcbiAgICAgICAgbWF4SGVpZ2h0ID8/PSB0aGlzLl9oZWlnaHRNYXAubWF4SGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuX2hlaWdodE1hcC5ub3JtYWxpemUobWluSGVpZ2h0LCBtYXhIZWlnaHQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRNaW5NYXhIZWlnaHQobWluSGVpZ2h0OiBmbG9hdCwgbWF4SGVpZ2h0OiBmbG9hdCkge1xuICAgICAgICB0aGlzLl9oZWlnaHRNYXAuc2V0TWluTWF4SGVpZ2h0KG1pbkhlaWdodCwgbWF4SGVpZ2h0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXBwZW5kSGVpZ2h0TWFwKFxuICAgICAgICBoZWlnaHRNYXA6IEhlaWdodE1hcCxcbiAgICAgICAgdmFsdWU6IGZsb2F0LFxuICAgICAgICB6b25lOiBJWm9uZSxcbiAgICAgICAgbWluSGVpZ2h0OiBmbG9hdCB8IG51bGwgPSBudWxsLFxuICAgICAgICBtYXhIZWlnaHQ6IGZsb2F0IHwgbnVsbCA9IG51bGxcbiAgICApOiB2b2lkIHtcbiAgICAgICAgdGhpcy5faGVpZ2h0TWFwLmNvbWJpbmVIZWlnaHRzKCcrJywgaGVpZ2h0TWFwLCB2YWx1ZSwgem9uZSwgMCwgbWluSGVpZ2h0LCBtYXhIZWlnaHQpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZWNhbGN1bGF0ZU1pbk1heCh6b25lOiBJWm9uZSwgYWFiYjogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcblxuICAgICAgICB0aGlzLl9oZWlnaHRNYXAucmVjYWxjdWxhdGVNaW5NYXgoem9uZSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoYWFiYikge1xuICAgICAgICAgICAgdGhpcy5faGVpZ2h0TWFwLnJlY2FsY3VsYXRlQUFCQigpO1xuICAgICAgICB9IFxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR2VvbWlwR3JpZCIsImltcG9ydCBHZW9taXBHcmlkIGZyb20gXCIuL0dlb21pcEdyaWQubWpzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQmFzZVRlcnJhaW4gZXh0ZW5kcyBHZW9taXBHcmlkIHtcclxuICAgIHB1YmxpYyBnZXQgbWluSGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHRNYXAubWluSGVpZ2h0OyB9XHJcbiAgICBwdWJsaWMgZ2V0IG1heEhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0TWFwLm1heEhlaWdodDsgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBCYXNlVGVycmFpbjsiLCJpbXBvcnQgeyBjYWxjTmV4dFBvd2VyT2ZUd28sIHJhbmRvbUZsb2F0UmFuZ2UgfSBmcm9tIFwiLi4vU2hhcmVkL1V0aWxzLm1qc1wiO1xuaW1wb3J0IHsgaW50LCBmbG9hdCB9IGZyb20gXCIuLi9TaGFyZWQvVHlwZXMubWpzXCI7XG5pbXBvcnQgQmFzZVRlcnJhaW4gZnJvbSBcIi4vVGVycmFpbi5tanNcIjtcblxuZXhwb3J0IGNsYXNzIE1pZHBvaW50RGlzcFRlcnJhaW4gZXh0ZW5kcyBCYXNlVGVycmFpbiB7XG5cbiAgICBwdWJsaWMgY3JlYXRlTWlkcG9pbnREaXNwbGFjZW1lbnQocm91Z2huZXNzOiBmbG9hdCk6IHZvaWQge1xuXG4gICAgICAgIGlmIChyb3VnaG5lc3MgPCAwLjApIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwicm91Z2huZXNzIG11c3QgYmUgcG9zaXRpdmVcIik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jcmVhdGVNaWRwb2ludERpc3BsYWNlbWVudEYzMihyb3VnaG5lc3MpO1xuICAgICAgICB0aGlzLm5vcm1hbGl6ZUhlaWdodE1hcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2NyZWF0ZU1pZHBvaW50RGlzcGxhY2VtZW50RjMyKHJvdWdobmVzczogZmxvYXQpOiB2b2lkIHtcblxuICAgICAgICBsZXQgcmVjdFNpemUgID0gY2FsY05leHRQb3dlck9mVHdvKHRoaXMud2lkdGgpO1xuICAgICAgICBsZXQgY3VySGVpZ2h0ID0gcmVjdFNpemUgLyAyLjA7XG5cbiAgICAgICAgY29uc3QgaGVpZ2h0UmVkdWNlID0gTWF0aC5wb3coMi4wLCAtcm91Z2huZXNzKTtcbiAgICBcbiAgICAgICAgd2hpbGUgKHJlY3RTaXplID4gMCkge1xuXG4gICAgICAgICAgICB0aGlzLl9kaWFtb25kU3RlcChyZWN0U2l6ZSwgY3VySGVpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMuX3NxdWFyZVN0ZXAocmVjdFNpemUsIGN1ckhlaWdodCk7XG5cbiAgICAgICAgICAgIHJlY3RTaXplID0gKHJlY3RTaXplIC8gMikgfCAwO1xuICAgICAgICAgICAgY3VySGVpZ2h0ICo9IGhlaWdodFJlZHVjZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX2RpYW1vbmRTdGVwKHJlY3RTaXplOiBpbnQsIGN1ckhlaWdodDogZmxvYXQpOiB2b2lkIHtcblxuICAgICAgICBjb25zdCBIYWxmUmVjdFNpemUgPSBNYXRoLmZsb29yKHJlY3RTaXplIC8gMik7XG5cbiAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLmRlcHRoOyB5ICs9IHJlY3RTaXplKSB7XG5cbiAgICAgICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCArPSByZWN0U2l6ZSkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCBuZXh0WCA9ICh4ICsgcmVjdFNpemUpICUgdGhpcy53aWR0aDtcbiAgICAgICAgICAgICAgICBsZXQgbmV4dFkgPSAoeSArIHJlY3RTaXplKSAlIHRoaXMuZGVwdGg7XG4gICAgXG4gICAgICAgICAgICAgICAgaWYgKG5leHRYIDwgeCkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0WCA9IHRoaXMud2lkdGggLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgICAgICBpZiAobmV4dFkgPCB5KSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHRZID0gdGhpcy5kZXB0aCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgICAgIGNvbnN0IHRvcExlZnQgICAgID0gdGhpcy5oZWlnaHRNYXAuZ2V0KHgsIHkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvcFJpZ2h0ICAgID0gdGhpcy5oZWlnaHRNYXAuZ2V0KG5leHRYLCB5KTtcbiAgICAgICAgICAgICAgICBjb25zdCBib3R0b21MZWZ0ICA9IHRoaXMuaGVpZ2h0TWFwLmdldCh4LCBuZXh0WSk7XG4gICAgICAgICAgICAgICAgY29uc3QgYm90dG9tUmlnaHQgPSB0aGlzLmhlaWdodE1hcC5nZXQobmV4dFgsIG5leHRZKTtcbiAgICBcbiAgICAgICAgICAgICAgICBjb25zdCBtaWRYID0gKHggKyBIYWxmUmVjdFNpemUpICUgdGhpcy53aWR0aDtcbiAgICAgICAgICAgICAgICBjb25zdCBtaWRZID0gKHkgKyBIYWxmUmVjdFNpemUpICUgdGhpcy5kZXB0aDtcbiAgICBcbiAgICAgICAgICAgICAgICBjb25zdCByYW5kVmFsdWUgPSByYW5kb21GbG9hdFJhbmdlKGN1ckhlaWdodCwgLWN1ckhlaWdodCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbWlkUG9pbnQgPSAodG9wTGVmdCArIHRvcFJpZ2h0ICsgYm90dG9tTGVmdCArIGJvdHRvbVJpZ2h0KSAvIDQuMDtcbiAgICBcbiAgICAgICAgICAgICAgICB0aGlzLnNldEhlaWdodChtaWRYLCBtaWRZLCBtaWRQb2ludCArIHJhbmRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9zcXVhcmVTdGVwKHJlY3RTaXplOiBpbnQsIGN1ckhlaWdodDogZmxvYXQpOiB2b2lkIHtcblxuICAgICAgICBjb25zdCBoYWxmUmVjdFNpemUgPSAocmVjdFNpemUgLyAyKSB8IDA7XG5cbiAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLmRlcHRoOyB5ICs9IHJlY3RTaXplKSB7XG5cbiAgICAgICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCArPSByZWN0U2l6ZSkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCBuZXh0WCA9ICh4ICsgcmVjdFNpemUpICUgdGhpcy53aWR0aDtcbiAgICAgICAgICAgICAgICBsZXQgbmV4dFkgPSAoeSArIHJlY3RTaXplKSAlIHRoaXMuZGVwdGg7XG4gICAgXG4gICAgICAgICAgICAgICAgaWYgKG5leHRYIDwgeCkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0WCA9IHRoaXMud2lkdGggLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgICAgICBpZiAobmV4dFkgPCB5KSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHRZID0gdGhpcy5kZXB0aCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgICAgIGNvbnN0IG1pZFggPSAoeCArIGhhbGZSZWN0U2l6ZSkgJSB0aGlzLndpZHRoO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1pZFkgPSAoeSArIGhhbGZSZWN0U2l6ZSkgJSB0aGlzLmRlcHRoO1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc3QgcHJldk1pZFggPSAoeCAtIGhhbGZSZWN0U2l6ZSArIHRoaXMud2lkdGgpICUgdGhpcy53aWR0aDtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2TWlkWSA9ICh5IC0gaGFsZlJlY3RTaXplICsgdGhpcy5kZXB0aCkgJSB0aGlzLmRlcHRoO1xuICAgIFxuICAgICAgICAgICAgICAgIGNvbnN0IGN1clRvcExlZnQgID0gdGhpcy5oZWlnaHRNYXAuZ2V0KHgsIHkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1clRvcFJpZ2h0ID0gdGhpcy5oZWlnaHRNYXAuZ2V0KG5leHRYLCB5KTtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJDZW50ZXIgICA9IHRoaXMuaGVpZ2h0TWFwLmdldChtaWRYLCBtaWRZKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2WUNlbnRlciA9IHRoaXMuaGVpZ2h0TWFwLmdldChtaWRYLCBwcmV2TWlkWSk7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VyQm90TGVmdCAgPSB0aGlzLmhlaWdodE1hcC5nZXQoeCwgbmV4dFkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZYQ2VudGVyID0gdGhpcy5oZWlnaHRNYXAuZ2V0KHByZXZNaWRYLCBtaWRZKTtcbiAgICBcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJMZWZ0TWlkID0gKGN1clRvcExlZnQgKyBjdXJDZW50ZXIgKyBjdXJCb3RMZWZ0ICsgcHJldlhDZW50ZXIpIC8gNC4wICsgcmFuZG9tRmxvYXRSYW5nZSgtY3VySGVpZ2h0LCBjdXJIZWlnaHQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1clRvcE1pZCAgPSAoY3VyVG9wTGVmdCArIGN1ckNlbnRlciArIGN1clRvcFJpZ2h0ICsgcHJldllDZW50ZXIpIC8gNC4wICsgcmFuZG9tRmxvYXRSYW5nZSgtY3VySGVpZ2h0LCBjdXJIZWlnaHQpO1xuICAgIFxuICAgICAgICAgICAgICAgIHRoaXMuc2V0SGVpZ2h0KG1pZFgsIHksIGN1clRvcE1pZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRIZWlnaHQoeCwgbWlkWSwgY3VyTGVmdE1pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59IiwiZXhwb3J0IGNsYXNzIFRlcnJhaW5SYXljYXN0UmVzdWx0IHtcblxuICAgIHB1YmxpYyB2ZXJ0ZXhJbmRleCA9IDA7XG4gICAgcHVibGljIGRpc3RhbmNlICAgID0gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICBwdWJsaWMgbG9jYWxOb3JtYWwgPSBuZXcgcGMuVmVjMygwLCAxLCAwKTtcbiAgICBwdWJsaWMgbm9ybWFsICAgICAgPSBuZXcgcGMuVmVjMygwLCAxLCAwKTtcbiAgICBwdWJsaWMgbG9jYWxQb2ludCAgPSBuZXcgcGMuVmVjMyhOdW1iZXIuTUFYX1ZBTFVFLCBOdW1iZXIuTUFYX1ZBTFVFLCBOdW1iZXIuTUFYX1ZBTFVFKTtcbiAgICBwdWJsaWMgcG9pbnQgICAgICAgPSBuZXcgcGMuVmVjMyhOdW1iZXIuTUFYX1ZBTFVFLCBOdW1iZXIuTUFYX1ZBTFVFLCBOdW1iZXIuTUFYX1ZBTFVFKTtcblxuICAgIHB1YmxpYyBjbGVhcigpIHtcbiAgICAgICAgdGhpcy52ZXJ0ZXhJbmRleCA9IDA7XG4gICAgICAgIHRoaXMuZGlzdGFuY2UgPSBOdW1iZXIuTUFYX1ZBTFVFO1xuICAgICAgICB0aGlzLmxvY2FsTm9ybWFsLnNldCgwLCAxLCAwKTtcbiAgICAgICAgdGhpcy5ub3JtYWwuc2V0KDAsIDEsIDApO1xuICAgICAgICB0aGlzLmxvY2FsUG9pbnQuc2V0KE51bWJlci5NQVhfVkFMVUUsIE51bWJlci5NQVhfVkFMVUUsIE51bWJlci5NQVhfVkFMVUUpO1xuICAgICAgICB0aGlzLnBvaW50LnNldChOdW1iZXIuTUFYX1ZBTFVFLCBOdW1iZXIuTUFYX1ZBTFVFLCBOdW1iZXIuTUFYX1ZBTFVFKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRlcnJhaW5SYXljYXN0UmVzdWx0OyIsImltcG9ydCB7IGludCB9IGZyb20gXCIuLi9TaGFyZWQvVHlwZXMubWpzXCI7XHJcbmltcG9ydCB7IEJPVFRPTSwgSVNpbmdsZUxvZEluZm8sIExFRlQsIExvZEluZm8sIFJJR0hULCBUT1AgfSBmcm9tIFwiLi9Mb2RJbmZvLm1qc1wiO1xyXG5pbXBvcnQgeyBJUGF0Y2hMb2QgfSBmcm9tIFwiLi9Mb2RNYW5hZ2VyLm1qc1wiO1xyXG5pbXBvcnQgQmFzZVRlcnJhaW4gZnJvbSBcIi4vVGVycmFpbi5tanNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBpbnN0RGF0YVNpemUgPSAyO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJSW5zdGFuY2luZ09iamVjdCB7XHJcbn1cclxuXHJcbi8vIFdlIGNhbiB1c2UgdWludDgsIGJ1dCB3ZSBvbmx5IHVzZSAyIGJ5dGVzLFxyXG4vLyBmb3Igb3B0aW1hbCBwZXJmb3JtYW5jZSBuZWVkIDQgYnl0ZXMgZm9yIHRoZSBidWZmZXIuXHJcbmV4cG9ydCB0eXBlICBUSW5zdENvb3Jkc09mZnNldEFyclR5cGUgPSBVaW50MTZBcnJheTtcclxuZXhwb3J0IGNvbnN0IFRJbnN0Q29vcmRzT2Zmc2V0QXJyVHlwZSA9IFVpbnQxNkFycmF5O1xyXG5cclxuZXhwb3J0IHR5cGUgVEJ1bGRlcjxUIGV4dGVuZHMgSUluc3RhbmNpbmdPYmplY3Q+ID0gKGxvZEluZm86IElQYXRjaExvZCwgcHJpbWl0aXZlSW5mbzogSVNpbmdsZUxvZEluZm8sIGluc3RhbmNpbmdEYXRhOiBUSW5zdENvb3Jkc09mZnNldEFyclR5cGUsIG1heEluc3RhbmNpbmdDb3VudDogaW50KSA9PiBUIHwgbnVsbDtcclxuZXhwb3J0IHR5cGUgVERlc3RydWN0b3I8VCBleHRlbmRzIElJbnN0YW5jaW5nT2JqZWN0PiA9IChvYmplY3Q6IFQpID0+IHZvaWQ7XHJcbmV4cG9ydCB0eXBlIFRTZWxlY3RvcjxUIGV4dGVuZHMgSUluc3RhbmNpbmdPYmplY3Q+ID0gKGl0ZW06IElTaW5nbGVMb2RJbmZvSW5zdGFuY2luZzxUPikgPT4gdm9pZDtcclxuXHJcbi8qKlxyXG4gKiBMb2QgZGF0YSB0eXBlIHdpdGggaW5kZXhlcyBbTE9EQ09SRV1bTEVGVF1bUklHSFRdW1RPUF1bQk9UVE9NXVxyXG4gKi9cclxuZXhwb3J0IHR5cGUgVERhdGE8VCBleHRlbmRzIElJbnN0YW5jaW5nT2JqZWN0PiA9IElTaW5nbGVMb2RJbmZvSW5zdGFuY2luZzxUPltdW11bXVtdW107XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElTaW5nbGVMb2RJbmZvSW5zdGFuY2luZzxUIGV4dGVuZHMgSUluc3RhbmNpbmdPYmplY3Q+IHtcclxuICAgIHZlcnRleEJhc2VJbmRleDogaW50O1xyXG4gICAgdmVydGV4Q291bnQ6IGludDtcclxuICAgIGRhdGE6IFVpbnQxNkFycmF5O1xyXG4gICAgY291bnQ6IGludDtcclxuICAgIG9iamVjdDogVCB8IG51bGw7XHJcbiAgICBoYXNDaGFuZ2VzOiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgUGF0Y2hJbnN0YW5jaW5nPFQgZXh0ZW5kcyBJSW5zdGFuY2luZ09iamVjdD4ge1xyXG5cclxuICAgIHByaXZhdGUgX3BhdGNoQ291bnQ6IGludDtcclxuXHJcbiAgICBwdWJsaWMgZGF0YTogVERhdGE8VD47XHJcbiAgICBwdWJsaWMgZ2V0IHBhdGNoQ291bnQoKSB7IHJldHVybiB0aGlzLl9wYXRjaENvdW50OyB9XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gW107XHJcbiAgICAgICAgdGhpcy5fcGF0Y2hDb3VudCA9IDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBmb3JFYWNoKGZuOiBUU2VsZWN0b3I8VD4pIHtcclxuICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IHRoaXMuZGF0YS5sZW5ndGg7IGMrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBsID0gMDsgbCA8IExFRlQ7IGwrKykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPCBSSUdIVDsgcisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgdCA9IDA7IHQgPCBUT1A7IHQrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBiID0gMDsgYiA8IEJPVFRPTTsgYisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWdtZW50ID0gdGhpcy5kYXRhW2NdW2xdW3JdW3RdW2JdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm4oc2VnbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlc3Ryb3lTZWdtZW50T2JqZWN0cyhpbmRleDogaW50LCBkZXN0cnVjdG9yOiBURGVzdHJ1Y3RvcjxUPikge1xyXG4gICAgICAgIGZvciAobGV0IGwgPSAwOyBsIDwgTEVGVDsgbCsrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgUklHSFQ7IHIrKykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgdCA9IDA7IHQgPCBUT1A7IHQrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGIgPSAwOyBiIDwgQk9UVE9NOyBiKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlZ21lbnQgPSB0aGlzLmRhdGFbaW5kZXhdW2xdW3JdW3RdW2JdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlZ21lbnQub2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXN0cnVjdG9yKHNlZ21lbnQub2JqZWN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnQub2JqZWN0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGVzdHJveShkZXN0cnVjdG9yOiBURGVzdHJ1Y3RvcjxUPikge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzdHJveVNlZ21lbnRPYmplY3RzKGksIGRlc3RydWN0b3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRhdGEubGVuZ3RoID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYnVpbGRGcm9tVGVycmFpbih0ZXJyYWluOiBCYXNlVGVycmFpbiwgb2JqZWN0QnVpbGRlcj86IFRCdWxkZXI8VD4pIHtcclxuXHJcbiAgICAgICAgdGhpcy5fcGF0Y2hDb3VudCA9IHRlcnJhaW4ubnVtUGF0Y2hlc1ggKiB0ZXJyYWluLm51bVBhdGNoZXNaO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IG5ldyBBcnJheSh0ZXJyYWluLmxvZEluZm8ubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgbG9kQ29yZSA9IDA7IGxvZENvcmUgPCB0aGlzLmRhdGEubGVuZ3RoOyBsb2RDb3JlKyspIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhW2xvZENvcmVdID0gdGhpcy5fYnVpbGRJbmZvKGxvZENvcmUsIHRlcnJhaW4ubG9kSW5mb1tsb2RDb3JlXSwgdGhpcy5fcGF0Y2hDb3VudCwgb2JqZWN0QnVpbGRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2J1aWxkSW5mbzxUIGV4dGVuZHMgSUluc3RhbmNpbmdPYmplY3Q+KGxvZENvcmU6IGludCwgbG9kSW5mbzogUmVhZG9ubHk8UmVhZG9ubHk8TG9kSW5mbz4+LCBwYXRjaENvdW50OiBpbnQsIG9iamVjdEJ1aWxkZXI/OiBUQnVsZGVyPFQ+KTogSVNpbmdsZUxvZEluZm9JbnN0YW5jaW5nPFQ+W11bXVtdW10ge1xyXG5cclxuICAgICAgICBjb25zdCBhcnI6IElTaW5nbGVMb2RJbmZvSW5zdGFuY2luZzxUPltdW11bXVtdID0gbmV3IEFycmF5KExFRlQpO1xyXG4gICAgXHJcbiAgICAgICAgZm9yIChsZXQgbCA9IDAgOyBsIDwgTEVGVCA7IGwrKykge1xyXG4gICAgXHJcbiAgICAgICAgICAgIGFycltsXSA9IG5ldyBBcnJheShSSUdIVCk7XHJcbiAgICBcclxuICAgICAgICAgICAgZm9yIChsZXQgciA9IDAgOyByIDwgUklHSFQgOyByKyspIHtcclxuICAgIFxyXG4gICAgICAgICAgICAgICAgYXJyW2xdW3JdID0gbmV3IEFycmF5KFRPUCk7XHJcbiAgICBcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHQgPSAwIDsgdCA8IFRPUCA7IHQrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGFycltsXVtyXVt0XSA9IG5ldyBBcnJheShCT1RUT00pO1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYiA9IDAgOyBiIDwgQk9UVE9NIDsgYisrKSB7XHJcbiAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5mbyA9IGxvZEluZm8uaW5mb1tsXVtyXVt0XVtiXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9kOiBJUGF0Y2hMb2QgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZTogLTEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3JlOiBsb2RDb3JlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiByLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiB0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tOiBiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhICAgPSBuZXcgVEluc3RDb29yZHNPZmZzZXRBcnJUeXBlKHBhdGNoQ291bnQgKiBpbnN0RGF0YVNpemUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvYmplY3QgPSBvYmplY3RCdWlsZGVyID8gb2JqZWN0QnVpbGRlcihsb2QsIGluZm8sIGRhdGEsIHBhdGNoQ291bnQpIDogbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFycltsXVtyXVt0XVtiXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRleEJhc2VJbmRleDogaW5mby5zdGFydCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRleENvdW50OiBpbmZvLmNvdW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBvYmplY3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNDaGFuZ2VzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICByZXR1cm4gYXJyO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQobG9kOiBJUGF0Y2hMb2QpOiBJU2luZ2xlTG9kSW5mb0luc3RhbmNpbmc8VD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFbbG9kLmNvcmVdW2xvZC5sZWZ0XVtsb2QucmlnaHRdW2xvZC50b3BdW2xvZC5ib3R0b21dO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbmNyZW1lbnQobG9kOiBJUGF0Y2hMb2QsIHg6IGludCwgejogaW50KTogSVNpbmdsZUxvZEluZm9JbnN0YW5jaW5nPFQ+IHtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBzaW5nbGUgICAgPSB0aGlzLmdldChsb2QpO1xyXG4gICAgICAgIGNvbnN0IHByZXZJbmRleCA9IHNpbmdsZS5jb3VudDtcclxuICAgICAgICBjb25zdCBpbmRleCAgICAgPSBwcmV2SW5kZXggKiBpbnN0RGF0YVNpemU7XHJcblxyXG4gICAgICAgIGlmIChzaW5nbGUuZGF0YVtpbmRleCArIDBdICE9PSB4IHx8XHJcbiAgICAgICAgICAgIHNpbmdsZS5kYXRhW2luZGV4ICsgMV0gIT09IHopIHtcclxuICAgICAgICAgICAgc2luZ2xlLmRhdGFbaW5kZXggKyAwXSA9IHg7XHJcbiAgICAgICAgICAgIHNpbmdsZS5kYXRhW2luZGV4ICsgMV0gPSB6O1xyXG4gICAgICAgICAgICBzaW5nbGUuaGFzQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzaW5nbGUuY291bnQrKztcclxuICAgICAgICByZXR1cm4gc2luZ2xlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB6ZXJvQWxsKCkge1xyXG5cclxuICAgICAgICBmb3IgKGxldCBsb2RDb3JlID0gMDsgbG9kQ29yZSA8IHRoaXMuZGF0YS5sZW5ndGg7IGxvZENvcmUrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBsID0gMDsgbCA8IExFRlQ7IGwrKykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPCBSSUdIVDsgcisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgdCA9IDA7IHQgPCBUT1A7IHQrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBiID0gMDsgYiA8IEJPVFRPTTsgYisrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2luZ2xlID0gdGhpcy5kYXRhW2xvZENvcmVdW2xdW3JdW3RdW2JdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2luZ2xlLmNvdW50ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7IGludCB9IGZyb20gXCIuLi9TaGFyZWQvVHlwZXMubWpzXCI7XHJcbmltcG9ydCB7IEJPVFRPTSwgTEVGVCwgUklHSFQsIFRPUCB9IGZyb20gXCIuLi9UZXJyYWluU3lzdGVtL0xvZEluZm8ubWpzXCI7XHJcbmltcG9ydCB7IGluc3REYXRhU2l6ZSwgUGF0Y2hJbnN0YW5jaW5nIH0gZnJvbSBcIi4uL1RlcnJhaW5TeXN0ZW0vUGF0Y2hJbnN0YW5jaW5nLm1qc1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRlcnJhaW5QYXRoY2VzSW5zdGFuY2luZyBleHRlbmRzIFBhdGNoSW5zdGFuY2luZzxwY3guTWVzaEluc3RhbmNlPiB7XHJcblxyXG4gICAgcHVibGljIGVuYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IG1lc2hJbnN0YW5jZUNvdW50KCkgeyByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aCAqIExFRlQgKiBSSUdIVCAqIFRPUCAqIEJPVFRPTTsgfVxyXG5cclxuICAgIHB1YmxpYyBhcHBlbmRNZXNoSW5zdGFuY2VzKGFycjogcGN4Lk1lc2hJbnN0YW5jZVtdLCBvZmZzZXQ6IGludCA9IDApIHtcclxuXHJcbiAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgdGhpcy5kYXRhLmxlbmd0aDsgYysrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGwgPSAwOyBsIDwgTEVGVDsgbCsrKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IFJJR0hUOyByKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCB0ID0gMDsgdCA8IFRPUDsgdCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGIgPSAwOyBiIDwgQk9UVE9NOyBiKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaHVuayA9IHRoaXMuZGF0YVtjXVtsXVtyXVt0XVtiXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2h1bmsub2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyW2krKyArIG9mZnNldF0gPSBjaHVuay5vYmplY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBiZWdpbihjYXN0U2hhZG93OiBib29sZWFuID0gZmFsc2UsIHJlY2VpdmVTaGFkb3c6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgdGhpcy5kYXRhLmxlbmd0aDsgYysrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGwgPSAwOyBsIDwgTEVGVDsgbCsrKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IFJJR0hUOyByKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCB0ID0gMDsgdCA8IFRPUDsgdCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGIgPSAwOyBiIDwgQk9UVE9NOyBiKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaHVuayA9IHRoaXMuZGF0YVtjXVtsXVtyXVt0XVtiXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rT2JqZWN0ID0gY2h1bmsub2JqZWN0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rLmNvdW50ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rLmhhc0NoYW5nZXMgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2h1bmtPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHVua09iamVjdC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtPYmplY3QudmlzaWJsZVRoaXNGcmFtZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rT2JqZWN0LmNhc3RTaGFkb3cgPSBjYXN0U2hhZG93O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rT2JqZWN0LnJlY2VpdmVTaGFkb3cgPSByZWNlaXZlU2hhZG93O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBlbmQoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCB0aGlzLmRhdGEubGVuZ3RoOyBjKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgbCA9IDA7IGwgPCBMRUZUOyBsKyspIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgUklHSFQ7IHIrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHQgPSAwOyB0IDwgVE9QOyB0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYiA9IDA7IGIgPCBCT1RUT007IGIrKykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rID0gdGhpcy5kYXRhW2NdW2xdW3JdW3RdW2JdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2h1bmtPYmplY3QgPSBjaHVuay5vYmplY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaHVua09iamVjdCAmJiBjaHVuay5jb3VudCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHVua09iamVjdC5pbnN0YW5jaW5nQ291bnQgPSBjaHVuay5jb3VudDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNodW5rLmhhc0NoYW5nZXMgJiYgY2h1bmtPYmplY3QuaW5zdGFuY2luZ0RhdGEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IHBlcmZvcm1hbmNlIGltcHJvdmVtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY2h1bmtPYmplY3QuaW5zdGFuY2luZ0RhdGEudmVydGV4QnVmZmVyPy51bmxvY2soKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IGNodW5rLmNvdW50ICogaW5zdERhdGFTaXplO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2ZXJ0ZXhCdWZmZXIgPSBjaHVua09iamVjdC5pbnN0YW5jaW5nRGF0YS52ZXJ0ZXhCdWZmZXI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl93cml0ZUJ1ZmZlcih2ZXJ0ZXhCdWZmZXIsIGNodW5rLmRhdGEsIGxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3dyaXRlQnVmZmVyKHZlcnRleEJ1ZmZlcjogcGN4LlZlcnRleEJ1ZmZlciB8IG51bGwsIGRhdGE6IFVpbnQxNkFycmF5LCBsZW5ndGg6IGludCkge1xyXG5cclxuICAgICAgICBpZiAodmVydGV4QnVmZmVyKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBkZXZpY2UgPSB2ZXJ0ZXhCdWZmZXIuZGV2aWNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRldmljZS5pc1dlYkdMMikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2wgPSAoZGV2aWNlIGFzIHBjeC5XZWJnbEdyYXBoaWNzRGV2aWNlKS5nbDtcclxuICAgICAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIuaW1wbC5idWZmZXJJZCk7XHJcbiAgICAgICAgICAgICAgICBnbC5idWZmZXJTdWJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgMCwgZGF0YSwgMCwgbGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChkZXZpY2UuaXNXZWJHUFUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHdncHUgICA9IChkZXZpY2UgYXMgYW55KS53Z3B1IGFzIEdQVURldmljZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1ZmZlciA9IHZlcnRleEJ1ZmZlci5pbXBsLmJ1ZmZlciBhcyBHUFVCdWZmZXI7XHJcbiAgICAgICAgICAgICAgICB3Z3B1LnF1ZXVlLndyaXRlQnVmZmVyKGJ1ZmZlciwgMCwgZGF0YSwgMCwgbGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Vuc3VwcG9ydGVkIGRldmljZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHR5cGUgeyBpbnQgfSBmcm9tIFwiLi4vU2hhcmVkL1R5cGVzLm1qc1wiO1xyXG5pbXBvcnQgeyBkZWZhdWx0UGF0Y2hMb2QsIElQYXRjaExvZCB9IGZyb20gXCIuLi9UZXJyYWluU3lzdGVtL0xvZE1hbmFnZXIubWpzXCI7XHJcbmltcG9ydCBCYXNlVGVycmFpbiBmcm9tIFwiLi4vVGVycmFpblN5c3RlbS9UZXJyYWluLm1qc1wiO1xyXG5pbXBvcnQgeyBJU2luZ2xlTG9kSW5mbyB9IGZyb20gXCIuLi9UZXJyYWluU3lzdGVtL0xvZEluZm8ubWpzXCI7XHJcbmltcG9ydCB7IFRlcnJhaW5QYXRoY2VzSW5zdGFuY2luZyB9IGZyb20gXCIuL1RlcnJhaW5QYXRjaGVzSW5zdGFuY2luZy5tanNcIjtcclxuaW1wb3J0IHsgVEluc3RDb29yZHNPZmZzZXRBcnJUeXBlIH0gZnJvbSBcIi4uL1RlcnJhaW5TeXN0ZW0vUGF0Y2hJbnN0YW5jaW5nLm1qc1wiO1xyXG5pbXBvcnQgeyBJR3JpZFBhdGNoSW5pdGlhbGl6ZXIgfSBmcm9tIFwiLi4vVGVycmFpblN5c3RlbS9HZW9taXBHcmlkUmVuZGVyUHJlcGFyZXIubWpzXCI7XHJcbmltcG9ydCB7IElab25lIH0gZnJvbSBcIi4uL1RlcnJhaW5TeXN0ZW0vSVpvbmUubWpzXCI7XHJcbmltcG9ydCB7IEN1c3RvbU1lc2hJbnN0YW5jZSB9IGZyb20gXCIuLi9FbmdpbmVFeHRlbnNpb25zL1JlbmRlcmVyLm1qc1wiO1xyXG5cclxuZXhwb3J0IHR5cGUgVEZvckVhY2hQYXRjaENhbGxiYWNrID0gKHBhdGNoSW5kZXg6IGludCwgeDogaW50LCB6OiBpbnQpID0+IHZvaWQgfCBib29sZWFuO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRlcnJhaW5QYXRjaEJ1ZmZlckJhc2ljIHtcclxuXHJcbiAgICByZWFkb25seSBtaW5YOiBudW1iZXI7XHJcbiAgICByZWFkb25seSBtaW5aOiBudW1iZXI7XHJcbiAgICByZWFkb25seSBzaXplOiBudW1iZXI7XHJcbiAgICByZWFkb25seSBpbmRleDogbnVtYmVyO1xyXG5cclxuICAgIHB1YmxpYyB2aXNpYmxlOiBib29sZWFuO1xyXG5cclxuICAgIHB1YmxpYyBoYXNoOiBudW1iZXI7XHJcbiAgICBwdWJsaWMgbG9kOiBJUGF0Y2hMb2Q7XHJcbiAgICBwdWJsaWMgaW5kaWNlc0Jhc2VJbmRleDogbnVtYmVyO1xyXG4gICAgcHVibGljIGluZGljZXNCYXNlVmVydGV4OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgaW5kaWNlc0NvdW50OiBudW1iZXI7XHJcblxyXG4gICAgcHVibGljIGRlcGVuZGVuY2VzVXBkYXRlZDogYm9vbGVhbjtcclxuICAgIHB1YmxpYyBoZWlnaHRzVXBkYXRlZDogYm9vbGVhbjtcclxuICAgIHB1YmxpYyBoZWlnaHRzVXBkYXRlZFRoaXNGcmFtZTogYm9vbGVhbjtcclxuXHJcbiAgICBwdWJsaWMgbGFzdENoYW5nZVRpbWU6IG51bWJlcjtcclxuICAgIHB1YmxpYyBsYXN0Q2hhbmdlQXR0YWNoVGltZTogbnVtYmVyO1xyXG4gICAgcHVibGljIGxhc3RDaGFuZ2VIZWlnaHRzVGltZTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGluZGV4OiBudW1iZXIsIG1pblg6IG51bWJlciwgbWluWjogbnVtYmVyLCBzaXplOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLm1pblggID0gbWluWDtcclxuICAgICAgICB0aGlzLm1pblogID0gbWluWjtcclxuICAgICAgICB0aGlzLnNpemUgID0gc2l6ZTtcclxuICAgICAgICB0aGlzLmluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5oYXNoICA9IDA7XHJcbiAgICAgICAgdGhpcy5sb2QgPSBkZWZhdWx0UGF0Y2hMb2Q7XHJcbiAgICAgICAgdGhpcy5pbmRpY2VzQmFzZUluZGV4ID0gMDtcclxuICAgICAgICB0aGlzLmluZGljZXNCYXNlVmVydGV4ID0gMDtcclxuICAgICAgICB0aGlzLmluZGljZXNDb3VudCA9IDA7XHJcbiAgICAgICAgdGhpcy5kZXBlbmRlbmNlc1VwZGF0ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmhlaWdodHNVcGRhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5oZWlnaHRzVXBkYXRlZFRoaXNGcmFtZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubGFzdENoYW5nZVRpbWUgPSAwO1xyXG4gICAgICAgIHRoaXMubGFzdENoYW5nZUF0dGFjaFRpbWUgPSAwO1xyXG4gICAgICAgIHRoaXMubGFzdENoYW5nZUhlaWdodHNUaW1lID0gMDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgVGVycmFpblBhdGNoZXNCYXNpYzxcclxuICAgIFRQYXRjaEJ1ZmZlciBleHRlbmRzIFRlcnJhaW5QYXRjaEJ1ZmZlckJhc2ljID0gVGVycmFpblBhdGNoQnVmZmVyQmFzaWMsXHJcbiAgICBUUGF0Y2hQcmltaXRpdmUgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0gUmVjb3JkPHN0cmluZywgYW55PlxyXG4+IHtcclxuXHJcbiAgICBwcml2YXRlIF9pbml0OiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBfYWFiYjogcGN4LkJvdW5kaW5nQm94O1xyXG4gICAgcHJpdmF0ZSBfcGF0Y2hBdmFsYWJsZUNvdW50OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIF9jaGFuZ2VzSWRzOiBudW1iZXJbXTtcclxuICAgIHByaXZhdGUgX3VzZU1hc2hlc0JhZzogYm9vbGVhbjtcclxuXHJcbiAgICBwcm90ZWN0ZWQgX2VudGl0eTogcGN4LkVudGl0eTtcclxuICAgIHByb3RlY3RlZCBfYXBwOiBwY3guQXBwQmFzZTtcclxuICAgIHByb3RlY3RlZCBfbWF0ZXJpYWw6IHBjeC5TdGFuZGFyZE1hdGVyaWFsO1xyXG5cclxuICAgIHByb3RlY3RlZCBfbGFzdENoYW5nZVRpbWU6IG51bWJlcjtcclxuICAgIHByb3RlY3RlZCBfbGFzdENoYW5nZUF0dGFjaFRpbWU6IG51bWJlcjtcclxuICAgIHByb3RlY3RlZCBfbGFzdENoYW5nZUhlaWdodHNUaW1lOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBfYnVmZmVyQXJyYXk6IFRQYXRjaEJ1ZmZlcltdO1xyXG4gICAgcHJpdmF0ZSBfbWVzaEluc3RhbmNlQXJyYXk6IEFycmF5PHBjeC5NZXNoSW5zdGFuY2UgfCB1bmRlZmluZWQ+O1xyXG4gICAgcHJpdmF0ZSBfY3VzdG9tTWVzaEluc3RhbmNlOiAocGN4Lk1lc2hJbnN0YW5jZSAmIEN1c3RvbU1lc2hJbnN0YW5jZTxUUGF0Y2hQcmltaXRpdmU+KSB8IHVuZGVmaW5lZDtcclxuXHJcbiAgICBwdWJsaWMgY3VzdG9tRm9yd2FyZFJlbmRlcmVyOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgcHVibGljIHJlYWRvbmx5IHRlcnJhaW46IEJhc2VUZXJyYWluO1xyXG4gICAgcHVibGljIHJlYWRvbmx5IGluc3RhbmNpbmc6IFRlcnJhaW5QYXRoY2VzSW5zdGFuY2luZztcclxuXHJcbiAgICBwdWJsaWMgZ2V0IGJ1ZmZlckFycmF5KCk6IFJlYWRvbmx5PHR5cGVvZiB0aGlzLl9idWZmZXJBcnJheT4geyByZXR1cm4gdGhpcy5fYnVmZmVyQXJyYXk7IH1cclxuICAgIHB1YmxpYyBnZXQgbWVzaEluc3RhbmNlQXJyYXkoKTogUmVhZG9ubHk8dHlwZW9mIHRoaXMuX21lc2hJbnN0YW5jZUFycmF5PiB7IHJldHVybiB0aGlzLl9tZXNoSW5zdGFuY2VBcnJheTsgfVxyXG4gICAgcHVibGljIGdldCBhYWJiKCkgeyByZXR1cm4gdGhpcy5fYWFiYjsgfVxyXG4gICAgcHVibGljIGdldCBjdXN0b21NZXNoSW5zdGFuY2UoKSB7IHJldHVybiB0aGlzLl9jdXN0b21NZXNoSW5zdGFuY2U7IH1cclxuXHJcbiAgICBwdWJsaWMgYWJzdHJhY3QgaGVpZ2h0TWFwVGV4dHVyZTogcGN4LlRleHR1cmU7XHJcblxyXG4gICAgY29uc3RydWN0b3IodGVycmFpbjogQmFzZVRlcnJhaW4pIHtcclxuICAgICAgICB0aGlzLnRlcnJhaW4gPSB0ZXJyYWluO1xyXG4gICAgICAgIHRoaXMuaW5zdGFuY2luZyA9IG5ldyBUZXJyYWluUGF0aGNlc0luc3RhbmNpbmcoKTtcclxuICAgICAgICB0aGlzLmN1c3RvbUZvcndhcmRSZW5kZXJlciA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX3VzZU1hc2hlc0JhZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2J1ZmZlckFycmF5ID0gbmV3IEFycmF5KHRoaXMudGVycmFpbi5udW1QYXRjaGVzWCAqIHRoaXMudGVycmFpbi5udW1QYXRjaGVzWik7XHJcbiAgICAgICAgdGhpcy5fbWVzaEluc3RhbmNlQXJyYXkgPSBuZXcgQXJyYXkodGhpcy50ZXJyYWluLm51bVBhdGNoZXNYICogdGhpcy50ZXJyYWluLm51bVBhdGNoZXNaKTtcclxuICAgICAgICB0aGlzLl9jdXN0b21NZXNoSW5zdGFuY2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdGhpcy5fcGF0Y2hBdmFsYWJsZUNvdW50ID0gMDtcclxuICAgICAgICB0aGlzLl9jaGFuZ2VzSWRzID0gW107XHJcbiAgICAgICAgdGhpcy5fYWFiYiA9IG5ldyBwYy5Cb3VuZGluZ0JveCgpO1xyXG4gICAgICAgIHRoaXMuX2luaXQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUFhYmIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlQWFiYigpIHtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBoYWxmV2lkdGggPSB0aGlzLnRlcnJhaW4ud2lkdGggLyAyO1xyXG4gICAgICAgIGNvbnN0IGhhbGZEZXB0aCA9IHRoaXMudGVycmFpbi5kZXB0aCAvIDI7XHJcblxyXG4gICAgICAgIHRoaXMuX2FhYmIuc2V0TWluTWF4KFxyXG4gICAgICAgICAgICBuZXcgcGMuVmVjMygtaGFsZldpZHRoLCB0aGlzLnRlcnJhaW4ubWluSGVpZ2h0LCAtaGFsZkRlcHRoKSxcclxuICAgICAgICAgICAgbmV3IHBjLlZlYzMoK2hhbGZXaWR0aCwgdGhpcy50ZXJyYWluLm1heEhlaWdodCwgK2hhbGZEZXB0aClcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fY3VzdG9tTWVzaEluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1c3RvbU1lc2hJbnN0YW5jZS5zZXRDdXN0b21BYWJiKHRoaXMuX2FhYmIpO1xyXG4gICAgICAgICAgICB0aGlzLl9jdXN0b21NZXNoSW5zdGFuY2UubWVzaC5hYWJiID0gdGhpcy5fYWFiYjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgbWVzaEluc3RhbmNlIG9mIHRoaXMuX21lc2hJbnN0YW5jZUFycmF5KSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNoSW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgIG1lc2hJbnN0YW5jZS5zZXRDdXN0b21BYWJiKHRoaXMuX2FhYmIpO1xyXG4gICAgICAgICAgICAgICAgbWVzaEluc3RhbmNlLm1lc2guYWFiYiA9IHRoaXMuX2FhYmI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuaW5zdGFuY2luZy5lbmFibGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2luZy5mb3JFYWNoKGl0ZW0gPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0ub2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5vYmplY3Quc2V0Q3VzdG9tQWFiYih0aGlzLl9hYWJiKTtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLm9iamVjdC5tZXNoLmFhYmIgPSB0aGlzLl9hYWJiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXJ0UmVuZGVyKCkge1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2ZvcmNlVXBkYXRlUmVuZGVyQ29tcG9uZW50KGVudGl0eTogcGN4LkVudGl0eSkge1xyXG5cclxuICAgICAgICBsZXQgYXBwZW5kID0gZmFsc2U7IC8vIGRlc3Ryb3kgcHJldiBtZXNoSW5zdGFuY2VzIGJ5IGRlZmF1bHRcclxuICAgICAgICBsZXQgbWVzaEluc3RhbmNlczogQXJyYXk8cGN4Lk1lc2hJbnN0YW5jZT47XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmN1c3RvbUZvcndhcmRSZW5kZXJlciAmJlxyXG4gICAgICAgICAgICB0aGlzLl9jdXN0b21NZXNoSW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgdGhpcy5fdXNlTWFzaGVzQmFnID0gdHJ1ZTtcclxuICAgICAgICAgICAgbWVzaEluc3RhbmNlcyA9IFt0aGlzLl9jdXN0b21NZXNoSW5zdGFuY2VdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5pbnN0YW5jaW5nLmVuYWJsZWRcclxuICAgICAgICAgICAgICAgID8gdGhpcy5pbnN0YW5jaW5nLm1lc2hJbnN0YW5jZUNvdW50XHJcbiAgICAgICAgICAgICAgICA6IHRoaXMuX3BhdGNoQXZhbGFibGVDb3VudDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIG1lc2hJbnN0YW5jZXMgPSBuZXcgQXJyYXk8cGN4Lk1lc2hJbnN0YW5jZT4oY291bnQpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmluc3RhbmNpbmcuZW5hYmxlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jaW5nLmFwcGVuZE1lc2hJbnN0YW5jZXMobWVzaEluc3RhbmNlcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy8gaWYgaW5zdGFuY2luZyB3YXMgdXNlZCwgdGhlbiB3ZSBkZWxldGUgYWxsIHByZXZpb3VzIGluc3RhbmNlc1xyXG4gICAgICAgICAgICAgICAgLy8gb3IgdXNlIGN1c3RvbSByZW5kZXJlclxyXG4gICAgICAgICAgICAgICAgYXBwZW5kID0gIXRoaXMuX3VzZU1hc2hlc0JhZztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgaSA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcGF0Y2hJbmRleCA9IDA7IHBhdGNoSW5kZXggPCB0aGlzLl9tZXNoSW5zdGFuY2VBcnJheS5sZW5ndGg7IHBhdGNoSW5kZXgrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhdGNoTWVzaEluc3RhbmNlID0gdGhpcy5fbWVzaEluc3RhbmNlQXJyYXlbcGF0Y2hJbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhdGNoTWVzaEluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc2hJbnN0YW5jZXNbaSsrXSA9IHBhdGNoTWVzaEluc3RhbmNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jaGFuZ2VzSWRzLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3VzZU1hc2hlc0JhZyA9IHRoaXMuaW5zdGFuY2luZy5lbmFibGVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGVudGl0eS5yZW5kZXIpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFRPRE86IGh0dHBzOi8vZ2l0aHViLmNvbS9wbGF5Y2FudmFzL2VuZ2luZS9pc3N1ZXMvNjY4MFxyXG4gICAgICAgICAgICBpZiAoYXBwZW5kKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICBlbnRpdHkucmVuZGVyLl9tZXNoSW5zdGFuY2VzID0gW107XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGVudGl0eS5yZW5kZXIubWVzaEluc3RhbmNlcyA9IG1lc2hJbnN0YW5jZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBlbnRpdHkuYWRkQ29tcG9uZW50KCdyZW5kZXInLCB7XHJcbiAgICAgICAgICAgICAgICBtZXNoSW5zdGFuY2VzOiBtZXNoSW5zdGFuY2VzLFxyXG4gICAgICAgICAgICAgICAgY3VsbDogZmFsc2UsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHNoYWRvd3NcclxuICAgICAgICBmb3IgKGNvbnN0IG1lc2hJbnN0YW5jZSBvZiBtZXNoSW5zdGFuY2VzKSB7XHJcbiAgICAgICAgICAgIG1lc2hJbnN0YW5jZS5jdWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAgIG1lc2hJbnN0YW5jZS5jYXN0U2hhZG93ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIG1lc2hJbnN0YW5jZS5yZWNlaXZlU2hhZG93ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIF91cGRhdGVSZW5kZXJDb21wb25lbnQoZW50aXR5OiBwY3guRW50aXR5KSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmN1c3RvbUZvcndhcmRSZW5kZXJlciB8fFxyXG4gICAgICAgICAgICB0aGlzLmluc3RhbmNpbmcuZW5hYmxlZCB8fFxyXG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VzSWRzLmxlbmd0aCA9PT0gMCB8fFxyXG4gICAgICAgICAgICAhZW50aXR5LmVuYWJsZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fZm9yY2VVcGRhdGVSZW5kZXJDb21wb25lbnQoZW50aXR5KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWJzdHJhY3QgdXBkYXRlSW5kZXhCdWZmZXIoKTogdm9pZDtcclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlTG9kcygpIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZUluZGV4QnVmZmVyKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVNZXNoZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZm9yRWFjaCh6b25lOiBJWm9uZSwgY2FsbGJhY2s6IFRGb3JFYWNoUGF0Y2hDYWxsYmFjaykge1xyXG5cclxuICAgICAgICBpZiAoem9uZS5tYXhYIDwgMCkgcmV0dXJuO1xyXG4gICAgICAgIGlmICh6b25lLm1heFogPCAwKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IG1pblggPSBNYXRoLm1heCh6b25lLm1pblgsIDApO1xyXG4gICAgICAgIGNvbnN0IG1pblogPSBNYXRoLm1heCh6b25lLm1pblosIDApO1xyXG4gICAgICAgIGNvbnN0IG1heFggPSBNYXRoLm1pbih6b25lLm1heFgsIHRoaXMudGVycmFpbi53aWR0aCk7XHJcbiAgICAgICAgY29uc3QgbWF4WiA9IE1hdGgubWluKHpvbmUubWF4WiwgdGhpcy50ZXJyYWluLmRlcHRoKTtcclxuXHJcbiAgICAgICAgY29uc3QgbWluUGF0Y2hYID0gTWF0aC5mbG9vcihtaW5YIC8gdGhpcy50ZXJyYWluLnBhdGNoU2l6ZSk7XHJcbiAgICAgICAgY29uc3QgbWluUGF0Y2haID0gTWF0aC5mbG9vcihtaW5aIC8gdGhpcy50ZXJyYWluLnBhdGNoU2l6ZSk7XHJcbiAgICAgICAgY29uc3QgbWF4UGF0Y2hYID0gTWF0aC5mbG9vcihtYXhYIC8gdGhpcy50ZXJyYWluLnBhdGNoU2l6ZSk7XHJcbiAgICAgICAgY29uc3QgbWF4UGF0Y2haID0gTWF0aC5mbG9vcihtYXhaIC8gdGhpcy50ZXJyYWluLnBhdGNoU2l6ZSk7XHJcblxyXG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZU1pblggPSBNYXRoLm1heChtaW5QYXRjaFgsIDApO1xyXG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZU1pblogPSBNYXRoLm1heChtaW5QYXRjaFosIDApO1xyXG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZU1heFggPSBNYXRoLm1pbihtYXhQYXRjaFggKyAxLCB0aGlzLnRlcnJhaW4ubnVtUGF0Y2hlc1gpO1xyXG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZU1heFogPSBNYXRoLm1pbihtYXhQYXRjaFogKyAxLCB0aGlzLnRlcnJhaW4ubnVtUGF0Y2hlc1opO1xyXG5cclxuICAgICAgICBmb3IgKGxldCB6ID0gbm9ybWFsaXplTWluWjsgeiA8IG5vcm1hbGl6ZU1heFo7IHorKykge1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgeCA9IG5vcm1hbGl6ZU1pblg7IHggPCBub3JtYWxpemVNYXhYOyB4KyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRjaEluZGV4ID0geiAqIHRoaXMudGVycmFpbi5udW1QYXRjaGVzWCArIHg7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKHBhdGNoSW5kZXgsIHgsIHopID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlRGVwZW5kZW5jaWVzKHpvbmU6IElab25lKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG5cclxuICAgICAgICB0aGlzLmZvckVhY2goem9uZSwgKHBhdGNoSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNvbnN0IHBhdGNoQnVmZmVyID0gdGhpcy5fYnVmZmVyQXJyYXlbcGF0Y2hJbmRleF07XHJcblxyXG4gICAgICAgICAgICBwYXRjaEJ1ZmZlci5sYXN0Q2hhbmdlVGltZSA9IG5vdztcclxuICAgICAgICAgICAgcGF0Y2hCdWZmZXIubGFzdENoYW5nZUF0dGFjaFRpbWUgPSBub3c7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2xhc3RDaGFuZ2VUaW1lID0gbm93O1xyXG4gICAgICAgIHRoaXMuX2xhc3RDaGFuZ2VBdHRhY2hUaW1lID0gbm93O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdXBkYXRlSGVpZ2h0cyh6b25lOiBJWm9uZSkge1xyXG5cclxuICAgICAgICBjb25zdCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuXHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKHpvbmUsIChwYXRjaEluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb25zdCBwYXRjaEJ1ZmZlciA9IHRoaXMuX2J1ZmZlckFycmF5W3BhdGNoSW5kZXhdO1xyXG5cclxuICAgICAgICAgICAgcGF0Y2hCdWZmZXIubGFzdENoYW5nZVRpbWUgPSBub3c7XHJcbiAgICAgICAgICAgIHBhdGNoQnVmZmVyLmxhc3RDaGFuZ2VIZWlnaHRzVGltZSA9IG5vdztcclxuICAgICAgICAgICAgcGF0Y2hCdWZmZXIuaGVpZ2h0c1VwZGF0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9sYXN0Q2hhbmdlVGltZSA9IG5vdztcclxuICAgICAgICB0aGlzLl9sYXN0Q2hhbmdlSGVpZ2h0c1RpbWUgPSBub3c7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfYWRkUGF0Y2hCdWZmZXIocGF0Y2hJbmRleDogbnVtYmVyLCBidWZmZXI6IFRQYXRjaEJ1ZmZlcikge1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fYnVmZmVyQXJyYXlbcGF0Y2hJbmRleF0pIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCdWZmZXIgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fYnVmZmVyQXJyYXlbcGF0Y2hJbmRleF0gPSBidWZmZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfYWRkUGF0Y2hNZXNoSW5zdGFuY2UocGF0Y2hJbmRleDogbnVtYmVyLCBtZXNoSW5zdGFuY2U6IHBjeC5NZXNoSW5zdGFuY2UpIHtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX21lc2hJbnN0YW5jZUFycmF5W3BhdGNoSW5kZXhdKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWVzaCBpbnN0YW5jZSBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9tZXNoSW5zdGFuY2VBcnJheVtwYXRjaEluZGV4XSA9IG1lc2hJbnN0YW5jZTtcclxuICAgICAgICB0aGlzLl9jaGFuZ2VzSWRzLnB1c2gocGF0Y2hJbmRleCk7XHJcbiAgICAgICAgdGhpcy5fcGF0Y2hBdmFsYWJsZUNvdW50Kys7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IF9jcmVhdGVDdXN0b21CYWdNZXNoKGFwcDogcGN4LkFwcEJhc2UsIGVudGl0eTogcGN4LkVudGl0eSwgbWF0ZXJpYWw6IHBjeC5NYXRlcmlhbCwgdGVycmFpbjogQmFzZVRlcnJhaW4pOiBwY3guTWVzaEluc3RhbmNlICYgQ3VzdG9tTWVzaEluc3RhbmNlPFRQYXRjaFByaW1pdGl2ZT47XHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgX2NyZWF0ZUluc3RhbmNpbmdNZXNoKGFwcDogcGN4LkFwcEJhc2UsIGVudGl0eTogcGN4LkVudGl0eSwgbWF0ZXJpYWw6IHBjeC5NYXRlcmlhbCwgbG9kSW5mbzogSVBhdGNoTG9kLCBwcmltaXRpdmVJbmZvOiBJU2luZ2xlTG9kSW5mbywgZGF0YTogVEluc3RDb29yZHNPZmZzZXRBcnJUeXBlKTogcGN4Lk1lc2hJbnN0YW5jZTtcclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBfY3JlYXRlUGF0Y2hCdWZmZXIocGF0Y2hJbmRleDogbnVtYmVyLCBiYXNlSW5kZXg6IG51bWJlciwgYmFzZVZlcnRleDogbnVtYmVyLCBjb3VudDogbnVtYmVyLCBwYXRjaFg6IG51bWJlciwgcGF0Y2haOiBudW1iZXIsIG1pblg6IG51bWJlciwgbWluWjogbnVtYmVyLCBzaXplOiBudW1iZXIsIGxvZDogSVBhdGNoTG9kKTogVFBhdGNoQnVmZmVyO1xyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IF9jcmVhdGVQYXRjaE1lc2gocGF0Y2hJbmRleDogbnVtYmVyLCBhcHA6IHBjeC5BcHBCYXNlLCBlbnRpdHk6IHBjeC5FbnRpdHksIG1hdGVyaWFsOiBwY3guTWF0ZXJpYWwpOiBwY3guTWVzaEluc3RhbmNlO1xyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgX2Rlc3Ryb3lDdXN0b21CYWdNZXNoKG1lc2g6IHBjeC5NZXNoSW5zdGFuY2UpOiB2b2lkO1xyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IF9kZXN0cm95SW5zdGFuY2luZ01lc2gobWVzaDogcGN4Lk1lc2hJbnN0YW5jZSk6IHZvaWQ7XHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgX2Rlc3Ryb3lQYXRjaE1lc2gocGF0Y2hJbmRleDogbnVtYmVyKTogdm9pZDtcclxuXHJcbiAgICBwdWJsaWMgZW5kUmVuZGVyKGhhc1VwZGF0ZUhlaWdodHM6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLl91cGRhdGVSZW5kZXJDb21wb25lbnQodGhpcy5fZW50aXR5KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0T3JDcmVhdGVQYXRjaE1lc2gocGF0Y2hJbmRleDogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIGxldCBwYXRjaCA9IHRoaXMuX21lc2hJbnN0YW5jZUFycmF5W3BhdGNoSW5kZXhdO1xyXG4gICAgICAgIGlmICghcGF0Y2gpIHtcclxuICAgICAgICAgICAgcGF0Y2ggPSB0aGlzLl9jcmVhdGVQYXRjaE1lc2gocGF0Y2hJbmRleCwgdGhpcy5fYXBwLCB0aGlzLl9lbnRpdHksIHRoaXMuX21hdGVyaWFsKTtcclxuICAgICAgICAgICAgdGhpcy5fYWRkUGF0Y2hNZXNoSW5zdGFuY2UocGF0Y2hJbmRleCwgcGF0Y2gpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHBhdGNoO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZXN0cm95UGF0Y2hNZXNoKHBhdGNoSW5kZXg6IG51bWJlcikge1xyXG5cclxuICAgICAgICB0aGlzLl9kZXN0cm95UGF0Y2hNZXNoKHBhdGNoSW5kZXgpO1xyXG5cclxuICAgICAgICBjb25zdCBwYXRjaE1lc2hJbnN0YW5jZSA9IHRoaXMuX21lc2hJbnN0YW5jZUFycmF5W3BhdGNoSW5kZXhdO1xyXG5cclxuICAgICAgICBpZiAocGF0Y2hNZXNoSW5zdGFuY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3BhdGNoQXZhbGFibGVDb3VudC0tO1xyXG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VzSWRzLnB1c2gocGF0Y2hJbmRleCk7XHJcblxyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fbWVzaEluc3RhbmNlQXJyYXlbcGF0Y2hJbmRleF07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZXN0cm95UGF0Y2hlc01lc2goKSB7XHJcbiAgICAgICAgZm9yIChsZXQgeiA9IDA7IHogPCB0aGlzLnRlcnJhaW4ubnVtUGF0Y2hlc1o7IHorKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMudGVycmFpbi5udW1QYXRjaGVzWDsgeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IHogKiB0aGlzLnRlcnJhaW4ubnVtUGF0Y2hlc1ggKyB4O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXN0cm95UGF0Y2hNZXNoKGluZGV4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlUGF0Y2hlc01lc2hNYXRlcmlhbCgpIHtcclxuICAgICAgICBmb3IgKGxldCB6ID0gMDsgeiA8IHRoaXMudGVycmFpbi5udW1QYXRjaGVzWjsgeisrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy50ZXJyYWluLm51bVBhdGNoZXNYOyB4KyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IHogKiB0aGlzLnRlcnJhaW4ubnVtUGF0Y2hlc1ggKyB4O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbWVzaEluc3RhbmNlID0gdGhpcy5fbWVzaEluc3RhbmNlQXJyYXlbaW5kZXhdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtZXNoSW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXNoSW5zdGFuY2UubWF0ZXJpYWwgPSB0aGlzLl9tYXRlcmlhbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlTWVzaGVzKCkge1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuX2luaXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2N1c3RvbU1lc2hJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95Q3VzdG9tQmFnTWVzaCh0aGlzLl9jdXN0b21NZXNoSW5zdGFuY2UpO1xyXG4gICAgICAgICAgICB0aGlzLl9jdXN0b21NZXNoSW5zdGFuY2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmluc3RhbmNpbmcuZGVzdHJveSgobWVzaCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95SW5zdGFuY2luZ01lc2gobWVzaCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmN1c3RvbUZvcndhcmRSZW5kZXJlcikge1xyXG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3lQYXRjaGVzTWVzaCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9jdXN0b21NZXNoSW5zdGFuY2UgPSB0aGlzLl9jcmVhdGVDdXN0b21CYWdNZXNoKHRoaXMuX2FwcCwgdGhpcy5fZW50aXR5LCB0aGlzLl9tYXRlcmlhbCwgdGhpcy50ZXJyYWluKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5pbnN0YW5jaW5nLmVuYWJsZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5kZXN0cm95UGF0Y2hlc01lc2goKTtcclxuICAgICAgICAgICAgdGhpcy5pbnN0YW5jaW5nLmJ1aWxkRnJvbVRlcnJhaW4odGhpcy50ZXJyYWluLCAobG9kSW5mbywgcHJpbWl0aXZlSW5mbywgZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUluc3RhbmNpbmdNZXNoKHRoaXMuX2FwcCwgdGhpcy5fZW50aXR5LCB0aGlzLl9tYXRlcmlhbCwgbG9kSW5mbywgcHJpbWl0aXZlSW5mbywgZGF0YSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVQYXRjaGVzTWVzaE1hdGVyaWFsKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9mb3JjZVVwZGF0ZVJlbmRlckNvbXBvbmVudCh0aGlzLl9lbnRpdHkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVNYXRlcmlhbChtYXRlcmlhbDogcGN4LlN0YW5kYXJkTWF0ZXJpYWwpIHtcclxuICAgICAgICB0aGlzLl9tYXRlcmlhbCA9IG1hdGVyaWFsO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbml0KGFwcDogcGN4LkFwcEJhc2UsIGVudGl0eTogcGN4LkVudGl0eSwgbWF0ZXJpYWw6IHBjeC5TdGFuZGFyZE1hdGVyaWFsKSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9pbml0KSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIHRlcnJhaW4gcGF0Y2hlcyB3YXMgaW5pdGlhbGl6ZWQgZWFybGllcicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5faW5pdCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fYXBwID0gYXBwO1xyXG4gICAgICAgIHRoaXMuX2VudGl0eSA9IGVudGl0eTtcclxuXHJcbiAgICAgICAgLy8gZm9yIG90aGVyIGxhbmd1YWdlIHVzZSBpbnRlcm5hbCBjbGFzc1xyXG4gICAgICAgIGNvbnN0IGluaXRpYWxpemVyOiBJR3JpZFBhdGNoSW5pdGlhbGl6ZXIgPSB7XHJcbiAgICAgICAgICAgIGluaXRQYXRjaDogKGJhc2VJbmRleDogaW50LCBiYXNlVmVydGV4OiBpbnQsIGNvdW50OiBpbnQsIHBhdGNoWDogaW50LCBwYXRjaFo6IGludCwgbWluWDogaW50LCBtaW5aOiBpbnQsIHNpemU6IGludCwgbG9kSW5mbzogUmVhZG9ubHk8SVBhdGNoTG9kPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcGF0Y2hJbmRleCA9IHBhdGNoWiAqIHRoaXMudGVycmFpbi5udW1QYXRjaGVzWCArIHBhdGNoWDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMuX2NyZWF0ZVBhdGNoQnVmZmVyKHBhdGNoSW5kZXgsIGJhc2VJbmRleCwgYmFzZVZlcnRleCwgY291bnQsIHBhdGNoWCwgcGF0Y2haLCBtaW5YLCBtaW5aLCBzaXplLCBsb2RJbmZvKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFBhdGNoQnVmZmVyKHBhdGNoSW5kZXgsIGJ1ZmZlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlTWF0ZXJpYWwobWF0ZXJpYWwpO1xyXG4gICAgICAgIHRoaXMudGVycmFpbi5pbml0UGF0Y2hlcyhpbml0aWFsaXplcik7XHJcbiAgICAgICAgdGhpcy51cGRhdGVNZXNoZXMoKTtcclxuICAgIH1cclxufSIsImltcG9ydCB0eXBlIHsgZmxvYXQsIGludCB9IGZyb20gXCIuLi9TaGFyZWQvVHlwZXMubWpzXCI7XHJcbmltcG9ydCB7IFRIZWlnaHRNYXBGb3JtYXQgfSBmcm9tIFwiLi9BYnNIZWlnaHRNYXAubWpzXCI7XHJcbmltcG9ydCBBYnNQYXRjaGVkSGVpZ2h0TWFwLCB7IGdldE9yVGhyb3dEYXRhQ2h1bmtTaXplLCBJUmVhZG9ubHlBYnNQYXRjaGVkSGVpZ2h0TWFwVHlwcGVkIH0gZnJvbSBcIi4vQWJzUGF0Y2hlZEhlaWdodE1hcC5tanNcIjtcclxuaW1wb3J0IHsgZGVmYXVsdEhlaWdodFZlcnRleFNpemUgfSBmcm9tIFwiLi9IZWlnaHRNYXAubWpzXCI7XHJcblxyXG5leHBvcnQgdHlwZSBUQ29tcHJlc3NBbGdvcml0bSA9IFwieDJcIiB8IFwieDRcIjtcclxuZXhwb3J0IHR5cGUgVEhlaWdodE1hcEFycmF5VHlwZUJhZzxUIGV4dGVuZHMgVENvbXByZXNzQWxnb3JpdG0+ID0gVCBleHRlbmRzIFwieDJcIiA/IFVpbnQxNkFycmF5IDogVWludDhBcnJheTtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb21wcmVzc2VkUGF0Y2hlZEhlaWdodE1hcDxUVENvbXByZXNzQWxnb3JpdG0gZXh0ZW5kcyBUQ29tcHJlc3NBbGdvcml0bT5cclxuICAgICBleHRlbmRzIEFic1BhdGNoZWRIZWlnaHRNYXA8VEhlaWdodE1hcEFycmF5VHlwZUJhZzxUVENvbXByZXNzQWxnb3JpdG0+PlxyXG4gIGltcGxlbWVudHMgSVJlYWRvbmx5QWJzUGF0Y2hlZEhlaWdodE1hcFR5cHBlZDxUSGVpZ2h0TWFwQXJyYXlUeXBlQmFnPFRUQ29tcHJlc3NBbGdvcml0bT4+IHtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBfY29tcHJlc3NBbGdvcml0bTogVFRDb21wcmVzc0FsZ29yaXRtO1xyXG4gICAgcHJpdmF0ZSBfcGF0Y2hYQmF0Y2hTaXplOiBpbnQ7XHJcbiAgICBwcml2YXRlIF9tYXhTYWZlRmFjdG9yOiBpbnQ7XHJcblxyXG4gICAgcHVibGljIGdldCBjb21wcmVzc0FsZ29yaXRtKCkgeyByZXR1cm4gdGhpcy5fY29tcHJlc3NBbGdvcml0bTsgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGNyZWF0ZUJ1ZmZlcjxUQ29tcHJlc3MgZXh0ZW5kcyBUQ29tcHJlc3NBbGdvcml0bT4od2lkdGg6IGludCwgZGVwdGg6IGludCwgY2h1bmtTaXplOiBpbnQsIGFsZ29yaXRtOiBUQ29tcHJlc3MpOiBUSGVpZ2h0TWFwQXJyYXlUeXBlQmFnPFRDb21wcmVzcz4ge1xyXG5cclxuICAgICAgICBjb25zdCBudW1DaHVua3NYICAgPSAoKHdpZHRoIC0gMSkgLyAoY2h1bmtTaXplIC0gMSkpIHwgMDtcclxuICAgICAgICBjb25zdCBudW1DaHVua3NaICAgPSAoKGRlcHRoIC0gMSkgLyAoY2h1bmtTaXplIC0gMSkpIHwgMDtcclxuICAgICAgICBjb25zdCBjaHVua0FyclNpemUgPSBjaHVua1NpemUgKiogMjtcclxuICAgICAgICBjb25zdCBjaHVua0NvdW50ICAgPSBudW1DaHVua3NYICogbnVtQ2h1bmtzWjtcclxuICAgICAgICBjb25zdCBwYXRjaFhCYXRjaGluZ0NvdW50ID0gYWxnb3JpdG0gPT09IFwieDRcIiA/IDQgOiAyO1xyXG5cclxuICAgICAgICBpZiAobnVtQ2h1bmtzWCA8IHBhdGNoWEJhdGNoaW5nQ291bnQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlRoZSBjaHVua1NpemUgKCVkKSBzaG91bGQgYmUgYXQgbGVhc3QgKCVkKSB0aW1lcyBzbWFsbGVyIHRoYW4gdGhlIHdpZHRoICglZClcXG5cIiwgY2h1bmtTaXplLCBwYXRjaFhCYXRjaGluZ0NvdW50LCB3aWR0aCk7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIChhbGdvcml0bSA9PT0gXCJ4MlwiXHJcbiAgICAgICAgICAgID8gbmV3IFVpbnQxNkFycmF5KGNodW5rQXJyU2l6ZSAqIGNodW5rQ291bnQpXHJcbiAgICAgICAgICAgIDogbmV3IFVpbnQ4QXJyYXkoY2h1bmtBcnJTaXplICogY2h1bmtDb3VudClcclxuICAgICAgICApIGFzIHVua25vd24gYXMgVEhlaWdodE1hcEFycmF5VHlwZUJhZzxUQ29tcHJlc3M+O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvcih3aWR0aDogaW50LCBkZXB0aDogaW50LCBwYXRjaFNpemU6IGludCwgZGF0YUNodW5rU2l6ZTogaW50LCBtaW5IZWlnaHQ6IGZsb2F0LCBtYXhIZWlnaHQ6IGZsb2F0LCBhbGdvcml0bTogVFRDb21wcmVzc0FsZ29yaXRtKTtcclxuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvcih3aWR0aDogaW50LCBkZXB0aDogaW50LCBwYXRjaFNpemU6IGludCwgZGF0YUNodW5rU2l6ZTogaW50LCBtaW5IZWlnaHQ6IGZsb2F0LCBtYXhIZWlnaHQ6IGZsb2F0LCBhbGdvcml0bTogVFRDb21wcmVzc0FsZ29yaXRtLCBidWZmZXI6IFRIZWlnaHRNYXBBcnJheVR5cGVCYWc8VFRDb21wcmVzc0FsZ29yaXRtPiwgaXRlbVNpemU/OiBpbnQsIGl0ZW1IZWlnaHRJbmRleE9mZnNldD86IGludCk7XHJcbiAgICBwdWJsaWMgY29uc3RydWN0b3Iod2lkdGg6IGludCwgZGVwdGg6IGludCwgcGF0Y2hTaXplOiBpbnQsIGRhdGFDaHVua1NpemU6IGludCwgbWluSGVpZ2h0OiBmbG9hdCwgbWF4SGVpZ2h0OiBmbG9hdCwgYWxnb3JpdG06IFRUQ29tcHJlc3NBbGdvcml0bSwgYnVmZmVyPzogVEhlaWdodE1hcEFycmF5VHlwZUJhZzxUVENvbXByZXNzQWxnb3JpdG0+LCBpdGVtU2l6ZTogaW50ID0gZGVmYXVsdEhlaWdodFZlcnRleFNpemUsIGl0ZW1IZWlnaHRJbmRleE9mZnNldDogaW50ID0gMCkge1xyXG4gICAgICAgIGNvbnN0IHZhbGlkRGF0YUNodW5rU2l6ZSA9IGdldE9yVGhyb3dEYXRhQ2h1bmtTaXplKHBhdGNoU2l6ZSwgZGF0YUNodW5rU2l6ZSk7XHJcbiAgICAgICAgY29uc3QgdG1wQnVmZmVyID0gYnVmZmVyID8/IENvbXByZXNzZWRQYXRjaGVkSGVpZ2h0TWFwLmNyZWF0ZUJ1ZmZlcih3aWR0aCwgZGVwdGgsIHZhbGlkRGF0YUNodW5rU2l6ZSwgYWxnb3JpdG0pO1xyXG4gICAgICAgIHN1cGVyKHdpZHRoLCBkZXB0aCwgcGF0Y2hTaXplLCBkYXRhQ2h1bmtTaXplLCBtaW5IZWlnaHQsIG1heEhlaWdodCwgdG1wQnVmZmVyLCBpdGVtU2l6ZSwgaXRlbUhlaWdodEluZGV4T2Zmc2V0KTtcclxuICAgICAgICB0aGlzLl9jb21wcmVzc0FsZ29yaXRtID0gYWxnb3JpdG07XHJcbiAgICAgICAgdGhpcy5fcGF0Y2hYQmF0Y2hTaXplICA9IGFsZ29yaXRtID09PSBcIng0XCIgPyA0IDogMjtcclxuICAgICAgICB0aGlzLl9tYXhTYWZlRmFjdG9yICAgID0gYWxnb3JpdG0gPT09IFwieDRcIiA/IDB4ZmYgOiAweGZmZmY7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG92ZXJyaWRlIGdldENodW5rSW5kZXgoY2h1bmtYOiBpbnQsIGNodW5rWjogaW50KTogaW50IHtcclxuICAgICAgICByZXR1cm4gKGNodW5rWiAqIHRoaXMuZGF0YU51bUNodW5rc1ggKyBjaHVua1gpIC8gdGhpcy5fcGF0Y2hYQmF0Y2hTaXplIHwgMDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Q2h1bmtCdWZmZXIodHlwZTogRmxvYXQzMkFycmF5Q29uc3RydWN0b3IsIGNodW5rWDogaW50LCBjaHVua1o6IGludCk6IEZsb2F0MzJBcnJheTtcclxuICAgIHB1YmxpYyBvdmVycmlkZSBnZXRDaHVua0J1ZmZlcih0eXBlOiBVaW50MTZBcnJheUNvbnN0cnVjdG9yLCBjaHVua1g6IGludCwgY2h1bmtaOiBpbnQpOiBVaW50MTZBcnJheTtcclxuICAgIHB1YmxpYyBvdmVycmlkZSBnZXRDaHVua0J1ZmZlcih0eXBlOiBVaW50OEFycmF5Q29uc3RydWN0b3IsIGNodW5rWDogaW50LCBjaHVua1o6IGludCk6IFVpbnQ4QXJyYXk7XHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Q2h1bmtCdWZmZXIodHlwZTogYW55LCBjaHVua1g6IGludCwgY2h1bmtaOiBpbnQpIHtcclxuICAgICAgICBjb25zdCBzaXplICAgICAgICA9IHRoaXMuZGF0YUNodW5rU2l6ZSAqKiAyO1xyXG4gICAgICAgIGNvbnN0IGNodW5rTGV2ZWwgID0gKGNodW5rWiAqIHRoaXMuZGF0YU51bUNodW5rc1ggKyBjaHVua1gpIC8gdGhpcy5fcGF0Y2hYQmF0Y2hTaXplIHwgMDtcclxuICAgICAgICBjb25zdCBjaHVua09mZnNldCA9IGNodW5rTGV2ZWwgKiBzaXplICogdGhpcy5kYXRhLkJZVEVTX1BFUl9FTEVNRU5UICogdGhpcy5fcGF0Y2hYQmF0Y2hTaXplO1xyXG4gICAgICAgIGNvbnN0IGNvdW50ICAgICAgID0gc2l6ZSAqIHRoaXMuX3BhdGNoWEJhdGNoU2l6ZSAqICh0aGlzLmRhdGEuQllURVNfUEVSX0VMRU1FTlQgLyB0eXBlLkJZVEVTX1BFUl9FTEVNRU5UKTtcclxuICAgICAgICByZXR1cm4gbmV3IHR5cGUodGhpcy5kYXRhLmJ1ZmZlciwgY2h1bmtPZmZzZXQsIGNvdW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Q2h1bmtzQnVmZmVycyh0eXBlOiBGbG9hdDMyQXJyYXlDb25zdHJ1Y3Rvcik6IEZsb2F0MzJBcnJheVtdO1xyXG4gICAgcHVibGljIG92ZXJyaWRlIGdldENodW5rc0J1ZmZlcnModHlwZTogVWludDE2QXJyYXlDb25zdHJ1Y3Rvcik6IFVpbnQxNkFycmF5W107XHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Q2h1bmtzQnVmZmVycyh0eXBlOiBVaW50OEFycmF5Q29uc3RydWN0b3IpOiBVaW50OEFycmF5W107XHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Q2h1bmtzQnVmZmVycyh0eXBlOiBhbnkpIHtcclxuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IEFycmF5KCh0aGlzLmRhdGFOdW1DaHVua3NYIC8gdGhpcy5fcGF0Y2hYQmF0Y2hTaXplKSAqIHRoaXMuZGF0YU51bUNodW5rc1opO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAobGV0IGNodW5rWiA9IDA7IGNodW5rWiA8IHRoaXMuZGF0YU51bUNodW5rc1o7IGNodW5rWisrKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaHVua1ggPSAwOyBjaHVua1ggPCB0aGlzLmRhdGFOdW1DaHVua3NYOyBjaHVua1ggKz0gdGhpcy5fcGF0Y2hYQmF0Y2hTaXplKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSAoY2h1bmtaICogdGhpcy5kYXRhTnVtQ2h1bmtzWCArIGNodW5rWCkgLyB0aGlzLl9wYXRjaFhCYXRjaFNpemUgfCAwO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IHRoaXMuZ2V0Q2h1bmtCdWZmZXIodHlwZSwgY2h1bmtYLCBjaHVua1opO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvdmVycmlkZSBfZW5jb2RlSGVpZ2h0RmFjdG9yKHN0b3JlOiBUSGVpZ2h0TWFwQXJyYXlUeXBlQmFnPFRUQ29tcHJlc3NBbGdvcml0bT4sIGluZGV4OiBpbnQsIHZhbHVlOiBmbG9hdCkge1xyXG4gICAgICAgIHN0b3JlW2luZGV4XSA9IE1hdGgubWluKHZhbHVlICogdGhpcy5fbWF4U2FmZUZhY3RvciwgdGhpcy5fbWF4U2FmZUZhY3Rvcik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBvdmVycmlkZSBfZGVjb2RlSGVpZ2h0RmFjdG9yKHN0b3JlOiBUSGVpZ2h0TWFwQXJyYXlUeXBlQmFnPFRUQ29tcHJlc3NBbGdvcml0bT4sIGluZGV4OiBpbnQpIHtcclxuICAgICAgICByZXR1cm4gc3RvcmVbaW5kZXhdIC8gdGhpcy5fbWF4U2FmZUZhY3RvcjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIG92ZXJyaWRlIGdldEluZGV4KHg6IGludCwgejogaW50KTogaW50IHtcclxuXHJcbiAgICAgICAgY29uc3QgbG9jYWxYID0geCAlIHRoaXMuZGF0YUNodW5rU2l6ZTtcclxuICAgICAgICBjb25zdCBsb2NhbFogPSB6ICUgdGhpcy5kYXRhQ2h1bmtTaXplO1xyXG4gICAgICAgIGNvbnN0IGNodW5rWCA9IE1hdGguZmxvb3IoeCAvIHRoaXMuZGF0YUNodW5rU2l6ZSk7XHJcbiAgICAgICAgY29uc3QgY2h1bmtaID0gTWF0aC5mbG9vcih6IC8gdGhpcy5kYXRhQ2h1bmtTaXplKTtcclxuXHJcbiAgICAgICAgY29uc3QgY2h1bmtMZXZlbCAgPSAoY2h1bmtaICogdGhpcy5kYXRhTnVtQ2h1bmtzWCArIGNodW5rWCkgLyB0aGlzLl9wYXRjaFhCYXRjaFNpemUgfCAwO1xyXG4gICAgICAgIGNvbnN0IGNodW5rT2Zmc2V0ID0gY2h1bmtMZXZlbCAqICh0aGlzLmRhdGFDaHVua1NpemUgKiogMik7XHJcbiAgICAgICAgY29uc3QgbG9jYWxJbmRleCAgPSBsb2NhbFogKiB0aGlzLmRhdGFDaHVua1NpemUgKyBsb2NhbFg7XHJcbiAgICAgICAgY29uc3QgbnVtQ29tcHJlc3MgPSBjaHVua1ggJSB0aGlzLl9wYXRjaFhCYXRjaFNpemU7IC8vIGNvbXByZXNzIGJ5IHggYXhpc1xyXG5cclxuICAgICAgICByZXR1cm4gKGNodW5rT2Zmc2V0ICsgbG9jYWxJbmRleCkgKiB0aGlzLl9wYXRjaFhCYXRjaFNpemUgKyBudW1Db21wcmVzcztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ29tcHJlc3NlZFBhdGNoZWRIZWlnaHRNYXA7IiwiaW1wb3J0IHsgSVBhdGNoTG9kIH0gZnJvbSBcIi4uL1RlcnJhaW5TeXN0ZW0vTG9kTWFuYWdlci5tanNcIjtcclxuaW1wb3J0IHsgY29vcmRzVmVydGV4U2l6ZSwgSVJlYWRvbmx5Q29vcmRzQnVmZmVyIH0gZnJvbSBcIi4uL1RlcnJhaW5TeXN0ZW0vQ29vcmRzQnVmZmVyLm1qc1wiO1xyXG5pbXBvcnQgVGVycmFpblBhdGNoZXNCYXNpYywgeyBUZXJyYWluUGF0Y2hCdWZmZXJCYXNpYyB9IGZyb20gXCIuL1RlcnJhaW5QYXRjaGVzQmFzaWMubWpzXCI7XHJcbmltcG9ydCB7IHBhdGNoQ29vcmRPZmZzZXRQYXJhbU5hbWUsIHRlcnJhaW5IZWlnaHRNYXBQYXJhbU5hbWUsIGdldFRlcnJhaW5TaGFkZXJDaHVua3MsIHZlcnRleENvb3JkQXR0ck5hbWUsIHBhdGNoTG9kQ29yZVBhcmFtTmFtZSwgcGF0Y2hJbnN0Q29vcmRPZmZzZXRQYXJhbU5hbWUsIGdldFRleHR1cmVUeXBlIH0gZnJvbSBcIi4vVGVycmFpblBhdGNoZXNTaGFkZXJDaHVua3MubWpzXCI7XHJcbmltcG9ydCB7IGludCB9IGZyb20gXCIuLi9TaGFyZWQvVHlwZXMubWpzXCI7XHJcbmltcG9ydCB7IElTaW5nbGVMb2RJbmZvIH0gZnJvbSBcIi4uL1RlcnJhaW5TeXN0ZW0vTG9kSW5mby5tanNcIjtcclxuaW1wb3J0IHsgaW5zdERhdGFTaXplLCBUSW5zdENvb3Jkc09mZnNldEFyclR5cGUgfSBmcm9tIFwiLi4vVGVycmFpblN5c3RlbS9QYXRjaEluc3RhbmNpbmcubWpzXCI7XHJcbmltcG9ydCB7IElab25lIH0gZnJvbSBcIi4uL1RlcnJhaW5TeXN0ZW0vSVpvbmUubWpzXCI7XHJcbmltcG9ydCB7IElSZWFkb25seUFic0hlaWdodE1hcCwgVEhlaWdodE1hcEZvcm1hdCB9IGZyb20gXCIuLi9UZXJyYWluU3lzdGVtL0Fic0hlaWdodE1hcC5tanNcIjtcclxuaW1wb3J0IENvbXByZXNzZWRQYXRjaGVkSGVpZ2h0TWFwIGZyb20gXCIuLi9UZXJyYWluU3lzdGVtL0NvbXByZXNzZWRQYXRjaGVkSGVpZ2h0TWFwLm1qc1wiO1xyXG5pbXBvcnQgQmFzZVRlcnJhaW4gZnJvbSBcIi4uL1RlcnJhaW5TeXN0ZW0vVGVycmFpbi5tanNcIjtcclxuaW1wb3J0IHsgQ3VzdG9tTWVzaCwgQ3VzdG9tTWVzaEluc3RhbmNlLCBJUHJpbWl0aXZlIH0gZnJvbSBcIi4uL0VuZ2luZUV4dGVuc2lvbnMvUmVuZGVyZXIubWpzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElQYXRjaFByaW1pdGl2ZSB7XHJcbiAgICBbcGF0Y2hDb29yZE9mZnNldFBhcmFtTmFtZV06IFtudW1iZXIsIG51bWJlcl0gfCBGbG9hdDMyQXJyYXksXHJcbiAgICBbcGF0Y2hMb2RDb3JlUGFyYW1OYW1lXTogbnVtYmVyLFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVpZ2h0TWFwRm9ybWF0KGdyYXBoaWNzRGV2aWNlOiBwY3guR3JhcGhpY3NEZXZpY2UsIGhlaWdodE1hcDogSVJlYWRvbmx5QWJzSGVpZ2h0TWFwKSB7XHJcblxyXG4gICAgLy8gVE9ETzogY2hlY2sgc3VwcG9ydCBmbG9hdDMyIHRleHR1cmVcclxuICAgIGxldCBobUZvcm1hdDogVEhlaWdodE1hcEZvcm1hdCA9ICdyZ2JhJztcclxuXHJcbiAgICBpZiAoaGVpZ2h0TWFwIGluc3RhbmNlb2YgQ29tcHJlc3NlZFBhdGNoZWRIZWlnaHRNYXApIHtcclxuICAgICAgICBobUZvcm1hdCA9IGhlaWdodE1hcC5jb21wcmVzc0FsZ29yaXRtID09PSAneDQnID8gJ3JnYmFYNCcgOiAncmdiYVgyJztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaG1Gb3JtYXQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWlnaHRNYXBDaHVua0J1ZmZlclR5cGUoZ3JhcGhpY3NEZXZpY2U6IHBjeC5HcmFwaGljc0RldmljZSwgZm9ybWF0OiBudW1iZXIpIHtcclxuXHJcbiAgICBpZiAoZm9ybWF0ID09PSBwYy5QSVhFTEZPUk1BVF9SRzE2VSkge1xyXG4gICAgICAgIHJldHVybiBVaW50MTZBcnJheTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gVWludDhBcnJheTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVycmFpblBhdGNoZXMgZXh0ZW5kcyBUZXJyYWluUGF0Y2hlc0Jhc2ljPFRlcnJhaW5QYXRjaEJ1ZmZlckJhc2ljLCBJUGF0Y2hQcmltaXRpdmU+IHtcclxuXHJcbiAgICBwcml2YXRlIF9oZWlnaHRNYXA6IHBjeC5UZXh0dXJlO1xyXG4gICAgcHJpdmF0ZSBfaGVpZ2h0TWFwTGV2ZWxzVHlwZTogRmxvYXQzMkFycmF5Q29uc3RydWN0b3IgfCBVaW50MTZBcnJheUNvbnN0cnVjdG9yIHwgVWludDhBcnJheUNvbnN0cnVjdG9yO1xyXG4gICAgcHJpdmF0ZSBfc2hhcmVkSW5kZXhCdWZmZXI6IHBjeC5JbmRleEJ1ZmZlcjtcclxuICAgIHByaXZhdGUgX3NoYXJlZFZlcnRleEJ1ZmZlcjogcGN4LlZlcnRleEJ1ZmZlcjtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IGhlaWdodE1hcFRleHR1cmUoKSB7IHJldHVybiB0aGlzLl9oZWlnaHRNYXA7IH1cclxuXHJcbiAgICBwcml2YXRlIF91cGRhdGVQYXRjaEhlaWdodHNPbkdQVShwYXRjaFg6IGludCwgcGF0Y2haOiBpbnQpIHtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogYSBiYXRjaCB1cGRhdGUgbWF5IGJlIHJlcXVpcmVkLlxyXG5cclxuICAgICAgICAvLyBUT0RPOiB0cmFuc2Zvcm0gaW4gaGVpZ2h0bWFwIGNsYXNzXHJcbiAgICAgICAgY29uc3QgZGF0YUNodW5rU2l6ZSA9IHRoaXMudGVycmFpbi5oZWlnaHRNYXAuZGF0YUNodW5rU2l6ZTtcclxuICAgICAgICBjb25zdCBmYWN0b3IgICAgICAgID0gdGhpcy50ZXJyYWluLmhlaWdodE1hcC5kYXRhQ2h1bmtTaXplRmFjdG9yO1xyXG4gICAgICAgIGNvbnN0IGRhdGFDaHVua1ggICAgPSBwYXRjaFggKiBmYWN0b3IgfCAwO1xyXG4gICAgICAgIGNvbnN0IGRhdGFDaHVua1ogICAgPSBwYXRjaFogKiBmYWN0b3IgfCAwO1xyXG5cclxuICAgICAgICBjb25zdCBsZXZlbCAgPSB0aGlzLnRlcnJhaW4uaGVpZ2h0TWFwLmdldENodW5rSW5kZXgoZGF0YUNodW5rWCwgZGF0YUNodW5rWik7XHJcbiAgICAgICAgY29uc3QgYnVmZmVyID0gdGhpcy50ZXJyYWluLmhlaWdodE1hcC5nZXRDaHVua0J1ZmZlcih0aGlzLl9oZWlnaHRNYXBMZXZlbHNUeXBlLCBkYXRhQ2h1bmtYLCBkYXRhQ2h1bmtaKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2FwcC5ncmFwaGljc0RldmljZS5pc1dlYkdMMikge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZ2wgPSAodGhpcy5fYXBwLmdyYXBoaWNzRGV2aWNlIGFzIHBjeC5XZWJnbEdyYXBoaWNzRGV2aWNlKS5nbDtcclxuICAgICAgICAgICAgY29uc3QgdGV4dHVyZUZvcm1hdCA9IHRoaXMuX2hlaWdodE1hcC5pbXBsLl9nbEZvcm1hdDtcclxuICAgICAgICAgICAgY29uc3QgdGV4dHVyZVBpeGVsVCA9IHRoaXMuX2hlaWdodE1hcC5pbXBsLl9nbFBpeGVsVHlwZTtcclxuICAgICAgICAgICAgY29uc3QgdGV4dHVyZVRhcmdldCA9IHRoaXMuX2hlaWdodE1hcC5pbXBsLl9nbFRhcmdldDtcclxuICAgICAgICAgICAgY29uc3QgdGV4dHVyZU9iamVjdCA9IHRoaXMuX2hlaWdodE1hcC5pbXBsLl9nbFRleHR1cmU7XHJcblxyXG4gICAgICAgICAgICBnbC5iaW5kVGV4dHVyZSh0ZXh0dXJlVGFyZ2V0LCB0ZXh0dXJlT2JqZWN0KTtcclxuICAgICAgICAgICAgZ2wudGV4U3ViSW1hZ2UzRChnbC5URVhUVVJFXzJEX0FSUkFZLCAwLCAwLCAwLCBsZXZlbCwgZGF0YUNodW5rU2l6ZSwgZGF0YUNodW5rU2l6ZSwgMSwgdGV4dHVyZUZvcm1hdCwgdGV4dHVyZVBpeGVsVCwgYnVmZmVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5fYXBwLmdyYXBoaWNzRGV2aWNlLmlzV2ViR1BVKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB3ZWJncHUgID0gKHRoaXMuX2FwcC5ncmFwaGljc0RldmljZSBhcyBhbnkpLndncHUgYXMgR1BVRGV2aWNlO1xyXG4gICAgICAgICAgICBjb25zdCB0ZXh0dXJlID0gKHRoaXMuX2hlaWdodE1hcC5pbXBsLmdwdVRleHR1cmUpIGFzIEdQVVRleHR1cmU7XHJcblxyXG4gICAgICAgICAgICB3ZWJncHUucXVldWUud3JpdGVUZXh0dXJlKFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHR1cmU6IHRleHR1cmUsXHJcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luOiBbMCwgMCwgbGV2ZWxdLFxyXG4gICAgICAgICAgICAgICAgICAgIG1pcExldmVsOiAwXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYnVmZmVyLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogMCxcclxuICAgICAgICAgICAgICAgICAgICBieXRlc1BlclJvdzogNCAqIGRhdGFDaHVua1NpemUsIC8vIGFsd2F5cyA0IGZvciByZ2JhIGZvcm1hdFxyXG4gICAgICAgICAgICAgICAgICAgIHJvd3NQZXJJbWFnZTogZGF0YUNodW5rU2l6ZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogZGF0YUNodW5rU2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGRhdGFDaHVua1NpemVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfdXBkYXRlSGVpZ2h0TWFwKHpvbmU6IElab25lKSB7XHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKHpvbmUsIChwYXRjaEluZGV4LCB4LCB6KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVBhdGNoSGVpZ2h0c09uR1BVKHgsIHopO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBfY3JlYXRlUGF0Y2hCdWZmZXIocGF0Y2hJbmRleDogaW50LCBiYXNlSW5kZXg6IGludCwgYmFzZVZlcnRleDogaW50LCBjb3VudDogaW50LCBwYXRjaFg6IGludCwgcGF0Y2haOiBpbnQsIG1pblg6IGludCwgbWluWjogaW50LCBzaXplOiBpbnQsIGxvZDogSVBhdGNoTG9kKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHBhdGNoQnVmID0gbmV3IFRlcnJhaW5QYXRjaEJ1ZmZlckJhc2ljKHBhdGNoSW5kZXgsIG1pblgsIG1pblosIHNpemUpO1xyXG5cclxuICAgICAgICBwYXRjaEJ1Zi5sb2QgPSBsb2Q7XHJcbiAgICAgICAgcGF0Y2hCdWYuaW5kaWNlc0Jhc2VJbmRleCA9IGJhc2VJbmRleDtcclxuICAgICAgICBwYXRjaEJ1Zi5pbmRpY2VzQmFzZVZlcnRleCA9IGJhc2VWZXJ0ZXg7XHJcbiAgICAgICAgcGF0Y2hCdWYuaW5kaWNlc0NvdW50ID0gY291bnQ7XHJcbiAgICAgICAgcGF0Y2hCdWYuZGVwZW5kZW5jZXNVcGRhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgcGF0Y2hCdWYuaGVpZ2h0c1VwZGF0ZWQgPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gcGF0Y2hCdWY7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgX2J1aWxkVmVydGV4Rm9ybWF0KGdyYXBoaWNzRGV2aWNlOiBwY3guR3JhcGhpY3NEZXZpY2UsIHZlcnRleEJ1ZmZlcjogSVJlYWRvbmx5Q29vcmRzQnVmZmVyKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gV2UgY2FuIHVzZSB1aW50OCBmb3IgcGF0Y2hlcyBzbWFsbGVyIHRoYW4gMjU1LCBidXQgd2Ugb25seSB1c2UgMiBieXRlcyxcclxuICAgICAgICAvLyBmb3Igb3B0aW1hbCBwZXJmb3JtYW5jZSBuZWVkIDQgYnl0ZXMgZm9yIHRoZSBidWZmZXIuXHJcbiAgICAgICAgY29uc3QgY29vcmRzRm9ybWF0ID0gKHZlcnRleEJ1ZmZlci5wYXRjaFZlcnRleEJ1ZmZlclR5cGVkIGluc3RhbmNlb2YgVWludDhBcnJheSkgPyBwYy5UWVBFX1VJTlQ4IDogcGMuVFlQRV9VSU5UMTY7XHJcbiAgICAgICAgY29uc3QgdmVydGV4RGVzYyA9IFt7XHJcbiAgICAgICAgICAgIHNlbWFudGljOiBwYy5TRU1BTlRJQ19QT1NJVElPTixcclxuICAgICAgICAgICAgY29tcG9uZW50czogY29vcmRzVmVydGV4U2l6ZSxcclxuICAgICAgICAgICAgdHlwZTogY29vcmRzRm9ybWF0LFxyXG4gICAgICAgICAgICBub3JtYWxpemU6IGZhbHNlLFxyXG4gICAgICAgICAgICBhc0ludDogdHJ1ZVxyXG4gICAgICAgIH1dO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IHBjLlZlcnRleEZvcm1hdChncmFwaGljc0RldmljZSwgdmVydGV4RGVzYywgdmVydGV4QnVmZmVyLnBhdGNoVmVydGV4QnVmZmVyTGVuZ3RoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgX2J1aWxkSW5zdGFuY2luZ1ZlcnRleEZvcm1hdChncmFwaGljc0RldmljZTogcGN4LkdyYXBoaWNzRGV2aWNlKSB7XHJcbiAgICAgICAgLy8gV2UgY2FuIHVzZSB1aW50OCwgYnV0IHdlIG9ubHkgdXNlIDIgYnl0ZXMsXHJcbiAgICAgICAgLy8gZm9yIG9wdGltYWwgcGVyZm9ybWFuY2UgbmVlZCA0IGJ5dGVzIGZvciB0aGUgYnVmZmVyLlxyXG4gICAgICAgIHJldHVybiBuZXcgcGMuVmVydGV4Rm9ybWF0KGdyYXBoaWNzRGV2aWNlLCBbe1xyXG4gICAgICAgICAgICBzZW1hbnRpYzogcGMuU0VNQU5USUNfQVRUUjEwLFxyXG4gICAgICAgICAgICBjb21wb25lbnRzOiBjb29yZHNWZXJ0ZXhTaXplLFxyXG4gICAgICAgICAgICB0eXBlOiBwYy5UWVBFX1VJTlQxNixcclxuICAgICAgICAgICAgbm9ybWFsaXplOiBmYWxzZSxcclxuICAgICAgICAgICAgYXNJbnQ6IHRydWVcclxuICAgICAgICB9XSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIF9idWlsZEluc3RhbmNpbmdWZXJ0ZXhCdWZmZXIoZ3JhcGhpY3NEZXZpY2U6IHBjeC5HcmFwaGljc0RldmljZSwgZGF0YTogVEluc3RDb29yZHNPZmZzZXRBcnJUeXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBwYy5WZXJ0ZXhCdWZmZXIoZ3JhcGhpY3NEZXZpY2UsIHRoaXMuX2J1aWxkSW5zdGFuY2luZ1ZlcnRleEZvcm1hdChncmFwaGljc0RldmljZSksIGRhdGEubGVuZ3RoIC8gaW5zdERhdGFTaXplLCB7XHJcbiAgICAgICAgICAgIHVzYWdlOiBwYy5CVUZGRVJfU1RSRUFNLFxyXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICBzdG9yYWdlOiBmYWxzZSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgX3NldEN1c3RvbVByaW1pdGl2ZUNodW5rcyh0ZXJyYWluOiBCYXNlVGVycmFpbiwgbWVzaDogcGN4Lk1lc2ggJiBDdXN0b21NZXNoPElQYXRjaFByaW1pdGl2ZT4pIHtcclxuXHJcbiAgICAgICAgY29uc3QgcGF0Y2hlcyA9IG5ldyBBcnJheTxJUHJpbWl0aXZlPElQYXRjaFByaW1pdGl2ZT4+KHRlcnJhaW4ubnVtUGF0Y2hlc1ggKiB0ZXJyYWluLm51bVBhdGNoZXNaKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgcGF0Y2haID0gMDsgcGF0Y2haIDwgdGVycmFpbi5udW1QYXRjaGVzWjsgcGF0Y2haKyspIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhdGNoWCA9IDA7IHBhdGNoWCA8IHRlcnJhaW4ubnVtUGF0Y2hlc1g7IHBhdGNoWCsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgcGF0Y2hJbmRleCA9IHBhdGNoWiAqIHRlcnJhaW4ubnVtUGF0Y2hlc1ggKyBwYXRjaFg7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRjaEJ1ZiAgID0gdGhpcy5idWZmZXJBcnJheVtwYXRjaEluZGV4XTtcclxuXHJcbiAgICAgICAgICAgICAgICBwYXRjaGVzW3BhdGNoSW5kZXhdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHBjLlBSSU1JVElWRV9UUklBTkdMRVMsXHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgYmFzZTogMCxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogMCxcclxuICAgICAgICAgICAgICAgICAgICBpbmRleGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgW3BhdGNoQ29vcmRPZmZzZXRQYXJhbU5hbWVdOiBbcGF0Y2hCdWYubWluWCwgcGF0Y2hCdWYubWluWl0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtwYXRjaExvZENvcmVQYXJhbU5hbWVdOiBwYXRjaEJ1Zi5sb2QuY29yZSxcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtZXNoLnByaW1pdGl2ZUNodW5rcyA9IFtwYXRjaGVzXTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb3ZlcnJpZGUgX2NyZWF0ZUN1c3RvbUJhZ01lc2goYXBwOiBwY3guQXBwQmFzZSwgZW50aXR5OiBwY3guRW50aXR5LCBtYXRlcmlhbDogcGN4Lk1hdGVyaWFsLCB0ZXJyYWluOiBCYXNlVGVycmFpbik6IHBjeC5NZXNoSW5zdGFuY2UgJiBDdXN0b21NZXNoSW5zdGFuY2U8SVBhdGNoUHJpbWl0aXZlPiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHBhdGNoTWVzaCA9IG5ldyBwYy5NZXNoKGFwcC5ncmFwaGljc0RldmljZSkgYXMgcGN4Lk1lc2ggJiBDdXN0b21NZXNoPElQYXRjaFByaW1pdGl2ZT47XHJcbiAgICAgICAgY29uc3QgcHJpbWl0aXZlID0gcGF0Y2hNZXNoLnByaW1pdGl2ZVswXTtcclxuXHJcbiAgICAgICAgcGF0Y2hNZXNoLmFhYmIgPSB0aGlzLmFhYmI7XHJcbiAgICAgICAgcGF0Y2hNZXNoLmluZGV4QnVmZmVyWzBdID0gdGhpcy5fc2hhcmVkSW5kZXhCdWZmZXI7XHJcbiAgICAgICAgcGF0Y2hNZXNoLnZlcnRleEJ1ZmZlciAgID0gdGhpcy5fc2hhcmVkVmVydGV4QnVmZmVyO1xyXG5cclxuICAgICAgICB0aGlzLl9zZXRDdXN0b21QcmltaXRpdmVDaHVua3ModGVycmFpbiwgcGF0Y2hNZXNoKTtcclxuXHJcbiAgICAgICAgcHJpbWl0aXZlLnR5cGUgPSBwYy5QUklNSVRJVkVfVFJJQU5HTEVTO1xyXG4gICAgICAgIHByaW1pdGl2ZS5iYXNlID0gMDtcclxuICAgICAgICBwcmltaXRpdmUuY291bnQgPSAwO1xyXG4gICAgICAgIHByaW1pdGl2ZS5pbmRleGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgY29uc3QgcGF0Y2hNZXNoSW5zdGFuY2UgPSBuZXcgcGMuTWVzaEluc3RhbmNlKHBhdGNoTWVzaCwgbWF0ZXJpYWwsIGVudGl0eSkgYXMgcGN4Lk1lc2hJbnN0YW5jZSAmIEN1c3RvbU1lc2hJbnN0YW5jZTxJUGF0Y2hQcmltaXRpdmU+O1xyXG5cclxuICAgICAgICBwYXRjaE1lc2hJbnN0YW5jZS5jdWxsID0gZmFsc2U7XHJcbiAgICAgICAgcGF0Y2hNZXNoSW5zdGFuY2UudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHBhdGNoTWVzaEluc3RhbmNlLnZpc2libGVUaGlzRnJhbWUgPSBmYWxzZTtcclxuICAgICAgICBwYXRjaE1lc2hJbnN0YW5jZS5jYXN0U2hhZG93ID0gZmFsc2U7XHJcbiAgICAgICAgcGF0Y2hNZXNoSW5zdGFuY2UucmVjZWl2ZVNoYWRvdyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBwYXRjaE1lc2hJbnN0YW5jZS5zZXRQYXJhbWV0ZXIocGF0Y2hMb2RDb3JlUGFyYW1OYW1lLCAwLCAweGZmZmZmZmZmKTtcclxuICAgICAgICBwYXRjaE1lc2hJbnN0YW5jZS5zZXRQYXJhbWV0ZXIocGF0Y2hDb29yZE9mZnNldFBhcmFtTmFtZSwgWzAsIDBdLCAweGZmZmZmZmZmKTtcclxuICAgICAgICBwYXRjaE1lc2hJbnN0YW5jZS5zZXRJbnN0YW5jaW5nKG51bGwpO1xyXG4gICAgICAgIHBhdGNoTWVzaEluc3RhbmNlLnNldEN1c3RvbUFhYmIodGhpcy5hYWJiKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHBhdGNoTWVzaEluc3RhbmNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvdmVycmlkZSBfY3JlYXRlSW5zdGFuY2luZ01lc2goYXBwOiBwY3guQXBwQmFzZSwgZW50aXR5OiBwY3guRW50aXR5LCBtYXRlcmlhbDogcGN4Lk1hdGVyaWFsLCBsb2RJbmZvOiBJUGF0Y2hMb2QsIHByaW1pdGl2ZUluZm86IElTaW5nbGVMb2RJbmZvLCBkYXRhOiBUSW5zdENvb3Jkc09mZnNldEFyclR5cGUpOiBwY3guTWVzaEluc3RhbmNlIHtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBwYXRjaE1lc2ggPSBuZXcgcGMuTWVzaChhcHAuZ3JhcGhpY3NEZXZpY2UpO1xyXG4gICAgICAgIGNvbnN0IHByaW1pdGl2ZSA9IHBhdGNoTWVzaC5wcmltaXRpdmVbMF07XHJcbiAgICAgICAgY29uc3QgaW5zdGFuY2luZ0J1ZiA9IHRoaXMuX2J1aWxkSW5zdGFuY2luZ1ZlcnRleEJ1ZmZlcihhcHAuZ3JhcGhpY3NEZXZpY2UsIGRhdGEpO1xyXG5cclxuICAgICAgICBwYXRjaE1lc2guYWFiYiA9IHRoaXMuYWFiYjtcclxuICAgICAgICBwYXRjaE1lc2guaW5kZXhCdWZmZXJbMF0gPSB0aGlzLl9zaGFyZWRJbmRleEJ1ZmZlcjtcclxuICAgICAgICBwYXRjaE1lc2gudmVydGV4QnVmZmVyICAgPSB0aGlzLl9zaGFyZWRWZXJ0ZXhCdWZmZXI7XHJcblxyXG4gICAgICAgIHByaW1pdGl2ZS50eXBlID0gcGMuUFJJTUlUSVZFX1RSSUFOR0xFUztcclxuICAgICAgICBwcmltaXRpdmUuYmFzZSA9IHByaW1pdGl2ZUluZm8uc3RhcnQ7XHJcbiAgICAgICAgcHJpbWl0aXZlLmNvdW50ID0gcHJpbWl0aXZlSW5mby5jb3VudDtcclxuICAgICAgICBwcmltaXRpdmUuaW5kZXhlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIGNvbnN0IHBhdGNoTWVzaEluc3RhbmNlID0gbmV3IHBjLk1lc2hJbnN0YW5jZShwYXRjaE1lc2gsIG1hdGVyaWFsLCBlbnRpdHkpO1xyXG5cclxuICAgICAgICBwYXRjaE1lc2hJbnN0YW5jZS5jdWxsID0gZmFsc2U7XHJcbiAgICAgICAgcGF0Y2hNZXNoSW5zdGFuY2UudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHBhdGNoTWVzaEluc3RhbmNlLnZpc2libGVUaGlzRnJhbWUgPSBmYWxzZTtcclxuICAgICAgICBwYXRjaE1lc2hJbnN0YW5jZS5jYXN0U2hhZG93ID0gZmFsc2U7XHJcbiAgICAgICAgcGF0Y2hNZXNoSW5zdGFuY2UucmVjZWl2ZVNoYWRvdyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBwYXRjaE1lc2hJbnN0YW5jZS5zZXRQYXJhbWV0ZXIocGF0Y2hMb2RDb3JlUGFyYW1OYW1lLCBsb2RJbmZvLmNvcmUsIDB4ZmZmZmZmZmYpO1xyXG4gICAgICAgIHBhdGNoTWVzaEluc3RhbmNlLnNldEluc3RhbmNpbmcoaW5zdGFuY2luZ0J1ZiwgZmFsc2UpO1xyXG4gICAgICAgIHBhdGNoTWVzaEluc3RhbmNlLnNldEN1c3RvbUFhYmIodGhpcy5hYWJiKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHBhdGNoTWVzaEluc3RhbmNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvdmVycmlkZSBfY3JlYXRlUGF0Y2hNZXNoKHBhdGNoSW5kZXg6IG51bWJlciwgYXBwOiBwY3guQXBwQmFzZSwgZW50aXR5OiBwY3guRW50aXR5LCBtYXRlcmlhbDogcGN4Lk1hdGVyaWFsKTogcGN4Lk1lc2hJbnN0YW5jZSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHBhdGNoQnVmICA9IHRoaXMuYnVmZmVyQXJyYXlbcGF0Y2hJbmRleF07XHJcbiAgICAgICAgY29uc3QgcGF0Y2hNZXNoID0gbmV3IHBjLk1lc2goYXBwLmdyYXBoaWNzRGV2aWNlKTtcclxuICAgICAgICBjb25zdCBwcmltaXRpdmUgPSBwYXRjaE1lc2gucHJpbWl0aXZlWzBdO1xyXG5cclxuICAgICAgICBwYXRjaE1lc2guYWFiYiA9IHRoaXMuYWFiYjtcclxuICAgICAgICBwYXRjaE1lc2guaW5kZXhCdWZmZXJbMF0gPSB0aGlzLl9zaGFyZWRJbmRleEJ1ZmZlcjtcclxuICAgICAgICBwYXRjaE1lc2gudmVydGV4QnVmZmVyICAgPSB0aGlzLl9zaGFyZWRWZXJ0ZXhCdWZmZXI7XHJcblxyXG4gICAgICAgIHByaW1pdGl2ZS50eXBlID0gcGMuUFJJTUlUSVZFX1RSSUFOR0xFUztcclxuICAgICAgICBwcmltaXRpdmUuYmFzZSA9IDA7XHJcbiAgICAgICAgcHJpbWl0aXZlLmNvdW50ID0gMDtcclxuICAgICAgICBwcmltaXRpdmUuaW5kZXhlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIGNvbnN0IHBhdGNoTWVzaEluc3RhbmNlID0gbmV3IHBjLk1lc2hJbnN0YW5jZShwYXRjaE1lc2gsIG1hdGVyaWFsLCBlbnRpdHkpO1xyXG5cclxuICAgICAgICBwYXRjaE1lc2hJbnN0YW5jZS5jdWxsID0gZmFsc2U7XHJcbiAgICAgICAgcGF0Y2hNZXNoSW5zdGFuY2UudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHBhdGNoTWVzaEluc3RhbmNlLnZpc2libGVUaGlzRnJhbWUgPSBmYWxzZTtcclxuICAgICAgICBwYXRjaE1lc2hJbnN0YW5jZS5jYXN0U2hhZG93ID0gZmFsc2U7XHJcbiAgICAgICAgcGF0Y2hNZXNoSW5zdGFuY2UucmVjZWl2ZVNoYWRvdyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBwYXRjaE1lc2hJbnN0YW5jZS5zZXRQYXJhbWV0ZXIocGF0Y2hDb29yZE9mZnNldFBhcmFtTmFtZSwgW3BhdGNoQnVmLm1pblgsIHBhdGNoQnVmLm1pblpdLCAweGZmZmZmZmZmKTtcclxuICAgICAgICBwYXRjaE1lc2hJbnN0YW5jZS5zZXRJbnN0YW5jaW5nKG51bGwpO1xyXG4gICAgICAgIHBhdGNoTWVzaEluc3RhbmNlLnNldEN1c3RvbUFhYmIodGhpcy5hYWJiKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHBhdGNoTWVzaEluc3RhbmNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2Rlc3Ryb3lNZXNoKG1lc2hJbnN0YW5jZTogcGN4Lk1lc2hJbnN0YW5jZSkge1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBkb250IGRlc3Ryb3kgc2hhcmVkIGluZGV4IGFuZCB2ZXJ0ZXggYnVmZmVyc1xyXG4gICAgICAgIGlmIChtZXNoSW5zdGFuY2UubWVzaCkge1xyXG4gICAgICAgICAgICBtZXNoSW5zdGFuY2UubWVzaC5pbmRleEJ1ZmZlciA9IFtudWxsXSBhcyB1bmtub3duIGFzIHBjeC5JbmRleEJ1ZmZlcltdO1xyXG4gICAgICAgICAgICBtZXNoSW5zdGFuY2UubWVzaC52ZXJ0ZXhCdWZmZXIgPSBudWxsIGFzIHVua25vd24gYXMgcGN4LlZlcnRleEJ1ZmZlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1lc2hJbnN0YW5jZS5kZXN0cm95KCk7XHJcblxyXG4gICAgICAgIGlmIChtZXNoSW5zdGFuY2UubWVzaCkge1xyXG4gICAgICAgICAgICBtZXNoSW5zdGFuY2UubWVzaC5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobWVzaEluc3RhbmNlLmluc3RhbmNpbmdEYXRhKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBpZiAobWVzaEluc3RhbmNlLmluc3RhbmNpbmdEYXRhLmRlc3Ryb3kpIHsgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgbWVzaEluc3RhbmNlLmluc3RhbmNpbmdEYXRhLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbWVzaEluc3RhbmNlLmluc3RhbmNpbmdEYXRhLnZlcnRleEJ1ZmZlcj8uZGVzdHJveSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb3ZlcnJpZGUgX2Rlc3Ryb3lJbnN0YW5jaW5nTWVzaChtZXNoOiBwY3guTWVzaEluc3RhbmNlKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fZGVzdHJveU1lc2gobWVzaCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG92ZXJyaWRlIF9kZXN0cm95UGF0Y2hNZXNoKHBhdGNoSW5kZXg6IG51bWJlcik6IHZvaWQge1xyXG5cclxuICAgICAgICBjb25zdCBwYXRjaE1lc2hJbnN0YW5jZSA9IHRoaXMubWVzaEluc3RhbmNlQXJyYXlbcGF0Y2hJbmRleF07XHJcblxyXG4gICAgICAgIGlmIChwYXRjaE1lc2hJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95TWVzaChwYXRjaE1lc2hJbnN0YW5jZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvdmVycmlkZSBfZGVzdHJveUN1c3RvbUJhZ01lc2gobWVzaDogcGN4Lk1lc2hJbnN0YW5jZSAmIEN1c3RvbU1lc2hJbnN0YW5jZSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2Rlc3Ryb3lNZXNoKG1lc2gpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3VwZGF0ZUluZGV4QnVmZmVyKGdyYXBoaWNzRGV2aWNlOiBwY3guR3JhcGhpY3NEZXZpY2UpIHtcclxuICAgICAgICB0aGlzLl9zaGFyZWRJbmRleEJ1ZmZlcj8uZGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMuX3NoYXJlZEluZGV4QnVmZmVyID0gbmV3IHBjLkluZGV4QnVmZmVyKFxyXG4gICAgICAgICAgICBncmFwaGljc0RldmljZSxcclxuICAgICAgICAgICAgcGMuSU5ERVhGT1JNQVRfVUlOVDMyLFxyXG4gICAgICAgICAgICB0aGlzLnRlcnJhaW4ucGF0Y2hJbmRpY2VzLmxlbmd0aCxcclxuICAgICAgICAgICAgcGMuQlVGRkVSX1NUQVRJQyxcclxuICAgICAgICAgICAgdGhpcy50ZXJyYWluLnBhdGNoSW5kaWNlcyxcclxuICAgICAgICAgICAgeyBzdG9yYWdlOiBmYWxzZSB9XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF91cGRhdGVWZXJ0ZXhCdWZmZXIoZ3JhcGhpY3NEZXZpY2U6IHBjeC5HcmFwaGljc0RldmljZSkge1xyXG4gICAgICAgIGNvbnN0IGZvcm1hdCA9IHRoaXMuX2J1aWxkVmVydGV4Rm9ybWF0KGdyYXBoaWNzRGV2aWNlLCB0aGlzLnRlcnJhaW4ucGF0Y2hWZXJ0aWNlcyk7XHJcbiAgICAgICAgdGhpcy5fc2hhcmVkVmVydGV4QnVmZmVyPy5kZXN0cm95KCk7XHJcbiAgICAgICAgdGhpcy5fc2hhcmVkVmVydGV4QnVmZmVyID0gbmV3IHBjLlZlcnRleEJ1ZmZlcihncmFwaGljc0RldmljZSwgZm9ybWF0LCBmb3JtYXQudmVydGV4Q291bnQsIHtcclxuICAgICAgICAgICAgdXNhZ2U6IHBjLkJVRkZFUl9TVEFUSUMsXHJcbiAgICAgICAgICAgIHN0b3JhZ2U6IGZhbHNlLFxyXG4gICAgICAgICAgICBkYXRhOiB0aGlzLnRlcnJhaW4ucGF0Y2hWZXJ0aWNlcy5wYXRjaFZlcnRleEJ1ZmZlckRhdGEsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdEhlaWdodE1hcFRleHR1cmUoYXBwOiBwY3guQXBwQmFzZSkge1xyXG5cclxuICAgICAgICB0aGlzLl9oZWlnaHRNYXA/LmRlc3Ryb3koKTtcclxuXHJcbiAgICAgICAgY29uc3QgaGVpZ2h0Rm9ybWF0ICA9IGdldEhlaWdodE1hcEZvcm1hdChhcHAuZ3JhcGhpY3NEZXZpY2UsIHRoaXMudGVycmFpbi5oZWlnaHRNYXApO1xyXG4gICAgICAgIGNvbnN0IGZvcm1hdCAgICAgICAgPSBnZXRUZXh0dXJlVHlwZShoZWlnaHRGb3JtYXQpO1xyXG4gICAgICAgIGNvbnN0IGJ1ZkZvcm1hdCAgICAgPSBnZXRIZWlnaHRNYXBDaHVua0J1ZmZlclR5cGUoYXBwLmdyYXBoaWNzRGV2aWNlLCBmb3JtYXQpO1xyXG4gICAgICAgIGNvbnN0IGRhdGFDaHVua1NpemUgPSB0aGlzLnRlcnJhaW4uaGVpZ2h0TWFwLmRhdGFDaHVua1NpemU7XHJcbiAgICAgICAgY29uc3QgY2h1bmtzICAgICAgICA9IHRoaXMudGVycmFpbi5oZWlnaHRNYXAuZ2V0Q2h1bmtzQnVmZmVycyhidWZGb3JtYXQpO1xyXG5cclxuICAgICAgICB0aGlzLl9oZWlnaHRNYXBMZXZlbHNUeXBlID0gYnVmRm9ybWF0O1xyXG4gICAgICAgIHRoaXMuX2hlaWdodE1hcCA9IG5ldyBwYy5UZXh0dXJlKGFwcC5ncmFwaGljc0RldmljZSwge1xyXG4gICAgICAgICAgICB3aWR0aDogZGF0YUNodW5rU2l6ZSxcclxuICAgICAgICAgICAgaGVpZ2h0OiBkYXRhQ2h1bmtTaXplLFxyXG4gICAgICAgICAgICBmb3JtYXQ6IGZvcm1hdCxcclxuICAgICAgICAgICAgbWlwbWFwczogZmFsc2UsXHJcbiAgICAgICAgICAgIG1pbkZpbHRlcjogcGMuRklMVEVSX0xJTkVBUixcclxuICAgICAgICAgICAgbWFnRmlsdGVyOiBwYy5GSUxURVJfTElORUFSLFxyXG4gICAgICAgICAgICBhZGRyZXNzVTogcGMuQUREUkVTU19DTEFNUF9UT19FREdFLFxyXG4gICAgICAgICAgICBhZGRyZXNzVjogcGMuQUREUkVTU19DTEFNUF9UT19FREdFLFxyXG4gICAgICAgICAgICBhZGRyZXNzVzogcGMuQUREUkVTU19DTEFNUF9UT19FREdFLFxyXG4gICAgICAgICAgICBmbGlwWTogYXBwLmdyYXBoaWNzRGV2aWNlLmlzV2ViR1BVLFxyXG4gICAgICAgICAgICBhcnJheUxlbmd0aDogY2h1bmtzLmxlbmd0aCxcclxuICAgICAgICAgICAgbGV2ZWxzOiBbY2h1bmtzXVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvdmVycmlkZSB1cGRhdGVJbmRleEJ1ZmZlcigpIHtcclxuXHJcbiAgICAgICAgdGhpcy5fdXBkYXRlSW5kZXhCdWZmZXIodGhpcy5fYXBwLmdyYXBoaWNzRGV2aWNlKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY3VzdG9tRm9yd2FyZFJlbmRlcmVyIHx8XHJcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2luZy5lbmFibGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTWVzaGVzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHRoaXMubWVzaEluc3RhbmNlQXJyYXkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWVzaC5pbmRleEJ1ZmZlclswXSA9IHRoaXMuX3NoYXJlZEluZGV4QnVmZmVyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2JpbmREZXBlbmRlbmNpZXNUb01hdGVyaWFsKG1hdGVyaWFsOiBwY3guU3RhbmRhcmRNYXRlcmlhbCkge1xyXG5cclxuICAgICAgICBtYXRlcmlhbC5zZXRBdHRyaWJ1dGUocGF0Y2hJbnN0Q29vcmRPZmZzZXRQYXJhbU5hbWUsIHBjLlNFTUFOVElDX0FUVFIxMCk7XHJcbiAgICAgICAgbWF0ZXJpYWwuc2V0QXR0cmlidXRlKHZlcnRleENvb3JkQXR0ck5hbWUsIHBjLlNFTUFOVElDX1BPU0lUSU9OKTtcclxuICAgICAgICBtYXRlcmlhbC5zZXRQYXJhbWV0ZXIocGF0Y2hMb2RDb3JlUGFyYW1OYW1lLCAwKTtcclxuICAgICAgICBtYXRlcmlhbC5zZXRQYXJhbWV0ZXIocGF0Y2hDb29yZE9mZnNldFBhcmFtTmFtZSwgWzAsIDBdKTtcclxuICAgICAgICBtYXRlcmlhbC5zZXRQYXJhbWV0ZXIodGVycmFpbkhlaWdodE1hcFBhcmFtTmFtZSwgdGhpcy5faGVpZ2h0TWFwKTtcclxuXHJcbiAgICAgICAgY29uc3QgZm9ybWF0ID0gZ2V0SGVpZ2h0TWFwRm9ybWF0KHRoaXMuX2FwcC5ncmFwaGljc0RldmljZSwgdGhpcy50ZXJyYWluLmhlaWdodE1hcCk7XHJcbiAgICAgICAgY29uc3QgY2h1bmtzU3RvcmUgPSBnZXRUZXJyYWluU2hhZGVyQ2h1bmtzKHtcclxuICAgICAgICAgICAgd2lkdGg6IHRoaXMudGVycmFpbi53aWR0aCxcclxuICAgICAgICAgICAgZGVwdGg6IHRoaXMudGVycmFpbi5kZXB0aCxcclxuICAgICAgICAgICAgaGVpZ2h0TWFwQ2h1bmtTaXplOiB0aGlzLnRlcnJhaW4uaGVpZ2h0TWFwLmRhdGFDaHVua1NpemUsIFxyXG4gICAgICAgICAgICBpbnN0YW5jaW5nOiB0aGlzLmluc3RhbmNpbmcuZW5hYmxlZCxcclxuICAgICAgICAgICAgaGVpZ2h0TWFwRm9ybWF0OiBmb3JtYXQsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgY2h1bmtOYW1lcyA9IE9iamVjdC5rZXlzKGNodW5rc1N0b3JlKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgY2h1bmtOYW1lIG9mIGNodW5rTmFtZXMpIHtcclxuICAgICAgICAgICAgbWF0ZXJpYWwuY2h1bmtzW2NodW5rTmFtZV0gPSBjaHVua3NTdG9yZVtjaHVua05hbWVdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBtYXRlcmlhbC5jaHVua3MuQVBJVmVyc2lvbiA9IHBjLkNIVU5LQVBJXzFfNzA7XHJcbiAgICAgICAgbWF0ZXJpYWwudXBkYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG92ZXJyaWRlIHVwZGF0ZU1hdGVyaWFsKG1hdGVyaWFsOiBwY3guU3RhbmRhcmRNYXRlcmlhbCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2JpbmREZXBlbmRlbmNpZXNUb01hdGVyaWFsKG1hdGVyaWFsKTtcclxuICAgICAgICBzdXBlci51cGRhdGVNYXRlcmlhbChtYXRlcmlhbCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG92ZXJyaWRlIHVwZGF0ZUhlaWdodHMoem9uZTogSVpvbmUpIHtcclxuICAgICAgICBzdXBlci51cGRhdGVIZWlnaHRzKHpvbmUpO1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZUhlaWdodE1hcCh6b25lKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdChhcHA6IHBjeC5BcHBCYXNlLCBlbnRpdHk6IHBjeC5FbnRpdHksIG1hdGVyaWFsOiBwY3guU3RhbmRhcmRNYXRlcmlhbCkge1xyXG4gICAgICAgIHRoaXMuX2luaXRIZWlnaHRNYXBUZXh0dXJlKGFwcCk7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlSW5kZXhCdWZmZXIoYXBwLmdyYXBoaWNzRGV2aWNlKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVWZXJ0ZXhCdWZmZXIoYXBwLmdyYXBoaWNzRGV2aWNlKTtcclxuICAgICAgICBzdXBlci5pbml0KGFwcCwgZW50aXR5LCBtYXRlcmlhbCk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBpbnQgfSBmcm9tIFwiLi4vU2hhcmVkL1R5cGVzLm1qc1wiO1xyXG5pbXBvcnQgeyBJRnJ1c3R1bSwgSUdyaWRQYXRjaFJlbmRlclByZXBhcmVyIH0gZnJvbSBcIi4uL1RlcnJhaW5TeXN0ZW0vR2VvbWlwR3JpZFJlbmRlclByZXBhcmVyLm1qc1wiO1xyXG5pbXBvcnQgeyBJUGF0Y2hMb2QgfSBmcm9tIFwiLi4vVGVycmFpblN5c3RlbS9Mb2RNYW5hZ2VyLm1qc1wiO1xyXG5pbXBvcnQgeyBJUGF0Y2hQcmltaXRpdmUgfSBmcm9tIFwiLi9UZXJyYWluUGF0Y2hlcy5tanNcIjtcclxuaW1wb3J0IFRlcnJhaW5QYXRjaGVzQmFzaWMsIHsgVGVycmFpblBhdGNoQnVmZmVyQmFzaWMgfSBmcm9tIFwiLi9UZXJyYWluUGF0Y2hlc0Jhc2ljLm1qc1wiO1xyXG5pbXBvcnQgeyBwYXRjaExvZENvcmVQYXJhbU5hbWUgfSBmcm9tIFwiLi9UZXJyYWluUGF0Y2hlc1NoYWRlckNodW5rcy5tanNcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVJlbmRlck9wdGlvbnMge1xyXG4gICAgd2lyZWZyYW1lPzogYm9vbGVhbixcclxuICAgIGNhc3RTaGFkb3c/OiBib29sZWFuLFxyXG4gICAgcmVjZWl2ZVNoYWRvdz86IGJvb2xlYW4sXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlcnJhaW5SZW5kZXJQcmVwYXJlciBpbXBsZW1lbnRzIElHcmlkUGF0Y2hSZW5kZXJQcmVwYXJlciB7XHJcblxyXG4gICAgcHJpdmF0ZSBfd2lyZWZyYW1lOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBfY2FzdFNoYWRvdzogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgX3JlY2VpdmVTaGFkb3c6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIF9oYXNVcGRhdGVkSGVpZ2h0czogYm9vbGVhbjtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IHdpcmVmcmFtZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3dpcmVmcmFtZTsgfVxyXG4gICAgcHVibGljIHNldCB3aXJlZnJhbWUodjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuX3dpcmVmcmFtZSA9IHY7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlTWVzaGVzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBjYXN0U2hhZG93KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fY2FzdFNoYWRvdzsgfVxyXG4gICAgcHVibGljIHNldCBjYXN0U2hhZG93KHY6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLl9jYXN0U2hhZG93ID0gdjtcclxuICAgICAgICB0aGlzLl91cGRhdGVNZXNoZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHJlY2VpdmVTaGFkb3coKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9yZWNlaXZlU2hhZG93OyB9XHJcbiAgICBwdWJsaWMgc2V0IHJlY2VpdmVTaGFkb3codjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuX3JlY2VpdmVTaGFkb3cgPSB2O1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZU1lc2hlcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlYWRvbmx5IHBhdGNoZXNTdG9yZTogVGVycmFpblBhdGNoZXNCYXNpYzxUZXJyYWluUGF0Y2hCdWZmZXJCYXNpYywgSVBhdGNoUHJpbWl0aXZlPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwYXRjaGVzU3RvcmU6IFRlcnJhaW5QYXRjaGVzQmFzaWM8VGVycmFpblBhdGNoQnVmZmVyQmFzaWMsIElQYXRjaFByaW1pdGl2ZT4sIG9wdGlvbnM6IElSZW5kZXJPcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5wYXRjaGVzU3RvcmUgPSBwYXRjaGVzU3RvcmU7XHJcbiAgICAgICAgdGhpcy5fd2lyZWZyYW1lID0gb3B0aW9ucy53aXJlZnJhbWUgPz8gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fY2FzdFNoYWRvdyA9IG9wdGlvbnMuY2FzdFNoYWRvdyA/PyBmYWxzZTtcclxuICAgICAgICB0aGlzLl9yZWNlaXZlU2hhZG93ID0gb3B0aW9ucy5yZWNlaXZlU2hhZG93ID8/IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2hhc1VwZGF0ZWRIZWlnaHRzID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIF91cGRhdGVNZXNoZXMoKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IGN1c3RvbU1lc2hJbnN0YW5jZSA9IHRoaXMucGF0Y2hlc1N0b3JlLmN1c3RvbU1lc2hJbnN0YW5jZTtcclxuICAgICAgICBpZiAoY3VzdG9tTWVzaEluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZU1lc2goY3VzdG9tTWVzaEluc3RhbmNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgbWVzaEluc3RhbmNlIG9mIHRoaXMucGF0Y2hlc1N0b3JlLm1lc2hJbnN0YW5jZUFycmF5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZU1lc2gobWVzaEluc3RhbmNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucGF0Y2hlc1N0b3JlLmluc3RhbmNpbmcuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlTWVzaChpdGVtLm9iamVjdCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIF91cGRhdGVNZXNoKG1lc2hJbnN0YW5jZT86IHBjeC5NZXNoSW5zdGFuY2UgfCBudWxsKSB7XHJcbiAgICAgICAgaWYgKG1lc2hJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICBtZXNoSW5zdGFuY2UubWVzaC5wcmltaXRpdmVbMF0udHlwZSA9IHRoaXMuX3dpcmVmcmFtZSA/IHBjLlBSSU1JVElWRV9MSU5FUyA6IHBjLlBSSU1JVElWRV9UUklBTkdMRVM7XHJcbiAgICAgICAgICAgIG1lc2hJbnN0YW5jZS5jYXN0U2hhZG93ID0gdGhpcy5fY2FzdFNoYWRvdztcclxuICAgICAgICAgICAgbWVzaEluc3RhbmNlLnJlY2VpdmVTaGFkb3cgPSB0aGlzLl9yZWNlaXZlU2hhZG93O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcHJlcGFyZVBhdGNoKHZpc2libGU6IGJvb2xlYW4sIGJhc2VJbmRleDogaW50LCBiYXNlVmVydGV4OiBpbnQsIGNvdW50OiBpbnQsIHBhdGNoWDogaW50LCBwYXRjaFo6IGludCwgbWluWDogaW50LCBtaW5aOiBpbnQsIHNpemU6IGludCwgbG9kSW5mbzogUmVhZG9ubHk8SVBhdGNoTG9kPikge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IHRlcnJhaW4gPSB0aGlzLnBhdGNoZXNTdG9yZS50ZXJyYWluO1xyXG4gICAgICAgIGNvbnN0IHBhdGNoSW5kZXggPSBwYXRjaFogKiB0ZXJyYWluLm51bVBhdGNoZXNYICsgcGF0Y2hYO1xyXG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMucGF0Y2hlc1N0b3JlLmJ1ZmZlckFycmF5W3BhdGNoSW5kZXhdO1xyXG4gICAgICAgIGNvbnN0IGN1cnJIYXNoID0gYmFzZUluZGV4IC8gY291bnQ7XHJcblxyXG4gICAgICAgIGJ1ZmZlci5oYXNoICAgICAgICAgICAgICA9IGN1cnJIYXNoO1xyXG4gICAgICAgIGJ1ZmZlci52aXNpYmxlICAgICAgICAgICA9IHZpc2libGU7XHJcbiAgICAgICAgYnVmZmVyLmluZGljZXNCYXNlSW5kZXggID0gYmFzZUluZGV4O1xyXG4gICAgICAgIGJ1ZmZlci5pbmRpY2VzQmFzZVZlcnRleCA9IGJhc2VWZXJ0ZXg7XHJcbiAgICAgICAgYnVmZmVyLmluZGljZXNDb3VudCAgICAgID0gY291bnQ7XHJcbiAgICAgICAgYnVmZmVyLmxvZCAgICAgICAgICAgICAgID0gbG9kSW5mbztcclxuXHJcbiAgICAgICAgaWYgKGJ1ZmZlci5oZWlnaHRzVXBkYXRlZCkge1xyXG4gICAgICAgICAgICBidWZmZXIuaGVpZ2h0c1VwZGF0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgYnVmZmVyLmhlaWdodHNVcGRhdGVkVGhpc0ZyYW1lID0gdmlzaWJsZTtcclxuICAgICAgICAgICAgdGhpcy5faGFzVXBkYXRlZEhlaWdodHMgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMucGF0Y2hlc1N0b3JlLmN1c3RvbUZvcndhcmRSZW5kZXJlcikge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgcHJpbWl0aXZlID0gdGhpcy5wYXRjaGVzU3RvcmUuY3VzdG9tTWVzaEluc3RhbmNlIS5tZXNoLnByaW1pdGl2ZUNodW5rc1swXVtwYXRjaEluZGV4XTtcclxuXHJcbiAgICAgICAgICAgIHByaW1pdGl2ZS5lbmFibGVkID0gdmlzaWJsZTtcclxuICAgICAgICAgICAgcHJpbWl0aXZlLmJhc2UgICAgPSBiYXNlSW5kZXg7XHJcbiAgICAgICAgICAgIHByaW1pdGl2ZS5jb3VudCAgID0gY291bnQ7XHJcbiAgICAgICAgICAgIHByaW1pdGl2ZS50eXBlICAgID0gdGhpcy5fd2lyZWZyYW1lID8gcGMuUFJJTUlUSVZFX0xJTkVTIDogcGMuUFJJTUlUSVZFX1RSSUFOR0xFUztcclxuXHJcbiAgICAgICAgICAgIHByaW1pdGl2ZS5hdHRyaWJ1dGVzW3BhdGNoTG9kQ29yZVBhcmFtTmFtZV0gPSBsb2RJbmZvLmNvcmU7XHJcblxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5wYXRjaGVzU3RvcmUuaW5zdGFuY2luZy5lbmFibGVkKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAodmlzaWJsZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGluc3QgPSB0aGlzLnBhdGNoZXNTdG9yZS5pbnN0YW5jaW5nLmluY3JlbWVudChsb2RJbmZvLCBtaW5YLCBtaW5aKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKGluc3Qub2JqZWN0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lc2hJbnN0YW5jZSA9IGluc3Qub2JqZWN0O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByaW1pdGl2ZSA9IG1lc2hJbnN0YW5jZS5tZXNoLnByaW1pdGl2ZVswXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbWVzaEluc3RhbmNlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc2hJbnN0YW5jZS52aXNpYmxlVGhpc0ZyYW1lID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBtZXNoSW5zdGFuY2UuY2FzdFNoYWRvdyA9IHRoaXMuX2Nhc3RTaGFkb3c7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzaEluc3RhbmNlLnJlY2VpdmVTaGFkb3cgPSB0aGlzLl9yZWNlaXZlU2hhZG93O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBwcmltaXRpdmUudHlwZSA9IHRoaXMuX3dpcmVmcmFtZSA/IHBjLlBSSU1JVElWRV9MSU5FUyA6IHBjLlBSSU1JVElWRV9UUklBTkdMRVM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG1lc2hJbnN0YW5jZSA9IHRoaXMucGF0Y2hlc1N0b3JlLmdldE9yQ3JlYXRlUGF0Y2hNZXNoKHBhdGNoSW5kZXgpO1xyXG4gICAgICAgIGNvbnN0IG1lc2ggPSBtZXNoSW5zdGFuY2UubWVzaDtcclxuICAgICAgICBjb25zdCBwcmltaXRpdmUgPSBtZXNoLnByaW1pdGl2ZVswXTtcclxuXHJcbiAgICAgICAgaWYgKG1lc2hJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICBtZXNoSW5zdGFuY2UudmlzaWJsZSA9IHZpc2libGU7XHJcbiAgICAgICAgICAgIG1lc2hJbnN0YW5jZS52aXNpYmxlVGhpc0ZyYW1lID0gdmlzaWJsZTtcclxuXHJcbiAgICAgICAgICAgIG1lc2hJbnN0YW5jZS5jYXN0U2hhZG93ICAgID0gdGhpcy5fY2FzdFNoYWRvdztcclxuICAgICAgICAgICAgbWVzaEluc3RhbmNlLnJlY2VpdmVTaGFkb3cgPSB0aGlzLl9yZWNlaXZlU2hhZG93O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpbWl0aXZlLmJhc2UgID0gYmFzZUluZGV4O1xyXG4gICAgICAgIHByaW1pdGl2ZS5jb3VudCA9IGNvdW50O1xyXG4gICAgICAgIHByaW1pdGl2ZS50eXBlICA9IHRoaXMuX3dpcmVmcmFtZSA/IHBjLlBSSU1JVElWRV9MSU5FUyA6IHBjLlBSSU1JVElWRV9UUklBTkdMRVM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbWVzaEluc3RhbmNlLnNldFBhcmFtZXRlcihwYXRjaExvZENvcmVQYXJhbU5hbWUsIGxvZEluZm8uY29yZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbmRlcihmcnVzdHVtPzogSUZydXN0dW0pIHtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogSW4gdGhlb3J5IHdlIGNhbiBjb250cm9sIHRoZSBxdWFsaXR5IG9mIHRoZSBtb2RlbCBmb3Igc2hhZG93c1xyXG4gICAgICAgIC8vIFRPRE86IEFkZCBzdXBwb3J0IGZvciBPY2NsdXNpb24gY3VsbGluZ1xyXG5cclxuICAgICAgICB0aGlzLl9oYXNVcGRhdGVkSGVpZ2h0cyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5wYXRjaGVzU3RvcmUuY3VzdG9tRm9yd2FyZFJlbmRlcmVyKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBjdXN0b21NZXNoSW5zdGFuY2UgPSB0aGlzLnBhdGNoZXNTdG9yZS5jdXN0b21NZXNoSW5zdGFuY2U7XHJcblxyXG4gICAgICAgICAgICBpZiAoY3VzdG9tTWVzaEluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICBjdXN0b21NZXNoSW5zdGFuY2UudmlzaWJsZSAgICAgICA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBjdXN0b21NZXNoSW5zdGFuY2UuY2FzdFNoYWRvdyAgICA9IHRoaXMuX2Nhc3RTaGFkb3c7XHJcbiAgICAgICAgICAgICAgICBjdXN0b21NZXNoSW5zdGFuY2UucmVjZWl2ZVNoYWRvdyA9IHRoaXMuX3JlY2VpdmVTaGFkb3c7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgbWVzaCA9IGN1c3RvbU1lc2hJbnN0YW5jZS5tZXNoO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJpbWl0aXZlID0gbWVzaC5wcmltaXRpdmVbMF07XHJcblxyXG4gICAgICAgICAgICAgICAgcHJpbWl0aXZlLnR5cGUgID0gdGhpcy5fd2lyZWZyYW1lID8gcGMuUFJJTUlUSVZFX0xJTkVTIDogcGMuUFJJTUlUSVZFX1RSSUFOR0xFUztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5wYXRjaGVzU3RvcmUuaW5zdGFuY2luZy5lbmFibGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGF0Y2hlc1N0b3JlLmluc3RhbmNpbmcuYmVnaW4oZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucGF0Y2hlc1N0b3JlLnN0YXJ0UmVuZGVyKCk7XHJcbiAgICAgICAgdGhpcy5wYXRjaGVzU3RvcmUudGVycmFpbi5lYWNoUGF0Y2hlcyh0aGlzLCBmcnVzdHVtKTtcclxuICAgICAgICB0aGlzLnBhdGNoZXNTdG9yZS5lbmRSZW5kZXIodGhpcy5faGFzVXBkYXRlZEhlaWdodHMpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5wYXRjaGVzU3RvcmUuaW5zdGFuY2luZy5lbmFibGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGF0Y2hlc1N0b3JlLmluc3RhbmNpbmcuZW5kKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiZXhwb3J0IGludGVyZmFjZSBJQnJ1c2hTZXR0aW5ncyB7XHJcbiAgICByZWFkb25seSBhY3RpdmU6IG51bWJlcixcclxuICAgIHJlYWRvbmx5IHNpemU6IG51bWJlcixcclxuICAgIHJlYWRvbmx5IG9wYWNpdHk6IG51bWJlcixcclxuICAgIHJlYWRvbmx5IHRleHR1cmVzOiBwY3guQXNzZXRbXTtcclxufSIsImV4cG9ydCBjb25zdCB2ZXJ0ZXhTaGFkZXIgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gXHJcbiAgICBhdHRyaWJ1dGUgdmVjMyBhUG9zaXRpb247XHJcbiAgICBhdHRyaWJ1dGUgdmVjMiBhVXYwO1xyXG5cclxuICAgIHVuaWZvcm0gbWF0NCBtYXRyaXhfbW9kZWw7XHJcbiAgICB1bmlmb3JtIG1hdDQgbWF0cml4X3ZpZXdQcm9qZWN0aW9uO1xyXG5cclxuICAgIHZhcnlpbmcgdmVjMiB2VXYwO1xyXG5cclxuICAgIHZvaWQgbWFpbih2b2lkKVxyXG4gICAge1xyXG4gICAgICAgIHZVdjAgPSBhVXYwO1xyXG4gICAgICAgIGdsX1Bvc2l0aW9uID0gbWF0cml4X3ZpZXdQcm9qZWN0aW9uICogbWF0cml4X21vZGVsICogdmVjNChhUG9zaXRpb24sIDEuMCk7XHJcbiAgICB9XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3QgZmFjdG9yTWV0aG9kID0gLyoqIEB0eXBlIGdsc2wgKi9cclxuYFxyXG4gICAgdmFyeWluZyB2ZWMyIHZVdjA7XHJcblxyXG4gICAgdW5pZm9ybSBzYW1wbGVyMkQgdUhlaWdodE1hcDtcclxuICAgIHVuaWZvcm0gZmxvYXQgdUJydXNoT3BhY2l0eTtcclxuICAgIHVuaWZvcm0gdmVjNCB1QnJ1c2hNYXNrO1xyXG5cclxuICAgIGZsb2F0IGdldEZhY3RvcigpIHtcclxuICAgICAgICB2ZWM0IGhlaWdodE1hcCA9IHRleHR1cmUyRCh1SGVpZ2h0TWFwLCB2VXYwKTtcclxuICAgICAgICBmbG9hdCBoZWlnaHQgICA9IChoZWlnaHRNYXAuciArIGhlaWdodE1hcC5nICsgaGVpZ2h0TWFwLmIpIC8gMy4wIC8gaGVpZ2h0TWFwLmE7XHJcbiAgICAgICAgZmxvYXQgZmFjdG9yICAgPSBoZWlnaHQgKiB1QnJ1c2hPcGFjaXR5O1xyXG4gICAgICAgIHJldHVybiBmYWN0b3I7XHJcbiAgICB9XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3QgZnJhZ21lbnRTaGFkZXIgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gXHJcbiAgICAke2ZhY3Rvck1ldGhvZH1cclxuXHJcbiAgICB2b2lkIG1haW4odm9pZClcclxuICAgIHtcclxuICAgICAgICBmbG9hdCBmYWN0b3IgPSBnZXRGYWN0b3IoKTtcclxuICAgICAgICB2ZWM0IGNvbG9yID0gdmVjNCh1QnJ1c2hNYXNrICogZmFjdG9yKTtcclxuXHJcbiAgICAgICAgZ2xfRnJhZ0NvbG9yID0gY29sb3I7XHJcbiAgICB9XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3QgZnJhZ21lbnRJbnZlcnRTaGFkZXIgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gXHJcbiAgICAke2ZhY3Rvck1ldGhvZH1cclxuXHJcbiAgICB2b2lkIG1haW4odm9pZClcclxuICAgIHtcclxuICAgICAgICBmbG9hdCBsZXZlbHMgPSA0LjA7XHJcbiAgICAgICAgZmxvYXQgZmFjdG9yID0gZ2V0RmFjdG9yKCk7XHJcbiAgICAgICAgdmVjNCBjb2xvciAgID0gdmVjNChmYWN0b3IpO1xyXG5cclxuICAgICAgICBpZiAodUJydXNoTWFzay5yID4gMC4wKSB7IGNvbG9yLnIgPSAwLjA7IGxldmVscyAtPSAxLjA7IH1cclxuICAgICAgICBpZiAodUJydXNoTWFzay5nID4gMC4wKSB7IGNvbG9yLmcgPSAwLjA7IGxldmVscyAtPSAxLjA7IH1cclxuICAgICAgICBpZiAodUJydXNoTWFzay5iID4gMC4wKSB7IGNvbG9yLmIgPSAwLjA7IGxldmVscyAtPSAxLjA7IH1cclxuICAgICAgICBpZiAodUJydXNoTWFzay5hID4gMC4wKSB7IGNvbG9yLmEgPSAwLjA7IGxldmVscyAtPSAxLjA7IH1cclxuXHJcbiAgICAgICAgZ2xfRnJhZ0NvbG9yID0gY29sb3IgLyBsZXZlbHM7XHJcbiAgICB9XHJcbmA7IiwiZXhwb3J0IGNvbnN0IHNldFByZWNpc2lvbiA9IChncmFwaGljc0RldmljZTogcGN4LkdyYXBoaWNzRGV2aWNlLCBzaGFkZXJDb2RlOiBzdHJpbmcpID0+IHtcclxuICAgIHJldHVybiBcInByZWNpc2lvbiBcIiArIGdyYXBoaWNzRGV2aWNlLnByZWNpc2lvbiArIFwiIGZsb2F0O1xcblwiICsgc2hhZGVyQ29kZTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGNoZWNrR0RTdXBwb3J0UjMyRiA9IChncmFwaGljc0RldmljZTogcGN4LkdyYXBoaWNzRGV2aWNlKSA9PiB7XHJcbiAgICBcclxuICAgIC8vIFRPRE86IG1heWJlIG5vdCBzdXBwb3J0XHJcbiAgICBpZiAoZ3JhcGhpY3NEZXZpY2UuaXNXZWJHUFUpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcmVzdWx0OiB1bmtub3duID0gZmFsc2U7XHJcbiAgICBcclxuICAgIGlmIChncmFwaGljc0RldmljZS5pc1dlYkdMMikge1xyXG5cclxuICAgICAgICBjb25zdCBnbCA9IChncmFwaGljc0RldmljZSBhcyBwY3guV2ViZ2xHcmFwaGljc0RldmljZSkuZ2w7XHJcblxyXG4gICAgICAgIHJlc3VsdCA9IGdsLmdldEV4dGVuc2lvbihcIkVYVF9jb2xvcl9idWZmZXJfZmxvYXRcIik7XHJcblxyXG4gICAgICAgIGlmIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gZ2wuZ2V0RXh0ZW5zaW9uKFwiT0VTX3RleHR1cmVfZmxvYXRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vYWxlcnQoSlNPTi5zdHJpbmdpZnkocmVzdWx0KSk7XHJcblxyXG4gICAgcmV0dXJuICEhcmVzdWx0O1xyXG59IiwiaW1wb3J0IHsgSUJydXNoU2V0dGluZ3MgfSBmcm9tIFwiLi9CcnVzaC5tanNcIjtcclxuaW1wb3J0IHsgZnJhZ21lbnRJbnZlcnRTaGFkZXIsIGZyYWdtZW50U2hhZGVyLCB2ZXJ0ZXhTaGFkZXIgfSBmcm9tIFwiLi9Db2xvclBhaW50ZXJTaGFkZXJzLm1qc1wiO1xyXG5pbXBvcnQgeyBzZXRQcmVjaXNpb24gfSBmcm9tIFwiLi9TaGFyZWQubWpzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgcGFpbnRlckNhbWVyYUZhciA9IDEwO1xyXG5leHBvcnQgY29uc3QgcGFpbnRlckxheWVyTmFtZSA9ICdUZXJyYWluRWRpdG9yJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbG9yUGFpbnRlciB7XHJcblxyXG4gICAgcHJpdmF0ZSBfcGFpbnRpbmc6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIF9wYWludGVyTWFzazogRmxvYXQzMkFycmF5O1xyXG4gICAgcHJpdmF0ZSBfYnJ1c2hTZXR0aW5nczogSUJydXNoU2V0dGluZ3M7XHJcblxyXG4gICAgcHJpdmF0ZSBfYXBwOiBwY3guQXBwQmFzZTtcclxuICAgIHByaXZhdGUgX2J1ZmZlcjogcGN4LlRleHR1cmU7XHJcbiAgICBwcml2YXRlIF9wYWludGVyUmVuZGVyVGFyZ2V0OiBwY3guUmVuZGVyVGFyZ2V0O1xyXG4gICAgcHJpdmF0ZSBfcGFpbnRlckNhbWVyYUVudGl0eTogcGN4LkVudGl0eTtcclxuXHJcbiAgICBwcml2YXRlIF9wYWludGVyU2hhZGVyOiBwY3guU2hhZGVyO1xyXG4gICAgcHJpdmF0ZSBfcGFpbnRlck1hdGVyaWFsOiBwY3guTWF0ZXJpYWw7XHJcbiAgICBwcml2YXRlIF9wYWludGVyRW50aXR5OiBwY3guRW50aXR5O1xyXG5cclxuICAgIHByaXZhdGUgX3BhaW50ZXJJbnZlcnRTaGFkZXI6IHBjeC5TaGFkZXI7XHJcbiAgICBwcml2YXRlIF9wYWludGVySW52ZXJ0TWF0ZXJpYWw6IHBjeC5NYXRlcmlhbDtcclxuICAgIHByaXZhdGUgX3BhaW50ZXJJbnZlcnRFbnRpdHk6IHBjeC5FbnRpdHk7XHJcblxyXG4gICAgcHVibGljIGdldCBwYWludGluZygpICAgeyByZXR1cm4gdGhpcy5fcGFpbnRpbmc7IH1cclxuICAgIHB1YmxpYyBnZXQgY2FtZXJhRmFyKCkgIHsgcmV0dXJuIHBhaW50ZXJDYW1lcmFGYXI7IH1cclxuICAgIHB1YmxpYyBnZXQgYmFja2dyb3VuZCgpIHsgcmV0dXJuIHRoaXMuX2J1ZmZlcjsgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKGFwcDogcGN4LkFwcEJhc2UsIGJ1ZmZlcjogcGN4LlRleHR1cmUpIHtcclxuXHJcbiAgICAgICAgdGhpcy5fcGFpbnRpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9wYWludGVyTWFzayA9IG5ldyBGbG9hdDMyQXJyYXkoNCk7XHJcbiAgICAgICAgdGhpcy5fYnVmZmVyID0gYnVmZmVyO1xyXG4gICAgICAgIHRoaXMuX2FwcCA9IGFwcDtcclxuXHJcbiAgICAgICAgdGhpcy5faW5pdENhbWVyYSgpO1xyXG4gICAgICAgIHRoaXMuX2luaXRTaGFkZXJzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdE1hdGVyaWFscygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRFbnRpdGllcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXRDYW1lcmEoKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHBhaW50ZXJMYXllciA9IHRoaXMuX2FwcC5zY2VuZS5sYXllcnMuZ2V0TGF5ZXJCeU5hbWUocGFpbnRlckxheWVyTmFtZSkhO1xyXG5cclxuICAgICAgICB0aGlzLl9wYWludGVyUmVuZGVyVGFyZ2V0ID0gbmV3IHBjLlJlbmRlclRhcmdldCh7XHJcbiAgICAgICAgICAgIGNvbG9yQnVmZmVyOiB0aGlzLl9idWZmZXIsXHJcbiAgICAgICAgICAgIGZsaXBZOiB0aGlzLl9hcHAuZ3JhcGhpY3NEZXZpY2UuaXNXZWJHUFUsXHJcbiAgICAgICAgICAgIGRlcHRoOiBmYWxzZSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckNhbWVyYUVudGl0eSA9IG5ldyBwYy5FbnRpdHkoJ1RlcnJhaW5QYWludGVyQ2FtZXJhJyk7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckNhbWVyYUVudGl0eS5zZXRMb2NhbFBvc2l0aW9uKDAsIDAsIHBhaW50ZXJDYW1lcmFGYXIpO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJDYW1lcmFFbnRpdHkubG9va0F0KDAsIDAsIDApO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJDYW1lcmFFbnRpdHkuYWRkQ29tcG9uZW50KCdjYW1lcmEnLCB7XHJcbiAgICAgICAgICAgIHByb2plY3Rpb246IHBjLlBST0pFQ1RJT05fT1JUSE9HUkFQSElDLFxyXG4gICAgICAgICAgICBjbGVhckNvbG9yQnVmZmVyOiBmYWxzZSxcclxuICAgICAgICAgICAgY2xlYXJEZXB0aEJ1ZmZlcjogZmFsc2UsXHJcbiAgICAgICAgICAgIHByaW9yaXR5OiAtMSxcclxuICAgICAgICAgICAgbGF5ZXJzOiBbcGFpbnRlckxheWVyLmlkXSxcclxuICAgICAgICAgICAgbmVhckNsaXA6IDAuMSxcclxuICAgICAgICAgICAgZmFyQ2xpcDogcGFpbnRlckNhbWVyYUZhciAqIDIsXHJcbiAgICAgICAgICAgIHJlbmRlclRhcmdldDogdGhpcy5fcGFpbnRlclJlbmRlclRhcmdldCxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fYXBwLnJvb3QuYWRkQ2hpbGQodGhpcy5fcGFpbnRlckNhbWVyYUVudGl0eSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJDYW1lcmFFbnRpdHkuZW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJDYW1lcmFFbnRpdHkuY2FtZXJhIS5mcnVzdHVtQ3VsbGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJDYW1lcmFFbnRpdHkuY2FtZXJhIS5vcnRob0hlaWdodCA9IHBhaW50ZXJDYW1lcmFGYXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdEVudGl0aWVzKCkge1xyXG5cclxuICAgICAgICBjb25zdCBwYWludGVyTGF5ZXIgPSB0aGlzLl9hcHAuc2NlbmUubGF5ZXJzLmdldExheWVyQnlOYW1lKHBhaW50ZXJMYXllck5hbWUpITtcclxuXHJcbiAgICAgICAgcGFpbnRlckxheWVyLnRyYW5zcGFyZW50U29ydE1vZGUgPSBwYy5TT1JUTU9ERV9NQU5VQUw7XHJcblxyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJFbnRpdHkgID0gbmV3IHBjLkVudGl0eSgnVGVycmFpbkJydXNoUGFpbnRlcicpO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJFbnRpdHkuYWRkQ29tcG9uZW50KCdyZW5kZXInLCB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdwbGFuZScsXHJcbiAgICAgICAgICAgIGxheWVyczogW3BhaW50ZXJMYXllci5pZF0sXHJcbiAgICAgICAgICAgIG1hdGVyaWFsOiB0aGlzLl9wYWludGVyTWF0ZXJpYWwsXHJcbiAgICAgICAgICAgIGNhc3RTaGFkb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgY2FzdFNoYWRvd3NMaWdodG1hcDogZmFsc2UsXHJcbiAgICAgICAgICAgIHJlY2VpdmVTaGFkb3dzOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9wYWludGVySW52ZXJ0RW50aXR5ICA9IG5ldyBwYy5FbnRpdHkoJ1RlcnJhaW5CcnVzaFBhaW50ZXJJbnZlcnQnKTtcclxuICAgICAgICB0aGlzLl9wYWludGVySW52ZXJ0RW50aXR5LmFkZENvbXBvbmVudCgncmVuZGVyJywge1xyXG4gICAgICAgICAgICB0eXBlOiAncGxhbmUnLFxyXG4gICAgICAgICAgICBsYXllcnM6IFtwYWludGVyTGF5ZXIuaWRdLFxyXG4gICAgICAgICAgICBtYXRlcmlhbDogdGhpcy5fcGFpbnRlckludmVydE1hdGVyaWFsLFxyXG4gICAgICAgICAgICBjYXN0U2hhZG93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGNhc3RTaGFkb3dzTGlnaHRtYXA6IGZhbHNlLFxyXG4gICAgICAgICAgICByZWNlaXZlU2hhZG93czogZmFsc2UsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJFbnRpdHkucmVuZGVyIS5tZXNoSW5zdGFuY2VzWzBdLmRyYXdPcmRlciA9IDE7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckludmVydEVudGl0eS5yZW5kZXIhLm1lc2hJbnN0YW5jZXNbMF0uZHJhd09yZGVyID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5fYXBwLnJvb3QuYWRkQ2hpbGQodGhpcy5fcGFpbnRlckludmVydEVudGl0eSk7XHJcbiAgICAgICAgdGhpcy5fYXBwLnJvb3QuYWRkQ2hpbGQodGhpcy5fcGFpbnRlckVudGl0eSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJJbnZlcnRFbnRpdHkuc2V0TG9jYWxFdWxlckFuZ2xlcyg5MCwgMCwgMCk7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckVudGl0eS5zZXRMb2NhbEV1bGVyQW5nbGVzKDkwLCAwLCAwKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckludmVydEVudGl0eS5lbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckVudGl0eS5lbmFibGVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdFNoYWRlcnMoKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZlcnRleCA9IHZlcnRleFNoYWRlcjtcclxuICAgICAgICBjb25zdCBmcmFnbWVudCA9IHNldFByZWNpc2lvbih0aGlzLl9hcHAuZ3JhcGhpY3NEZXZpY2UsIGZyYWdtZW50U2hhZGVyKTtcclxuICAgICAgICBjb25zdCBmcmFnbWVudEludmVydCA9IHNldFByZWNpc2lvbih0aGlzLl9hcHAuZ3JhcGhpY3NEZXZpY2UsIGZyYWdtZW50SW52ZXJ0U2hhZGVyKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcGFpbnRlclNoYWRlciA9IHBjLmNyZWF0ZVNoYWRlckZyb21Db2RlKHRoaXMuX2FwcC5ncmFwaGljc0RldmljZSwgdmVydGV4LCBmcmFnbWVudCwgJ1BhaW50ZXJGcmFnbWVudFNoYWRlcicsIHtcclxuICAgICAgICAgICAgYVBvc2l0aW9uOiBwYy5TRU1BTlRJQ19QT1NJVElPTixcclxuICAgICAgICAgICAgYVV2MDogcGMuU0VNQU5USUNfVEVYQ09PUkQwXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJJbnZlcnRTaGFkZXIgPSBwYy5jcmVhdGVTaGFkZXJGcm9tQ29kZSh0aGlzLl9hcHAuZ3JhcGhpY3NEZXZpY2UsIHZlcnRleCwgZnJhZ21lbnRJbnZlcnQsICdQYWludGVySW52ZXJ0RnJhZ21lbnRTaGFkZXInLCB7XHJcbiAgICAgICAgICAgIGFQb3NpdGlvbjogcGMuU0VNQU5USUNfUE9TSVRJT04sXHJcbiAgICAgICAgICAgIGFVdjA6IHBjLlNFTUFOVElDX1RFWENPT1JEMFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXRNYXRlcmlhbHMoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJNYXRlcmlhbCA9IG5ldyBwYy5NYXRlcmlhbCgpO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJNYXRlcmlhbC5uYW1lID0gJ0JydXNoUGFpbnRlck1hdGVyaWFsJztcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgdGhpcy5fcGFpbnRlck1hdGVyaWFsLnNoYWRlciA9IHRoaXMuX3BhaW50ZXJTaGFkZXI7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlck1hdGVyaWFsLmJsZW5kVHlwZSA9IHBjLkJMRU5EX0FERElUSVZFO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJNYXRlcmlhbC51cGRhdGUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckludmVydE1hdGVyaWFsID0gbmV3IHBjLk1hdGVyaWFsKCk7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckludmVydE1hdGVyaWFsLm5hbWUgPSAnQnJ1c2hQYWludGVySW52ZXJ0TWF0ZXJpYWwnO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICB0aGlzLl9wYWludGVySW52ZXJ0TWF0ZXJpYWwuc2hhZGVyID0gdGhpcy5fcGFpbnRlckludmVydFNoYWRlcjtcclxuICAgICAgICB0aGlzLl9wYWludGVySW52ZXJ0TWF0ZXJpYWwuYmxlbmRUeXBlID0gcGMuQkxFTkRfU1VCVFJBQ1RJVkU7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckludmVydE1hdGVyaWFsLnVwZGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3VwZGF0ZVJ1bnRpbWVTZXR0aW5ncyhkdDogbnVtYmVyKSB7XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxPcGFjaXR5ID0gdGhpcy5fYnJ1c2hTZXR0aW5ncy5vcGFjaXR5O1xyXG4gICAgICAgIGNvbnN0IG9wYWNpdHkgPSBvcmlnaW5hbE9wYWNpdHk7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlck1hdGVyaWFsLnNldFBhcmFtZXRlcigndUJydXNoT3BhY2l0eScsIG9wYWNpdHkpO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJJbnZlcnRNYXRlcmlhbC5zZXRQYXJhbWV0ZXIoJ3VCcnVzaE9wYWNpdHknLCBvcGFjaXR5KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF91cGRhdGVQb3NpdGlvbkFuZFNjYWxlKHg6IG51bWJlciwgeTogbnVtYmVyLCBzY2FsZVdpZHRoOiBudW1iZXIsIHNjYWxlSGVpZ2h0OiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgY29uc3QgZmFyICAgID0gdGhpcy5jYW1lcmFGYXIgKiAyO1xyXG4gICAgICAgIGNvbnN0IHJhdGlvbiA9IHRoaXMuYmFja2dyb3VuZC53aWR0aCAvIHRoaXMuYmFja2dyb3VuZC5oZWlnaHQ7XHJcblxyXG4gICAgICAgIHggPSB4ICogZmFyICogcmF0aW9uIC0gdGhpcy5jYW1lcmFGYXIgKiByYXRpb247XHJcbiAgICAgICAgeSA9IHkgKiBmYXIgLSB0aGlzLmNhbWVyYUZhcjtcclxuXHJcbiAgICAgICAgc2NhbGVXaWR0aCAgPSBzY2FsZVdpZHRoICAqIHRoaXMuYmFja2dyb3VuZC53aWR0aCAgLyBmYXIgLyAyLjU7XHJcbiAgICAgICAgc2NhbGVIZWlnaHQgPSBzY2FsZUhlaWdodCAqIHRoaXMuYmFja2dyb3VuZC5oZWlnaHQgLyBmYXIgLyAyLjU7XHJcblxyXG4gICAgICAgIHRoaXMuX3NldFNjYWxlKHNjYWxlV2lkdGgsIHNjYWxlSGVpZ2h0KTtcclxuICAgICAgICB0aGlzLl9zZXRQb3NpdGlvbih4LCB5KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhcnRQYWludChkdDogbnVtYmVyLCB4OiBudW1iZXIsIHk6IG51bWJlciwgc2NhbGVXaWR0aDogbnVtYmVyLCBzY2FsZUhlaWdodDogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIHRoaXMuX3VwZGF0ZVJ1bnRpbWVTZXR0aW5ncyhkdCk7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlUG9zaXRpb25BbmRTY2FsZSh4LCB5LCBzY2FsZVdpZHRoLCBzY2FsZUhlaWdodCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3BhaW50aW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9wYWludGVySW52ZXJ0RW50aXR5LmVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJFbnRpdHkuZW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckNhbWVyYUVudGl0eS5lbmFibGVkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RvcFBhaW50KCkge1xyXG4gICAgICAgIHRoaXMuX3BhaW50aW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckludmVydEVudGl0eS5lbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckVudGl0eS5lbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckNhbWVyYUVudGl0eS5lbmFibGVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfc2V0U2NhbGUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl9wYWludGVyRW50aXR5LnNldExvY2FsU2NhbGUoeCwgMSwgeSk7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckludmVydEVudGl0eS5zZXRMb2NhbFNjYWxlKHgsIDEsIHkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3NldFBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckVudGl0eS5zZXRMb2NhbFBvc2l0aW9uKHgsIHksIDApO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJJbnZlcnRFbnRpdHkuc2V0TG9jYWxQb3NpdGlvbih4LCB5LCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlU2V0dGluZ3MoYnJ1c2hTZXR0aW5nczogSUJydXNoU2V0dGluZ3MsIGFjdGl2ZUxheWVyOiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgdGhpcy5fcGFpbnRlck1hc2suZmlsbCgwKTtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUxheWVyID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9wYWludGVyTWFza1thY3RpdmVMYXllciAtIDFdID0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGJydXNoVGV4dHVyZSA9IGJydXNoU2V0dGluZ3MudGV4dHVyZXNbYnJ1c2hTZXR0aW5ncy5hY3RpdmVdLnJlc291cmNlIGFzIHBjeC5UZXh0dXJlO1xyXG5cclxuICAgICAgICB0aGlzLl9wYWludGVyTWF0ZXJpYWwuc2V0UGFyYW1ldGVyKCd1QnJ1c2hNYXNrJywgdGhpcy5fcGFpbnRlck1hc2spO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJNYXRlcmlhbC5zZXRQYXJhbWV0ZXIoJ3VIZWlnaHRNYXAnLCBicnVzaFRleHR1cmUpO1xyXG5cclxuICAgICAgICB0aGlzLl9wYWludGVySW52ZXJ0TWF0ZXJpYWwuc2V0UGFyYW1ldGVyKCd1QnJ1c2hNYXNrJywgdGhpcy5fcGFpbnRlck1hc2spO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJJbnZlcnRNYXRlcmlhbC5zZXRQYXJhbWV0ZXIoJ3VIZWlnaHRNYXAnLCBicnVzaFRleHR1cmUpO1xyXG5cclxuICAgICAgICB0aGlzLl9icnVzaFNldHRpbmdzID0gYnJ1c2hTZXR0aW5ncztcclxuICAgIH1cclxufSIsImV4cG9ydCBmdW5jdGlvbiBpc051bWVyaWModmFsdWU6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIC9eLT9cXGQrJC8udGVzdCh2YWx1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXBUaXRsZUVudW08VCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+Pihzb21lRW51bTogVCkge1xyXG5cclxuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xyXG5cclxuICAgIGZvciAobGV0IHZhbHVlIGluIHNvbWVFbnVtKSB7XHJcblxyXG4gICAgICAgIGlmICghc29tZUVudW0uaGFzT3duUHJvcGVydHkodmFsdWUpIHx8XHJcbiAgICAgICAgICAgIGlzTnVtZXJpYyh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBlbnVtRW50cnk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XHJcbiAgICAgICAgZW51bUVudHJ5W3ZhbHVlXSA9IHNvbWVFbnVtW3ZhbHVlXTtcclxuICAgICAgICByZXN1bHQucHVzaChlbnVtRW50cnkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWFwRW51bTxUIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4+KHNvbWVFbnVtOiBUKSB7XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gW107XHJcblxyXG4gICAgZm9yIChsZXQgdmFsdWUgaW4gc29tZUVudW0pIHtcclxuXHJcbiAgICAgICAgaWYgKCFzb21lRW51bS5oYXNPd25Qcm9wZXJ0eSh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBlbnVtRW50cnk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XHJcbiAgICAgICAgZW51bUVudHJ5W3ZhbHVlXSA9IHNvbWVFbnVtW3ZhbHVlXTtcclxuICAgICAgICByZXN1bHQucHVzaChlbnVtRW50cnkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59IiwiaW1wb3J0IHsgbWFwRW51bSB9IGZyb20gXCIuLi9TaGFyZWQvRW51bUNvbnZlcnRlci5tanNcIlxyXG5cclxuZXhwb3J0IGNvbnN0IHRlcnJhaW5TaXplRW51bURlZmF1bHQgPSA1MTM7XHJcbmV4cG9ydCBjb25zdCB0ZXJyYWluU2l6ZUVudW0gPSBtYXBFbnVtKHtcclxuICAgICcxMjgnOiAgIDEyOSxcclxuICAgICcyNTYnOiAgIDI1NyxcclxuICAgICc1MTInOiAgIDUxMyxcclxuICAgICcxMDI0JzogIDEwMjUsXHJcbiAgICAnMjA0OCc6ICAyMDQ5LFxyXG4gICAgJzQwOTYnOiAgNDA5NyxcclxuICAgICc4MTkyJzogIDgxOTMsXHJcbiAgICAnMTYzODQnOiAxNjM4NSxcclxuICAgICczMjc2OCc6IDMyNzY5LFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCB0ZXJyYWluUGF0Y2hTaXplRW51bURlZmF1bHQgPSAzMztcclxuZXhwb3J0IGNvbnN0IHRlcnJhaW5QYXRjaFNpemVFbnVtID0gbWFwRW51bSh7XHJcbiAgICAnMTYnOiAgICAxNyxcclxuICAgICczMic6ICAgIDMzLFxyXG4gICAgJzY0JzogICAgNjUsXHJcbiAgICAnMTI4JzogICAxMjksXHJcbiAgICAnMjU2JzogICAyNTcsXHJcbiAgICAnNTEyJzogICA1MTMsXHJcbiAgICAnMTAyNCc6ICAxMDI1LFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCB0ZXJyYWluSGVpZ2h0c0NvbXByZXNzQWxnb3JpdG1EZWZhdWx0ID0gJ25vbmUnO1xyXG5leHBvcnQgY29uc3QgdGVycmFpbkhlaWdodHNDb21wcmVzc0FsZ29yaXRtID0gbWFwRW51bSh7XHJcbiAgICAnTm9uZSc6ICdub25lJyxcclxuICAgICdYMic6ICd4MicsXHJcbiAgICAnWDQnOiAneDQnXHJcbn0pOyIsImltcG9ydCB0eXBlIHsgaW50IH0gZnJvbSBcIi4uL1NoYXJlZC9UeXBlcy5tanNcIjtcblxuY29uc3QgdG1wVHJpVmVjQSA9IG5ldyBwYy5WZWMzKCk7XG5jb25zdCB0bXBUcmlWZWNCID0gbmV3IHBjLlZlYzMoKTtcblxuZXhwb3J0IGNsYXNzIFRyaWFuZ2xlIGV4dGVuZHMgcGMuVHJpIHtcblxuICAgIGluZGV4MDogaW50O1xuICAgIGluZGV4MTogaW50O1xuICAgIGluZGV4MjogaW50O1xuXG4gICAgZ2V0Tm9ybWFsKHJzaDogcGN4LlZlYzMpIHtcbiAgICAgICAgdG1wVHJpVmVjQS5zdWIyKHRoaXMudjEsIHRoaXMudjApO1xuICAgICAgICB0bXBUcmlWZWNCLnN1YjIodGhpcy52MiwgdGhpcy52MCk7XG4gICAgICAgIHJzaC5jcm9zcyh0bXBUcmlWZWNBLCB0bXBUcmlWZWNCKS5ub3JtYWxpemUoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRyaWFuZ2xlOyIsImltcG9ydCB7IGZsb2F0LCBpbnQsIElWZWN0b3IzLCBSZWZPYmplY3QgfSBmcm9tIFwiLi4vU2hhcmVkL1R5cGVzLm1qc1wiO1xyXG5pbXBvcnQgeyBJUmVhZG9ubHlBYnNQYXRjaGVkSGVpZ2h0TWFwIH0gZnJvbSBcIi4vQWJzUGF0Y2hlZEhlaWdodE1hcC5tanNcIjtcclxuaW1wb3J0IHsgSVpvbmUgfSBmcm9tIFwiLi9JWm9uZS5tanNcIjtcclxuaW1wb3J0IFRlcnJhaW5SYXljYXN0UmVzdWx0IGZyb20gXCIuL1RlcnJhaW5SYXljYXN0UmVzdWx0Lm1qc1wiO1xyXG5pbXBvcnQgVHJpYW5nbGUgZnJvbSBcIi4vVHJpYW5nbGUubWpzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElDb29yZFhaIHtcclxuICAgIHg6IGludCxcclxuICAgIHo6IGludCxcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJR3JpZFJheWNhc3RTdGF0ZSB7XHJcbiAgICB4OiBpbnQsXHJcbiAgICB6OiBpbnQsXHJcbiAgICBwYXJhbTogaW50LFxyXG4gICAgcHJldlg6IGludCxcclxuICAgIHByZXZaOiBpbnQsXHJcbiAgICBwcmV2UGFyYW06IGludCxcclxuICAgIG1heERpc3RhbmNlRmxhdDogZmxvYXQsXHJcbn1cclxuXHJcbmNvbnN0IGluZmluaXRlICAgICAgICA9IDk5OTk5OTk7XHJcbmNvbnN0IG1vZGVsVHJhbnNmb3JtICA9IG5ldyBwYy5NYXQ0KCk7XHJcbmNvbnN0IHRtcFJheSAgICAgICAgICA9IG5ldyBwYy5SYXkoKTtcclxuY29uc3QgdG1wUmF5Y2FzdFZlYyAgID0gbmV3IHBjLlZlYzMoKTtcclxuY29uc3QgdG1wUG9zMSAgICAgICAgID0gbmV3IHBjLlZlYzMoKTtcclxuY29uc3QgdG1wUG9zMiAgICAgICAgID0gbmV3IHBjLlZlYzMoKTtcclxuY29uc3QgdG1wUG9zMyAgICAgICAgID0gbmV3IHBjLlZlYzMoKTtcclxuXHJcbmNvbnN0IHRyaWFuZ2xlICAgICAgID0gbmV3IFRyaWFuZ2xlKCk7XHJcbmNvbnN0IGRlYnVnVG1wVmVjICAgID0gbmV3IHBjLlZlYzMoKTtcclxuY29uc3QgZGVidWdUcmFuc2Zvcm0gPSBuZXcgcGMuTWF0NCgpO1xyXG5jb25zdCBkZWJ1Z1Bvc2l0aW9ucyA9IG5ldyBBcnJheSgxNik7XHJcblxyXG5sZXQgZGVidWdUcmFuc2Zvcm1Jc0lkZW50aXR5ID0gdHJ1ZTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUFBQkIgZXh0ZW5kcyBJWm9uZSB7XHJcbiAgICBtaW5ZOiBmbG9hdCxcclxuICAgIG1heFk6IGZsb2F0LFxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWJ1Z0RyYXdUcmlhbmdsZUxpbmVzKHRyaTogcGN4LlRyaSwgY29sb3IgPSBwYy5Db2xvci5ZRUxMT1cpIHtcclxuICAgIC8qXHJcbiAgICBbXHJcbiAgICAgICAgdHJpLnYwLngsIHRyaS52MC55LCB0cmkudjAueiwgdHJpLnYxLngsIHRyaS52MS55LCB0cmkudjEueixcclxuICAgICAgICB0cmkudjEueCwgdHJpLnYxLnksIHRyaS52MS56LCB0cmkudjIueCwgdHJpLnYyLnksIHRyaS52Mi56LFxyXG4gICAgICAgIHRyaS52Mi54LCB0cmkudjIueSwgdHJpLnYyLnosIHRyaS52MC54LCB0cmkudjAueSwgdHJpLnYwLnosXHJcbiAgICBdLCBjb2xvciwgZmFsc2UpO1xyXG4gICAgXVxyXG4gICAgKi9cclxuICAgIGRlYnVnVHJhbnNmb3JtLnRyYW5zZm9ybVBvaW50KHRyaS52MCwgZGVidWdUbXBWZWMpO1xyXG4gICAgZGVidWdQb3NpdGlvbnNbMF0gPSBkZWJ1Z1Bvc2l0aW9uc1sxNV0gPSBkZWJ1Z1RtcFZlYy54O1xyXG4gICAgZGVidWdQb3NpdGlvbnNbMV0gPSBkZWJ1Z1Bvc2l0aW9uc1sxNl0gPSBkZWJ1Z1RtcFZlYy55O1xyXG4gICAgZGVidWdQb3NpdGlvbnNbMl0gPSBkZWJ1Z1Bvc2l0aW9uc1sxN10gPSBkZWJ1Z1RtcFZlYy56O1xyXG4gICAgZGVidWdUcmFuc2Zvcm0udHJhbnNmb3JtUG9pbnQodHJpLnYxLCBkZWJ1Z1RtcFZlYyk7XHJcbiAgICBkZWJ1Z1Bvc2l0aW9uc1szXSA9IGRlYnVnUG9zaXRpb25zWzZdID0gZGVidWdUbXBWZWMueDtcclxuICAgIGRlYnVnUG9zaXRpb25zWzRdID0gZGVidWdQb3NpdGlvbnNbN10gPSBkZWJ1Z1RtcFZlYy55O1xyXG4gICAgZGVidWdQb3NpdGlvbnNbNV0gPSBkZWJ1Z1Bvc2l0aW9uc1s4XSA9IGRlYnVnVG1wVmVjLno7XHJcbiAgICBkZWJ1Z1RyYW5zZm9ybS50cmFuc2Zvcm1Qb2ludCh0cmkudjIsIGRlYnVnVG1wVmVjKTtcclxuICAgIGRlYnVnUG9zaXRpb25zWzldICA9IGRlYnVnUG9zaXRpb25zWzEyXSA9IGRlYnVnVG1wVmVjLng7XHJcbiAgICBkZWJ1Z1Bvc2l0aW9uc1sxMF0gPSBkZWJ1Z1Bvc2l0aW9uc1sxM10gPSBkZWJ1Z1RtcFZlYy55O1xyXG4gICAgZGVidWdQb3NpdGlvbnNbMTFdID0gZGVidWdQb3NpdGlvbnNbMTRdID0gZGVidWdUbXBWZWMuejtcclxuICAgIHBjLmFwcD8uZHJhd0xpbmVBcnJheXMoZGVidWdQb3NpdGlvbnMsIGNvbG9yLCBmYWxzZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnNlY3RzUmF5Qm94KGFhYmI6IElBQUJCLCByYXk6IHBjeC5SYXkpIHtcclxuXHJcbiAgICBjb25zdCByYXlPcmlnaW4gICAgPSByYXkub3JpZ2luO1xyXG4gICAgY29uc3QgcmF5RGlyZWN0aW9uID0gcmF5LmRpcmVjdGlvbjtcclxuXHJcbiAgICBjb25zdCBtaW5YID0gYWFiYi5taW5YO1xyXG4gICAgY29uc3QgbWF4WCA9IGFhYmIubWF4WDtcclxuICAgIGNvbnN0IG1pblkgPSBhYWJiLm1pblk7XHJcbiAgICBjb25zdCBtYXhZID0gYWFiYi5tYXhZO1xyXG4gICAgY29uc3QgbWluWiA9IGFhYmIubWluWjtcclxuICAgIGNvbnN0IG1heFogPSBhYWJiLm1heFo7XHJcblxyXG4gICAgbGV0IHRtaW4gPSAobWluWCAtIHJheU9yaWdpbi54KSAvIHJheURpcmVjdGlvbi54O1xyXG4gICAgbGV0IHRtYXggPSAobWF4WCAtIHJheU9yaWdpbi54KSAvIHJheURpcmVjdGlvbi54O1xyXG5cclxuICAgIGlmICh0bWluID4gdG1heCkge1xyXG4gICAgICAgIGxldCB0ZW1wID0gdG1pbjtcclxuICAgICAgICB0bWluID0gdG1heDtcclxuICAgICAgICB0bWF4ID0gdGVtcDtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgdHltaW4gPSAobWluWSAtIHJheU9yaWdpbi55KSAvIHJheURpcmVjdGlvbi55O1xyXG4gICAgbGV0IHR5bWF4ID0gKG1heFkgLSByYXlPcmlnaW4ueSkgLyByYXlEaXJlY3Rpb24ueTtcclxuXHJcbiAgICBpZiAodHltaW4gPiB0eW1heCkge1xyXG4gICAgICAgIGxldCB0ZW1wID0gdHltaW47XHJcbiAgICAgICAgdHltaW4gPSB0eW1heDtcclxuICAgICAgICB0eW1heCA9IHRlbXA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCh0bWluID4gdHltYXgpIHx8ICh0eW1pbiA+IHRtYXgpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eW1pbiA+IHRtaW4pIHtcclxuICAgICAgICB0bWluID0gdHltaW47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5bWF4IDwgdG1heCkge1xyXG4gICAgICAgIHRtYXggPSB0eW1heDtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgdHptaW4gPSAobWluWiAtIHJheU9yaWdpbi56KSAvIHJheURpcmVjdGlvbi56O1xyXG4gICAgbGV0IHR6bWF4ID0gKG1heFogLSByYXlPcmlnaW4ueikgLyByYXlEaXJlY3Rpb24uejtcclxuXHJcbiAgICBpZiAodHptaW4gPiB0em1heCkge1xyXG4gICAgICAgIGxldCB0ZW1wID0gdHptaW47XHJcbiAgICAgICAgdHptaW4gPSB0em1heDtcclxuICAgICAgICB0em1heCA9IHRlbXA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCh0bWluID4gdHptYXgpIHx8ICh0em1pbiA+IHRtYXgpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIZWlnaHRmaWVsZFNoYXBlIHtcclxuXHJcbiAgICBwcml2YXRlIF9oZWlnaHRNYXA6IElSZWFkb25seUFic1BhdGNoZWRIZWlnaHRNYXA7XHJcbiAgICBwcml2YXRlIF9iZWdpblBvczogcGN4LlZlYzM7XHJcbiAgICBwcml2YXRlIF9lbmRQb3M6IHBjeC5WZWMzO1xyXG4gICAgcHJpdmF0ZSBfYm91bmRpbmdCb3g6IElBQUJCO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGhlaWdodE1hcDogSVJlYWRvbmx5QWJzUGF0Y2hlZEhlaWdodE1hcCkge1xyXG4gICAgICAgIHRoaXMuX2hlaWdodE1hcCA9IGhlaWdodE1hcDtcclxuICAgICAgICB0aGlzLl9iZWdpblBvcyA9IG5ldyBwYy5WZWMzKCk7XHJcbiAgICAgICAgdGhpcy5fZW5kUG9zID0gbmV3IHBjLlZlYzMoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUJvdW5kaW5nQm94KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZUJvdW5kaW5nQm94KCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IGhhbGZXaWR0aCA9IHRoaXMuX2hlaWdodE1hcC53aWR0aCAvIDI7XHJcbiAgICAgICAgY29uc3QgaGFsZkRlcHRoID0gdGhpcy5faGVpZ2h0TWFwLmRlcHRoIC8gMjtcclxuXHJcbiAgICAgICAgdGhpcy5fYm91bmRpbmdCb3ggPSB7XHJcbiAgICAgICAgICAgIG1pblg6IC1oYWxmV2lkdGgsXHJcbiAgICAgICAgICAgIG1pblk6IHRoaXMuX2hlaWdodE1hcC5taW5IZWlnaHQsXHJcbiAgICAgICAgICAgIG1pblo6IC1oYWxmRGVwdGgsXHJcbiAgICAgICAgICAgIG1heFg6IGhhbGZXaWR0aCxcclxuICAgICAgICAgICAgbWF4WTogdGhpcy5faGVpZ2h0TWFwLm1heEhlaWdodCxcclxuICAgICAgICAgICAgbWF4WjogaGFsZkRlcHRoLFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgX3RyaWFuZ2xlSW50ZXJzZWN0c1JheSh0cmk6IFRyaWFuZ2xlLCByYXk6IHBjeC5SYXksIGJlc3RSZXN1bHQ6IFRlcnJhaW5SYXljYXN0UmVzdWx0KTogYm9vbGVhbiB7XHJcblxyXG4gICAgICAgIGlmICh0cmkuaW50ZXJzZWN0c1JheShyYXksIHRtcFJheWNhc3RWZWMpKSB7XHJcbiAgICBcclxuICAgICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSB0bXBSYXljYXN0VmVjLmRpc3RhbmNlKHJheS5vcmlnaW4pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGJlc3RSZXN1bHQuZGlzdGFuY2UgPiBkaXN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgYmVzdFJlc3VsdC5kaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgICB0cmkuZ2V0Tm9ybWFsKGJlc3RSZXN1bHQubG9jYWxOb3JtYWwpO1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgICBiZXN0UmVzdWx0Lm5vcm1hbC5jb3B5KGJlc3RSZXN1bHQubG9jYWxOb3JtYWwpO1xyXG4gICAgICAgICAgICAgICAgYmVzdFJlc3VsdC5sb2NhbFBvaW50LmNvcHkodG1wUmF5Y2FzdFZlYyk7XHJcbiAgICAgICAgICAgICAgICBiZXN0UmVzdWx0LnBvaW50LmNvcHkodG1wUmF5Y2FzdFZlYyk7XHJcbiAgICBcclxuICAgICAgICAgICAgICAgIGRlYnVnRHJhd1RyaWFuZ2xlTGluZXModHJpLCBwYy5Db2xvci5SRUQpO1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgICBjb25zdCBkaXN0YW5jZVAwID0gYmVzdFJlc3VsdC5wb2ludC5kaXN0YW5jZSh0cmkudjApO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzdGFuY2VQMSA9IGJlc3RSZXN1bHQucG9pbnQuZGlzdGFuY2UodHJpLnYxKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RhbmNlUDIgPSBiZXN0UmVzdWx0LnBvaW50LmRpc3RhbmNlKHRyaS52Mik7XHJcbiAgICBcclxuICAgICAgICAgICAgICAgIGlmIChkaXN0YW5jZVAwID4gZGlzdGFuY2VQMSkge1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlUDEgPiBkaXN0YW5jZVAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3RSZXN1bHQudmVydGV4SW5kZXggPSB0cmkuaW5kZXgyO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmVzdFJlc3VsdC52ZXJ0ZXhJbmRleCA9IHRyaS5pbmRleDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlUDAgPiBkaXN0YW5jZVAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3RSZXN1bHQudmVydGV4SW5kZXggPSB0cmkuaW5kZXgyO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmVzdFJlc3VsdC52ZXJ0ZXhJbmRleCA9IHRyaS5pbmRleDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIC8vZGVidWdEcmF3VHJpYW5nbGVMaW5lcyh0cmkpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgX2Fzc2lnblBvc2l0aW9uKGluZGV4OiBpbnQsIGJ1ZjogUmVmT2JqZWN0PElWZWN0b3IzPikge1xyXG5cclxuICAgICAgICBjb25zdCB4ID0gaW5kZXggJSB0aGlzLl9oZWlnaHRNYXAud2lkdGggfCAwO1xyXG4gICAgICAgIGNvbnN0IHogPSBpbmRleCAvIHRoaXMuX2hlaWdodE1hcC53aWR0aCB8IDA7XHJcblxyXG4gICAgICAgIGJ1Zi54ID0gKC10aGlzLl9oZWlnaHRNYXAud2lkdGggLyAyKSArIHg7XHJcbiAgICAgICAgYnVmLnkgPSB0aGlzLl9oZWlnaHRNYXAuZ2V0KHgsIHopO1xyXG4gICAgICAgIGJ1Zi56ID0gKC10aGlzLl9oZWlnaHRNYXAuZGVwdGggLyAyKSArIHo7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIF9xdWFkQWN0aW9uKHJzOiBJR3JpZFJheWNhc3RTdGF0ZSwgcmF5OiBwY3guUmF5LCByZXN1bHQ6IFRlcnJhaW5SYXljYXN0UmVzdWx0KTogYm9vbGVhbiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHggPSBycy5wcmV2WDtcclxuICAgICAgICBjb25zdCB6ID0gcnMucHJldlo7XHJcblxyXG4gICAgICAgIGlmICh4IDwgMCB8fCB6IDwgMCB8fCB4ID49IHRoaXMuX2hlaWdodE1hcC53aWR0aCAtIDEgfHwgeiA+PSB0aGlzLl9oZWlnaHRNYXAuZGVwdGggLSAxKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcbiAgICAgICAgY29uc3QgeEZhbjIgPSB4ICUgMiA9PT0gMDtcclxuICAgICAgICBjb25zdCB6RmFuMiA9IHogJSAyID09PSAwO1xyXG5cclxuICAgICAgICBsZXQgaW5kZXgwLCBpbmRleDEsIGluZGV4MjtcclxuXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoeEZhbjIgIT09IHpGYW4yKSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleDAgPSAoeiArIDApICogdGhpcy5faGVpZ2h0TWFwLndpZHRoICsgKHggKyAwKTtcclxuICAgICAgICAgICAgICAgIGluZGV4MSA9ICh6ICsgMSkgKiB0aGlzLl9oZWlnaHRNYXAud2lkdGggKyAoeCArIDApO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgyID0gKHogKyAwKSAqIHRoaXMuX2hlaWdodE1hcC53aWR0aCArICh4ICsgMSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleDAgPSAoeiArIDApICogdGhpcy5faGVpZ2h0TWFwLndpZHRoICsgKHggKyAwKTtcclxuICAgICAgICAgICAgICAgIGluZGV4MSA9ICh6ICsgMSkgKiB0aGlzLl9oZWlnaHRNYXAud2lkdGggKyAoeCArIDEpO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgyID0gKHogKyAwKSAqIHRoaXMuX2hlaWdodE1hcC53aWR0aCArICh4ICsgMSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2Fzc2lnblBvc2l0aW9uKGluZGV4MCwgdG1wUG9zMSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2Fzc2lnblBvc2l0aW9uKGluZGV4MSwgdG1wUG9zMik7XHJcbiAgICAgICAgICAgIHRoaXMuX2Fzc2lnblBvc2l0aW9uKGluZGV4MiwgdG1wUG9zMyk7XHJcblxyXG4gICAgICAgICAgICB0cmlhbmdsZS5pbmRleDAgPSBpbmRleDA7XHJcbiAgICAgICAgICAgIHRyaWFuZ2xlLmluZGV4MSA9IGluZGV4MTtcclxuICAgICAgICAgICAgdHJpYW5nbGUuaW5kZXgyID0gaW5kZXgyO1xyXG5cclxuICAgICAgICAgICAgdHJpYW5nbGUuc2V0KHRtcFBvczEsIHRtcFBvczIsIHRtcFBvczMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX3RyaWFuZ2xlSW50ZXJzZWN0c1JheSh0cmlhbmdsZSwgcmF5LCByZXN1bHQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoeEZhbjIgIT09IHpGYW4yKSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleDAgPSAoeiArIDApICogdGhpcy5faGVpZ2h0TWFwLndpZHRoICsgKHggKyAxKTtcclxuICAgICAgICAgICAgICAgIGluZGV4MSA9ICh6ICsgMSkgKiB0aGlzLl9oZWlnaHRNYXAud2lkdGggKyAoeCArIDApO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgyID0gKHogKyAxKSAqIHRoaXMuX2hlaWdodE1hcC53aWR0aCArICh4ICsgMSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleDAgPSAoeiArIDApICogdGhpcy5faGVpZ2h0TWFwLndpZHRoICsgKHggKyAwKTtcclxuICAgICAgICAgICAgICAgIGluZGV4MSA9ICh6ICsgMSkgKiB0aGlzLl9oZWlnaHRNYXAud2lkdGggKyAoeCArIDApO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgyID0gKHogKyAxKSAqIHRoaXMuX2hlaWdodE1hcC53aWR0aCArICh4ICsgMSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2Fzc2lnblBvc2l0aW9uKGluZGV4MCwgdG1wUG9zMSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2Fzc2lnblBvc2l0aW9uKGluZGV4MSwgdG1wUG9zMik7XHJcbiAgICAgICAgICAgIHRoaXMuX2Fzc2lnblBvc2l0aW9uKGluZGV4MiwgdG1wUG9zMyk7XHJcblxyXG4gICAgICAgICAgICB0cmlhbmdsZS5pbmRleDAgPSBpbmRleDA7XHJcbiAgICAgICAgICAgIHRyaWFuZ2xlLmluZGV4MSA9IGluZGV4MTtcclxuICAgICAgICAgICAgdHJpYW5nbGUuaW5kZXgyID0gaW5kZXgyO1xyXG5cclxuICAgICAgICAgICAgdHJpYW5nbGUuc2V0KHRtcFBvczEsIHRtcFBvczIsIHRtcFBvczMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX3RyaWFuZ2xlSW50ZXJzZWN0c1JheSh0cmlhbmdsZSwgcmF5LCByZXN1bHQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2ludGVyc2VjdHNSYXkobG9jYWxSYXk6IHBjeC5SYXksIHJlc3VsdDogVGVycmFpblJheWNhc3RSZXN1bHQgPSBuZXcgVGVycmFpblJheWNhc3RSZXN1bHQoKSk6IGJvb2xlYW4ge1xyXG5cclxuICAgICAgICBpZiAoIWludGVyc2VjdHNSYXlCb3godGhpcy5fYm91bmRpbmdCb3gsIGxvY2FsUmF5KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9iZWdpblBvcy5jb3B5KGxvY2FsUmF5Lm9yaWdpbik7XHJcbiAgICAgICAgdGhpcy5fYmVnaW5Qb3MueCArPSB0aGlzLl9ib3VuZGluZ0JveC5tYXhYO1xyXG4gICAgICAgIHRoaXMuX2JlZ2luUG9zLnogKz0gdGhpcy5fYm91bmRpbmdCb3gubWF4WjtcclxuXHJcbiAgICAgICAgdGhpcy5fZW5kUG9zLmNvcHkobG9jYWxSYXkuZGlyZWN0aW9uKS5hZGQodGhpcy5fYmVnaW5Qb3MpO1xyXG5cclxuICAgICAgICBsZXQgcmF5RGlyZWN0aW9uRmxhdFggPSB0aGlzLl9lbmRQb3MueCAtIHRoaXMuX2JlZ2luUG9zLng7XHJcbiAgICAgICAgbGV0IHJheURpcmVjdGlvbkZsYXRaID0gdGhpcy5fZW5kUG9zLnogLSB0aGlzLl9iZWdpblBvcy56O1xyXG5cclxuICAgICAgICBjb25zdCBtYXhEaXN0YW5jZUZsYXQgPSBNYXRoLnNxcnQocmF5RGlyZWN0aW9uRmxhdFggKiogMiArIHJheURpcmVjdGlvbkZsYXRaICoqIDIpO1xyXG5cclxuICAgICAgICBpZiAobWF4RGlzdGFuY2VGbGF0IDwgMC4wMDAxKSB7XHJcbiAgICAgICAgICAgIC8vIENvbnNpZGVyIHRoZSByYXkgdmVydGljYWxcclxuICAgICAgICAgICAgcmF5RGlyZWN0aW9uRmxhdFggPSAwO1xyXG4gICAgICAgICAgICByYXlEaXJlY3Rpb25GbGF0WiA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByYXlEaXJlY3Rpb25GbGF0WCAvPSBtYXhEaXN0YW5jZUZsYXQ7XHJcbiAgICAgICAgICAgIHJheURpcmVjdGlvbkZsYXRaIC89IG1heERpc3RhbmNlRmxhdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHhpU3RlcCA9IHJheURpcmVjdGlvbkZsYXRYID4gMCA/IDEgOiByYXlEaXJlY3Rpb25GbGF0WCA8IDAgPyAtMSA6IDA7XHJcbiAgICAgICAgY29uc3QgemlTdGVwID0gcmF5RGlyZWN0aW9uRmxhdFogPiAwID8gMSA6IHJheURpcmVjdGlvbkZsYXRaIDwgMCA/IC0xIDogMDtcclxuXHJcbiAgICAgICAgY29uc3QgcGFyYW1EZWx0YVggPSB4aVN0ZXAgIT09IDAgPyAxIC8gTWF0aC5hYnMocmF5RGlyZWN0aW9uRmxhdFgpIDogaW5maW5pdGU7XHJcbiAgICAgICAgY29uc3QgcGFyYW1EZWx0YVogPSB6aVN0ZXAgIT09IDAgPyAxIC8gTWF0aC5hYnMocmF5RGlyZWN0aW9uRmxhdFopIDogaW5maW5pdGU7XHJcblxyXG4gICAgICAgIGxldCBwYXJhbUNyb3NzWDtcclxuICAgICAgICBsZXQgcGFyYW1Dcm9zc1o7XHJcblxyXG4gICAgICAgIGlmICh4aVN0ZXAgIT09IDApIHtcclxuICAgICAgICAgICAgcGFyYW1Dcm9zc1ggPSB4aVN0ZXAgPT09IDFcclxuICAgICAgICAgICAgICAgID8gKE1hdGguY2VpbCh0aGlzLl9iZWdpblBvcy54KSAtIHRoaXMuX2JlZ2luUG9zLngpICogcGFyYW1EZWx0YVhcclxuICAgICAgICAgICAgICAgIDogKHRoaXMuX2JlZ2luUG9zLnggLSBNYXRoLmZsb29yKHRoaXMuX2JlZ2luUG9zLngpKSAqIHBhcmFtRGVsdGFYO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcGFyYW1Dcm9zc1ggPSBpbmZpbml0ZTsgIC8vIFdpbGwgbmV2ZXIgY3Jvc3Mgb24gWFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHppU3RlcCAhPT0gMCkge1xyXG4gICAgICAgICAgICBwYXJhbUNyb3NzWiA9IHppU3RlcCA9PT0gMVxyXG4gICAgICAgICAgICAgICAgPyAoTWF0aC5jZWlsKHRoaXMuX2JlZ2luUG9zLnopIC0gdGhpcy5fYmVnaW5Qb3MueikgKiBwYXJhbURlbHRhWlxyXG4gICAgICAgICAgICAgICAgOiAodGhpcy5fYmVnaW5Qb3MueiAtIE1hdGguZmxvb3IodGhpcy5fYmVnaW5Qb3MueikpICogcGFyYW1EZWx0YVo7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBwYXJhbUNyb3NzWiA9IGluZmluaXRlOyAgLy8gV2lsbCBuZXZlciBjcm9zcyBvbiBaXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByczogSUdyaWRSYXljYXN0U3RhdGUgPSB7XHJcbiAgICAgICAgICAgIHg6IHRoaXMuX2JlZ2luUG9zLnggfCAwLFxyXG4gICAgICAgICAgICB6OiB0aGlzLl9iZWdpblBvcy56IHwgMCxcclxuICAgICAgICAgICAgcGFyYW06IDAsXHJcbiAgICAgICAgICAgIHByZXZYOiAwLFxyXG4gICAgICAgICAgICBwcmV2WjogMCxcclxuICAgICAgICAgICAgcHJldlBhcmFtOiAwLFxyXG4gICAgICAgICAgICBtYXhEaXN0YW5jZUZsYXQ6IG1heERpc3RhbmNlRmxhdCxcclxuICAgICAgICB9O1xyXG5cclxuXHQgICAgLy8gV29ya2Fyb3VuZCBjYXNlcyB3aGVyZSB0aGUgcmF5IHN0YXJ0cyBhdCBhbiBpbnRlZ2VyIHBvc2l0aW9uXHJcblx0ICAgIGlmIChwYXJhbUNyb3NzWCA9PT0gMC4wKSB7XHJcbiAgICAgICAgICAgIHBhcmFtQ3Jvc3NYICs9IHBhcmFtRGVsdGFYO1xyXG4gICAgICAgICAgICAvLyBJZiBnb2luZyBiYWNrd2FyZHMsIHdlIHNob3VsZCBpZ25vcmUgdGhlIHBvc2l0aW9uIHdlIHdvdWxkIGdldCBieSB0aGUgYWJvdmUgZmxvb3JpbmcsXHJcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgdGhlIHJheSBpcyBub3QgaGVhZGluZyBpbiB0aGF0IGRpcmVjdGlvblxyXG4gICAgICAgICAgICBpZiAoeGlTdGVwID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgcnMueCAtPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGFyYW1Dcm9zc1ogPT09IDAuMCkge1xyXG4gICAgICAgICAgICBwYXJhbUNyb3NzWiArPSBwYXJhbURlbHRhWjtcclxuICAgICAgICAgICAgaWYgKHppU3RlcCA9PT0gLTEpXHJcbiAgICAgICAgICAgICAgICBycy56IC09IDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgaGFzSGl0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHdoaWxlICghaGFzSGl0KSB7XHJcblxyXG4gICAgICAgICAgICBycy5wcmV2WCA9IHJzLng7XHJcbiAgICAgICAgICAgIHJzLnByZXZaID0gcnMuejtcclxuICAgICAgICAgICAgcnMucHJldlBhcmFtID0gcnMucGFyYW07XHJcbiAgICBcclxuICAgICAgICAgICAgaWYgKHBhcmFtQ3Jvc3NYIDwgcGFyYW1Dcm9zc1opIHtcclxuICAgICAgICAgICAgICAgIC8vIFggbGFuZVxyXG4gICAgICAgICAgICAgICAgcnMueCArPSB4aVN0ZXA7XHJcbiAgICAgICAgICAgICAgICAvLyBBc3NpZ24gYmVmb3JlIGFkdmFuY2luZyB0aGUgcGFyYW0sXHJcbiAgICAgICAgICAgICAgICAvLyB0byBiZSBpbiBzeW5jIHdpdGggdGhlIGluaXRpYWxpemF0aW9uIHN0ZXBcclxuICAgICAgICAgICAgICAgIHJzLnBhcmFtID0gcGFyYW1Dcm9zc1g7XHJcbiAgICAgICAgICAgICAgICBwYXJhbUNyb3NzWCArPSBwYXJhbURlbHRhWDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIFogbGFuZVxyXG4gICAgICAgICAgICAgICAgcnMueiArPSB6aVN0ZXA7XHJcbiAgICAgICAgICAgICAgICBycy5wYXJhbSA9IHBhcmFtQ3Jvc3NaO1xyXG4gICAgICAgICAgICAgICAgcGFyYW1Dcm9zc1ogKz0gcGFyYW1EZWx0YVo7XHJcbiAgICAgICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgICAgICBpZiAodGhpcy5fcXVhZEFjdGlvbihycywgbG9jYWxSYXksIHJlc3VsdCkpIHtcclxuICAgICAgICAgICAgICAgIGhhc0hpdCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChycy5wYXJhbSA+IHJzLm1heERpc3RhbmNlRmxhdCkge1xyXG4gICAgICAgICAgICAgICAgcnMucGFyYW0gPSBycy5tYXhEaXN0YW5jZUZsYXQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGhhc0hpdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW50ZXJzZWN0c1JheSh3b3JsZFRyYW5mb3JtOiBwY3guTWF0NCB8IG51bGwgfCB1bmRlZmluZWQsIHJheTogcGN4LlJheSwgcmVzdWx0OiBUZXJyYWluUmF5Y2FzdFJlc3VsdCA9IG5ldyBUZXJyYWluUmF5Y2FzdFJlc3VsdCgpKTogYm9vbGVhbiB7XHJcblxyXG4gICAgICAgIGlmICh3b3JsZFRyYW5mb3JtKSB7XHJcbiAgICAgICAgICAgIG1vZGVsVHJhbnNmb3JtLmNvcHkod29ybGRUcmFuZm9ybSkuaW52ZXJ0KCk7XHJcbiAgICAgICAgICAgIG1vZGVsVHJhbnNmb3JtLnRyYW5zZm9ybVBvaW50KHJheS5vcmlnaW4sIHRtcFJheS5vcmlnaW4pO1xyXG4gICAgICAgICAgICBtb2RlbFRyYW5zZm9ybS50cmFuc2Zvcm1WZWN0b3IocmF5LmRpcmVjdGlvbiwgdG1wUmF5LmRpcmVjdGlvbik7XHJcbiAgICBcclxuICAgICAgICAgICAgZGVidWdUcmFuc2Zvcm0uY29weSh3b3JsZFRyYW5mb3JtKTtcclxuICAgICAgICAgICAgZGVidWdUcmFuc2Zvcm1Jc0lkZW50aXR5ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCFkZWJ1Z1RyYW5zZm9ybUlzSWRlbnRpdHkpIHtcclxuICAgICAgICAgICAgZGVidWdUcmFuc2Zvcm0uc2V0SWRlbnRpdHkoKTtcclxuICAgICAgICAgICAgZGVidWdUcmFuc2Zvcm1Jc0lkZW50aXR5ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICBjb25zdCBoaXQgPSB0aGlzLl9pbnRlcnNlY3RzUmF5KHdvcmxkVHJhbmZvcm0gPyB0bXBSYXkgOiByYXksIHJlc3VsdCk7XHJcbiAgICBcclxuICAgICAgICBpZiAoaGl0ICYmIHdvcmxkVHJhbmZvcm0pIHtcclxuICAgICAgICAgICAgLy8gdXBkYXRlIHdvcmxkIHBvaW50IGFuZCBub3JtYWwsIGJ1dCBzYXZlIGxvY2FsXHJcbiAgICAgICAgICAgIHdvcmxkVHJhbmZvcm0udHJhbnNmb3JtUG9pbnQocmVzdWx0LnBvaW50LCByZXN1bHQucG9pbnQpO1xyXG4gICAgICAgICAgICB3b3JsZFRyYW5mb3JtLnRyYW5zZm9ybVZlY3RvcihyZXN1bHQubm9ybWFsLCByZXN1bHQubm9ybWFsKTtcclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICByZXR1cm4gISFoaXQ7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgdHlwZSB7IGZsb2F0LCBpbnQgfSBmcm9tIFwiLi4vU2hhcmVkL1R5cGVzLm1qc1wiO1xyXG5pbXBvcnQgQWJzUGF0Y2hlZEhlaWdodE1hcCwgeyBnZXRPclRocm93RGF0YUNodW5rU2l6ZSwgSVJlYWRvbmx5QWJzUGF0Y2hlZEhlaWdodE1hcFR5cHBlZCB9IGZyb20gXCIuL0Fic1BhdGNoZWRIZWlnaHRNYXAubWpzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElSZWFkb25seVBhdGNoZWRIZWlnaHRNYXAgZXh0ZW5kcyBJUmVhZG9ubHlBYnNQYXRjaGVkSGVpZ2h0TWFwVHlwcGVkPEZsb2F0MzJBcnJheT4ge1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgUGF0Y2hlZEhlaWdodE1hcCBleHRlbmRzIEFic1BhdGNoZWRIZWlnaHRNYXA8RmxvYXQzMkFycmF5PiBpbXBsZW1lbnRzIElSZWFkb25seVBhdGNoZWRIZWlnaHRNYXAge1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGNyZWF0ZUJ1ZmZlcih3aWR0aDogaW50LCBkZXB0aDogaW50LCBjaHVua1NpemU6IGludCk6IEZsb2F0MzJBcnJheSB7XHJcblxyXG4gICAgICAgIGNvbnN0IG51bUNodW5rc1ggICA9ICgod2lkdGggLSAxKSAvIChjaHVua1NpemUgLSAxKSkgfCAwO1xyXG4gICAgICAgIGNvbnN0IG51bUNodW5rc1ogICA9ICgoZGVwdGggLSAxKSAvIChjaHVua1NpemUgLSAxKSkgfCAwO1xyXG4gICAgICAgIGNvbnN0IGNodW5rQXJyU2l6ZSA9IGNodW5rU2l6ZSAqIGNodW5rU2l6ZTtcclxuICAgICAgICBjb25zdCBjaHVua0NvdW50ICAgPSBudW1DaHVua3NYICogbnVtQ2h1bmtzWjtcclxuICAgIFxyXG4gICAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KGNodW5rQXJyU2l6ZSAqIGNodW5rQ291bnQpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHdpZHRoOiBpbnQsIGRlcHRoOiBpbnQsIHBhdGNoU2l6ZTogaW50LCBkYXRhQ2h1bmtTaXplOiBpbnQsIG1pbkhlaWdodDogZmxvYXQsIG1heEhlaWdodDogZmxvYXQsIGJ1ZmZlcj86IEZsb2F0MzJBcnJheSkge1xyXG4gICAgICAgIGNvbnN0IHZhbGlkRGF0YUNodW5rU2l6ZSA9IGdldE9yVGhyb3dEYXRhQ2h1bmtTaXplKHBhdGNoU2l6ZSwgZGF0YUNodW5rU2l6ZSk7XHJcbiAgICAgICAgY29uc3QgdG1wQnVmZmVyID0gYnVmZmVyID8/IFBhdGNoZWRIZWlnaHRNYXAuY3JlYXRlQnVmZmVyKHdpZHRoLCBkZXB0aCwgdmFsaWREYXRhQ2h1bmtTaXplKTtcclxuICAgICAgICBzdXBlcih3aWR0aCwgZGVwdGgsIHBhdGNoU2l6ZSwgZGF0YUNodW5rU2l6ZSwgbWluSGVpZ2h0LCBtYXhIZWlnaHQsIHRtcEJ1ZmZlciwgMSwgMCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBhdGNoZWRIZWlnaHRNYXA7IiwiaW1wb3J0IHsgZmxvYXQgfSBmcm9tIFwiLi4vU2hhcmVkL1R5cGVzLm1qc1wiO1xyXG5pbXBvcnQgeyBJRnJ1c3R1bSB9IGZyb20gXCIuLi9UZXJyYWluU3lzdGVtL0dlb21pcEdyaWRSZW5kZXJQcmVwYXJlci5tanNcIjtcclxuXHJcbmNvbnN0IHRtcFZlYyA9IG5ldyBwYy5WZWMzKCk7XHJcbmNvbnN0IHRtcFJhZCA9IG5ldyBwYy5WZWMzKCk7XHJcbmNvbnN0IHRtcFNwaGVyZSA9IG5ldyBwYy5Cb3VuZGluZ1NwaGVyZSgpO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZydXN0dW0gaW1wbGVtZW50cyBJRnJ1c3R1bSB7XHJcblxyXG4gICAgcHJpdmF0ZSBfbWFyZ2luOiBmbG9hdDtcclxuICAgIHByaXZhdGUgX21hdDogcGN4Lk1hdDQ7XHJcbiAgICBwcml2YXRlIF9zY2FsZTogcGN4LlZlYzM7XHJcbiAgICBwcml2YXRlIF9mcnVzdHVtOiBwY3guRnJ1c3R1bTtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IG1hcmdpbigpICAgICAgICAgICAgIHsgcmV0dXJuIHRoaXMuX21hcmdpbjsgfVxyXG4gICAgcHVibGljIHNldCBtYXJnaW4odmFsdWU6IGZsb2F0KSB7IHRoaXMuX21hcmdpbiA9IHZhbHVlOyB9XHJcblxyXG4gICAgcHVibGljIGdldCBmcnVzdHVtKCkgICAgICAgICAgICAgICAgICAgeyByZXR1cm4gdGhpcy5fZnJ1c3R1bTsgfVxyXG4gICAgcHVibGljIHNldCBmcnVzdHVtKHZhbHVlOiBwY3guRnJ1c3R1bSkgeyB0aGlzLl9mcnVzdHVtID0gdmFsdWU7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHRyYW5zZm9ybSgpICAgICAgICAgICAgICAgIHsgcmV0dXJuIHRoaXMuX21hdDsgfVxyXG4gICAgcHVibGljIHNldCB0cmFuc2Zvcm0odmFsdWU6IHBjeC5NYXQ0KSB7XHJcbiAgICAgICAgdGhpcy5fbWF0LmNvcHkodmFsdWUpO1xyXG4gICAgICAgIHRoaXMuX21hdC5nZXRTY2FsZSh0aGlzLl9zY2FsZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX21hcmdpbiA9IDE7XHJcbiAgICAgICAgdGhpcy5fbWF0ICAgID0gbmV3IHBjLk1hdDQoKTtcclxuICAgICAgICB0aGlzLl9zY2FsZSAgPSBuZXcgcGMuVmVjMygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjb250YWluc1NwaGVyZShsb2NhbFg6IGZsb2F0LCBsb2NhbFk6IGZsb2F0LCBsb2NhbFo6IGZsb2F0LCByYWRpdXM6IGZsb2F0KSB7XHJcblxyXG4gICAgICAgIHRtcFZlYy5zZXQobG9jYWxYLCBsb2NhbFksIGxvY2FsWik7XHJcbiAgICAgICAgdG1wUmFkLmNvcHkodGhpcy5fc2NhbGUpLm11bFNjYWxhcihyYWRpdXMpO1xyXG5cclxuICAgICAgICB0aGlzLl9tYXQudHJhbnNmb3JtUG9pbnQodG1wVmVjLCB0bXBWZWMpO1xyXG5cclxuICAgICAgICAvLyBAdHMtaWdub3JlIFtQTEFZQ0FOVkFTOkRPQ106IGNlbnRlciBwcml2YXRlIGluIHYyXHJcbiAgICAgICAgdG1wU3BoZXJlLmNlbnRlciA9IHRtcFZlYztcclxuICAgICAgICB0bXBTcGhlcmUucmFkaXVzID0gdG1wUmFkLmRpc3RhbmNlKHBjLlZlYzMuWkVSTykgKiB0aGlzLl9tYXJnaW47XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLl9mcnVzdHVtLmNvbnRhaW5zU3BoZXJlKHRtcFNwaGVyZSkgPiAwO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgZHJhd0RpcmVjdGlvblZlY3RvciwgZHJhd1BvaW50IH0gZnJvbSBcIi4uL1NoYXJlZC9EZWJ1Zy5tanNcIjtcclxuaW1wb3J0IHsgTWlkcG9pbnREaXNwVGVycmFpbiB9IGZyb20gXCIuLi9UZXJyYWluU3lzdGVtL01pZHBvaW50RGlzcFRlcnJhaW4ubWpzXCI7XHJcbmltcG9ydCBUZXJyYWluUmF5Y2FzdFJlc3VsdCBmcm9tIFwiLi4vVGVycmFpblN5c3RlbS9UZXJyYWluUmF5Y2FzdFJlc3VsdC5tanNcIjtcclxuaW1wb3J0IEhlaWdodE1hcCBmcm9tIFwiLi4vVGVycmFpblN5c3RlbS9IZWlnaHRNYXAubWpzXCI7XHJcbmltcG9ydCBUZXJyYWluUmVuZGVyUHJlcGFyZXIgZnJvbSBcIi4uL1RlcnJhaW5IZWxwZXJzL1RlcnJhaW5SZW5kZXJQcmVwYXJlci5tanNcIjtcclxuaW1wb3J0IHR5cGUgeyBJQnJ1c2hTZXR0aW5ncyB9IGZyb20gXCIuLi9UZXJyYWluSGVscGVycy9CcnVzaC5tanNcIjtcclxuaW1wb3J0IENvbG9yUGFpbnRlciBmcm9tIFwiLi4vVGVycmFpbkhlbHBlcnMvQ29sb3JQYWludGVyLm1qc1wiO1xyXG5pbXBvcnQgVGVycmFpblBhdGNoZXMgZnJvbSBcIi4uL1RlcnJhaW5IZWxwZXJzL1RlcnJhaW5QYXRjaGVzLm1qc1wiO1xyXG5pbXBvcnQgeyB0ZXJyYWluSGVpZ2h0c0NvbXByZXNzQWxnb3JpdG0sIHRlcnJhaW5IZWlnaHRzQ29tcHJlc3NBbGdvcml0bURlZmF1bHQsIHRlcnJhaW5QYXRjaFNpemVFbnVtLCB0ZXJyYWluUGF0Y2hTaXplRW51bURlZmF1bHQsIHRlcnJhaW5TaXplRW51bSwgdGVycmFpblNpemVFbnVtRGVmYXVsdCB9IGZyb20gXCIuLi9UZXJyYWluSGVscGVycy9FbnVtcy5tanNcIjtcclxuaW1wb3J0IHsgdGVycmFpbk1heEhlaWdodFBhcmFtTmFtZSwgdGVycmFpbk1pbkhlaWdodFBhcmFtTmFtZSwgdGVycmFpblNwbGF0TWFwUGFyYW1OYW1lLCB9IGZyb20gXCIuLi9UZXJyYWluSGVscGVycy9UZXJyYWluUGF0Y2hlc1NoYWRlckNodW5rcy5tanNcIjtcclxuaW1wb3J0IEhlaWdodGZpZWxkU2hhcGUgZnJvbSBcIi4uL1RlcnJhaW5TeXN0ZW0vSGVpZ2h0ZmllbGRTaGFwZS5tanNcIjtcclxuaW1wb3J0IFBhdGNoZWRIZWlnaHRNYXAgZnJvbSBcIi4uL1RlcnJhaW5TeXN0ZW0vUGF0Y2hlZEhlaWdodE1hcC5tanNcIjtcclxuaW1wb3J0IENvbXByZXNzZWRQYXRjaGVkSGVpZ2h0TWFwLCB7IFRDb21wcmVzc0FsZ29yaXRtIH0gZnJvbSBcIi4uL1RlcnJhaW5TeXN0ZW0vQ29tcHJlc3NlZFBhdGNoZWRIZWlnaHRNYXAubWpzXCI7XHJcbmltcG9ydCB7IEZydXN0dW0gfSBmcm9tIFwiLi4vVGVycmFpbkhlbHBlcnMvRnJ1c3R1bS5tanNcIjtcclxuaW1wb3J0IHsgbWFwVGl0bGVFbnVtIH0gZnJvbSBcIi4uL1NoYXJlZC9FbnVtQ29udmVydGVyLm1qc1wiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJVGVycmFpbkhlaWdodE1hcEF0dHJpYnV0ZSB7XHJcbiAgICByZWFkb25seSBmaWxlOiBwY3guQXNzZXQ7XHJcbiAgICByZWFkb25seSB0ZXh0dXJlOiBwY3guQXNzZXQ7XHJcbiAgICByZWFkb25seSBzbW9vdGhGYWN0b3I6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHNtb290aFJhZGl1czogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElUZXJyYWluQnJ1c2hBdHRyaWJ1dGUgZXh0ZW5kcyBJQnJ1c2hTZXR0aW5ncyB7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVRlcnJhaW5MYXllckF0dHJpYnV0ZSB7XHJcbiAgICByZWFkb25seSBuYW1lOiBzdHJpbmcsXHJcbiAgICByZWFkb25seSBkaWZmdXNlOiBwY3guQXNzZXQ7XHJcbiAgICByZWFkb25seSBub3JtYWxNYXA6IHBjeC5Bc3NldDtcclxuICAgIHJlYWRvbmx5IHNpemU6IHBjeC5WZWMyO1xyXG4gICAgcmVhZG9ubHkgb2Zmc2V0OiBwY3guVmVjMjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJVGVycmFpblBhaW50ZXJTZXR0aW5nc0F0dHJpYnV0ZSB7XHJcbiAgICByZWFkb25seSBzcGxhdE1hcDogcGN4LkFzc2V0O1xyXG59XHJcblxyXG5jb25zdCBicnVzaE1pblNpemUgPSAyO1xyXG5jb25zdCBicnVzaE1heFNpemUgPSAyNTA7XHJcbmNvbnN0IHRtcE1hdCA9IG5ldyBwYy5NYXQ0KCk7XHJcbmNvbnN0IHRlcnJhaW5Mb2NhbFZlcnRleFBvcyA9IG5ldyBwYy5WZWMzKCk7XHJcbmNvbnN0IGhlaWdodE1hcEV4dCA9ICcuaG0nO1xyXG5cclxuZXhwb3J0IGVudW0gUmVuZGVyTW9kZSB7XHJcbiAgICBTdGFuZGFyZCA9IDEsXHJcbiAgICBJbnN0YW5jaW5nQWNjZWxlcmF0b3IgPSAyLFxyXG4gICAgQ3VzdG9tRm9yd2FyZFJlbmRlcmVyID0gMyxcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEJpZ1RlcnJhaW5FZGl0b3IgZXh0ZW5kcyBwYy5TY3JpcHRUeXBlIHtcclxuXHJcbiAgICBkZWNsYXJlIHJlYWRvbmx5IHJlbmRlck1vZGU6IFJlbmRlck1vZGU7XHJcbiAgICBkZWNsYXJlIHJlYWRvbmx5IHpGYXI6IG51bWJlcjtcclxuICAgIGRlY2xhcmUgcmVhZG9ubHkgd2lkdGg6IG51bWJlcjtcclxuICAgIGRlY2xhcmUgcmVhZG9ubHkgZGVwdGg6IG51bWJlcjtcclxuICAgIGRlY2xhcmUgcmVhZG9ubHkgaGVpZ2h0OiBudW1iZXI7XHJcbiAgICBkZWNsYXJlIHJlYWRvbmx5IGNvbXByZXNzQWxnb3JpdG06IFRDb21wcmVzc0FsZ29yaXRtIHwgJ25vbmUnO1xyXG4gICAgZGVjbGFyZSByZWFkb25seSBwYXRjaFNpemU6IG51bWJlcjtcclxuICAgIGRlY2xhcmUgcmVhZG9ubHkgY2FzdFNoYWRvdzogYm9vbGVhbjtcclxuICAgIGRlY2xhcmUgcmVhZG9ubHkgcmVjZWl2ZVNoYWRvdzogYm9vbGVhbjtcclxuXHJcbiAgICBkZWNsYXJlIHJlYWRvbmx5IGxheWVyOiBzdHJpbmc7XHJcbiAgICBkZWNsYXJlIHJlYWRvbmx5IGxheWVyMjogc3RyaW5nO1xyXG4gICAgZGVjbGFyZSByZWFkb25seSBhdXRvUmVuZGVyOiBib29sZWFuO1xyXG4gICAgZGVjbGFyZSByZWFkb25seSB3aXJlZnJhbWU6IGJvb2xlYW47XHJcbiAgICBkZWNsYXJlIHJlYWRvbmx5IHBhaW50aW5nOiBib29sZWFuO1xyXG4gICAgZGVjbGFyZSByZWFkb25seSBjYW1lcmFFbnRpdHk6IHBjeC5FbnRpdHkgfCB1bmRlZmluZWQ7XHJcbiAgICBkZWNsYXJlIHJlYWRvbmx5IGhlaWdodE1hcDogSVRlcnJhaW5IZWlnaHRNYXBBdHRyaWJ1dGU7XHJcbiAgICBkZWNsYXJlIHJlYWRvbmx5IGJydXNoOiBJVGVycmFpbkJydXNoQXR0cmlidXRlO1xyXG4gICAgZGVjbGFyZSByZWFkb25seSBhY3RpdmVMYXllcjogbnVtYmVyO1xyXG4gICAgZGVjbGFyZSByZWFkb25seSBsYXllcnM6IElUZXJyYWluTGF5ZXJBdHRyaWJ1dGVbXTtcclxuICAgIGRlY2xhcmUgcmVhZG9ubHkgcGFpbnRlclNldHRpbmdzOiBJVGVycmFpblBhaW50ZXJTZXR0aW5nc0F0dHJpYnV0ZTtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IHNoYXBlKCkgeyByZXR1cm4gdGhpcy5faGVpZ2h0RmllbGRTaGFwZTsgfVxyXG4gICAgcHVibGljIGdldCB0ZXJyYWluKCkgeyByZXR1cm4gdGhpcy5fdGVycmFpbjsgfVxyXG4gICAgcHVibGljIGdldCB0ZXJyYWluUmVuZGVyUHJlcGFyZXIoKSB7IHJldHVybiB0aGlzLl9yZW5kZXJQcmVwYXJlcjsgfVxyXG5cclxuICAgIHByaXZhdGUgX2xvY2sgPSAwO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgbG9jaygpIHsgcmV0dXJuIHRoaXMuX2xvY2s7IH1cclxuXHJcbiAgICBwcml2YXRlIF9sb2NhbENhbWVyYVBvc2l0aW9uID0gbmV3IHBjLlZlYzMoKTtcclxuICAgIHByaXZhdGUgX3RlcnJhaW46IE1pZHBvaW50RGlzcFRlcnJhaW47XHJcbiAgICBwcml2YXRlIF9yb3VnaG5lc3MgPSAxLjA7XHJcblxyXG4gICAgcHJpdmF0ZSBfbWluSGVpZ2h0ID0gMC4wO1xyXG5cclxuICAgIHByaXZhdGUgX2hlaWdodEZpZWxkU2hhcGU6IEhlaWdodGZpZWxkU2hhcGU7XHJcbiAgICBwcml2YXRlIF9yYXljYXN0UmVzdWx0OiBUZXJyYWluUmF5Y2FzdFJlc3VsdDtcclxuICAgIHByaXZhdGUgX3JheVN0YXJ0ID0gbmV3IHBjLlZlYzMoKTtcclxuICAgIHByaXZhdGUgX3JheUVuZCA9IG5ldyBwYy5WZWMzKCk7XHJcbiAgICBwcml2YXRlIF9yYXlEaXJlY3Rpb24gPSBuZXcgcGMuVmVjMygpO1xyXG4gICAgcHJpdmF0ZSBfcmF5ID0gbmV3IHBjLlJheSgpO1xyXG5cclxuICAgIHByaXZhdGUgX2xhc3RNb3VzZU1vdmVFdmVudDogcGN4Lk1vdXNlRXZlbnQ7XHJcblxyXG4gICAgcHJpdmF0ZSBfbGFzdExvZEdyaWRVcGRhdGU6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIF9hY3RpdmVCcnVzaDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfYnJ1c2hIZWlnaHRNYXA6IEhlaWdodE1hcDtcclxuICAgIHByaXZhdGUgX2NvbG9yUGFpbnRlcjogQ29sb3JQYWludGVyO1xyXG4gICAgcHJpdmF0ZSBfYnJ1c2hTaXplOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIF9icnVzaFNpemVTdGVwOiBudW1iZXIgPSAxO1xyXG4gICAgcHJpdmF0ZSBfYnJ1c2hPcGFjaXR5OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIF9icnVzaE9wYWNpdHlTdGVwOiBudW1iZXIgPSAwLjAxO1xyXG4gICAgcHJpdmF0ZSBfaW50ZXJzZWN0c1JheVJlc3VsdDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBfbWF0ZXJpYWw6IHBjeC5TdGFuZGFyZE1hdGVyaWFsO1xyXG4gICAgcHJpdmF0ZSBfbGF5ZXJzRGlmZnVzZTogcGN4LlRleHR1cmUgfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgcHJpdmF0ZSBfcmVuZGVyUHJlcGFyZXI6IFRlcnJhaW5SZW5kZXJQcmVwYXJlcjtcclxuICAgIHByaXZhdGUgX2ZydXN0dW06IEZydXN0dW07XHJcblxyXG4gICAgcHVibGljIGFkZExvY2soKSB7XHJcbiAgICAgICAgdGhpcy5fbG9jaysrO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBmcmVlTG9jaygpIHtcclxuICAgICAgICB0aGlzLl9sb2NrLS07XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBvc3RJbml0aWFsaXplKCk6IHZvaWQge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVNb3VzZSgpO1xyXG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVLZXlib2FyZCgpO1xyXG5cclxuICAgICAgICB0aGlzLl9pbml0QnJ1c2goKTtcclxuICAgICAgICB0aGlzLl9pbml0VGVycmFpbigpO1xyXG5cclxuICAgICAgICB0aGlzLl9jcmVhdGVUZXJyYWluTWF0ZXJpYWwoKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVUZXJyYWluTWF0ZXJpYWxQYXJhbWV0ZXJzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3VwZGF0ZUxheWVycygpO1xyXG5cclxuICAgICAgICB0aGlzLl91cGRhdGVIZWlnaHRNYXBGcm9tQXR0cigpO1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZUJydXNoKCk7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlUGFpbnRlck1hdGVyaWFsKCk7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlTWVzaCgpO1xyXG5cclxuICAgICAgICB0aGlzLm9uKCdhdHRyOnJlbmRlck1vZGUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlclByZXBhcmVyLnBhdGNoZXNTdG9yZS5jdXN0b21Gb3J3YXJkUmVuZGVyZXIgPSB0aGlzLnJlbmRlck1vZGUgPT09IFJlbmRlck1vZGUuQ3VzdG9tRm9yd2FyZFJlbmRlcmVyO1xyXG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJQcmVwYXJlci5wYXRjaGVzU3RvcmUuaW5zdGFuY2luZy5lbmFibGVkID0gdGhpcy5yZW5kZXJNb2RlID09PSBSZW5kZXJNb2RlLkluc3RhbmNpbmdBY2NlbGVyYXRvcjtcclxuICAgICAgICAgICAgdGhpcy5fcmVuZGVyUHJlcGFyZXIucGF0Y2hlc1N0b3JlLnVwZGF0ZU1hdGVyaWFsKHRoaXMuX21hdGVyaWFsKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVuZGVyUHJlcGFyZXIucGF0Y2hlc1N0b3JlLnVwZGF0ZU1lc2hlcygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm9uKCdhdHRyOndpcmVmcmFtZScsICgpID0+IHsgdGhpcy5fcmVuZGVyUHJlcGFyZXIud2lyZWZyYW1lID0gdGhpcy53aXJlZnJhbWU7IH0pO1xyXG4gICAgICAgIHRoaXMub24oJ2F0dHI6Y2FzdFNoYWRvdycsICgpID0+IHsgdGhpcy5fcmVuZGVyUHJlcGFyZXIuY2FzdFNoYWRvdyA9IHRoaXMuY2FzdFNoYWRvdzsgfSk7XHJcbiAgICAgICAgdGhpcy5vbignYXR0cjpyZWNlaXZlU2hhZG93JywgKCkgPT4geyB0aGlzLl9yZW5kZXJQcmVwYXJlci5yZWNlaXZlU2hhZG93ID0gdGhpcy5yZWNlaXZlU2hhZG93OyB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5vbignYXR0cjphY3RpdmVMYXllcicsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlUGFpbnRlck1hdGVyaWFsKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMub24oJ2F0dHI6bGF5ZXJzJywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVMYXllcnMoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5vbignYXR0cjpicnVzaCcsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlQnJ1c2goKTtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlUGFpbnRlck1hdGVyaWFsKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMub24oJ2F0dHI6aGVpZ2h0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl90ZXJyYWluLnNldE1pbk1heEhlaWdodCh0aGlzLl9taW5IZWlnaHQsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlVGVycmFpbk1hdGVyaWFsUGFyYW1ldGVycygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm9uKCdhdHRyOnpGYXInLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RlcnJhaW4uc2V0WkZhcih0aGlzLnpGYXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXRCcnVzaCgpIHtcclxuICAgICAgICBjb25zdCBzcGxhdE1hcCA9IHRoaXMucGFpbnRlclNldHRpbmdzLnNwbGF0TWFwLnJlc291cmNlIGFzIHBjeC5UZXh0dXJlO1xyXG4gICAgICAgIHRoaXMuX2JydXNoSGVpZ2h0TWFwID0gbmV3IEhlaWdodE1hcCgyNTYsIDI1NiwgMCwgMTAwKTtcclxuICAgICAgICB0aGlzLl9jb2xvclBhaW50ZXIgPSBuZXcgQ29sb3JQYWludGVyKHRoaXMuYXBwLCBzcGxhdE1hcCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfdXBkYXRlUGFpbnRlck1hdGVyaWFsKCkge1xyXG4gICAgICAgIHRoaXMuX2NvbG9yUGFpbnRlci51cGRhdGVTZXR0aW5ncyh0aGlzLmJydXNoLCB0aGlzLmFjdGl2ZUxheWVyKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF91cGRhdGVCcnVzaCgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5fYnJ1c2hTaXplID0gdGhpcy5icnVzaC5zaXplIHwgMDtcclxuICAgICAgICB0aGlzLl9icnVzaE9wYWNpdHkgPSB0aGlzLmJydXNoLm9wYWNpdHk7XHJcblxyXG4gICAgICAgIGNvbnN0IGFjdGl2ZUJydXNoID0gdGhpcy5icnVzaC5hY3RpdmUgfCAwO1xyXG5cclxuICAgICAgICBpZiAoYWN0aXZlQnJ1c2ggPT09IHRoaXMuX2FjdGl2ZUJydXNoKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5icnVzaC50ZXh0dXJlc1thY3RpdmVCcnVzaF0pIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQnJ1c2ggaW1hZ2UgdW5zZXQuJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGJydXNoVGV4dHVyZSA9IHRoaXMuYnJ1c2gudGV4dHVyZXNbYWN0aXZlQnJ1c2hdLnJlc291cmNlIGFzIHBjeC5UZXh0dXJlO1xyXG4gICAgICAgIGNvbnN0IGJydXNoSW1nID0gYnJ1c2hUZXh0dXJlLmdldFNvdXJjZSgpIGFzIHVua25vd24gYXMgSW1hZ2VCaXRtYXA7XHJcblxyXG4gICAgICAgIGlmICghYnJ1c2hJbWcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQnJ1c2ggaW1hZ2UgdW5zZXQuJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2FjdGl2ZUJydXNoID0gYWN0aXZlQnJ1c2g7XHJcbiAgICAgICAgdGhpcy5fYnJ1c2hIZWlnaHRNYXAuZnJvbUltYWdlKGJydXNoSW1nKTtcclxuICAgICAgICB0aGlzLl9icnVzaEhlaWdodE1hcC5zbW9vdGgoMSwgMSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuX2JydXNoSGVpZ2h0TWFwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0VGVycmFpbigpIHtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCB0bXBDaHVua1NpemUgPSB0aGlzLnBhdGNoU2l6ZSAqIDIgLSAxO1xyXG4gICAgICAgIGNvbnN0IGNodW5rU2l6ZSA9IE1hdGgubWluKHRoaXMud2lkdGgsIHRoaXMuZGVwdGgsIHRtcENodW5rU2l6ZSk7XHJcbiAgICAgICAgY29uc3QgaGVpZ2h0TWFwID0gdGhpcy5jb21wcmVzc0FsZ29yaXRtICE9PSAnbm9uZSdcclxuICAgICAgICA/IG5ldyBDb21wcmVzc2VkUGF0Y2hlZEhlaWdodE1hcCh0aGlzLndpZHRoLCB0aGlzLmRlcHRoLCB0aGlzLnBhdGNoU2l6ZSwgY2h1bmtTaXplLCB0aGlzLl9taW5IZWlnaHQsIHRoaXMuaGVpZ2h0LCB0aGlzLmNvbXByZXNzQWxnb3JpdG0pXHJcbiAgICAgICAgOiBuZXcgUGF0Y2hlZEhlaWdodE1hcCh0aGlzLndpZHRoLCB0aGlzLmRlcHRoLCB0aGlzLnBhdGNoU2l6ZSwgY2h1bmtTaXplLCB0aGlzLl9taW5IZWlnaHQsIHRoaXMuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgdGhpcy5fdGVycmFpbiA9IG5ldyBNaWRwb2ludERpc3BUZXJyYWluKGhlaWdodE1hcCwgdGhpcy56RmFyKTtcclxuICAgICAgICB0aGlzLl9oZWlnaHRGaWVsZFNoYXBlID0gbmV3IEhlaWdodGZpZWxkU2hhcGUoaGVpZ2h0TWFwKTtcclxuICAgICAgICB0aGlzLl9yYXljYXN0UmVzdWx0ID0gbmV3IFRlcnJhaW5SYXljYXN0UmVzdWx0KCk7XHJcbiAgICAgICAgdGhpcy5fZnJ1c3R1bSA9IG5ldyBGcnVzdHVtKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHBhdGNoZXIgPSBuZXcgVGVycmFpblBhdGNoZXModGhpcy5fdGVycmFpbik7XHJcbiAgICAgICAgdGhpcy5fcmVuZGVyUHJlcGFyZXIgPSBuZXcgVGVycmFpblJlbmRlclByZXBhcmVyKHBhdGNoZXIsIHtcclxuICAgICAgICAgICAgd2lyZWZyYW1lOiB0aGlzLndpcmVmcmFtZSxcclxuICAgICAgICAgICAgY2FzdFNoYWRvdzogdGhpcy5jYXN0U2hhZG93LFxyXG4gICAgICAgICAgICByZWNlaXZlU2hhZG93OiB0aGlzLnJlY2VpdmVTaGFkb3csXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5fdGVycmFpbiwgdGhpcy5faGVpZ2h0RmllbGRTaGFwZSwgdGhpcy5fcmVuZGVyUHJlcGFyZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NyZWF0ZVRlcnJhaW5NYXRlcmlhbCgpIHtcclxuICAgICAgICB0aGlzLl9tYXRlcmlhbCA9IG5ldyBwYy5TdGFuZGFyZE1hdGVyaWFsKCk7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwubmFtZSA9IFwiVGVycmFpbiBNYXRlcmlhbFwiO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3VwZGF0ZVRlcnJhaW5NYXRlcmlhbFBhcmFtZXRlcnMoKSB7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwuc2V0UGFyYW1ldGVyKHRlcnJhaW5TcGxhdE1hcFBhcmFtTmFtZSwgdGhpcy5fY29sb3JQYWludGVyLmJhY2tncm91bmQpO1xyXG4gICAgICAgIHRoaXMuX21hdGVyaWFsLnNldFBhcmFtZXRlcih0ZXJyYWluTWluSGVpZ2h0UGFyYW1OYW1lLCB0aGlzLl90ZXJyYWluLm1pbkhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwuc2V0UGFyYW1ldGVyKHRlcnJhaW5NYXhIZWlnaHRQYXJhbU5hbWUsIHRoaXMuX3RlcnJhaW4ubWF4SGVpZ2h0KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF91cGRhdGVMYXllcnMoKSB7XHJcblxyXG4gICAgICAgIC8vIFRPRE9cclxuICAgICAgICBjb25zdCBtYXhDb3VudCA9IDE2O1xyXG4gICAgICAgIGNvbnN0IHdpZHRoICA9IDEwMjQ7XHJcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gMTAyNDtcclxuXHJcbiAgICAgICAgbGV0IGxlbmd0aCAgID0gMDtcclxuICAgICAgICBsZXQgZmxhZ3MgICAgPSBbXTtcclxuICAgICAgICBsZXQgc2NhbGVzICAgPSBbXTtcclxuICAgICAgICBsZXQgb2Zmc2V0cyAgPSBbXTtcclxuICAgICAgICBsZXQgZGlmZnVzZXMgPSBbXTtcclxuICAgICAgICBsZXQgbm9ybWFscyAgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtYXhDb3VudDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgZmxhZyA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAoaSA8IHRoaXMubGF5ZXJzLmxlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGxheWVyICAgICA9IHRoaXMubGF5ZXJzW2ldO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlmZnVzZSAgID0gbGF5ZXIuZGlmZnVzZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5vcm1hbE1hcCA9IGxheWVyLm5vcm1hbE1hcDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZGlmZnVzZSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmbGFnKys7XHJcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoKys7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlmZnVzZXMucHVzaCgoZGlmZnVzZS5yZXNvdXJjZSBhcyBwY3guVGV4dHVyZSkuZ2V0U291cmNlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlcy5wdXNoKGxheWVyLnNpemUueCwgbGF5ZXIuc2l6ZS55KTtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRzLnB1c2gobGF5ZXIub2Zmc2V0LngsIGxheWVyLm9mZnNldC55KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vcm1hbE1hcCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmbGFnKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbHMucHVzaCgobm9ybWFsTWFwLnJlc291cmNlIGFzIHBjeC5UZXh0dXJlKS5nZXRTb3VyY2UoKSk7ICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZsYWdzLnB1c2goZmxhZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9sYXllcnNEaWZmdXNlPy5kZXN0cm95KCk7XHJcbiAgICAgICAgdGhpcy5fbGF5ZXJzRGlmZnVzZSA9IG5ldyBwYy5UZXh0dXJlKHRoaXMuYXBwLmdyYXBoaWNzRGV2aWNlLCB7XHJcbiAgICAgICAgICAgIG5hbWU6ICd0ZXJyYWluTGF5ZXJzRGlmZnVzZScsXHJcbiAgICAgICAgICAgIGZvcm1hdDogcGMuUElYRUxGT1JNQVRfUkdCQTgsXHJcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcclxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXHJcbiAgICAgICAgICAgIGFycmF5TGVuZ3RoOiBsZW5ndGgsXHJcbiAgICAgICAgICAgIG1hZ0ZpbHRlcjogcGMuRklMVEVSX05FQVJFU1QsXHJcbiAgICAgICAgICAgIG1pbkZpbHRlcjogcGMuRklMVEVSX05FQVJFU1RfTUlQTUFQX05FQVJFU1QsXHJcbiAgICAgICAgICAgIG1pcG1hcHM6IHRydWUsXHJcbiAgICAgICAgICAgIGFkZHJlc3NVOiBwYy5BRERSRVNTX1JFUEVBVCxcclxuICAgICAgICAgICAgYWRkcmVzc1Y6IHBjLkFERFJFU1NfUkVQRUFULFxyXG4gICAgICAgICAgICBhZGRyZXNzVzogcGMuQUREUkVTU19DTEFNUF9UT19FREdFLFxyXG4gICAgICAgICAgICBsZXZlbHM6IFsgZGlmZnVzZXMgYXMgYW55IF1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9sYXllcnNEaWZmdXNlLnVwbG9hZCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX21hdGVyaWFsLnNldFBhcmFtZXRlcihgdVRlcnJhaW5MYXllcnNDb3VudGAsIGxlbmd0aCk7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwuc2V0UGFyYW1ldGVyKGB1VGVycmFpbkxheWVyc0RpZmZ1c2VgLCB0aGlzLl9sYXllcnNEaWZmdXNlKTtcclxuICAgICAgICB0aGlzLl9tYXRlcmlhbC5zZXRQYXJhbWV0ZXIoYHVUZXJyYWluTGF5ZXJzRmxhZ3NbMF1gLCBmbGFncyk7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwuc2V0UGFyYW1ldGVyKGB1VGVycmFpbkxheWVyc1NjYWxlWzBdYCwgc2NhbGVzKTtcclxuICAgICAgICB0aGlzLl9tYXRlcmlhbC5zZXRQYXJhbWV0ZXIoYHVUZXJyYWluTGF5ZXJzT2Zmc2V0WzBdYCwgb2Zmc2V0cyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfdXBkYXRlTWVzaCgpIHtcclxuICAgICAgICB0aGlzLl9yZW5kZXJQcmVwYXJlci5wYXRjaGVzU3RvcmUuY3VzdG9tRm9yd2FyZFJlbmRlcmVyID0gdGhpcy5yZW5kZXJNb2RlID09PSBSZW5kZXJNb2RlLkN1c3RvbUZvcndhcmRSZW5kZXJlcjtcclxuICAgICAgICB0aGlzLl9yZW5kZXJQcmVwYXJlci5wYXRjaGVzU3RvcmUuaW5zdGFuY2luZy5lbmFibGVkID0gdGhpcy5yZW5kZXJNb2RlID09PSBSZW5kZXJNb2RlLkluc3RhbmNpbmdBY2NlbGVyYXRvcjtcclxuICAgICAgICB0aGlzLl9yZW5kZXJQcmVwYXJlci5wYXRjaGVzU3RvcmUuaW5pdCh0aGlzLmFwcCwgdGhpcy5lbnRpdHksIHRoaXMuX21hdGVyaWFsKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBfaW5pdGlhbGl6ZU1vdXNlKCkge1xyXG4gICAgICAgIHRoaXMuYXBwLm1vdXNlPy5vbihwYy5FVkVOVF9NT1VTRU1PVkUsIHRoaXMuX29uTW91c2VNb3ZlLCB0aGlzKTtcclxuICAgICAgICB0aGlzLmFwcC5tb3VzZT8ub24ocGMuRVZFTlRfTU9VU0VXSEVFTCwgdGhpcy5fb25Nb3VzZVdoZWVsLCB0aGlzKTtcclxuICAgICAgICB0aGlzLm9uKCdkZXN0cm95JywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmFwcC5tb3VzZT8ub2ZmKHBjLkVWRU5UX01PVVNFTU9WRSwgdGhpcy5fb25Nb3VzZU1vdmUsIHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLmFwcC5tb3VzZT8ub2ZmKHBjLkVWRU5UX01PVVNFV0hFRUwsIHRoaXMuX29uTW91c2VXaGVlbCwgdGhpcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfb25Nb3VzZU1vdmUoZXZlbnQ6IHBjeC5Nb3VzZUV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5fbGFzdE1vdXNlTW92ZUV2ZW50ID0gZXZlbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfb25Nb3VzZVdoZWVsKGV2ZW50OiBwY3guTW91c2VFdmVudCkge1xyXG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZSA9IHRoaXMuX2JydXNoU2l6ZSArIGV2ZW50LndoZWVsRGVsdGEgKiB0aGlzLl9icnVzaFNpemVTdGVwO1xyXG4gICAgICAgIHRoaXMuX2JydXNoU2l6ZSA9IE1hdGgubWluKE1hdGgubWF4KGNhbmRpZGF0ZSwgYnJ1c2hNaW5TaXplKSwgYnJ1c2hNYXhTaXplKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0aWFsaXplS2V5Ym9hcmQoKSB7XHJcbiAgICAgICAgdGhpcy5hcHAua2V5Ym9hcmQ/Lm9uKHBjLkVWRU5UX0tFWURPV04sIHRoaXMuX29uS2V5Ym9hcmREb3duLCB0aGlzKTtcclxuICAgICAgICB0aGlzLmFwcC5rZXlib2FyZD8ub24ocGMuRVZFTlRfS0VZVVAsIHRoaXMuX29uS2V5Ym9hcmRVcCwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5vbignZGVzdHJveScsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5hcHAubW91c2U/Lm9mZihwYy5FVkVOVF9LRVlET1dOLCB0aGlzLl9vbktleWJvYXJkRG93biwgdGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLm1vdXNlPy5vZmYocGMuRVZFTlRfS0VZVVAsIHRoaXMuX29uS2V5Ym9hcmRVcCwgdGhpcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfa2V5QWRkTG9jayA9IHRydWU7XHJcbiAgICBwcml2YXRlIF9rZXlTdWJMb2NrID0gdHJ1ZTtcclxuICAgIHByaXZhdGUgX29uS2V5Ym9hcmREb3duKGV2ZW50OiBwY3guS2V5Ym9hcmRFdmVudCkge1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fa2V5QWRkTG9jayA9PT0gZmFsc2UgJiYgZXZlbnQua2V5ID09PSBwYy5LRVlfQUREKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2tleUFkZExvY2sgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLl9icnVzaE9wYWNpdHkgPSBNYXRoLm1heCh0aGlzLl9icnVzaE9wYWNpdHkgKyB0aGlzLl9icnVzaE9wYWNpdHlTdGVwLCAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9rZXlTdWJMb2NrID09PSBmYWxzZSAmJiBldmVudC5rZXkgPT09IHBjLktFWV9TVUJUUkFDVCkge1xyXG4gICAgICAgICAgICB0aGlzLl9rZXlTdWJMb2NrID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5fYnJ1c2hPcGFjaXR5ID0gTWF0aC5taW4odGhpcy5fYnJ1c2hPcGFjaXR5IC0gdGhpcy5fYnJ1c2hPcGFjaXR5U3RlcCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX29uS2V5Ym9hcmRVcChldmVudDogcGN4LktleWJvYXJkRXZlbnQpIHtcclxuICAgICAgICBpZiAoZXZlbnQua2V5ID09PSBwYy5LRVlfQUREKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2tleUFkZExvY2sgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoZXZlbnQua2V5ID09PSBwYy5LRVlfU1VCVFJBQ1QpIHtcclxuICAgICAgICAgICAgdGhpcy5fa2V5U3ViTG9jayA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF91cGRhdGVIZWlnaHRNYXBGcm9tQXR0cigpIHtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaGVpZ2h0TWFwLmZpbGUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5oZWlnaHRNYXAuZmlsZS5yZXNvdXJjZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdIZWlnaHQgbWFwIGZpbGUgdW5zZXQuJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLmhlaWdodE1hcC5maWxlLnJlc291cmNlIGFzIEFycmF5QnVmZmVyO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLl90ZXJyYWluLmxvYWRIZWlnaHRNYXBGcm9tRmlsZShkYXRhLCB7XHJcbiAgICAgICAgICAgICAgICBhZGFwdGl2ZU1pbk1heEhlaWdodDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGFkYXB0aXZlV2lkdGhBbmREZXB0aDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgdGV4dHVyZSA9IHRoaXMuaGVpZ2h0TWFwLnRleHR1cmU7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRleHR1cmUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSGVpZ2h0IG1hcCBpbWFnZSB1bnNldC4nKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgcmVzb3VyY2UgPSB0ZXh0dXJlLnJlc291cmNlIGFzIHBjeC5UZXh0dXJlO1xyXG4gICAgICAgICAgICBjb25zdCBpbWcgPSByZXNvdXJjZS5nZXRTb3VyY2UoKSBhcyBhbnk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWltZykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdIZWlnaHQgbWFwIGltYWdlIHVuc2V0LicpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLl90ZXJyYWluLmxvYWRIZWlnaHRNYXBGcm9tSW1nKGltZywgdGhpcy5oZWlnaHRNYXAuc21vb3RoRmFjdG9yLCB0aGlzLmhlaWdodE1hcC5zbW9vdGhSYWRpdXMpO1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETzogY2xlYXIgaGVpZ2h0bWFwXHJcbiAgICAgICAgICAgIHJlc291cmNlLmRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX3JlbmRlclByZXBhcmVyLnBhdGNoZXNTdG9yZS51cGRhdGVBYWJiKCk7XHJcbiAgICAgICAgdGhpcy5fcmVuZGVyUHJlcGFyZXIucGF0Y2hlc1N0b3JlLnVwZGF0ZUhlaWdodHMoe1xyXG4gICAgICAgICAgICBtaW5YOiAwLFxyXG4gICAgICAgICAgICBtaW5aOiAwLFxyXG4gICAgICAgICAgICBtYXhYOiB0aGlzLndpZHRoLFxyXG4gICAgICAgICAgICBtYXhaOiB0aGlzLmRlcHRoXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfc2F2ZUhlaWdodE1hcFRvSW1nKCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IGJhc2U2NCA9IHRoaXMuX3RlcnJhaW4uaGVpZ2h0TWFwLnRvSW1hZ2UoKTtcclxuICAgICAgICBjb25zdCBpbWFnZSAgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICBcclxuICAgICAgICBpbWFnZS5zcmMgPSBiYXNlNjQ7XHJcblxyXG4gICAgICAgIGNvbnN0IHcgPSB3aW5kb3cub3Blbih1bmRlZmluZWQsICdfYmxhbmsnKSE7XHJcbiAgICAgICAgdy5kb2N1bWVudC53cml0ZShpbWFnZS5vdXRlckhUTUwpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX3NhdmVIZWlnaHRNYXBUb0ZpbGUoKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCB0aGlzLl90ZXJyYWluLmhlaWdodE1hcC50b0ZpbGUoKTtcclxuICAgICAgICBjb25zdCBibG9iVXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcclxuICAgICAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhKTtcclxuXHJcbiAgICAgICAgYS5ocmVmICAgICA9IGJsb2JVcmw7XHJcbiAgICAgICAgYS5kb3dubG9hZCA9IGBobV8keyt0aW1lc3RhbXB9JHtoZWlnaHRNYXBFeHR9YDtcclxuICAgICAgICBhLmNsaWNrKCk7XHJcblxyXG4gICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoYmxvYlVybCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZShkdDogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9jb2xvclBhaW50ZXIucGFpbnRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fY29sb3JQYWludGVyLnN0b3BQYWludCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuYXV0b1JlbmRlciAmJlxyXG4gICAgICAgICAgICB0aGlzLmNhbWVyYUVudGl0eSAmJlxyXG4gICAgICAgICAgICB0aGlzLmNhbWVyYUVudGl0eS5jYW1lcmEpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGNhbWVyYSA9IHRoaXMuY2FtZXJhRW50aXR5LmNhbWVyYTtcclxuICAgICAgICAgICAgY29uc3QgbWF0ICAgID0gdGhpcy5lbnRpdHkuZ2V0V29ybGRUcmFuc2Zvcm0oKTtcclxuICAgICAgICAgICAgY29uc3Qgc2NhbGUgID0gbWF0LmdldFNjYWxlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5fbGFzdE1vdXNlTW92ZUV2ZW50KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGhhc0NoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgY2FtZXJhLnNjcmVlblRvV29ybGQodGhpcy5fbGFzdE1vdXNlTW92ZUV2ZW50LngsIHRoaXMuX2xhc3RNb3VzZU1vdmVFdmVudC55LCBjYW1lcmEubmVhckNsaXAsIHRoaXMuX3JheVN0YXJ0KTtcclxuICAgICAgICAgICAgICAgIGNhbWVyYS5zY3JlZW5Ub1dvcmxkKHRoaXMuX2xhc3RNb3VzZU1vdmVFdmVudC54LCB0aGlzLl9sYXN0TW91c2VNb3ZlRXZlbnQueSwgY2FtZXJhLmZhckNsaXAsIHRoaXMuX3JheUVuZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmF5RGlyZWN0aW9uLnN1YjIodGhpcy5fcmF5RW5kLCB0aGlzLl9yYXlTdGFydCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoYW5nZVJheSA9ICF0aGlzLl9yYXkub3JpZ2luLmVxdWFscyh0aGlzLl9yYXlTdGFydCkgfHwgIXRoaXMuX3JheS5kaXJlY3Rpb24uZXF1YWxzKHRoaXMuX3JheURpcmVjdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNoYW5nZVJheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JheS5zZXQodGhpcy5fcmF5U3RhcnQsIHRoaXMuX3JheURpcmVjdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmF5Y2FzdFJlc3VsdC5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2ludGVyc2VjdHNSYXlSZXN1bHQgPSB0aGlzLl9oZWlnaHRGaWVsZFNoYXBlLmludGVyc2VjdHNSYXkobWF0LCB0aGlzLl9yYXksIHRoaXMuX3JheWNhc3RSZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pbnRlcnNlY3RzUmF5UmVzdWx0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJydXNoU2l6ZVggPSB0aGlzLl9icnVzaFNpemUgLyBzY2FsZS54IHwgMDtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBicnVzaFNpemVaID0gdGhpcy5fYnJ1c2hTaXplIC8gc2NhbGUueiB8IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3RlcnJhaW4ucGF0Y2hWZXJ0aWNlcy5nZXRQb3NpdGlvbih0aGlzLl9yYXljYXN0UmVzdWx0LnZlcnRleEluZGV4LCB0ZXJyYWluTG9jYWxWZXJ0ZXhQb3MpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkcmF3UG9pbnQoeyBjZW50ZXI6IHRoaXMuX3JheWNhc3RSZXN1bHQucG9pbnQsIHJhZGl1czogdGhpcy5fYnJ1c2hTaXplLCBudW1TZWdtZW50czogMTAsIGRlcHRoVGVzdDogdHJ1ZSwgY29sb3I6IHBjLkNvbG9yLkdSQVkgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhd0RpcmVjdGlvblZlY3Rvcih0aGlzLl9yYXljYXN0UmVzdWx0LnBvaW50LCB0aGlzLl9yYXljYXN0UmVzdWx0Lm5vcm1hbCwgcGMuQ29sb3IuTUFHRU5UQSk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2xvY2sgPCAxICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwLm1vdXNlPy5pc1ByZXNzZWQocGMuTU9VU0VCVVRUT05fTEVGVCkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhaW50aW5nKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2lkdGggICA9IHRoaXMuX3RlcnJhaW4ud2lkdGggLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVwdGggICA9IHRoaXMuX3RlcnJhaW4uZGVwdGggLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgeCAgICAgICA9IHRlcnJhaW5Mb2NhbFZlcnRleFBvcy54IC8gd2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB5ICAgICAgID0gdGVycmFpbkxvY2FsVmVydGV4UG9zLnogLyBkZXB0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNjYWxlVyAgPSBicnVzaFNpemVYIC8gd2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzY2FsZUggID0gYnJ1c2hTaXplWiAvIGRlcHRoO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NvbG9yUGFpbnRlci5zdGFydFBhaW50KGR0LCB4LCB5LCBzY2FsZVcsIHNjYWxlSCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXZlcmFnZSA9IChicnVzaFNpemVYICsgYnJ1c2hTaXplWikgLyAyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2VudGVyWCA9IHRlcnJhaW5Mb2NhbFZlcnRleFBvcy54IHwgMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNlbnRlclogPSB0ZXJyYWluTG9jYWxWZXJ0ZXhQb3MueiB8IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB6b25lID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pblg6IGNlbnRlclggLSBicnVzaFNpemVYLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFg6IGNlbnRlclggKyBicnVzaFNpemVYICsgMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5aOiBjZW50ZXJaIC0gYnJ1c2hTaXplWixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhaOiBjZW50ZXJaICsgYnJ1c2hTaXplWiArIDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXBwLmtleWJvYXJkPy5pc1ByZXNzZWQocGMuS0VZX0FMVCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl90ZXJyYWluLnNtb290aEhlaWdodHNab25lKHpvbmUsIGF2ZXJhZ2UgKiB0aGlzLl9icnVzaE9wYWNpdHkgKiBkdCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZWdhdGl2ZSA9ICEhdGhpcy5hcHAua2V5Ym9hcmQ/LmlzUHJlc3NlZChwYy5LRVlfQ09OVFJPTCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXBwZW5kVmFsdWUgPSAobmVnYXRpdmUgPyAtYXZlcmFnZSA6IGF2ZXJhZ2UpICogdGhpcy5fYnJ1c2hPcGFjaXR5ICogZHQgLyAxMDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdGVycmFpbi5hcHBlbmRIZWlnaHRNYXAodGhpcy5fYnJ1c2hIZWlnaHRNYXAsIGFwcGVuZFZhbHVlLCB6b25lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl90ZXJyYWluLnJlY2FsY3VsYXRlTWluTWF4KHpvbmUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVuZGVyUHJlcGFyZXIucGF0Y2hlc1N0b3JlLnVwZGF0ZUhlaWdodHMoem9uZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdG1wTWF0LmludmVydChtYXQpO1xyXG4gICAgICAgICAgICB0bXBNYXQudHJhbnNmb3JtUG9pbnQoY2FtZXJhLmVudGl0eS5nZXRQb3NpdGlvbigpLCB0aGlzLl9sb2NhbENhbWVyYVBvc2l0aW9uKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuX2ZydXN0dW0uZnJ1c3R1bSAgID0gY2FtZXJhLmZydXN0dW07XHJcbiAgICAgICAgICAgIHRoaXMuX2ZydXN0dW0udHJhbnNmb3JtID0gbWF0O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fdGVycmFpbi51cGRhdGVMb2RzKHRoaXMuX2xvY2FsQ2FtZXJhUG9zaXRpb24pO1xyXG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJQcmVwYXJlci5yZW5kZXIodGhpcy5fZnJ1c3R1bSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5hcHAua2V5Ym9hcmQ/Lndhc1ByZXNzZWQocGMuS0VZX0wpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RlcnJhaW4ucHJpbnRMb2RNYXAoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmFwcC5rZXlib2FyZD8ud2FzUHJlc3NlZChwYy5LRVlfUCkpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2F2ZUhlaWdodE1hcFRvSW1nKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5hcHAua2V5Ym9hcmQ/Lndhc1ByZXNzZWQocGMuS0VZX08pKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NhdmVIZWlnaHRNYXBUb0ZpbGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gRGVidWdcclxuICAgICAgICAvL3RoaXMuYXBwLmRyYXdUZXh0dXJlKCAwLjUsIC0wLjYsIDAuNSwgMC4zLCB0aGlzLnBhaW50ZXJTZXR0aW5ncy5zcGxhdE1hcC5yZXNvdXJjZSwgdW5kZWZpbmVkIGFzIGFueSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJpZ1RlcnJhaW5FZGl0b3I7XHJcbmV4cG9ydCBjb25zdCBiaWdUZXJyYWluRWRpdG9yU2NyaXB0TmFtZSA9IFwiYmlnVGVycmFpbkVkaXRvclwiO1xyXG5cclxucGMucmVnaXN0ZXJTY3JpcHQoQmlnVGVycmFpbkVkaXRvciwgYmlnVGVycmFpbkVkaXRvclNjcmlwdE5hbWUpO1xyXG5cclxuQmlnVGVycmFpbkVkaXRvci5hdHRyaWJ1dGVzLmFkZChcInJlbmRlck1vZGVcIiwgeyB0eXBlOiBcIm51bWJlclwiLCBlbnVtOiBtYXBUaXRsZUVudW0oUmVuZGVyTW9kZSksIGRlZmF1bHQ6IFJlbmRlck1vZGUuU3RhbmRhcmQgfSk7XHJcbkJpZ1RlcnJhaW5FZGl0b3IuYXR0cmlidXRlcy5hZGQoXCJjYXN0U2hhZG93XCIsIHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHQ6IHRydWUsIH0pO1xyXG5CaWdUZXJyYWluRWRpdG9yLmF0dHJpYnV0ZXMuYWRkKFwicmVjZWl2ZVNoYWRvd1wiLCB7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0OiB0cnVlLCB9KTtcclxuQmlnVGVycmFpbkVkaXRvci5hdHRyaWJ1dGVzLmFkZChcInpGYXJcIiwgeyB0eXBlOiBcIm51bWJlclwiLCBkZWZhdWx0OiA1MDAwLCBtaW46IDEsIHN0ZXA6IDEsIHByZWNpc2lvbjogMCwgfSk7XHJcbkJpZ1RlcnJhaW5FZGl0b3IuYXR0cmlidXRlcy5hZGQoXCJ3aWR0aFwiLCB7IHR5cGU6IFwibnVtYmVyXCIsIGVudW06IHRlcnJhaW5TaXplRW51bSwgZGVmYXVsdDogdGVycmFpblNpemVFbnVtRGVmYXVsdCB9KTtcclxuQmlnVGVycmFpbkVkaXRvci5hdHRyaWJ1dGVzLmFkZChcImRlcHRoXCIsIHsgdHlwZTogXCJudW1iZXJcIiwgZW51bTogdGVycmFpblNpemVFbnVtLCBkZWZhdWx0OiB0ZXJyYWluU2l6ZUVudW1EZWZhdWx0IH0pO1xyXG5CaWdUZXJyYWluRWRpdG9yLmF0dHJpYnV0ZXMuYWRkKFwicGF0Y2hTaXplXCIsIHsgdHlwZTogXCJudW1iZXJcIiwgZW51bTogdGVycmFpblBhdGNoU2l6ZUVudW0sIGRlZmF1bHQ6IHRlcnJhaW5QYXRjaFNpemVFbnVtRGVmYXVsdCB9KTtcclxuQmlnVGVycmFpbkVkaXRvci5hdHRyaWJ1dGVzLmFkZChcImhlaWdodFwiLCB7IHR5cGU6IFwibnVtYmVyXCIsIGRlZmF1bHQ6IDEwLCBtaW46IDEgfSk7XHJcbkJpZ1RlcnJhaW5FZGl0b3IuYXR0cmlidXRlcy5hZGQoXCJjb21wcmVzc0FsZ29yaXRtXCIsIHsgdHlwZTogXCJzdHJpbmdcIiwgZW51bTogdGVycmFpbkhlaWdodHNDb21wcmVzc0FsZ29yaXRtLCBkZWZhdWx0OiB0ZXJyYWluSGVpZ2h0c0NvbXByZXNzQWxnb3JpdG1EZWZhdWx0IH0pO1xyXG5cclxuQmlnVGVycmFpbkVkaXRvci5hdHRyaWJ1dGVzLmFkZChcImxheWVyXCIsIHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdDogJ1RlcnJhaW5FZGl0b3InIH0pO1xyXG5CaWdUZXJyYWluRWRpdG9yLmF0dHJpYnV0ZXMuYWRkKFwiYXV0b1JlbmRlclwiLCB7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0OiB0cnVlIH0pO1xyXG5CaWdUZXJyYWluRWRpdG9yLmF0dHJpYnV0ZXMuYWRkKFwiY2FtZXJhRW50aXR5XCIsIHsgdHlwZTogXCJlbnRpdHlcIiB9KTtcclxuQmlnVGVycmFpbkVkaXRvci5hdHRyaWJ1dGVzLmFkZChcInBhaW50aW5nXCIsIHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHQ6IGZhbHNlIH0pO1xyXG5CaWdUZXJyYWluRWRpdG9yLmF0dHJpYnV0ZXMuYWRkKFwid2lyZWZyYW1lXCIsIHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHQ6IGZhbHNlIH0pO1xyXG5cclxuQmlnVGVycmFpbkVkaXRvci5hdHRyaWJ1dGVzLmFkZChcImhlaWdodE1hcFwiLCB7XHJcbiAgICB0eXBlOiAnanNvbicsXHJcbiAgICBzY2hlbWE6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdmaWxlJyxcclxuICAgICAgICAgICAgdHlwZTogJ2Fzc2V0JyxcclxuICAgICAgICAgICAgYXNzZXRUeXBlOiAnYmluYXJ5JyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogJ3RleHR1cmUnLFxyXG4gICAgICAgICAgICB0eXBlOiBcImFzc2V0XCIsXHJcbiAgICAgICAgICAgIGFzc2V0VHlwZTogJ3RleHR1cmUnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnc21vb3RoRmFjdG9yJyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGBcclxuICAgICAgICAgICAgICAgIFRvIHdoYXQgZXh0ZW50IG5laWdoYm9ycyBpbmZsdWVuY2UgdGhlIG5ldyBoZWlnaHQ6XHJcbiAgICAgICAgICAgICAgICBWYWx1ZSBvZiAwIHdpbGwgaWdub3JlIG5laWdoYm9ycyAobm8gc21vb3RoaW5nKS5cclxuICAgICAgICAgICAgICAgIFZhbHVlIG9mIDEgd2lsbCBpZ25vcmUgdGhlIG5vZGUgb2xkIGhlaWdodC5cclxuICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgdHlwZTogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgZGVmYXVsdDogMSxcclxuICAgICAgICAgICAgbWluOiAwLFxyXG4gICAgICAgICAgICBtYXg6IDEsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdzbW9vdGhSYWRpdXMnLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogYFRoZSByYWRpdXMgb2YgZmFjdG9yIHNtb290aC5gLFxyXG4gICAgICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiAxLFxyXG4gICAgICAgICAgICBzdGVwOiAxLFxyXG4gICAgICAgICAgICBtaW46IDEsXHJcbiAgICAgICAgfVxyXG4gICAgXVxyXG59KTtcclxuXHJcbkJpZ1RlcnJhaW5FZGl0b3IuYXR0cmlidXRlcy5hZGQoXCJicnVzaFwiLCB7XHJcbiAgICB0eXBlOiBcImpzb25cIixcclxuICAgIHNjaGVtYTogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJhY3RpdmVcIixcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIGJydXNoIHRleHR1cmUgaW5kZXguXCIsXHJcbiAgICAgICAgICAgIHR5cGU6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IDAsXHJcbiAgICAgICAgICAgIG1pbjogMCxcclxuICAgICAgICAgICAgc3RlcDogMSxcclxuICAgICAgICAgICAgcHJlY2lzaW9uOiAwLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiBcInNpemVcIixcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIGJydXNoIHNpemVcIixcclxuICAgICAgICAgICAgdHlwZTogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgZGVmYXVsdDogMTAsXHJcbiAgICAgICAgICAgIG1pbjogYnJ1c2hNaW5TaXplLFxyXG4gICAgICAgICAgICBtYXg6IGJydXNoTWF4U2l6ZSxcclxuICAgICAgICAgICAgc3RlcDogMSxcclxuICAgICAgICAgICAgcHJlY2lzaW9uOiAwLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiBcIm9wYWNpdHlcIixcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIGJydXNoIG9wYWNpdHlcIixcclxuICAgICAgICAgICAgdHlwZTogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgZGVmYXVsdDogMC41LFxyXG4gICAgICAgICAgICBtaW46IDAsXHJcbiAgICAgICAgICAgIG1heDogMSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJ0ZXh0dXJlc1wiLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJUaGUgYnJ1c2ggdGV4dHVyZXNcIixcclxuICAgICAgICAgICAgdHlwZTogXCJhc3NldFwiLFxyXG4gICAgICAgICAgICBhc3NldFR5cGU6ICd0ZXh0dXJlJyxcclxuICAgICAgICAgICAgYXJyYXk6IHRydWUsXHJcbiAgICAgICAgfVxyXG4gICAgXVxyXG59KTtcclxuXHJcbkJpZ1RlcnJhaW5FZGl0b3IuYXR0cmlidXRlcy5hZGQoXCJhY3RpdmVMYXllclwiLCB7IHR5cGU6ICdudW1iZXInLCBkZWZhdWx0OiAwLCBtaW46IDAsIG1heDogMzIsIHN0ZXA6IDEsIHByZWNpc2lvbjogMCB9KTtcclxuXHJcbkJpZ1RlcnJhaW5FZGl0b3IuYXR0cmlidXRlcy5hZGQoXCJsYXllcnNcIiwge1xyXG4gICAgdHlwZTogXCJqc29uXCIsXHJcbiAgICBhcnJheTogdHJ1ZSxcclxuICAgIHNjaGVtYTogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJuYW1lXCIsXHJcbiAgICAgICAgICAgIHRpdGxlOiBcIk5hbWVcIixcclxuICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJkaWZmdXNlXCIsXHJcbiAgICAgICAgICAgIHRpdGxlOiBcIkRpZmZ1c2VcIixcclxuICAgICAgICAgICAgdHlwZTogXCJhc3NldFwiLFxyXG4gICAgICAgICAgICBhc3NldFR5cGU6IFwidGV4dHVyZVwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiBcIm5vcm1hbE1hcFwiLFxyXG4gICAgICAgICAgICB0aXRsZTogXCJOb3JtYWwgTWFwXCIsXHJcbiAgICAgICAgICAgIHR5cGU6IFwiYXNzZXRcIixcclxuICAgICAgICAgICAgYXNzZXRUeXBlOiBcInRleHR1cmVcIixcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJzaXplXCIsXHJcbiAgICAgICAgICAgIHRpdGxlOiBcIlNpemVcIixcclxuICAgICAgICAgICAgdHlwZTogXCJ2ZWMyXCIsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IFsxLCAxXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiBcIm9mZnNldFwiLFxyXG4gICAgICAgICAgICB0aXRsZTogXCJPZmZzZXRcIixcclxuICAgICAgICAgICAgdHlwZTogXCJ2ZWMyXCIsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IFswLCAwXVxyXG4gICAgICAgIH0sXHJcbiAgICBdXHJcbn0pO1xyXG5cclxuQmlnVGVycmFpbkVkaXRvci5hdHRyaWJ1dGVzLmFkZChcInBhaW50ZXJTZXR0aW5nc1wiLCB7XHJcbiAgICB0eXBlOiBcImpzb25cIixcclxuICAgIHNjaGVtYTogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJzcGxhdE1hcFwiLFxyXG4gICAgICAgICAgICB0eXBlOiBcImFzc2V0XCIsXHJcbiAgICAgICAgICAgIGFzc2V0VHlwZTogXCJ0ZXh0dXJlXCIsXHJcbiAgICAgICAgICAgIHRpdGxlOiBcIlNwbGF0IE1hcFwiLFxyXG4gICAgICAgIH0sXHJcbiAgICBdXHJcbn0pOyIsImV4cG9ydCBjbGFzcyBGbHlDYW1lcmEgZXh0ZW5kcyBwYy5TY3JpcHRUeXBlIHtcclxuXHJcbiAgICBkZWNsYXJlIHB1YmxpYyByZWFkb25seSBtb2RlOiBudW1iZXI7XHJcbiAgICBkZWNsYXJlIHB1YmxpYyByZWFkb25seSBzcGVlZDogbnVtYmVyO1xyXG4gICAgZGVjbGFyZSBwdWJsaWMgcmVhZG9ubHkgc2xvd1NwZWVkOiBudW1iZXI7XHJcbiAgICBkZWNsYXJlIHB1YmxpYyByZWFkb25seSBmYXN0U3BlZWQ6IG51bWJlcjtcclxuICAgIGRlY2xhcmUgcHVibGljIHJlYWRvbmx5IHNlbnNpdGl2aXR5OiBudW1iZXI7XHJcbiAgICBkZWNsYXJlIHB1YmxpYyByZWFkb25seSBtb2JpbGVDb250cm9sczogcGN4LkVudGl0eSB8IHVuZGVmaW5lZDtcclxuXHJcbiAgICBwcml2YXRlIGV4OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGV5OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIG1vdmVkOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBtaWRkbGVEb3duOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSByaWdodERvd246IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIG1vYmlsZUNvbnRyb2w6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBwdWJsaWMgaW5pdGlhbGl6ZSgpIHtcclxuXHJcbiAgICAgICAgLy8gQ2FtZXJhIGV1bGVyIGFuZ2xlIHJvdGF0aW9uIGFyb3VuZCB4IGFuZCB5IGF4ZXNcclxuICAgICAgICBjb25zdCBldWxlcnMgPSB0aGlzLmVudGl0eS5nZXRMb2NhbEV1bGVyQW5nbGVzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuZXggPSAoZXVsZXJzLnogLSBldWxlcnMueCk7XHJcbiAgICAgICAgdGhpcy5leSA9IChldWxlcnMueiAtIGV1bGVycy55KTtcclxuICAgICAgICB0aGlzLm1vdmVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5yaWdodERvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm1pZGRsZURvd24gPSBmYWxzZTtcclxuICAgIFxyXG4gICAgICAgIC8vIERpc2FibGluZyB0aGUgY29udGV4dCBtZW51IHN0b3BzIHRoZSBicm93c2VyIGRpc3BsYXlpbmcgYSBtZW51IHdoZW5cclxuICAgICAgICAvLyB5b3UgcmlnaHQtY2xpY2sgdGhlIHBhZ2VcclxuICAgICAgICBpZiAodGhpcy5hcHAubW91c2UpIHtcclxuICAgICAgICAgICAgdGhpcy5hcHAubW91c2UuZGlzYWJsZUNvbnRleHRNZW51KCk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLm1vdXNlLm9uKHBjLkVWRU5UX01PVVNFTU9WRSwgdGhpcy5vbk1vdXNlTW92ZSwgdGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLm1vdXNlLm9uKHBjLkVWRU5UX01PVVNFRE9XTiwgdGhpcy5vbk1vdXNlRG93biwgdGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLm1vdXNlLm9uKHBjLkVWRU5UX01PVVNFVVAsICAgdGhpcy5vbk1vdXNlVXAsIHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXBwZW5kKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5leCArPSB4O1xyXG4gICAgICAgIHRoaXMuZXkgKz0geTtcclxuICAgICAgICB0aGlzLmV4ID0gcGMubWF0aC5jbGFtcCh0aGlzLmV4LCAtOTAsIDkwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdHJhbnNsYXRlKHg6IG51bWJlciB8IHBjeC5WZWMzLCB5PzogbnVtYmVyLCB6PzogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNsYXRlTG9jYWwoeCwgeSwgeik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZShkdDogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgY2FtZXJhJ3Mgb3JpZW50YXRpb25cclxuICAgICAgICB0aGlzLmVudGl0eS5zZXRMb2NhbEV1bGVyQW5nbGVzKHRoaXMuZXgsIHRoaXMuZXksIDApO1xyXG4gICAgXHJcbiAgICAgICAgY29uc3QgYXBwID0gdGhpcy5hcHA7XHJcbiAgICBcclxuICAgICAgICBsZXQgc3BlZWQgPSB0aGlzLnNwZWVkO1xyXG4gICAgICAgIGlmIChhcHAua2V5Ym9hcmQ/LmlzUHJlc3NlZChwYy5LRVlfU1BBQ0UpKSB7XHJcbiAgICAgICAgICAgIHNwZWVkID0gdGhpcy5zbG93U3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhcHAua2V5Ym9hcmQ/LmlzUHJlc3NlZChwYy5LRVlfU0hJRlQpKSB7XHJcbiAgICAgICAgICAgIHNwZWVkID0gdGhpcy5mYXN0U3BlZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBKb3lwYWQgY29udHJvbFxyXG4gICAgICAgIGNvbnN0IGpveXN0aWNrTW92ZXIgPSB0b3VjaEpveXBhZD8uc3RpY2tzWydqb3lzdGljazAnXTtcclxuICAgICAgICBjb25zdCBqb3lzdGlja1JvdGVyID0gdG91Y2hKb3lwYWQ/LnN0aWNrc1snam95c3RpY2sxJ107XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQ29udHJvbHMgJiYgdG91Y2hKb3lwYWQ/LmJ1dHRvbnMud2FzUHJlc3NlZCgnYnV0dG9uMicpKSB7XHJcbiAgICAgICAgICAgIHRoaXMubW9iaWxlQ29udHJvbCA9ICF0aGlzLm1vYmlsZUNvbnRyb2w7XHJcbiAgICAgICAgICAgIHRoaXMubW9iaWxlQ29udHJvbHMuZW5hYmxlZCA9IHRoaXMubW9iaWxlQ29udHJvbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChqb3lzdGlja1JvdGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kKGpveXN0aWNrUm90ZXIueSwgLWpveXN0aWNrUm90ZXIueCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoam95c3RpY2tNb3Zlcikge1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zbGF0ZShzcGVlZCAqIGpveXN0aWNrTW92ZXIueCAqIGR0LCAwLCAtc3BlZWQgKiBqb3lzdGlja01vdmVyLnkgKiBkdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBVcGRhdGUgdGhlIGNhbWVyYSdzIHBvc2l0aW9uXHJcbiAgICAgICAgaWYgKGFwcC5rZXlib2FyZD8uaXNQcmVzc2VkKHBjLktFWV9VUCkgfHwgYXBwLmtleWJvYXJkPy5pc1ByZXNzZWQocGMuS0VZX1cpKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNsYXRlKDAsIDAsIC1zcGVlZCAqIGR0KTtcclxuICAgICAgICB9IGVsc2UgaWYgKGFwcC5rZXlib2FyZD8uaXNQcmVzc2VkKHBjLktFWV9ET1dOKSB8fCBhcHAua2V5Ym9hcmQ/LmlzUHJlc3NlZChwYy5LRVlfUykpIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2xhdGUoMCwgMCwgc3BlZWQgKiBkdCk7XHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgaWYgKGFwcC5rZXlib2FyZD8uaXNQcmVzc2VkKHBjLktFWV9MRUZUKSB8fCBhcHAua2V5Ym9hcmQ/LmlzUHJlc3NlZChwYy5LRVlfQSkpIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2xhdGUoLXNwZWVkICogZHQsIDAsIDApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYXBwLmtleWJvYXJkPy5pc1ByZXNzZWQocGMuS0VZX1JJR0hUKSB8fCBhcHAua2V5Ym9hcmQ/LmlzUHJlc3NlZChwYy5LRVlfRCkpIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2xhdGUoc3BlZWQgKiBkdCwgMCwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25Nb3VzZU1vdmUoZXZlbnQ6IHBjeC5Nb3VzZUV2ZW50KSB7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5tb2RlKSB7XHJcbiAgICAgICAgICAgIGlmICghcGMuTW91c2UuaXNQb2ludGVyTG9ja2VkKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMucmlnaHREb3duICYmXHJcbiAgICAgICAgICAgICF0aGlzLm1pZGRsZURvd24pXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgIFxyXG4gICAgXHJcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBjdXJyZW50IEV1bGVyIGFuZ2xlcywgY2xhbXAgdGhlIHBpdGNoLlxyXG4gICAgICAgIGlmICghdGhpcy5tb3ZlZCkge1xyXG4gICAgICAgICAgICAvLyBmaXJzdCBtb3ZlIGV2ZW50IGNhbiBiZSB2ZXJ5IGxhcmdlXHJcbiAgICAgICAgICAgIHRoaXMubW92ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5yaWdodERvd24pIHtcclxuICAgICAgICAgICAgdGhpcy5hcHBlbmQoXHJcbiAgICAgICAgICAgICAgICAtZXZlbnQuZHkgLyB0aGlzLnNlbnNpdGl2aXR5LFxyXG4gICAgICAgICAgICAgICAgLWV2ZW50LmR4IC8gdGhpcy5zZW5zaXRpdml0eVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMubWlkZGxlRG93bikge1xyXG5cclxuICAgICAgICAgICAgbGV0IHNwZWVkID0gdGhpcy5zcGVlZDtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYXBwLmtleWJvYXJkIS5pc1ByZXNzZWQocGMuS0VZX1NISUZUKSkge1xyXG4gICAgICAgICAgICAgICAgc3BlZWQgPSB0aGlzLmZhc3RTcGVlZDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy50cmFuc2xhdGUoLShldmVudC5keCAvIDUpICogc3BlZWQsIChldmVudC5keSAvIDUpICogc3BlZWQsIDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uTW91c2VEb3duKGV2ZW50OiBwY3guTW91c2VFdmVudCkge1xyXG5cclxuICAgICAgICAvLyBXaGVuIHRoZSBtb3VzZSBidXR0b24gaXMgY2xpY2tlZCB0cnkgYW5kIGNhcHR1cmUgdGhlIHBvaW50ZXJcclxuICAgICAgICBpZiAoIXRoaXMubW9kZSAmJiAhcGMuTW91c2UuaXNQb2ludGVyTG9ja2VkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5hcHAubW91c2UhLmVuYWJsZVBvaW50ZXJMb2NrKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uID09PSBwYy5NT1VTRUJVVFRPTl9SSUdIVCkge1xyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0RG93biA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChldmVudC5idXR0b24gPT09IHBjLk1PVVNFQlVUVE9OX01JRERMRSkge1xyXG4gICAgICAgICAgICB0aGlzLm1pZGRsZURvd24gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBvbk1vdXNlVXAoZXZlbnQ6IHBjeC5Nb3VzZUV2ZW50KSB7XHJcblxyXG4gICAgICAgIGlmIChldmVudC5idXR0b24gPT09IHBjLk1PVVNFQlVUVE9OX1JJR0hUKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmlnaHREb3duID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uID09PSBwYy5NT1VTRUJVVFRPTl9NSURETEUpIHtcclxuICAgICAgICAgICAgdGhpcy5taWRkbGVEb3duID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBGbHlDYW1lcmE7XHJcbmV4cG9ydCBjb25zdCBmbHlDYW1lcmFTY3JpcHROYW1lID0gJ2ZseUNhbWVyYSc7XHJcblxyXG5wYy5yZWdpc3RlclNjcmlwdChGbHlDYW1lcmEsIGZseUNhbWVyYVNjcmlwdE5hbWUpO1xyXG5cclxuXHJcbkZseUNhbWVyYS5hdHRyaWJ1dGVzLmFkZCgnbW9iaWxlQ29udHJvbHMnLCB7XHJcbiAgICB0eXBlOiAnZW50aXR5JyxcclxufSk7XHJcblxyXG5GbHlDYW1lcmEuYXR0cmlidXRlcy5hZGQoJ3NwZWVkJywge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0OiAxMFxyXG59KTtcclxuXHJcbkZseUNhbWVyYS5hdHRyaWJ1dGVzLmFkZCgnc2xvd1NwZWVkJywge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0OiAxXHJcbn0pO1xyXG5cclxuRmx5Q2FtZXJhLmF0dHJpYnV0ZXMuYWRkKCdmYXN0U3BlZWQnLCB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlZmF1bHQ6IDIwXHJcbn0pO1xyXG5cclxuRmx5Q2FtZXJhLmF0dHJpYnV0ZXMuYWRkKCdzZW5zaXRpdml0eScsIHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgbWluOiAxLFxyXG4gICAgZGVmYXVsdDogNVxyXG59KTtcclxuXHJcbkZseUNhbWVyYS5hdHRyaWJ1dGVzLmFkZCgnbW9kZScsIHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdDogMCxcclxuICAgIGVudW06IFt7XHJcbiAgICAgICAgXCJMb2NrXCI6IDBcclxuICAgIH0sIHtcclxuICAgICAgICBcIkRyYWdcIjogMVxyXG4gICAgfV1cclxufSk7IiwiY2xhc3MgRnBzQ291bnRlciBleHRlbmRzIHBjLlNjcmlwdFR5cGUge1xyXG5cclxuICAgIGZwczogeyB0aWNrKCk6IHZvaWQgfSB8IHVuZGVmaW5lZDtcclxuXHJcbiAgICBpbml0aWFsaXplKCk6IHZvaWQge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IGNvbnN0ciA9ICh3aW5kb3cgYXMgYW55KS5GUFNNZXRlcjtcclxuXHJcbiAgICAgICAgaWYgKGNvbnN0cikge1xyXG4gICAgICAgICAgICB0aGlzLmZwcyA9IG5ldyBjb25zdHIoe1xyXG4gICAgICAgICAgICAgICAgaGVhdDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGdyYXBoOiB0cnVlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoZHQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZnBzPy50aWNrKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEZwc0NvdW50ZXI7XHJcbmV4cG9ydCBjb25zdCBmcHNDb3VudGVyU2NyaXB0TmFtZSA9ICdGcHNDb3VudGVyJztcclxuXHJcbnBjLnJlZ2lzdGVyU2NyaXB0KEZwc0NvdW50ZXIsIGZwc0NvdW50ZXJTY3JpcHROYW1lKTsiLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBSYW5kb20ge1xyXG5cclxuICAgIHByaXZhdGUgX3RtcDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfdGljazogbnVtYmVyO1xyXG5cclxuICAgIHJlYWRvbmx5IHNlZWQ6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzZWVkOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnNlZWQgPSBzZWVkO1xyXG4gICAgICAgIHRoaXMuX3RtcCAgPSBzZWVkO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0KCkge1xyXG4gICAgICAgIHRoaXMuX3RtcCA9IHRoaXMuc2VlZDtcclxuICAgIH1cclxuXHJcbiAgICBuZXh0KCk6IG51bWJlciB7XHJcbiAgICAgICAgdGhpcy5fdG1wID0gKHRoaXMuX3RtcCAqIDQ4MjcxKSAlIDIxNDc0ODM2NDc7XHJcbiAgICAgICAgdGhpcy5fdGljayA9IHRoaXMuX3RtcCAvIDIxNDc0ODM2NDc7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RpY2s7XHJcbiAgICB9XHJcblxyXG4gICAgbmV4dEZsb2F0KG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubmV4dCgpICogKG1heCAtIG1pbikgKyBtaW47XHJcbiAgICB9XHJcblxyXG4gICAgbmV4dEludChtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5leHRGbG9hdChtaW4sIG1heCkgfCAwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByYW5kb20oKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5uZXh0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgbnJhbmQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5uZXh0RmxvYXQoLTEsIDEpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQm91bmRpbmdCb3ggfSBmcm9tIFwicGxheWNhbnZhc1wiO1xyXG5pbXBvcnQgeyBHcmFzc0ZpZWxkVGV4dHVyZSB9IGZyb20gXCIuLi9HcmFzc0ZpZWxkSGVscGVycy9HcmFzc0ZpZWxkVGV4dHVyZS5tanNcIjtcclxuaW1wb3J0IHsgZHJhd1Bvc1BhcmFtTmFtZSwgZ2V0R3Jhc3NTaGFkZXJDaHVua3MsIG9mZnNldDJYWlBhcmFtTmFtZSwgb2Zmc2V0QXR0ck5hbWUsIG9mZnNldFhaUGFyYW1OYW1lLCBzaGFwZUF0dHJOYW1lLCB0aW1lUGFyYW1OYW1lLCB2aW5kZXhBdHRyTmFtZSwgd2luZEludGVuc2l0eVBhcmFtTmFtZSB9IGZyb20gXCIuLi9HcmFzc0ZpZWxkSGVscGVycy9HcmFzc1NoYWRlckNodW5rLm1qc1wiO1xyXG5pbXBvcnQgeyBkcmF3Qm94IH0gZnJvbSBcIi4uL1NoYXJlZC9EZWJ1Zy5tanNcIjtcclxuaW1wb3J0IFJhbmRvbSBmcm9tIFwiLi4vU2hhcmVkL1JhbmRvbS5tanNcIjtcclxuaW1wb3J0IHsgZ2V0SGVpZ2h0TWFwRm9ybWF0IH0gZnJvbSBcIi4uL1RlcnJhaW5IZWxwZXJzL1RlcnJhaW5QYXRjaGVzLm1qc1wiO1xyXG5pbXBvcnQgeyB0ZXJyYWluSGVpZ2h0TWFwUGFyYW1OYW1lLCB0ZXJyYWluTWF4SGVpZ2h0UGFyYW1OYW1lLCB0ZXJyYWluTWluSGVpZ2h0UGFyYW1OYW1lIH0gZnJvbSBcIi4uL1RlcnJhaW5IZWxwZXJzL1RlcnJhaW5QYXRjaGVzU2hhZGVyQ2h1bmtzLm1qc1wiO1xyXG5pbXBvcnQgQmlnVGVycmFpbkVkaXRvciwgeyBiaWdUZXJyYWluRWRpdG9yU2NyaXB0TmFtZSB9IGZyb20gXCIuL0JpZ1RlcnJhaW5FZGl0b3IubWpzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElCdWZmZXJTdG9yZSB7XHJcblxyXG4gICAgLy8gSW5kaWNlcyBmb3IgYSBibGFkZVxyXG4gICAgaW5kZXg6IFVpbnQxNkFycmF5LFxyXG5cclxuICAgIC8vIFRlbGxzIHRoZSBzaGFkZXIgd2hpY2ggdmVydGV4IG9mIHRoZSBibGFkZSBpdHMgd29ya2luZyBvbi5cclxuICAgIC8vIFJhdGhlciB0aGFuIHN1cHBseWluZyBwb3NpdGlvbnMsIHRoZXkgYXJlIGNvbXB1dGVkIGZyb20gdGhpcyB2aW5kZXguXHJcbiAgICBpbmRleFZlcnRzOiBGbG9hdDMyQXJyYXksXHJcblxyXG4gICAgLy8gU2hhcGUgcHJvcGVydGllcyBvZiBhbGwgYmxhZGVzXHJcbiAgICAvLyBQb3NpdG9uICYgcm90YXRpb24gb2YgYWxsIGJsYWRlc1xyXG4gICAgb2Zmc2V0QW5kU2hhcGU6IEZsb2F0MzJBcnJheSB8IFVpbnQxNkFycmF5LCAvLyB3ZWJncHUgbm90IHN1cHBvcnQgZmxvYXQxNiAoVWludDE2QXJyYXkgPSBGbG9hdDE2QXJyYXkpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBxdWFkMU1hdHJpeCA9IFtcclxuICAgIDIsIDIsXHJcbiAgICAxLCAyLFxyXG4gICAgMCwgMixcclxuICAgIDAsIDEsXHJcbiAgICAwLCAwLFxyXG4gICAgMSwgMCxcclxuICAgIDIsIDAsXHJcbiAgICAyLCAxLFxyXG4gICAgMSwgMVxyXG5dO1xyXG5cclxuZXhwb3J0IGNvbnN0IHF1YWQyTWF0cml4ID0gW1xyXG4gICAgNCwgNCxcclxuICAgIDMsIDQsXHJcbiAgICAyLCA0LFxyXG4gICAgMSwgNCxcclxuICAgIDAsIDQsXHJcbiAgICAwLCAzLFxyXG4gICAgMCwgMixcclxuICAgIDAsIDEsXHJcbiAgICAwLCAwLFxyXG4gICAgMSwgMCxcclxuICAgIDIsIDAsXHJcbiAgICAzLCAwLFxyXG4gICAgNCwgMCxcclxuICAgIDQsIDEsXHJcbiAgICA0LCAyLFxyXG4gICAgNCwgM1xyXG5dO1xyXG5cclxuZXhwb3J0IGNvbnN0IHF1YWRNYXRyaXhJbmRleGVzID0gW1xyXG4gICAgWzQsIDMsIDJdLCAvLyAwXHJcbiAgICBbNSwgOCwgMV0sIC8vIDFcclxuICAgIFs2LCA3LCAwXSwgLy8gMlxyXG5dO1xyXG5cclxuY29uc3QgbG9kMVF1YWRDb3VudCA9IDg7XHJcbmNvbnN0IGxvZDJRdWFkQ291bnQgPSAxNjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUdyYXNzVGV4dHVyZUF0dHJpYnV0ZSB7XHJcbiAgICByZWFkb25seSBuYW1lOiBzdHJpbmcsXHJcbiAgICByZWFkb25seSBkaWZmdXNlOiBwY3guQXNzZXQ7XHJcbiAgICByZWFkb25seSBjb2xvcjogcGN4LkNvbG9yO1xyXG4gICAgcmVhZG9ubHkgY29sb3JSYW5kb206IHBjeC5WZWMzO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR3Jhc3NGaWVsZCBleHRlbmRzIHBjLlNjcmlwdFR5cGUge1xyXG5cclxuICAgIGRlY2xhcmUgcHVibGljIHJlYWRvbmx5IGdyaWRFbnRpdHk6IHBjeC5FbnRpdHk7XHJcbiAgICBkZWNsYXJlIHB1YmxpYyByZWFkb25seSBmcmVlemVEcmF3UG9zOiBib29sZWFuO1xyXG4gICAgZGVjbGFyZSBwdWJsaWMgcmVhZG9ubHkgYXV0b1JlbmRlcjogYm9vbGVhbjtcclxuXHJcbiAgICBkZWNsYXJlIHB1YmxpYyByZWFkb25seSBwYWludGluZzogYm9vbGVhbjtcclxuICAgIGRlY2xhcmUgcHVibGljIHJlYWRvbmx5IHdpcmVmcmFtZTogYm9vbGVhbjtcclxuICAgIGRlY2xhcmUgcHVibGljIHJlYWRvbmx5IGNhc3RTaGFkb3c6IGJvb2xlYW47XHJcbiAgICBkZWNsYXJlIHB1YmxpYyByZWFkb25seSByZWNlaXZlU2hhZG93OiBib29sZWFuO1xyXG4gICAgZGVjbGFyZSBwdWJsaWMgcmVhZG9ubHkgc2VlZDogbnVtYmVyO1xyXG4gICAgZGVjbGFyZSBwdWJsaWMgcmVhZG9ubHkgd2luZEludGVuc2l0eTogbnVtYmVyO1xyXG4gICAgZGVjbGFyZSBwdWJsaWMgcmVhZG9ubHkgbnVtQmxhZGVzOiBudW1iZXI7XHJcbiAgICBkZWNsYXJlIHB1YmxpYyByZWFkb25seSByYWRpdXM6IG51bWJlcjtcclxuICAgIGRlY2xhcmUgcHVibGljIHJlYWRvbmx5IGxvZDBCbGFkZVNlZ3M6IG51bWJlcjtcclxuICAgIGRlY2xhcmUgcHVibGljIHJlYWRvbmx5IGxvZDFCbGFkZVNlZ3M6IG51bWJlcjtcclxuICAgIGRlY2xhcmUgcHVibGljIHJlYWRvbmx5IGxvZDJCbGFkZVNlZ3M6IG51bWJlcjtcclxuICAgIGRlY2xhcmUgcHVibGljIHJlYWRvbmx5IGJsYWRlV2lkdGg6IG51bWJlcjtcclxuICAgIGRlY2xhcmUgcHVibGljIHJlYWRvbmx5IGJsYWRlTWluSGVpZ2h0OiBudW1iZXI7XHJcbiAgICBkZWNsYXJlIHB1YmxpYyByZWFkb25seSBibGFkZU1heEhlaWdodDogbnVtYmVyO1xyXG4gICAgZGVjbGFyZSBwdWJsaWMgcmVhZG9ubHkgdGV4dHVyZXM6IElHcmFzc1RleHR1cmVBdHRyaWJ1dGVbXTtcclxuXHJcbiAgICBwdWJsaWMgdHJhbnNpdGlvbkxvdyA9IDAuMzE7XHJcbiAgICBwdWJsaWMgdHJhbnNpdGlvbkhpZ2ggPSAwLjM2O1xyXG5cclxuICAgIHByaXZhdGUgX3NoYXJlZEluZGV4QnVmZmVyOiBwY3guSW5kZXhCdWZmZXI7XHJcbiAgICBwcml2YXRlIF9zaGFyZWRWZXJ0ZXhCdWZmZXI6IHBjeC5WZXJ0ZXhCdWZmZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBfYnVmZmVyU3RvcmU6IElCdWZmZXJTdG9yZSA9IHt9IGFzIGFueTtcclxuICAgIHByaXZhdGUgX3NoYXJlZEluc3RhbmNpbmdCdWZmZXI6IHBjeC5WZXJ0ZXhCdWZmZXI7XHJcbiAgICBwcml2YXRlIF9tZXNoSW5zdDogcGN4Lk1lc2hJbnN0YW5jZTtcclxuICAgIHByaXZhdGUgX21hdGVyaWFsOiBwY3guU3RhbmRhcmRNYXRlcmlhbDtcclxuXHJcbiAgICBwcml2YXRlIF9kYXRhVGV4dHVyZTogR3Jhc3NGaWVsZFRleHR1cmU7XHJcbiAgICBwcml2YXRlIF90ZXJyYWluRW50aXR5OiBwY3guRW50aXR5O1xyXG4gICAgcHJpdmF0ZSBfY2FtZXJhRW50aXR5OiBwY3guRW50aXR5O1xyXG4gICAgcHJpdmF0ZSBfdGVycmFpbkVkaXRvcjogQmlnVGVycmFpbkVkaXRvcjtcclxuICAgIHByaXZhdGUgX3RpbWU6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIF9sYXN0RHJhd1BvczogcGN4LlZlYzMgPSBuZXcgcGMuVmVjMygpO1xyXG4gICAgcHJpdmF0ZSBfbG9kMU1pbk1heFN0b3JlOiBBcnJheTxbcGN4LlZlYzMsIHBjeC5WZWMzLCBib29sZWFuXT4gPSBbXTtcclxuICAgIHByaXZhdGUgX2xvZDJNaW5NYXhTdG9yZTogQXJyYXk8W3BjeC5WZWMzLCBwY3guVmVjMywgYm9vbGVhbl0+ID0gW107XHJcblxyXG4gICAgcHJpdmF0ZSBfYWFiYjogcGN4LkJvdW5kaW5nQm94O1xyXG5cclxuICAgIHByaXZhdGUgX29mZnNldExvZDFBcnI6IG51bWJlcltdID0gW1xyXG4gICAgICAgIDAsIDAsXHJcbiAgICAgICAgMCwgMCxcclxuICAgICAgICAwLCAwLFxyXG4gICAgICAgIDAsIDAsXHJcbiAgICAgICAgMCwgMCxcclxuICAgICAgICAwLCAwLFxyXG4gICAgICAgIDAsIDAsXHJcbiAgICAgICAgMCwgMCxcclxuICAgIF07XHJcblxyXG4gICAgcHJpdmF0ZSBfb2Zmc2V0TG9kMkFycjogbnVtYmVyW10gPSBbXHJcbiAgICAgICAgMCwgMCxcclxuICAgICAgICAwLCAwLFxyXG4gICAgICAgIDAsIDAsXHJcbiAgICAgICAgMCwgMCxcclxuICAgICAgICAwLCAwLFxyXG4gICAgICAgIDAsIDAsXHJcbiAgICAgICAgMCwgMCxcclxuICAgICAgICAwLCAwLFxyXG4gICAgICAgIDAsIDAsXHJcbiAgICAgICAgMCwgMCxcclxuICAgICAgICAwLCAwLFxyXG4gICAgICAgIDAsIDAsXHJcbiAgICAgICAgMCwgMCxcclxuICAgICAgICAwLCAwLFxyXG4gICAgICAgIDAsIDAsXHJcbiAgICAgICAgMCwgMCxcclxuICAgIF07XHJcblxyXG4gICAgcHVibGljIGdldCBjaGVja1JhZGl1cygpIHsgcmV0dXJuIHRoaXMucmFkaXVzIC8gMjsgfVxyXG4gICAgcHVibGljIGdldCBwYXRjaFJhZGl1cygpIHsgcmV0dXJuIHRoaXMucmFkaXVzIC8gMjsgfVxyXG5cclxuICAgIHB1YmxpYyBkZXN0cm95KCkge1xyXG5cclxuICAgICAgICB0aGlzLl9zaGFyZWRJbmRleEJ1ZmZlcj8uZGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMuX3NoYXJlZFZlcnRleEJ1ZmZlcj8uZGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMuX3NoYXJlZEluc3RhbmNpbmdCdWZmZXI/LmRlc3Ryb3koKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX21lc2hJbnN0KSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9tZXNoSW5zdC5pbnN0YW5jaW5nRGF0YT8udmVydGV4QnVmZmVyPy5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIHRoaXMuX21lc2hJbnN0LmRlc3Ryb3koKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9tZXNoSW5zdC5tZXNoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tZXNoSW5zdC5tZXNoLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuX21hdGVyaWFsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXRlcmlhbC5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmVudGl0eS5yZW5kZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdHkucmVuZGVyLm1lc2hJbnN0YW5jZXMgPSBbXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdEJsYWRlc0FuZEVkaXRNb2RlKCkge1xyXG5cclxuICAgICAgICB0aGlzLl91cGRhdGVHcmFzc01lc2godGhpcy5hcHAuZ3JhcGhpY3NEZXZpY2UsIHRoaXMucGF0Y2hSYWRpdXMpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5wYWludGluZykge1xyXG4gICAgICAgICAgICB0aGlzLl90ZXJyYWluRWRpdG9yLmFkZExvY2soKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBvc3RJbml0aWFsaXplKCk6IHZvaWQge1xyXG5cclxuICAgICAgICBjb25zdCB0ZXJyYWluRW50aXR5ICAgID0gdGhpcy5lbnRpdHkucm9vdC5maW5kQnlOYW1lKCdUZXJyYWluJykgYXMgcGN4LkVudGl0eTtcclxuICAgICAgICBjb25zdCBiaWdUZXJyYWluU2NyaXB0ID0gdGVycmFpbkVudGl0eS5zY3JpcHQ/LmdldChiaWdUZXJyYWluRWRpdG9yU2NyaXB0TmFtZSkgYXMgQmlnVGVycmFpbkVkaXRvcjtcclxuXHJcbiAgICAgICAgdGhpcy5fdGVycmFpbkVkaXRvciA9IGJpZ1RlcnJhaW5TY3JpcHQ7XHJcbiAgICAgICAgdGhpcy5fdGVycmFpbkVudGl0eSA9IHRlcnJhaW5FbnRpdHk7XHJcbiAgICAgICAgdGhpcy5fY2FtZXJhRW50aXR5ICA9IGJpZ1RlcnJhaW5TY3JpcHQuY2FtZXJhRW50aXR5ITtcclxuICAgICAgICB0aGlzLl9kYXRhVGV4dHVyZSAgID0gbmV3IEdyYXNzRmllbGRUZXh0dXJlKHRoaXMuYXBwLmdyYXBoaWNzRGV2aWNlLCB0aGlzLl90ZXJyYWluRWRpdG9yLndpZHRoLCB0aGlzLl90ZXJyYWluRWRpdG9yLmRlcHRoKTtcclxuXHJcbiAgICAgICAgdGhpcy5faW5pdEJsYWRlc0FuZEVkaXRNb2RlKCk7XHJcblxyXG4gICAgICAgIHRoaXMub24oJ2VuYWJsZScsICgpID0+IHRoaXMuX2luaXRCbGFkZXNBbmRFZGl0TW9kZSgpKTtcclxuICAgICAgICB0aGlzLm9uKCdkaXNhYmxlJywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgdGhpcy5fdGVycmFpbkVkaXRvci5mcmVlTG9jaygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm9uKCdhdHRyOnBhaW50aW5nJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYWludGluZykgeyB0aGlzLl90ZXJyYWluRWRpdG9yLmFkZExvY2soKTsgfVxyXG4gICAgICAgICAgICBlbHNlICAgICAgICAgICAgICAgeyB0aGlzLl90ZXJyYWluRWRpdG9yLmZyZWVMb2NrKCk7IH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm9uKCdhdHRyOndpcmVmcmFtZScsICgpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHByaW1pdGl2ZSA9IHRoaXMuX21lc2hJbnN0Py5tZXNoPy5wcmltaXRpdmU7XHJcblxyXG4gICAgICAgICAgICBpZiAocHJpbWl0aXZlICYmIHByaW1pdGl2ZVswXSkge1xyXG4gICAgICAgICAgICAgICAgcHJpbWl0aXZlWzBdLnR5cGUgPSB0aGlzLndpcmVmcmFtZSA/IHBjLlBSSU1JVElWRV9MSU5FUyA6IHBjLlBSSU1JVElWRV9UUklBTkdMRVM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5vbignYXR0cjpjYXN0U2hhZG93JywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9tZXNoSW5zdC5jYXN0U2hhZG93ID0gdGhpcy5jYXN0U2hhZG93O1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm9uKCdhdHRyOnJlY2VpdmVTaGFkb3cnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX21lc2hJbnN0LnJlY2VpdmVTaGFkb3cgPSB0aGlzLnJlY2VpdmVTaGFkb3c7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMub24oJ2F0dHI6c2VlZCcsICAgICAgICAgICAoKSA9PiB0aGlzLl91cGRhdGVNZXNoSW5zdGFuY2luZyh0aGlzLmFwcC5ncmFwaGljc0RldmljZSwgdGhpcy5wYXRjaFJhZGl1cykpO1xyXG4gICAgICAgIHRoaXMub24oJ2F0dHI6bnVtQmxhZGVzJywgICAgICAoKSA9PiB0aGlzLl91cGRhdGVNZXNoSW5zdGFuY2luZyh0aGlzLmFwcC5ncmFwaGljc0RldmljZSwgdGhpcy5wYXRjaFJhZGl1cykpO1xyXG4gICAgICAgIHRoaXMub24oJ2F0dHI6YmxhZGVXaWR0aCcsICAgICAoKSA9PiB0aGlzLl91cGRhdGVNZXNoSW5zdGFuY2luZyh0aGlzLmFwcC5ncmFwaGljc0RldmljZSwgdGhpcy5wYXRjaFJhZGl1cykpO1xyXG4gICAgICAgIHRoaXMub24oJ2F0dHI6YmxhZGVNaW5IZWlnaHQnLCAoKSA9PiB0aGlzLl91cGRhdGVNZXNoSW5zdGFuY2luZyh0aGlzLmFwcC5ncmFwaGljc0RldmljZSwgdGhpcy5wYXRjaFJhZGl1cykpO1xyXG4gICAgICAgIHRoaXMub24oJ2F0dHI6YmxhZGVNYXhIZWlnaHQnLCAoKSA9PiB0aGlzLl91cGRhdGVNZXNoSW5zdGFuY2luZyh0aGlzLmFwcC5ncmFwaGljc0RldmljZSwgdGhpcy5wYXRjaFJhZGl1cykpO1xyXG4gICAgICAgIHRoaXMub24oJ2F0dHI6cmFkaXVzJywgICAgICAgICAoKSA9PiB0aGlzLl91cGRhdGVHcmFzc01lc2godGhpcy5hcHAuZ3JhcGhpY3NEZXZpY2UsIHRoaXMucGF0Y2hSYWRpdXMpKTtcclxuICAgICAgICB0aGlzLm9uKCdhdHRyOmxvZDBCbGFkZVNlZ3MnLCAgKCkgPT4gdGhpcy5fdXBkYXRlR3Jhc3NNZXNoKHRoaXMuYXBwLmdyYXBoaWNzRGV2aWNlLCB0aGlzLnBhdGNoUmFkaXVzKSk7XHJcbiAgICAgICAgdGhpcy5vbignYXR0cjpsb2QxQmxhZGVTZWdzJywgICgpID0+IHRoaXMuX3VwZGF0ZUdyYXNzTWVzaCh0aGlzLmFwcC5ncmFwaGljc0RldmljZSwgdGhpcy5wYXRjaFJhZGl1cykpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGUoZHQ6IG51bWJlcik6IHZvaWQge1xyXG5cclxuICAgICAgICBjb25zdCBjYW1lcmFQb3MgPSB0aGlzLl9jYW1lcmFFbnRpdHkuZ2V0UG9zaXRpb24oKTtcclxuICAgICAgICBjb25zdCBleGlzdHNUZXhzID0gISF0aGlzLnRleHR1cmVzICYmIHRoaXMudGV4dHVyZXMubGVuZ3RoID4gMDtcclxuICAgICAgICBjb25zdCBjb2xvciA9IGV4aXN0c1RleHMgPyB0aGlzLnRleHR1cmVzWzBdLmNvbG9yIDogcGMuQ29sb3IuV0hJVEU7XHJcbiAgICAgICAgY29uc3QgcmFuZCAgPSBleGlzdHNUZXhzID8gdGhpcy50ZXh0dXJlc1swXS5jb2xvclJhbmRvbSA6IHBjLlZlYzMuWkVSTztcclxuICAgICAgICBjb25zdCB0ZXggICA9IGV4aXN0c1RleHMgPyB0aGlzLnRleHR1cmVzWzBdLmRpZmZ1c2UucmVzb3VyY2UgOiBudWxsO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuZnJlZXplRHJhd1Bvcykge1xyXG4gICAgICAgICAgICB0aGlzLl9sYXN0RHJhd1Bvcy5jb3B5KGNhbWVyYVBvcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl90aW1lICs9IGR0O1xyXG4gICAgICAgIHRoaXMuX21hdGVyaWFsLnNldFBhcmFtZXRlcih0aW1lUGFyYW1OYW1lLCB0aGlzLl90aW1lKTtcclxuICAgICAgICB0aGlzLl9tYXRlcmlhbC5zZXRQYXJhbWV0ZXIod2luZEludGVuc2l0eVBhcmFtTmFtZSwgdGhpcy53aW5kSW50ZW5zaXR5KTtcclxuICAgICAgICB0aGlzLl9tYXRlcmlhbC5zZXRQYXJhbWV0ZXIoZHJhd1Bvc1BhcmFtTmFtZSwgW3RoaXMuX2xhc3REcmF3UG9zLngsIHRoaXMuX2xhc3REcmF3UG9zLnksIHRoaXMuX2xhc3REcmF3UG9zLnpdKTtcclxuICAgICAgICB0aGlzLl9tYXRlcmlhbC5zZXRQYXJhbWV0ZXIoJ3VEaWZmdXNlQ29sb3InLCBbY29sb3IuciwgY29sb3IuZywgY29sb3IuYl0pO1xyXG4gICAgICAgIHRoaXMuX21hdGVyaWFsLnNldFBhcmFtZXRlcigndURpZmZ1c2VDb2xvclJhbmRvbScsIFtyYW5kLngsIHJhbmQueSwgcmFuZC56XSk7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwuc2V0UGFyYW1ldGVyKCd1RGlmZnVzZVRleCcsIHRleCBhcyBhbnkpO1xyXG5cclxuICAgICAgICB0aGlzLl9mcnVzdHVtKGNhbWVyYVBvcywgdGhpcy5fY2FtZXJhRW50aXR5IS5jYW1lcmEhLmNhbWVyYSwgdGhpcy5mcmVlemVEcmF3UG9zKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlQWFiYigpIHtcclxuXHJcbiAgICAgICAgY29uc3QgdGVycmFpbiA9IHRoaXMuX3RlcnJhaW5FZGl0b3IudGVycmFpbjtcclxuICAgICAgICBjb25zdCBoYWxmV2lkdGggPSB0ZXJyYWluLndpZHRoIC8gMjtcclxuICAgICAgICBjb25zdCBoYWxmRGVwdGggPSB0ZXJyYWluLmRlcHRoIC8gMjtcclxuXHJcbiAgICAgICAgdGhpcy5fYWFiYiA/Pz0gbmV3IHBjLkJvdW5kaW5nQm94KCk7XHJcbiAgICAgICAgdGhpcy5fYWFiYi5zZXRNaW5NYXgoXHJcbiAgICAgICAgICAgIG5ldyBwYy5WZWMzKC1oYWxmV2lkdGgsIHRlcnJhaW4ubWluSGVpZ2h0LCAtaGFsZkRlcHRoKSxcclxuICAgICAgICAgICAgbmV3IHBjLlZlYzMoK2hhbGZXaWR0aCwgdGVycmFpbi5tYXhIZWlnaHQsICtoYWxmRGVwdGgpXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX21lc2hJbnN0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX21lc2hJbnN0LnNldEN1c3RvbUFhYmIodGhpcy5fYWFiYik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2ZydXN0dW1IZWxwZXIoXHJcbiAgICAgICAgY291bnQ6IG51bWJlcixcclxuICAgICAgICBxdWFkTWF0cml4OiBudW1iZXJbXSxcclxuICAgICAgICBxdWFkT2Zmc2V0OiBudW1iZXIsXHJcbiAgICAgICAgbWluTWF4U3RvcmU6IEFycmF5PFtwY3guVmVjMywgcGN4LlZlYzMsIGJvb2xlYW5dPixcclxuICAgICAgICBvZmZzZXRBcnI6IG51bWJlcltdLFxyXG4gICAgICAgIGludmVyc2U6IGJvb2xlYW4sXHJcbiAgICAgICAgY2FtZXJhUG9zOiBwY3guVmVjMyxcclxuICAgICAgICBjYW1lcmE6IHBjeC5DYW1lcmEsXHJcbiAgICAgICAgZnJlZXplOiBib29sZWFuLFxyXG4gICAgKSB7XHJcbiAgICAgICAgY29uc3QgY2hlY2tSYWRpdXMgPSB0aGlzLmNoZWNrUmFkaXVzO1xyXG4gICAgICAgIGNvbnN0IG1pbkhlaWdodCAgID0gdGhpcy5fdGVycmFpbkVkaXRvci50ZXJyYWluLm1pbkhlaWdodDtcclxuICAgICAgICBjb25zdCBtYXhIZWlnaHQgICA9IHRoaXMuX3RlcnJhaW5FZGl0b3IudGVycmFpbi5tYXhIZWlnaHQ7XHJcbiAgICAgICAgY29uc3QgZnJ1c3R1bVBsYW5lcyA9IGNhbWVyYS5mcnVzdHVtLnBsYW5lcztcclxuICAgICAgICBjb25zdCBjaGVja0lzVmlzaWJsZSA9IChtaW46IHBjeC5WZWMzLCBtYXg6IHBjeC5WZWMzKSA9PiB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IDY7IHArKykge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBjb25zdCBmcnVzdHVtUGxhbmUgPSBmcnVzdHVtUGxhbmVzW3BdIGFzIHVua25vd24gYXMgYW55W107XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkID0gTWF0aC5tYXgobWluLnggKiBmcnVzdHVtUGxhbmVbMF0sIG1heC54ICogZnJ1c3R1bVBsYW5lWzBdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICArIE1hdGgubWF4KG1pbi55ICogZnJ1c3R1bVBsYW5lWzFdLCBtYXgueSAqIGZydXN0dW1QbGFuZVsxXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyBNYXRoLm1heChtaW4ueiAqIGZydXN0dW1QbGFuZVsyXSwgbWF4LnogKiBmcnVzdHVtUGxhbmVbMl0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgZnJ1c3R1bVBsYW5lWzNdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHZpc2libGVDb3VudCA9IDA7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgaWYgKCFtaW5NYXhTdG9yZVtpXSkgbWluTWF4U3RvcmVbaV0gPSBbbmV3IHBjLlZlYzMoKSwgbmV3IHBjLlZlYzMoKSwgZmFsc2VdO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFmcmVlemUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBxdWFkTWF0cml4WCAgPSBxdWFkTWF0cml4W2kgKiAyICsgMF07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBxdWFkTWF0cml4WiAgPSBxdWFkTWF0cml4W2kgKiAyICsgMV07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbENlbnRlclggPSB0aGlzLnJhZGl1cyAqIChxdWFkTWF0cml4WCAtIHF1YWRPZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxDZW50ZXJaID0gdGhpcy5yYWRpdXMgKiAocXVhZE1hdHJpeFogLSBxdWFkT2Zmc2V0KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHdvcmxkQ2VudGVyWCA9IGNhbWVyYVBvcy54ICsgbG9jYWxDZW50ZXJYO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgd29ybGRDZW50ZXJaID0gY2FtZXJhUG9zLnogKyBsb2NhbENlbnRlclo7XHJcblxyXG4gICAgICAgICAgICAgICAgbWluTWF4U3RvcmVbaV1bMF0uc2V0KFxyXG4gICAgICAgICAgICAgICAgICAgIHdvcmxkQ2VudGVyWCAtIGNoZWNrUmFkaXVzLFxyXG4gICAgICAgICAgICAgICAgICAgIG1pbkhlaWdodCxcclxuICAgICAgICAgICAgICAgICAgICB3b3JsZENlbnRlclogLSBjaGVja1JhZGl1c1xyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBtaW5NYXhTdG9yZVtpXVsxXS5zZXQoXHJcbiAgICAgICAgICAgICAgICAgICAgd29ybGRDZW50ZXJYICsgY2hlY2tSYWRpdXMsXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4SGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgIHdvcmxkQ2VudGVyWiArIGNoZWNrUmFkaXVzXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHZpc2libGUgPSBjaGVja0lzVmlzaWJsZShtaW5NYXhTdG9yZVtpXVswXSwgbWluTWF4U3RvcmVbaV1bMV0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh2aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0QXJyW3Zpc2libGVDb3VudCAqIDIgKyAwXSA9IGxvY2FsQ2VudGVyWDtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRBcnJbdmlzaWJsZUNvdW50ICogMiArIDFdID0gbG9jYWxDZW50ZXJaO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIG1pbk1heFN0b3JlW2ldWzJdID0gdmlzaWJsZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgbWluID0gbWluTWF4U3RvcmVbaV1bMF07XHJcbiAgICAgICAgICAgIGNvbnN0IG1heCA9IG1pbk1heFN0b3JlW2ldWzFdO1xyXG4gICAgICAgICAgICBjb25zdCB2aXMgPSBtaW5NYXhTdG9yZVtpXVsyXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChmcmVlemUpIHtcclxuICAgICAgICAgICAgICAgIGRyYXdCb3goeyBtaW4sIG1heCwgY29sb3I6IHZpcyA/IHBjLkNvbG9yLkdSRUVOIDogcGMuQ29sb3IuUkVEIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2aXNpYmxlQ291bnQgKz0gTnVtYmVyKHZpcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWZyZWV6ZSAmJiBpbnZlcnNlICYmIHZpc2libGVDb3VudCA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGhpZGRlbkNvdW50ID0gY291bnQgLSB2aXNpYmxlQ291bnQ7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdmlzaWJsZUNvdW50OyBpID4gLTE7IGktLSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4SW4gPSAoaGlkZGVuQ291bnQgKyBpKSAqIDI7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleE9yID0gaSAqIDI7XHJcblxyXG4gICAgICAgICAgICAgICAgb2Zmc2V0QXJyW2luZGV4SW4gKyAwXSA9IG9mZnNldEFycltpbmRleE9yICsgMF07XHJcbiAgICAgICAgICAgICAgICBvZmZzZXRBcnJbaW5kZXhJbiArIDFdID0gb2Zmc2V0QXJyW2luZGV4T3IgKyAxXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHZpc2libGVDb3VudDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9mcnVzdHVtKGNhbWVyYVBvczogcGN4LlZlYzMsIGNhbWVyYTogcGN4LkNhbWVyYSwgZnJlZXplOiBib29sZWFuKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpc2libGVMb2QxQ291bnQgPSB0aGlzLl9mcnVzdHVtSGVscGVyKGxvZDFRdWFkQ291bnQsIHF1YWQxTWF0cml4LCAxLCB0aGlzLl9sb2QxTWluTWF4U3RvcmUsIHRoaXMuX29mZnNldExvZDFBcnIsIGZhbHNlLCBjYW1lcmFQb3MsIGNhbWVyYSwgZnJlZXplKTtcclxuICAgICAgICBjb25zdCB2aXNpYmxlTG9kMkNvdW50ID0gdGhpcy5fZnJ1c3R1bUhlbHBlcihsb2QyUXVhZENvdW50LCBxdWFkMk1hdHJpeCwgMiwgdGhpcy5fbG9kMk1pbk1heFN0b3JlLCB0aGlzLl9vZmZzZXRMb2QyQXJyLCB0cnVlLCBjYW1lcmFQb3MsIGNhbWVyYSwgZnJlZXplKTtcclxuXHJcbiAgICAgICAgY29uc3QgbWVzaEluc3QgID0gdGhpcy5fbWVzaEluc3Q7XHJcbiAgICAgICAgY29uc3QgbWVzaCAgICAgID0gbWVzaEluc3QubWVzaDtcclxuICAgICAgICBjb25zdCBwcmltaXRpdmUgPSBtZXNoLnByaW1pdGl2ZVswXTtcclxuICAgICAgICBjb25zdCBiYXNlICAgICAgPSB0aGlzLmxvZDJCbGFkZVNlZ3MgKiAxMiAqIChsb2QyUXVhZENvdW50IC0gdmlzaWJsZUxvZDJDb3VudCk7XHJcbiAgICAgICAgY29uc3QgY291bnQgICAgID0gdGhpcy5sb2QwQmxhZGVTZWdzICogMTJcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyB0aGlzLmxvZDFCbGFkZVNlZ3MgKiAxMiAqIHZpc2libGVMb2QxQ291bnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyB0aGlzLmxvZDJCbGFkZVNlZ3MgKiAxMiAqIHZpc2libGVMb2QyQ291bnQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbWVzaEluc3Quc2V0UGFyYW1ldGVyKGAke29mZnNldFhaUGFyYW1OYW1lfVswXWAsIHRoaXMuX29mZnNldExvZDFBcnIpO1xyXG4gICAgICAgIG1lc2hJbnN0LnNldFBhcmFtZXRlcihgJHtvZmZzZXQyWFpQYXJhbU5hbWV9WzBdYCwgdGhpcy5fb2Zmc2V0TG9kMkFycik7XHJcblxyXG4gICAgICAgIC8vIGFsd2F5cyB0cnVlIGZvciBsb2QgMFxyXG4gICAgICAgIG1lc2hJbnN0LnZpc2libGUgPSB0aGlzLmF1dG9SZW5kZXIgfHwgZnJlZXplO1xyXG4gICAgICAgIG1lc2hJbnN0LnZpc2libGVUaGlzRnJhbWUgPSB0aGlzLmF1dG9SZW5kZXIgfHwgZnJlZXplO1xyXG5cclxuICAgICAgICBwcmltaXRpdmUuYmFzZSAgPSBiYXNlO1xyXG4gICAgICAgIHByaW1pdGl2ZS5jb3VudCA9IGNvdW50O1xyXG5cclxuICAgICAgICBpZiAodGhpcy5hcHAua2V5Ym9hcmQ/Lndhc1JlbGVhc2VkKHBjLktFWV9WKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh2aXNpYmxlTG9kMUNvdW50KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codmlzaWJsZUxvZDJDb3VudCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuX29mZnNldExvZDFBcnIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLl9vZmZzZXRMb2QyQXJyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgX3VwZGF0ZUdyYXNzTWVzaChncmFwaGljc0RldmljZTogcGN4LkdyYXBoaWNzRGV2aWNlLCByYWRpdXM6IG51bWJlcikge1xyXG5cclxuICAgICAgICB0aGlzLl91cGRhdGVNZXNoQnVmZmVycyhncmFwaGljc0RldmljZSk7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlTWVzaE1hdGVyaWFsKGdyYXBoaWNzRGV2aWNlKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVNZXNoSW5zdGFuY2UoZ3JhcGhpY3NEZXZpY2UpO1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZU1lc2hJbnN0YW5jaW5nKGdyYXBoaWNzRGV2aWNlLCByYWRpdXMpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlQWFiYigpO1xyXG5cclxuICAgICAgICBjb25zdCBtZXNoSW5zdGFuY2VzID0gW3RoaXMuX21lc2hJbnN0XTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZW50aXR5LnJlbmRlcikge1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0eS5yZW5kZXIubWVzaEluc3RhbmNlcyA9IG1lc2hJbnN0YW5jZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0eS5hZGRDb21wb25lbnQoJ3JlbmRlcicsIHtcclxuICAgICAgICAgICAgICAgIG1lc2hJbnN0YW5jZXM6IG1lc2hJbnN0YW5jZXMsXHJcbiAgICAgICAgICAgICAgICBjYXN0U2hhZG93czogdGhpcy5jYXN0U2hhZG93LFxyXG4gICAgICAgICAgICAgICAgcmVjZWl2ZVNoYWRvd3M6IHRoaXMucmVjZWl2ZVNoYWRvdyxcclxuICAgICAgICAgICAgICAgIGN1bGw6IGZhbHNlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX21lc2hJbnN0LmNhc3RTaGFkb3cgPSB0aGlzLmNhc3RTaGFkb3c7XHJcbiAgICAgICAgdGhpcy5fbWVzaEluc3QucmVjZWl2ZVNoYWRvdyA9IHRoaXMucmVjZWl2ZVNoYWRvdztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF91cGRhdGVNZXNoSW5zdGFuY2luZyhncmFwaGljc0RldmljZTogcGN4LkdyYXBoaWNzRGV2aWNlLCByYWRpdXM6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLl9tZXNoSW5zdCkge1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVJbnN0YW5jaW5nQnVmZmVyKGdyYXBoaWNzRGV2aWNlLCByYWRpdXMpO1xyXG4gICAgICAgICAgICB0aGlzLl9tZXNoSW5zdD8uaW5zdGFuY2luZ0RhdGE/LnZlcnRleEJ1ZmZlcj8uZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9tZXNoSW5zdC5zZXRJbnN0YW5jaW5nKHRoaXMuX3NoYXJlZEluc3RhbmNpbmdCdWZmZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF91cGRhdGVNZXNoSW5zdGFuY2UoZ3JhcGhpY3NEZXZpY2U6IHBjeC5HcmFwaGljc0RldmljZSkge1xyXG5cclxuICAgICAgICB0aGlzLl9tZXNoSW5zdD8uaW5zdGFuY2luZ0RhdGE/LnZlcnRleEJ1ZmZlcj8uZGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMuX21lc2hJbnN0Py5kZXN0cm95KCk7XHJcblxyXG4gICAgICAgIGNvbnN0IG1lc2ggPSBuZXcgcGMuTWVzaChncmFwaGljc0RldmljZSk7XHJcbiAgICAgICAgY29uc3QgcHJpbWl0aXZlID0gbWVzaC5wcmltaXRpdmVbMF07XHJcblxyXG4gICAgICAgIG1lc2guaW5kZXhCdWZmZXJbMF0gPSB0aGlzLl9zaGFyZWRJbmRleEJ1ZmZlcjtcclxuICAgICAgICBtZXNoLnZlcnRleEJ1ZmZlciAgID0gdGhpcy5fc2hhcmVkVmVydGV4QnVmZmVyO1xyXG5cclxuICAgICAgICBwcmltaXRpdmUudHlwZSAgICA9IHRoaXMud2lyZWZyYW1lID8gcGMuUFJJTUlUSVZFX0xJTkVTIDogcGMuUFJJTUlUSVZFX1RSSUFOR0xFUztcclxuICAgICAgICBwcmltaXRpdmUuYmFzZSAgICA9IDA7XHJcbiAgICAgICAgcHJpbWl0aXZlLmNvdW50ICAgPSB0aGlzLl9idWZmZXJTdG9yZS5pbmRleC5sZW5ndGg7XHJcbiAgICAgICAgcHJpbWl0aXZlLmluZGV4ZWQgPSB0cnVlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX21lc2hJbnN0ID0gbmV3IHBjLk1lc2hJbnN0YW5jZShtZXNoLCB0aGlzLl9tYXRlcmlhbCwgdGhpcy5lbnRpdHkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgKiBTZXRzIHVwIGluZGljZXMgZm9yIHNpbmdsZSBibGFkZSBtZXNoLlxyXG4gICAgKiBAcGFyYW0gaWQgYXJyYXkgb2YgaW5kaWNlc1xyXG4gICAgKiBAcGFyYW0gdmMxIHZlcnRleCBzdGFydCBvZmZzZXQgZm9yIGZyb250IHNpZGUgb2YgYmxhZGVcclxuICAgICogQHBhcmFtIHZjMiB2ZXJ0ZXggc3RhcnQgb2Zmc2V0IGZvciBiYWNrIHNpZGUgb2YgYmxhZGVcclxuICAgICogQHBhcmFtIGkgaW5kZXggb2Zmc2V0XHJcbiAgICAqL1xyXG4gICAgcHJpdmF0ZSBfaW5pdEJsYWRlSW5kaWNlcyhpZDogVWludDhBcnJheSB8IFVpbnQxNkFycmF5LCB2YzE6IG51bWJlciwgdmMyOiBudW1iZXIsIGk6IG51bWJlciwgYmxhZGVTZWdzOiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgbGV0IHNlZzogbnVtYmVyO1xyXG5cclxuICAgICAgICAvLyBibGFkZSBmcm9udCBzaWRlXHJcbiAgICAgICAgZm9yIChzZWcgPSAwOyBzZWcgPCBibGFkZVNlZ3M7ICsrc2VnKSB7XHJcbiAgICAgICAgICAgaWRbaSsrXSA9IHZjMSArIDA7IC8vIHRyaSAxXHJcbiAgICAgICAgICAgaWRbaSsrXSA9IHZjMSArIDE7XHJcbiAgICAgICAgICAgaWRbaSsrXSA9IHZjMSArIDI7XHJcbiAgICAgICAgICAgaWRbaSsrXSA9IHZjMSArIDI7IC8vIHRyaSAyXHJcbiAgICAgICAgICAgaWRbaSsrXSA9IHZjMSArIDE7XHJcbiAgICAgICAgICAgaWRbaSsrXSA9IHZjMSArIDM7XHJcbiAgICAgICAgICAgdmMxICs9IDI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBibGFkZSBiYWNrIHNpZGVcclxuICAgICAgICBmb3IgKHNlZyA9IDA7IHNlZyA8IGJsYWRlU2VnczsgKytzZWcpIHtcclxuICAgICAgICAgICBpZFtpKytdID0gdmMyICsgMjsgLy8gdHJpIDFcclxuICAgICAgICAgICBpZFtpKytdID0gdmMyICsgMTtcclxuICAgICAgICAgICBpZFtpKytdID0gdmMyICsgMDtcclxuICAgICAgICAgICBpZFtpKytdID0gdmMyICsgMzsgLy8gdHJpIDJcclxuICAgICAgICAgICBpZFtpKytdID0gdmMyICsgMTtcclxuICAgICAgICAgICBpZFtpKytdID0gdmMyICsgMjtcclxuICAgICAgICAgICB2YzIgKz0gMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFNldCB1cCBpbmRpY2VzIGZvciAxIGJsYWRlICovXHJcbiAgICBwcml2YXRlIF9pbml0QmxhZGVJbmRleFZlcnRzKHZpbmRleDogRmxvYXQzMkFycmF5KSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2aW5kZXgubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgdmluZGV4W2ldID0gaTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdEJsYWRlT2Zmc2V0U2hhcGVWZXJ0cyhvZmZzZXRTaGFwZTogVWludDE2QXJyYXkgfCBGbG9hdDMyQXJyYXksIHJhZGl1czogbnVtYmVyLCBudW1CbGFkZXM6IG51bWJlcikge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZVZhbHVlID0gb2Zmc2V0U2hhcGUgaW5zdGFuY2VvZiBVaW50MTZBcnJheSA/IHBjLkZsb2F0UGFja2luZy5mbG9hdDJIYWxmIDogKHg6IG51bWJlcikgPT4geDtcclxuICAgICAgICBjb25zdCByYW5kb20gPSBuZXcgUmFuZG9tKHRoaXMuc2VlZCk7XHJcbiAgICAgICAgY29uc3QgaGVpZ2h0RmFjdG9yID0gdGhpcy5ibGFkZU1heEhlaWdodCAtIHRoaXMuYmxhZGVNaW5IZWlnaHQ7XHJcblxyXG4gICAgICAgIC8vbGV0IG5vaXNlID0gMDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUJsYWRlczsgKytpKSB7XHJcblxyXG4gICAgICAgICAgICAvL25vaXNlID0gTWF0aC5hYnMoc2ltcGxleChvZmZzZXRTaGFwZVtpICogOCArIDBdICogMC4wMywgb2Zmc2V0U2hhcGVbaSAqIDggKyAyXSAqIDAuMDMpKTtcclxuICAgICAgICAgICAgLy9ub2lzZSA9IG5vaXNlICogbm9pc2UgKiBub2lzZTtcclxuICAgICAgICAgICAgLy9ub2lzZSAqPSA1LjA7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB4ID0gcmFuZG9tLm5yYW5kKCkgKiByYWRpdXM7XHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSByYW5kb20ubnJhbmQoKSAqIHJhZGl1cztcclxuICAgICAgICAgICAgY29uc3QgeiA9IDA7XHJcblxyXG4gICAgICAgICAgICBjb25zdCByb3RhdGlvbiA9IE1hdGguUEkgKiAyLjAgKiByYW5kb20ucmFuZG9tKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHdpZHRoICAgID0gdGhpcy5ibGFkZVdpZHRoICsgcmFuZG9tLnJhbmRvbSgpICogdGhpcy5ibGFkZVdpZHRoICogMC41O1xyXG4gICAgICAgICAgICBjb25zdCBoZWlnaHQgICA9IHRoaXMuYmxhZGVNaW5IZWlnaHQgKyBNYXRoLnBvdyhyYW5kb20ucmFuZG9tKCksIDQuMCkgKiBoZWlnaHRGYWN0b3I7XHJcbiAgICAgICAgICAgIGNvbnN0IGxlYW4gICAgID0gMC4wMSArIHJhbmRvbS5yYW5kb20oKSAqIDAuMztcclxuICAgICAgICAgICAgY29uc3QgY3VydmUgICAgPSAwLjA1ICsgcmFuZG9tLnJhbmRvbSgpICogMC4zO1xyXG5cclxuICAgICAgICAgICAgb2Zmc2V0U2hhcGVbaSAqIDggKyAwXSA9IG5vcm1hbGl6ZVZhbHVlKHgpOyAvLyB4XHJcbiAgICAgICAgICAgIG9mZnNldFNoYXBlW2kgKiA4ICsgMV0gPSBub3JtYWxpemVWYWx1ZSh5KTsgLy8geVxyXG4gICAgICAgICAgICBvZmZzZXRTaGFwZVtpICogOCArIDJdID0gbm9ybWFsaXplVmFsdWUoeik7IC8vIHpcclxuICAgICAgICAgICAgb2Zmc2V0U2hhcGVbaSAqIDggKyAzXSA9IG5vcm1hbGl6ZVZhbHVlKHJvdGF0aW9uKTsgLy8gcm90XHJcblxyXG4gICAgICAgICAgICBvZmZzZXRTaGFwZVtpICogOCArIDRdID0gbm9ybWFsaXplVmFsdWUod2lkdGgpOyAgLy8gd2lkdGhcclxuICAgICAgICAgICAgb2Zmc2V0U2hhcGVbaSAqIDggKyA1XSA9IG5vcm1hbGl6ZVZhbHVlKGhlaWdodCk7IC8vKyBub2lzZTsgLy8rIGhlaWdodFxyXG4gICAgICAgICAgICBvZmZzZXRTaGFwZVtpICogOCArIDZdID0gbm9ybWFsaXplVmFsdWUobGVhbik7ICAgLy8gbGVhblxyXG4gICAgICAgICAgICBvZmZzZXRTaGFwZVtpICogOCArIDddID0gbm9ybWFsaXplVmFsdWUoY3VydmUpOyAgLy8gY3VydmVcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgX3VwZGF0ZUluc3RhbmNpbmdCdWZmZXIoZ3JhcGhpY3NEZXZpY2U6IHBjeC5HcmFwaGljc0RldmljZSwgcmFkaXVzOiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgdGhpcy5fc2hhcmVkSW5zdGFuY2luZ0J1ZmZlcj8uZGVzdHJveSgpO1xyXG5cclxuICAgICAgICBjb25zdCBsb2QwUGF0Y2hDb3VudCA9IDE7XHJcbiAgICAgICAgY29uc3QgbG9kMVBhdGNoQ291bnQgPSA4O1xyXG4gICAgICAgIGNvbnN0IGxvZDJQYXRjaENvdW50ID0gMTY7XHJcbiAgICAgICAgY29uc3QgcGF0Y2hOdW1CbGFkZXMgPSAodGhpcy5udW1CbGFkZXMgLyAobG9kMFBhdGNoQ291bnQgKyBsb2QxUGF0Y2hDb3VudCArIGxvZDJQYXRjaENvdW50KSkgfCAwO1xyXG4gICAgICAgIGNvbnN0IG9mZnNldEFuZFNoYXBlTGVuZ3RoID0gcGF0Y2hOdW1CbGFkZXMgKiA4O1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fYnVmZmVyU3RvcmUub2Zmc2V0QW5kU2hhcGUgPT09IHVuZGVmaW5lZCB8fFxyXG4gICAgICAgICAgICB0aGlzLl9idWZmZXJTdG9yZS5vZmZzZXRBbmRTaGFwZS5sZW5ndGggIT09IG9mZnNldEFuZFNoYXBlTGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2J1ZmZlclN0b3JlLm9mZnNldEFuZFNoYXBlID0gbmV3IEZsb2F0MzJBcnJheShvZmZzZXRBbmRTaGFwZUxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9pbml0QmxhZGVPZmZzZXRTaGFwZVZlcnRzKHRoaXMuX2J1ZmZlclN0b3JlLm9mZnNldEFuZFNoYXBlLCByYWRpdXMsIHBhdGNoTnVtQmxhZGVzKTtcclxuXHJcbiAgICAgICAgY29uc3QgdHlwZSA9IHRoaXMuX2J1ZmZlclN0b3JlLm9mZnNldEFuZFNoYXBlIGluc3RhbmNlb2YgVWludDE2QXJyYXkgPyBwYy5UWVBFX0ZMT0FUMTYgOiBwYy5UWVBFX0ZMT0FUMzI7XHJcbiAgICAgICAgY29uc3QgaW5zdGFuY2luZ0Zvcm1hdCA9IG5ldyBwYy5WZXJ0ZXhGb3JtYXQoZ3JhcGhpY3NEZXZpY2UsIFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc2VtYW50aWM6IHBjLlNFTUFOVElDX0FUVFIxMCxcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IDQsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgICAgICAgICAgbm9ybWFsaXplOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGFzSW50OiBmYWxzZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzZW1hbnRpYzogcGMuU0VNQU5USUNfQVRUUjExLFxyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogNCxcclxuICAgICAgICAgICAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgICAgICAgICAgICBub3JtYWxpemU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXNJbnQ6IGZhbHNlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICB0aGlzLl9zaGFyZWRJbnN0YW5jaW5nQnVmZmVyID0gbmV3IHBjLlZlcnRleEJ1ZmZlcihncmFwaGljc0RldmljZSwgaW5zdGFuY2luZ0Zvcm1hdCwgcGF0Y2hOdW1CbGFkZXMsIHtcclxuICAgICAgICAgICAgdXNhZ2U6IHBjLkJVRkZFUl9TVEFUSUMsXHJcbiAgICAgICAgICAgIGRhdGE6IHRoaXMuX2J1ZmZlclN0b3JlLm9mZnNldEFuZFNoYXBlLFxyXG4gICAgICAgICAgICBzdG9yYWdlOiBmYWxzZSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRWZXJ0ZXhGb3JtYXQoZ3JhcGhpY3NEZXZpY2U6IHBjeC5HcmFwaGljc0RldmljZSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgcGMuVmVydGV4Rm9ybWF0KGdyYXBoaWNzRGV2aWNlLCBbe1xyXG4gICAgICAgICAgICBzZW1hbnRpYzogcGMuU0VNQU5USUNfUE9TSVRJT04sXHJcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IDEsXHJcbiAgICAgICAgICAgIHR5cGU6IHBjLlRZUEVfRkxPQVQzMixcclxuICAgICAgICAgICAgbm9ybWFsaXplOiBmYWxzZSxcclxuICAgICAgICAgICAgYXNJbnQ6IGZhbHNlXHJcbiAgICAgICAgfV0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3VwZGF0ZU1lc2hCdWZmZXJzKGdyYXBoaWNzRGV2aWNlOiBwY3guR3JhcGhpY3NEZXZpY2UpIHtcclxuXHJcbiAgICAgICAgdGhpcy5fc2hhcmVkSW5kZXhCdWZmZXI/LmRlc3Ryb3koKTtcclxuICAgICAgICB0aGlzLl9zaGFyZWRWZXJ0ZXhCdWZmZXI/LmRlc3Ryb3koKTtcclxuXHJcbiAgICAgICAgY29uc3QgbG9kMFZDID0gKHRoaXMubG9kMEJsYWRlU2VncyArIDEpICogMjtcclxuICAgICAgICBjb25zdCBsb2QxVkMgPSAodGhpcy5sb2QxQmxhZGVTZWdzICsgMSkgKiAyO1xyXG4gICAgICAgIGNvbnN0IGxvZDJWQyA9ICh0aGlzLmxvZDJCbGFkZVNlZ3MgKyAxKSAqIDI7XHJcbiAgICAgICAgY29uc3QgaW5kZXhMZW5ndGggPSB0aGlzLmxvZDBCbGFkZVNlZ3MgKiAxMiArIHRoaXMubG9kMUJsYWRlU2VncyAqIDEyICogbG9kMVF1YWRDb3VudCArIHRoaXMubG9kMkJsYWRlU2VncyAqIDEyICogbG9kMlF1YWRDb3VudDtcclxuICAgICAgICBjb25zdCBpbmRleFZlcnRzTGVuZ3RoID0gbG9kMFZDICogMiArIGxvZDFWQyAqIDIgKiBsb2QxUXVhZENvdW50ICsgbG9kMlZDICogMiAqIGxvZDJRdWFkQ291bnQ7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9idWZmZXJTdG9yZS5pbmRleCA9PT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICAgIHRoaXMuX2J1ZmZlclN0b3JlLmluZGV4Lmxlbmd0aCAhPT0gaW5kZXhMZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5fYnVmZmVyU3RvcmUuaW5kZXggPSBuZXcgVWludDE2QXJyYXkoaW5kZXhMZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9kMlF1YWRDb3VudDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9kMlZDMSA9IGkgKiBsb2QyVkMgKiAyO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9kMlZDMiA9IGxvZDJWQzEgKyBsb2QyVkM7XHJcblxyXG4gICAgICAgICAgICAgICAgaW5kZXggPSB0aGlzLl9pbml0QmxhZGVJbmRpY2VzKHRoaXMuX2J1ZmZlclN0b3JlLmluZGV4LCBsb2QyVkMxLCBsb2QyVkMyLCBpbmRleCwgdGhpcy5sb2QyQmxhZGVTZWdzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgbG9kMFZDMSA9IGxvZDJRdWFkQ291bnQgKiBsb2QyVkMgKiAyO1xyXG4gICAgICAgICAgICBjb25zdCBsb2QwVkMyID0gbG9kMFZDMSArIGxvZDBWQztcclxuXHJcbiAgICAgICAgICAgIGluZGV4ID0gdGhpcy5faW5pdEJsYWRlSW5kaWNlcyh0aGlzLl9idWZmZXJTdG9yZS5pbmRleCwgbG9kMFZDMSwgbG9kMFZDMiwgaW5kZXgsIHRoaXMubG9kMEJsYWRlU2Vncyk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvZDFRdWFkQ291bnQ7IGkrKykge1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb2QxVkMxID0gbG9kMFZDMiArIGxvZDBWQyArIGkgKiBsb2QxVkMgKiAyO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9kMVZDMiA9IGxvZDFWQzEgKyBsb2QxVkM7XHJcblxyXG4gICAgICAgICAgICAgICAgaW5kZXggPSB0aGlzLl9pbml0QmxhZGVJbmRpY2VzKHRoaXMuX2J1ZmZlclN0b3JlLmluZGV4LCBsb2QxVkMxLCBsb2QxVkMyLCBpbmRleCwgdGhpcy5sb2QxQmxhZGVTZWdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2J1ZmZlclN0b3JlLmluZGV4VmVydHMgPT09IHVuZGVmaW5lZCB8fFxyXG4gICAgICAgICAgICB0aGlzLl9idWZmZXJTdG9yZS5pbmRleFZlcnRzLmxlbmd0aCAhPT0gaW5kZXhWZXJ0c0xlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLl9idWZmZXJTdG9yZS5pbmRleFZlcnRzID0gbmV3IEZsb2F0MzJBcnJheShpbmRleFZlcnRzTGVuZ3RoKTtcclxuICAgICAgICAgICAgdGhpcy5faW5pdEJsYWRlSW5kZXhWZXJ0cyh0aGlzLl9idWZmZXJTdG9yZS5pbmRleFZlcnRzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX3NoYXJlZEluZGV4QnVmZmVyID0gbmV3IHBjLkluZGV4QnVmZmVyKFxyXG4gICAgICAgICAgICBncmFwaGljc0RldmljZSxcclxuICAgICAgICAgICAgcGMuSU5ERVhGT1JNQVRfVUlOVDE2LFxyXG4gICAgICAgICAgICB0aGlzLl9idWZmZXJTdG9yZS5pbmRleC5sZW5ndGgsXHJcbiAgICAgICAgICAgIHBjLkJVRkZFUl9TVEFUSUMsXHJcbiAgICAgICAgICAgIHRoaXMuX2J1ZmZlclN0b3JlLmluZGV4LFxyXG4gICAgICAgICAgICB7IHN0b3JhZ2U6IGZhbHNlIH1cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLl9zaGFyZWRWZXJ0ZXhCdWZmZXIgPSBuZXcgcGMuVmVydGV4QnVmZmVyKGdyYXBoaWNzRGV2aWNlLCB0aGlzLl9nZXRWZXJ0ZXhGb3JtYXQoZ3JhcGhpY3NEZXZpY2UpLCB0aGlzLl9idWZmZXJTdG9yZS5pbmRleFZlcnRzLmxlbmd0aCwge1xyXG4gICAgICAgICAgICB1c2FnZTogcGMuQlVGRkVSX1NUQVRJQyxcclxuICAgICAgICAgICAgZGF0YTogdGhpcy5fYnVmZmVyU3RvcmUuaW5kZXhWZXJ0cyxcclxuICAgICAgICAgICAgc3RvcmFnZTogZmFsc2UsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfdXBkYXRlTWVzaE1hdGVyaWFsKGdyYXBoaWNzRGV2aWNlOiBwY3guR3JhcGhpY3NEZXZpY2UpIHtcclxuXHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWw/LmRlc3Ryb3koKTtcclxuICAgICAgICB0aGlzLl9tYXRlcmlhbCA9IG5ldyBwYy5TdGFuZGFyZE1hdGVyaWFsKCk7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwubmFtZSA9IFwiR3Jhc3NGaWVsZE1hdGVyaWFsXCI7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwuYmxlbmRUeXBlID0gcGMuQkxFTkRfTk9ORTtcclxuXHJcbiAgICAgICAgY29uc3QgdGVycmFpbiAgID0gdGhpcy5fdGVycmFpbkVkaXRvci50ZXJyYWluO1xyXG4gICAgICAgIGNvbnN0IHBhdGNoZXMgICA9IHRoaXMuX3RlcnJhaW5FZGl0b3IudGVycmFpblJlbmRlclByZXBhcmVyLnBhdGNoZXNTdG9yZTtcclxuICAgICAgICBjb25zdCBoZWlnaHRNYXAgPSBwYXRjaGVzLmhlaWdodE1hcFRleHR1cmU7XHJcblxyXG4gICAgICAgIHRoaXMuX21hdGVyaWFsLnNldEF0dHJpYnV0ZSh2aW5kZXhBdHRyTmFtZSwgcGMuU0VNQU5USUNfUE9TSVRJT04pO1xyXG4gICAgICAgIHRoaXMuX21hdGVyaWFsLnNldEF0dHJpYnV0ZShvZmZzZXRBdHRyTmFtZSwgcGMuU0VNQU5USUNfQVRUUjEwKTtcclxuICAgICAgICB0aGlzLl9tYXRlcmlhbC5zZXRBdHRyaWJ1dGUoc2hhcGVBdHRyTmFtZSwgcGMuU0VNQU5USUNfQVRUUjExKTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwuc2V0UGFyYW1ldGVyKCd1RGF0YU1hcCcsIHRoaXMuX2RhdGFUZXh0dXJlLnRleHR1cmUpO1xyXG4gICAgICAgIHRoaXMuX21hdGVyaWFsLnNldFBhcmFtZXRlcih0ZXJyYWluSGVpZ2h0TWFwUGFyYW1OYW1lLCBoZWlnaHRNYXApO1xyXG4gICAgICAgIHRoaXMuX21hdGVyaWFsLnNldFBhcmFtZXRlcih0ZXJyYWluTWluSGVpZ2h0UGFyYW1OYW1lLCB0ZXJyYWluLm1pbkhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwuc2V0UGFyYW1ldGVyKHRlcnJhaW5NYXhIZWlnaHRQYXJhbU5hbWUsIHRlcnJhaW4ubWF4SGVpZ2h0KTtcclxuICAgICAgICB0aGlzLl9tYXRlcmlhbC5zZXRQYXJhbWV0ZXIoYCR7b2Zmc2V0WFpQYXJhbU5hbWV9WzBdYCwgdGhpcy5fb2Zmc2V0TG9kMUFycik7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwuc2V0UGFyYW1ldGVyKGAke29mZnNldDJYWlBhcmFtTmFtZX1bMF1gLCB0aGlzLl9vZmZzZXRMb2QyQXJyKTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwuc2V0UGFyYW1ldGVyKGRyYXdQb3NQYXJhbU5hbWUsIFswLCAwLCAwXSk7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwuc2V0UGFyYW1ldGVyKHRpbWVQYXJhbU5hbWUsIHRoaXMuX3RpbWUpO1xyXG4gICAgICAgIHRoaXMuX21hdGVyaWFsLnNldFBhcmFtZXRlcih3aW5kSW50ZW5zaXR5UGFyYW1OYW1lLCAwKTtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBobUZvcm1hdCA9IGdldEhlaWdodE1hcEZvcm1hdChncmFwaGljc0RldmljZSwgdGVycmFpbi5oZWlnaHRNYXApO1xyXG4gICAgICAgIGNvbnN0IGNodW5rcyA9IGdldEdyYXNzU2hhZGVyQ2h1bmtzKHtcclxuICAgICAgICAgICAgd2lkdGg6IHRlcnJhaW4ud2lkdGgsXHJcbiAgICAgICAgICAgIGRlcHRoOiB0ZXJyYWluLmRlcHRoLFxyXG4gICAgICAgICAgICBoZWlnaHRNYXBDaHVua1NpemU6IHRlcnJhaW4uaGVpZ2h0TWFwLmRhdGFDaHVua1NpemUsXHJcbiAgICAgICAgICAgIGhlaWdodE1hcEZvcm1hdDogaG1Gb3JtYXQsXHJcbiAgICAgICAgICAgIGJsYWRlTWF4SGVpZ2h0OiB0aGlzLmJsYWRlTWF4SGVpZ2h0ICogMS41LFxyXG4gICAgICAgICAgICBsb2QwQmxhZGVTZWdzOiB0aGlzLmxvZDBCbGFkZVNlZ3MsXHJcbiAgICAgICAgICAgIGxvZDFCbGFkZVNlZ3M6IHRoaXMubG9kMUJsYWRlU2VncyxcclxuICAgICAgICAgICAgbG9kMkJsYWRlU2VnczogdGhpcy5sb2QyQmxhZGVTZWdzLFxyXG4gICAgICAgICAgICByYWRpdXM6IHRoaXMucmFkaXVzLFxyXG4gICAgICAgICAgICB0cmFuc2l0aW9uTG93OiB0aGlzLnRyYW5zaXRpb25Mb3csXHJcbiAgICAgICAgICAgIHRyYW5zaXRpb25IaWdoOiB0aGlzLnRyYW5zaXRpb25IaWdoLFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zdCBjaHVua05hbWVzID0gT2JqZWN0LmtleXMoY2h1bmtzKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgY2h1bmtOYW1lIG9mIGNodW5rTmFtZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5fbWF0ZXJpYWwuY2h1bmtzW2NodW5rTmFtZV0gPSBjaHVua3NbY2h1bmtOYW1lXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX21hdGVyaWFsLmNodW5rcy5BUElWZXJzaW9uID0gcGMuQ0hVTktBUElfMV83MDtcclxuICAgICAgICB0aGlzLl9tYXRlcmlhbC51cGRhdGUoKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgR3Jhc3NGaWVsZDtcclxuZXhwb3J0IGNvbnN0IGdyYXNzRmllbGRTY3JpcHROYW1lID0gXCJncmFzc0ZpZWxkXCI7XHJcblxyXG5wYy5yZWdpc3RlclNjcmlwdChHcmFzc0ZpZWxkLCBncmFzc0ZpZWxkU2NyaXB0TmFtZSk7XHJcblxyXG5HcmFzc0ZpZWxkLmF0dHJpYnV0ZXMuYWRkKFwicGFpbnRpbmdcIiwgeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdDogZmFsc2UgfSk7XHJcbkdyYXNzRmllbGQuYXR0cmlidXRlcy5hZGQoXCJjYXN0U2hhZG93XCIsIHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHQ6IHRydWUsIH0pO1xyXG5HcmFzc0ZpZWxkLmF0dHJpYnV0ZXMuYWRkKFwicmVjZWl2ZVNoYWRvd1wiLCB7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0OiB0cnVlLCB9KTtcclxuR3Jhc3NGaWVsZC5hdHRyaWJ1dGVzLmFkZChcIndpcmVmcmFtZVwiLCB7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0OiBmYWxzZSB9KTtcclxuR3Jhc3NGaWVsZC5hdHRyaWJ1dGVzLmFkZChcImZyZWV6ZURyYXdQb3NcIiwgeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdDogZmFsc2UgfSk7XHJcbkdyYXNzRmllbGQuYXR0cmlidXRlcy5hZGQoXCJhdXRvUmVuZGVyXCIsIHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHQ6IHRydWUgfSk7XHJcbkdyYXNzRmllbGQuYXR0cmlidXRlcy5hZGQoXCJzZWVkXCIsIHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogNTM0NjQ1NDY0NTUsIG1pbjogMSwgc3RlcDogMSwgcHJlY2lzaW9uOiAwIH0pO1xyXG5HcmFzc0ZpZWxkLmF0dHJpYnV0ZXMuYWRkKFwid2luZEludGVuc2l0eVwiLCB7IHR5cGU6IFwibnVtYmVyXCIsIGRlZmF1bHQ6IDAsIG1pbjogLTMwLCBtYXg6IDMwIH0pO1xyXG5HcmFzc0ZpZWxkLmF0dHJpYnV0ZXMuYWRkKFwibnVtQmxhZGVzXCIsIHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogNDAwMCwgbWluOiAwLCBtYXg6IDgwMDAwMDAsIHN0ZXA6IDEsIHByZWNpc2lvbjogMCB9KTtcclxuR3Jhc3NGaWVsZC5hdHRyaWJ1dGVzLmFkZChcInJhZGl1c1wiLCB7IHR5cGU6IFwibnVtYmVyXCIsIGRlZmF1bHQ6IDgwLCBtaW46IDEsIG1heDogMTAwMDAgfSk7XHJcbkdyYXNzRmllbGQuYXR0cmlidXRlcy5hZGQoXCJsb2QwQmxhZGVTZWdzXCIsIHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogMywgbWluOiAxLCBtYXg6IDEwLCBzdGVwOiAxLCBwcmVjaXNpb246IDAgfSk7XHJcbkdyYXNzRmllbGQuYXR0cmlidXRlcy5hZGQoXCJsb2QxQmxhZGVTZWdzXCIsIHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogMiwgbWluOiAxLCBtYXg6IDEwLCBzdGVwOiAxLCBwcmVjaXNpb246IDAgfSk7XHJcbkdyYXNzRmllbGQuYXR0cmlidXRlcy5hZGQoXCJsb2QyQmxhZGVTZWdzXCIsIHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogMSwgbWluOiAxLCBtYXg6IDEwLCBzdGVwOiAxLCBwcmVjaXNpb246IDAgfSk7XHJcbkdyYXNzRmllbGQuYXR0cmlidXRlcy5hZGQoXCJibGFkZVdpZHRoXCIsIHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogMC4wNCwgbWluOiAwLjAxLCBtYXg6IDUgfSk7XHJcbkdyYXNzRmllbGQuYXR0cmlidXRlcy5hZGQoXCJibGFkZU1pbkhlaWdodFwiLCB7IHR5cGU6IFwibnVtYmVyXCIsIGRlZmF1bHQ6IDAuMjUsIG1pbjogMC4wMSwgbWF4OiAxMCB9KTtcclxuR3Jhc3NGaWVsZC5hdHRyaWJ1dGVzLmFkZChcImJsYWRlTWF4SGVpZ2h0XCIsIHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogMSwgbWluOiAwLjAxLCBtYXg6IDEwIH0pO1xyXG5HcmFzc0ZpZWxkLmF0dHJpYnV0ZXMuYWRkKFwidGV4dHVyZXNcIiwge1xyXG4gICAgdHlwZTogXCJqc29uXCIsXHJcbiAgICBhcnJheTogdHJ1ZSxcclxuICAgIHNjaGVtYTogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJuYW1lXCIsXHJcbiAgICAgICAgICAgIHRpdGxlOiBcIk5hbWVcIixcclxuICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJkaWZmdXNlXCIsXHJcbiAgICAgICAgICAgIHRpdGxlOiBcIkRpZmZ1c2VcIixcclxuICAgICAgICAgICAgdHlwZTogXCJhc3NldFwiLFxyXG4gICAgICAgICAgICBhc3NldFR5cGU6IFwidGV4dHVyZVwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiBcImNvbG9yXCIsXHJcbiAgICAgICAgICAgIHRpdGxlOiBcIkNvbG9yXCIsXHJcbiAgICAgICAgICAgIHR5cGU6IFwicmdiXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJjb2xvclJhbmRvbVwiLFxyXG4gICAgICAgICAgICB0aXRsZTogXCJDb2xvciBSYW5kb21cIixcclxuICAgICAgICAgICAgdHlwZTogXCJ2ZWMzXCIsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IFswLjAxLCAwLjAxLCAwLjAxXVxyXG4gICAgICAgIH1cclxuICAgIF1cclxufSk7IiwiaW1wb3J0IHsgZmxvYXQgfSBmcm9tIFwiLi9UeXBlcy5tanNcIjtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBFdWNsaWRlYW4gZGlzdGFuY2UgYmV0d2VlbiB0aGUgdHdvIGdpdmVuIHBvaW50cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3RhbmNlWDFaMVgyWjIoeDE6IGZsb2F0LCB6MTogZmxvYXQsIHgyOiBmbG9hdCwgejI6IGZsb2F0KSB7XG4gICAgY29uc3QgZHggPSB4MSAtIHgyO1xuICAgIGNvbnN0IGR6ID0gejEgLSB6MjtcbiAgICBjb25zdCBscyA9IGR4ICogZHggKyBkeiAqIGR6O1xuICAgIHJldHVybiBNYXRoLnNxcnQobHMpO1xufVxuXG5leHBvcnQgY29uc3QgVmVjdG9yMk1hdGggPSB7XG4gICAgZGlzdGFuY2VYMVoxWDJaMixcbn1cblxuZXhwb3J0IGRlZmF1bHQgVmVjdG9yMk1hdGg7IiwiOygoKSA9PiB7XHJcbiAgICBpZiAod2luZG93Ll9fX2FtZF9fX3JlcXVpcmVSZXNvbHZlcikge1xyXG4gICAgICAgIHdpbmRvdy5fX19hbWRfX19yZXF1aXJlUmVzb2x2ZXIoKTtcclxuICAgIH1cclxufSkoKTsiXX0=