import axios from "axios";
import config from "./app/config";
import { loaderRemove, loaderRender } from "./utils/loader";
import { showErrorToast } from "./utils/showErrorToast";
import closeSvg from "../svg/close.svg?raw";
import fileSvg from "../svg/file.svg?raw";
import playSvg from "../svg/play.svg?raw";
import videoSvg from "../svg/video.svg?raw";
import { getCookie } from "./utils/cookie";
import linkifyHtml from "linkify-html";

export default class Pinned {
	constructor(data) {
		this.data = data;
	}

	render() {
		const pinned = document.createElement("div");
		pinned.className =
			"pinned py-6 absolute w-full top-0 z-50 bg-neutral bg-opacity-85";

		const container = document.createElement("div");
		container.classList.add("container");

		const pinnedWrapper = document.createElement("div");
		pinnedWrapper.className = "flex justify-between items-center";

		const closeBtn = document.createElement("button");
		closeBtn.className = "btn btn-ghost btn-circle";
		closeBtn.type = "button";
		closeBtn.innerHTML = closeSvg;

		const info = document.createElement("div");
		info.className = `flex relative before:content-[''] before:absolute before:left-[-15px] before:h-full before:w-[2.5px] before:bg-[#e5e7eb]`;

		const text = document.createElement("div");
		text.className = "mr-auto flex flex-col justify-center";

		const name = document.createElement("h3");
		name.className = "mb-1 font-bold";
		name.textContent = "Закрепленное сообщение";

		document.querySelector(".main").append(pinned);
		pinned.append(container);
		container.append(pinnedWrapper);
		pinnedWrapper.append(info);
		pinnedWrapper.append(closeBtn);
		info.append(text);
		text.append(name);

		if (this.data.type === "text") {
			const type = document.createElement("span");
			type.textContent =
				this.data.text.length > 65
					? `${this.data.text.slice(0, 65).trim()}...`
					: this.data.text;
			text.append(type);
		} else if (this.data.type === "link") {
			const type = document.createElement("p");
			const formattedText = this.data.text.replace(/\n/g, "");
			const slicedText =
				formattedText.length > 65
					? `${formattedText.slice(0, 65).trim()}...`
					: formattedText;
			text.append(type);
			type.innerHTML = linkifyHtml(slicedText, { target: "_blank" });
			const link = type.querySelector("a");
			if (link) {
				link.className = "link link-underline";
			}
		} else {
			const type = document.createElement("span");
			type.textContent =
				this.data.file.length > 65
					? `${this.data.file.slice(0, 65).trim()}...`
					: this.data.file;
			text.append(type);

			if (this.data.type === "image") {
				const imgWrapper = document.createElement("div");
				imgWrapper.className =
					"w-[50px] h-[50px] mr-3 flex items-center justify-center overflow-hidden";
				const img = document.createElement("img");
				img.className = "h-full max-w-none";
				if (this.data.author === "bot") {
					img.src = this.data.file;
				} else {
					img.src = `${config.baseUrl}/${getCookie("username")}/${this.data.file}`;
				}
				img.alt = "Preview";
				info.prepend(imgWrapper);
				imgWrapper.prepend(img);
			} else if (
				this.data.type === "file" ||
				this.data.type === "audio" ||
				this.data.type === "video"
			) {
				const file = document.createElement("div");
				file.className =
					"w-[50px] h-[50px] mr-3 flex items-center justify-center bg-content";

				if (this.data.type === "file") {
					file.innerHTML = fileSvg;
				} else if (this.data.type === "video") {
					file.innerHTML = videoSvg;
				} else {
					file.innerHTML = playSvg;
				}

				info.prepend(file);
			}
		}

		this.element = pinned;

		closeBtn.addEventListener("click", () => this.removePinned());
	}

	removePinned() {
		loaderRender();

		axios
			.post(`${config.baseUrl}/delete-pinned`, { apiKey: getCookie("api_key") })
			.then(() => {
				this.data.isPinned = false;
				this.element.remove();
			})
			.catch((error) => {
				showErrorToast(error.message);
			})
			.finally(() => {
				loaderRemove();
			});
	}
}
