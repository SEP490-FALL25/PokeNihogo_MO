import z from "zod";

/**
 * Email form data request
 */
export const EmailFormDataRequest = z.object({
    email: z.string().email(),
});
export type IEmailFormDataRequest = z.infer<typeof EmailFormDataRequest>;
//-----------------End-Email-Request-----------------//


/**
 * Password form data request
 */
export const PasswordFormDataRequest = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
export type IPasswordFormDataRequest = z.infer<typeof PasswordFormDataRequest>;
//-----------------End-Password-Request-----------------//

/**
 * OTP form data request    
 */
export const OtpFormDataRequest = z.object({
    email: z.string().email(),
    otp: z.string().min(6),
});
export type IOtpFormDataRequest = z.infer<typeof OtpFormDataRequest>;
//-----------------End-Otp-Request-----------------//