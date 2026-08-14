const babelJest = require("babel-jest");

module.exports = babelJest.createTransformer({
  configFile: require.resolve("./babel.jest.config.cjs")
});
