import state from "./state";
import {createVideosCategory, createLinksCategory, createAudiosCategory, createImagesCategory, createFilesCategory, createTextsCategory} from './createCategory';
import onCategoryClick from "./onCategoryClick";

export default class Sidebar {
  constructor(element, api, url) {
    this.element = element;
    this.api = api;
    this.url = url;

    this.init();
  }

  bindToDom() {
    this.list = document.querySelector(".main__messages");
    this.sidebarBtn = document.querySelector(".header__sidebar-btn");
    this.closeBtn = this.element.querySelector(".aside__close");
    this.categories = this.element.querySelector(".aside__list");
    this.favoritesCategoryBtn = this.element.querySelector(
      ".aside__favorites-item-btn"
    );
  }

  init() {
    this.bindToDom();

    this.favoritesCategoryBtn.addEventListener("click", (e) =>
      onCategoryClick(e, this.api, this.url, this.list, this.element)
    );

    this.sidebarBtn.addEventListener("click", () => this.show());
    this.closeBtn.addEventListener("click", () => this.close());

    this.renderCategories(state.messages);
  }

  async getMessages() {
    const response = await this.api.getMessages();
    const messages = await response.json();
    state.messages = Array.from(messages);
  }

  show() {
    this.element.classList.add("widget__aside-wrapper_opened");

    this.sidebarBtn.querySelector("rect").classList.add("sidebar-opened");
    this.sidebarBtn.querySelector("line").classList.add("sidebar-opened");
  }

  close() {
    this.element.classList.remove("widget__aside-wrapper_opened");

    this.sidebarBtn.querySelector("rect").classList.remove("sidebar-opened");
    this.sidebarBtn.querySelector("line").classList.remove("sidebar-opened");
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
      createVideosCategory(videosArr, this.categories, this.api, this.url, this.list, this.element);
    }

    if (linksArr.length !== 0) {
      createLinksCategory(linksArr, this.categories, this.api, this.url, this.list, this.element);
    }

    if (audiosArr.length !== 0) {
      createAudiosCategory(audiosArr, this.categories, this.api, this.url, this.list, this.element);
    }

    if (imagesArr.length !== 0) {
      createImagesCategory(imagesArr, this.categories, this.api, this.url, this.list, this.element);
    }

    if (filesArr.length !== 0) {
      createFilesCategory(filesArr, this.categories, this.api, this.url, this.list, this.element);
    }

    if (textsArr.length !== 0) {
      createTextsCategory(textsArr, this.categories, this.api, this.url, this.list, this.element);
    }

    state.videoMessages = videosArr;
    state.linkMessages = linksArr;
    state.audioMessages = audiosArr;
    state.textMessages = textsArr;
    state.imageMessages = imagesArr;
    state.fileMessages = filesArr;
    state.favoriteMessages = favoritesArr;
  }
}
