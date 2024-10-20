import { float, int } from "../Shared/Types.mjs";

export interface IReadonlyAbsHeightMap {

    readonly width: int;
    readonly depth: int;

    readonly minHeight: float;
    readonly maxHeight: float;

    get(x: int, z: int): float;
    getFactor(x: int, z: int): float;
    getHeightInterpolated(x: float, z: float): float;
    toCanvas(): HTMLCanvasElement;
    toImage(type?: string | undefined, quality?: any): string;
}

export abstract class AbsHeightMap implements IReadonlyAbsHeightMap {

    public abstract width: int;
    public abstract depth: int;

    public abstract minHeight: float;
    public abstract maxHeight: float;

    public abstract get(x: int, z: int): float;
    public abstract set(x: int, z: int, value: float): float;
    public abstract getFactor(x: int, z: int): float;

    public getHeightInterpolated(x: float, z: float) {

        const intX = x | 0;
        const intZ = z | 0;
        const x0z0 = this.get(intX, intZ);

        if ((intX + 1 >= this.width) ||
            (intZ + 1 >= this.depth)) {
            return x0z0;
        }
    
        const x1z0 = this.get(intX + 1, intZ);
        const x0z1 = this.get(intX,     intZ + 1);
        const x1z1 = this.get(intX + 1, intZ + 1);
    
        const factorX = x - intX;
    
        const interpolatedBottom = (x1z0 - x0z0) * factorX + x0z0;
        const interpolatedTop    = (x1z1 - x0z1) * factorX + x0z1;
    
        const factorZ = z - intZ;

        const finalHeight = (interpolatedTop - interpolatedBottom) * factorZ + interpolatedBottom;
    
        return finalHeight;
    }

    public abstract append(x: int, z: int, value: float): float;

    public substract(x: int, z: int, value: float) {
        return this.append(x, z, -value);
    }

    public abstract multiply(x: int, z: int, value: float, heightIfZero?: float): float;

    public divide(x: int, z: int, value: float, heightIfZero: float = 0) {
        return this.multiply(x, z, 1 / value, heightIfZero);
    }
    
    public toBuffer(buffer: Uint8ClampedArray): void {

        const width  = this.width;
        const delta  = this.maxHeight - this.minHeight;

        for (let z = 0; z < this.depth; z++) {

            for (let x = 0; x < this.width; x++) {
            
                const h   = this.get(x, z);
                const v   = (h - this.minHeight) / delta * 255;
                const pos = (x + z * width) * 4;

                buffer[pos]     = v;
                buffer[pos + 1] = v;
                buffer[pos + 2] = v;
                buffer[pos + 3] = 255;
            }
        }
    }

    public toCanvas(): HTMLCanvasElement {

        const canvas = document.createElement('canvas');
        const width  = this.width;
        const height = this.depth;

        canvas.width  = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Failed create canvas 2d context');
        }

        const imageData = ctx.getImageData(0, 0, width, height);
        const buffer    = imageData.data;
        
        this.toBuffer(buffer);
        ctx.putImageData(imageData, 0, 0);

        return canvas;
    }

    /**
     * Save height map to image of base64
     */
    public toImage(type?: string | undefined, quality?: any): string {
        const canvas = this.toCanvas();
        return canvas.toDataURL(type, quality);
    }

    /**
     * Load height map from image
     * @param img 
     */
    public fromImage(img: ImageBitmap) {

        const bufferWidth  = img.width;
        const bufferHeight = img.height;

        if (bufferWidth % 2 !== 0 || bufferHeight % 2 !== 0) {
            throw new Error("Map sizes not divisible by 2 are not supported");
        }

        const canvas  = document.createElement("canvas");
        const context = canvas.getContext("2d")!;

        canvas.width  = bufferWidth;
        canvas.height = bufferHeight;
    
        context.drawImage(img, 0, 0);

        const imageData   = context.getImageData(0, 0, bufferWidth, bufferHeight);
        const imageBuffer = imageData.data;

        const demMinMax   = this.maxHeight - this.minHeight;
        const maxSegmentX = this.width - 1;
        const maxSegmentZ = this.depth - 1;
        const factorX     = bufferWidth  / maxSegmentX;
        const factorZ     = bufferHeight / maxSegmentZ;

        for (let z = 0; z < this.depth; z++) {

            for (let x = 0; x < this.width; x++) {
    
                let normalizeX = x === maxSegmentX ? x - 1 : x;
                let normalizeZ = z === maxSegmentZ ? z - 1 : z;

                const heightMapX = (normalizeX * factorX) | 0;
                const heightMapZ = (normalizeZ * factorZ) | 0;

                const pos = (heightMapX + heightMapZ * bufferWidth) * 4;
                const r = imageBuffer[pos];
                const g = imageBuffer[pos + 1];
                const b = imageBuffer[pos + 2];
                const a = imageBuffer[pos + 3];

                const coeff  = (r + g + b) / 3 / a;
                const height = this.minHeight + demMinMax * coeff;

                this.set(x, z, height);
            }
        }
    }
    
    public smoothZone(minX: int, maxX: int, minZ: int, maxZ: int, np: float, radius: int) {

        if (maxX < 0) return;
        if (maxZ < 0) return;

        if (np < 0 || np > 1) return;
        if (radius === 0) radius = 1;

        if (minX < 0) minX = 0;
        if (minZ < 0) minZ = 0;
        if (maxX > this.width) maxX = this.width;
        if (maxZ > this.depth) maxZ = this.depth;

        const cp = 1 - np;

        for (let x = minX; x < maxX; x++) {

            for (let z = minZ; z < maxZ; z++) {

                let neighNumber  = 0;
                let neighAverage = 0;

                for (let rx = -radius; rx <= radius; rx++) {

                    for (let rz = -radius; rz <= radius; rz++) {

                        if ((x + rx < 0) || (x + rx >= this.width)) continue;
                        if ((z + rz < 0) || (z + rz >= this.depth)) continue;

                        neighNumber++;
                        neighAverage += this.get((x + rx), (z + rz));
                    }
                }

                neighAverage /= neighNumber;

                const smoothHeight = neighAverage * np + this.get(x, z) * cp;

                this.set(x, z, smoothHeight);
            }
        }
    }

    /**
     * Smooth the terrain. For each node, its X (determined by radius) neighbors' heights
     * are averaged and will influence node's new height
     * to the extent specified by <code>np</code>.
     *
     * @param np
     *          To what extent neighbors influence the new height:
     *          Value of 0 will ignore neighbors (no smoothing).
     *          Value of 1 will ignore the node old height.
     */
    public smooth(np: float, radius: int) {
        this.smoothZone(0, this.width, 0, this.depth, np, radius);
    }

    public normalize(minHeight: float, maxHeight: float) {

        if (minHeight > maxHeight) {
            return;
        }

        const minMaxDelta = this.maxHeight - this.minHeight;
        const minMaxRange = maxHeight - minHeight;

        for (let z = 0; z < this.depth; z++) {

            for (let x = 0; x < this.width; x++) {

                const currentHeight   = this.get(x, z);
                const normalizeHeight = ((currentHeight - minHeight) / minMaxDelta) * minMaxRange + maxHeight;

                this.set(x, z, normalizeHeight);
            }
        }
    }

    public combineHeights(
        type: '+' | '-' | '*' | '/',
        heightMap: AbsHeightMap,
        value: float,
        minX: int,
        maxX: int,
        minZ: int,
        maxZ: int,
        coeffDiv: float = 100,
        heightIfZero: float = 0,
        minHeight: float | null = null,
        maxHeight: float | null = null
    ) {

        if (maxX < 0) return;
        if (maxZ < 0) return;

        const lenX = maxX - minX;
        const lenZ = maxZ - minZ;

        if (lenX < 1 || lenZ < 1 || value === 0) {
            return;
        }

        const fixedMinX = Math.max(minX, 0);
        const fixedMinZ = Math.max(minZ, 0);
        const fixedMaxX = Math.min(maxX, this.width);
        const fixedMaxZ = Math.min(maxZ, this.depth);

        const coeffFactorX = (heightMap.width - 1) / lenX;
        const coeffFactorZ = (heightMap.depth - 1) / lenZ;

        for (let z = fixedMinZ; z < fixedMaxZ; z++) {

            for (let x = fixedMinX; x < fixedMaxX; x++) {

                const x2 = (coeffFactorX * (x - minX)) | 0;
                const z2 = (coeffFactorZ * (z - minZ)) | 0;
                const coeff = heightMap.get(x2, z2) / coeffDiv;
                const smoothAppendValue = coeff * value;

                const oldHeight = this.get(x, z) || heightIfZero;

                let candidate = type === '+' ? oldHeight + smoothAppendValue :
                                type === '-' ? oldHeight - smoothAppendValue :
                                type === '*' ? oldHeight * smoothAppendValue :
                                type === '/' ? oldHeight / smoothAppendValue :
                                oldHeight;
                
                if (minHeight !== null && candidate < minHeight) {
                    candidate = minHeight;
                }
                
                if (maxHeight !== null && candidate > maxHeight) {
                    candidate = maxHeight;
                }

                this.set(x, z, candidate);
            }
        }
    }
}

export default AbsHeightMap;