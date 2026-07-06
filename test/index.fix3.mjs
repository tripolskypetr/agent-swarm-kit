import { run } from 'worker-testbed';
import "./spec/clientfix3.test.mjs";
run(import.meta.url, () => {
    console.log("clientfix3 finished");
    process.exit(-1);
});
