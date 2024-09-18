import { setCookie } from "./utils/cookie";
import { widgetInit } from "./utils/widgetInit";
import axios from "axios";
import { showErrorToast } from "./utils/showErrorToast";
import config from "./app/config";
import loginSvg from "../svg/login.svg?raw";
import passwordSvg from "../svg/password.svg?raw";

export default class Modal {
	constructor() {
		this.modalType = "register";
	}

	init() {
		this.render();
		this.addLoginEventListener();

		this.form.addEventListener("submit", (e) => {
			e.preventDefault();

			this.submit(e);
		});
	}

	render() {
		const modalWrapper = document.createElement("div");
		modalWrapper.className =
			"modal-wrapper fixed flex justify-center items-center w-full h-full bg-black bg-opacity-50 z-50";

		const modal = document.createElement("div");
		modal.className =
			"modal-box flex flex-col justify-center items-center p-14";

		const warning = document.createElement("p");
		warning.className = "mb-5 text-center";
		warning.innerHTML = `
        <span class="font-bold">Внимание!</span> Данный проект служит лишь для ознакомления, а не реального использования.
        `;

		const text = document.createElement("p");
		text.className = "mb-6";
		text.textContent = "Придумайте имя пользователя и пароль...";

		const form = document.createElement("form");
		form.className = "w-full mb-10 flex flex-col items-center";

		const usernameLabel = document.createElement("label");
		usernameLabel.className =
			"input input-bordered flex items-center gap-2 mb-6";

		const usernameInput = document.createElement("input");
		usernameInput.className = "grow";
		usernameInput.type = "text";
		usernameInput.placeholder = "Логин";
		usernameInput.name = "username";

		const passwordLabel = document.createElement("label");
		passwordLabel.className =
			"input input-bordered flex items-center gap-2 mb-6";

		const passwordInput = document.createElement("input");
		passwordInput.className = "grow";
		passwordInput.type = "password";
		passwordInput.placeholder = "Пароль";
		passwordInput.name = "password";

		const submitBtn = document.createElement("button");
		submitBtn.className = "btn";
		submitBtn.textContent = "Зарегистрироваться";

		const loginBtn = document.createElement("button");
		loginBtn.type = "button";
		loginBtn.className = "link link-hover";
		loginBtn.textContent = "...или войдите в существующий аккаунт";

		document.body.prepend(modalWrapper);
		modalWrapper.append(modal);
		modal.append(warning);
		modal.append(text);
		modal.append(form);
		form.append(usernameLabel);
		form.append(passwordLabel);
		usernameLabel.insertAdjacentHTML("beforeend", loginSvg);
		usernameLabel.append(usernameInput);
		passwordLabel.insertAdjacentHTML("beforeend", passwordSvg);
		passwordLabel.append(passwordInput);
		form.append(submitBtn);
		modal.append(loginBtn);

		this.element = modalWrapper;
		this.loginBtn = loginBtn;
		this.submitBtn = submitBtn;
		this.form = form;
		this.text = text;
	}

	addLoginEventListener() {
		this.loginBtn.addEventListener("click", () => {
			if (this.modalType === "register") {
				this.loginBtn.textContent = "...или зарегистрируйтесь";
				this.submitBtn.textContent = "Войти";
				this.text.textContent = "Введите свое имя пользователя и пароль...";
				this.modalType = "login";
			} else {
				this.loginBtn.textContent = "...или войдите в существующий аккаунт";
				this.submitBtn.textContent = "Зарегистрироваться";
				this.text.textContent = "Придумайте имя пользователя и пароль...";
				this.modalType = "register";
			}
		});
	}

	successHandler(apiKey, username) {
		const toast = document.querySelector(".toast");
		if (toast) {
			toast.remove();
		}

		this.element.remove();
		this.element.querySelectorAll("input").forEach((input) => {
			input.disabled = false;
		});
		setCookie("api_key", apiKey);
		setCookie("username", username);
		widgetInit();
	}

	errorHandler(error) {
		if (this.modalType === "register") {
			this.submitBtn.innerHTML = "Зарегистрироваться";
		} else {
			this.submitBtn.innerHTML = "Войти";
		}
		this.element.querySelectorAll("input").forEach((input) => {
			input.disabled = false;
		});
		this.submitBtn.disabled = false;

		showErrorToast(error);
	}

	submit(e) {
		const data = Object.fromEntries(new FormData(e.target).entries());

		const validate = this.formValidator(data);

		if (validate.success === false) {
			showErrorToast(validate.message);
			return;
		}

		this.element.querySelectorAll("input").forEach((input) => {
			input.disabled = true;
		});

		this.submitBtn.innerHTML = `<span class="loading loading-spinner"></span>`;
		this.submitBtn.disabled = true;

		if (this.modalType === "register") {
			axios
				.post(`${config.baseUrl}/register`, data)
				.then((response) => {
					if (!response.data.success) {
						this.errorHandler(response.data.message);
					} else {
						this.successHandler(response.data.apiKey, data.username);
					}
				})
				.catch((error) => {
					this.errorHandler(error.message);
				});
		} else {
			axios
				.post(`${config.baseUrl}/login`, data)
				.then((response) => {
					if (!response.data.success) {
						this.errorHandler(response.data.message);
					} else {
						this.successHandler(response.data.apiKey, data.username);
					}
				})
				.catch((error) => {
					this.errorHandler(error.message);
				});
		}
	}

	formValidator(data) {
		const username = data.username;
		const password = data.password;

		const validateUsername = () => {
			if (username.trim() === "") {
				return { success: false, message: "Поля не могут быть пустыми." };
			}

			if (!username.match(/^[a-zA-Z0-9]{5,20}$/)) {
				return {
					success: false,
					message:
						"Имя пользователя должно быть минимум 5 и максимум 20 символов, не иметь пробелов и символов.",
				};
			}

			return { success: true };
		};

		const validatePassword = () => {
			if (password.trim() === "") {
				return { success: false, message: "Поля не могут быть пустыми." };
			}

			if (!password.match(/^(?=.*?[0-9])(?=.*?[A-Za-z]).{8,32}$/)) {
				return {
					success: false,
					message:
						"Пароль должен быть минимум 8 и максимум 32 символов, иметь как минимум 1 цифру и 1 букву.",
				};
			}

			return { success: true };
		};

		const usernameValidation = validateUsername();
		const passwordValidation = validatePassword();

		if (!usernameValidation.success && !passwordValidation.success) {
			if (usernameValidation.message === passwordValidation.message) {
				return { success: false, message: usernameValidation.message };
			} else {
				return {
					success: false,
					message: `${usernameValidation.message}<br>${passwordValidation.message}`,
				};
			}
		} else if (!usernameValidation.success && passwordValidation.success) {
			return { success: false, message: usernameValidation.message };
		} else if (usernameValidation.success && !passwordValidation.success) {
			return { success: false, message: passwordValidation.message };
		} else {
			return { success: true };
		}
	}
}
