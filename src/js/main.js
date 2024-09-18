import axios from "axios";
import { deleteCookies, getCookie, setCookie } from "./utils/cookie";
import { showErrorToast } from "./utils/showErrorToast";
import { widgetInit } from "./utils/widgetInit";
import config from "./app/config";
import { modalInit } from "./utils/modalInit";

window.addEventListener("load", () => {
	if (getCookie("api_key") !== "; ") {
		const loaderModal = `<div class="modal-wrapper fixed flex justify-center items-center w-full h-full bg-black bg-opacity-50 z-50">
            <div class="modal-box flex flex-col justify-center items-center p-14">
                <span class="loading loading-spinner loading-lg"></span>
            </div>
        </div>`;
		document.body.insertAdjacentHTML("beforeend", loaderModal);

		axios
			.post(`${config.baseUrl}/login`, { apiKey: getCookie("api_key") })
			.finally(() => {
				document.body.querySelector(".modal-wrapper").remove();
			})
			.then((response) => {
				if (!response.data.success) {
					showErrorToast(response.data.message);
					deleteCookies();
					modalInit();
				} else {
					const { apiKey, username } = response.data;
					if (apiKey && username) {
						setCookie("api_key", apiKey);
						setCookie("username", username);
					}
					widgetInit();
				}
			})
			.catch((error) => {
				showErrorToast(error.message);
				deleteCookies();
				modalInit();
			});
	} else {
		modalInit();
	}
});
