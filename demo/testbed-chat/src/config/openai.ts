import OpenAI from "openai";

const CC_API_KEY = process.env.CC_API_KEY || "...";

export const openai = new OpenAI({ apiKey: CC_API_KEY });
