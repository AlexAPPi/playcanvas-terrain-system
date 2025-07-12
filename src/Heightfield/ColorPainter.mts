import { IBrushSettings } from "./Brush.mjs";
import { fragmentInvertShader, fragmentShader, vertexShader } from "./ColorPainterShaders.mjs";
import { setPrecision } from "../Extras/Utils.mjs";

export const painterCameraFar = 10;

export default class ColorPainter {

    private _layerName: string;
    private _painting: boolean;
    private _painterMask: Float32Array;
    private _brushSettings: IBrushSettings;

    private _app: pcx.AppBase;
    private _buffer: pcx.Texture;
    private _painterRenderTarget: pcx.RenderTarget;
    private _painterCameraEntity: pcx.Entity;

    private _painterShader: pcx.Shader;
    private _painterMaterial: pcx.Material;
    private _painterEntity: pcx.Entity;

    private _painterInvertShader: pcx.Shader;
    private _painterInvertMaterial: pcx.Material;
    private _painterInvertEntity: pcx.Entity;

    public get painting()   { return this._painting; }
    public get cameraFar()  { return painterCameraFar; }
    public get background() { return this._buffer; }

    constructor(app: pcx.AppBase, buffer: pcx.Texture, layerName: string) {

        this._painting = false;
        this._painterMask = new Float32Array(4);
        this._layerName = layerName;
        this._buffer = buffer;
        this._app = app;

        this._initCamera();
        this._initShaders();
        this._initMaterials();
        this._initEntities();
    }

    private _initCamera() {

        const painterLayer = this._app.scene.layers.getLayerByName(this._layerName)!;

        this._painterRenderTarget = new pc.RenderTarget({
            colorBuffer: this._buffer,
            flipY: this._app.graphicsDevice.isWebGPU,
            depth: false,
        });

        this._painterCameraEntity = new pc.Entity('TerrainPainterCamera');
        this._painterCameraEntity.setLocalPosition(0, 0, painterCameraFar);
        this._painterCameraEntity.lookAt(0, 0, 0);
        this._painterCameraEntity.addComponent('camera', {
            projection: pc.PROJECTION_ORTHOGRAPHIC,
            clearColorBuffer: false,
            clearDepthBuffer: false,
            priority: -1,
            layers: [painterLayer.id],
            nearClip: 0.1,
            farClip: painterCameraFar * 2,
            renderTarget: this._painterRenderTarget,
        });

        this._app.root.addChild(this._painterCameraEntity);

        this._painterCameraEntity.enabled = false;
        this._painterCameraEntity.camera!.frustumCulling = false;
        this._painterCameraEntity.camera!.orthoHeight = painterCameraFar;
    }

    private _initEntities() {

        const painterLayer = this._app.scene.layers.getLayerByName(this._layerName)!;

        painterLayer.transparentSortMode = pc.SORTMODE_MANUAL;

        this._painterEntity  = new pc.Entity('TerrainBrushPainter');
        this._painterEntity.addComponent('render', {
            type: 'plane',
            layers: [painterLayer.id],
            material: this._painterMaterial,
            castShadows: false,
            castShadowsLightmap: false,
            receiveShadows: false
        });

        this._painterInvertEntity  = new pc.Entity('TerrainBrushPainterInvert');
        this._painterInvertEntity.addComponent('render', {
            type: 'plane',
            layers: [painterLayer.id],
            material: this._painterInvertMaterial,
            castShadows: false,
            castShadowsLightmap: false,
            receiveShadows: false,
        });

        this._painterEntity.render!.meshInstances[0].drawOrder = 1;
        this._painterInvertEntity.render!.meshInstances[0].drawOrder = 0;

        this._app.root.addChild(this._painterInvertEntity);
        this._app.root.addChild(this._painterEntity);

        this._painterInvertEntity.setLocalEulerAngles(90, 0, 0);
        this._painterEntity.setLocalEulerAngles(90, 0, 0);

        this._painterInvertEntity.enabled = false;
        this._painterEntity.enabled = false;
    }

    private _initShaders() {

        const vertex = vertexShader;
        const fragment = setPrecision(this._app.graphicsDevice, fragmentShader);
        const fragmentInvert = setPrecision(this._app.graphicsDevice, fragmentInvertShader);

        if (pc.ShaderMaterial) {

            this._painterMaterial = new pc.ShaderMaterial({
                uniqueName: 'TerrainPainterFragmentShader',
                vertexGLSL: vertex,
                fragmentGLSL: fragment,
                attributes: {
                    aPosition: pc.SEMANTIC_POSITION,
                    aUv0: pc.SEMANTIC_TEXCOORD0
                }
            });

            this._painterInvertMaterial = new pc.ShaderMaterial({
                uniqueName: 'TerrainPainterInvertFragmentShader',
                vertexGLSL: vertex,
                fragmentGLSL: fragmentInvert,
                attributes: {
                    aPosition: pc.SEMANTIC_POSITION,
                    aUv0: pc.SEMANTIC_TEXCOORD0
                }
            });

            return;
        }

        this._painterShader = pc.createShaderFromCode(this._app.graphicsDevice, vertex, fragment, 'TerrainPainterFragmentShader', {
            aPosition: pc.SEMANTIC_POSITION,
            aUv0: pc.SEMANTIC_TEXCOORD0
        });

        this._painterInvertShader = pc.createShaderFromCode(this._app.graphicsDevice, vertex, fragmentInvert, 'TerrainPainterInvertFragmentShader', {
            aPosition: pc.SEMANTIC_POSITION,
            aUv0: pc.SEMANTIC_TEXCOORD0
        });
    }

    private _initMaterials() {

        // Engine v1 not support ShaderMaterial
        // use old methods
        if (!pc.ShaderMaterial) {

            this._painterMaterial = new pc.Material();
            this._painterInvertMaterial = new pc.Material();
            
            /* @ts-ignore */
            this._painterMaterial.shader = this._painterShader;
            /* @ts-ignore */
            this._painterInvertMaterial.shader = this._painterInvertShader;
        }

        this._painterMaterial.name = 'BrushPainterMaterial';
        this._painterMaterial.blendType = pc.BLEND_ADDITIVE;
        this._painterMaterial.update();

        this._painterInvertMaterial.name = 'BrushPainterInvertMaterial';
        this._painterInvertMaterial.blendType = pc.BLEND_SUBTRACTIVE;
        this._painterInvertMaterial.update();
    }

    private _updateRuntimeSettings(dt: number) {
        const originalOpacity = this._brushSettings.opacity;
        const opacity = originalOpacity;
        this._painterMaterial.setParameter('uBrushOpacity', opacity);
        this._painterInvertMaterial.setParameter('uBrushOpacity', opacity);
    }

    private _updatePositionAndScale(x: number, y: number, scaleWidth: number, scaleHeight: number) {

        const far    = this.cameraFar * 2;
        const ration = this.background.width / this.background.height;

        x = x * far * ration - this.cameraFar * ration;
        y = y * far - this.cameraFar;

        scaleWidth  = scaleWidth  * this.background.width  / far / 2.5;
        scaleHeight = scaleHeight * this.background.height / far / 2.5;

        this._setScale(scaleWidth, scaleHeight);
        this._setPosition(x, y);
    }

    public startPaint(dt: number, x: number, y: number, scaleWidth: number, scaleHeight: number) {

        this._updateRuntimeSettings(dt);
        this._updatePositionAndScale(x, y, scaleWidth, scaleHeight);

        this._painting = true;
        this._painterInvertEntity.enabled = true;
        this._painterEntity.enabled = true;
        this._painterCameraEntity.enabled = true;
    }

    public stopPaint() {
        this._painting = false;
        this._painterInvertEntity.enabled = false;
        this._painterEntity.enabled = false;
        this._painterCameraEntity.enabled = false;
    }

    private _setScale(x: number, y: number) {
        this._painterEntity.setLocalScale(x, 1, y);
        this._painterInvertEntity.setLocalScale(x, 1, y);
    }

    private _setPosition(x: number, y: number) {
        this._painterEntity.setLocalPosition(x, y, 0);
        this._painterInvertEntity.setLocalPosition(x, y, 0);
    }

    public updateSettings(brushSettings: IBrushSettings, activeLayer: number) {

        this._painterMask.fill(0);

        if (activeLayer > 0) {
            this._painterMask[activeLayer - 1] = 1;
        }

        const brushTexture = brushSettings.textures[brushSettings.active].resource as pcx.Texture;

        this._painterMaterial.setParameter('uBrushMask', this._painterMask);
        this._painterMaterial.setParameter('uHeightMap', brushTexture);

        this._painterInvertMaterial.setParameter('uBrushMask', this._painterMask);
        this._painterInvertMaterial.setParameter('uHeightMap', brushTexture);

        this._brushSettings = brushSettings;
    }
}