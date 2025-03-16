import OpenAI from "openai";

const API_KEY = process.env.API_KEY || "...";

export const openai = new OpenAI({ apiKey: API_KEY });
