import Message from './Message';
import { deleteCookies } from './utils/cookie';
import { showErrorToast } from './utils/showErrorToast';
import { getCookie } from './utils/cookie';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import scrollToBottom from './utils/scrollToBottom';
import { loaderRender, loaderRemove } from './utils/loader';
import { emptyRender, emptyRemove } from './utils/empty';
import config from './app/config';
import state from './app/state';
import sendSvg from '../svg/send.svg?raw';
import FileContainer from './FileContainer';
import Sidebar from './Sidebar';
import SearchForm from './SearchForm';
import Pinned from './Pinned';
import enableInputs from './utils/enableInputs';

export default class Widget {
    constructor(element) {
        this.element = element;
    }

    bindToDOM() {
        this.searchForm = this.element.querySelector('.header__form');
        this.searchInput = this.element.querySelector('.header__input');
        this.sidebarElement = this.element.querySelector('.drawer');
        this.messagesWrapper = this.element.querySelector('.main__messages-wrapper');
        this.messagesScrollWrapper = this.element.querySelector('.main__messages-scroll-wrapper');
        this.messagesList = this.element.querySelector('.main__messages');
        this.logOutBtn = this.element.querySelector('.header__logout-btn');
        this.sendForm = this.element.querySelector('.main__form');
        this.sendInput = this.element.querySelector('.main__input');
        this.sendLabel = this.element.querySelector('.main__label');
        this.sendBtn = this.element.querySelector('.main__send-btn');
        this.pickEmojiBtn = this.element.querySelector('.main__pick-emoji');
        this.fileWrapper = this.element.querySelector('.main__file-wrapper');
        this.fileBtn = this.element.querySelector('.main__file-btn');
    }

    init() {
        this.bindToDOM();

        enableInputs();

        this.logOutBtn.addEventListener('click', () => this.logout());
        this.sendForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage(e);
        });
        this.pickEmojiBtn.addEventListener('click', () => this.showEmoji());

        this.fileContainer = new FileContainer(this.fileWrapper, this.fileBtn, this.sendLabel);
        this.sidebar = new Sidebar(this.sidebarElement, this.searchInput, this.sendForm, this.getMessages.bind(this));
        this.searchForm = new SearchForm(this.searchForm, this.renderMessages.bind(this));

        this.getMessages();
        this.scrollHandler();
        this.checkPinned();
    }

    checkPinned() {
        loaderRender();
        axios.post(`${config.baseUrl}/get-pinned`, { apiKey: getCookie('api_key') })
            .then((response) => {
                const data = response.data.message;

                if (data) {
                    const pinned = new Pinned(data);
                    pinned.render();
                }
            })
            .catch((error) => {
                showErrorToast(error.message);
            })
            .finally(() => {
                loaderRemove();
            })
    }

    getMessages() {
        emptyRemove();
        loaderRender();
        axios.post(`${config.baseUrl}/messages`, { apiKey: getCookie('api_key'), offset: state.offset, type: state.activeCategory })
            .then((response) => {
                const messages = response.data.messages;
                this.renderMessages(messages);

                this.scrollWhenLoaded();

                if (state.messages.length === 0) {
                    emptyRender();
                }

                state.offset = messages.length;
            })
            .catch((error) => {
                showErrorToast(error.message += '. Перезагрузите страницу и попробуйте снова.');
            })
            .finally(() => {
                loaderRemove();
            })
    }

    renderMessages(data) {
        state.messages = [];
        this.messagesList.querySelectorAll('li').forEach((message) => {
            message.remove();
        })
        for (const messageData of data) {
            state.messages.push(messageData);
            const message = new Message(messageData, this.messagesList, this.renderMessages.bind(this), this.searchInput, this.sidebar);
            message.render();
        }
        scrollToBottom();
    }

    scrollHandler() {
        this.messagesScrollWrapper.addEventListener('scroll', () => {
            if (this.messagesScrollWrapper.scrollTop < 50 && this.messagesScrollWrapper.scrollTop !== 0) {
                this.loadMoreItems();
            }
        });
    }

    loadMoreItems() {
        if (state.isLoading || !state.hasMoreMessages || state.messages.length < 10) return;
        state.isLoading = true;

        const lastChild = this.messagesList.firstChild;

        this.messagesScrollWrapper.insertAdjacentHTML('afterbegin', `<div class="more-loading-wrapper min-h-[230px] flex justify-center items-center w-full"><span class="loading loading-spinner loading-lg"></span></div>`)

        setTimeout(() => {
            axios.post(state.isSearch ? `${config.baseUrl}/search` : `${config.baseUrl}/messages`, state.isSearch ? { apiKey: getCookie('api_key'), offset: state.offset, type: state.activeCategory, search: this.searchForm.input.value.trim() } : { apiKey: getCookie('api_key'), offset: state.offset, type: state.activeCategory })
                .then((response) => {
                    const messages = response.data.messages;
                    if (messages.length < 10) {
                        state.hasMoreMessages = false;
                    }
                    state.messages = state.messages.concat(messages);
                    for (const messageData of messages.reverse()) {
                        const message = new Message(messageData, this.messagesList, this.renderMessages.bind(this), this.searchInput, this.sidebar);
                        message.render('prepend');
                    }

                    if (messages.length !== 0) {
                        lastChild.scrollIntoView();
                    }

                    state.offset = state.messages.length;
                })
                .catch((error) => {
                    showErrorToast(error.message += '. Попробуйте снова.');
                })
                .finally(() => {
                    this.messagesScrollWrapper.querySelector('.more-loading-wrapper').remove();
                    state.isLoading = false;
                })
        }, 3500);
    }

    scrollWhenLoaded() {
        const images = this.messagesList.querySelectorAll('img');
        const videos = this.messagesList.querySelectorAll('video');

        if (images.length === 0 && videos.length === 0) {
            scrollToBottom();
            return;
        }

        let loadedItemsAmount = images.length + videos.length;
        let loadedItemsCount = 0;

        images.forEach((img) => {
            img.addEventListener('load', () => {
                loadedItemsCount++;
                if (loadedItemsCount === loadedItemsAmount) {
                    scrollToBottom();
                }
            });

            if (img.complete) {
                loadedItemsCount++;
            }
        });

        videos.forEach((video) => {
            video.addEventListener('loadedmetadata', () => {
                loadedItemsCount++;
                if (loadedItemsCount === loadedItemsAmount) {
                    scrollToBottom();
                }
            });

            if (video.complete) {
                loadedItemsCount++;
            }
        });
    }

    logout() {
        deleteCookies();
        location.reload();
    }

    showEmoji() {
        if (this.emojiPickerWrapper) {
            this.emojiPickerWrapper.remove();
            this.emojiPickerWrapper = undefined;
            return;
        }

        this.sendInput.focus();

        const emojiPickerWrapper = document.createElement('div');
        emojiPickerWrapper.className = 'main__emoji-picker-wrapper absolute bottom-16 right-0';

        const emojiPicker = document.createElement('emoji-picker');
        emojiPicker.classList.add('dark');

        this.sendForm.append(emojiPickerWrapper);
        emojiPickerWrapper.append(emojiPicker);

        this.emojiPickerWrapper = emojiPickerWrapper;

        emojiPicker.addEventListener('emoji-click', (obj) => {
            this.sendInput.value += obj.detail.unicode;
            this.sendInput.focus();
        });

        document.addEventListener('click', (e) => {
            let target = e.target;
            if (this.emojiPickerWrapper && !target.closest('.main__emoji-picker-wrapper') && !target.closest('.main__pick-emoji') && !target.closest('.main__input')) {
                this.emojiPickerWrapper.remove();
                this.emojiPickerWrapper = undefined;
            }
        });
    }

    sendMessage(e) {
        let author;
        let type;

        state.isLoading = true;

        const formData = Object.fromEntries(new FormData(e.target).entries());
        const value = formData.message.trim();

        if (value.startsWith('@chaos')) {
            author = 'bot';

            if (value === '@chaos помощь') {
                type = 'text';
            } else if (value === '@chaos картинка') {
                type = 'image';
            } else if (value === '@chaos видео') {
                type = 'video';
            }
        } else {
            author = 'user';
        }

        if (!state.file) {
            if (author === 'user') {
                if (new RegExp('([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?').test(value)) {
                    type = 'link';
                } else {
                    type = 'text';
                }
            }
        } else {
            if (state.file.type.startsWith('video')) {
                type = 'video';
            } else if (state.file.type.startsWith('audio')) {
                type = 'audio';
            } else if (state.file.type.startsWith('image')) {
                type = 'image';
            } else {
                type = 'file';
            }
        }

        const newMessageData = {
            id: uuidv4(),
            author: author,
            type: type,
            created: Date.now(),
            isFavorite: false,
            isPinned: false,
        };

        if (value === '') {
            if (newMessageData.type === 'text') {
                showErrorToast('Поле не может быть пустым.');
                return;
            }
        } else {
            if (this.sendInput.value.trim() !== '' && !state.file) {
                newMessageData.text = value;
            }
        }

        if (newMessageData.type === 'file') {
            newMessageData.size = state.file.size;
        }

        if (author === 'user' && (newMessageData.type !== 'text' && newMessageData.type !== 'link')) {
            newMessageData.file = state.file.name;
        }

        this.sendInput.disabled = true;
        this.sendBtn.innerHTML = `<span class="loading loading-spinner"></span>`;
        this.sendBtn.disabled = true;
        this.pickEmojiBtn.disabled = true;

        axios.post(`${config.baseUrl}/new-message`, { apiKey: getCookie('api_key'), message: newMessageData })
            .then((response) => {
                if (state.file) {
                    const formData = new FormData();
                    formData.append('file', state.file);
                    axios.post(`${config.baseUrl}/upload/${getCookie('api_key')}`, formData)
                        .then(() => {
                            if (state.activeCategory === newMessageData.type || !state.activeCategory) {
                                if (!state.isSearch || (state.isSearch && this.searchInput.value.includes(newMessageData.file))) {
                                    const message = new Message(newMessageData, this.messagesList, this.renderMessages.bind(this), this.searchInput, this.sidebar);
                                    message.render();
                                    state.messages.push(newMessageData);
                                    state.offset = state.offset + 1;
                                    if (state.messages.length === 10) {
                                        state.hasMoreMessages = true;
                                    }
                                    if (state.messages.length === 1) {
                                        emptyRemove();
                                    }

                                    this.fileContainer.close();

                                    scrollToBottom();

                                    this.sendForm.reset();
                                    state.file = undefined;
                                    this.sidebar.updateCategory(newMessageData.type, 'add');
                                }
                            }
                        })
                        .catch((error) => {
                            showErrorToast(error.message);
                        })
                        .finally(() => {
                            this.sendInput.disabled = false;
                            this.sendBtn.innerHTML = sendSvg;
                            this.sendBtn.disabled = false;
                            this.pickEmojiBtn.disabled = false;
                            this.sendInput.focus();
                            state.isLoading = false;
                        })
                } else {
                    if (state.activeCategory === newMessageData.type || !state.activeCategory) {
                        if (!response.data.success) {
                            showErrorToast(response.data.message);
                        } else {
                            if (!state.isSearch || (state.isSearch && this.searchInput.value.includes(newMessageData.file))) {
                                const data = response.data.message;

                                let message;

                                if (author === 'bot') {
                                    if (type === 'image') {
                                        const botMessage = {
                                            id: newMessageData.id,
                                            author: newMessageData.author,
                                            type: newMessageData.type,
                                            created: newMessageData.created,
                                            isFavorite: newMessageData.isFavorite,
                                            isPinned: newMessageData.isPinned,
                                            file: data
                                        };

                                        message = new Message(botMessage, this.messagesList, this.renderMessages.bind(this), this.searchInput, this.sidebar);
                                        message.render();
                                        scrollToBottom();
                                        state.messages.push(botMessage);
                                        this.sidebar.updateCategory(botMessage.type, 'add');
                                    } else {
                                        message = new Message({ ...newMessageData, text: data }, this.messagesList, this.renderMessages.bind(this), this.searchInput, this.sidebar);
                                        message.render();
                                        state.messages.push({ ...newMessageData, text: data });
                                        this.sidebar.updateCategory(newMessageData.type, 'add');
                                        scrollToBottom();
                                    }
                                } else {
                                    message = new Message(newMessageData, this.messagesList, this.renderMessages.bind(this), this.searchInput, this.sidebar);
                                    message.render();
                                    state.messages.push(newMessageData);
                                    this.sidebar.updateCategory(newMessageData.type, 'add');
                                    scrollToBottom();
                                }

                                this.sendForm.reset();
                                state.offset = state.offset + 1;
                                if (state.messages.length === 10) {
                                    state.hasMoreMessages = true;
                                }
                                if (state.messages.length === 1) {
                                    emptyRemove();
                                }
                            }
                        }
                    }
                }
            })
            .catch((error) => {
                showErrorToast(error.message);
            })
            .finally(() => {
                if (!state.file) {
                    this.sendInput.disabled = false;
                    this.sendBtn.innerHTML = sendSvg;
                    this.sendBtn.disabled = false;
                    this.pickEmojiBtn.disabled = false;
                    this.sendInput.focus();
                    state.isLoading = false;
                }
            })
    }
}