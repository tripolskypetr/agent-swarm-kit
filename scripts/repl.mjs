import { swarm } from "../build/index.mjs";

{
  globalThis.swarm = swarm;
}

process.exit = (statuscode) => {
  console.log('Exit prevented', { statuscode })
}

process.kill = (statuscode) => {
  console.log('Kill prevented', { statuscode })
}

