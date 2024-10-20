import { drawDirectionVector, drawPoint } from "../Shared/Debug.mjs";
import { MidpointDispTerrain } from "../TerrainSystem/MidpointDispTerrain.mjs";
import TerrainRaycastResult from "../TerrainSystem/TerrainRaycastResult.mjs";
import HeightMap from "../TerrainSystem/HeightMap.mjs";
import TerrainRendererPreparer from "../ScriptHelpers/TerrainRendererPreparer.mjs";
import type { IBrushSettings } from "../ScriptHelpers/Brush.mjs";
import ColorPainter from "../ScriptHelpers/ColorPainter.mjs";
import TerrainPatches from "../ScriptHelpers/TerrainPatches.mjs";
import { terrainHeightsCompressAlgoritm, terrainHeightsCompressAlgoritmDefault, terrainPatchSizeEnum, terrainPatchSizeEnumDefault, terrainSizeEnum, terrainSizeEnumDefault } from "../ScriptHelpers/Enum.mjs";
import { terrainMaxHeightParamName, terrainMinHeightParamName, terrainSizeParamName, terrainSplatMapParamName, } from "../ScriptHelpers/TerrainPatchesShaderChunks.mjs";
import HeightfieldShape from "../TerrainSystem/HeightfieldShape.mjs";
import PatchedHeightMap from "../TerrainSystem/PatchedHeightMap.mjs";
import CompressedPatchedHeightMap, { TCompressAlgoritm } from "../TerrainSystem/CompressedPatchedHeightMap.mjs";

export interface ITerrainHeightMapAttribute {
    readonly texture: pcx.Asset;
    readonly smoothFactor: number;
    readonly smoothRadius: number;
}

export interface ITerrainBrushAttribute extends IBrushSettings {
}

export interface ITerrainLayerAttribute {
    readonly name: string,
    readonly diffuse: pcx.Asset;
    readonly normalMap: pcx.Asset;
    readonly size: pcx.Vec2;
    readonly offset: pcx.Vec2;
}

export interface ITerrainPainterSettingsAttribute {
    readonly splatMap: pcx.Asset;
}

const brushMinSize = 2;
const brushMaxSize = 250;
const tmpVec = new pc.Vec3();
const tmpRad = new pc.Vec3();
const tmpMat = new pc.Mat4();
const tmpSphere = new pc.BoundingSphere();
const terrainLocalVertexPos = new pc.Vec3();

export class BigTerrainEditor extends pc.ScriptType {

    declare readonly useInstancingAccelerator: boolean;
    declare readonly zFar: number;
    declare readonly width: number;
    declare readonly depth: number;
    declare readonly height: number;
    declare readonly compressAlgoritm: TCompressAlgoritm | 'none';
    declare readonly patchSize: number;
    declare readonly castShadow: boolean;
    declare readonly receiveShadow: boolean;

    declare readonly layer: string;
    declare readonly layer2: string;
    declare readonly autoRender: boolean;
    declare readonly wireframe: boolean;
    declare readonly painting: boolean;
    declare readonly cameraEntity: pcx.Entity | undefined;
    declare readonly heightMap: ITerrainHeightMapAttribute;
    declare readonly brush: ITerrainBrushAttribute;
    declare readonly activeLayer: number;
    declare readonly layers: ITerrainLayerAttribute[];
    declare readonly painterSettings: ITerrainPainterSettingsAttribute;

    public get shape() { return this._heightFieldShape; }
    public get terrain() { return this._terrain; }
    public get terrainRenderer() { return this._renderer; }

    private _localCameraPosition = new pc.Vec3();
    private _terrain: MidpointDispTerrain;
    private _roughness = 1.0;

    private _minHeight = 0.0;

    private _heightFieldShape: HeightfieldShape;
    private _raycastResult: TerrainRaycastResult;
    private _rayStart = new pc.Vec3();
    private _rayEnd = new pc.Vec3();
    private _rayDirection = new pc.Vec3();
    private _ray = new pc.Ray();

    private _lastMouseMoveEvent: pcx.MouseEvent;
    private _sphereInsideViewFrustumRadius: number;

    private _lastLodGridUpdate: number = 0;
    private _activeBrush: number;
    private _brushHeightMap: HeightMap;
    private _colorPainter: ColorPainter;
    private _brushSize: number;
    private _brushSizeStep: number = 1;
    private _brushOpacity: number;
    private _brushOpacityStep: number = 0.01;
    private _intersectsRayResult: boolean = false;
    private _material: pcx.StandardMaterial;
    private _layersDiffuse: pcx.Texture | undefined;

    private _renderer: TerrainRendererPreparer;

    public postInitialize(): void {
        
        this._initializeMouse();
        this._initializeKeyboard();

        this._initBrush();
        this._initTerrain();

        this._createTerrainMaterial();
        this._updateTerrainMaterialParameters();

        this._updateLayers();

        this._updateHeightMapFromImg();
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
            this._renderer.patchesStore.updateLods();
        });
    }

    private _initBrush() {
        this._brushHeightMap = new HeightMap(256, 256, 0, 100);
        this._colorPainter = new ColorPainter(this.app, this.painterSettings.splatMap.resource);
    }

    private _updatePainterMaterial() {
        this._colorPainter.updateSettings(this.brush, this.activeLayer);
    }

    private _updateBrush() {

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

    private _updateFrustumSphere() {
        this._sphereInsideViewFrustumRadius = (this.patchSize / 2) * Math.SQRT2 * 1.1;
    }

    private _initTerrain() {
        
        this._updateFrustumSphere();

        const tmpChunkSize = this.patchSize * 2 - 1;
        const chunkSize = Math.min(this.width, this.depth, tmpChunkSize);
        const heightMap = this.compressAlgoritm !== 'none'
        ? new CompressedPatchedHeightMap(this.width, this.depth, this.patchSize, chunkSize, this._minHeight, this.height, this.compressAlgoritm)
        : new PatchedHeightMap(this.width, this.depth, this.patchSize, chunkSize, this._minHeight, this.height);

        this._terrain = new MidpointDispTerrain(heightMap, this.zFar);
        this._heightFieldShape = new HeightfieldShape(heightMap);
        this._raycastResult = new TerrainRaycastResult();

        const patcher  = new TerrainPatches(this._terrain);
        this._renderer = new TerrainRendererPreparer(patcher, {
            wireframe: this.wireframe,
            castShadow: this.castShadow,
            receiveShadow: this.receiveShadow,
        });
        
        console.log(this._terrain, this._heightFieldShape, this._renderer);
    }

    private _createTerrainMaterial() {
        this._material = new pc.StandardMaterial();
        this._material.name = "Terrain Material";
    }

    private _updateTerrainMaterialParameters() {
        this._material.setParameter(terrainSplatMapParamName, this._colorPainter.background);
        this._material.setParameter(terrainSizeParamName, [this._terrain.width, this._terrain.depth]);
        this._material.setParameter(terrainMinHeightParamName, this._terrain.minHeight);
        this._material.setParameter(terrainMaxHeightParamName, this._terrain.maxHeight);
    }

    private _updateLayers() {

        // TODO
        const maxCount = 16;
        const width  = 1024;
        const height = 1024;

        let length   = 0;
        let flags    = [];
        let scales   = [];
        let offsets  = [];
        let diffuses = [];
        let normals  = [];

        for (let i = 0; i < maxCount; i++) {

            let flag = 0;

            if (i < this.layers.length) {

                const layer     = this.layers[i];
                const diffuse   = layer.diffuse;
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

        this._layersDiffuse?.destroy();
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
            levels: [ diffuses ]
        });
        this._layersDiffuse.upload();
        
        this._material.setParameter(`uTerrainLayersCount`, length);
        this._material.setParameter(`uTerrainLayersDiffuse`, this._layersDiffuse);
        this._material.setParameter(`uTerrainLayersFlags[0]`, flags);
        this._material.setParameter(`uTerrainLayersScale[0]`, scales);
        this._material.setParameter(`uTerrainLayersOffset[0]`, offsets);
    }

    private _updateMesh() {
        this._renderer.patchesStore.instancing.enabled = this.useInstancingAccelerator;
        this._renderer.patchesStore.update(this.app, this.entity, this._material);
    }
    
    private _initializeMouse() {
        this.app.mouse?.on(pc.EVENT_MOUSEMOVE, this._onMouseMove, this);
        this.app.mouse?.on(pc.EVENT_MOUSEWHEEL, this._onMouseWheel, this);
        this.on('destroy', () => {
            this.app.mouse?.off(pc.EVENT_MOUSEMOVE, this._onMouseMove, this);
            this.app.mouse?.off(pc.EVENT_MOUSEWHEEL, this._onMouseWheel, this);
        });
    }

    private _onMouseMove(event: pcx.MouseEvent) {
        this._lastMouseMoveEvent = event;
    }

    private _onMouseWheel(event: pcx.MouseEvent) {
        const candidate = this._brushSize + event.wheelDelta * this._brushSizeStep;
        this._brushSize = Math.min(Math.max(candidate, brushMinSize), brushMaxSize);
    }

    private _initializeKeyboard() {
        this.app.keyboard?.on(pc.EVENT_KEYDOWN, this._onKeyboardDown, this);
        this.app.keyboard?.on(pc.EVENT_KEYUP, this._onKeyboardUp, this);
        this.on('destroy', () => {
            this.app.mouse?.off(pc.EVENT_KEYDOWN, this._onKeyboardDown, this);
            this.app.mouse?.off(pc.EVENT_KEYUP, this._onKeyboardUp, this);
        });
    }

    private _keyAddLock = true;
    private _keySubLock = true;
    private _onKeyboardDown(event: pcx.KeyboardEvent) {

        if (this._keyAddLock === false && event.key === pc.KEY_ADD) {
            this._keyAddLock = true;
            this._brushOpacity = Math.max(this._brushOpacity + this._brushOpacityStep, 0);
        }

        if (this._keySubLock === false && event.key === pc.KEY_SUBTRACT) {
            this._keySubLock = true;
            this._brushOpacity = Math.min(this._brushOpacity - this._brushOpacityStep, 1);
        }
    }

    private _onKeyboardUp(event: pcx.KeyboardEvent) {
        if (event.key === pc.KEY_ADD) {
            this._keyAddLock = false;
        }
        else if (event.key === pc.KEY_SUBTRACT) {
            this._keySubLock = false;
        }
    }

    private _updateHeightMapFromImg() {

        const texture = this.heightMap.texture.resource as pcx.Texture;
        const img = texture.getSource() as any;

        if (!img) {
            console.error('Height map image unset.');
            return;
        }

        this._terrain.loadHeightMap(img, this.heightMap.smoothFactor, this.heightMap.smoothRadius);
        this._renderer.patchesStore.updateAabb();

        // TODO: clear heightmap
        texture.destroy();
    }

    private _saveToImg() {
        
        const base64 = this._terrain.heightMap.toImage();
        const image  = new Image();
        
        image.src = base64;

        const w = window.open(undefined, '_blank')!;
        w.document.write(image.outerHTML);
    }

    public update(dt: number) {

        if (this._colorPainter.painting) {
            this._colorPainter.stopPaint();
        }

        if (this.autoRender &&
            this.cameraEntity &&
            this.cameraEntity.camera) {

            const camera = this.cameraEntity.camera;
            const mat    = this.entity.getWorldTransform();
            const scale  = mat.getScale();

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

                    drawPoint({ center: this._raycastResult.point, radius: this._brushSize, numSegments: 10, depthTest: true, color: pc.Color.GRAY });
                    drawDirectionVector(this._raycastResult.point, this._raycastResult.normal, pc.Color.MAGENTA);
                    
                    if (this.app.mouse?.isPressed(pc.MOUSEBUTTON_LEFT)) {

                        if (this.painting) {

                            const width   = this._terrain.width - 1;
                            const depth   = this._terrain.depth - 1;
                            const x       = terrainLocalVertexPos.x / width;
                            const y       = terrainLocalVertexPos.z / depth;
                            const scaleW  = brushSizeX / width;
                            const scaleH  = brushSizeZ / depth;

                            this._colorPainter.startPaint(dt, x, y, scaleW, scaleH);
                        }
                        else {

                            const centerX = terrainLocalVertexPos.x | 0;
                            const centerZ = terrainLocalVertexPos.z | 0;

                            const zoneMinX = centerX - brushSizeX;
                            const zoneMaxX = centerX + brushSizeX + 1;
                            const zoneMinZ = centerZ - brushSizeZ;
                            const zoneMaxZ = centerZ + brushSizeZ + 1;

                            if (this.app.keyboard?.isPressed(pc.KEY_ALT)) {
                                this._terrain.smoothHeightsZone(zoneMinX, zoneMaxX, zoneMinZ, zoneMaxZ, this._brushOpacity, 1);
                            }
                            else {
                                const negative = !!this.app.keyboard?.isPressed(pc.KEY_CONTROL);
                                const average = (brushSizeX + brushSizeZ) / 2;
                                const appendValue = (negative ? -average : average) * (this._brushOpacity * dt);
                                this._terrain.appendHeightMap(this._brushHeightMap, appendValue, zoneMinX, zoneMaxX, zoneMinZ, zoneMaxZ, 100);
                                this._terrain.heightMap.recalculateMinMax(zoneMinX, zoneMaxX, zoneMinZ, zoneMaxZ);
                            }

                            this._renderer.patchesStore.updateHeights(zoneMinX, zoneMaxX, zoneMinZ, zoneMaxZ);
                            hasChanges = true;
                        }
                    }
                }
            }

            const frustum = camera.frustum;
            const isPointInsideViewFrustum = (localX: number, localY: number, localZ: number, radius?: number) => {
                let tmpRadius = (radius ? radius : this._sphereInsideViewFrustumRadius);
                tmpVec.set(localX, localY, localZ);
                tmpRad.set(tmpRadius, tmpRadius, tmpRadius).mul(scale);
                mat.transformPoint(tmpVec, tmpVec);
                // @ts-ignore
                tmpSphere.center = tmpVec;
                tmpSphere.radius = tmpRad.distance(pc.Vec3.ZERO);
                return frustum.containsSphere(tmpSphere) > 0;
            }

            tmpMat.copy(mat).invert();
            tmpMat.transformPoint(camera.entity.getPosition(), this._localCameraPosition);

            /*
            const now = performance.now();
            if (this._lastLodGridUpdate + 1500 < now) {
                this._lastLodGridUpdate = now;
                updateLodGrid = true;
            }
            */

            this._terrain.updateLods(this._localCameraPosition);
            this._renderer.render(isPointInsideViewFrustum);
        }

        if (this.app.keyboard?.wasPressed(pc.KEY_L)) {
            this._terrain.printLodMap();
        }

        if (this.app.keyboard?.wasPressed(pc.KEY_P)) {
            this._saveToImg();
        }
        
        // Debug
        //this.app.drawTexture(-0.5, -0.6, 0.5, 0.3, (this.terrainRenderer.patchesStore as any)._heightMap, undefined as any);
        //this.app.drawTexture( 0.5, -0.6, 0.5, 0.3, this.painterSettings.splatMap.resource, undefined as any);
    }
}

export default BigTerrainEditor;
export const bigTerrainEditorScriptName = "bigTerrainEditor";

pc.registerScript(BigTerrainEditor, bigTerrainEditorScriptName);

BigTerrainEditor.attributes.add("useInstancingAccelerator", { type: "boolean", default: false, });
BigTerrainEditor.attributes.add("castShadow", { type: "boolean", default: true, });
BigTerrainEditor.attributes.add("receiveShadow", { type: "boolean", default: true, });
BigTerrainEditor.attributes.add("zFar", { type: "number", default: 5000, min: 1, step: 1, precision: 0, });
BigTerrainEditor.attributes.add("width", { type: "number", enum: terrainSizeEnum, default: terrainSizeEnumDefault });
BigTerrainEditor.attributes.add("depth", { type: "number", enum: terrainSizeEnum, default: terrainSizeEnumDefault });
BigTerrainEditor.attributes.add("patchSize", { type: "number", enum: terrainPatchSizeEnum, default: terrainPatchSizeEnumDefault });
BigTerrainEditor.attributes.add("height", { type: "number", default: 10, min: 1 });
BigTerrainEditor.attributes.add("compressAlgoritm", { type: "string", enum: terrainHeightsCompressAlgoritm, default: terrainHeightsCompressAlgoritmDefault });

BigTerrainEditor.attributes.add("layer", { type: "string", default: 'TerrainEditor' });
BigTerrainEditor.attributes.add("autoRender", { type: "boolean", default: true });
BigTerrainEditor.attributes.add("cameraEntity", { type: "entity" });
BigTerrainEditor.attributes.add("painting", { type: "boolean", default: false });
BigTerrainEditor.attributes.add("wireframe", { type: "boolean", default: false });

BigTerrainEditor.attributes.add("heightMap", {
    type: 'json',
    schema: [
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