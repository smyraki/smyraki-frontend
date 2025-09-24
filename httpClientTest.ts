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

import { describe, it, expect } from "vitest"
import { Http } from "./httpClient"

const fetch: Http.Fetch = (request) => {
    switch (true) {
        case request.url === "https://smyraki.github.io/":
            return Promise.resolve(
                Response.json(
                    { message: "Smyraki!" }
                )
            )
        case request.url === "https://smyraki.github.io/reverse-csrf":
            return Promise.resolve(
                Response.json({ reversedCsrfHeader: request.headers.get("X-REVERSE-ME")?.split('')?.reverse()?.join('') })
            )
        default:
            return Promise.reject(
                "Missing: stub for " + request.url
            )
    }
}

describe("HttpClient", () => {
    it("should fetch data with no filters", async () => {
        const httpClient = Http.Client.builder(fetch).build()
        const actual = await httpClient("https://smyraki.github.io/")

        expect(
            actual.ok
        ).toBe(
            true
        )
        expect(
            await actual.json()
        ).toEqual(
            { message: "Smyraki!" }
        )
    })

    it("should add custom header for POST requests", async () => {
        const httpClient = Http.Client.builder(fetch)
            .withFilter((request, next) => {
                const headers = new Headers(request.headers);
                headers.set("X-REVERSE-ME", "abc-123");
                return next(new Request(request, { headers }));
            })
            .build()

        const actual = await httpClient("https://smyraki.github.io/reverse-csrf", { method: "POST" })
        expect(
            actual.ok)
            .toBe(
                true
            )
        expect(
            await actual.json()
        ).toEqual(
            { reversedCsrfHeader: "321-cba" }
        )
    })
})