import { IVector3, float } from "./Types.mjs";

/**
 * Sets the specified 3-dimensional vector to the supplied numerical values.
 */
export function set<T extends IVector3>(to: T, x: number, y: number, z: number): T {
    to.x = x;
    to.y = y;
    to.z = z;
    return to;
}

/**
 * Returns the Euclidean distance between the two given points.
 */
export function distance(value1: Readonly<IVector3>, value2: Readonly<IVector3>) {
    const dx = value1.x - value2.x;
    const dy = value1.y - value2.y;
    const dz = value1.z - value2.z;
    const ls = dx * dx + dy * dy + dz * dz;
    return Math.sqrt(ls);
}

/**
 * Returns the Euclidean distance between the two given points.
 */
export function distanceV3XYZ(value1: Readonly<IVector3>, x: float, y: float, z: float) {
    const dx = value1.x - x;
    const dy = value1.y - y;
    const dz = value1.z - z;
    const ls = dx * dx + dy * dy + dz * dz;
    return Math.sqrt(ls);
}

/**
 * Returns the Euclidean distance between the two given points.
 */
export function distanceX1Y1Z1X2Y2Z2(x1: float, y1: float, z1: float, x2: float, y2: float, z2: float) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const dz = z1 - z2;
    const ls = dx * dx + dy * dy + dz * dz;
    return Math.sqrt(ls);
}

/**
 * Returns a vector with the same direction as the given vector, but with a length of 1.
 */
export function normalize<TOut extends IVector3>(value: Readonly<IVector3>, out: TOut): TOut {

    const ls = value.x * value.x + value.y * value.y + value.z * value.z;
    const length = Math.sqrt(ls);

    return set(
        out,
        value.x / length,
        value.y / length,
        value.z / length
    );
}

/**
 * Update the vector with the same direction as the given vector, but with a length of 1.
 */
export function normalizeRef<T extends IVector3>(refValue: T): T {

    const ls = refValue.x * refValue.x + refValue.y * refValue.y + refValue.z * refValue.z;
    const length = Math.sqrt(ls);
    
    refValue.x /= length;
    refValue.y /= length;
    refValue.z /= length;
    return refValue;
}

/**
 * Adds two vectors.
 */
export function add<TOut extends IVector3>(left: Readonly<IVector3>, right: Readonly<IVector3>, out: TOut): TOut {
    return set(
        out,
        left.x + right.x,
        left.y + right.y,
        left.z + right.z
    );
}

/**
 * Adds two vectors.
 */
export function addRef(refLeft: IVector3, right: Readonly<IVector3>) {
    return add(refLeft, right, refLeft);
}

/**
 * Subtracts the second vector from the first.
 */
export function subtract<TOut extends IVector3>(left: Readonly<IVector3>, right: Readonly<IVector3>, out: TOut): TOut {
    return set(
        out,
        left.x - right.x,
        left.y - right.y,
        left.z - right.z
    );
}

/**
 * Computes the cross product of two vectors.
 */
export function cross<TOut extends IVector3>(vector1: Readonly<IVector3>, vector2: Readonly<IVector3>, out: TOut): TOut {
    return set(
        out,
        vector1.y * vector2.z - vector1.z * vector2.y,
        vector1.z * vector2.x - vector1.x * vector2.z,
        vector1.x * vector2.y - vector1.y * vector2.x
    );
}

export default {
    set,
    normalize,
    normalizeRef,
    add,
    subtract,
    addRef,
    distance,
    distanceV3XYZ,
    distanceX1Y1Z1X2Y2Z2,
    cross
}