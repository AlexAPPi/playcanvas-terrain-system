import BigTerrainEditor, { bigTerrainEditorScriptName } from "./BigTerrainEditor.mjs";
import BaseTerrain from "../TerrainSystem/Terrain.mjs";
import TerrainRendererPreparer from "../ScriptHelpers/TerrainRendererPreparer.mjs";
import { grassShaderChunks } from "../ScriptHelpers/GrassShaderChunks.mjs";

const pos = new pc.Vec3();
const rot = new pc.Quat();
const scl = new pc.Vec3();
const matrix = new pc.Mat4();

export interface IGrassPatchData {
    meshInstance: pcx.MeshInstance;
    vertexBuffer: pcx.VertexBuffer;
}

export interface IUniforms {
    readonly color: pcx.Color;
    readonly pitch: number;
    readonly yaw: number;
    readonly bendStrength: number;
    readonly width: number;
    readonly height: number;
}

export class Grass extends pc.ScriptType {

    readonly terrainEntity: pcx.Entity;
    readonly base: number;
    readonly count: number;
    readonly vertexCount: number;
    readonly uniform: IUniforms;
    readonly renderType: number;

    private _material: pcx.StandardMaterial;
    private _terrainRenderer: TerrainRendererPreparer;
    private _terrain: BaseTerrain;
    private _dataArray: IGrassPatchData[];

    private _syncUniform() {
        if (this._material) {
            this._material.setParameter('ground_color', [this.uniform.color.r, this.uniform.color.g, this.uniform.color.b]);
            this._material.setParameter('pitch', this.uniform.pitch);
            this._material.setParameter('yaw', this.uniform.yaw);
            this._material.setParameter('width', this.uniform.width);
            this._material.setParameter('height', this.uniform.height);
            this._material.setParameter('bendStrength', this.uniform.bendStrength);
        }
    }

    private _updatePrimitive() {
        for (const data of this._dataArray) {
            data.meshInstance.mesh.primitive[0].type = this.renderType;
            data.meshInstance.mesh.primitive[0].base = this.base;
            data.meshInstance.mesh.primitive[0].count = this.vertexCount;
        }
    }

    initialize(): void {
        this.on('attr:uniform', () => this._syncUniform());
        this.on('attr:vertexCount', () => this._updatePrimitive());
        this.on('attr:renderType', () => this._updatePrimitive());
        this.on('attr:base', () => this._updatePrimitive());
    }

    postInitialize(): void {

        const script = (this.terrainEntity.script!.get(bigTerrainEditorScriptName) as BigTerrainEditor);

        this._terrain = script.terrain;
        this._terrainRenderer = script.terrainRenderer;
        
        // create standard material and enable instancing on it
        const material = new pc.StandardMaterial();

        const chunksStore = grassShaderChunks;
        const chunkNames  = Object.keys(chunksStore);

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
                grassEntity.render!.castShadows = false;
                grassEntity.render!.castShadowsLightmap = false;
                grassEntity.render!.meshInstances = [data.meshInstance];

                this.terrainEntity.addChild(grassEntity);
            }
        }

        console.log(this);
    }

    private _updateHeights(index: number) {
        const buffer = this._dataArray[index];
        
    }

    private _getRandom(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    private _createIns(patchX: number, patchZ: number, terrain: BaseTerrain, material: pcx.StandardMaterial): IGrassPatchData {

        const startX = patchX * terrain.patchSize;
        const startZ = patchZ * terrain.patchSize;
        const step   = (terrain.patchSize - 1) ** 2 / (this.count / 4);
        const stepHelf = step / 2;

        const matrices = new Float32Array(this.count * 16);

        let matrixIndex = 0;

        for (let z = 0; z < terrain.patchSize; z += step) {

            for (let x = 0; x < terrain.patchSize; x += step) {

                const localX  = startX + x;
                const localZ  = startZ + z;
                const y = terrain.heightMap.getHeightInterpolated(localX, localZ);

                const randX = localX > 0 ? this._getRandom(localX - stepHelf, localX + stepHelf) : 0;
                const randZ = localZ > 0 ? this._getRandom(localZ - stepHelf, localZ + stepHelf) : 0;

                pos.set(randX, y, randZ);
                rot.setFromEulerAngles(0, this._getRandom(0, 360), 0);
                scl.set(1, 1, 1);
                matrix.setTRS(pos, rot, scl);

                for (let m = 0; m < 16; m++) matrices[matrixIndex++] = matrix.data[m];
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

        mesh.primitive[0].type    = this.renderType;
        mesh.primitive[0].indexed = false;
        mesh.primitive[0].base    = this.base;
        mesh.primitive[0].count   = this.vertexCount;

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

    update(dt: number): void {

        for (let z = 0; z < this._terrain.numPatchesZ; z++) {

            for (let x = 0; x < this._terrain.numPatchesX; x++) {
            
                const index  = z * this._terrain.numPatchesX + x;
                const buffer = this._terrainRenderer.patchesStore.bufferArray[index];
                const data   = this._dataArray[index];

                data.meshInstance.visible = buffer.visible && buffer.lod.core < 1;

                if (buffer.heightsUpdatedThisFrame) {

                    this._updateHeights(index);
                }
            }
        }
    }
}

export default Grass;
export const grassScriptName = "grass";

pc.registerScript(Grass, grassScriptName);


Grass.attributes.add("terrainEntity", { type: 'entity' });
Grass.attributes.add("base", { type: "number", default: 0, step: 1, precision: 0, min: 0 });
Grass.attributes.add("count", { type: "number", default: 100, step: 1, precision: 0, min: 1, max: 1000000 });
Grass.attributes.add("vertexCount", { type: "number", default: 10, min: 0, step: 1, precision: 0 });
Grass.attributes.add("renderType", { type: "number", default: pc.PRIMITIVE_TRIANGLES,  enum: [
    {'Points': pc.PRIMITIVE_POINTS },
    {'Lines': pc.PRIMITIVE_LINES },
    {'Line Loop': pc.PRIMITIVE_LINELOOP },
    {'Line Strip': pc.PRIMITIVE_LINESTRIP },
    {'Triangles': pc.PRIMITIVE_TRIANGLES },
    {'Triangles Fan': pc.PRIMITIVE_TRIFAN },
    {'Triangles Strip': pc.PRIMITIVE_TRISTRIP },
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