# Northstar CRM Frontend

### Journey

The implemented agent journey is:

1. Search customers by name, email, or customer ID.
2. Select customer.
3. View the selected customer's profile.
4. View the customer's interaction history.
5. Add a new interaction.
6. Add a new customer.
7. Select the newly-created customer.
8. Edit an existing customer's full name, email, phone number, or status
9. Save customer changes.
10. Cancel customer editing without saving.
11. Receive explicit validation feedback for invalid customer data.
12. See loading, empty, and error states.
13. Continue using the UI when the backend is unavailable by using mock mode.

### Requirements

Use a current Node.js release supported by the installed Vite version.
For the current Vite line, Node.js 20.19+ or 22.12+ is required.
Verify the versions using

```bash
node --version
npm --version
```

### Install

From the frontend project directory, run

```bash
npm install
```

### Mock Mode

To enable or disable mock mode when using the frontend, change the mock api variable in the .env file
After changing to either enable or disable mock mode, make sure to restart Vite

### Running as Dev

Use the following command to run as a dev

```bash
npm run dev
```

Open the URL printed by Vite, it should look like

```text
http://localhost:5173
```

### Example jsons

Customer:

```json
{
  "customerId": "CUS-1001",
  "fullName": "Amina Khan",
  "email": "amina.khan@example.com",
  "phone": "555-1001",
  "status": "ACTIVE"
}
```

Using the features of the frontend, a customer can be got, created, or updated.
The customer needs to have a valid full name, email, and status in order to be successfully created.
When editing a customer, the user can change their full name, email, phone, or status.
These changes can then be either saved or canceled.

Interaction:

```json
{
  "type": "CALL",
  "summary": "Followed up with customer"
}
```

Using the features of the frontend, an interaction can be got or created.

### Testing

When performing a test, use the following command:

```bash
npm run test -- --run
```

### Production Building

When building to check for any errors in the frontend. use:

```bash
npm run build
```

### JWT handling

The frontend's token store is memory-only.
JWTs are not written to either localStorage or sessionStorage.

### Security boundary

DO NOT place backend secrets into the Vite environment variables.
Vit exposes client-side variables to browser code.
Never include PostgreSQL passwords, Kafka credentials, database credentials, or any other type of secret.

### Project Structure

```
src/
├── api/
│   ├── ApiError.ts
│   ├── crmApi.ts
│   ├── http.ts
│   └── tokenStore.ts
│
├── components/
│   ├── CustomerEditForm.tsx
│   ├── CustomerForm.tsx
│   ├── CustomerList.tsx
│   ├── CustomerProfile.tsx
│   ├── EmptyState.tsx
│   ├── ErrorState.tsx
│   ├── InteractionForm.tsx
│   ├── LoadingState.tsx
│   └── StatusBadge.tsx
│
├── mock/
│   └── mockApi.ts
│
├── test/
│   ├── App.test.tsx
│   ├── CustomerEditForm.test.tsx
│   ├── CustomerForm.test.tsx
│   ├── CustomerList.test.tsx
│   ├── CustomerProfile.test.tsx
│   ├── EmptyState.test.tsx
│   ├── ErrorState.test.tsx
│   ├── InteractionForm.test.tsx
│   ├── LoadingState.test.tsx
│   ├── mockApi.test.ts
│   ├── StatusBadge.test.tsx
│   └── tokenStore.test.ts
│
├── types/
│   └── crm.ts
│
├── utils/
│   └── validateCustomerDraft.ts
│
├── App.tsx
├── main.tsx
└── ...
```

### What the frontend tests cover

The tests within src/test are automated and demonstrate the following.

Customer Journey

- Seeded customers are displayed
- Customer profiles load
- Interactions load
- Customer can be selected

Customer Creation

- Creation form opens
- Customer fields render
- Full name is required
- Email is required and valid
- Valid customer is created
- Creation can be canceled.

Customer Editing

- Existing customer values load
- Name, email, phone, and status can be changed
- Full name is required
- Email is required and valid
- Editing can be canceled.

Accessibility

- Accessible form labels
- Selected customer state
- Semantic buttons
- Loading/Error/Empty states

Security

- Token storage remains memory only
- Credentials are not persisted in browser storage

### Evidence

The frontend evidence should demonstrate:

| Area                         | Evidence                                                             |
| ---------------------------- | -------------------------------------------------------------------- |
| Search                       | `App.test.tsx`, live UI                                              |
| Customer selection           | `CustomerList.test.tsx`, `App.test.tsx`                              |
| Customer profile             | `CustomerProfile.test.tsx`, `App.test.tsx`                           |
| Customer creation            | `CustomerForm.test.tsx`, `App.test.tsx`                              |
| Customer editing             | `CustomerEditForm.test.tsx`, `App.test.tsx`                          |
| Validation                   | `CustomerForm.test.tsx`, `CustomerEditForm.test.tsx`, `App.test.tsx` |
| Interactions                 | `InteractionForm.test.tsx`, `CustomerProfile.test.tsx`               |
| Loading states               | `LoadingState.test.tsx`                                              |
| Empty states                 | `EmptyState.test.tsx`                                                |
| Error handling               | `ErrorState.test.tsx`                                                |
| Selected-state accessibility | `CustomerList.test.tsx`                                              |
| Token handling               | `tokenStore.test.ts`                                                 |
| Mock API behavior            | `mockApi.test.ts`                                                    |
| Typed API boundary           | `crmApi.ts`, `types/crm.ts`                                          |
| Real persistence             | UI/API test + PostgreSQL verification                                |
