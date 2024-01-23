import language from "./lang";
import { setCookie, getCookie } from "./cookie";
import obj from "./obj";

export default class Pinned {
  constructor(data, api, url) {
    this.data = data;
    this.api = api;
    this.url = url;
  }

  async getMessages() {
    const response = await this.api.getMessages();
    const messages = await response.json();
    this.messages = Array.from(messages);
  }

  async render() {
    if (document.querySelector(".pinned")) {
      await this.getMessages();
      for (const message of this.messages) {
        if (message.isPinned) {
          message.isPinned = false;
          await this.api.pin(message);
        }
      }

      document.querySelector(".pinned").remove();
      if (document.querySelector("#pinned")) {
        document.querySelector("#pinned").removeAttribute("id");
      }
    }

    if (this.data.isPinned === false) {
      this.data.isPinned = true;
    }

    const response = await this.api.pin(this.data);

    if (response.ok) {
      const pinnedWrapper = document.createElement("div");
      pinnedWrapper.classList.add("pinned");

      const container = document.createElement("div");
      container.classList.add("container");

      const pinned = document.createElement("div");
      pinned.classList.add("pinned__wrapper");

      const closeBtn = document.createElement("button");
      closeBtn.classList.add("pinned__close-btn");
      closeBtn.type = "button";
      closeBtn.innerHTML = `
      <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path id="Vector" d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="#ABABAB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

      const info = document.createElement("div");
      info.classList.add("pinned__info");

      const text = document.createElement("div");
      text.classList.add("pinned__text");

      const name = document.createElement("h3");
      name.classList.add("pinned__name");

      const link = document.createElement("a");
      link.href = "#pinned";
      link.classList.add("pinned__link");
      let linkText;
      if (getCookie("lang") == "eng") {
        linkText = language.eng.pinnedMessage;
      } else {
        linkText = language.rus.pinnedMessage;
      }
      link.textContent = linkText;

      document.querySelector(".main").append(pinnedWrapper);
      pinnedWrapper.append(container);
      container.append(pinned);
      pinned.append(info);
      info.append(text);
      text.append(name);
      name.append(link);
      pinned.append(closeBtn);

      const type = document.createElement("span");
      type.classList.add("pinned__type");
      if (this.data.type === "text" || this.data.type === "link") {
        type.textContent =
          this.data.text.length > 65
            ? `${this.data.text.slice(0, 65).trim()}...`
            : this.data.text;
      } else {
        type.textContent = this.data.file;
        if (this.data.type === "image") {
          const imgWrapper = document.createElement("div");
          imgWrapper.classList.add("pinned__img-wrapper");
          const img = document.createElement("img");
          img.classList.add("pinned__img");
          if (this.data.author === "bot") {
            img.src = `${this.data.file}`;
          } else {
            img.src = `${this.url}/${this.data.file}`;
          }
          img.alt = "Preview";
          info.prepend(imgWrapper);
          imgWrapper.prepend(img);
        } else if (this.data.type === "file" || this.data.type === "audio") {
          const file = document.createElement("div");
          file.classList.add("pinned__file");

          if (this.data.type === "file") {
            file.innerHTML = `
            <svg width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
              <path fill="#DC7388" fill-rule="evenodd" d="M12 2H6a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-8h-6a3 3 0 0 1-3-3V2zm9 7v-.172a3 3 0 0 0-.879-2.12l-3.828-3.83A3 3 0 0 0 14.172 2H14v6a1 1 0 0 0 1 1h6z" clip-rule="evenodd"/>
            </svg>`;
          } else {
            file.innerHTML = `
            <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.286 3.407A1.5 1.5 0 0 0 6 4.684v14.632a1.5 1.5 0 0 0 2.286 1.277l11.888-7.316a1.5 1.5 0 0 0 0-2.555L8.286 3.407z" fill="#DC7388"/>
            </svg>`;
          }

          info.prepend(file);
        } else if (this.data.type === "video") {
          const video = document
            .querySelector("#pinned")
            .querySelector("video");
          const imgWrapper = document.createElement("div");
          imgWrapper.classList.add("pinned__img-wrapper");
          info.prepend(imgWrapper);

          const capture = () => {
            const canvas = document.createElement("canvas");
            imgWrapper.prepend(canvas);
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas
              .getContext("2d")
              .drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          };

          capture();
        }
      }

      text.append(type);

      closeBtn.addEventListener("click", () =>
        this.removePinned(pinnedWrapper)
      );
      link.addEventListener("click", (evt) => this.findPinnedMessage(evt));

      if (document.querySelector(".message__more-list")) {
        document.querySelector(".message__more-list").remove();
      }
    }
  }

  findPinnedMessage(evt) {
    evt.preventDefault();
    let pinnedMessage;
    for (const message of obj.categoryMessages) {
      if (message.isPinned) {
        pinnedMessage = message;
      }
    }
    if (!pinnedMessage) {
      return;
    } else {
      const checkIfPinnedMessagePresents = () => {
        if (document.querySelector("#pinned")) {
          console.log(obj.simpleBarElement);
          console.log(document.querySelector("#pinned"));
          console.log(document.querySelector(".pinned"));
          obj.simpleBarElement.scrollTop =
            document.querySelector("#pinned").offsetTop -
            document.querySelector(".pinned").clientHeight;
          if (obj.simpleBarElement.scrollTop === 0) {
            setTimeout(() => {
              obj.simpleBarElement.scrollTop = 30;

              setTimeout(() => {
                obj.simpleBarElement.scrollTo({
                  top:
                    document.querySelector("#pinned").offsetTop -
                    document.querySelector(".pinned").clientHeight,
                  behavior: "smooth",
                });
              }, 500);
            }, 500);
          }

          return;
        } else {
          obj.simpleBarElement.scrollTo({
            top: 30,
            behavior: "smooth",
          });

          setTimeout(checkIfPinnedMessagePresents, 500);
        }
      };

      checkIfPinnedMessagePresents();
    }
  }

  async removePinned(pinned) {
    this.data.isPinned = false;

    const response = await this.api.pin(this.data);

    if (response.ok) {
      pinned.remove();

      if (document.querySelector("#pinned")) {
        document.querySelector("#pinned").removeAttribute("id");
      }
    }
  }
}
