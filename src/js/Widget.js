import WidgetAPI from "./WidgetAPI";
import Message from "./Message";
import { v4 as uuidv4 } from "uuid";
import "emoji-picker-element";
import language from "./lang";
import { setCookie, getCookie } from "./cookie";
import Pinned from "./Pinned";
import obj from "./obj";
import scrollToBottom from "./scrollToBottom";
import "simplebar/dist/simplebar.css";
import SimpleBar from "simplebar";
import FileContainer from "./FileContainer";

import ResizeObserver from "resize-observer-polyfill";

import catImg1 from "../img/amy-baugess-MNju0A6EeE0-unsplash.jpg";
import catImg2 from "../img/haley-owens-g1wr7lgGcX8-unsplash.jpg";
import catImg3 from "../img/kote-puerto-so5nsYDOdxw-unsplash.jpg";
import catImg4 from "../img/kristin-brown-MJymGVEazyY-unsplash.jpg";
import catImg5 from "../img/tran-mau-tri-tam-hhrp_SZTawc-unsplash.jpg";
import catImg6 from "../img/valentin-muller-vp79HHUIahQ-unsplash.jpg";

export default class Widget {
  constructor(element) {
    this.element = element;
    this.url = "http://localhost:7070";
    this.api = new WidgetAPI(this.url);
    this.loadedMessages = [];
  }

  bindToDOM() {
    this.list = this.element.querySelector(".main__messages");
    this.sendForm = this.element.querySelector(".main__form");
    this.input = this.element.querySelector(".main__input");
    this.pickEmojiBtn = this.element.querySelector(".main__pick-emoji");
    this.searchBtn = this.element.querySelector(".header__search-btn");
    this.searchForm = this.element.querySelector(".header__form");
    this.searchInput = this.element.querySelector(".header__input");
    this.inputContainer = this.element.querySelector(
      ".header__input-container"
    );
    this.fileUploadBtn = this.element.querySelector(".main__file-upload-btn");
    this.fileUploadContainerWrapper = this.element.querySelector(
      ".main__file-upload-container-wrapper"
    );
    this.fileUploadContainer = this.element.querySelector(
      ".main__file-upload-container"
    );
    this.fileUploadInput = this.element.querySelector(
      ".main__file-upload-input"
    );
    this.sendMessageWrapper = this.element.querySelector(
      ".main__send-message-wrapper"
    );
    this.scrolledDiv = this.element.querySelector(
      ".main__messages-scroll-wrapper"
    );
    this.sidebarBtn = this.element.querySelector(".header__sidebar-btn");
    this.sidebar = this.element.querySelector(".widget__aside-wrapper");
    this.closeSidebarBtn = this.element.querySelector(".aside__close");
    this.categories = this.element.querySelector(".aside__list");
    this.botName = this.element.querySelector(".header__bot-name");
    this.asideName = this.element.querySelector(".aside__name");
    this.favoritesCategoryBtn = this.element.querySelector(
      ".aside__favorites-item-btn"
    );
  }

  async init() {
    this.bindToDOM();
    this.addCustomScroll();
    this.initEventListeners();
    this.declareFocusedElement();

    await this.getMessages();
    this.loadMessages(this.messages);
    obj.categoryMessages = this.messages;
    for (const message of this.messages) {
      if (message.isPinned) {
        const newPinned = new Pinned(message, this.api, this.url);
        newPinned.render();
      }
    }

    this.fileContainer = new FileContainer(this.fileUploadContainerWrapper);
    this.renderCategories(this.messages);

    this.changeLanguage();

    document.addEventListener("click", (e) => {
      let target = e.target;
      if (!target.closest(".message__more-list") && !target.closest(".message__more-btn") && document.querySelector(".message__more-list")) {
        document.querySelector(".message__more-list").remove();
      }
    });
  }

  addCustomScroll() {
    window.ResizeObserver = ResizeObserver;

    const simpleBar = new SimpleBar(this.scrolledDiv);
    obj.simpleBarElement = simpleBar.getScrollElement();

    obj.simpleBarElement.addEventListener("scroll", () => {
      if (
        obj.simpleBarElement.scrollTop <= 30 &&
        obj.simpleBarElement.scrollTop !== 0
      ) {
        this.loadMoreMessages();
      }
    });
  }

  initEventListeners() {
    this.sendForm.addEventListener("submit", (e) => this.sendMessage(e));
    this.searchForm.addEventListener("submit", (e) => this.searchMessage(e));
    this.pickEmojiBtn.addEventListener("click", () => this.showEmoji());

    this.favoritesCategoryBtn.addEventListener("click", (e) =>
      this.onCategoryClick(e)
    );

    this.sidebarBtn.addEventListener("click", () => this.showSidebar());
    this.closeSidebarBtn.addEventListener("click", () => this.closeSidebar());

    const inputContainerWidth = this.inputContainer.clientWidth;
    this.inputContainer.style.maxWidth = "0px";
    this.searchBtn.addEventListener("click", () =>
      this.openSearch(inputContainerWidth)
    );
  }

  loadMessages(messages) {
    this.areAllVisible = false;
    if (messages.length !== 0) {
      if (messages.length < 10) {
        this.loadedMessagesLength = messages.length;

        for (const message of messages) {
          const newMessage = new Message(message, this.api, this.url);
          newMessage.render(this.list, "append");

          this.loadedMessages.push(message);

          if (obj.simpleBarElement) {
            obj.simpleBarElement.scrollTop = 31;
          }
        }
      } else {
        this.loadedMessagesLength = 10;

        const lastMessages = messages.slice(-this.loadedMessagesLength);

        for (const message of lastMessages) {
          const newMessage = new Message(message, this.api, this.url);
          newMessage.render(this.list, "append");

          this.loadedMessages.push(message);

          if (obj.simpleBarElement) {
            obj.simpleBarElement.scrollTop = 31;
          }
        }
      }
    } else {
      this.loadedMessagesLength = 0;
    }
  }

  loadMoreMessages() {
    this.loadedMessagesLength += 10;

    const visibleMessages = obj.categoryMessages.slice(
      -this.loadedMessagesLength
    );

    if (visibleMessages.length === obj.categoryMessages.length) {
      if (
        this.element.querySelectorAll(".message").length ===
        obj.categoryMessages.length
      ) {
        this.areAllVisible = true;
        return;
      }

      const lastMessagesNumber = Number(
        obj.categoryMessages.length.toString().split("").slice(-1)
      );

      if (lastMessagesNumber === 0) {
        const lastMessages = visibleMessages.slice(0, 10);
        for (const message of lastMessages.reverse()) {
          const newMessage = new Message(message, this.api, this.url);
          newMessage.render(this.list, "prepend");
        }
      } else {
        const lastMessages = visibleMessages.slice(0, lastMessagesNumber);
        for (const message of lastMessages.reverse()) {
          const newMessage = new Message(message, this.api, this.url);
          newMessage.render(this.list, "prepend");
        }
      }

      return;
    }

    const arr = visibleMessages.slice(0, 10);

    for (const item of arr.reverse()) {
      const newMessage = new Message(item, this.api, this.url);
      newMessage.render(this.list, "prepend");
    }
  }

  async getMessages() {
    const response = await this.api.getMessages();
    const messages = await response.json();
    this.messages = Array.from(messages);
  }

  declareFocusedElement() {
    this.searchInput.addEventListener("focus", (e) => {
      this.focusedElement = e.target;
    });

    this.input.addEventListener("focus", (e) => {
      this.focusedElement = e.target;
    });
  }

  changeLanguage() {
    if (getCookie("lang") == "eng") {
      this.botName.textContent = language.eng.botName;
      this.input.placeholder = language.eng.input;
      this.searchInput.placeholder = language.eng.searchInput;
      this.asideName.textContent = language.eng.categories;
      this.fileUploadContainer.querySelector(
        ".main__file-upload-container-text"
      ).innerHTML = `${language.eng.fileText.slice(
        0,
        18
      )}<span>${language.eng.fileText.slice(-13)}</span>`;
      this.favoritesCategoryBtn.querySelector(
        ".aside__favorites-item-text"
      ).textContent = `${this.favoriteMessages.length} favorite messages`;
      if (this.element.querySelector(".aside__videos-item-text")) {
        this.element.querySelector(
          ".aside__videos-item-text"
        ).textContent = `${this.videoMessages.length} video`;
      }
      if (this.element.querySelector(".aside__audios-item-text")) {
        this.element.querySelector(
          ".aside__audios-item-text"
        ).textContent = `${this.audioMessages.length} audio`;
      }
      if (this.element.querySelector(".aside__links-item-text")) {
        this.element.querySelector(
          ".aside__links-item-text"
        ).textContent = `${this.linkMessages.length} links`;
      }
      if (this.element.querySelector(".aside__texts-item-text")) {
        this.element.querySelector(
          ".aside__texts-item-text"
        ).textContent = `${this.textMessages.length} text messages`;
      }
      if (this.element.querySelector(".aside__images-item-text")) {
        this.element.querySelector(
          ".aside__images-item-text"
        ).textContent = `${this.imageMessages.length} images`;
      }
      if (this.element.querySelector(".aside__files-item-text")) {
        this.element.querySelector(
          ".aside__files-item-text"
        ).textContent = `${this.fileMessages.length} files`;
      }
      if (this.element.querySelector(".pinned__link")) {
        this.element.querySelector(".pinned__link").textContent =
          language.eng.pinnedMessage;
      }
    } else {
      this.botName.textContent = language.rus.botName;
      this.input.placeholder = language.rus.input;
      this.searchInput.placeholder = language.rus.searchInput;
      this.asideName.textContent = language.rus.categories;
      this.fileUploadContainer.querySelector(
        ".main__file-upload-container-text"
      ).innerHTML = `${language.rus.fileText.slice(
        0,
        23
      )}<span>${language.rus.fileText.slice(-11)}</span>`;
      this.favoritesCategoryBtn.querySelector(
        ".aside__favorites-item-text"
      ).textContent = `${this.favoriteMessages.length} избранных сообщений`;
      if (this.element.querySelector(".aside__videos-item-text")) {
        this.element.querySelector(
          ".aside__videos-item-text"
        ).textContent = `${this.videoMessages.length} видео`;
      }
      if (this.element.querySelector(".aside__audios-item-text")) {
        this.element.querySelector(
          ".aside__audios-item-text"
        ).textContent = `${this.audioMessages.length} аудио`;
      }
      if (this.element.querySelector(".aside__links-item-text")) {
        this.element.querySelector(
          ".aside__links-item-text"
        ).textContent = `${this.linkMessages.length} ссылок`;
      }
      if (this.element.querySelector(".aside__texts-item-text")) {
        this.element.querySelector(
          ".aside__texts-item-text"
        ).textContent = `${this.textMessages.length} текстовых сообщений`;
      }
      if (this.element.querySelector(".aside__images-item-text")) {
        this.element.querySelector(
          ".aside__images-item-text"
        ).textContent = `${this.imageMessages.length} изображений`;
      }
      if (this.element.querySelector(".aside__files-item-text")) {
        this.element.querySelector(
          ".aside__files-item-text"
        ).textContent = `${this.fileMessages.length} файлов`;
      }
      if (this.element.querySelector(".pinned__link")) {
        this.element.querySelector(".pinned__link").textContent =
          language.rus.pinnedMessage;
      }
    }
  }

  renderCategories(messages) {
    const videosArr = [];
    const linksArr = [];
    const audiosArr = [];
    const textsArr = [];
    const imagesArr = [];
    const filesArr = [];
    const favoritesArr = [];

    for (const message of messages) {
      if (message.type === "video") {
        videosArr.push(message);
      } else if (message.type === "link") {
        linksArr.push(message);
      } else if (message.type === "audio") {
        audiosArr.push(message);
      } else if (message.type === "image") {
        imagesArr.push(message);
      } else if (message.type === "file") {
        filesArr.push(message);
      } else {
        textsArr.push(message);
      }

      if (message.isFavorite) {
        favoritesArr.push(message);
      }
    }

    if (videosArr.length !== 0) {
      this.createVideosCategory(videosArr);
    }

    if (linksArr.length !== 0) {
      this.createLinksCategory(linksArr);
    }

    if (audiosArr.length !== 0) {
      this.createAudiosCategory(audiosArr);
    }

    if (imagesArr.length !== 0) {
      this.createImagesCategory(imagesArr);
    }

    if (filesArr.length !== 0) {
      this.createFilesCategory(filesArr);
    }

    if (textsArr.length !== 0) {
      this.createTextsCategory(textsArr);
    }

    this.videoMessages = videosArr;
    this.linkMessages = linksArr;
    this.audioMessages = audiosArr;
    this.textMessages = textsArr;
    this.imageMessages = imagesArr;
    this.fileMessages = filesArr;
    this.favoriteMessages = favoritesArr;
  }

  rerenderCategories(message) {
    const videosArr = [];
    const linksArr = [];
    const audiosArr = [];
    const textsArr = [];
    const imagesArr = [];
    const filesArr = [];

    for (const message of this.messages) {
      if (message.type === "video") {
        videosArr.push(message);
      }

      if (message.type === "link") {
        linksArr.push(message);
      }

      if (message.type === "audio") {
        audiosArr.push(message);
      }

      if (message.type === "image") {
        imagesArr.push(message);
      }

      if (message.type === "file") {
        filesArr.push(message);
      }

      if (message.type === "text") {
        textsArr.push(message);
      }
    }

    if (message.type === "video") {
      if (this.element.querySelector(".aside__videos-item-text")) {
        let text;
        if (getCookie("lang") == "eng") {
          text = "video";
        } else {
          text = "видео";
        }
        this.element.querySelector(
          ".aside__videos-item-text"
        ).textContent = `${videosArr.length} ${text}`;
      } else {
        this.createVideosCategory(videosArr);
      }
      this.videoMessages = videosArr;
    }

    if (message.type === "link") {
      if (this.element.querySelector(".aside__links-item-text")) {
        let text;
        if (getCookie("lang") == "eng") {
          text = "links";
        } else {
          text = "ссылок";
        }
        this.element.querySelector(
          ".aside__links-item-text"
        ).textContent = `${linksArr.length} ${text}`;
      } else {
        this.createLinksCategory(linksArr);
      }
      this.linkMessages = linksArr;
    }

    if (message.type === "audio") {
      if (this.element.querySelector(".aside__audios-item-text")) {
        let text;
        if (getCookie("lang") == "eng") {
          text = "audio";
        } else {
          text = "аудио";
        }
        this.element.querySelector(
          ".aside__audios-item-text"
        ).textContent = `${audiosArr.length} ${text}`;
      } else {
        this.createAudiosCategory(audiosArr);
      }
      this.audioMessages = audiosArr;
    }

    if (message.type === "text") {
      if (this.element.querySelector(".aside__texts-item-text")) {
        let text;
        if (getCookie("lang") == "eng") {
          text = "text messages";
        } else {
          text = "текстовых сообщений";
        }
        this.element.querySelector(
          ".aside__texts-item-text"
        ).textContent = `${textsArr.length} ${text}`;
      } else {
        this.createTextsCategory(textsArr);
      }
      this.textMessages = textsArr;
    }

    if (message.type === "image") {
      if (this.element.querySelector(".aside__images-item-text")) {
        let text;
        if (getCookie("lang") == "eng") {
          text = "images";
        } else {
          text = "изображений";
        }
        this.element.querySelector(
          ".aside__images-item-text"
        ).textContent = `${imagesArr.length} ${text}`;
      } else {
        this.createImagesCategory(imagesArr);
      }
      this.imageMessages = imagesArr;
    }

    if (message.type === "file") {
      if (this.element.querySelector(".aside__files-item-text")) {
        let text;
        if (getCookie("lang") == "eng") {
          text = "files";
        } else {
          text = "файлов";
        }
        this.element.querySelector(
          ".aside__files-item-text"
        ).textContent = `${filesArr.length} ${text}`;
      } else {
        this.createFilesCategory(filesArr);
      }
      this.fileMessages = filesArr;
    }
  }

  createVideosCategory(videos) {
    let text;
    if (getCookie("lang") == "eng") {
      text = "videos";
    } else {
      text = "видео";
    }

    const videosLi = document.createElement("li");
    videosLi.className = "aside__item";
    const videosBtn = document.createElement("button");
    videosBtn.className = "aside__item-btn aside__videos-item-btn";
    videosBtn.type = "button";
    videosBtn.innerHTML = `
    <svg class="aside__item-svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 10L18.5768 8.45392C19.3699 7.97803 19.7665 7.74009 20.0928 7.77051C20.3773 7.79703 20.6369 7.944 20.806 8.17433C21 8.43848 21 8.90095 21 9.8259V14.1741C21 15.099 21 15.5615 20.806 15.8257C20.6369 16.056 20.3773 16.203 20.0928 16.2295C19.7665 16.2599 19.3699 16.022 18.5768 15.5461L16 14M6.2 18H12.8C13.9201 18 14.4802 18 14.908 17.782C15.2843 17.5903 15.5903 17.2843 15.782 16.908C16 16.4802 16 15.9201 16 14.8V9.2C16 8.0799 16 7.51984 15.782 7.09202C15.5903 6.71569 15.2843 6.40973 14.908 6.21799C14.4802 6 13.9201 6 12.8 6H6.2C5.0799 6 4.51984 6 4.09202 6.21799C3.71569 6.40973 3.40973 6.71569 3.21799 7.09202C3 7.51984 3 8.07989 3 9.2V14.8C3 15.9201 3 16.4802 3.21799 16.908C3.40973 17.2843 3.71569 17.5903 4.09202 17.782C4.51984 18 5.07989 18 6.2 18Z" stroke="#ABABAB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="aside__item-text aside__videos-item-text">${videos.length} ${text}</span>`;

    this.categories.append(videosLi);
    videosLi.append(videosBtn);

    videosBtn.addEventListener("click", (e) => this.onCategoryClick(e));
  }

  createLinksCategory(links) {
    let text;
    if (getCookie("lang") == "eng") {
      text = "links";
    } else {
      text = "ссылок";
    }

    const linksLi = document.createElement("li");
    linksLi.className = "aside__item";
    const linksBtn = document.createElement("button");
    linksBtn.className = "aside__item-btn aside__links-item-btn";
    linksBtn.type = "button";
    linksBtn.innerHTML = `
    <svg class="aside__item-svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 12C14 14.7614 11.7614 17 9 17H7C4.23858 17 2 14.7614 2 12C2 9.23858 4.23858 7 7 7H7.5M10 12C10 9.23858 12.2386 7 15 7H17C19.7614 7 22 9.23858 22 12C22 14.7614 19.7614 17 17 17H16.5" stroke="#ABABAB" stroke-width="2" stroke-linecap="round"/>
    </svg>
    <span class="aside__item-text aside__links-item-text">${links.length} ${text}</span>`;

    this.categories.append(linksLi);
    linksLi.append(linksBtn);

    linksBtn.addEventListener("click", (e) => this.onCategoryClick(e));
  }

  createAudiosCategory(audios) {
    let text;
    if (getCookie("lang") == "eng") {
      text = "audio";
    } else {
      text = "аудио";
    }

    const audiosLi = document.createElement("li");
    audiosLi.className = "aside__item";
    const audiosBtn = document.createElement("button");
    audiosBtn.className = "aside__item-btn aside__audios-item-btn";
    audiosBtn.type = "button";
    audiosBtn.innerHTML = `
    <svg class="aside__item-svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path id="Vector" d="M19 11C19 7.13401 15.866 4 12 4C8.13401 4 5 7.13401 5 11M16 14.5V16.5C16 16.9647 16 17.197 16.0384 17.3902C16.1962 18.1836 16.8165 18.8041 17.6099 18.9619C17.8031 19.0003 18.0353 19.0003 18.5 19.0003C18.9647 19.0003 19.197 19.0003 19.3902 18.9619C20.1836 18.8041 20.8036 18.1836 20.9614 17.3902C20.9999 17.197 21 16.9647 21 16.5V14.5C21 14.0353 20.9999 13.8026 20.9614 13.6094C20.8036 12.816 20.1836 12.1962 19.3902 12.0384C19.197 12 18.9647 12 18.5 12C18.0353 12 17.8031 12 17.6099 12.0384C16.8165 12.1962 16.1962 12.816 16.0384 13.6094C16 13.8026 16 14.0353 16 14.5ZM8 14.5V16.5C8 16.9647 7.99986 17.197 7.96143 17.3902C7.80361 18.1836 7.18352 18.8041 6.39014 18.9619C6.19694 19.0003 5.96469 19.0003 5.50004 19.0003C5.03539 19.0003 4.80306 19.0003 4.60986 18.9619C3.81648 18.8041 3.19624 18.1836 3.03843 17.3902C3 17.197 3 16.9647 3 16.5V14.5C3 14.0353 3 13.8026 3.03843 13.6094C3.19624 12.816 3.81648 12.1962 4.60986 12.0384C4.80306 12 5.03539 12 5.50004 12C5.9647 12 6.19694 12 6.39014 12.0384C7.18352 12.1962 7.80361 12.816 7.96143 13.6094C7.99986 13.8026 8 14.0353 8 14.5Z" stroke="#ABABAB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="aside__item-text aside__audios-item-text">${audios.length} ${text}</span>`;

    this.categories.append(audiosLi);
    audiosLi.append(audiosBtn);

    audiosBtn.addEventListener("click", (e) => this.onCategoryClick(e));
  }

  createImagesCategory(images) {
    let text;
    if (getCookie("lang") == "eng") {
      text = "images";
    } else {
      text = "изображений";
    }

    const imagesLi = document.createElement("li");
    imagesLi.className = "aside__item";
    const imagesBtn = document.createElement("button");
    imagesBtn.className = "aside__item-btn aside__images-item-btn";
    imagesBtn.type = "button";
    imagesBtn.innerHTML = `
    <svg class="aside__item-svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.2639 15.9375L12.5958 14.2834C11.7909 13.4851 11.3884 13.086 10.9266 12.9401C10.5204 12.8118 10.0838 12.8165 9.68048 12.9536C9.22188 13.1095 8.82814 13.5172 8.04068 14.3326L4.04409 18.2801M14.2639 15.9375L14.6053 15.599C15.4112 14.7998 15.8141 14.4002 16.2765 14.2543C16.6831 14.126 17.12 14.1311 17.5236 14.2687C17.9824 14.4251 18.3761 14.8339 19.1634 15.6514L20 16.4934M14.2639 15.9375L18.275 19.9565M18.275 19.9565C17.9176 20 17.4543 20 16.8 20H7.2C6.07989 20 5.51984 20 5.09202 19.782C4.71569 19.5903 4.40973 19.2843 4.21799 18.908C4.12796 18.7313 4.07512 18.5321 4.04409 18.2801M18.275 19.9565C18.5293 19.9256 18.7301 19.8727 18.908 19.782C19.2843 19.5903 19.5903 19.2843 19.782 18.908C20 18.4802 20 17.9201 20 16.8V16.4934M4.04409 18.2801C4 17.9221 4 17.4575 4 16.8V7.2C4 6.0799 4 5.51984 4.21799 5.09202C4.40973 4.71569 4.71569 4.40973 5.09202 4.21799C5.51984 4 6.07989 4 7.2 4H16.8C17.9201 4 18.4802 4 18.908 4.21799C19.2843 4.40973 19.5903 4.71569 19.782 5.09202C20 5.51984 20 6.0799 20 7.2V16.4934M17 8.99989C17 10.1045 16.1046 10.9999 15 10.9999C13.8954 10.9999 13 10.1045 13 8.99989C13 7.89532 13.8954 6.99989 15 6.99989C16.1046 6.99989 17 7.89532 17 8.99989Z" stroke="#ABABAB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="aside__item-text aside__images-item-text">${images.length} ${text}</span>`;

    this.categories.append(imagesLi);
    imagesLi.append(imagesBtn);

    imagesBtn.addEventListener("click", (e) => this.onCategoryClick(e));
  }

  createFilesCategory(files) {
    let text;
    if (getCookie("lang") == "eng") {
      text = "files";
    } else {
      text = "файлов";
    }

    const filesLi = document.createElement("li");
    filesLi.className = "aside__item";
    const filesBtn = document.createElement("button");
    filesBtn.className = "aside__item-btn aside__files-item-btn";
    filesBtn.type = "button";
    filesBtn.innerHTML = `
    <svg class="aside__item-svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 9V17.8C19 18.9201 19 19.4802 18.782 19.908C18.5903 20.2843 18.2843 20.5903 17.908 20.782C17.4802 21 16.9201 21 15.8 21H8.2C7.07989 21 6.51984 21 6.09202 20.782C5.71569 20.5903 5.40973 20.2843 5.21799 19.908C5 19.4802 5 18.9201 5 17.8V6.2C5 5.07989 5 4.51984 5.21799 4.09202C5.40973 3.71569 5.71569 3.40973 6.09202 3.21799C6.51984 3 7.0799 3 8.2 3H13M19 9L13 3M19 9H14C13.4477 9 13 8.55228 13 8V3" stroke="#ABABAB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="aside__item-text aside__files-item-text">${files.length} ${text}</span>`;

    this.categories.append(filesLi);
    filesLi.append(filesBtn);

    filesBtn.addEventListener("click", (e) => this.onCategoryClick(e));
  }

  createTextsCategory(texts) {
    let text;
    if (getCookie("lang") == "eng") {
      text = "text messages";
    } else {
      text = "текстовых сообщений";
    }

    const textsLi = document.createElement("li");
    textsLi.className = "aside__item";
    const textsBtn = document.createElement("button");
    textsBtn.className = "aside__item-btn aside__texts-item-btn";
    textsBtn.type = "button";
    textsBtn.innerHTML = `
    <svg class="aside__item-svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path id="Vector" d="M4 18H14M4 14H20M4 10H14M4 6H20" stroke="#ABABAB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="aside__item-text aside__texts-item-text">${texts.length} ${text}</span>`;

    this.categories.append(textsLi);
    textsLi.append(textsBtn);

    textsBtn.addEventListener("click", (e) => this.onCategoryClick(e));
  }

  async onCategoryClick(e) {
    let target = e.target;

    this.element
      .querySelectorAll(".message")
      .forEach((message) => message.remove());
    this.loadedMessages = [];

    if (
      target
        .closest(".aside__item-btn")
        .querySelector(".aside__item-text")
        .classList.contains("aside__item-text_clicked")
    ) {
      target
        .closest(".aside__item-btn")
        .querySelector(".aside__item-svg")
        .classList.remove("aside__item-svg_clicked");
      target
        .closest(".aside__item-btn")
        .querySelector(".aside__item-text")
        .classList.remove("aside__item-text_clicked");

      obj.categoryMessages = this.messages;
      this.loadMessages(this.messages);

      this.activeCategory = null;
      return;
    } else {
      if (this.element.querySelector(".aside__item-svg_clicked")) {
        this.element
          .querySelector(".aside__item-svg_clicked")
          .classList.remove("aside__item-svg_clicked");
      }

      if (this.element.querySelector(".aside__item-text_clicked")) {
        this.element
          .querySelector(".aside__item-text_clicked")
          .classList.remove("aside__item-text_clicked");
      }
    }

    target
      .closest(".aside__item-btn")
      .querySelector(".aside__item-svg")
      .classList.add("aside__item-svg_clicked");
    target
      .closest(".aside__item-btn")
      .querySelector(".aside__item-text")
      .classList.add("aside__item-text_clicked");

    if (target.closest(".aside__videos-item-btn")) {
      obj.categoryMessages = this.videoMessages;
      this.loadMessages(this.videoMessages);

      this.activeCategory = "video";
    } else if (target.closest(".aside__audios-item-btn")) {
      obj.categoryMessages = this.audioMessages;
      this.loadMessages(this.audioMessages);

      this.activeCategory = "audio";
    } else if (target.closest(".aside__links-item-btn")) {
      obj.categoryMessages = this.linkMessages;
      this.loadMessages(this.linkMessages);

      this.activeCategory = "link";
    } else if (target.closest(".aside__images-item-btn")) {
      obj.categoryMessages = this.imageMessages;
      this.loadMessages(this.imageMessages);

      this.activeCategory = "image";
    } else if (target.closest(".aside__files-item-btn")) {
      obj.categoryMessages = this.fileMessages;
      this.loadMessages(this.fileMessages);

      this.activeCategory = "file";
    } else if (target.closest(".aside__favorites-item-btn")) {
      await this.getMessages();

      const favoriteMessages = [];

      for (const message of this.messages) {
        if (message.isFavorite) {
          favoriteMessages.push(message);
        }
      }

      this.favoriteMessages = favoriteMessages;

      obj.categoryMessages = this.favoriteMessages;

      this.loadMessages(this.favoriteMessages);

      this.activeCategory = "favorite";
    } else {
      obj.categoryMessages = this.textMessages;
      this.loadMessages(this.textMessages);

      this.activeCategory = "text";
    }
  }

  showSidebar() {
    this.sidebar.classList.add("widget__aside-wrapper_opened");

    this.sidebarBtn.querySelector("rect").classList.add("sidebar-opened");
    this.sidebarBtn.querySelector("line").classList.add("sidebar-opened");
  }

  closeSidebar() {
    this.sidebar.classList.remove("widget__aside-wrapper_opened");

    this.sidebarBtn.querySelector("rect").classList.remove("sidebar-opened");
    this.sidebarBtn.querySelector("line").classList.remove("sidebar-opened");
  }

  openSearch(width) {
    this.inputContainer.style.maxWidth = width + "px";
    this.inputContainer.classList.remove("header__input-container_hidden");

    this.searchBtn.classList.add("header__search-btn_opened");

    const changeBtnType = () => {
      this.searchBtn.type = "submit";
    };

    setTimeout(changeBtnType, 200);

    document.addEventListener("click", (e) => {
      let target = e.target;
      if (
        !target.closest(".header__form") &&
        !target.closest(".message") &&
        !this.element.querySelector(".main__emoji-picker-wrapper") &&
        !target.closest(".main__emoji-picker")
      ) {
        this.inputContainer.style.maxWidth = "0px";
        this.inputContainer.classList.add("header__input-container_hidden");
        this.searchBtn.classList.remove("header__search-btn_opened");
        this.searchBtn.type = "button";
      }
    });
  }

  async searchMessage(e) {
    e.preventDefault();

    const response = await this.api.search({
      str: this.searchInput.value.trim(),
    });
    this.element
      .querySelectorAll(".message")
      .forEach((message) => message.remove());
    this.loadedMessages = [];

    if (response.ok) {
      const searchedMessages = await response.json();

      if (this.searchInput.value.trim() === "") {
        if (this.activeCategory) {
          const messages = [];
          for (const message of this.messages) {
            if (
              message.type === this.activeCategory &&
              this.activeCategory !== "favorite"
            ) {
              messages.push(message);
            } else if (
              message.isFavorite &&
              this.activeCategory === "favorite"
            ) {
              messages.push(message);
            }
          }
          obj.categoryMessages = messages;
          this.loadMessages(messages);
        } else {
          await this.getMessages();

          obj.categoryMessages = this.messages;
          this.loadMessages(this.messages);
        }
      } else {
        if (this.activeCategory) {
          if (searchedMessages.length !== 0) {
            const messages = [];
            for (const message of searchedMessages) {
              if (
                message.type === this.activeCategory &&
                this.activeCategory !== "favorite"
              ) {
                messages.push(message);
              } else if (
                message.isFavorite &&
                this.activeCategory === "favorite"
              ) {
                messages.push(message);
              }
            }
            obj.categoryMessages = messages;
            this.loadMessages(messages);
          }
        } else {
          if (searchedMessages.length !== 0) {
            obj.categoryMessages = searchedMessages;
            this.loadMessages(searchedMessages);
          }
        }
      }
    }
  }

  showEmoji() {
    if (this.element.querySelector(".main__emoji-picker-wrapper")) {
      this.element.querySelector(".main__emoji-picker-wrapper").remove();
    } else {
      if (this.focusedElement) {
        this.focusedElement.focus();
      }

      const emojiPickerWrapper = document.createElement("div");
      emojiPickerWrapper.classList.add("main__emoji-picker-wrapper");

      const emojiPicker = document.createElement("emoji-picker");
      emojiPicker.classList.add("light");

      this.sendForm.append(emojiPickerWrapper);
      emojiPickerWrapper.append(emojiPicker);

      emojiPicker.addEventListener("emoji-click", (obj) => {
        if (this.focusedElement === this.searchInput) {
          this.searchInput.value += obj.detail.unicode;
        } else {
          this.focusedElement = this.input;
          this.input.value += obj.detail.unicode;
        }

        this.focusedElement.focus();
      });

      document.addEventListener("click", (e) => {
        let target = e.target;
        if (
          !target.closest(".main__emoji-picker-wrapper") &&
          !target.closest(".main__pick-emoji") &&
          !target.closest(".header__form") &&
          !target.closest(".main__input")
        ) {
          emojiPickerWrapper.remove();
        }
      });
    }
  }

  async sendMessage(e) {
    e.preventDefault();

    let text;
    let author;
    let type;
    let file;

    if (this.input.value.trim().startsWith("@chaos")) {
      author = "bot";
      if (
        this.input.value.trim() === "@chaos: погода" ||
        this.input.value.trim() === "@chaos: weather"
      ) {
        const randomNumber = Math.floor(Math.random() * 5);
        if (getCookie("lang") == "eng") {
          text = language.eng.weather[randomNumber];
        } else {
          text = language.rus.weather[randomNumber];
        }
      } else if (
        this.input.value.trim() === "@chaos: кот" ||
        this.input.value.trim() === "@chaos: cat"
      ) {
        const cats = [catImg1, catImg2, catImg3, catImg4, catImg5, catImg6];
        const randomNumber = Math.floor(Math.random() * 5);

        file = cats[randomNumber];
      } else if (
        this.input.value.trim() === "@chaos: english" ||
        this.input.value.trim() === "@chaos: russian" ||
        this.input.value.trim() === "@chaos: английский" ||
        this.input.value.trim() === "@chaos: русский"
      ) {
        if (
          this.input.value.trim() === "@chaos: english" &&
          getCookie("lang") == "eng"
        ) {
          this.showError("The page is already in english.");
          return;
        } else if (
          this.input.value.trim() === "@chaos: russian" &&
          getCookie("lang") == "eng"
        ) {
          setCookie("lang", "rus");
          text = "Язык сменен на русский.";
        } else if (
          this.input.value.trim() === "@chaos: английский" &&
          getCookie("lang") == "rus"
        ) {
          setCookie("lang", "eng");
          text = "Language changed to english.";
        } else if (
          this.input.value.trim() === "@chaos: русский" &&
          getCookie("lang") == "rus"
        ) {
          this.showError("Страница уже на русском.");
          return;
        }
        this.changeLanguage();
      } else if (
        this.input.value.trim() === "@chaos: помощь" ||
        this.input.value.trim() === "@chaos: help"
      ) {
        if (getCookie("lang") == "eng") {
          text = language.eng.botHelpResponse;
        } else {
          text = language.rus.botHelpResponse;
        }
      } else if (
        this.input.value.trim() === "@chaos: удалить все" ||
        this.input.value.trim() === "@chaos: delete all"
      ) {
        const response = await this.api.deleteAll();

        if (response.ok) {
          this.element
            .querySelectorAll(".message")
            .forEach((message) => message.remove());
          this.element.querySelectorAll(".aside__item").forEach((item) => {
            if (
              !item.querySelector(".aside__favorites-item-btn") &&
              !item.querySelector(".aside__texts-item-btn")
            ) {
              item.remove();
            }
          });
          await this.getMessages();
          obj.categoryMessages = this.messages;
          this.activeCategory = null;
          this.textMessages = [];
          this.linkMessages = [];
          this.imageMessages = [];
          this.textMessages = [];
          this.videoMessages = [];
          this.fileMessages = [];
          this.favoriteMessages = [];
          this.areAllVisible = false;
          if (getCookie("lang") == "eng") {
            text = language.eng.botDeleteResponse;
          } else {
            text = language.rus.botDeleteResponse;
          }
        }
      } else {
        this.showError(
          "Такой команды не существует. Введите @chaos: help, чтобы увидеть полный список всех доступных команд."
        );
        return;
      }
    } else {
      author = "user";
      text = this.input.value.trim();
    }

    if (!obj.uploadedFile) {
      if (author === "user") {
        if (
          new RegExp(
            "([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?"
          ).test(text)
        ) {
          type = "link";
        } else {
          type = "text";
        }
      } else if (author === "bot") {
        if (file) {
          type = "image";
        } else {
          type = "text";
        }
      }
    } else {
      if (obj.uploadedFile.type.startsWith("video")) {
        type = "video";
      } else if (obj.uploadedFile.type.startsWith("audio")) {
        type = "audio";
      } else if (obj.uploadedFile.type.startsWith("image")) {
        type = "image";
      } else {
        type = "file";
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

    if (this.input.value.trim() === "") {
      if (newMessageData.type === "text") {
        if (getCookie("lang") == "eng") {
          this.showError(language.eng.emptyError);
        } else {
          this.showError(language.rus.emptyError);
        }
        return;
      }
    } else if (this.input.value.trim() !== "") {
      if (newMessageData.type === "link" || newMessageData.type === "text") {
        newMessageData.text = text;
      }
    }

    if (newMessageData.type === "file") {
      newMessageData.size = obj.uploadedFile.size;
    }

    if (newMessageData.author === "bot" && newMessageData.type === "image") {
      newMessageData.file = file;
    }

    if (obj.uploadedFile) {
      newMessageData.file = obj.uploadedFile.name;

      const formData = new FormData();
      formData.append("file", obj.uploadedFile);
      await this.api.upload(formData);
    }

    const response = await this.api.send(newMessageData);

    if (response.ok) {
      if (this.element.querySelector(".error")) {
        this.element.querySelector(".error").remove();
      }

      await this.getMessages();

      if (newMessageData.type === this.activeCategory || !this.activeCategory) {
        const newMessage = new Message(newMessageData, this.api, this.url);
        newMessage.render(this.list, "append");
      }

      obj.categoryMessages.push(newMessageData);

      if (this.loadedMessagesLength < 10) {
        this.loadedMessagesLength += 1;
      }

      if (
        this.element.querySelectorAll(".message").length > 10 &&
        !this.areAllVisible
      ) {
        this.list.firstChild.remove();
      }

      this.rerenderCategories(newMessageData);

      this.sendForm.reset();

      if (this.list.lastChild.querySelector("video")) {
        this.list.lastChild
          .querySelector("video")
          .addEventListener(
            "loadedmetadata",
            scrollToBottom(obj.simpleBarElement)
          );
      } else if (this.list.lastChild.querySelector("img")) {
        this.list.lastChild
          .querySelector("img")
          .addEventListener("load", scrollToBottom(obj.simpleBarElement));
      } else {
        scrollToBottom(obj.simpleBarElement);
      }

      if (obj.uploadedFile) {
        this.fileUploadInput.value = "";
        obj.uploadedFile = null;

        this.fileUploadContainerWrapper.classList.remove(
          "main__file-upload-container-wrapper_opened"
        );
        this.fileUploadContainerWrapper.classList.add(
          "main__file-upload-container-wrapper_hidden"
        );
        this.fileUploadContainerWrapper.removeAttribute("style");
        this.sendMessageWrapper.classList.remove(
          "main__send-message-wrapper_container"
        );
        this.fileUploadBtn
          .querySelector(".main__close-file-container-svg-path")
          .classList.add("hidden");
        this.fileUploadBtn
          .querySelector(".main__open-file-container-svg-path")
          .classList.remove("hidden");
        this.element
          .querySelector(".main__file-upload-container-filename")
          .remove();
        this.input.classList.remove("hidden");
        this.fileUploadContainer.classList.add("hidden");
      }
    }
  }

  showError(text) {
    if (this.element.querySelector(".error")) {
      this.element.querySelector(".error").remove();
    }

    const error = document.createElement("span");
    error.classList.add("error");

    error.textContent = text;

    this.input.after(error);
  }
}
