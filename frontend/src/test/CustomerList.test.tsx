import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { describe, expect, it, vi } from "vitest";

import { CustomerList } from "../components/CustomerList";

import type { Customer } from "../types/crm";

const customers: Customer[] = [
  {
    id: "CUS-1001",
    fullName: "Amina Khan",
    email: "amina.khan@example.test",
    phone: "555-0101",
    status: "ACTIVE",
  },
  {
    id: "CUS-1002",
    fullName: "Ravi Singh",
    email: "ravi.singh@example.test",
    phone: "555-0102",
    status: "PROSPECT",
  },
];

describe("CustomerList", () => {
  it("renders Amina and Ravi", () => {
    render(
      <CustomerList
        customers={customers}
        selectedCustomerId={null}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("Amina Khan")).toBeInTheDocument();

    expect(screen.getByText("Ravi Singh")).toBeInTheDocument();
  });

  it("selects a customer", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <CustomerList
        customers={customers}
        selectedCustomerId={null}
        onSelect={onSelect}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /Amina Khan/i,
      }),
    );

    expect(onSelect).toHaveBeenCalledWith("CUS-1001");
  });

  it("marks the selected customer", () => {
    render(
      <CustomerList
        customers={customers}
        selectedCustomerId="CUS-1001"
        onSelect={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", {
      name: /Amina Khan/i,
    });

    expect(button).toHaveAttribute("aria-current", "true");
  });
});
