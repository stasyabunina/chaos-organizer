function setCookie(name, value) {
	if (name === "lang") {
		document.cookie = name + "=" + encodeURIComponent(value);
	} else {
		const today = new Date();
		const expire = new Date();
		expire.setTime(today.getTime() + 3600000 * 24 * 7);
		document.cookie =
			name +
			"=" +
			encodeURIComponent(value) +
			";expires=" +
			expire.toGMTString();
	}
}

function getCookie(name) {
	const value = "; " + document.cookie;
	let parts = value.split("; " + name + "=");
	if (parts.length === 2) {
		return parts.pop().split(";").shift();
	} else {
		return value;
	}
}

function deleteCookies() {
	document.cookie.split(";").forEach(function (cookie) {
		document.cookie =
			cookie.trim().split("=")[0] +
			"=;" +
			"expires=Thu, 01 Jan 1970 00:00:00 UTC;";
	});
}

export { setCookie, getCookie, deleteCookies };
