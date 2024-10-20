import type { float, int } from "../Shared/Types.mjs";
import type { IReadonlyCoordsBuffer } from "./CoordsBuffer.mjs";
import type { IReadonlyAbsPatchedHeightMap } from "./AbsPatchedHeightMap.mjs";
import type { IGridBox } from "./GeomipGridBuilder.mjs";
import GeomipGridRenderPreparer from "./GeomipGridRenderPreparer.mjs";
import HeightMap from "./HeightMap.mjs";

export interface IGridProvider extends IGridBox {

    readonly patchIndices: Readonly<Uint32Array>;
    readonly patchVertices: IReadonlyCoordsBuffer;
    readonly heightMap: IReadonlyAbsPatchedHeightMap;

    setMinMaxHeight(minHeight: float, maxHeight: float): void;
    setHeight(x: int, z: int, value: float): void;
    appendToHeight(x: int, z: int, value: float): void;
    multiplyToHeight(x: int, z: int, value: float, defaultHeight?: float): void;
    loadHeightMap(img: ImageBitmap, np?: float, radius?: int): void;
}

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

    public smoothHeightsZone(minX: int, maxX: int, minZ: int, maxZ: int, np: float, radius: float) {
        this._heightMap.smoothZone(minX, maxX, minZ, maxZ, np, radius);
    }

    public loadHeightMap(img: ImageBitmap, np: float = -1, radius: int = 0) {
        this._heightMap.fromImage(img);
        this._heightMap.smooth(np, radius);
        this._heightMap.recalculateMinMax(0, this._heightMap.width, 0, this._heightMap.depth);
    }

    public normalizeHeightMap(minHeight?: float, maxHeight?: float) {
        
        minHeight ??= this._heightMap.minHeight;
        maxHeight ??= this._heightMap.maxHeight;

        this._heightMap.normalize(minHeight, maxHeight);
    }

    public setMinMaxHeight(minHeight: float, maxHeight: float) {
        this._heightMap.setMinMaxHeight(minHeight, maxHeight);
    }

    public appendHeightMap(coeffStore: HeightMap, value: float, minX: int, maxX: int, minZ: int, maxZ: int, coeffDiv: float): void {
        this._heightMap.combineHeights('+', coeffStore, value, minX, maxX, minZ, maxZ, coeffDiv);
    }
}

export default GeomipGrid