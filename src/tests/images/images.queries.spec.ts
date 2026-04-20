import {gql} from "../../helpers/client";

describe('Images queries', () => {
    it('should return images', async () => {
        const response = await gql(`
            query {
                images {
                    id,
                    url, 
                    priority,
                    tenantId,
                    productId
                }
            }
        `, {}, 'tenant-a');


        const images = response.data.data.images;
        expect(images).toBeDefined();
        expect(Array.isArray(images)).toBe(true);
        expect(images.length).toBeGreaterThan(0);
        images.forEach((image : any) => expect(image.tenantId).toBe('tenant-a'))
    })

    it('should return a single image by id', async () => {
        const allImages = await gql(`
            query {
                images {
                    id
                }
            }
        `, {}, 'tenant-a');

        const imageId = allImages.data.data.images[0].id;

        const response = await gql(`
        query {
            image(id: ${imageId}) {
                id
                url
                priority
                tenantId
                productId
            }
        }
    `, {}, 'tenant-a');

        const image = response.data.data.image;
        expect(image).toBeDefined();
        expect(image.id).toBeDefined();
        expect(image.url).toBeDefined();
        expect(image.priority).toBeDefined();
        expect(image.tenantId).toBe('tenant-a');
    });

    it('should return error for non-existent image', async () => {
        const response = await gql(`
            query {
                image(id: 777) {
                    id,
                    url,
                    priority,
                    tenantId,
                    productId
                }
            }
        `, {}, 'tenant-a');

        expect(response.data.errors).toBeDefined();
        expect(response.data.errors[0].message).toMatch(/Image with ID \d+ not found/);
    })

});