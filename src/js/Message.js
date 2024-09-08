import linkifyHtml from 'linkify-html';
import moment from 'moment';
import axios from 'axios';
import { getCookie } from './utils/cookie';
import { showErrorToast } from './utils/showErrorToast';
import config from './app/config';
import favoriteSvg from '../svg/favorite.svg?raw';
import moreSvg from '../svg/more.svg?raw';
import fileSvg from '../svg/file.svg?raw';
import { loaderRender, loaderRemove } from './utils/loader';
import { formatBytes } from './utils/formatBytes';
import AudioController from './AudioController';
import VideoController from './VideoController';
import state from './app/state';
import Pinned from './Pinned';
import scrollToBottom from './utils/scrollToBottom';
import { emptyRender } from './utils/empty';

export default class Message {
    constructor(data, list, renderMessages, searchInput, sidebar) {
        this.data = data;
        this.list = list;
        this.searchInput = searchInput;
        this.renderMessages = renderMessages;
        this.sidebar = sidebar;
    }

    render(method = 'append') {
        const li = document.createElement('li');
        li.className = 'message max-w-[40%] mb-5 chat';
        if (this.data.author === 'user') {
            li.classList.add('self-end');
        }

        const message = document.createElement('div');
        message.className = 'relative';

        const header = document.createElement('div');
        header.className = 'chat-header mb-3';

        const author = document.createElement('span');
        author.classList.add('mr-2');

        const content = document.createElement('div');
        if (this.data.type === 'audio') {
            content.className = 'chat-bubble max-w-full relative pl-3 pr-5 py-4 mb-2';
        } else {
            content.className = 'chat-bubble max-w-full relative p-5 mb-2';
        }

        if (this.data.author === 'bot') {
            li.classList.add('chat-start');
            content.classList.add('chat-bubble-primary');
            author.textContent = 'Бот';
        } else {
            li.classList.add('chat-end');
            author.textContent = 'Я';
        }

        this.list[method](li);
        li.append(message);
        message.append(header);
        header.append(author);
        message.append(content);

        this.content = content;
        this.wrapper = message;
        this.element = li;

        const newDate = moment(this.data.created).format('HH:mm');
        const date = `<time class="text-xs opacity-50">${newDate}</time>`;
        header.insertAdjacentHTML('beforeend', date);

        if (this.data.text) {
            const formattedText = this.data.text.replace(/\n/g, '<br>');
            content.innerHTML = linkifyHtml(formattedText, { target: '_blank' });
            const link = content.querySelector('a');
            if (link) {
                link.className = 'link link-underline';
            }
        } else {
            if (this.data.type === 'image') {
                this.fileLoader();

                const img = document.createElement('img');
                img.alt = this.data.file;
                if (this.data.author === 'bot') {
                    img.src = this.data.file;
                } else {
                    img.src = `${config.baseUrl}/${getCookie('username')}/${this.data.file}`;
                }

                content.append(img);

                img.addEventListener('load', () => {
                    this.fileLoaderRemove();
                    scrollToBottom();
                });
            } else if (this.data.type === 'file') {
                content.classList.add('flex');
                this.renderFile(content);
            } else if (this.data.type === 'audio') {
                content.classList.add('flex');
                new AudioController(content, this.data.file);
            }
            else if (this.data.type === 'video') {
                this.fileLoader();

                new VideoController(content, this.data.file, this.fileLoaderRemove.bind(this));
            }
        }

        this.renderFavoriteBtn(message);
        this.renderMoreBtn(message);
    }

    fileLoader() {
        this.content.classList.add('min-h-[280px]');
        this.content.classList.add('min-w-[450px]');

        const loaderWrapper = document.createElement('div');
        loaderWrapper.className = 'h-full w-full absolute top-0 left-0 flex justify-center items-center';

        const loader = document.createElement('div');
        loader.className = 'loading loading-spinner loading-lg';

        this.content.append(loaderWrapper);
        loaderWrapper.append(loader);

        this.loader = loaderWrapper;
    }

    fileLoaderRemove() {
        this.content.classList.remove('h-[280px]');
        this.content.classList.remove('w-[450px]');
        this.loader.remove();
    }

    renderFile(element) {
        const fileIcon = document.createElement('div');
        fileIcon.className = 'mr-4 flex items-center';
        fileIcon.innerHTML = fileSvg;

        const fileContent = document.createElement('div');
        fileContent.className = 'flex flex-col justify-center items-start';

        const fileName = document.createElement('span');
        fileName.className = 'mb-1 font-bold';
        fileName.textContent = this.data.file.length > 20 ? `${this.data.file.slice(0, 20).trim()}...` : this.data.file;

        const fileSize = document.createElement('span');
        fileSize.className = 'whitespace-nowrap text-[#d1d5db]';

        fileSize.textContent = formatBytes(this.data.size);

        element.append(fileIcon);
        element.append(fileContent);
        fileContent.append(fileName);
        fileContent.append(fileSize);
    }

    renderFavoriteBtn(message) {
        const favoriteBtn = document.createElement('button');
        favoriteBtn.type = 'button';
        favoriteBtn.innerHTML = favoriteSvg;

        if (this.data.author === 'bot') {
            favoriteBtn.className = 'absolute top-8 left-[calc(100%+20px)]';
        } else {
            favoriteBtn.className = 'absolute top-8 left-[-40px]';
        }

        if (this.data.isFavorite === true) {
            favoriteBtn.querySelector('path').setAttribute('fill', '#d1d5db');
        }

        message.append(favoriteBtn);
        this.favoriteBtn = favoriteBtn;

        this.favoriteBtn.addEventListener('click', () => {
            this.favoriteMessage()
        })
    }

    renderMoreBtn(message) {
        const dropdownWrapper = document.createElement('div');
        dropdownWrapper.className = 'dropdown dropdown-top dropdown-end px-4';

        const moreBtn = document.createElement('button');
        moreBtn.type = 'button';
        moreBtn.innerHTML = moreSvg;

        if (this.data.author === 'bot') {
            moreBtn.className = 'active:scale-[0.9] active:origin-center duration-100';
        } else {
            moreBtn.className = 'active:scale-[0.9] active:origin-center duration-100';
        }

        message.append(dropdownWrapper);
        dropdownWrapper.append(moreBtn);
        this.moreBtn = moreBtn;
        this.dropdownWrapper = dropdownWrapper;

        this.renderDropdown();
    }

    renderDropdown() {
        const dropdown = document.createElement('ul');
        dropdown.className = 'dropdown-content menu bg-neutral rounded-box z-[1] w-52 p-2';

        if (this.data.author === 'bot') {
            this.dropdownWrapper.classList.add('dropdown-right')
        } else {
            this.dropdownWrapper.classList.add('dropdown-left');
        }

        const dropdownRemoveItem = document.createElement('li');
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'Удалить';

        const dropdownDownloadItem = document.createElement('li');
        const downloadBtn = document.createElement('a');
        downloadBtn.textContent = 'Скачать';

        if (this.data.type === 'text' || this.data.type === 'link') {
            const file = new Blob([this.data.text], { type: 'text/plain' });
            downloadBtn.href = URL.createObjectURL(file);
            downloadBtn.download = 'message.txt';
        } else {
            const toDataURL = (url) =>
                fetch(url)
                    .then((response) => response.blob())
                    .then(
                        (blob) =>
                            new Promise((resolve, reject) => {
                                const reader = new FileReader();
                                reader.readAsDataURL(blob);
                                reader.onloadend = () => resolve(reader.result);
                                reader.onerror = reject;
                            })
                    );

            toDataURL(this.data.author === 'bot' ? this.data.file : `${config.baseUrl}/${getCookie('username')}/${this.data.file}`).then((dataUrl) => {
                downloadBtn.href = dataUrl;
                downloadBtn.download = this.data.file;
            });
        }

        const dropdownPinItem = document.createElement('li');
        const pinBtn = document.createElement('button');
        pinBtn.type = 'button';
        pinBtn.textContent = 'Прикрепить';

        this.dropdownWrapper.append(dropdown);
        dropdown.append(dropdownRemoveItem);
        dropdown.append(dropdownDownloadItem);
        dropdown.append(dropdownPinItem);
        dropdownRemoveItem.append(removeBtn);
        dropdownDownloadItem.append(downloadBtn);
        dropdownPinItem.append(pinBtn);

        this.dropdown = dropdown;

        removeBtn.addEventListener('click', () => {
            this.removeMessage();
        })

        downloadBtn.addEventListener('click', (evt) => {
            this.download(evt);
            const elem = document.activeElement;
            if (elem) {
                elem.blur();
            }
        })

        pinBtn.addEventListener('click', () => {
            this.pinMessage();
            const elem = document.activeElement;
            if (elem) {
                elem.blur();
            }
        })
    }

    download(evt) {
        setTimeout(() => {
            let link = evt.target;
            if (this.data.type === 'text' || this.data.type === 'link') {
                if (link.href) {
                    URL.revokeObjectURL(link.href);
                }
            }
        }, 3500)
    }

    removeMessage() {
        loaderRender();
        axios.post(`${config.baseUrl}/delete-message`, { apiKey: getCookie('api_key'), id: this.data.id, fileName: this.data.author === 'bot' ? undefined : this.data.file })
            .then(() => {
                this.sidebar.updateCategory(this.data.type, 'remove');

                if (state.messages.length > 10) {
                    this.element.remove();
                    state.messages = state.messages.filter(message => message.id !== this.data.id);
                    loaderRemove()
                } else {
                    axios.post(state.isSearch ? `${config.baseUrl}/search` : `${config.baseUrl}/messages`, state.isSearch ? { apiKey: getCookie('api_key'), offset: 0, type: state.activeCategory, search: this.searchInput.value.trim() } : { apiKey: getCookie('api_key'), offset: 0, type: state.activeCategory })
                        .then((response) => {
                            const messages = response.data.messages;
                            state.offset = messages.length;

                            this.renderMessages(messages);

                            if (messages.length === 0) {
                                emptyRender();
                            }

                            if (messages.length < 10) {
                                state.hasMoreMessages = false;
                            }
                        })
                        .catch((error) => {
                            showErrorToast(error.message += '. Перезагрузите страницу и попробуйте снова.');
                        })
                        .finally(() => {
                            loaderRemove();
                        })
                }
            })
            .catch((error) => {
                showErrorToast(error.message);
                loaderRemove()
            })
    }

    favoriteMessage() {
        axios.post(`${config.baseUrl}/favorite`, { apiKey: getCookie('api_key'), id: this.data.id, isFavorite: !this.data.isFavorite })
            .then(() => {
                if (this.data.isFavorite === false) {
                    this.data.isFavorite = true;
                    this.favoriteBtn.querySelector('path').setAttribute('fill', '#d1d5db');

                    this.sidebar.updateCategory('favorite', 'add');
                } else {
                    if (state.activeCategory === 'favorite') {
                        loaderRender();
                        axios.post(state.isSearch ? `${config.baseUrl}/search` : `${config.baseUrl}/messages`, state.isSearch ? { apiKey: getCookie('api_key'), offset: 0, type: state.activeCategory, search: this.searchInput.value.trim() } : { apiKey: getCookie('api_key'), offset: 0, type: state.activeCategory })
                            .then((response) => {
                                const messages = response.data.messages;
                                state.offset = messages.length;

                                this.renderMessages(messages);

                                if (messages.length === 0) {
                                    emptyRender();
                                }

                                if (messages.length < 10) {
                                    state.hasMoreMessages = false;
                                }
                            })
                            .catch((error) => {
                                showErrorToast(error.message += '. Перезагрузите страницу и попробуйте снова.');
                            })
                            .finally(() => {
                                loaderRemove();
                            })
                    }

                    this.data.isFavorite = false;
                    this.favoriteBtn.querySelector('path').setAttribute('fill', 'none');

                    this.sidebar.updateCategory('favorite', 'remove');
                }

                this.favoriteBtn.style.animation = `star 350ms ease-out`;
                this.favoriteBtn.addEventListener('animationend', () => this.favoriteBtn.removeAttribute('style'));
            })
            .catch((error) => {
                showErrorToast(error.message);
            })
    }

    pinMessage() {
        loaderRender();
        const prevPinned = document.querySelector('.pinned');
        if (prevPinned) {
            axios.post(`${config.baseUrl}/delete-pinned`, { apiKey: getCookie('api_key') })
                .then(() => {
                    prevPinned.remove();

                    axios.post(`${config.baseUrl}/pinned`, { apiKey: getCookie('api_key'), id: this.data.id, isPinned: true })
                        .then(() => {
                            const pinned = new Pinned({ ...this.data, isPinned: true });
                            pinned.render();
                        })
                        .catch((error) => {
                            showErrorToast(error.message);
                        })
                        .finally(() => {
                            loaderRemove();
                        })

                })
                .catch((error) => {
                    showErrorToast(error.message);
                })
        } else {
            axios.post(`${config.baseUrl}/pinned`, { apiKey: getCookie('api_key'), id: this.data.id, isPinned: true })
                .then(() => {
                    const pinned = new Pinned({ ...this.data, isPinned: true });
                    pinned.render();
                })
                .catch((error) => {
                    showErrorToast(error.message);
                })
                .finally(() => {
                    loaderRemove();
                })
        }
    }
}