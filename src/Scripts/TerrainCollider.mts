import { terrainScriptName } from "./Terrain.mjs";

export class TerrainCollider extends pc.ScriptType {

    initialize() {
        const terrain = this.entity.script?.get(terrainScriptName);
        // TODO
    }
}

export default TerrainCollider;
export const terrainColliderScriptName = "terrainCollider";

pc.registerScript(TerrainCollider, terrainColliderScriptName);