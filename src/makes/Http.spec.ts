import {describe, it, expect, jest, beforeEach} from "@jest/globals";
import {Http, HttpResponseException} from "./Http";


describe("Http", () => {
    let fetchMock: jest.Mock<any>;

    function fail(message: string) {
        throw new Error(message);
    }

    beforeEach(() => {
        fetchMock = jest.fn<any>() as any;
        global.fetch = fetchMock as any;
    });

    it("should send GET request with headers", async () => {
        fetchMock.mockResolvedValue(new Response(JSON.stringify({ok: true}), {
            status: 200,
            headers: {"Content-Type": "application/json"}
        }));

        const res = await Http.get("https://api.example.com")
            .withHeader("Authorization", "Bearer token")
            .withHeaders({"X-Foo": "bar"})
            .get("/users")
            .send();

        expect(fetchMock).toHaveBeenCalledWith(
            "https://api.example.com/users",
            expect.objectContaining({
                method: "GET",
                headers: expect.objectContaining({
                    "Authorization": "Bearer token",
                    "X-Foo": "bar"
                })
            })
        );
        expect(await res.json()).toEqual({ok: true});
    });

    it("should handle query parameters", async () => {
        fetchMock.mockResolvedValue(new Response("ok"));

        await Http.get("https://api.example.com/api")
            .withQuery({page: 1, tags: ["a", "b"], empty: null})
            .send();

        const calledUrl = fetchMock.mock.calls[0][0] as string;
        const url = new URL(calledUrl);

        expect(url.searchParams.get("page")).toBe("1");
        expect(url.searchParams.getAll("tags")).toEqual(["a", "b"]);
        expect(url.searchParams.has("empty")).toBe(false);
    });

    it("should send JSON body", async () => {
        fetchMock.mockResolvedValue(new Response("ok"));

        await Http.post("https://api.example.com")
            .withJson({name: "John"})
            .send();

        expect(fetchMock).toHaveBeenCalledWith(
            "https://api.example.com/",
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify({name: "John"}),
                headers: expect.objectContaining({
                    "Content-Type": "application/json"
                })
            })
        );
    });

    it("should send Form body", async () => {
        fetchMock.mockResolvedValue(new Response("ok"));

        await Http.post("https://api.example.com")
            .withForm({name: "John", age: 30})
            .send();

        const call = fetchMock.mock.calls[0][1] as any;

        expect(call.body).toBeInstanceOf(FormData);
    });

    it("should validate status and throw HttpResponseException", async () => {
        fetchMock.mockResolvedValue(new Response(JSON.stringify({error: "Not Found"}), {
            status: 404,
            headers: {"Content-Type": "application/json"}
        }));

        try {
            await Http.get("https://api.example.com")
                .expectStatus(200)
                .send();

            fail("Should have thrown");
        }
        catch(e) {
            expect(e).toBeInstanceOf(HttpResponseException);

            const err = e as HttpResponseException;

            expect(err.status).toBe(404);
        }
    });

    it("should support multiple status patterns", async () => {
        fetchMock.mockResolvedValue(new Response("ok", {status: 201}));

        // number[]
        await Http.post("/").expectStatus([200, 201]).send();

        // function
        await Http.post("/").expectStatus((s) => s < 400).send();

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("should support ok/failed properties", async () => {
        fetchMock.mockResolvedValueOnce(new Response("ok", {status: 200}));
        fetchMock.mockResolvedValueOnce(new Response("error", {status: 500}));

        const res1 = await Http.get("/").send();

        expect(res1.ok).toBe(true);
        expect(res1.failed).toBe(false);

        const res2 = await Http.get("/").send();

        expect(res2.ok).toBe(false);
        expect(res2.failed).toBe(true);
    });

    it("should support Http.base and clones", async () => {
        fetchMock.mockResolvedValue(new Response("ok"));

        const base = Http.base("https://api.com").withHeader("X-Base", "1");

        await base.get("/1").send();

        expect(fetchMock).toHaveBeenCalledWith("https://api.com/1", expect.objectContaining({
            headers: expect.objectContaining({"X-Base": "1"})
        }));

        await base.post("/2").withHeader("X-Child", "2").send();

        expect(fetchMock).toHaveBeenCalledWith("https://api.com/2", expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({"X-Base": "1", "X-Child": "2"})
        }));

        // Verify base is not mutated
        await base.get("/3").send();

        const lastCallHeaders = (fetchMock.mock.calls[2][1] as any).headers;

        expect(lastCallHeaders["X-Child"]).toBeUndefined();
    });

    it("should handle timeout", async () => {
        fetchMock.mockImplementation((url: string, init: any) => {
            return new Promise((resolve, reject) => {
                if(init.signal) {
                    if(init.signal.aborted) {
                        reject(new Error("Aborted"));
                        return;
                    }

                    init.signal.addEventListener("abort", () => reject(new Error("Aborted")));
                }

                setTimeout(() => resolve(new Response("ok")), 100);
            });
        });

        const promise = Http.get("http://api.com").timeout(10).send();

        await expect(promise).rejects.toThrow();
    });

    it("should retry on 5xx errors", async () => {
        fetchMock
            .mockResolvedValueOnce(new Response("error", {status: 500}))
            .mockResolvedValueOnce(new Response("error", {status: 502}))
            .mockResolvedValueOnce(new Response("success", {status: 200}));

        const res = await Http.get("/").expectStatus(200).retry(2).send();

        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(res.status).toBe(200);
    });

    it("should ensure immutability", async () => {
        fetchMock.mockResolvedValue(new Response("ok"));

        const builder1 = Http.base("https://api.com");
        const builder2 = builder1.withHeader("X-Test", "1");
        const builder3 = builder2.withQuery({a: 1});

        expect(builder1).not.toBe(builder2);
        expect(builder2).not.toBe(builder3);

        // @ts-ignore
        expect(builder1.params.headers?.["X-Test"]).toBeUndefined();
        // @ts-ignore
        expect(builder2.params.query?.["a"]).toBeUndefined();

        await builder3.send();

        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining("a=1"),
            expect.objectContaining({
                headers: expect.objectContaining({"X-Test": "1"})
            })
        );
    });
});
