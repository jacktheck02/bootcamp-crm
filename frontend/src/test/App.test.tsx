import { render, screen, waitFor } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "../App";

import * as crmApi from "../api/crmApi";

import type { Customer } from "../types/crm";

vi.mock("../api/crmApi", () => ({
  searchCustomers: vi.fn(),
  getCustomer: vi.fn(),
  getInteractions: vi.fn(),
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
  createInteraction: vi.fn(),
}));

const amina: Customer = {
  id: "CUS-1001",
  fullName: "Amina Khan",
  email: "amina.khan@example.test",
  phone: "555-0101",
  status: "ACTIVE",
};

const ravi: Customer = {
  id: "CUS-1002",
  fullName: "Ravi Singh",
  email: "ravi.singh@example.test",
  phone: "555-0102",
  status: "PROSPECT",
};

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(crmApi.searchCustomers).mockResolvedValue([amina, ravi]);

    vi.mocked(crmApi.getCustomer).mockResolvedValue(amina);

    vi.mocked(crmApi.getInteractions).mockResolvedValue([]);
  });

  it("displays seeded customers", async () => {
    render(<App />);

    expect(await screen.findByText("Amina Khan")).toBeInTheDocument();

    expect(await screen.findByText("Ravi Singh")).toBeInTheDocument();
  });

  it("selects Amina and loads her profile", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(
      await screen.findByRole("button", {
        name: /Amina Khan/i,
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Amina Khan",
      }),
    ).toBeInTheDocument();

    expect(crmApi.getCustomer).toHaveBeenCalledWith("CUS-1001");

    expect(crmApi.getInteractions).toHaveBeenCalledWith("CUS-1001");
  });

  it("opens the create customer form", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(
      screen.getByRole("button", {
        name: "Add customer",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Add customer",
      }),
    ).toBeInTheDocument();
  });

  it("creates a new customer", async () => {
    const user = userEvent.setup();

    const newCustomer: Customer = {
      id: "CUS-1003",
      fullName: "Jason Momoa",
      email: "jason.momoa@example.test",
      phone: "555-0103",
      status: "PROSPECT",
    };

    vi.mocked(crmApi.createCustomer).mockResolvedValue(newCustomer);

    render(<App />);

    await user.click(
      screen.getByRole("button", {
        name: "Add customer",
      }),
    );

    await user.type(screen.getByLabelText("Full name"), "Jason Momoa");

    await user.type(screen.getByLabelText("Email"), "jason.momoa@example.test");

    await user.type(screen.getByLabelText("Phone"), "555-0103");

    await user.click(
      screen.getByRole("button", {
        name: "Create customer",
      }),
    );

    await waitFor(() => {
      expect(crmApi.createCustomer).toHaveBeenCalledWith({
        fullName: "Jason Momoa",
        email: "jason.momoa@example.test",
        phone: "555-0103",
        status: "PROSPECT",
      });
    });

    expect(
      await screen.findByRole("heading", {
        name: "Jason Momoa",
      }),
    ).toBeInTheDocument();
  });

  it("opens the edit customer form", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(
      await screen.findByRole("button", {
        name: /Amina Khan/i,
      }),
    );

    await user.click(
      await screen.findByRole("button", {
        name: "Edit customer",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Edit customer",
      }),
    ).toBeInTheDocument();
  });

  it("updates a customer's name", async () => {
    const user = userEvent.setup();

    const updated: Customer = {
      ...amina,
      fullName: "Amina Khan Smith",
    };

    vi.mocked(crmApi.updateCustomer).mockResolvedValue(updated);

    render(<App />);

    await user.click(
      await screen.findByRole("button", {
        name: /Amina Khan/i,
      }),
    );

    await user.click(
      await screen.findByRole("button", {
        name: "Edit customer",
      }),
    );

    const nameInput = screen.getByLabelText("Full name");

    await user.clear(nameInput);

    await user.type(nameInput, "Amina Khan Smith");

    await user.click(
      screen.getByRole("button", {
        name: "Save changes",
      }),
    );

    await waitFor(() => {
      expect(crmApi.updateCustomer).toHaveBeenCalledWith("CUS-1001", {
        fullName: "Amina Khan Smith",
        email: "amina.khan@example.test",
        phone: "555-0101",
        status: "ACTIVE",
      });
    });

    expect(
      await screen.findByRole("heading", {
        name: "Amina Khan Smith",
      }),
    ).toBeInTheDocument();
  });

  it("updates a customer's status", async () => {
    const user = userEvent.setup();

    const updated: Customer = {
      ...amina,
      status: "SUSPENDED",
    };

    vi.mocked(crmApi.updateCustomer).mockResolvedValue(updated);

    render(<App />);

    await user.click(
      await screen.findByRole("button", {
        name: /Amina Khan/i,
      }),
    );

    await user.click(
      await screen.findByRole("button", {
        name: "Edit customer",
      }),
    );

    await user.selectOptions(screen.getByLabelText("Status"), "SUSPENDED");

    await user.click(
      screen.getByRole("button", {
        name: "Save changes",
      }),
    );

    await waitFor(() => {
      expect(crmApi.updateCustomer).toHaveBeenCalledWith("CUS-1001", {
        fullName: "Amina Khan",
        email: "amina.khan@example.test",
        phone: "555-0101",
        status: "SUSPENDED",
      });
    });
  });

  it("cancels customer editing", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(
      await screen.findByRole("button", {
        name: /Amina Khan/i,
      }),
    );

    await user.click(
      await screen.findByRole("button", {
        name: "Edit customer",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Edit customer",
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Cancel",
      }),
    );

    expect(
      screen.queryByRole("heading", {
        name: "Edit customer",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Amina Khan",
      }),
    ).toBeInTheDocument();
  });

  it("rejects invalid customer email during creation", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(
      screen.getByRole("button", {
        name: "Add customer",
      }),
    );

    await user.type(screen.getByLabelText("Full name"), "Jason Momoa");

    await user.type(screen.getByLabelText("Email"), "invalid-email");

    await user.click(
      screen.getByRole("button", {
        name: "Create customer",
      }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a valid email address.",
    );

    expect(crmApi.createCustomer).not.toHaveBeenCalled();
  });

  it("rejects invalid customer email during editing", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(
      await screen.findByRole("button", {
        name: /Amina Khan/i,
      }),
    );

    await user.click(
      await screen.findByRole("button", {
        name: "Edit customer",
      }),
    );

    await user.clear(screen.getByLabelText("Email"));

    await user.type(screen.getByLabelText("Email"), "invalid-email");

    await user.click(
      screen.getByRole("button", {
        name: "Save changes",
      }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a valid email address.",
    );

    expect(crmApi.updateCustomer).not.toHaveBeenCalled();
  });

  it("adds an interaction", async () => {
    const user = userEvent.setup();

    vi.mocked(crmApi.createInteraction).mockResolvedValue({
      id: "INT-1001",
      customerId: "CUS-1001",
      type: "CALL",
      summary: "Discussed account requirements.",
      createdAt: "2026-08-20T15:00:00Z",
    });

    render(<App />);

    await user.click(
      await screen.findByRole("button", {
        name: /Amina Khan/i,
      }),
    );

    await user.click(
      await screen.findByRole("button", {
        name: "Add interaction",
      }),
    );

    await user.selectOptions(screen.getByLabelText("Type"), "CALL");

    await user.type(
      screen.getByLabelText("Summary"),
      "Discussed account requirements.",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Save interaction",
      }),
    );

    await waitFor(() => {
      expect(crmApi.createInteraction).toHaveBeenCalledWith("CUS-1001", {
        type: "CALL",
        summary: "Discussed account requirements.",
      });
    });

    expect(
      await screen.findByText("Discussed account requirements."),
    ).toBeInTheDocument();
  });
});
