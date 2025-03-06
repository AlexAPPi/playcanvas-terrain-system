import type { float, int } from "../Shared/Types.mjs";
import AbsHeightMapFileIO, { IHeightMapFileImportOptions } from "./AbsHeightMapFileIO.mjs";
import type { IZone } from "./IZone.mjs";

/**
 * @variant rgb - format by uint8[3] texture
 * @variant r23f - format by float32 texture
 * @variant rgba - foramt by uint8[4] texture
 * @variant rgbaX2 - format compressed by 2 patches by x coordinate
 * @variant rgbaX4 - format compressed by 4 patches by x coordinate
 * @see CompressedPatchedHeightMap
 */
export type THeightMapFormat = 'r32f' | 'rgba' | 'rgbaX2' | 'rgbaX4' | 'rgb';

export interface IReadonlyAbsHeightMap {

    readonly width: int;
    readonly depth: int;

    readonly minHeight: float;
    readonly maxHeight: float;

    get(x: int, z: int): float;
    getFactor(x: int, z: int): float;
    getHeightInterpolated(x: float, z: float): float;
    toFile(): Promise<Blob>;
    toCanvas(): HTMLCanvasElement;
    toBuffer(buffer: Uint8Array | Uint8ClampedArray): void;
    toImage(type?: string | undefined, quality?: any): string;
}

export abstract class AbsHeightMap extends AbsHeightMapFileIO implements IReadonlyAbsHeightMap, IZone {

    public abstract width: int;
    public abstract depth: int;

    public abstract minHeight: float;
    public abstract maxHeight: float;

    public abstract get(x: int, z: int): float;
    public abstract set(x: int, z: int, value: float): float;
    public abstract getFactor(x: int, z: int): float;

    public readonly minX = 0;
    public readonly minZ = 0;
    
    public get maxX() { return this.width; }
    public get maxZ() { return this.depth; }

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

    public async fromFile(buffer: ArrayBuffer, options?: IHeightMapFileImportOptions) {
        return await this.__importFromFile(this, buffer, options);
    }

    public async toFile() {
        const buffer = await this.__exportToBuffer(this);
        return new Blob([buffer], { type: "application/octet-stream" });
    }

    public toBuffer(buffer: Uint8Array | Uint8ClampedArray): void {

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
    
    public smoothZone(zone: IZone, np: float, radius: int) {

        if (zone.maxX < 0) return;
        if (zone.maxZ < 0) return;

        if (np < 0 || np > 1) return;
        if (radius === 0) radius = 1;

        const minX = Math.max(zone.minX, 0);
        const minZ = Math.max(zone.minZ, 0);
        const maxX = Math.min(zone.maxX, this.width);
        const maxZ = Math.min(zone.maxZ, this.depth);

        const cp = 1 - np;

        for (let x = minX; x < maxX; x++) {

            for (let z = minZ; z < maxZ; z++) {

                const prevHeight = this.get(x, z);

                let updtHeight;
                let neighNumber  = 0;
                let neighAverage = 0;

                for (let rx = -radius; rx <= radius; rx++) {

                    for (let rz = -radius; rz <= radius; rz++) {

                        const innerX = (x + rx);
                        const innerZ = (z + rz);

                        if (innerX < 0 || innerX >= this.width) continue;
                        if (innerZ < 0 || innerZ >= this.depth) continue;

                        const height = (innerX === x && innerZ === z)
                            ? prevHeight
                            : this.get(innerX, innerZ);

                        neighNumber++;
                        neighAverage += height;
                    }
                }

                neighAverage /= neighNumber;
                updtHeight = neighAverage * np + prevHeight * cp;

                this.set(x, z, updtHeight);
            }
        }
    }

    public smooth(np: float, radius: int) {
        this.smoothZone(this, np, radius);
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
        zone: IZone,
        heightIfZero: float = 0,
        minHeight: float | null = null,
        maxHeight: float | null = null
    ) {
        
        if (zone.maxX < 0) return;
        if (zone.maxZ < 0) return;
        
        const lenX = zone.maxX - zone.minX;
        const lenZ = zone.maxZ - zone.minZ;

        if (lenX < 1 || lenZ < 1 || value === 0) {
            return;
        }

        const fixedMinX = Math.max(zone.minX, 0);
        const fixedMinZ = Math.max(zone.minZ, 0);
        const fixedMaxX = Math.min(zone.maxX, this.width);
        const fixedMaxZ = Math.min(zone.maxZ, this.depth);

        const coeffFactorX = (heightMap.width - 1) / lenX;
        const coeffFactorZ = (heightMap.depth - 1) / lenZ;

        for (let z = fixedMinZ; z < fixedMaxZ; z++) {

            for (let x = fixedMinX; x < fixedMaxX; x++) {

                const x2 = (coeffFactorX * (x - zone.minX)) | 0;
                const z2 = (coeffFactorZ * (z - zone.minZ)) | 0;
                const height = heightMap.get(x2, z2);
                const smoothAppendValue = height * value;

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