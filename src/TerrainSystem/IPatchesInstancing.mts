import { int } from "../Shared/Types.mjs";
import { IPatch } from "./IPatch.mjs";
import { ISingleLodInfo } from "./LodInfo.mjs";
import { IPatchLodBase } from "./LodManager.mjs";
import BaseTerrain from "./Terrain.mjs";

export interface IInstancingObject {
}

export interface ISingleLodInfoInstancing<TObject extends IInstancingObject, TData extends Uint16Array | Uint8Array> {
    vertexBaseIndex: int;
    vertexCount: int;
    data: TData;
    count: int;
    object: TObject | null;
    hasChanges: boolean;
}

export type TBulder<TObject extends IInstancingObject, TData extends Uint16Array | Uint8Array> = (lodInfo: IPatchLodBase, primitiveInfo: ISingleLodInfo, instancingData: TData, maxInstancingCount: int) => TObject | null;
export type TDestructor<TObject extends IInstancingObject> = (object: TObject) => void;
export type TSelector<TObject extends IInstancingObject, TData extends Uint16Array | Uint8Array> = (item: ISingleLodInfoInstancing<TObject, TData>) => void;

export interface IPatchesInstancing<TObject extends IInstancingObject, TData extends Uint16Array | Uint8Array> {

    buildFromTerrain(terrain: BaseTerrain, objectBuilder?: TBulder<TObject, TData>): void;

    forEach(fn: TSelector<TObject, TData>): void;

    destroy(destructor: TDestructor<TObject>): void;

    get(lod: IPatchLodBase): ISingleLodInfoInstancing<TObject, TData>;

    increment(lod: IPatchLodBase, patch: IPatch): ISingleLodInfoInstancing<TObject, TData>;

    zeroAll(): void;
}