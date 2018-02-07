// @flow

import axios from 'axios';
import isURL from 'validator/lib/isURL';

const getFeedContent = (urlAddress: string): Promise<string> => {
  const urlObject = new URL('/api/rss', window.location.origin);
  urlObject.searchParams.append('url', urlAddress);

  return new Promise((resolve, reject) => {
    axios.get(urlObject)
      .then(({ data }) => resolve(data))
      .catch(error => reject(error));
  });
};

const parseFeedContentToDom = (feedContent: string): Promise<mixed> => {
  const parser = new DOMParser();

  return new Promise((resolve, reject) => {
    const doc = parser.parseFromString(feedContent, 'application/xml');
    const error = doc.querySelector('parsererror');

    if (error) {
      reject(new Error('Can\'t parse provided XML'));
      return;
    }

    resolve(doc);
  });
};

export default class {
  rootNode: any;
  state: any;
  handleInput: any;
  handleSubmit: any;

  constructor(rootNode: mixed) {
    this.rootNode = rootNode;
    this.state = {
      url: '',
      isValid: false,
      focus: {
        target: null,
        selectionRange: [],
      },
      feeds: [],
    };
    this.handleInput = this.handleInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInput({ target }: any) {
    const { value, selectionStart, selectionEnd } = target;

    this.setState({
      url: value,
      isValidURL: isURL(value, {
        require_protocol: true,
      }),
      focus: {
        target: 'input',
        selectionRange: [selectionStart, selectionEnd],
      },
    });
  }

  handleSubmit(e: any) {
    e.preventDefault();

    if (!this.state.isValidURL) {
      return;
    }

    getFeedContent(this.state.url)
      .then(parseFeedContentToDom)
      .then((doc: any) => {
        const channelNode = doc.querySelector('channel');

        if (channelNode === null) {
          throw new Error('Invalid RSS format');
        }

        const feedItems = [...channelNode.querySelectorAll('item')]
          .map((item) => {
            const titleNode = item.querySelector('title');
            const linkNode = item.querySelector('link');

            return {
              title: titleNode.textContent,
              link: linkNode.innerHTML,
            };
          });
        const feed = {
          title: channelNode.querySelector('title').textContent,
          description: channelNode.querySelector('description').textContent,
          items: feedItems,
        };

        this.setState({
          url: '',
          isValid: false,
          focus: {},
          feeds: [...this.state.feeds, feed],
        });
      })
      .catch((error) => {
        throw error;
      });
  }

  setState(newState: any) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  render() {
    const inputClasses = ['form-control'];
    const rootHTMLContents = [];

    if (this.state.url.length > 0) {
      inputClasses.push(this.state.isValid ? 'is-valid' : 'is-invalid');
    }

    rootHTMLContents.push(`
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="d-flex justify-content-center">
              <div class="jumbotron col-md-6">
                <form id="rss_form">
                  <div class="form-group">
                    <label for="rss_input_url">URL адрес</label>
                    <input type="text"
                      value="${this.state.url}"
                      placeholder="Введите URL"
                      class="${inputClasses.join(' ')}"
                      id="rss_input_url">
                  </div>
                  <button type="submit"
                    class="btn btn-primary">Добавить</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);

    if (this.state.feeds.length > 0) {
      const feedsChannelsContent = this.state.feeds
        .map(({ title, description }) => `
          <div class="w-100">
            <h5 class="mb-1">${title}</h5>
            <p class="mb-1">${description}</p>
          </div>
        `);
      const feedsItemsContens = this.state.feeds.map(({ items }) => {
        const feedItemContens = items.map(({ link, title }) =>
          `<a target="_blank" href="${link}"
            class="list-group-item">${title}</a>`);

        return `<div class="list-group">${feedItemContens.join('')}</div>`;
      });

      rootHTMLContents.push(`
        <div class="container">
          <div class="row">
            <div class="col-12">
              <div class="d-flex justify-content-center">
                <div class="col-6">
                  <div class="list-group">${feedsChannelsContent.join('')}</div>
                </div>
                <div class="col-6">${feedsItemsContens.join('')}</div>
              </div>
            </div>
          </div>
        </div>
      `);
    }

    this.rootNode.innerHTML = rootHTMLContents.join('');

    const form = this.rootNode.querySelector('#rss_form');
    const input = this.rootNode.querySelector('#rss_input_url');

    form.addEventListener('submit', this.handleSubmit);
    input.addEventListener('input', this.handleInput);

    if (this.state.focus.target === 'input') {
      input.focus();
      input.setSelectionRange(...this.state.focus.selectionRange);
    }
  }
}
