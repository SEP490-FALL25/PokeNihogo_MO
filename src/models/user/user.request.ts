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
    code: z.string().min(6),
    type: z.string(),
});
export type IOtpFormDataRequest = z.infer<typeof OtpFormDataRequest>;
//-----------------End-Otp-Request-----------------//


/**
 * Create account form data request
 */
export const CreateAccountFormDataRequest = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
});
export type ICreateAccountFormDataRequest = z.infer<typeof CreateAccountFormDataRequest>;
//-----------------End-Create-Account-Request-----------------//