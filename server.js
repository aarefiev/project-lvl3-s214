const axios = require('axios');
const path = require('path');
const express = require('express');
const parseArgv = require('argv-parse');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const getConfig = require('./webpack.config.js');

const argv = parseArgv(process.argv);
const config = getConfig(argv.env);
const port = (process.env.PORT || 8080);

const app = express();
const compiler = webpack(config);

app.use(webpackMiddleware(compiler, config.devServer));
app.use(express.static(path.join(__dirname, '/dist')));

app.set('port', port);

app.get('/', (request, response) => {
  response.sendfile(path.join(__dirname, 'dist/index.html'));
});

app.get('/api/rss', (request, response) => {
  axios.get(request.query.url)
    .then(res => response.send(res.data))
    .catch((error) => {
      if (error.response) {
        response.status(error.response.status).send(error.response.data);
        return;
      }

      response.status(500).send(error.message);
    });
});

app.listen(app.get('port'), () => {
  console.log(`Starting server on http://localhost:${app.get('port')}`); // eslint-disable-line
});
