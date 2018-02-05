export default (env) => {
  const path = `./config/webpack/${env}.js`;
  const getCurrentWebpackConfig = require(path).default;

  return getCurrentWebpackConfig({ env });
};
