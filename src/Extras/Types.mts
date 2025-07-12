export type int = number;
export type unsigned_int = number;
export type float = number;
export type RefObject<T extends object> = T;
export type IVector2 = { x: float, y: float };
export type IVector3 = { x: float, y: float, z: float };
export type IVector4 = { x: float, y: float, z: float, w: float };
export type IMatrix4 = { data: Float32Array };