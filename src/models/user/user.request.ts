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


export const LoginFormDataRequest = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
export type ILoginFormDataRequest = z.infer<typeof LoginFormDataRequest>;
//-----------------End-Login-Request-----------------//


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


/**
 * Reset password form data request
 */
export const ResetPasswordFormDataRequest = z.object({
    email: z.string().email(),
    newPassword: z.string().min(6),
    confirmNewPassword: z.string().min(6),
});
export type IResetPasswordFormDataRequest = z.infer<typeof ResetPasswordFormDataRequest>;
//-----------------End-Reset-Password-Request-----------------//

/**
 * Update profile form data request
 */
export const UpdateProfileFormDataRequest = z.object({
    name: z
        .string()
        .trim()
        .min(2)
        .max(256)
        .optional()
        .or(z.literal('')),
    phoneNumber: z
        .string()
        .trim()
        .min(9)
        .max(15)
        .optional()
        .or(z.literal('')),
    avatar: z
        .string()
        .trim()
        .url()
        .optional()
        .or(z.literal('')),
});
export type IUpdateProfileFormDataRequest = z.infer<typeof UpdateProfileFormDataRequest>;

export interface IUpdateProfileRequest {
    name?: string;
    phoneNumber?: string;
    avatar?: string;
}