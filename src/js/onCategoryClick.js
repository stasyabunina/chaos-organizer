import state from "./state";
import loadMessages from "./loadMessages";

const onCategoryClick = async (evt, api, url, list, element) => {
  const getMessages =  async () => {
    const response = await api.getMessages();
    const messages = await response.json();
    state.messages = Array.from(messages);
  }

  let target = evt.target;

  document
    .querySelectorAll(".message")
    .forEach((message) => message.remove());
  state.loadedMessages = [];

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

      state.categoryMessages = state.messages;
    loadMessages(state.messages, api, url, list);

    state.activeCategory = null;
    return;
  } else {
    if (element.querySelector(".aside__item-svg_clicked")) {
      element
        .querySelector(".aside__item-svg_clicked")
        .classList.remove("aside__item-svg_clicked");
    }

    if (element.querySelector(".aside__item-text_clicked")) {
      element
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
    state.categoryMessages = state.videoMessages;
    loadMessages(state.videoMessages, api, url, list);

    state.activeCategory = "video";
  } else if (target.closest(".aside__audios-item-btn")) {
    state.categoryMessages = state.audioMessages;
    loadMessages(state.audioMessages, api, url, list);

    state.activeCategory = "audio";
  } else if (target.closest(".aside__links-item-btn")) {
    state.categoryMessages = state.linkMessages;
    loadMessages(state.linkMessages, api, url, list);

    state.activeCategory = "link";
  } else if (target.closest(".aside__images-item-btn")) {
    state.categoryMessages = state.imageMessages;
    loadMessages(state.imageMessages, api, url, list);

    state.activeCategory = "image";
  } else if (target.closest(".aside__files-item-btn")) {
    state.categoryMessages = state.fileMessages;
    loadMessages(state.fileMessages, api, url, list);

    state.activeCategory = "file";
  } else if (target.closest(".aside__favorites-item-btn")) {
    await getMessages();

    const favoriteMessages = [];

    for (const message of state.messages) {
      if (message.isFavorite) {
        favoriteMessages.push(message);
      }
    }

    state.favoriteMessages = favoriteMessages;

    state.categoryMessages = state.favoriteMessages;

    loadMessages(state.favoriteMessages, api, url, list);

    state.activeCategory = "favorite";
  } else {
    state.categoryMessages = state.textMessages;
    loadMessages(state.textMessages, api, url, list);

    state.activeCategory = "text";
  }
}

export default onCategoryClick;
