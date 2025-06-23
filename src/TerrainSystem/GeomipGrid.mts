import type { float, int } from "../Shared/Types.mjs";
import type { IHeightMapFileImportOptions } from "./AbsHeightMapFileIO.mjs";
import GeomipGridRenderPreparer from "./GeomipGridRenderPreparer.mjs";
import HeightMap from "./HeightMap.mjs";
import { IZone } from "./IZone.mjs";

export class GeomipGrid extends GeomipGridRenderPreparer {

    public setHeight(x: int, z: int, value: float) {
        this._heightMap.set(x, z, value);
    }

    public appendToHeight(x: int, z: int, value: float) {
        this._heightMap.append(x, z, value);
    }

    public multiplyToHeight(x: int, z: int, value: float, defaultHeight: float = 0) {
        this._heightMap.multiply(x, z, value, defaultHeight);
    }

    public smoothHeightsZone(zone: IZone, np: float, radius: float) {
        this._heightMap.smoothZone(zone, np, radius);
    }

    public async loadHeightMapFromFile(buffer: ArrayBuffer, options?: IHeightMapFileImportOptions, np: float = -1, radius: int = 0) {
        const header = await this._heightMap.fromFile(buffer, options);
        this._heightMap.smooth(np, radius);
        this._heightMap.recalculateMinMax(this._heightMap);
        this._heightMap.recalculateAABB();
        return header;
    }

    public loadHeightMapFromImg(img: ImageBitmap, np: float = -1, radius: int = 0) {
        this._heightMap.fromImage(img);
        this._heightMap.smooth(np, radius);
        this._heightMap.recalculateMinMax(this._heightMap);
        this._heightMap.recalculateAABB();
    }

    public normalizeHeightMap(maxHeight?: float) {
        
        maxHeight ??= this._heightMap.maxHeight;

        this._heightMap.normalize(maxHeight);
    }

    public setMaxHeight(maxHeight: float) {
        this._heightMap.setMaxHeight(maxHeight);
    }

    public appendHeightMap(
        heightMap: HeightMap,
        value: float,
        zone: IZone,
        minHeight: float | null = null,
        maxHeight: float | null = null
    ): void {
        this._heightMap.combineHeights('+', heightMap, value, zone, 0, minHeight, maxHeight);
    }

    public recalculateMinMax(zone: IZone, aabb: boolean = true): void {

        this._heightMap.recalculateMinMax(zone);
        
        if (aabb) {
            this._heightMap.recalculateAABB();
        } 
    }
}

export default GeomipGrid