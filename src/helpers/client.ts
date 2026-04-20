import axios from 'axios';

const BASE_URL = 'http://localhost:3000/graphql';

export function gql(query: string, variables: Record<string, unknown> = {}, tenantId: string) {
    return axios.post(BASE_URL, { query, variables }, {
        headers: { 'x-tenant-id': tenantId },
        validateStatus: () => true,
    });
}