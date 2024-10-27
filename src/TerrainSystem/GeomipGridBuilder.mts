import type { float, RefObject, unsignedint as unsigned_int } from "../Shared/Types.mjs";
import { IReadonlyCoordsBuffer, CoordsBuffer } from "./CoordsBuffer.mjs";
import AbsPatchedHeightMap, { type IReadonlyAbsPatchedHeightMap } from "./AbsPatchedHeightMap.mjs";
import GridBuilder, { IGridPatched } from "./GridBuilder.mjs";

export interface IGromipGridWithHeight extends IGridPatched {
    readonly minHeight: float;
    readonly maxHeight: float;
}

export class GeomipGridBuilder extends GridBuilder {

    private _vertices: CoordsBuffer;

    protected _heightMap: AbsPatchedHeightMap<any>;

    public get patchVertices(): IReadonlyCoordsBuffer { return this._vertices; }
    public get heightMap(): IReadonlyAbsPatchedHeightMap { return this._heightMap; }

    constructor(heightMap: RefObject<AbsPatchedHeightMap<any>>, zFar: float) {

        super(heightMap, zFar);
        
        this._heightMap = heightMap;
        this._vertices  = new CoordsBuffer(this._heightMap, this._heightMap.patchSize);
        this._vertices.init();
    }
}

export default GeomipGridBuilder;