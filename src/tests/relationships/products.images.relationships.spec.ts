import { gql } from '../../helpers/client';

describe('Product image relationships', () => {
    it('should return images for a product', async () => {
        // first get a valid product id
        const productsResponse = await gql(`
            query {
                products {
                    id
                }
            }
        `, {}, 'tenant-a');

        const productId = productsResponse.data.data.products[0].id;

        const response = await gql(`
        query {
            product(id: ${productId}) {
                id
                name
                images {
                    id
                    url
                    priority
                    tenantId
                }
            }
        }
    `, {}, 'tenant-a');

        const product = response.data.data.product;
        expect(product).toBeDefined();
        expect(product.images).toBeDefined();
        expect(Array.isArray(product.images)).toBe(true);
    });

    it('should return images filtered by productId', async () => {
        const response = await gql(`
            query {
                images(productId: 1) {
                    id
                    productId
                }
            }
        `, {}, 'tenant-a');

        const images = response.data.data.images;
        expect(images).toBeDefined();
        expect(Array.isArray(images)).toBe(true);
        images.forEach((image: any) => expect(image.productId).toBe(1));
    });

    it('should return orphan images with no product', async () => {
        const response = await gql(`
            query {
                images {
                    id
                    productId
                }
            }
        `, {}, 'tenant-a');

        const images = response.data.data.images;
        const orphanImages = images.filter((image: any) => image.productId === null);
        expect(orphanImages.length).toBeGreaterThan(0);
    });

    it('should not return tenant-b product images to tenant-a', async () => {
        const response = await gql(`
        query {
            product(id: 1) {
                id
                tenantId
                images {
                    id
                    tenantId
                }
            }
        }
    `, {}, 'tenant-b');

        expect(response.data.errors).toBeDefined();
        expect(response.data.errors[0].message).toMatch(/Product with ID \d+ not found/);
    });
});