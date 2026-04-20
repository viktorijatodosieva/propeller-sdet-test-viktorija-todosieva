import { gql } from '../../helpers/client';

describe('Tenancy isolation', () => {
    it('should not return tenant-b products to tenant-a', async () => {
        const response = await gql(`
            query {
                products {
                    id
                    name
                    tenantId
                }
            }
        `, {}, 'tenant-a');

        const products = response.data.data.products;
        products.forEach((product: any) => expect(product.tenantId).toBe('tenant-a'));
    });

    it('should not return tenant-a products to tenant-b', async () => {
        const response = await gql(`
            query {
                products {
                    id
                    name
                    tenantId
                }
            }
        `, {}, 'tenant-b');

        const products = response.data.data.products;
        products.forEach((product: any) => expect(product.tenantId).toBe('tenant-b'));
    });

    it('should not return tenant-b images to tenant-a', async () => {
        const response = await gql(`
            query {
                images {
                    id
                    tenantId
                }
            }
        `, {}, 'tenant-a');

        const images = response.data.data.images;
        images.forEach((image: any) => expect(image.tenantId).toBe('tenant-a'));
    });

    it('should not return tenant-a images to tenant-b', async () => {
        const response = await gql(`
            query {
                images {
                    id
                    tenantId
                }
            }
        `, {}, 'tenant-b');

        const images = response.data.data.images;
        images.forEach((image: any) => expect(image.tenantId).toBe('tenant-b'));
    });

    it('should not return tenant-a product to tenant-b by id', async () => {
        const response = await gql(`
        query {
            product(id: 1) {
                id
                tenantId
            }
        }
    `, {}, 'tenant-b');

        expect(response.data.errors).toBeDefined();
        expect(response.data.errors[0].message).toMatch(/Product with ID \d+ not found/);
    });

});