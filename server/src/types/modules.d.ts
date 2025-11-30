declare module 'speakeasy' {
    export function generateSecret(options: any): any;
    export const totp: any;
}

declare module 'qrcode' {
    export function toDataURL(text: string): Promise<string>;
}

declare module 'nodemailer' {
    export interface Transporter {
        sendMail(options: any): Promise<any>;
    }
    export function createTransport(options: any): Transporter;
}

