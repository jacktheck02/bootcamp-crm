import { request } from "./http";
import {
  mockCreateCustomer,
  mockCreateInteraction,
  mockGetCustomer,
  mockGetInteractions,
  mockSearchCustomers,
  mockUpdateCustomer,
} from "./mockApi";
import type {
  CreateCustomerRequest,
  CreateInteractionRequest,
  Customer,
  Interaction,
  UpdateCustomerRequest,
} from "../types/crm";

const useMockApi =
  (import.meta.env.VITE_USE_MOCK_API ?? "false").toLowerCase() === "true";

export function searchCustomers(query: string): Promise<Customer[]> {
  if (useMockApi) {
    return mockSearchCustomers(query);
  }

  const params = new URLSearchParams();
  if (query.trim()) {
    params.set("q", query.trim());
  }

  const suffix = params.toString() ? `?${params.toString()}` : "";

  return request<Customer[]>(`/customers${suffix}`);
}

export function getCustomer(customerId: string): Promise<Customer> {
  if (useMockApi) {
    return mockGetCustomer(customerId);
  }

  return request<Customer>(`/customers/${encodeURIComponent(customerId)}`);
}

export function createCustomer(
  input: CreateCustomerRequest,
): Promise<Customer> {
  if (useMockApi) {
    return mockCreateCustomer(input);
  }

  return request<Customer>("/customers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCustomer(
  customerId: string,
  input: UpdateCustomerRequest,
): Promise<Customer> {
  if (useMockApi) {
    return mockUpdateCustomer(customerId, input);
  }

  return request<Customer>(`/customers/${encodeURIComponent(customerId)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function getInteractions(customerId: string): Promise<Interaction[]> {
  if (useMockApi) {
    return mockGetInteractions(customerId);
  }

  return request<Interaction[]>(
    `/customers/${encodeURIComponent(customerId)}/interactions`,
  );
}

export function createInteraction(
  customerId: string,
  input: CreateInteractionRequest,
): Promise<Interaction> {
  if (useMockApi) {
    return mockCreateInteraction(customerId, input);
  }

  return request<Interaction>(
    `/customers/${encodeURIComponent(customerId)}/interactions`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}
