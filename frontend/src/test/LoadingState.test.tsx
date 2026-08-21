import {
    render,
    screen,
} from "@testing-library/react"

import {
    describe,
    expect,
    it,
} from "vitest"

import { LoadingState } from "../components/LoadingState"

describe("LoadingState", () => {
    it("displays the loading message", () => {
        render(
            <LoadingState
                message="Loading customers…"
            />,
        )

        expect(
            screen.getByText(
                "Loading customers…",
            ),
        ).toBeInTheDocument()
    })
})