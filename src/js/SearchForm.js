import loadMessages from "./loadMessages";
import state from "./state";

export default class SearchForm {
  constructor(element, api, url) {
    this.element = element;
    this.api = api;
    this.url = url;

    this.init()
  }

  bindToDOM() {
    this.list = document.querySelector(".main__messages");
    this.btn = this.element.querySelector(".header__search-btn");
    this.searchInput = this.element.querySelector(".header__input");
    this.inputContainer = this.element.querySelector(
      ".header__input-container"
    );
  }

  init() {
    this.bindToDOM();

    this.element.addEventListener("submit", (e) => this.searchMessage(e));

    const inputContainerWidth = this.inputContainer.clientWidth;
    this.inputContainer.style.maxWidth = "0px";
    this.btn.addEventListener("click", () =>
      this.open(inputContainerWidth)
    );
  }

  async getMessages() {
    const response = await this.api.getMessages();
    const messages = await response.json();
    state.messages = Array.from(messages);
  }

  open(width) {
    this.inputContainer.style.maxWidth = width + "px";
    this.inputContainer.classList.remove("header__input-container_hidden");

    this.btn.classList.add("header__search-btn_opened");

    const changeBtnType = () => {
      this.btn.type = "submit";
    };

    setTimeout(changeBtnType, 200);

    document.addEventListener("click", (e) => {
      let target = e.target;
      if (
        !target.closest(".header__form") &&
        !target.closest(".message") &&
        !document.querySelector(".main__emoji-picker-wrapper") &&
        !target.closest(".main__emoji-picker")
      ) {
        this.inputContainer.style.maxWidth = "0px";
        this.inputContainer.classList.add("header__input-container_hidden");
        this.btn.classList.remove("header__search-btn_opened");
        this.btn.type = "button";
      }
    });
  }

  async searchMessage(e) {
    e.preventDefault();

    const response = await this.api.search({
      str: this.searchInput.value.trim(),
    });
    document
      .querySelectorAll(".message")
      .forEach((message) => message.remove());
    state.loadedMessages = [];

    if (response.ok) {
      const searchedMessages = await response.json();

      if (this.searchInput.value.trim() === "") {
        if (state.activeCategory) {
          const messages = [];
          for (const message of state.messages) {
            if (
              message.type === state.activeCategory &&
              state.activeCategory !== "favorite"
            ) {
              messages.push(message);
            } else if (
              message.isFavorite &&
              state.activeCategory === "favorite"
            ) {
              messages.push(message);
            }
          }
          state.categoryMessages = messages;
          loadMessages(messages, this.api, this.url, this.list);
        } else {
          await this.getMessages();

          state.categoryMessages = state.messages;
          loadMessages(state.messages, this.api, this.url, this.list);
        }
      } else {
        if (state.activeCategory) {
          if (searchedMessages.length !== 0) {
            const messages = [];
            for (const message of searchedMessages) {
              if (
                message.type === state.activeCategory &&
                state.activeCategory !== "favorite"
              ) {
                messages.push(message);
              } else if (
                message.isFavorite &&
                state.activeCategory === "favorite"
              ) {
                messages.push(message);
              }
            }
            state.categoryMessages = messages;
            loadMessages(messages, this.api, this.url, this.list);
          }
        } else {
          if (searchedMessages.length !== 0) {
            state.categoryMessages = searchedMessages;
            loadMessages(searchedMessages, this.api, this.url, this.list);
          }
        }
      }
    }
  }
}
