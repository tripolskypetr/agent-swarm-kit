import "./config/setup.mjs";

import { run } from "worker-testbed";

// Import your tests HERE
import "./spec/add_to_basket.spec.mjs";
//      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

run(import.meta.url, () => {
  console.log("All tests are finished");
  process.exit(-1);
});
