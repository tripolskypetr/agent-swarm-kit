declare function parseInt(value: unknown): number;

export const CC_GROK_API_KEY = process.env.CC_GROK_API_KEY || "";

export const CC_WWWROOT_PORT = parseInt(process.env.CC_WWWROOT_PORT) || 60050;
