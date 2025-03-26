import {
  session,
} from "agent-swarm-kit";
import { Hono, type Context } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { pipeline } from "@xenova/transformers";
import { serve } from "bun";
import wavefile from "wavefile";
import { queued, randomString, str } from "functools-kit";

import { TEST_SWARM } from './lib/swarm';

const TASK_NAME = "automatic-speech-recognition";
const MODEL_NAME = "Xenova/whisper-tiny";
const TRANSCRIBE_LANGUAGE = "ru";

console.log("Downloading model");

const transcriber = await pipeline(TASK_NAME, MODEL_NAME, {
  cache_dir: "./cache",
});

console.clear();

const getAudioData = async (buffer: Buffer, sampling_rate = 16000) => {
  const wav = new wavefile.WaveFile(buffer);
  wav.toBitDepth("32f");
  wav.toSampleRate(sampling_rate);
  let samples = wav.getSamples();
  if (Array.isArray(samples)) {
    if (samples.length > 1) {
      const SCALING_FACTOR = Math.sqrt(2);
      for (let i = 0; i < samples[0].length; ++i) {
        samples[0][i] = (SCALING_FACTOR * (samples[0][i] + samples[1][i])) / 2;
      }
    }
    samples = samples[0];
  }
  return samples;
};

const app = new Hono({});

app.use("*", cors());

const CLIENT_ID = randomString();

const { complete } = session(CLIENT_ID, TEST_SWARM);

app.post(
  "/api/v1/voice",
  queued(async (ctx: Context) => {
    const request = await ctx.req.parseBody();
    console.log("Fetching buffer");
    const file = request.audio as File;
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("Parsing audio");
    const data = await getAudioData(
      buffer,
      transcriber.processor.feature_extractor.config.sampling_rate
    );
    const output = await transcriber(data, {
      language: TRANSCRIBE_LANGUAGE,
    });
    const text = [output]
      .flat()
      .reduce((acm, { text }) => str.space(acm, text), "");
    console.time("Timing");
    console.log(`Recieved: "${text}"`);
    const answer = await complete(text);
    console.log(`Answer: "${answer}"`);
    console.timeEnd("Timing");
    return await ctx.json({ text, answer }, 200);
  }) as (ctx: Context) => Promise<any>
);

app.use("/*", serveStatic({ root: "./public" }));

serve({
  fetch: app.fetch,
  port: 1337,
});

console.log("Server started, http://localhost:1337");
