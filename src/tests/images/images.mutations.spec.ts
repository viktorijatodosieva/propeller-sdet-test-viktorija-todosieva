import {gql} from "../../helpers/client";

describe('Image mutations', () => {
    it('should create an image', async () => {
        const response = await gql(`
        mutation {
            createImage(input: { url: "https://example.com/image.jpg", priority: 1 }) {
                id,
                url,
                priority,
                tenantId,
            }
        }`, {}, 'tenant-a');

        const image = response.data.data.createImage;
        expect(image.id).toBeDefined();
        expect(image.url).toBe('https://example.com/image.jpg');
        expect(image.priority).toBe(1);
        expect(image.tenantId).toBe('tenant-a');
    })

    it('should create an image linked to a product', async () => {
        const product = await gql(`
        mutation {
            createProduct(input: { name: "Product For Image", price: 10, status: ACTIVE }) {
                id
            }
        }`, {}, 'tenant-a');

        const productId = product.data.data.createProduct.id;

        const response = await gql(`
        mutation {
            createImage(input: { url: "https://example.com/product-image.jpg", priority: 1, productId: ${productId} }) {
                id
                url
                priority
                productId
                tenantId
            }
        }`, {}, 'tenant-a');

        const image = response.data.data.createImage;
        expect(image.id).toBeDefined();
        expect(image.url).toBe('https://example.com/product-image.jpg');
        expect(image.priority).toBe(1);
        expect(Number(image.productId)).toBe(Number(productId));
        expect(image.tenantId).toBe('tenant-a');
    })

    it('should update an image', async () => {
        const created = await gql(`
            mutation {
                createImage(input: { url: "https://example.com/old.jpg", priority: 100 }) {
                    id
                }
            }
        `, {}, 'tenant-a');

        const id = created.data.data.createImage.id;

        const response = await gql(`
            mutation {
                updateImage(id: ${id}, input: { url: "https://example.com/new.jpg" }) {
                    id
                    url
                }
            }
        `, {}, 'tenant-a');

        expect(response.data.data.updateImage.id).toBeDefined();
        expect(response.data.data.updateImage.url).toBe('https://example.com/new.jpg');
    });

    it('should delete an image', async () => {
        const created = await gql(`
            mutation {
                createImage(input: { url: "https://example.com/image.jpg", priority: 100 }) {
                    id
                }
            }
        `, {}, 'tenant-a');

        const id = created.data.data.createImage.id;

        const response = await gql(`
            mutation {
                deleteImage(id: ${id})
            }
        `, {}, 'tenant-a');

        expect(response.data.data.deleteImage).toBe(true);
    });

    it('should verify image is deleted', async () => {
        const created = await gql(`
            mutation {
                createImage(input: { url: "https://example.com/image.jpg", priority: 100 }) {
                    id
                }
            }
        `, {}, 'tenant-a');

        const id = created.data.data.createImage.id;

        await gql(`
            mutation {
                deleteImage(id: ${id})
            }
        `, {}, 'tenant-a');

        const response = await gql(`
            query {
                image(id: ${id}) {
                    id
                }
            }
        `, {}, 'tenant-a');

        expect(response.data.errors).toBeDefined();
    });

});