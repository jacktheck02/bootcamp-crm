# Front Back Integration 001

### Changes
- Modified customerId to id to match the backend.
- Customer hides internal UUID and displays given customerId
- Added functions to CustomerController.java
    - Get customer
    - Add customer
    - Update customer
    - Get interaction
    - Add interaction
- Search by customerId instead of UUID
- Added phone to backend
- Matched status between frontend and backend
- Added Interactions and Interaction Repository to backend
- Matched endpoint paths in crmApi.ts
- Modified tests to match id instead of customerId

### AI usage
AI was used to determine what the differences between the frontend and the backend were.
Once the AI identified the differences, it also displayed some recommended changes.
These changes were modified to match what needed to be matched.

Additionally, AI was used to figure out why the UUID was displayed and how to use the customer ID instead.
The code that was provided was reviewed and implemented.