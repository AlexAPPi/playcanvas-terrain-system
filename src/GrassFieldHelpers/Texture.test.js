function encodeNumbers(numbers) {

    if (numbers.length !== 8 || numbers.some(num => num < 0 || num > 8)) {
        throw new Error('Array must contain exactly 8 numbers in the range [0, 8]');
    }

    let result = 0;
    for (let i = 0; i < 8; i++) {
        result |= (numbers[i] & 0b1111) << (i * 4);
    }
    
    return result >>> 0;
}

function decodeNumbers(encoded) {
    const numbers = [];
    for (let i = 0; i < 8; i++) {
        numbers.push((encoded >>> (i * 4)) & 0b1111);
    }
    return numbers;
}

const encoded = encodeNumbers([8, 6, 2, 4, 8, 0, 7, 3]);
const decoded = decodeNumbers(encoded);

console.log(decoded);







const w = 1025;
const d = 1025;
const a = new Uint8Array(w * d);

const x = 56;
const z = 90;

const index = (x + z * w) / 2;

console.log(a[index]);

a[index] = 8;

console.log(a[index]);


(() => {

    const chunkX = 0;
    const chunkZ = 0;

    const index0 = (chunkX + 0) + (chunkZ + 0) * 1025;
    const index1 = (chunkX + 1) + (chunkZ + 0) * 1025;
    const index2 = (chunkX + 1) + (chunkZ + 1) * 1025;
    const index3 = (chunkX + 0) + (chunkZ + 1) * 1025;
    console.log(index0, index1, index2, index3);
})();

(() => {

    const width  = 129;
    const depth  = 129;
    const pack   = 4;
    const matrix = new Array(((width * depth) - 1) / pack);

    for (let z = 0; z < depth; z += pack) {

        for (let x = 0; x < width; x += pack) {

            const idx = (z * width + x) / pack;

            matrix[idx] = `${x},${z}`;
        }
    }

    console.log(matrix);
})();

(() => {

    const pack = 8;
    const indexMatrix = [
        [0, 1],
        [2, 3],
        [4, 5],
        [6, 7]
    ];

    const x = 7;
    const z = 7;

    const lX = x % pack;
    const lZ = z % pack;
    const sX = x / pack | 0;
    const sZ = z / pack | 0;

    console.log(lX, lZ, indexMatrix[lX][lZ], sX, sZ);
})();