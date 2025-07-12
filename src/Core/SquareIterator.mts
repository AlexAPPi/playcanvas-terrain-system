import type { int } from "../Extras/Types.mjs";
import type { IZone } from "./IZone.mjs";
import Heightfield from "./Heightfield.mjs";

export type TForEachSquareCallback = (index: int, x: int, z: int) => void | boolean;

export default class SquareIterator {

    private _field: Heightfield;

    public get field() { return this._field; }

    constructor(field: Heightfield) {
        this._field = field;
    }

    protected _forEach(zone: IZone, squareSize: int, numSquareX: int, numSquareZ: int, callback: TForEachSquareCallback) {

        if (zone.maxX < 0) return;
        if (zone.maxZ < 0) return;

        const minX = Math.max(zone.minX, 0);
        const minZ = Math.max(zone.minZ, 0);
        const maxX = Math.min(zone.maxX, this.field.width);
        const maxZ = Math.min(zone.maxZ, this.field.depth);

        const minPatchX = minX / squareSize | 0;
        const minPatchZ = minZ / squareSize | 0;
        const maxPatchX = maxX / squareSize | 0;
        const maxPatchZ = maxZ / squareSize | 0;

        const normalizeMinX = Math.max(minPatchX, 0);
        const normalizeMinZ = Math.max(minPatchZ, 0);
        const normalizeMaxX = Math.min(maxPatchX + 1, numSquareX);
        const normalizeMaxZ = Math.min(maxPatchZ + 1, numSquareZ);

        for (let z = normalizeMinZ; z < normalizeMaxZ; z++) {

            for (let x = normalizeMinX; x < normalizeMaxX; x++) {

                const patchIndex = z * numSquareX + x;

                if (callback(patchIndex, x, z) === false) {
                    return;
                }
            }
        }
    }
}