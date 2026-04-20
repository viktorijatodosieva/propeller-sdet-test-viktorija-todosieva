# Propeller SDET Test - Viktorija Todosieva

## Installation

```bash
npm install
```

## Running the tests

Make sure the API is running first:
```bash
docker-compose up --build
docker-compose run --rm seed
```

Then run the tests:
```bash
npm test
```

## CI/CD Pipeline

A GitHub Actions pipeline is configured to run automatically on every push to master.

The pipeline has two jobs:
- **Build** — installs dependencies and compiles TypeScript
- **Test** — clones the API repo, spins up the service with Docker Compose, seeds the database and runs the automated tests

The pipeline runs against the API's master branch. Failing tests indicate bugs that exist in the codebase — this is intentional and proves the tests are working correctly.

## Bugs found and fixed

### Bug #1 — Status filter inverted
**File:** `src/product/product.service.ts`

**Exposed by:** `Products filtering › should filter products by status ACTIVE` and `should filter products by status INACTIVE` - tests expected products with the requested status but received products with the opposite status.

**Problem:** The filter logic was inverted — when filtering for `ACTIVE` it queried for `INACTIVE` and vice versa.

**Fix:** Swapped the values to match the expected behavior.

### Bug #2 — Tenant isolation broken in findOne
**File:** `src/product/product.service.ts`

**Exposed by:**
- `Tenancy isolation › should not return tenant-a product to tenant-b by id` — tenant-b requested product id 1 and received tenant-a's product back instead of an error
- `Product image relationships › should not return tenant-b product images to tenant-a` — tenant-b requested product id 1 and received tenant-a's product along with tenant-a's images

**Problem:** The `findOne` method received `tenantId` as a parameter but never used it in the database query, it only filtered by `id`. This allowed any tenant to access any other tenant's products directly by ID.

**Fix:** Added `tenantId` to the `where` clause:

**Note:** After the fix, requesting another tenant's product by ID correctly throws a `NotFoundException` since the product doesn't exist for that tenant.

### Bug #3 — Missing image priority validation and wrong default value
**File:** `src/image/image.dto.ts`, `src/image/image.entity.ts`, `src/main.ts`

**Exposed by:**
- `Validation › should return error when creating image with invalid priority below minimum` — creating an image with priority 0 succeeded when it should have failed
- `Validation › should return error when creating image with invalid priority above maximum` — creating an image with priority 1001 succeeded when it should have failed
- `Validation › should create an image with default priority of 100` — creating an image without priority returned 0 instead of 100

**Problem:** Three issues combined:
1. No validation was enforced on the priority field — any number was accepted
2. The default priority in the entity was `0` instead of `100` as documented in the README
3. `ValidationPipe` was not set up in `main.ts` so class-validator decorators had no effect

**Fix:**
- Added `ValidationPipe` to `main.ts`
- Added `@Min(1)` and `@Max(1000)` decorators to priority in `CreateImageInput` and `UpdateImageInput`
- Added `@IsOptional()` to priority in `UpdateImageInput` so validation is skipped when priority is not provided in an update
- Changed default priority in `image.entity.ts` from `0` to `100`

### Bug #4 — Pagination wrong offset
**File:** `src/product/product.service.ts`

**Exposed by:**
- `Products filtering › should filter products by name` — filtering by name "bolt" returned 0 results despite matching products existing in the database
- `Products filtering › should filter products by name and price range` — filtering by name and price range returned 0 results despite matching products existing

**Problem:** The pagination offset was calculated incorrectly. With the default `page=1` and `pageSize=10`, the query was skipping the first 10 records instead of 0, causing most queries to return incorrect or empty results.

**Fix:** Changed the skip calculation to use `(page - 1) * pageSize` instead of `page * pageSize` so that page 1 correctly starts from the first record.

### Bug #5 — Missing business rule validation on product creation
**File:** `src/product/product.dto.ts`

**Exposed by:**
- `Validation › should return error when creating product with empty name` — creating a product with an empty name succeeded when it should have failed
- `Validation › should return error when creating product with negative price` — creating a product with a negative price succeeded when it should have failed

**Problem:** GraphQL schema validation only checks that required fields are present and of the correct type. It does not validate business rules — empty strings and negative numbers are valid types but invalid values for a product.

**Fix:** Added `@IsNotEmpty()` to the name field and `@IsPositive()` to the price field in `CreateProductInput`. Since `ValidationPipe` was already set up, these decorators were applied immediately.

**Note:** This was not explicitly documented in the README as a requirement, but was identified as missing business rule validation during edge case testing.

### Bug #6 — Price field type mismatch between GraphQL and database
**File:** `src/product/product.entity.ts`, `src/product/product.dto.ts`

**Exposed by:**
- `Product mutations › should create a product` — creating a product with a decimal price like `9.99` failed with `invalid input syntax for type integer`

**Problem:** The GraphQL schema declared `price` as `Float` (supporting decimals) but the database column was `int` (integers only). This caused any decimal price value to be rejected by the database.

**Fix:** Changed `@Field(() => Float)` to `@Field(() => Int)` in the entity and all price fields in the DTO to align with the database column type.

**Note:** The ideal fix for a real e-commerce system would be to change the database column to `decimal(10,2)` to properly support decimal prices. However since the seeder uses whole numbers and shouldn't be modified, the GraphQL type was aligned to match the existing database schema.

## Assumptions
- Price was changed from `Float` to `Int` to match the existing database schema since the seeder cannot be modified. In a real production system this should be `decimal(10,2)`.
- Empty product name and negative price validation were added as business rule validations despite not being explicitly documented, as they represent clearly invalid product states.