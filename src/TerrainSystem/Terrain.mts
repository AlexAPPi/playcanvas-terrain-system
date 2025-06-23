import GeomipGrid from "./GeomipGrid.mjs";

export class BaseTerrain extends GeomipGrid {
    public get maxHeight() { return this.heightMap.maxHeight; }
}

export default BaseTerrain;