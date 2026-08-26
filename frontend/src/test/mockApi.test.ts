import { beforeEach, describe, expect, it } from "vitest";

import {
  mockCreateCustomer,
  mockGetCustomer,
  mockSearchCustomers,
  mockUpdateCustomer,
} from "../api/mockApi";

describe("mock customer API", () => {
  beforeEach(() => {
    // The mock API should expose a reset function if
    // its in-memory data is intended to be reset between tests.
  });

  it("contains Amina Khan", async () => {
    const customers = await mockSearchCustomers("Amina");

    expect(
      customers.some((customer) => customer.id === "CUS-1001"),
    ).toBe(true);
  });

  it("contains Ravi Singh", async () => {
    const customers = await mockSearchCustomers("Ravi");

    expect(
      customers.some((customer) => customer.id === "CUS-1002"),
    ).toBe(true);
  });

  it("creates a customer", async () => {
    const created = await mockCreateCustomer({
      fullName: "Jason Momoa",
      email: "jason.momoa@example.test",
      phone: "555-0103",
      status: "PROSPECT",
    });

    expect(created.id).toBeTruthy();

    expect(created.fullName).toBe("Jason Momoa");

    expect(created.email).toBe("jason.momoa@example.test");
  });

  it("updates a customer", async () => {
    const updated = await mockUpdateCustomer("CUS-1001", {
      fullName: "Amina Khan Updated",
      email: "amina.updated@example.test",
      phone: "555-0199",
      status: "SUSPENDED",
    });

    expect(updated.id).toBe("CUS-1001");

    expect(updated.fullName).toBe("Amina Khan Updated");

    expect(updated.email).toBe("amina.updated@example.test");

    expect(updated.phone).toBe("555-0199");

    expect(updated.status).toBe("SUSPENDED");
  });

  it("can retrieve the updated customer", async () => {
    const customer = await mockGetCustomer("CUS-1001");

    expect(customer.fullName).toBe("Amina Khan Updated");
  });
});
