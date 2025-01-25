import { run } from 'worker-testbed';

import "./spec/completion.test.mjs";
import "./spec/navigation.test.mjs";
import "./spec/validation.test.mjs";
import "./spec/connection.test.mjs";
import "./spec/dispose.test.mjs";
import "./spec/resque.test.mjs";

run(import.meta.url, () => {
    console.log("All tests are finished");
    process.exit(-1);
});
