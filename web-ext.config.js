export default {
  sourceDir: ".",
  artifactsDir: "./web-ext-artifacts",
  run: {
    firefox: "firefox",
    browserConsole: true,
    startUrl: ["about:debugging#/runtime/this-firefox"]
  },
  lint: {
    warningsAsErrors: false,
    output: "text"
  },
  build: {
    overwriteDest: true
  }
};