import { float } from "./Types.mjs";

/**
 * Returns the Euclidean distance between the two given points.
 */
export function distanceX1Z1X2Z2(x1: float, z1: float, x2: float, z2: float) {
    const dx = x1 - x2;
    const dz = z1 - z2;
    const ls = dx * dx + dz * dz;
    return Math.sqrt(ls);
}

export const Vector2Math = {
    distanceX1Z1X2Z2,
}

export default Vector2Math;