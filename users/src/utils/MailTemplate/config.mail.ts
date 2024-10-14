
export const USERNAME = process.env.MAILER_USERNAME;
export const PASS = process.env.MAILER_PASS;
export const MAIL_HOST = process.env.MAILER_HOST;
export const MAIL_TARGET = process.env.MAILER_TARGET;
export const MAIL_PORT:number = Number.parseInt(process.env.MAILER_PORT as string)