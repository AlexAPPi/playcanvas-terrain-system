import { drawDirectionVector, drawPoint } from "../Extras/Debug.mjs";
import MidpointDispHeightfield from "../Core/MidpointDispHeightfield.mjs";
import HeightfieldRaycastResult from "../Core/HeightfieldRaycastResult.mjs";
import HeightMap from "../Core/HeightMap.mjs";
import type { IBrushSettings } from "../Heightfield/Brush.mjs";
import ColorPainter from "../Heightfield/ColorPainter.mjs";
import { fieldHeightValueTypeDefault, fieldHeightValueTypeEnum, fieldPatchSizeEnum, fieldPatchSizeEnumDefault, fieldSizeEnum, fieldSizeEnumDefault } from "../Heightfield/Enums.mjs";
import { cameraPositionParamName, layersDiffuseParamName, layersFlagsParamName, layersOffsetParamName, layersScaleParamName, maxHeightParamName, splatMapParamName, } from "../Heightfield/ShaderChunks.mjs";
import HeightfieldShape from "../Core/HeightfieldShape.mjs";
import PatchedHeightMap, { TValueType } from "../Core/PatchedHeightMap.mjs";
import { mapTitleEnum } from "../Extras/EnumConverter.mjs";
import { getBuffer } from "../AmmoIntegration/AmmoIntegration.mjs";
import type { IHeightMapFileImportOptions } from "../Core/AbsHeightMapFileIO.mjs";
import LodState from "../Core/LodState.mjs";
import GPUHeightMapBuffer from "../Heightfield/GPUHeightMapBuffer.mjs";
import PatchesSphereBuffer from "../Core/PatchesSphereBuffer.mjs";
import PatchesManager from "../Core/PatchesManager.mjs";
import MeshInstanceFactory from "../Heightfield/MeshInstanceFactory.mjs";
import GPUBuffersManager from "../Heightfield/GPUBuffersManager.mjs";
import ViewPatchesRenderPreparer from "../Heightfield/ViewPatchesRenderPreparer.mjs";
import GPUWireframeBufferManager from "../Heightfield/GPUWireframeBuffersManager.mjs";
import ShadowPatchesRenderPreparer from "../Heightfield/ShadowPatchesRenderPreparer.mjs";

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

export interface IDirectionLightShadowAttribute {
    readonly zFar: number;
    readonly layerName: string;
    readonly visible: boolean;
}

export interface IDirectionLightShadowScope {
    entity: pcx.Entity;
    lodState: LodState;
    preparer: ShadowPatchesRenderPreparer;
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
}

export class Terrain extends pc.ScriptType {

    declare readonly renderMode: RenderMode;
    declare readonly lodByYPos: boolean;
    declare readonly zFar: number;
    declare readonly width: number;
    declare readonly depth: number;
    declare readonly height: number;
    declare readonly valueType: TValueType;
    declare readonly patchSize: number;
    declare readonly receiveShadow: boolean;
    declare readonly directionLightShadowSettings: IDirectionLightShadowAttribute[];

    declare readonly autoRender: boolean;
    declare readonly wireframe: boolean;
    declare readonly painting: boolean;
    declare readonly cameraEntity: pcx.Entity | undefined;
    declare readonly heightMap: ITerrainHeightMapAttribute;
    declare readonly brush: ITerrainBrushAttribute;
    declare readonly activeLayer: number;
    declare readonly layerName: string;
    declare readonly paintLayerName: string;
    declare readonly layers: ITerrainLayerAttribute[];
    declare readonly painterSettings: ITerrainPainterSettingsAttribute;

    public get shape() { return this._heightFieldShape; }
    public get object() { return this._terrain; }

    private _lock = 0;

    public get lock() { return this._lock; }

    private _localCameraPosition = new pc.Vec3();
    private _terrain: MidpointDispHeightfield;
    private _roughness = 1.0;

    private _heightFieldShape: HeightfieldShape;
    private _raycastResult: HeightfieldRaycastResult;
    private _rayStart = new pc.Vec3();
    private _rayEnd = new pc.Vec3();
    private _rayDirection = new pc.Vec3();
    private _ray = new pc.Ray();
    private _cameraPos = new Array<number>(3);

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
    private _layersDiffuse: pcx.Texture | undefined;

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
        this._updateDirectionLightShadows();

        this._updateBrush();
        this._updatePainterMaterial();
        this._updateHeightMapFromAttr();

        this.on('attr:renderMode', () => {
            this._viewPatchesPreparer.setInstancingType(
                this.renderMode === RenderMode.CombineInstancingAccelerator ? 'combine' :
                this.renderMode === RenderMode.InstancingAccelerator ? 'simple' :
                false
            );
        });

        this.on('attr:receiveShadow', () => {
            this._viewPatchesPreparer.receiveShadow = this.receiveShadow;
        });

        this.on('attr:wireframe', () => {
            this._viewPatchesPreparer.wireframe = this.wireframe;

            if (!this.wireframe) {
                this._wireframeBuffersManager.free();
            }
        });

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
            this._spheresBuffer.recalculate();
            this._meshFactory.updateAabb();
            this._viewPatchesPreparer.updateAabb();
            this._updateMaterialParameters();
        });

        this.on('attr:zFar', () => {
            this._viewPatchesLodState.setZFar(this.zFar);
        });

        this.on('attr:directionLightShadowSettings', () => {
            this._updateDirectionLightShadows();
        });
    }

    private _initBrush() {
        const splatMap = this.painterSettings.splatMap.resource as pcx.Texture;
        this._brushHeightMap = new HeightMap(256, 256, 100);
        this._colorPainter = new ColorPainter(this.app, splatMap, this.paintLayerName);
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

        let buffer: any = undefined;

        if (typeof Ammo !== 'undefined') {

            buffer = getBuffer(this.width, this.depth, this.patchSize, chunkSize, this.valueType);

            const ht = this.valueType === '32f' ? 0 :
                       this.valueType === '16u' ? 1 :
                                                  2 ;
            
            const hm = new Ammo.btAlexTerrainPatchedHeightMap(this.width, this.depth, this.patchSize, chunkSize, 0, this.height, ht, buffer.byteOffset);
            const shape = new Ammo.btAlexHeightfieldTerrainShape(hm, false);

            const groundTransform = new Ammo.btTransform();
            const position = new Ammo.btVector3(0, this.height / 2, 0);

            groundTransform.setIdentity();
            groundTransform.setOrigin(position);

            const groundMass = Number.MAX_SAFE_INTEGER;
            const groundLocalInertia = new Ammo.btVector3(0, 0, 0);
            const groundMotionState = new Ammo.btDefaultMotionState(groundTransform);
            const groundConstrInfo = new Ammo.btRigidBodyConstructionInfo(groundMass, groundMotionState, shape, groundLocalInertia);
            const groundBody = new Ammo.btRigidBody(groundConstrInfo);

            this.app.systems.rigidbody!.dynamicsWorld.addRigidBody(groundBody);

            Ammo.destroy(position);
            Ammo.destroy(groundTransform);
        }

        return buffer;
    }

    private _spheresBuffer: PatchesSphereBuffer;
    private _heightMapBuffer: GPUHeightMapBuffer;
    private _buffersManager: GPUBuffersManager;
    private _wireframeBuffersManager: GPUWireframeBufferManager;
    private _meshFactory: MeshInstanceFactory;
    private _patchesManager: PatchesManager;

    private _viewPatchesLodState: LodState;
    private _viewPatchesPreparer: ViewPatchesRenderPreparer;

    private _directionLightShadowScopes: IDirectionLightShadowScope[] = [];

    public get heightMapTexture() { return this._heightMapBuffer.texture; }
    public get aabb() { return this._meshFactory.aabb; }

    private _destroyDirectionLightScopes() {

        for (let i = 0; i < this._directionLightShadowScopes.length; i++) {

            const scope = this._directionLightShadowScopes[i];

            if (scope) {
                scope.preparer.destroy();
                scope.lodState.destroy();
                scope.entity.destroy();

                this._patchesManager.removeState(scope.preparer);
                this.entity.removeChild(scope.entity);

            }
            
            delete this._directionLightShadowScopes[i];
        }
    }

    private _updateDirectionLightShadows() {

        this._destroyDirectionLightScopes();

        if (this._directionLightShadowScopes.length < this.directionLightShadowSettings.length) {
            this._directionLightShadowScopes.length = this.directionLightShadowSettings.length;
        }

        const lodManager = this._patchesManager.lodManager;

        for (let i = 0; i < this.directionLightShadowSettings.length; i++) {

            const directionLightShadow = this.directionLightShadowSettings[i];

            if (directionLightShadow.visible) {

                const entity = new pc.Entity(`TerrainDirectionLightShadow_${i}`);
                const lodState = new LodState(lodManager, directionLightShadow.zFar);
                const preparer = new ShadowPatchesRenderPreparer(lodState, this._meshFactory, entity, directionLightShadow.layerName);
                
                this._patchesManager.addState(preparer);

                preparer.updateAabb();
                preparer.setInstancingType(
                    this.renderMode === RenderMode.CombineInstancingAccelerator ? 'combine' :
                    this.renderMode === RenderMode.InstancingAccelerator ? 'simple' :
                    false
                );

                this._directionLightShadowScopes[i] = {
                    preparer,
                    lodState,
                    entity
                };
                this.entity.addChild(entity);
            }
        }

        this._directionLightShadowScopes.length = this.directionLightShadowSettings.length;

        this._updateMaterialParameters();
        this._updateLayers();
    }

    private _initTerrain() {
        
        const tmpChunkSize = this.patchSize * 2 - 1;
        const chunkSize = Math.min(this.width, this.depth, tmpChunkSize);
        const buffer = this._initHeightMapBuffer(chunkSize);
        const heightMap = new PatchedHeightMap(this.width, this.depth, this.patchSize, chunkSize, this.height, this.valueType, buffer);

        this._terrain = new MidpointDispHeightfield(heightMap);
        this._heightFieldShape = new HeightfieldShape(heightMap);
        this._raycastResult = new HeightfieldRaycastResult();

        this._spheresBuffer = new PatchesSphereBuffer(heightMap, this.entity.getWorldTransform());
        this._heightMapBuffer = new GPUHeightMapBuffer(this.app, this._terrain);
        this._buffersManager = new GPUBuffersManager(this._heightMapBuffer);
        this._wireframeBuffersManager = new GPUWireframeBufferManager(this._buffersManager, this._terrain.lodInfo);

        this._meshFactory = new MeshInstanceFactory(this._buffersManager, this._wireframeBuffersManager);
        this._patchesManager = new PatchesManager(this._terrain, this._spheresBuffer);

        this._viewPatchesLodState = new LodState(this._patchesManager.lodManager, this.zFar);
        this._viewPatchesPreparer = new ViewPatchesRenderPreparer(
            this._viewPatchesLodState,
            this._meshFactory,
            this.entity,
            this.layerName,
            {
                wireframe: this.wireframe,
                castShadow: false,
                receiveShadow: this.receiveShadow,
            }
        );

        this._patchesManager.addState(this._viewPatchesPreparer);

        this._viewPatchesPreparer.setInstancingType(
            this.renderMode === RenderMode.CombineInstancingAccelerator ? 'combine' :
            this.renderMode === RenderMode.InstancingAccelerator ? 'simple' :
            false
        );

        console.log(this._terrain, this._heightFieldShape, this._patchesManager);
    }

    private _updateMaterialParameters() {

        this._viewPatchesPreparer.material.setParameter(splatMapParamName, this._colorPainter.background);
        this._viewPatchesPreparer.material.setParameter(maxHeightParamName, this._terrain.maxHeight);

        for (let i = 0; i < this._directionLightShadowScopes.length; i++) {

            const item = this._directionLightShadowScopes[i];

            if (item) {
                item.preparer.material.setParameter(splatMapParamName, this._colorPainter.background);
                item.preparer.material.setParameter(maxHeightParamName, this._terrain.maxHeight);
            }
        }
    }

    private _updateMaterialCameraPos() {

        if (this.cameraEntity) {

            const cameraPos = this.cameraEntity.getPosition();
            this._cameraPos[0] = cameraPos.x;
            this._cameraPos[1] = cameraPos.y;
            this._cameraPos[2] = cameraPos.z;

            this._viewPatchesPreparer.material.setParameter(cameraPositionParamName, this._cameraPos);

            for (let i = 0; i < this._directionLightShadowScopes.length; i++) {

                const item = this._directionLightShadowScopes[i];
                
                if (item) {
                    item.preparer.material.setParameter(cameraPositionParamName, this._cameraPos);
                }
            }
        }
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
        let diffuses = [] as any[];
        let normals  = [];

        for (let i = 0; i < maxCount; i++) {

            let flag = 0;

            if (i < this.layers.length) {

                const layer     = this.layers[i];
                const diffuse   = layer.diffuse;
                const normalMap = layer.normalMap;

                if (diffuse) {

                    const diffuseTexture = diffuse.resource as pcx.Texture;

                    flag++;
                    length++;
                    diffuses.push(diffuseTexture.getSource());
                    scales.push(layer.size.x, layer.size.y);
                    offsets.push(layer.offset.x, layer.offset.y);

                    if (normalMap) {

                        const normalTexture = normalMap.resource as pcx.Texture;

                        flag++;
                        normals.push(normalTexture.getSource());
                    }
                }
            }

            flags.push(flag);
        }

        this._layersDiffuse?.destroy();
        //this._layersDiffuse = this.layers[0].diffuse.resource as pcx.Texture;
        this._layersDiffuse = new pc.Texture(this.app.graphicsDevice, {
            name: 'terrainLayersDiffuse',
            format: pc.PIXELFORMAT_SRGBA8,
            width: width,
            height: height,
            arrayLength: length,
            flipY: !this.app.graphicsDevice.isWebGPU,
            mipmaps: true,
            addressU: pc.ADDRESS_REPEAT,
            addressV: pc.ADDRESS_REPEAT,
            addressW: pc.ADDRESS_CLAMP_TO_EDGE,
            levels: [ diffuses ]
        });
        this._layersDiffuse.upload();

        console.log(this._layersDiffuse);
        
        this._viewPatchesPreparer.material.setParameter(layersDiffuseParamName, this._layersDiffuse);
        this._viewPatchesPreparer.material.setParameter(`${layersFlagsParamName}[0]`, flags);
        this._viewPatchesPreparer.material.setParameter(`${layersScaleParamName}[0]`, scales);
        this._viewPatchesPreparer.material.setParameter(`${layersOffsetParamName}[0]`, offsets);

        for (let i = 0; i < this._directionLightShadowScopes.length; i++) {

            const item = this._directionLightShadowScopes[i];
            
            if (item) {
                const material = item.preparer.material;
                material.setParameter(layersDiffuseParamName, this._layersDiffuse);
                material.setParameter(`${layersFlagsParamName}[0]`, flags);
                material.setParameter(`${layersScaleParamName}[0]`, scales);
                material.setParameter(`${layersOffsetParamName}[0]`, offsets);
            }
        }
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
            const settings: IHeightMapFileImportOptions = {
                adaptiveMaxHeight: true,
                adaptiveWidthAndDepth: true,
            }

            await this._terrain.loadHeightMapFromFile(data, settings, this.heightMap.smoothFactor, this.heightMap.smoothRadius);
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

        this._heightMapBuffer.updateHeightMap({ minX: 0, maxX: this.width, minZ: 0, maxZ: this.depth });
        this._spheresBuffer.recalculate();
        this._meshFactory.updateAabb();
        this._viewPatchesPreparer.updateAabb();
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

            this._updateMaterialCameraPos();

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
                            this._heightMapBuffer.updateHeightMap(zone);
                            this._spheresBuffer.recalculateZone(zone);
                            hasChanges = true;
                        }
                    }
                }
            }
            
            tmpMat.invert(mat);
            tmpMat.transformPoint(camera.entity.getPosition(), this._localCameraPosition);

            this._patchesManager.updateLods(this._localCameraPosition, this.lodByYPos);
            this._patchesManager.update(camera.frustum);

            /*
            const spheres = this._spheresBuffer.spheres;
            for (let i = 0; i < spheres.length; i++) {
                const sphere = spheres[i];
                drawPoint({ center: sphere.center, radius: sphere.radius, numSegments: 10, depthTest: false, color: pc.Color.YELLOW });
            }
            //*/
        }

        if (this.app.keyboard?.wasPressed(pc.KEY_L)) {
            this._viewPatchesLodState.printLodMap();
        }

        if (this.app.keyboard?.wasPressed(pc.KEY_P)) {
            this._saveHeightMapToImg();
        }

        if (this.app.keyboard?.wasPressed(pc.KEY_O)) {
            this._saveHeightMapToFile();
        }

        // Debug
        // this.app.drawTexture( 0.5, -0.6, -0.5, 0.3, this.heightMapTexture, undefined as any);
    }
}

export default Terrain;
export const terrainScriptName = "Terrain";
export const bigTerrainEditorScriptName = "bigTerrainEditor";

pc.registerScript(Terrain, terrainScriptName);
pc.registerScript(Terrain, bigTerrainEditorScriptName);

Terrain.attributes.add("renderMode", { type: "number", enum: mapTitleEnum(RenderMode), default: RenderMode.Standard, });
Terrain.attributes.add("receiveShadow", { type: "boolean", default: true, });
Terrain.attributes.add("lodByYPos", { type: "boolean", default: true, });
Terrain.attributes.add("zFar", { type: "number", default: 5000, min: 1, step: 1, precision: 0, });
Terrain.attributes.add("width", { type: "number", enum: fieldSizeEnum, default: fieldSizeEnumDefault, });
Terrain.attributes.add("depth", { type: "number", enum: fieldSizeEnum, default: fieldSizeEnumDefault, });
Terrain.attributes.add("patchSize", { type: "number", enum: fieldPatchSizeEnum, default: fieldPatchSizeEnumDefault, });
Terrain.attributes.add("height", { type: "number", default: 10, min: 1, });
Terrain.attributes.add("valueType", { type: "string", enum: fieldHeightValueTypeEnum, default: fieldHeightValueTypeDefault, });
Terrain.attributes.add("layerName", { type: "string", default: 'World', });
Terrain.attributes.add("paintLayerName", { type: "string", default: 'TerrainEditor', });
Terrain.attributes.add("cameraEntity", { type: "entity" });
Terrain.attributes.add("autoRender", { type: "boolean", default: true, });
Terrain.attributes.add("painting", { type: "boolean", default: false, });
Terrain.attributes.add("wireframe", { type: "boolean", default: false, });

Terrain.attributes.add("directionLightShadowSettings", {
    type: "json",
    array: true,
    max: 4,
    schema: [
        {
            name: "zFar",
            type: "number",
            default: 5000,
            min: 1,
            step: 1,
            precision: 0,
        },
        {
            name: "layerName",
            type: "string",
            default: 'WorldShadow', 
        },
        {
            name: "visible",
            type: "boolean",
            default: true,
        }
    ]
});

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