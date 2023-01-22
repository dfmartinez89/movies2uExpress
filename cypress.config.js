const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      require("@cypress/code-coverage/task")(on, config);
      on("file:preprocessor", require("@cypress/code-coverage/use-babelrc"));
      // include any other plugin code...
      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    },
    env: {
      codeCoverage: {
        exclude: ["cypress/**/*.*", "cypress*"],
        url: "http://localhost:3000/__coverage__",
        expectBackendCoverageOnly: false,
      },
    },
  },
});
