import { gql } from '../../helpers/client';

describe('Product mutations', () => {
    it('should create a product', async () => {
        const response = await gql(`
            mutation {
                createProduct(input: { name: "Test Product", price: 95, status: ACTIVE }) {
                    id
                    name
                    price
                    status
                    tenantId
                }
            }
        `, {}, 'tenant-a');

        const product = response.data.data.createProduct;
        expect(product.id).toBeDefined();
        expect(product.name).toBe('Test Product');
        expect(product.price).toBe(95);
        expect(product.status).toBe('ACTIVE');
        expect(product.tenantId).toBe('tenant-a');
    });

    it('should create a product with INACTIVE status', async () => {
        const response = await gql(`
            mutation {
                createProduct(input: { name: "Inactive Product", price: 5, status: INACTIVE }) {
                    id
                    name
                    price
                    status
                    tenantId
                }
            }
        `, {}, 'tenant-a');

        const product = response.data.data.createProduct;
        expect(product.id).toBeDefined();
        expect(product.name).toBe('Inactive Product');
        expect(product.price).toBe(5);
        expect(product.status).toBe('INACTIVE');
        expect(product.tenantId).toBe('tenant-a');
    });

    it('should update a product', async () => {
        const created = await gql(`
            mutation {
                createProduct(input: { name: "To Update", price: 5, status: ACTIVE }) {
                    id
                }
            }
        `, {}, 'tenant-a');

        const id = created.data.data.createProduct.id;

        const response = await gql(`
            mutation {
                updateProduct(id: ${id}, input: { name: "Updated Name" }) {
                    id
                    name
                }
            }
        `, {}, 'tenant-a');

        expect(response.data.data.updateProduct.id).toBeDefined();
        expect(response.data.data.updateProduct.name).toBe('Updated Name');
    });

    it('should delete a product', async () => {
        const created = await gql(`
            mutation {
                createProduct(input: { name: "To Delete", price: 1, status: ACTIVE }) {
                    id
                }
            }
        `, {}, 'tenant-a');

        const id = created.data.data.createProduct.id;

        const response = await gql(`
            mutation {
                deleteProduct(id: ${id})
            }
        `, {}, 'tenant-a');

        expect(response.data.data.deleteProduct).toBe(true);
    });

    it('should verify product is deleted', async () => {
        const created = await gql(`
            mutation {
                createProduct(input: { name: "To Verify Delete", price: 1, status: ACTIVE }) {
                    id
                }
            }
        `, {}, 'tenant-a');

        const id = created.data.data.createProduct.id;

        await gql(`
            mutation {
                deleteProduct(id: ${id})
            }
        `, {}, 'tenant-a');

        const response = await gql(`
            query {
                product(id: ${id}) {
                    id
                }
            }
        `, {}, 'tenant-a');

        expect(response.data.errors).toBeDefined();
        expect(response.data.errors[0].message).toMatch(/Product with ID \d+ not found/);
    });
});