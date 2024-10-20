import { float, int } from "./Types.mjs";

export function getText(val: number, minWidth: number, prefix: string) {

    const str = val.toString();
    const strLen = str.length;
    const appendCount = minWidth - strLen;

    let result = str;

    for (let i = 0; i < appendCount; i++) {
        result = prefix + result;
    }

    return result;
}

export function randomFloat() {
    return Math.random();
}

export function randomFloatRange(start: float, end: float) {

    if (end == start) {
        throw new Error("Invalid random range");
    }

    const delta = end - start;

    const randomValue = randomFloat() * delta + start;

    return randomValue;
}

export function calcNextPowerOfTwo(x: int): int {
    
    let ret = 1;

    if (x == 1) {
        return 2;
    }

    while (ret < x) {
        ret = ret * 2;
    }

    return ret;
}