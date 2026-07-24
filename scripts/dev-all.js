const { spawn } = require("node:child_process");
const path = require("node:path");

const rootDirectory = path.resolve(__dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const children = [
  spawn(npmCommand, ["run", "dev"], {
    cwd: rootDirectory,
    env: process.env,
    stdio: "inherit"
  }),
  spawn(npmCommand, ["run", "dev"], {
    cwd: path.join(rootDirectory, "frontend"),
    env: process.env,
    stdio: "inherit"
  })
];

let stopping = false;

function stopAll(signal = "SIGTERM") {
  if (stopping) return;
  stopping = true;

  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
}

for (const child of children) {
  child.on("exit", (code) => {
    if (!stopping) {
      process.exitCode = code ?? 1;
      stopAll();
    }
  });
}

process.on("SIGINT", () => stopAll("SIGINT"));
process.on("SIGTERM", () => stopAll("SIGTERM"));
