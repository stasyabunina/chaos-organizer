import { showErrorToast } from './utils/showErrorToast';
import { getCookie } from './utils/cookie';
import config from './app/config';
import state from './app/state';
import axios from 'axios';
import { emptyRemove } from './utils/empty';

export default class Sidebar {
    constructor(element, searchInput, messageForm, getMessages) {
        this.element = element;
        this.searchInput = searchInput;
        this.messageForm = messageForm;
        this.getMessages = getMessages;

        this.init();
    }

    bindToDOM() {
        this.checkbox = this.element.querySelector('#my-drawer');
        this.categories = this.element.querySelectorAll('li');
        this.favoriteCategory = this.element.querySelector('li[data-type="favorite"]');
    }

    init() {
        this.bindToDOM();
        this.updateCategories();
        this.addEventListeners();
    }

    updateCategory(type, method) {
        this.categories.forEach(category => {
            if (category.dataset.type === type) {
                const el = category.querySelector('sup');
                const categoryAmount = Number(el.textContent);
                if (method === 'remove') {
                    el.textContent = categoryAmount - 1
                } else if (method === 'add') {
                    el.textContent = categoryAmount + 1
                }
            };
        });
    }

    updateCategories() {
        axios.post(`${config.baseUrl}/categories`, { apiKey: getCookie('api_key') })
            .then((response) => {
                this.categories.forEach(el => {
                    const button = el.querySelector('button');
                    const categoryType = el.dataset.type;
                    const btnAmount = button.querySelector('sup');
                    const { types } = response.data;
                    const type = types.find(item => item.type === categoryType);
                    if (!type) {
                        btnAmount.textContent = '0';
                    } else {
                        btnAmount.textContent = type.amount;
                    }
                });
            })
            .catch((error) => {
                showErrorToast(error.message);
            })
    }

    addEventListeners() {
        this.categories.forEach(category => {
            const categoryType = category.dataset.type;
            const categoryBtn = category.querySelector('button');
            categoryBtn.addEventListener('click', () => {
                emptyRemove();
                state.offset = 0;
                state.file = undefined;
                state.hasMoreMessages = true;
                this.searchInput.value = '';
                this.messageForm.reset();
                this.categories.forEach((el) => {
                    el.querySelector('button').classList.remove('btn-active')
                })
                if (state.activeCategory === categoryType) {
                    state.activeCategory = undefined;
                } else {
                    categoryBtn.classList.add('btn-active');
                    state.activeCategory = categoryType;
                }

                this.checkbox.checked = false;
                this.getMessages();
            })
        });
    }
}