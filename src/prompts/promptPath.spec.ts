import {describe, it, beforeEach, expect} from "@jest/globals";
import {render} from "@inquirer/testing";
import FS from "fs";
import {promptPath} from "./promptPath";


jest.mock("fs");

describe("promptPath", (): void => {
    const mockFS = FS as jest.Mocked<typeof FS>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return entered path on submit", async () => {
        mockFS.existsSync.mockReturnValue(true);
        mockFS.readdirSync.mockReturnValue([]);
        mockFS.statSync.mockReturnValue({
            isDirectory: () => false,
            isFile: () => true
        } as FS.Stats);

        const {answer, events, getScreen} = await render(promptPath, {
            message: "Enter file path"
        });

        expect(getScreen()).toMatchSnapshot();

        events.type("test.txt");
        events.keypress("enter");

        await expect(answer).resolves.toEqual("test.txt");
    });

    it("should show suggestions when typing", async () => {
        mockFS.existsSync.mockReturnValue(true);
        mockFS.readdirSync.mockReturnValue(["test1.txt", "test2.txt", "other.txt"] as any);
        mockFS.statSync.mockReturnValue({
            isDirectory: () => false,
            isFile: () => true
        } as FS.Stats);

        const {events, getScreen} = await render(promptPath, {
            message: "Enter file path"
        });

        events.type("test");

        const screen = getScreen();
        expect(screen).toContain("test1.txt");
        expect(screen).toContain("test2.txt");
        expect(screen).not.toContain("other.txt");
    });

    it("should autocomplete on tab", async () => {
        mockFS.existsSync.mockReturnValue(true);
        mockFS.readdirSync.mockReturnValue(["testfile.txt"] as any);
        mockFS.statSync.mockReturnValue({
            isDirectory: () => false,
            isFile: () => true
        } as FS.Stats);

        const {answer, events, getScreen} = await render(promptPath, {
            message: "Enter file path"
        });

        events.type("test");
        events.keypress("tab");
        events.keypress("enter");

        const screen = getScreen();
        expect(screen).toContain("testfile.txt");

        await expect(answer).resolves.toEqual("testfile.txt");
    });

    it("should navigate suggestions with arrows", async () => {
        mockFS.existsSync.mockReturnValue(true);
        mockFS.readdirSync.mockReturnValue(["file1.txt", "file2.txt", "file3.txt"] as any);
        mockFS.statSync.mockReturnValue({
            isDirectory: () => false,
            isFile: () => true
        } as FS.Stats);

        const {events, getScreen} = await render(promptPath, {
            message: "Enter file path"
        });

        events.type("file");
        events.keypress("down");
        events.keypress("down");

        const screen = getScreen();
        expect(screen).toMatchSnapshot();
    });

    it("should add separator for directories", async () => {
        mockFS.existsSync.mockReturnValue(true);
        mockFS.readdirSync.mockReturnValue(["testdir"] as any);
        mockFS.statSync.mockReturnValue({
            isDirectory: () => true,
            isFile: () => false
        } as FS.Stats);

        const {answer, events} = await render(promptPath, {
            message: "Enter directory path"
        });

        events.type("test");
        events.keypress("tab");
        events.keypress("enter");

        await expect(answer).resolves.toMatch(/testdir[\/\\]$/);
    });

    it("should filter by type (file only)", async () => {
        mockFS.existsSync.mockReturnValue(true);
        mockFS.readdirSync.mockReturnValue(["file.txt", "directory"] as any);
        mockFS.statSync.mockImplementation((path: any) => {
            const isDir = path.toString().includes("directory");
            return {
                isDirectory: () => isDir,
                isFile: () => !isDir
            } as FS.Stats;
        });

        const {events, getScreen} = await render(promptPath, {
            message: "Enter file path",
            filter: "directory"
        });

        events.type("");

        const screen = getScreen();

        expect(screen).toContain("directory");
        expect(screen).not.toContain("file.txt");
    });

    it("should hide hidden files by default", async () => {
        mockFS.existsSync.mockReturnValue(true);
        mockFS.readdirSync.mockReturnValue(["visible.txt", ".hidden"] as any);
        mockFS.statSync.mockReturnValue({
            isDirectory: () => false,
            isFile: () => true
        } as FS.Stats);

        const {events, getScreen} = await render(promptPath, {
            message: "Enter file path"
        });

        events.type("");

        const screen = getScreen();

        expect(screen).toContain("visible.txt");
        expect(screen).not.toContain(".hidden");
    });

    it("should show hidden files when enabled", async () => {
        mockFS.existsSync.mockReturnValue(true);
        mockFS.readdirSync.mockReturnValue([".hidden", "visible.txt"] as any);
        mockFS.statSync.mockReturnValue({
            isDirectory: () => false,
            isFile: () => true
        } as FS.Stats);

        const {events, getScreen} = await render(promptPath, {
            message: "Enter file path",
            showHidden: true
        });

        events.type("");

        const screen = getScreen();

        expect(screen).toContain(".hidden");
        expect(screen).toContain("visible.txt");
    });
});
