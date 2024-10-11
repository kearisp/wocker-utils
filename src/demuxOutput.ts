export const demuxOutput = (buffer: Buffer): Buffer => {
    let nextDataLength = null,
        output = Buffer.from([]);

    while(buffer.length > 0) {
        const header = bufferSlice(8);
        nextDataLength = header.readUInt32BE(4);

        const content = bufferSlice(nextDataLength);
        output = Buffer.concat([output, content]);
    }

    function bufferSlice(end: number): Buffer {
        const out = buffer.subarray(0, end);

        buffer = Buffer.from(buffer.subarray(end, buffer.length));

        return out;
    }

    return output;
};
