import { ICreateInvoiceRequest } from "@models/invoice/invoice.request";
import invoiceService from "@services/invoice";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ICreateInvoiceRequest) => invoiceService.createInvoice(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoice'] });
            queryClient.invalidateQueries({ queryKey: ['subscription-marketplace-packages'] });
            queryClient.invalidateQueries({ queryKey: ['wallet-user'] });
        },
        onError: (error) => {
            console.error(error);
        },
    });
}