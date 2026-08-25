import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { describe, expect, it, vi } from "vitest";

import { CustomerEditForm } from "../components/CustomerEditForm";

import type { Customer, UpdateCustomerRequest } from "../types/crm";

const customer: Customer = {
  customerId: "CUS-1001",
  fullName: "Amina Khan",
  email: "amina.khan@example.test",
  phone: "555-0101",
  status: "ACTIVE",
};

describe("CustomerEditForm", () => {
  it("loads the existing customer values", () => {
    render(
      <CustomerEditForm
        customer={customer}
        saving={false}
        onCancel={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Full name")).toHaveValue("Amina Khan");

    expect(screen.getByLabelText("Email")).toHaveValue(
      "amina.khan@example.test",
    );

    expect(screen.getByLabelText("Phone")).toHaveValue("555-0101");

    expect(screen.getByLabelText("Status")).toHaveValue("ACTIVE");

    expect(screen.getByText("CUS-1001")).toBeInTheDocument();
  });

  it("requires a full name", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();

    render(
      <CustomerEditForm
        customer={customer}
        saving={false}
        onCancel={vi.fn()}
        onSaved={onSaved}
      />,
    );

    await user.clear(screen.getByLabelText("Full name"));

    await user.click(
      screen.getByRole("button", {
        name: "Save changes",
      }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Full name is required.",
    );

    expect(onSaved).not.toHaveBeenCalled();
  });

  it("rejects an invalid email", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();

    render(
      <CustomerEditForm
        customer={customer}
        saving={false}
        onCancel={vi.fn()}
        onSaved={onSaved}
      />,
    );

    await user.clear(screen.getByLabelText("Email"));

    await user.type(screen.getByLabelText("Email"), "bad-email");

    await user.click(
      screen.getByRole("button", {
        name: "Save changes",
      }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a valid email address.",
    );

    expect(onSaved).not.toHaveBeenCalled();
  });

  it("updates the name", async () => {
    const user = userEvent.setup();

    const onSaved = vi.fn(
      async (input: UpdateCustomerRequest): Promise<Customer> => ({
        ...customer,
        ...input,
      }),
    );

    render(
      <CustomerEditForm
        customer={customer}
        saving={false}
        onCancel={vi.fn()}
        onSaved={onSaved}
      />,
    );

    await user.clear(screen.getByLabelText("Full name"));

    await user.type(screen.getByLabelText("Full name"), "Amina Khan Smith");

    await user.click(
      screen.getByRole("button", {
        name: "Save changes",
      }),
    );

    expect(onSaved).toHaveBeenCalledWith({
      fullName: "Amina Khan Smith",
      email: "amina.khan@example.test",
      phone: "555-0101",
      status: "ACTIVE",
    });
  });

  it("updates the email", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn(
      async (input: UpdateCustomerRequest): Promise<Customer> => ({
        ...customer,
        ...input,
      }),
    );

    render(
      <CustomerEditForm
        customer={customer}
        saving={false}
        onCancel={vi.fn()}
        onSaved={onSaved}
      />,
    );

    await user.clear(screen.getByLabelText("Email"));

    await user.type(
      screen.getByLabelText("Email"),
      "amina.updated@example.test",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Save changes",
      }),
    );

    expect(onSaved).toHaveBeenCalledWith({
      fullName: "Amina Khan",
      email: "amina.updated@example.test",
      phone: "555-0101",
      status: "ACTIVE",
    });
  });

  it("updates the phone number", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn(
      async (input: UpdateCustomerRequest): Promise<Customer> => ({
        ...customer,
        ...input,
      }),
    );

    render(
      <CustomerEditForm
        customer={customer}
        saving={false}
        onCancel={vi.fn()}
        onSaved={onSaved}
      />,
    );

    await user.clear(screen.getByLabelText("Phone"));

    await user.type(screen.getByLabelText("Phone"), "555-0199");

    await user.click(
      screen.getByRole("button", {
        name: "Save changes",
      }),
    );

    expect(onSaved).toHaveBeenCalledWith({
      fullName: "Amina Khan",
      email: "amina.khan@example.test",
      phone: "555-0199",
      status: "ACTIVE",
    });
  });

  it("updates the status", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn(
      async (input: UpdateCustomerRequest): Promise<Customer> => ({
        ...customer,
        ...input,
      }),
    );

    render(
      <CustomerEditForm
        customer={customer}
        saving={false}
        onCancel={vi.fn()}
        onSaved={onSaved}
      />,
    );

    await user.selectOptions(screen.getByLabelText("Status"), "SUSPENDED");

    await user.click(
      screen.getByRole("button", {
        name: "Save changes",
      }),
    );

    expect(onSaved).toHaveBeenCalledWith({
      fullName: "Amina Khan",
      email: "amina.khan@example.test",
      phone: "555-0101",
      status: "SUSPENDED",
    });
  });

  it("can cancel editing", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <CustomerEditForm
        customer={customer}
        saving={false}
        onCancel={onCancel}
        onSaved={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Cancel",
      }),
    );

    expect(onCancel).toHaveBeenCalled();
  });
});
