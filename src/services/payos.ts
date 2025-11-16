import { axiosPrivate } from "@configs/axios";

const payosService = {
    recallPayment: async (invoiceId: number) => {
        return await axiosPrivate.post(`/payments/payos`, { invoiceId });
    },
}

export default payosService;