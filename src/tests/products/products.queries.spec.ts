import { gql } from '../../helpers/client';

describe('Product queries', () => {
    it('should return products for tenant-a', async () => {
        const response = await gql(`
            query {
                products {
                    id
                    name
                    price 
                    status
                    tenantId
                }
            }
        `, {}, 'tenant-a');

        const products = response.data.data.products;
        expect(products).toBeDefined();
        expect(Array.isArray(products)).toBe(true);
        expect(products.length).toBeGreaterThan(0);
        products.forEach((product : any) => expect(product.tenantId).toBe('tenant-a'))
    })

    it('should return a single product by id', async () => {
        const allProducts = await gql(`
            query {
                products {
                    id
                }
            }
        `, {}, 'tenant-a');

        const productId = allProducts.data.data.products[0].id;

        const response = await gql(`
        query {
            product(id: ${productId}) {
                id
                name
                price
                status
                tenantId
            }
        }
    `, {}, 'tenant-a');

        const product = response.data.data.product;
        expect(product).toBeDefined();
        expect(product.id).toBeDefined();
        expect(product.name).toBeDefined();
        expect(product.price).toBeDefined();
        expect(product.status).toBeDefined();
        expect(product.tenantId).toBe('tenant-a');
    });

    it('should return error for non-existent product', async () => {
        const response = await gql(`
            query{
                product(id:777) {
                    id
                    name
                }
            }
            `, {}, 'tenant-a');

        expect(response.data.errors).toBeDefined();
        expect(response.data.errors[0].message).toMatch(/Product with ID \d+ not found/);
    });
});