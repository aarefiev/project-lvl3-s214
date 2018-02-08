import 'js-polyfills/dom';
import 'js-polyfills/url';
import 'js-polyfills/html';

import fs from 'fs';
import path from 'path';
import timer from 'timer-promise';
import nock from 'nock';
import keycode from 'keycode';
import { html } from 'js-beautify';

import run from '../src';

const host = 'http://localhost';
const fixturesPath = path.join(__dirname, '__fixtures__');
const getTree = () => html(document.body.innerHTML);

const pressKey = (key, el = document.body, value = key) => {
  const keyCode = keycode(key);
  const e = new KeyboardEvent('input', { keyCode });
  el.value = value; // eslint-disable-line
  el.dispatchEvent(e);
};

const submitForm = (el = document.body) => {
  const e = new Event('submit');
  el.dispatchEvent(e);
};

beforeAll(async () => {
  jsdom.reconfigure({ url: host }); // eslint-disable-line

  const initHtml = fs.readFileSync(path.join(fixturesPath, 'index.html')).toString();

  document.documentElement.innerHTML = initHtml;
  nock.disableNetConnect();
  run();
});

test('application', async () => {
  const input = document.getElementById('rss_input_url');
  const form = document.getElementById('rss_form');
  const feedURL = 'http://lorem-rss.herokuapp.com/feed';
  const feedInXML = fs.readFileSync(path.join(fixturesPath, 'feed.xml'), 'utf8')
    .toString();

  expect(getTree()).toMatchSnapshot();

  pressKey('h', input);
  await timer.start(100);
  expect(getTree()).toMatchSnapshot();

  pressKey(feedURL, input);
  await timer.start(100);
  expect(getTree()).toMatchSnapshot();

  nock(host)
    .get('/api/rss')
    .query({ url: feedURL })
    .reply(200, feedInXML);

  submitForm(form);
  await timer.start(100);
  expect(getTree()).toMatchSnapshot();
});
