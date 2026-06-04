import {Readable} from "stream";
import {toFormData} from "../tools/toFormData";


export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpParams {
    method?: HttpMethod;
    path?: string;
    headers?: Record<string, string>;
    query?: Record<string, any>;
    body?: any;
    timeout?: number | null;
    abortSignal?: AbortSignal | null;
    retryCount?: number;
    expectStatus?: HttpStatusPattern;
}

export type HttpStatusPattern =
    | number
    | number[]
    | ((status: number) => boolean);

export class HttpResponseException extends Error {
    public constructor(
        public readonly response: HttpResponse,
        message?: string
    ) {
        super(message || `HTTP request failed with status ${response.status}`);

        this.name = "HttpResponseException";
    }

    public get status(): number {
        return this.response.status;
    }

    public get headers() {
        return this.response.headers;
    }

    public async json() {
        return this.response.json();
    }

    public async text() {
        return this.response.text();
    }

    public async stream() {
        return this.response.stream();
    }
}

export class HttpResponse<T = unknown> {
    public constructor(
        public readonly raw: Response,
        protected readonly expectStatus?: HttpStatusPattern
    ) {}

    public get status(): number {
        return this.raw.status;
    }

    public get headers(): Headers {
        return this.raw.headers;
    }

    public header(key: string): string | null {
        return this.headers.get(key.toLowerCase());
    }

    public get ok(): boolean {
        return this.raw.ok;
    }

    public get failed(): boolean {
        return !this.ok;
    }

    public get isExpectedStatus(): boolean {
        if(!this.expectStatus) {
            return true;
        }

        let isExpected = false;

        const expectStatus = this.expectStatus;

        if(typeof expectStatus === "number") {
            isExpected = this.status === expectStatus;
        }
        else if(Array.isArray(expectStatus)) {
            isExpected = expectStatus.includes(this.status);
        }
        else if(typeof expectStatus === "function") {
            isExpected = expectStatus(this.status);
        }

        return isExpected;
    }

    public async json<R = T>(): Promise<R> {
        return this.raw.json() as Promise<R>;
    }

    public async text(): Promise<string> {
        return this.raw.text();
    }

    public stream(): ReadableStream<Uint8Array> | NodeJS.ReadableStream | null {
        return this.raw.body;
    }

    public pipe<T extends NodeJS.WritableStream>(pipe: T): T {
        if(!this.raw.body) {
            throw new Error("Response body is empty (no stream available)");
        }

        return Readable.from(this.raw.body).pipe(pipe);
    }
}

export class Http {
    protected constructor(
        public readonly baseUrl: string,
        protected readonly params: HttpParams = {}
    ) {}

    public get url(): string {
        const combinedPath = this.params.path;
        let urlStr = this.baseUrl || "";

        if(combinedPath) {
            if(combinedPath.startsWith("http://") || combinedPath.startsWith("https://")) {
                urlStr = combinedPath;
            }
            else if(urlStr) {
                const base = urlStr.endsWith("/") ? urlStr.slice(0, -1) : urlStr;
                const p = combinedPath.startsWith("/") ? combinedPath : `/${combinedPath}`;

                urlStr = base + p;
            }
            else {
                urlStr = combinedPath;
            }
        }

        if(!urlStr) {
            throw new Error("URL is not defined");
        }

        let url: URL;

        try {
            url = new URL(urlStr);
        }
        catch(e) {
            url = new URL(urlStr, "http://localhost");
        }

        if(this.params.query) {
            for(const [key, value] of Object.entries(this.params.query)) {
                if(value === null || value === undefined)
                    continue;

                if(Array.isArray(value)) {
                    for(const item of value) {
                        url.searchParams.append(key, String(item));
                    }
                }
                else {
                    url.searchParams.append(key, String(value));
                }
            }
        }

        return url.toString();
    }

    public get(path?: string): Http {
        return this.clone({
            ...path ? {path} : {},
            method: "GET"
        });
    }

    public post(path?: string): Http {
        return this.clone({
            ...path ? {path} : {},
            method: "POST"
        });
    }

    public put(path?: string): Http {
        return this.clone({
            ...path ? {path} : {},
            method: "PUT"
        });
    }

    public patch(path?: string): Http {
        return this.clone({
            ...path ? {path} : {},
            method: "PATCH"
        });
    }

    public delete(path?: string): Http {
        return this.clone({
            ...path ? {path} : {},
            method: "DELETE"
        });
    }

    public withHeaders(headers: Record<string, string>): Http {
        return this.clone({
            headers
        });
    }

    public withHeader(name: string, value: string): Http {
        return this.withHeaders({
            [name]: value
        });
    }

    public withParam(name: string, value: any): Http {
        return this.withQuery({
            [name]: value
        });
    }

    public withQuery(query: Record<string, any>): Http {
        return this.clone({
            query
        });
    }

    public withJson(body: any): Http {
        return this.clone({
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
    }

    public withForm(body: FormData | Record<string, any>): Http {
        return this.clone({
            body: body instanceof FormData
                ? body
                : toFormData(body)
        });
    }

    public withFormUrlEncoded(body: Record<string, any> | URLSearchParams): Http {
        const params = body instanceof URLSearchParams
            ? body
            : new URLSearchParams(body)

        return this.clone({
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: params.toString()
        })
    }

    public withBody(body: any): Http {
        return this.clone({
            body
        });
    }

    public timeout(ms: number): Http {
        return this.clone({
            timeout: ms
        });
    }

    public retry(count: number): Http {
        return this.clone({
            retryCount: count
        });
    }

    public abortSignal(signal: AbortSignal): Http {
        return this.clone({
            abortSignal: signal
        });
    }

    public expectStatus(pattern: HttpStatusPattern): Http {
        return this.clone({
            expectStatus: pattern
        });
    }

    public async send<T = unknown>(): Promise<HttpResponse<T>> {
        const url = this.url,
              retryCount = this.params.retryCount || 0;

        let lastError: any;

        for(let attempt = 0; attempt <= retryCount; attempt++) {
            const controller = new AbortController(),
                  signals: AbortSignal[] = [];

            if(this.params.abortSignal) {
                signals.push(this.params.abortSignal);
            }

            let timeoutId: any;

            if(this.params.timeout) {
                timeoutId = setTimeout(() => controller.abort(), this.params.timeout);
                signals.push(controller.signal);
            }

            const combinedSignal = (AbortSignal as any).any
                ? (AbortSignal as any).any(signals.length > 0 ? signals : [controller.signal])
                : (signals[0] || controller.signal);

            try {
                const response = await fetch(url, {
                    method: this.params.method || "GET",
                    headers: this.params.headers as HeadersInit,
                    body: this.params.body,
                    signal: combinedSignal
                });

                if(timeoutId) {
                    clearTimeout(timeoutId);
                }

                const httpResponse = new HttpResponse<T>(
                    response,
                    this.params.expectStatus
                );

                if(!httpResponse.isExpectedStatus) {
                    lastError = new HttpResponseException(httpResponse);
                    continue;
                }

                return httpResponse;
            }
            catch(error: any) {
                if(timeoutId)
                    clearTimeout(timeoutId);

                lastError = error;

                const isNetworkError = error.name === "TypeError" || error.name === "FetchError";
                const isTimeoutError = (error.name === "AbortError" || error.name === "TimeoutError") && this.params.timeout && !this.params.abortSignal?.aborted;

                if(attempt < retryCount && (isNetworkError || isTimeoutError)) {
                    continue;
                }

                throw error;
            }
        }

        throw lastError;
    }

    public async json<T = unknown>(): Promise<T> {
        const res = await this.send<T>();

        return res.json<T>();
    }

    public async text(): Promise<string> {
        const res = await this.send();

        return res.text();
    }

    public async stream(): Promise<ReadableStream<Uint8Array> | NodeJS.ReadableStream | null> {
        const res = await this.send();

        return res.stream();
    }

    protected clone(params: HttpParams = {}) {
        const {
            headers,
            query,
            ...rest
        } = params;

        const nextParams: HttpParams = {
            ...this.params,
            ...rest
        };

        if(headers) {
            nextParams.headers = {
                ...nextParams.headers || {},
                ...headers
            };
        }

        if(query) {
            nextParams.query = {
                ...nextParams.query || {},
                ...query
            };
        }

        return new Http(this.baseUrl, nextParams);
    }

    public static base(url: string, params?: HttpParams): Http {
        return new Http(url, params);
    }

    public static get(url: string): Http {
        return new Http(url, {
            method: "GET"
        });
    }

    public static post(url: string): Http {
        return new Http(url, {
            method: "POST"
        });
    }

    public static put(url: string): Http {
        return new Http(url, {
            method: "PUT"
        });
    }

    public static patch(url: string): Http {
        return new Http(url, {
            method: "PATCH"
        });
    }

    public static delete(url: string): Http {
        return new Http(url, {
            method: "DELETE"
        });
    }
}
