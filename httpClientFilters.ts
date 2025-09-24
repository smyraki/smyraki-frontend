/*
Copyright 2025 Kristian Myrhaug

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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

