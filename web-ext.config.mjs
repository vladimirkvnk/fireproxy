export default {
  sourceDir: ".",
  artifactsDir: "./web-ext-artifacts",
  ignoreFiles: [
    "node_modules/",
    "web-ext-artifacts/",
    "web-ext-config.*",
    "*.cjs",
    "*.md",
    "dev-tools/",
    ".gitignore",
    "package.json",
    "package-lock.json",
  ],
  run: {
    firefox: "firefox",
    browserConsole: true,
    startUrl: ["about:debugging#/runtime/this-firefox"],
  },
  build: {
    overwriteDest: true,
  },
};
