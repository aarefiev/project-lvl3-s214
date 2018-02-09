// @flow

import 'jquery';
import 'bootstrap';
import './assets/styles.scss';
import RssFeedApp from './rssfeedapp';

export default () => {
  const rootNode = document.getElementById('application');
  const app = new RssFeedApp(rootNode);

  app.render();
};
