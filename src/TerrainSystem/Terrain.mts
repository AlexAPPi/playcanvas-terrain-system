import GeomipGrid from "./GeomipGrid.mjs";

export class BaseTerrain extends GeomipGrid {
    public get minHeight() { return this.heightMap.minHeight; }
    public get maxHeight() { return this.heightMap.maxHeight; }
}

export default BaseTerrain;