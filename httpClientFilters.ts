import { HttpFilter } from "./httpClient.ts";

export function credentialsFilter(
    credentials: RequestCredentials = "include"
): HttpFilter {
    return (request: Request, next: (request: Request) => Promise<Response>) => {
        return next(new Request(request, { credentials: credentials }))
    }
}

export function timeoutFilter(
    timeoutInMilliseconds: number = 30000 // 30 seconds * 1000 milliseconds 
): HttpFilter {
    return (request: Request, next: (request: Request) => Promise<Response>) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutInMilliseconds);
        return next(new Request(request, { signal: controller.signal }))
            .finally(() => clearTimeout(timeoutId));
    }
}

export function setHeaderFilter(
    methodPredicate: (method: Request) => boolean = () => true, 
    headerName: string, 
    headerValue: () => string | null | undefined
): HttpFilter {
    return (request: Request, next: (request: Request) => Promise<Response>) => {
        if (methodPredicate(request)) {    
            const value = headerValue();
            if (value !== null && value !== undefined) {
                const headers = new Headers(request.headers);
                headers.set(headerName, value);
                return next(new Request(request, { headers }));
            }
        }
        return next(request);
    }
}

const csrfSafeMethods = ["GET", "HEAD", "OPTIONS"]; 
export function setCsrfHeaderFilter(
    csrfHeaderName: string, 
    csrfHeaderValue: () => string | null | undefined
): HttpFilter {
    return setHeaderFilter(
        (request) => false === csrfSafeMethods.includes(request.method.toUpperCase()),
        csrfHeaderName, 
        csrfHeaderValue
    ) 
}

