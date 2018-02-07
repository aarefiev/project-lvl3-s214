const devConfig = require('./config/webpack/development.js');
const prodConfig = require('./config/webpack/development.js');

module.exports = env => (env === 'development' ? devConfig : prodConfig);
