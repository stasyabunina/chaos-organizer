function setCookie(name, value) {
  document.cookie = name + "=" + encodeURIComponent(value);
}

function getCookie(name) {
  const value = "; " + document.cookie;
  let parts = value.split("; " + name + "=");
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
}

export { setCookie, getCookie };
