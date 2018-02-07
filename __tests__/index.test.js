import fs from 'fs';
import path from 'path';
import moxios from 'moxios';
import keycode from 'keycode';
import { html } from 'js-beautify';

import run from '../src';

const fixturesPath = path.join(__dirname, '__fixtures__');
const getTree = () => html(document.body.innerHTML);

const pressKey = (key, el = document.body, value = key) => {
  const keyCode = keycode(key);
  const e = new KeyboardEvent('input', { keyCode });
  el.value = value; // eslint-disable-line
  el.dispatchEvent(e);
};

beforeAll(async () => {
  const initHtml = fs.readFileSync(path.join(fixturesPath, 'index.html')).toString();

  document.documentElement.innerHTML = initHtml;
  moxios.install();
  run();
});

test('application', async (done) => {
  const input = document.getElementById('rss_input_url');
  const feedURL = 'http://lorem-rss.herokuapp.com/feed';

  expect(getTree()).toMatchSnapshot();

  pressKey('h', input);
  expect(getTree()).toMatchSnapshot();

  pressKey(feedURL, input);
  expect(getTree()).toMatchSnapshot();

  done();
});
