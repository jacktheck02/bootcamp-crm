import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { describe, expect, it, vi } from "vitest";

import { CustomerForm } from "../components/CustomerForm";

import type { CreateCustomerRequest, Customer } from "../types/crm";

describe("CustomerForm", () => {
  it("renders the customer fields", () => {
    render(
      <CustomerForm saving={false} onCancel={vi.fn()} onSaved={vi.fn()} />,
    );

    expect(screen.getByLabelText("Full name")).toBeInTheDocument();

    expect(screen.getByLabelText("Email")).toBeInTheDocument();

    expect(screen.getByLabelText("Phone")).toBeInTheDocument();

    expect(screen.getByLabelText("Status")).toBeInTheDocument();
  });

  it("requires a full name", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();

    render(
      <CustomerForm saving={false} onCancel={vi.fn()} onSaved={onSaved} />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Create customer",
      }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Full name is required.",
    );

    expect(onSaved).not.toHaveBeenCalled();
  });

  it("requires an email", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();

    render(
      <CustomerForm saving={false} onCancel={vi.fn()} onSaved={onSaved} />,
    );

    await user.type(screen.getByLabelText("Full name"), "Jason Momoa");

    await user.click(
      screen.getByRole("button", {
        name: "Create customer",
      }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Email is required.");

    expect(onSaved).not.toHaveBeenCalled();
  });

  it("rejects an invalid email", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();

    render(
      <CustomerForm saving={false} onCancel={vi.fn()} onSaved={onSaved} />,
    );

    await user.type(screen.getByLabelText("Full name"), "Jason Momoa");

    await user.type(screen.getByLabelText("Email"), "not-an-email");

    await user.click(
      screen.getByRole("button", {
        name: "Create customer",
      }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a valid email address.",
    );

    expect(onSaved).not.toHaveBeenCalled();
  });

  it("submits a valid customer", async () => {
    const user = userEvent.setup();

    const onSaved = vi.fn(
      async (input: CreateCustomerRequest): Promise<Customer> => ({
        customerId: "CUS-1003",
        ...input,
      }),
    );

    render(
      <CustomerForm saving={false} onCancel={vi.fn()} onSaved={onSaved} />,
    );

    await user.type(screen.getByLabelText("Full name"), "Jason Momoa");

    await user.type(screen.getByLabelText("Email"), "jason.momoa@example.test");

    await user.type(screen.getByLabelText("Phone"), "555-0103");

    await user.selectOptions(screen.getByLabelText("Status"), "ACTIVE");

    await user.click(
      screen.getByRole("button", {
        name: "Create customer",
      }),
    );

    expect(onSaved).toHaveBeenCalledWith({
      fullName: "Jason Momoa",
      email: "jason.momoa@example.test",
      phone: "555-0103",
      status: "ACTIVE",
    });
  });

  it("can be cancelled", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <CustomerForm saving={false} onCancel={onCancel} onSaved={vi.fn()} />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Cancel",
      }),
    );

    expect(onCancel).toHaveBeenCalled();
  });

  it("disables fields while saving", () => {
    render(<CustomerForm saving={true} onCancel={vi.fn()} onSaved={vi.fn()} />);

    expect(screen.getByLabelText("Full name")).toBeDisabled();

    expect(screen.getByLabelText("Email")).toBeDisabled();

    expect(screen.getByLabelText("Phone")).toBeDisabled();

    expect(screen.getByLabelText("Status")).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Saving…",
      }),
    ).toBeDisabled();
  });
});
