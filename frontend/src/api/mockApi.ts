import type {
  CreateCustomerRequest,
  CreateInteractionRequest,
  Customer,
  Interaction,
  UpdateCustomerRequest,
} from "../types/crm";

const customers: Customer[] = [
  {
    customerId: "CUS-1001",
    fullName: "Amina Khan",
    email: "amina.khan@example.com",
    phone: "555-0101",
    status: "ACTIVE",
  },
  {
    customerId: "CUS-1002",
    fullName: "Ravi Singh",
    email: "ravi.singh@example.com",
    phone: "555-0102",
    status: "PROSPECT",
  },
];

const interactions = new Map<string, Interaction[]>([
  [
    "CUS-1001",
    [
      {
        interactionId: "INT-1001",
        customerId: "CUS-1001",
        type: "CALL",
        summary: "Followed up regarding account onboarding.",
        createdAt: "2026-08-17T14:00:00Z",
      },
    ],
  ],
  ["CUS-1002", []],
]);

function delay(ms = 250) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function mockSearchCustomers(query: string): Promise<Customer[]> {
  await delay();

  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return [...customers];
  }

  return customers.filter((customer) =>
    [customer.customerId, customer.fullName, customer.email].some((value) =>
      value.toLowerCase().includes(normalized),
    ),
  );
}

export async function mockGetCustomer(customerId: string): Promise<Customer> {
  await delay();

  const customer = customers.find((item) => item.customerId === customerId);

  if (!customer) {
    throw new Error("Customer was not found.");
  }

  return { ...customer };
}

export async function mockCreateCustomer(
  input: CreateCustomerRequest,
): Promise<Customer> {
  await delay(350);

  const customer: Customer = {
    customerId: `CUS-${1000 + customers.length + 1}`,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    status: input.status,
  };

  customers.push(customer);
  interactions.set(customer.customerId, []);

  return { ...customer };
}

export async function mockUpdateCustomer(
  customerId: string,
  input: UpdateCustomerRequest,
): Promise<Customer> {
  await delay(350);

  const index = customers.findIndex(
    (customer) => customer.customerId === customerId,
  );

  if (index === -1) {
    throw new Error(`Customer ${customerId} was not found.`);
  }

  const updated: Customer = {
    ...customers[index],
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    status: input.status,
  };

  customers[index] = updated;

  return { ...updated };
}

export async function mockGetInteractions(
  customerId: string,
): Promise<Interaction[]> {
  await delay();

  return [...(interactions.get(customerId) ?? [])];
}

export async function mockCreateInteraction(
  customerId: string,
  input: CreateInteractionRequest,
): Promise<Interaction> {
  await delay(350);

  const interaction: Interaction = {
    interactionId: `INT-${Date.now()}`,
    customerId,
    type: input.type,
    summary: input.summary,
    createdAt: new Date().toISOString(),
  };

  const current = interactions.get(customerId) ?? [];
  interactions.set(customerId, [interaction, ...current]);

  return interaction;
}
