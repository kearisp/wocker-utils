export const demuxOutput = (buffer: Buffer): Buffer => {
    function bufferSlice(end: number): Buffer {
        const method = "subarray" in buffer ? "subarray" : "slice",
              out = buffer[method](0, end);

        buffer = Buffer.from(buffer[method](end, buffer.length));

        return out;
    }

    let nextDataLength = null,
        output = Buffer.from([]);

    while(buffer.length > 0) {
        const header = bufferSlice(8);
        nextDataLength = header.readUInt32BE(4);

        const content = bufferSlice(nextDataLength);
        output = Buffer.concat([output, content]);
    }

    return output;
};
