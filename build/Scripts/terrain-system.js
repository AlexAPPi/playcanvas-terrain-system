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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
define("src/EditorSystem/KeyboardHandler", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeyboardHanlder = void 0;
    class KeyboardHanlder {
        init() {
        }
        destroy() {
        }
    }
    exports.KeyboardHanlder = KeyboardHanlder;
    exports.default = KeyboardHanlder;
});
define("src/EditorSystem/MouseHandler", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MouseHandler = void 0;
    class MouseHandler {
        get enter() { return this._enter; }
        constructor() {
            this._enter = false;
            this._onWindowEnter = this._onWindowEnter.bind(this);
            this._onWindowLeave = this._onWindowLeave.bind(this);
        }
        init() {
            document.addEventListener("mouseenter", this._onWindowEnter);
            document.addEventListener("mouseleave", this._onWindowLeave);
        }
        destroy() {
            document.removeEventListener("mouseenter", this._onWindowEnter);
            document.removeEventListener("mouseleave", this._onWindowLeave);
        }
        _onWindowEnter(event) {
            if (event.clientY > 0 || event.clientX > 0 || (event.clientX < window.innerWidth || event.clientY < window.innerHeight)) {
                console.log('Enter');
                this._enter = true;
            }
        }
        _onWindowLeave(event) {
            if (event.clientY <= 0 || event.clientX <= 0 || (event.clientX >= window.innerWidth || event.clientY >= window.innerHeight)) {
                console.log('Leave');
                this._enter = false;
            }
        }
    }
    exports.MouseHandler = MouseHandler;
});
define("src/ScriptHelpers/Brush", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("src/ScriptHelpers/ColorPainterShaders", ["require", "exports"], function (require, exports) {
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
define("src/ScriptHelpers/Shared", ["require", "exports"], function (require, exports) {
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
define("src/ScriptHelpers/ColorPainter", ["require", "exports", "src/ScriptHelpers/ColorPainterShaders", "src/ScriptHelpers/Shared"], function (require, exports, ColorPainterShaders_mjs_1, Shared_mjs_1) {
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
define("src/ScriptHelpers/EnumConverter", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isNumeric = isNumeric;
    exports.mapEnum = mapEnum;
    function isNumeric(value) {
        return /^-?\d+$/.test(value);
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
define("src/ScriptHelpers/Enum", ["require", "exports", "src/ScriptHelpers/EnumConverter"], function (require, exports, EnumConverter_mjs_1) {
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
define("src/Shared/Types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("src/TerrainSystem/AbsHeightMapFileIO", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbsHeightMapFileIO = exports.factorSize = exports.heightMapVersion = void 0;
    exports.heightMapVersion = 99;
    exports.factorSize = 3;
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
                const view = new DataView(buffer);
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
                return buffer;
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
            const chunkX = Math.ceil(x / this._dataChunkSize) - (localX > 0 ? 1 : 0);
            const chunkZ = Math.ceil(z / this._dataChunkSize) - (localZ > 0 ? 1 : 0);
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
            const patchX = Math.ceil(x / this._patchSize) - (x % this._patchSize > 0 ? 1 : 0);
            const patchZ = Math.ceil(z / this._patchSize) - (z % this._patchSize > 0 ? 1 : 0);
            return this.getPatchMin(patchX, patchZ);
        }
        getEntriesPatchMax(x, z) {
            const patchX = Math.ceil(x / this._patchSize) - (x % this._patchSize > 0 ? 1 : 0);
            const patchZ = Math.ceil(z / this._patchSize) - (z % this._patchSize > 0 ? 1 : 0);
            return this.getPatchMax(patchX, patchZ);
        }
        getEntriesPatchMinFactor(x, z) {
            const patchX = Math.ceil(x / this._patchSize) - (x % this._patchSize > 0 ? 1 : 0);
            const patchZ = Math.ceil(z / this._patchSize) - (z % this._patchSize > 0 ? 1 : 0);
            return this.getPatchMinFactor(patchX, patchZ);
        }
        getEntriesPatchMaxFactor(x, z) {
            const patchX = Math.ceil(x / this._patchSize) - (x % this._patchSize > 0 ? 1 : 0);
            const patchZ = Math.ceil(z / this._patchSize) - (z % this._patchSize > 0 ? 1 : 0);
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
                    const patchX = Math.ceil(x / this._patchSize) - (x % this._patchSize > 0 ? 1 : 0);
                    const patchZ = Math.ceil(z / this._patchSize) - (z % this._patchSize > 0 ? 1 : 0);
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
define("src/Shared/Utils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getText = getText;
    exports.randomFloat = randomFloat;
    exports.randomFloatRange = randomFloatRange;
    exports.calcNextPowerOfTwo = calcNextPowerOfTwo;
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
            for (let patchZ = 0; patchZ < this.numPatchesZ; patchZ++) {
                for (let patchX = 0; patchX < this.numPatchesX; patchX++) {
                    const minX = patchX * (this.patchSize - 1);
                    const minZ = patchZ * (this.patchSize - 1);
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
define("src/ScriptHelpers/Frustum", ["require", "exports"], function (require, exports) {
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
            // @ts-ignore
            tmpSphere.center = tmpVec;
            tmpSphere.radius = tmpRad.distance(pc.Vec3.ZERO) * this._margin;
            return this._frustum.containsSphere(tmpSphere) > 0;
        }
    }
    exports.Frustum = Frustum;
});
define("src/ScriptHelpers/GrassShaderChunks", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildMatrix = exports.grassShaderChunks = exports.diffusePS = exports.normalVS = exports.transformVS = exports.instancingVS = exports.baseVS = void 0;
    exports.baseVS = `
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
    exports.instancingVS = `
    attribute vec4 instance_line1;
    attribute vec4 instance_line2;
    attribute vec4 instance_line3;
    attribute vec4 instance_line4;
`;
    exports.transformVS = `
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
    exports.normalVS = `
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
    exports.diffusePS = `
    uniform vec3 ground_color;

    void getAlbedo()
    {
        dAlbedo = ground_color;
    }
`;
    exports.grassShaderChunks = {
        // Vertex
        baseVS: exports.baseVS,
        //transformDeclVS,
        transformVS: exports.transformVS,
        normalVS: exports.normalVS,
        //uv0VS,
        //startVS,
        // Fragment
        diffusePS: exports.diffusePS,
    };
    exports.buildMatrix = `

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
            const arr = [];
            for (let l = 0; l < LodInfo_mjs_2.LEFT; l++) {
                arr[l] = [];
                for (let r = 0; r < LodInfo_mjs_2.RIGHT; r++) {
                    arr[l][r] = [];
                    for (let t = 0; t < LodInfo_mjs_2.TOP; t++) {
                        arr[l][r][t] = [];
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
                            const obejct = objectBuilder ? objectBuilder(lod, info, data, patchCount) : null;
                            arr[l][r][t][b] = {
                                vertexBaseIndex: info.start,
                                vertexCount: info.count,
                                count: 0,
                                data: data,
                                object: obejct,
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
            if (single.data[prevIndex * exports.instDataSize + 0] !== x ||
                single.data[prevIndex * exports.instDataSize + 1] !== z) {
                single.data[prevIndex * exports.instDataSize + 0] = x;
                single.data[prevIndex * exports.instDataSize + 1] = z;
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
define("src/ScriptHelpers/TerrainPatchesInstancing", ["require", "exports", "src/TerrainSystem/LodInfo", "src/TerrainSystem/PatchInstancing"], function (require, exports, LodInfo_mjs_3, PatchInstancing_mjs_1) {
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
                                        const length = chunk.count * 2;
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
            }
        }
    }
    exports.TerrainPathcesInstancing = TerrainPathcesInstancing;
});
define("src/ScriptHelpers/TerrainPatchesBasic", ["require", "exports", "src/ScriptHelpers/TerrainPatchesInstancing"], function (require, exports, TerrainPatchesInstancing_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerrainPatchBufferBasic = void 0;
    class TerrainPatchBufferBasic {
        constructor(index, minX, minZ, size) {
            this.minX = minX;
            this.minZ = minZ;
            this.size = size;
            this.index = index;
            this.hash = 0;
        }
    }
    exports.TerrainPatchBufferBasic = TerrainPatchBufferBasic;
    class TerrainPatchesBasic {
        get bufferArray() { return this._bufferArray; }
        get meshInstanceArray() { return this._meshInstanceArray; }
        get aabb() { return this._aabb; }
        constructor(terrain) {
            this.terrain = terrain;
            this.instancing = new TerrainPatchesInstancing_mjs_1.TerrainPathcesInstancing();
            this._prevInstancing = false;
            this._bufferArray = new Array(this.terrain.numPatchesX * this.terrain.numPatchesZ);
            this._meshInstanceArray = new Array(this.terrain.numPatchesX * this.terrain.numPatchesZ);
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
            for (const meshInstance of this._meshInstanceArray) {
                if (meshInstance) {
                    meshInstance.aabb = this._aabb;
                }
            }
            if (this.instancing.enabled) {
                this.instancing.forEach(item => {
                    if (item.object) {
                        item.object.aabb = this._aabb;
                    }
                });
            }
        }
        startRender() {
        }
        _forceUpdateRenderComponent(entity) {
            // if instancing was used, then we delete all previous instances
            let append = !this._prevInstancing;
            const count = this.instancing.enabled ? this.instancing.meshInstanceCount : this._patchAvalableCount;
            const meshInstances = new Array(count);
            if (this.instancing.enabled) {
                this.instancing.appendMeshInstances(meshInstances);
                append = false; // always destroy prev meshInstances
            }
            else {
                let i = 0;
                for (let patchIndex = 0; patchIndex < this._meshInstanceArray.length; patchIndex++) {
                    const patchMeshInstance = this._meshInstanceArray[patchIndex];
                    if (patchMeshInstance) {
                        meshInstances[i++] = patchMeshInstance;
                    }
                }
                this._changesIds.length = 0;
            }
            this._prevInstancing = this.instancing.enabled;
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
            if (!entity.enabled || this.instancing.enabled || this._changesIds.length === 0) {
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
            const minPatchX = Math.ceil(minX / this.terrain.patchSize) - (minX % this.terrain.patchSize > 0 ? 1 : 0);
            const minPatchZ = Math.ceil(minZ / this.terrain.patchSize) - (minZ % this.terrain.patchSize > 0 ? 1 : 0);
            const maxPatchX = Math.ceil(maxX / this.terrain.patchSize) - (maxX % this.terrain.patchSize > 0 ? 1 : 0);
            const maxPatchZ = Math.ceil(maxZ / this.terrain.patchSize) - (maxZ % this.terrain.patchSize > 0 ? 1 : 0);
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
        createOrGetPatchMesh(patchIndex) {
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
            this.instancing.destroy((mesh) => {
                this._destroyInstancingMesh(mesh);
            });
            if (this.instancing.enabled) {
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
define("src/ScriptHelpers/TerrainPatchesShaderChunks", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.chunks = exports.diffusePS = exports.maxLayersCount = exports.startVS = exports.normalVS = exports.normalCoreVS = exports.normalByHeightMapVS = exports.startUv0VS = exports.uv0VS = exports.transformVS = exports.transformDeclVS = exports.transformInstancingVS = exports.instancingVS = exports.terrainHeightChunkVS = exports.terrainHeightFactorChunkVS = exports.terrainChunkUVVS = exports.terrainHeightFactorRGBA8X4VS = exports.terrainHeightFactorRGBA8X2VS = exports.terrainHeightFactorRGBA8VS = exports.terrainHeightFactorR32FVS = exports.terrainHeightFactorRGB8VS = exports.terrainCoordsChunkVS = exports.currentTerrainXZChunkVS = exports.currentTerrainXZForInstancingChunkVS = exports.baseClearVS = exports.baseForInstancingVS = exports.baseOriginalVS = exports.littleEndianValue = exports.littleEndian = exports.terrainPatchSizeParamName = exports.terrainSplatMapParamName = exports.terrainMaxHeightParamName = exports.terrainMinHeightParamName = exports.terrainSizeParamName = exports.terrainHeightMapChunkSizeParamName = exports.terrainHeightMapParamName = exports.lodCoreParamName = exports.baseVertexParamName = exports.useBaseVertexParamName = exports.patchCoordOffsetParamName = exports.patchInstCoordOffsetParamName = exports.vertexNormalAttrName = exports.vertexHeightAttrName = exports.vertexCoordAttrName = void 0;
    exports.getTerrainHeightFactorVS = getTerrainHeightFactorVS;
    exports.getTerrainShaderChunks = getTerrainShaderChunks;
    exports.vertexCoordAttrName = "vertex_position";
    exports.vertexHeightAttrName = "vertex_height";
    exports.vertexNormalAttrName = "vertex_normal";
    exports.patchInstCoordOffsetParamName = "vertex_postion_offset";
    exports.patchCoordOffsetParamName = "uTerrainPatchCoordOffset";
    exports.useBaseVertexParamName = "uTerrainUseBaseVertex";
    exports.baseVertexParamName = "uTerrainPatchBaseVertex";
    exports.lodCoreParamName = "uTerrainPatchLodCore";
    exports.terrainHeightMapParamName = "uTerrainHeightMap";
    exports.terrainHeightMapChunkSizeParamName = "uTerrainHeightMapChunkSize";
    exports.terrainSizeParamName = "uTerrainSize";
    exports.terrainMinHeightParamName = "uTerrainMinHeight";
    exports.terrainMaxHeightParamName = "uTerrainMaxHeight";
    exports.terrainSplatMapParamName = "uTerrainSplatMap";
    exports.terrainPatchSizeParamName = "uTerrainPatchSize";
    exports.littleEndian = (() => {
        const uint8Array = new Uint8Array([0xAA, 0xBB]);
        const uint16array = new Uint16Array(uint8Array.buffer);
        return uint16array[0] === 0xBBAA;
    })();
    exports.littleEndianValue = exports.littleEndian ? 'true' : 'false';
    exports.baseOriginalVS = `
    attribute uvec2 ${exports.vertexCoordAttrName};
`;
    exports.baseForInstancingVS = `
    attribute uvec2 ${exports.vertexCoordAttrName};
    attribute uvec2 ${exports.patchInstCoordOffsetParamName};
`;
    exports.baseClearVS = `
    // #define #baseOriginalVS [OR] #baseForInstancingVS

    uniform mat4 matrix_viewProjection;
    uniform mat4 matrix_model;
    uniform mat3 matrix_normal;

    uniform vec2 ${exports.terrainSizeParamName};
    uniform vec2 ${exports.patchCoordOffsetParamName};
    
    uniform float ${exports.lodCoreParamName};

    uniform mediump sampler2DArray ${exports.terrainHeightMapParamName};
    uniform float ${exports.terrainHeightMapChunkSizeParamName};

    uniform float ${exports.terrainMinHeightParamName};
    uniform float ${exports.terrainMaxHeightParamName};

    float dNumChunksX;
    vec3 dPositionW;
    mat4 dModelMatrix;
    mat3 dNormalMatrix;
    vec2 dCurrentTerrainXZ;
    float dCurrentHeight;
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
        vec2 uv = (xz + 0.5) / ${exports.terrainSizeParamName};
        return uv;
    }

    vec2 clampTerrainXZ(vec2 xz) {
        return vec2(
            clamp(xz[0], 0.0, ${exports.terrainSizeParamName}[0]),
            clamp(xz[1], 0.0, ${exports.terrainSizeParamName}[1])
        );
    }

    vec2 getTerrainXZ(ivec2 offset) {
        return dCurrentTerrainXZ + vec2(offset);
    }
`;
    // Not support for webgpu
    exports.terrainHeightFactorRGB8VS = `
    float rgb8ToFloat(vec3 v) {
        uvec3 uints = uvec3(v * 255.0);
        uint scaled = (uints.r << 16) | (uints.g << 8) | uints.b;
        return float(scaled) / 16777215.0;
    }

    float getTerrainHeightFactorFromTexture(vec3 uv) {
        vec3 rgb = texture(${exports.terrainHeightMapParamName}, uv);
        return rgb8ToFloat(rgb);
    }
`;
    exports.terrainHeightFactorR32FVS = `
    float getTerrainHeightFactorFromTexture(vec3 uv) {
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
    
    float getTerrainHeightFactorFromTexture(vec3 uv) {
        vec4 rgba = texture(${exports.terrainHeightMapParamName}, uv);
        return rgba8ToFloat(rgba);
    }
`;
    // TODO: check littleEndian
    // Compress height by x coord [patch0, patch1] ...
    // see: CompressedPatchedHeightMap file
    exports.terrainHeightFactorRGBA8X2VS = `
    float getTerrainHeightFactorFromTexture(vec3 uv) {
        int level  = int(uv.b);
        int newLevel = level / 2;
        int chunkX = level % int(dNumChunksX);
        int shift  = chunkX % 2;
        vec4 rgba = texture(${exports.terrainHeightMapParamName}, vec3(uv.rg, newLevel));
        vec2 rg = ((shift == 0) ? rgba.rg : rgba.ba) * 255.0;
        return float((uint(rg.g) << 8) | uint(rg.r)) / 65535.0;
    }
`;
    exports.terrainHeightFactorRGBA8X4VS = `
    float getTerrainHeightFactorFromTexture(vec3 uv) {
        int level    = int(uv.b);
        int newLevel = level / 4;
        int chunkX   = level % int(dNumChunksX);
        int shift    = chunkX % 4;
        vec4 rgba    = texture(${exports.terrainHeightMapParamName}, vec3(uv.rg, newLevel));
        return rgba[shift];
    }
`;
    exports.terrainChunkUVVS = `
    // #define #terrainCoordsChunkVS

    vec3 getTerrainChunkUV(ivec2 offset) {

        vec2 xz = clampTerrainXZ(getTerrainXZ(offset));

        int chunkSize = int(${exports.terrainHeightMapChunkSizeParamName});
        
        int localX    = int(xz.r) % chunkSize;
        int localZ    = int(xz.g) % chunkSize;

        float chunkX  = ceil(xz.r / ${exports.terrainHeightMapChunkSizeParamName}) - (localX > 0 ? 1.0 : 0.0);
        float chunkZ  = ceil(xz.g / ${exports.terrainHeightMapChunkSizeParamName}) - (localZ > 0 ? 1.0 : 0.0);

        float level       = chunkZ * dNumChunksX + chunkX;
        vec2  patchTexPos = vec2(localX, localZ) + 0.5;

        return vec3(patchTexPos / ${exports.terrainHeightMapChunkSizeParamName}, level);
    }
`;
    exports.terrainHeightFactorChunkVS = `
    // #define #terrainHeightFactorRGBA8VS [OR] #terrainHeightFactorRGB8VS
    // #define #terrainChunkUVVS

    float getTerrainHeightFactor(ivec2 offset) {
        vec3 uv = getTerrainChunkUV(offset);
        return getTerrainHeightFactorFromTexture(uv);
    }
`;
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
    
        dModelMatrix      = getModelMatrix();
        dCurrentTerrainXZ = getCurrentTerrainXZ();
        dCurrentHeight    = getCurrentTerrainHeight();

        vec2 globXZ   = -${exports.terrainSizeParamName} / 2.0 + dCurrentTerrainXZ;
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
    exports.uv0VS = `
`;
    // bug with getUv0
    exports.startUv0VS = `    
    vec2 getUv0() {
        return getCurrentTerrainUvCoord();
    }
`;
    exports.normalByHeightMapVS = `
    vec3 getTerrainNormal() {

        float step = pow(2.0, ${exports.lodCoreParamName} + 1.0) / 2.0;

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
        vec3 localNormal = vec3(0.0, 1.0, 0.0);
        return localNormal;
    }

    mat3 getNormalMatrix(mat4 modelMatrix) {
        return matrix_normal;
    }
`;
    exports.normalVS = `
    // #define #normalByHeightMapVS

    vec3 getNormal() {
    
        dNormalMatrix = matrix_normal;

        vec3 tempNormal = getTerrainNormal();

        return normalize(dNormalMatrix * tempNormal);
    }
`;
    exports.startVS = `
    ${exports.startUv0VS}

    varying vec2 vUvCoord;
    varying vec2 vGridPosition;

    void main(void) {

        dNumChunksX = (${exports.terrainSizeParamName}.r - 1.0) / (${exports.terrainHeightMapChunkSizeParamName} - 1.0);

        gl_Position   = getPosition();
        vGridPosition = dCurrentTerrainXZ;
        vUvCoord      = getCurrentTerrainUvCoord();
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

    void getAlbedo() {

        vec3 albedo = vec3(0.0);
        vec4 splat  = pow(texture2D(${exports.terrainSplatMapParamName}, vUvCoord), vec4(2.2));
        int count   = int(uTerrainLayersCount);

        for (int i = 0; i < ${exports.maxLayersCount}; ++i) {

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
    exports.chunks = {
        currentTerrainXZForInstancingChunkVS: exports.currentTerrainXZForInstancingChunkVS,
        currentTerrainXZChunkVS: exports.currentTerrainXZChunkVS,
        terrainHeightFactorR32FVS: exports.terrainHeightFactorR32FVS,
        terrainHeightFactorRGBA8VS: exports.terrainHeightFactorRGBA8VS,
        terrainHeightFactorRGB8VS: exports.terrainHeightFactorRGB8VS,
        terrainHeightFactorRGBA8X2VS: exports.terrainHeightFactorRGBA8X2VS,
        terrainHeightFactorRGBA8X4VS: exports.terrainHeightFactorRGBA8X4VS,
        terrainHeightFactorChunkVS: exports.terrainHeightFactorChunkVS,
        terrainHeightChunkVS: exports.terrainHeightChunkVS,
        terrainCoordsChunkVS: exports.terrainCoordsChunkVS,
        terrainChunkUVVS: exports.terrainChunkUVVS,
        normalByHeightMapVS: exports.normalByHeightMapVS,
        // Vertex
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
        diffusePS: exports.diffusePS,
    };
    function getTerrainHeightFactorVS(format, chunksStore = exports.chunks) {
        switch (format) {
            case 'r32f': return chunksStore.terrainHeightFactorR32FVS;
            case 'rgba': return chunksStore.terrainHeightFactorRGBA8VS;
            case 'rgb': return chunksStore.terrainHeightFactorRGB8VS;
            case 'rgbaX2': return chunksStore.terrainHeightFactorRGBA8X2VS;
            case 'rgbaX4': return chunksStore.terrainHeightFactorRGBA8X4VS;
            default: break;
        }
        throw new Error('Format not supported');
    }
    function getTerrainShaderChunks({ instancing, heightMapFormat, chunksStore = exports.chunks }) {
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
            const chunkX = Math.ceil(x / this.dataChunkSize) - (localX > 0 ? 1 : 0);
            const chunkZ = Math.ceil(z / this.dataChunkSize) - (localZ > 0 ? 1 : 0);
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
define("src/ScriptHelpers/TerrainPatches", ["require", "exports", "src/TerrainSystem/CoordsBuffer", "src/ScriptHelpers/TerrainPatchesBasic", "src/ScriptHelpers/TerrainPatchesShaderChunks", "src/TerrainSystem/PatchInstancing", "src/TerrainSystem/CompressedPatchedHeightMap"], function (require, exports, CoordsBuffer_mjs_2, TerrainPatchesBasic_mjs_1, TerrainPatchesShaderChunks_mjs_1, PatchInstancing_mjs_2, CompressedPatchedHeightMap_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    TerrainPatchesBasic_mjs_1 = __importStar(TerrainPatchesBasic_mjs_1);
    CompressedPatchedHeightMap_mjs_1 = __importDefault(CompressedPatchedHeightMap_mjs_1);
    class TerrainPatches extends TerrainPatchesBasic_mjs_1.default {
        updateHeights(zone) {
            super.updateHeights(zone);
            this._updateHeightMap(zone);
        }
        _syncPatchHeights(patchX, patchZ) {
            // TODO: a batch update may be required.
            // TODO: transform in heightmap class
            const dataChunkSize = this.terrain.heightMap.dataChunkSize;
            const factor = this.terrain.heightMap.dataChunkSizeFactor;
            const dataChunkX = patchX * factor | 0;
            const dataChunkZ = patchZ * factor | 0;
            const level = this.terrain.heightMap.getChunkIndex(dataChunkX, dataChunkZ);
            const buffer = this.terrain.heightMap.getChunkBuffer(Uint8Array, dataChunkX, dataChunkZ);
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
                this._syncPatchHeights(x, z);
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
                usage: pc.BUFFER_STATIC,
                data: data,
                storage: false,
            });
        }
        _createInstancingMesh(app, entity, material, lodInfo, primitiveInfo, data) {
            const patchMesh = new pc.Mesh(app.graphicsDevice);
            const instancingBuf = this._buildInstancingVertexBuffer(app.graphicsDevice, data);
            patchMesh.aabb = this.aabb;
            patchMesh.indexBuffer[0] = this._sharedIndexBuffer;
            patchMesh.vertexBuffer = this._sharedVertexBuffer;
            patchMesh.primitive[0].type = pc.PRIMITIVE_TRIANGLES;
            patchMesh.primitive[0].base = primitiveInfo.start;
            patchMesh.primitive[0].count = primitiveInfo.count;
            patchMesh.primitive[0].indexed = true;
            const patchMeshInstance = new pc.MeshInstance(patchMesh, material, entity);
            patchMeshInstance.cull = false;
            patchMeshInstance.visible = false;
            patchMeshInstance.visibleThisFrame = false;
            patchMeshInstance.castShadow = false;
            patchMeshInstance.receiveShadow = false;
            patchMeshInstance.setParameter(TerrainPatchesShaderChunks_mjs_1.lodCoreParamName, lodInfo.core, 0xffffffff);
            patchMeshInstance.setInstancing(instancingBuf, false);
            return patchMeshInstance;
        }
        _createPatchMesh(patchIndex, app, entity, material) {
            const patchBuf = this.bufferArray[patchIndex];
            const patchMesh = new pc.Mesh(app.graphicsDevice);
            patchMesh.aabb = this.aabb;
            patchMesh.indexBuffer[0] = this._sharedIndexBuffer;
            patchMesh.vertexBuffer = this._sharedVertexBuffer;
            patchMesh.primitive[0].type = pc.PRIMITIVE_TRIANGLES;
            patchMesh.primitive[0].base = 0;
            patchMesh.primitive[0].count = 0;
            patchMesh.primitive[0].indexed = true;
            const patchMeshInstance = new pc.MeshInstance(patchMesh, material, entity);
            patchMeshInstance.cull = false;
            patchMeshInstance.visible = false;
            patchMeshInstance.visibleThisFrame = false;
            patchMeshInstance.castShadow = false;
            patchMeshInstance.receiveShadow = false;
            patchMeshInstance.setParameter(TerrainPatchesShaderChunks_mjs_1.patchCoordOffsetParamName, [patchBuf.minX, patchBuf.minZ], 0xffffffff);
            patchMeshInstance.setInstancing(null);
            return patchMeshInstance;
        }
        _destroyMesh(meshInstance) {
            // TODO: dont destroy shared index and vertex buffers
            if (meshInstance.mesh) {
                meshInstance.mesh.indexBuffer = [null];
                meshInstance.mesh.vertexBuffer = null;
            }
            meshInstance.destroy();
            if (meshInstance.mesh) {
                meshInstance.mesh.destroy();
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
            const dataChunkSize = this.terrain.heightMap.dataChunkSize;
            const chunks = this.terrain.heightMap.getChunksBuffers(Uint8Array);
            this._heightMap = new pc.Texture(app.graphicsDevice, {
                width: dataChunkSize,
                height: dataChunkSize,
                format: pc.PIXELFORMAT_RGBA8,
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
            if (this.instancing.enabled) {
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
            material.setAttribute(TerrainPatchesShaderChunks_mjs_1.patchInstCoordOffsetParamName, pc.SEMANTIC_ATTR10);
            material.setAttribute(TerrainPatchesShaderChunks_mjs_1.vertexCoordAttrName, pc.SEMANTIC_POSITION);
            material.setParameter(TerrainPatchesShaderChunks_mjs_1.lodCoreParamName, 0);
            material.setParameter(TerrainPatchesShaderChunks_mjs_1.patchCoordOffsetParamName, [0, 0]);
            material.setParameter(TerrainPatchesShaderChunks_mjs_1.terrainHeightMapParamName, this._heightMap);
            material.setParameter(TerrainPatchesShaderChunks_mjs_1.terrainHeightMapChunkSizeParamName, this._heightMap.width);
            // TODO: check support float32 texture
            let hmFormat = 'rgba';
            if (this.terrain.heightMap instanceof CompressedPatchedHeightMap_mjs_1.default) {
                hmFormat = this.terrain.heightMap.compressAlgoritm === 'x4' ? 'rgbaX4' : 'rgbaX2';
            }
            const chunksStore = (0, TerrainPatchesShaderChunks_mjs_1.getTerrainShaderChunks)({
                instancing: this.instancing.enabled,
                heightMapFormat: hmFormat,
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
        init(app, entity, material) {
            this._initHeightMapTexture(app);
            this._updateIndexBuffer(app.graphicsDevice);
            this._updateVertexBuffer(app.graphicsDevice);
            super.init(app, entity, material);
        }
    }
    exports.default = TerrainPatches;
});
define("src/ScriptHelpers/TerrainRenderPreparer", ["require", "exports", "src/ScriptHelpers/TerrainPatchesShaderChunks"], function (require, exports, TerrainPatchesShaderChunks_mjs_2) {
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
            this._castShadow = (_b = options.castShadow) !== null && _b !== void 0 ? _b : true;
            this._receiveShadow = (_c = options.receiveShadow) !== null && _c !== void 0 ? _c : false;
            this._hasUpdatedHeights = false;
        }
        _updateMeshes() {
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
            const meshInstance = this.patchesStore.createOrGetPatchMesh(patchIndex);
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
            meshInstance.setParameter(TerrainPatchesShaderChunks_mjs_2.lodCoreParamName, lodInfo.core);
        }
        render(frustum) {
            // TODO: In theory we can control the quality of the model for shadows
            // TODO: Add support for Occlusion culling
            this._hasUpdatedHeights = false;
            const useInstancing = this.patchesStore.instancing.enabled;
            if (useInstancing) {
                this.patchesStore.instancing.begin(false, false);
            }
            this.patchesStore.startRender();
            this.patchesStore.terrain.eachPatches(this, frustum);
            this.patchesStore.endRender(this._hasUpdatedHeights);
            if (useInstancing) {
                this.patchesStore.instancing.end();
            }
        }
    }
    exports.default = TerrainRenderPreparer;
});
define("src/Shared/Debug", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.drawDirectionVector = drawDirectionVector;
    exports.drawPoint = drawPoint;
    const tmpVec = new pc.Vec3();
    function drawDirectionVector(position, dir, color = pc.Color.RED) {
        // Draw the vector
        const start = position;
        const end = tmpVec.add2(position, dir);
        pc.app.drawLine(start, end, color, false);
    }
    function drawPoint({ center, radius = 0.1, numSegments = 4, color = pc.Color.RED, layer, depthTest = false }) {
        const points = [];
        const step = 2 * Math.PI / numSegments;
        let angle = 0;
        for (let i = 0; i < numSegments; i++) {
            const sin0 = Math.sin(angle);
            const cos0 = Math.cos(angle);
            angle += step;
            const sin1 = Math.sin(angle);
            const cos1 = Math.cos(angle);
            points.push(center.x + radius * sin0, center.y, center.z + radius * cos0, center.x + radius * sin1, center.y, center.z + radius * cos1);
            points.push(center.x, center.y + radius * sin0, center.z + radius * cos0, center.x, center.y + radius * sin1, center.z + radius * cos1);
            points.push(center.x + radius * cos0, center.y + radius * sin0, center.z, center.x + radius * cos1, center.y + radius * sin1, center.z);
        }
        pc.app.drawLineArrays(points, color, depthTest, layer);
    }
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
define("src/Scripts/BigTerrainEditor", ["require", "exports", "src/Shared/Debug", "src/TerrainSystem/MidpointDispTerrain", "src/TerrainSystem/TerrainRaycastResult", "src/TerrainSystem/HeightMap", "src/ScriptHelpers/TerrainRenderPreparer", "src/ScriptHelpers/ColorPainter", "src/ScriptHelpers/TerrainPatches", "src/ScriptHelpers/Enum", "src/ScriptHelpers/TerrainPatchesShaderChunks", "src/TerrainSystem/HeightfieldShape", "src/TerrainSystem/PatchedHeightMap", "src/TerrainSystem/CompressedPatchedHeightMap", "src/ScriptHelpers/Frustum"], function (require, exports, Debug_mjs_1, MidpointDispTerrain_mjs_1, TerrainRaycastResult_mjs_2, HeightMap_mjs_3, TerrainRenderPreparer_mjs_1, ColorPainter_mjs_1, TerrainPatches_mjs_1, Enum_mjs_1, TerrainPatchesShaderChunks_mjs_3, HeightfieldShape_mjs_1, PatchedHeightMap_mjs_1, CompressedPatchedHeightMap_mjs_2, Frustum_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.bigTerrainEditorScriptName = exports.BigTerrainEditor = void 0;
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
    class BigTerrainEditor extends pc.ScriptType {
        constructor() {
            super(...arguments);
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
        get terrainRenderer() { return this._renderer; }
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
            this.on('attr:useInstancingAccelerator', () => {
                this._renderer.patchesStore.instancing.enabled = this.useInstancingAccelerator;
                this._renderer.patchesStore.updateMaterial(this._material);
                this._renderer.patchesStore.updateMeshes();
            });
            this.on('attr:wireframe', () => { this._renderer.wireframe = this.wireframe; });
            this.on('attr:castShadow', () => { this._renderer.castShadow = this.castShadow; });
            this.on('attr:receiveShadow', () => { this._renderer.receiveShadow = this.receiveShadow; });
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
            this._brushHeightMap = new HeightMap_mjs_3.default(256, 256, 0, 100);
            this._colorPainter = new ColorPainter_mjs_1.default(this.app, this.painterSettings.splatMap.resource);
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
            this._renderer = new TerrainRenderPreparer_mjs_1.default(patcher, {
                wireframe: this.wireframe,
                castShadow: this.castShadow,
                receiveShadow: this.receiveShadow,
            });
            console.log(this._terrain, this._heightFieldShape, this._renderer);
        }
        _createTerrainMaterial() {
            this._material = new pc.StandardMaterial();
            this._material.name = "Terrain Material";
        }
        _updateTerrainMaterialParameters() {
            this._material.setParameter(TerrainPatchesShaderChunks_mjs_3.terrainSplatMapParamName, this._colorPainter.background);
            this._material.setParameter(TerrainPatchesShaderChunks_mjs_3.terrainSizeParamName, [this._terrain.width, this._terrain.depth]);
            this._material.setParameter(TerrainPatchesShaderChunks_mjs_3.terrainMinHeightParamName, this._terrain.minHeight);
            this._material.setParameter(TerrainPatchesShaderChunks_mjs_3.terrainMaxHeightParamName, this._terrain.maxHeight);
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
            this._renderer.patchesStore.instancing.enabled = this.useInstancingAccelerator;
            this._renderer.patchesStore.init(this.app, this.entity, this._material);
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
                if (this.heightMap.file &&
                    this.heightMap.file.resource) {
                    const data = this.heightMap.file.resource;
                    yield this._terrain.loadHeightMapFromFile(data, {
                        adaptiveMinMaxHeight: true,
                        adaptiveWidthAndDepth: true,
                    });
                }
                else {
                    const texture = this.heightMap.texture.resource;
                    const img = texture.getSource();
                    if (!img) {
                        console.error('Height map image unset.');
                        return;
                    }
                    this._terrain.loadHeightMapFromImg(img, this.heightMap.smoothFactor, this.heightMap.smoothRadius);
                    // TODO: clear heightmap
                    texture.destroy();
                }
                this._renderer.patchesStore.updateAabb();
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
                        if ((_a = this.app.mouse) === null || _a === void 0 ? void 0 : _a.isPressed(pc.MOUSEBUTTON_LEFT)) {
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
                                this._renderer.patchesStore.updateHeights(zone);
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
                this._renderer.render(this._frustum);
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
            //this.app.drawTexture(-0.5, -0.6, 0.5, 0.3, (this.terrainRenderer.patchesStore as any)._heightMap, undefined as any);
            //this.app.drawTexture( 0.5, -0.6, 0.5, 0.3, this.painterSettings.splatMap.resource, undefined as any);
        }
    }
    exports.BigTerrainEditor = BigTerrainEditor;
    exports.default = BigTerrainEditor;
    exports.bigTerrainEditorScriptName = "bigTerrainEditor";
    pc.registerScript(BigTerrainEditor, exports.bigTerrainEditorScriptName);
    BigTerrainEditor.attributes.add("useInstancingAccelerator", { type: "boolean", default: false, });
    BigTerrainEditor.attributes.add("castShadow", { type: "boolean", default: true, });
    BigTerrainEditor.attributes.add("receiveShadow", { type: "boolean", default: true, });
    BigTerrainEditor.attributes.add("zFar", { type: "number", default: 5000, min: 1, step: 1, precision: 0, });
    BigTerrainEditor.attributes.add("width", { type: "number", enum: Enum_mjs_1.terrainSizeEnum, default: Enum_mjs_1.terrainSizeEnumDefault });
    BigTerrainEditor.attributes.add("depth", { type: "number", enum: Enum_mjs_1.terrainSizeEnum, default: Enum_mjs_1.terrainSizeEnumDefault });
    BigTerrainEditor.attributes.add("patchSize", { type: "number", enum: Enum_mjs_1.terrainPatchSizeEnum, default: Enum_mjs_1.terrainPatchSizeEnumDefault });
    BigTerrainEditor.attributes.add("height", { type: "number", default: 10, min: 1 });
    BigTerrainEditor.attributes.add("compressAlgoritm", { type: "string", enum: Enum_mjs_1.terrainHeightsCompressAlgoritm, default: Enum_mjs_1.terrainHeightsCompressAlgoritmDefault });
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
define("src/Scripts/FieldInstancing", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fieldInstancingScriptName = exports.FieldInstancing = void 0;
    class FieldInstancing extends pc.ScriptType {
        initialize() {
        }
        postInitialize() {
        }
        update(dt) {
        }
    }
    exports.FieldInstancing = FieldInstancing;
    exports.default = FieldInstancing;
    exports.fieldInstancingScriptName = "fieldInstancing";
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
define("src/Scripts/Grass", ["require", "exports", "src/Scripts/BigTerrainEditor", "src/ScriptHelpers/GrassShaderChunks"], function (require, exports, BigTerrainEditor_mjs_1, GrassShaderChunks_mjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.grassScriptName = exports.Grass = void 0;
    const pos = new pc.Vec3();
    const rot = new pc.Quat();
    const scl = new pc.Vec3();
    const matrix = new pc.Mat4();
    class Grass extends pc.ScriptType {
        _syncUniform() {
            if (this._material) {
                this._material.setParameter('ground_color', [this.uniform.color.r, this.uniform.color.g, this.uniform.color.b]);
                this._material.setParameter('pitch', this.uniform.pitch);
                this._material.setParameter('yaw', this.uniform.yaw);
                this._material.setParameter('width', this.uniform.width);
                this._material.setParameter('height', this.uniform.height);
                this._material.setParameter('bendStrength', this.uniform.bendStrength);
            }
        }
        _updatePrimitive() {
            for (const data of this._dataArray) {
                data.meshInstance.mesh.primitive[0].type = this.renderType;
                data.meshInstance.mesh.primitive[0].base = this.base;
                data.meshInstance.mesh.primitive[0].count = this.vertexCount;
            }
        }
        initialize() {
            this.on('attr:uniform', () => this._syncUniform());
            this.on('attr:vertexCount', () => this._updatePrimitive());
            this.on('attr:renderType', () => this._updatePrimitive());
            this.on('attr:base', () => this._updatePrimitive());
        }
        postInitialize() {
            const script = this.terrainEntity.script.get(BigTerrainEditor_mjs_1.bigTerrainEditorScriptName);
            this._terrain = script.terrain;
            this._terrainRenderer = script.terrainRenderer;
            // create standard material and enable instancing on it
            const material = new pc.StandardMaterial();
            const chunksStore = GrassShaderChunks_mjs_1.grassShaderChunks;
            const chunkNames = Object.keys(chunksStore);
            for (let chunkName of chunkNames) {
                material.chunks[chunkName] = chunksStore[chunkName];
            }
            material.chunks.APIVersion = pc.CHUNKAPI_1_70;
            material.cull = pc.CULLFACE_NONE;
            //material.alphaToCoverage = false;
            material.update();
            this._material = material;
            this._dataArray = new Array(this._terrain.numPatchesX * this._terrain.numPatchesZ);
            this._syncUniform();
            for (let z = 0; z < this._terrain.numPatchesZ; z++) {
                for (let x = 0; x < this._terrain.numPatchesX; x++) {
                    const data = this._createIns(x, z, this._terrain, material);
                    this._dataArray[z * this._terrain.numPatchesX + x] = data;
                    const grassEntity = new pc.Entity('GrassTest');
                    grassEntity.addComponent('render');
                    grassEntity.render.castShadows = false;
                    grassEntity.render.castShadowsLightmap = false;
                    grassEntity.render.meshInstances = [data.meshInstance];
                    this.terrainEntity.addChild(grassEntity);
                }
            }
            console.log(this);
        }
        _updateHeights(index) {
            const buffer = this._dataArray[index];
        }
        _getRandom(min, max) {
            return Math.random() * (max - min) + min;
        }
        _createIns(patchX, patchZ, terrain, material) {
            const startX = patchX * terrain.patchSize;
            const startZ = patchZ * terrain.patchSize;
            const step = Math.pow((terrain.patchSize - 1), 2) / (this.count / 4);
            const stepHelf = step / 2;
            const matrices = new Float32Array(this.count * 16);
            let matrixIndex = 0;
            for (let z = 0; z < terrain.patchSize; z += step) {
                for (let x = 0; x < terrain.patchSize; x += step) {
                    const localX = startX + x;
                    const localZ = startZ + z;
                    const y = terrain.heightMap.getHeightInterpolated(localX, localZ);
                    const randX = localX > 0 ? this._getRandom(localX - stepHelf, localX + stepHelf) : 0;
                    const randZ = localZ > 0 ? this._getRandom(localZ - stepHelf, localZ + stepHelf) : 0;
                    pos.set(randX, y, randZ);
                    rot.setFromEulerAngles(0, this._getRandom(0, 360), 0);
                    scl.set(1, 1, 1);
                    matrix.setTRS(pos, rot, scl);
                    for (let m = 0; m < 16; m++)
                        matrices[matrixIndex++] = matrix.data[m];
                }
            }
            const mesh = new pc.Mesh(this.app.graphicsDevice, { storageIndex: true, storageVertex: true });
            const segments = 6;
            const VERTICES = (segments + 1) * 2;
            const positions = new Uint32Array(VERTICES * 2);
            for (let i = 0; i < VERTICES * 2; ++i) {
                positions[i] = i;
            }
            const vertexFormat = new pc.VertexFormat(this.app.graphicsDevice, [{
                    semantic: pc.SEMANTIC_POSITION,
                    type: pc.TYPE_UINT32,
                    components: 1,
                    normalize: false,
                    asInt: true,
                }], positions.length);
            mesh.vertexBuffer = new pc.VertexBuffer(this.app.graphicsDevice, vertexFormat, positions.length, {
                usage: pc.BUFFER_STATIC,
                storage: true,
                data: positions,
            });
            mesh.primitive[0].type = this.renderType;
            mesh.primitive[0].indexed = false;
            mesh.primitive[0].base = this.base;
            mesh.primitive[0].count = this.vertexCount;
            //const mesh = pc.Mesh.fromGeometry(this.app.graphicsDevice, new pc.BoxGeometry());
            // initialize instancing using the vertex buffer on meshInstance of the created box
            const vbFormat = pc.VertexFormat.getDefaultInstancingFormat(this.app.graphicsDevice);
            const vertexBuffer = new pc.VertexBuffer(this.app.graphicsDevice, vbFormat, this.count, {
                data: matrices
            });
            const meshInstance = new pc.MeshInstance(mesh, material);
            meshInstance.setInstancing(vertexBuffer);
            meshInstance.visible = false;
            meshInstance.castShadow = false;
            return {
                meshInstance,
                vertexBuffer
            };
        }
        update(dt) {
            for (let z = 0; z < this._terrain.numPatchesZ; z++) {
                for (let x = 0; x < this._terrain.numPatchesX; x++) {
                    const index = z * this._terrain.numPatchesX + x;
                    const buffer = this._terrainRenderer.patchesStore.bufferArray[index];
                    const data = this._dataArray[index];
                    data.meshInstance.visible = buffer.visible && buffer.lod.core < 1;
                    if (buffer.heightsUpdatedThisFrame) {
                        this._updateHeights(index);
                    }
                }
            }
        }
    }
    exports.Grass = Grass;
    exports.default = Grass;
    exports.grassScriptName = "grass";
    pc.registerScript(Grass, exports.grassScriptName);
    Grass.attributes.add("terrainEntity", { type: 'entity' });
    Grass.attributes.add("base", { type: "number", default: 0, step: 1, precision: 0, min: 0 });
    Grass.attributes.add("count", { type: "number", default: 100, step: 1, precision: 0, min: 1, max: 1000000 });
    Grass.attributes.add("vertexCount", { type: "number", default: 10, min: 0, step: 1, precision: 0 });
    Grass.attributes.add("renderType", { type: "number", default: pc.PRIMITIVE_TRIANGLES, enum: [
            { 'Points': pc.PRIMITIVE_POINTS },
            { 'Lines': pc.PRIMITIVE_LINES },
            { 'Line Loop': pc.PRIMITIVE_LINELOOP },
            { 'Line Strip': pc.PRIMITIVE_LINESTRIP },
            { 'Triangles': pc.PRIMITIVE_TRIANGLES },
            { 'Triangles Fan': pc.PRIMITIVE_TRIFAN },
            { 'Triangles Strip': pc.PRIMITIVE_TRISTRIP },
        ] });
    Grass.attributes.add("uniform", { type: 'json', schema: [
            {
                name: "color",
                type: "rgb",
            },
            {
                name: "bendStrength",
                type: "number",
            },
            {
                name: "pitch",
                type: "number",
            },
            {
                name: "yaw",
                type: "number",
            },
            {
                name: "width",
                type: "number",
            },
            {
                name: "height",
                type: "number",
            },
        ] });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVycmFpbi1zeXN0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zYXNyYy9yZXF1cmVkU3RhcnQuanMiLCIuLi8uLi9zcmMvRWRpdG9yU3lzdGVtL0tleWJvYXJkSGFuZGxlci5tdHMiLCIuLi8uLi9zcmMvRWRpdG9yU3lzdGVtL01vdXNlSGFuZGxlci5tdHMiLCIuLi8uLi9zcmMvU2NyaXB0SGVscGVycy9CcnVzaC5tdHMiLCIuLi8uLi9zcmMvU2NyaXB0SGVscGVycy9Db2xvclBhaW50ZXJTaGFkZXJzLm10cyIsIi4uLy4uL3NyYy9TY3JpcHRIZWxwZXJzL1NoYXJlZC5tdHMiLCIuLi8uLi9zcmMvU2NyaXB0SGVscGVycy9Db2xvclBhaW50ZXIubXRzIiwiLi4vLi4vc3JjL1NjcmlwdEhlbHBlcnMvRW51bUNvbnZlcnRlci5tdHMiLCIuLi8uLi9zcmMvU2NyaXB0SGVscGVycy9FbnVtLm10cyIsIi4uLy4uL3NyYy9TaGFyZWQvVHlwZXMubXRzIiwiLi4vLi4vc3JjL1RlcnJhaW5TeXN0ZW0vQWJzSGVpZ2h0TWFwRmlsZUlPLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluU3lzdGVtL0lab25lLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluU3lzdGVtL0Fic0hlaWdodE1hcC5tdHMiLCIuLi8uLi9zcmMvVGVycmFpblN5c3RlbS9Db29yZHNCdWZmZXIubXRzIiwiLi4vLi4vc3JjL1RlcnJhaW5TeXN0ZW0vSGVpZ2h0TWFwLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluU3lzdGVtL0Fic1BhdGNoZWRIZWlnaHRNYXAubXRzIiwiLi4vLi4vc3JjL1RlcnJhaW5TeXN0ZW0vTG9kSW5mby5tdHMiLCIuLi8uLi9zcmMvU2hhcmVkL1N0b3JlMkQubXRzIiwiLi4vLi4vc3JjL1NoYXJlZC9VdGlscy5tdHMiLCIuLi8uLi9zcmMvU2hhcmVkL1ZlY3RvcjNNYXRoLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluU3lzdGVtL0xvZE1hbmFnZXIubXRzIiwiLi4vLi4vc3JjL1RlcnJhaW5TeXN0ZW0vR3JpZEJ1aWxkZXIubXRzIiwiLi4vLi4vc3JjL1RlcnJhaW5TeXN0ZW0vR2VvbWlwR3JpZEJ1aWxkZXIubXRzIiwiLi4vLi4vc3JjL1RlcnJhaW5TeXN0ZW0vR2VvbWlwR3JpZFJlbmRlclByZXBhcmVyLm10cyIsIi4uLy4uL3NyYy9TY3JpcHRIZWxwZXJzL0ZydXN0dW0ubXRzIiwiLi4vLi4vc3JjL1NjcmlwdEhlbHBlcnMvR3Jhc3NTaGFkZXJDaHVua3MubXRzIiwiLi4vLi4vc3JjL1RlcnJhaW5TeXN0ZW0vR2VvbWlwR3JpZC5tdHMiLCIuLi8uLi9zcmMvVGVycmFpblN5c3RlbS9UZXJyYWluLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluU3lzdGVtL1BhdGNoSW5zdGFuY2luZy5tdHMiLCIuLi8uLi9zcmMvU2NyaXB0SGVscGVycy9UZXJyYWluUGF0Y2hlc0luc3RhbmNpbmcubXRzIiwiLi4vLi4vc3JjL1NjcmlwdEhlbHBlcnMvVGVycmFpblBhdGNoZXNCYXNpYy5tdHMiLCIuLi8uLi9zcmMvU2NyaXB0SGVscGVycy9UZXJyYWluUGF0Y2hlc1NoYWRlckNodW5rcy5tdHMiLCIuLi8uLi9zcmMvVGVycmFpblN5c3RlbS9Db21wcmVzc2VkUGF0Y2hlZEhlaWdodE1hcC5tdHMiLCIuLi8uLi9zcmMvU2NyaXB0SGVscGVycy9UZXJyYWluUGF0Y2hlcy5tdHMiLCIuLi8uLi9zcmMvU2NyaXB0SGVscGVycy9UZXJyYWluUmVuZGVyUHJlcGFyZXIubXRzIiwiLi4vLi4vc3JjL1NoYXJlZC9EZWJ1Zy5tdHMiLCIuLi8uLi9zcmMvVGVycmFpblN5c3RlbS9NaWRwb2ludERpc3BUZXJyYWluLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluU3lzdGVtL1RlcnJhaW5SYXljYXN0UmVzdWx0Lm10cyIsIi4uLy4uL3NyYy9UZXJyYWluU3lzdGVtL1RyaWFuZ2xlLm10cyIsIi4uLy4uL3NyYy9UZXJyYWluU3lzdGVtL0hlaWdodGZpZWxkU2hhcGUubXRzIiwiLi4vLi4vc3JjL1RlcnJhaW5TeXN0ZW0vUGF0Y2hlZEhlaWdodE1hcC5tdHMiLCIuLi8uLi9zcmMvU2NyaXB0cy9CaWdUZXJyYWluRWRpdG9yLm10cyIsIi4uLy4uL3NyYy9TY3JpcHRzL0ZpZWxkSW5zdGFuY2luZy5tdHMiLCIuLi8uLi9zcmMvU2NyaXB0cy9GbHlDYW1lcmEubXRzIiwiLi4vLi4vc3JjL1NjcmlwdHMvRnBzQ291bnRlci5tdHMiLCIuLi8uLi9zcmMvU2NyaXB0cy9HcmFzcy5tdHMiLCIuLi8uLi9zcmMvU2hhcmVkL1ZlY3RvcjJNYXRoLm10cyIsIi4uLy4uL3N6c3JjL3JlcXVyZWRGaW5pc2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsQ0FBQztBQUFBLENBQUMsR0FBRyxFQUFFO0lBRU4sTUFBTSxJQUFJLEdBQU8sRUFBRSxDQUFDO0lBQ3BCLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUVwQixtQ0FBbUM7SUFDbkMsTUFBTSxDQUFDLHVCQUF1QixHQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDaEQsTUFBTSxDQUFDLHdCQUF3QixHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFFakQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFdkMsTUFBTSxNQUFNLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO1lBRXBDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUNuRCxDQUFDO1lBRUQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzVCLENBQUMsQ0FBQTtRQUVELE1BQU0sQ0FBQyxHQUFHLEdBQUc7WUFDWixNQUFNLEVBQUUsSUFBSSxFQUFJLDBEQUEwRDtZ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QUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV6RyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsSUFBSSxD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SUFBSSxJQUFJLENBQUM7WUFFZCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFN0IsTUFBTSxDQUFDLElBQUksQ0FDUCxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxJQUFJLEVBQzVELE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FDL0QsQ0FBQztZQUVGLE1BQU0sQ0FBQyxJQUFJLENBQ1AsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUcsSUFBSSxFQUM1RCxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQy9ELENBQUM7WUFFRixNQUFNLENBQUMsSUFBSSxDQUNQLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFDNUQsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUcsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUMvRCxDQUFDO1FBQ04sQ0FBQztRQUVELEVBQUUsQ0FBQyxHQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEtB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QUFJLEVBQUUsUUFBUTtnQkFDZCxJQUFJLEVBQUUsUUFBUTthQUNqQjtTQUNKLEVBQUUsQ0FBQyxDQUFDOzs7Ozs7SUNuUUwsNENBS0M7SUFSRDs7T0FFRztJQUNILFNBQWdCLGdCQUFnQixDQUFDLEVBQVMsRUFBRSxFQUFTLEVBQUUsRUFBUyxFQUFFLEVBQVM7UUFDdkUsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNuQixNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ25CLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUM3QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVZLFFBQUEsV0FBVyxHQUFHO1FBQ3ZCLGdCQUFnQjtLQUNuQixDQUFBO0lBRUQsa0JBQWUsbUJBQVcsQ0FBQzs7QUNoQjNCLENBQUM7QUFBQSxDQUFDLEdBQUcsRUFBRTtJQUNILElBQUksTUFBTSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDbEMsTUFBTSxDQUFDLHdCQUF3QixFQUFFLENBQUM7SUFDdEMsQ0FBQztBQUNMLENBQUMsQ0FBQyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyI7KCgpID0+IHtcclxuXHJcblx0Y29uc3QgZGVmcyAgICAgPSB7fTtcclxuXHRjb25zdCByZXNvbHZlZCA9IHt9O1xyXG5cclxuXHQvLyBzYXZlIG9yaWdpbmFsIGRlZmluZSBhbmQgcmVxdWlyZVxyXG5cdHdpbmRvdy5fX19hbWRfX19PcmlnaW5hbERlZmluZSAgPSB3aW5kb3cuZGVmaW5lO1xyXG5cdHdpbmRvdy5fX19hbWRfX19PcmlnaW5hbFJlcXVpcmUgPSB3aW5kb3cucmVxdWlyZTtcclxuXHJcblx0aWYgKCF3aW5kb3cuZGVmaW5lICYmICF3aW5kb3cucmVxdWlyZSkge1xyXG5cclxuXHRcdGNvbnN0IGRlZmluZSA9IChpZCwgZGVwcywgZmFjdG9yeSkgPT4ge1xyXG5cclxuXHRcdFx0aWYgKGRlZnNbaWRdKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdEdXBsaWNhdGUgZGVmaW5pdGlvbiBmb3IgJyArIGlkKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZGVmc1tpZF0gPSBbZGVwcywgZmFjdG9yeV07XHJcblx0XHR9XHJcblxyXG5cdFx0ZGVmaW5lLmFtZCA9IHtcclxuXHRcdFx0YnVuZGxlOiB0cnVlLCAgIC8vIHRoaXMgaW1wbGVtZW50YXRpb24gd29ya3Mgb25seSB3aXRoIGJ1bmRsZWQgYW1kIG1vZHVsZXNcclxuXHRcdFx0ZHluYW1pYzogZmFsc2UsIC8vIGRvZXMgbm90IHN1cHBvcnQgZHluYW1pYyBvciBhc3luYyBsb2FkaW5nXHJcblx0XHR9O1xyXG5cclxuXHRcdGNvbnN0IHJlcXVpcmUgPSAoaWQpID0+IHtcclxuXHJcblx0XHRcdGlmIChpZCA9PT0gJ3JlcXVpcmUnKSByZXR1cm4gcmVxdWlyZTtcclxuXHRcdFx0aWYgKGlkID09PSAnZXhwb3J0cycpIHJldHVybiB7fTtcclxuXHRcdFx0aWYgKHJlc29sdmVkW2lkXSkgICAgIHJldHVybiByZXNvbHZlZFtpZF07XHJcblxyXG5cdFx0XHRpZiAoIWRlZnNbaWRdKSB7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coZGVmcywgaWQpO1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignTm8gZGVmaW5pdGlvbiBmb3IgJyArIGlkKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Y29uc3QgbW9kdWxlRXhwb3J0cyA9IHt9O1xyXG5cdFx0XHRjb25zdCBkZXBzICAgID0gZGVmc1tpZF1bMF07XHJcblx0XHRcdGNvbnN0IGZhY3RvcnkgPSBkZWZzW2lkXVsxXTtcclxuXHRcdFx0Y29uc3QgYXJncyA9IGRlcHMubWFwKGRlcCA9PiB7XHJcblxyXG5cdFx0XHRcdGlmIChkZXAgPT09ICdleHBvcnRzJykge1xyXG5cdFx0XHRcdFx0cmV0dXJuIG1vZHVsZUV4cG9ydHM7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gcmVxdWlyZShkZXApO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdGZhY3RvcnkuYXBwbHkobnVsbCwgYXJncyk7XHJcblxyXG5cdFx0XHRyZXR1cm4gcmVzb2x2ZWRbaWRdID0gbW9kdWxlRXhwb3J0cztcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0d2luZG93LmRlZmluZSAgPSBkZWZpbmU7XHJcblx0XHR3aW5kb3cucmVxdWlyZSA9IHJlcXVpcmU7XHJcblx0fVxyXG5cclxuXHR3aW5kb3cuX19fYW1kX19fcmVxdWlyZVJlc29sdmVyID0gKCkgPT4ge1xyXG5cclxuXHRcdGZvciAoY29uc3QgaWQgaW4gZGVmcykge1xyXG5cclxuXHRcdFx0aWYgKGRlZnMuaGFzT3duUHJvcGVydHkoaWQpKSB7XHJcblxyXG5cdFx0XHRcdGNvbnN0IGRlcHMgPSBkZWZzW2lkXVswXTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAoZGVwcykge1xyXG5cdFx0XHRcdFx0ZGVwcy5tYXAoZGVwID0+IHtcclxuXHRcclxuXHRcdFx0XHRcdFx0aWYgKGRlcCAhPT0gJ3JlcXVpcmUnICYmXHJcblx0XHRcdFx0XHRcdFx0ZGVwICE9PSAnZXhwb3J0cycpIHtcclxuXHJcblx0XHRcdFx0XHRcdFx0aWYgKCFyZXNvbHZlZC5oYXNPd25Qcm9wZXJ0eShkZXApKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRyZXF1aXJlKGRlcCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoIWRlZnMuaGFzT3duUHJvcGVydHkoZGVwKSAmJlxyXG5cdFx0XHRcdFx0XHRcdFx0IXJlc29sdmVkLmhhc093blByb3BlcnR5KGRlcCkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgZGVmaW5lICcke2lkfScgZGVwIG5vdCBmb3VuZCAnJHtkZXB9J2ApO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXF1aXJlKGlkKTtcclxuXHJcblx0XHRcdFx0ZGVsZXRlIGRlZnNbaWRdO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIHJldHVybiBvcmlnaW5hbCBkZWZpbmUgYW5kIHJlcXVpcmVcclxuXHRcdHdpbmRvdy5kZWZpbmUgID0gd2luZG93Ll9fX2FtZF9fX09yaWdpbmFsRGVmaW5lO1xyXG5cdFx0d2luZG93LnJlcXVpcmUgPSB3aW5kb3cuX19fYW1kX19fT3JpZ2luYWxSZXF1aXJlO1xyXG5cclxuXHRcdC8vIGNsZWFyXHJcblx0XHRkZWxldGUgd2luZG93Ll9fX2FtZF9fX3JlcXVpcmVSZXNvbHZlcjtcclxuXHRcdGRlbGV0ZSB3aW5kb3cuX19fYW1kX19fT3JpZ2luYWxEZWZpbmU7XHJcblx0XHRkZWxldGUgd2luZG93Ll9fX2FtZF9fX09yaWdpbmFsUmVxdWlyZTtcclxuXHR9O1xyXG59KSgpOyIsImV4cG9ydCBjbGFzcyBLZXlib2FyZEhhbmxkZXIge1xuXG4gICAgaW5pdCgpIHtcblxuXG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcblxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgS2V5Ym9hcmRIYW5sZGVyOyIsImV4cG9ydCBjbGFzcyBNb3VzZUhhbmRsZXIge1xuXG4gICAgcHJpdmF0ZSBfZW50ZXI6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIHB1YmxpYyBnZXQgZW50ZXIoKSB7IHJldHVybiB0aGlzLl9lbnRlcjsgfVxuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX29uV2luZG93RW50ZXIgPSB0aGlzLl9vbldpbmRvd0VudGVyLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX29uV2luZG93TGVhdmUgPSB0aGlzLl9vbldpbmRvd0xlYXZlLmJpbmQodGhpcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGluaXQoKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIHRoaXMuX29uV2luZG93RW50ZXIpXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMuX29uV2luZG93TGVhdmUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkZXN0cm95KCkge1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCB0aGlzLl9vbldpbmRvd0VudGVyKVxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLl9vbldpbmRvd0xlYXZlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9vbldpbmRvd0VudGVyKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5jbGllbnRZID4gMCB8fCBldmVudC5jbGllbnRYID4gMCB8fCAoZXZlbnQuY2xpZW50WCA8IHdpbmRvdy5pbm5lcldpZHRoIHx8IGV2ZW50LmNsaWVudFkgPCB3aW5kb3cuaW5uZXJIZWlnaHQpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRW50ZXInKTtcbiAgICAgICAgICAgIHRoaXMuX2VudGVyID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIF9vbldpbmRvd0xlYXZlKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG5cbiAgICAgICAgaWYgKGV2ZW50LmNsaWVudFkgPD0gMCB8fCBldmVudC5jbGllbnRYIDw9IDAgfHwgKGV2ZW50LmNsaWVudFggPj0gd2luZG93LmlubmVyV2lkdGggfHwgZXZlbnQuY2xpZW50WSA+PSB3aW5kb3cuaW5uZXJIZWlnaHQpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnTGVhdmUnKTtcbiAgICAgICAgICAgIHRoaXMuX2VudGVyID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59IiwiZXhwb3J0IGludGVyZmFjZSBJQnJ1c2hTZXR0aW5ncyB7XHJcbiAgICByZWFkb25seSBhY3RpdmU6IG51bWJlcixcclxuICAgIHJlYWRvbmx5IHNpemU6IG51bWJlcixcclxuICAgIHJlYWRvbmx5IG9wYWNpdHk6IG51bWJlcixcclxuICAgIHJlYWRvbmx5IHRleHR1cmVzOiBwY3guQXNzZXRbXTtcclxufSIsImV4cG9ydCBjb25zdCB2ZXJ0ZXhTaGFkZXIgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gXHJcbiAgICBhdHRyaWJ1dGUgdmVjMyBhUG9zaXRpb247XHJcbiAgICBhdHRyaWJ1dGUgdmVjMiBhVXYwO1xyXG5cclxuICAgIHVuaWZvcm0gbWF0NCBtYXRyaXhfbW9kZWw7XHJcbiAgICB1bmlmb3JtIG1hdDQgbWF0cml4X3ZpZXdQcm9qZWN0aW9uO1xyXG5cclxuICAgIHZhcnlpbmcgdmVjMiB2VXYwO1xyXG5cclxuICAgIHZvaWQgbWFpbih2b2lkKVxyXG4gICAge1xyXG4gICAgICAgIHZVdjAgPSBhVXYwO1xyXG4gICAgICAgIGdsX1Bvc2l0aW9uID0gbWF0cml4X3ZpZXdQcm9qZWN0aW9uICogbWF0cml4X21vZGVsICogdmVjNChhUG9zaXRpb24sIDEuMCk7XHJcbiAgICB9XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3QgZmFjdG9yTWV0aG9kID0gLyoqIEB0eXBlIGdsc2wgKi9cclxuYFxyXG4gICAgdmFyeWluZyB2ZWMyIHZVdjA7XHJcblxyXG4gICAgdW5pZm9ybSBzYW1wbGVyMkQgdUhlaWdodE1hcDtcclxuICAgIHVuaWZvcm0gZmxvYXQgdUJydXNoT3BhY2l0eTtcclxuICAgIHVuaWZvcm0gdmVjNCB1QnJ1c2hNYXNrO1xyXG5cclxuICAgIGZsb2F0IGdldEZhY3RvcigpIHtcclxuICAgICAgICB2ZWM0IGhlaWdodE1hcCA9IHRleHR1cmUyRCh1SGVpZ2h0TWFwLCB2VXYwKTtcclxuICAgICAgICBmbG9hdCBoZWlnaHQgICA9IChoZWlnaHRNYXAuciArIGhlaWdodE1hcC5nICsgaGVpZ2h0TWFwLmIpIC8gMy4wIC8gaGVpZ2h0TWFwLmE7XHJcbiAgICAgICAgZmxvYXQgZmFjdG9yICAgPSBoZWlnaHQgKiB1QnJ1c2hPcGFjaXR5O1xyXG4gICAgICAgIHJldHVybiBmYWN0b3I7XHJcbiAgICB9XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3QgZnJhZ21lbnRTaGFkZXIgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gXHJcbiAgICAke2ZhY3Rvck1ldGhvZH1cclxuXHJcbiAgICB2b2lkIG1haW4odm9pZClcclxuICAgIHtcclxuICAgICAgICBmbG9hdCBmYWN0b3IgPSBnZXRGYWN0b3IoKTtcclxuICAgICAgICB2ZWM0IGNvbG9yID0gdmVjNCh1QnJ1c2hNYXNrICogZmFjdG9yKTtcclxuXHJcbiAgICAgICAgZ2xfRnJhZ0NvbG9yID0gY29sb3I7XHJcbiAgICB9XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3QgZnJhZ21lbnRJbnZlcnRTaGFkZXIgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gXHJcbiAgICAke2ZhY3Rvck1ldGhvZH1cclxuXHJcbiAgICB2b2lkIG1haW4odm9pZClcclxuICAgIHtcclxuICAgICAgICBmbG9hdCBsZXZlbHMgPSA0LjA7XHJcbiAgICAgICAgZmxvYXQgZmFjdG9yID0gZ2V0RmFjdG9yKCk7XHJcbiAgICAgICAgdmVjNCBjb2xvciAgID0gdmVjNChmYWN0b3IpO1xyXG5cclxuICAgICAgICBpZiAodUJydXNoTWFzay5yID4gMC4wKSB7IGNvbG9yLnIgPSAwLjA7IGxldmVscyAtPSAxLjA7IH1cclxuICAgICAgICBpZiAodUJydXNoTWFzay5nID4gMC4wKSB7IGNvbG9yLmcgPSAwLjA7IGxldmVscyAtPSAxLjA7IH1cclxuICAgICAgICBpZiAodUJydXNoTWFzay5iID4gMC4wKSB7IGNvbG9yLmIgPSAwLjA7IGxldmVscyAtPSAxLjA7IH1cclxuICAgICAgICBpZiAodUJydXNoTWFzay5hID4gMC4wKSB7IGNvbG9yLmEgPSAwLjA7IGxldmVscyAtPSAxLjA7IH1cclxuXHJcbiAgICAgICAgZ2xfRnJhZ0NvbG9yID0gY29sb3IgLyBsZXZlbHM7XHJcbiAgICB9XHJcbmA7IiwiZXhwb3J0IGNvbnN0IHNldFByZWNpc2lvbiA9IChncmFwaGljc0RldmljZTogcGN4LkdyYXBoaWNzRGV2aWNlLCBzaGFkZXJDb2RlOiBzdHJpbmcpID0+IHtcclxuICAgIHJldHVybiBcInByZWNpc2lvbiBcIiArIGdyYXBoaWNzRGV2aWNlLnByZWNpc2lvbiArIFwiIGZsb2F0O1xcblwiICsgc2hhZGVyQ29kZTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGNoZWNrR0RTdXBwb3J0UjMyRiA9IChncmFwaGljc0RldmljZTogcGN4LkdyYXBoaWNzRGV2aWNlKSA9PiB7XHJcbiAgICBcclxuICAgIC8vIFRPRE86IG1heWJlIG5vdCBzdXBwb3J0XHJcbiAgICBpZiAoZ3JhcGhpY3NEZXZpY2UuaXNXZWJHUFUpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcmVzdWx0OiB1bmtub3duID0gZmFsc2U7XHJcbiAgICBcclxuICAgIGlmIChncmFwaGljc0RldmljZS5pc1dlYkdMMikge1xyXG5cclxuICAgICAgICBjb25zdCBnbCA9IChncmFwaGljc0RldmljZSBhcyBwY3guV2ViZ2xHcmFwaGljc0RldmljZSkuZ2w7XHJcblxyXG4gICAgICAgIHJlc3VsdCA9IGdsLmdldEV4dGVuc2lvbihcIkVYVF9jb2xvcl9idWZmZXJfZmxvYXRcIik7XHJcblxyXG4gICAgICAgIGlmIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gZ2wuZ2V0RXh0ZW5zaW9uKFwiT0VTX3RleHR1cmVfZmxvYXRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vYWxlcnQoSlNPTi5zdHJpbmdpZnkocmVzdWx0KSk7XHJcblxyXG4gICAgcmV0dXJuICEhcmVzdWx0O1xyXG59IiwiaW1wb3J0IHsgSUJydXNoU2V0dGluZ3MgfSBmcm9tIFwiLi9CcnVzaC5tanNcIjtcclxuaW1wb3J0IHsgZnJhZ21lbnRJbnZlcnRTaGFkZXIsIGZyYWdtZW50U2hhZGVyLCB2ZXJ0ZXhTaGFkZXIgfSBmcm9tIFwiLi9Db2xvclBhaW50ZXJTaGFkZXJzLm1qc1wiO1xyXG5pbXBvcnQgeyBzZXRQcmVjaXNpb24gfSBmcm9tIFwiLi9TaGFyZWQubWpzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgcGFpbnRlckNhbWVyYUZhciA9IDEwO1xyXG5leHBvcnQgY29uc3QgcGFpbnRlckxheWVyTmFtZSA9ICdUZXJyYWluRWRpdG9yJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbG9yUGFpbnRlciB7XHJcblxyXG4gICAgcHJpdmF0ZSBfcGFpbnRpbmc6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIF9wYWludGVyTWFzazogRmxvYXQzMkFycmF5O1xyXG4gICAgcHJpdmF0ZSBfYnJ1c2hTZXR0aW5nczogSUJydXNoU2V0dGluZ3M7XHJcblxyXG4gICAgcHJpdmF0ZSBfYXBwOiBwY3guQXBwQmFzZTtcclxuICAgIHByaXZhdGUgX2J1ZmZlcjogcGN4LlRleHR1cmU7XHJcbiAgICBwcml2YXRlIF9wYWludGVyUmVuZGVyVGFyZ2V0OiBwY3guUmVuZGVyVGFyZ2V0O1xyXG4gICAgcHJpdmF0ZSBfcGFpbnRlckNhbWVyYUVudGl0eTogcGN4LkVudGl0eTtcclxuXHJcbiAgICBwcml2YXRlIF9wYWludGVyU2hhZGVyOiBwY3guU2hhZGVyO1xyXG4gICAgcHJpdmF0ZSBfcGFpbnRlck1hdGVyaWFsOiBwY3guTWF0ZXJpYWw7XHJcbiAgICBwcml2YXRlIF9wYWludGVyRW50aXR5OiBwY3guRW50aXR5O1xyXG5cclxuICAgIHByaXZhdGUgX3BhaW50ZXJJbnZlcnRTaGFkZXI6IHBjeC5TaGFkZXI7XHJcbiAgICBwcml2YXRlIF9wYWludGVySW52ZXJ0TWF0ZXJpYWw6IHBjeC5NYXRlcmlhbDtcclxuICAgIHByaXZhdGUgX3BhaW50ZXJJbnZlcnRFbnRpdHk6IHBjeC5FbnRpdHk7XHJcblxyXG4gICAgcHVibGljIGdldCBwYWludGluZygpICAgeyByZXR1cm4gdGhpcy5fcGFpbnRpbmc7IH1cclxuICAgIHB1YmxpYyBnZXQgY2FtZXJhRmFyKCkgIHsgcmV0dXJuIHBhaW50ZXJDYW1lcmFGYXI7IH1cclxuICAgIHB1YmxpYyBnZXQgYmFja2dyb3VuZCgpIHsgcmV0dXJuIHRoaXMuX2J1ZmZlcjsgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKGFwcDogcGN4LkFwcEJhc2UsIGJ1ZmZlcjogcGN4LlRleHR1cmUpIHtcclxuXHJcbiAgICAgICAgdGhpcy5fcGFpbnRpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9wYWludGVyTWFzayA9IG5ldyBGbG9hdDMyQXJyYXkoNCk7XHJcbiAgICAgICAgdGhpcy5fYnVmZmVyID0gYnVmZmVyO1xyXG4gICAgICAgIHRoaXMuX2FwcCA9IGFwcDtcclxuXHJcbiAgICAgICAgdGhpcy5faW5pdENhbWVyYSgpO1xyXG4gICAgICAgIHRoaXMuX2luaXRTaGFkZXJzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdE1hdGVyaWFscygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRFbnRpdGllcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXRDYW1lcmEoKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHBhaW50ZXJMYXllciA9IHRoaXMuX2FwcC5zY2VuZS5sYXllcnMuZ2V0TGF5ZXJCeU5hbWUocGFpbnRlckxheWVyTmFtZSkhO1xyXG5cclxuICAgICAgICB0aGlzLl9wYWludGVyUmVuZGVyVGFyZ2V0ID0gbmV3IHBjLlJlbmRlclRhcmdldCh7XHJcbiAgICAgICAgICAgIGNvbG9yQnVmZmVyOiB0aGlzLl9idWZmZXIsXHJcbiAgICAgICAgICAgIGZsaXBZOiB0aGlzLl9hcHAuZ3JhcGhpY3NEZXZpY2UuaXNXZWJHUFUsXHJcbiAgICAgICAgICAgIGRlcHRoOiBmYWxzZSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckNhbWVyYUVudGl0eSA9IG5ldyBwYy5FbnRpdHkoJ1RlcnJhaW5QYWludGVyQ2FtZXJhJyk7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckNhbWVyYUVudGl0eS5zZXRMb2NhbFBvc2l0aW9uKDAsIDAsIHBhaW50ZXJDYW1lcmFGYXIpO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJDYW1lcmFFbnRpdHkubG9va0F0KDAsIDAsIDApO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJDYW1lcmFFbnRpdHkuYWRkQ29tcG9uZW50KCdjYW1lcmEnLCB7XHJcbiAgICAgICAgICAgIHByb2plY3Rpb246IHBjLlBST0pFQ1RJT05fT1JUSE9HUkFQSElDLFxyXG4gICAgICAgICAgICBjbGVhckNvbG9yQnVmZmVyOiBmYWxzZSxcclxuICAgICAgICAgICAgY2xlYXJEZXB0aEJ1ZmZlcjogZmFsc2UsXHJcbiAgICAgICAgICAgIHByaW9yaXR5OiAtMSxcclxuICAgICAgICAgICAgbGF5ZXJzOiBbcGFpbnRlckxheWVyLmlkXSxcclxuICAgICAgICAgICAgbmVhckNsaXA6IDAuMSxcclxuICAgICAgICAgICAgZmFyQ2xpcDogcGFpbnRlckNhbWVyYUZhciAqIDIsXHJcbiAgICAgICAgICAgIHJlbmRlclRhcmdldDogdGhpcy5fcGFpbnRlclJlbmRlclRhcmdldCxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fYXBwLnJvb3QuYWRkQ2hpbGQodGhpcy5fcGFpbnRlckNhbWVyYUVudGl0eSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJDYW1lcmFFbnRpdHkuZW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJDYW1lcmFFbnRpdHkuY2FtZXJhIS5mcnVzdHVtQ3VsbGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJDYW1lcmFFbnRpdHkuY2FtZXJhIS5vcnRob0hlaWdodCA9IHBhaW50ZXJDYW1lcmFGYXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdEVudGl0aWVzKCkge1xyXG5cclxuICAgICAgICBjb25zdCBwYWludGVyTGF5ZXIgPSB0aGlzLl9hcHAuc2NlbmUubGF5ZXJzLmdldExheWVyQnlOYW1lKHBhaW50ZXJMYXllck5hbWUpITtcclxuXHJcbiAgICAgICAgcGFpbnRlckxheWVyLnRyYW5zcGFyZW50U29ydE1vZGUgPSBwYy5TT1JUTU9ERV9NQU5VQUw7XHJcblxyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJFbnRpdHkgID0gbmV3IHBjLkVudGl0eSgnVGVycmFpbkJydXNoUGFpbnRlcicpO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJFbnRpdHkuYWRkQ29tcG9uZW50KCdyZW5kZXInLCB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdwbGFuZScsXHJcbiAgICAgICAgICAgIGxheWVyczogW3BhaW50ZXJMYXllci5pZF0sXHJcbiAgICAgICAgICAgIG1hdGVyaWFsOiB0aGlzLl9wYWludGVyTWF0ZXJpYWwsXHJcbiAgICAgICAgICAgIGNhc3RTaGFkb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgY2FzdFNoYWRvd3NMaWdodG1hcDogZmFsc2UsXHJcbiAgICAgICAgICAgIHJlY2VpdmVTaGFkb3dzOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9wYWludGVySW52ZXJ0RW50aXR5ICA9IG5ldyBwYy5FbnRpdHkoJ1RlcnJhaW5CcnVzaFBhaW50ZXJJbnZlcnQnKTtcclxuICAgICAgICB0aGlzLl9wYWludGVySW52ZXJ0RW50aXR5LmFkZENvbXBvbmVudCgncmVuZGVyJywge1xyXG4gICAgICAgICAgICB0eXBlOiAncGxhbmUnLFxyXG4gICAgICAgICAgICBsYXllcnM6IFtwYWludGVyTGF5ZXIuaWRdLFxyXG4gICAgICAgICAgICBtYXRlcmlhbDogdGhpcy5fcGFpbnRlckludmVydE1hdGVyaWFsLFxyXG4gICAgICAgICAgICBjYXN0U2hhZG93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGNhc3RTaGFkb3dzTGlnaHRtYXA6IGZhbHNlLFxyXG4gICAgICAgICAgICByZWNlaXZlU2hhZG93czogZmFsc2UsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJFbnRpdHkucmVuZGVyIS5tZXNoSW5zdGFuY2VzWzBdLmRyYXdPcmRlciA9IDE7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckludmVydEVudGl0eS5yZW5kZXIhLm1lc2hJbnN0YW5jZXNbMF0uZHJhd09yZGVyID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5fYXBwLnJvb3QuYWRkQ2hpbGQodGhpcy5fcGFpbnRlckludmVydEVudGl0eSk7XHJcbiAgICAgICAgdGhpcy5fYXBwLnJvb3QuYWRkQ2hpbGQodGhpcy5fcGFpbnRlckVudGl0eSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJJbnZlcnRFbnRpdHkuc2V0TG9jYWxFdWxlckFuZ2xlcyg5MCwgMCwgMCk7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckVudGl0eS5zZXRMb2NhbEV1bGVyQW5nbGVzKDkwLCAwLCAwKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckludmVydEVudGl0eS5lbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckVudGl0eS5lbmFibGVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdFNoYWRlcnMoKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZlcnRleCA9IHZlcnRleFNoYWRlcjtcclxuICAgICAgICBjb25zdCBmcmFnbWVudCA9IHNldFByZWNpc2lvbih0aGlzLl9hcHAuZ3JhcGhpY3NEZXZpY2UsIGZyYWdtZW50U2hhZGVyKTtcclxuICAgICAgICBjb25zdCBmcmFnbWVudEludmVydCA9IHNldFByZWNpc2lvbih0aGlzLl9hcHAuZ3JhcGhpY3NEZXZpY2UsIGZyYWdtZW50SW52ZXJ0U2hhZGVyKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcGFpbnRlclNoYWRlciA9IHBjLmNyZWF0ZVNoYWRlckZyb21Db2RlKHRoaXMuX2FwcC5ncmFwaGljc0RldmljZSwgdmVydGV4LCBmcmFnbWVudCwgJ1BhaW50ZXJGcmFnbWVudFNoYWRlcicsIHtcclxuICAgICAgICAgICAgYVBvc2l0aW9uOiBwYy5TRU1BTlRJQ19QT1NJVElPTixcclxuICAgICAgICAgICAgYVV2MDogcGMuU0VNQU5USUNfVEVYQ09PUkQwXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJJbnZlcnRTaGFkZXIgPSBwYy5jcmVhdGVTaGFkZXJGcm9tQ29kZSh0aGlzLl9hcHAuZ3JhcGhpY3NEZXZpY2UsIHZlcnRleCwgZnJhZ21lbnRJbnZlcnQsICdQYWludGVySW52ZXJ0RnJhZ21lbnRTaGFkZXInLCB7XHJcbiAgICAgICAgICAgIGFQb3NpdGlvbjogcGMuU0VNQU5USUNfUE9TSVRJT04sXHJcbiAgICAgICAgICAgIGFVdjA6IHBjLlNFTUFOVElDX1RFWENPT1JEMFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXRNYXRlcmlhbHMoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJNYXRlcmlhbCA9IG5ldyBwYy5NYXRlcmlhbCgpO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJNYXRlcmlhbC5uYW1lID0gJ0JydXNoUGFpbnRlck1hdGVyaWFsJztcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgdGhpcy5fcGFpbnRlck1hdGVyaWFsLnNoYWRlciA9IHRoaXMuX3BhaW50ZXJTaGFkZXI7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlck1hdGVyaWFsLmJsZW5kVHlwZSA9IHBjLkJMRU5EX0FERElUSVZFO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJNYXRlcmlhbC51cGRhdGUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckludmVydE1hdGVyaWFsID0gbmV3IHBjLk1hdGVyaWFsKCk7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckludmVydE1hdGVyaWFsLm5hbWUgPSAnQnJ1c2hQYWludGVySW52ZXJ0TWF0ZXJpYWwnO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICB0aGlzLl9wYWludGVySW52ZXJ0TWF0ZXJpYWwuc2hhZGVyID0gdGhpcy5fcGFpbnRlckludmVydFNoYWRlcjtcclxuICAgICAgICB0aGlzLl9wYWludGVySW52ZXJ0TWF0ZXJpYWwuYmxlbmRUeXBlID0gcGMuQkxFTkRfU1VCVFJBQ1RJVkU7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckludmVydE1hdGVyaWFsLnVwZGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3VwZGF0ZVJ1bnRpbWVTZXR0aW5ncyhkdDogbnVtYmVyKSB7XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxPcGFjaXR5ID0gdGhpcy5fYnJ1c2hTZXR0aW5ncy5vcGFjaXR5O1xyXG4gICAgICAgIGNvbnN0IG9wYWNpdHkgPSBvcmlnaW5hbE9wYWNpdHk7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlck1hdGVyaWFsLnNldFBhcmFtZXRlcigndUJydXNoT3BhY2l0eScsIG9wYWNpdHkpO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJJbnZlcnRNYXRlcmlhbC5zZXRQYXJhbWV0ZXIoJ3VCcnVzaE9wYWNpdHknLCBvcGFjaXR5KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF91cGRhdGVQb3NpdGlvbkFuZFNjYWxlKHg6IG51bWJlciwgeTogbnVtYmVyLCBzY2FsZVdpZHRoOiBudW1iZXIsIHNjYWxlSGVpZ2h0OiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgY29uc3QgZmFyICAgID0gdGhpcy5jYW1lcmFGYXIgKiAyO1xyXG4gICAgICAgIGNvbnN0IHJhdGlvbiA9IHRoaXMuYmFja2dyb3VuZC53aWR0aCAvIHRoaXMuYmFja2dyb3VuZC5oZWlnaHQ7XHJcblxyXG4gICAgICAgIHggPSB4ICogZmFyICogcmF0aW9uIC0gdGhpcy5jYW1lcmFGYXIgKiByYXRpb247XHJcbiAgICAgICAgeSA9IHkgKiBmYXIgLSB0aGlzLmNhbWVyYUZhcjtcclxuXHJcbiAgICAgICAgc2NhbGVXaWR0aCAgPSBzY2FsZVdpZHRoICAqIHRoaXMuYmFja2dyb3VuZC53aWR0aCAgLyBmYXIgLyAyLjU7XHJcbiAgICAgICAgc2NhbGVIZWlnaHQgPSBzY2FsZUhlaWdodCAqIHRoaXMuYmFja2dyb3VuZC5oZWlnaHQgLyBmYXIgLyAyLjU7XHJcblxyXG4gICAgICAgIHRoaXMuX3NldFNjYWxlKHNjYWxlV2lkdGgsIHNjYWxlSGVpZ2h0KTtcclxuICAgICAgICB0aGlzLl9zZXRQb3NpdGlvbih4LCB5KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhcnRQYWludChkdDogbnVtYmVyLCB4OiBudW1iZXIsIHk6IG51bWJlciwgc2NhbGVXaWR0aDogbnVtYmVyLCBzY2FsZUhlaWdodDogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIHRoaXMuX3VwZGF0ZVJ1bnRpbWVTZXR0aW5ncyhkdCk7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlUG9zaXRpb25BbmRTY2FsZSh4LCB5LCBzY2FsZVdpZHRoLCBzY2FsZUhlaWdodCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3BhaW50aW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9wYWludGVySW52ZXJ0RW50aXR5LmVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJFbnRpdHkuZW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckNhbWVyYUVudGl0eS5lbmFibGVkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RvcFBhaW50KCkge1xyXG4gICAgICAgIHRoaXMuX3BhaW50aW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckludmVydEVudGl0eS5lbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckVudGl0eS5lbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckNhbWVyYUVudGl0eS5lbmFibGVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfc2V0U2NhbGUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl9wYWludGVyRW50aXR5LnNldExvY2FsU2NhbGUoeCwgMSwgeSk7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckludmVydEVudGl0eS5zZXRMb2NhbFNjYWxlKHgsIDEsIHkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3NldFBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5fcGFpbnRlckVudGl0eS5zZXRMb2NhbFBvc2l0aW9uKHgsIHksIDApO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJJbnZlcnRFbnRpdHkuc2V0TG9jYWxQb3NpdGlvbih4LCB5LCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlU2V0dGluZ3MoYnJ1c2hTZXR0aW5nczogSUJydXNoU2V0dGluZ3MsIGFjdGl2ZUxheWVyOiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgdGhpcy5fcGFpbnRlck1hc2suZmlsbCgwKTtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUxheWVyID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9wYWludGVyTWFza1thY3RpdmVMYXllciAtIDFdID0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGJydXNoVGV4dHVyZSA9IGJydXNoU2V0dGluZ3MudGV4dHVyZXNbYnJ1c2hTZXR0aW5ncy5hY3RpdmVdLnJlc291cmNlO1xyXG5cclxuICAgICAgICB0aGlzLl9wYWludGVyTWF0ZXJpYWwuc2V0UGFyYW1ldGVyKCd1QnJ1c2hNYXNrJywgdGhpcy5fcGFpbnRlck1hc2spO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJNYXRlcmlhbC5zZXRQYXJhbWV0ZXIoJ3VIZWlnaHRNYXAnLCBicnVzaFRleHR1cmUpO1xyXG5cclxuICAgICAgICB0aGlzLl9wYWludGVySW52ZXJ0TWF0ZXJpYWwuc2V0UGFyYW1ldGVyKCd1QnJ1c2hNYXNrJywgdGhpcy5fcGFpbnRlck1hc2spO1xyXG4gICAgICAgIHRoaXMuX3BhaW50ZXJJbnZlcnRNYXRlcmlhbC5zZXRQYXJhbWV0ZXIoJ3VIZWlnaHRNYXAnLCBicnVzaFRleHR1cmUpO1xyXG5cclxuICAgICAgICB0aGlzLl9icnVzaFNldHRpbmdzID0gYnJ1c2hTZXR0aW5ncztcclxuICAgIH1cclxufSIsImV4cG9ydCBmdW5jdGlvbiBpc051bWVyaWModmFsdWU6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIC9eLT9cXGQrJC8udGVzdCh2YWx1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXBFbnVtPFQgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4oc29tZUVudW06IFQpIHtcclxuXHJcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCB2YWx1ZSBpbiBzb21lRW51bSkge1xyXG5cclxuICAgICAgICBpZiAoIXNvbWVFbnVtLmhhc093blByb3BlcnR5KHZhbHVlKSkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGVudW1FbnRyeTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcclxuICAgICAgICBlbnVtRW50cnlbdmFsdWVdID0gc29tZUVudW1bdmFsdWVdO1xyXG4gICAgICAgIHJlc3VsdC5wdXNoKGVudW1FbnRyeSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn0iLCJpbXBvcnQgeyBtYXBFbnVtIH0gZnJvbSBcIi4vRW51bUNvbnZlcnRlci5tanNcIlxyXG5cclxuZXhwb3J0IGNvbnN0IHRlcnJhaW5TaXplRW51bURlZmF1bHQgPSA1MTM7XHJcbmV4cG9ydCBjb25zdCB0ZXJyYWluU2l6ZUVudW0gPSBtYXBFbnVtKHtcclxuICAgICcxMjgnOiAgIDEyOSxcclxuICAgICcyNTYnOiAgIDI1NyxcclxuICAgICc1MTInOiAgIDUxMyxcclxuICAgICcxMDI0JzogIDEwMjUsXHJcbiAgICAnMjA0OCc6ICAyMDQ5LFxyXG4gICAgJzQwOTYnOiAgNDA5NyxcclxuICAgICc4MTkyJzogIDgxOTMsXHJcbiAgICAnMTYzODQnOiAxNjM4NSxcclxuICAgICczMjc2OCc6IDMyNzY5LFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCB0ZXJyYWluUGF0Y2hTaXplRW51bURlZmF1bHQgPSAzMztcclxuZXhwb3J0IGNvbnN0IHRlcnJhaW5QYXRjaFNpemVFbnVtID0gbWFwRW51bSh7XHJcbiAgICAnMTYnOiAgICAxNyxcclxuICAgICczMic6ICAgIDMzLFxyXG4gICAgJzY0JzogICAgNjUsXHJcbiAgICAnMTI4JzogICAxMjksXHJcbiAgICAnMjU2JzogICAyNTcsXHJcbiAgICAnNTEyJzogICA1MTMsXHJcbiAgICAnMTAyNCc6ICAxMDI1LFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCB0ZXJyYWluSGVpZ2h0c0NvbXByZXNzQWxnb3JpdG1EZWZhdWx0ID0gJ25vbmUnO1xyXG5leHBvcnQgY29uc3QgdGVycmFpbkhlaWdodHNDb21wcmVzc0FsZ29yaXRtID0gbWFwRW51bSh7XHJcbiAgICAnTm9uZSc6ICdub25lJyxcclxuICAgICdYMic6ICd4MicsXHJcbiAgICAnWDQnOiAneDQnXHJcbn0pOyIsImV4cG9ydCB0eXBlIGludCA9IG51bWJlcjtcbmV4cG9ydCB0eXBlIHVuc2lnbmVkaW50ID0gbnVtYmVyO1xuZXhwb3J0IHR5cGUgZmxvYXQgPSBudW1iZXI7XG5leHBvcnQgdHlwZSBSZWZPYmplY3Q8VCBleHRlbmRzIG9iamVjdD4gPSBUO1xuZXhwb3J0IHR5cGUgSVZlY3RvcjIgPSB7IHg6IGZsb2F0LCB5OiBmbG9hdCB9O1xuZXhwb3J0IHR5cGUgSVZlY3RvcjMgPSB7IHg6IGZsb2F0LCB5OiBmbG9hdCwgejogZmxvYXQgfTtcbmV4cG9ydCB0eXBlIElWZWN0b3I0ID0geyB4OiBmbG9hdCwgeTogZmxvYXQsIHo6IGZsb2F0LCB3OiBmbG9hdCB9O1xuZXhwb3J0IHR5cGUgSU1hdHJpeDQgPSB7IGRhdGE6IEZsb2F0MzJBcnJheSB9OyIsImltcG9ydCB0eXBlIHsgZmxvYXQsIGludCB9IGZyb20gXCIuLi9TaGFyZWQvVHlwZXMubWpzXCI7XHJcbmltcG9ydCB0eXBlIEFic0hlaWdodE1hcCBmcm9tIFwiLi9BYnNIZWlnaHRNYXAubWpzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgaGVpZ2h0TWFwVmVyc2lvbiA9IDk5O1xyXG5leHBvcnQgY29uc3QgZmFjdG9yU2l6ZSA9IDM7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElIZWlnaHRNYXBGaWxlSW1wb3J0T3B0aW9ucyB7XHJcbiAgICBhZGFwdGl2ZVdpZHRoQW5kRGVwdGg/OiBib29sZWFuLFxyXG4gICAgYWRhcHRpdmVNaW5NYXhIZWlnaHQ/OiBib29sZWFuLFxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElJbXBvcnRGaWxlSGVhZGVyIHtcclxuICAgIHdpZHRoOiBpbnQsXHJcbiAgICBkZXB0aDogaW50LFxyXG4gICAgbWluSGVpZ2h0OiBmbG9hdCxcclxuICAgIG1heEhlaWdodDogZmxvYXRcclxufVxyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFic0hlaWdodE1hcEZpbGVJTyB7XHJcblxyXG4gICAgcHJpdmF0ZSBfX3JlYWRIZWlnaHRGYWN0b3IodmlldzogRGF0YVZpZXcsIGhlYWRlclNpemU6IGludCwgd2lkdGg6IGludCwgeDogaW50LCB6OiBpbnQpIHtcclxuXHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB6ICogd2lkdGggKyB4O1xyXG4gICAgICAgIGNvbnN0IHIgPSB2aWV3LmdldFVpbnQ4KGhlYWRlclNpemUgKyBpbmRleCAqIGZhY3RvclNpemUgKyAwKTtcclxuICAgICAgICBjb25zdCBnID0gdmlldy5nZXRVaW50OChoZWFkZXJTaXplICsgaW5kZXggKiBmYWN0b3JTaXplICsgMSk7XHJcbiAgICAgICAgY29uc3QgYiA9IHZpZXcuZ2V0VWludDgoaGVhZGVyU2l6ZSArIGluZGV4ICogZmFjdG9yU2l6ZSArIDIpO1xyXG4gICAgXHJcbiAgICAgICAgY29uc3Qgc2NhbGVkID0gKHIgPDwgMTYpIHwgKGcgPDwgOCkgfCBiO1xyXG4gICAgICAgIGNvbnN0IGZhY3RvciA9IHNjYWxlZCAvIDE2Nzc3MjE1O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBmYWN0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfX3dyaXRlSGVpZ2h0RmFjdG9yKHZpZXc6IERhdGFWaWV3LCBoZWFkZXJTaXplOiBpbnQsIGhlaWdodE1hcDogQWJzSGVpZ2h0TWFwLCB4OiBpbnQsIHo6IGludCkge1xyXG4gICAgICAgIGNvbnN0IGluZGV4ICA9IHogKiBoZWlnaHRNYXAud2lkdGggKyB4O1xyXG4gICAgICAgIGNvbnN0IGZhY3RvciA9IGhlaWdodE1hcC5nZXRGYWN0b3IoeCwgeik7XHJcbiAgICAgICAgY29uc3Qgc2NhbGVkID0gTWF0aC5mbG9vcihmYWN0b3IgKiAxNjc3NzIxNSk7XHJcbiAgICAgICAgY29uc3QgciA9IChzY2FsZWQgPj4gMTYpICYgMHhGRjtcclxuICAgICAgICBjb25zdCBnID0gKHNjYWxlZCA+PiA4KSAmIDB4RkY7XHJcbiAgICAgICAgY29uc3QgYiA9IChzY2FsZWQgJiAweEZGKTtcclxuXHJcbiAgICAgICAgdmlldy5zZXRVaW50OChoZWFkZXJTaXplICsgaW5kZXggKiBmYWN0b3JTaXplICsgMCwgcik7XHJcbiAgICAgICAgdmlldy5zZXRVaW50OChoZWFkZXJTaXplICsgaW5kZXggKiBmYWN0b3JTaXplICsgMSwgZyk7XHJcbiAgICAgICAgdmlldy5zZXRVaW50OChoZWFkZXJTaXplICsgaW5kZXggKiBmYWN0b3JTaXplICsgMiwgYik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFzeW5jIF9faW1wb3J0RnJvbUZpbGUoaGVpZ2h0TWFwOiBBYnNIZWlnaHRNYXAsIGJ1ZmZlcjogQXJyYXlCdWZmZXIsIG9wdGlvbnM/OiBJSGVpZ2h0TWFwRmlsZUltcG9ydE9wdGlvbnMpOiBQcm9taXNlPElJbXBvcnRGaWxlSGVhZGVyIHwgbnVsbD4ge1xyXG5cclxuICAgICAgICAvLyBUT0RPOlxyXG4gICAgICAgIC8vIGhlYWRlciB2ZXJzaW9uIDk5XHJcbiAgICAgICAgLy8gaGVhZGVyQnl0ZVNpemUsIHZlcnNpb24sIHdpZHRoLCBkZXB0aCwgbWluSGVpZ2h0LCBtYXhIZWlnaHRcclxuICAgIFxyXG4gICAgICAgIGNvbnN0IHZpZXcgICAgPSBuZXcgRGF0YVZpZXcoYnVmZmVyKTtcclxuICAgICAgICBjb25zdCB2ZXJzaW9uID0gdmlldy5nZXRVaW50MzIoMSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIGlmICh2ZXJzaW9uICE9PSBoZWlnaHRNYXBWZXJzaW9uKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignSGVpZ2h0IG1hcCB2ZXJzaW9uOiAlZiBubyBzdXBwb3J0LicsIHZlcnNpb24pO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICBjb25zdCBoZWFkZXJTaXplID0gdmlldy5nZXRVaW50OCgwKTtcclxuICAgICAgICBjb25zdCB3aWR0aCAgICAgID0gdmlldy5nZXRVaW50MzIoNSwgdHJ1ZSk7XHJcbiAgICAgICAgY29uc3QgZGVwdGggICAgICA9IHZpZXcuZ2V0VWludDMyKDksIHRydWUpO1xyXG4gICAgICAgIGNvbnN0IG1pbkhlaWdodCAgPSB2aWV3LmdldEZsb2F0MzIoMTMsIHRydWUpO1xyXG4gICAgICAgIGNvbnN0IG1heEhlaWdodCAgPSB2aWV3LmdldEZsb2F0MzIoMTcsIHRydWUpO1xyXG4gICAgXHJcbiAgICAgICAgY29uc3QgZGVsdGEgPSBvcHRpb25zPy5hZGFwdGl2ZU1pbk1heEhlaWdodFxyXG4gICAgICAgICAgICA/IGhlaWdodE1hcC5tYXhIZWlnaHQgLSBoZWlnaHRNYXAubWluSGVpZ2h0XHJcbiAgICAgICAgICAgIDogbWF4SGVpZ2h0IC0gbWluSGVpZ2h0O1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IHJlc3VsdE1pbkhlaWdodCA9IG9wdGlvbnM/LmFkYXB0aXZlTWluTWF4SGVpZ2h0ID8gaGVpZ2h0TWFwLm1pbkhlaWdodCA6IG1pbkhlaWdodDtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoaGVpZ2h0TWFwLndpZHRoICE9PSB3aWR0aCB8fFxyXG4gICAgICAgICAgICBoZWlnaHRNYXAuZGVwdGggIT09IGRlcHRoICYmXHJcbiAgICAgICAgICAgIG9wdGlvbnMgJiZcclxuICAgICAgICAgICAgb3B0aW9ucy5hZGFwdGl2ZVdpZHRoQW5kRGVwdGgpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFRPRE86IGl0cyB3b3JrIGZvciB4Xm4gKyAxLCB6Xm4gKyAxXHJcbiAgICAgICAgICAgIGNvbnN0IGZhY3RvclggPSAod2lkdGggLSAxKSAvIChoZWlnaHRNYXAud2lkdGggLSAxKTtcclxuICAgICAgICAgICAgY29uc3QgZmFjdG9yWiA9IChkZXB0aCAtIDEpIC8gKGhlaWdodE1hcC5kZXB0aCAtIDEpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgeiA9IDA7IHogPCBkZXB0aDsgeiArPSBmYWN0b3JaKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB3aWR0aDsgeCArPSBmYWN0b3JYKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IHNtb290aCBmb3IgaGVpZ2h0TWFwIG1vcmUgaW1wb3J0IGRhdGFcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBmYWN0b3IgPSB0aGlzLl9fcmVhZEhlaWdodEZhY3Rvcih2aWV3LCBoZWFkZXJTaXplLCB3aWR0aCwgeCB8IDAsIHogfCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBoZWlnaHQgPSByZXN1bHRNaW5IZWlnaHQgKyBmYWN0b3IgKiBkZWx0YTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0TWFwLnNldCh4IC8gZmFjdG9yWCwgeiAvIGZhY3RvclosIGhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIGZvciAobGV0IHogPSAwOyAoeiA8IGRlcHRoKSAmJiAoeiA8IGhlaWdodE1hcC5kZXB0aCk7IHorKykge1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgeCA9IDA7ICh4IDwgd2lkdGgpICYmICh4IDwgaGVpZ2h0TWFwLndpZHRoKTsgeCsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZhY3RvciA9IHRoaXMuX19yZWFkSGVpZ2h0RmFjdG9yKHZpZXcsIGhlYWRlclNpemUsIHdpZHRoLCB4LCB6KTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBoZWlnaHQgPSByZXN1bHRNaW5IZWlnaHQgKyBmYWN0b3IgKiBkZWx0YTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHRNYXAuc2V0KHgsIHosIGhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHdpZHRoLFxyXG4gICAgICAgICAgICBkZXB0aCxcclxuICAgICAgICAgICAgbWluSGVpZ2h0LFxyXG4gICAgICAgICAgICBtYXhIZWlnaHRcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFzeW5jIF9fZXhwb3J0VG9CdWZmZXIoaGVpZ2h0TWFwOiBBYnNIZWlnaHRNYXApIHtcclxuICAgIFxyXG4gICAgICAgIC8vIFRPRE86XHJcbiAgICAgICAgLy8gaGVhZGVyIHZlcnNpb24gOTlcclxuICAgICAgICAvLyBoZWFkZXJCeXRlU2l6ZSwgdmVyc2lvbiwgd2lkdGgsIGRlcHRoLCBtaW5IZWlnaHQsIG1heEhlaWdodFxyXG4gICAgXHJcbiAgICAgICAgY29uc3QgaGVhZGVyU2l6ZSA9IDEgKyA0ICsgNCArIDQgKyA0ICsgNDtcclxuICAgICAgICBjb25zdCBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoaGVhZGVyU2l6ZSArIGZhY3RvclNpemUgKiBoZWlnaHRNYXAud2lkdGggKiBoZWlnaHRNYXAuZGVwdGgpO1xyXG4gICAgICAgIGNvbnN0IHZpZXcgICA9IG5ldyBEYXRhVmlldyhidWZmZXIpO1xyXG4gICAgXHJcbiAgICAgICAgdmlldy5zZXRVaW50OCAgKDAsIGhlYWRlclNpemUpO1xyXG4gICAgICAgIHZpZXcuc2V0VWludDMyICgxLCBoZWlnaHRNYXBWZXJzaW9uLCB0cnVlKTtcclxuICAgICAgICB2aWV3LnNldFVpbnQzMiAoNSwgaGVpZ2h0TWFwLndpZHRoLCB0cnVlKTtcclxuICAgICAgICB2aWV3LnNldFVpbnQzMiAoOSwgaGVpZ2h0TWFwLmRlcHRoLCB0cnVlKTtcclxuICAgICAgICB2aWV3LnNldEZsb2F0MzIoMTMsIGhlaWdodE1hcC5taW5IZWlnaHQsIHRydWUpO1xyXG4gICAgICAgIHZpZXcuc2V0RmxvYXQzMigxNywgaGVpZ2h0TWFwLm1heEhlaWdodCwgdHJ1ZSk7XHJcbiAgICBcclxuICAgICAgICBmb3IgKGxldCB6ID0gMDsgeiA8IGhlaWdodE1hcC5kZXB0aDsgeisrKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IGhlaWdodE1hcC53aWR0aDsgeCsrKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5fX3dyaXRlSGVpZ2h0RmFjdG9yKHZpZXcsIGhlYWRlclNpemUsIGhlaWdodE1hcCwgeCwgeik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICByZXR1cm4gYnVmZmVyO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBYnNIZWlnaHRNYXBGaWxlSU87IiwiaW1wb3J0IHR5cGUgeyBpbnQgfSBmcm9tIFwiLi4vU2hhcmVkL1R5cGVzLm1qc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIElab25lIHtcbiAgICBtaW5YOiBpbnQ7XG4gICAgbWF4WDogaW50O1xuICAgIG1pblo6IGludDtcbiAgICBtYXhaOiBpbnQ7XG59IiwiaW1wb3J0IHR5cGUgeyBmbG9hdCwgaW50IH0gZnJvbSBcIi4uL1NoYXJlZC9UeXBlcy5tanNcIjtcclxuaW1wb3J0IEFic0hlaWdodE1hcEZpbGVJTywgeyBJSGVpZ2h0TWFwRmlsZUltcG9ydE9wdGlvbnMgfSBmcm9tIFwiLi9BYnNIZWlnaHRNYXBGaWxlSU8ubWpzXCI7XHJcbmltcG9ydCB0eXBlIHsgSVpvbmUgfSBmcm9tIFwiLi9JWm9uZS5tanNcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVJlYWRvbmx5QWJzSGVpZ2h0TWFwIHtcclxuXHJcbiAgICByZWFkb25seSB3aWR0aDogaW50O1xyXG4gICAgcmVhZG9ubHkgZGVwdGg6IGludDtcclxuXHJcbiAgICByZWFkb25seSBtaW5IZWlnaHQ6IGZsb2F0O1xyXG4gICAgcmVhZG9ubHkgbWF4SGVpZ2h0OiBmbG9hdDtcclxuXHJcbiAgICBnZXQoeDogaW50LCB6OiBpbnQpOiBmbG9hdDtcclxuICAgIGdldEZhY3Rvcih4OiBpbnQsIHo6IGludCk6IGZsb2F0O1xyXG4gICAgZ2V0SGVpZ2h0SW50ZXJwb2xhdGVkKHg6IGZsb2F0LCB6OiBmbG9hdCk6IGZsb2F0O1xyXG4gICAgdG9GaWxlKCk6IFByb21pc2U8QmxvYj47XHJcbiAgICB0b0NhbnZhcygpOiBIVE1MQ2FudmFzRWxlbWVudDtcclxuICAgIHRvQnVmZmVyKGJ1ZmZlcjogVWludDhBcnJheSB8IFVpbnQ4Q2xhbXBlZEFycmF5KTogdm9pZDtcclxuICAgIHRvSW1hZ2UodHlwZT86IHN0cmluZyB8IHVuZGVmaW5lZCwgcXVhbGl0eT86IGFueSk6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFic0hlaWdodE1hcCBleHRlbmRzIEFic0hlaWdodE1hcEZpbGVJTyBpbXBsZW1lbnRzIElSZWFkb25seUFic0hlaWdodE1hcCwgSVpvbmUge1xyXG5cclxuICAgIHB1YmxpYyBhYnN0cmFjdCB3aWR0aDogaW50O1xyXG4gICAgcHVibGljIGFic3RyYWN0IGRlcHRoOiBpbnQ7XHJcblxyXG4gICAgcHVibGljIGFic3RyYWN0IG1pbkhlaWdodDogZmxvYXQ7XHJcbiAgICBwdWJsaWMgYWJzdHJhY3QgbWF4SGVpZ2h0OiBmbG9hdDtcclxuXHJcbiAgICBwdWJsaWMgYWJzdHJhY3QgZ2V0KHg6IGludCwgejogaW50KTogZmxvYXQ7XHJcbiAgICBwdWJsaWMgYWJzdHJhY3Qgc2V0KHg6IGludCwgejogaW50LCB2YWx1ZTogZmxvYXQpOiBmbG9hdDtcclxuICAgIHB1YmxpYyBhYnN0cmFjdCBnZXRGYWN0b3IoeDogaW50LCB6OiBpbnQpOiBmbG9hdDtcclxuXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgbWluWCA9IDA7XHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgbWluWiA9IDA7XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXQgbWF4WCgpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuICAgIHB1YmxpYyBnZXQgbWF4WigpIHsgcmV0dXJuIHRoaXMuZGVwdGg7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0SGVpZ2h0SW50ZXJwb2xhdGVkKHg6IGZsb2F0LCB6OiBmbG9hdCkge1xyXG5cclxuICAgICAgICBjb25zdCBpbnRYID0geCB8IDA7XHJcbiAgICAgICAgY29uc3QgaW50WiA9IHogfCAwO1xyXG4gICAgICAgIGNvbnN0IHgwejAgPSB0aGlzLmdldChpbnRYLCBpbnRaKTtcclxuXHJcbiAgICAgICAgaWYgKChpbnRYICsgMSA+PSB0aGlzLndpZHRoKSB8fFxyXG4gICAgICAgICAgICAoaW50WiArIDEgPj0gdGhpcy5kZXB0aCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHgwejA7XHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgY29uc3QgeDF6MCA9IHRoaXMuZ2V0KGludFggKyAxLCBpbnRaKTtcclxuICAgICAgICBjb25zdCB4MHoxID0gdGhpcy5nZXQoaW50WCwgICAgIGludFogKyAxKTtcclxuICAgICAgICBjb25zdCB4MXoxID0gdGhpcy5nZXQoaW50WCArIDEsIGludFogKyAxKTtcclxuICAgIFxyXG4gICAgICAgIGNvbnN0IGZhY3RvclggPSB4IC0gaW50WDtcclxuICAgIFxyXG4gICAgICAgIGNvbnN0IGludGVycG9sYXRlZEJvdHRvbSA9ICh4MXowIC0geDB6MCkgKiBmYWN0b3JYICsgeDB6MDtcclxuICAgICAgICBjb25zdCBpbnRlcnBvbGF0ZWRUb3AgICAgPSAoeDF6MSAtIHgwejEpICogZmFjdG9yWCArIHgwejE7XHJcbiAgICBcclxuICAgICAgICBjb25zdCBmYWN0b3JaID0geiAtIGludFo7XHJcblxyXG4gICAgICAgIGNvbnN0IGZpbmFsSGVpZ2h0ID0gKGludGVycG9sYXRlZFRvcCAtIGludGVycG9sYXRlZEJvdHRvbSkgKiBmYWN0b3JaICsgaW50ZXJwb2xhdGVkQm90dG9tO1xyXG4gICAgXHJcbiAgICAgICAgcmV0dXJuIGZpbmFsSGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhYnN0cmFjdCBhcHBlbmQoeDogaW50LCB6OiBpbnQsIHZhbHVlOiBmbG9hdCk6IGZsb2F0O1xyXG5cclxuICAgIHB1YmxpYyBzdWJzdHJhY3QoeDogaW50LCB6OiBpbnQsIHZhbHVlOiBmbG9hdCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFwcGVuZCh4LCB6LCAtdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhYnN0cmFjdCBtdWx0aXBseSh4OiBpbnQsIHo6IGludCwgdmFsdWU6IGZsb2F0LCBoZWlnaHRJZlplcm8/OiBmbG9hdCk6IGZsb2F0O1xyXG5cclxuICAgIHB1YmxpYyBkaXZpZGUoeDogaW50LCB6OiBpbnQsIHZhbHVlOiBmbG9hdCwgaGVpZ2h0SWZaZXJvOiBmbG9hdCA9IDApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tdWx0aXBseSh4LCB6LCAxIC8gdmFsdWUsIGhlaWdodElmWmVybyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIGZyb21GaWxlKGJ1ZmZlcjogQXJyYXlCdWZmZXIsIG9wdGlvbnM/OiBJSGVpZ2h0TWFwRmlsZUltcG9ydE9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fX2ltcG9ydEZyb21GaWxlKHRoaXMsIGJ1ZmZlciwgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIHRvRmlsZSgpIHtcclxuICAgICAgICBjb25zdCBidWZmZXIgPSBhd2FpdCB0aGlzLl9fZXhwb3J0VG9CdWZmZXIodGhpcyk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCbG9iKFtidWZmZXJdLCB7IHR5cGU6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRvQnVmZmVyKGJ1ZmZlcjogVWludDhBcnJheSB8IFVpbnQ4Q2xhbXBlZEFycmF5KTogdm9pZCB7XHJcblxyXG4gICAgICAgIGNvbnN0IHdpZHRoICA9IHRoaXMud2lkdGg7XHJcbiAgICAgICAgY29uc3QgZGVsdGEgID0gdGhpcy5tYXhIZWlnaHQgLSB0aGlzLm1pbkhlaWdodDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgeiA9IDA7IHogPCB0aGlzLmRlcHRoOyB6KyspIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgY29uc3QgaCAgID0gdGhpcy5nZXQoeCwgeik7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2ICAgPSAoaCAtIHRoaXMubWluSGVpZ2h0KSAvIGRlbHRhICogMjU1O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcG9zID0gKHggKyB6ICogd2lkdGgpICogNDtcclxuXHJcbiAgICAgICAgICAgICAgICBidWZmZXJbcG9zXSAgICAgPSB2O1xyXG4gICAgICAgICAgICAgICAgYnVmZmVyW3BvcyArIDFdID0gdjtcclxuICAgICAgICAgICAgICAgIGJ1ZmZlcltwb3MgKyAyXSA9IHY7XHJcbiAgICAgICAgICAgICAgICBidWZmZXJbcG9zICsgM10gPSAyNTU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRvQ2FudmFzKCk6IEhUTUxDYW52YXNFbGVtZW50IHtcclxuXHJcbiAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgICAgY29uc3Qgd2lkdGggID0gdGhpcy53aWR0aDtcclxuICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmRlcHRoO1xyXG5cclxuICAgICAgICBjYW52YXMud2lkdGggID0gd2lkdGg7XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcclxuXHJcbiAgICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICAgIGlmICghY3R4KSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIGNyZWF0ZSBjYW52YXMgMmQgY29udGV4dCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgaW1hZ2VEYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICBjb25zdCBidWZmZXIgICAgPSBpbWFnZURhdGEuZGF0YTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnRvQnVmZmVyKGJ1ZmZlcik7XHJcbiAgICAgICAgY3R4LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xyXG5cclxuICAgICAgICByZXR1cm4gY2FudmFzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2F2ZSBoZWlnaHQgbWFwIHRvIGltYWdlIG9mIGJhc2U2NFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdG9JbWFnZSh0eXBlPzogc3RyaW5nIHwgdW5kZWZpbmVkLCBxdWFsaXR5PzogYW55KTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBjYW52YXMgPSB0aGlzLnRvQ2FudmFzKCk7XHJcbiAgICAgICAgcmV0dXJuIGNhbnZhcy50b0RhdGFVUkwodHlwZSwgcXVhbGl0eSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBMb2FkIGhlaWdodCBtYXAgZnJvbSBpbWFnZVxyXG4gICAgICogQHBhcmFtIGltZyBcclxuICAgICAqL1xyXG4gICAgcHVibGljIGZyb21JbWFnZShpbWc6IEltYWdlQml0bWFwKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IGJ1ZmZlcldpZHRoICA9IGltZy53aWR0aDtcclxuICAgICAgICBjb25zdCBidWZmZXJIZWlnaHQgPSBpbWcuaGVpZ2h0O1xyXG5cclxuICAgICAgICBpZiAoYnVmZmVyV2lkdGggJSAyICE9PSAwIHx8IGJ1ZmZlckhlaWdodCAlIDIgIT09IDApIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWFwIHNpemVzIG5vdCBkaXZpc2libGUgYnkgMiBhcmUgbm90IHN1cHBvcnRlZFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNhbnZhcyAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpITtcclxuXHJcbiAgICAgICAgY2FudmFzLndpZHRoICA9IGJ1ZmZlcldpZHRoO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBidWZmZXJIZWlnaHQ7XHJcbiAgICBcclxuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShpbWcsIDAsIDApO1xyXG5cclxuICAgICAgICBjb25zdCBpbWFnZURhdGEgICA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGJ1ZmZlcldpZHRoLCBidWZmZXJIZWlnaHQpO1xyXG4gICAgICAgIGNvbnN0IGltYWdlQnVmZmVyID0gaW1hZ2VEYXRhLmRhdGE7XHJcblxyXG4gICAgICAgIGNvbnN0IGRlbU1pbk1heCAgID0gdGhpcy5tYXhIZWlnaHQgLSB0aGlzLm1pbkhlaWdodDtcclxuICAgICAgICBjb25zdCBtYXhTZWdtZW50WCA9IHRoaXMud2lkdGggLSAxO1xyXG4gICAgICAgIGNvbnN0IG1heFNlZ21lbnRaID0gdGhpcy5kZXB0aCAtIDE7XHJcbiAgICAgICAgY29uc3QgZmFjdG9yWCAgICAgPSBidWZmZXJXaWR0aCAgLyBtYXhTZWdtZW50WDtcclxuICAgICAgICBjb25zdCBmYWN0b3JaICAgICA9IGJ1ZmZlckhlaWdodCAvIG1heFNlZ21lbnRaO1xyXG5cclxuICAgICAgICBmb3IgKGxldCB6ID0gMDsgeiA8IHRoaXMuZGVwdGg7IHorKykge1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcclxuICAgIFxyXG4gICAgICAgICAgICAgICAgbGV0IG5vcm1hbGl6ZVggPSB4ID09PSBtYXhTZWdtZW50WCA/IHggLSAxIDogeDtcclxuICAgICAgICAgICAgICAgIGxldCBub3JtYWxpemVaID0geiA9PT0gbWF4U2VnbWVudFogPyB6IC0gMSA6IHo7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgaGVpZ2h0TWFwWCA9IChub3JtYWxpemVYICogZmFjdG9yWCkgfCAwO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaGVpZ2h0TWFwWiA9IChub3JtYWxpemVaICogZmFjdG9yWikgfCAwO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHBvcyA9IChoZWlnaHRNYXBYICsgaGVpZ2h0TWFwWiAqIGJ1ZmZlcldpZHRoKSAqIDQ7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByID0gaW1hZ2VCdWZmZXJbcG9zXTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGcgPSBpbWFnZUJ1ZmZlcltwb3MgKyAxXTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGIgPSBpbWFnZUJ1ZmZlcltwb3MgKyAyXTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGEgPSBpbWFnZUJ1ZmZlcltwb3MgKyAzXTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb2VmZiAgPSAociArIGcgKyBiKSAvIDMgLyBhO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5taW5IZWlnaHQgKyBkZW1NaW5NYXggKiBjb2VmZjtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldCh4LCB6LCBoZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgc21vb3RoWm9uZSh6b25lOiBJWm9uZSwgbnA6IGZsb2F0LCByYWRpdXM6IGludCkge1xyXG5cclxuICAgICAgICBpZiAoem9uZS5tYXhYIDwgMCkgcmV0dXJuO1xyXG4gICAgICAgIGlmICh6b25lLm1heFogPCAwKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmIChucCA8IDAgfHwgbnAgPiAxKSByZXR1cm47XHJcbiAgICAgICAgaWYgKHJhZGl1cyA9PT0gMCkgcmFkaXVzID0gMTtcclxuXHJcbiAgICAgICAgY29uc3QgbWluWCA9IE1hdGgubWF4KHpvbmUubWluWCwgMCk7XHJcbiAgICAgICAgY29uc3QgbWluWiA9IE1hdGgubWF4KHpvbmUubWluWiwgMCk7XHJcbiAgICAgICAgY29uc3QgbWF4WCA9IE1hdGgubWluKHpvbmUubWF4WCwgdGhpcy53aWR0aCk7XHJcbiAgICAgICAgY29uc3QgbWF4WiA9IE1hdGgubWluKHpvbmUubWF4WiwgdGhpcy5kZXB0aCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGNwID0gMSAtIG5wO1xyXG5cclxuICAgICAgICBmb3IgKGxldCB4ID0gbWluWDsgeCA8IG1heFg7IHgrKykge1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgeiA9IG1pblo7IHogPCBtYXhaOyB6KyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2SGVpZ2h0ID0gdGhpcy5nZXQoeCwgeik7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHVwZHRIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgbmVpZ2hOdW1iZXIgID0gMDtcclxuICAgICAgICAgICAgICAgIGxldCBuZWlnaEF2ZXJhZ2UgPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHJ4ID0gLXJhZGl1czsgcnggPD0gcmFkaXVzOyByeCsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHJ6ID0gLXJhZGl1czsgcnogPD0gcmFkaXVzOyByeisrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbm5lclggPSAoeCArIHJ4KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5uZXJaID0gKHogKyByeik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5uZXJYIDwgMCB8fCBpbm5lclggPj0gdGhpcy53aWR0aCkgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbm5lclogPCAwIHx8IGlubmVyWiA+PSB0aGlzLmRlcHRoKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IChpbm5lclggPT09IHggJiYgaW5uZXJaID09PSB6KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBwcmV2SGVpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHRoaXMuZ2V0KGlubmVyWCwgaW5uZXJaKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5laWdoTnVtYmVyKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5laWdoQXZlcmFnZSArPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIG5laWdoQXZlcmFnZSAvPSBuZWlnaE51bWJlcjtcclxuICAgICAgICAgICAgICAgIHVwZHRIZWlnaHQgPSBuZWlnaEF2ZXJhZ2UgKiBucCArIHByZXZIZWlnaHQgKiBjcDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldCh4LCB6LCB1cGR0SGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc21vb3RoKG5wOiBmbG9hdCwgcmFkaXVzOiBpbnQpIHtcclxuICAgICAgICB0aGlzLnNtb290aFpvbmUodGhpcywgbnAsIHJhZGl1cyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG5vcm1hbGl6ZShtaW5IZWlnaHQ6IGZsb2F0LCBtYXhIZWlnaHQ6IGZsb2F0KSB7XHJcblxyXG4gICAgICAgIGlmIChtaW5IZWlnaHQgPiBtYXhIZWlnaHQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbWluTWF4RGVsdGEgPSB0aGlzLm1heEhlaWdodCAtIHRoaXMubWluSGVpZ2h0O1xyXG4gICAgICAgIGNvbnN0IG1pbk1heFJhbmdlID0gbWF4SGVpZ2h0IC0gbWluSGVpZ2h0O1xyXG5cclxuICAgICAgICBmb3IgKGxldCB6ID0gMDsgeiA8IHRoaXMuZGVwdGg7IHorKykge1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50SGVpZ2h0ICAgPSB0aGlzLmdldCh4LCB6KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZUhlaWdodCA9ICgoY3VycmVudEhlaWdodCAtIG1pbkhlaWdodCkgLyBtaW5NYXhEZWx0YSkgKiBtaW5NYXhSYW5nZSArIG1heEhlaWdodDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldCh4LCB6LCBub3JtYWxpemVIZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjb21iaW5lSGVpZ2h0cyhcclxuICAgICAgICB0eXBlOiAnKycgfCAnLScgfCAnKicgfCAnLycsXHJcbiAgICAgICAgaGVpZ2h0TWFwOiBBYnNIZWlnaHRNYXAsXHJcbiAgICAgICAgdmFsdWU6IGZsb2F0LFxyXG4gICAgICAgIHpvbmU6IElab25lLFxyXG4gICAgICAgIGhlaWdodElmWmVybzogZmxvYXQgPSAwLFxyXG4gICAgICAgIG1pbkhlaWdodDogZmxvYXQgfCBudWxsID0gbnVsbCxcclxuICAgICAgICBtYXhIZWlnaHQ6IGZsb2F0IHwgbnVsbCA9IG51bGxcclxuICAgICkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh6b25lLm1heFggPCAwKSByZXR1cm47XHJcbiAgICAgICAgaWYgKHpvbmUubWF4WiA8IDApIHJldHVybjtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBsZW5YID0gem9uZS5tYXhYIC0gem9uZS5taW5YO1xyXG4gICAgICAgIGNvbnN0IGxlblogPSB6b25lLm1heFogLSB6b25lLm1pblo7XHJcblxyXG4gICAgICAgIGlmIChsZW5YIDwgMSB8fCBsZW5aIDwgMSB8fCB2YWx1ZSA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmaXhlZE1pblggPSBNYXRoLm1heCh6b25lLm1pblgsIDApO1xyXG4gICAgICAgIGNvbnN0IGZpeGVkTWluWiA9IE1hdGgubWF4KHpvbmUubWluWiwgMCk7XHJcbiAgICAgICAgY29uc3QgZml4ZWRNYXhYID0gTWF0aC5taW4oem9uZS5tYXhYLCB0aGlzLndpZHRoKTtcclxuICAgICAgICBjb25zdCBmaXhlZE1heFogPSBNYXRoLm1pbih6b25lLm1heFosIHRoaXMuZGVwdGgpO1xyXG5cclxuICAgICAgICBjb25zdCBjb2VmZkZhY3RvclggPSAoaGVpZ2h0TWFwLndpZHRoIC0gMSkgLyBsZW5YO1xyXG4gICAgICAgIGNvbnN0IGNvZWZmRmFjdG9yWiA9IChoZWlnaHRNYXAuZGVwdGggLSAxKSAvIGxlblo7XHJcblxyXG4gICAgICAgIGZvciAobGV0IHogPSBmaXhlZE1pblo7IHogPCBmaXhlZE1heFo7IHorKykge1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgeCA9IGZpeGVkTWluWDsgeCA8IGZpeGVkTWF4WDsgeCsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgeDIgPSAoY29lZmZGYWN0b3JYICogKHggLSB6b25lLm1pblgpKSB8IDA7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB6MiA9IChjb2VmZkZhY3RvclogKiAoeiAtIHpvbmUubWluWikpIHwgMDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IGhlaWdodE1hcC5nZXQoeDIsIHoyKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNtb290aEFwcGVuZFZhbHVlID0gaGVpZ2h0ICogdmFsdWU7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkSGVpZ2h0ID0gdGhpcy5nZXQoeCwgeikgfHwgaGVpZ2h0SWZaZXJvO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBjYW5kaWRhdGUgPSB0eXBlID09PSAnKycgPyBvbGRIZWlnaHQgKyBzbW9vdGhBcHBlbmRWYWx1ZSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA9PT0gJy0nID8gb2xkSGVpZ2h0IC0gc21vb3RoQXBwZW5kVmFsdWUgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUgPT09ICcqJyA/IG9sZEhlaWdodCAqIHNtb290aEFwcGVuZFZhbHVlIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlID09PSAnLycgPyBvbGRIZWlnaHQgLyBzbW9vdGhBcHBlbmRWYWx1ZSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAobWluSGVpZ2h0ICE9PSBudWxsICYmIGNhbmRpZGF0ZSA8IG1pbkhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbmRpZGF0ZSA9IG1pbkhlaWdodDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKG1heEhlaWdodCAhPT0gbnVsbCAmJiBjYW5kaWRhdGUgPiBtYXhIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYW5kaWRhdGUgPSBtYXhIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoeCwgeiwgY2FuZGlkYXRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQWJzSGVpZ2h0TWFwOyIsImltcG9ydCB7IElWZWN0b3IyLCBJVmVjdG9yMywgUmVmT2JqZWN0LCBmbG9hdCwgaW50IH0gZnJvbSBcIi4uL1NoYXJlZC9UeXBlcy5tanNcIjtcclxuaW1wb3J0IEFic0hlaWdodE1hcCwgeyBJUmVhZG9ubHlBYnNIZWlnaHRNYXAgfSBmcm9tIFwiLi9BYnNIZWlnaHRNYXAubWpzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElWZXJ0ZXhIZWlnaHRzSW5mbyB7XHJcbiAgICBtaW5IZWlnaHQ6IGZsb2F0O1xyXG4gICAgbWF4SGVpZ2h0OiBmbG9hdDtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJQ29vcmRzUmVhZGVyIHtcclxuICAgIHdpZHRoOiBudW1iZXI7XHJcbiAgICBnZXRQb3NpdGlvbihpbmRleDogaW50LCBidWY6IFJlZk9iamVjdDxJVmVjdG9yMz4pOiBib29sZWFuO1xyXG4gICAgZ2V0UG9zaXRpb25XaXRoSGVpZ2h0QnlGYWN0b3IoaW5kZXg6IGludCwgYnVmOiBSZWZPYmplY3Q8SVZlY3RvcjM+KTogYm9vbGVhbjtcclxuICAgIGdldENvb3JkcyhpbmRleDogaW50LCBidWY6IFJlZk9iamVjdDxJVmVjdG9yMj4pOiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElSZWFkb25seUNvb3Jkc0J1ZmZlciBleHRlbmRzIElDb29yZHNSZWFkZXIge1xyXG5cclxuICAgIHJlYWRvbmx5IGhlaWdodE1hcDogSVJlYWRvbmx5QWJzSGVpZ2h0TWFwO1xyXG4gICAgcmVhZG9ubHkgcGF0Y2hWZXJ0ZXhCdWZmZXJMZW5ndGg6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHBhdGNoVmVydGV4QnVmZmVyVHlwZWQ6IFVpbnQxNkFycmF5IHwgVWludDhBcnJheTtcclxuICAgIHJlYWRvbmx5IHBhdGNoVmVydGV4QnVmZmVyRGF0YTogUmVhZG9ubHk8QXJyYXlCdWZmZXI+O1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgY29vcmRzVmVydGV4U2l6ZSA9IDI7XHJcblxyXG5leHBvcnQgY2xhc3MgQ29vcmRzQnVmZmVyIGltcGxlbWVudHMgSVJlYWRvbmx5Q29vcmRzQnVmZmVyIHtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBfd2lkdGg6IGludDtcclxuICAgIHByaXZhdGUgX2RlcHRoOiBpbnQ7XHJcbiAgICBwcml2YXRlIF9wYXRjaFNpemU6IGludDtcclxuICAgIHByaXZhdGUgX2RhdGE6IEFycmF5QnVmZmVyO1xyXG4gICAgcHJpdmF0ZSBfZGF0YVR5cGVkOiBVaW50MTZBcnJheTtcclxuICAgIHByaXZhdGUgX2xlbmd0aDogbnVtYmVyO1xyXG5cclxuICAgIHJlYWRvbmx5IGhlaWdodE1hcDogQWJzSGVpZ2h0TWFwO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgcGF0Y2hWZXJ0ZXhCdWZmZXJMZW5ndGgoKSB7IHJldHVybiB0aGlzLl9sZW5ndGg7IH1cclxuICAgIHB1YmxpYyBnZXQgcGF0Y2hWZXJ0ZXhCdWZmZXJEYXRhKCkgICB7IHJldHVybiB0aGlzLl9kYXRhOyB9XHJcbiAgICBwdWJsaWMgZ2V0IHBhdGNoVmVydGV4QnVmZmVyVHlwZWQoKSAgeyByZXR1cm4gdGhpcy5fZGF0YVR5cGVkOyB9XHJcblxyXG4gICAgcHVibGljIGdldCB3aWR0aCgpICAgICAgIHsgcmV0dXJuIHRoaXMuX3dpZHRoOyB9XHJcbiAgICBwdWJsaWMgZ2V0IGRlcHRoKCkgICAgICAgeyByZXR1cm4gdGhpcy5fZGVwdGg7IH1cclxuICAgIHB1YmxpYyBnZXQgcGF0Y2hTaXplKCkgICB7IHJldHVybiB0aGlzLl9wYXRjaFNpemU7IH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihoZWlnaHRNYXA6IEFic0hlaWdodE1hcCwgcGF0Y2hTaXplOiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgdGhpcy5oZWlnaHRNYXAgID0gaGVpZ2h0TWFwO1xyXG5cclxuICAgICAgICAvLyBXZSBjYW4gdXNlIHVpbnQ4IGZvciBwYXRjaGVzIHNtYWxsZXIgdGhhbiAyNTUsIGJ1dCB3ZSBvbmx5IHVzZSAyIGJ5dGVzLFxyXG4gICAgICAgIC8vIGZvciBvcHRpbWFsIHBlcmZvcm1hbmNlIG5lZWQgNCBieXRlcyBmb3IgdGhlIGJ1ZmZlci5cclxuXHJcbiAgICAgICAgdGhpcy5fcGF0Y2hTaXplID0gcGF0Y2hTaXplO1xyXG4gICAgICAgIHRoaXMuX3dpZHRoID0gaGVpZ2h0TWFwLndpZHRoO1xyXG4gICAgICAgIHRoaXMuX2RlcHRoID0gaGVpZ2h0TWFwLmRlcHRoO1xyXG4gICAgICAgIHRoaXMuX2xlbmd0aCA9IHRoaXMuX3BhdGNoU2l6ZSAqIHRoaXMuX3BhdGNoU2l6ZTtcclxuXHJcbiAgICAgICAgY29uc3QgY29vcmRzQXJyTGVuZ3RoICA9IHRoaXMuX2xlbmd0aCAqIGNvb3Jkc1ZlcnRleFNpemU7XHJcbiAgICAgICAgY29uc3QgY29vcmRzQnl0ZUxlbmd0aCA9IGNvb3Jkc0Fyckxlbmd0aCAqIFVpbnQxNkFycmF5LkJZVEVTX1BFUl9FTEVNRU5UO1xyXG5cclxuICAgICAgICB0aGlzLl9kYXRhICAgICAgPSBuZXcgQXJyYXlCdWZmZXIoY29vcmRzQnl0ZUxlbmd0aCk7XHJcbiAgICAgICAgdGhpcy5fZGF0YVR5cGVkID0gbmV3IFVpbnQxNkFycmF5KHRoaXMuX2RhdGEsIDAsIGNvb3Jkc0Fyckxlbmd0aCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBpbml0KCkge1xyXG5cclxuICAgICAgICBsZXQgaW5kZXggPSAwO1xyXG5cclxuICAgICAgICBmb3IgKGxldCB6ID0gMDsgeiA8IHRoaXMuX3BhdGNoU2l6ZTsgeisrKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMuX3BhdGNoU2l6ZTsgeCsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fZGF0YVR5cGVkW2luZGV4KytdID0geDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2RhdGFUeXBlZFtpbmRleCsrXSA9IHo7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXRQb3NpdGlvbihpbmRleDogaW50LCBidWY6IFJlZk9iamVjdDxJVmVjdG9yMz4pIHtcclxuXHJcbiAgICAgICAgY29uc3QgeCA9IGluZGV4ICUgdGhpcy5fd2lkdGggfCAwO1xyXG4gICAgICAgIGNvbnN0IHogPSBpbmRleCAvIHRoaXMuX3dpZHRoIHwgMDtcclxuXHJcbiAgICAgICAgYnVmLnggPSB4O1xyXG4gICAgICAgIGJ1Zi55ID0gdGhpcy5oZWlnaHRNYXAuZ2V0KHgsIHopO1xyXG4gICAgICAgIGJ1Zi56ID0gejtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0UG9zaXRpb25XaXRoSGVpZ2h0QnlGYWN0b3IoaW5kZXg6IGludCwgYnVmOiBSZWZPYmplY3Q8SVZlY3RvcjM+KSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHggPSBpbmRleCAlIHRoaXMuX3dpZHRoIHwgMDtcclxuICAgICAgICBjb25zdCB6ID0gaW5kZXggLyB0aGlzLl93aWR0aCB8IDA7XHJcblxyXG4gICAgICAgIGJ1Zi54ID0geDtcclxuICAgICAgICBidWYueSA9IHRoaXMuaGVpZ2h0TWFwLmdldEZhY3Rvcih4LCB6KTtcclxuICAgICAgICBidWYueiA9IHo7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldENvb3JkcyhpbmRleDogbnVtYmVyLCBidWY6IElWZWN0b3IzKTogYm9vbGVhbiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHggPSBpbmRleCAlIHRoaXMuX3dpZHRoIHwgMDtcclxuICAgICAgICBjb25zdCB6ID0gaW5kZXggLyB0aGlzLl93aWR0aCB8IDA7XHJcblxyXG4gICAgICAgIGJ1Zi54ID0geDtcclxuICAgICAgICBidWYueiA9IHo7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvb3Jkc0J1ZmZlcjsiLCJpbXBvcnQgdHlwZSB7IGZsb2F0LCBpbnQgfSBmcm9tIFwiLi4vU2hhcmVkL1R5cGVzLm1qc1wiO1xuaW1wb3J0IEFic0hlaWdodE1hcCwgeyBJUmVhZG9ubHlBYnNIZWlnaHRNYXAgfSBmcm9tIFwiLi9BYnNIZWlnaHRNYXAubWpzXCI7XG5cbmV4cG9ydCB0eXBlICBIZWlnaHRNYXBBcnJUeXBlID0gRmxvYXQzMkFycmF5O1xuZXhwb3J0IGNvbnN0IEhlaWdodE1hcEFyclR5cGUgPSBGbG9hdDMyQXJyYXk7XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0SGVpZ2h0VmVydGV4U2l6ZTogaW50ID0gMTtcblxuZXhwb3J0IGludGVyZmFjZSBJUmVhZG9ubHlIZWlnaHRNYXA8VERhdGEgPSBIZWlnaHRNYXBBcnJUeXBlPiBleHRlbmRzIElSZWFkb25seUFic0hlaWdodE1hcCB7XG4gICAgcmVhZG9ubHkgaXRlbVNpemU6IGludDtcbiAgICByZWFkb25seSBpdGVtSGVpZ2h0SW5kZXhPZmZzZXQ6IGludDtcbiAgICByZWFkb25seSBkYXRhOiBURGF0YTtcbn1cblxuZXhwb3J0IGNsYXNzIEhlaWdodE1hcDxURGF0YSBleHRlbmRzIEZsb2F0MzJBcnJheSB8IFVpbnQxNkFycmF5IHwgVWludDhBcnJheSA9IEhlaWdodE1hcEFyclR5cGU+IGV4dGVuZHMgQWJzSGVpZ2h0TWFwIGltcGxlbWVudHMgSVJlYWRvbmx5SGVpZ2h0TWFwPFREYXRhPiB7XG5cbiAgICBwcml2YXRlIF93aWR0aDogaW50ID0gMDtcbiAgICBwcml2YXRlIF9kZXB0aDogaW50ID0gMDtcbiAgICBwcml2YXRlIF9taW5IZWlnaHQ6IGZsb2F0ID0gMDtcbiAgICBwcml2YXRlIF9tYXhIZWlnaHQ6IGZsb2F0ID0gMDtcbiAgICBwcml2YXRlIF9kYXRhOiBURGF0YTtcbiAgICBcbiAgICBwcml2YXRlIF9pdGVtU2l6ZTogaW50O1xuICAgIHByaXZhdGUgX2l0ZW1IZWlnaHRJbmRleE9mZnNldDogaW50O1xuICAgIFxuICAgIHB1YmxpYyBnZXQgc2l6ZSgpICB7IHJldHVybiB0aGlzLl93aWR0aCAqIHRoaXMuX2RlcHRoOyB9XG4gICAgcHVibGljIGdldCB3aWR0aCgpIHsgcmV0dXJuIHRoaXMuX3dpZHRoOyB9XG4gICAgcHVibGljIGdldCBkZXB0aCgpIHsgcmV0dXJuIHRoaXMuX2RlcHRoOyB9XG4gICAgcHVibGljIGdldCBkYXRhKCkgIHsgcmV0dXJuIHRoaXMuX2RhdGEgfVxuXG4gICAgcHVibGljIGdldCBpdGVtU2l6ZSgpICAgICAgICAgICAgICB7IHJldHVybiB0aGlzLl9pdGVtU2l6ZTsgfVxuICAgIHB1YmxpYyBnZXQgaXRlbUhlaWdodEluZGV4T2Zmc2V0KCkgeyByZXR1cm4gdGhpcy5faXRlbUhlaWdodEluZGV4T2Zmc2V0OyB9XG5cbiAgICBwdWJsaWMgZ2V0IG1pbkhlaWdodCgpICB7IHJldHVybiB0aGlzLl9taW5IZWlnaHQ7IH1cbiAgICBwdWJsaWMgZ2V0IG1heEhlaWdodCgpICB7IHJldHVybiB0aGlzLl9tYXhIZWlnaHQ7IH1cblxuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvcih3aWR0aDogaW50LCBkZXB0aDogaW50LCBtaW5IZWlnaHQ6IGZsb2F0LCBtYXhIZWlnaHQ6IGZsb2F0KTtcbiAgICBwdWJsaWMgY29uc3RydWN0b3Iod2lkdGg6IGludCwgZGVwdGg6IGludCwgbWluSGVpZ2h0OiBmbG9hdCwgbWF4SGVpZ2h0OiBmbG9hdCwgYnVmZmVyOiBURGF0YSwgaXRlbVNpemU/OiBpbnQsIGl0ZW1IZWlnaHRJbmRleE9mZnNldD86IGludCk7XG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHdpZHRoOiBpbnQsIGRlcHRoOiBpbnQsIG1pbkhlaWdodDogZmxvYXQsIG1heEhlaWdodDogZmxvYXQsIGJ1ZmZlcj86IFREYXRhIHwgdW5kZWZpbmVkLCBpdGVtU2l6ZTogaW50ID0gZGVmYXVsdEhlaWdodFZlcnRleFNpemUsIGl0ZW1IZWlnaHRJbmRleE9mZnNldDogaW50ID0gMCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLl9pbml0KHdpZHRoLCBkZXB0aCwgbWluSGVpZ2h0LCBtYXhIZWlnaHQsIGJ1ZmZlciEsIGl0ZW1TaXplLCBpdGVtSGVpZ2h0SW5kZXhPZmZzZXQpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBfaW5pdCh3aWR0aDogaW50LCBkZXB0aDogaW50LCBtaW5IZWlnaHQ6IGZsb2F0LCBtYXhIZWlnaHQ6IGZsb2F0KTogdm9pZDtcbiAgICBwcm90ZWN0ZWQgX2luaXQod2lkdGg6IGludCwgZGVwdGg6IGludCwgbWluSGVpZ2h0OiBmbG9hdCwgbWF4SGVpZ2h0OiBmbG9hdCwgYnVmZmVyOiBURGF0YSwgaXRlbVNpemU/OiBpbnQsIGl0ZW1IZWlnaHRJbmRleE9mZnNldD86IGludCk6IHZvaWQ7XG4gICAgcHJvdGVjdGVkIF9pbml0KHdpZHRoOiBpbnQsIGRlcHRoOiBpbnQsIG1pbkhlaWdodDogZmxvYXQsIG1heEhlaWdodDogZmxvYXQsIGJ1ZmZlcj86IFREYXRhIHwgdW5kZWZpbmVkLCBpdGVtU2l6ZTogaW50ID0gZGVmYXVsdEhlaWdodFZlcnRleFNpemUsIGl0ZW1IZWlnaHRJbmRleE9mZnNldDogaW50ID0gMCk6IHZvaWQge1xuXG4gICAgICAgIHRoaXMuX3dpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuX2RlcHRoID0gZGVwdGg7XG4gICAgICAgIHRoaXMuX21heEhlaWdodCA9IG1pbkhlaWdodDtcbiAgICAgICAgdGhpcy5fbWF4SGVpZ2h0ID0gbWF4SGVpZ2h0O1xuXG4gICAgICAgIGlmIChidWZmZXIpIHtcblxuICAgICAgICAgICAgaWYgKGl0ZW1TaXplIDwgaXRlbUhlaWdodEluZGV4T2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSXRlbVNpemUgY2FuJ3QgbGVzcyBvciBlcSBJdGVtSGVpZ2h0SW5kZXhPZmZzZXRcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChidWZmZXIubGVuZ3RoIDwgKHdpZHRoICogZGVwdGgpICogaXRlbVNpemUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCdWZmZXIgaGFzIGludmFsaWQgbGVuZ3RoXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9kYXRhID0gYnVmZmVyO1xuICAgICAgICAgICAgdGhpcy5faXRlbVNpemUgPSBpdGVtU2l6ZTtcbiAgICAgICAgICAgIHRoaXMuX2l0ZW1IZWlnaHRJbmRleE9mZnNldCA9IGl0ZW1IZWlnaHRJbmRleE9mZnNldDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRPRE86IHR5cGUgY2hlY2tlclxuICAgICAgICAgICAgdGhpcy5fZGF0YSA9IG5ldyBIZWlnaHRNYXBBcnJUeXBlKHdpZHRoICogZGVwdGggKiBkZWZhdWx0SGVpZ2h0VmVydGV4U2l6ZSkgYXMgdW5rbm93biBhcyBURGF0YTtcbiAgICAgICAgICAgIHRoaXMuX2l0ZW1TaXplID0gZGVmYXVsdEhlaWdodFZlcnRleFNpemU7XG4gICAgICAgICAgICB0aGlzLl9pdGVtSGVpZ2h0SW5kZXhPZmZzZXQgPSAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIF9lbmNvZGVIZWlnaHRGYWN0b3Ioc3RvcmU6IFREYXRhLCBpbmRleDogaW50LCB2YWx1ZTogZmxvYXQpIHtcbiAgICAgICAgc3RvcmVbaW5kZXhdID0gdmFsdWU7XG4gICAgfVxuICAgIFxuICAgIHByb3RlY3RlZCBfZGVjb2RlSGVpZ2h0RmFjdG9yKHN0b3JlOiBSZWNvcmQ8bnVtYmVyLCBudW1iZXI+LCBpbmRleDogaW50KSB7XG4gICAgICAgIHJldHVybiBzdG9yZVtpbmRleF07XG4gICAgfVxuICAgIFxuICAgIHByb3RlY3RlZCBfZGVjb2RlSGVpZ2h0KHN0b3JlOiBSZWNvcmQ8bnVtYmVyLCBudW1iZXI+LCBpbmRleDogaW50LCBtaW46IGZsb2F0LCBtYXg6IGZsb2F0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWNvZGVIZWlnaHRGYWN0b3Ioc3RvcmUsIGluZGV4KSAqIChtYXggLSBtaW4pICsgbWluO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBfZW5jb2RlQW5kU2V0SGVpZ2h0RmFjdG9yKHN0b3JlOiBURGF0YSwgaW5kZXg6IGludCwgcmVhbEhlaWdodDogZmxvYXQsIG1pbjogZmxvYXQsIG1heDogZmxvYXQpIHtcblxuICAgICAgICBjb25zdCBub3JtYWxpemUgPSBNYXRoLm1heChNYXRoLm1pbihyZWFsSGVpZ2h0LCBtYXgpLCBtaW4pO1xuICAgICAgICBjb25zdCBmYWN0b3IgICAgPSAobm9ybWFsaXplIC0gbWluKSAvIChtYXggLSBtaW4pO1xuICAgIFxuICAgICAgICAgICAgICAgdGhpcy5fZW5jb2RlSGVpZ2h0RmFjdG9yKHN0b3JlLCBpbmRleCwgZmFjdG9yKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlY29kZUhlaWdodEZhY3RvcihzdG9yZSwgaW5kZXgpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0SW5kZXgoeDogaW50LCB6OiBpbnQpIHtcbiAgICAgICAgcmV0dXJuICh6ICogdGhpcy5fd2lkdGggKyB4KSAqIHRoaXMuX2l0ZW1TaXplICsgdGhpcy5faXRlbUhlaWdodEluZGV4T2Zmc2V0O1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRGYWN0b3IoeDogaW50LCB6OiBpbnQpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmdldEluZGV4KHgsIHopO1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVjb2RlSGVpZ2h0RmFjdG9yKHRoaXMuX2RhdGEsIGluZGV4KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0KHg6IGludCwgejogaW50KSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5nZXRJbmRleCh4LCB6KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlY29kZUhlaWdodCh0aGlzLl9kYXRhLCBpbmRleCwgdGhpcy5fbWluSGVpZ2h0LCB0aGlzLl9tYXhIZWlnaHQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzZXQoeDogaW50LCB6OiBpbnQsIHZhbHVlOiBmbG9hdCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuZ2V0SW5kZXgoeCwgeik7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbmNvZGVBbmRTZXRIZWlnaHRGYWN0b3IodGhpcy5fZGF0YSwgaW5kZXgsIHZhbHVlLCB0aGlzLl9taW5IZWlnaHQsIHRoaXMuX21heEhlaWdodCk7XG4gICAgfVxuXG4gICAgcHVibGljIHNldE1pbk1heEhlaWdodChtaW5IZWlnaHQ6IGZsb2F0LCBtYXhIZWlnaHQ6IGZsb2F0KSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX21pbkhlaWdodCA+IHRoaXMuX21heEhlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbWluSGVpZ2h0ID0gbWluSGVpZ2h0O1xuICAgICAgICB0aGlzLl9tYXhIZWlnaHQgPSBtYXhIZWlnaHQ7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIGFwcGVuZCh4OiBpbnQsIHo6IGludCwgdmFsdWU6IGZsb2F0KSB7XG5cbiAgICAgICAgY29uc3QgaW5kZXggICAgID0gdGhpcy5nZXRJbmRleCh4LCB6KTtcbiAgICAgICAgY29uc3Qgb2xkVmFsdWUgID0gdGhpcy5fZGVjb2RlSGVpZ2h0KHRoaXMuX2RhdGEsIGluZGV4LCB0aGlzLl9taW5IZWlnaHQsIHRoaXMuX21heEhlaWdodCk7XG4gICAgICAgIGNvbnN0IGNhblZhbHVlICA9IG9sZFZhbHVlICsgdmFsdWU7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2VuY29kZUFuZFNldEhlaWdodEZhY3Rvcih0aGlzLl9kYXRhLCBpbmRleCwgY2FuVmFsdWUsIHRoaXMuX21pbkhlaWdodCwgdGhpcy5fbWF4SGVpZ2h0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgbXVsdGlwbHkoeDogaW50LCB6OiBpbnQsIHZhbHVlOiBmbG9hdCwgaGVpZ2h0SWZaZXJvOiBmbG9hdCA9IDApIHtcblxuICAgICAgICBjb25zdCBpbmRleCAgICAgPSB0aGlzLmdldEluZGV4KHgsIHopO1xuICAgICAgICBjb25zdCBvbGRWYWx1ZSAgPSB0aGlzLl9kZWNvZGVIZWlnaHQodGhpcy5fZGF0YSwgaW5kZXgsIHRoaXMuX21pbkhlaWdodCwgdGhpcy5fbWF4SGVpZ2h0KSB8fCBoZWlnaHRJZlplcm87XG4gICAgICAgIGNvbnN0IGNhblZhbHVlICA9IG9sZFZhbHVlICogdmFsdWU7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2VuY29kZUFuZFNldEhlaWdodEZhY3Rvcih0aGlzLl9kYXRhLCBpbmRleCwgY2FuVmFsdWUsIHRoaXMuX21pbkhlaWdodCwgdGhpcy5fbWF4SGVpZ2h0KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEhlaWdodE1hcDsiLCJpbXBvcnQgdHlwZSB7IGZsb2F0LCBpbnQgfSBmcm9tIFwiLi4vU2hhcmVkL1R5cGVzLm1qc1wiO1xyXG5pbXBvcnQgdHlwZSB7IElab25lIH0gZnJvbSBcIi4vSVpvbmUubWpzXCI7XHJcbmltcG9ydCB0eXBlIHsgSVJlYWRvbmx5QWJzSGVpZ2h0TWFwIH0gZnJvbSBcIi4vQWJzSGVpZ2h0TWFwLm1qc1wiO1xyXG5pbXBvcnQgSGVpZ2h0TWFwLCB7IEhlaWdodE1hcEFyclR5cGUsIGRlZmF1bHRIZWlnaHRWZXJ0ZXhTaXplLCBJUmVhZG9ubHlIZWlnaHRNYXAgfSBmcm9tIFwiLi9IZWlnaHRNYXAubWpzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElSZWFkb25seUFic1BhdGNoZWRIZWlnaHRNYXAgZXh0ZW5kcyBJUmVhZG9ubHlBYnNIZWlnaHRNYXAge1xyXG5cclxuICAgIHJlYWRvbmx5IGRhdGFDaHVua1NpemU6IGludDtcclxuICAgIHJlYWRvbmx5IGRhdGFOdW1DaHVua3NYOiBpbnQ7XHJcbiAgICByZWFkb25seSBkYXRhTnVtQ2h1bmtzWjogaW50O1xyXG4gICAgcmVhZG9ubHkgZGF0YUNodW5rU2l6ZUZhY3RvcjogZmxvYXQ7XHJcbiAgICByZWFkb25seSBwYXRjaFNpemU6IGludDtcclxuICAgIHJlYWRvbmx5IG51bVBhdGNoZXNYOiBpbnQ7XHJcbiAgICByZWFkb25seSBudW1QYXRjaGVzWjogaW50O1xyXG5cclxuICAgIGdldE1pbigpOiBmbG9hdDtcclxuICAgIGdldE1heCgpOiBmbG9hdDtcclxuICAgIGdldE1pbkZhY3RvcigpOiBmbG9hdDtcclxuICAgIGdldE1heEZhY3RvcigpOiBmbG9hdDtcclxuICAgIGdldEVudHJpZXNQYXRjaE1pbih4OiBmbG9hdCwgejogZmxvYXQpOiBmbG9hdDtcclxuICAgIGdldEVudHJpZXNQYXRjaE1heCh4OiBmbG9hdCwgejogZmxvYXQpOiBmbG9hdDtcclxuICAgIGdldEVudHJpZXNQYXRjaE1pbkZhY3Rvcih4OiBmbG9hdCwgejogZmxvYXQpOiBmbG9hdDtcclxuICAgIGdldEVudHJpZXNQYXRjaE1heEZhY3Rvcih4OiBmbG9hdCwgejogZmxvYXQpOiBmbG9hdDtcclxuICAgIGdldFBhdGNoTWluKHBhdGNoQmFzZVg6IGludCwgcGF0Y2hCYXNlWjogaW50KTogZmxvYXQ7XHJcbiAgICBnZXRQYXRjaE1heChwYXRjaEJhc2VYOiBpbnQsIHBhdGNoQmFzZVo6IGludCk6IGZsb2F0O1xyXG4gICAgZ2V0UGF0Y2hNaW5GYWN0b3IocGF0Y2hCYXNlWDogaW50LCBwYXRjaEJhc2VaOiBpbnQpOiBmbG9hdDtcclxuICAgIGdldFBhdGNoTWF4RmFjdG9yKHBhdGNoQmFzZVg6IGludCwgcGF0Y2hCYXNlWjogaW50KTogZmxvYXQ7XHJcblxyXG4gICAgZ2V0Q2h1bmtJbmRleChjaHVua1g6IGludCwgY2h1bmtaOiBpbnQpOiBpbnQ7XHJcbiAgICBnZXRDaHVua0J1ZmZlcih0eXBlOiBGbG9hdDMyQXJyYXlDb25zdHJ1Y3RvciwgY2h1bmtYOiBpbnQsIGNodW5rWjogaW50KTogRmxvYXQzMkFycmF5O1xyXG4gICAgZ2V0Q2h1bmtCdWZmZXIodHlwZTogVWludDE2QXJyYXlDb25zdHJ1Y3RvciwgY2h1bmtYOiBpbnQsIGNodW5rWjogaW50KTogVWludDE2QXJyYXk7XHJcbiAgICBnZXRDaHVua0J1ZmZlcih0eXBlOiBVaW50OEFycmF5Q29uc3RydWN0b3IsIGNodW5rWDogaW50LCBjaHVua1o6IGludCk6IFVpbnQ4QXJyYXk7XHJcbiAgICBnZXRDaHVua3NCdWZmZXJzKHR5cGU6IEZsb2F0MzJBcnJheUNvbnN0cnVjdG9yKTogRmxvYXQzMkFycmF5W107XHJcbiAgICBnZXRDaHVua3NCdWZmZXJzKHR5cGU6IFVpbnQxNkFycmF5Q29uc3RydWN0b3IpOiBVaW50MTZBcnJheVtdO1xyXG4gICAgZ2V0Q2h1bmtzQnVmZmVycyh0eXBlOiBVaW50OEFycmF5Q29uc3RydWN0b3IpOiBVaW50OEFycmF5W107XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVJlYWRvbmx5QWJzUGF0Y2hlZEhlaWdodE1hcFR5cHBlZDxURGF0YSBleHRlbmRzIEZsb2F0MzJBcnJheSB8IFVpbnQxNkFycmF5IHwgVWludDhBcnJheSA9IEhlaWdodE1hcEFyclR5cGU+IGV4dGVuZHMgSVJlYWRvbmx5QWJzUGF0Y2hlZEhlaWdodE1hcCwgSVJlYWRvbmx5SGVpZ2h0TWFwPFREYXRhPiB7XHJcblxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgbWluTWF4U3RhY2tTaXplID0gMjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRPclRocm93RGF0YUNodW5rU2l6ZShwYXRjaFNpemU6IGludCwgZGF0YUNodW5rU2l6ZTogaW50KSB7XHJcblxyXG4gICAgaWYgKChkYXRhQ2h1bmtTaXplIC0gMSkgJSAocGF0Y2hTaXplIC0gMSkgIT09IDApIHtcclxuICAgICAgICBjb25zdCByZWNvbW1lbmRlZFdpZHRoID0gKChkYXRhQ2h1bmtTaXplIC0gMSArIHBhdGNoU2l6ZSAtIDEpIC8gKGRhdGFDaHVua1NpemUgLSAxKSkgKiAocGF0Y2hTaXplIC0gMSkgKyAxO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJEYXRhQ2h1bmtTaXplIG1pbnVzIDEgKCVkKSBtdXN0IGJlIGRpdmlzaWJsZSBieSBwYXRjaFNpemUgbWludXMgMSAoJWQpXFxuXCIsIGRhdGFDaHVua1NpemUsIHBhdGNoU2l6ZSk7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIlRyeSB1c2luZyBEYXRhQ2h1bmtTaXplID0gJWRcXG5cIiwgcmVjb21tZW5kZWRXaWR0aCk7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRhdGFDaHVua1NpemU7XHJcbn1cclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBYnNQYXRjaGVkSGVpZ2h0TWFwPFREYXRhIGV4dGVuZHMgRmxvYXQzMkFycmF5IHwgVWludDE2QXJyYXkgfCBVaW50OEFycmF5ID0gSGVpZ2h0TWFwQXJyVHlwZT4gZXh0ZW5kcyBIZWlnaHRNYXA8VERhdGE+IGltcGxlbWVudHMgSVJlYWRvbmx5QWJzUGF0Y2hlZEhlaWdodE1hcFR5cHBlZDxURGF0YT4ge1xyXG5cclxuICAgIHByb3RlY3RlZCBfcGF0Y2hTaXplOiBpbnQ7XHJcbiAgICBwcm90ZWN0ZWQgX251bVBhdGNoZXNYOiBpbnQ7XHJcbiAgICBwcm90ZWN0ZWQgX251bVBhdGNoZXNaOiBpbnQ7XHJcbiAgICBwcm90ZWN0ZWQgX3BhdGNoZXNTZWdtZW50U2l6ZTogaW50O1xyXG4gICAgcHJvdGVjdGVkIF9taW5NYXhIZWlnaHRDb29yZHM6IGludFtdO1xyXG4gICAgcHJvdGVjdGVkIF9taW5IZWlnaHRDb29yZDogaW50W107XHJcbiAgICBwcm90ZWN0ZWQgX21heEhlaWdodENvb3JkOiBpbnRbXTtcclxuICAgIHByb3RlY3RlZCBfZGF0YUNodW5rU2l6ZTogaW50O1xyXG4gICAgcHJvdGVjdGVkIF9kYXRhTnVtQ2h1bmtzWDogaW50O1xyXG4gICAgcHJvdGVjdGVkIF9kYXRhTnVtQ2h1bmtzWjogaW50O1xyXG4gICAgcHJvdGVjdGVkIF9kYXRhQ2h1bmtTaXplRmFjdG9yOiBmbG9hdDtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IHBhdGNoU2l6ZSgpICAgICAgICAgICB7IHJldHVybiB0aGlzLl9wYXRjaFNpemU7IH1cclxuICAgIHB1YmxpYyBnZXQgbnVtUGF0Y2hlc1goKSAgICAgICAgIHsgcmV0dXJuIHRoaXMuX251bVBhdGNoZXNYOyB9XHJcbiAgICBwdWJsaWMgZ2V0IG51bVBhdGNoZXNaKCkgICAgICAgICB7IHJldHVybiB0aGlzLl9udW1QYXRjaGVzWjsgfVxyXG4gICAgcHVibGljIGdldCBkYXRhQ2h1bmtTaXplKCkgICAgICAgeyByZXR1cm4gdGhpcy5fZGF0YUNodW5rU2l6ZTsgfVxyXG4gICAgcHVibGljIGdldCBkYXRhTnVtQ2h1bmtzWCgpICAgICAgeyByZXR1cm4gdGhpcy5fZGF0YU51bUNodW5rc1g7IH1cclxuICAgIHB1YmxpYyBnZXQgZGF0YU51bUNodW5rc1ooKSAgICAgIHsgcmV0dXJuIHRoaXMuX2RhdGFOdW1DaHVua3NaOyB9XHJcbiAgICBwdWJsaWMgZ2V0IGRhdGFDaHVua1NpemVGYWN0b3IoKSB7IHJldHVybiB0aGlzLl9kYXRhQ2h1bmtTaXplRmFjdG9yOyB9XHJcblxyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHdpZHRoOiBpbnQsIGRlcHRoOiBpbnQsIHBhdGNoU2l6ZTogaW50LCBkYXRhQ2h1bmtTaXplOiBpbnQsIG1pbkhlaWdodDogZmxvYXQsIG1heEhlaWdodDogZmxvYXQpO1xyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHdpZHRoOiBpbnQsIGRlcHRoOiBpbnQsIHBhdGNoU2l6ZTogaW50LCBkYXRhQ2h1bmtTaXplOiBpbnQsIG1pbkhlaWdodDogZmxvYXQsIG1heEhlaWdodDogZmxvYXQsIGJ1ZmZlcjogVERhdGEsIGl0ZW1TaXplPzogaW50LCBpdGVtSGVpZ2h0SW5kZXhPZmZzZXQ/OiBpbnQpO1xyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHdpZHRoOiBpbnQsIGRlcHRoOiBpbnQsIHBhdGNoU2l6ZTogaW50LCBkYXRhQ2h1bmtTaXplOiBpbnQsIG1pbkhlaWdodDogZmxvYXQsIG1heEhlaWdodDogZmxvYXQsIGJ1ZmZlcj86IFREYXRhIHwgdW5kZWZpbmVkLCBpdGVtU2l6ZTogaW50ID0gZGVmYXVsdEhlaWdodFZlcnRleFNpemUsIGl0ZW1IZWlnaHRJbmRleE9mZnNldDogaW50ID0gMCkge1xyXG4gICAgICAgIHN1cGVyKHdpZHRoLCBkZXB0aCwgbWluSGVpZ2h0LCBtYXhIZWlnaHQsIGJ1ZmZlciEgLyoqIFRTIGh1Y2sgKi8sIGl0ZW1TaXplLCBpdGVtSGVpZ2h0SW5kZXhPZmZzZXQpO1xyXG4gICAgICAgIHRoaXMuX21pbkhlaWdodENvb3JkID0gWzAsIDBdO1xyXG4gICAgICAgIHRoaXMuX21heEhlaWdodENvb3JkID0gWzAsIDBdO1xyXG4gICAgICAgIHRoaXMuX3NldFBhdGNoU2l6ZShwYXRjaFNpemUpO1xyXG4gICAgICAgIHRoaXMuX3NldERhdGFDaHVua1NpemUoZGF0YUNodW5rU2l6ZSk7XHJcbiAgICAgICAgdGhpcy5fY2xlYXJNaW5NYXhIZWlnaHRDb29yZHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgX3NldFBhdGNoU2l6ZShwYXRjaFNpemU6IGludCkge1xyXG4gICAgICAgIHRoaXMuX3BhdGNoU2l6ZSAgID0gcGF0Y2hTaXplO1xyXG4gICAgICAgIHRoaXMuX251bVBhdGNoZXNYID0gKCh0aGlzLndpZHRoIC0gMSkgLyAodGhpcy5fcGF0Y2hTaXplIC0gMSkpIHwgMDtcclxuICAgICAgICB0aGlzLl9udW1QYXRjaGVzWiA9ICgodGhpcy5kZXB0aCAtIDEpIC8gKHRoaXMuX3BhdGNoU2l6ZSAtIDEpKSB8IDA7XHJcbiAgICAgICAgdGhpcy5fcGF0Y2hlc1NlZ21lbnRTaXplID0gdGhpcy5fbnVtUGF0Y2hlc1ggKiB0aGlzLl9udW1QYXRjaGVzWiAqIG1pbk1heFN0YWNrU2l6ZTtcclxuICAgICAgICB0aGlzLl9taW5NYXhIZWlnaHRDb29yZHMgPSBuZXcgQXJyYXk8aW50Pih0aGlzLl9wYXRjaGVzU2VnbWVudFNpemUgKiAyKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgX3NldERhdGFDaHVua1NpemUodmFsdWU6IGludCkge1xyXG4gICAgICAgIHRoaXMuX2RhdGFDaHVua1NpemUgID0gZ2V0T3JUaHJvd0RhdGFDaHVua1NpemUodGhpcy5fcGF0Y2hTaXplLCB2YWx1ZSk7XHJcbiAgICAgICAgdGhpcy5fZGF0YU51bUNodW5rc1ggPSAoKHRoaXMud2lkdGggLSAxKSAvICh0aGlzLl9kYXRhQ2h1bmtTaXplIC0gMSkpIHwgMDtcclxuICAgICAgICB0aGlzLl9kYXRhTnVtQ2h1bmtzWiA9ICgodGhpcy5kZXB0aCAtIDEpIC8gKHRoaXMuX2RhdGFDaHVua1NpemUgLSAxKSkgfCAwO1xyXG4gICAgICAgIHRoaXMuX2RhdGFDaHVua1NpemVGYWN0b3IgPSB0aGlzLl9wYXRjaFNpemUgLyAodGhpcy5fZGF0YUNodW5rU2l6ZSArIHRoaXMuX3BhdGNoU2l6ZSAtICh0aGlzLl9kYXRhQ2h1bmtTaXplICUgdGhpcy5fcGF0Y2hTaXplKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBvdmVycmlkZSBnZXRJbmRleCh4OiBpbnQsIHo6IGludCk6IGludCB7XHJcblxyXG4gICAgICAgIGNvbnN0IGxvY2FsWCA9IHggJSB0aGlzLl9kYXRhQ2h1bmtTaXplO1xyXG4gICAgICAgIGNvbnN0IGxvY2FsWiA9IHogJSB0aGlzLl9kYXRhQ2h1bmtTaXplO1xyXG4gICAgICAgIGNvbnN0IGNodW5rWCA9IE1hdGguY2VpbCh4IC8gdGhpcy5fZGF0YUNodW5rU2l6ZSkgLSAobG9jYWxYID4gMCA/IDEgOiAwKTtcclxuICAgICAgICBjb25zdCBjaHVua1ogPSBNYXRoLmNlaWwoeiAvIHRoaXMuX2RhdGFDaHVua1NpemUpIC0gKGxvY2FsWiA+IDAgPyAxIDogMCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGNodW5rT2Zmc2V0ID0gKGNodW5rWiAqIHRoaXMuX2RhdGFOdW1DaHVua3NYICsgY2h1bmtYKSAqICh0aGlzLl9kYXRhQ2h1bmtTaXplICoqIDIpO1xyXG4gICAgICAgIGNvbnN0IGxvY2FsSW5kZXggID0gKGxvY2FsWiAqIHRoaXMuX2RhdGFDaHVua1NpemUgKyBsb2NhbFgpO1xyXG5cclxuICAgICAgICByZXR1cm4gY2h1bmtPZmZzZXQgKyBsb2NhbEluZGV4O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0Q2h1bmtJbmRleChjaHVua1g6IGludCwgY2h1bmtaOiBpbnQpOiBpbnQge1xyXG4gICAgICAgIHJldHVybiBjaHVua1ogKiB0aGlzLl9kYXRhTnVtQ2h1bmtzWCArIGNodW5rWDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q2h1bmtCdWZmZXIodHlwZTogRmxvYXQzMkFycmF5Q29uc3RydWN0b3IsIGNodW5rWDogaW50LCBjaHVua1o6IGludCk6IEZsb2F0MzJBcnJheTtcclxuICAgIHB1YmxpYyBnZXRDaHVua0J1ZmZlcih0eXBlOiBVaW50MTZBcnJheUNvbnN0cnVjdG9yLCBjaHVua1g6IGludCwgY2h1bmtaOiBpbnQpOiBVaW50MTZBcnJheTtcclxuICAgIHB1YmxpYyBnZXRDaHVua0J1ZmZlcih0eXBlOiBVaW50OEFycmF5Q29uc3RydWN0b3IsIGNodW5rWDogaW50LCBjaHVua1o6IGludCk6IFVpbnQ4QXJyYXk7XHJcbiAgICBwdWJsaWMgZ2V0Q2h1bmtCdWZmZXIodHlwZTogYW55LCBjaHVua1g6IGludCwgY2h1bmtaOiBpbnQpIHtcclxuICAgICAgICBjb25zdCBzaXplICAgICAgICA9IHRoaXMuZGF0YUNodW5rU2l6ZSAqKiAyO1xyXG4gICAgICAgIGNvbnN0IGNodW5rTGV2ZWwgID0gY2h1bmtaICogdGhpcy5kYXRhTnVtQ2h1bmtzWCArIGNodW5rWDtcclxuICAgICAgICBjb25zdCBjaHVua09mZnNldCA9IGNodW5rTGV2ZWwgKiBzaXplICogdGhpcy5kYXRhLkJZVEVTX1BFUl9FTEVNRU5UO1xyXG4gICAgICAgIGNvbnN0IGNvdW50ICAgICAgID0gc2l6ZSAqICh0aGlzLmRhdGEuQllURVNfUEVSX0VMRU1FTlQgLyB0eXBlLkJZVEVTX1BFUl9FTEVNRU5UKTtcclxuICAgICAgICByZXR1cm4gbmV3IHR5cGUodGhpcy5kYXRhLmJ1ZmZlciwgY2h1bmtPZmZzZXQsIGNvdW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q2h1bmtzQnVmZmVycyh0eXBlOiBGbG9hdDMyQXJyYXlDb25zdHJ1Y3Rvcik6IEZsb2F0MzJBcnJheVtdO1xyXG4gICAgcHVibGljIGdldENodW5rc0J1ZmZlcnModHlwZTogVWludDE2QXJyYXlDb25zdHJ1Y3Rvcik6IFVpbnQxNkFycmF5W107XHJcbiAgICBwdWJsaWMgZ2V0Q2h1bmtzQnVmZmVycyh0eXBlOiBVaW50OEFycmF5Q29uc3RydWN0b3IpOiBVaW50OEFycmF5W107XHJcbiAgICBwdWJsaWMgZ2V0Q2h1bmtzQnVmZmVycyh0eXBlOiBhbnkpIHtcclxuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IEFycmF5KHRoaXMuX2RhdGFOdW1DaHVua3NYICogdGhpcy5fZGF0YU51bUNodW5rc1opO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBjaHVua1ogPSAwOyBjaHVua1ogPCB0aGlzLl9kYXRhTnVtQ2h1bmtzWjsgY2h1bmtaKyspIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGNodW5rWCA9IDA7IGNodW5rWCA8IHRoaXMuX2RhdGFOdW1DaHVua3NYOyBjaHVua1grKykge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IGNodW5rWiAqIHRoaXMuX2RhdGFOdW1DaHVua3NYICsgY2h1bmtYO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IHRoaXMuZ2V0Q2h1bmtCdWZmZXIodHlwZSwgY2h1bmtYLCBjaHVua1opO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRFbnRyaWVzUGF0Y2hNaW4oeDogaW50LCB6OiBpbnQpIHtcclxuICAgICAgICBjb25zdCBwYXRjaFggPSBNYXRoLmNlaWwoeCAvIHRoaXMuX3BhdGNoU2l6ZSkgLSAoeCAlIHRoaXMuX3BhdGNoU2l6ZSA+IDAgPyAxIDogMCk7XHJcbiAgICAgICAgY29uc3QgcGF0Y2haID0gTWF0aC5jZWlsKHogLyB0aGlzLl9wYXRjaFNpemUpIC0gKHogJSB0aGlzLl9wYXRjaFNpemUgPiAwID8gMSA6IDApO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFBhdGNoTWluKHBhdGNoWCwgcGF0Y2haKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0RW50cmllc1BhdGNoTWF4KHg6IGludCwgejogaW50KSB7XHJcbiAgICAgICAgY29uc3QgcGF0Y2hYID0gTWF0aC5jZWlsKHggLyB0aGlzLl9wYXRjaFNpemUpIC0gKHggJSB0aGlzLl9wYXRjaFNpemUgPiAwID8gMSA6IDApO1xyXG4gICAgICAgIGNvbnN0IHBhdGNoWiA9IE1hdGguY2VpbCh6IC8gdGhpcy5fcGF0Y2hTaXplKSAtICh6ICUgdGhpcy5fcGF0Y2hTaXplID4gMCA/IDEgOiAwKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRQYXRjaE1heChwYXRjaFgsIHBhdGNoWik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEVudHJpZXNQYXRjaE1pbkZhY3Rvcih4OiBpbnQsIHo6IGludCkge1xyXG4gICAgICAgIGNvbnN0IHBhdGNoWCA9IE1hdGguY2VpbCh4IC8gdGhpcy5fcGF0Y2hTaXplKSAtICh4ICUgdGhpcy5fcGF0Y2hTaXplID4gMCA/IDEgOiAwKTtcclxuICAgICAgICBjb25zdCBwYXRjaFogPSBNYXRoLmNlaWwoeiAvIHRoaXMuX3BhdGNoU2l6ZSkgLSAoeiAlIHRoaXMuX3BhdGNoU2l6ZSA+IDAgPyAxIDogMCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UGF0Y2hNaW5GYWN0b3IocGF0Y2hYLCBwYXRjaFopO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRFbnRyaWVzUGF0Y2hNYXhGYWN0b3IoeDogaW50LCB6OiBpbnQpIHtcclxuICAgICAgICBjb25zdCBwYXRjaFggPSBNYXRoLmNlaWwoeCAvIHRoaXMuX3BhdGNoU2l6ZSkgLSAoeCAlIHRoaXMuX3BhdGNoU2l6ZSA+IDAgPyAxIDogMCk7XHJcbiAgICAgICAgY29uc3QgcGF0Y2haID0gTWF0aC5jZWlsKHogLyB0aGlzLl9wYXRjaFNpemUpIC0gKHogJSB0aGlzLl9wYXRjaFNpemUgPiAwID8gMSA6IDApO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFBhdGNoTWF4RmFjdG9yKHBhdGNoWCwgcGF0Y2haKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TWluKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldCh0aGlzLl9taW5IZWlnaHRDb29yZFswXSwgdGhpcy5fbWluSGVpZ2h0Q29vcmRbMV0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRNYXgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KHRoaXMuX21heEhlaWdodENvb3JkWzBdLCB0aGlzLl9tYXhIZWlnaHRDb29yZFsxXSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldE1pbkZhY3RvcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRGYWN0b3IodGhpcy5fbWluSGVpZ2h0Q29vcmRbMF0sIHRoaXMuX21pbkhlaWdodENvb3JkWzFdKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TWF4RmFjdG9yKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZhY3Rvcih0aGlzLl9tYXhIZWlnaHRDb29yZFswXSwgdGhpcy5fbWF4SGVpZ2h0Q29vcmRbMV0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRQYXRjaE1pbihwYXRjaEJhc2VYOiBpbnQsIHBhdGNoQmFzZVo6IGludCkge1xyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gKHBhdGNoQmFzZVogKiB0aGlzLl9udW1QYXRjaGVzWCArIHBhdGNoQmFzZVgpICogbWluTWF4U3RhY2tTaXplO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldCh0aGlzLl9taW5NYXhIZWlnaHRDb29yZHNbaW5kZXhdLCB0aGlzLl9taW5NYXhIZWlnaHRDb29yZHNbaW5kZXggKyAxXSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFBhdGNoTWF4KHBhdGNoQmFzZVg6IGludCwgcGF0Y2hCYXNlWjogaW50KSB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSAocGF0Y2hCYXNlWiAqIHRoaXMuX251bVBhdGNoZXNYICsgcGF0Y2hCYXNlWCkgKiBtaW5NYXhTdGFja1NpemUgKyB0aGlzLl9wYXRjaGVzU2VnbWVudFNpemU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KHRoaXMuX21pbk1heEhlaWdodENvb3Jkc1tpbmRleF0sIHRoaXMuX21pbk1heEhlaWdodENvb3Jkc1tpbmRleCArIDFdKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0UGF0Y2hNaW5GYWN0b3IocGF0Y2hCYXNlWDogaW50LCBwYXRjaEJhc2VaOiBpbnQpIHtcclxuICAgICAgICBjb25zdCBpbmRleCA9IChwYXRjaEJhc2VaICogdGhpcy5fbnVtUGF0Y2hlc1ggKyBwYXRjaEJhc2VYKSAqIG1pbk1heFN0YWNrU2l6ZTtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRGYWN0b3IodGhpcy5fbWluTWF4SGVpZ2h0Q29vcmRzW2luZGV4XSwgdGhpcy5fbWluTWF4SGVpZ2h0Q29vcmRzW2luZGV4ICsgMV0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRQYXRjaE1heEZhY3RvcihwYXRjaEJhc2VYOiBpbnQsIHBhdGNoQmFzZVo6IGludCkge1xyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gKHBhdGNoQmFzZVogKiB0aGlzLl9udW1QYXRjaGVzWCArIHBhdGNoQmFzZVgpICogbWluTWF4U3RhY2tTaXplICsgdGhpcy5fcGF0Y2hlc1NlZ21lbnRTaXplO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZhY3Rvcih0aGlzLl9taW5NYXhIZWlnaHRDb29yZHNbaW5kZXhdLCB0aGlzLl9taW5NYXhIZWlnaHRDb29yZHNbaW5kZXggKyAxXSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIF9jbGVhck1pbk1heEhlaWdodENvb3JkcygpIHtcclxuXHJcbiAgICAgICAgdGhpcy5fbWluSGVpZ2h0Q29vcmRbMF0gPSAwO1xyXG4gICAgICAgIHRoaXMuX21pbkhlaWdodENvb3JkWzFdID0gMDtcclxuICAgICAgICB0aGlzLl9tYXhIZWlnaHRDb29yZFswXSA9IDA7XHJcbiAgICAgICAgdGhpcy5fbWF4SGVpZ2h0Q29vcmRbMV0gPSAwO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX21pbk1heEhlaWdodENvb3Jkcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLl9taW5NYXhIZWlnaHRDb29yZHNbaV0gPSAwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVjYWxjdWxhdGVBQUJCKCkge1xyXG5cclxuICAgICAgICB0aGlzLl9taW5IZWlnaHRDb29yZFswXSA9IDA7XHJcbiAgICAgICAgdGhpcy5fbWluSGVpZ2h0Q29vcmRbMV0gPSAwO1xyXG4gICAgICAgIHRoaXMuX21heEhlaWdodENvb3JkWzBdID0gMDtcclxuICAgICAgICB0aGlzLl9tYXhIZWlnaHRDb29yZFsxXSA9IDA7XHJcblxyXG4gICAgICAgIGxldCBtaW5GYWN0b3IgPSAxO1xyXG4gICAgICAgIGxldCBtYXhGYWN0b3IgPSAwO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBwYXRjaFogPSAwOyBwYXRjaFogPCB0aGlzLl9udW1QYXRjaGVzWjsgcGF0Y2haKyspIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhdGNoWCA9IDA7IHBhdGNoWCA8IHRoaXMuX251bVBhdGNoZXNYOyBwYXRjaFgrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IG1pbkluZGV4ID0gKHBhdGNoWiAqIHRoaXMuX251bVBhdGNoZXNYICsgcGF0Y2hYKSAqIG1pbk1heFN0YWNrU2l6ZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1heEluZGV4ID0gbWluSW5kZXggKyB0aGlzLl9wYXRjaGVzU2VnbWVudFNpemU7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgcGF0Y2hNaW5GYWN0b3IgPSB0aGlzLmdldEZhY3Rvcih0aGlzLl9taW5NYXhIZWlnaHRDb29yZHNbbWluSW5kZXhdLCB0aGlzLl9taW5NYXhIZWlnaHRDb29yZHNbbWluSW5kZXggKyAxXSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRjaE1heGZhY3RvciA9IHRoaXMuZ2V0RmFjdG9yKHRoaXMuX21pbk1heEhlaWdodENvb3Jkc1ttYXhJbmRleF0sIHRoaXMuX21pbk1heEhlaWdodENvb3Jkc1ttYXhJbmRleCArIDFdKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobWluRmFjdG9yID4gcGF0Y2hNaW5GYWN0b3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBtaW5GYWN0b3IgPSBwYXRjaE1pbkZhY3RvcjtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9taW5IZWlnaHRDb29yZFswXSA9IHRoaXMuX21pbk1heEhlaWdodENvb3Jkc1ttaW5JbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbWluSGVpZ2h0Q29vcmRbMV0gPSB0aGlzLl9taW5NYXhIZWlnaHRDb29yZHNbbWluSW5kZXggKyAxXTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobWF4RmFjdG9yIDwgcGF0Y2hNYXhmYWN0b3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXhGYWN0b3IgPSBwYXRjaE1heGZhY3RvcjtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tYXhIZWlnaHRDb29yZFswXSA9IHRoaXMuX21pbk1heEhlaWdodENvb3Jkc1ttYXhJbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbWF4SGVpZ2h0Q29vcmRbMV0gPSB0aGlzLl9taW5NYXhIZWlnaHRDb29yZHNbbWF4SW5kZXggKyAxXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVjYWxjdWxhdGVNaW5NYXgoem9uZTogSVpvbmUpOiB2b2lkIHtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoem9uZS5tYXhYIDwgMCkgcmV0dXJuO1xyXG4gICAgICAgIGlmICh6b25lLm1heFogPCAwKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IGZpeGVkTWluWCA9IE1hdGgubWF4KHpvbmUubWluWCwgMCk7XHJcbiAgICAgICAgY29uc3QgZml4ZWRNaW5aID0gTWF0aC5tYXgoem9uZS5taW5aLCAwKTtcclxuICAgICAgICBjb25zdCBmaXhlZE1heFggPSBNYXRoLm1pbih6b25lLm1heFgsIHRoaXMud2lkdGgpO1xyXG4gICAgICAgIGNvbnN0IGZpeGVkTWF4WiA9IE1hdGgubWluKHpvbmUubWF4WiwgdGhpcy5kZXB0aCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IHogPSBmaXhlZE1pblo7IHogPCBmaXhlZE1heFo7IHogKz0gdGhpcy5fcGF0Y2hTaXplKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCB4ID0gZml4ZWRNaW5YOyB4IDwgZml4ZWRNYXhYOyB4ICs9IHRoaXMuX3BhdGNoU2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRjaFggICA9IE1hdGguY2VpbCh4IC8gdGhpcy5fcGF0Y2hTaXplKSAtICh4ICUgdGhpcy5fcGF0Y2hTaXplID4gMCA/IDEgOiAwKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGNoWiAgID0gTWF0aC5jZWlsKHogLyB0aGlzLl9wYXRjaFNpemUpIC0gKHogJSB0aGlzLl9wYXRjaFNpemUgPiAwID8gMSA6IDApO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcGF0Y2hJICAgPSBwYXRjaFogKiB0aGlzLl9udW1QYXRjaGVzWCArIHBhdGNoWDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1pbkluZGV4ID0gcGF0Y2hJICogbWluTWF4U3RhY2tTaXplO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbWF4SW5kZXggPSBtaW5JbmRleCArIHRoaXMuX3BhdGNoZXNTZWdtZW50U2l6ZTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgY29uc3QgZmlyc3RQYXRjaFggPSBwYXRjaFggKiB0aGlzLl9wYXRjaFNpemU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmaXJzdFBhdGNoWiA9IHBhdGNoWiAqIHRoaXMuX3BhdGNoU2l6ZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RQYXRjaFggID0gZmlyc3RQYXRjaFggKyB0aGlzLl9wYXRjaFNpemU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0UGF0Y2haICA9IGZpcnN0UGF0Y2haICsgdGhpcy5fcGF0Y2hTaXplO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBtaW4gPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcclxuICAgICAgICAgICAgICAgIGxldCBtYXggPSBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUjtcclxuICAgICAgICAgICAgICAgIGxldCBtaW5YID0gZmlyc3RQYXRjaFg7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWluWiA9IGZpcnN0UGF0Y2haO1xyXG4gICAgICAgICAgICAgICAgbGV0IG1heFggPSBmaXJzdFBhdGNoWDtcclxuICAgICAgICAgICAgICAgIGxldCBtYXhaID0gZmlyc3RQYXRjaFo7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaW5uZXJaID0gZmlyc3RQYXRjaFogKyAxOyBpbm5lclogPCBsYXN0UGF0Y2haOyBpbm5lclorKykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpbm5lclggPSBmaXJzdFBhdGNoWCArIDE7IGlubmVyWCA8IGxhc3RQYXRjaFg7IGlubmVyWCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmYWN0b3IgPSB0aGlzLmdldEZhY3Rvcihpbm5lclgsIGlubmVyWik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWluID4gZmFjdG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW4gPSBmYWN0b3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5YID0gaW5uZXJYO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluWiA9IGlubmVyWjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1heCA8IGZhY3Rvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4ID0gZmFjdG9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4WCA9IGlubmVyWDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFogPSBpbm5lclo7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWluTWF4SGVpZ2h0Q29vcmRzW21pbkluZGV4XSAgICAgPSBtaW5YO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWluTWF4SGVpZ2h0Q29vcmRzW21pbkluZGV4ICsgMV0gPSBtaW5aO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWluTWF4SGVpZ2h0Q29vcmRzW21heEluZGV4XSAgICAgPSBtYXhYO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWluTWF4SGVpZ2h0Q29vcmRzW21heEluZGV4ICsgMV0gPSBtYXhaO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBYnNQYXRjaGVkSGVpZ2h0TWFwOyIsImltcG9ydCB7IGludCB9IGZyb20gXCIuLi9TaGFyZWQvVHlwZXMubWpzXCI7XG5cbmV4cG9ydCBjb25zdCBMRUZUICAgPSAyO1xuZXhwb3J0IGNvbnN0IFJJR0hUICA9IDI7XG5leHBvcnQgY29uc3QgVE9QICAgID0gMjtcbmV4cG9ydCBjb25zdCBCT1RUT00gPSAyO1xuXG5leHBvcnQgaW50ZXJmYWNlIElTaW5nbGVMb2RJbmZvIHtcbiAgICBzdGFydDogaW50O1xuICAgIGNvdW50OiBpbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0SW5mbygpOiBJU2luZ2xlTG9kSW5mb1tdW11bXVtdIHtcblxuICAgIGNvbnN0IGFycjogSVNpbmdsZUxvZEluZm9bXVtdW11bXSA9IFtdO1xuXG4gICAgZm9yIChsZXQgbCA9IDAgOyBsIDwgTEVGVCA7IGwrKykge1xuXG4gICAgICAgIGFycltsXSA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IHIgPSAwIDsgciA8IFJJR0hUIDsgcisrKSB7XG5cbiAgICAgICAgICAgIGFycltsXVtyXSA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKGxldCB0ID0gMCA7IHQgPCBUT1AgOyB0KyspIHtcblxuICAgICAgICAgICAgICAgIGFycltsXVtyXVt0XSA9IFtdO1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYiA9IDAgOyBiIDwgQk9UVE9NIDsgYisrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgYXJyW2xdW3JdW3RdW2JdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogMFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBhcnI7XG59XG5cbmV4cG9ydCBjbGFzcyBMb2RJbmZvIHtcblxuICAgIC8vaW5mb1tMRUZUXVtSSUdIVF1bVE9QXVtCT1RUT01dO1xuICAgIHB1YmxpYyBpbmZvOiBJU2luZ2xlTG9kSW5mb1tdW11bXVtdO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuaW5mbyA9IGluaXRJbmZvKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFyKCkge1xuICAgICAgICBmb3IgKGxldCBsID0gMCA7IGwgPCBMRUZUIDsgbCsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCByID0gMCA7IHIgPCBSSUdIVCA7IHIrKykge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHQgPSAwIDsgdCA8IFRPUCA7IHQrKykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBiID0gMCA7IGIgPCBCT1RUT00gOyBiKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNpbmdsZSA9IHRoaXMuaW5mb1tsXVtyXVt0XVtiXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpbmdsZS5zdGFydCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaW5nbGUuY291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMb2RJbmZvOyIsImltcG9ydCB0eXBlIHsgaW50IH0gZnJvbSBcIi4vVHlwZXMubWpzXCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBYnNTdG9yZTJEPFQgZXh0ZW5kcyBzdHJpbmcgfCBudW1iZXIgfCBvYmplY3Q+IHtcblxuICAgIHByb3RlY3RlZCBfcDogVFtdO1xuICAgIHByb3RlY3RlZCBfY29scyA9IDA7XG4gICAgcHJvdGVjdGVkIF9yb3dzID0gMDtcblxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBfaW5pdEFycmF5VHlwZShzaXplOiBpbnQpOiBUW107XG5cbiAgICBwdWJsaWMgaW5pdChjb2xzOiBpbnQsIHJvd3M6IGludCk6IHZvaWQge1xuXG4gICAgICAgIHRoaXMuX2NvbHMgPSBjb2xzO1xuICAgICAgICB0aGlzLl9yb3dzID0gcm93cztcblxuICAgICAgICBjb25zdCBzaXplID0gY29scyAqIHJvd3M7XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9wID0gdGhpcy5faW5pdEFycmF5VHlwZShzaXplKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW5pdEJ5VmFsKGNvbHM6IGludCwgcm93czogaW50LCB2YWw6IFQgfCAoKCkgPT4gVCkpOiB2b2lkIHtcblxuICAgICAgICB0aGlzLmluaXQoY29scywgcm93cyk7XG5cbiAgICAgICAgY29uc3Qgc2l6ZSA9IGNvbHMgKiByb3dzO1xuICAgICAgICBjb25zdCB2YWxJc0Z1bmMgPSB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwIDsgaSA8IHNpemU7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5fcFtpXSA9IHZhbElzRnVuYyA/IHZhbCgpIDogdmFsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGluaXRCeVN0b3JlKGNvbHM6IGludCwgcm93czogaW50LCB2YWw6IFJlY29yZDxpbnQsIFQ+KTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2NvbHMgPSBjb2xzO1xuICAgICAgICB0aGlzLl9yb3dzID0gcm93cztcbiAgICAgICAgdGhpcy5fcCA9IHZhbCBhcyBUW107XG4gICAgfVxuXG4gICAgcHVibGljIGFkZHIoKTogUmVjb3JkPG51bWJlciwgVD4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fcDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2l6ZSgpOiBpbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm93cyAqIHRoaXMuX2NvbHM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldChjb2w6IGludCwgcm93OiBpbnQpOiBUIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bbcm93ICogdGhpcy5fY29scyArIGNvbF07XG4gICAgfVxuXG4gICAgcHVibGljIHNldChjb2w6IGludCwgcm93OiBpbnQsIHZhbHVlOiBUKSB7XG4gICAgICAgIHRoaXMuX3Bbcm93ICogdGhpcy5fY29scyArIGNvbF0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0QnlJbmRleChpbmRleDogaW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wW2luZGV4XTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHNldEJ5SW5kZXgoaW5kZXg6IGludCwgdmFsdWU6IFQpIHtcbiAgICAgICAgdGhpcy5fcFtpbmRleF0gPSB2YWx1ZTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBPYmpTdG9yZTJEPFQgZXh0ZW5kcyBvYmplY3Q+IGV4dGVuZHMgQWJzU3RvcmUyRDxUPiB7XG5cbiAgICBwcm90ZWN0ZWQgb3ZlcnJpZGUgX2luaXRBcnJheVR5cGUoc2l6ZTogbnVtYmVyKTogVFtdIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBcnJheTxUPihzaXplKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgZmxvYXQsIGludCB9IGZyb20gXCIuL1R5cGVzLm1qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGV4dCh2YWw6IG51bWJlciwgbWluV2lkdGg6IG51bWJlciwgcHJlZml4OiBzdHJpbmcpIHtcblxuICAgIGNvbnN0IHN0ciA9IHZhbC50b1N0cmluZygpO1xuICAgIGNvbnN0IHN0ckxlbiA9IHN0ci5sZW5ndGg7XG4gICAgY29uc3QgYXBwZW5kQ291bnQgPSBtaW5XaWR0aCAtIHN0ckxlbjtcblxuICAgIGxldCByZXN1bHQgPSBzdHI7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFwcGVuZENvdW50OyBpKyspIHtcbiAgICAgICAgcmVzdWx0ID0gcHJlZml4ICsgcmVzdWx0O1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByYW5kb21GbG9hdCgpIHtcbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbUZsb2F0UmFuZ2Uoc3RhcnQ6IGZsb2F0LCBlbmQ6IGZsb2F0KSB7XG5cbiAgICBpZiAoZW5kID09IHN0YXJ0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcmFuZG9tIHJhbmdlXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IGRlbHRhID0gZW5kIC0gc3RhcnQ7XG5cbiAgICBjb25zdCByYW5kb21WYWx1ZSA9IHJhbmRvbUZsb2F0KCkgKiBkZWx0YSArIHN0YXJ0O1xuXG4gICAgcmV0dXJuIHJhbmRvbVZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsY05leHRQb3dlck9mVHdvKHg6IGludCk6IGludCB7XG4gICAgXG4gICAgbGV0IHJldCA9IDE7XG5cbiAgICBpZiAoeCA9PSAxKSB7XG4gICAgICAgIHJldHVybiAyO1xuICAgIH1cblxuICAgIHdoaWxlIChyZXQgPCB4KSB7XG4gICAgICAgIHJldCA9IHJldCAqIDI7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbn0iLCJpbXBvcnQgeyBJVmVjdG9yMywgZmxvYXQgfSBmcm9tIFwiLi9UeXBlcy5tanNcIjtcblxuLyoqXG4gKiBTZXRzIHRoZSBzcGVjaWZpZWQgMy1kaW1lbnNpb25hbCB2ZWN0b3IgdG8gdGhlIHN1cHBsaWVkIG51bWVyaWNhbCB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQ8VCBleHRlbmRzIElWZWN0b3IzPih0bzogVCwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IFQge1xuICAgIHRvLnggPSB4O1xuICAgIHRvLnkgPSB5O1xuICAgIHRvLnogPSB6O1xuICAgIHJldHVybiB0bztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBFdWNsaWRlYW4gZGlzdGFuY2UgYmV0d2VlbiB0aGUgdHdvIGdpdmVuIHBvaW50cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3RhbmNlKHZhbHVlMTogUmVhZG9ubHk8SVZlY3RvcjM+LCB2YWx1ZTI6IFJlYWRvbmx5PElWZWN0b3IzPikge1xuICAgIGNvbnN0IGR4ID0gdmFsdWUxLnggLSB2YWx1ZTIueDtcbiAgICBjb25zdCBkeSA9IHZhbHVlMS55IC0gdmFsdWUyLnk7XG4gICAgY29uc3QgZHogPSB2YWx1ZTEueiAtIHZhbHVlMi56O1xuICAgIGNvbnN0IGxzID0gZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6O1xuICAgIHJldHVybiBNYXRoLnNxcnQobHMpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIEV1Y2xpZGVhbiBkaXN0YW5jZSBiZXR3ZWVuIHRoZSB0d28gZ2l2ZW4gcG9pbnRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2VWM1hZWih2YWx1ZTE6IFJlYWRvbmx5PElWZWN0b3IzPiwgeDogZmxvYXQsIHk6IGZsb2F0LCB6OiBmbG9hdCkge1xuICAgIGNvbnN0IGR4ID0gdmFsdWUxLnggLSB4O1xuICAgIGNvbnN0IGR5ID0gdmFsdWUxLnkgLSB5O1xuICAgIGNvbnN0IGR6ID0gdmFsdWUxLnogLSB6O1xuICAgIGNvbnN0IGxzID0gZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6O1xuICAgIHJldHVybiBNYXRoLnNxcnQobHMpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIEV1Y2xpZGVhbiBkaXN0YW5jZSBiZXR3ZWVuIHRoZSB0d28gZ2l2ZW4gcG9pbnRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2VYMVkxWjFYMlkyWjIoeDE6IGZsb2F0LCB5MTogZmxvYXQsIHoxOiBmbG9hdCwgeDI6IGZsb2F0LCB5MjogZmxvYXQsIHoyOiBmbG9hdCkge1xuICAgIGNvbnN0IGR4ID0geDEgLSB4MjtcbiAgICBjb25zdCBkeSA9IHkxIC0geTI7XG4gICAgY29uc3QgZHogPSB6MSAtIHoyO1xuICAgIGNvbnN0IGxzID0gZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6O1xuICAgIHJldHVybiBNYXRoLnNxcnQobHMpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSB2ZWN0b3Igd2l0aCB0aGUgc2FtZSBkaXJlY3Rpb24gYXMgdGhlIGdpdmVuIHZlY3RvciwgYnV0IHdpdGggYSBsZW5ndGggb2YgMS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZTxUT3V0IGV4dGVuZHMgSVZlY3RvcjM+KHZhbHVlOiBSZWFkb25seTxJVmVjdG9yMz4sIG91dDogVE91dCk6IFRPdXQge1xuXG4gICAgY29uc3QgbHMgPSB2YWx1ZS54ICogdmFsdWUueCArIHZhbHVlLnkgKiB2YWx1ZS55ICsgdmFsdWUueiAqIHZhbHVlLno7XG4gICAgY29uc3QgbGVuZ3RoID0gTWF0aC5zcXJ0KGxzKTtcblxuICAgIHJldHVybiBzZXQoXG4gICAgICAgIG91dCxcbiAgICAgICAgdmFsdWUueCAvIGxlbmd0aCxcbiAgICAgICAgdmFsdWUueSAvIGxlbmd0aCxcbiAgICAgICAgdmFsdWUueiAvIGxlbmd0aFxuICAgICk7XG59XG5cbi8qKlxuICogVXBkYXRlIHRoZSB2ZWN0b3Igd2l0aCB0aGUgc2FtZSBkaXJlY3Rpb24gYXMgdGhlIGdpdmVuIHZlY3RvciwgYnV0IHdpdGggYSBsZW5ndGggb2YgMS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVJlZjxUIGV4dGVuZHMgSVZlY3RvcjM+KHJlZlZhbHVlOiBUKTogVCB7XG5cbiAgICBjb25zdCBscyA9IHJlZlZhbHVlLnggKiByZWZWYWx1ZS54ICsgcmVmVmFsdWUueSAqIHJlZlZhbHVlLnkgKyByZWZWYWx1ZS56ICogcmVmVmFsdWUuejtcbiAgICBjb25zdCBsZW5ndGggPSBNYXRoLnNxcnQobHMpO1xuICAgIFxuICAgIHJlZlZhbHVlLnggLz0gbGVuZ3RoO1xuICAgIHJlZlZhbHVlLnkgLz0gbGVuZ3RoO1xuICAgIHJlZlZhbHVlLnogLz0gbGVuZ3RoO1xuICAgIHJldHVybiByZWZWYWx1ZTtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byB2ZWN0b3JzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkPFRPdXQgZXh0ZW5kcyBJVmVjdG9yMz4obGVmdDogUmVhZG9ubHk8SVZlY3RvcjM+LCByaWdodDogUmVhZG9ubHk8SVZlY3RvcjM+LCBvdXQ6IFRPdXQpOiBUT3V0IHtcbiAgICByZXR1cm4gc2V0KFxuICAgICAgICBvdXQsXG4gICAgICAgIGxlZnQueCArIHJpZ2h0LngsXG4gICAgICAgIGxlZnQueSArIHJpZ2h0LnksXG4gICAgICAgIGxlZnQueiArIHJpZ2h0LnpcbiAgICApO1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIHZlY3RvcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRSZWYocmVmTGVmdDogSVZlY3RvcjMsIHJpZ2h0OiBSZWFkb25seTxJVmVjdG9yMz4pIHtcbiAgICByZXR1cm4gYWRkKHJlZkxlZnQsIHJpZ2h0LCByZWZMZWZ0KTtcbn1cblxuLyoqXG4gKiBTdWJ0cmFjdHMgdGhlIHNlY29uZCB2ZWN0b3IgZnJvbSB0aGUgZmlyc3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdDxUT3V0IGV4dGVuZHMgSVZlY3RvcjM+KGxlZnQ6IFJlYWRvbmx5PElWZWN0b3IzPiwgcmlnaHQ6IFJlYWRvbmx5PElWZWN0b3IzPiwgb3V0OiBUT3V0KTogVE91dCB7XG4gICAgcmV0dXJuIHNldChcbiAgICAgICAgb3V0LFxuICAgICAgICBsZWZ0LnggLSByaWdodC54LFxuICAgICAgICBsZWZ0LnkgLSByaWdodC55LFxuICAgICAgICBsZWZ0LnogLSByaWdodC56XG4gICAgKTtcbn1cblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjdG9ycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyb3NzPFRPdXQgZXh0ZW5kcyBJVmVjdG9yMz4odmVjdG9yMTogUmVhZG9ubHk8SVZlY3RvcjM+LCB2ZWN0b3IyOiBSZWFkb25seTxJVmVjdG9yMz4sIG91dDogVE91dCk6IFRPdXQge1xuICAgIHJldHVybiBzZXQoXG4gICAgICAgIG91dCxcbiAgICAgICAgdmVjdG9yMS55ICogdmVjdG9yMi56IC0gdmVjdG9yMS56ICogdmVjdG9yMi55LFxuICAgICAgICB2ZWN0b3IxLnogKiB2ZWN0b3IyLnggLSB2ZWN0b3IxLnggKiB2ZWN0b3IyLnosXG4gICAgICAgIHZlY3RvcjEueCAqIHZlY3RvcjIueSAtIHZlY3RvcjEueSAqIHZlY3RvcjIueFxuICAgICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBzZXQsXG4gICAgbm9ybWFsaXplLFxuICAgIG5vcm1hbGl6ZVJlZixcbiAgICBhZGQsXG4gICAgc3VidHJhY3QsXG4gICAgYWRkUmVmLFxuICAgIGRpc3RhbmNlLFxuICAgIGRpc3RhbmNlVjNYWVosXG4gICAgZGlzdGFuY2VYMVkxWjFYMlkyWjIsXG4gICAgY3Jvc3Ncbn0iLCJpbXBvcnQgdHlwZSB7IFJlZk9iamVjdCwgSVZlY3RvcjMsIGZsb2F0LCBpbnQgfSBmcm9tIFwiLi4vU2hhcmVkL1R5cGVzLm1qc1wiO1xyXG5pbXBvcnQgeyBPYmpTdG9yZTJEIH0gZnJvbSBcIi4uL1NoYXJlZC9TdG9yZTJELm1qc1wiO1xyXG5pbXBvcnQgeyBnZXRUZXh0IH0gZnJvbSBcIi4uL1NoYXJlZC9VdGlscy5tanNcIjtcclxuaW1wb3J0IFZlY3RvcjNNYXRoIGZyb20gXCIuLi9TaGFyZWQvVmVjdG9yM01hdGgubWpzXCI7XHJcbmltcG9ydCB0eXBlIHsgSVJlYWRvbmx5QWJzUGF0Y2hlZEhlaWdodE1hcCB9IGZyb20gXCIuL0Fic1BhdGNoZWRIZWlnaHRNYXAubWpzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElQYXRjaExvZCB7XHJcbiAgICBkaXN0YW5jZTogZmxvYXQ7XHJcbiAgICBjb3JlOiBpbnQ7XHJcbiAgICBsZWZ0OiBpbnQ7XHJcbiAgICByaWdodDogaW50O1xyXG4gICAgdG9wOiBpbnQ7XHJcbiAgICBib3R0b206IGludDtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldExvZEhhc2ggPSAobG9kOiBJUGF0Y2hMb2QpOiBpbnQgPT4ge1xyXG4gICAgcmV0dXJuIDE3ICogbG9kLmNvcmUgKiAzMSAqIGxvZC50b3AgKiAzMSAqIGxvZC5sZWZ0ICogMzEgKiBsb2QuYm90dG9tICogMzEgKiBsb2QucmlnaHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBkZWZhdWx0UGF0Y2hMb2Q6IFJlYWRvbmx5PElQYXRjaExvZD4gPSB7XHJcbiAgICBkaXN0YW5jZTogMCxcclxuICAgIGNvcmU6ICAgICAwLFxyXG4gICAgbGVmdDogICAgIDAsXHJcbiAgICByaWdodDogICAgMCxcclxuICAgIHRvcDogICAgICAwLFxyXG4gICAgYm90dG9tOiAgIDAsXHJcbn1cclxuXHJcbmNvbnN0IGdldFplcm9QYXRjaExvZCA9ICgpOiBJUGF0Y2hMb2QgPT4gKHtcclxuICAgIGRpc3RhbmNlOiAwLFxyXG4gICAgY29yZTogICAgIDAsXHJcbiAgICBsZWZ0OiAgICAgMCxcclxuICAgIHJpZ2h0OiAgICAwLFxyXG4gICAgdG9wOiAgICAgIDAsXHJcbiAgICBib3R0b206ICAgMCxcclxufSk7XHJcblxyXG5leHBvcnQgY2xhc3MgTG9kTWFuYWdlciB7XHJcblxyXG4gICAgcHJpdmF0ZSBfekZhcjogaW50O1xyXG4gICAgcHJpdmF0ZSBfbWFwOiBPYmpTdG9yZTJEPElQYXRjaExvZD47XHJcbiAgICBwcml2YXRlIF9yZWdpb25zOiBmbG9hdFtdO1xyXG5cclxuICAgIHByaXZhdGUgX3BhdGNoU2l6ZTogaW50O1xyXG4gICAgcHJpdmF0ZSBfbnVtUGF0Y2hlc1g6IGludDtcclxuICAgIHByaXZhdGUgX251bVBhdGNoZXNaOiBpbnQ7XHJcblxyXG4gICAgcHJpdmF0ZSBfbWF4TE9EOiBpbnQ7XHJcblxyXG4gICAgcHVibGljIGdldCB6RmFyKCkgeyByZXR1cm4gdGhpcy5fekZhcjsgfVxyXG4gICAgcHVibGljIGdldCBtYXhMT0QoKSB7IHJldHVybiB0aGlzLl9tYXhMT0Q7IH1cclxuXHJcbiAgICBwdWJsaWMgY29uc3RydWN0b3IoekZhcjogaW50LCBwYXRjaFNpemU6IGludCwgbnVtUGF0Y2hlc1g6IGludCwgbnVtUGF0Y2hlc1o6IGludCkge1xyXG4gICAgICAgIHRoaXMuc2V0UGFyYW1zKHpGYXIsIHBhdGNoU2l6ZSwgbnVtUGF0Y2hlc1gsIG51bVBhdGNoZXNaKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0WkZhcih6RmFyOiBpbnQpIHtcclxuICAgICAgICB0aGlzLl96RmFyID0gekZhcjtcclxuICAgICAgICB0aGlzLl9jYWxjTG9kUmVnaW9ucygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRQYXJhbXMoekZhcjogaW50LCBwYXRjaFNpemU6IGludCwgbnVtUGF0Y2hlc1g6IGludCwgbnVtUGF0Y2hlc1o6IGludCkge1xyXG5cclxuICAgICAgICB0aGlzLl9wYXRjaFNpemUgICA9IHBhdGNoU2l6ZTtcclxuICAgICAgICB0aGlzLl9udW1QYXRjaGVzWCA9IG51bVBhdGNoZXNYO1xyXG4gICAgICAgIHRoaXMuX251bVBhdGNoZXNaID0gbnVtUGF0Y2hlc1o7XHJcblxyXG4gICAgICAgIHRoaXMuX2NhbGNNYXhMT0QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWFwID0gbmV3IE9ialN0b3JlMkQ8SVBhdGNoTG9kPigpO1xyXG4gICAgICAgIHRoaXMuX21hcC5pbml0QnlWYWwobnVtUGF0Y2hlc1gsIG51bVBhdGNoZXNaLCBnZXRaZXJvUGF0Y2hMb2QpO1xyXG4gICAgICAgIHRoaXMuX3JlZ2lvbnMgPSBuZXcgQXJyYXk8bnVtYmVyPih0aGlzLl9tYXhMT0QgKyAxKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRaRmFyKHpGYXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NhbGNNYXhMT0QoKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IG51bVNlZ21lbnRzICAgICAgICAgID0gdGhpcy5fcGF0Y2hTaXplIC0gMTtcclxuICAgICAgICBjb25zdCBudW1TZWdtZW50c0xvZzIgICAgICA9IE1hdGgubG9nMihudW1TZWdtZW50cyk7XHJcbiAgICAgICAgY29uc3QgbnVtU2VnbWVudHNMb2cyQ2VpbCAgPSBNYXRoLmNlaWwobnVtU2VnbWVudHNMb2cyKTtcclxuICAgICAgICBjb25zdCBudW1TZWdtZW50c0xvZzJGbG9vciA9IE1hdGguZmxvb3IobnVtU2VnbWVudHNMb2cyKTtcclxuXHJcbiAgICAgICAgaWYgKG51bVNlZ21lbnRzTG9nMkNlaWwgIT09IG51bVNlZ21lbnRzTG9nMkZsb29yKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBudW1iZXIgb2YgdmVydGljZXMgaW4gdGhlIHBhdGNoIG1pbnVzIG9uZSBtdXN0IGJlIGEgcG93ZXIgb2YgdHdvXFxuXCIpO1xyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIGNvbnN0IHBhdGNoU2l6ZUxvZzIgPSBudW1TZWdtZW50c0xvZzJGbG9vcjtcclxuXHJcbiAgICAgICAgdGhpcy5fbWF4TE9EID0gcGF0Y2hTaXplTG9nMiAtIDE7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY2FsY0xvZFJlZ2lvbnMoKSB7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IFdlIGNhbiB1c2UgdGhlIHJpbmcgc3lzdGVtIHRvIGRldGVybWluZSB0aGUgTE9ELlxyXG4gICAgICAgIC8vIFRPRE86IEJhc2VkIG9uIHRoZSBoZWlnaHRzIHdlIGNhbiBjYWxjdWxhdGUgdGhlIG9wdGltYWwgbG9kc1xyXG5cclxuICAgICAgICBsZXQgc3VtID0gMDtcclxuICAgIFxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fbWF4TE9EICsgMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIHN1bSArPSBpICsgMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB4ID0gdGhpcy5fekZhciAvIHN1bTtcclxuICAgICAgICBsZXQgdGVtcCA9IDA7XHJcbiAgICBcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX21heExPRCArIDE7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJSYW5nZSA9ICh4ICogKGkgKyAxKSkgfCAwO1xyXG4gICAgICAgICAgICB0aGlzLl9yZWdpb25zW2ldID0gdGVtcCArIGN1clJhbmdlO1xyXG4gICAgICAgICAgICB0ZW1wICs9IGN1clJhbmdlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcHJpbnRMb2RNYXAoKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHN0ciA9ICcnO1xyXG5cclxuICAgICAgICBjb25zdCBtYXhMb2RNYXhaICA9IHRoaXMuX251bVBhdGNoZXNaIC0gMTtcclxuICAgICAgICBjb25zdCBtYXhMb2RNYXhYICA9IHRoaXMuX251bVBhdGNoZXNYO1xyXG5cclxuICAgICAgICBsZXQgbWF4Q29yZSA9IDA7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGxvZE1hcFogPSBtYXhMb2RNYXhaOyBsb2RNYXBaID49IDA7IGxvZE1hcFotLSkge1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgbG9kTWFwWCA9IDAgOyBsb2RNYXBYIDwgbWF4TG9kTWF4WDsgbG9kTWFwWCsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9tYXAuZ2V0KGxvZE1hcFgsIGxvZE1hcFopLmNvcmU7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG1heENvcmUgPCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1heENvcmUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbG9kTWF4TnVtYmVyQ291bnQgID0gbWF4TG9kTWF4Wi50b1N0cmluZygpLmxlbmd0aDtcclxuICAgICAgICBjb25zdCBjb3JlTWF4TnVtYmVyQ291bnQgPSBtYXhDb3JlLnRvU3RyaW5nKCkubGVuZ3RoO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAobGV0IGxvZE1hcFogPSBtYXhMb2RNYXhaOyBsb2RNYXBaID49IDA7IGxvZE1hcFotLSkge1xyXG4gICAgICAgICAgICBzdHIgKz0gZ2V0VGV4dChsb2RNYXBaLCBsb2RNYXhOdW1iZXJDb3VudCwgJyAnKSArICc6ICc7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGxvZE1hcFggPSAwIDsgbG9kTWFwWCA8IG1heExvZE1heFg7IGxvZE1hcFgrKykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9tYXAuZ2V0KGxvZE1hcFgsIGxvZE1hcFopLmNvcmU7XHJcbiAgICAgICAgICAgICAgICBzdHIgKz0gZ2V0VGV4dCh2YWx1ZSwgY29yZU1heE51bWJlckNvdW50LCAnICcpICsgJyAnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN0ciArPSAnXFxuJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKHN0cik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRpc3RhbmNlVG9Mb2QoZGlzdGFuY2U6IGZsb2F0KSB7XHJcblxyXG4gICAgICAgIGxldCBsb2QgPSB0aGlzLl9tYXhMT0Q7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fbWF4TE9EOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8IHRoaXMuX3JlZ2lvbnNbaV0pIHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbG9kID0gaTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgcmV0dXJuIGxvZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0UGF0Y2hMb2QocGF0Y2hYOiBpbnQsIHBhdGNoWjogaW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hcC5nZXQocGF0Y2hYLCBwYXRjaFopO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRQYXRjaExvZEJ5SW5kZXgoaW5kZXg6IGludCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9tYXAuZ2V0QnlJbmRleChpbmRleCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZShjYW1lcmFQb3M6IFJlZk9iamVjdDxJVmVjdG9yMz4sIGhlaWdodE1hcDogSVJlYWRvbmx5QWJzUGF0Y2hlZEhlaWdodE1hcCwgY2VudGVyOiBib29sZWFuID0gdHJ1ZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGNvbnN0IGEgPSB0aGlzLnVwZGF0ZUxvZE1hcFBhc3MxKGNhbWVyYVBvcywgaGVpZ2h0TWFwLCBjZW50ZXIpO1xyXG4gICAgICAgIGNvbnN0IGIgPSB0aGlzLnVwZGF0ZUxvZE1hcFBhc3MyKCk7XHJcbiAgICAgICAgcmV0dXJuIGEgfHwgYjtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgdXBkYXRlTG9kTWFwUGFzczEoY2FtZXJhUG9zOiBSZWZPYmplY3Q8SVZlY3RvcjM+LCBoZWlnaHRNYXA6IElSZWFkb25seUFic1BhdGNoZWRIZWlnaHRNYXAsIGNlbnRlcjogYm9vbGVhbikge1xyXG5cclxuICAgICAgICBsZXQgaGFzQ2hhbmdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGNvbnN0IGNlbnRlclN0ZXAgPSB0aGlzLl9wYXRjaFNpemUgLyAyIHwgMDtcclxuICAgICAgICBjb25zdCBoYWxmV2lkdGggID0gaGVpZ2h0TWFwLndpZHRoIC8gMjtcclxuICAgICAgICBjb25zdCBoYWxmRGVwdGggID0gaGVpZ2h0TWFwLmRlcHRoIC8gMjsgXHJcblxyXG4gICAgICAgIGZvciAobGV0IGxvZE1hcFogPSAwOyBsb2RNYXBaIDwgdGhpcy5fbnVtUGF0Y2hlc1o7IGxvZE1hcForKykge1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgbG9kTWFwWCA9IDA7IGxvZE1hcFggPCB0aGlzLl9udW1QYXRjaGVzWDsgbG9kTWFwWCsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgeCA9IGxvZE1hcFggKiAodGhpcy5fcGF0Y2hTaXplIC0gMSkgKyBjZW50ZXJTdGVwO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgeiA9IGxvZE1hcFogKiAodGhpcy5fcGF0Y2hTaXplIC0gMSkgKyBjZW50ZXJTdGVwO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGNoQ2VudGVyWCAgICAgPSBjZW50ZXIgPyAtaGFsZldpZHRoICsgeCA6IHg7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRjaENlbnRlclkgICAgID0gKGhlaWdodE1hcC5nZXRQYXRjaE1heChsb2RNYXBYLCBsb2RNYXBaKSArIGhlaWdodE1hcC5nZXRQYXRjaE1pbihsb2RNYXBYLCBsb2RNYXBaKSkgLyAyO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcGF0Y2hDZW50ZXJaICAgICA9IGNlbnRlciA/IC1oYWxmRGVwdGggKyB6IDogejtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RhbmNlVG9DYW1lcmEgPSBWZWN0b3IzTWF0aC5kaXN0YW5jZVYzWFlaKGNhbWVyYVBvcywgcGF0Y2hDZW50ZXJYLCBwYXRjaENlbnRlclksIHBhdGNoQ2VudGVyWik7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnN0IGRpc3RhbmNlVG9DYW1lcmEgPSBWZWN0b3IyTWF0aC5kaXN0YW5jZVgxWjFYMloyKGNhbWVyYVBvcy54LCBjYW1lcmFQb3MueiwgcGF0Y2hDZW50ZXJYLCBwYXRjaENlbnRlclopO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvcmVMb2QgICA9IHRoaXMuZGlzdGFuY2VUb0xvZChkaXN0YW5jZVRvQ2FtZXJhKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBQYXRjaExPRCA9IHRoaXMuX21hcC5nZXQobG9kTWFwWCwgbG9kTWFwWik7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBQYXRjaExPRC5jb3JlICE9PSBjb3JlTG9kKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFzQ2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwUGF0Y2hMT0QuZGlzdGFuY2UgPSBkaXN0YW5jZVRvQ2FtZXJhO1xyXG4gICAgICAgICAgICAgICAgcFBhdGNoTE9ELmNvcmUgPSBjb3JlTG9kO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaGFzQ2hhbmdlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB1cGRhdGVMb2RNYXBQYXNzMigpIHtcclxuXHJcbiAgICAgICAgbGV0IGhhc0NoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBsb2RNYXBaID0gMDsgbG9kTWFwWiA8IHRoaXMuX251bVBhdGNoZXNaIDsgbG9kTWFwWisrKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBsb2RNYXBYID0gMDsgbG9kTWFwWCA8IHRoaXMuX251bVBhdGNoZXNYIDsgbG9kTWFwWCsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbSAgICA9IHRoaXMuX21hcC5nZXQobG9kTWFwWCwgbG9kTWFwWik7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb3JlTG9kID0gaXRlbS5jb3JlO1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXhMZWZ0ICAgPSBsb2RNYXBYO1xyXG4gICAgICAgICAgICAgICAgbGV0IGluZGV4UmlnaHQgID0gbG9kTWFwWDtcclxuICAgICAgICAgICAgICAgIGxldCBpbmRleFRvcCAgICA9IGxvZE1hcFo7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXhCb3R0b20gPSBsb2RNYXBaO1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgICBpZiAobG9kTWFwWCA+IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhMZWZ0LS07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXYgPSBpdGVtLmxlZnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuX21hcC5nZXQoaW5kZXhMZWZ0LCBsb2RNYXBaKS5jb3JlID4gY29yZUxvZCA/IDEgOiAwO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpdGVtLmxlZnQgPSBuZXh0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJldiAhPT0gbmV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKGxvZE1hcFggPCB0aGlzLl9udW1QYXRjaGVzWCAtIDEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhSaWdodCsrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gaXRlbS5yaWdodDtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5fbWFwLmdldChpbmRleFJpZ2h0LCBsb2RNYXBaKS5jb3JlID4gY29yZUxvZCA/IDEgOiAwO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpdGVtLnJpZ2h0ID0gbmV4dDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXYgIT09IG5leHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFzQ2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICAgICAgICAgIGlmIChsb2RNYXBaID4gMCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpbmRleEJvdHRvbS0tO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gaXRlbS5ib3R0b207XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuX21hcC5nZXQobG9kTWFwWCwgaW5kZXhCb3R0b20pLmNvcmUgPiBjb3JlTG9kID8gMSA6IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYm90dG9tID0gbmV4dDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXYgIT09IG5leHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFzQ2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICAgICAgICAgIGlmIChsb2RNYXBaIDwgdGhpcy5fbnVtUGF0Y2hlc1ogLSAxKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4VG9wKys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXYgPSBpdGVtLnRvcDtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5fbWFwLmdldChsb2RNYXBYLCBpbmRleFRvcCkuY29yZSA+IGNvcmVMb2QgPyAxIDogMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS50b3AgPSBuZXh0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJldiAhPT0gbmV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGhhc0NoYW5nZTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTG9kTWFuYWdlcjsiLCJpbXBvcnQgdHlwZSB7IGZsb2F0LCBpbnQsIFJlZk9iamVjdCwgdW5zaWduZWRpbnQgYXMgdW5zaWduZWRfaW50IH0gZnJvbSBcIi4uL1NoYXJlZC9UeXBlcy5tanNcIjtcclxuaW1wb3J0IHsgQk9UVE9NLCBMRUZULCBMb2RJbmZvLCBSSUdIVCwgVE9QIH0gZnJvbSBcIi4vTG9kSW5mby5tanNcIjtcclxuaW1wb3J0IExvZE1hbmFnZXIgZnJvbSBcIi4vTG9kTWFuYWdlci5tanNcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUdyaWQge1xyXG4gICAgcmVhZG9ubHkgd2lkdGg6IGludDtcclxuICAgIHJlYWRvbmx5IGRlcHRoOiBpbnQ7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUdyaWRQYXRjaGVkIGV4dGVuZHMgSUdyaWQge1xyXG4gICAgcmVhZG9ubHkgcGF0Y2hTaXplOiBpbnQ7XHJcbiAgICByZWFkb25seSBudW1QYXRjaGVzWDogaW50O1xyXG4gICAgcmVhZG9ubHkgbnVtUGF0Y2hlc1o6IGludDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdyaWRCdWlsZGVyIHtcclxuXHJcbiAgICBwcml2YXRlIF9sb2RJbmZvOiBMb2RJbmZvW107XHJcbiAgICBwcml2YXRlIF9sb2RNYW5hZ2VyOiBMb2RNYW5hZ2VyO1xyXG4gICAgcHJpdmF0ZSBfaW5kaWNlczogVWludDMyQXJyYXk7XHJcbiAgICBwcml2YXRlIF9ncmlkOiBJR3JpZFBhdGNoZWQ7XHJcblxyXG4gICAgcHVibGljIGdldCB6RmFyKCkgeyByZXR1cm4gdGhpcy5fbG9kTWFuYWdlci56RmFyOyB9XHJcbiAgICBwdWJsaWMgZ2V0IHdpZHRoKCkgeyByZXR1cm4gdGhpcy5fZ3JpZC53aWR0aDsgfVxyXG4gICAgcHVibGljIGdldCBkZXB0aCgpIHsgcmV0dXJuIHRoaXMuX2dyaWQuZGVwdGg7IH1cclxuICAgIHB1YmxpYyBnZXQgcGF0Y2hTaXplKCkgeyByZXR1cm4gdGhpcy5fZ3JpZC5wYXRjaFNpemU7IH1cclxuICAgIHB1YmxpYyBnZXQgbnVtUGF0Y2hlc1goKSB7IHJldHVybiB0aGlzLl9ncmlkLm51bVBhdGNoZXNYOyB9XHJcbiAgICBwdWJsaWMgZ2V0IG51bVBhdGNoZXNaKCkgeyByZXR1cm4gdGhpcy5fZ3JpZC5udW1QYXRjaGVzWjsgfVxyXG4gICAgcHVibGljIGdldCBtYXhMT0QoKSB7IHJldHVybiB0aGlzLmxvZE1hbmFnZXIubWF4TE9EOyB9XHJcblxyXG4gICAgcHVibGljIGdldCBwYXRjaEluZGljZXMoKTogUmVhZG9ubHk8VWludDMyQXJyYXk+IHsgcmV0dXJuIHRoaXMuX2luZGljZXMgYXMgYW55OyB9XHJcbiAgICBwdWJsaWMgZ2V0IGxvZE1hbmFnZXIoKTogTG9kTWFuYWdlciB7IHJldHVybiB0aGlzLl9sb2RNYW5hZ2VyOyB9XHJcbiAgICBwdWJsaWMgZ2V0IGxvZEluZm8oKTogUmVhZG9ubHk8UmVhZG9ubHk8TG9kSW5mbz4+W10geyByZXR1cm4gdGhpcy5fbG9kSW5mbzsgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKGdyaWQ6IFJlZk9iamVjdDxJR3JpZFBhdGNoZWQ+LCB6RmFyOiBmbG9hdCkge1xyXG5cclxuICAgICAgICB0aGlzLl9ncmlkID0gZ3JpZDtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCB3aWR0aCAgICAgICA9IGdyaWQud2lkdGg7XHJcbiAgICAgICAgY29uc3QgZGVwdGggICAgICAgPSBncmlkLmRlcHRoO1xyXG4gICAgICAgIGNvbnN0IHBhdGNoU2l6ZSAgID0gZ3JpZC5wYXRjaFNpemU7XHJcbiAgICAgICAgY29uc3QgbnVtUGF0Y2hlc1ggPSBncmlkLm51bVBhdGNoZXNYO1xyXG4gICAgICAgIGNvbnN0IG51bVBhdGNoZXNaID0gZ3JpZC5udW1QYXRjaGVzWjtcclxuXHJcbiAgICAgICAgaWYgKHdpZHRoID49IDB4ZmZmZikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiTWF4IHdpZHRoID0gJWRcXG5cIiwgMHhmZmZmIC0xKTtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZGVwdGggPj0gMHhmZmZmKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJNYXggZGVwdGggPSAlZFxcblwiLCAweGZmZmYgLTEpO1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgod2lkdGggLSAxKSAlIChwYXRjaFNpemUgLSAxKSAhPT0gMCkge1xyXG4gICAgICAgICAgICBjb25zdCByZWNvbW1lbmRlZFdpZHRoID0gKCh3aWR0aCAtIDEgKyBwYXRjaFNpemUgLSAxKSAvIChwYXRjaFNpemUgLSAxKSkgKiAocGF0Y2hTaXplIC0gMSkgKyAxO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiV2lkdGggbWludXMgMSAoJWQpIG11c3QgYmUgZGl2aXNpYmxlIGJ5IHBhdGNoU2l6ZSBtaW51cyAxICglZClcXG5cIiwgd2lkdGgsIHBhdGNoU2l6ZSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJUcnkgdXNpbmcgV2lkdGggPSAlZFxcblwiLCByZWNvbW1lbmRlZFdpZHRoKTtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoKGRlcHRoIC0gMSkgJSAocGF0Y2hTaXplIC0gMSkgIT09IDApIHtcclxuICAgICAgICAgICAgY29uc3QgcmVjb21tZW5kZWREZXB0aCA9ICgoZGVwdGggLSAxICsgcGF0Y2hTaXplIC0gMSkgLyAocGF0Y2hTaXplIC0gMSkpICogKHBhdGNoU2l6ZSAtIDEpICsgMTtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkRlcHRoIG1pbnVzIDEgKCVkKSBtdXN0IGJlIGRpdmlzaWJsZSBieSBwYXRjaFNpemUgbWludXMgMSAoJWQpXFxuXCIsIGRlcHRoLCBwYXRjaFNpemUpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVHJ5IHVzaW5nIFdpZHRoID0gJWRcXG5cIiwgcmVjb21tZW5kZWREZXB0aCk7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBhdGNoU2l6ZSA8IDMpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlRoZSBtaW5pbXVtIHBhdGNoIHNpemUgaXMgMyAoJWQpXFxuXCIsIHBhdGNoU2l6ZSk7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIGlmIChwYXRjaFNpemUgJSAyID09PSAwKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJQYXRjaCBzaXplIG11c3QgYmUgYW4gb2RkIG51bWJlciAoJWQpXFxuXCIsIHBhdGNoU2l6ZSk7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fYnVpbGRMb2RzQW5kSW5kaWNlcyh6RmFyLCBwYXRjaFNpemUsIG51bVBhdGNoZXNYLCBudW1QYXRjaGVzWik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFpGYXIoekZhcjogaW50KSB7XHJcbiAgICAgICAgdGhpcy5fbG9kTWFuYWdlci5zZXRaRmFyKHpGYXIpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIF9idWlsZExvZHNBbmRJbmRpY2VzKHpGYXI6IGludCwgcGF0Y2hTaXplOiBpbnQsIG51bVBhdGNoZXNYOiBpbnQsIG51bVBhdGNoZXNaOiBpbnQpIHtcclxuXHJcbiAgICAgICAgdGhpcy5fbG9kTWFuYWdlciA9IG5ldyBMb2RNYW5hZ2VyKHpGYXIsIHBhdGNoU2l6ZSwgbnVtUGF0Y2hlc1gsIG51bVBhdGNoZXNaKTtcclxuICAgICAgICB0aGlzLl9sb2RJbmZvID0gbmV3IEFycmF5KHRoaXMuX2xvZE1hbmFnZXIubWF4TE9EICsgMSk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fbG9kSW5mby5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2RJbmZvW2ldID0gbmV3IExvZEluZm8oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBudW1JbmRpY2VzID0gdGhpcy5fY2FsY051bUluZGljZXMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5faW5kaWNlcyA9IG5ldyBVaW50MzJBcnJheShudW1JbmRpY2VzKTtcclxuXHJcbiAgICAgICAgbnVtSW5kaWNlcyA9IHRoaXMuX2luaXRJbmRpY2VzKHRoaXMuX2luZGljZXMpO1xyXG4gICAgICAgIC8vY29uc29sZS5sb2coXCJGaW5hbCBudW1iZXIgb2YgaW5kaWNlcyAlZFxcblwiLCBudW1JbmRpY2VzKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBfY2FsY051bUluZGljZXMoKTogaW50IHtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgbnVtUXVhZHMgPSAodGhpcy5wYXRjaFNpemUgLSAxKSAqICh0aGlzLnBhdGNoU2l6ZSAtIDEpO1xyXG4gICAgICAgIGxldCBudW1JbmRpY2VzID0gMDtcclxuXHJcbiAgICAgICAgY29uc3QgbWF4UGVybXV0YXRpb25zUGVyTGV2ZWwgPSAxNjsgLy8gdHJ1ZS9mYWxzZSBmb3IgZWFjaCBvZiB0aGUgZm91ciBzaWRlc1xyXG4gICAgICAgIGNvbnN0IGluZGljZXNQZXJRdWFkID0gNjsgICAgICAgICAgIC8vIHR3byB0cmlhbmdsZXNcclxuXHJcbiAgICAgICAgZm9yIChsZXQgbG9kID0gMDsgbG9kIDw9IHRoaXMubWF4TE9EOyBsb2QrKykge1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiTE9EICVkOiBudW0gcXVhZHMgJWRcXG5cIiwgbG9kLCBudW1RdWFkcyk7XHJcbiAgICAgICAgICAgIG51bUluZGljZXMgKz0gbnVtUXVhZHMgKiBpbmRpY2VzUGVyUXVhZCAqIG1heFBlcm11dGF0aW9uc1BlckxldmVsO1xyXG4gICAgICAgICAgICBudW1RdWFkcyAvPSA0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkluaXRpYWwgbnVtYmVyIG9mIGluZGljZXMgJWRcXG5cIiwgbnVtSW5kaWNlcyk7XHJcbiAgICAgICAgcmV0dXJuIG51bUluZGljZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdEluZGljZXMoaW5kaWNlczogVWludDMyQXJyYXkpOiBpbnQge1xyXG5cclxuICAgICAgICBsZXQgaW5kZXggPSAwO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBsb2QgPSAwOyBsb2QgPD0gdGhpcy5tYXhMT0Q7IGxvZCsrKSB7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCIqKiogSW5pdCBpbmRpY2VzIGxvZCAlZCAqKipcXG5cIiwgbG9kKTtcclxuICAgICAgICAgICAgaW5kZXggPSB0aGlzLl9pbml0SW5kaWNlc0xPRChpbmRleCwgaW5kaWNlcywgbG9kKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBpbmRleDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0SW5kaWNlc0xPRChpbmRleDogaW50LCBpbmRpY2VzOiBVaW50MzJBcnJheSwgbG9kOiBpbnQpOiBpbnQge1xyXG5cclxuICAgICAgICBsZXQgdG90YWxJbmRpY2VzRm9yTE9EID0gMDtcclxuICAgIFxyXG4gICAgICAgIGZvciAobGV0IGwgPSAwIDsgbCA8IExFRlQgOyBsKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgciA9IDAgOyByIDwgUklHSFQgOyByKyspIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHQgPSAwIDsgdCA8IFRPUCA7IHQrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGIgPSAwIDsgYiA8IEJPVFRPTSA7IGIrKykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5mbyA9IHRoaXMuX2xvZEluZm9bbG9kXS5pbmZvW2xdW3JdW3RdW2JdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnN0YXJ0ID0gaW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gdGhpcy5faW5pdEluZGljZXNMT0RTaW5nbGUoaW5kZXgsIGluZGljZXMsIGxvZCwgbG9kICsgbCwgbG9kICsgciwgbG9kICsgdCwgbG9kICsgYik7XHJcbiAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5jb3VudCA9IGluZGV4IC0gaW5mby5zdGFydDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxJbmRpY2VzRm9yTE9EICs9IGluZm8uY291bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIlRvdGFsIGluZGljZXMgZm9yIExPRDogJWRcXG5cIiwgdG90YWxJbmRpY2VzRm9yTE9EKTtcclxuICAgICAgICByZXR1cm4gaW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdEluZGljZXNMT0RTaW5nbGUoaW5kZXg6IGludCwgaW5kaWNlczogVWludDMyQXJyYXksIGxvZENvcmU6IGludCwgbG9kTGVmdDogaW50LCBsb2RSaWdodDogaW50LCBsb2RUb3A6IGludCwgbG9kQm90dG9tOiBpbnQpOiBpbnQge1xyXG5cclxuICAgICAgICBjb25zdCB3aWR0aCAgID0gdGhpcy5wYXRjaFNpemU7XHJcbiAgICAgICAgY29uc3QgZmFuU3RlcCA9IE1hdGgucG93KDIsIGxvZENvcmUgKyAxKTsgICAgICAgLy8gbG9kID0gMCAtLT4gMiwgbG9kID0gMSAtLT4gNCwgbG9kID0gMiAtLT4gOCwgZXRjXHJcbiAgICAgICAgY29uc3QgZW5kUG9zICA9IHRoaXMucGF0Y2hTaXplIC0gMSAtIGZhblN0ZXA7ICAvLyBwYXRjaCBzaXplIDUsIGZhbiBzdGVwIDIgLS0+IEVuZFBvcyA9IDI7IHBhdGNoIHNpemUgOSwgZmFuIHN0ZXAgMiAtLT4gRW5kUG9zID0gNlxyXG5cclxuICAgICAgICBmb3IgKGxldCB6ID0gMCA7IHogPD0gZW5kUG9zIDsgeiArPSBmYW5TdGVwKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHggPSAwIDsgeCA8PSBlbmRQb3MgOyB4ICs9IGZhblN0ZXApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxMZWZ0ICAgPSB4ID09IDAgICAgICA/IGxvZExlZnQgICA6IGxvZENvcmU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsUmlnaHQgID0geCA9PSBlbmRQb3MgPyBsb2RSaWdodCAgOiBsb2RDb3JlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbEJvdHRvbSA9IHogPT0gMCAgICAgID8gbG9kQm90dG9tIDogbG9kQ29yZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxUb3AgICAgPSB6ID09IGVuZFBvcyA/IGxvZFRvcCAgICA6IGxvZENvcmU7XHJcbiAgICAgICAgICAgICAgICBpbmRleCA9IHRoaXMuX2NyZWF0ZVRyaWFuZ2xlRmFuKGluZGV4LCBpbmRpY2VzLCBsb2RDb3JlLCBsTGVmdCwgbFJpZ2h0LCBsVG9wLCBsQm90dG9tLCB4LCB6LCB3aWR0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NyZWF0ZVRyaWFuZ2xlRmFuKGluZGV4OiBpbnQsIGluZGljZXM6IFVpbnQzMkFycmF5LCBsb2RDb3JlOiBpbnQsIGxvZExlZnQ6IGludCwgbG9kUmlnaHQ6IGludCwgbG9kVG9wOiBpbnQsIGxvZEJvdHRvbTogaW50LCB4OiBpbnQsIHo6IGludCwgd2lkdGg6IGludCk6IHVuc2lnbmVkX2ludCB7XHJcblxyXG4gICAgICAgIGNvbnN0IHN0ZXBMZWZ0ICAgPSBNYXRoLnBvdygyLCBsb2RMZWZ0KTsgLy8gYmVjYXVzZSBMT0Qgc3RhcnRzIGF0IHplcm8uLi5cclxuICAgICAgICBjb25zdCBzdGVwUmlnaHQgID0gTWF0aC5wb3coMiwgbG9kUmlnaHQpO1xyXG4gICAgICAgIGNvbnN0IHN0ZXBUb3AgICAgPSBNYXRoLnBvdygyLCBsb2RUb3ApO1xyXG4gICAgICAgIGNvbnN0IHN0ZXBCb3R0b20gPSBNYXRoLnBvdygyLCBsb2RCb3R0b20pO1xyXG4gICAgICAgIGNvbnN0IHN0ZXBDZW50ZXIgPSBNYXRoLnBvdygyLCBsb2RDb3JlKTtcclxuXHJcbiAgICAgICAgY29uc3QgaW5kZXhDZW50ZXIgPSAoeiArIHN0ZXBDZW50ZXIpICogd2lkdGggKyB4ICsgc3RlcENlbnRlcjtcclxuXHJcbiAgICAgICAgLy8gZmlyc3QgdXBcclxuICAgICAgICBsZXQgaW5kZXhUZW1wMSA9IHogKiB3aWR0aCArIHg7XHJcbiAgICAgICAgbGV0IGluZGV4VGVtcDIgPSAoeiArIHN0ZXBMZWZ0KSAqIHdpZHRoICsgeDtcclxuXHJcbiAgICAgICAgaW5kZXggPSB0aGlzLl9hZGRUcmlhbmdsZShpbmRleCwgaW5kaWNlcywgaW5kZXhDZW50ZXIsIGluZGV4VGVtcDEsIGluZGV4VGVtcDIpO1xyXG5cclxuICAgICAgICAvLyBzZWNvbmQgdXBcclxuICAgICAgICBpZiAobG9kTGVmdCA9PSBsb2RDb3JlKSB7XHJcbiAgICAgICAgICAgIGluZGV4VGVtcDEgPSBpbmRleFRlbXAyO1xyXG4gICAgICAgICAgICBpbmRleFRlbXAyICs9IHN0ZXBMZWZ0ICogd2lkdGg7XHJcblxyXG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuX2FkZFRyaWFuZ2xlKGluZGV4LCBpbmRpY2VzLCBpbmRleENlbnRlciwgaW5kZXhUZW1wMSwgaW5kZXhUZW1wMik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBmaXJzdCByaWdodFxyXG4gICAgICAgIGluZGV4VGVtcDEgPSBpbmRleFRlbXAyO1xyXG4gICAgICAgIGluZGV4VGVtcDIgKz0gc3RlcFRvcDtcclxuXHJcbiAgICAgICAgaW5kZXggPSB0aGlzLl9hZGRUcmlhbmdsZShpbmRleCwgaW5kaWNlcywgaW5kZXhDZW50ZXIsIGluZGV4VGVtcDEsIGluZGV4VGVtcDIpO1xyXG5cclxuICAgICAgICAvLyBzZWNvbmQgcmlnaHRcclxuICAgICAgICBpZiAobG9kVG9wID09PSBsb2RDb3JlKSB7XHJcbiAgICAgICAgICAgIGluZGV4VGVtcDEgPSBpbmRleFRlbXAyO1xyXG4gICAgICAgICAgICBpbmRleFRlbXAyICs9IHN0ZXBUb3A7XHJcblxyXG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuX2FkZFRyaWFuZ2xlKGluZGV4LCBpbmRpY2VzLCBpbmRleENlbnRlciwgaW5kZXhUZW1wMSwgaW5kZXhUZW1wMik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBmaXJzdCBkb3duXHJcbiAgICAgICAgaW5kZXhUZW1wMSA9IGluZGV4VGVtcDI7XHJcbiAgICAgICAgaW5kZXhUZW1wMiAtPSBzdGVwUmlnaHQgKiB3aWR0aDtcclxuXHJcbiAgICAgICAgaW5kZXggPSB0aGlzLl9hZGRUcmlhbmdsZShpbmRleCwgaW5kaWNlcywgaW5kZXhDZW50ZXIsIGluZGV4VGVtcDEsIGluZGV4VGVtcDIpO1xyXG5cclxuICAgICAgICAvLyBzZWNvbmQgZG93blxyXG4gICAgICAgIGlmIChsb2RSaWdodCA9PT0gbG9kQ29yZSkge1xyXG4gICAgICAgICAgICBpbmRleFRlbXAxID0gaW5kZXhUZW1wMjtcclxuICAgICAgICAgICAgaW5kZXhUZW1wMiAtPSBzdGVwUmlnaHQgKiB3aWR0aDtcclxuXHJcbiAgICAgICAgICAgIGluZGV4ID0gdGhpcy5fYWRkVHJpYW5nbGUoaW5kZXgsIGluZGljZXMsIGluZGV4Q2VudGVyLCBpbmRleFRlbXAxLCBpbmRleFRlbXAyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZpcnN0IGxlZnRcclxuICAgICAgICBpbmRleFRlbXAxID0gaW5kZXhUZW1wMjtcclxuICAgICAgICBpbmRleFRlbXAyIC09IHN0ZXBCb3R0b207XHJcblxyXG4gICAgICAgIGluZGV4ID0gdGhpcy5fYWRkVHJpYW5nbGUoaW5kZXgsIGluZGljZXMsIGluZGV4Q2VudGVyLCBpbmRleFRlbXAxLCBpbmRleFRlbXAyKTtcclxuXHJcbiAgICAgICAgLy8gc2Vjb25kIGxlZnRcclxuICAgICAgICBpZiAobG9kQm90dG9tID09PSBsb2RDb3JlKSB7XHJcbiAgICAgICAgICAgIGluZGV4VGVtcDEgPSBpbmRleFRlbXAyO1xyXG4gICAgICAgICAgICBpbmRleFRlbXAyIC09IHN0ZXBCb3R0b207XHJcblxyXG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuX2FkZFRyaWFuZ2xlKGluZGV4LCBpbmRpY2VzLCBpbmRleENlbnRlciwgaW5kZXhUZW1wMSwgaW5kZXhUZW1wMik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfYWRkVHJpYW5nbGUoaW5kZXg6IHVuc2lnbmVkX2ludCwgaW5kaWNlczogVWludDMyQXJyYXksIHYxOiB1bnNpZ25lZF9pbnQsIHYyOiB1bnNpZ25lZF9pbnQsIHYzOiB1bnNpZ25lZF9pbnQpIHtcclxuICAgICAgICBpbmRpY2VzW2luZGV4KytdID0gdjE7XHJcbiAgICAgICAgaW5kaWNlc1tpbmRleCsrXSA9IHYyO1xyXG4gICAgICAgIGluZGljZXNbaW5kZXgrK10gPSB2MztcclxuICAgICAgICByZXR1cm4gaW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgLy8gVE9ET1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHcmlkQnVpbGRlcjsiLCJpbXBvcnQgdHlwZSB7IGZsb2F0LCBSZWZPYmplY3QsIHVuc2lnbmVkaW50IGFzIHVuc2lnbmVkX2ludCB9IGZyb20gXCIuLi9TaGFyZWQvVHlwZXMubWpzXCI7XHJcbmltcG9ydCB7IElSZWFkb25seUNvb3Jkc0J1ZmZlciwgQ29vcmRzQnVmZmVyIH0gZnJvbSBcIi4vQ29vcmRzQnVmZmVyLm1qc1wiO1xyXG5pbXBvcnQgQWJzUGF0Y2hlZEhlaWdodE1hcCwgeyB0eXBlIElSZWFkb25seUFic1BhdGNoZWRIZWlnaHRNYXAgfSBmcm9tIFwiLi9BYnNQYXRjaGVkSGVpZ2h0TWFwLm1qc1wiO1xyXG5pbXBvcnQgR3JpZEJ1aWxkZXIsIHsgSUdyaWRQYXRjaGVkIH0gZnJvbSBcIi4vR3JpZEJ1aWxkZXIubWpzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElHcm9taXBHcmlkV2l0aEhlaWdodCBleHRlbmRzIElHcmlkUGF0Y2hlZCB7XHJcbiAgICByZWFkb25seSBtaW5IZWlnaHQ6IGZsb2F0O1xyXG4gICAgcmVhZG9ubHkgbWF4SGVpZ2h0OiBmbG9hdDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdlb21pcEdyaWRCdWlsZGVyIGV4dGVuZHMgR3JpZEJ1aWxkZXIge1xyXG5cclxuICAgIHByaXZhdGUgX3ZlcnRpY2VzOiBDb29yZHNCdWZmZXI7XHJcblxyXG4gICAgcHJvdGVjdGVkIF9oZWlnaHRNYXA6IEFic1BhdGNoZWRIZWlnaHRNYXA8YW55PjtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IHBhdGNoVmVydGljZXMoKTogSVJlYWRvbmx5Q29vcmRzQnVmZmVyIHsgcmV0dXJuIHRoaXMuX3ZlcnRpY2VzOyB9XHJcbiAgICBwdWJsaWMgZ2V0IGhlaWdodE1hcCgpOiBJUmVhZG9ubHlBYnNQYXRjaGVkSGVpZ2h0TWFwIHsgcmV0dXJuIHRoaXMuX2hlaWdodE1hcDsgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKGhlaWdodE1hcDogUmVmT2JqZWN0PEFic1BhdGNoZWRIZWlnaHRNYXA8YW55Pj4sIHpGYXI6IGZsb2F0KSB7XHJcblxyXG4gICAgICAgIHN1cGVyKGhlaWdodE1hcCwgekZhcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5faGVpZ2h0TWFwID0gaGVpZ2h0TWFwO1xyXG4gICAgICAgIHRoaXMuX3ZlcnRpY2VzICA9IG5ldyBDb29yZHNCdWZmZXIodGhpcy5faGVpZ2h0TWFwLCB0aGlzLl9oZWlnaHRNYXAucGF0Y2hTaXplKTtcclxuICAgICAgICB0aGlzLl92ZXJ0aWNlcy5pbml0KCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdlb21pcEdyaWRCdWlsZGVyOyIsImltcG9ydCB0eXBlIHsgSVZlY3RvcjMsIFJlZk9iamVjdCwgZmxvYXQsIGludCB9IGZyb20gXCIuLi9TaGFyZWQvVHlwZXMubWpzXCI7XHJcbmltcG9ydCBHZW9taXBHcmlkQnVpbGRlciBmcm9tIFwiLi9HZW9taXBHcmlkQnVpbGRlci5tanNcIjtcclxuaW1wb3J0IHsgSVBhdGNoTG9kLCBkZWZhdWx0UGF0Y2hMb2QgfSBmcm9tIFwiLi9Mb2RNYW5hZ2VyLm1qc1wiO1xyXG5cclxuZXhwb3J0IHR5cGUgUGF0Y2hJbml0RnVuY3Rpb24gPSAoYmFzZUluZGV4OiBpbnQsIGJhc2VWZXJ0ZXg6IGludCwgY291bnQ6IGludCwgcGF0Y2hYOiBpbnQsIHBhdGNoWjogaW50LCBtaW5YOiBpbnQsIG1pblo6IGludCwgc2l6ZTogaW50LCBsb2RJbmZvOiBSZWFkb25seTxJUGF0Y2hMb2Q+KSA9PiB2b2lkO1xyXG5leHBvcnQgdHlwZSBSZW5kZXJQcmVwYXJlclBhdGNoRnVuY3Rpb24gPSAodmlzaWJsZTogYm9vbGVhbiwgYmFzZUluZGV4OiBpbnQsIGJhc2VWZXJ0ZXg6IGludCwgY291bnQ6IGludCwgcGF0Y2hYOiBpbnQsIHBhdGNoWjogaW50LCBtaW5YOiBpbnQsIG1pblo6IGludCwgc2l6ZTogaW50LCBsb2RJbmZvOiBSZWFkb25seTxJUGF0Y2hMb2Q+KSA9PiB2b2lkO1xyXG5leHBvcnQgdHlwZSBGcnVzdHVtU3BoZXJlVGVzdEZ1bmN0aW9uID0gKGxvY2FsWDogZmxvYXQsIGxvY2FsWTogZmxvYXQsIGxvY2FsWjogZmxvYXQsIHJhZGl1czogZmxvYXQpID0+IGJvb2xlYW47XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElHcmlkUGF0Y2hJbml0aWFsaXplciB7XHJcbiAgICBpbml0UGF0Y2g6IFBhdGNoSW5pdEZ1bmN0aW9uLFxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElHcmlkUGF0Y2hSZW5kZXJQcmVwYXJlciB7XHJcbiAgICBwcmVwYXJlUGF0Y2g6IFJlbmRlclByZXBhcmVyUGF0Y2hGdW5jdGlvbixcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJRnJ1c3R1bSB7XHJcbiAgICBjb250YWluc1NwaGVyZTogRnJ1c3R1bVNwaGVyZVRlc3RGdW5jdGlvbixcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdlb21pcEdyaWRSZW5kZXJQcmVwYXJlciBleHRlbmRzIEdlb21pcEdyaWRCdWlsZGVyIHtcclxuXHJcbiAgICBwdWJsaWMgaW5pdFBhdGNoZXMoaW5pdGlhbGl6ZXI6IElHcmlkUGF0Y2hJbml0aWFsaXplcikge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAobGV0IHBhdGNoWiA9IDA7IHBhdGNoWiA8IHRoaXMubnVtUGF0Y2hlc1o7IHBhdGNoWisrKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBwYXRjaFggPSAwOyBwYXRjaFggPCB0aGlzLm51bVBhdGNoZXNYOyBwYXRjaFgrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IG1pblggPSBwYXRjaFggKiAodGhpcy5wYXRjaFNpemUgLSAxKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1pblogPSBwYXRjaFogKiAodGhpcy5wYXRjaFNpemUgLSAxKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmZvICAgICAgID0gdGhpcy5sb2RJbmZvWzBdLmluZm9bMF1bMF1bMF1bMF07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNlSW5kZXggID0gaW5mby5zdGFydDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJhc2VWZXJ0ZXggPSBtaW5aICogdGhpcy53aWR0aCArIG1pblg7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGluaXRpYWxpemVyLmluaXRQYXRjaChiYXNlSW5kZXgsIGJhc2VWZXJ0ZXgsIGluZm8uY291bnQsIHBhdGNoWCwgcGF0Y2haLCBtaW5YLCBtaW5aLCB0aGlzLnBhdGNoU2l6ZSwgZGVmYXVsdFBhdGNoTG9kKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHByaW50TG9kTWFwKCkge1xyXG4gICAgICAgIHRoaXMubG9kTWFuYWdlci5wcmludExvZE1hcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVMb2RzKGxvY2FsQ2FtZXJhUG9zOiBSZWZPYmplY3Q8SVZlY3RvcjM+LCBjZW50ZXI6IGJvb2xlYW4gPSB0cnVlKSB7XHJcbiAgICAgICAgdGhpcy5sb2RNYW5hZ2VyLnVwZGF0ZShsb2NhbENhbWVyYVBvcywgdGhpcy5oZWlnaHRNYXAsIGNlbnRlcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGVhY2hQYXRjaGVzKHJlbmRlclByZXBhcmVyOiBJR3JpZFBhdGNoUmVuZGVyUHJlcGFyZXIsIGZydXN0dW0/OiBJRnJ1c3R1bSkge1xyXG5cclxuICAgICAgICBmb3IgKGxldCBwYXRjaFogPSAwOyBwYXRjaFogPCB0aGlzLm51bVBhdGNoZXNaOyBwYXRjaForKykge1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgcGF0Y2hYID0gMDsgcGF0Y2hYIDwgdGhpcy5udW1QYXRjaGVzWDsgcGF0Y2hYKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBtaW5YID0gcGF0Y2hYICogKHRoaXMucGF0Y2hTaXplIC0gMSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtaW5aID0gcGF0Y2haICogKHRoaXMucGF0Y2hTaXplIC0gMSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgdmlzaWJsZSA9ICEhZnJ1c3R1bSAmJiB0aGlzLl9pc1BhdGNoSW5zaWRlVmlld0ZydXN0dW1CeVNwaGVyZShwYXRjaFgsIHBhdGNoWiwgZnJ1c3R1bSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgcGxvZCA9IHRoaXMubG9kTWFuYWdlci5nZXRQYXRjaExvZChwYXRjaFgsIHBhdGNoWik7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBDID0gcGxvZC5jb3JlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgTCA9IHBsb2QubGVmdDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IFIgPSBwbG9kLnJpZ2h0O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgVCA9IHBsb2QudG9wO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgQiA9IHBsb2QuYm90dG9tO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5mbyA9IHRoaXMubG9kSW5mb1tDXS5pbmZvW0xdW1JdW1RdW0JdO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGJhc2VJbmRleCAgPSBpbmZvLnN0YXJ0O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYmFzZVZlcnRleCA9IG1pblogKiB0aGlzLndpZHRoICsgbWluWDtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgcmVuZGVyUHJlcGFyZXIucHJlcGFyZVBhdGNoKHZpc2libGUsIGJhc2VJbmRleCwgYmFzZVZlcnRleCwgaW5mby5jb3VudCwgcGF0Y2hYLCBwYXRjaFosIG1pblgsIG1pblosIHRoaXMucGF0Y2hTaXplLCBwbG9kKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pc1BhdGNoSW5zaWRlVmlld0ZydXN0dW1CeVNwaGVyZShwYXRjaEJhc2VYOiBpbnQsIHBhdGNoQmFzZVo6IGludCwgZnJ1c3R1bTogSUZydXN0dW0pOiBib29sZWFuIHtcclxuXHJcbiAgICAgICAgY29uc3QgcGF0Y2hNaW5IZWlnaHQgPSB0aGlzLmhlaWdodE1hcC5nZXRQYXRjaE1pbihwYXRjaEJhc2VYLCBwYXRjaEJhc2VaKTtcclxuICAgICAgICBjb25zdCBwYXRjaE1heEhlaWdodCA9IHRoaXMuaGVpZ2h0TWFwLmdldFBhdGNoTWF4KHBhdGNoQmFzZVgsIHBhdGNoQmFzZVopO1xyXG5cclxuICAgICAgICBjb25zdCBwYXRjaFJhZGl1cyAgICAgICA9IHRoaXMucGF0Y2hTaXplIC8gMjtcclxuICAgICAgICBjb25zdCBwYXRjaEhlaWdodFJhZGl1cyA9IHBhdGNoTWF4SGVpZ2h0IC0gcGF0Y2hNaW5IZWlnaHQ7XHJcblxyXG4gICAgICAgIGNvbnN0IHBhdGNoQ2VudGVyWCAgID0gKHBhdGNoQmFzZVggKiB0aGlzLnBhdGNoU2l6ZSkgKyBwYXRjaFJhZGl1cztcclxuICAgICAgICBjb25zdCBwYXRjaENlbnRlclkgICA9IChwYXRjaE1heEhlaWdodCArIHBhdGNoTWluSGVpZ2h0KSAvIDI7XHJcbiAgICAgICAgY29uc3QgcGF0Y2hDZW50ZXJaICAgPSAocGF0Y2hCYXNlWiAqIHRoaXMucGF0Y2hTaXplKSArIHBhdGNoUmFkaXVzO1xyXG4gICAgICAgIGNvbnN0IHJhZGl1cyAgICAgICAgID0gKHBhdGNoUmFkaXVzID4gcGF0Y2hIZWlnaHRSYWRpdXMgPyBwYXRjaFJhZGl1cyA6IHBhdGNoSGVpZ2h0UmFkaXVzKSAqIE1hdGguU1FSVDI7XHJcblxyXG4gICAgICAgIC8vIGNlbnRlciB0aGUgcGF0Y2hlcyByZWxhdGl2ZSB0byB0aGUgZW50aXR5IGNlbnRlclxyXG4gICAgICAgIGNvbnN0IHBhdGNoQ2VudGVyZWRYID0gKC10aGlzLndpZHRoIC8gMikgKyBwYXRjaENlbnRlclg7XHJcbiAgICAgICAgY29uc3QgcGF0Y2hDZW50ZXJlZFogPSAoLXRoaXMuZGVwdGggLyAyKSArIHBhdGNoQ2VudGVyWjtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZydXN0dW0uY29udGFpbnNTcGhlcmUocGF0Y2hDZW50ZXJlZFgsIHBhdGNoQ2VudGVyWSwgcGF0Y2hDZW50ZXJlZFosIHJhZGl1cyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdlb21pcEdyaWRSZW5kZXJQcmVwYXJlciIsImltcG9ydCB7IGZsb2F0IH0gZnJvbSBcIi4uL1NoYXJlZC9UeXBlcy5tanNcIjtcclxuaW1wb3J0IHsgSUZydXN0dW0gfSBmcm9tIFwiLi4vVGVycmFpblN5c3RlbS9HZW9taXBHcmlkUmVuZGVyUHJlcGFyZXIubWpzXCI7XHJcblxyXG5jb25zdCB0bXBWZWMgPSBuZXcgcGMuVmVjMygpO1xyXG5jb25zdCB0bXBSYWQgPSBuZXcgcGMuVmVjMygpO1xyXG5jb25zdCB0bXBTcGhlcmUgPSBuZXcgcGMuQm91bmRpbmdTcGhlcmUoKTtcclxuXHJcbmV4cG9ydCBjbGFzcyBGcnVzdHVtIGltcGxlbWVudHMgSUZydXN0dW0ge1xyXG5cclxuICAgIHByaXZhdGUgX21hcmdpbjogZmxvYXQ7XHJcbiAgICBwcml2YXRlIF9tYXQ6IHBjeC5NYXQ0O1xyXG4gICAgcHJpdmF0ZSBfc2NhbGU6IHBjeC5WZWMzO1xyXG4gICAgcHJpdmF0ZSBfZnJ1c3R1bTogcGN4LkZydXN0dW07XHJcblxyXG4gICAgcHVibGljIGdldCBtYXJnaW4oKSAgICAgICAgICAgICB7IHJldHVybiB0aGlzLl9tYXJnaW47IH1cclxuICAgIHB1YmxpYyBzZXQgbWFyZ2luKHZhbHVlOiBmbG9hdCkgeyB0aGlzLl9tYXJnaW4gPSB2YWx1ZTsgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgZnJ1c3R1bSgpICAgICAgICAgICAgICAgICAgIHsgcmV0dXJuIHRoaXMuX2ZydXN0dW07IH1cclxuICAgIHB1YmxpYyBzZXQgZnJ1c3R1bSh2YWx1ZTogcGN4LkZydXN0dW0pIHsgdGhpcy5fZnJ1c3R1bSA9IHZhbHVlOyB9XHJcblxyXG4gICAgcHVibGljIGdldCB0cmFuc2Zvcm0oKSAgICAgICAgICAgICAgICB7IHJldHVybiB0aGlzLl9tYXQ7IH1cclxuICAgIHB1YmxpYyBzZXQgdHJhbnNmb3JtKHZhbHVlOiBwY3guTWF0NCkge1xyXG4gICAgICAgIHRoaXMuX21hdC5jb3B5KHZhbHVlKTtcclxuICAgICAgICB0aGlzLl9tYXQuZ2V0U2NhbGUodGhpcy5fc2NhbGUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl9tYXJnaW4gPSAxO1xyXG4gICAgICAgIHRoaXMuX21hdCAgICA9IG5ldyBwYy5NYXQ0KCk7XHJcbiAgICAgICAgdGhpcy5fc2NhbGUgID0gbmV3IHBjLlZlYzMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY29udGFpbnNTcGhlcmUobG9jYWxYOiBmbG9hdCwgbG9jYWxZOiBmbG9hdCwgbG9jYWxaOiBmbG9hdCwgcmFkaXVzOiBmbG9hdCkge1xyXG5cclxuICAgICAgICB0bXBWZWMuc2V0KGxvY2FsWCwgbG9jYWxZLCBsb2NhbFopO1xyXG4gICAgICAgIHRtcFJhZC5jb3B5KHRoaXMuX3NjYWxlKS5tdWxTY2FsYXIocmFkaXVzKTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWF0LnRyYW5zZm9ybVBvaW50KHRtcFZlYywgdG1wVmVjKTtcclxuXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIHRtcFNwaGVyZS5jZW50ZXIgPSB0bXBWZWM7XHJcbiAgICAgICAgdG1wU3BoZXJlLnJhZGl1cyA9IHRtcFJhZC5kaXN0YW5jZShwYy5WZWMzLlpFUk8pICogdGhpcy5fbWFyZ2luO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5fZnJ1c3R1bS5jb250YWluc1NwaGVyZSh0bXBTcGhlcmUpID4gMDtcclxuICAgIH1cclxufSIsImV4cG9ydCBjb25zdCBiYXNlVlMgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gXHJcbiAgICBhdHRyaWJ1dGUgdWludCB2ZXJ0ZXhfcG9zaXRpb247XHJcblxyXG4gICAgdW5pZm9ybSBmbG9hdCBtaW5YO1xyXG4gICAgdW5pZm9ybSBmbG9hdCBtaW5aO1xyXG4gICAgdW5pZm9ybSBmbG9hdCBzdGVwO1xyXG4gICAgdW5pZm9ybSBmbG9hdCBwaXRjaDtcclxuICAgIHVuaWZvcm0gZmxvYXQgeWF3O1xyXG4gICAgdW5pZm9ybSBmbG9hdCB3aWR0aDtcclxuICAgIHVuaWZvcm0gZmxvYXQgaGVpZ2h0O1xyXG4gICAgdW5pZm9ybSBmbG9hdCBiZW5kU3RyZW5ndGg7XHJcblxyXG4gICAgdW5pZm9ybSBtYXQ0IG1hdHJpeF92aWV3UHJvamVjdGlvbjtcclxuICAgIHVuaWZvcm0gbWF0NCBtYXRyaXhfbW9kZWw7XHJcbiAgICB1bmlmb3JtIG1hdDMgbWF0cml4X25vcm1hbDtcclxuXHJcbiAgICB2ZWMzIGRQb3NpdGlvblc7XHJcbiAgICBtYXQ0IGRNb2RlbE1hdHJpeDtcclxuICAgIG1hdDMgZE5vcm1hbE1hdHJpeDtcclxuYDtcclxuXHJcbmV4cG9ydCBjb25zdCBpbnN0YW5jaW5nVlMgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gXHJcbiAgICBhdHRyaWJ1dGUgdmVjNCBpbnN0YW5jZV9saW5lMTtcclxuICAgIGF0dHJpYnV0ZSB2ZWM0IGluc3RhbmNlX2xpbmUyO1xyXG4gICAgYXR0cmlidXRlIHZlYzQgaW5zdGFuY2VfbGluZTM7XHJcbiAgICBhdHRyaWJ1dGUgdmVjNCBpbnN0YW5jZV9saW5lNDtcclxuYDtcclxuXHJcbmV4cG9ydCBjb25zdCB0cmFuc2Zvcm1WUyA9IC8qKiBAdHlwZSBnbHNsICovXHJcbmBcclxuICAgIG1hdDQgZ2V0TW9kZWxNYXRyaXgoKSB7XHJcbiAgICAgICAgcmV0dXJuIG1hdDQoaW5zdGFuY2VfbGluZTEsIGluc3RhbmNlX2xpbmUyLCBpbnN0YW5jZV9saW5lMywgaW5zdGFuY2VfbGluZTQpO1xyXG4gICAgfVxyXG5cclxuICAgIGZsb2F0IHJhbmRvbSh2ZWMyIHN0KSB7XHJcbiAgICAgICAgcmV0dXJuIGZyYWN0KHNpbihkb3Qoc3QueHksIHZlYzIoMTIuOTg5OCw3OC4yMzMpKSkgKiA0Mzc1OC41NDUzMTIzKTtcclxuICAgIH1cclxuXHJcbiAgICBmbG9hdCBlYXNlT3V0KGZsb2F0IHgsIGZsb2F0IHQpIHtcclxuICAgICAgICByZXR1cm4gMS4wIC0gcG93KDEuMCAtIHgsIHQpO1xyXG4gICAgfVxyXG5cclxuICAgIGludCBHUkFTU19TRUdNRU5UUyA9IDY7XHJcbiAgICBpbnQgR1JBU1NfVkVSVElDRVMgPSAxNDtcclxuXHJcbiAgICBmbG9hdCBnZXRaU2lkZShpbnQgdmVydEluZGV4KSB7XHJcbiAgICAgICAgaW50IHZlcnRJRCA9IHZlcnRJbmRleCAlIEdSQVNTX1ZFUlRJQ0VTO1xyXG4gICAgICAgIHJldHVybiAtKGZsb2F0KHZlcnRJbmRleCAvIEdSQVNTX1ZFUlRJQ0VTKSAqIDIuMCAtIDEuMCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmVjMyBnZXRWZXJ0ZXhMb2NhbFBvc2l0aW9uKGludCB2ZXJ0SW5kZXgpIHtcclxuXHJcbiAgICAgICAgaWYgKHZlcnRJbmRleCA9PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2ZWMzKDAuMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoKHZlcnRJbmRleCA+IEdSQVNTX1ZFUlRJQ0VTICAgICAgICAgJiYgdmVydEluZGV4IDwgR1JBU1NfVkVSVElDRVMgKyA0KSB8fFxyXG4gICAgICAgICAgICAodmVydEluZGV4ID4gR1JBU1NfVkVSVElDRVMgKiAyIC0gMiAmJiB2ZXJ0SW5kZXggPCBHUkFTU19WRVJUSUNFUyAqIDIgKyAyKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gdmVjMygwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgYm9vbCBpc0ZpcnN0SW5kZXggPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKHZlcnRJbmRleCA9PSAxKSB7XHJcbiAgICAgICAgICAgIHZlcnRJbmRleCA9IDI7XHJcbiAgICAgICAgICAgIGlzRmlyc3RJbmRleCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmbG9hdCBHUkFTU19MT0RfRElTVCA9IDE1LjA7XHJcbiAgICAgICAgZmxvYXQgR1JBU1NfTUFYX0RJU1QgPSAxMDAuMDtcclxuXHJcbiAgICAgICAgZmxvYXQgdmVydElEID0gZmxvYXQodmVydEluZGV4ICUgR1JBU1NfVkVSVElDRVMpO1xyXG4gICAgICAgIGZsb2F0IHpTaWRlICA9IC0oZmxvYXQodmVydEluZGV4IC8gR1JBU1NfVkVSVElDRVMpICogMi4wIC0gMS4wKTsgLy8gMSA9IGZyb250LCAtMSA9IGJhY2tcclxuICAgICAgICBmbG9hdCB4U2lkZSAgPSBtb2QodmVydElELCAyLjApOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgPSBsZWZ0LCAxID0gcmlnaHRcclxuICAgICAgICBmbG9hdCBoZWlnaHRQZXJjZW50ID0gKHZlcnRJRCAtIHhTaWRlKSAvIGZsb2F0KEdSQVNTX1NFR01FTlRTICogMik7XHJcbiAgICAgICAgZmxvYXQgaGlnaExPRE91dCAgICA9IEdSQVNTX0xPRF9ESVNUOy8vc21vb3Roc3RlcChHUkFTU19MT0RfRElTVCAqIDAuNSwgR1JBU1NfTE9EX0RJU1QsIGRpc3RhbmNlKGNhbWVyYVBvc2l0aW9uLCBncmFzc0JsYWRlV29ybGRQb3MpKTtcclxuXHJcbiAgICAgICAgZmxvYXQgcmFuZG9tSGVpZ2h0ID0gMS4wO1xyXG4gICAgICAgIGZsb2F0IHJhbmRvbVdpZHRoICA9IDEuMDtcclxuXHJcbiAgICAgICAgZmxvYXQgZ3Jhc3NUb3RhbEhlaWdodCAgICA9IGhlaWdodCAqIHJhbmRvbUhlaWdodDtcclxuICAgICAgICBmbG9hdCBncmFzc1RvdGFsV2lkdGhIaWdoID0gZWFzZU91dCgxLjAgLSBoZWlnaHRQZXJjZW50LCAyLjApO1xyXG4gICAgICAgIGZsb2F0IGdyYXNzVG90YWxXaWR0aExvdyAgPSAxLjAgLSBoZWlnaHRQZXJjZW50O1xyXG4gICAgICAgIGZsb2F0IGdyYXNzVG90YWxXaWR0aCAgICAgPSB3aWR0aCAqIG1peChncmFzc1RvdGFsV2lkdGhIaWdoLCBncmFzc1RvdGFsV2lkdGhMb3csIGhpZ2hMT0RPdXQpICogcmFuZG9tV2lkdGg7XHJcblxyXG4gICAgICAgIC8vIFNoaWZ0IHZlcnRzXHJcbiAgICAgICAgZmxvYXQgeCA9ICh4U2lkZSAtIDAuNSkgKiBncmFzc1RvdGFsV2lkdGg7XHJcbiAgICAgICAgZmxvYXQgeSA9IGhlaWdodFBlcmNlbnQgKiBncmFzc1RvdGFsSGVpZ2h0O1xyXG5cclxuICAgICAgICBpZiAodmVydEluZGV4ID09IDIgJiYgaXNGaXJzdEluZGV4ID09IHRydWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZlYzMoLXgsIHksIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdmVjMyh4LCB5LCAwKTtcclxuICAgIH1cclxuXHJcbiAgICB2ZWM0IGdldFBvc2l0aW9uKCkge1xyXG5cclxuICAgICAgICBkTW9kZWxNYXRyaXggPSBnZXRNb2RlbE1hdHJpeCgpO1xyXG5cclxuICAgICAgICB2ZWMzIGxvY1AgPSBnZXRWZXJ0ZXhMb2NhbFBvc2l0aW9uKGdsX1ZlcnRleElEKTtcclxuICAgICAgICB2ZWM0IHBvc1cgPSBkTW9kZWxNYXRyaXggKiB2ZWM0KGxvY1AsIDEuMCk7XHJcblxyXG4gICAgICAgIGRQb3NpdGlvblcgPSBwb3NXLnh5ejtcclxuXHJcbiAgICAgICAgdmVjNCBzY3JlZW5Qb3MgPSBtYXRyaXhfdmlld1Byb2plY3Rpb24gKiBwb3NXO1xyXG4gICAgICAgIHJldHVybiBzY3JlZW5Qb3M7XHJcbiAgICB9XHJcblxyXG4gICAgdmVjMyBnZXRXb3JsZFBvc2l0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBkUG9zaXRpb25XO1xyXG4gICAgfVxyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IG5vcm1hbFZTID0gLyoqIEB0eXBlIGdsc2wgKi9cclxuYFxyXG4gICAgdmVjMyBjYWxjdWxhdGVOb3JtYWwoKVxyXG4gICAge1xyXG4gICAgICAgIGludCB0cmlWZXJ0ZXhJbmRleCA9IGdsX1ZlcnRleElEICUgMztcclxuXHJcbiAgICAgICAgdmVjMyBwb3MxO1xyXG4gICAgICAgIHZlYzMgcG9zMjtcclxuICAgICAgICB2ZWMzIHBvczM7XHJcblxyXG4gICAgICAgIGlmICh0cmlWZXJ0ZXhJbmRleCA9PSAwKSB7XHJcbiAgICAgICAgICAgIHBvczEgPSBnZXRWZXJ0ZXhMb2NhbFBvc2l0aW9uKGdsX1ZlcnRleElEKTtcclxuICAgICAgICAgICAgcG9zMiA9IGdldFZlcnRleExvY2FsUG9zaXRpb24oZ2xfVmVydGV4SUQgKyAxKTtcclxuICAgICAgICAgICAgcG9zMyA9IGdldFZlcnRleExvY2FsUG9zaXRpb24oZ2xfVmVydGV4SUQgKyAyKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRyaVZlcnRleEluZGV4ID09IDEpIHtcclxuICAgICAgICAgICAgcG9zMSA9IGdldFZlcnRleExvY2FsUG9zaXRpb24oZ2xfVmVydGV4SUQgLSAxKTtcclxuICAgICAgICAgICAgcG9zMiA9IGdldFZlcnRleExvY2FsUG9zaXRpb24oZ2xfVmVydGV4SUQpO1xyXG4gICAgICAgICAgICBwb3MzID0gZ2V0VmVydGV4TG9jYWxQb3NpdGlvbihnbF9WZXJ0ZXhJRCArIDEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBvczEgPSBnZXRWZXJ0ZXhMb2NhbFBvc2l0aW9uKGdsX1ZlcnRleElEIC0gMik7XHJcbiAgICAgICAgICAgIHBvczIgPSBnZXRWZXJ0ZXhMb2NhbFBvc2l0aW9uKGdsX1ZlcnRleElEIC0gMSk7XHJcbiAgICAgICAgICAgIHBvczMgPSBnZXRWZXJ0ZXhMb2NhbFBvc2l0aW9uKGdsX1ZlcnRleElEKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZlYzMgdjEgPSBwb3MyIC0gcG9zMTtcclxuICAgICAgICB2ZWMzIHYyID0gcG9zMyAtIHBvczE7XHJcbiAgICAgICAgdmVjMyBuID0gbm9ybWFsaXplKGNyb3NzKHYxLCB2MikpO1xyXG5cclxuICAgICAgICBpZiAoZ2xfVmVydGV4SUQgJSBHUkFTU19WRVJUSUNFUyAlIDIgPT0gMSkge1xyXG4gICAgICAgICAgICAvL3JldHVybiAtbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBuO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB2ZWMzIGdldE5vcm1hbCgpXHJcbiAgICB7XHJcbiAgICAgICAgZE5vcm1hbE1hdHJpeCA9IG1hdDMoaW5zdGFuY2VfbGluZTEueHl6LCBpbnN0YW5jZV9saW5lMi54eXosIGluc3RhbmNlX2xpbmUzLnh5eik7XHJcblxyXG4gICAgICAgIHZlYzMgdGVtcE5vcm1hbCA9IGNhbGN1bGF0ZU5vcm1hbCgpO1xyXG5cclxuICAgICAgICByZXR1cm4gbm9ybWFsaXplKGROb3JtYWxNYXRyaXggKiB0ZW1wTm9ybWFsKTtcclxuICAgIH1cclxuYDtcclxuXHJcbmV4cG9ydCBjb25zdCBkaWZmdXNlUFMgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gXHJcbiAgICB1bmlmb3JtIHZlYzMgZ3JvdW5kX2NvbG9yO1xyXG5cclxuICAgIHZvaWQgZ2V0QWxiZWRvKClcclxuICAgIHtcclxuICAgICAgICBkQWxiZWRvID0gZ3JvdW5kX2NvbG9yO1xyXG4gICAgfVxyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IGdyYXNzU2hhZGVyQ2h1bmtzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG5cclxuICAgIC8vIFZlcnRleFxyXG4gICAgYmFzZVZTLFxyXG4gICAgLy90cmFuc2Zvcm1EZWNsVlMsXHJcbiAgICB0cmFuc2Zvcm1WUyxcclxuICAgIG5vcm1hbFZTLFxyXG4gICAgLy91djBWUyxcclxuICAgIC8vc3RhcnRWUyxcclxuXHJcbiAgICAvLyBGcmFnbWVudFxyXG4gICAgZGlmZnVzZVBTLFxyXG59XHJcblxyXG5cclxuZXhwb3J0IGNvbnN0IGJ1aWxkTWF0cml4ID1cclxuYFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgIGZsb2F0IHdpZHRoICAgICA9IHg7XHJcbiAgICAgICAgZmxvYXQgZGlzdGFuY2UgID0geTtcclxuICAgICAgICBmbG9hdCBiZW50UGl0Y2ggPSBwaXRjaCAtIGRpc3RhbmNlICogYmVuZFN0cmVuZ3RoO1xyXG5cclxuICAgICAgICByZXR1cm4gdmVjMyhcclxuICAgICAgICAgICAgY29zKHlhdykgKiAtd2lkdGggKyBjb3MoYmVudFBpdGNoKSAqIGRpc3RhbmNlICogc2luKHlhdyksXHJcbiAgICAgICAgICAgIHNpbihiZW50UGl0Y2gpICogZGlzdGFuY2UsXHJcbiAgICAgICAgICAgIHNpbih5YXcpICogd2lkdGggKyBjb3MoYmVudFBpdGNoKSAqIGRpc3RhbmNlICogY29zKHlhdylcclxuICAgICAgICApO1xyXG4gICAgICAgICovXHJcblxyXG4gICAgZ2V0TW9kZWxNYXRyaXhCeVRSUygpIHtcclxuXHJcbiAgICAgICAgY29uc3QgcXggPSByLng7XHJcbiAgICAgICAgY29uc3QgcXkgPSByLnk7XHJcbiAgICAgICAgY29uc3QgcXogPSByLno7XHJcbiAgICAgICAgY29uc3QgcXcgPSByLnc7XHJcblxyXG4gICAgICAgIGNvbnN0IHN4ID0gcy54O1xyXG4gICAgICAgIGNvbnN0IHN5ID0gcy55O1xyXG4gICAgICAgIGNvbnN0IHN6ID0gcy56O1xyXG5cclxuICAgICAgICBjb25zdCB4MiA9IHF4ICsgcXg7XHJcbiAgICAgICAgY29uc3QgeTIgPSBxeSArIHF5O1xyXG4gICAgICAgIGNvbnN0IHoyID0gcXogKyBxejtcclxuICAgICAgICBjb25zdCB4eCA9IHF4ICogeDI7XHJcbiAgICAgICAgY29uc3QgeHkgPSBxeCAqIHkyO1xyXG4gICAgICAgIGNvbnN0IHh6ID0gcXggKiB6MjtcclxuICAgICAgICBjb25zdCB5eSA9IHF5ICogeTI7XHJcbiAgICAgICAgY29uc3QgeXogPSBxeSAqIHoyO1xyXG4gICAgICAgIGNvbnN0IHp6ID0gcXogKiB6MjtcclxuICAgICAgICBjb25zdCB3eCA9IHF3ICogeDI7XHJcbiAgICAgICAgY29uc3Qgd3kgPSBxdyAqIHkyO1xyXG4gICAgICAgIGNvbnN0IHd6ID0gcXcgKiB6MjtcclxuXHJcbiAgICAgICAgY29uc3QgbSA9IHRoaXMuZGF0YTtcclxuXHJcbiAgICAgICAgbVswXSA9ICgxIC0gKHl5ICsgenopKSAqIHN4O1xyXG4gICAgICAgIG1bMV0gPSAoeHkgKyB3eikgKiBzeDtcclxuICAgICAgICBtWzJdID0gKHh6IC0gd3kpICogc3g7XHJcbiAgICAgICAgbVszXSA9IDA7XHJcblxyXG4gICAgICAgIG1bNF0gPSAoeHkgLSB3eikgKiBzeTtcclxuICAgICAgICBtWzVdID0gKDEgLSAoeHggKyB6eikpICogc3k7XHJcbiAgICAgICAgbVs2XSA9ICh5eiArIHd4KSAqIHN5O1xyXG4gICAgICAgIG1bN10gPSAwO1xyXG5cclxuICAgICAgICBtWzhdID0gKHh6ICsgd3kpICogc3o7XHJcbiAgICAgICAgbVs5XSA9ICh5eiAtIHd4KSAqIHN6O1xyXG4gICAgICAgIG1bMTBdID0gKDEgLSAoeHggKyB5eSkpICogc3o7XHJcbiAgICAgICAgbVsxMV0gPSAwO1xyXG5cclxuICAgICAgICBtWzEyXSA9IHQueDtcclxuICAgICAgICBtWzEzXSA9IHQueTtcclxuICAgICAgICBtWzE0XSA9IHQuejtcclxuICAgICAgICBtWzE1XSA9IDE7XHJcbiAgICB9XHJcbmA7IiwiaW1wb3J0IHR5cGUgeyBmbG9hdCwgaW50IH0gZnJvbSBcIi4uL1NoYXJlZC9UeXBlcy5tanNcIjtcbmltcG9ydCB0eXBlIHsgSUhlaWdodE1hcEZpbGVJbXBvcnRPcHRpb25zIH0gZnJvbSBcIi4vQWJzSGVpZ2h0TWFwRmlsZUlPLm1qc1wiO1xuaW1wb3J0IEdlb21pcEdyaWRSZW5kZXJQcmVwYXJlciBmcm9tIFwiLi9HZW9taXBHcmlkUmVuZGVyUHJlcGFyZXIubWpzXCI7XG5pbXBvcnQgSGVpZ2h0TWFwIGZyb20gXCIuL0hlaWdodE1hcC5tanNcIjtcbmltcG9ydCB7IElab25lIH0gZnJvbSBcIi4vSVpvbmUubWpzXCI7XG5cbmV4cG9ydCBjbGFzcyBHZW9taXBHcmlkIGV4dGVuZHMgR2VvbWlwR3JpZFJlbmRlclByZXBhcmVyIHtcblxuICAgIHB1YmxpYyBzZXRIZWlnaHQoeDogaW50LCB6OiBpbnQsIHZhbHVlOiBmbG9hdCkge1xuICAgICAgICB0aGlzLl9oZWlnaHRNYXAuc2V0KHgsIHosIHZhbHVlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXBwZW5kVG9IZWlnaHQoeDogaW50LCB6OiBpbnQsIHZhbHVlOiBmbG9hdCkge1xuICAgICAgICB0aGlzLl9oZWlnaHRNYXAuYXBwZW5kKHgsIHosIHZhbHVlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbXVsdGlwbHlUb0hlaWdodCh4OiBpbnQsIHo6IGludCwgdmFsdWU6IGZsb2F0LCBkZWZhdWx0SGVpZ2h0OiBmbG9hdCA9IDApIHtcbiAgICAgICAgdGhpcy5faGVpZ2h0TWFwLm11bHRpcGx5KHgsIHosIHZhbHVlLCBkZWZhdWx0SGVpZ2h0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc21vb3RoSGVpZ2h0c1pvbmUoem9uZTogSVpvbmUsIG5wOiBmbG9hdCwgcmFkaXVzOiBmbG9hdCkge1xuICAgICAgICB0aGlzLl9oZWlnaHRNYXAuc21vb3RoWm9uZSh6b25lLCBucCwgcmFkaXVzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgbG9hZEhlaWdodE1hcEZyb21GaWxlKGJ1ZmZlcjogQXJyYXlCdWZmZXIsIG9wdGlvbnM/OiBJSGVpZ2h0TWFwRmlsZUltcG9ydE9wdGlvbnMsIG5wOiBmbG9hdCA9IC0xLCByYWRpdXM6IGludCA9IDApIHtcbiAgICAgICAgY29uc3QgaGVhZGVyID0gYXdhaXQgdGhpcy5faGVpZ2h0TWFwLmZyb21GaWxlKGJ1ZmZlciwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2hlaWdodE1hcC5zbW9vdGgobnAsIHJhZGl1cyk7XG4gICAgICAgIHRoaXMuX2hlaWdodE1hcC5yZWNhbGN1bGF0ZU1pbk1heCh0aGlzLl9oZWlnaHRNYXApO1xuICAgICAgICB0aGlzLl9oZWlnaHRNYXAucmVjYWxjdWxhdGVBQUJCKCk7XG4gICAgICAgIHJldHVybiBoZWFkZXI7XG4gICAgfVxuXG4gICAgcHVibGljIGxvYWRIZWlnaHRNYXBGcm9tSW1nKGltZzogSW1hZ2VCaXRtYXAsIG5wOiBmbG9hdCA9IC0xLCByYWRpdXM6IGludCA9IDApIHtcbiAgICAgICAgdGhpcy5faGVpZ2h0TWFwLmZyb21JbWFnZShpbWcpO1xuICAgICAgICB0aGlzLl9oZWlnaHRNYXAuc21vb3RoKG5wLCByYWRpdXMpO1xuICAgICAgICB0aGlzLl9oZWlnaHRNYXAucmVjYWxjdWxhdGVNaW5NYXgodGhpcy5faGVpZ2h0TWFwKTtcbiAgICAgICAgdGhpcy5faGVpZ2h0TWFwLnJlY2FsY3VsYXRlQUFCQigpO1xuICAgIH1cblxuICAgIHB1YmxpYyBub3JtYWxpemVIZWlnaHRNYXAobWluSGVpZ2h0PzogZmxvYXQsIG1heEhlaWdodD86IGZsb2F0KSB7XG4gICAgICAgIFxuICAgICAgICBtaW5IZWlnaHQgPz89IHRoaXMuX2hlaWdodE1hcC5taW5IZWlnaHQ7XG4gICAgICAgIG1heEhlaWdodCA/Pz0gdGhpcy5faGVpZ2h0TWFwLm1heEhlaWdodDtcblxuICAgICAgICB0aGlzLl9oZWlnaHRNYXAubm9ybWFsaXplKG1pbkhlaWdodCwgbWF4SGVpZ2h0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0TWluTWF4SGVpZ2h0KG1pbkhlaWdodDogZmxvYXQsIG1heEhlaWdodDogZmxvYXQpIHtcbiAgICAgICAgdGhpcy5faGVpZ2h0TWFwLnNldE1pbk1heEhlaWdodChtaW5IZWlnaHQsIG1heEhlaWdodCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFwcGVuZEhlaWdodE1hcChcbiAgICAgICAgaGVpZ2h0TWFwOiBIZWlnaHRNYXAsXG4gICAgICAgIHZhbHVlOiBmbG9hdCxcbiAgICAgICAgem9uZTogSVpvbmUsXG4gICAgICAgIG1pbkhlaWdodDogZmxvYXQgfCBudWxsID0gbnVsbCxcbiAgICAgICAgbWF4SGVpZ2h0OiBmbG9hdCB8IG51bGwgPSBudWxsXG4gICAgKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2hlaWdodE1hcC5jb21iaW5lSGVpZ2h0cygnKycsIGhlaWdodE1hcCwgdmFsdWUsIHpvbmUsIDAsIG1pbkhlaWdodCwgbWF4SGVpZ2h0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVjYWxjdWxhdGVNaW5NYXgoem9uZTogSVpvbmUsIGFhYmI6IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XG5cbiAgICAgICAgdGhpcy5faGVpZ2h0TWFwLnJlY2FsY3VsYXRlTWluTWF4KHpvbmUpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGFhYmIpIHtcbiAgICAgICAgICAgIHRoaXMuX2hlaWdodE1hcC5yZWNhbGN1bGF0ZUFBQkIoKTtcbiAgICAgICAgfSBcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdlb21pcEdyaWQiLCJpbXBvcnQgR2VvbWlwR3JpZCBmcm9tIFwiLi9HZW9taXBHcmlkLm1qc1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJhc2VUZXJyYWluIGV4dGVuZHMgR2VvbWlwR3JpZCB7XHJcbiAgICBwdWJsaWMgZ2V0IG1pbkhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0TWFwLm1pbkhlaWdodDsgfVxyXG4gICAgcHVibGljIGdldCBtYXhIZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodE1hcC5tYXhIZWlnaHQ7IH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQmFzZVRlcnJhaW47IiwiaW1wb3J0IHsgaW50IH0gZnJvbSBcIi4uL1NoYXJlZC9UeXBlcy5tanNcIjtcclxuaW1wb3J0IHsgQk9UVE9NLCBJU2luZ2xlTG9kSW5mbywgTEVGVCwgTG9kSW5mbywgUklHSFQsIFRPUCB9IGZyb20gXCIuL0xvZEluZm8ubWpzXCI7XHJcbmltcG9ydCB7IElQYXRjaExvZCB9IGZyb20gXCIuL0xvZE1hbmFnZXIubWpzXCI7XHJcbmltcG9ydCBCYXNlVGVycmFpbiBmcm9tIFwiLi9UZXJyYWluLm1qc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGluc3REYXRhU2l6ZSA9IDI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElJbnN0YW5jaW5nT2JlamN0IHtcclxufVxyXG5cclxuLy8gV2UgY2FuIHVzZSB1aW50OCwgYnV0IHdlIG9ubHkgdXNlIDIgYnl0ZXMsXHJcbi8vIGZvciBvcHRpbWFsIHBlcmZvcm1hbmNlIG5lZWQgNCBieXRlcyBmb3IgdGhlIGJ1ZmZlci5cclxuZXhwb3J0IHR5cGUgIFRJbnN0Q29vcmRzT2Zmc2V0QXJyVHlwZSA9IFVpbnQxNkFycmF5O1xyXG5leHBvcnQgY29uc3QgVEluc3RDb29yZHNPZmZzZXRBcnJUeXBlID0gVWludDE2QXJyYXk7XHJcblxyXG5leHBvcnQgdHlwZSBUQnVsZGVyPFQgZXh0ZW5kcyBJSW5zdGFuY2luZ09iZWpjdD4gPSAobG9kSW5mbzogSVBhdGNoTG9kLCBwcmltaXRpdmVJbmZvOiBJU2luZ2xlTG9kSW5mbywgaW5zdGFuY2luZ0RhdGE6IFRJbnN0Q29vcmRzT2Zmc2V0QXJyVHlwZSwgbWF4SW5zdGFuY2luZ0NvdW50OiBpbnQpID0+IFQgfCBudWxsO1xyXG5leHBvcnQgdHlwZSBURGVzdHJ1Y3RvcjxUIGV4dGVuZHMgSUluc3RhbmNpbmdPYmVqY3Q+ID0gKG9iamVjdDogVCkgPT4gdm9pZDtcclxuZXhwb3J0IHR5cGUgVFNlbGVjdG9yPFQgZXh0ZW5kcyBJSW5zdGFuY2luZ09iZWpjdD4gPSAoaXRlbTogSVNpbmdsZUxvZEluZm9JbnN0YW5jaW5nPFQ+KSA9PiB2b2lkO1xyXG5cclxuLyoqXHJcbiAqIExvZCBkYXRhIHR5cGUgd2l0aCBpbmRleGVzIFtMT0RDT1JFXVtMRUZUXVtSSUdIVF1bVE9QXVtCT1RUT01dXHJcbiAqL1xyXG5leHBvcnQgdHlwZSBURGF0YTxUIGV4dGVuZHMgSUluc3RhbmNpbmdPYmVqY3Q+ID0gSVNpbmdsZUxvZEluZm9JbnN0YW5jaW5nPFQ+W11bXVtdW11bXTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVNpbmdsZUxvZEluZm9JbnN0YW5jaW5nPFQgZXh0ZW5kcyBJSW5zdGFuY2luZ09iZWpjdD4ge1xyXG4gICAgdmVydGV4QmFzZUluZGV4OiBpbnQ7XHJcbiAgICB2ZXJ0ZXhDb3VudDogaW50O1xyXG4gICAgZGF0YTogVWludDE2QXJyYXk7XHJcbiAgICBjb3VudDogaW50O1xyXG4gICAgb2JqZWN0OiBUIHwgbnVsbDtcclxuICAgIGhhc0NoYW5nZXM6IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBQYXRjaEluc3RhbmNpbmc8VCBleHRlbmRzIElJbnN0YW5jaW5nT2JlamN0PiB7XHJcblxyXG4gICAgcHJpdmF0ZSBfcGF0Y2hDb3VudDogaW50O1xyXG5cclxuICAgIHB1YmxpYyBkYXRhOiBURGF0YTxUPjtcclxuICAgIHB1YmxpYyBnZXQgcGF0Y2hDb3VudCgpIHsgcmV0dXJuIHRoaXMuX3BhdGNoQ291bnQ7IH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmRhdGEgPSBbXTtcclxuICAgICAgICB0aGlzLl9wYXRjaENvdW50ID0gMDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGZvckVhY2goZm46IFRTZWxlY3RvcjxUPikge1xyXG4gICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgdGhpcy5kYXRhLmxlbmd0aDsgYysrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGwgPSAwOyBsIDwgTEVGVDsgbCsrKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IFJJR0hUOyByKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCB0ID0gMDsgdCA8IFRPUDsgdCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGIgPSAwOyBiIDwgQk9UVE9NOyBiKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlZ21lbnQgPSB0aGlzLmRhdGFbY11bbF1bcl1bdF1bYl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbihzZWdtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGVzdHJveVNlZ21lbnRPYmplY3RzKGluZGV4OiBpbnQsIGRlc3RydWN0b3I6IFREZXN0cnVjdG9yPFQ+KSB7XHJcbiAgICAgICAgZm9yIChsZXQgbCA9IDA7IGwgPCBMRUZUOyBsKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPCBSSUdIVDsgcisrKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB0ID0gMDsgdCA8IFRPUDsgdCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYiA9IDA7IGIgPCBCT1RUT007IGIrKykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VnbWVudCA9IHRoaXMuZGF0YVtpbmRleF1bbF1bcl1bdF1bYl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VnbWVudC5vYmplY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RydWN0b3Ioc2VnbWVudC5vYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VnbWVudC5vYmplY3QgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZXN0cm95KGRlc3RydWN0b3I6IFREZXN0cnVjdG9yPFQ+KSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5kZXN0cm95U2VnbWVudE9iamVjdHMoaSwgZGVzdHJ1Y3Rvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZGF0YS5sZW5ndGggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBidWlsZEZyb21UZXJyYWluKHRlcnJhaW46IEJhc2VUZXJyYWluLCBvYmplY3RCdWlsZGVyPzogVEJ1bGRlcjxUPikge1xyXG5cclxuICAgICAgICB0aGlzLl9wYXRjaENvdW50ID0gdGVycmFpbi5udW1QYXRjaGVzWCAqIHRlcnJhaW4ubnVtUGF0Y2hlc1o7XHJcblxyXG4gICAgICAgIHRoaXMuZGF0YSA9IG5ldyBBcnJheSh0ZXJyYWluLmxvZEluZm8ubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgbG9kQ29yZSA9IDA7IGxvZENvcmUgPCB0aGlzLmRhdGEubGVuZ3RoOyBsb2RDb3JlKyspIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhW2xvZENvcmVdID0gdGhpcy5fYnVpbGRJbmZvKGxvZENvcmUsIHRlcnJhaW4ubG9kSW5mb1tsb2RDb3JlXSwgdGhpcy5fcGF0Y2hDb3VudCwgb2JqZWN0QnVpbGRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2J1aWxkSW5mbzxUIGV4dGVuZHMgSUluc3RhbmNpbmdPYmVqY3Q+KGxvZENvcmU6IGludCwgbG9kSW5mbzogUmVhZG9ubHk8UmVhZG9ubHk8TG9kSW5mbz4+LCBwYXRjaENvdW50OiBpbnQsIG9iamVjdEJ1aWxkZXI/OiBUQnVsZGVyPFQ+KTogSVNpbmdsZUxvZEluZm9JbnN0YW5jaW5nPFQ+W11bXVtdW10ge1xyXG5cclxuICAgICAgICBjb25zdCBhcnI6IElTaW5nbGVMb2RJbmZvSW5zdGFuY2luZzxUPltdW11bXVtdID0gW107XHJcbiAgICBcclxuICAgICAgICBmb3IgKGxldCBsID0gMCA7IGwgPCBMRUZUIDsgbCsrKSB7XHJcbiAgICBcclxuICAgICAgICAgICAgYXJyW2xdID0gW107XHJcbiAgICBcclxuICAgICAgICAgICAgZm9yIChsZXQgciA9IDAgOyByIDwgUklHSFQgOyByKyspIHtcclxuICAgIFxyXG4gICAgICAgICAgICAgICAgYXJyW2xdW3JdID0gW107XHJcbiAgICBcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHQgPSAwIDsgdCA8IFRPUCA7IHQrKykge1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgICAgICAgYXJyW2xdW3JdW3RdID0gW107XHJcbiAgICBcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBiID0gMCA7IGIgPCBCT1RUT00gOyBiKyspIHtcclxuICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmZvID0gbG9kSW5mby5pbmZvW2xdW3JdW3RdW2JdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2Q6IElQYXRjaExvZCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlOiAtMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvcmU6IGxvZENvcmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IHIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3R0b206IGJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgICA9IG5ldyBUSW5zdENvb3Jkc09mZnNldEFyclR5cGUocGF0Y2hDb3VudCAqIGluc3REYXRhU2l6ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9iZWpjdCA9IG9iamVjdEJ1aWxkZXIgPyBvYmplY3RCdWlsZGVyKGxvZCwgaW5mbywgZGF0YSwgcGF0Y2hDb3VudCkgOiBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJyW2xdW3JdW3RdW2JdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVydGV4QmFzZUluZGV4OiBpbmZvLnN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVydGV4Q291bnQ6IGluZm8uY291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IG9iZWpjdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NoYW5nZXM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIHJldHVybiBhcnI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldChsb2Q6IElQYXRjaExvZCk6IElTaW5nbGVMb2RJbmZvSW5zdGFuY2luZzxUPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVtsb2QuY29yZV1bbG9kLmxlZnRdW2xvZC5yaWdodF1bbG9kLnRvcF1bbG9kLmJvdHRvbV07XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluY3JlbWVudChsb2Q6IElQYXRjaExvZCwgeDogaW50LCB6OiBpbnQpOiBJU2luZ2xlTG9kSW5mb0luc3RhbmNpbmc8VD4ge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IHNpbmdsZSA9IHRoaXMuZ2V0KGxvZCk7XHJcbiAgICAgICAgY29uc3QgcHJldkluZGV4ID0gc2luZ2xlLmNvdW50O1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChzaW5nbGUuZGF0YVtwcmV2SW5kZXggKiBpbnN0RGF0YVNpemUgKyAwXSAhPT0geCB8fFxyXG4gICAgICAgICAgICBzaW5nbGUuZGF0YVtwcmV2SW5kZXggKiBpbnN0RGF0YVNpemUgKyAxXSAhPT0geikge1xyXG4gICAgICAgICAgICBzaW5nbGUuZGF0YVtwcmV2SW5kZXggKiBpbnN0RGF0YVNpemUgKyAwXSA9IHg7XHJcbiAgICAgICAgICAgIHNpbmdsZS5kYXRhW3ByZXZJbmRleCAqIGluc3REYXRhU2l6ZSArIDFdID0gejtcclxuICAgICAgICAgICAgc2luZ2xlLmhhc0NoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2luZ2xlLmNvdW50Kys7XHJcbiAgICAgICAgcmV0dXJuIHNpbmdsZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgemVyb0FsbCgpIHtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgbG9kQ29yZSA9IDA7IGxvZENvcmUgPCB0aGlzLmRhdGEubGVuZ3RoOyBsb2RDb3JlKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgbCA9IDA7IGwgPCBMRUZUOyBsKyspIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgUklHSFQ7IHIrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHQgPSAwOyB0IDwgVE9QOyB0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYiA9IDA7IGIgPCBCT1RUT007IGIrKykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNpbmdsZSA9IHRoaXMuZGF0YVtsb2RDb3JlXVtsXVtyXVt0XVtiXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpbmdsZS5jb3VudCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBpbnQgfSBmcm9tIFwiLi4vU2hhcmVkL1R5cGVzLm1qc1wiO1xyXG5pbXBvcnQgeyBCT1RUT00sIExFRlQsIFJJR0hULCBUT1AgfSBmcm9tIFwiLi4vVGVycmFpblN5c3RlbS9Mb2RJbmZvLm1qc1wiO1xyXG5pbXBvcnQgeyBQYXRjaEluc3RhbmNpbmcgfSBmcm9tIFwiLi4vVGVycmFpblN5c3RlbS9QYXRjaEluc3RhbmNpbmcubWpzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgVGVycmFpblBhdGhjZXNJbnN0YW5jaW5nIGV4dGVuZHMgUGF0Y2hJbnN0YW5jaW5nPHBjeC5NZXNoSW5zdGFuY2U+IHtcclxuXHJcbiAgICBwdWJsaWMgZW5hYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgbWVzaEluc3RhbmNlQ291bnQoKSB7IHJldHVybiB0aGlzLmRhdGEubGVuZ3RoICogTEVGVCAqIFJJR0hUICogVE9QICogQk9UVE9NOyB9XHJcblxyXG4gICAgcHVibGljIGFwcGVuZE1lc2hJbnN0YW5jZXMoYXJyOiBwY3guTWVzaEluc3RhbmNlW10sIG9mZnNldDogaW50ID0gMCkge1xyXG5cclxuICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCB0aGlzLmRhdGEubGVuZ3RoOyBjKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgbCA9IDA7IGwgPCBMRUZUOyBsKyspIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgUklHSFQ7IHIrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHQgPSAwOyB0IDwgVE9QOyB0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYiA9IDA7IGIgPCBCT1RUT007IGIrKykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rID0gdGhpcy5kYXRhW2NdW2xdW3JdW3RdW2JdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaHVuay5vYmplY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJbaSsrICsgb2Zmc2V0XSA9IGNodW5rLm9iamVjdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGJlZ2luKGNhc3RTaGFkb3c6IGJvb2xlYW4gPSBmYWxzZSwgcmVjZWl2ZVNoYWRvdzogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCB0aGlzLmRhdGEubGVuZ3RoOyBjKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgbCA9IDA7IGwgPCBMRUZUOyBsKyspIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgUklHSFQ7IHIrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHQgPSAwOyB0IDwgVE9QOyB0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYiA9IDA7IGIgPCBCT1RUT007IGIrKykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rID0gdGhpcy5kYXRhW2NdW2xdW3JdW3RdW2JdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2h1bmtPYmplY3QgPSBjaHVuay5vYmplY3Q7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmsuY291bnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmsuaGFzQ2hhbmdlcyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaHVua09iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rT2JqZWN0LnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHVua09iamVjdC52aXNpYmxlVGhpc0ZyYW1lID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtPYmplY3QuY2FzdFNoYWRvdyA9IGNhc3RTaGFkb3c7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtPYmplY3QucmVjZWl2ZVNoYWRvdyA9IHJlY2VpdmVTaGFkb3c7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGVuZCgpIHtcclxuICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IHRoaXMuZGF0YS5sZW5ndGg7IGMrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBsID0gMDsgbCA8IExFRlQ7IGwrKykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPCBSSUdIVDsgcisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgdCA9IDA7IHQgPCBUT1A7IHQrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBiID0gMDsgYiA8IEJPVFRPTTsgYisrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2h1bmsgPSB0aGlzLmRhdGFbY11bbF1bcl1bdF1bYl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaHVua09iamVjdCA9IGNodW5rLm9iamVjdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNodW5rT2JqZWN0ICYmIGNodW5rLmNvdW50ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rT2JqZWN0Lmluc3RhbmNpbmdDb3VudCA9IGNodW5rLmNvdW50O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2h1bmsuaGFzQ2hhbmdlcyAmJiBjaHVua09iamVjdC5pbnN0YW5jaW5nRGF0YSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogcGVyZm9ybWFuY2UgaW1wcm92ZW1lbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jaHVua09iamVjdC5pbnN0YW5jaW5nRGF0YS52ZXJ0ZXhCdWZmZXI/LnVubG9jaygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVuZ3RoID0gY2h1bmsuY291bnQgKiAyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2ZXJ0ZXhCdWZmZXIgPSBjaHVua09iamVjdC5pbnN0YW5jaW5nRGF0YS52ZXJ0ZXhCdWZmZXI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl93cml0ZUJ1ZmZlcih2ZXJ0ZXhCdWZmZXIsIGNodW5rLmRhdGEsIGxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3dyaXRlQnVmZmVyKHZlcnRleEJ1ZmZlcjogcGN4LlZlcnRleEJ1ZmZlciB8IG51bGwsIGRhdGE6IFVpbnQxNkFycmF5LCBsZW5ndGg6IGludCkge1xyXG5cclxuICAgICAgICBpZiAodmVydGV4QnVmZmVyKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBkZXZpY2UgPSB2ZXJ0ZXhCdWZmZXIuZGV2aWNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRldmljZS5pc1dlYkdMMikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2wgPSAoZGV2aWNlIGFzIHBjeC5XZWJnbEdyYXBoaWNzRGV2aWNlKS5nbDtcclxuICAgICAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIuaW1wbC5idWZmZXJJZCk7XHJcbiAgICAgICAgICAgICAgICBnbC5idWZmZXJTdWJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgMCwgZGF0YSwgMCwgbGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChkZXZpY2UuaXNXZWJHUFUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHdncHUgICA9IChkZXZpY2UgYXMgYW55KS53Z3B1IGFzIEdQVURldmljZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1ZmZlciA9IHZlcnRleEJ1ZmZlci5pbXBsLmJ1ZmZlciBhcyBHUFVCdWZmZXI7XHJcbiAgICAgICAgICAgICAgICB3Z3B1LnF1ZXVlLndyaXRlQnVmZmVyKGJ1ZmZlciwgMCwgZGF0YSwgMCwgbGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB0eXBlIHsgaW50IH0gZnJvbSBcIi4uL1NoYXJlZC9UeXBlcy5tanNcIjtcclxuaW1wb3J0IHsgSVBhdGNoTG9kIH0gZnJvbSBcIi4uL1RlcnJhaW5TeXN0ZW0vTG9kTWFuYWdlci5tanNcIjtcclxuaW1wb3J0IEJhc2VUZXJyYWluIGZyb20gXCIuLi9UZXJyYWluU3lzdGVtL1RlcnJhaW4ubWpzXCI7XHJcbmltcG9ydCB7IElTaW5nbGVMb2RJbmZvIH0gZnJvbSBcIi4uL1RlcnJhaW5TeXN0ZW0vTG9kSW5mby5tanNcIjtcclxuaW1wb3J0IHsgVGVycmFpblBhdGhjZXNJbnN0YW5jaW5nIH0gZnJvbSBcIi4vVGVycmFpblBhdGNoZXNJbnN0YW5jaW5nLm1qc1wiO1xyXG5pbXBvcnQgeyBUSW5zdENvb3Jkc09mZnNldEFyclR5cGUgfSBmcm9tIFwiLi4vVGVycmFpblN5c3RlbS9QYXRjaEluc3RhbmNpbmcubWpzXCI7XHJcbmltcG9ydCB7IElHcmlkUGF0Y2hJbml0aWFsaXplciB9IGZyb20gXCIuLi9UZXJyYWluU3lzdGVtL0dlb21pcEdyaWRSZW5kZXJQcmVwYXJlci5tanNcIjtcclxuaW1wb3J0IHsgSVpvbmUgfSBmcm9tIFwiLi4vVGVycmFpblN5c3RlbS9JWm9uZS5tanNcIjtcclxuXHJcbmV4cG9ydCB0eXBlIFRGb3JFYWNoUGF0Y2hDYWxsYmFjayA9IChwYXRjaEluZGV4OiBpbnQsIHg6IGludCwgejogaW50KSA9PiB2b2lkIHwgYm9vbGVhbjtcclxuXHJcbmV4cG9ydCBjbGFzcyBUZXJyYWluUGF0Y2hCdWZmZXJCYXNpYyB7XHJcblxyXG4gICAgcmVhZG9ubHkgbWluWDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgbWluWjogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgc2l6ZTogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgaW5kZXg6IG51bWJlcjtcclxuXHJcbiAgICBwdWJsaWMgdmlzaWJsZTogYm9vbGVhbjtcclxuXHJcbiAgICBwdWJsaWMgaGFzaDogbnVtYmVyO1xyXG4gICAgcHVibGljIGxvZDogSVBhdGNoTG9kO1xyXG4gICAgcHVibGljIGluZGljZXNCYXNlSW5kZXg6IG51bWJlcjtcclxuICAgIHB1YmxpYyBpbmRpY2VzQmFzZVZlcnRleDogbnVtYmVyO1xyXG4gICAgcHVibGljIGluZGljZXNDb3VudDogbnVtYmVyO1xyXG5cclxuICAgIHB1YmxpYyBkZXBlbmRlbmNlc1VwZGF0ZWQ6IGJvb2xlYW47XHJcbiAgICBwdWJsaWMgaGVpZ2h0c1VwZGF0ZWQ6IGJvb2xlYW47XHJcbiAgICBwdWJsaWMgaGVpZ2h0c1VwZGF0ZWRUaGlzRnJhbWU6IGJvb2xlYW47XHJcblxyXG4gICAgcHVibGljIGxhc3RDaGFuZ2VUaW1lOiBudW1iZXI7XHJcbiAgICBwdWJsaWMgbGFzdENoYW5nZUF0dGFjaFRpbWU6IG51bWJlcjtcclxuICAgIHB1YmxpYyBsYXN0Q2hhbmdlSGVpZ2h0c1RpbWU6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihpbmRleDogbnVtYmVyLCBtaW5YOiBudW1iZXIsIG1pblo6IG51bWJlciwgc2l6ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5taW5YICA9IG1pblg7XHJcbiAgICAgICAgdGhpcy5taW5aICA9IG1pblo7XHJcbiAgICAgICAgdGhpcy5zaXplICA9IHNpemU7XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IGluZGV4O1xyXG4gICAgICAgIHRoaXMuaGFzaCAgPSAwO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBUZXJyYWluUGF0Y2hlc0Jhc2ljPFRQYXRjaEJ1ZmZlciBleHRlbmRzIFRlcnJhaW5QYXRjaEJ1ZmZlckJhc2ljID0gVGVycmFpblBhdGNoQnVmZmVyQmFzaWM+IHtcclxuXHJcbiAgICBwcml2YXRlIF9pbml0OiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBfYWFiYjogcGN4LkJvdW5kaW5nQm94O1xyXG4gICAgcHJpdmF0ZSBfcGF0Y2hBdmFsYWJsZUNvdW50OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIF9jaGFuZ2VzSWRzOiBudW1iZXJbXTtcclxuICAgIHByaXZhdGUgX3ByZXZJbnN0YW5jaW5nOiBib29sZWFuO1xyXG5cclxuICAgIHByb3RlY3RlZCBfZW50aXR5OiBwY3guRW50aXR5O1xyXG4gICAgcHJvdGVjdGVkIF9hcHA6IHBjeC5BcHBCYXNlO1xyXG4gICAgcHJvdGVjdGVkIF9tYXRlcmlhbDogcGN4LlN0YW5kYXJkTWF0ZXJpYWw7XHJcblxyXG4gICAgcHJvdGVjdGVkIF9sYXN0Q2hhbmdlVGltZTogbnVtYmVyO1xyXG4gICAgcHJvdGVjdGVkIF9sYXN0Q2hhbmdlQXR0YWNoVGltZTogbnVtYmVyO1xyXG4gICAgcHJvdGVjdGVkIF9sYXN0Q2hhbmdlSGVpZ2h0c1RpbWU6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIF9idWZmZXJBcnJheTogVFBhdGNoQnVmZmVyW107XHJcbiAgICBwcml2YXRlIF9tZXNoSW5zdGFuY2VBcnJheTogQXJyYXk8cGN4Lk1lc2hJbnN0YW5jZSB8IHVuZGVmaW5lZD47XHJcblxyXG4gICAgcHVibGljIHJlYWRvbmx5IHRlcnJhaW46IEJhc2VUZXJyYWluO1xyXG4gICAgcHVibGljIHJlYWRvbmx5IGluc3RhbmNpbmc6IFRlcnJhaW5QYXRoY2VzSW5zdGFuY2luZztcclxuXHJcbiAgICBwdWJsaWMgZ2V0IGJ1ZmZlckFycmF5KCk6IFJlYWRvbmx5PHR5cGVvZiB0aGlzLl9idWZmZXJBcnJheT4ge3JldHVybiB0aGlzLl9idWZmZXJBcnJheTsgfVxyXG4gICAgcHVibGljIGdldCBtZXNoSW5zdGFuY2VBcnJheSgpOiBSZWFkb25seTx0eXBlb2YgdGhpcy5fbWVzaEluc3RhbmNlQXJyYXk+IHsgcmV0dXJuIHRoaXMuX21lc2hJbnN0YW5jZUFycmF5OyB9XHJcbiAgICBwdWJsaWMgZ2V0IGFhYmIoKSB7IHJldHVybiB0aGlzLl9hYWJiOyB9XHJcblxyXG4gICAgY29uc3RydWN0b3IodGVycmFpbjogQmFzZVRlcnJhaW4pIHtcclxuICAgICAgICB0aGlzLnRlcnJhaW4gPSB0ZXJyYWluO1xyXG4gICAgICAgIHRoaXMuaW5zdGFuY2luZyA9IG5ldyBUZXJyYWluUGF0aGNlc0luc3RhbmNpbmcoKTtcclxuICAgICAgICB0aGlzLl9wcmV2SW5zdGFuY2luZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2J1ZmZlckFycmF5ID0gbmV3IEFycmF5KHRoaXMudGVycmFpbi5udW1QYXRjaGVzWCAqIHRoaXMudGVycmFpbi5udW1QYXRjaGVzWik7XHJcbiAgICAgICAgdGhpcy5fbWVzaEluc3RhbmNlQXJyYXkgPSBuZXcgQXJyYXkodGhpcy50ZXJyYWluLm51bVBhdGNoZXNYICogdGhpcy50ZXJyYWluLm51bVBhdGNoZXNaKTtcclxuICAgICAgICB0aGlzLl9wYXRjaEF2YWxhYmxlQ291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuX2NoYW5nZXNJZHMgPSBbXTtcclxuICAgICAgICB0aGlzLl9hYWJiID0gbmV3IHBjLkJvdW5kaW5nQm94KCk7XHJcbiAgICAgICAgdGhpcy5faW5pdCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudXBkYXRlQWFiYigpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVBYWJiKCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IGhhbGZXaWR0aCA9IHRoaXMudGVycmFpbi53aWR0aCAvIDI7XHJcbiAgICAgICAgY29uc3QgaGFsZkRlcHRoID0gdGhpcy50ZXJyYWluLmRlcHRoIC8gMjtcclxuXHJcbiAgICAgICAgdGhpcy5fYWFiYi5zZXRNaW5NYXgoXHJcbiAgICAgICAgICAgIG5ldyBwYy5WZWMzKC1oYWxmV2lkdGgsIHRoaXMudGVycmFpbi5taW5IZWlnaHQsIC1oYWxmRGVwdGgpLFxyXG4gICAgICAgICAgICBuZXcgcGMuVmVjMygraGFsZldpZHRoLCB0aGlzLnRlcnJhaW4ubWF4SGVpZ2h0LCAraGFsZkRlcHRoKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgbWVzaEluc3RhbmNlIG9mIHRoaXMuX21lc2hJbnN0YW5jZUFycmF5KSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNoSW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgIG1lc2hJbnN0YW5jZS5hYWJiID0gdGhpcy5fYWFiYjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5pbnN0YW5jaW5nLmVuYWJsZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnN0YW5jaW5nLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5vYmplY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLm9iamVjdC5hYWJiID0gdGhpcy5fYWFiYjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGFydFJlbmRlcigpIHtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9mb3JjZVVwZGF0ZVJlbmRlckNvbXBvbmVudChlbnRpdHk6IHBjeC5FbnRpdHkpIHtcclxuXHJcbiAgICAgICAgLy8gaWYgaW5zdGFuY2luZyB3YXMgdXNlZCwgdGhlbiB3ZSBkZWxldGUgYWxsIHByZXZpb3VzIGluc3RhbmNlc1xyXG4gICAgICAgIGxldCBhcHBlbmQgPSAhdGhpcy5fcHJldkluc3RhbmNpbmc7XHJcblxyXG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5pbnN0YW5jaW5nLmVuYWJsZWQgPyB0aGlzLmluc3RhbmNpbmcubWVzaEluc3RhbmNlQ291bnQgOiB0aGlzLl9wYXRjaEF2YWxhYmxlQ291bnQ7XHJcbiAgICAgICAgY29uc3QgbWVzaEluc3RhbmNlcyA9IG5ldyBBcnJheTxwY3guTWVzaEluc3RhbmNlPihjb3VudCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNpbmcuZW5hYmxlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmluc3RhbmNpbmcuYXBwZW5kTWVzaEluc3RhbmNlcyhtZXNoSW5zdGFuY2VzKTtcclxuICAgICAgICAgICAgYXBwZW5kID0gZmFsc2U7IC8vIGFsd2F5cyBkZXN0cm95IHByZXYgbWVzaEluc3RhbmNlc1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IGkgPSAwO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgcGF0Y2hJbmRleCA9IDA7IHBhdGNoSW5kZXggPCB0aGlzLl9tZXNoSW5zdGFuY2VBcnJheS5sZW5ndGg7IHBhdGNoSW5kZXgrKykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcGF0Y2hNZXNoSW5zdGFuY2UgPSB0aGlzLl9tZXNoSW5zdGFuY2VBcnJheVtwYXRjaEluZGV4XTtcclxuICAgICAgICAgICAgICAgIGlmIChwYXRjaE1lc2hJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc2hJbnN0YW5jZXNbaSsrXSA9IHBhdGNoTWVzaEluc3RhbmNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VzSWRzLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9wcmV2SW5zdGFuY2luZyA9IHRoaXMuaW5zdGFuY2luZy5lbmFibGVkO1xyXG5cclxuICAgICAgICBpZiAoZW50aXR5LnJlbmRlcikge1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETzogaHR0cHM6Ly9naXRodWIuY29tL3BsYXljYW52YXMvZW5naW5lL2lzc3Vlcy82NjgwXHJcbiAgICAgICAgICAgIGlmIChhcHBlbmQpIHtcclxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgIGVudGl0eS5yZW5kZXIuX21lc2hJbnN0YW5jZXMgPSBbXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZW50aXR5LnJlbmRlci5tZXNoSW5zdGFuY2VzID0gbWVzaEluc3RhbmNlcztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGVudGl0eS5hZGRDb21wb25lbnQoJ3JlbmRlcicsIHtcclxuICAgICAgICAgICAgICAgIG1lc2hJbnN0YW5jZXM6IG1lc2hJbnN0YW5jZXMsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHNoYWRvd3NcclxuICAgICAgICBmb3IgKGNvbnN0IG1lc2hJbnN0YW5jZSBvZiBtZXNoSW5zdGFuY2VzKSB7XHJcbiAgICAgICAgICAgIG1lc2hJbnN0YW5jZS5jdWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAgIG1lc2hJbnN0YW5jZS5jYXN0U2hhZG93ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIG1lc2hJbnN0YW5jZS5yZWNlaXZlU2hhZG93ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIF91cGRhdGVSZW5kZXJDb21wb25lbnQoZW50aXR5OiBwY3guRW50aXR5KSB7XHJcblxyXG4gICAgICAgIGlmICghZW50aXR5LmVuYWJsZWQgfHwgdGhpcy5pbnN0YW5jaW5nLmVuYWJsZWQgfHwgdGhpcy5fY2hhbmdlc0lkcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fZm9yY2VVcGRhdGVSZW5kZXJDb21wb25lbnQoZW50aXR5KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWJzdHJhY3QgdXBkYXRlSW5kZXhCdWZmZXIoKTogdm9pZDtcclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlTG9kcygpIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZUluZGV4QnVmZmVyKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVNZXNoZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZm9yRWFjaCh6b25lOiBJWm9uZSwgY2FsbGJhY2s6IFRGb3JFYWNoUGF0Y2hDYWxsYmFjaykge1xyXG5cclxuICAgICAgICBpZiAoem9uZS5tYXhYIDwgMCkgcmV0dXJuO1xyXG4gICAgICAgIGlmICh6b25lLm1heFogPCAwKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IG1pblggPSBNYXRoLm1heCh6b25lLm1pblgsIDApO1xyXG4gICAgICAgIGNvbnN0IG1pblogPSBNYXRoLm1heCh6b25lLm1pblosIDApO1xyXG4gICAgICAgIGNvbnN0IG1heFggPSBNYXRoLm1pbih6b25lLm1heFgsIHRoaXMudGVycmFpbi53aWR0aCk7XHJcbiAgICAgICAgY29uc3QgbWF4WiA9IE1hdGgubWluKHpvbmUubWF4WiwgdGhpcy50ZXJyYWluLmRlcHRoKTtcclxuXHJcbiAgICAgICAgY29uc3QgbWluUGF0Y2hYID0gTWF0aC5jZWlsKG1pblggLyB0aGlzLnRlcnJhaW4ucGF0Y2hTaXplKSAtIChtaW5YICUgdGhpcy50ZXJyYWluLnBhdGNoU2l6ZSA+IDAgPyAxIDogMCk7XHJcbiAgICAgICAgY29uc3QgbWluUGF0Y2haID0gTWF0aC5jZWlsKG1pblogLyB0aGlzLnRlcnJhaW4ucGF0Y2hTaXplKSAtIChtaW5aICUgdGhpcy50ZXJyYWluLnBhdGNoU2l6ZSA+IDAgPyAxIDogMCk7XHJcbiAgICAgICAgY29uc3QgbWF4UGF0Y2hYID0gTWF0aC5jZWlsKG1heFggLyB0aGlzLnRlcnJhaW4ucGF0Y2hTaXplKSAtIChtYXhYICUgdGhpcy50ZXJyYWluLnBhdGNoU2l6ZSA+IDAgPyAxIDogMCk7XHJcbiAgICAgICAgY29uc3QgbWF4UGF0Y2haID0gTWF0aC5jZWlsKG1heFogLyB0aGlzLnRlcnJhaW4ucGF0Y2hTaXplKSAtIChtYXhaICUgdGhpcy50ZXJyYWluLnBhdGNoU2l6ZSA+IDAgPyAxIDogMCk7XHJcblxyXG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZU1pblggPSBNYXRoLm1heChtaW5QYXRjaFgsIDApO1xyXG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZU1pblogPSBNYXRoLm1heChtaW5QYXRjaFosIDApO1xyXG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZU1heFggPSBNYXRoLm1pbihtYXhQYXRjaFggKyAxLCB0aGlzLnRlcnJhaW4ubnVtUGF0Y2hlc1gpO1xyXG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZU1heFogPSBNYXRoLm1pbihtYXhQYXRjaFogKyAxLCB0aGlzLnRlcnJhaW4ubnVtUGF0Y2hlc1opO1xyXG5cclxuICAgICAgICBmb3IgKGxldCB6ID0gbm9ybWFsaXplTWluWjsgeiA8IG5vcm1hbGl6ZU1heFo7IHorKykge1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgeCA9IG5vcm1hbGl6ZU1pblg7IHggPCBub3JtYWxpemVNYXhYOyB4KyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRjaEluZGV4ID0geiAqIHRoaXMudGVycmFpbi5udW1QYXRjaGVzWCArIHg7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKHBhdGNoSW5kZXgsIHgsIHopID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlRGVwZW5kZW5jaWVzKHpvbmU6IElab25lKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG5cclxuICAgICAgICB0aGlzLmZvckVhY2goem9uZSwgKHBhdGNoSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNvbnN0IHBhdGNoQnVmZmVyID0gdGhpcy5fYnVmZmVyQXJyYXlbcGF0Y2hJbmRleF07XHJcblxyXG4gICAgICAgICAgICBwYXRjaEJ1ZmZlci5sYXN0Q2hhbmdlVGltZSA9IG5vdztcclxuICAgICAgICAgICAgcGF0Y2hCdWZmZXIubGFzdENoYW5nZUF0dGFjaFRpbWUgPSBub3c7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2xhc3RDaGFuZ2VUaW1lID0gbm93O1xyXG4gICAgICAgIHRoaXMuX2xhc3RDaGFuZ2VBdHRhY2hUaW1lID0gbm93O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVIZWlnaHRzKHpvbmU6IElab25lKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG5cclxuICAgICAgICB0aGlzLmZvckVhY2goem9uZSwgKHBhdGNoSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNvbnN0IHBhdGNoQnVmZmVyID0gdGhpcy5fYnVmZmVyQXJyYXlbcGF0Y2hJbmRleF07XHJcblxyXG4gICAgICAgICAgICBwYXRjaEJ1ZmZlci5sYXN0Q2hhbmdlVGltZSA9IG5vdztcclxuICAgICAgICAgICAgcGF0Y2hCdWZmZXIubGFzdENoYW5nZUhlaWdodHNUaW1lID0gbm93O1xyXG4gICAgICAgICAgICBwYXRjaEJ1ZmZlci5oZWlnaHRzVXBkYXRlZCA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2xhc3RDaGFuZ2VUaW1lID0gbm93O1xyXG4gICAgICAgIHRoaXMuX2xhc3RDaGFuZ2VIZWlnaHRzVGltZSA9IG5vdztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9hZGRQYXRjaEJ1ZmZlcihwYXRjaEluZGV4OiBudW1iZXIsIGJ1ZmZlcjogVFBhdGNoQnVmZmVyKSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9idWZmZXJBcnJheVtwYXRjaEluZGV4XSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1ZmZlciBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9idWZmZXJBcnJheVtwYXRjaEluZGV4XSA9IGJ1ZmZlcjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9hZGRQYXRjaE1lc2hJbnN0YW5jZShwYXRjaEluZGV4OiBudW1iZXIsIG1lc2hJbnN0YW5jZTogcGN4Lk1lc2hJbnN0YW5jZSkge1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fbWVzaEluc3RhbmNlQXJyYXlbcGF0Y2hJbmRleF0pIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNZXNoIGluc3RhbmNlIGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX21lc2hJbnN0YW5jZUFycmF5W3BhdGNoSW5kZXhdID0gbWVzaEluc3RhbmNlO1xyXG4gICAgICAgIHRoaXMuX2NoYW5nZXNJZHMucHVzaChwYXRjaEluZGV4KTtcclxuICAgICAgICB0aGlzLl9wYXRjaEF2YWxhYmxlQ291bnQrKztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgX2NyZWF0ZUluc3RhbmNpbmdNZXNoKGFwcDogcGN4LkFwcEJhc2UsIGVudGl0eTogcGN4LkVudGl0eSwgbWF0ZXJpYWw6IHBjeC5NYXRlcmlhbCwgbG9kSW5mbzogSVBhdGNoTG9kLCBwcmltaXRpdmVJbmZvOiBJU2luZ2xlTG9kSW5mbywgZGF0YTogVEluc3RDb29yZHNPZmZzZXRBcnJUeXBlKTogcGN4Lk1lc2hJbnN0YW5jZTtcclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBfY3JlYXRlUGF0Y2hCdWZmZXIocGF0Y2hJbmRleDogbnVtYmVyLCBiYXNlSW5kZXg6IG51bWJlciwgYmFzZVZlcnRleDogbnVtYmVyLCBjb3VudDogbnVtYmVyLCBwYXRjaFg6IG51bWJlciwgcGF0Y2haOiBudW1iZXIsIG1pblg6IG51bWJlciwgbWluWjogbnVtYmVyLCBzaXplOiBudW1iZXIsIGxvZDogSVBhdGNoTG9kKTogVFBhdGNoQnVmZmVyO1xyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IF9jcmVhdGVQYXRjaE1lc2gocGF0Y2hJbmRleDogbnVtYmVyLCBhcHA6IHBjeC5BcHBCYXNlLCBlbnRpdHk6IHBjeC5FbnRpdHksIG1hdGVyaWFsOiBwY3guTWF0ZXJpYWwpOiBwY3guTWVzaEluc3RhbmNlO1xyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgX2Rlc3Ryb3lJbnN0YW5jaW5nTWVzaChtZXNoOiBwY3guTWVzaEluc3RhbmNlKTogdm9pZDtcclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBfZGVzdHJveVBhdGNoTWVzaChwYXRjaEluZGV4OiBudW1iZXIpOiB2b2lkO1xyXG5cclxuICAgIHB1YmxpYyBlbmRSZW5kZXIoaGFzVXBkYXRlSGVpZ2h0czogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZVJlbmRlckNvbXBvbmVudCh0aGlzLl9lbnRpdHkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjcmVhdGVPckdldFBhdGNoTWVzaChwYXRjaEluZGV4OiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgbGV0IHBhdGNoID0gdGhpcy5fbWVzaEluc3RhbmNlQXJyYXlbcGF0Y2hJbmRleF07XHJcbiAgICAgICAgaWYgKCFwYXRjaCkge1xyXG4gICAgICAgICAgICBwYXRjaCA9IHRoaXMuX2NyZWF0ZVBhdGNoTWVzaChwYXRjaEluZGV4LCB0aGlzLl9hcHAsIHRoaXMuX2VudGl0eSwgdGhpcy5fbWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRQYXRjaE1lc2hJbnN0YW5jZShwYXRjaEluZGV4LCBwYXRjaCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcGF0Y2g7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlc3Ryb3lQYXRjaE1lc2gocGF0Y2hJbmRleDogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIHRoaXMuX2Rlc3Ryb3lQYXRjaE1lc2gocGF0Y2hJbmRleCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHBhdGNoTWVzaEluc3RhbmNlID0gdGhpcy5fbWVzaEluc3RhbmNlQXJyYXlbcGF0Y2hJbmRleF07XHJcblxyXG4gICAgICAgIGlmIChwYXRjaE1lc2hJbnN0YW5jZSkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fcGF0Y2hBdmFsYWJsZUNvdW50LS07XHJcbiAgICAgICAgICAgIHRoaXMuX2NoYW5nZXNJZHMucHVzaChwYXRjaEluZGV4KTtcclxuXHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9tZXNoSW5zdGFuY2VBcnJheVtwYXRjaEluZGV4XTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlc3Ryb3lQYXRjaGVzTWVzaCgpIHtcclxuICAgICAgICBmb3IgKGxldCB6ID0gMDsgeiA8IHRoaXMudGVycmFpbi5udW1QYXRjaGVzWjsgeisrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy50ZXJyYWluLm51bVBhdGNoZXNYOyB4KyspIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0geiAqIHRoaXMudGVycmFpbi5udW1QYXRjaGVzWCArIHg7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc3Ryb3lQYXRjaE1lc2goaW5kZXgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVQYXRjaGVzTWVzaE1hdGVyaWFsKCkge1xyXG4gICAgICAgIGZvciAobGV0IHogPSAwOyB6IDwgdGhpcy50ZXJyYWluLm51bVBhdGNoZXNaOyB6KyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aGlzLnRlcnJhaW4ubnVtUGF0Y2hlc1g7IHgrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0geiAqIHRoaXMudGVycmFpbi5udW1QYXRjaGVzWCArIHg7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNoSW5zdGFuY2UgPSB0aGlzLl9tZXNoSW5zdGFuY2VBcnJheVtpbmRleF07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG1lc2hJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc2hJbnN0YW5jZS5tYXRlcmlhbCA9IHRoaXMuX21hdGVyaWFsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVNZXNoZXMoKSB7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5faW5pdCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmluc3RhbmNpbmcuZGVzdHJveSgobWVzaCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95SW5zdGFuY2luZ01lc2gobWVzaCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNpbmcuZW5hYmxlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3lQYXRjaGVzTWVzaCgpO1xyXG4gICAgICAgICAgICB0aGlzLmluc3RhbmNpbmcuYnVpbGRGcm9tVGVycmFpbih0aGlzLnRlcnJhaW4sIChsb2RJbmZvLCBwcmltaXRpdmVJbmZvLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlSW5zdGFuY2luZ01lc2godGhpcy5fYXBwLCB0aGlzLl9lbnRpdHksIHRoaXMuX21hdGVyaWFsLCBsb2RJbmZvLCBwcmltaXRpdmVJbmZvLCBkYXRhKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVBhdGNoZXNNZXNoTWF0ZXJpYWwoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2ZvcmNlVXBkYXRlUmVuZGVyQ29tcG9uZW50KHRoaXMuX2VudGl0eSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZU1hdGVyaWFsKG1hdGVyaWFsOiBwY3guU3RhbmRhcmRNYXRlcmlhbCkge1xyXG4gICAgICAgIHRoaXMuX21hdGVyaWFsID0gbWF0ZXJpYWw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXQoYXBwOiBwY3guQXBwQmFzZSwgZW50aXR5OiBwY3guRW50aXR5LCBtYXRlcmlhbDogcGN4LlN0YW5kYXJkTWF0ZXJpYWwpIHtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgdGVycmFpbiBwYXRjaGVzIHdhcyBpbml0aWFsaXplZCBlYXJsaWVyJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9pbml0ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9hcHAgPSBhcHA7XHJcbiAgICAgICAgdGhpcy5fZW50aXR5ID0gZW50aXR5O1xyXG5cclxuICAgICAgICAvLyBmb3Igb3RoZXIgbGFuZ3VhZ2UgdXNlIGludGVybmFsIGNsYXNzXHJcbiAgICAgICAgY29uc3QgaW5pdGlhbGl6ZXI6IElHcmlkUGF0Y2hJbml0aWFsaXplciA9IHtcclxuICAgICAgICAgICAgaW5pdFBhdGNoOiAoYmFzZUluZGV4OiBpbnQsIGJhc2VWZXJ0ZXg6IGludCwgY291bnQ6IGludCwgcGF0Y2hYOiBpbnQsIHBhdGNoWjogaW50LCBtaW5YOiBpbnQsIG1pblo6IGludCwgc2l6ZTogaW50LCBsb2RJbmZvOiBSZWFkb25seTxJUGF0Y2hMb2Q+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRjaEluZGV4ID0gcGF0Y2haICogdGhpcy50ZXJyYWluLm51bVBhdGNoZXNYICsgcGF0Y2hYO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gdGhpcy5fY3JlYXRlUGF0Y2hCdWZmZXIocGF0Y2hJbmRleCwgYmFzZUluZGV4LCBiYXNlVmVydGV4LCBjb3VudCwgcGF0Y2hYLCBwYXRjaFosIG1pblgsIG1pblosIHNpemUsIGxvZEluZm8pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkUGF0Y2hCdWZmZXIocGF0Y2hJbmRleCwgYnVmZmVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVNYXRlcmlhbChtYXRlcmlhbCk7XHJcbiAgICAgICAgdGhpcy50ZXJyYWluLmluaXRQYXRjaGVzKGluaXRpYWxpemVyKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZU1lc2hlcygpO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGNvbnN0IHZlcnRleENvb3JkQXR0ck5hbWUgICA9IFwidmVydGV4X3Bvc2l0aW9uXCI7XHJcbmV4cG9ydCBjb25zdCB2ZXJ0ZXhIZWlnaHRBdHRyTmFtZSAgPSBcInZlcnRleF9oZWlnaHRcIjtcclxuZXhwb3J0IGNvbnN0IHZlcnRleE5vcm1hbEF0dHJOYW1lICA9IFwidmVydGV4X25vcm1hbFwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IHBhdGNoSW5zdENvb3JkT2Zmc2V0UGFyYW1OYW1lID0gXCJ2ZXJ0ZXhfcG9zdGlvbl9vZmZzZXRcIjtcclxuZXhwb3J0IGNvbnN0IHBhdGNoQ29vcmRPZmZzZXRQYXJhbU5hbWUgID0gXCJ1VGVycmFpblBhdGNoQ29vcmRPZmZzZXRcIjtcclxuXHJcbmV4cG9ydCBjb25zdCB1c2VCYXNlVmVydGV4UGFyYW1OYW1lID0gXCJ1VGVycmFpblVzZUJhc2VWZXJ0ZXhcIjtcclxuZXhwb3J0IGNvbnN0IGJhc2VWZXJ0ZXhQYXJhbU5hbWUgICAgPSBcInVUZXJyYWluUGF0Y2hCYXNlVmVydGV4XCI7XHJcbmV4cG9ydCBjb25zdCBsb2RDb3JlUGFyYW1OYW1lICAgICAgID0gXCJ1VGVycmFpblBhdGNoTG9kQ29yZVwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IHRlcnJhaW5IZWlnaHRNYXBQYXJhbU5hbWUgICAgICAgICAgPSBcInVUZXJyYWluSGVpZ2h0TWFwXCI7XHJcbmV4cG9ydCBjb25zdCB0ZXJyYWluSGVpZ2h0TWFwQ2h1bmtTaXplUGFyYW1OYW1lID0gXCJ1VGVycmFpbkhlaWdodE1hcENodW5rU2l6ZVwiO1xyXG5leHBvcnQgY29uc3QgdGVycmFpblNpemVQYXJhbU5hbWUgICAgICAgICAgICAgICA9IFwidVRlcnJhaW5TaXplXCI7XHJcbmV4cG9ydCBjb25zdCB0ZXJyYWluTWluSGVpZ2h0UGFyYW1OYW1lICAgICAgICAgID0gXCJ1VGVycmFpbk1pbkhlaWdodFwiO1xyXG5leHBvcnQgY29uc3QgdGVycmFpbk1heEhlaWdodFBhcmFtTmFtZSAgICAgICAgICA9IFwidVRlcnJhaW5NYXhIZWlnaHRcIjtcclxuZXhwb3J0IGNvbnN0IHRlcnJhaW5TcGxhdE1hcFBhcmFtTmFtZSAgICAgICAgICAgPSBcInVUZXJyYWluU3BsYXRNYXBcIjtcclxuZXhwb3J0IGNvbnN0IHRlcnJhaW5QYXRjaFNpemVQYXJhbU5hbWUgICAgICAgICAgPSBcInVUZXJyYWluUGF0Y2hTaXplXCI7XHJcblxyXG5leHBvcnQgY29uc3QgbGl0dGxlRW5kaWFuID0gKCgpID0+IHtcclxuICAgIGNvbnN0IHVpbnQ4QXJyYXkgID0gbmV3IFVpbnQ4QXJyYXkoWzB4QUEsIDB4QkJdKTtcclxuICAgIGNvbnN0IHVpbnQxNmFycmF5ID0gbmV3IFVpbnQxNkFycmF5KHVpbnQ4QXJyYXkuYnVmZmVyKTtcclxuICAgIHJldHVybiB1aW50MTZhcnJheVswXSA9PT0gMHhCQkFBO1xyXG59KSgpO1xyXG5cclxuZXhwb3J0IGNvbnN0IGxpdHRsZUVuZGlhblZhbHVlID0gbGl0dGxlRW5kaWFuID8gJ3RydWUnIDogJ2ZhbHNlJztcclxuXHJcbmV4cG9ydCBjb25zdCBiYXNlT3JpZ2luYWxWUyA9IC8qKiBAdHlwZSBnbHNsICovXHJcbmBcclxuICAgIGF0dHJpYnV0ZSB1dmVjMiAke3ZlcnRleENvb3JkQXR0ck5hbWV9O1xyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IGJhc2VGb3JJbnN0YW5jaW5nVlMgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gXHJcbiAgICBhdHRyaWJ1dGUgdXZlYzIgJHt2ZXJ0ZXhDb29yZEF0dHJOYW1lfTtcclxuICAgIGF0dHJpYnV0ZSB1dmVjMiAke3BhdGNoSW5zdENvb3JkT2Zmc2V0UGFyYW1OYW1lfTtcclxuYDtcclxuXHJcbmV4cG9ydCBjb25zdCBiYXNlQ2xlYXJWUyA9IC8qKiBAdHlwZSBnbHNsICovXHJcbmBcclxuICAgIC8vICNkZWZpbmUgI2Jhc2VPcmlnaW5hbFZTIFtPUl0gI2Jhc2VGb3JJbnN0YW5jaW5nVlNcclxuXHJcbiAgICB1bmlmb3JtIG1hdDQgbWF0cml4X3ZpZXdQcm9qZWN0aW9uO1xyXG4gICAgdW5pZm9ybSBtYXQ0IG1hdHJpeF9tb2RlbDtcclxuICAgIHVuaWZvcm0gbWF0MyBtYXRyaXhfbm9ybWFsO1xyXG5cclxuICAgIHVuaWZvcm0gdmVjMiAke3RlcnJhaW5TaXplUGFyYW1OYW1lfTtcclxuICAgIHVuaWZvcm0gdmVjMiAke3BhdGNoQ29vcmRPZmZzZXRQYXJhbU5hbWV9O1xyXG4gICAgXHJcbiAgICB1bmlmb3JtIGZsb2F0ICR7bG9kQ29yZVBhcmFtTmFtZX07XHJcblxyXG4gICAgdW5pZm9ybSBtZWRpdW1wIHNhbXBsZXIyREFycmF5ICR7dGVycmFpbkhlaWdodE1hcFBhcmFtTmFtZX07XHJcbiAgICB1bmlmb3JtIGZsb2F0ICR7dGVycmFpbkhlaWdodE1hcENodW5rU2l6ZVBhcmFtTmFtZX07XHJcblxyXG4gICAgdW5pZm9ybSBmbG9hdCAke3RlcnJhaW5NaW5IZWlnaHRQYXJhbU5hbWV9O1xyXG4gICAgdW5pZm9ybSBmbG9hdCAke3RlcnJhaW5NYXhIZWlnaHRQYXJhbU5hbWV9O1xyXG5cclxuICAgIGZsb2F0IGROdW1DaHVua3NYO1xyXG4gICAgdmVjMyBkUG9zaXRpb25XO1xyXG4gICAgbWF0NCBkTW9kZWxNYXRyaXg7XHJcbiAgICBtYXQzIGROb3JtYWxNYXRyaXg7XHJcbiAgICB2ZWMyIGRDdXJyZW50VGVycmFpblhaO1xyXG4gICAgZmxvYXQgZEN1cnJlbnRIZWlnaHQ7XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3QgY3VycmVudFRlcnJhaW5YWkZvckluc3RhbmNpbmdDaHVua1ZTID0gLyoqIEB0eXBlIGdsc2wgKi9cclxuYFxyXG4gICAgdmVjMiBnZXRDdXJyZW50VGVycmFpblhaKCkge1xyXG4gICAgICAgIHJldHVybiB2ZWMyKCR7dmVydGV4Q29vcmRBdHRyTmFtZX0pICsgdmVjMigke3BhdGNoSW5zdENvb3JkT2Zmc2V0UGFyYW1OYW1lfSk7XHJcbiAgICB9XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3QgY3VycmVudFRlcnJhaW5YWkNodW5rVlMgPSBcclxuYFxyXG4gICAgdmVjMiBnZXRDdXJyZW50VGVycmFpblhaKCkge1xyXG4gICAgICAgIHJldHVybiB2ZWMyKCR7dmVydGV4Q29vcmRBdHRyTmFtZX0pICsgJHtwYXRjaENvb3JkT2Zmc2V0UGFyYW1OYW1lfTtcclxuICAgIH1cclxuYDtcclxuXHJcbmV4cG9ydCBjb25zdCB0ZXJyYWluQ29vcmRzQ2h1bmtWUyA9XHJcbmBcclxuICAgIHZlYzIgZ2V0Q3VycmVudFRlcnJhaW5VdkNvb3JkKCkge1xyXG4gICAgICAgIHZlYzIgeHogPSBkQ3VycmVudFRlcnJhaW5YWjtcclxuICAgICAgICB2ZWMyIHV2ID0gKHh6ICsgMC41KSAvICR7dGVycmFpblNpemVQYXJhbU5hbWV9O1xyXG4gICAgICAgIHJldHVybiB1djtcclxuICAgIH1cclxuXHJcbiAgICB2ZWMyIGNsYW1wVGVycmFpblhaKHZlYzIgeHopIHtcclxuICAgICAgICByZXR1cm4gdmVjMihcclxuICAgICAgICAgICAgY2xhbXAoeHpbMF0sIDAuMCwgJHt0ZXJyYWluU2l6ZVBhcmFtTmFtZX1bMF0pLFxyXG4gICAgICAgICAgICBjbGFtcCh4elsxXSwgMC4wLCAke3RlcnJhaW5TaXplUGFyYW1OYW1lfVsxXSlcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHZlYzIgZ2V0VGVycmFpblhaKGl2ZWMyIG9mZnNldCkge1xyXG4gICAgICAgIHJldHVybiBkQ3VycmVudFRlcnJhaW5YWiArIHZlYzIob2Zmc2V0KTtcclxuICAgIH1cclxuYDtcclxuXHJcbi8vIE5vdCBzdXBwb3J0IGZvciB3ZWJncHVcclxuZXhwb3J0IGNvbnN0IHRlcnJhaW5IZWlnaHRGYWN0b3JSR0I4VlMgPVxyXG5gXHJcbiAgICBmbG9hdCByZ2I4VG9GbG9hdCh2ZWMzIHYpIHtcclxuICAgICAgICB1dmVjMyB1aW50cyA9IHV2ZWMzKHYgKiAyNTUuMCk7XHJcbiAgICAgICAgdWludCBzY2FsZWQgPSAodWludHMuciA8PCAxNikgfCAodWludHMuZyA8PCA4KSB8IHVpbnRzLmI7XHJcbiAgICAgICAgcmV0dXJuIGZsb2F0KHNjYWxlZCkgLyAxNjc3NzIxNS4wO1xyXG4gICAgfVxyXG5cclxuICAgIGZsb2F0IGdldFRlcnJhaW5IZWlnaHRGYWN0b3JGcm9tVGV4dHVyZSh2ZWMzIHV2KSB7XHJcbiAgICAgICAgdmVjMyByZ2IgPSB0ZXh0dXJlKCR7dGVycmFpbkhlaWdodE1hcFBhcmFtTmFtZX0sIHV2KTtcclxuICAgICAgICByZXR1cm4gcmdiOFRvRmxvYXQocmdiKTtcclxuICAgIH1cclxuYDtcclxuXHJcbmV4cG9ydCBjb25zdCB0ZXJyYWluSGVpZ2h0RmFjdG9yUjMyRlZTID0gXHJcbmBcclxuICAgIGZsb2F0IGdldFRlcnJhaW5IZWlnaHRGYWN0b3JGcm9tVGV4dHVyZSh2ZWMzIHV2KSB7XHJcbiAgICAgICAgcmV0dXJuIHRleHR1cmUoJHt0ZXJyYWluSGVpZ2h0TWFwUGFyYW1OYW1lfSwgdXYpLnI7XHJcbiAgICB9XHJcbmA7XHJcblxyXG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy82MzgyNzgzNi9pcy1pdC1wb3NzaWJsZS10by1kby1hLXJnYmEtdG8tZmxvYXQtYW5kLWJhY2stcm91bmQtdHJpcC1hbmQtcmVhZC10aGUtcGl4ZWxzLWluXHJcbi8vIG5vdGU6IHRoZSAwLjFzIGhlcmUgYW4gdGhlcmUgYXJlIHZvb2RvbyByZWxhdGVkIHRvIHByZWNpc2lvblxyXG5leHBvcnQgY29uc3QgdGVycmFpbkhlaWdodEZhY3RvclJHQkE4VlMgPVxyXG5gXHJcbiAgICBmbG9hdCByZ2JhOFRvRmxvYXQodmVjNCB2KSB7XHJcbiAgICAgICAgdmVjNCBiaXRzICA9ICR7bGl0dGxlRW5kaWFuID8gJ3YnIDogJ3YuYWJncid9ICogMjU1LjA7XHJcbiAgICAgICAgZmxvYXQgc2lnbiA9IG1peCgtMS4wLCAxLjAsIHN0ZXAoYml0c1szXSwgMTI4LjApKTtcclxuICAgICAgICBmbG9hdCBleHBvID0gZmxvb3IobW9kKGJpdHNbM10gKyAwLjEsIDEyOC4wKSkgKiAyLjAgKyBmbG9vcigoYml0c1syXSArIDAuMSkgLyAxMjguMCkgLSAxMjcuMDtcclxuICAgICAgICBmbG9hdCBzaWcgID0gYml0c1swXSArIGJpdHNbMV0gKiAyNTYuMCArIGZsb29yKG1vZChiaXRzWzJdICsgMC4xLCAxMjguMCkpICogMjU2LjAgKiAyNTYuMDtcclxuICAgICAgICByZXR1cm4gc2lnbiAqICgxLjAgKyBzaWcgLyA4Mzg4NjA3LjApICogcG93KDIuMCwgZXhwbyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZsb2F0IGdldFRlcnJhaW5IZWlnaHRGYWN0b3JGcm9tVGV4dHVyZSh2ZWMzIHV2KSB7XHJcbiAgICAgICAgdmVjNCByZ2JhID0gdGV4dHVyZSgke3RlcnJhaW5IZWlnaHRNYXBQYXJhbU5hbWV9LCB1dik7XHJcbiAgICAgICAgcmV0dXJuIHJnYmE4VG9GbG9hdChyZ2JhKTtcclxuICAgIH1cclxuYDtcclxuXHJcbi8vIFRPRE86IGNoZWNrIGxpdHRsZUVuZGlhblxyXG4vLyBDb21wcmVzcyBoZWlnaHQgYnkgeCBjb29yZCBbcGF0Y2gwLCBwYXRjaDFdIC4uLlxyXG4vLyBzZWU6IENvbXByZXNzZWRQYXRjaGVkSGVpZ2h0TWFwIGZpbGVcclxuZXhwb3J0IGNvbnN0IHRlcnJhaW5IZWlnaHRGYWN0b3JSR0JBOFgyVlMgPVxyXG5gXHJcbiAgICBmbG9hdCBnZXRUZXJyYWluSGVpZ2h0RmFjdG9yRnJvbVRleHR1cmUodmVjMyB1dikge1xyXG4gICAgICAgIGludCBsZXZlbCAgPSBpbnQodXYuYik7XHJcbiAgICAgICAgaW50IG5ld0xldmVsID0gbGV2ZWwgLyAyO1xyXG4gICAgICAgIGludCBjaHVua1ggPSBsZXZlbCAlIGludChkTnVtQ2h1bmtzWCk7XHJcbiAgICAgICAgaW50IHNoaWZ0ICA9IGNodW5rWCAlIDI7XHJcbiAgICAgICAgdmVjNCByZ2JhID0gdGV4dHVyZSgke3RlcnJhaW5IZWlnaHRNYXBQYXJhbU5hbWV9LCB2ZWMzKHV2LnJnLCBuZXdMZXZlbCkpO1xyXG4gICAgICAgIHZlYzIgcmcgPSAoKHNoaWZ0ID09IDApID8gcmdiYS5yZyA6IHJnYmEuYmEpICogMjU1LjA7XHJcbiAgICAgICAgcmV0dXJuIGZsb2F0KCh1aW50KHJnLmcpIDw8IDgpIHwgdWludChyZy5yKSkgLyA2NTUzNS4wO1xyXG4gICAgfVxyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IHRlcnJhaW5IZWlnaHRGYWN0b3JSR0JBOFg0VlMgPVxyXG5gXHJcbiAgICBmbG9hdCBnZXRUZXJyYWluSGVpZ2h0RmFjdG9yRnJvbVRleHR1cmUodmVjMyB1dikge1xyXG4gICAgICAgIGludCBsZXZlbCAgICA9IGludCh1di5iKTtcclxuICAgICAgICBpbnQgbmV3TGV2ZWwgPSBsZXZlbCAvIDQ7XHJcbiAgICAgICAgaW50IGNodW5rWCAgID0gbGV2ZWwgJSBpbnQoZE51bUNodW5rc1gpO1xyXG4gICAgICAgIGludCBzaGlmdCAgICA9IGNodW5rWCAlIDQ7XHJcbiAgICAgICAgdmVjNCByZ2JhICAgID0gdGV4dHVyZSgke3RlcnJhaW5IZWlnaHRNYXBQYXJhbU5hbWV9LCB2ZWMzKHV2LnJnLCBuZXdMZXZlbCkpO1xyXG4gICAgICAgIHJldHVybiByZ2JhW3NoaWZ0XTtcclxuICAgIH1cclxuYDtcclxuXHJcbmV4cG9ydCBjb25zdCB0ZXJyYWluQ2h1bmtVVlZTID1cclxuYFxyXG4gICAgLy8gI2RlZmluZSAjdGVycmFpbkNvb3Jkc0NodW5rVlNcclxuXHJcbiAgICB2ZWMzIGdldFRlcnJhaW5DaHVua1VWKGl2ZWMyIG9mZnNldCkge1xyXG5cclxuICAgICAgICB2ZWMyIHh6ID0gY2xhbXBUZXJyYWluWFooZ2V0VGVycmFpblhaKG9mZnNldCkpO1xyXG5cclxuICAgICAgICBpbnQgY2h1bmtTaXplID0gaW50KCR7dGVycmFpbkhlaWdodE1hcENodW5rU2l6ZVBhcmFtTmFtZX0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGludCBsb2NhbFggICAgPSBpbnQoeHoucikgJSBjaHVua1NpemU7XHJcbiAgICAgICAgaW50IGxvY2FsWiAgICA9IGludCh4ei5nKSAlIGNodW5rU2l6ZTtcclxuXHJcbiAgICAgICAgZmxvYXQgY2h1bmtYICA9IGNlaWwoeHouciAvICR7dGVycmFpbkhlaWdodE1hcENodW5rU2l6ZVBhcmFtTmFtZX0pIC0gKGxvY2FsWCA+IDAgPyAxLjAgOiAwLjApO1xyXG4gICAgICAgIGZsb2F0IGNodW5rWiAgPSBjZWlsKHh6LmcgLyAke3RlcnJhaW5IZWlnaHRNYXBDaHVua1NpemVQYXJhbU5hbWV9KSAtIChsb2NhbFogPiAwID8gMS4wIDogMC4wKTtcclxuXHJcbiAgICAgICAgZmxvYXQgbGV2ZWwgICAgICAgPSBjaHVua1ogKiBkTnVtQ2h1bmtzWCArIGNodW5rWDtcclxuICAgICAgICB2ZWMyICBwYXRjaFRleFBvcyA9IHZlYzIobG9jYWxYLCBsb2NhbFopICsgMC41O1xyXG5cclxuICAgICAgICByZXR1cm4gdmVjMyhwYXRjaFRleFBvcyAvICR7dGVycmFpbkhlaWdodE1hcENodW5rU2l6ZVBhcmFtTmFtZX0sIGxldmVsKTtcclxuICAgIH1cclxuYDtcclxuXHJcbmV4cG9ydCBjb25zdCB0ZXJyYWluSGVpZ2h0RmFjdG9yQ2h1bmtWUyA9IFxyXG5gXHJcbiAgICAvLyAjZGVmaW5lICN0ZXJyYWluSGVpZ2h0RmFjdG9yUkdCQThWUyBbT1JdICN0ZXJyYWluSGVpZ2h0RmFjdG9yUkdCOFZTXHJcbiAgICAvLyAjZGVmaW5lICN0ZXJyYWluQ2h1bmtVVlZTXHJcblxyXG4gICAgZmxvYXQgZ2V0VGVycmFpbkhlaWdodEZhY3RvcihpdmVjMiBvZmZzZXQpIHtcclxuICAgICAgICB2ZWMzIHV2ID0gZ2V0VGVycmFpbkNodW5rVVYob2Zmc2V0KTtcclxuICAgICAgICByZXR1cm4gZ2V0VGVycmFpbkhlaWdodEZhY3RvckZyb21UZXh0dXJlKHV2KTtcclxuICAgIH1cclxuYDtcclxuXHJcbmV4cG9ydCBjb25zdCB0ZXJyYWluSGVpZ2h0Q2h1bmtWUyA9XHJcbmAgICAgXHJcbiAgICAvLyAjZGVmaW5lICN0ZXJyYWluSGVpZ2h0RmFjdG9yQ2h1bmtWU1xyXG5cclxuICAgIGZsb2F0IGdldFRlcnJhaW5IZWlnaHQoaXZlYzIgb2Zmc2V0KSB7XHJcbiAgICAgICAgcmV0dXJuIGdldFRlcnJhaW5IZWlnaHRGYWN0b3Iob2Zmc2V0KSAqICgke3RlcnJhaW5NYXhIZWlnaHRQYXJhbU5hbWV9IC0gJHt0ZXJyYWluTWluSGVpZ2h0UGFyYW1OYW1lfSkgKyAke3RlcnJhaW5NaW5IZWlnaHRQYXJhbU5hbWV9O1xyXG4gICAgfVxyXG5cclxuICAgIGZsb2F0IGdldEN1cnJlbnRUZXJyYWluSGVpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiBnZXRUZXJyYWluSGVpZ2h0KGl2ZWMyKDAsIDApKTtcclxuICAgIH1cclxuYDtcclxuXHJcbmV4cG9ydCBjb25zdCBpbnN0YW5jaW5nVlMgPSBgYDtcclxuZXhwb3J0IGNvbnN0IHRyYW5zZm9ybUluc3RhbmNpbmdWUyA9IGBgO1xyXG5leHBvcnQgY29uc3QgdHJhbnNmb3JtRGVjbFZTID0gYGA7XHJcblxyXG5leHBvcnQgY29uc3QgdHJhbnNmb3JtVlMgPSBcclxuYFxyXG4gICAgLy8gI2RlZmluZSAjdGVycmFpbkhlaWdodENodW5rVlNcclxuXHJcbiAgICBtYXQ0IGdldE1vZGVsTWF0cml4KCkge1xyXG4gICAgICAgIHJldHVybiBtYXRyaXhfbW9kZWw7XHJcbiAgICB9XHJcblxyXG4gICAgdmVjNCBnZXRQb3NpdGlvbigpIHtcclxuICAgIFxyXG4gICAgICAgIGRNb2RlbE1hdHJpeCAgICAgID0gZ2V0TW9kZWxNYXRyaXgoKTtcclxuICAgICAgICBkQ3VycmVudFRlcnJhaW5YWiA9IGdldEN1cnJlbnRUZXJyYWluWFooKTtcclxuICAgICAgICBkQ3VycmVudEhlaWdodCAgICA9IGdldEN1cnJlbnRUZXJyYWluSGVpZ2h0KCk7XHJcblxyXG4gICAgICAgIHZlYzIgZ2xvYlhaICAgPSAtJHt0ZXJyYWluU2l6ZVBhcmFtTmFtZX0gLyAyLjAgKyBkQ3VycmVudFRlcnJhaW5YWjtcclxuICAgICAgICB2ZWMzIGxvY2FsUG9zID0gdmVjMyhnbG9iWFouciwgZEN1cnJlbnRIZWlnaHQsIGdsb2JYWi5nKTtcclxuXHJcbiAgICAgICAgdmVjNCBwb3NXID0gZE1vZGVsTWF0cml4ICogdmVjNChsb2NhbFBvcywgMS4wKTtcclxuXHJcbiAgICAgICAgZFBvc2l0aW9uVyA9IHBvc1cueHl6O1xyXG5cclxuICAgICAgICB2ZWM0IHNjcmVlblBvcyA9IG1hdHJpeF92aWV3UHJvamVjdGlvbiAqIHBvc1c7XHJcbiAgICAgICAgcmV0dXJuIHNjcmVlblBvcztcclxuICAgIH1cclxuICAgIFxyXG4gICAgdmVjMyBnZXRXb3JsZFBvc2l0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBkUG9zaXRpb25XO1xyXG4gICAgfVxyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IHV2MFZTID0gLyoqIEB0eXBlIGdsc2wgKi9cclxuYFxyXG5gO1xyXG5cclxuLy8gYnVnIHdpdGggZ2V0VXYwXHJcbmV4cG9ydCBjb25zdCBzdGFydFV2MFZTID0gLyoqIEB0eXBlIGdsc2wgKi9cclxuYCAgICBcclxuICAgIHZlYzIgZ2V0VXYwKCkge1xyXG4gICAgICAgIHJldHVybiBnZXRDdXJyZW50VGVycmFpblV2Q29vcmQoKTtcclxuICAgIH1cclxuYDtcclxuXHJcbmV4cG9ydCBjb25zdCBub3JtYWxCeUhlaWdodE1hcFZTICA9IC8qKiBAdHlwZSBnbHNsICovXHJcbmBcclxuICAgIHZlYzMgZ2V0VGVycmFpbk5vcm1hbCgpIHtcclxuXHJcbiAgICAgICAgZmxvYXQgc3RlcCA9IHBvdygyLjAsICR7bG9kQ29yZVBhcmFtTmFtZX0gKyAxLjApIC8gMi4wO1xyXG5cclxuICAgICAgICBmbG9hdCBsZWZ0ICA9IGdldFRlcnJhaW5IZWlnaHQoaXZlYzIoIHN0ZXAsICAwKSk7XHJcbiAgICAgICAgZmxvYXQgcmlnaHQgPSBnZXRUZXJyYWluSGVpZ2h0KGl2ZWMyKC1zdGVwLCAgMCkpO1xyXG4gICAgICAgIGZsb2F0IHVwICAgID0gZ2V0VGVycmFpbkhlaWdodChpdmVjMiggMCwgICAgIHN0ZXApKTtcclxuICAgICAgICBmbG9hdCBkb3duICA9IGdldFRlcnJhaW5IZWlnaHQoaXZlYzIoIDAsICAgIC1zdGVwKSk7XHJcbiAgICAgICAgdmVjMyBub3JtYWwgPSB2ZWMzKGxlZnQgLSByaWdodCwgMi4wICogc3RlcCwgZG93biAtIHVwKTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gbm9ybWFsaXplKG5vcm1hbCk7XHJcbiAgICB9XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3Qgbm9ybWFsQ29yZVZTID0gLyoqIEB0eXBlIGdsc2wgKi9cclxuYFxyXG4gICAgdmVjMyBnZXRMb2NhbE5vcm1hbCh2ZWMzIHZlcnRleE5vcm1hbCkge1xyXG4gICAgICAgIHZlYzMgbG9jYWxOb3JtYWwgPSB2ZWMzKDAuMCwgMS4wLCAwLjApO1xyXG4gICAgICAgIHJldHVybiBsb2NhbE5vcm1hbDtcclxuICAgIH1cclxuXHJcbiAgICBtYXQzIGdldE5vcm1hbE1hdHJpeChtYXQ0IG1vZGVsTWF0cml4KSB7XHJcbiAgICAgICAgcmV0dXJuIG1hdHJpeF9ub3JtYWw7XHJcbiAgICB9XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3Qgbm9ybWFsVlMgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gXHJcbiAgICAvLyAjZGVmaW5lICNub3JtYWxCeUhlaWdodE1hcFZTXHJcblxyXG4gICAgdmVjMyBnZXROb3JtYWwoKSB7XHJcbiAgICBcclxuICAgICAgICBkTm9ybWFsTWF0cml4ID0gbWF0cml4X25vcm1hbDtcclxuXHJcbiAgICAgICAgdmVjMyB0ZW1wTm9ybWFsID0gZ2V0VGVycmFpbk5vcm1hbCgpO1xyXG5cclxuICAgICAgICByZXR1cm4gbm9ybWFsaXplKGROb3JtYWxNYXRyaXggKiB0ZW1wTm9ybWFsKTtcclxuICAgIH1cclxuYDtcclxuXHJcbmV4cG9ydCBjb25zdCBzdGFydFZTID0gLyoqIEB0eXBlIGdsc2wgKi9cclxuYFxyXG4gICAgJHtzdGFydFV2MFZTfVxyXG5cclxuICAgIHZhcnlpbmcgdmVjMiB2VXZDb29yZDtcclxuICAgIHZhcnlpbmcgdmVjMiB2R3JpZFBvc2l0aW9uO1xyXG5cclxuICAgIHZvaWQgbWFpbih2b2lkKSB7XHJcblxyXG4gICAgICAgIGROdW1DaHVua3NYID0gKCR7dGVycmFpblNpemVQYXJhbU5hbWV9LnIgLSAxLjApIC8gKCR7dGVycmFpbkhlaWdodE1hcENodW5rU2l6ZVBhcmFtTmFtZX0gLSAxLjApO1xyXG5cclxuICAgICAgICBnbF9Qb3NpdGlvbiAgID0gZ2V0UG9zaXRpb24oKTtcclxuICAgICAgICB2R3JpZFBvc2l0aW9uID0gZEN1cnJlbnRUZXJyYWluWFo7XHJcbiAgICAgICAgdlV2Q29vcmQgICAgICA9IGdldEN1cnJlbnRUZXJyYWluVXZDb29yZCgpO1xyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IG1heExheWVyc0NvdW50ID0gMTY7XHJcbmV4cG9ydCBjb25zdCBkaWZmdXNlUFMgPSAvKiogQHR5cGUgZ2xzbCAqL1xyXG5gXHJcbiAgICB1bmlmb3JtIHNhbXBsZXIyRCAke3RlcnJhaW5TcGxhdE1hcFBhcmFtTmFtZX07XHJcbiAgICB1bmlmb3JtIG1lZGl1bXAgc2FtcGxlcjJEQXJyYXkgdVRlcnJhaW5MYXllcnNEaWZmdXNlO1xyXG4gICAgLy91bmlmb3JtIG1lZGl1bXAgc2FtcGxlcjJEQXJyYXkgdVRlcnJhaW5MYXllcnNOb3JtYWxNYXA7XHJcbiAgICB1bmlmb3JtIGZsb2F0IHVUZXJyYWluTGF5ZXJzQ291bnQ7XHJcbiAgICB1bmlmb3JtIGZsb2F0IHVUZXJyYWluTGF5ZXJzRmxhZ3NbJHttYXhMYXllcnNDb3VudH1dO1xyXG4gICAgdW5pZm9ybSB2ZWMyIHVUZXJyYWluTGF5ZXJzU2NhbGVbJHttYXhMYXllcnNDb3VudH1dO1xyXG4gICAgdW5pZm9ybSB2ZWMyIHVUZXJyYWluTGF5ZXJzT2Zmc2V0WyR7bWF4TGF5ZXJzQ291bnR9XTtcclxuXHJcbiAgICB2YXJ5aW5nIHZlYzIgdlV2Q29vcmQ7XHJcbiAgICB2YXJ5aW5nIHZlYzIgdkdyaWRQb3NpdGlvbjtcclxuXHJcbiAgICB2b2lkIGdldEFsYmVkbygpIHtcclxuXHJcbiAgICAgICAgdmVjMyBhbGJlZG8gPSB2ZWMzKDAuMCk7XHJcbiAgICAgICAgdmVjNCBzcGxhdCAgPSBwb3codGV4dHVyZTJEKCR7dGVycmFpblNwbGF0TWFwUGFyYW1OYW1lfSwgdlV2Q29vcmQpLCB2ZWM0KDIuMikpO1xyXG4gICAgICAgIGludCBjb3VudCAgID0gaW50KHVUZXJyYWluTGF5ZXJzQ291bnQpO1xyXG5cclxuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8ICR7bWF4TGF5ZXJzQ291bnR9OyArK2kpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh1VGVycmFpbkxheWVyc0ZsYWdzW2ldID4gMC4wKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmVjMiB1diA9IHVUZXJyYWluTGF5ZXJzT2Zmc2V0W2ldICsgdlV2Q29vcmQgKiB1VGVycmFpbkxheWVyc1NjYWxlW2ldO1xyXG4gICAgICAgICAgICAgICAgdmVjMyBwb3MgPSB2ZWMzKHV2LCBmbG9hdChpKSk7XHJcbiAgICAgICAgICAgICAgICB2ZWM0IGZjdCA9IHZlYzQoMi4yKTtcclxuICAgICAgICAgICAgICAgIHZlYzQgdGV4ID0gcG93KHRleHR1cmUodVRlcnJhaW5MYXllcnNEaWZmdXNlLCBwb3MpLCBmY3QpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoaSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxiZWRvID0gdGV4LnJnYjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsYmVkbyA9IG1peChhbGJlZG8sIHRleC5yZ2IsIHNwbGF0W2kgLSAxXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgZEFsYmVkbyA9IGFsYmVkbztcclxuICAgIH1cclxuYDtcclxuXHJcbmV4cG9ydCBjb25zdCBjaHVua3MgPSB7XHJcblxyXG4gICAgY3VycmVudFRlcnJhaW5YWkZvckluc3RhbmNpbmdDaHVua1ZTLFxyXG4gICAgY3VycmVudFRlcnJhaW5YWkNodW5rVlMsXHJcblxyXG4gICAgdGVycmFpbkhlaWdodEZhY3RvclIzMkZWUyxcclxuICAgIHRlcnJhaW5IZWlnaHRGYWN0b3JSR0JBOFZTLFxyXG4gICAgdGVycmFpbkhlaWdodEZhY3RvclJHQjhWUyxcclxuICAgIHRlcnJhaW5IZWlnaHRGYWN0b3JSR0JBOFgyVlMsXHJcbiAgICB0ZXJyYWluSGVpZ2h0RmFjdG9yUkdCQThYNFZTLFxyXG5cclxuICAgIHRlcnJhaW5IZWlnaHRGYWN0b3JDaHVua1ZTLFxyXG5cclxuICAgIHRlcnJhaW5IZWlnaHRDaHVua1ZTLFxyXG4gICAgdGVycmFpbkNvb3Jkc0NodW5rVlMsXHJcbiAgICB0ZXJyYWluQ2h1bmtVVlZTLFxyXG5cclxuICAgIG5vcm1hbEJ5SGVpZ2h0TWFwVlMsXHJcblxyXG5cclxuICAgIC8vIFZlcnRleFxyXG4gICAgYmFzZUZvckluc3RhbmNpbmdWUyxcclxuICAgIGJhc2VPcmlnaW5hbFZTLFxyXG4gICAgYmFzZUNsZWFyVlMsXHJcblxyXG4gICAgdHJhbnNmb3JtRGVjbFZTLFxyXG4gICAgXHJcbiAgICB0cmFuc2Zvcm1WUyxcclxuICAgIGluc3RhbmNpbmdWUyxcclxuICAgIHRyYW5zZm9ybUluc3RhbmNpbmdWUyxcclxuICAgIG5vcm1hbENvcmVWUyxcclxuICAgIG5vcm1hbFZTLFxyXG5cclxuICAgIHV2MFZTLFxyXG4gICAgc3RhcnRWUyxcclxuXHJcbiAgICAvLyBGcmFnbWVudFxyXG4gICAgZGlmZnVzZVBTLFxyXG59XHJcblxyXG4vKipcclxuICogQHZhcmlhbnQgcmdiIC0gZm9ybWF0IGJ5IHVpbnQ4WzNdIHRleHR1cmVcclxuICogQHZhcmlhbnQgcjIzZiAtIGZvcm1hdCBieSBmbG9hdDMyIHRleHR1cmVcclxuICogQHZhcmlhbnQgcmdiYSAtIGZvcmFtdCBieSB1aW50OFs0XSB0ZXh0dXJlXHJcbiAqIEB2YXJpYW50IHJnYmFYMiAtIGZvcm1hdCBjb21wcmVzc2VkIGJ5IDIgcGF0Y2hlcyBieSB4IGNvb3JkaW5hdGVcclxuICogQHNlZSBDb21wcmVzc2VkUGF0Y2hlZEhlaWdodE1hcFxyXG4gKi9cclxuZXhwb3J0IHR5cGUgVEhlaWdodE1hcEZvcm1hdCA9ICdyMzJmJyB8ICdyZ2JhJyB8ICdyZ2JhWDInIHwgJ3JnYmFYNCcgfCAncmdiJztcclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRlcnJhaW5IZWlnaHRGYWN0b3JWUyhmb3JtYXQ6IFRIZWlnaHRNYXBGb3JtYXQsIGNodW5rc1N0b3JlOiB0eXBlb2YgY2h1bmtzID0gY2h1bmtzKSB7XHJcbiAgICBzd2l0Y2ggKGZvcm1hdCkge1xyXG4gICAgICAgIGNhc2UgJ3IzMmYnOiAgIHJldHVybiBjaHVua3NTdG9yZS50ZXJyYWluSGVpZ2h0RmFjdG9yUjMyRlZTO1xyXG4gICAgICAgIGNhc2UgJ3JnYmEnOiAgIHJldHVybiBjaHVua3NTdG9yZS50ZXJyYWluSGVpZ2h0RmFjdG9yUkdCQThWUztcclxuICAgICAgICBjYXNlICdyZ2InOiAgICByZXR1cm4gY2h1bmtzU3RvcmUudGVycmFpbkhlaWdodEZhY3RvclJHQjhWUztcclxuICAgICAgICBjYXNlICdyZ2JhWDInOiByZXR1cm4gY2h1bmtzU3RvcmUudGVycmFpbkhlaWdodEZhY3RvclJHQkE4WDJWUztcclxuICAgICAgICBjYXNlICdyZ2JhWDQnOiByZXR1cm4gY2h1bmtzU3RvcmUudGVycmFpbkhlaWdodEZhY3RvclJHQkE4WDRWUztcclxuICAgICAgICBkZWZhdWx0OiBicmVhaztcclxuICAgIH1cclxuICAgIHRocm93IG5ldyBFcnJvcignRm9ybWF0IG5vdCBzdXBwb3J0ZWQnKTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJVGVycmFpblNoYWRlck9wdGlvbnMge1xyXG4gICAgaW5zdGFuY2luZzogYm9vbGVhbixcclxuICAgIGhlaWdodE1hcEZvcm1hdDogVEhlaWdodE1hcEZvcm1hdCxcclxuICAgIGNodW5rc1N0b3JlPzogdHlwZW9mIGNodW5rc1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGVycmFpblNoYWRlckNodW5rcyh7aW5zdGFuY2luZywgaGVpZ2h0TWFwRm9ybWF0LCBjaHVua3NTdG9yZSA9IGNodW5rc306IElUZXJyYWluU2hhZGVyT3B0aW9ucyk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xyXG4gICAgXHJcbiAgICBjb25zdCB0ZXJyYWluSGVpZ2h0RmFjdG9yVlMgPSBnZXRUZXJyYWluSGVpZ2h0RmFjdG9yVlMoaGVpZ2h0TWFwRm9ybWF0LCBjaHVua3NTdG9yZSk7XHJcbiAgICBjb25zdCBiYXNlVlMgPSAoaW5zdGFuY2luZyA/IGNodW5rc1N0b3JlLmJhc2VGb3JJbnN0YW5jaW5nVlMgOiBjaHVua3NTdG9yZS5iYXNlT3JpZ2luYWxWUykgKyBjaHVua3NTdG9yZS5iYXNlQ2xlYXJWUztcclxuICAgIGNvbnN0IHRyYW5zZm9ybVZTID0gKGluc3RhbmNpbmcgPyBjaHVua3NTdG9yZS5jdXJyZW50VGVycmFpblhaRm9ySW5zdGFuY2luZ0NodW5rVlMgOiBjaHVua3NTdG9yZS5jdXJyZW50VGVycmFpblhaQ2h1bmtWUylcclxuICAgICAgICArIHRlcnJhaW5IZWlnaHRGYWN0b3JWU1xyXG4gICAgICAgICsgY2h1bmtzU3RvcmUudGVycmFpbkNvb3Jkc0NodW5rVlNcclxuICAgICAgICArIGNodW5rc1N0b3JlLnRlcnJhaW5DaHVua1VWVlNcclxuICAgICAgICArIGNodW5rc1N0b3JlLnRlcnJhaW5IZWlnaHRGYWN0b3JDaHVua1ZTXHJcbiAgICAgICAgKyBjaHVua3NTdG9yZS50ZXJyYWluSGVpZ2h0Q2h1bmtWU1xyXG4gICAgICAgICsgY2h1bmtzU3RvcmUudHJhbnNmb3JtVlM7XHJcbiAgICBcclxuICAgIGNvbnN0IG5vcm1hbFZTID0gY2h1bmtzU3RvcmUubm9ybWFsQnlIZWlnaHRNYXBWUyArIGNodW5rc1N0b3JlLm5vcm1hbFZTO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgLy8gVmVydGV4XHJcbiAgICAgICAgYmFzZVZTLFxyXG4gICAgICAgIHRyYW5zZm9ybVZTLFxyXG4gICAgICAgIHRyYW5zZm9ybURlY2xWUzogY2h1bmtzU3RvcmUudHJhbnNmb3JtRGVjbFZTLFxyXG4gICAgICAgIGluc3RhbmNpbmdWUzogY2h1bmtzU3RvcmUuaW5zdGFuY2luZ1ZTLFxyXG4gICAgICAgIC8vdHJhbnNmb3JtSW5zdGFuY2luZ1ZTOiBjaHVua3MudHJhbnNmb3JtSW5zdGFuY2luZ1ZTLFxyXG4gICAgICAgIC8vbm9ybWFsQ29yZVZTOiBjaHVua3Mubm9ybWFsQ29yZVZTLFxyXG4gICAgICAgIG5vcm1hbFZTLFxyXG4gICAgICAgIHV2MFZTOiBjaHVua3NTdG9yZS51djBWUyxcclxuICAgICAgICBzdGFydFZTOiBjaHVua3NTdG9yZS5zdGFydFZTLFxyXG5cclxuICAgICAgICAvLyBGcmFnbWVudFxyXG4gICAgICAgIGRpZmZ1c2VQUzogY2h1bmtzU3RvcmUuZGlmZnVzZVBTLFxyXG4gICAgfTtcclxufSIsImltcG9ydCB0eXBlIHsgZmxvYXQsIGludCB9IGZyb20gXCIuLi9TaGFyZWQvVHlwZXMubWpzXCI7XHJcbmltcG9ydCBBYnNQYXRjaGVkSGVpZ2h0TWFwLCB7IGdldE9yVGhyb3dEYXRhQ2h1bmtTaXplLCBJUmVhZG9ubHlBYnNQYXRjaGVkSGVpZ2h0TWFwVHlwcGVkIH0gZnJvbSBcIi4vQWJzUGF0Y2hlZEhlaWdodE1hcC5tanNcIjtcclxuaW1wb3J0IHsgZGVmYXVsdEhlaWdodFZlcnRleFNpemUgfSBmcm9tIFwiLi9IZWlnaHRNYXAubWpzXCI7XHJcblxyXG5leHBvcnQgdHlwZSBUQ29tcHJlc3NBbGdvcml0bSA9IFwieDJcIiB8IFwieDRcIjtcclxuZXhwb3J0IHR5cGUgVEhlaWdodE1hcEFycmF5VHlwZUJhZzxUIGV4dGVuZHMgVENvbXByZXNzQWxnb3JpdG0+ID0gVCBleHRlbmRzIFwieDJcIiA/IFVpbnQxNkFycmF5IDogVWludDhBcnJheTtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb21wcmVzc2VkUGF0Y2hlZEhlaWdodE1hcDxUVENvbXByZXNzQWxnb3JpdG0gZXh0ZW5kcyBUQ29tcHJlc3NBbGdvcml0bT5cclxuICAgICBleHRlbmRzIEFic1BhdGNoZWRIZWlnaHRNYXA8VEhlaWdodE1hcEFycmF5VHlwZUJhZzxUVENvbXByZXNzQWxnb3JpdG0+PlxyXG4gIGltcGxlbWVudHMgSVJlYWRvbmx5QWJzUGF0Y2hlZEhlaWdodE1hcFR5cHBlZDxUSGVpZ2h0TWFwQXJyYXlUeXBlQmFnPFRUQ29tcHJlc3NBbGdvcml0bT4+IHtcclxuXHJcbiAgICBwcml2YXRlIF9jb21wcmVzc0FsZ29yaXRtOiBUVENvbXByZXNzQWxnb3JpdG07XHJcbiAgICBwcml2YXRlIF9wYXRjaFhCYXRjaFNpemU6IGludDtcclxuICAgIHByaXZhdGUgX21heFNhZmVGYWN0b3I6IGludDtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IGNvbXByZXNzQWxnb3JpdG0oKSB7IHJldHVybiB0aGlzLl9jb21wcmVzc0FsZ29yaXRtOyB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgY3JlYXRlQnVmZmVyPFRDb21wcmVzcyBleHRlbmRzIFRDb21wcmVzc0FsZ29yaXRtPih3aWR0aDogaW50LCBkZXB0aDogaW50LCBjaHVua1NpemU6IGludCwgYWxnb3JpdG06IFRDb21wcmVzcyk6IFRIZWlnaHRNYXBBcnJheVR5cGVCYWc8VENvbXByZXNzPiB7XHJcblxyXG4gICAgICAgIGNvbnN0IG51bUNodW5rc1ggICA9ICgod2lkdGggLSAxKSAvIChjaHVua1NpemUgLSAxKSkgfCAwO1xyXG4gICAgICAgIGNvbnN0IG51bUNodW5rc1ogICA9ICgoZGVwdGggLSAxKSAvIChjaHVua1NpemUgLSAxKSkgfCAwO1xyXG4gICAgICAgIGNvbnN0IGNodW5rQXJyU2l6ZSA9IGNodW5rU2l6ZSAqKiAyO1xyXG4gICAgICAgIGNvbnN0IGNodW5rQ291bnQgICA9IG51bUNodW5rc1ggKiBudW1DaHVua3NaO1xyXG4gICAgICAgIGNvbnN0IHBhdGNoWEJhdGNoaW5nQ291bnQgPSBhbGdvcml0bSA9PT0gXCJ4NFwiID8gNCA6IDI7XHJcblxyXG4gICAgICAgIGlmIChudW1DaHVua3NYIDwgcGF0Y2hYQmF0Y2hpbmdDb3VudCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVGhlIGNodW5rU2l6ZSAoJWQpIHNob3VsZCBiZSBhdCBsZWFzdCAoJWQpIHRpbWVzIHNtYWxsZXIgdGhhbiB0aGUgd2lkdGggKCVkKVxcblwiLCBjaHVua1NpemUsIHBhdGNoWEJhdGNoaW5nQ291bnQsIHdpZHRoKTtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gKGFsZ29yaXRtID09PSBcIngyXCJcclxuICAgICAgICAgICAgPyBuZXcgVWludDE2QXJyYXkoY2h1bmtBcnJTaXplICogY2h1bmtDb3VudClcclxuICAgICAgICAgICAgOiBuZXcgVWludDhBcnJheShjaHVua0FyclNpemUgKiBjaHVua0NvdW50KVxyXG4gICAgICAgICkgYXMgdW5rbm93biBhcyBUSGVpZ2h0TWFwQXJyYXlUeXBlQmFnPFRDb21wcmVzcz47XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHdpZHRoOiBpbnQsIGRlcHRoOiBpbnQsIHBhdGNoU2l6ZTogaW50LCBkYXRhQ2h1bmtTaXplOiBpbnQsIG1pbkhlaWdodDogZmxvYXQsIG1heEhlaWdodDogZmxvYXQsIGFsZ29yaXRtOiBUVENvbXByZXNzQWxnb3JpdG0pO1xyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHdpZHRoOiBpbnQsIGRlcHRoOiBpbnQsIHBhdGNoU2l6ZTogaW50LCBkYXRhQ2h1bmtTaXplOiBpbnQsIG1pbkhlaWdodDogZmxvYXQsIG1heEhlaWdodDogZmxvYXQsIGFsZ29yaXRtOiBUVENvbXByZXNzQWxnb3JpdG0sIGJ1ZmZlcjogVEhlaWdodE1hcEFycmF5VHlwZUJhZzxUVENvbXByZXNzQWxnb3JpdG0+LCBpdGVtU2l6ZT86IGludCwgaXRlbUhlaWdodEluZGV4T2Zmc2V0PzogaW50KTtcclxuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvcih3aWR0aDogaW50LCBkZXB0aDogaW50LCBwYXRjaFNpemU6IGludCwgZGF0YUNodW5rU2l6ZTogaW50LCBtaW5IZWlnaHQ6IGZsb2F0LCBtYXhIZWlnaHQ6IGZsb2F0LCBhbGdvcml0bTogVFRDb21wcmVzc0FsZ29yaXRtLCBidWZmZXI/OiBUSGVpZ2h0TWFwQXJyYXlUeXBlQmFnPFRUQ29tcHJlc3NBbGdvcml0bT4sIGl0ZW1TaXplOiBpbnQgPSBkZWZhdWx0SGVpZ2h0VmVydGV4U2l6ZSwgaXRlbUhlaWdodEluZGV4T2Zmc2V0OiBpbnQgPSAwKSB7XHJcbiAgICAgICAgY29uc3QgdmFsaWREYXRhQ2h1bmtTaXplID0gZ2V0T3JUaHJvd0RhdGFDaHVua1NpemUocGF0Y2hTaXplLCBkYXRhQ2h1bmtTaXplKTtcclxuICAgICAgICBjb25zdCB0bXBCdWZmZXIgPSBidWZmZXIgPz8gQ29tcHJlc3NlZFBhdGNoZWRIZWlnaHRNYXAuY3JlYXRlQnVmZmVyKHdpZHRoLCBkZXB0aCwgdmFsaWREYXRhQ2h1bmtTaXplLCBhbGdvcml0bSk7XHJcbiAgICAgICAgc3VwZXIod2lkdGgsIGRlcHRoLCBwYXRjaFNpemUsIGRhdGFDaHVua1NpemUsIG1pbkhlaWdodCwgbWF4SGVpZ2h0LCB0bXBCdWZmZXIsIGl0ZW1TaXplLCBpdGVtSGVpZ2h0SW5kZXhPZmZzZXQpO1xyXG4gICAgICAgIHRoaXMuX2NvbXByZXNzQWxnb3JpdG0gPSBhbGdvcml0bTtcclxuICAgICAgICB0aGlzLl9wYXRjaFhCYXRjaFNpemUgID0gYWxnb3JpdG0gPT09IFwieDRcIiA/IDQgOiAyO1xyXG4gICAgICAgIHRoaXMuX21heFNhZmVGYWN0b3IgICAgPSBhbGdvcml0bSA9PT0gXCJ4NFwiID8gMHhmZiA6IDB4ZmZmZjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Q2h1bmtJbmRleChjaHVua1g6IGludCwgY2h1bmtaOiBpbnQpOiBpbnQge1xyXG4gICAgICAgIHJldHVybiAoY2h1bmtaICogdGhpcy5kYXRhTnVtQ2h1bmtzWCArIGNodW5rWCkgLyB0aGlzLl9wYXRjaFhCYXRjaFNpemUgfCAwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvdmVycmlkZSBnZXRDaHVua0J1ZmZlcih0eXBlOiBGbG9hdDMyQXJyYXlDb25zdHJ1Y3RvciwgY2h1bmtYOiBpbnQsIGNodW5rWjogaW50KTogRmxvYXQzMkFycmF5O1xyXG4gICAgcHVibGljIG92ZXJyaWRlIGdldENodW5rQnVmZmVyKHR5cGU6IFVpbnQxNkFycmF5Q29uc3RydWN0b3IsIGNodW5rWDogaW50LCBjaHVua1o6IGludCk6IFVpbnQxNkFycmF5O1xyXG4gICAgcHVibGljIG92ZXJyaWRlIGdldENodW5rQnVmZmVyKHR5cGU6IFVpbnQ4QXJyYXlDb25zdHJ1Y3RvciwgY2h1bmtYOiBpbnQsIGNodW5rWjogaW50KTogVWludDhBcnJheTtcclxuICAgIHB1YmxpYyBvdmVycmlkZSBnZXRDaHVua0J1ZmZlcih0eXBlOiBhbnksIGNodW5rWDogaW50LCBjaHVua1o6IGludCkge1xyXG4gICAgICAgIGNvbnN0IHNpemUgICAgICAgID0gdGhpcy5kYXRhQ2h1bmtTaXplICoqIDI7XHJcbiAgICAgICAgY29uc3QgY2h1bmtMZXZlbCAgPSAoY2h1bmtaICogdGhpcy5kYXRhTnVtQ2h1bmtzWCArIGNodW5rWCkgLyB0aGlzLl9wYXRjaFhCYXRjaFNpemUgfCAwO1xyXG4gICAgICAgIGNvbnN0IGNodW5rT2Zmc2V0ID0gY2h1bmtMZXZlbCAqIHNpemUgKiB0aGlzLmRhdGEuQllURVNfUEVSX0VMRU1FTlQgKiB0aGlzLl9wYXRjaFhCYXRjaFNpemU7XHJcbiAgICAgICAgY29uc3QgY291bnQgICAgICAgPSBzaXplICogdGhpcy5fcGF0Y2hYQmF0Y2hTaXplICogKHRoaXMuZGF0YS5CWVRFU19QRVJfRUxFTUVOVCAvIHR5cGUuQllURVNfUEVSX0VMRU1FTlQpO1xyXG4gICAgICAgIHJldHVybiBuZXcgdHlwZSh0aGlzLmRhdGEuYnVmZmVyLCBjaHVua09mZnNldCwgY291bnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvdmVycmlkZSBnZXRDaHVua3NCdWZmZXJzKHR5cGU6IEZsb2F0MzJBcnJheUNvbnN0cnVjdG9yKTogRmxvYXQzMkFycmF5W107XHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Q2h1bmtzQnVmZmVycyh0eXBlOiBVaW50MTZBcnJheUNvbnN0cnVjdG9yKTogVWludDE2QXJyYXlbXTtcclxuICAgIHB1YmxpYyBvdmVycmlkZSBnZXRDaHVua3NCdWZmZXJzKHR5cGU6IFVpbnQ4QXJyYXlDb25zdHJ1Y3Rvcik6IFVpbnQ4QXJyYXlbXTtcclxuICAgIHB1YmxpYyBvdmVycmlkZSBnZXRDaHVua3NCdWZmZXJzKHR5cGU6IGFueSkge1xyXG5cclxuICAgICAgICBjb25zdCByZXN1bHQgPSBuZXcgQXJyYXkoKHRoaXMuZGF0YU51bUNodW5rc1ggLyB0aGlzLl9wYXRjaFhCYXRjaFNpemUpICogdGhpcy5kYXRhTnVtQ2h1bmtzWik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yIChsZXQgY2h1bmtaID0gMDsgY2h1bmtaIDwgdGhpcy5kYXRhTnVtQ2h1bmtzWjsgY2h1bmtaKyspIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGNodW5rWCA9IDA7IGNodW5rWCA8IHRoaXMuZGF0YU51bUNodW5rc1g7IGNodW5rWCArPSB0aGlzLl9wYXRjaFhCYXRjaFNpemUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IChjaHVua1ogKiB0aGlzLmRhdGFOdW1DaHVua3NYICsgY2h1bmtYKSAvIHRoaXMuX3BhdGNoWEJhdGNoU2l6ZSB8IDA7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gdGhpcy5nZXRDaHVua0J1ZmZlcih0eXBlLCBjaHVua1gsIGNodW5rWik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG92ZXJyaWRlIF9lbmNvZGVIZWlnaHRGYWN0b3Ioc3RvcmU6IFRIZWlnaHRNYXBBcnJheVR5cGVCYWc8VFRDb21wcmVzc0FsZ29yaXRtPiwgaW5kZXg6IGludCwgdmFsdWU6IGZsb2F0KSB7XHJcbiAgICAgICAgc3RvcmVbaW5kZXhdID0gTWF0aC5taW4odmFsdWUgKiB0aGlzLl9tYXhTYWZlRmFjdG9yLCB0aGlzLl9tYXhTYWZlRmFjdG9yKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIG92ZXJyaWRlIF9kZWNvZGVIZWlnaHRGYWN0b3Ioc3RvcmU6IFRIZWlnaHRNYXBBcnJheVR5cGVCYWc8VFRDb21wcmVzc0FsZ29yaXRtPiwgaW5kZXg6IGludCkge1xyXG4gICAgICAgIHJldHVybiBzdG9yZVtpbmRleF0gLyB0aGlzLl9tYXhTYWZlRmFjdG9yO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0SW5kZXgoeDogaW50LCB6OiBpbnQpOiBpbnQge1xyXG5cclxuICAgICAgICBjb25zdCBsb2NhbFggPSB4ICUgdGhpcy5kYXRhQ2h1bmtTaXplO1xyXG4gICAgICAgIGNvbnN0IGxvY2FsWiA9IHogJSB0aGlzLmRhdGFDaHVua1NpemU7XHJcbiAgICAgICAgY29uc3QgY2h1bmtYID0gTWF0aC5jZWlsKHggLyB0aGlzLmRhdGFDaHVua1NpemUpIC0gKGxvY2FsWCA+IDAgPyAxIDogMCk7XHJcbiAgICAgICAgY29uc3QgY2h1bmtaID0gTWF0aC5jZWlsKHogLyB0aGlzLmRhdGFDaHVua1NpemUpIC0gKGxvY2FsWiA+IDAgPyAxIDogMCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGNodW5rTGV2ZWwgID0gKGNodW5rWiAqIHRoaXMuZGF0YU51bUNodW5rc1ggKyBjaHVua1gpIC8gdGhpcy5fcGF0Y2hYQmF0Y2hTaXplIHwgMDtcclxuICAgICAgICBjb25zdCBjaHVua09mZnNldCA9IGNodW5rTGV2ZWwgKiAodGhpcy5kYXRhQ2h1bmtTaXplICoqIDIpO1xyXG4gICAgICAgIGNvbnN0IGxvY2FsSW5kZXggID0gbG9jYWxaICogdGhpcy5kYXRhQ2h1bmtTaXplICsgbG9jYWxYO1xyXG4gICAgICAgIGNvbnN0IG51bUNvbXByZXNzID0gY2h1bmtYICUgdGhpcy5fcGF0Y2hYQmF0Y2hTaXplOyAvLyBjb21wcmVzcyBieSB4IGF4aXNcclxuXHJcbiAgICAgICAgcmV0dXJuIChjaHVua09mZnNldCArIGxvY2FsSW5kZXgpICogdGhpcy5fcGF0Y2hYQmF0Y2hTaXplICsgbnVtQ29tcHJlc3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvbXByZXNzZWRQYXRjaGVkSGVpZ2h0TWFwOyIsImltcG9ydCB7IElQYXRjaExvZCB9IGZyb20gXCIuLi9UZXJyYWluU3lzdGVtL0xvZE1hbmFnZXIubWpzXCI7XHJcbmltcG9ydCB7IGNvb3Jkc1ZlcnRleFNpemUsIElSZWFkb25seUNvb3Jkc0J1ZmZlciB9IGZyb20gXCIuLi9UZXJyYWluU3lzdGVtL0Nvb3Jkc0J1ZmZlci5tanNcIjtcclxuaW1wb3J0IFRlcnJhaW5QYXRjaGVzQmFzaWMsIHsgVGVycmFpblBhdGNoQnVmZmVyQmFzaWMgfSBmcm9tIFwiLi9UZXJyYWluUGF0Y2hlc0Jhc2ljLm1qc1wiO1xyXG5pbXBvcnQgeyBwYXRjaENvb3JkT2Zmc2V0UGFyYW1OYW1lLCB0ZXJyYWluSGVpZ2h0TWFwUGFyYW1OYW1lLCBnZXRUZXJyYWluU2hhZGVyQ2h1bmtzLCB2ZXJ0ZXhDb29yZEF0dHJOYW1lLCB0ZXJyYWluSGVpZ2h0TWFwQ2h1bmtTaXplUGFyYW1OYW1lLCBsb2RDb3JlUGFyYW1OYW1lLCBwYXRjaEluc3RDb29yZE9mZnNldFBhcmFtTmFtZSwgVEhlaWdodE1hcEZvcm1hdCB9IGZyb20gXCIuL1RlcnJhaW5QYXRjaGVzU2hhZGVyQ2h1bmtzLm1qc1wiO1xyXG5pbXBvcnQgeyBpbnQgfSBmcm9tIFwiLi4vU2hhcmVkL1R5cGVzLm1qc1wiO1xyXG5pbXBvcnQgeyBJU2luZ2xlTG9kSW5mbyB9IGZyb20gXCIuLi9UZXJyYWluU3lzdGVtL0xvZEluZm8ubWpzXCI7XHJcbmltcG9ydCB7IGluc3REYXRhU2l6ZSwgVEluc3RDb29yZHNPZmZzZXRBcnJUeXBlIH0gZnJvbSBcIi4uL1RlcnJhaW5TeXN0ZW0vUGF0Y2hJbnN0YW5jaW5nLm1qc1wiO1xyXG5pbXBvcnQgQ29tcHJlc3NlZFBhdGNoZWRIZWlnaHRNYXAgZnJvbSBcIi4uL1RlcnJhaW5TeXN0ZW0vQ29tcHJlc3NlZFBhdGNoZWRIZWlnaHRNYXAubWpzXCI7XHJcbmltcG9ydCB7IElab25lIH0gZnJvbSBcIi4uL1RlcnJhaW5TeXN0ZW0vSVpvbmUubWpzXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXJyYWluUGF0Y2hlcyBleHRlbmRzIFRlcnJhaW5QYXRjaGVzQmFzaWM8VGVycmFpblBhdGNoQnVmZmVyQmFzaWM+IHtcclxuXHJcbiAgICBwcml2YXRlIF9oZWlnaHRNYXA6IHBjeC5UZXh0dXJlO1xyXG4gICAgcHJpdmF0ZSBfc2hhcmVkSW5kZXhCdWZmZXI6IHBjeC5JbmRleEJ1ZmZlcjtcclxuICAgIHByaXZhdGUgX3NoYXJlZFZlcnRleEJ1ZmZlcjogcGN4LlZlcnRleEJ1ZmZlcjtcclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlSGVpZ2h0cyh6b25lOiBJWm9uZSkge1xyXG4gICAgICAgIHN1cGVyLnVwZGF0ZUhlaWdodHMoem9uZSk7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlSGVpZ2h0TWFwKHpvbmUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3N5bmNQYXRjaEhlaWdodHMocGF0Y2hYOiBpbnQsIHBhdGNoWjogaW50KSB7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IGEgYmF0Y2ggdXBkYXRlIG1heSBiZSByZXF1aXJlZC5cclxuXHJcbiAgICAgICAgLy8gVE9ETzogdHJhbnNmb3JtIGluIGhlaWdodG1hcCBjbGFzc1xyXG4gICAgICAgIGNvbnN0IGRhdGFDaHVua1NpemUgPSB0aGlzLnRlcnJhaW4uaGVpZ2h0TWFwLmRhdGFDaHVua1NpemU7XHJcbiAgICAgICAgY29uc3QgZmFjdG9yICAgICAgICA9IHRoaXMudGVycmFpbi5oZWlnaHRNYXAuZGF0YUNodW5rU2l6ZUZhY3RvcjtcclxuICAgICAgICBjb25zdCBkYXRhQ2h1bmtYICAgID0gcGF0Y2hYICogZmFjdG9yIHwgMDtcclxuICAgICAgICBjb25zdCBkYXRhQ2h1bmtaICAgID0gcGF0Y2haICogZmFjdG9yIHwgMDtcclxuXHJcbiAgICAgICAgY29uc3QgbGV2ZWwgID0gdGhpcy50ZXJyYWluLmhlaWdodE1hcC5nZXRDaHVua0luZGV4KGRhdGFDaHVua1gsIGRhdGFDaHVua1opO1xyXG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMudGVycmFpbi5oZWlnaHRNYXAuZ2V0Q2h1bmtCdWZmZXIoVWludDhBcnJheSwgZGF0YUNodW5rWCwgZGF0YUNodW5rWik7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9hcHAuZ3JhcGhpY3NEZXZpY2UuaXNXZWJHTDIpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGdsID0gKHRoaXMuX2FwcC5ncmFwaGljc0RldmljZSBhcyBwY3guV2ViZ2xHcmFwaGljc0RldmljZSkuZ2w7XHJcbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmVGb3JtYXQgPSB0aGlzLl9oZWlnaHRNYXAuaW1wbC5fZ2xGb3JtYXQ7XHJcbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmVQaXhlbFQgPSB0aGlzLl9oZWlnaHRNYXAuaW1wbC5fZ2xQaXhlbFR5cGU7XHJcbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmVUYXJnZXQgPSB0aGlzLl9oZWlnaHRNYXAuaW1wbC5fZ2xUYXJnZXQ7XHJcbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmVPYmplY3QgPSB0aGlzLl9oZWlnaHRNYXAuaW1wbC5fZ2xUZXh0dXJlO1xyXG5cclxuICAgICAgICAgICAgZ2wuYmluZFRleHR1cmUodGV4dHVyZVRhcmdldCwgdGV4dHVyZU9iamVjdCk7XHJcbiAgICAgICAgICAgIGdsLnRleFN1YkltYWdlM0QoZ2wuVEVYVFVSRV8yRF9BUlJBWSwgMCwgMCwgMCwgbGV2ZWwsIGRhdGFDaHVua1NpemUsIGRhdGFDaHVua1NpemUsIDEsIHRleHR1cmVGb3JtYXQsIHRleHR1cmVQaXhlbFQsIGJ1ZmZlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX2FwcC5ncmFwaGljc0RldmljZS5pc1dlYkdQVSkge1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgd2ViZ3B1ICA9ICh0aGlzLl9hcHAuZ3JhcGhpY3NEZXZpY2UgYXMgYW55KS53Z3B1IGFzIEdQVURldmljZTtcclxuICAgICAgICAgICAgY29uc3QgdGV4dHVyZSA9ICh0aGlzLl9oZWlnaHRNYXAuaW1wbC5ncHVUZXh0dXJlKSBhcyBHUFVUZXh0dXJlO1xyXG5cclxuICAgICAgICAgICAgd2ViZ3B1LnF1ZXVlLndyaXRlVGV4dHVyZShcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlOiB0ZXh0dXJlLFxyXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbjogWzAsIDAsIGxldmVsXSxcclxuICAgICAgICAgICAgICAgICAgICBtaXBMZXZlbDogMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGJ1ZmZlcixcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgYnl0ZXNQZXJSb3c6IDQgKiBkYXRhQ2h1bmtTaXplLCAvLyBhbHdheXMgNCBmb3IgcmdiYSBmb3JtYXRcclxuICAgICAgICAgICAgICAgICAgICByb3dzUGVySW1hZ2U6IGRhdGFDaHVua1NpemVcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGRhdGFDaHVua1NpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBkYXRhQ2h1bmtTaXplXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3VwZGF0ZUhlaWdodE1hcCh6b25lOiBJWm9uZSkge1xyXG4gICAgICAgIHRoaXMuZm9yRWFjaCh6b25lLCAocGF0Y2hJbmRleCwgeCwgeikgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9zeW5jUGF0Y2hIZWlnaHRzKHgsIHopO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBfY3JlYXRlUGF0Y2hCdWZmZXIocGF0Y2hJbmRleDogaW50LCBiYXNlSW5kZXg6IGludCwgYmFzZVZlcnRleDogaW50LCBjb3VudDogaW50LCBwYXRjaFg6IGludCwgcGF0Y2haOiBpbnQsIG1pblg6IGludCwgbWluWjogaW50LCBzaXplOiBpbnQsIGxvZDogSVBhdGNoTG9kKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHBhdGNoQnVmID0gbmV3IFRlcnJhaW5QYXRjaEJ1ZmZlckJhc2ljKHBhdGNoSW5kZXgsIG1pblgsIG1pblosIHNpemUpO1xyXG5cclxuICAgICAgICBwYXRjaEJ1Zi5sb2QgPSBsb2Q7XHJcbiAgICAgICAgcGF0Y2hCdWYuaW5kaWNlc0Jhc2VJbmRleCA9IGJhc2VJbmRleDtcclxuICAgICAgICBwYXRjaEJ1Zi5pbmRpY2VzQmFzZVZlcnRleCA9IGJhc2VWZXJ0ZXg7XHJcbiAgICAgICAgcGF0Y2hCdWYuaW5kaWNlc0NvdW50ID0gY291bnQ7XHJcbiAgICAgICAgcGF0Y2hCdWYuZGVwZW5kZW5jZXNVcGRhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgcGF0Y2hCdWYuaGVpZ2h0c1VwZGF0ZWQgPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gcGF0Y2hCdWY7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfYnVpbGRWZXJ0ZXhGb3JtYXQoZ3JhcGhpY3NEZXZpY2U6IHBjeC5HcmFwaGljc0RldmljZSwgdmVydGV4QnVmZmVyOiBJUmVhZG9ubHlDb29yZHNCdWZmZXIpIHtcclxuICAgICAgICBcclxuICAgICAgICAvLyBXZSBjYW4gdXNlIHVpbnQ4IGZvciBwYXRjaGVzIHNtYWxsZXIgdGhhbiAyNTUsIGJ1dCB3ZSBvbmx5IHVzZSAyIGJ5dGVzLFxyXG4gICAgICAgIC8vIGZvciBvcHRpbWFsIHBlcmZvcm1hbmNlIG5lZWQgNCBieXRlcyBmb3IgdGhlIGJ1ZmZlci5cclxuICAgICAgICBjb25zdCBjb29yZHNGb3JtYXQgPSAodmVydGV4QnVmZmVyLnBhdGNoVmVydGV4QnVmZmVyVHlwZWQgaW5zdGFuY2VvZiBVaW50OEFycmF5KSA/IHBjLlRZUEVfVUlOVDggOiBwYy5UWVBFX1VJTlQxNjtcclxuICAgICAgICBjb25zdCB2ZXJ0ZXhEZXNjID0gW3tcclxuICAgICAgICAgICAgc2VtYW50aWM6IHBjLlNFTUFOVElDX1BPU0lUSU9OLFxyXG4gICAgICAgICAgICBjb21wb25lbnRzOiBjb29yZHNWZXJ0ZXhTaXplLFxyXG4gICAgICAgICAgICB0eXBlOiBjb29yZHNGb3JtYXQsXHJcbiAgICAgICAgICAgIG5vcm1hbGl6ZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGFzSW50OiB0cnVlXHJcbiAgICAgICAgfV07XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgcGMuVmVydGV4Rm9ybWF0KGdyYXBoaWNzRGV2aWNlLCB2ZXJ0ZXhEZXNjLCB2ZXJ0ZXhCdWZmZXIucGF0Y2hWZXJ0ZXhCdWZmZXJMZW5ndGgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBfYnVpbGRJbnN0YW5jaW5nVmVydGV4Rm9ybWF0KGdyYXBoaWNzRGV2aWNlOiBwY3guR3JhcGhpY3NEZXZpY2UpIHtcclxuICAgICAgICAvLyBXZSBjYW4gdXNlIHVpbnQ4LCBidXQgd2Ugb25seSB1c2UgMiBieXRlcyxcclxuICAgICAgICAvLyBmb3Igb3B0aW1hbCBwZXJmb3JtYW5jZSBuZWVkIDQgYnl0ZXMgZm9yIHRoZSBidWZmZXIuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBwYy5WZXJ0ZXhGb3JtYXQoZ3JhcGhpY3NEZXZpY2UsIFt7XHJcbiAgICAgICAgICAgIHNlbWFudGljOiBwYy5TRU1BTlRJQ19BVFRSMTAsXHJcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IGNvb3Jkc1ZlcnRleFNpemUsXHJcbiAgICAgICAgICAgIHR5cGU6IHBjLlRZUEVfVUlOVDE2LFxyXG4gICAgICAgICAgICBub3JtYWxpemU6IGZhbHNlLFxyXG4gICAgICAgICAgICBhc0ludDogdHJ1ZVxyXG4gICAgICAgIH1dKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgX2J1aWxkSW5zdGFuY2luZ1ZlcnRleEJ1ZmZlcihncmFwaGljc0RldmljZTogcGN4LkdyYXBoaWNzRGV2aWNlLCBkYXRhOiBUSW5zdENvb3Jkc09mZnNldEFyclR5cGUpIHtcclxuICAgICAgICByZXR1cm4gbmV3IHBjLlZlcnRleEJ1ZmZlcihncmFwaGljc0RldmljZSwgdGhpcy5fYnVpbGRJbnN0YW5jaW5nVmVydGV4Rm9ybWF0KGdyYXBoaWNzRGV2aWNlKSwgZGF0YS5sZW5ndGggLyBpbnN0RGF0YVNpemUsIHtcclxuICAgICAgICAgICAgdXNhZ2U6IHBjLkJVRkZFUl9TVEFUSUMsXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgIHN0b3JhZ2U6IGZhbHNlLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvdmVycmlkZSBfY3JlYXRlSW5zdGFuY2luZ01lc2goYXBwOiBwY3guQXBwQmFzZSwgZW50aXR5OiBwY3guRW50aXR5LCBtYXRlcmlhbDogcGN4Lk1hdGVyaWFsLCBsb2RJbmZvOiBJUGF0Y2hMb2QsIHByaW1pdGl2ZUluZm86IElTaW5nbGVMb2RJbmZvLCBkYXRhOiBUSW5zdENvb3Jkc09mZnNldEFyclR5cGUpOiBwY3guTWVzaEluc3RhbmNlIHtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBwYXRjaE1lc2ggPSBuZXcgcGMuTWVzaChhcHAuZ3JhcGhpY3NEZXZpY2UpO1xyXG4gICAgICAgIGNvbnN0IGluc3RhbmNpbmdCdWYgPSB0aGlzLl9idWlsZEluc3RhbmNpbmdWZXJ0ZXhCdWZmZXIoYXBwLmdyYXBoaWNzRGV2aWNlLCBkYXRhKTtcclxuXHJcbiAgICAgICAgcGF0Y2hNZXNoLmFhYmIgPSB0aGlzLmFhYmI7XHJcbiAgICAgICAgcGF0Y2hNZXNoLmluZGV4QnVmZmVyWzBdID0gdGhpcy5fc2hhcmVkSW5kZXhCdWZmZXI7XHJcbiAgICAgICAgcGF0Y2hNZXNoLnZlcnRleEJ1ZmZlciAgID0gdGhpcy5fc2hhcmVkVmVydGV4QnVmZmVyO1xyXG5cclxuICAgICAgICBwYXRjaE1lc2gucHJpbWl0aXZlWzBdLnR5cGUgPSBwYy5QUklNSVRJVkVfVFJJQU5HTEVTO1xyXG4gICAgICAgIHBhdGNoTWVzaC5wcmltaXRpdmVbMF0uYmFzZSA9IHByaW1pdGl2ZUluZm8uc3RhcnQ7XHJcbiAgICAgICAgcGF0Y2hNZXNoLnByaW1pdGl2ZVswXS5jb3VudCA9IHByaW1pdGl2ZUluZm8uY291bnQ7XHJcbiAgICAgICAgcGF0Y2hNZXNoLnByaW1pdGl2ZVswXS5pbmRleGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgY29uc3QgcGF0Y2hNZXNoSW5zdGFuY2UgPSBuZXcgcGMuTWVzaEluc3RhbmNlKHBhdGNoTWVzaCwgbWF0ZXJpYWwsIGVudGl0eSk7XHJcblxyXG4gICAgICAgIHBhdGNoTWVzaEluc3RhbmNlLmN1bGwgPSBmYWxzZTtcclxuICAgICAgICBwYXRjaE1lc2hJbnN0YW5jZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgcGF0Y2hNZXNoSW5zdGFuY2UudmlzaWJsZVRoaXNGcmFtZSA9IGZhbHNlO1xyXG4gICAgICAgIHBhdGNoTWVzaEluc3RhbmNlLmNhc3RTaGFkb3cgPSBmYWxzZTtcclxuICAgICAgICBwYXRjaE1lc2hJbnN0YW5jZS5yZWNlaXZlU2hhZG93ID0gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcGF0Y2hNZXNoSW5zdGFuY2Uuc2V0UGFyYW1ldGVyKGxvZENvcmVQYXJhbU5hbWUsIGxvZEluZm8uY29yZSwgMHhmZmZmZmZmZik7XHJcbiAgICAgICAgcGF0Y2hNZXNoSW5zdGFuY2Uuc2V0SW5zdGFuY2luZyhpbnN0YW5jaW5nQnVmLCBmYWxzZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBwYXRjaE1lc2hJbnN0YW5jZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb3ZlcnJpZGUgX2NyZWF0ZVBhdGNoTWVzaChwYXRjaEluZGV4OiBudW1iZXIsIGFwcDogcGN4LkFwcEJhc2UsIGVudGl0eTogcGN4LkVudGl0eSwgbWF0ZXJpYWw6IHBjeC5NYXRlcmlhbCk6IHBjeC5NZXNoSW5zdGFuY2Uge1xyXG5cclxuICAgICAgICBjb25zdCBwYXRjaEJ1ZiAgPSB0aGlzLmJ1ZmZlckFycmF5W3BhdGNoSW5kZXhdO1xyXG4gICAgICAgIGNvbnN0IHBhdGNoTWVzaCA9IG5ldyBwYy5NZXNoKGFwcC5ncmFwaGljc0RldmljZSk7XHJcblxyXG4gICAgICAgIHBhdGNoTWVzaC5hYWJiID0gdGhpcy5hYWJiO1xyXG4gICAgICAgIHBhdGNoTWVzaC5pbmRleEJ1ZmZlclswXSA9IHRoaXMuX3NoYXJlZEluZGV4QnVmZmVyO1xyXG4gICAgICAgIHBhdGNoTWVzaC52ZXJ0ZXhCdWZmZXIgICA9IHRoaXMuX3NoYXJlZFZlcnRleEJ1ZmZlcjtcclxuXHJcbiAgICAgICAgcGF0Y2hNZXNoLnByaW1pdGl2ZVswXS50eXBlID0gcGMuUFJJTUlUSVZFX1RSSUFOR0xFUztcclxuICAgICAgICBwYXRjaE1lc2gucHJpbWl0aXZlWzBdLmJhc2UgPSAwO1xyXG4gICAgICAgIHBhdGNoTWVzaC5wcmltaXRpdmVbMF0uY291bnQgPSAwO1xyXG4gICAgICAgIHBhdGNoTWVzaC5wcmltaXRpdmVbMF0uaW5kZXhlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIGNvbnN0IHBhdGNoTWVzaEluc3RhbmNlID0gbmV3IHBjLk1lc2hJbnN0YW5jZShwYXRjaE1lc2gsIG1hdGVyaWFsLCBlbnRpdHkpO1xyXG5cclxuICAgICAgICBwYXRjaE1lc2hJbnN0YW5jZS5jdWxsID0gZmFsc2U7XHJcbiAgICAgICAgcGF0Y2hNZXNoSW5zdGFuY2UudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHBhdGNoTWVzaEluc3RhbmNlLnZpc2libGVUaGlzRnJhbWUgPSBmYWxzZTtcclxuICAgICAgICBwYXRjaE1lc2hJbnN0YW5jZS5jYXN0U2hhZG93ID0gZmFsc2U7XHJcbiAgICAgICAgcGF0Y2hNZXNoSW5zdGFuY2UucmVjZWl2ZVNoYWRvdyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBwYXRjaE1lc2hJbnN0YW5jZS5zZXRQYXJhbWV0ZXIocGF0Y2hDb29yZE9mZnNldFBhcmFtTmFtZSwgW3BhdGNoQnVmLm1pblgsIHBhdGNoQnVmLm1pblpdLCAweGZmZmZmZmZmKTtcclxuICAgICAgICBwYXRjaE1lc2hJbnN0YW5jZS5zZXRJbnN0YW5jaW5nKG51bGwpO1xyXG5cclxuICAgICAgICByZXR1cm4gcGF0Y2hNZXNoSW5zdGFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZGVzdHJveU1lc2gobWVzaEluc3RhbmNlOiBwY3guTWVzaEluc3RhbmNlKSB7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IGRvbnQgZGVzdHJveSBzaGFyZWQgaW5kZXggYW5kIHZlcnRleCBidWZmZXJzXHJcbiAgICAgICAgaWYgKG1lc2hJbnN0YW5jZS5tZXNoKSB7XHJcbiAgICAgICAgICAgIG1lc2hJbnN0YW5jZS5tZXNoLmluZGV4QnVmZmVyID0gW251bGxdIGFzIHVua25vd24gYXMgcGN4LkluZGV4QnVmZmVyW107XHJcbiAgICAgICAgICAgIG1lc2hJbnN0YW5jZS5tZXNoLnZlcnRleEJ1ZmZlciA9IG51bGwgYXMgdW5rbm93biBhcyBwY3guVmVydGV4QnVmZmVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbWVzaEluc3RhbmNlLmRlc3Ryb3koKTtcclxuXHJcbiAgICAgICAgaWYgKG1lc2hJbnN0YW5jZS5tZXNoKSB7XHJcbiAgICAgICAgICAgIG1lc2hJbnN0YW5jZS5tZXNoLmRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG92ZXJyaWRlIF9kZXN0cm95SW5zdGFuY2luZ01lc2gobWVzaDogcGN4Lk1lc2hJbnN0YW5jZSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2Rlc3Ryb3lNZXNoKG1lc2gpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvdmVycmlkZSBfZGVzdHJveVBhdGNoTWVzaChwYXRjaEluZGV4OiBudW1iZXIpOiB2b2lkIHtcclxuXHJcbiAgICAgICAgY29uc3QgcGF0Y2hNZXNoSW5zdGFuY2UgPSB0aGlzLm1lc2hJbnN0YW5jZUFycmF5W3BhdGNoSW5kZXhdO1xyXG5cclxuICAgICAgICBpZiAocGF0Y2hNZXNoSW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgdGhpcy5fZGVzdHJveU1lc2gocGF0Y2hNZXNoSW5zdGFuY2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF91cGRhdGVJbmRleEJ1ZmZlcihncmFwaGljc0RldmljZTogcGN4LkdyYXBoaWNzRGV2aWNlKSB7XHJcbiAgICAgICAgdGhpcy5fc2hhcmVkSW5kZXhCdWZmZXI/LmRlc3Ryb3koKTtcclxuICAgICAgICB0aGlzLl9zaGFyZWRJbmRleEJ1ZmZlciA9IG5ldyBwYy5JbmRleEJ1ZmZlcihcclxuICAgICAgICAgICAgZ3JhcGhpY3NEZXZpY2UsXHJcbiAgICAgICAgICAgIHBjLklOREVYRk9STUFUX1VJTlQzMixcclxuICAgICAgICAgICAgdGhpcy50ZXJyYWluLnBhdGNoSW5kaWNlcy5sZW5ndGgsXHJcbiAgICAgICAgICAgIHBjLkJVRkZFUl9TVEFUSUMsXHJcbiAgICAgICAgICAgIHRoaXMudGVycmFpbi5wYXRjaEluZGljZXMsXHJcbiAgICAgICAgICAgIHsgc3RvcmFnZTogZmFsc2UgfVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfdXBkYXRlVmVydGV4QnVmZmVyKGdyYXBoaWNzRGV2aWNlOiBwY3guR3JhcGhpY3NEZXZpY2UpIHtcclxuICAgICAgICBjb25zdCBmb3JtYXQgPSB0aGlzLl9idWlsZFZlcnRleEZvcm1hdChncmFwaGljc0RldmljZSwgdGhpcy50ZXJyYWluLnBhdGNoVmVydGljZXMpO1xyXG4gICAgICAgIHRoaXMuX3NoYXJlZFZlcnRleEJ1ZmZlcj8uZGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMuX3NoYXJlZFZlcnRleEJ1ZmZlciA9IG5ldyBwYy5WZXJ0ZXhCdWZmZXIoZ3JhcGhpY3NEZXZpY2UsIGZvcm1hdCwgZm9ybWF0LnZlcnRleENvdW50LCB7XHJcbiAgICAgICAgICAgIHVzYWdlOiBwYy5CVUZGRVJfU1RBVElDLFxyXG4gICAgICAgICAgICBzdG9yYWdlOiBmYWxzZSxcclxuICAgICAgICAgICAgZGF0YTogdGhpcy50ZXJyYWluLnBhdGNoVmVydGljZXMucGF0Y2hWZXJ0ZXhCdWZmZXJEYXRhLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXRIZWlnaHRNYXBUZXh0dXJlKGFwcDogcGN4LkFwcEJhc2UpIHtcclxuXHJcbiAgICAgICAgdGhpcy5faGVpZ2h0TWFwPy5kZXN0cm95KCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGRhdGFDaHVua1NpemUgPSB0aGlzLnRlcnJhaW4uaGVpZ2h0TWFwLmRhdGFDaHVua1NpemU7XHJcbiAgICAgICAgY29uc3QgY2h1bmtzICAgICAgICA9IHRoaXMudGVycmFpbi5oZWlnaHRNYXAuZ2V0Q2h1bmtzQnVmZmVycyhVaW50OEFycmF5KTtcclxuXHJcbiAgICAgICAgdGhpcy5faGVpZ2h0TWFwID0gbmV3IHBjLlRleHR1cmUoYXBwLmdyYXBoaWNzRGV2aWNlLCB7XHJcbiAgICAgICAgICAgIHdpZHRoOiBkYXRhQ2h1bmtTaXplLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IGRhdGFDaHVua1NpemUsXHJcbiAgICAgICAgICAgIGZvcm1hdDogcGMuUElYRUxGT1JNQVRfUkdCQTgsXHJcbiAgICAgICAgICAgIG1pcG1hcHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBtaW5GaWx0ZXI6IHBjLkZJTFRFUl9MSU5FQVIsXHJcbiAgICAgICAgICAgIG1hZ0ZpbHRlcjogcGMuRklMVEVSX0xJTkVBUixcclxuICAgICAgICAgICAgYWRkcmVzc1U6IHBjLkFERFJFU1NfQ0xBTVBfVE9fRURHRSxcclxuICAgICAgICAgICAgYWRkcmVzc1Y6IHBjLkFERFJFU1NfQ0xBTVBfVE9fRURHRSxcclxuICAgICAgICAgICAgYWRkcmVzc1c6IHBjLkFERFJFU1NfQ0xBTVBfVE9fRURHRSxcclxuICAgICAgICAgICAgZmxpcFk6IGFwcC5ncmFwaGljc0RldmljZS5pc1dlYkdQVSxcclxuICAgICAgICAgICAgYXJyYXlMZW5ndGg6IGNodW5rcy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGxldmVsczogW2NodW5rc11cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgdXBkYXRlSW5kZXhCdWZmZXIoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuX3VwZGF0ZUluZGV4QnVmZmVyKHRoaXMuX2FwcC5ncmFwaGljc0RldmljZSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNpbmcuZW5hYmxlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZU1lc2hlcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLm1lc2hJbnN0YW5jZUFycmF5KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1lc2guaW5kZXhCdWZmZXJbMF0gPSB0aGlzLl9zaGFyZWRJbmRleEJ1ZmZlcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9iaW5kRGVwZW5kZW5jaWVzVG9NYXRlcmlhbChtYXRlcmlhbDogcGN4LlN0YW5kYXJkTWF0ZXJpYWwpIHtcclxuXHJcbiAgICAgICAgbWF0ZXJpYWwuc2V0QXR0cmlidXRlKHBhdGNoSW5zdENvb3JkT2Zmc2V0UGFyYW1OYW1lLCBwYy5TRU1BTlRJQ19BVFRSMTApO1xyXG4gICAgICAgIG1hdGVyaWFsLnNldEF0dHJpYnV0ZSh2ZXJ0ZXhDb29yZEF0dHJOYW1lLCBwYy5TRU1BTlRJQ19QT1NJVElPTik7XHJcbiAgICAgICAgbWF0ZXJpYWwuc2V0UGFyYW1ldGVyKGxvZENvcmVQYXJhbU5hbWUsIDApO1xyXG4gICAgICAgIG1hdGVyaWFsLnNldFBhcmFtZXRlcihwYXRjaENvb3JkT2Zmc2V0UGFyYW1OYW1lLCBbMCwgMF0pO1xyXG4gICAgICAgIG1hdGVyaWFsLnNldFBhcmFtZXRlcih0ZXJyYWluSGVpZ2h0TWFwUGFyYW1OYW1lLCB0aGlzLl9oZWlnaHRNYXApO1xyXG4gICAgICAgIG1hdGVyaWFsLnNldFBhcmFtZXRlcih0ZXJyYWluSGVpZ2h0TWFwQ2h1bmtTaXplUGFyYW1OYW1lLCB0aGlzLl9oZWlnaHRNYXAud2lkdGgpO1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBjaGVjayBzdXBwb3J0IGZsb2F0MzIgdGV4dHVyZVxyXG4gICAgICAgIGxldCBobUZvcm1hdDogVEhlaWdodE1hcEZvcm1hdCA9ICdyZ2JhJztcclxuXHJcbiAgICAgICAgaWYgKHRoaXMudGVycmFpbi5oZWlnaHRNYXAgaW5zdGFuY2VvZiBDb21wcmVzc2VkUGF0Y2hlZEhlaWdodE1hcCkge1xyXG4gICAgICAgICAgICBobUZvcm1hdCA9IHRoaXMudGVycmFpbi5oZWlnaHRNYXAuY29tcHJlc3NBbGdvcml0bSA9PT0gJ3g0JyA/ICdyZ2JhWDQnIDogJ3JnYmFYMic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IGNodW5rc1N0b3JlID0gZ2V0VGVycmFpblNoYWRlckNodW5rcyh7XHJcbiAgICAgICAgICAgIGluc3RhbmNpbmc6IHRoaXMuaW5zdGFuY2luZy5lbmFibGVkLFxyXG4gICAgICAgICAgICBoZWlnaHRNYXBGb3JtYXQ6IGhtRm9ybWF0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IGNodW5rTmFtZXMgPSBPYmplY3Qua2V5cyhjaHVua3NTdG9yZSk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGNodW5rTmFtZSBvZiBjaHVua05hbWVzKSB7XHJcbiAgICAgICAgICAgIG1hdGVyaWFsLmNodW5rc1tjaHVua05hbWVdID0gY2h1bmtzU3RvcmVbY2h1bmtOYW1lXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbWF0ZXJpYWwuY2h1bmtzLkFQSVZlcnNpb24gPSBwYy5DSFVOS0FQSV8xXzcwO1xyXG4gICAgICAgIG1hdGVyaWFsLnVwZGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvdmVycmlkZSB1cGRhdGVNYXRlcmlhbChtYXRlcmlhbDogcGN4LlN0YW5kYXJkTWF0ZXJpYWwpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9iaW5kRGVwZW5kZW5jaWVzVG9NYXRlcmlhbChtYXRlcmlhbCk7XHJcbiAgICAgICAgc3VwZXIudXBkYXRlTWF0ZXJpYWwobWF0ZXJpYWwpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbml0KGFwcDogcGN4LkFwcEJhc2UsIGVudGl0eTogcGN4LkVudGl0eSwgbWF0ZXJpYWw6IHBjeC5TdGFuZGFyZE1hdGVyaWFsKSB7XHJcbiAgICAgICAgdGhpcy5faW5pdEhlaWdodE1hcFRleHR1cmUoYXBwKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVJbmRleEJ1ZmZlcihhcHAuZ3JhcGhpY3NEZXZpY2UpO1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZVZlcnRleEJ1ZmZlcihhcHAuZ3JhcGhpY3NEZXZpY2UpO1xyXG4gICAgICAgIHN1cGVyLmluaXQoYXBwLCBlbnRpdHksIG1hdGVyaWFsKTtcclxuICAgIH1cclxufSIsImltcG9ydCB7IGludCB9IGZyb20gXCIuLi9TaGFyZWQvVHlwZXMubWpzXCI7XHJcbmltcG9ydCB7IElGcnVzdHVtLCBJR3JpZFBhdGNoUmVuZGVyUHJlcGFyZXIgfSBmcm9tIFwiLi4vVGVycmFpblN5c3RlbS9HZW9taXBHcmlkUmVuZGVyUHJlcGFyZXIubWpzXCI7XHJcbmltcG9ydCB7IElQYXRjaExvZCB9IGZyb20gXCIuLi9UZXJyYWluU3lzdGVtL0xvZE1hbmFnZXIubWpzXCI7XHJcbmltcG9ydCBUZXJyYWluUGF0Y2hlc0Jhc2ljLCB7IFRlcnJhaW5QYXRjaEJ1ZmZlckJhc2ljIH0gZnJvbSBcIi4vVGVycmFpblBhdGNoZXNCYXNpYy5tanNcIjtcclxuaW1wb3J0IHsgbG9kQ29yZVBhcmFtTmFtZSB9IGZyb20gXCIuL1RlcnJhaW5QYXRjaGVzU2hhZGVyQ2h1bmtzLm1qc1wiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJUmVuZGVyT3B0aW9ucyB7XHJcbiAgICB3aXJlZnJhbWU/OiBib29sZWFuLFxyXG4gICAgY2FzdFNoYWRvdz86IGJvb2xlYW4sXHJcbiAgICByZWNlaXZlU2hhZG93PzogYm9vbGVhbixcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVycmFpblJlbmRlclByZXBhcmVyIGltcGxlbWVudHMgSUdyaWRQYXRjaFJlbmRlclByZXBhcmVyIHtcclxuXHJcbiAgICBwcml2YXRlIF93aXJlZnJhbWU6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIF9jYXN0U2hhZG93OiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBfcmVjZWl2ZVNoYWRvdzogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgX2hhc1VwZGF0ZWRIZWlnaHRzOiBib29sZWFuO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgd2lyZWZyYW1lKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fd2lyZWZyYW1lOyB9XHJcbiAgICBwdWJsaWMgc2V0IHdpcmVmcmFtZSh2OiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5fd2lyZWZyYW1lID0gdjtcclxuICAgICAgICB0aGlzLl91cGRhdGVNZXNoZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGNhc3RTaGFkb3coKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9jYXN0U2hhZG93OyB9XHJcbiAgICBwdWJsaWMgc2V0IGNhc3RTaGFkb3codjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuX2Nhc3RTaGFkb3cgPSB2O1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZU1lc2hlcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgcmVjZWl2ZVNoYWRvdygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3JlY2VpdmVTaGFkb3c7IH1cclxuICAgIHB1YmxpYyBzZXQgcmVjZWl2ZVNoYWRvdyh2OiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5fcmVjZWl2ZVNoYWRvdyA9IHY7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlTWVzaGVzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVhZG9ubHkgcGF0Y2hlc1N0b3JlOiBUZXJyYWluUGF0Y2hlc0Jhc2ljPFRlcnJhaW5QYXRjaEJ1ZmZlckJhc2ljPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwYXRjaGVzU3RvcmU6IFRlcnJhaW5QYXRjaGVzQmFzaWM8VGVycmFpblBhdGNoQnVmZmVyQmFzaWM+LCBvcHRpb25zOiBJUmVuZGVyT3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMucGF0Y2hlc1N0b3JlID0gcGF0Y2hlc1N0b3JlO1xyXG4gICAgICAgIHRoaXMuX3dpcmVmcmFtZSA9IG9wdGlvbnMud2lyZWZyYW1lID8/IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2Nhc3RTaGFkb3cgPSBvcHRpb25zLmNhc3RTaGFkb3cgPz8gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9yZWNlaXZlU2hhZG93ID0gb3B0aW9ucy5yZWNlaXZlU2hhZG93ID8/IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2hhc1VwZGF0ZWRIZWlnaHRzID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIF91cGRhdGVNZXNoZXMoKSB7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgbWVzaEluc3RhbmNlIG9mIHRoaXMucGF0Y2hlc1N0b3JlLm1lc2hJbnN0YW5jZUFycmF5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZU1lc2gobWVzaEluc3RhbmNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucGF0Y2hlc1N0b3JlLmluc3RhbmNpbmcuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlTWVzaChpdGVtLm9iamVjdCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIF91cGRhdGVNZXNoKG1lc2hJbnN0YW5jZT86IHBjeC5NZXNoSW5zdGFuY2UgfCBudWxsKSB7XHJcbiAgICAgICAgaWYgKG1lc2hJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICBtZXNoSW5zdGFuY2UubWVzaC5wcmltaXRpdmVbMF0udHlwZSA9IHRoaXMuX3dpcmVmcmFtZSA/IHBjLlBSSU1JVElWRV9MSU5FUyA6IHBjLlBSSU1JVElWRV9UUklBTkdMRVM7XHJcbiAgICAgICAgICAgIG1lc2hJbnN0YW5jZS5jYXN0U2hhZG93ID0gdGhpcy5fY2FzdFNoYWRvdztcclxuICAgICAgICAgICAgbWVzaEluc3RhbmNlLnJlY2VpdmVTaGFkb3cgPSB0aGlzLl9yZWNlaXZlU2hhZG93O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcHJlcGFyZVBhdGNoKHZpc2libGU6IGJvb2xlYW4sIGJhc2VJbmRleDogaW50LCBiYXNlVmVydGV4OiBpbnQsIGNvdW50OiBpbnQsIHBhdGNoWDogaW50LCBwYXRjaFo6IGludCwgbWluWDogaW50LCBtaW5aOiBpbnQsIHNpemU6IGludCwgbG9kSW5mbzogUmVhZG9ubHk8SVBhdGNoTG9kPikge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IHRlcnJhaW4gPSB0aGlzLnBhdGNoZXNTdG9yZS50ZXJyYWluO1xyXG4gICAgICAgIGNvbnN0IHBhdGNoSW5kZXggPSBwYXRjaFogKiB0ZXJyYWluLm51bVBhdGNoZXNYICsgcGF0Y2hYO1xyXG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMucGF0Y2hlc1N0b3JlLmJ1ZmZlckFycmF5W3BhdGNoSW5kZXhdO1xyXG4gICAgICAgIGNvbnN0IGN1cnJIYXNoID0gYmFzZUluZGV4IC8gY291bnQ7XHJcblxyXG4gICAgICAgIGJ1ZmZlci5oYXNoICAgICAgICAgICAgICA9IGN1cnJIYXNoO1xyXG4gICAgICAgIGJ1ZmZlci52aXNpYmxlICAgICAgICAgICA9IHZpc2libGU7XHJcbiAgICAgICAgYnVmZmVyLmluZGljZXNCYXNlSW5kZXggID0gYmFzZUluZGV4O1xyXG4gICAgICAgIGJ1ZmZlci5pbmRpY2VzQmFzZVZlcnRleCA9IGJhc2VWZXJ0ZXg7XHJcbiAgICAgICAgYnVmZmVyLmluZGljZXNDb3VudCAgICAgID0gY291bnQ7XHJcbiAgICAgICAgYnVmZmVyLmxvZCAgICAgICAgICAgICAgID0gbG9kSW5mbztcclxuXHJcbiAgICAgICAgaWYgKGJ1ZmZlci5oZWlnaHRzVXBkYXRlZCkge1xyXG4gICAgICAgICAgICBidWZmZXIuaGVpZ2h0c1VwZGF0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgYnVmZmVyLmhlaWdodHNVcGRhdGVkVGhpc0ZyYW1lID0gdmlzaWJsZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2hhc1VwZGF0ZWRIZWlnaHRzID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnBhdGNoZXNTdG9yZS5pbnN0YW5jaW5nLmVuYWJsZWQpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh2aXNpYmxlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5zdCA9IHRoaXMucGF0Y2hlc1N0b3JlLmluc3RhbmNpbmcuaW5jcmVtZW50KGxvZEluZm8sIG1pblgsIG1pblopO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoaW5zdC5vYmplY3QpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVzaEluc3RhbmNlID0gaW5zdC5vYmplY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJpbWl0aXZlID0gbWVzaEluc3RhbmNlLm1lc2gucHJpbWl0aXZlWzBdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBtZXNoSW5zdGFuY2UudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzaEluc3RhbmNlLnZpc2libGVUaGlzRnJhbWUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc2hJbnN0YW5jZS5jYXN0U2hhZG93ID0gdGhpcy5fY2FzdFNoYWRvdztcclxuICAgICAgICAgICAgICAgICAgICBtZXNoSW5zdGFuY2UucmVjZWl2ZVNoYWRvdyA9IHRoaXMuX3JlY2VpdmVTaGFkb3c7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHByaW1pdGl2ZS50eXBlID0gdGhpcy5fd2lyZWZyYW1lID8gcGMuUFJJTUlUSVZFX0xJTkVTIDogcGMuUFJJTUlUSVZFX1RSSUFOR0xFUztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbWVzaEluc3RhbmNlID0gdGhpcy5wYXRjaGVzU3RvcmUuY3JlYXRlT3JHZXRQYXRjaE1lc2gocGF0Y2hJbmRleCk7XHJcbiAgICAgICAgY29uc3QgbWVzaCA9IG1lc2hJbnN0YW5jZS5tZXNoO1xyXG4gICAgICAgIGNvbnN0IHByaW1pdGl2ZSA9IG1lc2gucHJpbWl0aXZlWzBdO1xyXG5cclxuICAgICAgICBpZiAobWVzaEluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIG1lc2hJbnN0YW5jZS52aXNpYmxlID0gdmlzaWJsZTtcclxuICAgICAgICAgICAgbWVzaEluc3RhbmNlLnZpc2libGVUaGlzRnJhbWUgPSB2aXNpYmxlO1xyXG5cclxuICAgICAgICAgICAgbWVzaEluc3RhbmNlLmNhc3RTaGFkb3cgICAgPSB0aGlzLl9jYXN0U2hhZG93O1xyXG4gICAgICAgICAgICBtZXNoSW5zdGFuY2UucmVjZWl2ZVNoYWRvdyA9IHRoaXMuX3JlY2VpdmVTaGFkb3c7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcmltaXRpdmUuYmFzZSAgPSBiYXNlSW5kZXg7XHJcbiAgICAgICAgcHJpbWl0aXZlLmNvdW50ID0gY291bnQ7XHJcbiAgICAgICAgcHJpbWl0aXZlLnR5cGUgID0gdGhpcy5fd2lyZWZyYW1lID8gcGMuUFJJTUlUSVZFX0xJTkVTIDogcGMuUFJJTUlUSVZFX1RSSUFOR0xFUztcclxuICAgICAgICBcclxuICAgICAgICBtZXNoSW5zdGFuY2Uuc2V0UGFyYW1ldGVyKGxvZENvcmVQYXJhbU5hbWUsIGxvZEluZm8uY29yZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbmRlcihmcnVzdHVtPzogSUZydXN0dW0pIHtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogSW4gdGhlb3J5IHdlIGNhbiBjb250cm9sIHRoZSBxdWFsaXR5IG9mIHRoZSBtb2RlbCBmb3Igc2hhZG93c1xyXG4gICAgICAgIC8vIFRPRE86IEFkZCBzdXBwb3J0IGZvciBPY2NsdXNpb24gY3VsbGluZ1xyXG5cclxuICAgICAgICB0aGlzLl9oYXNVcGRhdGVkSGVpZ2h0cyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjb25zdCB1c2VJbnN0YW5jaW5nID0gdGhpcy5wYXRjaGVzU3RvcmUuaW5zdGFuY2luZy5lbmFibGVkO1xyXG5cclxuICAgICAgICBpZiAodXNlSW5zdGFuY2luZykge1xyXG4gICAgICAgICAgICB0aGlzLnBhdGNoZXNTdG9yZS5pbnN0YW5jaW5nLmJlZ2luKGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBhdGNoZXNTdG9yZS5zdGFydFJlbmRlcigpO1xyXG4gICAgICAgIHRoaXMucGF0Y2hlc1N0b3JlLnRlcnJhaW4uZWFjaFBhdGNoZXModGhpcywgZnJ1c3R1bSk7XHJcbiAgICAgICAgdGhpcy5wYXRjaGVzU3RvcmUuZW5kUmVuZGVyKHRoaXMuX2hhc1VwZGF0ZWRIZWlnaHRzKTtcclxuXHJcbiAgICAgICAgaWYgKHVzZUluc3RhbmNpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5wYXRjaGVzU3RvcmUuaW5zdGFuY2luZy5lbmQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJcbmNvbnN0IHRtcFZlYyA9IG5ldyBwYy5WZWMzKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBkcmF3RGlyZWN0aW9uVmVjdG9yKHBvc2l0aW9uOiBwY3guVmVjMywgZGlyOiBwY3guVmVjMywgY29sb3IgPSBwYy5Db2xvci5SRUQpIHtcblxuICAgIC8vIERyYXcgdGhlIHZlY3RvclxuICAgIGNvbnN0IHN0YXJ0ID0gcG9zaXRpb247XG4gICAgY29uc3QgZW5kID0gdG1wVmVjLmFkZDIocG9zaXRpb24sIGRpcik7XG4gICAgXG4gICAgcGMuYXBwIS5kcmF3TGluZShzdGFydCwgZW5kLCBjb2xvciwgZmFsc2UpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJhd1BvaW50KFxuICAgIHtjZW50ZXIsIHJhZGl1cyA9IDAuMSwgbnVtU2VnbWVudHMgPSA0LCBjb2xvciA9IHBjLkNvbG9yLlJFRCwgbGF5ZXIsIGRlcHRoVGVzdCA9IGZhbHNlIH06XG4gICAge2NlbnRlcjogcGN4LlZlYzMsIHJhZGl1cz86IG51bWJlciwgbnVtU2VnbWVudHM/OiBudW1iZXIsIGNvbG9yPzogcGN4LkNvbG9yLCBkZXB0aFRlc3Q/OiBib29sZWFuLCBsYXllcj86IHBjeC5MYXllcn1cbikge1xuICAgIGNvbnN0IHBvaW50cyA9IFtdO1xuICAgIGNvbnN0IHN0ZXAgPSAyICogTWF0aC5QSSAvIG51bVNlZ21lbnRzO1xuXG4gICAgbGV0IGFuZ2xlID0gMDtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtU2VnbWVudHM7IGkrKykge1xuXG4gICAgICAgIGNvbnN0IHNpbjAgPSBNYXRoLnNpbihhbmdsZSk7XG4gICAgICAgIGNvbnN0IGNvczAgPSBNYXRoLmNvcyhhbmdsZSk7XG5cbiAgICAgICAgYW5nbGUgKz0gc3RlcDtcblxuICAgICAgICBjb25zdCBzaW4xID0gTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICBjb25zdCBjb3MxID0gTWF0aC5jb3MoYW5nbGUpO1xuXG4gICAgICAgIHBvaW50cy5wdXNoKFxuICAgICAgICAgICAgY2VudGVyLnggKyByYWRpdXMgKiBzaW4wLCBjZW50ZXIueSwgY2VudGVyLnogKyByYWRpdXMgKiBjb3MwLFxuICAgICAgICAgICAgY2VudGVyLnggKyByYWRpdXMgKiBzaW4xLCBjZW50ZXIueSwgY2VudGVyLnogKyByYWRpdXMgKiBjb3MxXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBwb2ludHMucHVzaChcbiAgICAgICAgICAgIGNlbnRlci54LCBjZW50ZXIueSArIHJhZGl1cyAqIHNpbjAsIGNlbnRlci56ICsgcmFkaXVzICogY29zMCxcbiAgICAgICAgICAgIGNlbnRlci54LCBjZW50ZXIueSArIHJhZGl1cyAqIHNpbjEsIGNlbnRlci56ICsgcmFkaXVzICogY29zMVxuICAgICAgICApO1xuXG4gICAgICAgIHBvaW50cy5wdXNoKFxuICAgICAgICAgICAgY2VudGVyLnggKyByYWRpdXMgKiBjb3MwLCBjZW50ZXIueSArIHJhZGl1cyAqIHNpbjAsIGNlbnRlci56LFxuICAgICAgICAgICAgY2VudGVyLnggKyByYWRpdXMgKiBjb3MxLCBjZW50ZXIueSArIHJhZGl1cyAqIHNpbjEsIGNlbnRlci56XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcGMuYXBwIS5kcmF3TGluZUFycmF5cyhwb2ludHMsIGNvbG9yLCBkZXB0aFRlc3QsIGxheWVyKTtcbn0iLCJpbXBvcnQgeyBjYWxjTmV4dFBvd2VyT2ZUd28sIHJhbmRvbUZsb2F0UmFuZ2UgfSBmcm9tIFwiLi4vU2hhcmVkL1V0aWxzLm1qc1wiO1xuaW1wb3J0IHsgaW50LCBmbG9hdCB9IGZyb20gXCIuLi9TaGFyZWQvVHlwZXMubWpzXCI7XG5pbXBvcnQgQmFzZVRlcnJhaW4gZnJvbSBcIi4vVGVycmFpbi5tanNcIjtcblxuZXhwb3J0IGNsYXNzIE1pZHBvaW50RGlzcFRlcnJhaW4gZXh0ZW5kcyBCYXNlVGVycmFpbiB7XG5cbiAgICBwdWJsaWMgY3JlYXRlTWlkcG9pbnREaXNwbGFjZW1lbnQocm91Z2huZXNzOiBmbG9hdCk6IHZvaWQge1xuXG4gICAgICAgIGlmIChyb3VnaG5lc3MgPCAwLjApIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwicm91Z2huZXNzIG11c3QgYmUgcG9zaXRpdmVcIik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jcmVhdGVNaWRwb2ludERpc3BsYWNlbWVudEYzMihyb3VnaG5lc3MpO1xuICAgICAgICB0aGlzLm5vcm1hbGl6ZUhlaWdodE1hcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2NyZWF0ZU1pZHBvaW50RGlzcGxhY2VtZW50RjMyKHJvdWdobmVzczogZmxvYXQpOiB2b2lkIHtcblxuICAgICAgICBsZXQgcmVjdFNpemUgID0gY2FsY05leHRQb3dlck9mVHdvKHRoaXMud2lkdGgpO1xuICAgICAgICBsZXQgY3VySGVpZ2h0ID0gcmVjdFNpemUgLyAyLjA7XG5cbiAgICAgICAgY29uc3QgaGVpZ2h0UmVkdWNlID0gTWF0aC5wb3coMi4wLCAtcm91Z2huZXNzKTtcbiAgICBcbiAgICAgICAgd2hpbGUgKHJlY3RTaXplID4gMCkge1xuXG4gICAgICAgICAgICB0aGlzLl9kaWFtb25kU3RlcChyZWN0U2l6ZSwgY3VySGVpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMuX3NxdWFyZVN0ZXAocmVjdFNpemUsIGN1ckhlaWdodCk7XG5cbiAgICAgICAgICAgIHJlY3RTaXplID0gKHJlY3RTaXplIC8gMikgfCAwO1xuICAgICAgICAgICAgY3VySGVpZ2h0ICo9IGhlaWdodFJlZHVjZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX2RpYW1vbmRTdGVwKHJlY3RTaXplOiBpbnQsIGN1ckhlaWdodDogZmxvYXQpOiB2b2lkIHtcblxuICAgICAgICBjb25zdCBIYWxmUmVjdFNpemUgPSBNYXRoLmZsb29yKHJlY3RTaXplIC8gMik7XG5cbiAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLmRlcHRoOyB5ICs9IHJlY3RTaXplKSB7XG5cbiAgICAgICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCArPSByZWN0U2l6ZSkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCBuZXh0WCA9ICh4ICsgcmVjdFNpemUpICUgdGhpcy53aWR0aDtcbiAgICAgICAgICAgICAgICBsZXQgbmV4dFkgPSAoeSArIHJlY3RTaXplKSAlIHRoaXMuZGVwdGg7XG4gICAgXG4gICAgICAgICAgICAgICAgaWYgKG5leHRYIDwgeCkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0WCA9IHRoaXMud2lkdGggLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgICAgICBpZiAobmV4dFkgPCB5KSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHRZID0gdGhpcy5kZXB0aCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgICAgIGNvbnN0IHRvcExlZnQgICAgID0gdGhpcy5oZWlnaHRNYXAuZ2V0KHgsIHkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvcFJpZ2h0ICAgID0gdGhpcy5oZWlnaHRNYXAuZ2V0KG5leHRYLCB5KTtcbiAgICAgICAgICAgICAgICBjb25zdCBib3R0b21MZWZ0ICA9IHRoaXMuaGVpZ2h0TWFwLmdldCh4LCBuZXh0WSk7XG4gICAgICAgICAgICAgICAgY29uc3QgYm90dG9tUmlnaHQgPSB0aGlzLmhlaWdodE1hcC5nZXQobmV4dFgsIG5leHRZKTtcbiAgICBcbiAgICAgICAgICAgICAgICBjb25zdCBtaWRYID0gKHggKyBIYWxmUmVjdFNpemUpICUgdGhpcy53aWR0aDtcbiAgICAgICAgICAgICAgICBjb25zdCBtaWRZID0gKHkgKyBIYWxmUmVjdFNpemUpICUgdGhpcy5kZXB0aDtcbiAgICBcbiAgICAgICAgICAgICAgICBjb25zdCByYW5kVmFsdWUgPSByYW5kb21GbG9hdFJhbmdlKGN1ckhlaWdodCwgLWN1ckhlaWdodCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbWlkUG9pbnQgPSAodG9wTGVmdCArIHRvcFJpZ2h0ICsgYm90dG9tTGVmdCArIGJvdHRvbVJpZ2h0KSAvIDQuMDtcbiAgICBcbiAgICAgICAgICAgICAgICB0aGlzLnNldEhlaWdodChtaWRYLCBtaWRZLCBtaWRQb2ludCArIHJhbmRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9zcXVhcmVTdGVwKHJlY3RTaXplOiBpbnQsIGN1ckhlaWdodDogZmxvYXQpOiB2b2lkIHtcblxuICAgICAgICBjb25zdCBoYWxmUmVjdFNpemUgPSAocmVjdFNpemUgLyAyKSB8IDA7XG5cbiAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLmRlcHRoOyB5ICs9IHJlY3RTaXplKSB7XG5cbiAgICAgICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCArPSByZWN0U2l6ZSkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCBuZXh0WCA9ICh4ICsgcmVjdFNpemUpICUgdGhpcy53aWR0aDtcbiAgICAgICAgICAgICAgICBsZXQgbmV4dFkgPSAoeSArIHJlY3RTaXplKSAlIHRoaXMuZGVwdGg7XG4gICAgXG4gICAgICAgICAgICAgICAgaWYgKG5leHRYIDwgeCkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0WCA9IHRoaXMud2lkdGggLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgICAgICBpZiAobmV4dFkgPCB5KSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHRZID0gdGhpcy5kZXB0aCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgICAgIGNvbnN0IG1pZFggPSAoeCArIGhhbGZSZWN0U2l6ZSkgJSB0aGlzLndpZHRoO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1pZFkgPSAoeSArIGhhbGZSZWN0U2l6ZSkgJSB0aGlzLmRlcHRoO1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc3QgcHJldk1pZFggPSAoeCAtIGhhbGZSZWN0U2l6ZSArIHRoaXMud2lkdGgpICUgdGhpcy53aWR0aDtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2TWlkWSA9ICh5IC0gaGFsZlJlY3RTaXplICsgdGhpcy5kZXB0aCkgJSB0aGlzLmRlcHRoO1xuICAgIFxuICAgICAgICAgICAgICAgIGNvbnN0IGN1clRvcExlZnQgID0gdGhpcy5oZWlnaHRNYXAuZ2V0KHgsIHkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1clRvcFJpZ2h0ID0gdGhpcy5oZWlnaHRNYXAuZ2V0KG5leHRYLCB5KTtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJDZW50ZXIgICA9IHRoaXMuaGVpZ2h0TWFwLmdldChtaWRYLCBtaWRZKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2WUNlbnRlciA9IHRoaXMuaGVpZ2h0TWFwLmdldChtaWRYLCBwcmV2TWlkWSk7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VyQm90TGVmdCAgPSB0aGlzLmhlaWdodE1hcC5nZXQoeCwgbmV4dFkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZYQ2VudGVyID0gdGhpcy5oZWlnaHRNYXAuZ2V0KHByZXZNaWRYLCBtaWRZKTtcbiAgICBcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJMZWZ0TWlkID0gKGN1clRvcExlZnQgKyBjdXJDZW50ZXIgKyBjdXJCb3RMZWZ0ICsgcHJldlhDZW50ZXIpIC8gNC4wICsgcmFuZG9tRmxvYXRSYW5nZSgtY3VySGVpZ2h0LCBjdXJIZWlnaHQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1clRvcE1pZCAgPSAoY3VyVG9wTGVmdCArIGN1ckNlbnRlciArIGN1clRvcFJpZ2h0ICsgcHJldllDZW50ZXIpIC8gNC4wICsgcmFuZG9tRmxvYXRSYW5nZSgtY3VySGVpZ2h0LCBjdXJIZWlnaHQpO1xuICAgIFxuICAgICAgICAgICAgICAgIHRoaXMuc2V0SGVpZ2h0KG1pZFgsIHksIGN1clRvcE1pZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRIZWlnaHQoeCwgbWlkWSwgY3VyTGVmdE1pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59IiwiZXhwb3J0IGNsYXNzIFRlcnJhaW5SYXljYXN0UmVzdWx0IHtcblxuICAgIHB1YmxpYyB2ZXJ0ZXhJbmRleCA9IDA7XG4gICAgcHVibGljIGRpc3RhbmNlICAgID0gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICBwdWJsaWMgbG9jYWxOb3JtYWwgPSBuZXcgcGMuVmVjMygwLCAxLCAwKTtcbiAgICBwdWJsaWMgbm9ybWFsICAgICAgPSBuZXcgcGMuVmVjMygwLCAxLCAwKTtcbiAgICBwdWJsaWMgbG9jYWxQb2ludCAgPSBuZXcgcGMuVmVjMyhOdW1iZXIuTUFYX1ZBTFVFLCBOdW1iZXIuTUFYX1ZBTFVFLCBOdW1iZXIuTUFYX1ZBTFVFKTtcbiAgICBwdWJsaWMgcG9pbnQgICAgICAgPSBuZXcgcGMuVmVjMyhOdW1iZXIuTUFYX1ZBTFVFLCBOdW1iZXIuTUFYX1ZBTFVFLCBOdW1iZXIuTUFYX1ZBTFVFKTtcblxuICAgIHB1YmxpYyBjbGVhcigpIHtcbiAgICAgICAgdGhpcy52ZXJ0ZXhJbmRleCA9IDA7XG4gICAgICAgIHRoaXMuZGlzdGFuY2UgPSBOdW1iZXIuTUFYX1ZBTFVFO1xuICAgICAgICB0aGlzLmxvY2FsTm9ybWFsLnNldCgwLCAxLCAwKTtcbiAgICAgICAgdGhpcy5ub3JtYWwuc2V0KDAsIDEsIDApO1xuICAgICAgICB0aGlzLmxvY2FsUG9pbnQuc2V0KE51bWJlci5NQVhfVkFMVUUsIE51bWJlci5NQVhfVkFMVUUsIE51bWJlci5NQVhfVkFMVUUpO1xuICAgICAgICB0aGlzLnBvaW50LnNldChOdW1iZXIuTUFYX1ZBTFVFLCBOdW1iZXIuTUFYX1ZBTFVFLCBOdW1iZXIuTUFYX1ZBTFVFKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRlcnJhaW5SYXljYXN0UmVzdWx0OyIsImltcG9ydCB0eXBlIHsgaW50IH0gZnJvbSBcIi4uL1NoYXJlZC9UeXBlcy5tanNcIjtcblxuY29uc3QgdG1wVHJpVmVjQSA9IG5ldyBwYy5WZWMzKCk7XG5jb25zdCB0bXBUcmlWZWNCID0gbmV3IHBjLlZlYzMoKTtcblxuZXhwb3J0IGNsYXNzIFRyaWFuZ2xlIGV4dGVuZHMgcGMuVHJpIHtcblxuICAgIGluZGV4MDogaW50O1xuICAgIGluZGV4MTogaW50O1xuICAgIGluZGV4MjogaW50O1xuXG4gICAgZ2V0Tm9ybWFsKHJzaDogcGN4LlZlYzMpIHtcbiAgICAgICAgdG1wVHJpVmVjQS5zdWIyKHRoaXMudjEsIHRoaXMudjApO1xuICAgICAgICB0bXBUcmlWZWNCLnN1YjIodGhpcy52MiwgdGhpcy52MCk7XG4gICAgICAgIHJzaC5jcm9zcyh0bXBUcmlWZWNBLCB0bXBUcmlWZWNCKS5ub3JtYWxpemUoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRyaWFuZ2xlOyIsImltcG9ydCB7IGZsb2F0LCBpbnQsIElWZWN0b3IzLCBSZWZPYmplY3QgfSBmcm9tIFwiLi4vU2hhcmVkL1R5cGVzLm1qc1wiO1xyXG5pbXBvcnQgeyBJUmVhZG9ubHlBYnNQYXRjaGVkSGVpZ2h0TWFwIH0gZnJvbSBcIi4vQWJzUGF0Y2hlZEhlaWdodE1hcC5tanNcIjtcclxuaW1wb3J0IHsgSVpvbmUgfSBmcm9tIFwiLi9JWm9uZS5tanNcIjtcclxuaW1wb3J0IFRlcnJhaW5SYXljYXN0UmVzdWx0IGZyb20gXCIuL1RlcnJhaW5SYXljYXN0UmVzdWx0Lm1qc1wiO1xyXG5pbXBvcnQgVHJpYW5nbGUgZnJvbSBcIi4vVHJpYW5nbGUubWpzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElDb29yZFhaIHtcclxuICAgIHg6IGludCxcclxuICAgIHo6IGludCxcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJR3JpZFJheWNhc3RTdGF0ZSB7XHJcbiAgICB4OiBpbnQsXHJcbiAgICB6OiBpbnQsXHJcbiAgICBwYXJhbTogaW50LFxyXG4gICAgcHJldlg6IGludCxcclxuICAgIHByZXZaOiBpbnQsXHJcbiAgICBwcmV2UGFyYW06IGludCxcclxuICAgIG1heERpc3RhbmNlRmxhdDogZmxvYXQsXHJcbn1cclxuXHJcbmNvbnN0IGluZmluaXRlICAgICAgICA9IDk5OTk5OTk7XHJcbmNvbnN0IG1vZGVsVHJhbnNmb3JtICA9IG5ldyBwYy5NYXQ0KCk7XHJcbmNvbnN0IHRtcFJheSAgICAgICAgICA9IG5ldyBwYy5SYXkoKTtcclxuY29uc3QgdG1wUmF5Y2FzdFZlYyAgID0gbmV3IHBjLlZlYzMoKTtcclxuY29uc3QgdG1wUG9zMSAgICAgICAgID0gbmV3IHBjLlZlYzMoKTtcclxuY29uc3QgdG1wUG9zMiAgICAgICAgID0gbmV3IHBjLlZlYzMoKTtcclxuY29uc3QgdG1wUG9zMyAgICAgICAgID0gbmV3IHBjLlZlYzMoKTtcclxuXHJcbmNvbnN0IHRyaWFuZ2xlICAgICAgID0gbmV3IFRyaWFuZ2xlKCk7XHJcbmNvbnN0IGRlYnVnVG1wVmVjICAgID0gbmV3IHBjLlZlYzMoKTtcclxuY29uc3QgZGVidWdUcmFuc2Zvcm0gPSBuZXcgcGMuTWF0NCgpO1xyXG5jb25zdCBkZWJ1Z1Bvc2l0aW9ucyA9IG5ldyBBcnJheSgxNik7XHJcblxyXG5sZXQgZGVidWdUcmFuc2Zvcm1Jc0lkZW50aXR5ID0gdHJ1ZTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUFBQkIgZXh0ZW5kcyBJWm9uZSB7XHJcbiAgICBtaW5ZOiBmbG9hdCxcclxuICAgIG1heFk6IGZsb2F0LFxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWJ1Z0RyYXdUcmlhbmdsZUxpbmVzKHRyaTogcGN4LlRyaSwgY29sb3IgPSBwYy5Db2xvci5ZRUxMT1cpIHtcclxuICAgIC8qXHJcbiAgICBbXHJcbiAgICAgICAgdHJpLnYwLngsIHRyaS52MC55LCB0cmkudjAueiwgdHJpLnYxLngsIHRyaS52MS55LCB0cmkudjEueixcclxuICAgICAgICB0cmkudjEueCwgdHJpLnYxLnksIHRyaS52MS56LCB0cmkudjIueCwgdHJpLnYyLnksIHRyaS52Mi56LFxyXG4gICAgICAgIHRyaS52Mi54LCB0cmkudjIueSwgdHJpLnYyLnosIHRyaS52MC54LCB0cmkudjAueSwgdHJpLnYwLnosXHJcbiAgICBdLCBjb2xvciwgZmFsc2UpO1xyXG4gICAgXVxyXG4gICAgKi9cclxuICAgIGRlYnVnVHJhbnNmb3JtLnRyYW5zZm9ybVBvaW50KHRyaS52MCwgZGVidWdUbXBWZWMpO1xyXG4gICAgZGVidWdQb3NpdGlvbnNbMF0gPSBkZWJ1Z1Bvc2l0aW9uc1sxNV0gPSBkZWJ1Z1RtcFZlYy54O1xyXG4gICAgZGVidWdQb3NpdGlvbnNbMV0gPSBkZWJ1Z1Bvc2l0aW9uc1sxNl0gPSBkZWJ1Z1RtcFZlYy55O1xyXG4gICAgZGVidWdQb3NpdGlvbnNbMl0gPSBkZWJ1Z1Bvc2l0aW9uc1sxN10gPSBkZWJ1Z1RtcFZlYy56O1xyXG4gICAgZGVidWdUcmFuc2Zvcm0udHJhbnNmb3JtUG9pbnQodHJpLnYxLCBkZWJ1Z1RtcFZlYyk7XHJcbiAgICBkZWJ1Z1Bvc2l0aW9uc1szXSA9IGRlYnVnUG9zaXRpb25zWzZdID0gZGVidWdUbXBWZWMueDtcclxuICAgIGRlYnVnUG9zaXRpb25zWzRdID0gZGVidWdQb3NpdGlvbnNbN10gPSBkZWJ1Z1RtcFZlYy55O1xyXG4gICAgZGVidWdQb3NpdGlvbnNbNV0gPSBkZWJ1Z1Bvc2l0aW9uc1s4XSA9IGRlYnVnVG1wVmVjLno7XHJcbiAgICBkZWJ1Z1RyYW5zZm9ybS50cmFuc2Zvcm1Qb2ludCh0cmkudjIsIGRlYnVnVG1wVmVjKTtcclxuICAgIGRlYnVnUG9zaXRpb25zWzldICA9IGRlYnVnUG9zaXRpb25zWzEyXSA9IGRlYnVnVG1wVmVjLng7XHJcbiAgICBkZWJ1Z1Bvc2l0aW9uc1sxMF0gPSBkZWJ1Z1Bvc2l0aW9uc1sxM10gPSBkZWJ1Z1RtcFZlYy55O1xyXG4gICAgZGVidWdQb3NpdGlvbnNbMTFdID0gZGVidWdQb3NpdGlvbnNbMTRdID0gZGVidWdUbXBWZWMuejtcclxuICAgIHBjLmFwcD8uZHJhd0xpbmVBcnJheXMoZGVidWdQb3NpdGlvbnMsIGNvbG9yLCBmYWxzZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnNlY3RzUmF5Qm94KGFhYmI6IElBQUJCLCByYXk6IHBjeC5SYXkpIHtcclxuXHJcbiAgICBjb25zdCByYXlPcmlnaW4gICAgPSByYXkub3JpZ2luO1xyXG4gICAgY29uc3QgcmF5RGlyZWN0aW9uID0gcmF5LmRpcmVjdGlvbjtcclxuXHJcbiAgICBjb25zdCBtaW5YID0gYWFiYi5taW5YO1xyXG4gICAgY29uc3QgbWF4WCA9IGFhYmIubWF4WDtcclxuICAgIGNvbnN0IG1pblkgPSBhYWJiLm1pblk7XHJcbiAgICBjb25zdCBtYXhZID0gYWFiYi5tYXhZO1xyXG4gICAgY29uc3QgbWluWiA9IGFhYmIubWluWjtcclxuICAgIGNvbnN0IG1heFogPSBhYWJiLm1heFo7XHJcblxyXG4gICAgbGV0IHRtaW4gPSAobWluWCAtIHJheU9yaWdpbi54KSAvIHJheURpcmVjdGlvbi54O1xyXG4gICAgbGV0IHRtYXggPSAobWF4WCAtIHJheU9yaWdpbi54KSAvIHJheURpcmVjdGlvbi54O1xyXG5cclxuICAgIGlmICh0bWluID4gdG1heCkge1xyXG4gICAgICAgIGxldCB0ZW1wID0gdG1pbjtcclxuICAgICAgICB0bWluID0gdG1heDtcclxuICAgICAgICB0bWF4ID0gdGVtcDtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgdHltaW4gPSAobWluWSAtIHJheU9yaWdpbi55KSAvIHJheURpcmVjdGlvbi55O1xyXG4gICAgbGV0IHR5bWF4ID0gKG1heFkgLSByYXlPcmlnaW4ueSkgLyByYXlEaXJlY3Rpb24ueTtcclxuXHJcbiAgICBpZiAodHltaW4gPiB0eW1heCkge1xyXG4gICAgICAgIGxldCB0ZW1wID0gdHltaW47XHJcbiAgICAgICAgdHltaW4gPSB0eW1heDtcclxuICAgICAgICB0eW1heCA9IHRlbXA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCh0bWluID4gdHltYXgpIHx8ICh0eW1pbiA+IHRtYXgpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eW1pbiA+IHRtaW4pIHtcclxuICAgICAgICB0bWluID0gdHltaW47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5bWF4IDwgdG1heCkge1xyXG4gICAgICAgIHRtYXggPSB0eW1heDtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgdHptaW4gPSAobWluWiAtIHJheU9yaWdpbi56KSAvIHJheURpcmVjdGlvbi56O1xyXG4gICAgbGV0IHR6bWF4ID0gKG1heFogLSByYXlPcmlnaW4ueikgLyByYXlEaXJlY3Rpb24uejtcclxuXHJcbiAgICBpZiAodHptaW4gPiB0em1heCkge1xyXG4gICAgICAgIGxldCB0ZW1wID0gdHptaW47XHJcbiAgICAgICAgdHptaW4gPSB0em1heDtcclxuICAgICAgICB0em1heCA9IHRlbXA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCh0bWluID4gdHptYXgpIHx8ICh0em1pbiA+IHRtYXgpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIZWlnaHRmaWVsZFNoYXBlIHtcclxuXHJcbiAgICBwcml2YXRlIF9oZWlnaHRNYXA6IElSZWFkb25seUFic1BhdGNoZWRIZWlnaHRNYXA7XHJcbiAgICBwcml2YXRlIF9iZWdpblBvczogcGN4LlZlYzM7XHJcbiAgICBwcml2YXRlIF9lbmRQb3M6IHBjeC5WZWMzO1xyXG4gICAgcHJpdmF0ZSBfYm91bmRpbmdCb3g6IElBQUJCO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGhlaWdodE1hcDogSVJlYWRvbmx5QWJzUGF0Y2hlZEhlaWdodE1hcCkge1xyXG4gICAgICAgIHRoaXMuX2hlaWdodE1hcCA9IGhlaWdodE1hcDtcclxuICAgICAgICB0aGlzLl9iZWdpblBvcyA9IG5ldyBwYy5WZWMzKCk7XHJcbiAgICAgICAgdGhpcy5fZW5kUG9zID0gbmV3IHBjLlZlYzMoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUJvdW5kaW5nQm94KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZUJvdW5kaW5nQm94KCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IGhhbGZXaWR0aCA9IHRoaXMuX2hlaWdodE1hcC53aWR0aCAvIDI7XHJcbiAgICAgICAgY29uc3QgaGFsZkRlcHRoID0gdGhpcy5faGVpZ2h0TWFwLmRlcHRoIC8gMjtcclxuXHJcbiAgICAgICAgdGhpcy5fYm91bmRpbmdCb3ggPSB7XHJcbiAgICAgICAgICAgIG1pblg6IC1oYWxmV2lkdGgsXHJcbiAgICAgICAgICAgIG1pblk6IHRoaXMuX2hlaWdodE1hcC5taW5IZWlnaHQsXHJcbiAgICAgICAgICAgIG1pblo6IC1oYWxmRGVwdGgsXHJcbiAgICAgICAgICAgIG1heFg6IGhhbGZXaWR0aCxcclxuICAgICAgICAgICAgbWF4WTogdGhpcy5faGVpZ2h0TWFwLm1heEhlaWdodCxcclxuICAgICAgICAgICAgbWF4WjogaGFsZkRlcHRoLFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgX3RyaWFuZ2xlSW50ZXJzZWN0c1JheSh0cmk6IFRyaWFuZ2xlLCByYXk6IHBjeC5SYXksIGJlc3RSZXN1bHQ6IFRlcnJhaW5SYXljYXN0UmVzdWx0KTogYm9vbGVhbiB7XHJcblxyXG4gICAgICAgIGlmICh0cmkuaW50ZXJzZWN0c1JheShyYXksIHRtcFJheWNhc3RWZWMpKSB7XHJcbiAgICBcclxuICAgICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSB0bXBSYXljYXN0VmVjLmRpc3RhbmNlKHJheS5vcmlnaW4pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGJlc3RSZXN1bHQuZGlzdGFuY2UgPiBkaXN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgYmVzdFJlc3VsdC5kaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgICB0cmkuZ2V0Tm9ybWFsKGJlc3RSZXN1bHQubG9jYWxOb3JtYWwpO1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgICBiZXN0UmVzdWx0Lm5vcm1hbC5jb3B5KGJlc3RSZXN1bHQubG9jYWxOb3JtYWwpO1xyXG4gICAgICAgICAgICAgICAgYmVzdFJlc3VsdC5sb2NhbFBvaW50LmNvcHkodG1wUmF5Y2FzdFZlYyk7XHJcbiAgICAgICAgICAgICAgICBiZXN0UmVzdWx0LnBvaW50LmNvcHkodG1wUmF5Y2FzdFZlYyk7XHJcbiAgICBcclxuICAgICAgICAgICAgICAgIGRlYnVnRHJhd1RyaWFuZ2xlTGluZXModHJpLCBwYy5Db2xvci5SRUQpO1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgICBjb25zdCBkaXN0YW5jZVAwID0gYmVzdFJlc3VsdC5wb2ludC5kaXN0YW5jZSh0cmkudjApO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzdGFuY2VQMSA9IGJlc3RSZXN1bHQucG9pbnQuZGlzdGFuY2UodHJpLnYxKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RhbmNlUDIgPSBiZXN0UmVzdWx0LnBvaW50LmRpc3RhbmNlKHRyaS52Mik7XHJcbiAgICBcclxuICAgICAgICAgICAgICAgIGlmIChkaXN0YW5jZVAwID4gZGlzdGFuY2VQMSkge1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlUDEgPiBkaXN0YW5jZVAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3RSZXN1bHQudmVydGV4SW5kZXggPSB0cmkuaW5kZXgyO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmVzdFJlc3VsdC52ZXJ0ZXhJbmRleCA9IHRyaS5pbmRleDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlUDAgPiBkaXN0YW5jZVAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3RSZXN1bHQudmVydGV4SW5kZXggPSB0cmkuaW5kZXgyO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmVzdFJlc3VsdC52ZXJ0ZXhJbmRleCA9IHRyaS5pbmRleDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIC8vZGVidWdEcmF3VHJpYW5nbGVMaW5lcyh0cmkpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgX2Fzc2lnblBvc2l0aW9uKGluZGV4OiBpbnQsIGJ1ZjogUmVmT2JqZWN0PElWZWN0b3IzPikge1xyXG5cclxuICAgICAgICBjb25zdCB4ID0gaW5kZXggJSB0aGlzLl9oZWlnaHRNYXAud2lkdGggfCAwO1xyXG4gICAgICAgIGNvbnN0IHogPSBpbmRleCAvIHRoaXMuX2hlaWdodE1hcC53aWR0aCB8IDA7XHJcblxyXG4gICAgICAgIGJ1Zi54ID0gKC10aGlzLl9oZWlnaHRNYXAud2lkdGggLyAyKSArIHg7XHJcbiAgICAgICAgYnVmLnkgPSB0aGlzLl9oZWlnaHRNYXAuZ2V0KHgsIHopO1xyXG4gICAgICAgIGJ1Zi56ID0gKC10aGlzLl9oZWlnaHRNYXAuZGVwdGggLyAyKSArIHo7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIF9xdWFkQWN0aW9uKHJzOiBJR3JpZFJheWNhc3RTdGF0ZSwgcmF5OiBwY3guUmF5LCByZXN1bHQ6IFRlcnJhaW5SYXljYXN0UmVzdWx0KTogYm9vbGVhbiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHggPSBycy5wcmV2WDtcclxuICAgICAgICBjb25zdCB6ID0gcnMucHJldlo7XHJcblxyXG4gICAgICAgIGlmICh4IDwgMCB8fCB6IDwgMCB8fCB4ID49IHRoaXMuX2hlaWdodE1hcC53aWR0aCAtIDEgfHwgeiA+PSB0aGlzLl9oZWlnaHRNYXAuZGVwdGggLSAxKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcbiAgICAgICAgY29uc3QgeEZhbjIgPSB4ICUgMiA9PT0gMDtcclxuICAgICAgICBjb25zdCB6RmFuMiA9IHogJSAyID09PSAwO1xyXG5cclxuICAgICAgICBsZXQgaW5kZXgwLCBpbmRleDEsIGluZGV4MjtcclxuXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoeEZhbjIgIT09IHpGYW4yKSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleDAgPSAoeiArIDApICogdGhpcy5faGVpZ2h0TWFwLndpZHRoICsgKHggKyAwKTtcclxuICAgICAgICAgICAgICAgIGluZGV4MSA9ICh6ICsgMSkgKiB0aGlzLl9oZWlnaHRNYXAud2lkdGggKyAoeCArIDApO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgyID0gKHogKyAwKSAqIHRoaXMuX2hlaWdodE1hcC53aWR0aCArICh4ICsgMSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleDAgPSAoeiArIDApICogdGhpcy5faGVpZ2h0TWFwLndpZHRoICsgKHggKyAwKTtcclxuICAgICAgICAgICAgICAgIGluZGV4MSA9ICh6ICsgMSkgKiB0aGlzLl9oZWlnaHRNYXAud2lkdGggKyAoeCArIDEpO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgyID0gKHogKyAwKSAqIHRoaXMuX2hlaWdodE1hcC53aWR0aCArICh4ICsgMSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2Fzc2lnblBvc2l0aW9uKGluZGV4MCwgdG1wUG9zMSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2Fzc2lnblBvc2l0aW9uKGluZGV4MSwgdG1wUG9zMik7XHJcbiAgICAgICAgICAgIHRoaXMuX2Fzc2lnblBvc2l0aW9uKGluZGV4MiwgdG1wUG9zMyk7XHJcblxyXG4gICAgICAgICAgICB0cmlhbmdsZS5pbmRleDAgPSBpbmRleDA7XHJcbiAgICAgICAgICAgIHRyaWFuZ2xlLmluZGV4MSA9IGluZGV4MTtcclxuICAgICAgICAgICAgdHJpYW5nbGUuaW5kZXgyID0gaW5kZXgyO1xyXG5cclxuICAgICAgICAgICAgdHJpYW5nbGUuc2V0KHRtcFBvczEsIHRtcFBvczIsIHRtcFBvczMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX3RyaWFuZ2xlSW50ZXJzZWN0c1JheSh0cmlhbmdsZSwgcmF5LCByZXN1bHQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoeEZhbjIgIT09IHpGYW4yKSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleDAgPSAoeiArIDApICogdGhpcy5faGVpZ2h0TWFwLndpZHRoICsgKHggKyAxKTtcclxuICAgICAgICAgICAgICAgIGluZGV4MSA9ICh6ICsgMSkgKiB0aGlzLl9oZWlnaHRNYXAud2lkdGggKyAoeCArIDApO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgyID0gKHogKyAxKSAqIHRoaXMuX2hlaWdodE1hcC53aWR0aCArICh4ICsgMSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleDAgPSAoeiArIDApICogdGhpcy5faGVpZ2h0TWFwLndpZHRoICsgKHggKyAwKTtcclxuICAgICAgICAgICAgICAgIGluZGV4MSA9ICh6ICsgMSkgKiB0aGlzLl9oZWlnaHRNYXAud2lkdGggKyAoeCArIDApO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgyID0gKHogKyAxKSAqIHRoaXMuX2hlaWdodE1hcC53aWR0aCArICh4ICsgMSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2Fzc2lnblBvc2l0aW9uKGluZGV4MCwgdG1wUG9zMSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2Fzc2lnblBvc2l0aW9uKGluZGV4MSwgdG1wUG9zMik7XHJcbiAgICAgICAgICAgIHRoaXMuX2Fzc2lnblBvc2l0aW9uKGluZGV4MiwgdG1wUG9zMyk7XHJcblxyXG4gICAgICAgICAgICB0cmlhbmdsZS5pbmRleDAgPSBpbmRleDA7XHJcbiAgICAgICAgICAgIHRyaWFuZ2xlLmluZGV4MSA9IGluZGV4MTtcclxuICAgICAgICAgICAgdHJpYW5nbGUuaW5kZXgyID0gaW5kZXgyO1xyXG5cclxuICAgICAgICAgICAgdHJpYW5nbGUuc2V0KHRtcFBvczEsIHRtcFBvczIsIHRtcFBvczMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX3RyaWFuZ2xlSW50ZXJzZWN0c1JheSh0cmlhbmdsZSwgcmF5LCByZXN1bHQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2ludGVyc2VjdHNSYXkobG9jYWxSYXk6IHBjeC5SYXksIHJlc3VsdDogVGVycmFpblJheWNhc3RSZXN1bHQgPSBuZXcgVGVycmFpblJheWNhc3RSZXN1bHQoKSk6IGJvb2xlYW4ge1xyXG5cclxuICAgICAgICBpZiAoIWludGVyc2VjdHNSYXlCb3godGhpcy5fYm91bmRpbmdCb3gsIGxvY2FsUmF5KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9iZWdpblBvcy5jb3B5KGxvY2FsUmF5Lm9yaWdpbik7XHJcbiAgICAgICAgdGhpcy5fYmVnaW5Qb3MueCArPSB0aGlzLl9ib3VuZGluZ0JveC5tYXhYO1xyXG4gICAgICAgIHRoaXMuX2JlZ2luUG9zLnogKz0gdGhpcy5fYm91bmRpbmdCb3gubWF4WjtcclxuXHJcbiAgICAgICAgdGhpcy5fZW5kUG9zLmNvcHkobG9jYWxSYXkuZGlyZWN0aW9uKS5hZGQodGhpcy5fYmVnaW5Qb3MpO1xyXG5cclxuICAgICAgICBsZXQgcmF5RGlyZWN0aW9uRmxhdFggPSB0aGlzLl9lbmRQb3MueCAtIHRoaXMuX2JlZ2luUG9zLng7XHJcbiAgICAgICAgbGV0IHJheURpcmVjdGlvbkZsYXRaID0gdGhpcy5fZW5kUG9zLnogLSB0aGlzLl9iZWdpblBvcy56O1xyXG5cclxuICAgICAgICBjb25zdCBtYXhEaXN0YW5jZUZsYXQgPSBNYXRoLnNxcnQocmF5RGlyZWN0aW9uRmxhdFggKiogMiArIHJheURpcmVjdGlvbkZsYXRaICoqIDIpO1xyXG5cclxuICAgICAgICBpZiAobWF4RGlzdGFuY2VGbGF0IDwgMC4wMDAxKSB7XHJcbiAgICAgICAgICAgIC8vIENvbnNpZGVyIHRoZSByYXkgdmVydGljYWxcclxuICAgICAgICAgICAgcmF5RGlyZWN0aW9uRmxhdFggPSAwO1xyXG4gICAgICAgICAgICByYXlEaXJlY3Rpb25GbGF0WiA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByYXlEaXJlY3Rpb25GbGF0WCAvPSBtYXhEaXN0YW5jZUZsYXQ7XHJcbiAgICAgICAgICAgIHJheURpcmVjdGlvbkZsYXRaIC89IG1heERpc3RhbmNlRmxhdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHhpU3RlcCA9IHJheURpcmVjdGlvbkZsYXRYID4gMCA/IDEgOiByYXlEaXJlY3Rpb25GbGF0WCA8IDAgPyAtMSA6IDA7XHJcbiAgICAgICAgY29uc3QgemlTdGVwID0gcmF5RGlyZWN0aW9uRmxhdFogPiAwID8gMSA6IHJheURpcmVjdGlvbkZsYXRaIDwgMCA/IC0xIDogMDtcclxuXHJcbiAgICAgICAgY29uc3QgcGFyYW1EZWx0YVggPSB4aVN0ZXAgIT09IDAgPyAxIC8gTWF0aC5hYnMocmF5RGlyZWN0aW9uRmxhdFgpIDogaW5maW5pdGU7XHJcbiAgICAgICAgY29uc3QgcGFyYW1EZWx0YVogPSB6aVN0ZXAgIT09IDAgPyAxIC8gTWF0aC5hYnMocmF5RGlyZWN0aW9uRmxhdFopIDogaW5maW5pdGU7XHJcblxyXG4gICAgICAgIGxldCBwYXJhbUNyb3NzWDtcclxuICAgICAgICBsZXQgcGFyYW1Dcm9zc1o7XHJcblxyXG4gICAgICAgIGlmICh4aVN0ZXAgIT09IDApIHtcclxuICAgICAgICAgICAgcGFyYW1Dcm9zc1ggPSB4aVN0ZXAgPT09IDFcclxuICAgICAgICAgICAgICAgID8gKE1hdGguY2VpbCh0aGlzLl9iZWdpblBvcy54KSAtIHRoaXMuX2JlZ2luUG9zLngpICogcGFyYW1EZWx0YVhcclxuICAgICAgICAgICAgICAgIDogKHRoaXMuX2JlZ2luUG9zLnggLSBNYXRoLmZsb29yKHRoaXMuX2JlZ2luUG9zLngpKSAqIHBhcmFtRGVsdGFYO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcGFyYW1Dcm9zc1ggPSBpbmZpbml0ZTsgIC8vIFdpbGwgbmV2ZXIgY3Jvc3Mgb24gWFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHppU3RlcCAhPT0gMCkge1xyXG4gICAgICAgICAgICBwYXJhbUNyb3NzWiA9IHppU3RlcCA9PT0gMVxyXG4gICAgICAgICAgICAgICAgPyAoTWF0aC5jZWlsKHRoaXMuX2JlZ2luUG9zLnopIC0gdGhpcy5fYmVnaW5Qb3MueikgKiBwYXJhbURlbHRhWlxyXG4gICAgICAgICAgICAgICAgOiAodGhpcy5fYmVnaW5Qb3MueiAtIE1hdGguZmxvb3IodGhpcy5fYmVnaW5Qb3MueikpICogcGFyYW1EZWx0YVo7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBwYXJhbUNyb3NzWiA9IGluZmluaXRlOyAgLy8gV2lsbCBuZXZlciBjcm9zcyBvbiBaXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByczogSUdyaWRSYXljYXN0U3RhdGUgPSB7XHJcbiAgICAgICAgICAgIHg6IHRoaXMuX2JlZ2luUG9zLnggfCAwLFxyXG4gICAgICAgICAgICB6OiB0aGlzLl9iZWdpblBvcy56IHwgMCxcclxuICAgICAgICAgICAgcGFyYW06IDAsXHJcbiAgICAgICAgICAgIHByZXZYOiAwLFxyXG4gICAgICAgICAgICBwcmV2WjogMCxcclxuICAgICAgICAgICAgcHJldlBhcmFtOiAwLFxyXG4gICAgICAgICAgICBtYXhEaXN0YW5jZUZsYXQ6IG1heERpc3RhbmNlRmxhdCxcclxuICAgICAgICB9O1xyXG5cclxuXHQgICAgLy8gV29ya2Fyb3VuZCBjYXNlcyB3aGVyZSB0aGUgcmF5IHN0YXJ0cyBhdCBhbiBpbnRlZ2VyIHBvc2l0aW9uXHJcblx0ICAgIGlmIChwYXJhbUNyb3NzWCA9PT0gMC4wKSB7XHJcbiAgICAgICAgICAgIHBhcmFtQ3Jvc3NYICs9IHBhcmFtRGVsdGFYO1xyXG4gICAgICAgICAgICAvLyBJZiBnb2luZyBiYWNrd2FyZHMsIHdlIHNob3VsZCBpZ25vcmUgdGhlIHBvc2l0aW9uIHdlIHdvdWxkIGdldCBieSB0aGUgYWJvdmUgZmxvb3JpbmcsXHJcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgdGhlIHJheSBpcyBub3QgaGVhZGluZyBpbiB0aGF0IGRpcmVjdGlvblxyXG4gICAgICAgICAgICBpZiAoeGlTdGVwID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgcnMueCAtPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGFyYW1Dcm9zc1ogPT09IDAuMCkge1xyXG4gICAgICAgICAgICBwYXJhbUNyb3NzWiArPSBwYXJhbURlbHRhWjtcclxuICAgICAgICAgICAgaWYgKHppU3RlcCA9PT0gLTEpXHJcbiAgICAgICAgICAgICAgICBycy56IC09IDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgaGFzSGl0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHdoaWxlICghaGFzSGl0KSB7XHJcblxyXG4gICAgICAgICAgICBycy5wcmV2WCA9IHJzLng7XHJcbiAgICAgICAgICAgIHJzLnByZXZaID0gcnMuejtcclxuICAgICAgICAgICAgcnMucHJldlBhcmFtID0gcnMucGFyYW07XHJcbiAgICBcclxuICAgICAgICAgICAgaWYgKHBhcmFtQ3Jvc3NYIDwgcGFyYW1Dcm9zc1opIHtcclxuICAgICAgICAgICAgICAgIC8vIFggbGFuZVxyXG4gICAgICAgICAgICAgICAgcnMueCArPSB4aVN0ZXA7XHJcbiAgICAgICAgICAgICAgICAvLyBBc3NpZ24gYmVmb3JlIGFkdmFuY2luZyB0aGUgcGFyYW0sXHJcbiAgICAgICAgICAgICAgICAvLyB0byBiZSBpbiBzeW5jIHdpdGggdGhlIGluaXRpYWxpemF0aW9uIHN0ZXBcclxuICAgICAgICAgICAgICAgIHJzLnBhcmFtID0gcGFyYW1Dcm9zc1g7XHJcbiAgICAgICAgICAgICAgICBwYXJhbUNyb3NzWCArPSBwYXJhbURlbHRhWDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIFogbGFuZVxyXG4gICAgICAgICAgICAgICAgcnMueiArPSB6aVN0ZXA7XHJcbiAgICAgICAgICAgICAgICBycy5wYXJhbSA9IHBhcmFtQ3Jvc3NaO1xyXG4gICAgICAgICAgICAgICAgcGFyYW1Dcm9zc1ogKz0gcGFyYW1EZWx0YVo7XHJcbiAgICAgICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgICAgICBpZiAodGhpcy5fcXVhZEFjdGlvbihycywgbG9jYWxSYXksIHJlc3VsdCkpIHtcclxuICAgICAgICAgICAgICAgIGhhc0hpdCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChycy5wYXJhbSA+IHJzLm1heERpc3RhbmNlRmxhdCkge1xyXG4gICAgICAgICAgICAgICAgcnMucGFyYW0gPSBycy5tYXhEaXN0YW5jZUZsYXQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGhhc0hpdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW50ZXJzZWN0c1JheSh3b3JsZFRyYW5mb3JtOiBwY3guTWF0NCB8IG51bGwgfCB1bmRlZmluZWQsIHJheTogcGN4LlJheSwgcmVzdWx0OiBUZXJyYWluUmF5Y2FzdFJlc3VsdCA9IG5ldyBUZXJyYWluUmF5Y2FzdFJlc3VsdCgpKTogYm9vbGVhbiB7XHJcblxyXG4gICAgICAgIGlmICh3b3JsZFRyYW5mb3JtKSB7XHJcbiAgICAgICAgICAgIG1vZGVsVHJhbnNmb3JtLmNvcHkod29ybGRUcmFuZm9ybSkuaW52ZXJ0KCk7XHJcbiAgICAgICAgICAgIG1vZGVsVHJhbnNmb3JtLnRyYW5zZm9ybVBvaW50KHJheS5vcmlnaW4sIHRtcFJheS5vcmlnaW4pO1xyXG4gICAgICAgICAgICBtb2RlbFRyYW5zZm9ybS50cmFuc2Zvcm1WZWN0b3IocmF5LmRpcmVjdGlvbiwgdG1wUmF5LmRpcmVjdGlvbik7XHJcbiAgICBcclxuICAgICAgICAgICAgZGVidWdUcmFuc2Zvcm0uY29weSh3b3JsZFRyYW5mb3JtKTtcclxuICAgICAgICAgICAgZGVidWdUcmFuc2Zvcm1Jc0lkZW50aXR5ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCFkZWJ1Z1RyYW5zZm9ybUlzSWRlbnRpdHkpIHtcclxuICAgICAgICAgICAgZGVidWdUcmFuc2Zvcm0uc2V0SWRlbnRpdHkoKTtcclxuICAgICAgICAgICAgZGVidWdUcmFuc2Zvcm1Jc0lkZW50aXR5ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICBjb25zdCBoaXQgPSB0aGlzLl9pbnRlcnNlY3RzUmF5KHdvcmxkVHJhbmZvcm0gPyB0bXBSYXkgOiByYXksIHJlc3VsdCk7XHJcbiAgICBcclxuICAgICAgICBpZiAoaGl0ICYmIHdvcmxkVHJhbmZvcm0pIHtcclxuICAgICAgICAgICAgLy8gdXBkYXRlIHdvcmxkIHBvaW50IGFuZCBub3JtYWwsIGJ1dCBzYXZlIGxvY2FsXHJcbiAgICAgICAgICAgIHdvcmxkVHJhbmZvcm0udHJhbnNmb3JtUG9pbnQocmVzdWx0LnBvaW50LCByZXN1bHQucG9pbnQpO1xyXG4gICAgICAgICAgICB3b3JsZFRyYW5mb3JtLnRyYW5zZm9ybVZlY3RvcihyZXN1bHQubm9ybWFsLCByZXN1bHQubm9ybWFsKTtcclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICByZXR1cm4gISFoaXQ7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgdHlwZSB7IGZsb2F0LCBpbnQgfSBmcm9tIFwiLi4vU2hhcmVkL1R5cGVzLm1qc1wiO1xyXG5pbXBvcnQgQWJzUGF0Y2hlZEhlaWdodE1hcCwgeyBnZXRPclRocm93RGF0YUNodW5rU2l6ZSwgSVJlYWRvbmx5QWJzUGF0Y2hlZEhlaWdodE1hcFR5cHBlZCB9IGZyb20gXCIuL0Fic1BhdGNoZWRIZWlnaHRNYXAubWpzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElSZWFkb25seVBhdGNoZWRIZWlnaHRNYXAgZXh0ZW5kcyBJUmVhZG9ubHlBYnNQYXRjaGVkSGVpZ2h0TWFwVHlwcGVkPEZsb2F0MzJBcnJheT4ge1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgUGF0Y2hlZEhlaWdodE1hcCBleHRlbmRzIEFic1BhdGNoZWRIZWlnaHRNYXA8RmxvYXQzMkFycmF5PiBpbXBsZW1lbnRzIElSZWFkb25seVBhdGNoZWRIZWlnaHRNYXAge1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGNyZWF0ZUJ1ZmZlcih3aWR0aDogaW50LCBkZXB0aDogaW50LCBjaHVua1NpemU6IGludCk6IEZsb2F0MzJBcnJheSB7XHJcblxyXG4gICAgICAgIGNvbnN0IG51bUNodW5rc1ggICA9ICgod2lkdGggLSAxKSAvIChjaHVua1NpemUgLSAxKSkgfCAwO1xyXG4gICAgICAgIGNvbnN0IG51bUNodW5rc1ogICA9ICgoZGVwdGggLSAxKSAvIChjaHVua1NpemUgLSAxKSkgfCAwO1xyXG4gICAgICAgIGNvbnN0IGNodW5rQXJyU2l6ZSA9IGNodW5rU2l6ZSAqIGNodW5rU2l6ZTtcclxuICAgICAgICBjb25zdCBjaHVua0NvdW50ICAgPSBudW1DaHVua3NYICogbnVtQ2h1bmtzWjtcclxuICAgIFxyXG4gICAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KGNodW5rQXJyU2l6ZSAqIGNodW5rQ291bnQpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHdpZHRoOiBpbnQsIGRlcHRoOiBpbnQsIHBhdGNoU2l6ZTogaW50LCBkYXRhQ2h1bmtTaXplOiBpbnQsIG1pbkhlaWdodDogZmxvYXQsIG1heEhlaWdodDogZmxvYXQsIGJ1ZmZlcj86IEZsb2F0MzJBcnJheSkge1xyXG4gICAgICAgIGNvbnN0IHZhbGlkRGF0YUNodW5rU2l6ZSA9IGdldE9yVGhyb3dEYXRhQ2h1bmtTaXplKHBhdGNoU2l6ZSwgZGF0YUNodW5rU2l6ZSk7XHJcbiAgICAgICAgY29uc3QgdG1wQnVmZmVyID0gYnVmZmVyID8/IFBhdGNoZWRIZWlnaHRNYXAuY3JlYXRlQnVmZmVyKHdpZHRoLCBkZXB0aCwgdmFsaWREYXRhQ2h1bmtTaXplKTtcclxuICAgICAgICBzdXBlcih3aWR0aCwgZGVwdGgsIHBhdGNoU2l6ZSwgZGF0YUNodW5rU2l6ZSwgbWluSGVpZ2h0LCBtYXhIZWlnaHQsIHRtcEJ1ZmZlciwgMSwgMCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBhdGNoZWRIZWlnaHRNYXA7IiwiaW1wb3J0IHsgZHJhd0RpcmVjdGlvblZlY3RvciwgZHJhd1BvaW50IH0gZnJvbSBcIi4uL1NoYXJlZC9EZWJ1Zy5tanNcIjtcclxuaW1wb3J0IHsgTWlkcG9pbnREaXNwVGVycmFpbiB9IGZyb20gXCIuLi9UZXJyYWluU3lzdGVtL01pZHBvaW50RGlzcFRlcnJhaW4ubWpzXCI7XHJcbmltcG9ydCBUZXJyYWluUmF5Y2FzdFJlc3VsdCBmcm9tIFwiLi4vVGVycmFpblN5c3RlbS9UZXJyYWluUmF5Y2FzdFJlc3VsdC5tanNcIjtcclxuaW1wb3J0IEhlaWdodE1hcCBmcm9tIFwiLi4vVGVycmFpblN5c3RlbS9IZWlnaHRNYXAubWpzXCI7XHJcbmltcG9ydCBUZXJyYWluUmVuZGVyZXJQcmVwYXJlciBmcm9tIFwiLi4vU2NyaXB0SGVscGVycy9UZXJyYWluUmVuZGVyUHJlcGFyZXIubWpzXCI7XHJcbmltcG9ydCB0eXBlIHsgSUJydXNoU2V0dGluZ3MgfSBmcm9tIFwiLi4vU2NyaXB0SGVscGVycy9CcnVzaC5tanNcIjtcclxuaW1wb3J0IENvbG9yUGFpbnRlciBmcm9tIFwiLi4vU2NyaXB0SGVscGVycy9Db2xvclBhaW50ZXIubWpzXCI7XHJcbmltcG9ydCBUZXJyYWluUGF0Y2hlcyBmcm9tIFwiLi4vU2NyaXB0SGVscGVycy9UZXJyYWluUGF0Y2hlcy5tanNcIjtcclxuaW1wb3J0IHsgdGVycmFpbkhlaWdodHNDb21wcmVzc0FsZ29yaXRtLCB0ZXJyYWluSGVpZ2h0c0NvbXByZXNzQWxnb3JpdG1EZWZhdWx0LCB0ZXJyYWluUGF0Y2hTaXplRW51bSwgdGVycmFpblBhdGNoU2l6ZUVudW1EZWZhdWx0LCB0ZXJyYWluU2l6ZUVudW0sIHRlcnJhaW5TaXplRW51bURlZmF1bHQgfSBmcm9tIFwiLi4vU2NyaXB0SGVscGVycy9FbnVtLm1qc1wiO1xyXG5pbXBvcnQgeyB0ZXJyYWluTWF4SGVpZ2h0UGFyYW1OYW1lLCB0ZXJyYWluTWluSGVpZ2h0UGFyYW1OYW1lLCB0ZXJyYWluU2l6ZVBhcmFtTmFtZSwgdGVycmFpblNwbGF0TWFwUGFyYW1OYW1lLCB9IGZyb20gXCIuLi9TY3JpcHRIZWxwZXJzL1RlcnJhaW5QYXRjaGVzU2hhZGVyQ2h1bmtzLm1qc1wiO1xyXG5pbXBvcnQgSGVpZ2h0ZmllbGRTaGFwZSBmcm9tIFwiLi4vVGVycmFpblN5c3RlbS9IZWlnaHRmaWVsZFNoYXBlLm1qc1wiO1xyXG5pbXBvcnQgUGF0Y2hlZEhlaWdodE1hcCBmcm9tIFwiLi4vVGVycmFpblN5c3RlbS9QYXRjaGVkSGVpZ2h0TWFwLm1qc1wiO1xyXG5pbXBvcnQgQ29tcHJlc3NlZFBhdGNoZWRIZWlnaHRNYXAsIHsgVENvbXByZXNzQWxnb3JpdG0gfSBmcm9tIFwiLi4vVGVycmFpblN5c3RlbS9Db21wcmVzc2VkUGF0Y2hlZEhlaWdodE1hcC5tanNcIjtcclxuaW1wb3J0IHsgRnJ1c3R1bSB9IGZyb20gXCIuLi9TY3JpcHRIZWxwZXJzL0ZydXN0dW0ubWpzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElUZXJyYWluSGVpZ2h0TWFwQXR0cmlidXRlIHtcclxuICAgIHJlYWRvbmx5IGZpbGU6IHBjeC5Bc3NldDtcclxuICAgIHJlYWRvbmx5IHRleHR1cmU6IHBjeC5Bc3NldDtcclxuICAgIHJlYWRvbmx5IHNtb290aEZhY3RvcjogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgc21vb3RoUmFkaXVzOiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVRlcnJhaW5CcnVzaEF0dHJpYnV0ZSBleHRlbmRzIElCcnVzaFNldHRpbmdzIHtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJVGVycmFpbkxheWVyQXR0cmlidXRlIHtcclxuICAgIHJlYWRvbmx5IG5hbWU6IHN0cmluZyxcclxuICAgIHJlYWRvbmx5IGRpZmZ1c2U6IHBjeC5Bc3NldDtcclxuICAgIHJlYWRvbmx5IG5vcm1hbE1hcDogcGN4LkFzc2V0O1xyXG4gICAgcmVhZG9ubHkgc2l6ZTogcGN4LlZlYzI7XHJcbiAgICByZWFkb25seSBvZmZzZXQ6IHBjeC5WZWMyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElUZXJyYWluUGFpbnRlclNldHRpbmdzQXR0cmlidXRlIHtcclxuICAgIHJlYWRvbmx5IHNwbGF0TWFwOiBwY3guQXNzZXQ7XHJcbn1cclxuXHJcbmNvbnN0IGJydXNoTWluU2l6ZSA9IDI7XHJcbmNvbnN0IGJydXNoTWF4U2l6ZSA9IDI1MDtcclxuY29uc3QgdG1wTWF0ID0gbmV3IHBjLk1hdDQoKTtcclxuY29uc3QgdGVycmFpbkxvY2FsVmVydGV4UG9zID0gbmV3IHBjLlZlYzMoKTtcclxuY29uc3QgaGVpZ2h0TWFwRXh0ID0gJy5obSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQmlnVGVycmFpbkVkaXRvciBleHRlbmRzIHBjLlNjcmlwdFR5cGUge1xyXG5cclxuICAgIGRlY2xhcmUgcmVhZG9ubHkgdXNlSW5zdGFuY2luZ0FjY2VsZXJhdG9yOiBib29sZWFuO1xyXG4gICAgZGVjbGFyZSByZWFkb25seSB6RmFyOiBudW1iZXI7XHJcbiAgICBkZWNsYXJlIHJlYWRvbmx5IHdpZHRoOiBudW1iZXI7XHJcbiAgICBkZWNsYXJlIHJlYWRvbmx5IGRlcHRoOiBudW1iZXI7XHJcbiAgICBkZWNsYXJlIHJlYWRvbmx5IGhlaWdodDogbnVtYmVyO1xyXG4gICAgZGVjbGFyZSByZWFkb25seSBjb21wcmVzc0FsZ29yaXRtOiBUQ29tcHJlc3NBbGdvcml0bSB8ICdub25lJztcclxuICAgIGRlY2xhcmUgcmVhZG9ubHkgcGF0Y2hTaXplOiBudW1iZXI7XHJcbiAgICBkZWNsYXJlIHJlYWRvbmx5IGNhc3RTaGFkb3c6IGJvb2xlYW47XHJcbiAgICBkZWNsYXJlIHJlYWRvbmx5IHJlY2VpdmVTaGFkb3c6IGJvb2xlYW47XHJcblxyXG4gICAgZGVjbGFyZSByZWFkb25seSBsYXllcjogc3RyaW5nO1xyXG4gICAgZGVjbGFyZSByZWFkb25seSBsYXllcjI6IHN0cmluZztcclxuICAgIGRlY2xhcmUgcmVhZG9ubHkgYXV0b1JlbmRlcjogYm9vbGVhbjtcclxuICAgIGRlY2xhcmUgcmVhZG9ubHkgd2lyZWZyYW1lOiBib29sZWFuO1xyXG4gICAgZGVjbGFyZSByZWFkb25seSBwYWludGluZzogYm9vbGVhbjtcclxuICAgIGRlY2xhcmUgcmVhZG9ubHkgY2FtZXJhRW50aXR5OiBwY3guRW50aXR5IHwgdW5kZWZpbmVkO1xyXG4gICAgZGVjbGFyZSByZWFkb25seSBoZWlnaHRNYXA6IElUZXJyYWluSGVpZ2h0TWFwQXR0cmlidXRlO1xyXG4gICAgZGVjbGFyZSByZWFkb25seSBicnVzaDogSVRlcnJhaW5CcnVzaEF0dHJpYnV0ZTtcclxuICAgIGRlY2xhcmUgcmVhZG9ubHkgYWN0aXZlTGF5ZXI6IG51bWJlcjtcclxuICAgIGRlY2xhcmUgcmVhZG9ubHkgbGF5ZXJzOiBJVGVycmFpbkxheWVyQXR0cmlidXRlW107XHJcbiAgICBkZWNsYXJlIHJlYWRvbmx5IHBhaW50ZXJTZXR0aW5nczogSVRlcnJhaW5QYWludGVyU2V0dGluZ3NBdHRyaWJ1dGU7XHJcblxyXG4gICAgcHVibGljIGdldCBzaGFwZSgpIHsgcmV0dXJuIHRoaXMuX2hlaWdodEZpZWxkU2hhcGU7IH1cclxuICAgIHB1YmxpYyBnZXQgdGVycmFpbigpIHsgcmV0dXJuIHRoaXMuX3RlcnJhaW47IH1cclxuICAgIHB1YmxpYyBnZXQgdGVycmFpblJlbmRlcmVyKCkgeyByZXR1cm4gdGhpcy5fcmVuZGVyZXI7IH1cclxuXHJcbiAgICBwcml2YXRlIF9sb2NhbENhbWVyYVBvc2l0aW9uID0gbmV3IHBjLlZlYzMoKTtcclxuICAgIHByaXZhdGUgX3RlcnJhaW46IE1pZHBvaW50RGlzcFRlcnJhaW47XHJcbiAgICBwcml2YXRlIF9yb3VnaG5lc3MgPSAxLjA7XHJcblxyXG4gICAgcHJpdmF0ZSBfbWluSGVpZ2h0ID0gMC4wO1xyXG5cclxuICAgIHByaXZhdGUgX2hlaWdodEZpZWxkU2hhcGU6IEhlaWdodGZpZWxkU2hhcGU7XHJcbiAgICBwcml2YXRlIF9yYXljYXN0UmVzdWx0OiBUZXJyYWluUmF5Y2FzdFJlc3VsdDtcclxuICAgIHByaXZhdGUgX3JheVN0YXJ0ID0gbmV3IHBjLlZlYzMoKTtcclxuICAgIHByaXZhdGUgX3JheUVuZCA9IG5ldyBwYy5WZWMzKCk7XHJcbiAgICBwcml2YXRlIF9yYXlEaXJlY3Rpb24gPSBuZXcgcGMuVmVjMygpO1xyXG4gICAgcHJpdmF0ZSBfcmF5ID0gbmV3IHBjLlJheSgpO1xyXG5cclxuICAgIHByaXZhdGUgX2xhc3RNb3VzZU1vdmVFdmVudDogcGN4Lk1vdXNlRXZlbnQ7XHJcblxyXG4gICAgcHJpdmF0ZSBfbGFzdExvZEdyaWRVcGRhdGU6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIF9hY3RpdmVCcnVzaDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfYnJ1c2hIZWlnaHRNYXA6IEhlaWdodE1hcDtcclxuICAgIHByaXZhdGUgX2NvbG9yUGFpbnRlcjogQ29sb3JQYWludGVyO1xyXG4gICAgcHJpdmF0ZSBfYnJ1c2hTaXplOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIF9icnVzaFNpemVTdGVwOiBudW1iZXIgPSAxO1xyXG4gICAgcHJpdmF0ZSBfYnJ1c2hPcGFjaXR5OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIF9icnVzaE9wYWNpdHlTdGVwOiBudW1iZXIgPSAwLjAxO1xyXG4gICAgcHJpdmF0ZSBfaW50ZXJzZWN0c1JheVJlc3VsdDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBfbWF0ZXJpYWw6IHBjeC5TdGFuZGFyZE1hdGVyaWFsO1xyXG4gICAgcHJpdmF0ZSBfbGF5ZXJzRGlmZnVzZTogcGN4LlRleHR1cmUgfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgcHJpdmF0ZSBfcmVuZGVyZXI6IFRlcnJhaW5SZW5kZXJlclByZXBhcmVyO1xyXG4gICAgcHJpdmF0ZSBfZnJ1c3R1bTogRnJ1c3R1bTtcclxuXHJcbiAgICBwdWJsaWMgcG9zdEluaXRpYWxpemUoKTogdm9pZCB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZU1vdXNlKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZUtleWJvYXJkKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2luaXRCcnVzaCgpO1xyXG4gICAgICAgIHRoaXMuX2luaXRUZXJyYWluKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2NyZWF0ZVRlcnJhaW5NYXRlcmlhbCgpO1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZVRlcnJhaW5NYXRlcmlhbFBhcmFtZXRlcnMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fdXBkYXRlTGF5ZXJzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3VwZGF0ZUhlaWdodE1hcEZyb21BdHRyKCk7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlQnJ1c2goKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVQYWludGVyTWF0ZXJpYWwoKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVNZXNoKCk7XHJcblxyXG4gICAgICAgIHRoaXMub24oJ2F0dHI6dXNlSW5zdGFuY2luZ0FjY2VsZXJhdG9yJywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5wYXRjaGVzU3RvcmUuaW5zdGFuY2luZy5lbmFibGVkID0gdGhpcy51c2VJbnN0YW5jaW5nQWNjZWxlcmF0b3I7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnBhdGNoZXNTdG9yZS51cGRhdGVNYXRlcmlhbCh0aGlzLl9tYXRlcmlhbCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnBhdGNoZXNTdG9yZS51cGRhdGVNZXNoZXMoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5vbignYXR0cjp3aXJlZnJhbWUnLCAoKSA9PiB7IHRoaXMuX3JlbmRlcmVyLndpcmVmcmFtZSA9IHRoaXMud2lyZWZyYW1lOyB9KTtcclxuICAgICAgICB0aGlzLm9uKCdhdHRyOmNhc3RTaGFkb3cnLCAoKSA9PiB7IHRoaXMuX3JlbmRlcmVyLmNhc3RTaGFkb3cgPSB0aGlzLmNhc3RTaGFkb3c7IH0pO1xyXG4gICAgICAgIHRoaXMub24oJ2F0dHI6cmVjZWl2ZVNoYWRvdycsICgpID0+IHsgdGhpcy5fcmVuZGVyZXIucmVjZWl2ZVNoYWRvdyA9IHRoaXMucmVjZWl2ZVNoYWRvdzsgfSk7XHJcblxyXG4gICAgICAgIHRoaXMub24oJ2F0dHI6YWN0aXZlTGF5ZXInLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVBhaW50ZXJNYXRlcmlhbCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm9uKCdhdHRyOmxheWVycycsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlTGF5ZXJzKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMub24oJ2F0dHI6YnJ1c2gnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUJydXNoKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVBhaW50ZXJNYXRlcmlhbCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm9uKCdhdHRyOmhlaWdodCcsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fdGVycmFpbi5zZXRNaW5NYXhIZWlnaHQodGhpcy5fbWluSGVpZ2h0LCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVRlcnJhaW5NYXRlcmlhbFBhcmFtZXRlcnMoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5vbignYXR0cjp6RmFyJywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl90ZXJyYWluLnNldFpGYXIodGhpcy56RmFyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0QnJ1c2goKSB7XHJcbiAgICAgICAgdGhpcy5fYnJ1c2hIZWlnaHRNYXAgPSBuZXcgSGVpZ2h0TWFwKDI1NiwgMjU2LCAwLCAxMDApO1xyXG4gICAgICAgIHRoaXMuX2NvbG9yUGFpbnRlciA9IG5ldyBDb2xvclBhaW50ZXIodGhpcy5hcHAsIHRoaXMucGFpbnRlclNldHRpbmdzLnNwbGF0TWFwLnJlc291cmNlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF91cGRhdGVQYWludGVyTWF0ZXJpYWwoKSB7XHJcbiAgICAgICAgdGhpcy5fY29sb3JQYWludGVyLnVwZGF0ZVNldHRpbmdzKHRoaXMuYnJ1c2gsIHRoaXMuYWN0aXZlTGF5ZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3VwZGF0ZUJydXNoKCkge1xyXG5cclxuICAgICAgICB0aGlzLl9icnVzaFNpemUgPSB0aGlzLmJydXNoLnNpemUgfCAwO1xyXG4gICAgICAgIHRoaXMuX2JydXNoT3BhY2l0eSA9IHRoaXMuYnJ1c2gub3BhY2l0eTtcclxuXHJcbiAgICAgICAgY29uc3QgYWN0aXZlQnJ1c2ggPSB0aGlzLmJydXNoLmFjdGl2ZSB8IDA7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVCcnVzaCA9PT0gdGhpcy5fYWN0aXZlQnJ1c2gpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmJydXNoLnRleHR1cmVzW2FjdGl2ZUJydXNoXSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdCcnVzaCBpbWFnZSB1bnNldC4nKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYnJ1c2hUZXh0dXJlID0gdGhpcy5icnVzaC50ZXh0dXJlc1thY3RpdmVCcnVzaF0ucmVzb3VyY2U7XHJcbiAgICAgICAgY29uc3QgYnJ1c2hJbWcgPSBicnVzaFRleHR1cmUuZ2V0U291cmNlKCk7XHJcblxyXG4gICAgICAgIGlmICghYnJ1c2hJbWcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQnJ1c2ggaW1hZ2UgdW5zZXQuJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2FjdGl2ZUJydXNoID0gYWN0aXZlQnJ1c2g7XHJcbiAgICAgICAgdGhpcy5fYnJ1c2hIZWlnaHRNYXAuZnJvbUltYWdlKGJydXNoSW1nKTtcclxuICAgICAgICB0aGlzLl9icnVzaEhlaWdodE1hcC5zbW9vdGgoMSwgMSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuX2JydXNoSGVpZ2h0TWFwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0VGVycmFpbigpIHtcclxuXHJcbiAgICAgICAgY29uc3QgdG1wQ2h1bmtTaXplID0gdGhpcy5wYXRjaFNpemUgKiAyIC0gMTtcclxuICAgICAgICBjb25zdCBjaHVua1NpemUgPSBNYXRoLm1pbih0aGlzLndpZHRoLCB0aGlzLmRlcHRoLCB0bXBDaHVua1NpemUpO1xyXG4gICAgICAgIGNvbnN0IGhlaWdodE1hcCA9IHRoaXMuY29tcHJlc3NBbGdvcml0bSAhPT0gJ25vbmUnXHJcbiAgICAgICAgPyBuZXcgQ29tcHJlc3NlZFBhdGNoZWRIZWlnaHRNYXAodGhpcy53aWR0aCwgdGhpcy5kZXB0aCwgdGhpcy5wYXRjaFNpemUsIGNodW5rU2l6ZSwgdGhpcy5fbWluSGVpZ2h0LCB0aGlzLmhlaWdodCwgdGhpcy5jb21wcmVzc0FsZ29yaXRtKVxyXG4gICAgICAgIDogbmV3IFBhdGNoZWRIZWlnaHRNYXAodGhpcy53aWR0aCwgdGhpcy5kZXB0aCwgdGhpcy5wYXRjaFNpemUsIGNodW5rU2l6ZSwgdGhpcy5fbWluSGVpZ2h0LCB0aGlzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3RlcnJhaW4gPSBuZXcgTWlkcG9pbnREaXNwVGVycmFpbihoZWlnaHRNYXAsIHRoaXMuekZhcik7XHJcbiAgICAgICAgdGhpcy5faGVpZ2h0RmllbGRTaGFwZSA9IG5ldyBIZWlnaHRmaWVsZFNoYXBlKGhlaWdodE1hcCk7XHJcbiAgICAgICAgdGhpcy5fcmF5Y2FzdFJlc3VsdCA9IG5ldyBUZXJyYWluUmF5Y2FzdFJlc3VsdCgpO1xyXG4gICAgICAgIHRoaXMuX2ZydXN0dW0gPSBuZXcgRnJ1c3R1bSgpO1xyXG5cclxuICAgICAgICBjb25zdCBwYXRjaGVyICA9IG5ldyBUZXJyYWluUGF0Y2hlcyh0aGlzLl90ZXJyYWluKTtcclxuICAgICAgICB0aGlzLl9yZW5kZXJlciA9IG5ldyBUZXJyYWluUmVuZGVyZXJQcmVwYXJlcihwYXRjaGVyLCB7XHJcbiAgICAgICAgICAgIHdpcmVmcmFtZTogdGhpcy53aXJlZnJhbWUsXHJcbiAgICAgICAgICAgIGNhc3RTaGFkb3c6IHRoaXMuY2FzdFNoYWRvdyxcclxuICAgICAgICAgICAgcmVjZWl2ZVNoYWRvdzogdGhpcy5yZWNlaXZlU2hhZG93LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuX3RlcnJhaW4sIHRoaXMuX2hlaWdodEZpZWxkU2hhcGUsIHRoaXMuX3JlbmRlcmVyKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jcmVhdGVUZXJyYWluTWF0ZXJpYWwoKSB7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwgPSBuZXcgcGMuU3RhbmRhcmRNYXRlcmlhbCgpO1xyXG4gICAgICAgIHRoaXMuX21hdGVyaWFsLm5hbWUgPSBcIlRlcnJhaW4gTWF0ZXJpYWxcIjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF91cGRhdGVUZXJyYWluTWF0ZXJpYWxQYXJhbWV0ZXJzKCkge1xyXG4gICAgICAgIHRoaXMuX21hdGVyaWFsLnNldFBhcmFtZXRlcih0ZXJyYWluU3BsYXRNYXBQYXJhbU5hbWUsIHRoaXMuX2NvbG9yUGFpbnRlci5iYWNrZ3JvdW5kKTtcclxuICAgICAgICB0aGlzLl9tYXRlcmlhbC5zZXRQYXJhbWV0ZXIodGVycmFpblNpemVQYXJhbU5hbWUsIFt0aGlzLl90ZXJyYWluLndpZHRoLCB0aGlzLl90ZXJyYWluLmRlcHRoXSk7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwuc2V0UGFyYW1ldGVyKHRlcnJhaW5NaW5IZWlnaHRQYXJhbU5hbWUsIHRoaXMuX3RlcnJhaW4ubWluSGVpZ2h0KTtcclxuICAgICAgICB0aGlzLl9tYXRlcmlhbC5zZXRQYXJhbWV0ZXIodGVycmFpbk1heEhlaWdodFBhcmFtTmFtZSwgdGhpcy5fdGVycmFpbi5tYXhIZWlnaHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3VwZGF0ZUxheWVycygpIHtcclxuXHJcbiAgICAgICAgLy8gVE9ET1xyXG4gICAgICAgIGNvbnN0IG1heENvdW50ID0gMTY7XHJcbiAgICAgICAgY29uc3Qgd2lkdGggID0gMTAyNDtcclxuICAgICAgICBjb25zdCBoZWlnaHQgPSAxMDI0O1xyXG5cclxuICAgICAgICBsZXQgbGVuZ3RoICAgPSAwO1xyXG4gICAgICAgIGxldCBmbGFncyAgICA9IFtdO1xyXG4gICAgICAgIGxldCBzY2FsZXMgICA9IFtdO1xyXG4gICAgICAgIGxldCBvZmZzZXRzICA9IFtdO1xyXG4gICAgICAgIGxldCBkaWZmdXNlcyA9IFtdO1xyXG4gICAgICAgIGxldCBub3JtYWxzICA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1heENvdW50OyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBmbGFnID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmIChpIDwgdGhpcy5sYXllcnMubGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgbGF5ZXIgICAgID0gdGhpcy5sYXllcnNbaV07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkaWZmdXNlICAgPSBsYXllci5kaWZmdXNlO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgbm9ybWFsTWFwID0gbGF5ZXIubm9ybWFsTWFwO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkaWZmdXNlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZsYWcrKztcclxuICAgICAgICAgICAgICAgICAgICBsZW5ndGgrKztcclxuICAgICAgICAgICAgICAgICAgICBkaWZmdXNlcy5wdXNoKGRpZmZ1c2UucmVzb3VyY2UuZ2V0U291cmNlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlcy5wdXNoKGxheWVyLnNpemUueCwgbGF5ZXIuc2l6ZS55KTtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRzLnB1c2gobGF5ZXIub2Zmc2V0LngsIGxheWVyLm9mZnNldC55KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vcm1hbE1hcCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmbGFnKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbHMucHVzaChub3JtYWxNYXAucmVzb3VyY2UuZ2V0U291cmNlKCkpOyAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmbGFncy5wdXNoKGZsYWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fbGF5ZXJzRGlmZnVzZT8uZGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMuX2xheWVyc0RpZmZ1c2UgPSBuZXcgcGMuVGV4dHVyZSh0aGlzLmFwcC5ncmFwaGljc0RldmljZSwge1xyXG4gICAgICAgICAgICBuYW1lOiAndGVycmFpbkxheWVyc0RpZmZ1c2UnLFxyXG4gICAgICAgICAgICBmb3JtYXQ6IHBjLlBJWEVMRk9STUFUX1JHQkE4LFxyXG4gICAgICAgICAgICB3aWR0aDogd2lkdGgsXHJcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxyXG4gICAgICAgICAgICBhcnJheUxlbmd0aDogbGVuZ3RoLFxyXG4gICAgICAgICAgICBtYWdGaWx0ZXI6IHBjLkZJTFRFUl9ORUFSRVNULFxyXG4gICAgICAgICAgICBtaW5GaWx0ZXI6IHBjLkZJTFRFUl9ORUFSRVNUX01JUE1BUF9ORUFSRVNULFxyXG4gICAgICAgICAgICBtaXBtYXBzOiB0cnVlLFxyXG4gICAgICAgICAgICBhZGRyZXNzVTogcGMuQUREUkVTU19SRVBFQVQsXHJcbiAgICAgICAgICAgIGFkZHJlc3NWOiBwYy5BRERSRVNTX1JFUEVBVCxcclxuICAgICAgICAgICAgYWRkcmVzc1c6IHBjLkFERFJFU1NfQ0xBTVBfVE9fRURHRSxcclxuICAgICAgICAgICAgbGV2ZWxzOiBbIGRpZmZ1c2VzIF1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9sYXllcnNEaWZmdXNlLnVwbG9hZCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX21hdGVyaWFsLnNldFBhcmFtZXRlcihgdVRlcnJhaW5MYXllcnNDb3VudGAsIGxlbmd0aCk7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwuc2V0UGFyYW1ldGVyKGB1VGVycmFpbkxheWVyc0RpZmZ1c2VgLCB0aGlzLl9sYXllcnNEaWZmdXNlKTtcclxuICAgICAgICB0aGlzLl9tYXRlcmlhbC5zZXRQYXJhbWV0ZXIoYHVUZXJyYWluTGF5ZXJzRmxhZ3NbMF1gLCBmbGFncyk7XHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwuc2V0UGFyYW1ldGVyKGB1VGVycmFpbkxheWVyc1NjYWxlWzBdYCwgc2NhbGVzKTtcclxuICAgICAgICB0aGlzLl9tYXRlcmlhbC5zZXRQYXJhbWV0ZXIoYHVUZXJyYWluTGF5ZXJzT2Zmc2V0WzBdYCwgb2Zmc2V0cyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfdXBkYXRlTWVzaCgpIHtcclxuICAgICAgICB0aGlzLl9yZW5kZXJlci5wYXRjaGVzU3RvcmUuaW5zdGFuY2luZy5lbmFibGVkID0gdGhpcy51c2VJbnN0YW5jaW5nQWNjZWxlcmF0b3I7XHJcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIucGF0Y2hlc1N0b3JlLmluaXQodGhpcy5hcHAsIHRoaXMuZW50aXR5LCB0aGlzLl9tYXRlcmlhbCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgX2luaXRpYWxpemVNb3VzZSgpIHtcclxuICAgICAgICB0aGlzLmFwcC5tb3VzZT8ub24ocGMuRVZFTlRfTU9VU0VNT1ZFLCB0aGlzLl9vbk1vdXNlTW92ZSwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5hcHAubW91c2U/Lm9uKHBjLkVWRU5UX01PVVNFV0hFRUwsIHRoaXMuX29uTW91c2VXaGVlbCwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5vbignZGVzdHJveScsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5hcHAubW91c2U/Lm9mZihwYy5FVkVOVF9NT1VTRU1PVkUsIHRoaXMuX29uTW91c2VNb3ZlLCB0aGlzKTtcclxuICAgICAgICAgICAgdGhpcy5hcHAubW91c2U/Lm9mZihwYy5FVkVOVF9NT1VTRVdIRUVMLCB0aGlzLl9vbk1vdXNlV2hlZWwsIHRoaXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX29uTW91c2VNb3ZlKGV2ZW50OiBwY3guTW91c2VFdmVudCkge1xyXG4gICAgICAgIHRoaXMuX2xhc3RNb3VzZU1vdmVFdmVudCA9IGV2ZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX29uTW91c2VXaGVlbChldmVudDogcGN4Lk1vdXNlRXZlbnQpIHtcclxuICAgICAgICBjb25zdCBjYW5kaWRhdGUgPSB0aGlzLl9icnVzaFNpemUgKyBldmVudC53aGVlbERlbHRhICogdGhpcy5fYnJ1c2hTaXplU3RlcDtcclxuICAgICAgICB0aGlzLl9icnVzaFNpemUgPSBNYXRoLm1pbihNYXRoLm1heChjYW5kaWRhdGUsIGJydXNoTWluU2l6ZSksIGJydXNoTWF4U2l6ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdGlhbGl6ZUtleWJvYXJkKCkge1xyXG4gICAgICAgIHRoaXMuYXBwLmtleWJvYXJkPy5vbihwYy5FVkVOVF9LRVlET1dOLCB0aGlzLl9vbktleWJvYXJkRG93biwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5hcHAua2V5Ym9hcmQ/Lm9uKHBjLkVWRU5UX0tFWVVQLCB0aGlzLl9vbktleWJvYXJkVXAsIHRoaXMpO1xyXG4gICAgICAgIHRoaXMub24oJ2Rlc3Ryb3knLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLm1vdXNlPy5vZmYocGMuRVZFTlRfS0VZRE9XTiwgdGhpcy5fb25LZXlib2FyZERvd24sIHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLmFwcC5tb3VzZT8ub2ZmKHBjLkVWRU5UX0tFWVVQLCB0aGlzLl9vbktleWJvYXJkVXAsIHRoaXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2tleUFkZExvY2sgPSB0cnVlO1xyXG4gICAgcHJpdmF0ZSBfa2V5U3ViTG9jayA9IHRydWU7XHJcbiAgICBwcml2YXRlIF9vbktleWJvYXJkRG93bihldmVudDogcGN4LktleWJvYXJkRXZlbnQpIHtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2tleUFkZExvY2sgPT09IGZhbHNlICYmIGV2ZW50LmtleSA9PT0gcGMuS0VZX0FERCkge1xyXG4gICAgICAgICAgICB0aGlzLl9rZXlBZGRMb2NrID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5fYnJ1c2hPcGFjaXR5ID0gTWF0aC5tYXgodGhpcy5fYnJ1c2hPcGFjaXR5ICsgdGhpcy5fYnJ1c2hPcGFjaXR5U3RlcCwgMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5fa2V5U3ViTG9jayA9PT0gZmFsc2UgJiYgZXZlbnQua2V5ID09PSBwYy5LRVlfU1VCVFJBQ1QpIHtcclxuICAgICAgICAgICAgdGhpcy5fa2V5U3ViTG9jayA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuX2JydXNoT3BhY2l0eSA9IE1hdGgubWluKHRoaXMuX2JydXNoT3BhY2l0eSAtIHRoaXMuX2JydXNoT3BhY2l0eVN0ZXAsIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9vbktleWJvYXJkVXAoZXZlbnQ6IHBjeC5LZXlib2FyZEV2ZW50KSB7XHJcbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gcGMuS0VZX0FERCkge1xyXG4gICAgICAgICAgICB0aGlzLl9rZXlBZGRMb2NrID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGV2ZW50LmtleSA9PT0gcGMuS0VZX1NVQlRSQUNUKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2tleVN1YkxvY2sgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfdXBkYXRlSGVpZ2h0TWFwRnJvbUF0dHIoKSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmhlaWdodE1hcC5maWxlICYmXHJcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0TWFwLmZpbGUucmVzb3VyY2UpIHtcclxuICAgICAgICAgICAgY29uc3QgZGF0YSA9IHRoaXMuaGVpZ2h0TWFwLmZpbGUucmVzb3VyY2UgYXMgQXJyYXlCdWZmZXI7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX3RlcnJhaW4ubG9hZEhlaWdodE1hcEZyb21GaWxlKGRhdGEsIHtcclxuICAgICAgICAgICAgICAgIGFkYXB0aXZlTWluTWF4SGVpZ2h0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYWRhcHRpdmVXaWR0aEFuZERlcHRoOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmUgPSB0aGlzLmhlaWdodE1hcC50ZXh0dXJlLnJlc291cmNlIGFzIHBjeC5UZXh0dXJlO1xyXG4gICAgICAgICAgICBjb25zdCBpbWcgPSB0ZXh0dXJlLmdldFNvdXJjZSgpIGFzIGFueTtcclxuXHJcbiAgICAgICAgICAgIGlmICghaW1nKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdIZWlnaHQgbWFwIGltYWdlIHVuc2V0LicpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLl90ZXJyYWluLmxvYWRIZWlnaHRNYXBGcm9tSW1nKGltZywgdGhpcy5oZWlnaHRNYXAuc21vb3RoRmFjdG9yLCB0aGlzLmhlaWdodE1hcC5zbW9vdGhSYWRpdXMpO1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETzogY2xlYXIgaGVpZ2h0bWFwXHJcbiAgICAgICAgICAgIHRleHR1cmUuZGVzdHJveSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIucGF0Y2hlc1N0b3JlLnVwZGF0ZUFhYmIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9zYXZlSGVpZ2h0TWFwVG9JbWcoKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgYmFzZTY0ID0gdGhpcy5fdGVycmFpbi5oZWlnaHRNYXAudG9JbWFnZSgpO1xyXG4gICAgICAgIGNvbnN0IGltYWdlICA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGltYWdlLnNyYyA9IGJhc2U2NDtcclxuXHJcbiAgICAgICAgY29uc3QgdyA9IHdpbmRvdy5vcGVuKHVuZGVmaW5lZCwgJ19ibGFuaycpITtcclxuICAgICAgICB3LmRvY3VtZW50LndyaXRlKGltYWdlLm91dGVySFRNTCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfc2F2ZUhlaWdodE1hcFRvRmlsZSgpIHtcclxuXHJcbiAgICAgICAgY29uc3QgYmxvYiA9IGF3YWl0IHRoaXMuX3RlcnJhaW4uaGVpZ2h0TWFwLnRvRmlsZSgpO1xyXG4gICAgICAgIGNvbnN0IGJsb2JVcmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xyXG4gICAgICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcclxuICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGEpO1xyXG5cclxuICAgICAgICBhLmhyZWYgICAgID0gYmxvYlVybDtcclxuICAgICAgICBhLmRvd25sb2FkID0gYGhtXyR7K3RpbWVzdGFtcH0ke2hlaWdodE1hcEV4dH1gO1xyXG4gICAgICAgIGEuY2xpY2soKTtcclxuXHJcbiAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChibG9iVXJsKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlKGR0OiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2NvbG9yUGFpbnRlci5wYWludGluZykge1xyXG4gICAgICAgICAgICB0aGlzLl9jb2xvclBhaW50ZXIuc3RvcFBhaW50KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5hdXRvUmVuZGVyICYmXHJcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhRW50aXR5ICYmXHJcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhRW50aXR5LmNhbWVyYSkge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgY2FtZXJhID0gdGhpcy5jYW1lcmFFbnRpdHkuY2FtZXJhO1xyXG4gICAgICAgICAgICBjb25zdCBtYXQgICAgPSB0aGlzLmVudGl0eS5nZXRXb3JsZFRyYW5zZm9ybSgpO1xyXG4gICAgICAgICAgICBjb25zdCBzY2FsZSAgPSBtYXQuZ2V0U2NhbGUoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9sYXN0TW91c2VNb3ZlRXZlbnQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgaGFzQ2hhbmdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBjYW1lcmEuc2NyZWVuVG9Xb3JsZCh0aGlzLl9sYXN0TW91c2VNb3ZlRXZlbnQueCwgdGhpcy5fbGFzdE1vdXNlTW92ZUV2ZW50LnksIGNhbWVyYS5uZWFyQ2xpcCwgdGhpcy5fcmF5U3RhcnQpO1xyXG4gICAgICAgICAgICAgICAgY2FtZXJhLnNjcmVlblRvV29ybGQodGhpcy5fbGFzdE1vdXNlTW92ZUV2ZW50LngsIHRoaXMuX2xhc3RNb3VzZU1vdmVFdmVudC55LCBjYW1lcmEuZmFyQ2xpcCwgdGhpcy5fcmF5RW5kKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yYXlEaXJlY3Rpb24uc3ViMih0aGlzLl9yYXlFbmQsIHRoaXMuX3JheVN0YXJ0KTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hhbmdlUmF5ID0gIXRoaXMuX3JheS5vcmlnaW4uZXF1YWxzKHRoaXMuX3JheVN0YXJ0KSB8fCAhdGhpcy5fcmF5LmRpcmVjdGlvbi5lcXVhbHModGhpcy5fcmF5RGlyZWN0aW9uKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY2hhbmdlUmF5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmF5LnNldCh0aGlzLl9yYXlTdGFydCwgdGhpcy5fcmF5RGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yYXljYXN0UmVzdWx0LmNsZWFyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW50ZXJzZWN0c1JheVJlc3VsdCA9IHRoaXMuX2hlaWdodEZpZWxkU2hhcGUuaW50ZXJzZWN0c1JheShtYXQsIHRoaXMuX3JheSwgdGhpcy5fcmF5Y2FzdFJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2ludGVyc2VjdHNSYXlSZXN1bHQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnJ1c2hTaXplWCA9IHRoaXMuX2JydXNoU2l6ZSAvIHNjYWxlLnggfCAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJydXNoU2l6ZVogPSB0aGlzLl9icnVzaFNpemUgLyBzY2FsZS56IHwgMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdGVycmFpbi5wYXRjaFZlcnRpY2VzLmdldFBvc2l0aW9uKHRoaXMuX3JheWNhc3RSZXN1bHQudmVydGV4SW5kZXgsIHRlcnJhaW5Mb2NhbFZlcnRleFBvcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRyYXdQb2ludCh7IGNlbnRlcjogdGhpcy5fcmF5Y2FzdFJlc3VsdC5wb2ludCwgcmFkaXVzOiB0aGlzLl9icnVzaFNpemUsIG51bVNlZ21lbnRzOiAxMCwgZGVwdGhUZXN0OiB0cnVlLCBjb2xvcjogcGMuQ29sb3IuR1JBWSB9KTtcclxuICAgICAgICAgICAgICAgICAgICBkcmF3RGlyZWN0aW9uVmVjdG9yKHRoaXMuX3JheWNhc3RSZXN1bHQucG9pbnQsIHRoaXMuX3JheWNhc3RSZXN1bHQubm9ybWFsLCBwYy5Db2xvci5NQUdFTlRBKTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5hcHAubW91c2U/LmlzUHJlc3NlZChwYy5NT1VTRUJVVFRPTl9MRUZUKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFpbnRpbmcpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB3aWR0aCAgID0gdGhpcy5fdGVycmFpbi53aWR0aCAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXB0aCAgID0gdGhpcy5fdGVycmFpbi5kZXB0aCAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB4ICAgICAgID0gdGVycmFpbkxvY2FsVmVydGV4UG9zLnggLyB3aWR0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHkgICAgICAgPSB0ZXJyYWluTG9jYWxWZXJ0ZXhQb3MueiAvIGRlcHRoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2NhbGVXICA9IGJydXNoU2l6ZVggLyB3aWR0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNjYWxlSCAgPSBicnVzaFNpemVaIC8gZGVwdGg7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY29sb3JQYWludGVyLnN0YXJ0UGFpbnQoZHQsIHgsIHksIHNjYWxlVywgc2NhbGVIKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhdmVyYWdlID0gKGJydXNoU2l6ZVggKyBicnVzaFNpemVaKSAvIDI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjZW50ZXJYID0gdGVycmFpbkxvY2FsVmVydGV4UG9zLnggfCAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2VudGVyWiA9IHRlcnJhaW5Mb2NhbFZlcnRleFBvcy56IHwgMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHpvbmUgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluWDogY2VudGVyWCAtIGJydXNoU2l6ZVgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4WDogY2VudGVyWCArIGJydXNoU2l6ZVggKyAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pblo6IGNlbnRlclogLSBicnVzaFNpemVaLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFo6IGNlbnRlclogKyBicnVzaFNpemVaICsgMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5hcHAua2V5Ym9hcmQ/LmlzUHJlc3NlZChwYy5LRVlfQUxUKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3RlcnJhaW4uc21vb3RoSGVpZ2h0c1pvbmUoem9uZSwgYXZlcmFnZSAqIHRoaXMuX2JydXNoT3BhY2l0eSAqIGR0LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5lZ2F0aXZlID0gISF0aGlzLmFwcC5rZXlib2FyZD8uaXNQcmVzc2VkKHBjLktFWV9DT05UUk9MKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhcHBlbmRWYWx1ZSA9IChuZWdhdGl2ZSA/IC1hdmVyYWdlIDogYXZlcmFnZSkgKiB0aGlzLl9icnVzaE9wYWNpdHkgKiBkdCAvIDEwMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl90ZXJyYWluLmFwcGVuZEhlaWdodE1hcCh0aGlzLl9icnVzaEhlaWdodE1hcCwgYXBwZW5kVmFsdWUsIHpvbmUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3RlcnJhaW4ucmVjYWxjdWxhdGVNaW5NYXgoem9uZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5wYXRjaGVzU3RvcmUudXBkYXRlSGVpZ2h0cyh6b25lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0bXBNYXQuaW52ZXJ0KG1hdCk7XHJcbiAgICAgICAgICAgIHRtcE1hdC50cmFuc2Zvcm1Qb2ludChjYW1lcmEuZW50aXR5LmdldFBvc2l0aW9uKCksIHRoaXMuX2xvY2FsQ2FtZXJhUG9zaXRpb24pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5fZnJ1c3R1bS5mcnVzdHVtICAgPSBjYW1lcmEuZnJ1c3R1bTtcclxuICAgICAgICAgICAgdGhpcy5fZnJ1c3R1bS50cmFuc2Zvcm0gPSBtYXQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl90ZXJyYWluLnVwZGF0ZUxvZHModGhpcy5fbG9jYWxDYW1lcmFQb3NpdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbmRlcih0aGlzLl9mcnVzdHVtKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmFwcC5rZXlib2FyZD8ud2FzUHJlc3NlZChwYy5LRVlfTCkpIHtcclxuICAgICAgICAgICAgdGhpcy5fdGVycmFpbi5wcmludExvZE1hcCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuYXBwLmtleWJvYXJkPy53YXNQcmVzc2VkKHBjLktFWV9QKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9zYXZlSGVpZ2h0TWFwVG9JbWcoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmFwcC5rZXlib2FyZD8ud2FzUHJlc3NlZChwYy5LRVlfTykpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2F2ZUhlaWdodE1hcFRvRmlsZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBEZWJ1Z1xyXG4gICAgICAgIC8vdGhpcy5hcHAuZHJhd1RleHR1cmUoLTAuNSwgLTAuNiwgMC41LCAwLjMsICh0aGlzLnRlcnJhaW5SZW5kZXJlci5wYXRjaGVzU3RvcmUgYXMgYW55KS5faGVpZ2h0TWFwLCB1bmRlZmluZWQgYXMgYW55KTtcclxuICAgICAgICAvL3RoaXMuYXBwLmRyYXdUZXh0dXJlKCAwLjUsIC0wLjYsIDAuNSwgMC4zLCB0aGlzLnBhaW50ZXJTZXR0aW5ncy5zcGxhdE1hcC5yZXNvdXJjZSwgdW5kZWZpbmVkIGFzIGFueSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJpZ1RlcnJhaW5FZGl0b3I7XHJcbmV4cG9ydCBjb25zdCBiaWdUZXJyYWluRWRpdG9yU2NyaXB0TmFtZSA9IFwiYmlnVGVycmFpbkVkaXRvclwiO1xyXG5cclxucGMucmVnaXN0ZXJTY3JpcHQoQmlnVGVycmFpbkVkaXRvciwgYmlnVGVycmFpbkVkaXRvclNjcmlwdE5hbWUpO1xyXG5cclxuQmlnVGVycmFpbkVkaXRvci5hdHRyaWJ1dGVzLmFkZChcInVzZUluc3RhbmNpbmdBY2NlbGVyYXRvclwiLCB7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0OiBmYWxzZSwgfSk7XHJcbkJpZ1RlcnJhaW5FZGl0b3IuYXR0cmlidXRlcy5hZGQoXCJjYXN0U2hhZG93XCIsIHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHQ6IHRydWUsIH0pO1xyXG5CaWdUZXJyYWluRWRpdG9yLmF0dHJpYnV0ZXMuYWRkKFwicmVjZWl2ZVNoYWRvd1wiLCB7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0OiB0cnVlLCB9KTtcclxuQmlnVGVycmFpbkVkaXRvci5hdHRyaWJ1dGVzLmFkZChcInpGYXJcIiwgeyB0eXBlOiBcIm51bWJlclwiLCBkZWZhdWx0OiA1MDAwLCBtaW46IDEsIHN0ZXA6IDEsIHByZWNpc2lvbjogMCwgfSk7XHJcbkJpZ1RlcnJhaW5FZGl0b3IuYXR0cmlidXRlcy5hZGQoXCJ3aWR0aFwiLCB7IHR5cGU6IFwibnVtYmVyXCIsIGVudW06IHRlcnJhaW5TaXplRW51bSwgZGVmYXVsdDogdGVycmFpblNpemVFbnVtRGVmYXVsdCB9KTtcclxuQmlnVGVycmFpbkVkaXRvci5hdHRyaWJ1dGVzLmFkZChcImRlcHRoXCIsIHsgdHlwZTogXCJudW1iZXJcIiwgZW51bTogdGVycmFpblNpemVFbnVtLCBkZWZhdWx0OiB0ZXJyYWluU2l6ZUVudW1EZWZhdWx0IH0pO1xyXG5CaWdUZXJyYWluRWRpdG9yLmF0dHJpYnV0ZXMuYWRkKFwicGF0Y2hTaXplXCIsIHsgdHlwZTogXCJudW1iZXJcIiwgZW51bTogdGVycmFpblBhdGNoU2l6ZUVudW0sIGRlZmF1bHQ6IHRlcnJhaW5QYXRjaFNpemVFbnVtRGVmYXVsdCB9KTtcclxuQmlnVGVycmFpbkVkaXRvci5hdHRyaWJ1dGVzLmFkZChcImhlaWdodFwiLCB7IHR5cGU6IFwibnVtYmVyXCIsIGRlZmF1bHQ6IDEwLCBtaW46IDEgfSk7XHJcbkJpZ1RlcnJhaW5FZGl0b3IuYXR0cmlidXRlcy5hZGQoXCJjb21wcmVzc0FsZ29yaXRtXCIsIHsgdHlwZTogXCJzdHJpbmdcIiwgZW51bTogdGVycmFpbkhlaWdodHNDb21wcmVzc0FsZ29yaXRtLCBkZWZhdWx0OiB0ZXJyYWluSGVpZ2h0c0NvbXByZXNzQWxnb3JpdG1EZWZhdWx0IH0pO1xyXG5cclxuQmlnVGVycmFpbkVkaXRvci5hdHRyaWJ1dGVzLmFkZChcImxheWVyXCIsIHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdDogJ1RlcnJhaW5FZGl0b3InIH0pO1xyXG5CaWdUZXJyYWluRWRpdG9yLmF0dHJpYnV0ZXMuYWRkKFwiYXV0b1JlbmRlclwiLCB7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0OiB0cnVlIH0pO1xyXG5CaWdUZXJyYWluRWRpdG9yLmF0dHJpYnV0ZXMuYWRkKFwiY2FtZXJhRW50aXR5XCIsIHsgdHlwZTogXCJlbnRpdHlcIiB9KTtcclxuQmlnVGVycmFpbkVkaXRvci5hdHRyaWJ1dGVzLmFkZChcInBhaW50aW5nXCIsIHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHQ6IGZhbHNlIH0pO1xyXG5CaWdUZXJyYWluRWRpdG9yLmF0dHJpYnV0ZXMuYWRkKFwid2lyZWZyYW1lXCIsIHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHQ6IGZhbHNlIH0pO1xyXG5cclxuQmlnVGVycmFpbkVkaXRvci5hdHRyaWJ1dGVzLmFkZChcImhlaWdodE1hcFwiLCB7XHJcbiAgICB0eXBlOiAnanNvbicsXHJcbiAgICBzY2hlbWE6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdmaWxlJyxcclxuICAgICAgICAgICAgdHlwZTogJ2Fzc2V0JyxcclxuICAgICAgICAgICAgYXNzZXRUeXBlOiAnYmluYXJ5JyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogJ3RleHR1cmUnLFxyXG4gICAgICAgICAgICB0eXBlOiBcImFzc2V0XCIsXHJcbiAgICAgICAgICAgIGFzc2V0VHlwZTogJ3RleHR1cmUnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnc21vb3RoRmFjdG9yJyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGBcclxuICAgICAgICAgICAgICAgIFRvIHdoYXQgZXh0ZW50IG5laWdoYm9ycyBpbmZsdWVuY2UgdGhlIG5ldyBoZWlnaHQ6XHJcbiAgICAgICAgICAgICAgICBWYWx1ZSBvZiAwIHdpbGwgaWdub3JlIG5laWdoYm9ycyAobm8gc21vb3RoaW5nKS5cclxuICAgICAgICAgICAgICAgIFZhbHVlIG9mIDEgd2lsbCBpZ25vcmUgdGhlIG5vZGUgb2xkIGhlaWdodC5cclxuICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgdHlwZTogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgZGVmYXVsdDogMSxcclxuICAgICAgICAgICAgbWluOiAwLFxyXG4gICAgICAgICAgICBtYXg6IDEsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdzbW9vdGhSYWRpdXMnLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogYFRoZSByYWRpdXMgb2YgZmFjdG9yIHNtb290aC5gLFxyXG4gICAgICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiAxLFxyXG4gICAgICAgICAgICBzdGVwOiAxLFxyXG4gICAgICAgICAgICBtaW46IDEsXHJcbiAgICAgICAgfVxyXG4gICAgXVxyXG59KTtcclxuXHJcbkJpZ1RlcnJhaW5FZGl0b3IuYXR0cmlidXRlcy5hZGQoXCJicnVzaFwiLCB7XHJcbiAgICB0eXBlOiBcImpzb25cIixcclxuICAgIHNjaGVtYTogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJhY3RpdmVcIixcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIGJydXNoIHRleHR1cmUgaW5kZXguXCIsXHJcbiAgICAgICAgICAgIHR5cGU6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IDAsXHJcbiAgICAgICAgICAgIG1pbjogMCxcclxuICAgICAgICAgICAgc3RlcDogMSxcclxuICAgICAgICAgICAgcHJlY2lzaW9uOiAwLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiBcInNpemVcIixcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIGJydXNoIHNpemVcIixcclxuICAgICAgICAgICAgdHlwZTogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgZGVmYXVsdDogMTAsXHJcbiAgICAgICAgICAgIG1pbjogYnJ1c2hNaW5TaXplLFxyXG4gICAgICAgICAgICBtYXg6IGJydXNoTWF4U2l6ZSxcclxuICAgICAgICAgICAgc3RlcDogMSxcclxuICAgICAgICAgICAgcHJlY2lzaW9uOiAwLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiBcIm9wYWNpdHlcIixcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIGJydXNoIG9wYWNpdHlcIixcclxuICAgICAgICAgICAgdHlwZTogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgZGVmYXVsdDogMC41LFxyXG4gICAgICAgICAgICBtaW46IDAsXHJcbiAgICAgICAgICAgIG1heDogMSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJ0ZXh0dXJlc1wiLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJUaGUgYnJ1c2ggdGV4dHVyZXNcIixcclxuICAgICAgICAgICAgdHlwZTogXCJhc3NldFwiLFxyXG4gICAgICAgICAgICBhc3NldFR5cGU6ICd0ZXh0dXJlJyxcclxuICAgICAgICAgICAgYXJyYXk6IHRydWUsXHJcbiAgICAgICAgfVxyXG4gICAgXVxyXG59KTtcclxuXHJcbkJpZ1RlcnJhaW5FZGl0b3IuYXR0cmlidXRlcy5hZGQoXCJhY3RpdmVMYXllclwiLCB7IHR5cGU6ICdudW1iZXInLCBkZWZhdWx0OiAwLCBtaW46IDAsIG1heDogMzIsIHN0ZXA6IDEsIHByZWNpc2lvbjogMCB9KTtcclxuXHJcbkJpZ1RlcnJhaW5FZGl0b3IuYXR0cmlidXRlcy5hZGQoXCJsYXllcnNcIiwge1xyXG4gICAgdHlwZTogXCJqc29uXCIsXHJcbiAgICBhcnJheTogdHJ1ZSxcclxuICAgIHNjaGVtYTogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJuYW1lXCIsXHJcbiAgICAgICAgICAgIHRpdGxlOiBcIk5hbWVcIixcclxuICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJkaWZmdXNlXCIsXHJcbiAgICAgICAgICAgIHRpdGxlOiBcIkRpZmZ1c2VcIixcclxuICAgICAgICAgICAgdHlwZTogXCJhc3NldFwiLFxyXG4gICAgICAgICAgICBhc3NldFR5cGU6IFwidGV4dHVyZVwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiBcIm5vcm1hbE1hcFwiLFxyXG4gICAgICAgICAgICB0aXRsZTogXCJOb3JtYWwgTWFwXCIsXHJcbiAgICAgICAgICAgIHR5cGU6IFwiYXNzZXRcIixcclxuICAgICAgICAgICAgYXNzZXRUeXBlOiBcInRleHR1cmVcIixcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJzaXplXCIsXHJcbiAgICAgICAgICAgIHRpdGxlOiBcIlNpemVcIixcclxuICAgICAgICAgICAgdHlwZTogXCJ2ZWMyXCIsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IFsxLCAxXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiBcIm9mZnNldFwiLFxyXG4gICAgICAgICAgICB0aXRsZTogXCJPZmZzZXRcIixcclxuICAgICAgICAgICAgdHlwZTogXCJ2ZWMyXCIsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IFswLCAwXVxyXG4gICAgICAgIH0sXHJcbiAgICBdXHJcbn0pO1xyXG5cclxuQmlnVGVycmFpbkVkaXRvci5hdHRyaWJ1dGVzLmFkZChcInBhaW50ZXJTZXR0aW5nc1wiLCB7XHJcbiAgICB0eXBlOiBcImpzb25cIixcclxuICAgIHNjaGVtYTogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJzcGxhdE1hcFwiLFxyXG4gICAgICAgICAgICB0eXBlOiBcImFzc2V0XCIsXHJcbiAgICAgICAgICAgIGFzc2V0VHlwZTogXCJ0ZXh0dXJlXCIsXHJcbiAgICAgICAgICAgIHRpdGxlOiBcIlNwbGF0IE1hcFwiLFxyXG4gICAgICAgIH0sXHJcbiAgICBdXHJcbn0pOyIsIlxyXG5leHBvcnQgY2xhc3MgRmllbGRJbnN0YW5jaW5nIGV4dGVuZHMgcGMuU2NyaXB0VHlwZSB7XHJcblxyXG4gICAgcHVibGljIGluaXRpYWxpemUoKTogdm9pZCB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwb3N0SW5pdGlhbGl6ZSgpOiB2b2lkIHtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlKGR0OiBudW1iZXIpOiB2b2lkIHtcclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEZpZWxkSW5zdGFuY2luZztcclxuZXhwb3J0IGNvbnN0IGZpZWxkSW5zdGFuY2luZ1NjcmlwdE5hbWUgPSBcImZpZWxkSW5zdGFuY2luZ1wiOyIsImV4cG9ydCBjbGFzcyBGbHlDYW1lcmEgZXh0ZW5kcyBwYy5TY3JpcHRUeXBlIHtcclxuXHJcbiAgICBkZWNsYXJlIHB1YmxpYyByZWFkb25seSBtb2RlOiBudW1iZXI7XHJcbiAgICBkZWNsYXJlIHB1YmxpYyByZWFkb25seSBzcGVlZDogbnVtYmVyO1xyXG4gICAgZGVjbGFyZSBwdWJsaWMgcmVhZG9ubHkgc2xvd1NwZWVkOiBudW1iZXI7XHJcbiAgICBkZWNsYXJlIHB1YmxpYyByZWFkb25seSBmYXN0U3BlZWQ6IG51bWJlcjtcclxuICAgIGRlY2xhcmUgcHVibGljIHJlYWRvbmx5IHNlbnNpdGl2aXR5OiBudW1iZXI7XHJcbiAgICBkZWNsYXJlIHB1YmxpYyByZWFkb25seSBtb2JpbGVDb250cm9sczogcGN4LkVudGl0eSB8IHVuZGVmaW5lZDtcclxuXHJcbiAgICBwcml2YXRlIGV4OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGV5OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIG1vdmVkOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBtaWRkbGVEb3duOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSByaWdodERvd246IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIG1vYmlsZUNvbnRyb2w6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBwdWJsaWMgaW5pdGlhbGl6ZSgpIHtcclxuXHJcbiAgICAgICAgLy8gQ2FtZXJhIGV1bGVyIGFuZ2xlIHJvdGF0aW9uIGFyb3VuZCB4IGFuZCB5IGF4ZXNcclxuICAgICAgICBjb25zdCBldWxlcnMgPSB0aGlzLmVudGl0eS5nZXRMb2NhbEV1bGVyQW5nbGVzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuZXggPSAoZXVsZXJzLnogLSBldWxlcnMueCk7XHJcbiAgICAgICAgdGhpcy5leSA9IChldWxlcnMueiAtIGV1bGVycy55KTtcclxuICAgICAgICB0aGlzLm1vdmVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5yaWdodERvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm1pZGRsZURvd24gPSBmYWxzZTtcclxuICAgIFxyXG4gICAgICAgIC8vIERpc2FibGluZyB0aGUgY29udGV4dCBtZW51IHN0b3BzIHRoZSBicm93c2VyIGRpc3BsYXlpbmcgYSBtZW51IHdoZW5cclxuICAgICAgICAvLyB5b3UgcmlnaHQtY2xpY2sgdGhlIHBhZ2VcclxuICAgICAgICBpZiAodGhpcy5hcHAubW91c2UpIHtcclxuICAgICAgICAgICAgdGhpcy5hcHAubW91c2UuZGlzYWJsZUNvbnRleHRNZW51KCk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLm1vdXNlLm9uKHBjLkVWRU5UX01PVVNFTU9WRSwgdGhpcy5vbk1vdXNlTW92ZSwgdGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLm1vdXNlLm9uKHBjLkVWRU5UX01PVVNFRE9XTiwgdGhpcy5vbk1vdXNlRG93biwgdGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLm1vdXNlLm9uKHBjLkVWRU5UX01PVVNFVVAsICAgdGhpcy5vbk1vdXNlVXAsIHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXBwZW5kKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5leCArPSB4O1xyXG4gICAgICAgIHRoaXMuZXkgKz0geTtcclxuICAgICAgICB0aGlzLmV4ID0gcGMubWF0aC5jbGFtcCh0aGlzLmV4LCAtOTAsIDkwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdHJhbnNsYXRlKHg6IG51bWJlciB8IHBjeC5WZWMzLCB5PzogbnVtYmVyLCB6PzogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNsYXRlTG9jYWwoeCwgeSwgeik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZShkdDogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgY2FtZXJhJ3Mgb3JpZW50YXRpb25cclxuICAgICAgICB0aGlzLmVudGl0eS5zZXRMb2NhbEV1bGVyQW5nbGVzKHRoaXMuZXgsIHRoaXMuZXksIDApO1xyXG4gICAgXHJcbiAgICAgICAgY29uc3QgYXBwID0gdGhpcy5hcHA7XHJcbiAgICBcclxuICAgICAgICBsZXQgc3BlZWQgPSB0aGlzLnNwZWVkO1xyXG4gICAgICAgIGlmIChhcHAua2V5Ym9hcmQ/LmlzUHJlc3NlZChwYy5LRVlfU1BBQ0UpKSB7XHJcbiAgICAgICAgICAgIHNwZWVkID0gdGhpcy5zbG93U3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhcHAua2V5Ym9hcmQ/LmlzUHJlc3NlZChwYy5LRVlfU0hJRlQpKSB7XHJcbiAgICAgICAgICAgIHNwZWVkID0gdGhpcy5mYXN0U3BlZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBKb3lwYWQgY29udHJvbFxyXG4gICAgICAgIGNvbnN0IGpveXN0aWNrTW92ZXIgPSB0b3VjaEpveXBhZD8uc3RpY2tzWydqb3lzdGljazAnXTtcclxuICAgICAgICBjb25zdCBqb3lzdGlja1JvdGVyID0gdG91Y2hKb3lwYWQ/LnN0aWNrc1snam95c3RpY2sxJ107XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQ29udHJvbHMgJiYgdG91Y2hKb3lwYWQ/LmJ1dHRvbnMud2FzUHJlc3NlZCgnYnV0dG9uMicpKSB7XHJcbiAgICAgICAgICAgIHRoaXMubW9iaWxlQ29udHJvbCA9ICF0aGlzLm1vYmlsZUNvbnRyb2w7XHJcbiAgICAgICAgICAgIHRoaXMubW9iaWxlQ29udHJvbHMuZW5hYmxlZCA9IHRoaXMubW9iaWxlQ29udHJvbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChqb3lzdGlja1JvdGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kKGpveXN0aWNrUm90ZXIueSwgLWpveXN0aWNrUm90ZXIueCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoam95c3RpY2tNb3Zlcikge1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zbGF0ZShzcGVlZCAqIGpveXN0aWNrTW92ZXIueCAqIGR0LCAwLCAtc3BlZWQgKiBqb3lzdGlja01vdmVyLnkgKiBkdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBVcGRhdGUgdGhlIGNhbWVyYSdzIHBvc2l0aW9uXHJcbiAgICAgICAgaWYgKGFwcC5rZXlib2FyZD8uaXNQcmVzc2VkKHBjLktFWV9VUCkgfHwgYXBwLmtleWJvYXJkPy5pc1ByZXNzZWQocGMuS0VZX1cpKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNsYXRlKDAsIDAsIC1zcGVlZCAqIGR0KTtcclxuICAgICAgICB9IGVsc2UgaWYgKGFwcC5rZXlib2FyZD8uaXNQcmVzc2VkKHBjLktFWV9ET1dOKSB8fCBhcHAua2V5Ym9hcmQ/LmlzUHJlc3NlZChwYy5LRVlfUykpIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2xhdGUoMCwgMCwgc3BlZWQgKiBkdCk7XHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgaWYgKGFwcC5rZXlib2FyZD8uaXNQcmVzc2VkKHBjLktFWV9MRUZUKSB8fCBhcHAua2V5Ym9hcmQ/LmlzUHJlc3NlZChwYy5LRVlfQSkpIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2xhdGUoLXNwZWVkICogZHQsIDAsIDApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYXBwLmtleWJvYXJkPy5pc1ByZXNzZWQocGMuS0VZX1JJR0hUKSB8fCBhcHAua2V5Ym9hcmQ/LmlzUHJlc3NlZChwYy5LRVlfRCkpIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2xhdGUoc3BlZWQgKiBkdCwgMCwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25Nb3VzZU1vdmUoZXZlbnQ6IHBjeC5Nb3VzZUV2ZW50KSB7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5tb2RlKSB7XHJcbiAgICAgICAgICAgIGlmICghcGMuTW91c2UuaXNQb2ludGVyTG9ja2VkKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMucmlnaHREb3duICYmXHJcbiAgICAgICAgICAgICF0aGlzLm1pZGRsZURvd24pXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgIFxyXG4gICAgXHJcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBjdXJyZW50IEV1bGVyIGFuZ2xlcywgY2xhbXAgdGhlIHBpdGNoLlxyXG4gICAgICAgIGlmICghdGhpcy5tb3ZlZCkge1xyXG4gICAgICAgICAgICAvLyBmaXJzdCBtb3ZlIGV2ZW50IGNhbiBiZSB2ZXJ5IGxhcmdlXHJcbiAgICAgICAgICAgIHRoaXMubW92ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5yaWdodERvd24pIHtcclxuICAgICAgICAgICAgdGhpcy5hcHBlbmQoXHJcbiAgICAgICAgICAgICAgICAtZXZlbnQuZHkgLyB0aGlzLnNlbnNpdGl2aXR5LFxyXG4gICAgICAgICAgICAgICAgLWV2ZW50LmR4IC8gdGhpcy5zZW5zaXRpdml0eVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMubWlkZGxlRG93bikge1xyXG5cclxuICAgICAgICAgICAgbGV0IHNwZWVkID0gdGhpcy5zcGVlZDtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYXBwLmtleWJvYXJkIS5pc1ByZXNzZWQocGMuS0VZX1NISUZUKSkge1xyXG4gICAgICAgICAgICAgICAgc3BlZWQgPSB0aGlzLmZhc3RTcGVlZDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy50cmFuc2xhdGUoLShldmVudC5keCAvIDUpICogc3BlZWQsIChldmVudC5keSAvIDUpICogc3BlZWQsIDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uTW91c2VEb3duKGV2ZW50OiBwY3guTW91c2VFdmVudCkge1xyXG5cclxuICAgICAgICAvLyBXaGVuIHRoZSBtb3VzZSBidXR0b24gaXMgY2xpY2tlZCB0cnkgYW5kIGNhcHR1cmUgdGhlIHBvaW50ZXJcclxuICAgICAgICBpZiAoIXRoaXMubW9kZSAmJiAhcGMuTW91c2UuaXNQb2ludGVyTG9ja2VkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5hcHAubW91c2UhLmVuYWJsZVBvaW50ZXJMb2NrKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uID09PSBwYy5NT1VTRUJVVFRPTl9SSUdIVCkge1xyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0RG93biA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChldmVudC5idXR0b24gPT09IHBjLk1PVVNFQlVUVE9OX01JRERMRSkge1xyXG4gICAgICAgICAgICB0aGlzLm1pZGRsZURvd24gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBvbk1vdXNlVXAoZXZlbnQ6IHBjeC5Nb3VzZUV2ZW50KSB7XHJcblxyXG4gICAgICAgIGlmIChldmVudC5idXR0b24gPT09IHBjLk1PVVNFQlVUVE9OX1JJR0hUKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmlnaHREb3duID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uID09PSBwYy5NT1VTRUJVVFRPTl9NSURETEUpIHtcclxuICAgICAgICAgICAgdGhpcy5taWRkbGVEb3duID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBGbHlDYW1lcmE7XHJcbmV4cG9ydCBjb25zdCBmbHlDYW1lcmFTY3JpcHROYW1lID0gJ2ZseUNhbWVyYSc7XHJcblxyXG5wYy5yZWdpc3RlclNjcmlwdChGbHlDYW1lcmEsIGZseUNhbWVyYVNjcmlwdE5hbWUpO1xyXG5cclxuXHJcbkZseUNhbWVyYS5hdHRyaWJ1dGVzLmFkZCgnbW9iaWxlQ29udHJvbHMnLCB7XHJcbiAgICB0eXBlOiAnZW50aXR5JyxcclxufSk7XHJcblxyXG5GbHlDYW1lcmEuYXR0cmlidXRlcy5hZGQoJ3NwZWVkJywge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0OiAxMFxyXG59KTtcclxuXHJcbkZseUNhbWVyYS5hdHRyaWJ1dGVzLmFkZCgnc2xvd1NwZWVkJywge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0OiAxXHJcbn0pO1xyXG5cclxuRmx5Q2FtZXJhLmF0dHJpYnV0ZXMuYWRkKCdmYXN0U3BlZWQnLCB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlZmF1bHQ6IDIwXHJcbn0pO1xyXG5cclxuRmx5Q2FtZXJhLmF0dHJpYnV0ZXMuYWRkKCdzZW5zaXRpdml0eScsIHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgbWluOiAxLFxyXG4gICAgZGVmYXVsdDogNVxyXG59KTtcclxuXHJcbkZseUNhbWVyYS5hdHRyaWJ1dGVzLmFkZCgnbW9kZScsIHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdDogMCxcclxuICAgIGVudW06IFt7XHJcbiAgICAgICAgXCJMb2NrXCI6IDBcclxuICAgIH0sIHtcclxuICAgICAgICBcIkRyYWdcIjogMVxyXG4gICAgfV1cclxufSk7IiwiY2xhc3MgRnBzQ291bnRlciBleHRlbmRzIHBjLlNjcmlwdFR5cGUge1xyXG5cclxuICAgIGZwczogeyB0aWNrKCk6IHZvaWQgfSB8IHVuZGVmaW5lZDtcclxuXHJcbiAgICBpbml0aWFsaXplKCk6IHZvaWQge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IGNvbnN0ciA9ICh3aW5kb3cgYXMgYW55KS5GUFNNZXRlcjtcclxuXHJcbiAgICAgICAgaWYgKGNvbnN0cikge1xyXG4gICAgICAgICAgICB0aGlzLmZwcyA9IG5ldyBjb25zdHIoe1xyXG4gICAgICAgICAgICAgICAgaGVhdDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGdyYXBoOiB0cnVlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoZHQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZnBzPy50aWNrKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEZwc0NvdW50ZXI7XHJcbmV4cG9ydCBjb25zdCBmcHNDb3VudGVyU2NyaXB0TmFtZSA9ICdGcHNDb3VudGVyJztcclxuXHJcbnBjLnJlZ2lzdGVyU2NyaXB0KEZwc0NvdW50ZXIsIGZwc0NvdW50ZXJTY3JpcHROYW1lKTsiLCJpbXBvcnQgQmlnVGVycmFpbkVkaXRvciwgeyBiaWdUZXJyYWluRWRpdG9yU2NyaXB0TmFtZSB9IGZyb20gXCIuL0JpZ1RlcnJhaW5FZGl0b3IubWpzXCI7XHJcbmltcG9ydCBCYXNlVGVycmFpbiBmcm9tIFwiLi4vVGVycmFpblN5c3RlbS9UZXJyYWluLm1qc1wiO1xyXG5pbXBvcnQgVGVycmFpblJlbmRlcmVyUHJlcGFyZXIgZnJvbSBcIi4uL1NjcmlwdEhlbHBlcnMvVGVycmFpblJlbmRlclByZXBhcmVyLm1qc1wiO1xyXG5pbXBvcnQgeyBncmFzc1NoYWRlckNodW5rcyB9IGZyb20gXCIuLi9TY3JpcHRIZWxwZXJzL0dyYXNzU2hhZGVyQ2h1bmtzLm1qc1wiO1xyXG5cclxuY29uc3QgcG9zID0gbmV3IHBjLlZlYzMoKTtcclxuY29uc3Qgcm90ID0gbmV3IHBjLlF1YXQoKTtcclxuY29uc3Qgc2NsID0gbmV3IHBjLlZlYzMoKTtcclxuY29uc3QgbWF0cml4ID0gbmV3IHBjLk1hdDQoKTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUdyYXNzUGF0Y2hEYXRhIHtcclxuICAgIG1lc2hJbnN0YW5jZTogcGN4Lk1lc2hJbnN0YW5jZTtcclxuICAgIHZlcnRleEJ1ZmZlcjogcGN4LlZlcnRleEJ1ZmZlcjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJVW5pZm9ybXMge1xyXG4gICAgcmVhZG9ubHkgY29sb3I6IHBjeC5Db2xvcjtcclxuICAgIHJlYWRvbmx5IHBpdGNoOiBudW1iZXI7XHJcbiAgICByZWFkb25seSB5YXc6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IGJlbmRTdHJlbmd0aDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgd2lkdGg6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IGhlaWdodDogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR3Jhc3MgZXh0ZW5kcyBwYy5TY3JpcHRUeXBlIHtcclxuXHJcbiAgICByZWFkb25seSB0ZXJyYWluRW50aXR5OiBwY3guRW50aXR5O1xyXG4gICAgcmVhZG9ubHkgYmFzZTogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgY291bnQ6IG51bWJlcjtcclxuICAgIHJlYWRvbmx5IHZlcnRleENvdW50OiBudW1iZXI7XHJcbiAgICByZWFkb25seSB1bmlmb3JtOiBJVW5pZm9ybXM7XHJcbiAgICByZWFkb25seSByZW5kZXJUeXBlOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBfbWF0ZXJpYWw6IHBjeC5TdGFuZGFyZE1hdGVyaWFsO1xyXG4gICAgcHJpdmF0ZSBfdGVycmFpblJlbmRlcmVyOiBUZXJyYWluUmVuZGVyZXJQcmVwYXJlcjtcclxuICAgIHByaXZhdGUgX3RlcnJhaW46IEJhc2VUZXJyYWluO1xyXG4gICAgcHJpdmF0ZSBfZGF0YUFycmF5OiBJR3Jhc3NQYXRjaERhdGFbXTtcclxuXHJcbiAgICBwcml2YXRlIF9zeW5jVW5pZm9ybSgpIHtcclxuICAgICAgICBpZiAodGhpcy5fbWF0ZXJpYWwpIHtcclxuICAgICAgICAgICAgdGhpcy5fbWF0ZXJpYWwuc2V0UGFyYW1ldGVyKCdncm91bmRfY29sb3InLCBbdGhpcy51bmlmb3JtLmNvbG9yLnIsIHRoaXMudW5pZm9ybS5jb2xvci5nLCB0aGlzLnVuaWZvcm0uY29sb3IuYl0pO1xyXG4gICAgICAgICAgICB0aGlzLl9tYXRlcmlhbC5zZXRQYXJhbWV0ZXIoJ3BpdGNoJywgdGhpcy51bmlmb3JtLnBpdGNoKTtcclxuICAgICAgICAgICAgdGhpcy5fbWF0ZXJpYWwuc2V0UGFyYW1ldGVyKCd5YXcnLCB0aGlzLnVuaWZvcm0ueWF3KTtcclxuICAgICAgICAgICAgdGhpcy5fbWF0ZXJpYWwuc2V0UGFyYW1ldGVyKCd3aWR0aCcsIHRoaXMudW5pZm9ybS53aWR0aCk7XHJcbiAgICAgICAgICAgIHRoaXMuX21hdGVyaWFsLnNldFBhcmFtZXRlcignaGVpZ2h0JywgdGhpcy51bmlmb3JtLmhlaWdodCk7XHJcbiAgICAgICAgICAgIHRoaXMuX21hdGVyaWFsLnNldFBhcmFtZXRlcignYmVuZFN0cmVuZ3RoJywgdGhpcy51bmlmb3JtLmJlbmRTdHJlbmd0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3VwZGF0ZVByaW1pdGl2ZSgpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IGRhdGEgb2YgdGhpcy5fZGF0YUFycmF5KSB7XHJcbiAgICAgICAgICAgIGRhdGEubWVzaEluc3RhbmNlLm1lc2gucHJpbWl0aXZlWzBdLnR5cGUgPSB0aGlzLnJlbmRlclR5cGU7XHJcbiAgICAgICAgICAgIGRhdGEubWVzaEluc3RhbmNlLm1lc2gucHJpbWl0aXZlWzBdLmJhc2UgPSB0aGlzLmJhc2U7XHJcbiAgICAgICAgICAgIGRhdGEubWVzaEluc3RhbmNlLm1lc2gucHJpbWl0aXZlWzBdLmNvdW50ID0gdGhpcy52ZXJ0ZXhDb3VudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdGlhbGl6ZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9uKCdhdHRyOnVuaWZvcm0nLCAoKSA9PiB0aGlzLl9zeW5jVW5pZm9ybSgpKTtcclxuICAgICAgICB0aGlzLm9uKCdhdHRyOnZlcnRleENvdW50JywgKCkgPT4gdGhpcy5fdXBkYXRlUHJpbWl0aXZlKCkpO1xyXG4gICAgICAgIHRoaXMub24oJ2F0dHI6cmVuZGVyVHlwZScsICgpID0+IHRoaXMuX3VwZGF0ZVByaW1pdGl2ZSgpKTtcclxuICAgICAgICB0aGlzLm9uKCdhdHRyOmJhc2UnLCAoKSA9PiB0aGlzLl91cGRhdGVQcmltaXRpdmUoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcG9zdEluaXRpYWxpemUoKTogdm9pZCB7XHJcblxyXG4gICAgICAgIGNvbnN0IHNjcmlwdCA9ICh0aGlzLnRlcnJhaW5FbnRpdHkuc2NyaXB0IS5nZXQoYmlnVGVycmFpbkVkaXRvclNjcmlwdE5hbWUpIGFzIEJpZ1RlcnJhaW5FZGl0b3IpO1xyXG5cclxuICAgICAgICB0aGlzLl90ZXJyYWluID0gc2NyaXB0LnRlcnJhaW47XHJcbiAgICAgICAgdGhpcy5fdGVycmFpblJlbmRlcmVyID0gc2NyaXB0LnRlcnJhaW5SZW5kZXJlcjtcclxuICAgICAgICBcclxuICAgICAgICAvLyBjcmVhdGUgc3RhbmRhcmQgbWF0ZXJpYWwgYW5kIGVuYWJsZSBpbnN0YW5jaW5nIG9uIGl0XHJcbiAgICAgICAgY29uc3QgbWF0ZXJpYWwgPSBuZXcgcGMuU3RhbmRhcmRNYXRlcmlhbCgpO1xyXG5cclxuICAgICAgICBjb25zdCBjaHVua3NTdG9yZSA9IGdyYXNzU2hhZGVyQ2h1bmtzO1xyXG4gICAgICAgIGNvbnN0IGNodW5rTmFtZXMgID0gT2JqZWN0LmtleXMoY2h1bmtzU3RvcmUpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBjaHVua05hbWUgb2YgY2h1bmtOYW1lcykge1xyXG4gICAgICAgICAgICBtYXRlcmlhbC5jaHVua3NbY2h1bmtOYW1lXSA9IGNodW5rc1N0b3JlW2NodW5rTmFtZV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtYXRlcmlhbC5jaHVua3MuQVBJVmVyc2lvbiA9IHBjLkNIVU5LQVBJXzFfNzA7XHJcbiAgICAgICAgbWF0ZXJpYWwuY3VsbCA9IHBjLkNVTExGQUNFX05PTkU7XHJcbiAgICAgICAgLy9tYXRlcmlhbC5hbHBoYVRvQ292ZXJhZ2UgPSBmYWxzZTtcclxuICAgICAgICBtYXRlcmlhbC51cGRhdGUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWwgPSBtYXRlcmlhbDtcclxuICAgICAgICB0aGlzLl9kYXRhQXJyYXkgPSBuZXcgQXJyYXkodGhpcy5fdGVycmFpbi5udW1QYXRjaGVzWCAqIHRoaXMuX3RlcnJhaW4ubnVtUGF0Y2hlc1opO1xyXG5cclxuICAgICAgICB0aGlzLl9zeW5jVW5pZm9ybSgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCB6ID0gMDsgeiA8IHRoaXMuX3RlcnJhaW4ubnVtUGF0Y2hlc1o7IHorKykge1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aGlzLl90ZXJyYWluLm51bVBhdGNoZXNYOyB4KyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gdGhpcy5fY3JlYXRlSW5zKHgsIHosIHRoaXMuX3RlcnJhaW4sIG1hdGVyaWFsKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kYXRhQXJyYXlbeiAqIHRoaXMuX3RlcnJhaW4ubnVtUGF0Y2hlc1ggKyB4XSA9IGRhdGE7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGNvbnN0IGdyYXNzRW50aXR5ID0gbmV3IHBjLkVudGl0eSgnR3Jhc3NUZXN0Jyk7XHJcbiAgICAgICAgICAgICAgICBncmFzc0VudGl0eS5hZGRDb21wb25lbnQoJ3JlbmRlcicpO1xyXG4gICAgICAgICAgICAgICAgZ3Jhc3NFbnRpdHkucmVuZGVyIS5jYXN0U2hhZG93cyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZ3Jhc3NFbnRpdHkucmVuZGVyIS5jYXN0U2hhZG93c0xpZ2h0bWFwID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBncmFzc0VudGl0eS5yZW5kZXIhLm1lc2hJbnN0YW5jZXMgPSBbZGF0YS5tZXNoSW5zdGFuY2VdO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMudGVycmFpbkVudGl0eS5hZGRDaGlsZChncmFzc0VudGl0eSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3VwZGF0ZUhlaWdodHMoaW5kZXg6IG51bWJlcikge1xyXG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMuX2RhdGFBcnJheVtpbmRleF07XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0UmFuZG9tKG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY3JlYXRlSW5zKHBhdGNoWDogbnVtYmVyLCBwYXRjaFo6IG51bWJlciwgdGVycmFpbjogQmFzZVRlcnJhaW4sIG1hdGVyaWFsOiBwY3guU3RhbmRhcmRNYXRlcmlhbCk6IElHcmFzc1BhdGNoRGF0YSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHN0YXJ0WCA9IHBhdGNoWCAqIHRlcnJhaW4ucGF0Y2hTaXplO1xyXG4gICAgICAgIGNvbnN0IHN0YXJ0WiA9IHBhdGNoWiAqIHRlcnJhaW4ucGF0Y2hTaXplO1xyXG4gICAgICAgIGNvbnN0IHN0ZXAgICA9ICh0ZXJyYWluLnBhdGNoU2l6ZSAtIDEpICoqIDIgLyAodGhpcy5jb3VudCAvIDQpO1xyXG4gICAgICAgIGNvbnN0IHN0ZXBIZWxmID0gc3RlcCAvIDI7XHJcblxyXG4gICAgICAgIGNvbnN0IG1hdHJpY2VzID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLmNvdW50ICogMTYpO1xyXG5cclxuICAgICAgICBsZXQgbWF0cml4SW5kZXggPSAwO1xyXG5cclxuICAgICAgICBmb3IgKGxldCB6ID0gMDsgeiA8IHRlcnJhaW4ucGF0Y2hTaXplOyB6ICs9IHN0ZXApIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGVycmFpbi5wYXRjaFNpemU7IHggKz0gc3RlcCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsWCAgPSBzdGFydFggKyB4O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxaICA9IHN0YXJ0WiArIHo7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB5ID0gdGVycmFpbi5oZWlnaHRNYXAuZ2V0SGVpZ2h0SW50ZXJwb2xhdGVkKGxvY2FsWCwgbG9jYWxaKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCByYW5kWCA9IGxvY2FsWCA+IDAgPyB0aGlzLl9nZXRSYW5kb20obG9jYWxYIC0gc3RlcEhlbGYsIGxvY2FsWCArIHN0ZXBIZWxmKSA6IDA7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByYW5kWiA9IGxvY2FsWiA+IDAgPyB0aGlzLl9nZXRSYW5kb20obG9jYWxaIC0gc3RlcEhlbGYsIGxvY2FsWiArIHN0ZXBIZWxmKSA6IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgcG9zLnNldChyYW5kWCwgeSwgcmFuZFopO1xyXG4gICAgICAgICAgICAgICAgcm90LnNldEZyb21FdWxlckFuZ2xlcygwLCB0aGlzLl9nZXRSYW5kb20oMCwgMzYwKSwgMCk7XHJcbiAgICAgICAgICAgICAgICBzY2wuc2V0KDEsIDEsIDEpO1xyXG4gICAgICAgICAgICAgICAgbWF0cml4LnNldFRSUyhwb3MsIHJvdCwgc2NsKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBtID0gMDsgbSA8IDE2OyBtKyspIG1hdHJpY2VzW21hdHJpeEluZGV4KytdID0gbWF0cml4LmRhdGFbbV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG1lc2ggPSBuZXcgcGMuTWVzaCh0aGlzLmFwcC5ncmFwaGljc0RldmljZSwgeyBzdG9yYWdlSW5kZXg6IHRydWUsIHN0b3JhZ2VWZXJ0ZXg6IHRydWUgfSk7XHJcbiAgICAgICAgY29uc3Qgc2VnbWVudHMgPSA2O1xyXG4gICAgICAgIGNvbnN0IFZFUlRJQ0VTID0gKHNlZ21lbnRzICsgMSkgKiAyO1xyXG4gICAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IG5ldyBVaW50MzJBcnJheShWRVJUSUNFUyAqIDIpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgVkVSVElDRVMgKiAyOyArK2kpIHtcclxuICAgICAgICAgICAgcG9zaXRpb25zW2ldID0gaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHZlcnRleEZvcm1hdCA9IG5ldyBwYy5WZXJ0ZXhGb3JtYXQodGhpcy5hcHAuZ3JhcGhpY3NEZXZpY2UsIFt7XHJcbiAgICAgICAgICAgIHNlbWFudGljOiBwYy5TRU1BTlRJQ19QT1NJVElPTixcclxuICAgICAgICAgICAgdHlwZTogcGMuVFlQRV9VSU5UMzIsXHJcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IDEsXHJcbiAgICAgICAgICAgIG5vcm1hbGl6ZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGFzSW50OiB0cnVlLFxyXG4gICAgICAgIH1dLCBwb3NpdGlvbnMubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgbWVzaC52ZXJ0ZXhCdWZmZXIgPSBuZXcgcGMuVmVydGV4QnVmZmVyKHRoaXMuYXBwLmdyYXBoaWNzRGV2aWNlLCB2ZXJ0ZXhGb3JtYXQsIHBvc2l0aW9ucy5sZW5ndGgsIHtcclxuICAgICAgICAgICAgdXNhZ2U6IHBjLkJVRkZFUl9TVEFUSUMsXHJcbiAgICAgICAgICAgIHN0b3JhZ2U6IHRydWUsXHJcbiAgICAgICAgICAgIGRhdGE6IHBvc2l0aW9ucyxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbWVzaC5wcmltaXRpdmVbMF0udHlwZSAgICA9IHRoaXMucmVuZGVyVHlwZTtcclxuICAgICAgICBtZXNoLnByaW1pdGl2ZVswXS5pbmRleGVkID0gZmFsc2U7XHJcbiAgICAgICAgbWVzaC5wcmltaXRpdmVbMF0uYmFzZSAgICA9IHRoaXMuYmFzZTtcclxuICAgICAgICBtZXNoLnByaW1pdGl2ZVswXS5jb3VudCAgID0gdGhpcy52ZXJ0ZXhDb3VudDtcclxuXHJcbiAgICAgICAgLy9jb25zdCBtZXNoID0gcGMuTWVzaC5mcm9tR2VvbWV0cnkodGhpcy5hcHAuZ3JhcGhpY3NEZXZpY2UsIG5ldyBwYy5Cb3hHZW9tZXRyeSgpKTtcclxuXHJcbiAgICAgICAgLy8gaW5pdGlhbGl6ZSBpbnN0YW5jaW5nIHVzaW5nIHRoZSB2ZXJ0ZXggYnVmZmVyIG9uIG1lc2hJbnN0YW5jZSBvZiB0aGUgY3JlYXRlZCBib3hcclxuICAgICAgICBjb25zdCB2YkZvcm1hdCA9IHBjLlZlcnRleEZvcm1hdC5nZXREZWZhdWx0SW5zdGFuY2luZ0Zvcm1hdCh0aGlzLmFwcC5ncmFwaGljc0RldmljZSk7XHJcbiAgICAgICAgY29uc3QgdmVydGV4QnVmZmVyID0gbmV3IHBjLlZlcnRleEJ1ZmZlcih0aGlzLmFwcC5ncmFwaGljc0RldmljZSwgdmJGb3JtYXQsIHRoaXMuY291bnQsIHtcclxuICAgICAgICAgICAgZGF0YTogbWF0cmljZXNcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgbWVzaEluc3RhbmNlID0gbmV3IHBjLk1lc2hJbnN0YW5jZShtZXNoLCBtYXRlcmlhbCk7XHJcblxyXG4gICAgICAgIG1lc2hJbnN0YW5jZS5zZXRJbnN0YW5jaW5nKHZlcnRleEJ1ZmZlcik7XHJcblxyXG4gICAgICAgIG1lc2hJbnN0YW5jZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgbWVzaEluc3RhbmNlLmNhc3RTaGFkb3cgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbWVzaEluc3RhbmNlLFxyXG4gICAgICAgICAgICB2ZXJ0ZXhCdWZmZXJcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShkdDogbnVtYmVyKTogdm9pZCB7XHJcblxyXG4gICAgICAgIGZvciAobGV0IHogPSAwOyB6IDwgdGhpcy5fdGVycmFpbi5udW1QYXRjaGVzWjsgeisrKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMuX3RlcnJhaW4ubnVtUGF0Y2hlc1g7IHgrKykge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ICA9IHogKiB0aGlzLl90ZXJyYWluLm51bVBhdGNoZXNYICsgeDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMuX3RlcnJhaW5SZW5kZXJlci5wYXRjaGVzU3RvcmUuYnVmZmVyQXJyYXlbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSAgID0gdGhpcy5fZGF0YUFycmF5W2luZGV4XTtcclxuXHJcbiAgICAgICAgICAgICAgICBkYXRhLm1lc2hJbnN0YW5jZS52aXNpYmxlID0gYnVmZmVyLnZpc2libGUgJiYgYnVmZmVyLmxvZC5jb3JlIDwgMTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoYnVmZmVyLmhlaWdodHNVcGRhdGVkVGhpc0ZyYW1lKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUhlaWdodHMoaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHcmFzcztcclxuZXhwb3J0IGNvbnN0IGdyYXNzU2NyaXB0TmFtZSA9IFwiZ3Jhc3NcIjtcclxuXHJcbnBjLnJlZ2lzdGVyU2NyaXB0KEdyYXNzLCBncmFzc1NjcmlwdE5hbWUpO1xyXG5cclxuR3Jhc3MuYXR0cmlidXRlcy5hZGQoXCJ0ZXJyYWluRW50aXR5XCIsIHsgdHlwZTogJ2VudGl0eScgfSk7XHJcbkdyYXNzLmF0dHJpYnV0ZXMuYWRkKFwiYmFzZVwiLCB7IHR5cGU6IFwibnVtYmVyXCIsIGRlZmF1bHQ6IDAsIHN0ZXA6IDEsIHByZWNpc2lvbjogMCwgbWluOiAwIH0pO1xyXG5HcmFzcy5hdHRyaWJ1dGVzLmFkZChcImNvdW50XCIsIHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogMTAwLCBzdGVwOiAxLCBwcmVjaXNpb246IDAsIG1pbjogMSwgbWF4OiAxMDAwMDAwIH0pO1xyXG5HcmFzcy5hdHRyaWJ1dGVzLmFkZChcInZlcnRleENvdW50XCIsIHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogMTAsIG1pbjogMCwgc3RlcDogMSwgcHJlY2lzaW9uOiAwIH0pO1xyXG5HcmFzcy5hdHRyaWJ1dGVzLmFkZChcInJlbmRlclR5cGVcIiwgeyB0eXBlOiBcIm51bWJlclwiLCBkZWZhdWx0OiBwYy5QUklNSVRJVkVfVFJJQU5HTEVTLCAgZW51bTogW1xyXG4gICAgeydQb2ludHMnOiBwYy5QUklNSVRJVkVfUE9JTlRTIH0sXHJcbiAgICB7J0xpbmVzJzogcGMuUFJJTUlUSVZFX0xJTkVTIH0sXHJcbiAgICB7J0xpbmUgTG9vcCc6IHBjLlBSSU1JVElWRV9MSU5FTE9PUCB9LFxyXG4gICAgeydMaW5lIFN0cmlwJzogcGMuUFJJTUlUSVZFX0xJTkVTVFJJUCB9LFxyXG4gICAgeydUcmlhbmdsZXMnOiBwYy5QUklNSVRJVkVfVFJJQU5HTEVTIH0sXHJcbiAgICB7J1RyaWFuZ2xlcyBGYW4nOiBwYy5QUklNSVRJVkVfVFJJRkFOIH0sXHJcbiAgICB7J1RyaWFuZ2xlcyBTdHJpcCc6IHBjLlBSSU1JVElWRV9UUklTVFJJUCB9LFxyXG5dIH0pO1xyXG5HcmFzcy5hdHRyaWJ1dGVzLmFkZChcInVuaWZvcm1cIiwgeyB0eXBlOiAnanNvbicsIHNjaGVtYTogW1xyXG4gICAge1xyXG4gICAgICAgIG5hbWU6IFwiY29sb3JcIixcclxuICAgICAgICB0eXBlOiBcInJnYlwiLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiBcImJlbmRTdHJlbmd0aFwiLFxyXG4gICAgICAgIHR5cGU6IFwibnVtYmVyXCIsXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6IFwicGl0Y2hcIixcclxuICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiBcInlhd1wiLFxyXG4gICAgICAgIHR5cGU6IFwibnVtYmVyXCIsXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6IFwid2lkdGhcIixcclxuICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiBcImhlaWdodFwiLFxyXG4gICAgICAgIHR5cGU6IFwibnVtYmVyXCIsXHJcbiAgICB9LFxyXG5dIH0pOyIsImltcG9ydCB7IGZsb2F0IH0gZnJvbSBcIi4vVHlwZXMubWpzXCI7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgRXVjbGlkZWFuIGRpc3RhbmNlIGJldHdlZW4gdGhlIHR3byBnaXZlbiBwb2ludHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZVgxWjFYMloyKHgxOiBmbG9hdCwgejE6IGZsb2F0LCB4MjogZmxvYXQsIHoyOiBmbG9hdCkge1xuICAgIGNvbnN0IGR4ID0geDEgLSB4MjtcbiAgICBjb25zdCBkeiA9IHoxIC0gejI7XG4gICAgY29uc3QgbHMgPSBkeCAqIGR4ICsgZHogKiBkejtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KGxzKTtcbn1cblxuZXhwb3J0IGNvbnN0IFZlY3RvcjJNYXRoID0ge1xuICAgIGRpc3RhbmNlWDFaMVgyWjIsXG59XG5cbmV4cG9ydCBkZWZhdWx0IFZlY3RvcjJNYXRoOyIsIjsoKCkgPT4ge1xyXG4gICAgaWYgKHdpbmRvdy5fX19hbWRfX19yZXF1aXJlUmVzb2x2ZXIpIHtcclxuICAgICAgICB3aW5kb3cuX19fYW1kX19fcmVxdWlyZVJlc29sdmVyKCk7XHJcbiAgICB9XHJcbn0pKCk7Il19