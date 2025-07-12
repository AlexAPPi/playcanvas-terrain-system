import type { int } from "../Extras/Types.mjs";
import type { IPatch } from "./IPatch.mjs";
import type { IPatchLodBase } from "./IPatchLod.mjs";
import type { ISingleLodInfo } from "./LodInfo.mjs";
import type { IGridPatchedLod } from "./GridBuilder.mjs";

export interface IInstancingObject {
}

export interface ISingleLodInfoInstancing<TObject extends IInstancingObject, TData extends Uint16Array | Uint8Array> {
    vertexBaseIndex: int;
    vertexCount: int;
    lod: IPatchLodBase;
    data: TData;
    count: int;
    object: TObject | null;
    hasChanges: boolean;
}

export type TBulder<TObject extends IInstancingObject, TData extends Uint16Array | Uint8Array> = (lodInfo: IPatchLodBase, primitiveInfo: ISingleLodInfo, instancingData: TData, maxInstancingCount: int) => TObject | null;
export type TDestructor<TObject extends IInstancingObject> = (object: TObject) => void;
export type TSelector<TObject extends IInstancingObject, TData extends Uint16Array | Uint8Array> = (item: ISingleLodInfoInstancing<TObject, TData>) => void;

export interface IPatchInstancing<TObject extends IInstancingObject, TData extends Uint16Array | Uint8Array> {

    build(grid: IGridPatchedLod, objectBuilder?: TBulder<TObject, TData>): void;

    forEach(fn: TSelector<TObject, TData>): void;

    destroy(destructor: TDestructor<TObject>): void;

    get(lod: IPatchLodBase): ISingleLodInfoInstancing<TObject, TData>;

    increment(lod: IPatchLodBase, patch: IPatch): ISingleLodInfoInstancing<TObject, TData>;

    zeroAll(): void;
}