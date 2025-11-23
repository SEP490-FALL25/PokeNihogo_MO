import { axiosPrivate } from "@configs/axios";
import { IShopPurchaseRequest } from "@models/shop-purchase/shop-purchase.request";

const shopPurchaseService = {
    purchase: async (data: IShopPurchaseRequest) => {
        return axiosPrivate.post(`/shop-purchase`, data);
    },
}

export default shopPurchaseService;