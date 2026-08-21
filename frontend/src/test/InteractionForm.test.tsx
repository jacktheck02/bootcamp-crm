import {
    render,
    screen,
} from "@testing-library/react"

import userEvent from "@testing-library/user-event"

import {
    describe,
    expect,
    it,
    vi,
} from "vitest"

import { InteractionForm } from "../components/InteractionForm"

import type {
    CreateInteractionRequest,
    Interaction,
} from "../types/crm"

describe("InteractionForm", () => {
    it("renders the interaction fields", () => {
        render(
            <InteractionForm
                saving={false}
                onCancel={vi.fn()}
                onSaved={vi.fn()}
            />,
        )

        expect(
            screen.getByLabelText("Type"),
        ).toBeInTheDocument()

        expect(
            screen.getByLabelText("Summary"),
        ).toBeInTheDocument()
    })

    it("requires a summary", async () => {
        const user = userEvent.setup()
        const onSaved = vi.fn()

        render(
            <InteractionForm
                saving={false}
                onCancel={vi.fn()}
                onSaved={onSaved}
            />,
        )

        await user.click(
            screen.getByRole("button", {
                name: "Save interaction",
            }),
        )

        expect(
            screen.getByRole("alert"),
        ).toBeInTheDocument()

        expect(onSaved).not.toHaveBeenCalled()
    })

    it("creates an interaction", async () => {
        const user = userEvent.setup()

        const onSaved = vi.fn(
            async (
                input: CreateInteractionRequest,
            ): Promise<Interaction> => ({
                interactionId: "INT-1002",
                customerId: "CUS-1001",
                ...input,
                createdAt:
                    "2026-08-20T15:00:00Z",
            }),
        )

        render(
            <InteractionForm
                saving={false}
                onCancel={vi.fn()}
                onSaved={onSaved}
            />,
        )

        await user.selectOptions(
            screen.getByLabelText("Type"),
            "EMAIL",
        )

        await user.type(
            screen.getByLabelText("Summary"),
            "Sent follow-up email.",
        )

        await user.click(
            screen.getByRole("button", {
                name: "Save interaction",
            }),
        )

        expect(onSaved).toHaveBeenCalledWith({
            type: "EMAIL",
            summary: "Sent follow-up email.",
        })
    })

    it("can be cancelled", async () => {
        const user = userEvent.setup()
        const onCancel = vi.fn()

        render(
            <InteractionForm
                saving={false}
                onCancel={onCancel}
                onSaved={vi.fn()}
            />,
        )

        await user.click(
            screen.getByRole("button", {
                name: "Cancel",
            }),
        )

        expect(onCancel).toHaveBeenCalledOnce()
    })
})