import linkifyHtml from "linkify-html";
import { setCookie, getCookie } from "./cookie";
import Pinned from "./Pinned";
import language from "./lang";
import obj from "./obj";
import scrollToBottom from "./scrollToBottom";

export default class Message {
  constructor(data, api, url) {
    this.data = data;
    this.url = url;
    this.api = api;
  }

  render(list, method) {
    const li = document.createElement("li");
    li.className = "main__message message";

    if (this.data.isPinned) {
      li.setAttribute("id", "pinned");
    }

    if (this.data.type === "audio") {
      li.classList.add("message__audio");
    } else if (this.data.type === "file") {
      li.classList.add("message__file");
    }

    const content = document.createElement("div");
    content.classList.add("message__content");

    const date = document.createElement("span");
    date.classList.add("message__created");
    const newDate = new Date(this.data.created);
    const month = newDate.getMonth() + 1;
    date.textContent = `${newDate
      .getHours()
      .toString()
      .padStart(2, "0")}:${newDate
        .getMinutes()
        .toString()
        .padStart(2, "0")} ${newDate
          .getDate()
          .toString()
          .padStart(2, "0")}.${month
            .toString()
            .padStart(2, "0")}.${newDate.getFullYear()}`;

    const favoriteMessageBtn = document.createElement("button");
    favoriteMessageBtn.type = "button";
    favoriteMessageBtn.classList.add("message__favorite-btn");
    favoriteMessageBtn.innerHTML = `
    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.2691 4.41115C11.5006 3.89177 11.6164 3.63208 11.7776 3.55211C11.9176 3.48263 12.082 3.48263 12.222 3.55211C12.3832 3.63208 12.499 3.89177 12.7305 4.41115L14.5745 8.54808C14.643 8.70162 14.6772 8.77839 14.7302 8.83718C14.777 8.8892 14.8343 8.93081 14.8982 8.95929C14.9705 8.99149 15.0541 9.00031 15.2213 9.01795L19.7256 9.49336C20.2911 9.55304 20.5738 9.58288 20.6997 9.71147C20.809 9.82316 20.8598 9.97956 20.837 10.1342C20.8108 10.3122 20.5996 10.5025 20.1772 10.8832L16.8125 13.9154C16.6877 14.0279 16.6252 14.0842 16.5857 14.1527C16.5507 14.2134 16.5288 14.2807 16.5215 14.3503C16.5132 14.429 16.5306 14.5112 16.5655 14.6757L17.5053 19.1064C17.6233 19.6627 17.6823 19.9408 17.5989 20.1002C17.5264 20.2388 17.3934 20.3354 17.2393 20.3615C17.0619 20.3915 16.8156 20.2495 16.323 19.9654L12.3995 17.7024C12.2539 17.6184 12.1811 17.5765 12.1037 17.56C12.0352 17.5455 11.9644 17.5455 11.8959 17.56C11.8185 17.5765 11.7457 17.6184 11.6001 17.7024L7.67662 19.9654C7.18404 20.2495 6.93775 20.3915 6.76034 20.3615C6.60623 20.3354 6.47319 20.2388 6.40075 20.1002C6.31736 19.9408 6.37635 19.6627 6.49434 19.1064L7.4341 14.6757C7.46898 14.5112 7.48642 14.429 7.47814 14.3503C7.47081 14.2807 7.44894 14.2134 7.41394 14.1527C7.37439 14.0842 7.31195 14.0279 7.18708 13.9154L3.82246 10.8832C3.40005 10.5025 3.18884 10.3122 3.16258 10.1342C3.13978 9.97956 3.19059 9.82316 3.29993 9.71147C3.42581 9.58288 3.70856 9.55304 4.27406 9.49336L8.77835 9.01795C8.94553 9.00031 9.02911 8.99149 9.10139 8.95929C9.16534 8.93081 9.2226 8.8892 9.26946 8.83718C9.32241 8.77839 9.35663 8.70162 9.42508 8.54808L11.2691 4.41115Z" stroke="#DC7388" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    const moreBtn = document.createElement("button");
    moreBtn.type = "button";
    moreBtn.classList.add("message__more-btn");
    moreBtn.innerHTML = `
    <svg width="800px" height="800px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#DC7388" class="bi bi-three-dots-vertical">
      <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
    </svg>`;

    if (method === "append") {
      list.append(li);
    } else {
      list.prepend(li);
    }

    li.append(content);
    li.append(date);
    li.append(favoriteMessageBtn);
    li.append(moreBtn);

    let loadData;

    if (this.data.text) {
      const text = document.createElement("p");
      text.classList.add("message__text");
      text.innerHTML = linkifyHtml(this.data.text, { target: "_blank" });

      content.append(text);
      this.text = text;
    } else {
      if (this.data.type === "image") {
        const img = document.createElement("img");
        img.alt = this.data.file;
        if (this.data.author === "bot") {
          img.src = this.data.file;
        } else {
          img.src = `${this.url}/${this.data.file}`;
        }
        content.append(img);
        loadData = img;
      } else if (this.data.type === "audio") {
        content.classList.add("audio");
        this.createCustomAudio(content);
      } else if (this.data.type === "video") {
        content.classList.add("video");
        const video = document.createElement("video");
        video.src = `${this.url}/${this.data.file}`;
        video.controls = "controls";
        content.append(video);
        this.createCustomVideo(content, video);
        loadData = video;
      } else {
        content.classList.add("file");
        const fileIcon = document.createElement("div");
        fileIcon.classList.add("file__icon");
        fileIcon.innerHTML = `
        <svg width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
          <path fill="#DC7388" fill-rule="evenodd" d="M12 2H6a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-8h-6a3 3 0 0 1-3-3V2zm9 7v-.172a3 3 0 0 0-.879-2.12l-3.828-3.83A3 3 0 0 0 14.172 2H14v6a1 1 0 0 0 1 1h6z" clip-rule="evenodd"/>
        </svg>`;

        const fileContent = document.createElement("div");
        fileContent.classList.add("file__content");

        const fileName = document.createElement("span");
        fileName.classList.add("file__name");
        fileName.textContent =
          this.data.file.length > 20
            ? `${this.data.file.slice(0, 20).trim()}...`
            : this.data.file;

        const fileSize = document.createElement("span");
        fileSize.classList.add("file__size");

        const formatBytes = (bytes) => {
          let units = ["B", "KB", "MB", "GB", "TB", "PB"];

          let i = 0;

          for (i; bytes > 1024; i++) {
            bytes /= 1024;
          }

          return bytes.toFixed(2) + " " + units[i];
        };

        fileSize.textContent = formatBytes(this.data.size);

        content.append(fileIcon);
        content.append(fileContent);
        fileContent.append(fileName);
        fileContent.append(fileSize);
      }
    }

    this.element = li;
    this.favoriteBtn = favoriteMessageBtn;

    moreBtn.addEventListener("click", () => {
      if (document.querySelector(".message__more-list")) {
        if (document.querySelector(".message__more-list").previousElementSibling !== moreBtn) {
          document.querySelector(".message__more-list").remove();
          this.showMoreOptions()
        } else if (document.querySelector(".message__more-list").previousElementSibling === moreBtn) {
          document.querySelector(".message__more-list").remove();
        }
      } else if (!document.querySelector(".message__more-list")) {
        this.showMoreOptions()
      }
    });

    favoriteMessageBtn.addEventListener("click", (e) =>
      this.favoriteMessage(e)
    );

    if (this.data.isFavorite) {
      this.favoriteBtn
        .querySelector("path")
        .classList.add("message__favorite-btn-svg-path_filled");
    }

    if (this.data.author === "bot") {
      li.classList.add("message_left");
      favoriteMessageBtn.classList.add("message__favorite-btn_left");
      moreBtn.classList.add("message__more-btn_left");
    }

    if (document.querySelectorAll(".message").length <= 10) {
      if (loadData) {
        if (loadData.tagName === "VIDEO") {
          loadData.addEventListener("loadedmetadata", () => {
            scrollToBottom(obj.simpleBarElement);
          });
        } else if (loadData.tagName === "IMG") {
          loadData.addEventListener("load", () => {
            scrollToBottom(obj.simpleBarElement);
          });
        }
      } else {
        scrollToBottom(obj.simpleBarElement);
      }
    }
  }

  createCustomVideo(content, video) {
    this.videoVolume = 1;

    const controlsInputWrapper = document.createElement("div");
    controlsInputWrapper.classList.add("video__controls-slider");

    const videoControls = document.createElement("div");
    videoControls.classList.add("video__controls");

    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.innerHTML = `
    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="video__play-svg-play-path" d="M8.286 3.407A1.5 1.5 0 0 0 6 4.684v14.632a1.5 1.5 0 0 0 2.286 1.277l11.888-7.316a1.5 1.5 0 0 0 0-2.555L8.286 3.407z" fill="#DC7388"/>
      <path class="video__play-svg-pause-path hidden" fill-rule="evenodd" clip-rule="evenodd" d="M5.163 3.819C5 4.139 5 4.559 5 5.4v13.2c0 .84 0 1.26.163 1.581a1.5 1.5 0 0 0 .656.655c.32.164.74.164 1.581.164h.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .656-.656c.163-.32.163-.74.163-1.581V5.4c0-.84 0-1.26-.163-1.581a1.5 1.5 0 0 0-.656-.656C8.861 3 8.441 3 7.6 3h-.2c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.656.656zm9 0C14 4.139 14 4.559 14 5.4v13.2c0 .84 0 1.26.164 1.581a1.5 1.5 0 0 0 .655.655c.32.164.74.164 1.581.164h.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .655-.656c.164-.32.164-.74.164-1.581V5.4c0-.84 0-1.26-.163-1.581a1.5 1.5 0 0 0-.656-.656C17.861 3 17.441 3 16.6 3h-.2c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.655.656z" fill="#DC7388"/>
    </svg>`;
    playBtn.classList.add("video__play");

    const volumeBtn = document.createElement("button");
    volumeBtn.type = "button";
    volumeBtn.innerHTML = `
    <svg fill="#DC7388" width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path class="video__volume-svg-mute-path" d="M14.47 3.12a1 1 0 0 0-1 0L7 7.57H2a1 1 0 0 0-1 1v6.86a1 1 0 0 0 1 1h5l6.41 4.4A1.06 1.06 0 0 0 14 21a1 1 0 0 0 1-1V4a1 1 0 0 0-.53-.88z"/>
      <path class="video__volume-svg-down-path" d="M18.28 8.37a1 1 0 1 0-1.56 1.26 4 4 0 0 1 0 4.74A1 1 0 0 0 17.5 16a1 1 0 0 0 .78-.37 6 6 0 0 0 0-7.26z"/>
      <path class="video__volume-svg-up-path" d="M19.64 5.23a1 1 0 1 0-1.28 1.54A6.8 6.8 0 0 1 21 12a6.8 6.8 0 0 1-2.64 5.23 1 1 0 0 0-.13 1.41A1 1 0 0 0 19 19a1 1 0 0 0 .64-.23A8.75 8.75 0 0 0 23 12a8.75 8.75 0 0 0-3.36-6.77z"/>
    </svg>`;
    volumeBtn.classList.add("video__volume");

    const fullscreenBtn = document.createElement("button");
    fullscreenBtn.type = "button";
    fullscreenBtn.innerHTML = `
    <svg fill="#DC7388" width="800px" height="800px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 3.414L9.414 8 14 12.586v-2.583h2V16h-6v-1.996h2.59L8 9.414l-4.59 4.59H6V16H0v-5.997h2v2.583L6.586 8 2 3.414v2.588H0V0h16v6.002h-2V3.414zm-1.415-1.413H10V0H6v2H3.415L8 6.586 12.585 2z" fill-rule="evenodd"/>
    </svg>`;
    fullscreenBtn.classList.add("video__fullscreen");

    const forwardBtn = document.createElement("button");
    forwardBtn.type = "button";
    forwardBtn.innerHTML = `
    <svg fill="#DC7388" width="800px" height="800px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
      <path d="M 9.4844 46.3867 C 10.4453 46.3867 11.2422 46.0820 12.1797 45.5195 L 36.0625 31.4805 C 37.3516 30.7071 38.0547 29.8633 38.3125 28.8789 L 38.3125 43.9492 C 38.3125 46.0117 39.3906 47.0898 41.4532 47.0898 L 46.7735 47.0898 C 48.8360 47.0898 49.8906 46.0117 49.8906 43.9492 L 49.8906 12.0273 C 49.8906 9.8945 48.8360 8.9102 46.7735 8.9102 L 41.4532 8.9102 C 39.3906 8.9102 38.3125 9.9883 38.3125 12.0273 L 38.3125 27.0742 C 38.0547 26.1133 37.3516 25.2461 36.0625 24.4961 L 12.1797 10.4336 C 11.2188 9.8711 10.4453 9.5664 9.4844 9.5664 C 7.6563 9.5664 6.1094 10.9727 6.1094 13.5976 L 6.1094 42.3789 C 6.1094 45.0039 7.6563 46.3867 9.4844 46.3867 Z"/>
    </svg>`;
    forwardBtn.classList.add("video__forward");

    const backwardBtn = document.createElement("button");
    backwardBtn.type = "button";
    backwardBtn.innerHTML = `
    <svg fill="#DC7388" width="800px" height="800px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
      <path d="M 9.2500 47.0898 L 14.5703 47.0898 C 16.6328 47.0898 17.6875 46.0117 17.6875 43.9492 L 17.6875 28.8789 C 17.6172 28.5976 17.5703 28.2930 17.5703 27.9883 C 17.5703 27.6602 17.6172 27.3555 17.6875 27.0742 L 17.6875 12.0273 C 17.6875 9.8945 16.6328 8.9102 14.5703 8.9102 L 9.2500 8.9102 C 7.1875 8.9102 6.1094 9.9883 6.1094 12.0273 L 6.1094 43.9492 C 6.1094 46.0117 7.1875 47.0898 9.2500 47.0898 Z M 46.5157 46.3867 C 48.3671 46.3867 49.8906 45.0039 49.8906 42.3789 L 49.8906 13.5976 C 49.8906 10.9727 48.3671 9.5664 46.5157 9.5664 C 45.5781 9.5664 44.7813 9.8711 43.8203 10.4336 L 19.9375 24.4961 C 18.6719 25.2461 17.9688 26.1133 17.6875 27.0742 L 17.6875 28.8789 C 17.9688 29.8633 18.6719 30.7071 19.9375 31.4805 L 43.8203 45.5195 C 44.7813 46.0820 45.5781 46.3867 46.5157 46.3867 Z"/>
    </svg>`;
    backwardBtn.classList.add("video__backward");

    const volumeSlider = document.createElement("input");
    volumeSlider.type = "range";
    volumeSlider.min = 0;
    volumeSlider.max = 100;
    volumeSlider.value = 100;
    volumeSlider.classList.add("video__volume-slider");

    volumeSlider.addEventListener("input", (event) => {
      const tempSliderValue = event.target.value;

      const progress = (tempSliderValue / volumeSlider.max) * 100;

      video.volume = tempSliderValue / 100;
      this.videoVolume = tempSliderValue / 100;

      if (video.volume === 0) {
        volumeBtn
          .querySelector(".video__volume-svg-up-path")
          .classList.add("hidden");
        volumeBtn
          .querySelector(".video__volume-svg-down-path")
          .classList.add("hidden");
      } else if (video.volume <= 0.5) {
        volumeBtn
          .querySelector(".video__volume-svg-up-path")
          .classList.add("hidden");
        volumeBtn
          .querySelector(".video__volume-svg-down-path")
          .classList.remove("hidden");
      } else {
        volumeBtn
          .querySelector(".video__volume-svg-up-path")
          .classList.remove("hidden");
        volumeBtn
          .querySelector(".video__volume-svg-down-path")
          .classList.remove("hidden");
      }

      volumeSlider.style.background = `linear-gradient(to right, #DC7388 ${progress}%, #d3d3d3 ${progress}%)`;
    });

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = 0;
    video.onloadedmetadata = function () {
      slider.max = video.duration * 100;
    };
    slider.value = 0;
    slider.classList.add("video__slider");

    slider.addEventListener("input", (event) => {
      const tempSliderValue = event.target.value;

      const progress = (tempSliderValue / slider.max) * 100;

      video.currentTime = slider.value / 100;

      slider.style.background = `linear-gradient(to right, #DC7388 ${progress}%, #d3d3d3 ${progress}%)`;
    });

    const videoWorks = !!video.canPlayType;
    if (videoWorks) {
      video.controls = false;
    }

    content.append(controlsInputWrapper);
    controlsInputWrapper.append(slider);
    controlsInputWrapper.append(videoControls);
    videoControls.append(playBtn);
    videoControls.append(volumeBtn);
    videoControls.append(volumeSlider);
    videoControls.append(backwardBtn);
    videoControls.append(forwardBtn);
    videoControls.append(fullscreenBtn);

    let updateSlider;

    const play = () => {
      if (video.paused) {
        video.play();

        updateSlider = setInterval(function () {
          slider.value = video.currentTime * 100;
          const per = slider.value / video.duration;
          slider.style.background = `linear-gradient(to right, #DC7388 ${per}%, #d3d3d3 ${per}%)`;
        }, 10);

        playBtn
          .querySelector(".video__play-svg-pause-path")
          .classList.remove("hidden");
        playBtn
          .querySelector(".video__play-svg-play-path")
          .classList.add("hidden");
      } else {
        video.pause();
        clearInterval(updateSlider);
        playBtn
          .querySelector(".video__play-svg-pause-path")
          .classList.add("hidden");
        playBtn
          .querySelector(".video__play-svg-play-path")
          .classList.remove("hidden");
      }
    };

    fullscreenBtn.addEventListener("click", () => {
      if (
        !document.fullscreenElement &&
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement &&
        !document.msFullscreenElement
      ) {
        if (content.requestFullscreen) {
          content.requestFullscreen();
        } else if (content.msRequestFullscreen) {
          content.msRequestFullscreen();
        } else if (content.mozRequestFullScreen) {
          content.mozRequestFullScreen();
        } else if (content.webkitRequestFullscreen) {
          content.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }

        obj.isFullscreen = true;
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }

        obj.isFullscreen = false;
      }
    });

    document.addEventListener("fullscreenchange", escapeKeyHandler);
    document.addEventListener("webkitfullscreenchange", escapeKeyHandler);
    document.addEventListener("mozfullscreenchange", escapeKeyHandler);
    document.addEventListener("MSFullscreenChange", escapeKeyHandler);

    function escapeKeyHandler() {
      if (
        !document.fullscreenElement &&
        !document.webkitIsFullScreen &&
        !document.mozFullScreen &&
        !document.msFullscreenElement
      ) {
        obj.isFullscreen = false;
      }
    }

    playBtn.addEventListener("click", play);

    forwardBtn.addEventListener("click", () => {
      video.currentTime += 5;
      slider.value = video.currentTime * 100;
      const per = slider.value / video.duration;
      slider.style.background = `linear-gradient(to right, #DC7388 ${per}%, #d3d3d3 ${per}%)`;
    });

    backwardBtn.addEventListener("click", () => {
      video.currentTime -= 5;
      slider.value = video.currentTime * 100;
      const per = slider.value / video.duration;
      slider.style.background = `linear-gradient(to right, #DC7388 ${per}%, #d3d3d3 ${per}%)`;
    });

    volumeBtn.addEventListener("click", () => {
      if (video.volume !== 0) {
        video.volume = 0;
        volumeSlider.value = 0;
        volumeSlider.style.background = `linear-gradient(to right, #DC7388 0%, #d3d3d3 0%)`;
        volumeBtn
          .querySelector(".video__volume-svg-up-path")
          .classList.add("hidden");
        volumeBtn
          .querySelector(".video__volume-svg-down-path")
          .classList.add("hidden");
      } else {
        volumeSlider.value = this.videoVolume * 100;
        video.volume = this.videoVolume;
        volumeSlider.style.background = `linear-gradient(to right, #DC7388 ${this.videoVolume * 100
          }%, #d3d3d3 ${this.videoVolume * 100}%)`;
        volumeBtn
          .querySelector(".video__volume-svg-up-path")
          .classList.remove("hidden");
        volumeBtn
          .querySelector(".video__volume-svg-down-path")
          .classList.remove("hidden");
      }
    });

    video.addEventListener("ended", () => {
      playBtn
        .querySelector(".video__play-svg-pause-path")
        .classList.add("hidden");
      playBtn
        .querySelector(".video__play-svg-play-path")
        .classList.remove("hidden");
      clearInterval(updateSlider);
      slider.value = slider.max;
      slider.style.background = `linear-gradient(to right, #DC7388 100%, #d3d3d3 100%)`;
    });

    const keyNav = (e) => {
      if (obj.isFullscreen === false) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        play();
      } else if (e.code === "ArrowRight") {
        video.currentTime += 5;
        slider.value = video.currentTime * 100;
        const per = slider.value / video.duration;
        slider.style.background = `linear-gradient(to right, #DC7388 ${per}%, #d3d3d3 ${per}%)`;
      } else if (e.code === "ArrowLeft") {
        video.currentTime -= 5;
        slider.value = video.currentTime * 100;
        const per = slider.value / video.duration;
        slider.style.background = `linear-gradient(to right, #DC7388 ${per}%, #d3d3d3 ${per}%)`;
      }
    };
    window.addEventListener("keyup", keyNav);
  }

  createCustomAudio(content) {
    const audio = new Audio();
    audio.controls = true;
    audio.src = `${this.url}/${this.data.file}`;

    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.innerHTML = `
    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="audio__play-svg-play-path" d="M8.286 3.407A1.5 1.5 0 0 0 6 4.684v14.632a1.5 1.5 0 0 0 2.286 1.277l11.888-7.316a1.5 1.5 0 0 0 0-2.555L8.286 3.407z" fill="#DC7388"/>
      <path class="audio__play-svg-pause-path hidden" fill-rule="evenodd" clip-rule="evenodd" d="M5.163 3.819C5 4.139 5 4.559 5 5.4v13.2c0 .84 0 1.26.163 1.581a1.5 1.5 0 0 0 .656.655c.32.164.74.164 1.581.164h.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .656-.656c.163-.32.163-.74.163-1.581V5.4c0-.84 0-1.26-.163-1.581a1.5 1.5 0 0 0-.656-.656C8.861 3 8.441 3 7.6 3h-.2c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.656.656zm9 0C14 4.139 14 4.559 14 5.4v13.2c0 .84 0 1.26.164 1.581a1.5 1.5 0 0 0 .655.655c.32.164.74.164 1.581.164h.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .655-.656c.164-.32.164-.74.164-1.581V5.4c0-.84 0-1.26-.163-1.581a1.5 1.5 0 0 0-.656-.656C17.861 3 17.441 3 16.6 3h-.2c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.655.656z" fill="#DC7388"/>
    </svg>`;
    playBtn.classList.add("audio__play");

    let updateSlider;
    playBtn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
        updateSlider = setInterval(function () {
          displayDuration(audio.currentTime);
          rangeSliderWrapper.style.width =
            (audio.currentTime / audio.duration) * 100 + "%";
        }, 10);
        playBtn
          .querySelector(".audio__play-svg-pause-path")
          .classList.remove("hidden");
        playBtn
          .querySelector(".audio__play-svg-play-path")
          .classList.add("hidden");
      } else {
        audio.pause();
        clearInterval(updateSlider);
        playBtn
          .querySelector(".audio__play-svg-pause-path")
          .classList.add("hidden");
        playBtn
          .querySelector(".audio__play-svg-play-path")
          .classList.remove("hidden");
      }
    });

    const audioContent = document.createElement("div");
    audioContent.classList.add("audio__content");

    const audioDuration = document.createElement("span");
    audioDuration.classList.add("audio__duration");

    const convertDuration = (secs) => {
      const hours = Math.floor(secs / 3600);
      const minutes = Math.floor(secs / 60);
      const returnedMinutes =
        minutes < 10 && audio.duration >= 3600
          ? `0${minutes}`
          : `${minutes.toString().slice(-2)}`;
      const seconds = Math.floor(secs % 60);
      const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
      if (audio.duration >= 3600) {
        return `${hours}:${returnedMinutes}:${returnedSeconds}`;
      } else {
        return `${returnedMinutes}:${returnedSeconds}`;
      }
    };

    const displayDuration = (secs) => {
      audioDuration.textContent = convertDuration(secs);
    };

    if (audio.readyState > 0) {
      displayDuration(audio.duration);
    } else {
      audio.addEventListener("loadedmetadata", () => {
        displayDuration(audio.duration);
      });
    }

    audio.addEventListener("play", () => {
      if (Math.floor(audio.currentTime) === 0) {
        audioDuration.textContent = audio.duration >= 3600 ? `0:00:00` : `0:00`;
      } else {
        displayDuration(audio.currentTime);
      }
    });
    audio.addEventListener("pause", () => {
      displayDuration(audio.currentTime);
    });

    const range = document.createElement("input");
    range.classList.add("audio__input");
    range.type = "range";
    range.min = 0;
    audio.onloadedmetadata = function () {
      range.max = audio.duration * 100;
    };
    range.value = 0;

    range.addEventListener("input", () => {
      const per = range.value / audio.duration;
      rangeSliderWrapper.style.width = per + "%";
      audio.currentTime = (per / 100) * audio.duration;
    });

    const rangeWrapper = document.createElement("div");
    rangeWrapper.classList.add("audio__input-wrapper");

    const rangeSliderWrapper = document.createElement("div");
    rangeSliderWrapper.classList.add("audio__input-slider-wrapper");

    const rangeSlider = document.createElement("div");
    rangeSlider.classList.add("audio__input-slider");

    content.append(playBtn);
    content.append(audioContent);
    audioContent.append(rangeWrapper);
    rangeWrapper.append(range);
    rangeWrapper.append(rangeSliderWrapper);
    rangeSliderWrapper.append(rangeSlider);
    audioContent.append(audioDuration);

    audio.addEventListener("ended", () => {
      displayDuration(audio.duration);
      clearInterval(updateSlider);
      range.value = range.max;
      playBtn
        .querySelector(".audio__play-svg-pause-path")
        .classList.add("hidden");
      playBtn
        .querySelector(".audio__play-svg-play-path")
        .classList.remove("hidden");
    });
  }

  async favoriteMessage(e) {
    if (this.data.isFavorite === false) {
      this.data.isFavorite = true;
    } else {
      this.data.isFavorite = false;
    }

    const response = await this.api.favorite(this.data);

    let btn = e.target.closest(".message__favorite-btn");

    if (response.ok) {
      btn
        .querySelector("path")
        .classList.toggle("message__favorite-btn-svg-path_filled");

      btn.style.animation = `star 400ms ease-out`;
      btn.addEventListener("animationend", () => btn.removeAttribute("style"));

      this.rerenderFavoriteCategory();

      if (this.data.isFavorite === false) {
        if (
          document
            .querySelector(".aside__favorites-item-text")
            .classList.contains("aside__item-text_clicked")
        ) {
          this.element.remove();
        }
      }
    }
  }

  async getMessages() {
    const response = await this.api.getMessages();
    const messages = await response.json();
    this.messages = Array.from(messages);
  }

  async rerenderFavoriteCategory() {
    await this.getMessages();

    const favoriteMessages = [];

    for (const message of this.messages) {
      if (message.isFavorite) {
        favoriteMessages.push(message);
      }
    }

    let text;
    if (getCookie("lang") == "eng") {
      text = "favorite messages";
    } else {
      text = "избранных сообщений";
    }

    document.querySelector(
      ".aside__favorites-item-text"
    ).textContent = `${favoriteMessages.length} ${text}`;
  }

  showMoreOptions() {
    const ul = document.createElement("ul");
    ul.classList.add("message__more-list");

    const pinMessageLi = document.createElement("li");
    pinMessageLi.classList.add("message__more-item");

    const pinMessageBtn = document.createElement("button");
    pinMessageBtn.classList.add("message__more-item-btn");
    pinMessageBtn.type = "button";
    pinMessageBtn.innerHTML = `
        <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M17.1218 1.87023C15.7573 0.505682 13.4779 0.76575 12.4558 2.40261L9.61062 6.95916C9.61033 6.95965 9.60913 6.96167 9.6038 6.96549C9.59728 6.97016 9.58336 6.97822 9.56001 6.9848C9.50899 6.99916 9.44234 6.99805 9.38281 6.97599C8.41173 6.61599 6.74483 6.22052 5.01389 6.87251C4.08132 7.22378 3.61596 8.03222 3.56525 8.85243C3.51687 9.63502 3.83293 10.4395 4.41425 11.0208L7.94975 14.5563L1.26973 21.2363C0.879206 21.6269 0.879206 22.26 1.26973 22.6506C1.66025 23.0411 2.29342 23.0411 2.68394 22.6506L9.36397 15.9705L12.8995 19.5061C13.4808 20.0874 14.2853 20.4035 15.0679 20.3551C15.8881 20.3044 16.6966 19.839 17.0478 18.9065C17.6998 17.1755 17.3043 15.5086 16.9444 14.5375C16.9223 14.478 16.9212 14.4114 16.9355 14.3603C16.9421 14.337 16.9502 14.3231 16.9549 14.3165C16.9587 14.3112 16.9606 14.31 16.9611 14.3098L21.5177 11.4645C23.1546 10.4424 23.4147 8.16307 22.0501 6.79853L17.1218 1.87023ZM14.1523 3.46191C14.493 2.91629 15.2528 2.8296 15.7076 3.28445L20.6359 8.21274C21.0907 8.66759 21.0041 9.42737 20.4584 9.76806L15.9019 12.6133C14.9572 13.2032 14.7469 14.3637 15.0691 15.2327C15.3549 16.0037 15.5829 17.1217 15.1762 18.2015C15.1484 18.2752 15.1175 18.3018 15.0985 18.3149C15.0743 18.3316 15.0266 18.3538 14.9445 18.3589C14.767 18.3699 14.5135 18.2916 14.3137 18.0919L5.82846 9.6066C5.62872 9.40686 5.55046 9.15333 5.56144 8.97583C5.56651 8.8937 5.58877 8.84605 5.60548 8.82181C5.61855 8.80285 5.64516 8.7719 5.71886 8.74414C6.79869 8.33741 7.91661 8.56545 8.68762 8.85128C9.55668 9.17345 10.7171 8.96318 11.3071 8.01845L14.1523 3.46191Z" fill="#0477C3"/>
        </svg>`;

    const pinMessageText = document.createElement("span");
    pinMessageText.classList.add("message__more-btn-text");
    let pinText;
    if (getCookie("lang") == "eng") {
      pinText = language.eng.pin;
    } else {
      pinText = language.rus.pin;
    }
    pinMessageText.textContent = pinText;

    const downloadLi = document.createElement("li");
    downloadLi.classList.add("message__more-item");

    const downloadBtn = document.createElement("a");
    downloadBtn.classList.add("message__more-item-btn");
    downloadBtn.innerHTML = `
      <svg width="800px" height="800px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path stroke="#ecda7c" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 2v16m0 0l-7-7m7 7l7-7"/>
      </svg>`;

    const downloadText = document.createElement("span");
    downloadText.classList.add("message__more-btn-text");
    let download;
    if (getCookie("lang") == "eng") {
      download = language.eng.download;
    } else {
      download = language.rus.download;
    }
    downloadText.textContent = download;

    this.element.append(ul);
    ul.append(pinMessageLi);
    ul.append(downloadLi);
    pinMessageLi.append(pinMessageBtn);
    pinMessageBtn.append(pinMessageText);
    downloadLi.append(downloadBtn);
    downloadBtn.append(downloadText);

    if (this.data.author === "bot") {
      ul.classList.add("message__more-list_left");
    }

    if (this.data.type === "text" || this.data.type === "link") {
      const file = new Blob([this.data.text], { type: "text/plain" });
      downloadBtn.href = URL.createObjectURL(file);
      downloadBtn.download = "message.txt";
    } else if (this.data.type === "image" && this.data.author === "bot") {
      downloadBtn.href = this.data.file;
      downloadBtn.download = this.data.file;
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

      toDataURL(`${this.url}/${this.data.file}`).then((dataUrl) => {
        downloadBtn.href = dataUrl;
        downloadBtn.download = this.data.file;
      });
    }

    pinMessageBtn.addEventListener("click", () => this.pinMessage());
    downloadBtn.addEventListener("click", (evt) => this.downloadMessage(evt));
  }

  pinMessage() {
    const newPinned = new Pinned(
      this.data,
      this.api,
      this.url,
      this.simpleBarElement
    );
    newPinned.render();
    this.element.setAttribute("id", "pinned");
  }

  async downloadMessage(evt) {
    if (document.querySelector(".message__more-list")) {
      document.querySelector(".message__more-list").remove();
    }

    let link = evt.target;
    if (this.data.type === "text" || this.data.type === "link") {
      URL.revokeObjectURL(link.href);
    }
  }
}
