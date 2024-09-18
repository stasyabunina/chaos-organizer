import state from "./app/state";

export default class FileContainer {
	constructor(element, btn, sendLabel) {
		this.element = element;
		this.btn = btn;
		this.sendLabel = sendLabel;

		this.opened = false;

		this.init();
	}

	bindToDOM() {
		this.container = this.element.querySelector(".main__file-container");
		this.input = this.element.querySelector(".main__file-input");
	}

	init() {
		this.bindToDOM();
		this.btn.addEventListener("click", () => {
			if (!this.opened) {
				this.element.classList.remove("hidden");
				this.element.classList.add("flex");
				this.btn.querySelectorAll("path")[0].classList.add("rotate-45");
				this.btn.querySelectorAll("path")[0].classList.add("origin-center");

				this.opened = !this.opened;
			} else {
				this.close();
			}
		});
		this.input.addEventListener("change", () =>
			this.onFileChoose(this.input.files[0])
		);
		this.fileDropEventListener();
	}

	fileDropEventListener() {
		const dragenter = (e) => {
			e.stopPropagation();
			e.preventDefault();
		};

		const dragover = (e) => {
			e.stopPropagation();
			e.preventDefault();
		};

		const drop = (e) => {
			e.stopPropagation();
			e.preventDefault();

			const data = e.dataTransfer;
			const files = data.files;

			this.onFileChoose(files[0]);
		};

		const dragleave = (e) => {
			e.stopPropagation();
			e.preventDefault();
		};

		this.container.addEventListener("dragenter", dragenter, false);
		this.container.addEventListener("dragover", dragover, false);
		this.container.addEventListener("drop", drop, false);
		this.container.addEventListener("dragleave", dragleave, false);
	}

	onFileChoose(file) {
		const fileName = document.createElement("span");
		fileName.className = "mr-2 grow flex items-center";
		if (file.name.length > 55) {
			fileName.textContent = `${file.name.slice(0, 55).trim()}...`;
		} else {
			fileName.textContent = `${file.name}`;
		}

		this.element.classList.add("hidden");
		this.sendLabel.classList.add("hidden");
		this.btn.after(fileName);
		this.fileName = fileName;

		state.file = file;
	}

	close() {
		this.sendLabel.classList.remove("hidden");
		if (this.fileName) {
			this.fileName.remove();
		}
		this.input.value = "";
		state.file = undefined;
		this.element.classList.add("hidden");
		this.element.classList.remove("flex");
		this.btn.querySelectorAll("path")[0].classList.remove("rotate-45");
		this.btn.querySelectorAll("path")[0].classList.remove("origin-center");

		this.opened = !this.opened;
	}
}
