import { GrassFieldTexture } from "../GrassField/GrassFieldTexture.mjs";
import { drawPosParamName, getGrassShaderChunks, lod2OffsetXZParamName, offsetAttrName, lod1OffsetXZParamName, shapeAttrName, timeParamName, vindexAttrName, windIntensityParamName, fieldScaleParamName } from "../GrassField/GrassShaderChunk.mjs";
import { drawBox } from "../Extras/Debug.mjs";
import Random from "../Extras/Random.mjs";
import { getHeightMapFormat } from "../Heightfield/GPUHeightMapBuffer.mjs";
import { heightMapParamName, maxHeightParamName } from "../Heightfield/ShaderChunks.mjs";
import Terrain from "./Terrain.mjs";

export interface IBufferStore {

    // Indices for a blade
    index: Uint16Array,

    // Tells the shader which vertex of the blade its working on.
    // Rather than supplying positions, they are computed from this vindex.
    indexVerts: Float32Array,

    // Shape properties of all blades
    // Positon & rotation of all blades
    offsetAndShape: Float32Array | Uint16Array, // webgpu not support float16 (Uint16Array = Float16Array)
}

export const quad1Matrix = [
    2, 2,  1, 2,  0, 2,
    0, 1,  0, 0,  1, 0,
    2, 0,  2, 1,  1, 1
];

export const quad2Matrix = [
    4, 4,  3, 4,  2, 4,  1, 4,
    0, 4,  0, 3,  0, 2,  0, 1,
    0, 0,  1, 0,  2, 0,  3, 0,
    4, 0,  4, 1,  4, 2,  4, 3
];

export const quadMatrixIndexes = [
    [4, 3, 2], // 0
    [5, 8, 1], // 1
    [6, 7, 0], // 2
];

const lod1QuadCount = 8;
const lod2QuadCount = 16;
const tmpMat = new pc.Mat4();

export interface IGrassTextureAttribute {
    readonly name: string,
    readonly diffuse: pcx.Asset;
    readonly color: pcx.Color;
    readonly colorRandom: pcx.Vec3;
}

export class GrassField extends pc.ScriptType {

    declare public readonly gridEntity: pcx.Entity;
    declare public readonly freezeDrawPos: boolean;
    declare public readonly autoRender: boolean;

    declare public readonly painting: boolean;
    declare public readonly wireframe: boolean;
    declare public readonly castShadow: boolean;
    declare public readonly receiveShadow: boolean;
    declare public readonly seed: number;
    declare public readonly windIntensity: number;
    declare public readonly numBlades: number;
    declare public readonly radius: number;
    declare public readonly lod0BladeSegs: number;
    declare public readonly lod1BladeSegs: number;
    declare public readonly lod2BladeSegs: number;
    declare public readonly bladeWidth: number;
    declare public readonly bladeMinHeight: number;
    declare public readonly bladeMaxHeight: number;
    declare public readonly textures: IGrassTextureAttribute[];

    public transitionLow = 0.31;
    public transitionHigh = 0.36;

    private _sharedIndexBuffer: pcx.IndexBuffer;
    private _sharedVertexBuffer: pcx.VertexBuffer;

    private _bufferStore: IBufferStore = {} as any;
    private _sharedInstancingBuffer: pcx.VertexBuffer;
    private _meshInst: pcx.MeshInstance;
    private _material: pcx.StandardMaterial;

    private _dataTexture: GrassFieldTexture;
    private _cameraEntity: pcx.Entity;
    private _terrain: Terrain;
    private _time: number = 0;
    private _lastDrawPos: pcx.Vec3 = new pc.Vec3();
    private _lod1MinMaxStore: Array<[pcx.Vec3, pcx.Vec3, boolean]> = [];
    private _lod2MinMaxStore: Array<[pcx.Vec3, pcx.Vec3, boolean]> = [];

    private _aabb: pcx.BoundingBox;

    private _offsetLod1Arr: number[] = [
        0, 0,  0, 0,
        0, 0,  0, 0,
        0, 0,  0, 0,
        0, 0,  0, 0,
    ];

    private _offsetLod2Arr: number[] = [
        0, 0,  0, 0,  0, 0,  0, 0,
        0, 0,  0, 0,  0, 0,  0, 0,
        0, 0,  0, 0,  0, 0,  0, 0,
        0, 0,  0, 0,  0, 0,  0, 0,
    ];

    public get checkRadius() { return this.radius / 2; }
    public get patchRadius() { return this.radius / 2; }

    public destroy() {

        this._sharedIndexBuffer?.destroy();
        this._sharedVertexBuffer?.destroy();
        this._sharedInstancingBuffer?.destroy();

        if (this._meshInst) {

            this._meshInst.instancingData?.vertexBuffer?.destroy();
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

    private _initBladesAndEditMode() {

        this._updateGrassMesh(this.app.graphicsDevice, this.patchRadius);

        if (this.painting) {
            this._terrain.addLock();
        }
    }

    public postInitialize(): void {

        const terrainEntity = this.entity.root.findByName('Terrain') as pcx.Entity;
        const terrainScript = terrainEntity.script?.get(Terrain) as Terrain;

        this._terrain      = terrainScript;
        this._cameraEntity = terrainScript.cameraEntity!;
        this._dataTexture  = new GrassFieldTexture(this.app.graphicsDevice, this._terrain.width, this._terrain.depth);

        // update set check is visible
        if (this._cameraEntity.camera?.frustum.planes &&
            this._cameraEntity.camera.frustum.planes[0] instanceof pc.Plane) {
            this._checkIsVisible = this._checkIsVisibleNew as any;
        }
        else {
            this._checkIsVisible = this._checkIsVisibleOld as any;
        }

        this._initBladesAndEditMode();

        this.on('enable', () => this._initBladesAndEditMode());
        this.on('disable', () => {
            this.destroy();
            this._terrain.freeLock();
        });

        this.on('attr:painting', () => {
            if (this.painting) { this._terrain.addLock(); }
            else               { this._terrain.freeLock(); }
        });
        
        this.on('attr:wireframe', () => {

            const primitive = this._meshInst?.mesh?.primitive;

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

        this.on('attr:seed',           () => this._updateMeshInstancing(this.app.graphicsDevice, this.patchRadius));
        this.on('attr:numBlades',      () => this._updateMeshInstancing(this.app.graphicsDevice, this.patchRadius));
        this.on('attr:bladeWidth',     () => this._updateMeshInstancing(this.app.graphicsDevice, this.patchRadius));
        this.on('attr:bladeMinHeight', () => this._updateMeshInstancing(this.app.graphicsDevice, this.patchRadius));
        this.on('attr:bladeMaxHeight', () => this._updateMeshInstancing(this.app.graphicsDevice, this.patchRadius));
        this.on('attr:radius',         () => this._updateGrassMesh(this.app.graphicsDevice, this.patchRadius));
        this.on('attr:lod0BladeSegs',  () => this._updateGrassMesh(this.app.graphicsDevice, this.patchRadius));
        this.on('attr:lod1BladeSegs',  () => this._updateGrassMesh(this.app.graphicsDevice, this.patchRadius));
    }

    public update(dt: number): void {

        const cameraPos = this._cameraEntity.getPosition();
        const existsTexs = !!this.textures && this.textures.length > 0;
        const color = existsTexs ? this.textures[0].color : pc.Color.WHITE;
        const rand  = existsTexs ? this.textures[0].colorRandom : pc.Vec3.ZERO;
        const tex   = existsTexs ? this.textures[0].diffuse.resource : null;

        if (!this.freezeDrawPos) {

            const mat = this.entity.getWorldTransform();

            tmpMat.invert(mat);
            tmpMat.transformPoint(cameraPos, this._lastDrawPos);
        }

        this._time += dt;
        this._material.setParameter(timeParamName, this._time);
        this._material.setParameter(windIntensityParamName, this.windIntensity);
        this._material.setParameter(drawPosParamName, [this._lastDrawPos.x, this._lastDrawPos.y, this._lastDrawPos.z]);
        this._material.setParameter('uDiffuseColor', [color.r, color.g, color.b]);
        this._material.setParameter('uDiffuseColorRandom', [rand.x, rand.y, rand.z]);
        this._material.setParameter('uDiffuseTex', tex as any);

        this._frustum(cameraPos, this._cameraEntity!.camera!.camera, this.freezeDrawPos);
    }

    public updateAabb() {
        
        const patchesAabb = this._terrain.aabb;

        if (this._meshInst) {
            this._meshInst.mesh.aabb = patchesAabb;
            this._meshInst.aabb = patchesAabb;
            this._meshInst.setCustomAabb(patchesAabb);
        }
    }

    private _checkIsVisible(min: pcx.Vec3, max: pcx.Vec3, frustumPlanes: pcx.Plane[] | number[][]) {
        return false;
    }

    private _checkIsVisibleOld(min: pcx.Vec3, max: pcx.Vec3, frustumPlanes: number[][]) {

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
    }

    private _checkIsVisibleNew(min: pcx.Vec3, max: pcx.Vec3, frustumPlanes: pcx.Plane[]) {

        for (let p = 0; p < 6; p++) {
            
            const frustumPlane = frustumPlanes[p];
            const d = Math.max(min.x * frustumPlane.normal.x, max.x * frustumPlane.normal.x)
                    + Math.max(min.y * frustumPlane.normal.y, max.y * frustumPlane.normal.y)
                    + Math.max(min.z * frustumPlane.normal.z, max.z * frustumPlane.normal.z)
                    + frustumPlane.distance;

            if (d <= 0) {
                return false;
            }
        }

        return true;
    }

    private _frustumHelper(
        count: number,
        quadMatrix: number[],
        quadOffset: number,
        minMaxStore: Array<[pcx.Vec3, pcx.Vec3, boolean]>,
        offsetArr: number[],
        inverse: boolean,
        cameraPos: pcx.Vec3,
        camera: pcx.Camera,
        freeze: boolean,
    ) {
        const scale        = this.entity.getScale();
        const terrainScale = this._terrain.entity.getScale();
        const checkRadius  = this.checkRadius * Math.max(scale.x, scale.z);
        const maxHeight    = this._terrain.object.maxHeight * terrainScale.y;
        const frustumPlanes = camera.frustum.planes;

        let visibleCount = 0;

        for (let i = 0; i < count; i++) {

            if (!minMaxStore[i]) minMaxStore[i] = [new pc.Vec3(), new pc.Vec3(), false];
            if (!freeze) {

                const quadMatrixX  = quadMatrix[i * 2 + 0];
                const quadMatrixZ  = quadMatrix[i * 2 + 1];
                const localCenterX = this.radius * (quadMatrixX - quadOffset);
                const localCenterZ = this.radius * (quadMatrixZ - quadOffset);
                const worldCenterX = cameraPos.x + localCenterX * scale.x;
                const worldCenterZ = cameraPos.z + localCenterZ * scale.z;

                minMaxStore[i][0].set(
                    worldCenterX - checkRadius,
                    0,
                    worldCenterZ - checkRadius
                );

                minMaxStore[i][1].set(
                    worldCenterX + checkRadius,
                    maxHeight,
                    worldCenterZ + checkRadius
                );

                const visible = this._checkIsVisible(minMaxStore[i][0], minMaxStore[i][1], frustumPlanes);

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
                drawBox({ min, max, color: vis ? pc.Color.GREEN : pc.Color.RED });
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

    private _frustum(cameraPos: pcx.Vec3, camera: pcx.Camera, freeze: boolean) {

        const visibleLod1Count = this._frustumHelper(lod1QuadCount, quad1Matrix, 1, this._lod1MinMaxStore, this._offsetLod1Arr, false, cameraPos, camera, freeze);
        const visibleLod2Count = this._frustumHelper(lod2QuadCount, quad2Matrix, 2, this._lod2MinMaxStore, this._offsetLod2Arr, true, cameraPos, camera, freeze);

        const meshInst  = this._meshInst;
        const mesh      = meshInst.mesh;
        const primitive = mesh.primitive[0];
        const base      = this.lod2BladeSegs * 12 * (lod2QuadCount - visibleLod2Count);
        const count     = this.lod0BladeSegs * 12
                        + this.lod1BladeSegs * 12 * visibleLod1Count
                        + this.lod2BladeSegs * 12 * visibleLod2Count;
        
        meshInst.setParameter(`${lod1OffsetXZParamName}[0]`, this._offsetLod1Arr);
        meshInst.setParameter(`${lod2OffsetXZParamName}[0]`, this._offsetLod2Arr);

        // always true for lod 0
        meshInst.visible = this.autoRender || freeze;
        meshInst.visibleThisFrame = this.autoRender || freeze;

        primitive.base  = base;
        primitive.count = count;

        if (this.app.keyboard?.wasReleased(pc.KEY_V)) {
            console.log(visibleLod1Count);
            console.log(visibleLod2Count);
            console.log(this._offsetLod1Arr);
            console.log(this._offsetLod2Arr);
        }
    }
    
    private _updateGrassMesh(graphicsDevice: pcx.GraphicsDevice, radius: number) {

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

    private _updateMeshInstancing(graphicsDevice: pcx.GraphicsDevice, radius: number) {
        if (this._meshInst) {
            this._updateInstancingBuffer(graphicsDevice, radius);
            this._meshInst?.instancingData?.vertexBuffer?.destroy();
            this._meshInst.setInstancing(this._sharedInstancingBuffer);
        }
    }

    private _updateMeshInstance(graphicsDevice: pcx.GraphicsDevice) {

        this._meshInst?.instancingData?.vertexBuffer?.destroy();
        this._meshInst?.destroy();

        const mesh = new pc.Mesh(graphicsDevice);
        const primitive = mesh.primitive[0];

        mesh.indexBuffer[0] = this._sharedIndexBuffer;
        mesh.vertexBuffer   = this._sharedVertexBuffer;

        primitive.type    = this.wireframe ? pc.PRIMITIVE_LINES : pc.PRIMITIVE_TRIANGLES;
        primitive.base    = 0;
        primitive.count   = this._bufferStore.index.length;
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
    private _initBladeIndices(id: Uint8Array | Uint16Array, vc1: number, vc2: number, i: number, bladeSegs: number) {

        let seg: number;

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
    private _initBladeIndexVerts(vindex: Float32Array) {
        for (let i = 0; i < vindex.length; ++i) {
            vindex[i] = i;
        }
    }

    private _initBladeOffsetShapeVerts(offsetShape: Uint16Array | Float32Array, radius: number, numBlades: number) {
        
        const normalizeValue = offsetShape instanceof Uint16Array ? pc.FloatPacking.float2Half : (x: number) => x;
        const random = new Random(this.seed);
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
            const width    = this.bladeWidth + random.random() * this.bladeWidth * 0.5;
            const height   = this.bladeMinHeight + Math.pow(random.random(), 4.0) * heightFactor;
            const lean     = 0.01 + random.random() * 0.3;
            const curve    = 0.05 + random.random() * 0.3;

            offsetShape[i * 8 + 0] = normalizeValue(x); // x
            offsetShape[i * 8 + 1] = normalizeValue(y); // y
            offsetShape[i * 8 + 2] = normalizeValue(z); // z
            offsetShape[i * 8 + 3] = normalizeValue(rotation); // rot

            offsetShape[i * 8 + 4] = normalizeValue(width);  // width
            offsetShape[i * 8 + 5] = normalizeValue(height); //+ noise; //+ height
            offsetShape[i * 8 + 6] = normalizeValue(lean);   // lean
            offsetShape[i * 8 + 7] = normalizeValue(curve);  // curve
        }
    }
    
    private _updateInstancingBuffer(graphicsDevice: pcx.GraphicsDevice, radius: number) {

        this._sharedInstancingBuffer?.destroy();

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

    private _getVertexFormat(graphicsDevice: pcx.GraphicsDevice) {
        return new pc.VertexFormat(graphicsDevice, [{
            semantic: pc.SEMANTIC_POSITION,
            components: 1,
            type: pc.TYPE_FLOAT32,
            normalize: false,
            asInt: false
        }]);
    }

    private _updateMeshBuffers(graphicsDevice: pcx.GraphicsDevice) {

        this._sharedIndexBuffer?.destroy();
        this._sharedVertexBuffer?.destroy();

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

        this._sharedIndexBuffer = new pc.IndexBuffer(
            graphicsDevice,
            pc.INDEXFORMAT_UINT16,
            this._bufferStore.index.length,
            pc.BUFFER_STATIC,
            this._bufferStore.index,
            { storage: false }
        );

        this._sharedVertexBuffer = new pc.VertexBuffer(graphicsDevice, this._getVertexFormat(graphicsDevice), this._bufferStore.indexVerts.length, {
            usage: pc.BUFFER_STATIC,
            data: this._bufferStore.indexVerts,
            storage: false,
        });
    }

    private _updateMeshMaterial(graphicsDevice: pcx.GraphicsDevice) {

        this._material?.destroy();
        this._material = new pc.StandardMaterial();
        this._material.name = "GrassFieldMaterial";

        /*
        this._material.depthTest = false;
        this._material.depthWrite = true;
        this._material.blendType = pc.BLEND_NONE;
        this._material.alphaTest = 0;
        this._material.alphaWrite = false;
        this._material.alphaFade = false;
        this._material.alphaToCoverage = false;
        */

        const terrain   = this._terrain.object;
        const heightMap = this._terrain.heightMapTexture;
        const terrainScale = this._terrain.entity.getScale();

        this._material.setAttribute(vindexAttrName, pc.SEMANTIC_POSITION);
        this._material.setAttribute(offsetAttrName, pc.SEMANTIC_ATTR10);
        this._material.setAttribute(shapeAttrName, pc.SEMANTIC_ATTR11);

        this._material.setParameter('uDataMap', this._dataTexture.texture);
        this._material.setParameter(heightMapParamName, heightMap);
        this._material.setParameter(fieldScaleParamName, [terrainScale.x, terrainScale.y, terrainScale.z]);
        this._material.setParameter(maxHeightParamName, terrain.maxHeight);
        this._material.setParameter(`${lod1OffsetXZParamName}[0]`, this._offsetLod1Arr);
        this._material.setParameter(`${lod2OffsetXZParamName}[0]`, this._offsetLod2Arr);

        this._material.setParameter(drawPosParamName, [0, 0, 0]);
        this._material.setParameter(timeParamName, this._time);
        this._material.setParameter(windIntensityParamName, 0);
        
        const hmFormat = getHeightMapFormat(graphicsDevice, terrain.heightMap);
        const pcVersion = `v${pc.version[0]}` as unknown as any;
        const chunksStore = getGrassShaderChunks({
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
            engineVersion: pcVersion,
        });

        const chunkNames = Object.keys(chunksStore);
        const shaderChunks = this._material.getShaderChunks?.(pc.SHADERLANGUAGE_GLSL);

        if (shaderChunks) {

            for (let chunkName of chunkNames) {
                shaderChunks.set(chunkName, chunksStore[chunkName]);
            }

            this._material.shaderChunksVersion = pc.CHUNKAPI_1_70;
        }
        else {

            const chunks: Record<string, string> = this._material.chunks;

            chunks.APIVersion = pc.CHUNKAPI_1_70;

            for (let chunkName of chunkNames) {
                chunks[chunkName] = chunksStore[chunkName];
            }
        }

        this._material.update();
    }
}

export default GrassField;
export const grassFieldScriptName = "grassField";

pc.registerScript(GrassField, grassFieldScriptName);

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