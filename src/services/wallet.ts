import { axiosPrivate } from "@configs/axios";

const walletService = {
    getWalletUser: async () => {
        return axiosPrivate.get(`/wallet/user`);
    },
}

export default walletService;