import type { float, int } from "../Extras/Types.mjs";

export interface IPatchLodBase {
    core: int;
    left: int;
    right: int;
    top: int;
    bottom: int;
}

export interface IPatchLod extends IPatchLodBase {

    /** Distance to patch center xz and y pos from heightmap altitude by camera xz to */
    distance: float;
}