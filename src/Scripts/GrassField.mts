import { GrassFieldData } from "../GrassField/GrassFieldTexture.mjs";
import { drawPosParamName, getGrassShaderChunks, lod2OffsetXZParamName, offsetAttrName, lod1OffsetXZParamName, shapeAttrName, timeParamName, vindexAttrName, windIntensityParamName, fieldScaleParamName, circleSmoothingParamName, maxSlopeFactorParamName } from "../GrassField/GrassShaderChunk.mjs";
import Random from "../Extras/Random.mjs";
import { getHeightMapFormat } from "../Heightfield/GPUHeightMapBuffer.mjs";
import { heightMapParamName, maxHeightParamName } from "../Heightfield/ShaderChunks.mjs";
import Terrain from "./Terrain.mjs";
import GrassFieldCompute from "../GrassField/GrassFieldCompute.mjs";
import GrassFieldFrustum, { lod0PatchCount, lod1PatchCount, lod2PatchCount } from "../GrassField/GrassFieldFrustum.mjs";

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

export const bufferItemSize = 8;

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
    declare public readonly circleSmoothing: number;
    declare public readonly maxSlopeFactor: number;

    declare public readonly painting: boolean;
    declare public readonly wireframe: boolean;
    declare public readonly castShadow: boolean;
    declare public readonly receiveShadow: boolean;
    declare public readonly seed: number;
    declare public readonly windIntensity: number;
    declare public readonly numBlades: number;
    declare public readonly bunchWidth: number;
    declare public readonly bunchDepth: number;
    declare public readonly bunchRandRadius: number;
    declare public readonly radius: number;
    declare public readonly lod0BladeSegs: number;
    declare public readonly lod1BladeSegs: number;
    declare public readonly lod2BladeSegs: number;
    declare public readonly bladeSideCount: number;
    declare public readonly bladeWidth: number;
    declare public readonly bladeMinHeight: number;
    declare public readonly bladeMaxHeight: number;
    declare public readonly textures: IGrassTextureAttribute[];

    private _sharedIndexBuffer: pcx.IndexBuffer;
    private _sharedVertexBuffer: pcx.VertexBuffer;

    private _bufferStore: IBufferStore = {} as any;
    private _sharedInstancingBuffer: pcx.VertexBuffer;
    private _meshInst: pcx.MeshInstance;
    private _material: pcx.StandardMaterial;

    private _dataTexture: GrassFieldData;
    private _cameraEntity: pcx.Entity;
    private _terrain: Terrain;
    private _time: number = 0;
    private _lastDrawPos: pcx.Vec3 = new pc.Vec3();

    private _frustum: GrassFieldFrustum;
    private _compute: GrassFieldCompute;
    private _aabb: pcx.BoundingBox;

    public get patchNumBlades() {
        const unsafe = (this.numBlades / (lod0PatchCount + lod1PatchCount + lod2PatchCount)) | 0;
        const root = Math.sqrt(unsafe) | 0;
        return root * root;
    }

    public destroy() {

        this._compute?.destroy();
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

        this._updateGrassMesh(this.app.graphicsDevice);

        if (this.painting) {
            this._terrain.addLock();
        }
    }

    public postInitialize(): void {

        const terrainEntity = this.entity.root.findByName('Terrain') as pcx.Entity;
        const terrainScript = terrainEntity.script?.get(Terrain) as Terrain;

        this._terrain      = terrainScript;
        this._cameraEntity = terrainScript.cameraEntity!;
        this._dataTexture  = new GrassFieldData(this.app.graphicsDevice, this._terrain.width, this._terrain.depth);
        this._frustum      = new GrassFieldFrustum(this._terrain, this._cameraEntity.camera!.camera!);

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

        this.on('attr:seed',            () => this._updateMeshInstancing(this.app.graphicsDevice));
        this.on('attr:numBlades',       () => this._updateMeshInstancing(this.app.graphicsDevice));
        this.on('attr:bunchWidth',      () => this._updateMeshInstancing(this.app.graphicsDevice));
        this.on('attr:bunchDepth',      () => this._updateMeshInstancing(this.app.graphicsDevice));
        this.on('attr:bladeWidth',      () => this._updateMeshInstancing(this.app.graphicsDevice));
        this.on('attr:bladeMinHeight',  () => this._updateMeshInstancing(this.app.graphicsDevice));
        this.on('attr:bladeMaxHeight',  () => this._updateMeshInstancing(this.app.graphicsDevice));
        this.on('attr:bunchRandRadius', () => this._updateMeshInstancing(this.app.graphicsDevice));

        this.on('attr:radius',         () => this._updateGrassMesh(this.app.graphicsDevice));
        this.on('attr:lod0BladeSegs',  () => this._updateGrassMesh(this.app.graphicsDevice));
        this.on('attr:lod1BladeSegs',  () => this._updateGrassMesh(this.app.graphicsDevice));
        this.on('attr:lod2BladeSegs',  () => this._updateGrassMesh(this.app.graphicsDevice));
        this.on('attr:bladeSideCount', () => this._updateGrassMesh(this.app.graphicsDevice));

        this.on('attr:circleSmoothing', () => {
            this._material.setParameter(circleSmoothingParamName, this.circleSmoothing);
        });

        this.on('attr:maxSlopeFactor', () => {
            this._material.setParameter(maxSlopeFactorParamName, this.maxSlopeFactor);
        });

        this.on('attr:windIntensity', () => {
            this._material.setParameter(windIntensityParamName, this.windIntensity);
        });

        this.on('attr:textures', () => {
            this._updateMaterialDiffuseData();
        });
    }

    private _updateMaterialDiffuseData() {

        const existsTexs = !!this.textures && this.textures.length > 0;
        const color = existsTexs ? this.textures[0].color : pc.Color.WHITE;
        const rand  = existsTexs ? this.textures[0].colorRandom : pc.Vec3.ZERO;
        const tex   = existsTexs ? this.textures[0].diffuse.resource : null;

        this._material.setParameter('uDiffuseColor', [color.r, color.g, color.b]);
        this._material.setParameter('uDiffuseColorRandom', [rand.x, rand.y, rand.z]);
        this._material.setParameter('uDiffuseTex', tex as any);
    }

    public update(dt: number): void {

        this._time += dt;

        const cameraPos = this._cameraEntity.getPosition();
        const camera = this._cameraEntity!.camera!.camera;

        if (!this.freezeDrawPos) {

            const mat = this.entity.getWorldTransform();

            tmpMat.invert(mat);
            tmpMat.transformPoint(cameraPos, this._lastDrawPos);
        }

        const visibleLod1Count = this.lod1BladeSegs < 1 ? 0 : this._frustum.frustumLod1(cameraPos, this._compute.patchRadius, this.freezeDrawPos);
        const visibleLod2Count = this.lod2BladeSegs < 1 ? 0 : this._frustum.frustumLod2(cameraPos, this._compute.patchRadius, this.freezeDrawPos);

        const bladeSegsNum = this.bladeSideCount * 6;
        const base  = this.lod2BladeSegs * bladeSegsNum * (lod2PatchCount - visibleLod2Count);
        const count = this.lod0BladeSegs * bladeSegsNum
                    + this.lod1BladeSegs * bladeSegsNum * visibleLod1Count
                    + this.lod2BladeSegs * bladeSegsNum * visibleLod2Count;
        
        const mesh      = this._meshInst.mesh;
        const primitive = mesh.primitive[0];

        primitive.base  = base;
        primitive.count = count;

        // always true for lod 0
        this._meshInst.visible = this.autoRender || this.freezeDrawPos;
        this._meshInst.visibleThisFrame = this.autoRender || this.freezeDrawPos;
        this._meshInst.setParameter(`${lod1OffsetXZParamName}[0]`, this._frustum.lod1Offsets);
        this._meshInst.setParameter(`${lod2OffsetXZParamName}[0]`, this._frustum.lod2Offsets);

        this._material.setParameter(timeParamName, this._time);
        this._material.setParameter(drawPosParamName, [this._lastDrawPos.x, this._lastDrawPos.y, this._lastDrawPos.z]);

        if (this.app.keyboard?.wasReleased(pc.KEY_V)) {
            console.log(visibleLod1Count);
            console.log(visibleLod2Count);
        }

        this._frustum.drawCornes(this.freezeDrawPos);
        this._compute.update(this._lastDrawPos);
    }

    public updateAabb() {

        if (this._meshInst) {

            const scale        = this.entity.getScale();
            const terrainScale = this._terrain.entity.getScale();
            const worldRadius  = this.radius * Math.max(scale.x, scale.z);
            const maxHeight    = this._terrain.object.maxHeight * terrainScale.y;

            this._aabb ??= new pc.BoundingBox();
            this._aabb.setMinMax(
                new pc.Vec3(-worldRadius, 0, -worldRadius),
                new pc.Vec3( worldRadius, maxHeight, worldRadius)
            );

            this._meshInst.mesh.aabb = this._aabb;
        }
    }

    private _updateCompute() {

        if (!this._compute ||
            this._compute.radius !== this.radius) {
            this._compute?.destroy();
            this._compute = new GrassFieldCompute(this.app.graphicsDevice, this.radius, this._terrain);
        }

        this._material.setParameter("uComputeHMData", this._compute.bufferHeightMap);
        this._material.setParameter("uComputeNMData", this._compute.bufferNormalMap);
    }

    private _updateGrassMesh(graphicsDevice: pcx.GraphicsDevice) {

        this._updateMeshBuffers(graphicsDevice);
        this._updateMeshMaterial(graphicsDevice);
        this._updateMeshInstance(graphicsDevice);
        this._updateMeshInstancing(graphicsDevice);

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

        this._meshInst.cull = false;
        this._meshInst.castShadow = this.castShadow;
        this._meshInst.receiveShadow = this.receiveShadow;
    }

    private _updateMeshInstancing(graphicsDevice: pcx.GraphicsDevice) {

        if (this._meshInst) {
            this._updateInstancingBuffer(graphicsDevice);
            this._meshInst?.instancingData?.vertexBuffer?.destroy();
            this._meshInst.setInstancing(this._sharedInstancingBuffer);
        }

        this._updateCompute();
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

        const addBackSide = vc1 !== vc2;

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

        if (addBackSide) {

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
        }
        
        return i;
    }

    /** Set up indices for 1 blade */
    private _initBladeIndexVerts(vindex: Float32Array) {
        for (let i = 0; i < vindex.length; ++i) {
            vindex[i] = i;
        }
    }

    private _initPatchBladeOffsetShapeVerts(offsetShape: Uint16Array | Float32Array, patchSize: number, patchNumBlades: number) {
        
        const size = Math.sqrt(patchNumBlades);

        if (size !== Math.ceil(size)) {
            throw new Error("numBlades must be the largest square");
        }

        const normalizeValue = offsetShape instanceof Uint16Array ? pc.FloatPacking.float2Half : (x: number) => x;
        const random = new Random(this.seed);
        const heightFactor = this.bladeMaxHeight - this.bladeMinHeight;
        const bunchSizeX = this.bunchWidth || 1;
        const bunchSizeZ = this.bunchDepth || 1;

        //let noise = 0;

        for (let z = 0; z < size; z += bunchSizeZ) {

            for (let x = 0; x < size; x += bunchSizeX) {

                const tmp = 0;
                const randBunchX = random.nextFloat(0, size);
                const randBunchZ = random.nextFloat(0, size);

                for (let bunchZ = 0; bunchZ < bunchSizeZ; bunchZ++) {

                    for (let bunchX = 0; bunchX < bunchSizeX; bunchX++) {

                        const index = (x + bunchX) + (z + bunchZ) * size;

                        const theta = random.nextFloat(0, Math.PI * 2);
                        const randRadius = this.bunchRandRadius * Math.sqrt(random.random());
                        const resultFloatX = randBunchX + randRadius * Math.cos(theta);
                        const resultFloatZ = randBunchZ + randRadius * Math.sin(theta);

                        // clamp by patch size and transform to [-1, 1]
                        const normalizeForPSX = resultFloatX / size * patchSize - patchSize / 2;
                        const normalizeForPSZ = resultFloatZ / size * patchSize - patchSize / 2;

                        const rotation = Math.PI * 2.0 * random.random();
                        const width    = this.bladeWidth + random.random() * this.bladeWidth * 0.5;
                        const height   = this.bladeMinHeight + Math.pow(random.random(), 4.0) * heightFactor;
                        const lean     = 0.01 + random.random() * 0.3;
                        const curve    = 0.05 + random.random() * 0.3;

                        offsetShape[index * bufferItemSize + 0] = normalizeValue(normalizeForPSX); // x
                        offsetShape[index * bufferItemSize + 1] = normalizeValue(normalizeForPSZ); // y
                        offsetShape[index * bufferItemSize + 2] = normalizeValue(tmp);
                        offsetShape[index * bufferItemSize + 3] = normalizeValue(rotation); // rot

                        //noise = Math.abs(simplex(floatX * 0.03, floatY * 0.03));
                        //noise = noise * noise * noise;
                        //noise *= 5.0;

                        offsetShape[index * bufferItemSize + 4] = normalizeValue(width);  // width
                        offsetShape[index * bufferItemSize + 5] = normalizeValue(height /* + noise */); // height
                        offsetShape[index * bufferItemSize + 6] = normalizeValue(lean);   // lean
                        offsetShape[index * bufferItemSize + 7] = normalizeValue(curve);  // curve
                    }
                }
            }
        }
    }

    private _updateInstancingBuffer(graphicsDevice: pcx.GraphicsDevice) {

        this._sharedInstancingBuffer?.destroy();

        const patchNumBlades = this.patchNumBlades;
        const patchSize = GrassFieldCompute.getNormalizeRadius(this.radius) / 2.5;
        const offsetAndShapeLength = patchNumBlades * bufferItemSize;

        if (this._bufferStore.offsetAndShape === undefined ||
            this._bufferStore.offsetAndShape.length !== offsetAndShapeLength) {
            this._bufferStore.offsetAndShape = new Float32Array(offsetAndShapeLength);
        }

        this._initPatchBladeOffsetShapeVerts(this._bufferStore.offsetAndShape, patchSize, patchNumBlades);

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
        const lod1VC = this.lod1BladeSegs > 0 ? (this.lod1BladeSegs + 1) * 2 : 0;
        const lod2VC = this.lod2BladeSegs > 0 ? (this.lod2BladeSegs + 1) * 2 : 0;

        const bladeSegsNum = this.bladeSideCount * 6;
        const indexLength = this.lod0BladeSegs * bladeSegsNum + this.lod1BladeSegs * bladeSegsNum * lod1PatchCount + this.lod2BladeSegs * bladeSegsNum * lod2PatchCount;
        const indexVertsLength = lod0VC * this.bladeSideCount + lod1VC * this.bladeSideCount * lod1PatchCount + lod2VC * this.bladeSideCount * lod2PatchCount;

        if (this._bufferStore.index === undefined ||
            this._bufferStore.index.length !== indexLength) {
            this._bufferStore.index = new Uint16Array(indexLength);

            let index = 0;

            if (this.lod2BladeSegs > 0) {

                for (let i = 0; i < lod2PatchCount; i++) {

                    const lod2VC1 = i * lod2VC * this.bladeSideCount;
                    const lod2VC2 = lod2VC1 + lod2VC * (this.bladeSideCount - 1);

                    index = this._initBladeIndices(this._bufferStore.index, lod2VC1, lod2VC2, index, this.lod2BladeSegs);
                }
            }

            const lod0VC1 = lod2VC * lod2PatchCount * this.bladeSideCount;
            const lod0VC2 = lod0VC1 + lod0VC * (this.bladeSideCount - 1);

            index = this._initBladeIndices(this._bufferStore.index, lod0VC1, lod0VC2, index, this.lod0BladeSegs);

            if (this.lod1BladeSegs > 0) {

                for (let i = 0; i < lod1PatchCount; i++) {
        
                    const lod1VC1 = lod0VC2 + lod0VC + i * lod1VC * this.bladeSideCount;
                    const lod1VC2 = lod1VC1 + lod1VC * (this.bladeSideCount - 1);

                    index = this._initBladeIndices(this._bufferStore.index, lod1VC1, lod1VC2, index, this.lod1BladeSegs);
                }
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
        //this._material.useMetalness = true;

        // Useful for bladeSideCount == 1
        // this._material.cull = pc.CULLFACE_NONE;

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
        this._material.setParameter(`${lod1OffsetXZParamName}[0]`, this._frustum.lod1Offsets);
        this._material.setParameter(`${lod2OffsetXZParamName}[0]`, this._frustum.lod2Offsets);

        this._material.setParameter(drawPosParamName, [0, 0, 0]);
        this._material.setParameter(timeParamName, this._time);
        this._material.setParameter(windIntensityParamName, 0);
        this._material.setParameter(circleSmoothingParamName, this.circleSmoothing);
        this._material.setParameter(maxSlopeFactorParamName, this.maxSlopeFactor);

        this._updateMaterialDiffuseData();

        const hmFormat = getHeightMapFormat(graphicsDevice, terrain.heightMap);
        const pcVersion = `v${pc.version[0]}` as unknown as any;
        const normalizeRadius = GrassFieldCompute.getNormalizeRadius(this.radius);
        const chunksStore = getGrassShaderChunks({
            width: terrain.width,
            depth: terrain.depth,
            heightMapChunkSize: terrain.heightMap.dataChunkSize,
            heightMapFormat: hmFormat,
            lod0BladeSegs: this.lod0BladeSegs,
            lod1BladeSegs: this.lod1BladeSegs,
            lod2BladeSegs: this.lod2BladeSegs,
            sideCount: this.bladeSideCount,
            radius: normalizeRadius,
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
GrassField.attributes.add("circleSmoothing", { type: "number", default: 2.4, min: 0.5, max: 3.5 });
GrassField.attributes.add("maxSlopeFactor", { type: "number", default: 0.85, min: 0.001, max: 1.0 });
GrassField.attributes.add("seed", { type: "number", default: 919191, min: 1, step: 1, precision: 0 });
GrassField.attributes.add("windIntensity", { type: "number", default: 0, min: -30, max: 30 });
GrassField.attributes.add("radius", { type: "number", default: 80, min: 1, max: 300, step: 1, precision: 0 });
GrassField.attributes.add("numBlades", { type: "number", default: 4000, min: 0, max: 8000000, step: 1, precision: 0 });
GrassField.attributes.add("bunchWidth", { type: "number", default: 4, min: 1, max: 20, step: 1, precision: 0 });
GrassField.attributes.add("bunchDepth", { type: "number", default: 4, min: 1, max: 20, step: 1, precision: 0 });
GrassField.attributes.add("bunchRandRadius", { type: "number", default: 0, min: 0, max: 10 });
GrassField.attributes.add("lod0BladeSegs", { type: "number", default: 3, min: 1, max: 20, step: 1, precision: 0 });
GrassField.attributes.add("lod1BladeSegs", { type: "number", default: 2, min: 0, max: 20, step: 1, precision: 0 });
GrassField.attributes.add("lod2BladeSegs", { type: "number", default: 1, min: 0, max: 20, step: 1, precision: 0 });
GrassField.attributes.add("bladeSideCount", { type: "number", default: 2, min: 1, max: 2, step: 1, precision: 0 });
GrassField.attributes.add("bladeWidth", { type: "number", default: 0.04, min: 0.01, max: 5 });
GrassField.attributes.add("bladeMinHeight", { type: "number", default: 0.25, min: 0.01, max: 10 });
GrassField.attributes.add("bladeMaxHeight", { type: "number", default: 1, min: 0.01, max: 20 });
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