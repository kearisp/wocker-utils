import {describe, it, expect} from "@jest/globals";
import {demuxOutput} from "./demuxOutput";


describe("demuxOutput", () => {
    const createDemuxedPacket = (content: Buffer): Buffer => {
        const header = Buffer.alloc(8);

        header.writeUInt32BE(content.length, 4);

        return Buffer.concat([header, content]);
    };

    it("should extract content from a single demuxed packet", () => {
        const content = Buffer.from("Hello, world!");
        const packet = createDemuxedPacket(content);

        const result = demuxOutput(packet);

        expect(result).toEqual(content);
    });

    it("should handle empty content packet", () => {
        // Arrange
        const content = Buffer.from('');
        const packet = createDemuxedPacket(content);

        // Act
        const result = demuxOutput(packet);

        // Assert
        expect(result).toEqual(content);
        expect(result.length).toBe(0);
    });

    it("should extract and concatenate content from multiple demuxed packets", () => {
        // Arrange
        const content1 = Buffer.from('First chunk');
        const content2 = Buffer.from('Second chunk');
        const content3 = Buffer.from('Third chunk');

        const packet1 = createDemuxedPacket(content1);
        const packet2 = createDemuxedPacket(content2);
        const packet3 = createDemuxedPacket(content3);

        const combinedPacket = Buffer.concat([packet1, packet2, packet3]);

        // Act
        const result = demuxOutput(combinedPacket);

        // Assert
        const expectedOutput = Buffer.concat([content1, content2, content3]);
        expect(result).toEqual(expectedOutput);
    });

    it("should handle binary data correctly", () => {
        // Arrange
        const binaryData = Buffer.from([0x00, 0x01, 0x02, 0x03, 0xFF, 0xFE, 0xFD, 0xFC]);
        const packet = createDemuxedPacket(binaryData);

        // Act
        const result = demuxOutput(packet);

        // Assert
        expect(result).toEqual(binaryData);
    });

    it.each([
        (() => {
            const size = 30 * 1024;
            const content = Buffer.alloc(size).fill(0x42);

            return {
                packet: createDemuxedPacket(content),
                content,
                size
            };
        })(),
        (() => {
            const content1 = Buffer.alloc(100).fill('A');
            const content2 = Buffer.alloc(200).fill('B');
            const content3 = Buffer.alloc(50).fill('C');

            const packet1 = createDemuxedPacket(content1);
            const packet2 = createDemuxedPacket(content2);
            const packet3 = createDemuxedPacket(content3);

            return {
                packet: Buffer.concat([packet1, packet2, packet3]),
                content: Buffer.concat([content1, content2, content3]),
                size: 350
            };
        })(),
        ...["A", "B", "C"].map((value, index) => {
            const size = (index + 1) * 100,
                  content = Buffer.alloc(size).fill(value);

            return {
                packet: createDemuxedPacket(content),
                content,
                size
            };
        })
    ])("should handle packets with different sizes", ({packet, content, size}) => {
        const result = demuxOutput(packet);

        expect(result).toEqual(content);
        expect(result.length).toBe(size);
    });
});
