const path = require("path");
const os = require("os");
const dotenv = require('dotenv');
const fs = require("fs");

const readConfig = () => dotenv.parse("./.env");

const getPath = (unixPath) => {
  return path.resolve(unixPath.replace('~', os.homedir()));
};

const createBun = (index) => ({
  name: `bun-ws-${index}`,
  script: "./src/server.ts",
  interpreter: getPath("~/.bun/bin/bun"),
  args: ["--server", `--port=808${index}`],
  out_file: `./logs/pm2/bun-ws-${index}-out.log`,  // Standard output log
  error_file: `./logs/pm2/bun-ws-${index}-error.log`,  // Error log
  log_date_format: "YYYY-MM-DD HH:mm:ss",  // Adds timestamps to logs (like --time)
  merge_logs: true,  // Combines logs into the specified files
  env: readConfig(),
});

module.exports = {
  apps: [
    /*
    {
      name: "bun-ws-1",
      script: "./src/server.ts",
      interpreter: getPath("~/.bun/bin/bun"),
      args: ["--server", "--port=70071"],
      out_file: "./logs/pm2/bun-ws-1-out.log",  // Standard output log
      error_file: "./logs/pm2/bun-ws-1-error.log",  // Error log
      log_date_format: "YYYY-MM-DD HH:mm:ss",  // Adds timestamps to logs (like --time)
      merge_logs: true  // Combines logs into the specified files
    },
    */
    createBun(1),
    createBun(2),
    createBun(3),
    createBun(4),
    createBun(5),
    // createBun(3),
    // createBun(4),
    // createBun(5),
  ]
}
