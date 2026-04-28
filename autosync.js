const chokidar = require("chokidar");
const { exec } = require("child_process");

const REPO_PATH = process.env.HOME + "/project/TempMail";
const BRANCH = "main";

// debounce + lock system
let timer = null;
let isSyncing = false;
let pending = false;

const DEBOUNCE_TIME = 4000;

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: REPO_PATH }, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout);
    });
  });
}

async function syncRepo() {
  if (isSyncing) {
    pending = true;
    return;
  }

  isSyncing = true;

  try {
    console.log("🚀 Sync mulai...");

    await run(`git pull origin ${BRANCH}`);

    const status = await run("git status -s");

    if (!status.trim()) {
      console.log("✅ Tidak ada perubahan");
      isSyncing = false;
      return;
    }

    await run("git add -A");
    await run(`git commit -m "auto sync: ${new Date().toISOString()}"`);
    await run(`git push origin ${BRANCH}`);

    console.log("🔥 Sync sukses");
  } catch (err) {
    console.error("❌ Sync error:", err);
  }

  isSyncing = false;

  if (pending) {
    pending = false;
    syncRepo();
  }
}

// watcher config (ini penting!)
const watcher = chokidar.watch(REPO_PATH, {
  ignored: [
    /node_modules/,
    /\.git/,
    /\.cache/,
    /\.env/,
  ],
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100,
  },
});

watcher.on("all", (event, path) => {
  console.log(`📂 ${event}: ${path}`);

  clearTimeout(timer);
  timer = setTimeout(() => {
    syncRepo();
  }, DEBOUNCE_TIME);
});

console.log("👀 Real-time watcher aktif...");
