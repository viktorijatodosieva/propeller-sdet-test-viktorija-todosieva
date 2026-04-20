import { gql } from '../../helpers/client';

describe('Validation - Product', () => {
    it('should return error when creating product with missing name', async () => {
        const response = await gql(`
            mutation {
                createProduct(input: { price: 9.99, status: ACTIVE }) {
                    id
                }
            }
        `, {}, 'tenant-a');
        expect(response.data.errors).toBeDefined();
    });

    it('should return error when creating product with missing price', async () => {
        const response = await gql(`
            mutation {
                createProduct(input: { name: "Test", status: ACTIVE }) {
                    id
                }
            }
        `, {}, 'tenant-a');

        expect(response.data.errors).toBeDefined();
    });

    it('should return error when updating non-existent product', async () => {
        const response = await gql(`
            mutation {
                updateProduct(id: 999999, input: { name: "Updated" }) {
                    id
                }
            }
        `, {}, 'tenant-a');

        expect(response.data.errors).toBeDefined();
        expect(response.data.errors[0].message).toMatch(/Product with ID \d+ not found/);
    });

    it('should return error when deleting non-existent product', async () => {
        const response = await gql(`
            mutation {
                deleteProduct(id: 999999)
            }
        `, {}, 'tenant-a');

        expect(response.data.errors).toBeDefined();
        expect(response.data.errors[0].message).toMatch(/Product with ID \d+ not found/);
    });

    it('should return error when creating product with empty name', async () => {
        const response = await gql(`
        mutation {
            createProduct(input: { name: "", price: 10, status: ACTIVE }) {
                id
            }
        }
    `, {}, 'tenant-a');

        expect(response.data.errors).toBeDefined();
    });

    it('should return error when creating product with negative price', async () => {
        const response = await gql(`
        mutation {
            createProduct(input: { name: "Test", price: -999, status: ACTIVE }) {
                id
            }
        }
    `, {}, 'tenant-a');

        expect(response.data.errors).toBeDefined();
    });

});

describe('Validation - Image', () => {
    it('should return error when creating image with invalid priority below minimum', async () => {
        const response = await gql(`
            mutation {
                createImage(input: { url: "https://example.com/image.jpg", priority: 0 }) {
                    id
                }
            }
        `, {}, 'tenant-a');

        expect(response.data.errors).toBeDefined();
    });

    it('should return error when creating image with invalid priority above maximum', async () => {
        const response = await gql(`
            mutation {
                createImage(input: { url: "https://example.com/image.jpg", priority: 1001 }) {
                    id
                }
            }
        `, {}, 'tenant-a');

        expect(response.data.errors).toBeDefined();
    });

    it('should create an image with default priority of 100', async () => {
        const response = await gql(`
            mutation {
                createImage(input: { url: "https://example.com/image.jpg" }) {
                    id
                    priority
                }
            }
        `, {}, 'tenant-a');
        const image = response.data.data.createImage;
        expect(image.priority).toBe(100);
    });

});