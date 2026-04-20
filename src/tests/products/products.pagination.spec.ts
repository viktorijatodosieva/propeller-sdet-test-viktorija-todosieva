import {gql} from "../../helpers/client";

describe('Products Pagination', () => {
    it('should return first page of products', async () =>{
        const response = await gql(`
        query {
            products(page: 1, pageSize: 3) {
                id,
                name
            }
        }`, {}, 'tenant-a');
        const products = response.data.data.products;
        expect(products).toBeDefined();
        expect(Array.isArray(products)).toBe(true);
        expect(products.length).toBe(3);
    });

    it('should return second page of products', async () =>{
        const response = await gql(`
        query {
            products(page: 2, pageSize: 3) {
                id,
                name
            }
        }`, {}, 'tenant-a');

        const products = response.data.data.products;
        expect(products).toBeDefined();
        expect(Array.isArray(products)).toBe(true);
        expect(products.length).toBe(3);
    })

    it('should return different products on different pages', async () =>{
        const page1 = await gql(`
        query {
            products(page: 1, pageSize: 3) {
                id
            }
        }`, {}, 'tenant-a');

        const page2 = await gql(`
        query {
            products(page: 2, pageSize: 3) {
                id
            }
            }
        `, {}, 'tenant-a');

        const ids1 = page1.data.data.products.map((product : any) => product.id);
        const ids2 = page2.data.data.products.map((product : any) => product.id);
        ids1.forEach((id : any) => expect(ids2).not.toContain(id));
    })

});