export namespace Http {
    export type Fetch = (request: Request) => Promise<Response>
    export type FilterChain = (request: Request) => Promise<Response>
    export type Filter = (request: Request, chain: Http.FilterChain) => Promise<Response>
    export type Client = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
    export namespace Client {
        export interface Builder {
            withFilter(...filters: Http.Filter[]): Http.Client.Builder
            build(): Http.Client
        }
        export function builder(
            fetch: Fetch = (request) => window.fetch(request)
        ): Http.Client.Builder {
            let _filters: Http.Filter[] = [];
            return {
                withFilter(
                    ...filters: Http.Filter[]
                ) {
                    _filters.push(...filters)
                    return this;
                },
                build() {
                    let chain = fetch;
                    for (const filter of _filters.reverse()) {
                        const nextChain = chain
                        chain = (request: Request) => filter(request, nextChain)
                    }
                    return (input: RequestInfo | URL, init?: RequestInit) => {
                        const request = new Request(input, init)
                        return chain(request)
                    }
                }
            };
        }
    }
}

