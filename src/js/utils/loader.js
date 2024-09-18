const messagesWrapper = document.querySelector(".main__messages-wrapper");

function loaderRender() {
	messagesWrapper.insertAdjacentHTML(
		"beforeend",
		`<div class="loading-wrapper absolute flex justify-center items-center w-full h-full bg-black bg-opacity-40 z-40"><span class="loading loading-spinner loading-lg"></span></div>`
	);
}

function loaderRemove() {
	messagesWrapper.querySelector(".loading-wrapper").remove();
}

export { loaderRender, loaderRemove };
