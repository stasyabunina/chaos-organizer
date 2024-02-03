import obj from "./obj";

export default class FileContainer {
  constructor(element) {
    this.element = element;

    this.init();
  }

  bindToDOM() {
    this.input = document.querySelector(".main__input");
    this.uploadContainer = this.element.querySelector(
      ".main__file-upload-container"
    );
    this.uploadInput = this.element.querySelector(
      ".main__file-upload-input"
    );
    this.uploadBtn = document.querySelector(".main__file-upload-btn");
    this.sendMessageWrapper = document.querySelector(
      ".main__send-message-wrapper"
    );
  }

  init() {
    this.bindToDOM();
    this.uploadBtn.addEventListener("click", () =>
      this.open()
    );
  }

  open() {
    if (
      this.element.classList.contains(
        "main__file-upload-container-wrapper_hidden"
      )
    ) {
      this.element.classList.add(
        "main__file-upload-container-wrapper_opened"
      );
      this.element.classList.remove(
        "main__file-upload-container-wrapper_hidden"
      );
      this.sendMessageWrapper.classList.add(
        "main__send-message-wrapper_container"
      );
      this.uploadBtn
        .querySelector(".main__close-file-container-svg-path")
        .classList.remove("hidden");
      this.uploadBtn
        .querySelector(".main__open-file-container-svg-path")
        .classList.add("hidden");
      this.uploadContainer.classList.remove("hidden");

      this.uploadInput.addEventListener("change", () =>
        this.onFileChoose(this.uploadInput.files[0])
      );

      this.fileDropEventListener();
    } else {
      this.element.classList.remove(
        "main__file-upload-container-wrapper_opened"
      );
      this.element.classList.add(
        "main__file-upload-container-wrapper_hidden"
      );
      this.sendMessageWrapper.classList.remove(
        "main__send-message-wrapper_container"
      );
      this.uploadBtn
        .querySelector(".main__close-file-container-svg-path")
        .classList.add("hidden");
      this.uploadBtn
        .querySelector(".main__open-file-container-svg-path")
        .classList.remove("hidden");
      this.uploadInput.value = "";
      if (document.querySelector(".main__file-upload-container-filename")) {
        document
          .querySelector(".main__file-upload-container-filename")
          .remove();
      }
      this.uploadContainer.classList.add("hidden");
      this.element.removeAttribute("style");
      this.input.classList.remove("hidden");
    }
  }

  fileDropEventListener() {
    const dragenter = (e) => {
      e.stopPropagation();
      e.preventDefault();
      e.target.classList.add("is-dragover");
    };

    const dragover = (e) => {
      e.stopPropagation();
      e.preventDefault();
    };

    const drop = (e) => {
      e.stopPropagation();
      e.preventDefault();

      const dt = e.dataTransfer;
      const files = dt.files;

      e.target.classList.remove("is-dragover");
      this.onFileChoose(files[0]);
    };

    const dragleave = (e) => {
      e.stopPropagation();
      e.preventDefault();

      e.target.classList.remove("is-dragover");
    };

    this.uploadContainer.addEventListener("dragenter", dragenter, false);
    this.uploadContainer.addEventListener("dragover", dragover, false);
    this.uploadContainer.addEventListener("drop", drop, false);
    this.uploadContainer.addEventListener("dragleave", dragleave, false);
  }

  onFileChoose(file) {
    if (document.querySelector(".main__file-upload-container-filename")) {
      return;
    }

    const text = document.createElement("span");
    text.classList.add("main__file-upload-container-filename");
    if (file.name.length > 55) {
      text.textContent = `${file.name.slice(0, 55).trim()}...`;
    } else {
      text.textContent = `${file.name}`;
    }

    if (document.querySelector(".error")) {
      document.querySelector(".error").remove();
    }
    this.element.style.height = "auto";
    document.querySelector(".main__label").append(text);
    this.input.classList.add("hidden");
    this.uploadContainer.classList.add("hidden");
    this.sendMessageWrapper.classList.remove(
      "main__send-message-wrapper_container"
    );

    obj.uploadedFile = file;
  }
}
