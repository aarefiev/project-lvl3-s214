// @flow

import axios from 'axios';
import isURL from 'validator/lib/isURL';

const getFeedContent = (urlAddress: string): Promise<string> => {
  const urlObject = new URL('/api/rss', window.location.origin);
  urlObject.searchParams.append('url', urlAddress);

  return new Promise((resolve) => {
    axios.get(urlObject.toString())
      .then(({ data }) => resolve(data));
  });
};

const parseFeedContentToDom = (feedContent: string): any => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(feedContent, 'application/xml');
  const error = doc.querySelector('parsererror');

  if (error) {
    throw new Error('Can\'t parse provided XML');
  }

  return doc;
};

const parseFeedData = (feedNode: any): any => {
  const channelNode = feedNode.querySelector('channel');

  if (channelNode === null) {
    throw new Error('Invalid RSS format');
  }

  const feedItems = [...channelNode.querySelectorAll('item')]
    .map(item => ({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').innerHTML,
    }));

  return {
    title: channelNode.querySelector('title').textContent,
    description: channelNode.querySelector('description').textContent,
    items: feedItems,
  };
};

export default class {
  rootNode: any;
  state: any;
  handleInput: any;
  handleSubmit: any;
  handlePreview: any;

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
      modal: {
        state: 'closed',
        title: '',
        description: '',
      },
    };
    this.handleInput = this.handleInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePreview = this.handlePreview.bind(this);
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
      .then((feedContent) => {
        const doc = parseFeedContentToDom(feedContent);
        const feedData = parseFeedData(doc);

        this.setState({
          url: '',
          isValidURL: false,
          focus: {},
          feeds: [...this.state.feeds, feedData],
        });
      });
  }

  handlePreview(e: any) {
    e.preventDefault();

    const { feedId, itemId } = e.currentTarget.dataset;
    const { title, description } = this.state.feeds[feedId].items[itemId];

    if (description.length === 0) {
      return;
    }

    this.setState({
      modal: {
        state: 'opened',
        title,
        description,
      },
    });
  }

  setState(newState: any) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  renderFormContent() {
    const inputClasses = ['form-control'];

    if (this.state.url.length > 0) {
      inputClasses.push(this.state.isValidURL ? 'is-valid' : 'is-invalid');
    }

    return `
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
    `;
  }

  renderFeedsContent() {
    if (this.state.feeds.length > 0) {
      const feedsChannelsContent = this.state.feeds
        .map(({ title, description }) => `
          <div class="w-100">
            <h5 class="mb-1">${title}</h5>
            <p class="mb-1">${description}</p>
          </div>
        `);
      const feedsItemsContens = this.state.feeds.map(({ items }, feedIndex) => {
        const feedItemContens = items.map(({ link, title }, itemIndex) => {
          const linkContent = `<a target="_blank" href="${link}">${title}</a>`;
          const btnPreviewContent = `
            <button type="button" class="btn btn-info btn-sm float-right"
              data-feed-id="${feedIndex}" data-item-id="${itemIndex}" data-toggle="modal">
                Предпросмотр
            </button>
          `;

          return `<li class="list-group-item">${btnPreviewContent}${linkContent}</li>`;
        });

        return `<div class="list-group">${feedItemContens.join('')}</div>`;
      });

      return `
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
      `;
    }

    return '';
  }

  renderModalContent() {
    const { title, description } = this.state.modal;

    return `
      <!-- Modal -->
      <div class="modal fade"
        id="rss_modal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${title}</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">${description}</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const rootHTMLContents = [
      this.renderFormContent(),
      this.renderFeedsContent(),
      this.renderModalContent(),
    ];

    this.rootNode.innerHTML = rootHTMLContents.join('');

    const form = this.rootNode.querySelector('#rss_form');
    const input = this.rootNode.querySelector('#rss_input_url');
    const previewButtons = this.rootNode.querySelectorAll('button[data-toggle="modal"]');
    const modalWindow = this.rootNode.querySelector('#rss_modal');

    form.addEventListener('submit', this.handleSubmit);
    input.addEventListener('input', this.handleInput);

    if (this.state.focus.target === 'input') {
      input.focus();
      input.setSelectionRange(...this.state.focus.selectionRange);
    }

    if (previewButtons.length > 0) {
      [...previewButtons].forEach(button =>
        button.addEventListener('click', this.handlePreview));
    }

    if (this.state.modal.state === 'opened') {
      $(modalWindow).modal();
    }
  }
}
