const path = require("path");

module.exports = {
  paths: function (paths, env) {
    // Change the build folder name to "dist"
    paths.appBuild = path.resolve(__dirname, "dist");
    return paths;
  }
};
