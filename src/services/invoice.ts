import { axiosPrivate } from "@configs/axios";
import { ICreateInvoiceRequest } from "@models/invoice/invoice.request";

const invoiceService = {
    createInvoice: async (data: ICreateInvoiceRequest) => {
        return await axiosPrivate.post(`/invoice`, data);
    },
}

export default invoiceService;