import { run } from 'worker-testbed';

import "./spec/completion.test.mjs";
import "./spec/navigation.test.mjs";
import "./spec/validation.test.mjs";
import "./spec/connection.test.mjs";
import "./spec/dispose.test.mjs";
import "./spec/resque.test.mjs";
import "./spec/ignore.spec.mjs";
import "./spec/queue.test.mjs";
import "./spec/scheduled.test.mjs";
import "./spec/storage.test.mjs"
import "./spec/state.test.mjs";

run(import.meta.url, () => {
    console.log("All tests are finished");
    process.exit(-1);
});
