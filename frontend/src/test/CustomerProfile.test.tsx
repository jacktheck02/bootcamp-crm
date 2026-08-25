import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { describe, expect, it, vi } from "vitest";

import { CustomerProfile } from "../components/CustomerProfile";

import type { Customer, Interaction } from "../types/crm";

const customer: Customer = {
  customerId: "CUS-1001",
  fullName: "Amina Khan",
  email: "amina.khan@example.test",
  phone: "555-0101",
  status: "ACTIVE",
};

const interactions: Interaction[] = [
  {
    interactionId: "INT-1001",
    customerId: "CUS-1001",
    type: "CALL",
    summary: "Discussed account requirements.",
    createdAt: "2026-08-20T14:00:00Z",
  },
];

describe("CustomerProfile", () => {
  it("displays customer information", () => {
    render(
      <CustomerProfile
        customer={customer}
        interactions={interactions}
        onEditCustomer={vi.fn()}
        onAddInteraction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Amina Khan",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("CUS-1001")).toBeInTheDocument();

    expect(screen.getByText("amina.khan@example.test")).toBeInTheDocument();

    expect(screen.getByText("555-0101")).toBeInTheDocument();
  });

  it("displays the edit button", () => {
    render(
      <CustomerProfile
        customer={customer}
        interactions={interactions}
        onEditCustomer={vi.fn()}
        onAddInteraction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Edit customer",
      }),
    ).toBeInTheDocument();
  });

  it("opens customer editing", async () => {
    const user = userEvent.setup();
    const onEditCustomer = vi.fn();

    render(
      <CustomerProfile
        customer={customer}
        interactions={interactions}
        onEditCustomer={onEditCustomer}
        onAddInteraction={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Edit customer",
      }),
    );

    expect(onEditCustomer).toHaveBeenCalledOnce();
  });

  it("displays interactions", () => {
    render(
      <CustomerProfile
        customer={customer}
        interactions={interactions}
        onEditCustomer={vi.fn()}
        onAddInteraction={vi.fn()}
      />,
    );

    expect(screen.getByText("CALL")).toBeInTheDocument();

    expect(
      screen.getByText("Discussed account requirements."),
    ).toBeInTheDocument();
  });

  it("displays empty interaction state", () => {
    render(
      <CustomerProfile
        customer={customer}
        interactions={[]}
        onEditCustomer={vi.fn()}
        onAddInteraction={vi.fn()}
      />,
    );

    expect(screen.getByText("No interactions yet")).toBeInTheDocument();
  });

  it("opens the interaction form", async () => {
    const user = userEvent.setup();
    const onAddInteraction = vi.fn();

    render(
      <CustomerProfile
        customer={customer}
        interactions={[]}
        onEditCustomer={vi.fn()}
        onAddInteraction={onAddInteraction}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Add interaction",
      }),
    );

    expect(onAddInteraction).toHaveBeenCalledOnce();
  });
});
