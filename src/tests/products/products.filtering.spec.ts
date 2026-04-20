import {gql} from "../../helpers/client";

describe('Products filtering', () => {
    it('should filter products by name', async () => {
        const response = await gql(`
        query {
            products(filter: {name: "bolt"}) {
                id,
                name
            }
        }`, {}, 'tenant-a');
        const products = response.data.data.products;
        expect(products).toBeDefined();
        expect(Array.isArray(products)).toBe(true);
        expect(products.length).toBeGreaterThan(0);
        products.forEach((product : any) => expect(product.name.toLowerCase()).toContain('bolt'));
    })

    it('should filter products by status ACTIVE', async () => {
        const response = await gql(`
        query {
            products(filter: {status: ACTIVE}) {
                id,
                status
            }
        }`, {}, 'tenant-a');

        const products = response.data.data.products;
        expect(products).toBeDefined();
        expect(Array.isArray(products)).toBe(true);
        products.forEach((product : any) => expect(product.status).toBe('ACTIVE'))
    })

    it('should filter products by status INACTIVE', async () => {
        const response = await gql(`
        query {
            products(filter: {status: INACTIVE}) {
                id,
                status
            }
        }`, {}, 'tenant-a');

        const products = response.data.data.products;
        expect(products).toBeDefined();
        expect(Array.isArray(products)).toBe(true);
        products.forEach((product : any) => expect(product.status).toBe('INACTIVE'))
    })

    it('should filter products by min price', async () => {
        const response = await gql(`
        query {
            products(filter: {minPrice: 50}) {
                id,
                price
            }
        }`, {}, 'tenant-a');

        const products = response.data.data.products;
        expect(products).toBeDefined();
        expect(Array.isArray(products)).toBe(true);
        products.forEach((product : any) => expect(product.price).toBeGreaterThanOrEqual(50));
    })

    it('should filter products by max price', async () => {
        const response = await gql(`
        query {
            products(filter: {maxPrice: 100}) {
                id,
                price
            }
        }`, {}, 'tenant-a');

        const products = response.data.data.products;
        expect(products).toBeDefined();
        expect(Array.isArray(products)).toBe(true);
        products.forEach((product : any) => expect(product.price).toBeLessThanOrEqual(100));
    })

    it('should filter products by price range', async () => {
        const response = await gql(`
        query {
            products(filter: {minPrice: 50, maxPrice: 100}) {
                id,
                price
            }
        }`, {}, 'tenant-a');

        const products = response.data.data.products;
        expect(products).toBeDefined();
        expect(Array.isArray(products)).toBe(true);
        products.forEach((product : any) => expect(product.price).toBeGreaterThanOrEqual(50));
        products.forEach((product : any) => expect(product.price).toBeLessThanOrEqual(100));
    })

    it('should filter products by name and status', async () => {
        const response = await gql(`
        query {
            products(filter: {name: "pack", status: INACTIVE}) {
                id,
                name,
                status
            }
        }`, {}, 'tenant-a');

        const products = response.data.data.products;
        expect(products).toBeDefined();
        expect(Array.isArray(products)).toBe(true);
        products.forEach((product : any) => expect(product.name.toLowerCase()).toContain('pack'));
        products.forEach((product : any) => expect(product.status).toBe('INACTIVE'));
    })

    it('should filter products by name and price range', async () => {
        const response = await gql(`
        query {
            products(filter: {name: "pack", minPrice: 5, maxPrice: 12}) {
                id,
                name,
                price
            }
        }`, {}, 'tenant-a');

        const products = response.data.data.products;
        expect(products).toBeDefined();
        expect(Array.isArray(products)).toBe(true);
        expect(products.length).toBeGreaterThan(0);
        products.forEach((product : any) => expect(product.name.toLowerCase()).toContain('pack'));
        products.forEach((product : any) => expect(product.price).toBeGreaterThanOrEqual(5));
        products.forEach((product : any) => expect(product.price).toBeLessThanOrEqual(12));
    })

});