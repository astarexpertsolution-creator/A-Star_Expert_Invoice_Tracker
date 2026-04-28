# Security Specification - Distributor Portal

## Data Invariants
1. A Product must have a valid `unitPrice` and `taxPercentage`.
2. A Purchase Order must be linked to a valid `customerId`.
3. An Invoice must have a `grandTotal` equal to `subtotal + taxTotal` (enforced at write).
4. All IDs must be strictly validated.
5. Critical financial fields (MRP, Margin, Unit Price) must be protected from malicious overrides.

## The Dirty Dozen Payloads

1. **The ID Poisoner**: Attempt to create a supplier with a 2KB ID.
2. **The Shadow Master**: Attempt to update an invoice's `paidAmount` directly without a payment record (if that logic was intended).
3. **The Margin Hacker**: A customer trying to update product `baseMargin` to 99%.
4. **The Ghost Invoice**: Creating an invoice without a valid `customerId`.
5. **The Price Freezer**: Updating an invoice after it has been marked as 'Paid' to change the amount.
6. **The Identity Spoofer**: Customer X trying to read Purchase Orders belonging to Customer Y.
7. **The Status Skipper**: Moving an invoice from 'Draft' to 'Paid' without 'Unpaid' phase (if required).
8. **The PII Scraper**: Anonymous user trying to list all Leads.
9. **The SKU Collision**: Attempting to create two products with same SKU (Firestore rules can't enforce uniqueness across docs, but we can check existence of a master SKU doc).
10. **The Negative Price**: Setting `unitPrice` to -100.
11. **The Orphaned PO**: Creating a PO for a non-existent customer.
12. **The Timestamp Faker**: Providing a `createdAt` in 2030.

## Test Runner (Logic Overview)
The `firestore.rules` will be tested against these payloads using the Firebase Emulator (or conceptually verified here).

### Key Rules Logic:
- `isSignedIn()` check on all writes.
- `isValidSupplier()`, `isValidProduct()`, etc. helpers.
- `affectedKeys().hasOnly()` for updates on specific fields like `status` or `dispatchStatus`.
- `immutable()` checks for `createdAt` and `customerId` on update.
