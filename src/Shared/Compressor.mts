export default class Compressor {

    private static _concatChunks(chunks: Uint8Array[], totalLength: number) {

        let position = 0;

        // Concatenate all Uint8Array chunks into a single ArrayBuffer
        const resultBuffer = new Uint8Array(totalLength);        
        for (const chunk of chunks) {
            resultBuffer.set(chunk, position);
            position += chunk.length;
        }

        return resultBuffer.buffer;
    }

    private static async _getResult(reader: ReadableStreamDefaultReader<any>) {

        let totalLength = 0;

        const chunks: Uint8Array[] = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            totalLength += value.length;
        }

        return this._concatChunks(chunks, totalLength);
    }

    public static async compressBuffer(buffer: ArrayBuffer, format: CompressionFormat = 'gzip') {

        const compressedStream = new CompressionStream(format);
        const writer = compressedStream.writable.getWriter();
        
        writer.write(new Uint8Array(buffer));
        writer.close();

        const reader = compressedStream.readable.getReader();

        return this._getResult(reader);
    }

    public static async decompressBuffer(buffer: ArrayBuffer, format: CompressionFormat = 'gzip') {

        const decompressedStream = new DecompressionStream(format);
        const reader = decompressedStream.readable.getReader();
        const writer = decompressedStream.writable.getWriter();
    
        // Write the compressed buffer to the writer
        writer.write(new Uint8Array(buffer));
        writer.close();

        return this._getResult(reader);
    }
}