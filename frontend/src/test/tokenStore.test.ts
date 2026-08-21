import { beforeEach, describe, expect, it } from "vitest"
import { tokenStore } from "../security/tokenStore"

describe("tokenStore", () => {
    beforeEach(() => {
        tokenStore.clear()
        localStorage.clear()
        sessionStorage.clear()
    })

    it("keeps tokens out of Web Storage", () => {
        tokenStore.set("secret-token")

        expect(tokenStore.get()).toBe("secret-token")
        expect(localStorage.getItem("token")).toBeNull()
        expect(sessionStorage.getItem("token")).toBeNull()
    })
})