import * as moduleData from "../build/index.mjs";

{
  Object.assign(globalThis, { moduleData });
}

process.exit = (statuscode) => {
  console.log('Exit prevented', { statuscode })
}

process.kill = (statuscode) => {
  console.log('Kill prevented', { statuscode })
}

