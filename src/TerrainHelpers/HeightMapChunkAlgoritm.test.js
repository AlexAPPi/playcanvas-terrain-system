(() => {

    const patchWidth = 129;
    const patchDepth = 129;

    const width  = 1025;
    const depth  = 2049;
    const matrix = new Array(width * depth);

    for (let z = 0; z < depth; z++) {

        for (let x = 0; x < width; x++) {

            const idx = z * width + x;

            matrix[idx] = `${x},${z}`;
        }
    }

    const patchMatrixLength = patchWidth * patchDepth;
    const patches = [];
    const numPatchesX = (width - 1) / (patchWidth - 1) | 0;
    const numPatchesZ = (depth - 1) / (patchDepth - 1) | 0;

    let offset = 0;

    for (let patchZ = 0; patchZ < numPatchesZ; patchZ++) {

        for (let patchX = 0; patchX < numPatchesX; patchX++) {

            const patchMatrix = new Array(patchMatrixLength);

            for (let z = 0; z < patchDepth; z++) {
    
                for (let x = 0; x < patchWidth; x++) {
    
                    const idx  = z * patchWidth + x;
                    const orig = matrix[patchMatrixLength * offset + idx];
                    patchMatrix[idx] = `${orig}|${x},${z}`;
                }
            }

            patches.push(patchMatrix);
            offset++;
        }
    }

    console.log(matrix.length, patchMatrixLength * offset, patches);

    const floor = Math.floor;
    const mod = (x, y) => x % y;

    function testXZ(x, z) {
        const index = x + (z * width);
        const frag  = patchWidth * patchDepth;
        const level = floor(index / frag);
        const sigma = mod(index, frag);
    
        const localX = mod(sigma, patchWidth);
        const localZ = floor(sigma / patchDepth);
        const localIndex = localZ * patchWidth + localX;

        //console.log(matrix[index], patches[level][localIndex], localX, localZ);
        console.log(localIndex, localX, localZ, patches[level][localIndex], matrix[index]);
    }
    
    testXZ(1893, 572);
    testXZ(1010, 754);
    testXZ(234, 456);
})();

(() => {

    function floatToUnsignedInts(f) {
        if (f < 0 || f > 1) {
            // Если число вне диапазона, возвращаем 0 для всех
            return [0, 0, 0];
        }
    
        // Преобразуем float [0.0, 1.0] в диапазон 0-16777215 (2^24 - 1)
        const scaled = Math.floor(f * 16777215);
    
        // Разделяем на 3 unsigned int по 8 бит
        const a = (scaled >> 16) & 0xFF; // Первые 8 бит
        const b = (scaled >> 8) & 0xFF;  // Вторые 8 бит
        const c = scaled & 0xFF;         // Третьи 8 бит
    
        return [a, b, c];
    }
    
    function unsignedIntsToFloat(a, b, c) {
        // Собираем 24-битное значение обратно
        const scaled = (a << 16) | (b << 8) | c;
    
        // Преобразуем обратно в float [0.0, 1.0]
        return scaled / 16777215;
    }
    
    // Пример использования
    const number = 0.1234567890; // Число в диапазоне [0.0, 1.0]
    const [a, b, c] = floatToUnsignedInts(number);
    console.log(`Float: ${number} -&amp;gt; Unsigned Ints: ${a}, ${b}, ${c}`);
    
    const convertedBack = unsignedIntsToFloat(a, b, c);
    console.log(`Converted back: ${convertedBack}`);

})();

(() => {

    function floatToUnsignedInts(f) {

        if (f < 0 || f > 1) {
            // Если число вне диапазона, возвращаем 0 для всех
            return [0, 0];
        }

        // Преобразуем float [0.0, 1.0] в диапазон 0-65535 (2^16 - 1)
        const scaled = Math.floor(f * 65535);
    
        // Разделяем на 2 unsigned int по 8 бит
        const a = (scaled >> 8) & 0xFF;  // Первые 8 бит
        const b = scaled & 0xFF;         // Вторые 8 бит
    
        return [a, b];
    }
    
    function unsignedIntsToFloat(a, b) {
        // Собираем 24-битное значение обратно
        const scaled = (a << 8) | b;
    
        // Преобразуем обратно в float [0.0, 1.0]
        return scaled / 65535;
    }
    
    // Пример использования
    const number = 0.15625//;0.9876543210; // Число в диапазоне [0.0, 1.0]
    const [a, b] = floatToUnsignedInts(number);
    console.log(`Float: ${number} -&amp;gt; Unsigned Ints: ${a}, ${b}`);

    const convertedBack1 = unsignedIntsToFloat(a, b);
    console.log(`Converted back: ${convertedBack1}`);

    const tmpArr = new Uint16Array(1);

    tmpArr[0] = number * 0xffff;

    const convertedBack2 = tmpArr[0] / 0xffff;

    console.log(`Converted back: ${convertedBack2}`);

})();

(() => {

    const float32Array = new Float32Array(1);
    const uint32Array = new Uint32Array(1);

    function floatToFloat16(value) {

        float32Array[0] = value;
        uint32Array[0]  = float32Array[0]; // преобразование во float32
    
        const float32 = uint32Array[0];
        const sign = (float32 >>> 31) & 0x1;
        const exponent = (float32 >>> 23) & 0xFF;
        const mantissa = float32 & 0x7FFFFF;
    
        // Преобразование в float16
        let float16;
        if (exponent === 0xFF) {
            // Переполнение или NaN
            float16 = (sign << 15) | (0x1F << 10); // используем Infinity для NaN
        } else if (exponent === 0) {
            // Денормализованное число
            float16 = (sign << 15); // денормализованные не имеют битов порядка
        } else {
            let newExponent = exponent - 127 + 15; // смещение порядка
            if (newExponent <= 0) {
                float16 = (sign << 15); // ноль
            } else if (newExponent >= 0x1F) {
                float16 = (sign << 15) | (0x1F << 10); // Переполнение: бесконечность
            } else {
                mantissa = mantissa >>> 13; // округляем мантиссу
                float16 = (sign << 15) | (newExponent << 10) | mantissa;
            }
        }
    
        return float16;
    }
    
    function float16ToFloat(float16) {
        const sign = (float16 >>> 15) & 0x1;
        const exponent = (float16 >>> 10) & 0x1F;
        const mantissa = float16 & 0x3FF;
    
        // Возврат к float32
        let float32;
        if (exponent === 0x1F) {
            float32 = (sign << 31) | 0x7F800000; // бесконечность или NaN
        } else if (exponent === 0) {
            // Денормализованное число
            float32 = (sign << 31); // ноль
        } else {
            // Нормализованное float
            exponent = exponent - 15 + 127; // смещение порядка
            mantissa = mantissa << 13; // возвращаем мантиссу
            float32 = (sign << 31) | (exponent << 23) | mantissa;
        }

        uint32Array[0] = float32; // записываем float32 в массив
        float32Array[0] = uint32Array[0]; // преобразуем в float
    
        return float32Array[0];
    }
    
    // Примеры использования
    let originalFloat = 0.15625;
    let float16Value = floatToFloat16(originalFloat);
    console.log("Float16:", float16Value.toString(16)); // выводит float16 в шестнадцатеричном формате
    let recoveredFloat = float16ToFloat(float16Value);
    console.log("Recovered float:", recoveredFloat); // должно вывести 0.15625

})();


(() => {

    const zone = {minX: 2059, maxX: 2062, minZ: 1768, maxZ: 1771};
    const width = 4097;
    const depth = 4097;
    const patchSize = 129;
    const numPatchesX = 32;
    const numPatchesZ = 32;

    if (zone.maxX < 0) return;
    if (zone.maxZ < 0) return;

    const minX = Math.max(zone.minX, 0);
    const minZ = Math.max(zone.minZ, 0);
    const maxX = Math.min(zone.maxX, width);
    const maxZ = Math.min(zone.maxZ, depth);
    
    const minPatchX = minX / patchSize | 0;
    const minPatchZ = minZ / patchSize | 0;
    const maxPatchX = maxX / patchSize | 0;
    const maxPatchZ = maxZ / patchSize | 0;

    const normalizeMinX = Math.max(minPatchX, 0);
    const normalizeMinZ = Math.max(minPatchZ, 0);
    const normalizeMaxX = Math.min(maxPatchX + 1, numPatchesX);
    const normalizeMaxZ = Math.min(maxPatchZ + 1, numPatchesZ);

    for (let z = normalizeMinZ; z < normalizeMaxZ; z++) {

        for (let x = normalizeMinX; x < normalizeMaxX; x++) {

            const patchIndex = z * numPatchesX + x;

            console.log(patchIndex, x, z);
        }
    }

})();