import { drawDirectionVector, drawPoint } from "../Shared/Debug.mjs";
import { MidpointDispTerrain } from "../TerrainSystem/MidpointDispTerrain.mjs";
import TerrainRaycastResult from "../TerrainSystem/TerrainRaycastResult.mjs";
import HeightMap from "../TerrainSystem/HeightMap.mjs";
import TerrainRenderPreparer from "../TerrainHelpers/TerrainRenderPreparer.mjs";
import type { IBrushSettings } from "../TerrainHelpers/Brush.mjs";
import ColorPainter from "../TerrainHelpers/ColorPainter.mjs";
import TerrainPatches from "../TerrainHelpers/TerrainPatches.mjs";
import { terrainHeightsCompressAlgoritm, terrainHeightsCompressAlgoritmDefault, terrainPatchSizeEnum, terrainPatchSizeEnumDefault, terrainSizeEnum, terrainSizeEnumDefault } from "../TerrainHelpers/Enums.mjs";
import { terrainMaxHeightParamName, terrainSplatMapParamName, } from "../TerrainHelpers/TerrainPatchesShaderChunks.mjs";
import HeightfieldShape from "../TerrainSystem/HeightfieldShape.mjs";
import PatchedHeightMap from "../TerrainSystem/PatchedHeightMap.mjs";
import CompressedPatchedHeightMap, { TCompressAlgoritm } from "../TerrainSystem/CompressedPatchedHeightMap.mjs";
import { Frustum } from "../Shared/Frustum.mjs";
import { mapTitleEnum } from "../Shared/EnumConverter.mjs";
import { getBuffer } from "../AmmoIntegration/AmmoIntegration.mjs";
import { TerrainPathcesInstancing } from "../TerrainHelpers/TerrainPatchesInstancing.mjs";
import { TerrainPathcesCombineInstancing } from "../TerrainHelpers/TerrainPatchesCombineInstancing.mjs";

export interface ITerrainHeightMapAttribute {
    readonly file: pcx.Asset;
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
const tmpMat = new pc.Mat4();
const terrainLocalVertexPos = new pc.Vec3();
const heightMapExt = '.hm';

export enum RenderMode {
    Standard = 1,
    InstancingAccelerator = 2,
    CombineInstancingAccelerator = 3,
    CustomForwardRenderer = 4,
}

export class Terrain extends pc.ScriptType {

    declare readonly renderMode: RenderMode;
    declare readonly lodByYPos: boolean;
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
    public get object() { return this._terrain; }
    public get patches() { return this._patchesStore; }
    public get renderPreparer() { return this._renderPreparer; }

    private _lock = 0;

    public get lock() { return this._lock; }

    private _localCameraPosition = new pc.Vec3();
    private _terrain: MidpointDispTerrain;
    private _patchesStore: TerrainPatches;
    private _roughness = 1.0;

    private _heightFieldShape: HeightfieldShape;
    private _raycastResult: TerrainRaycastResult;
    private _rayStart = new pc.Vec3();
    private _rayEnd = new pc.Vec3();
    private _rayDirection = new pc.Vec3();
    private _ray = new pc.Ray();

    private _lastMouseMoveEvent: pcx.MouseEvent;

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

    private _renderPreparer: TerrainRenderPreparer;
    private _frustum: Frustum;

    public addLock() {
        this._lock++;
    }

    public freeLock() {
        this._lock--;
    }

    public postInitialize(): void {
        
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
            this._renderPreparer.patchesStore.setMaterial(this._material);
            this._renderPreparer.patchesStore.setInstancing(
                this.renderMode === RenderMode.InstancingAccelerator ? new TerrainPathcesInstancing() :
                this.renderMode === RenderMode.CombineInstancingAccelerator ? new TerrainPathcesCombineInstancing() :
                undefined
            );
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
            this._terrain.setMaxHeight(this.height);
            this._updateTerrainMaterialParameters();
        });

        this.on('attr:zFar', () => {
            this._terrain.setZFar(this.zFar);
        });
    }

    private _initBrush() {
        const splatMap = this.painterSettings.splatMap.resource as pcx.Texture;
        this._brushHeightMap = new HeightMap(256, 256, 100);
        this._colorPainter = new ColorPainter(this.app, splatMap);
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

        const brushTexture = this.brush.textures[activeBrush].resource as pcx.Texture;
        const brushImg = brushTexture.getSource() as unknown as ImageBitmap;

        if (!brushImg) {
            console.error('Brush image unset.');
            return;
        }

        this._activeBrush = activeBrush;
        this._brushHeightMap.fromImage(brushImg);
        this._brushHeightMap.smooth(1, 1);

        console.log(this._brushHeightMap);
    }

    private _initHeightMapBuffer(chunkSize: number) {

        // TODO: Move to terrain collider
        // TODO: Ammo js integration

        const buffer: any = ((window as any).Ammo) ? getBuffer(this.width, this.depth, this.patchSize, chunkSize, this.compressAlgoritm) : undefined;

        if (((window as any).Ammo)) {
            
            const ht = this.compressAlgoritm === 'none' ? 0 :
                       this.compressAlgoritm === 'x2'   ? 1 :
                                                          2 ;
            
            const hm = new Ammo.btAlexTerrainPatchedHeightMap(this.width, this.depth, this.patchSize, chunkSize, 0, this.height, ht, buffer.byteOffset);
            const shape = new Ammo.btAlexHeightfieldTerrainShape(hm, false);

            const groundTransform = new Ammo.btTransform();

            groundTransform.setIdentity();
            groundTransform.setOrigin(new Ammo.btVector3(0, this.height / 2, 0));

            const groundMass = 0;
            const groundLocalInertia = new Ammo.btVector3(0, 0, 0);
            const groundMotionState = new Ammo.btDefaultMotionState(groundTransform);
            const groundBody = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(groundMass, groundMotionState, shape, groundLocalInertia));

            this.app.systems.rigidbody!.dynamicsWorld.addRigidBody(groundBody);
        }

        return buffer;
    }

    private _initTerrain() {
        
        const tmpChunkSize = this.patchSize * 2 - 1; // 257, 513, ...
        const chunkSize = Math.min(this.width, this.depth, tmpChunkSize);
        const buffer = this._initHeightMapBuffer(chunkSize);
        const heightMap = this.compressAlgoritm !== 'none'
        ? new CompressedPatchedHeightMap(this.width, this.depth, this.patchSize, chunkSize, this.height, this.compressAlgoritm, buffer)
        : new PatchedHeightMap(this.width, this.depth, this.patchSize, chunkSize, this.height, buffer);

        this._terrain = new MidpointDispTerrain(heightMap, this.zFar);
        this._heightFieldShape = new HeightfieldShape(heightMap);
        this._raycastResult = new TerrainRaycastResult();
        this._frustum = new Frustum();

        this._patchesStore = new TerrainPatches(this._terrain);
        this._renderPreparer = new TerrainRenderPreparer(this._patchesStore, {
            wireframe: this.wireframe,
            castShadow: this.castShadow,
            receiveShadow: this.receiveShadow,
        });
        
        console.log(this._terrain, this._heightFieldShape, this._renderPreparer);
    }

    private _createTerrainMaterial() {
        this._material = TerrainPatches.createMaterial();
    }

    private _updateTerrainMaterialParameters() {
        this._material.setParameter(terrainSplatMapParamName, this._colorPainter.background);
        this._material.setParameter(terrainMaxHeightParamName, this._terrain.maxHeight);
    }

    private _updateLayers() {

        // TODO
        const maxCount = 5;
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

                    const texture = diffuse.resource as pcx.Texture;

                    flag++;
                    length++;
                    diffuses.push(texture.getSource());
                    scales.push(layer.size.x, layer.size.y);
                    offsets.push(layer.offset.x, layer.offset.y);

                    if (normalMap) {
                        flag++;
                        normals.push((normalMap.resource as pcx.Texture).getSource());                    
                    }
                }
            }

            flags.push(flag);
        }

        this._layersDiffuse?.destroy();
        //this._layersDiffuse = this.layers[0].diffuse.resource as pcx.Texture;
        this._layersDiffuse = new pc.Texture(this.app.graphicsDevice, {
            name: 'terrainLayersDiffuse',
            format: pc.PIXELFORMAT_RGBA8,
            width: width,
            height: height,
            arrayLength: length,
            flipY: this.app.graphicsDevice.isWebGPU,
            //magFilter: pc.FILTER_LINEAR,
            //minFilter: pc.FILTER_LINEAR_MIPMAP_LINEAR,
            mipmaps: true,
            addressU: pc.ADDRESS_REPEAT,
            addressV: pc.ADDRESS_REPEAT,
            addressW: pc.ADDRESS_CLAMP_TO_EDGE,
            levels: [ diffuses as any ]
        });
        this._layersDiffuse.upload();

        console.log(this._layersDiffuse);

        this._material.setParameter(`uTerrainLayersCount`, length);
        this._material.setParameter(`uTerrainLayersDiffuse`, this._layersDiffuse);
        this._material.setParameter(`uTerrainLayersFlags[0]`, flags);
        this._material.setParameter(`uTerrainLayersScale[0]`, scales);
        this._material.setParameter(`uTerrainLayersOffset[0]`, offsets);
    }

    private _updateMesh() {
        this._renderPreparer.patchesStore.customForwardRenderer = this.renderMode === RenderMode.CustomForwardRenderer;
        this._renderPreparer.patchesStore.setInstancing(
            this.renderMode === RenderMode.InstancingAccelerator ? new TerrainPathcesInstancing() :
            this.renderMode === RenderMode.CombineInstancingAccelerator ? new TerrainPathcesCombineInstancing() :
            undefined
        );
        this._renderPreparer.patchesStore.init(this.app, this.entity, this._material);
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

    private async _updateHeightMapFromAttr() {

        if (this.heightMap.file) {

            if (!this.heightMap.file.resource) {
                console.warn('Height map file unset.');
                return;
            }

            const data = this.heightMap.file.resource as ArrayBuffer;
            await this._terrain.loadHeightMapFromFile(data, {
                adaptiveMaxHeight: true,
                adaptiveWidthAndDepth: true,
            });
        }
        else {

            const texture = this.heightMap.texture;

            if (!texture) {
                console.warn('Height map image unset.');
                return;
            }

            const resource = texture.resource as pcx.Texture;
            const img = resource.getSource() as any;

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
    }

    private _saveHeightMapToImg() {
        
        const base64 = this._terrain.heightMap.toImage();
        const image  = new Image();
        
        image.src = base64;

        const w = window.open(undefined, '_blank')!;
        w.document.write(image.outerHTML);
    }

    private async _saveHeightMapToFile() {

        const blob = await this._terrain.heightMap.toFile();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const timestamp = new Date();

        document.body.appendChild(a);

        a.href     = blobUrl;
        a.download = `hm_${+timestamp}${heightMapExt}`;
        a.click();

        URL.revokeObjectURL(blobUrl);
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

                    if (this.app.keyboard?.wasPressed(pc.KEY_I)) {
                        console.log(this._raycastResult, this._localCameraPosition, terrainLocalVertexPos);
                    }

                    drawPoint({ center: this._raycastResult.point, radius: this._brushSize, numSegments: 10, depthTest: true, color: pc.Color.GRAY });
                    drawDirectionVector(this._raycastResult.point, this._raycastResult.normal, pc.Color.MAGENTA);
                    
                    if (this._lock < 1 &&
                        this.app.mouse?.isPressed(pc.MOUSEBUTTON_LEFT)) {

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

                            const average = (brushSizeX + brushSizeZ) / 2;
                            const centerX = terrainLocalVertexPos.x | 0;
                            const centerZ = terrainLocalVertexPos.z | 0;
                            const zone = {
                                minX: centerX - brushSizeX,
                                maxX: centerX + brushSizeX + 1,
                                minZ: centerZ - brushSizeZ,
                                maxZ: centerZ + brushSizeZ + 1,
                            }

                            if (this.app.keyboard?.isPressed(pc.KEY_ALT)) {
                                this._terrain.smoothHeightsZone(zone, average * this._brushOpacity * dt / 10, 1);
                            }
                            else {
                                const negative = !!this.app.keyboard?.isPressed(pc.KEY_CONTROL);
                                const appendValue = (negative ? -average : average) * this._brushOpacity * dt / 10;
                                this._terrain.appendHeightMap(this._brushHeightMap, appendValue, zone);
                            }

                            if (this.app.keyboard?.wasPressed(pc.KEY_I)) {
                                console.log(zone);
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
            
            this._frustum.frustum   = camera.frustum;
            this._frustum.transform = mat;

            this._terrain.updateLods(this._localCameraPosition, this.lodByYPos, true);
            this._renderPreparer.update(this._frustum);
        }

        if (this.app.keyboard?.wasPressed(pc.KEY_L)) {
            this._terrain.printLodMap();
        }

        if (this.app.keyboard?.wasPressed(pc.KEY_P)) {
            this._saveHeightMapToImg();
        }

        if (this.app.keyboard?.wasPressed(pc.KEY_O)) {
            this._saveHeightMapToFile();
        }

        // Debug
        //this.app.drawTexture( 0.5, -0.6, 0.5, 0.3, this.painterSettings.splatMap.resource, undefined as any);
    }
}

export default Terrain;
export const terrainScriptName = "Terrain";
export const bigTerrainEditorScriptName = "bigTerrainEditor";

pc.registerScript(Terrain, terrainScriptName);
pc.registerScript(Terrain, bigTerrainEditorScriptName);

Terrain.attributes.add("renderMode", { type: "number", enum: mapTitleEnum(RenderMode), default: RenderMode.Standard, });
Terrain.attributes.add("castShadow", { type: "boolean", default: true, });
Terrain.attributes.add("receiveShadow", { type: "boolean", default: true, });
Terrain.attributes.add("lodByYPos", { type: "boolean", default: true, });
Terrain.attributes.add("zFar", { type: "number", default: 5000, min: 1, step: 1, precision: 0, });
Terrain.attributes.add("width", { type: "number", enum: terrainSizeEnum, default: terrainSizeEnumDefault, });
Terrain.attributes.add("depth", { type: "number", enum: terrainSizeEnum, default: terrainSizeEnumDefault, });
Terrain.attributes.add("patchSize", { type: "number", enum: terrainPatchSizeEnum, default: terrainPatchSizeEnumDefault, });
Terrain.attributes.add("height", { type: "number", default: 10, min: 1, });
Terrain.attributes.add("compressAlgoritm", { type: "string", enum: terrainHeightsCompressAlgoritm, default: terrainHeightsCompressAlgoritmDefault, });

Terrain.attributes.add("layer", { type: "string", default: 'TerrainEditor', });
Terrain.attributes.add("cameraEntity", { type: "entity" });
Terrain.attributes.add("autoRender", { type: "boolean", default: true, });
Terrain.attributes.add("painting", { type: "boolean", default: false, });
Terrain.attributes.add("wireframe", { type: "boolean", default: false, });

Terrain.attributes.add("heightMap", {
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

Terrain.attributes.add("brush", {
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

Terrain.attributes.add("activeLayer", { type: 'number', default: 0, min: 0, max: 32, step: 1, precision: 0, });

Terrain.attributes.add("layers", {
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

Terrain.attributes.add("painterSettings", {
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