import WidgetAPI from "./WidgetAPI";
import Message from "./Message";
import { v4 as uuidv4 } from "uuid";
import "emoji-picker-element";
import language from "./lang";
import { setCookie, getCookie } from "./cookie";
import Pinned from "./Pinned";
import state from "./state";
import scrollToBottom from "./scrollToBottom";
import "simplebar/dist/simplebar.css";
import SimpleBar from "simplebar";
import FileContainer from "./FileContainer";
import SearchForm from "./SearchForm";
import Sidebar from "./Sidebar";
import loadMessages from "./loadMessages";
import {createVideosCategory, createLinksCategory, createAudiosCategory, createImagesCategory, createFilesCategory, createTextsCategory} from './createCategory';

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
    this.url = "https://chaos-organizer-eoxz.onrender.com";
    this.api = new WidgetAPI(this.url);
  }

  bindToDOM() {
    this.list = this.element.querySelector(".main__messages");
    this.sendForm = this.element.querySelector(".main__form");
    this.input = this.element.querySelector(".main__input");
    this.pickEmojiBtn = this.element.querySelector(".main__pick-emoji");
    this.searchFormElement = this.element.querySelector(".header__form");
    this.searchInput = this.element.querySelector(".header__input");
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
    
    this.sidebarElement = this.element.querySelector(".widget__aside-wrapper");
    this.botName = this.element.querySelector(".header__bot-name");
    this.asideName = this.element.querySelector(".aside__name");
    this.favoritesCategoryBtn = this.element.querySelector(
      ".aside__favorites-item-btn"
    );
  }

  async init() {
    this.bindToDOM();
    this.addCustomScroll();
    this.sendForm.addEventListener("submit", (e) => this.sendMessage(e));
    this.pickEmojiBtn.addEventListener("click", () => this.showEmoji());
    this.declareFocusedElement();

    await this.getMessages();
    loadMessages(state.messages, this.api, this.url, this.list);
    state.categoryMessages = state.messages;
    for (const message of state.messages) {
      if (message.isPinned) {
        const newPinned = new Pinned(message, this.api, this.url);
        newPinned.render();
      }
    }

    this.fileContainer = new FileContainer(this.fileUploadContainerWrapper);
    this.searchForm = new SearchForm(this.searchFormElement, this.api, this.url);
    this.sidebar = new Sidebar(this.sidebarElement, this.api, this.url);

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
    state.simpleBarElement = simpleBar.getScrollElement();

    state.simpleBarElement.addEventListener("scroll", () => {
      if (
        state.simpleBarElement.scrollTop <= 30 &&
        state.simpleBarElement.scrollTop !== 0
      ) {
        this.loadMoreMessages();
      }
    });
  }

  loadMoreMessages() {
    state.loadedMessagesLength += 10;

    const visibleMessages = state.categoryMessages.slice(
      -state.loadedMessagesLength
    );

    if (visibleMessages.length === state.categoryMessages.length) {
      if (
        this.element.querySelectorAll(".message").length ===
        state.categoryMessages.length
      ) {
        state.areAllVisible = true;
        return;
      }

      const lastMessagesNumber = Number(
        state.categoryMessages.length.toString().split("").slice(-1)
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
    state.messages = Array.from(messages);
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
      ).textContent = `${state.favoriteMessages.length} favorite messages`;
      if (this.element.querySelector(".aside__videos-item-text")) {
        this.element.querySelector(
          ".aside__videos-item-text"
        ).textContent = `${state.videoMessages.length} video`;
      }
      if (this.element.querySelector(".aside__audios-item-text")) {
        this.element.querySelector(
          ".aside__audios-item-text"
        ).textContent = `${state.audioMessages.length} audio`;
      }
      if (this.element.querySelector(".aside__links-item-text")) {
        this.element.querySelector(
          ".aside__links-item-text"
        ).textContent = `${state.linkMessages.length} links`;
      }
      if (this.element.querySelector(".aside__texts-item-text")) {
        this.element.querySelector(
          ".aside__texts-item-text"
        ).textContent = `${state.textMessages.length} text messages`;
      }
      if (this.element.querySelector(".aside__images-item-text")) {
        this.element.querySelector(
          ".aside__images-item-text"
        ).textContent = `${state.imageMessages.length} images`;
      }
      if (this.element.querySelector(".aside__files-item-text")) {
        this.element.querySelector(
          ".aside__files-item-text"
        ).textContent = `${state.fileMessages.length} files`;
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
      ).textContent = `${state.favoriteMessages.length} избранных сообщений`;
      if (this.element.querySelector(".aside__videos-item-text")) {
        this.element.querySelector(
          ".aside__videos-item-text"
        ).textContent = `${state.videoMessages.length} видео`;
      }
      if (this.element.querySelector(".aside__audios-item-text")) {
        this.element.querySelector(
          ".aside__audios-item-text"
        ).textContent = `${state.audioMessages.length} аудио`;
      }
      if (this.element.querySelector(".aside__links-item-text")) {
        this.element.querySelector(
          ".aside__links-item-text"
        ).textContent = `${state.linkMessages.length} ссылок`;
      }
      if (this.element.querySelector(".aside__texts-item-text")) {
        this.element.querySelector(
          ".aside__texts-item-text"
        ).textContent = `${state.textMessages.length} текстовых сообщений`;
      }
      if (this.element.querySelector(".aside__images-item-text")) {
        this.element.querySelector(
          ".aside__images-item-text"
        ).textContent = `${state.imageMessages.length} изображений`;
      }
      if (this.element.querySelector(".aside__files-item-text")) {
        this.element.querySelector(
          ".aside__files-item-text"
        ).textContent = `${state.fileMessages.length} файлов`;
      }
      if (this.element.querySelector(".pinned__link")) {
        this.element.querySelector(".pinned__link").textContent =
          language.rus.pinnedMessage;
      }
    }
  }

  rerenderCategories(message) {
    const videosArr = [];
    const linksArr = [];
    const audiosArr = [];
    const textsArr = [];
    const imagesArr = [];
    const filesArr = [];

    for (const message of state.messages) {
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
        createVideosCategory(videosArr);
      }
      state.videoMessages = videosArr;
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
        createLinksCategory(linksArr);
      }
      state.linkMessages = linksArr;
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
        createAudiosCategory(audiosArr);
      }
      state.audioMessages = audiosArr;
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
        createTextsCategory(textsArr);
      }
      state.textMessages = textsArr;
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
        createImagesCategory(imagesArr);
      }
      state.imageMessages = imagesArr;
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
        createFilesCategory(filesArr);
      }
      state.fileMessages = filesArr;
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
          state.categoryMessages = state.messages;
          state.activeCategory = null;
          state.textMessages = [];
          state.linkMessages = [];
          state.imageMessages = [];
          state.textMessages = [];
          state.videoMessages = [];
          state.fileMessages = [];
          state.favoriteMessages = [];
          state.areAllVisible = false;
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

    if (!state.uploadedFile) {
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
      if (state.uploadedFile.type.startsWith("video")) {
        type = "video";
      } else if (state.uploadedFile.type.startsWith("audio")) {
        type = "audio";
      } else if (state.uploadedFile.type.startsWith("image")) {
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
      newMessageData.size = state.uploadedFile.size;
    }

    if (newMessageData.author === "bot" && newMessageData.type === "image") {
      newMessageData.file = file;
    }

    if (state.uploadedFile) {
      newMessageData.file = state.uploadedFile.name;

      const formData = new FormData();
      formData.append("file", state.uploadedFile);
      await this.api.upload(formData);
    }

    const response = await this.api.send(newMessageData);

    if (response.ok) {
      if (this.element.querySelector(".error")) {
        this.element.querySelector(".error").remove();
      }

      await this.getMessages();

      if (newMessageData.type === state.activeCategory || !state.activeCategory) {
        const newMessage = new Message(newMessageData, this.api, this.url);
        newMessage.render(this.list, "append");
      }

      state.categoryMessages.push(newMessageData);

      if (state.loadedMessagesLength < 10) {
        state.loadedMessagesLength += 1;
      }

      if (
        this.element.querySelectorAll(".message").length > 10 &&
        !state.areAllVisible
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
            scrollToBottom(state.simpleBarElement)
          );
      } else if (this.list.lastChild.querySelector("img")) {
        this.list.lastChild
          .querySelector("img")
          .addEventListener("load", scrollToBottom(state.simpleBarElement));
      } else {
        scrollToBottom(state.simpleBarElement);
      }

      if (state.uploadedFile) {
        this.fileUploadInput.value = "";
        state.uploadedFile = null;

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
