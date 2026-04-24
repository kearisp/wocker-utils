import {describe, it, expect} from "@jest/globals";
import {Image} from "./Image";


describe("Image", () => {
    describe("parse", () => {
        it("should parse simple image name", () => {
            const image = Image.parse("nginx");

            expect(image.name).toBe("nginx");
            expect(image.tag).toBeUndefined();
            expect(image.registry).toBeUndefined();
            expect(image.repository).toBeUndefined();
            expect(image.digest).toBeUndefined();
        });

        it("should parse image with tag", () => {
            const image = Image.parse("nginx:1.25");

            expect(image.name).toBe("nginx");
            expect(image.tag).toBe("1.25");
        });

        it("should parse image with registry and tag", () => {
            const image = Image.parse("registry.example.com/team/app:1.2.3");

            expect(image.registry).toBe("registry.example.com");
            expect(image.repository).toBe("team");
            expect(image.name).toBe("app");
            expect(image.tag).toBe("1.2.3");
        });

        it("should parse image with registry port and tag", () => {
            const image = Image.parse("registry.example.com:5000/team/app:latest");

            expect(image.registry).toBe("registry.example.com:5000");
            expect(image.repository).toBe("team");
            expect(image.name).toBe("app");
        });

        it("should parse image with localhost and port", () => {
            const image = Image.parse("localhost:5000/my-image:1.0");

            expect(image.registry).toBe("localhost:5000");
            expect(image.name).toBe("my-image");
        });

        it("should parse image with digest", () => {
            const digest = "sha256:45b230231254c0007901342a34658253106191b7d8d21e8d167a57a87e504e03";
            const image = Image.parse(`repo/app@${digest}`);

            expect(image.repository).toBe("repo");
            expect(image.name).toBe("app");
            expect(image.digest).toBe(digest);
        });

        it("should throw error for invalid format", () => {
            expect(() => Image.parse("invalid image name")).toThrow('Invalid image format: "invalid image name"');
        });
    });

    describe("isValid", () => {
        it("should return true for valid image name", () => {
            expect(Image.isValid("nginx")).toBe(true);
        });

        it("should return true for valid image with tag", () => {
            expect(Image.isValid("nginx:latest")).toBe(true);
        });

        it("should return true for valid image with registry and repository", () => {
            expect(Image.isValid("registry.example.com/team/app:1.2.3")).toBe(true);
        });

        it("should return false for invalid image name", () => {
            expect(Image.isValid("invalid image name")).toBe(false);
        });
    });

    describe("toString", () => {
        it("should return correct string for simple image", () => {
            const image = new Image("nginx", "latest");

            expect(image.toString()).toBe("nginx:latest");
        });

        it("should return correct string for image with tag", () => {
            const image = new Image("nginx", "1.25", undefined, undefined, "1.25");

            expect(image.toString()).toBe("nginx:1.25@1.25");
        });

        it("should return correct string for complex image", () => {
            const image = new Image(
                "app",
                "1.2.3",
                "registry.example.com",
                "team",
                "1.2.3"
            );

            expect(image.toString()).toBe("registry.example.com/team/app:1.2.3@1.2.3");
        });

        it("should include digest in toString", () => {
            const digest = "sha256:12345";
            const image = new Image("app", undefined, undefined, "repo", digest);

            expect(image.toString()).toBe("repo/app@sha256:12345");
        });
    });
});
