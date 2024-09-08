import axios from 'axios';
import { showErrorToast } from './utils/showErrorToast';
import { getCookie } from './utils/cookie';
import { loaderRender, loaderRemove } from './utils/loader';
import { emptyRemove, emptyRender } from './utils/empty';
import config from './app/config';
import state from './app/state';

export default class SearchForm {
    constructor(element, renderMessages) {
        this.element = element;
        this.renderMessages = renderMessages;

        this.open = false;

        this.init()
    }

    bindToDOM() {
        this.inputWrapper = this.element.querySelector('.header__input-wrapper');
        this.inputContainer = this.element.querySelector('.header__input-container');
        this.input = this.element.querySelector('.header__input');
        this.btn = this.element.querySelector('.header__search-btn');
    }

    init() {
        this.bindToDOM();
        this.openHandler();
        this.element.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submit();
        })
    }

    openHandler() {
        this.btn.addEventListener('click', (e) => {
            e.preventDefault();

            if (!this.open) {
                this.inputWrapper.classList.add('max-w-[300px]');
                this.inputContainer.classList.remove('overflow-hidden');
                this.btn.type = 'submit';
                this.open = true;
                state.isSearch = true;
            } else {
                this.submit();
            }
        });

        document.addEventListener('click', (e) => {
            let target = e.target;
            if (!target.closest('.header__form') && this.open === true) {
                this.inputWrapper.classList.remove('max-w-[300px]');
                this.inputWrapper.classList.add('max-w-0');
                this.inputContainer.classList.add('overflow-hidden');
                this.open = false;
                this.btn.type = 'button';
                state.isSearch = false;
            }
        });
    }

    submit() {
        emptyRemove();
        loaderRender();
        axios.post(`${config.baseUrl}/search`, { apiKey: getCookie('api_key'), offset: 0, type: state.activeCategory, search: this.input.value.trim() })
            .then((response) => {
                state.messages = [];
                state.offset = 0;
                state.hasMoreMessages = true;
                if (this.input.value.trim() === '') {
                    state.isSearch = false;
                } else {
                    state.isSearch = true;
                }

                const messages = response.data.messages;

                this.renderMessages(messages);

                if (messages.length === 0) {
                    emptyRender();
                }
            })
            .catch((error) => {
                showErrorToast(error.message += '. Попробуйте снова.');
            })
            .finally(() => {
                loaderRemove();
            })
    }
}