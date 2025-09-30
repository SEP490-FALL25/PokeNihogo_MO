import z from "zod";

/**
 * Login form data request
 */
export const EmailFormDataRequest = z.object({
    email: z.string().email(),
});
export type IEmailFormDataRequest = z.infer<typeof EmailFormDataRequest>;
//-----------------End-Login-Request-----------------//