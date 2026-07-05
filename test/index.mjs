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
import "./spec/toolcall.test.mjs";
import "./spec/mcp.test.mjs";
import "./spec/agentflow.test.mjs";
import "./spec/commit.test.mjs";
import "./spec/orchestration.test.mjs";
import "./spec/compute.test.mjs";
import "./spec/infra.test.mjs";
import "./spec/policy.test.mjs";
import "./spec/adapters.test.mjs";
import "./spec/outline.test.mjs";
import "./spec/resilience.test.mjs";
import "./spec/providers.test.mjs";
import "./spec/override.test.mjs";
import "./spec/persist.test.mjs";
import "./spec/misc.test.mjs";
import "./spec/schema-callbacks.test.mjs";
import "./spec/loop.test.mjs";
import "./spec/toolguard.test.mjs";
import "./spec/aliastools.test.mjs";
import "./spec/multiclient.test.mjs";
import "./spec/doublesend.test.mjs";
import "./spec/lifecycle.test.mjs";
import "./spec/numindex.test.mjs";
import "./spec/banhammer.test.mjs";
import "./spec/modelguard.test.mjs";
import "./spec/hookguard.test.mjs";
import "./spec/sweepguard.test.mjs";
import "./spec/crashrecovery.test.mjs";
import "./spec/finalguard.test.mjs";
import "./spec/navprev.test.mjs";

run(import.meta.url, () => {
    console.log("All tests are finished");
    process.exit(-1);
});
