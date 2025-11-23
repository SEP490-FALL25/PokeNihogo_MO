import { axiosPrivate } from "@configs/axios";
import { IQueryRequest } from "@models/common/common.request";

const pokemonService = {
    getAll: async (params: IQueryRequest) => {
        const queryParams = new URLSearchParams();
        const filters: string[] = [];

        if (params.currentPage) queryParams.append('currentPage', params.currentPage.toString());
        if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

        // legacy single type support
        if (params.types && params.types !== 'all') {
            filters.push(`types=${params.types}`);
        }
        // preferred multi types
        if (params.types && params.types !== 'all') {
            const typesValue = Array.isArray(params.types)
                ? params.types.map(String).join('|')
                : String(params.types);
            if (typesValue.length > 0) filters.push(`types=${typesValue}`);
        }
        if (params.rarity && params.rarity !== 'all') {
            filters.push(`rarity=${params.rarity}`);
        }
        if (params.search) {
            filters.push(`nameTranslations.en:like=${params.search}`);
        }
        if (params.sort) {
            filters.push(`sort:${params.sort}`);
        }

        if (filters.length > 0) {
            const qsValue = filters.join(',');
            queryParams.append('qs', qsValue);
        }

        const queryString = queryParams.toString();
        return await axiosPrivate.get(`/pokemon?${queryString}`);
    },
    getById: async (id: string) => {
        return axiosPrivate.get(`/pokemon/${id}`)
    },
}

export default pokemonService